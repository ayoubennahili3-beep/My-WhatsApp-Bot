import { proto } from '../../WAProto/index.js';
import { prepareWAMessageMedia } from './messages.js';
// ─── Generators ────────────────────────────────────────────────────────────────
/**
 * Generate a classic WhatsApp ButtonsMessage (up to 3 buttons).
 * Works via `sendMessage(jid, content.buttonsMessage)`.
 */
export const generateInteractiveButtonMessage = async (content, options) => {
    const buttons = content.buttons.map((btn, idx) => ({
        buttonId: btn.buttonId ?? `btn-${idx}`,
        buttonText: { displayText: btn.displayText },
        type: proto.Message.ButtonsMessage.Button.Type.RESPONSE,
        nativeFlowInfo: undefined
    }));
    const buttonsMessage = {
        contentText: content.body,
        footerText: content.footer,
        buttons,
        headerType: proto.Message.ButtonsMessage.HeaderType.EMPTY
    };
    if (content.headerImage && options) {
        const media = await prepareWAMessageMedia({ image: content.headerImage }, options);
        buttonsMessage.imageMessage = media.imageMessage;
        buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.IMAGE;
    }
    else if (content.headerVideo && options) {
        const media = await prepareWAMessageMedia({ video: content.headerVideo }, options);
        buttonsMessage.videoMessage = media.videoMessage;
        buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.VIDEO;
    }
    else if (content.headerDocument && options) {
        const doc = content.headerDocument;
        const media = await prepareWAMessageMedia({ document: doc, mimetype: 'application/pdf', fileName: doc.filename }, options);
        buttonsMessage.documentMessage = media.documentMessage;
        buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.DOCUMENT;
    }
    else if (content.title) {
        buttonsMessage.text = content.title;
        buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.TEXT;
    }
    return { buttonsMessage };
};
/**
 * Generate a single-select list message.
 * Works via `sendMessage(jid, content.listMessage)`.
 */
export const generateInteractiveListMessage = (content) => {
    const sections = content.sections.map(section => ({
        title: section.title,
        rows: section.rows.map(row => ({
            rowId: row.rowId,
            title: row.title,
            description: row.description ?? ''
        }))
    }));
    return {
        listMessage: {
            title: content.title,
            description: content.description ?? '',
            buttonText: content.buttonText,
            footerText: content.footer ?? '',
            listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
            sections
        }
    };
};
/**
 * Generate a template message with quick-reply / URL / call buttons.
 * Works via `sendMessage(jid, content.templateMessage)`.
 */
export const generateTemplateMessage = async (content, options) => {
    const hydratedButtons = content.buttons.map(btn => {
        const hydratedBtn = { index: btn.index };
        if (btn.quickReplyButton) {
            hydratedBtn.quickReplyButton = {
                displayText: btn.quickReplyButton.displayText,
                id: btn.quickReplyButton.id
            };
        }
        else if (btn.urlButton) {
            hydratedBtn.urlButton = {
                displayText: btn.urlButton.displayText,
                url: btn.urlButton.url
            };
        }
        else if (btn.callButton) {
            hydratedBtn.callButton = {
                displayText: btn.callButton.displayText,
                phoneNumber: btn.callButton.phoneNumber
            };
        }
        return hydratedBtn;
    });
    const hydratedTemplate = {
        hydratedContentText: content.body,
        hydratedFooterText: content.footer,
        hydratedButtons
    };
    if (content.title) {
        hydratedTemplate.hydratedTitleText = content.title;
    }
    if (content.headerImage && options) {
        const media = await prepareWAMessageMedia({ image: content.headerImage }, options);
        hydratedTemplate.imageMessage = media.imageMessage;
    }
    else if (content.headerVideo && options) {
        const media = await prepareWAMessageMedia({ video: content.headerVideo }, options);
        hydratedTemplate.videoMessage = media.videoMessage;
    }
    else if (content.headerLocation) {
        hydratedTemplate.locationMessage = {
            degreesLatitude: content.headerLocation.latitude,
            degreesLongitude: content.headerLocation.longitude,
            name: content.headerLocation.name,
            address: content.headerLocation.address
        };
    }
    return {
        templateMessage: {
            hydratedTemplate
        }
    };
};
/**
 * Core builder: generate a native-flow interactiveMessage with raw button definitions.
 * All higher-level helpers (generateUrlButtonMessage, generateQuickReplyButtons, etc.) call this.
 */
export const generateNativeFlowMessage = (body, buttons, options) => {
    return {
        interactiveMessage: {
            body: { text: body },
            footer: options?.footer ? { text: options.footer } : undefined,
            header: options?.header
                ? {
                    title: options.header.title,
                    subtitle: options.header.subtitle,
                    hasMediaAttachment: options.header.hasMediaAttachment ?? false
                }
                : undefined,
            nativeFlowMessage: {
                buttons: buttons.map(btn => ({
                    name: btn.name,
                    buttonParamsJson: btn.buttonParamsJson
                })),
                messageParamsJson: ''
            }
        }
    };
};
/**
 * Button that copies a code to the clipboard when tapped.
 *
 * @example
 * const msg = generateCopyCodeButton('Here is your OTP', '123456')
 * await sock.sendMessage(jid, msg.interactiveMessage)
 */
export const generateCopyCodeButton = (body, copyCode, displayText = 'Copy Code', options) => {
    return generateNativeFlowMessage(body, [
        {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({ display_text: displayText, copy_code: copyCode })
        }
    ], options);
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
export const generateUrlButtonMessage = (body, buttons, options) => {
    const nativeButtons = buttons.map(btn => ({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
            display_text: btn.displayText,
            url: btn.url,
            merchant_url: btn.merchantUrl
        })
    }));
    return generateNativeFlowMessage(body, nativeButtons, {
        footer: options?.footer,
        header: options?.title ? { title: options.title } : undefined
    });
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
export const generateQuickReplyButtons = (body, buttons, options) => {
    const nativeButtons = buttons.map(btn => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: btn.displayText, id: btn.id })
    }));
    return generateNativeFlowMessage(body, nativeButtons, {
        footer: options?.footer,
        header: options?.title ? { title: options.title } : undefined
    });
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
export const generateCombinedButtons = (body, buttons, options) => {
    const nativeButtons = buttons.map(btn => {
        switch (btn.type) {
            case 'url':
                return {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({ display_text: btn.displayText, url: btn.url })
                };
            case 'reply':
                return {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: btn.displayText, id: btn.id })
                };
            case 'copy':
                return {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: btn.displayText,
                        copy_code: btn.copyCode
                    })
                };
            case 'call':
                return {
                    name: 'cta_call',
                    buttonParamsJson: JSON.stringify({
                        display_text: btn.displayText,
                        phone_number: btn.phoneNumber
                    })
                };
        }
    });
    return generateNativeFlowMessage(body, nativeButtons, {
        footer: options?.footer,
        header: options?.title ? { title: options.title } : undefined
    });
};
//# sourceMappingURL=interactive-message.js.map