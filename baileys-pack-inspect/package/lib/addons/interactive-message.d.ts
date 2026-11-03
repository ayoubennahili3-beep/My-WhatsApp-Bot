import { proto } from '../../WAProto/index.js';
import type { MediaGenerationOptions, WAMediaUpload } from '../Types/index.js';
export type InteractiveButton = {
    buttonId?: string;
    displayText: string;
};
export type InteractiveButtonMessageContent = {
    /** Body text of the message */
    body: string;
    /** Footer text */
    footer?: string;
    /** Buttons to display */
    buttons: InteractiveButton[];
    /** Optional: plain text title (uses TEXT header type) */
    title?: string;
    /** Optional: image header */
    headerImage?: WAMediaUpload;
    /** Optional: video header */
    headerVideo?: WAMediaUpload;
    /** Optional: document header */
    headerDocument?: WAMediaUpload & {
        filename?: string;
    };
};
export type ListRow = {
    rowId: string;
    title: string;
    description?: string;
};
export type ListSection = {
    title: string;
    rows: ListRow[];
};
export type InteractiveListMessageContent = {
    title: string;
    description?: string;
    buttonText: string;
    footer?: string;
    sections: ListSection[];
};
export type TemplateHydratedButton = {
    index: number;
    quickReplyButton?: {
        displayText: string;
        id: string;
    };
    urlButton?: {
        displayText: string;
        url: string;
    };
    callButton?: {
        displayText: string;
        phoneNumber: string;
    };
};
export type TemplateMessageContent = {
    body: string;
    footer?: string;
    title?: string;
    buttons: TemplateHydratedButton[];
    headerImage?: WAMediaUpload;
    headerVideo?: WAMediaUpload;
    headerLocation?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
};
export type NativeFlowButton = {
    name: string;
    buttonParamsJson: string;
};
export type NativeFlowOptions = {
    footer?: string;
    header?: {
        title?: string;
        subtitle?: string;
        hasMediaAttachment?: boolean;
    };
    /** Raw JSON string merged into nativeFlowMessage.messageParamsJson (e.g. limited_time_offer, bottom_sheet) */
    messageParamsJson?: string;
};
export type CopyCodeButtonOptions = NativeFlowOptions & {
    displayText?: string;
};
export type UrlButton = {
    displayText: string;
    url: string;
    merchantUrl?: string;
};
export type UrlButtonOptions = {
    footer?: string;
    title?: string;
};
export type QuickReplyButton = {
    displayText: string;
    id: string;
};
export type QuickReplyOptions = {
    footer?: string;
    title?: string;
};
export type CombinedButton = {
    type: 'url';
    displayText: string;
    url: string;
    icon?: string;
    useWebview?: boolean;
} | {
    type: 'reply';
    displayText: string;
    id: string;
    icon?: string;
} | {
    type: 'copy';
    displayText: string;
    copyCode: string;
    icon?: string;
} | {
    type: 'call';
    displayText: string;
    phoneNumber: string;
    icon?: string;
} | {
    type: 'sections';
    displayText: string;
    icon?: string;
    sections: {
        title?: string;
        highlightLabel?: string;
        rows: {
            header?: string;
            title: string;
            description?: string;
            id: string;
        }[];
    }[];
}
/**
 * Bare WhatsApp native-flow format — pass this through untouched when you
 * already have it, or need a button `name` (e.g. 'cta_catalog', 'mpm',
 * 'galaxy_message') that the shorthand variants above don't cover yet.
 * No `type` field needed — detected automatically by the presence of
 * `name` + `buttonParamsJson`.
 * Example: { name: 'cta_catalog', buttonParamsJson: JSON.stringify({ business_phone_number: '628xxx' }) }
 */
 | {
    name: string;
    buttonParamsJson: string;
    type?: undefined;
};
export type CombinedButtonOptions = {
    footer?: string;
    title?: string;
    /** Adds a `limited_time_offer` wrapper to the message params (offer banner above buttons) */
    offer?: {
        text: string;
        code?: string;
        url?: string;
        expirationSeconds?: number;
    };
    /** Adds a `bottom_sheet` wrapper — collapses buttons into a "View options" sheet */
    bottomSheet?: {
        title?: string;
        buttonText: string;
    };
};
/**
 * Generate a classic WhatsApp ButtonsMessage (up to 3 buttons).
 * Works via `sendMessage(jid, content.buttonsMessage)`.
 */
export declare const generateInteractiveButtonMessage: (content: InteractiveButtonMessageContent, options?: MediaGenerationOptions) => Promise<{
    buttonsMessage: proto.Message.IButtonsMessage;
}>;
/**
 * Generate a single-select list message.
 * Works via `sendMessage(jid, content.listMessage)`.
 */
export declare const generateInteractiveListMessage: (content: InteractiveListMessageContent) => {
    listMessage: proto.Message.IListMessage;
};
/**
 * Generate a template message with quick-reply / URL / call buttons.
 * Works via `sendMessage(jid, content.templateMessage)`.
 */
export declare const generateTemplateMessage: (content: TemplateMessageContent, options?: MediaGenerationOptions) => Promise<{
    templateMessage: proto.Message.ITemplateMessage;
}>;
/**
 * Core builder: generate a native-flow interactiveMessage with raw button definitions.
 * All higher-level helpers (generateUrlButtonMessage, generateQuickReplyButtons, etc.) call this.
 */
export declare const generateNativeFlowMessage: (body: string, buttons: NativeFlowButton[], options?: NativeFlowOptions) => {
    interactiveMessage: proto.Message.IInteractiveMessage;
};
/**
 * Button that copies a code to the clipboard when tapped.
 *
 * @example
 * const msg = generateCopyCodeButton('Here is your OTP', '123456')
 * await sock.sendMessage(jid, msg.interactiveMessage)
 */
export declare const generateCopyCodeButton: (body: string, copyCode: string, displayText?: string, options?: CopyCodeButtonOptions) => {
    interactiveMessage: proto.Message.IInteractiveMessage;
};
/**
 * One or more CTA URL buttons (opens a link in browser).
 *
 * @example
 * const msg = generateUrlButtonMessage('Visit us!', [
 *   { displayText: 'Open Website', url: 'https://example.com' }
 * ])
 * await sock.sendMessage(jid, msg.interactiveMessage)
 */
export declare const generateUrlButtonMessage: (body: string, buttons: UrlButton[], options?: UrlButtonOptions) => {
    interactiveMessage: proto.Message.IInteractiveMessage;
};
/**
 * One or more quick-reply buttons (sends a reply when tapped).
 *
 * @example
 * const msg = generateQuickReplyButtons('Choose an option:', [
 *   { displayText: 'Yes', id: 'yes' },
 *   { displayText: 'No',  id: 'no'  }
 * ])
 * await sock.sendMessage(jid, msg.interactiveMessage)
 */
export declare const generateQuickReplyButtons: (body: string, buttons: QuickReplyButton[], options?: QuickReplyOptions) => {
    interactiveMessage: proto.Message.IInteractiveMessage;
};
/**
 * Mix of url / reply / copy / call buttons in one message.
 *
 * @example
 * const msg = generateCombinedButtons('What do you want?', [
 *   { type: 'url',   displayText: 'Visit', url: 'https://example.com' },
 *   { type: 'reply', displayText: 'Ping',  id: 'ping' },
 *   { type: 'copy',  displayText: 'Copy',  copyCode: 'ABC123' },
 *   { type: 'call',  displayText: 'Call',  phoneNumber: '+911234567890' }
 * ])
 * await sock.sendMessage(jid, msg.interactiveMessage)
 */
export declare const generateCombinedButtons: (body: string, buttons: CombinedButton[], options?: CombinedButtonOptions) => {
    interactiveMessage: proto.Message.IInteractiveMessage;
};
//# sourceMappingURL=interactive-message.d.ts.map