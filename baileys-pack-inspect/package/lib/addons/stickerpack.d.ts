/**
 * addon: stickerpack
 * Source patch: Baileys-feat-add-stickerpack-support (shell/metadata functions)
 * — convertToWebP auto-converts Buffer/URL/Stream input to a WhatsApp-ready
 *   WebP sticker buffer, extracted into a standalone function.
 *
 * Adds support for sending WhatsApp Sticker Pack messages.
 * Sticker and StickerPack types are the canonical definitions in Types/Message.ts.
 *
 * This addon exports:
 *   - buildStickerPackProto() — builds the proto payload for a StickerPackMessage
 *   - generateStickerPackId() — generates a random pack ID
 *   - STICKER_PACK_MESSAGE_TYPE — the message type string 'sticker_pack'
 *   - convertToWebP() — converts a Buffer, URL string, or Stream into a WebP
 *     sticker buffer (passthrough if already WebP), via a
 *     sharp → @napi-rs/image → jimp fallback chain.
 */
import type { WAMediaUpload } from '../Types/index.js';
export type { Sticker, StickerPack } from '../Types/index.js';
/**
 * Convert a Buffer, URL string, or Stream into a WebP sticker buffer.
 * If the input is already a valid WebP, it's returned untouched (and
 * `isAnimated` reflects whether it's an animated WebP). Uses a
 * sharp → @napi-rs/image → jimp fallback chain, 512x512 'inside' fit,
 * quality 80.
 *
 * @example
 * const { buffer, isAnimated } = await convertToWebP('https://example.com/pic.png')
 * const { buffer: b2 } = await convertToWebP(fs.readFileSync('./sticker.jpg'))
 */
export declare const convertToWebP: (input: WAMediaUpload) => Promise<{
    buffer: Buffer;
    isAnimated: boolean;
}>;
/**
 * Generate a random sticker pack ID (16 hex chars).
 */
export declare const generateStickerPackId: () => string;
/**
 * Build the proto-level stickerPackMessage payload.
 * The result can be passed directly as the stickerPackMessage field in a proto.IMessage.
 */
export declare const buildStickerPackProto: (pack: {
    name: string;
    publisher: string;
    packId?: string;
    description?: string;
}) => {
    name: string;
    publisher: string;
    packId: string;
    description: string;
};
/**
 * stickerPack message type marker — getMediaType() returns this for stickerPackMessage.
 */
export declare const STICKER_PACK_MESSAGE_TYPE: "sticker_pack";
import { proto } from '../../WAProto/index.js';
import type { ILogger } from '../Utils/logger.js';
export type StickerInput = {
    data: WAMediaUpload;
    emojis?: string[];
    accessibilityLabel?: string;
};
export type StickerPackInput = {
    cover: WAMediaUpload;
    stickers: StickerInput[];
    name?: string;
    publisher?: string;
    description?: string;
};
export type StickerPackOptions = {
    logger?: ILogger;
    upload: (filePath: string, opts: {
        fileEncSha256B64: string;
        mediaType: string;
        timeoutMs?: number;
    }) => Promise<{
        directPath: string;
    }>;
    options?: RequestInit;
    mediaUploadTimeoutMs?: number;
    mediaCache?: {
        get: (key: string) => Promise<Buffer | undefined>;
        set: (key: string, value: Buffer) => void;
    };
};
/**
 * Build a complete, ready-to-send stickerPackMessage (ZIP built, encrypted,
 * and uploaded). Sticker-pack field validity work credited to @jlucaso1,
 * based on PR #1561.
 */
export declare const prepareStickerPackMessage: (message: StickerPackInput, options: StickerPackOptions) => Promise<proto.Message.IStickerPackMessage>;
//# sourceMappingURL=stickerpack.d.ts.map