/**
 * passkey.ts
 * Helper to extract passkey request state from WA notification nodes.
 * Used to emit `connection.update.passkeyRequest` during companion linking.
 * Source: PR #2696 (frndchagas)
 */
import type { BinaryNode } from '../WABinary/index.js';
export type PasskeyNotificationType = 'passkey_prologue_request' | 'crsc_continuation';
export type PasskeyRequestState = {
    /** The notification type that triggered this passkey step */
    type: PasskeyNotificationType;
    /** Whether any request options were present in the notification */
    hasOptions: boolean;
};
/**
 * Extracts passkey request state from a notification node.
 * Returns undefined for unsupported notification types.
 * Redacts sensitive details — only exposes type and option presence.
 */
export declare const getPasskeyRequestState: (node: BinaryNode) => PasskeyRequestState | undefined;
//# sourceMappingURL=passkey.d.ts.map