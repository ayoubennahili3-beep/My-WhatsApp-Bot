/**
 * shortcake-crypto.ts
 * Low-level X25519 / HKDF / AES-GCM / SHA-256 helpers for the Shortcake
 * (CRSC — Cross-device Registration via Shortcake Companion) passkey linking flow.
 *
 * Source: PR #2689 (vinikjkkj — WB collaborator)
 */
export type ShortcakeKeyPair = {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
};
/**
 * Generate an ephemeral X25519 DH key pair for the Shortcake handshake.
 * Uses Node's native subtle crypto (available from Node 15+).
 */
export declare const generateShortcakeKeyPair: () => Promise<ShortcakeKeyPair>;
/**
 * X25519 DH — compute shared secret from our private key and peer's public key.
 */
export declare const shortcakeDH: (privateKey: Uint8Array, peerPublicKey: Uint8Array) => Promise<Buffer>;
/**
 * AES-256-GCM encrypt — returns { ciphertext, iv, tag } as a single Buffer:
 * [12-byte iv][ciphertext][16-byte tag]
 */
export declare const shortcakeEncrypt: (plaintext: Uint8Array, key: Uint8Array, aad?: Uint8Array) => Buffer;
/**
 * AES-256-GCM decrypt — input must be [12-byte iv][ciphertext][16-byte tag]
 */
export declare const shortcakeDecrypt: (data: Uint8Array, key: Uint8Array, aad?: Uint8Array) => Buffer;
export declare const shortcakeHKDF: (ikm: Uint8Array, length: number, info: string, salt?: Uint8Array) => Buffer;
export declare const shortcakeHMAC: (key: Uint8Array, data: Uint8Array) => Buffer;
//# sourceMappingURL=shortcake-crypto.d.ts.map