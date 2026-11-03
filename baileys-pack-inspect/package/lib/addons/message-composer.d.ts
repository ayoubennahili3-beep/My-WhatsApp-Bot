/**
 * message-composer.ts (addons)
 * Rich message builders for Meta AI / Bot botForwardedMessage payloads.
 * Ported from upstream main (April 2026).
 */
import { CodeHighlightType, RichSubMessageType } from '../Types/RichType.js';
export { CodeHighlightType, RichSubMessageType };
import type { proto } from '../../WAProto/index.js';
import type { WAMediaUploadFunction } from '../Types/Message.js';
export declare const CPP_KEYWORDS: Set<string>;
export declare const CSS_KEYWORDS: Set<string>;
export declare const GO_KEYWORDS: Set<string>;
export declare const HTML_KEYWORDS: Set<string>;
export declare const JS_KEYWORDS: Set<string>;
export declare const PYTHON_KEYWORDS: Set<string>;
export declare const RUST_KEYWORDS: Set<string>;
export declare const C_KEYWORDS: Set<string>;
export declare const CSHARP_KEYWORDS: Set<string>;
export declare const BASH_KEYWORDS: Set<string>;
export declare const CMD_KEYWORDS: Set<string>;
export declare const POWERSHELL_KEYWORDS: Set<string>;
export declare const LANGUAGE_KEYWORDS: Record<string, Set<string>>;
export type CodeToken = {
    highlightType: CodeHighlightType;
    codeContent: string;
};
export type LatexExpression = {
    latexExpression: string;
    url?: string;
    width?: number;
    height?: number;
    fontHeight?: number;
    imageTopPadding?: number;
    imageLeadingPadding?: number;
    imageBottomPadding?: number;
    imageTrailingPadding?: number;
};
export type RichSubMessage = {
    messageType: RichSubMessageType | number;
    messageText?: string;
    tableMetadata?: {
        title: string;
        rows: Array<{
            items: string[];
            isHeading?: boolean;
        }>;
    };
    codeMetadata?: {
        codeLanguage: string;
        codeBlocks: CodeToken[];
    };
    latexMetadata?: {
        text: string;
        expressions: LatexExpression[];
    };
    imageMetadata?: {
        imageUrl: {
            imagePreviewUrl: string;
            imageHighResUrl: string;
        };
        imageText?: string;
        alignment?: number;
    };
    inlineEntities?: InlineEntityItem[];
};
/** Options controlling `extractIE`'s inline-entity extraction from markdown text. */
export type ExtractOptions = {
    extract?: boolean;
    hyperlink?: boolean;
    citation?: boolean;
    latex?: boolean;
};
export interface InlineEntityItem {
    key: string;
    metadata: {
        display_name?: string;
        is_trusted?: boolean;
        url?: string;
        reference_id?: number;
        reference_url?: string;
        reference_title?: string;
        reference_display_name?: string;
        sources?: unknown[];
        latex_expression?: string;
        latex_image?: {
            url?: string;
            width?: number;
            height?: number;
        };
        font_height?: number;
        padding?: number;
        __typename?: string;
    };
}
export interface ExtractedIE {
    text: string;
    ie: Array<{
        type: string;
        ie: Record<string, unknown>;
    }>;
    inline_entities: InlineEntityItem[];
}
export type RichMessageContent = {
    message: proto.IMessage;
    messageId: string;
};
export type CapturedUnifiedResponse = {
    unifiedResponse: {
        data: Buffer | Uint8Array;
    };
    submessages: RichSubMessage[];
    contextInfo: Record<string, unknown>;
};
type QuotedMsg = {
    key?: proto.IMessageKey;
    message?: proto.IMessage | null;
    sender?: string;
} | undefined;
export declare const tokenizeCode: (codeStr: string, language?: string) => CodeToken[];
/**
 * Extract inline entities (hyperlinks, citations, latex) from markdown text.
 * Recognizes `[text](url)` as a hyperlink, `[](url)` as a citation, and
 * `[latex|width|height|fontHeight|padding](url)` (angle brackets) as a
 * latex-image reference, replacing each with a `{{KEY}}...{{/KEY}}` tag and
 * returning the matching WhatsApp inline_entities metadata.
 */
export declare const extractIE: (text: string, { extract, hyperlink, citation, latex }?: ExtractOptions) => ExtractedIE;
export declare const buildRichContextInfo: (quoted?: QuotedMsg) => Record<string, unknown>;
export declare const buildBotForwardedMessage: (submessages: RichSubMessage[], contextInfo: Record<string, unknown>, unifiedResponse?: {
    data: Buffer | Uint8Array | string;
}) => proto.IMessage;
export declare const generateTableContent: (title: string, headers: string[], rows: string[][], quoted?: QuotedMsg, options?: {
    headerText?: string;
    footer?: string;
}) => RichMessageContent;
export declare const generateListContent: (title: string, items: string[] | string[][], quoted?: QuotedMsg, options?: {
    headerText?: string;
    footer?: string;
}) => RichMessageContent;
export declare const generateCodeBlockContent: (code: string, quoted?: QuotedMsg, options?: {
    title?: string;
    footer?: string;
    language?: string;
}) => RichMessageContent;
export declare const generateLatexContent: (quoted: QuotedMsg, options: {
    text?: string;
    expressions: LatexExpression[];
    headerText?: string;
    footer?: string;
}) => RichMessageContent;
export declare const generateLatexImageContent: (quoted: QuotedMsg, options: {
    text?: string;
    expressions: LatexExpression[];
    headerText?: string;
    footer?: string;
}, uploadFn: (buffer: Buffer, type: string) => Promise<{
    url?: string;
    directPath?: string;
}>, renderLatexToPng: (latexExpr: string) => Promise<{
    buffer: Buffer;
    width: number;
    height: number;
}>) => Promise<RichMessageContent>;
export declare const generateLatexInlineImageContent: (quoted: QuotedMsg, options: {
    text?: string;
    expressions: LatexExpression[];
    headerText?: string;
    footer?: string;
}, uploadFn: (buffer: Buffer, type: string) => Promise<{
    url?: string;
    directPath?: string;
}>, renderLatexToPng: (latexExpr: string) => Promise<{
    buffer: Buffer;
    width: number;
    height: number;
}>) => Promise<RichMessageContent>;
export declare const extractUnifiedResponse: (msg: proto.IMessage | null | undefined) => CapturedUnifiedResponse | null;
export declare const generateUnifiedResponseContent: (quoted: QuotedMsg, captured: CapturedUnifiedResponse) => RichMessageContent;
export type GenerateRichMessageOptions = {
    useMarkdown?: boolean;
} & ExtractOptions;
export declare const generateRichMessageContent: (submessages: RichSubMessage[], quoted?: QuotedMsg, options?: GenerateRichMessageOptions) => RichMessageContent;
export type GenerateRichHtmlOptions = {
    id?: string;
    title?: string;
    source?: string;
    trusted_sources?: string | string[];
    typename?: string;
    headerText?: string;
    footer?: string;
};
/**
 * Generate a rich HTML message payload — renders arbitrary HTML inside a
 * GenAI unified-response primitive, forwarded as a bot-style message.
 */
export declare const generateRichHtmlContent: (html: string, quoted?: QuotedMsg, options?: GenerateRichHtmlOptions) => RichMessageContent;
/**
 * Renders a LaTeX expression to a PNG image via the codecogs.com public rendering API.
 */
export declare const renderLatexToPng: (latexExpr: string) => Promise<{
    buffer: Buffer;
    width: number;
    height: number;
}>;
/**
 * Uploads a raw (unencrypted-at-rest) buffer — e.g. a rendered LaTeX/table PNG — to WA's media
 * servers via the socket's `waUploadToServer`. Writes to a temp file, uploads, then cleans up.
 */
export declare const uploadUnencryptedToWA: (buffer: Buffer, waUploadToServer: WAMediaUploadFunction) => Promise<{
    url: string;
    directPath: string;
}>;
/** Always builds native markdown unifiedResponse */
export declare const generateMarkdownContent: (text: string, quoted?: QuotedMsg, options?: ExtractOptions) => RichMessageContent;
//# sourceMappingURL=message-composer.d.ts.map