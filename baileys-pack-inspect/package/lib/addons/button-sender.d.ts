/**
 * button-sender.ts
 * Ported from @ryuu-reinzz/button-helper v2.2.5 → TypeScript/ESM for @queenanya/baileys
 *
 * Provides runtime helpers to send WhatsApp interactive / native-flow button
 * messages via relayMessage directly, bypassing sendMessage's validation path
 * that does not recognise interactiveMessage payloads.
 *
 * Visibility guarantee:
 *  All button types (quick_reply, cta_url, cta_copy, cta_call, list, template,
 *  carousel/cards, combined, single_select) render correctly on:
 *    • WhatsApp Messenger  — Android & iOS
 *    • WhatsApp Business   — Android & iOS
 *
 * What this file provides:
 *  1. buildInteractiveButtons()              — legacy → native_flow normaliser
 *  2. validateAuthoringButtons()             — permissive pre-send validation
 *  3. validateSendButtonsPayload()           — strict sendButtons payload check
 *  4. validateSendInteractiveMessagePayload()— strict interactive payload check
 *  5. validateInteractiveMessageContent()    — post-convert check
 *  6. convertToInteractiveMessage()          — high-level authoring → proto shape
 *  7. sendInteractiveMessage()               — low-level power function
 *  8. sendInteractiveMessageV2()             — extended (thumbnail / externalAdReply)
 *  9. sendButtons()                          — convenience quick-reply wrapper
 * 10. InteractiveValidationError             — structured error class
 *
 * getButtonType / getButtonArgs are imported from ./message-utils (already in
 * this repo — no duplication).
 *
 * Usage:
 *   import { sendButtons, sendInteractiveMessage } from '@queenanya/baileys'
 *
 *   await sendButtons(sock, jid, {
 *     text: 'Choose an option',
 *     footer: 'Bot footer',
 *     buttons: [
 *       { id: 'yes', text: 'Yes' },
 *       { id: 'no',  text: 'No'  },
 *     ],
 *   })
 */
import type { MessageRelayOptions, WAMessageContent } from '../Types/Message.js';
/** Button already in native-flow wire format */
export type NativeSendButton = {
    name: string;
    buttonParamsJson: string;
};
/** Simple legacy quick-reply { id, text } */
export type LegacySendButton = {
    id?: string;
    text?: string;
    displayText?: string;
};
/** Old Baileys { buttonId, buttonText: { displayText } } */
export type OldBaileysSendButton = {
    buttonId: string;
    buttonText: {
        displayText: string;
    };
};
export type AnyRawButton = NativeSendButton | LegacySendButton | OldBaileysSendButton | Record<string, unknown>;
/** Payload for sendButtons() */
export interface SendButtonsData {
    text: string;
    buttons: AnyRawButton[];
    footer?: string;
    title?: string;
    subtitle?: string;
}
/** Payload for sendInteractiveMessage() */
export interface SendInteractiveData extends Record<string, unknown> {
    text: string;
    interactiveButtons: NativeSendButton[];
    footer?: string;
    title?: string;
    subtitle?: string;
    /** Public URL — thumbnail fetched and embedded as jpegThumbnail */
    thumbnailUrl?: string;
    contextInfo?: Record<string, unknown>;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    cleaned?: AnyRawButton[];
}
/**
 * Minimal socket interface the send helpers require.
 * A full WASocket instance (ReturnType<typeof makeWASocket>) satisfies this.
 */
export interface ButtonSenderSocket {
    authState: {
        creds: {
            me?: {
                id: string;
                lid?: string;
            } | null;
        };
    };
    logger?: unknown;
    relayMessage: (jid: string, message: WAMessageContent, opts: MessageRelayOptions) => Promise<string>;
    config?: {
        emitOwnEvents?: boolean;
    };
    processingMutex?: {
        mutex: (fn: () => Promise<unknown>) => Promise<unknown>;
    };
    upsertMessage?: (msg: unknown, mode: string) => Promise<unknown>;
    user?: {
        id: string;
    };
}
/**
 * Thrown when button payload authoring validation fails.
 * Provides structured errors/warnings + a canonical example so callers can
 * surface actionable feedback to end-users or logs.
 */
export declare class InteractiveValidationError extends Error {
    readonly context?: string;
    readonly errors: string[];
    readonly warnings: string[];
    readonly example?: unknown;
    constructor(message: string, { context, errors, warnings, example }?: {
        context?: string;
        errors?: string[];
        warnings?: string[];
        example?: unknown;
    });
    toJSON(): {
        name: string;
        message: string;
        context: string | undefined;
        errors: string[];
        warnings: string[];
        example: unknown;
    };
    formatDetailed(): string;
}
/**
 * Normalise various legacy / upstream button shapes into the native-flow format
 * { name, buttonParamsJson }.
 *
 * Accepted input shapes:
 *  1. Already native_flow : { name: string, buttonParamsJson: string }
 *  2. Simple legacy       : { id?: string, text?: string, displayText?: string }
 *  3. Old Baileys         : { buttonId: string, buttonText: { displayText: string } }
 *  4. Unknown             : passed through verbatim
 */
export declare function buildInteractiveButtons(buttons?: AnyRawButton[]): NativeSendButton[];
/**
 * Validate raw button objects before conversion.
 * Permissive: only blocks clearly malformed input.
 */
export declare function validateAuthoringButtons(buttons: unknown): ValidationResult;
/**
 * Strict validator for sendButtons() payload.
 */
export declare function validateSendButtonsPayload(data: unknown): ValidationResult;
/**
 * Strict validator for sendInteractiveMessage() authoring payload.
 */
export declare function validateSendInteractiveMessagePayload(data: unknown): ValidationResult;
/**
 * Validate already-converted interactiveMessage content (just before WAMessage creation).
 */
export declare function validateInteractiveMessageContent(content: unknown): ValidationResult;
/**
 * Convert the high-level authoring shape:
 *   { text, footer?, title?, subtitle?, interactiveButtons: [...] }
 * into the exact structure @queenanya/baileys / WAProto expects:
 *   { interactiveMessage: { nativeFlowMessage: { buttons: [...] }, body?, header?, footer? } }
 *
 * Authoring-only fields are stripped so they don't leak into
 * generateWAMessageFromContent.
 */
export declare function convertToInteractiveMessage(content: Record<string, unknown>): Record<string, unknown>;
/**
 * Low-level power function — sends any interactive message by:
 *
 *  1. Validate authoring payload (when interactiveButtons is provided).
 *  2. Convert to interactiveMessage / nativeFlowMessage proto shape.
 *  3. Build WAMessage via generateWAMessageFromContent (skips sendMessage
 *     validation that rejects interactiveMessage).
 *  4. Derive & inject required binary nodes so buttons render on all platforms:
 *       - biz node  { tag:'biz', attrs:{} }
 *       - interactive child  { type:'native_flow', v:'1' }
 *       - native_flow child  { v:'9', name:'mixed' }
 *       - bot node  { tag:'bot', attrs:{ biz_bot:'1' } }  (private chats only)
 *  5. Relay via sock.relayMessage.
 *
 * iOS/Android + WA Messenger + WA Business compatibility:
 *  getButtonArgs() (message-utils.ts) already handles all button categories:
 *  single_select, payment flows, mpm/catalog/location specials, standard
 *  native_flow (mixed), list, carousel/cards — each with the correct node tree.
 *
 * @param sock     Active @queenanya/baileys socket instance.
 * @param jid      Destination chat JID.
 * @param content  Authoring payload (may include interactiveButtons).
 * @param options  Pass-through relay options (additionalNodes, etc.).
 */
export declare function sendInteractiveMessage(sock: ButtonSenderSocket, jid: string, content: Record<string, unknown>, options?: MessageRelayOptions): Promise<unknown>;
/**
 * Extended send variant with thumbnail / externalAdReply patching.
 * Merged best-of-both from button-helper v2.2.3 + v2.2.5.
 *
 * Dummy document priority (Patch 1):
 *  1. content.filePath  — load file from local disk path (v2.2.3)
 *  2. content.fileUrl   — fetch file buffer from a URL (v2.2.3)
 *  3. content.thumbnailUrl — fetch jpegThumbnail buffer AND use as dummy (v2.2.5)
 *  4. fallback          — plain text dummy buffer (v2.2.3)
 *  mimetype is taken from content.mimetype if provided, else auto-detected.
 *
 * externalAdReply (Patch 2) — merged fields from both versions:
 *  - containsAutoReply : true          (v2.2.3)
 *  - mediaUrl / thumbnailUrl           (v2.2.5)
 *  - renderLargerThumbnail : true      (v2.2.5)
 *  - jpegThumbnail buffer              (v2.2.5 — WA trusts this most)
 *
 * axios is a soft peer dependency — errors are non-fatal (console warn only).
 *
 * @example — thumbnail from URL
 * await sendInteractiveMessageV2(sock, jid, {
 *   text: 'Hello',
 *   thumbnailUrl: 'https://example.com/thumb.jpg',
 *   interactiveButtons: [{ name: 'quick_reply', buttonParamsJson: '{"display_text":"Hi","id":"hi"}' }],
 * })
 *
 * @example — dummy file from local path
 * await sendInteractiveMessageV2(sock, jid, {
 *   text: 'Hello',
 *   filePath: '/tmp/myfile.pdf',
 *   mimetype: 'application/pdf',
 *   interactiveButtons: [...],
 * })
 */
export declare function sendInteractiveMessageV2(sock: ButtonSenderSocket, jid: string, content: Record<string, unknown>, options?: MessageRelayOptions): Promise<unknown>;
/**
 * Convenience wrapper for the most common quick-reply / CTA button use case.
 *
 * @example — quick-reply
 * await sendButtons(sock, jid, {
 *   text: 'Are you sure?',
 *   footer: 'Bot v1',
 *   buttons: [
 *     { id: 'yes', text: 'Yes' },
 *     { id: 'no',  text: 'No'  },
 *   ],
 * })
 *
 * @example — mixed quick-reply + CTA URL
 * await sendButtons(sock, jid, {
 *   text: 'Check our site',
 *   buttons: [
 *     { id: 'info', text: 'More Info' },
 *     { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Open', url: 'https://example.com' }) },
 *   ],
 * })
 */
export declare function sendButtons(sock: ButtonSenderSocket, jid: string, data?: SendButtonsData, options?: MessageRelayOptions): Promise<unknown>;
//# sourceMappingURL=button-sender.d.ts.map