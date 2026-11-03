/**
 * SQLite-backed Authentication State
 *
 * Clean TypeScript with full types and JSDoc.
 *
 * Uses `better-sqlite3` for synchronous, transactional key storage.
 * `better-sqlite3` is a hard dependency of this package (pulled in for the
 * Framework's SQLiteStore/StatsManager) — no separate install needed.
 *
 * Two tables:
 *   - `creds`        — stores the authentication credentials (single row `__creds__`)
 *   - `signal_keys`  — stores Signal Protocol session/pre-keys (type + id composite PK)
 *
 * @example
 * import { useSqliteAuthState } from './addons/auth/use-sqlite-auth-state'
 *
 * const { state, saveCreds } = await useSqliteAuthState({ dbPath: './auth.db' })
 * const sock = makeWASocket({ auth: state })
 * sock.ev.on('creds.update', saveCreds)
 */
import { proto } from '../../WAProto/index.js';
import { initAuthCreds } from '../Utils/auth-utils.js';
import { BufferJSON } from '../Utils/generics.js';
// ─── Schema ────────────────────────────────────────────────────────────────────
const CREDS_ROW_KEY = '__creds__';
const CREATE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS creds (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS signal_keys (
  type  TEXT NOT NULL,
  id    TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (type, id)
);
CREATE INDEX IF NOT EXISTS signal_keys_type_idx ON signal_keys(type);
`;
// ─── Lazy loader ───────────────────────────────────────────────────────────────
// @ts-ignore — better-sqlite3 is an optional peer dependency
async function loadBetterSqlite3() {
    try {
        // @ts-ignore — better-sqlite3 is an optional peer dependency
        const mod = (await import('better-sqlite3'));
        // @ts-ignore — better-sqlite3 is an optional peer dependency
        return (mod.default ?? mod);
    }
    catch (cause) {
        throw Object.assign(new Error('`better-sqlite3` is required for `useSqliteAuthState`. ' +
            'Install it as a peer dependency: npm install better-sqlite3'), { cause });
    }
}
// ─── useSqliteAuthState ────────────────────────────────────────────────────────
/**
 * Create a SQLite-backed auth state.
 * WAL journal mode is enabled for reliable concurrent-read performance.
 */
export async function useSqliteAuthState(opts) {
    // @ts-ignore — better-sqlite3 is an optional peer dependency
    let db;
    if (opts.database) {
        db = opts.database;
    }
    else {
        const Database = await loadBetterSqlite3();
        db = new Database(opts.dbPath);
    }
    // WAL mode — concurrent reads with sporadic writes (recommended by SQLite docs)
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous  = NORMAL');
    db.exec(CREATE_SCHEMA_SQL);
    const stmts = {
        credsSelect: db.prepare('SELECT value FROM creds WHERE key = ?'),
        credsUpsert: db.prepare('INSERT INTO creds (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'),
        keySelect: db.prepare('SELECT value FROM signal_keys WHERE type = ? AND id = ?'),
        keyUpsert: db.prepare('INSERT INTO signal_keys (type, id, value) VALUES (?, ?, ?) ON CONFLICT(type, id) DO UPDATE SET value = excluded.value'),
        keyDelete: db.prepare('DELETE FROM signal_keys WHERE type = ? AND id = ?'),
        keyListIds: db.prepare('SELECT id FROM signal_keys WHERE type = ?'),
        keyList: db.prepare('SELECT id, value FROM signal_keys WHERE type = ?'),
        clearKeys: db.prepare('DELETE FROM signal_keys')
    };
    const loadCreds = () => {
        const row = stmts.credsSelect.get(CREDS_ROW_KEY);
        if (!row)
            return initAuthCreds();
        return JSON.parse(row.value, BufferJSON.reviver);
    };
    const persistCreds = (creds) => {
        stmts.credsUpsert.run(CREDS_ROW_KEY, JSON.stringify(creds, BufferJSON.replacer));
    };
    const creds = loadCreds();
    return {
        state: {
            creds,
            keys: {
                // @ts-ignore
                get: async (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        const row = stmts.keySelect.get(type, id);
                        if (row) {
                            let value = JSON.parse(row.value, BufferJSON.reviver);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        }
                    }
                    return data;
                },
                set: async (data) => {
                    const writeTx = db.transaction(() => {
                        for (const category in data) {
                            const categoryData = data[category];
                            for (const id in categoryData) {
                                const value = categoryData[id];
                                if (value) {
                                    stmts.keyUpsert.run(category, id, JSON.stringify(value, BufferJSON.replacer));
                                }
                                else {
                                    stmts.keyDelete.run(category, id);
                                }
                            }
                        }
                    });
                    writeTx();
                }
            }
        },
        saveCreds: () => persistCreds(creds)
    };
}
//# sourceMappingURL=use-sqlite-auth-state.js.map