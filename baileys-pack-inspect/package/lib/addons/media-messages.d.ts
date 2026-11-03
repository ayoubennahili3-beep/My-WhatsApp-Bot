/**
 * media-messages.ts
 * Jimp-based profile-picture image generators (square + panoramic/wide).
 *
 * Ported from a user-supplied `media-messages.js`, which targeted Jimp
 * 0.22.x. This fork pins `jimp@^1.6.1`, which changed its API significantly:
 *   - `import Jimp from 'jimp'` (default export)
 *     → `import { Jimp, JimpMime } from 'jimp'` (named exports)
 *   - `jimp.getWidth()` / `jimp.getHeight()` → `jimp.bitmap.width` / `.height`
 *   - `jimp.getBufferAsync(mime)` → `await jimp.getBuffer(mime)` (no more
 *     separate `*Async` suffix — `getBuffer` itself returns a Promise)
 *   - `Jimp.MIME_JPEG` (static constant on the class)
 *     → `JimpMime.jpeg` (separate named export object)
 *   - `.crop(x, y, w, h)`, `.resize(w, h)`, `.quality(n)`, `.scaleToFit(w, h)`,
 *     `.normalize()` — all unchanged, still positional-arg chainable methods.
 *
 * Deduplication: the source file had two pairs of functions with genuinely
 * identical bodies under different names:
 *   - `generatePP` was byte-identical to `generateProfilePictureFP`
 *   - `changeprofileFull` was near-identical to `generateProfilePictureFull`
 *     (differed only by a bug — `MIME_JPEG` used unqualified instead of
 *     `Jimp.MIME_JPEG`, which would have thrown a ReferenceError at runtime)
 * Each pair is implemented once below and exported under both original
 * names as aliases, so nothing that imports either name breaks.
 */
import type { WAMediaUpload } from '../Types/index.js';
export declare const generateProfilePictureFull: (img: Buffer | string) => Promise<{
    img: Buffer<ArrayBufferLike>;
}>;
export declare const changeprofileFull: (img: Buffer | string) => Promise<{
    img: Buffer<ArrayBufferLike>;
}>;
export declare const generateProfilePictureFP: (buffer: Buffer | string) => Promise<{
    img: Buffer<ArrayBufferLike>;
    preview: Buffer<ArrayBufferLike>;
}>;
export declare const generatePP: (buffer: Buffer | string) => Promise<{
    img: Buffer<ArrayBufferLike>;
    preview: Buffer<ArrayBufferLike>;
}>;
/**
 * Generates a profile picture buffer from a flexible input source — a raw
 * Buffer, a `{ url }` media-upload descriptor, or a `{ stream }`
 * media-upload descriptor — unlike the two functions above, which only
 * accept an already Jimp-readable source. Resizes the longer dimension
 * down to 720px, preserving aspect ratio on the other.
 */
export declare const generateProfilePicturee: (mediaUpload: WAMediaUpload) => Promise<{
    img: Buffer<ArrayBufferLike>;
}>;
//# sourceMappingURL=media-messages.d.ts.map