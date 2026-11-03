import { proto } from '../../WAProto/index.js';
import type { WAMediaUpload, WAMessage } from '../Types/index.js';
import type { BinaryNode } from '../WABinary/index.js';
export declare function getMediaType(message: proto.IMessage): string;
export declare function getMessageType(message: proto.IMessage): string;
export declare function getButtonType(message: proto.IMessage): string | undefined;
export declare function getButtonArgs(message: proto.IMessage): BinaryNode;
export interface MentionContent {
    mentions?: string[];
    mentionAll?: boolean;
}
export type AlbumMediaItem = {
    image: WAMediaUpload;
    caption?: string;
    [key: string]: unknown;
} | {
    video: WAMediaUpload;
    caption?: string;
    gifPlayback?: boolean;
    [key: string]: unknown;
};
export interface AlbumOptions {
    userJid: string;
    suki: {
        relayMessage: (jid: string, msg: proto.IMessage, opts: {
            messageId: string;
        }) => Promise<void>;
        waUploadToServer: (stream: unknown, opts: {
            mediaType?: string;
            newsletter?: boolean;
        }) => Promise<{
            handle?: string;
            url?: string;
            directPath?: string;
            mediaKey?: Buffer;
            fileEncSha256?: Buffer;
            fileSha256?: Buffer;
            fileLength?: number;
        }>;
    };
}
export interface MessageExtrasContext {
    query: (node: BinaryNode) => Promise<BinaryNode>;
    newsletterWMexQuery?: (variables: Record<string, unknown> | undefined, queryId: string, options: Record<string, unknown>) => Promise<BinaryNode>;
}
/** Build contextInfo for @mention or @all. */
export declare const buildMentionContextInfo: (message: MentionContent) => {
    contextInfo: proto.IContextInfo;
};
type _ButtonsLike = {
    imageMessage?: proto.Message.IImageMessage | null;
    videoMessage?: proto.Message.IVideoMessage | null;
    documentMessage?: proto.Message.IDocumentMessage | null;
    header?: {
        imageMessage?: proto.Message.IImageMessage | null;
        videoMessage?: proto.Message.IVideoMessage | null;
        documentMessage?: proto.Message.IDocumentMessage | null;
    } | null;
};
/** Extract embedded media from buttons/interactive message (top-level or header-nested). */
export declare const extractFromButtonsMessage: (msg: _ButtonsLike) => {
    imageMessage: proto.Message.IImageMessage;
} | {
    videoMessage: proto.Message.IVideoMessage;
} | {
    documentMessage: proto.Message.IDocumentMessage;
} | null;
/** Normalise media input: string → { url }, Buffer → as-is, others → as-is. */
export declare const normalizeMediaInput: (media: WAMediaUpload | string | null | undefined) => WAMediaUpload | null | undefined;
/** Wrap buttons/template/list/interactive in viewOnceMessageV2Extension for MD clients. */
export declare const patchMessageForMdIfRequired: (message: proto.IMessage) => proto.IMessage;
/**
 * Build and relay an album (multi-image/video) message.
 * @returns Array of individual media WAMessage objects
 * @example
 * const items = await prepareAlbumMessageContent(jid, [
 *     { image: { url: 'https://...' }, caption: 'Photo 1' },
 *     { video: { url: 'https://...' }, caption: 'Video 1' }
 * ], { userJid: sock.user!.id, suki: sock })
 */
export declare const prepareAlbumMessageContent: (jid: string, albums: AlbumMediaItem[], options: AlbumOptions) => Promise<WAMessage[]>;
/** Addon factory for socket-level message extras (profilePictureUrl, getEphemeralGroup). */
export declare const makeMessageExtrasAddon: (ctx: MessageExtrasContext) => {
    profilePictureUrl: (jid: string) => Promise<string | null>;
    getEphemeralGroup: (jid: string) => Promise<number | string>;
};
export {};
//# sourceMappingURL=message-utils.d.ts.map