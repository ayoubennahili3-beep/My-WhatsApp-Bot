/**
 * rich-message-utils.ts
 *
 * `tokenizeCode` is NOT redefined here — this file instead imports it from
 * `message-composer.ts` (which already has a faithful implementation) to
 * avoid duplicating it. Everything else in this file — the
 * botForwardedMessage envelope (with verification-metadata stubs) and the
 * `unifiedResponse` buffer builder — is defined directly below.
 *
 * (This file was previously named `bot-forwarded-message.ts` — renamed to
 * match its actual purpose once full function-by-function parity was
 * confirmed.)
 */
import { proto } from '../../WAProto/index.js';
import type { RichSubMessage } from './message-composer.js';
import { CodeHighlightType } from './message-composer.js';
export type RichContent = {
    code?: string;
    contentText?: string;
    /** Alias for contentText */
    text?: string;
    disclaimerText?: string;
    footerText?: string;
    headerText?: string;
    language?: string;
    links?: {
        text: string;
        url?: string;
        title?: string;
        displayName?: string;
        sources?: {
            displayName?: string;
            subtitle?: string;
            url?: string;
        }[];
    }[];
    /** Single inline image with optional caption/link — url string. */
    inlineImage?: string;
    imageText?: string;
    alignment?: string;
    tapLinkUrl?: string;
    /** Array of LaTeX expression strings, rendered as a native LATEX submessage */
    latex?: string[];
    noHeading?: boolean;
    richResponse?: ({
        text: string;
        inlineEntities?: unknown[];
    } | {
        code: {
            highlightType: CodeHighlightType;
            codeContent: string;
        }[];
        language: string;
    } | {
        table: {
            isHeading?: boolean;
            items: string[];
        }[];
        title?: string;
    })[]
    /** Shorthand: nest text/code/table/language directly under richResponse instead of at the top level */
     | Omit<RichContent, 'richResponse'>;
    table?: string[][];
    title?: string;
};
export declare const toUnified: (submessages: RichSubMessage[]) => {
    response_id: `${string}-${string}-${string}-${string}-${string}`;
    sections: ({
        view_model: {
            primitive: {
                language: string;
                code_blocks: {
                    content: string;
                    type: string;
                }[];
                __typename: string;
                title?: undefined;
                rows?: undefined;
                media?: undefined;
                imagine_type?: undefined;
                status?: undefined;
                text?: undefined;
                expressions?: undefined;
                inline_entities?: undefined;
            };
            __typename: string;
        };
    } | {
        view_model: {
            primitive: {
                title: string;
                rows: {
                    is_header: boolean | undefined;
                    cells: string[];
                    markdown_cells: {
                        text: string;
                    }[];
                }[];
                __typename: string;
                language?: undefined;
                code_blocks?: undefined;
                media?: undefined;
                imagine_type?: undefined;
                status?: undefined;
                text?: undefined;
                expressions?: undefined;
                inline_entities?: undefined;
            };
            __typename: string;
        };
    } | {
        view_model: {
            primitive: {
                media: {
                    url: any;
                    mime_type: string;
                };
                imagine_type: string;
                status: {
                    status: string;
                };
                __typename: string;
                language?: undefined;
                code_blocks?: undefined;
                title?: undefined;
                rows?: undefined;
                text?: undefined;
                expressions?: undefined;
                inline_entities?: undefined;
            };
            __typename: string;
        };
    } | {
        view_model: {
            primitive: {
                text: any;
                expressions: any;
                __typename: string;
                language?: undefined;
                code_blocks?: undefined;
                title?: undefined;
                rows?: undefined;
                media?: undefined;
                imagine_type?: undefined;
                status?: undefined;
                inline_entities?: undefined;
            };
            __typename: string;
        };
    } | {
        view_model: {
            primitive: {
                text: string;
                inline_entities: unknown[];
                __typename: string;
                language?: undefined;
                code_blocks?: undefined;
                title?: undefined;
                rows?: undefined;
                media?: undefined;
                imagine_type?: undefined;
                status?: undefined;
                expressions?: undefined;
            };
            __typename: string;
        };
    })[];
};
export declare const botMetadataSignature: () => Uint8Array;
export declare const botMetadataCertificate: (length?: number) => Uint8Array;
/**
 * Wrap a richResponseMessage into the botForwardedMessage envelope
 * with verification metadata stubs.
 */
export declare const wrapToBotForwardedMessage: (richResponseMessage: proto.IAIRichResponseMessage) => {
    messageContextInfo: {
        botMetadata: {
            verificationMetadata: {
                proofs: {
                    certificateChain: Uint8Array<ArrayBufferLike>[];
                    version: number;
                    useCase: number;
                    signature: Uint8Array<ArrayBufferLike>;
                }[];
            };
        };
    };
    botForwardedMessage: {
        message: {
            richResponseMessage: proto.IAIRichResponseMessage;
        };
    };
};
/**
 * Build a complete botForwardedMessage with richResponseMessage.
 * Supports code, table, text, links, and richResponse arrays.
 */
export declare const prepareRichResponseMessage: (content: RichContent) => {
    messageContextInfo: {
        botMetadata: {
            verificationMetadata: {
                proofs: {
                    certificateChain: Uint8Array<ArrayBufferLike>[];
                    version: number;
                    useCase: number;
                    signature: Uint8Array<ArrayBufferLike>;
                }[];
            };
        };
    };
    botForwardedMessage: {
        message: {
            richResponseMessage: proto.IAIRichResponseMessage;
        };
    };
};
//# sourceMappingURL=rich-message-utils.d.ts.map