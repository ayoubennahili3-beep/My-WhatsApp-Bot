/**
 * shortcake-crypto.ts
 * Low-level X25519 / HKDF / AES-GCM / SHA-256 helpers for the Shortcake
 * (CRSC — Cross-device Registration via Shortcake Companion) passkey linking flow.
 *
 * Source: PR #2689 (vinikjkkj — WB collaborator)
 */
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';
import { hkdf } from './crypto.js';
// ── Key generation ────────────────────────────────────────────────────────────
/**
 * Generate an ephemeral X25519 DH key pair for the Shortcake handshake.
 * Uses Node's native subtle crypto (available from Node 15+).
 */
export const generateShortcakeKeyPair = async () => {
    const { webcrypto } = await import('crypto');
    // TS lib.dom's generateKey() overloads don't include X25519 in their algorithm
    // union, so it resolves to the widest overload (CryptoKeyPair | CryptoKey).
    // X25519 always produces a key pair — cast is safe here.
    const keyPair = (await webcrypto.subtle.generateKey({ name: 'X25519' }, true, [
        'deriveKey',
        'deriveBits'
    ]));
    const publicKeyBuffer = Buffer.from(await webcrypto.subtle.exportKey('raw', keyPair.publicKey));
    const privateKeyJwk = await webcrypto.subtle.exportKey('jwk', keyPair.privateKey);
    const privateKeyBuffer = Buffer.from(privateKeyJwk.d, 'base64url');
    return {
        privateKey: privateKeyBuffer,
        publicKey: publicKeyBuffer
    };
};
/**
 * X25519 DH — compute shared secret from our private key and peer's public key.
 */
export const shortcakeDH = async (privateKey, peerPublicKey) => {
    const { webcrypto } = await import('crypto');
    const privKey = await webcrypto.subtle.importKey('jwk', {
        kty: 'OKP',
        crv: 'X25519',
        d: Buffer.from(privateKey).toString('base64url'),
        x: Buffer.from(peerPublicKey).toString('base64url')
    }, { name: 'X25519' }, false, ['deriveBits']);
    const pubKey = await webcrypto.subtle.importKey('raw', peerPublicKey, { name: 'X25519' }, false, []);
    const bits = await webcrypto.subtle.deriveBits({ name: 'X25519', public: pubKey }, privKey, 256);
    return Buffer.from(bits);
};
// ── AEAD ─────────────────────────────────────────────────────────────────────
/**
 * AES-256-GCM encrypt — returns { ciphertext, iv, tag } as a single Buffer:
 * [12-byte iv][ciphertext][16-byte tag]
 */
export const shortcakeEncrypt = (plaintext, key, aad) => {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    if (aad)
        cipher.setAAD(aad);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, encrypted, tag]);
};
/**
 * AES-256-GCM decrypt — input must be [12-byte iv][ciphertext][16-byte tag]
 */
export const shortcakeDecrypt = (data, key, aad) => {
    const iv = data.slice(0, 12);
    const tag = data.slice(data.length - 16);
    const ciphertext = data.slice(12, data.length - 16);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    if (aad)
        decipher.setAAD(aad);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};
// ── HKDF helpers ─────────────────────────────────────────────────────────────
export const shortcakeHKDF = (ikm, length, info, salt) => Buffer.from(hkdf(ikm, length, { info, salt }));
// ── HMAC-SHA256 ──────────────────────────────────────────────────────────────
export const shortcakeHMAC = (key, data) => createHmac('sha256', key).update(data).digest();
//# sourceMappingURL=shortcake-crypto.js.map