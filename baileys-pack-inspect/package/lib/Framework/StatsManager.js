/**
 * StatsManager.ts
 * Group activity tracking: message counts, sticker counts, leaderboards, ghost detection.
 *
 * Fixes applied vs PR #2710:
 *  - P1: All participant JIDs normalized via jidNormalizedUser() before storing/querying
 *        so PN/LID/device variants (:0, :42 suffixes) resolve to same stats entry.
 *        Without this, active users appear as ghosts.
 *  - P2: Negative limit → SQLITE returns all rows. Guard: must be positive integer.
 *  - P2: getGhosts throws Boom(503) instead of bare Error for connection issues.
 *  - P2: observeMessage moved inside try block to prevent SQLite failures from
 *        skipping all middleware for that message.
 *
 * Source: PR #2710 (LuferOS) — enterprise bot framework
 */
import { Boom } from '@hapi/boom';
import Database from 'better-sqlite3';
import { jidNormalizedUser } from '../WABinary/index.js';
export class StatsManager {
    constructor(dbPath, groupMetaFn) {
        this.groupMetaFn = groupMetaFn;
        this.db = new Database(dbPath);
        this.db.exec(`
			CREATE TABLE IF NOT EXISTS group_stats (
				group_jid    TEXT NOT NULL,
				user_jid     TEXT NOT NULL,
				msg_count    INTEGER NOT NULL DEFAULT 0,
				sticker_count INTEGER NOT NULL DEFAULT 0,
				last_active  INTEGER NOT NULL,
				PRIMARY KEY (group_jid, user_jid)
			)
		`);
        this.insertStmt = this.db.prepare(`
			INSERT INTO group_stats (group_jid, user_jid, msg_count, sticker_count, last_active)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(group_jid, user_jid) DO UPDATE SET
				msg_count     = msg_count + excluded.msg_count,
				sticker_count = sticker_count + excluded.sticker_count,
				last_active   = excluded.last_active
		`);
        this.getStatsStmt = this.db.prepare('SELECT user_jid, msg_count, sticker_count, last_active FROM group_stats WHERE group_jid = ?');
        // P2 FIX: validated limit used in prepared statement at call time
        this.getTopMsgStmt = (limit) => this.db.prepare(`SELECT user_jid AS jid, msg_count AS count FROM group_stats WHERE group_jid = ? ORDER BY msg_count DESC LIMIT ${limit}`);
        this.getTopStickerStmt = (limit) => this.db.prepare(`SELECT user_jid AS jid, sticker_count AS count FROM group_stats WHERE group_jid = ? ORDER BY sticker_count DESC LIMIT ${limit}`);
    }
    /**
     * Record a message observation for stats.
     * P1 FIX: Normalize both JIDs before storing so device suffixes don't split entries.
     */
    observeMessage(groupJid, userJid, isSticker) {
        // P1 FIX: normalize to strip device suffix (e.g. :0, :42)
        const normalizedGroupJid = jidNormalizedUser(groupJid);
        const normalizedUserJid = jidNormalizedUser(userJid);
        const msgCount = 1;
        const stickerCount = isSticker ? 1 : 0;
        const now = Date.now();
        this.insertStmt.run(normalizedGroupJid, normalizedUserJid, msgCount, stickerCount, now);
    }
    /**
     * Top message senders for a group.
     * P2 FIX: limit must be a positive integer.
     */
    getTopUsers(groupJid, limit = 10) {
        // P2 FIX: guard negative/zero limit
        const safeLimit = Math.max(1, Math.floor(limit));
        const normalizedGroupJid = jidNormalizedUser(groupJid);
        return this.getTopMsgStmt(safeLimit).all(normalizedGroupJid);
    }
    /**
     * Top sticker senders for a group.
     * P2 FIX: limit must be a positive integer.
     */
    getTopStickers(groupJid, limit = 10) {
        const safeLimit = Math.max(1, Math.floor(limit));
        const normalizedGroupJid = jidNormalizedUser(groupJid);
        return this.getTopStickerStmt(safeLimit).all(normalizedGroupJid);
    }
    /**
     * Detect inactive members ("ghosts") in a group.
     * P1 FIX: Compare normalized JIDs so PN/LID/device variants match stored entries.
     * P2 FIX: Throws Boom(503) instead of bare Error on connection issues.
     */
    async getGhosts(groupJid, socketConnected, inactiveDays = 30) {
        // P2 FIX: Boom(503) so callers can branch on statusCode
        if (!socketConnected) {
            throw new Boom('Socket not connected — cannot fetch group metadata for ghost detection', {
                statusCode: 503
            });
        }
        const normalizedGroupJid = jidNormalizedUser(groupJid);
        const cutoff = Date.now() - inactiveDays * 24 * 60 * 60 * 1000;
        const rows = this.getStatsStmt.all(normalizedGroupJid);
        // P1 FIX: build map with normalized JID keys
        const statsMap = new Map();
        for (const row of rows) {
            statsMap.set(jidNormalizedUser(row.user_jid), row.last_active);
        }
        const groupMeta = await this.groupMetaFn(groupJid);
        return groupMeta.participants
            .map(p => {
            // P1 FIX: normalize participant JID before map lookup
            const normalizedJid = jidNormalizedUser(p.id);
            const lastActive = statsMap.get(normalizedJid);
            if (!lastActive) {
                return { jid: normalizedJid, isTotalGhost: true };
            }
            if (lastActive < cutoff) {
                return { jid: normalizedJid, isTotalGhost: false, lastActive };
            }
            return null;
        })
            .filter((g) => g !== null);
    }
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=StatsManager.js.map