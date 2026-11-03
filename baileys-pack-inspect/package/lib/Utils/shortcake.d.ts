/**
 * shortcake.ts
 * Shortcake / CRSC (Cross-device Registration via Shortcake Companion) passkey
 * companion-linking protocol implementation.
 *
 * Flow:
 *  1. Server sends `passkey_prologue_request` notification
 *  2. Client calls `beginShortcakeHandshake()` — sends prologue response with ephemeral pubkey
 *  3. Server sends `crsc_continuation` with server ephemeral key + nonce
 *  4. Client calls `completeShortcakeHandshake()` — derives shared secret, signs assertion
 *  5. Client sends assertion back; linking completes
 *
 * Source: PR #2689 (vinikjkkj — WB collaborator)
 */
import type { BinaryNode } from '../WABinary/index.js';
import { type ShortcakeKeyPair } from './shortcake-crypto.js';
export type ShortcakeSession = {
    ephemeralKeyPair: ShortcakeKeyPair;
    nonce?: Uint8Array;
    serverEphemeralPublicKey?: Uint8Array;
    sharedSecret?: Buffer;
};
export type ShortcakeSignPasskeyAssertion = (challenge: Uint8Array) => Promise<Uint8Array>;
/**
 * Begin Shortcake handshake — called when `passkey_prologue_request` arrives.
 * Generates ephemeral X25519 key pair and returns the prologue response payload.
 *
 * The mutex concern from the PR review is handled by resetting session atomically:
 * any concurrent prologue request replaces the previous session (WA behaviour).
 */
export declare const beginShortcakeHandshake: () => Promise<{
    ephemeralPublicKey: Uint8Array;
    session: ShortcakeSession;
}>;
/**
 * Complete Shortcake handshake — called when `crsc_continuation` arrives.
 * Derives the shared secret and returns the signed assertion to send back.
 *
 * @param continuationNode The `crsc_continuation` BinaryNode from the server
 * @param signPasskeyAssertion App-provided callback that signs the WA challenge
 *                             using the platform passkey (WebAuthn / FIDO2 assertion)
 */
export declare const completeShortcakeHandshake: (continuationNode: BinaryNode, signPasskeyAssertion: ShortcakeSignPasskeyAssertion) => Promise<{
    assertionPayload: Buffer;
    requestId: string;
} | null>;
/**
 * Returns true when a Shortcake handshake is currently in progress.
 */
export declare const hasActiveShortcakeSession: () => boolean;
/**
 * Abort any in-progress Shortcake handshake (e.g. on disconnect).
 */
export declare const abortShortcakeHandshake: () => void;
//# sourceMappingURL=shortcake.d.ts.map