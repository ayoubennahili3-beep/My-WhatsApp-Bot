/**
 * MediaManager.ts
 * Media conversion helpers: image/video → WebP stickers, audio → OGG voice notes.
 *
 * Fixes applied vs PR #2710:
 *  - P1: ESM-compatible node-webpmux import via createRequire (was bare `require()`)
 *  - P1: Voice note params: added -ac 1 (mono), -ar 16000, -application voip,
 *        -b:a 32k — WA server requires mono Opus at ~16kHz for PTT.
 *  - P2: All fs.writeFileSync/readFileSync/copyFileSync/unlinkSync replaced with
 *        fs.promises.* (async) to avoid blocking the event loop under load.
 *  - P2: Sticker EXIF payload length is now correctly serialized (P2 pack metadata).
 *  - P2: err types changed from `any` to `unknown`.
 *
 * Source: PR #2710 (LuferOS) — enterprise bot framework
 */
export type StickerMetadata = {
    packname?: string;
    author?: string;
};
export declare class MediaManager {
    /** Generate a temp file path with a given extension */
    private static getTempFile;
    /**
     * Convert image or video to a WebP sticker buffer.
     * Applies packname/author EXIF metadata when provided.
     *
     * P2 FIX: Uses fs.promises.* throughout (non-blocking).
     * P2 FIX: EXIF payload length correctly written to buffer.
     */
    static convertToSticker(inputPathOrBuffer: string | Buffer, metadata?: StickerMetadata): Promise<Buffer>;
    /**
     * Convert audio to OGG Opus voice note format.
     *
     * P1 FIX: Added required WA voice note params:
     *   -ac 1       → mono (required by WA)
     *   -ar 16000   → 16kHz sample rate (WA standard for PTT)
     *   -application voip → Opus VOIP application mode
     *   -b:a 32k    → bitrate appropriate for voice
     *   -compression_level 10 → maximize compression
     */
    static convertToVoiceNote(inputPathOrBuffer: string | Buffer): Promise<Buffer>;
}
//# sourceMappingURL=MediaManager.d.ts.map