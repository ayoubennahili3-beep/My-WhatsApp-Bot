import { proto } from '../../WAProto/index.js';
import type { WAMediaUploadFunction, WAUrlInfo } from '../Types/index.js';
import type { ILogger } from './logger.js';
export type URLGenerationOptions = {
    thumbnailWidth: number;
    fetchOpts: {
        /** Timeout in ms */
        timeout: number;
        proxyUrl?: string;
        headers?: HeadersInit;
    };
    uploadImage?: WAMediaUploadFunction;
    logger?: ILogger;
};
/**
 * Given a piece of text, checks for any URL present, generates link preview for the same and returns it
 * Return undefined if the fetch failed or no URL was found
 * @param text first matched URL in text
 * @returns the URL info required to generate link preview
 */
export declare const getUrlInfo: (text: string, opts?: URLGenerationOptions) => Promise<WAUrlInfo | undefined>;
/**
 * Converts a WA PDO link-preview response result into a WAUrlInfo object.
 * Called when the phone responds to a GENERATE_LINK_PREVIEW PDO request.
 * Source: PR #2701
 */
export declare const linkPreviewResponseToUrlInfo: (result: proto.Message.PeerDataOperationRequestResponseMessage.IPeerDataOperationResult) => WAUrlInfo | undefined;
//# sourceMappingURL=link-preview.d.ts.map