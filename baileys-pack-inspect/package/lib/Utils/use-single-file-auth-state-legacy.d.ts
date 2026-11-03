/**
 * use-single-file-auth-state-legacy.ts
 *
 * This is the original upstream reference
 * implementation — kept here as a SEPARATE file rather than overwriting
 * `use-single-file-auth-state.ts` because the two differ fundamentally:
 *
 *   | | This file (legacy) | use-single-file-auth-state.ts (default) |
 *   |---|---|---|
 *   | Style | synchronous | async |
 *   | Caching | none | LRUCache (max 20,000) |
 *   | Write safety | direct `writeFileSync` on every `set()` | debounced (3s) atomic write (temp → rename) |
 *   | Concurrency | none | `async-mutex` |
 *   | Key storage | `KEY_MAP`-translated nested object | flat `type+id` keys |
 *
 * @deprecated Use `useMultiFileAuthState` (or the default
 * `useSingleFileAuthState` in `use-single-file-auth-state.ts`, which fixes
 * all the caveats below) instead. This is kept only for parity with
 * upstream for anyone specifically relying on its exact
 * behavior. Per the original upstream comment: **DO NOT USE IN A PRODUCTION
 * ENVIRONMENT** — every `set()` call synchronously rewrites the entire file
 * with no debouncing, no atomic temp-file swap, and no concurrency guard,
 * so it is both slow and crash-unsafe under real traffic.
 */
import type { AuthenticationState } from '../Types/index.js';
import type { ILogger } from './logger.js';
/**
 * @deprecated use multi file auth state instead please
 * stores the full authentication state in a single JSON file
 *
 * DO NOT USE IN A PROD ENVIRONMENT, only meant to serve as an example
 * */
export declare const useSingleFileAuthStateLegacy: (filename: string, logger?: ILogger) => {
    state: AuthenticationState;
    saveState: () => void;
};
//# sourceMappingURL=use-single-file-auth-state-legacy.d.ts.map