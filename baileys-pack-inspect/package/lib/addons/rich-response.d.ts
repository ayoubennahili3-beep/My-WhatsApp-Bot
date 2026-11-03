/**
 * Rich Response Utilities
 * sendTable, sendList, sendCodeBlock, sendLatex, sendLatexImage,
 * sendLatexInlineImage, sendRichMessage, captureUnifiedResponse, sendUnifiedResponse
 */
import type { AnyMessageContent, MiscMessageGenerationOptions, WAMessage } from '../Types/index.js';
import type { RichSubMessage } from './message-composer.js';
type SendFn = (jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions) => Promise<any>;
/**
 * Format a 2D array as a plain-text table and send it.
 * @example sendTable(sock.sendMessage, jid, [['Name','Age'],['Alice','30']])
 */
export declare const sendTable: (sendMessage: SendFn, jid: string, title: string, headers: string[], rows: string[][], quoted?: WAMessage | null, opts?: MiscMessageGenerationOptions & {
    footer?: string;
    headerText?: string;
}) => Promise<any>;
/**
 * Send a rich list — each item can be a single string or an array of
 * cells for a multi-column row. Renders as a native table primitive
 * (same underlying mechanism as sendTable).
 */
export declare const sendList: (sendMessage: SendFn, jid: string, title: string, items: (string | string[])[], quoted?: WAMessage | null, opts?: MiscMessageGenerationOptions & {
    footer?: string;
    headerText?: string;
}) => Promise<any>;
/**
 * Send a code block (wrapped in triple backticks).
 * language is a hint for syntax highlighting in clients that support it.
 */
export declare const sendCodeBlock: (sendMessage: SendFn, jid: string, code: string, quoted?: WAMessage | null, opts?: {
    language?: string;
    title?: string;
    footer?: string;
} & MiscMessageGenerationOptions) => Promise<any>;
/**
 * Send a LaTeX expression as raw text (wrapped in backticks).
 * Note: WhatsApp does not natively render LaTeX. This sends the raw expression.
 */
export declare const sendLatex: (sendMessage: SendFn, jid: string, expression: string, opts?: MiscMessageGenerationOptions) => Promise<void>;
/**
 * Render a LaTeX expression to a PNG image via an external API (e.g. quicklatex.com)
 * and send it as an image message.
 */
export declare const sendLatexImage: (sendMessage: SendFn, jid: string, expression: string, opts?: {
    caption?: string;
} & MiscMessageGenerationOptions) => Promise<void>;
/**
 * Render a LaTeX expression to PNG and send it inline (as image with expression as caption).
 */
export declare const sendLatexInlineImage: (sendMessage: SendFn, jid: string, expression: string, opts?: MiscMessageGenerationOptions) => Promise<void>;
/**
 * Send a rich message composed of mixed content parts (text, table, list, code, latex).
 */
export type SendRichMessageOptions = MiscMessageGenerationOptions & {
    /**
     * When true, converts standard submessages (TEXT, TABLE, CODE, INLINE_IMAGE)
     * into WhatsApp's native unifiedResponse primitives (GenAIMarkdownTextUXPrimitive,
     * GenATableUXPrimitive, etc.) so they render as native rich content instead of
     * plain text.
     */
    useMarkdown?: boolean;
};
/**
 * Send a fully custom rich message by assembling raw submessage objects
 * (messageType: 2=Text, 3=Inline Image, 4=Table, 5=Code Block, 8=LaTeX).
 * With `{ useMarkdown: true }`, builds the real botForwardedMessage +
 * unifiedResponse payload so WhatsApp renders native markdown/table/code
 * primitives instead of a flattened text fallback.
 */
export declare const sendRichMessage: (sendMessage: SendFn, jid: string, submessages: RichSubMessage[], quoted?: WAMessage | null, opts?: SendRichMessageOptions) => Promise<any>;
export type UnifiedResponseEntry = {
    jid: string;
    content: AnyMessageContent;
    options?: MiscMessageGenerationOptions;
};
/**
 * Capture a response without immediately sending it.
 * Useful for building batched sends.
 */
export declare const captureUnifiedResponse: (jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions) => UnifiedResponseEntry;
/**
 * Send all captured unified responses and clear the capture buffer.
 * Returns the results in order.
 */
export declare const sendUnifiedResponse: (sendMessage: SendFn) => Promise<any[]>;
/**
 * Clear captured responses without sending them
 */
export declare const clearCapturedResponses: () => void;
/**
 * Get current captured responses without clearing
 */
export declare const getCapturedResponses: () => UnifiedResponseEntry[];
export {};
//# sourceMappingURL=rich-response.d.ts.map