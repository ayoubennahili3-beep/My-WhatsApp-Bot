/**
 * SQLiteStore.ts
 * Generic key-value store backed by better-sqlite3.
 * Used for msgRetryCounterCache and SessionManager to reduce RAM footprint.
 *
 * Fixes applied vs PR #2710:
 *  - P2: Always JSON.stringify on set (including strings) so get<string>
 *    round-trips correctly — raw string storage causes type corruption on retrieve.
 *  - P2: set(key, undefined) → delegates to del(key) instead of crashing.
 *
 * Source: PR #2710 (LuferOS) — enterprise bot framework
 */
export declare class SQLiteStore {
    private db;
    private getStmt;
    private setStmt;
    private delStmt;
    constructor(dbPath: string);
    get<T = unknown>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
    del(key: string): void;
    close(): void;
}
//# sourceMappingURL=SQLiteStore.d.ts.map