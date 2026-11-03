/**
 * SessionManager.ts
 * Per-JID session CRUD backed by SQLiteStore.
 *
 * Fixes applied vs PR #2710:
 *  - P2: Generic defaults changed from `any` to `unknown` for type safety.
 *
 * Source: PR #2710 (LuferOS) — enterprise bot framework
 */
import type { SQLiteStore } from './Store/SQLiteStore.js';
export declare class SessionManager {
    private store;
    constructor(store: SQLiteStore);
    private key;
    get<T = unknown>(jid: string): T | undefined;
    set<T = unknown>(jid: string, data: T): void;
    update<T = unknown>(jid: string, updater: (prev: T | undefined) => T): void;
    delete(jid: string): void;
    has(jid: string): boolean;
}
//# sourceMappingURL=SessionManager.d.ts.map