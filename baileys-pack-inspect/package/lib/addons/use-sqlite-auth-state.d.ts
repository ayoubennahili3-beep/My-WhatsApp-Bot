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
import type { AuthenticationState } from '../Types/index.js';
export type SqliteAuthStateOptions = {
    /** Path to the SQLite database file (will be created if it does not exist). */
    dbPath: string;
    database?: undefined;
} | {
    dbPath?: undefined;
    /** Pass an existing better-sqlite3 Database instance. */
    database: import('better-sqlite3').Database;
};
export type SqliteAuthStateResult = {
    state: AuthenticationState;
    saveCreds: () => void;
};
/**
 * Create a SQLite-backed auth state.
 * WAL journal mode is enabled for reliable concurrent-read performance.
 */
export declare function useSqliteAuthState(opts: SqliteAuthStateOptions): Promise<SqliteAuthStateResult>;
//# sourceMappingURL=use-sqlite-auth-state.d.ts.map