import type { GroupMetadata, WAMediaUpload } from '../Types/index.js';
import type { ILogger } from '../Utils/logger.js';
export declare const STATUS_BROADCAST_JID = "status@broadcast";
export declare const STATUS_BACKGROUNDS: {
    solid: {
        green: string;
        blue: string;
        purple: string;
        red: string;
        orange: string;
        yellow: string;
        pink: string;
        teal: string;
        gray: string;
        black: string;
        white: string;
    };
    gradient: {
        sunset: string[];
        ocean: string[];
        forest: string[];
        purple: string[];
        midnight: string[];
        aurora: string[];
    };
};
export declare const STATUS_FONTS: {
    SANS_SERIF: number;
    SERIF: number;
    NORICAN: number;
    BRYNDAN: number;
    BEBASNEUE: number;
    OSWALD: number;
    DAMION: number;
    DANCING: number;
    COMFORTAA: number;
    EXOTWO: number;
};
export declare const generateStatusMessageId: () => string;
export declare const getStatusJid: () => string;
export interface TextStatusOptions {
    text: string;
    backgroundColor?: string;
    font?: number;
    textColor?: string;
    mentions?: string[];
}
export interface MediaStatusOptions {
    caption?: string;
    gifPlayback?: boolean;
    waveform?: Uint8Array;
}
export declare const createTextStatus: (options: TextStatusOptions) => {
    text: string;
    backgroundColor: string;
    font: number;
    textColor: string;
    contextInfo: {
        mentionedJid: string[];
        isForwarded: boolean;
    };
};
export declare const createImageStatus: (media: WAMediaUpload | string, options?: MediaStatusOptions) => {
    image: WAMediaUpload;
    caption: string;
};
export declare const createVideoStatus: (media: WAMediaUpload | string, options?: MediaStatusOptions) => {
    video: WAMediaUpload;
    caption: string;
    gifPlayback: boolean;
};
export declare const createAudioStatus: (media: WAMediaUpload | string, options?: MediaStatusOptions) => {
    audio: WAMediaUpload;
    ptt: boolean;
    mimetype: string;
    waveform: Uint8Array<ArrayBufferLike> | undefined;
};
export declare const StatusHelper: {
    text: (text: string, backgroundColor?: string, font?: number) => {
        text: string;
        backgroundColor: string;
        font: number;
        textColor: string;
        contextInfo: {
            mentionedJid: string[];
            isForwarded: boolean;
        };
    };
    image: (buffer: WAMediaUpload, caption?: string) => {
        image: WAMediaUpload;
        caption: string;
    };
    imageUrl: (url: string, caption?: string) => {
        image: WAMediaUpload;
        caption: string;
    };
    video: (buffer: WAMediaUpload, caption?: string) => {
        video: WAMediaUpload;
        caption: string;
        gifPlayback: boolean;
    };
    videoUrl: (url: string, caption?: string) => {
        video: WAMediaUpload;
        caption: string;
        gifPlayback: boolean;
    };
    gif: (buffer: WAMediaUpload, caption?: string) => {
        video: WAMediaUpload;
        caption: string;
        gifPlayback: boolean;
    };
    voiceNote: (buffer: WAMediaUpload) => {
        audio: WAMediaUpload;
        ptt: boolean;
        mimetype: string;
        waveform: Uint8Array<ArrayBufferLike> | undefined;
    };
    send: (sock: any, content: any, jidList?: string[]) => Promise<any>;
};
export interface StatusMentionContent extends Record<string, unknown> {
    text?: string;
    image?: unknown;
    video?: unknown;
    audio?: unknown;
    caption?: string;
    font?: number;
    textColor?: string;
    backgroundColor?: string;
    ptt?: boolean;
}
export interface StatusMentionsContext {
    authState: {
        creds: {
            me?: {
                id: string;
            };
        };
    };
    logger: ILogger;
    linkPreviewImageThumbnailWidth: number;
    axiosOptions?: any;
    relayMessage: (jid: string, msg: unknown, opts: {
        messageId?: string;
        statusJidList?: string[];
        additionalNodes?: unknown[];
    }) => Promise<void>;
    waUploadToServer: (stream: unknown, opts: object) => Promise<{
        handle?: string;
        url?: string;
        directPath?: string;
        mediaKey?: Buffer;
        fileEncSha256?: Buffer;
        fileSha256?: Buffer;
        fileLength?: number;
    }>;
    groupMetadata: (jid: string) => Promise<GroupMetadata>;
    cachedGroupMetadata?: (jid: string) => Promise<GroupMetadata | undefined>;
    config: any;
}
/**
 * Addon factory — send a WhatsApp Status/Story and tag specific users or groups.
 * Resolves group participants automatically.
 *
 * @example
 * const addon = makeStatusMentionsAddon({ authState, logger, relayMessage, ... })
 * return { ...sock, ...addon }
 *
 * // Usage:
 * await sock.sendStatusMentions(
 *     { text: 'Hello!', backgroundColor: '#25D366' },
 *     ['1234567890@s.whatsapp.net', '120363xxx@g.us']
 * )
 */
export declare const makeStatusMentionsAddon: (ctx: StatusMentionsContext) => {
    sendStatusMentions: (content: StatusMentionContent, jids?: string[]) => Promise<void>;
};
//# sourceMappingURL=status-posting.d.ts.map