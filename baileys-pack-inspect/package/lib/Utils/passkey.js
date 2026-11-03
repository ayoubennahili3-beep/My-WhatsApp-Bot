/**
 * passkey.ts
 * Helper to extract passkey request state from WA notification nodes.
 * Used to emit `connection.update.passkeyRequest` during companion linking.
 * Source: PR #2696 (frndchagas)
 */
const SUPPORTED_PASSKEY_TYPES = ['passkey_prologue_request', 'crsc_continuation'];
/**
 * Extracts passkey request state from a notification node.
 * Returns undefined for unsupported notification types.
 * Redacts sensitive details — only exposes type and option presence.
 */
export const getPasskeyRequestState = (node) => {
    const type = node.attrs.type;
    if (!SUPPORTED_PASSKEY_TYPES.includes(type)) {
        return undefined;
    }
    const content = Array.isArray(node.content) ? node.content : [];
    const hasOptions = content.some(c => typeof c === 'object' && 'tag' in c);
    return {
        type: type,
        hasOptions
    };
};
//# sourceMappingURL=passkey.js.map