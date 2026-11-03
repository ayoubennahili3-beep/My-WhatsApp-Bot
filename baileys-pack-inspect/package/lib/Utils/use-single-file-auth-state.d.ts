/**
 * use-single-file-auth-state.ts
 * Advanced single-file auth state with:
 *   - LRUCache (max 20000) for fast in-memory reads
 *   - Mutex to prevent race conditions on concurrent writes
 *   - Debounced atomic write (temp → rename) with 3s flush timeout
 *     so disk I/O is batched, not triggered on every key change
 */
import type { AuthenticationState } from '../Types/index.js';
export declare const useSingleFileAuthState: (fileName: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
//# sourceMappingURL=use-single-file-auth-state.d.ts.map