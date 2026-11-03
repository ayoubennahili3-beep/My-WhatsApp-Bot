/**
 * media-set.ts
 * Profile-picture setters (full/panoramic variants) and group-status /
 * member-label senders.
 *
 * Ported from a user-supplied `media-set.js`, which imported its WA
 * primitives from the published `@queenanya/baileys` package (as an
 * external consumer would). Since this file now lives *inside* the
 * queenanya package itself, those imports were changed to relative
 * internal paths instead.
 *
 * NOTE ON DUPLICATE-LOOKING SETTERS: `updateProfilePictureFull` and
 * `updateProfilePictureFull2` are genuinely different, not duplicates —
 * the first sends the `img` buffer from `generateProfilePictureFP`
 * (scaled-to-fit 720x720 main image), the second sends the `preview`
 * buffer from `generatePP` (normalized preview). Both are kept.
 */
import type { WASocket } from '../index.js';
import type { AnyMessageContent } from '../Types/index.js';
/** Update the profile picture for yourself or a group — sends the main (scaled-to-fit) image. */
export declare const updateProfilePictureFull: (jid: string, content: Buffer | string, sock: WASocket) => Promise<any>;
/** Update the profile picture for yourself or a group — sends the normalized preview image. */
export declare const updateProfilePictureFull2: (jid: string, content: Buffer | string, sock: WASocket) => Promise<any>;
type GroupStatusContent = AnyMessageContent & {
    backgroundColor?: string;
};
/** Send a group status (status update visible only within a group's members). */
export declare const groupStatus: (jid: string, content: GroupStatusContent, sock: WASocket) => Promise<import("../index.js").WAMessage>;
/** Send the same group status to multiple groups at once. */
export declare const groupStatusV2: (jids: string[], content: GroupStatusContent, sock: WASocket) => Promise<import("../index.js").WAMessage[]>;
/**
 * Set/update a member's label in a group (awaits the relay and returns the result).
 * Label is truncated to 30 characters (WA's limit).
 */
export declare const groupSetMemberLabel: (jid: string, memberLabel: string, sock: WASocket) => Promise<string>;
/**
 * Set/update a member's label in a group — fire-and-forget variant (errors
 * are swallowed, matching the source's behavior; prefer
 * `groupSetMemberLabel` if you need to await/observe failures).
 */
export declare const groupLabel: (jid: string, text: string, sock: WASocket) => Promise<void>;
export {};
//# sourceMappingURL=media-set.d.ts.map