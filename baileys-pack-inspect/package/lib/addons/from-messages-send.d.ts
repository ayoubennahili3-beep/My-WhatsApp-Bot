import type { AnyMessageContent, WAMessage } from '../Types/index.js';
import { generateWAMessage } from '../Utils/messages.js';
export interface StatusMentionDeps {
    meId: string;
    logger: {
        error: (msg: string) => void;
    };
    groupMetadata: (jid: string) => Promise<{
        participants: Array<{
            id: string;
        }>;
    }>;
    cachedGroupMetadata?: (jid: string) => Promise<{
        participants: Array<{
            id: string;
        }>;
    } | undefined>;
    generateWAMessageFn?: typeof generateWAMessage;
    relayMessage: (jid: string, message: any, opts: any) => Promise<any>;
    waUploadToServer: any;
    getUrlInfo?: any;
    config: any;
    linkPreviewImageThumbnailWidth?: number;
    generateHighQualityLinkPreview?: boolean;
    httpRequestOptions?: any;
}
/**
 * Normalize status content — strips fields not valid for media/audio status
 * Source: messages-send.ts → sendStatusMentions (content normalization block)
 */
export declare function normalizeStatusContent(content: AnyMessageContent): {
    msgContent: AnyMessageContent;
    font?: number;
    textColor?: string;
    backgroundColor?: string;
    ptt?: boolean;
};
/**
 * Build the mentioned_users meta node for status relay
 * Source: messages-send.ts → sendStatusMentions (additionalNodes block)
 */
export declare function buildStatusMentionNode(jids: string[]): any;
/**
 * Core sendStatusMentions logic
 * Source: messages-send.ts → sendStatusMentions
 *
 * Pass all sock dependencies explicitly so this stays testable.
 */
export declare function execSendStatusMentions(content: AnyMessageContent, jids: string[], deps: StatusMentionDeps): Promise<WAMessage>;
//# sourceMappingURL=from-messages-send.d.ts.map