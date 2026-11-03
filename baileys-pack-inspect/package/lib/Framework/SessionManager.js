/**
 * SessionManager.ts
 * Per-JID session CRUD backed by SQLiteStore.
 *
 * Fixes applied vs PR #2710:
 *  - P2: Generic defaults changed from `any` to `unknown` for type safety.
 *
 * Source: PR #2710 (LuferOS) — enterprise bot framework
 */
export class SessionManager {
    constructor(store) {
        this.store = store;
    }
    key(jid) {
        return `session_${jid}`;
    }
    // P2 FIX: default generic to unknown instead of any
    get(jid) {
        return this.store.get(this.key(jid));
    }
    set(jid, data) {
        this.store.set(this.key(jid), data);
    }
    update(jid, updater) {
        const prev = this.get(jid);
        this.set(jid, updater(prev));
    }
    delete(jid) {
        this.store.del(this.key(jid));
    }
    has(jid) {
        return this.get(jid) !== undefined;
    }
}
//# sourceMappingURL=SessionManager.js.map