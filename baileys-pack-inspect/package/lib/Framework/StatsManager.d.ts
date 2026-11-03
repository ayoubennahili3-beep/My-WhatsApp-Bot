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
export type GhostResult = {
    jid: string;
    isTotalGhost: boolean;
    lastActive?: number;
};
export type StatsRanking = {
    jid: string;
    count: number;
};
export declare class StatsManager {
    private db;
    private insertStmt;
    private getStatsStmt;
    private getTopMsgStmt;
    private getTopStickerStmt;
    private groupMetaFn;
    constructor(dbPath: string, groupMetaFn: (jid: string) => Promise<{
        participants: {
            id: string;
        }[];
    }>);
    /**
     * Record a message observation for stats.
     * P1 FIX: Normalize both JIDs before storing so device suffixes don't split entries.
     */
    observeMessage(groupJid: string, userJid: string, isSticker: boolean): void;
    /**
     * Top message senders for a group.
     * P2 FIX: limit must be a positive integer.
     */
    getTopUsers(groupJid: string, limit?: number): StatsRanking[];
    /**
     * Top sticker senders for a group.
     * P2 FIX: limit must be a positive integer.
     */
    getTopStickers(groupJid: string, limit?: number): StatsRanking[];
    /**
     * Detect inactive members ("ghosts") in a group.
     * P1 FIX: Compare normalized JIDs so PN/LID/device variants match stored entries.
     * P2 FIX: Throws Boom(503) instead of bare Error on connection issues.
     */
    getGhosts(groupJid: string, socketConnected: boolean, inactiveDays?: number): Promise<GhostResult[]>;
    close(): void;
}
//# sourceMappingURL=StatsManager.d.ts.map