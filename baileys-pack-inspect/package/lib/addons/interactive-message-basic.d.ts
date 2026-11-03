/**
 * interactive-message-basic.ts
 *
 * This is a pure, unmodified-scope alternate implementation — the exact 8
 * functions (`generateInteractiveButtonMessage`,
 * `generateInteractiveListMessage`, `generateTemplateMessage`,
 * `generateNativeFlowMessage`, `generateCopyCodeButton`,
 * `generateUrlButtonMessage`, `generateQuickReplyButtons`,
 * `generateCombinedButtons`), logic verified identical to
 * `interactive-message.ts` (which adds full TypeScript param/return types
 * plus doc comments, but no behavior changes). Kept as a separate file for
 * reference/audit purposes (rather than replacing `interactive-message.ts`),
 * but deliberately NOT re-exported from `addons/index.ts` — its functions
 * are already available via `interactive-message.ts`, which is exported.
 */
import { proto } from '../../WAProto/index.js';
import type { MessageGenerationOptions, WAMediaUpload } from '../Types/index.js';
export type BasicButton = {
    buttonId?: string;
    displayText: string;
};
export type BasicButtonsContent = {
    body: string;
    footer?: string;
    title?: string;
    buttons: BasicButton[];
    headerImage?: WAMediaUpload;
    headerVideo?: WAMediaUpload;
    headerDocument?: WAMediaUpload & {
        filename?: string;
    };
};
export declare const generateInteractiveButtonMessage: (content: BasicButtonsContent, options?: MessageGenerationOptions) => Promise<{
    buttonsMessage: proto.Message.IButtonsMessage & {
        text?: string;
        imageMessage?: proto.Message.IImageMessage | null;
        videoMessage?: proto.Message.IVideoMessage | null;
        documentMessage?: proto.Message.IDocumentMessage | null;
    };
}>;
export type BasicListRow = {
    rowId: string;
    title: string;
    description?: string;
};
export type BasicListSection = {
    title: string;
    rows: BasicListRow[];
};
export type BasicListContent = {
    title: string;
    description?: string;
    buttonText: string;
    footer?: string;
    sections: BasicListSection[];
};
export declare const generateInteractiveListMessage: (content: BasicListContent) => {
    listMessage: {
        title: string;
        description: string;
        buttonText: string;
        footerText: string;
        listType: proto.Message.ListMessage.ListType;
        sections: {
            title: string;
            rows: {
                rowId: string;
                title: string;
                description: string;
            }[];
        }[];
    };
};
export type BasicTemplateButton = {
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
export type BasicTemplateContent = {
    body: string;
    footer?: string;
    title?: string;
    buttons: BasicTemplateButton[];
    headerImage?: WAMediaUpload;
    headerVideo?: WAMediaUpload;
    headerLocation?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
};
export declare const generateTemplateMessage: (content: BasicTemplateContent, options?: MessageGenerationOptions) => Promise<{
    templateMessage: {
        hydratedTemplate: any;
    };
}>;
export type BasicNativeFlowButton = {
    name: string;
    buttonParamsJson: string;
};
export type BasicNativeFlowOptions = {
    footer?: string;
    header?: {
        title: string;
        subtitle?: string;
        hasMediaAttachment?: boolean;
    };
};
export declare const generateNativeFlowMessage: (body: string, buttons: BasicNativeFlowButton[], options?: BasicNativeFlowOptions) => {
    interactiveMessage: {
        body: {
            text: string;
        };
        footer: {
            text: string;
        } | undefined;
        header: {
            title: string;
            subtitle: string | undefined;
            hasMediaAttachment: boolean;
        } | undefined;
        nativeFlowMessage: {
            buttons: {
                name: string;
                buttonParamsJson: string;
            }[];
            messageParamsJson: string;
        };
    };
};
export declare const generateCopyCodeButton: (body: string, copyCode: string, displayText?: string, options?: BasicNativeFlowOptions) => {
    interactiveMessage: {
        body: {
            text: string;
        };
        footer: {
            text: string;
        } | undefined;
        header: {
            title: string;
            subtitle: string | undefined;
            hasMediaAttachment: boolean;
        } | undefined;
        nativeFlowMessage: {
            buttons: {
                name: string;
                buttonParamsJson: string;
            }[];
            messageParamsJson: string;
        };
    };
};
export type BasicUrlButton = {
    displayText: string;
    url: string;
    merchantUrl?: string;
};
export declare const generateUrlButtonMessage: (body: string, buttons: BasicUrlButton[], options?: {
    footer?: string;
    title?: string;
}) => {
    interactiveMessage: {
        body: {
            text: string;
        };
        footer: {
            text: string;
        } | undefined;
        header: {
            title: string;
            subtitle: string | undefined;
            hasMediaAttachment: boolean;
        } | undefined;
        nativeFlowMessage: {
            buttons: {
                name: string;
                buttonParamsJson: string;
            }[];
            messageParamsJson: string;
        };
    };
};
export type BasicQuickReplyButton = {
    displayText: string;
    id: string;
};
export declare const generateQuickReplyButtons: (body: string, buttons: BasicQuickReplyButton[], options?: {
    footer?: string;
    title?: string;
}) => {
    interactiveMessage: {
        body: {
            text: string;
        };
        footer: {
            text: string;
        } | undefined;
        header: {
            title: string;
            subtitle: string | undefined;
            hasMediaAttachment: boolean;
        } | undefined;
        nativeFlowMessage: {
            buttons: {
                name: string;
                buttonParamsJson: string;
            }[];
            messageParamsJson: string;
        };
    };
};
export type BasicCombinedButton = {
    type: 'url';
    displayText: string;
    url: string;
} | {
    type: 'reply';
    displayText: string;
    id: string;
} | {
    type: 'copy';
    displayText: string;
    copyCode: string;
} | {
    type: 'call';
    displayText: string;
    phoneNumber: string;
};
export declare const generateCombinedButtons: (body: string, buttons: BasicCombinedButton[], options?: {
    footer?: string;
    title?: string;
}) => {
    interactiveMessage: {
        body: {
            text: string;
        };
        footer: {
            text: string;
        } | undefined;
        header: {
            title: string;
            subtitle: string | undefined;
            hasMediaAttachment: boolean;
        } | undefined;
        nativeFlowMessage: {
            buttons: {
                name: string;
                buttonParamsJson: string;
            }[];
            messageParamsJson: string;
        };
    };
};
//# sourceMappingURL=interactive-message-basic.d.ts.map