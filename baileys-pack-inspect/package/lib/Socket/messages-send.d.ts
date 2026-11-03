import NodeCache from '@cacheable/node-cache';
import { Boom } from '@hapi/boom';
import { proto } from '../../WAProto/index.js';
import { type CapturedUnifiedResponse, type ExtractOptions, type GenerateRichHtmlOptions, type GenerateRichMessageOptions, type LatexExpression, type RichSubMessage } from '../addons/message-composer.js';
import { type StickerPackInput, type StickerPackOptions } from '../addons/stickerpack.js';
import type { AnyMessageContent, MediaConnInfo, MessageReceiptType, MessageRelayOptions, MiscMessageGenerationOptions, SocketConfig, WAMediaUpload, WAMessage, WAMessageKey } from '../Types/index.js';
import { MessageRetryManager } from '../Utils/index.js';
import { type BinaryNode, type JidWithDevice } from '../WABinary/index.js';
import { USyncQuery } from '../WAUSync/index.js';
/**
 * Resolves a PN or hosted-PN JID to its mapped LID for outbound sends.
 * Uses local-only store lookup — does NOT trigger USync / network.
 * For cold (unmapped) contacts the original jid is returned unchanged.
 * Source: PR #2692 (frndchagas)
 */
export type MessageSendJid = {
    /** The JID to actually send to (may be LID if mapped) */
    jid: string;
    /** Original PN JID preserved as alternate addressing metadata */
    remoteJidAlt?: string;
    /** 'lid' when routed to a LID, undefined otherwise */
    addressingMode?: 'lid';
    /** Additional stanza attributes for LID addressing */
    additionalAttributes?: Record<string, string>;
};
export declare const resolveMessageSendJid: (jid: string, getStoredLIDForPN: (pn: string) => Promise<string | null>) => Promise<MessageSendJid>;
export declare const makeMessagesSocket: (config: SocketConfig) => {
    userDevicesCache: import("../Types/index.js").PossiblyExtendedCacheStore | NodeCache<JidWithDevice[]>;
    devicesMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    issuePrivacyTokens: (jids: string[], timestamp?: number) => Promise<any>;
    assertSessions: (jids: string[], force?: boolean) => Promise<boolean>;
    relayMessage: (jid: string, message: proto.IMessage, { messageId: msgId, participant, additionalAttributes, additionalNodes, useUserDevicesCache, useCachedGroupMetadata, statusJidList, AI, secureMetaServiceLabel }: MessageRelayOptions & {
        AI?: boolean;
        secureMetaServiceLabel?: boolean;
    }) => Promise<string>;
    sendReceipt: (jid: string, participant: string | undefined, messageIds: string[], type: MessageReceiptType) => Promise<void>;
    sendReceipts: (keys: WAMessageKey[], type: MessageReceiptType) => Promise<void>;
    readMessages: (keys: WAMessageKey[]) => Promise<void>;
    markIdentityChanged: (jid: string) => void;
    recentlyChangedIdentities: Map<string, NodeJS.Timeout>;
    refreshMediaConn: (forceGet?: boolean) => Promise<MediaConnInfo>;
    getMediaHost: () => string;
    waUploadToServer: import("../Types/index.js").WAMediaUploadFunction;
    fetchPrivacySettings: (force?: boolean) => Promise<{
        [_: string]: string;
    }>;
    sendPeerDataOperationMessage: (pdoMessage: proto.Message.IPeerDataOperationRequestMessage) => Promise<string>;
    /**
     * Request the paired phone to generate a high-quality link preview for a URL.
     * The phone resolves the URL natively and returns metadata via a PDO response,
     * which is handled in process-message and emitted as a 'link-preview.update' event.
     * Falls back to local link-preview-js when `generateHighQualityLinkPreview` is false.
     * Source: PR #2701 (frndchagas)
     */
    requestPhoneLinkPreview: (url: string) => Promise<string>;
    createParticipantNodes: (recipientJids: string[], message: proto.IMessage, extraAttrs?: BinaryNode["attrs"], dsmMessage?: proto.IMessage) => Promise<{
        nodes: BinaryNode[];
        shouldIncludeDeviceIdentity: boolean;
    }>;
    getUSyncDevices: (jids: string[], useCache: boolean, ignoreZeroDevices: boolean) => Promise<(JidWithDevice & {
        jid: string;
    })[]>;
    messageRetryManager: MessageRetryManager | null;
    updateMemberLabel: (jid: string, memberLabel: string) => Promise<string>;
    updateMediaMessage: (message: WAMessage) => Promise<WAMessage>;
    sendMessage: (jid: string | string[], content: AnyMessageContent, options?: MiscMessageGenerationOptions) => Promise<WAMessage | undefined>;
    /**
     * Build and send a sticker pack via the alternate builder
     * (`prepareStickerPackMessage`, addons/stickerpack.ts) — kept as a
     * distinct implementation from the one `sock.sendMessage(jid, {
     * stickerPack: {...} })` uses. Use whichever produces the result you
     * need; both are fully supported.
     */
    sendStickerPack: (jid: string, stickerPack: StickerPackInput, options?: MiscMessageGenerationOptions & {
        mediaCache?: StickerPackOptions["mediaCache"];
    }) => Promise<string>;
    sendStatusMentions: (content: AnyMessageContent, jids?: string[]) => Promise<WAMessage>;
    /**
     * Send a rich table via botForwardedMessage → richResponseMessage.
     */
    sendTable: (jid: string, title: string, headers: string[], rows: string[][], quoted?: any, options?: {
        headerText?: string;
        footer?: string;
    }) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Send a rich list (single-column table).
     */
    sendList: (jid: string, title: string, items: string[] | string[][], quoted?: any, options?: {
        headerText?: string;
        footer?: string;
    }) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Send a syntax-highlighted code block.
     */
    sendCodeBlock: (jid: string, code: string, quoted?: any, options?: {
        title?: string;
        footer?: string;
        language?: string;
    }) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Send a rich HTML message (GenAI unified-response HTML primitive),
     * forwarded as a bot-style message.
     */
    sendRichHtml: (jid: string, html: string, quoted?: any, options?: GenerateRichHtmlOptions) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Send a LaTeX expression as text (no image rendering).
     */
    sendLatex: (jid: string, quoted: any, options: {
        text?: string;
        expressions: LatexExpression[];
        headerText?: string;
        footer?: string;
    }) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Render LaTeX to PNG images, upload, and send.
     */
    sendLatexImage: (jid: string, quoted: any, options: {
        text?: string;
        expressions: LatexExpression[];
        headerText?: string;
        footer?: string;
    }, renderLatexToPng: (latexExpr: string) => Promise<{
        buffer: Buffer;
        width: number;
        height: number;
    }>, uploadFn: (buffer: Buffer, type: string) => Promise<{
        url?: string;
        directPath?: string;
    }>) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Render LaTeX to PNG inline image blocks, upload, and send.
     */
    sendLatexInlineImage: (jid: string, quoted: any, options: {
        text?: string;
        expressions: LatexExpression[];
        headerText?: string;
        footer?: string;
    }, renderLatexToPng: (latexExpr: string) => Promise<{
        buffer: Buffer;
        width: number;
        height: number;
    }>, uploadFn: (buffer: Buffer, type: string) => Promise<{
        url?: string;
        directPath?: string;
    }>) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Send a rich markdown text message formatted natively via Meta AI primitives.
     * WA's richResponse text field already supports its own native markdown-like
     * syntax (*bold*, _italic_, ~strike~, ```code```), so this is a thin wrapper
     * around the TEXT rich-submessage primitive — it does not do a full CommonMark
     * parse, just passes the string straight through as a single TEXT submessage.
     *
     * `options` also controls inline entity extraction: `[text](url)` becomes a
     * clickable hyperlink, `[](url)` becomes a citation, and `[expr|w|h|fh|pad](url)`
     * becomes a rendered latex reference. Pass `{ extract: false }` to disable, or
     * `{ hyperlink: false }` / `{ citation: false }` / `{ latex: false }` to disable
     * a specific kind (all default to `true`).
     */
    sendMarkdown: (jid: string, markdown: string, quoted?: any, options?: ExtractOptions) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Send a fully custom rich message from a raw submessages array.
     * Pass { useMarkdown: true } to render TEXT/TABLE/CODE submessages
     * as native WhatsApp rich-content primitives via unifiedResponse.
     * When useMarkdown is set, `extract`/`hyperlink`/`citation`/`latex` also
     * control inline entity extraction from TEXT and TABLE cell contents,
     * same as `sendMarkdown`.
     */
    sendRichMessage: (jid: string, submessages: RichSubMessage[], quoted?: any, options?: GenerateRichMessageOptions) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    /**
     * Capture the unifiedResponse payload from an incoming Meta AI message.
     * Returns null if the message is not a rich response.
     */
    extractUnifiedResponse: (msg: proto.IMessage | null | undefined) => CapturedUnifiedResponse | null;
    /**
     * Re-send a captured unifiedResponse to a new JID.
     */
    sendUnifiedResponse: (jid: string, quoted: any, captured: CapturedUnifiedResponse) => Promise<{
        message: proto.IMessage;
        messageId: string;
    }>;
    newsletterCreate: (name: string, description?: string) => Promise<import("../Types/index.js").NewsletterMetadata>;
    newsletterUpdate: (jid: string, updates: import("../Types/index.js").NewsletterUpdate) => Promise<unknown>;
    newsletterFetchAllParticipating: () => Promise<unknown>;
    newsletterSubscribers: (jid: string) => Promise<{
        subscribers: number;
    }>;
    newsletterMetadata: (type: "invite" | "jid", key: string) => Promise<import("../Types/index.js").NewsletterMetadata | null>;
    newsletterFollow: (jid: string) => Promise<unknown>;
    newsletterUnfollow: (jid: string) => Promise<unknown>;
    newsletterMute: (jid: string) => Promise<unknown>;
    newsletterUnmute: (jid: string) => Promise<unknown>;
    newsletterUpdateName: (jid: string, name: string) => Promise<unknown>;
    newsletterUpdateDescription: (jid: string, description: string) => Promise<unknown>;
    newsletterUpdatePicture: (jid: string, content: WAMediaUpload) => Promise<unknown>;
    newsletterRemovePicture: (jid: string) => Promise<unknown>;
    newsletterReactMessage: (jid: string, serverId: string, reaction?: string) => Promise<void>;
    newsletterFetchMessages: (jid: string, count: number, since: number, after: number) => Promise<any>;
    subscribeNewsletterUpdates: (jid: string) => Promise<{
        duration: string;
    } | null>;
    newsletterAdminCount: (jid: string) => Promise<number>;
    newsletterChangeOwner: (jid: string, newOwnerJid: string) => Promise<void>;
    newsletterDemote: (jid: string, userJid: string) => Promise<void>;
    newsletterDelete: (jid: string) => Promise<void>;
    newsletterSubscribed: () => Promise<unknown>;
    newsletterReactionMode: (jid: string, mode: string) => Promise<void>;
    newsletterAction: (jid: string, type: keyof typeof import("../Types/index.js").QueryIds) => Promise<void>;
    newsletterFetchUpdates: (jid: string, count: number, after?: number, since?: number) => Promise<any>;
    groupMetadata: (jid: string) => Promise<import("../Types/index.js").GroupMetadata>;
    groupCreate: (subject: string, participants: string[]) => Promise<import("../Types/index.js").GroupMetadata>;
    groupLeave: (id: string) => Promise<void>;
    groupUpdateSubject: (jid: string, subject: string) => Promise<void>;
    groupRequestParticipantsList: (jid: string) => Promise<{
        [key: string]: string;
    }[]>;
    groupRequestParticipantsUpdate: (jid: string, participants: string[], action: "approve" | "reject") => Promise<{
        status: string;
        jid: string | undefined;
    }[]>;
    groupParticipantsUpdate: (jid: string, participants: string[], action: import("../Types/index.js").ParticipantAction) => Promise<{
        status: string;
        jid: string | undefined;
        content: BinaryNode;
    }[]>;
    groupUpdateDescription: (jid: string, description?: string) => Promise<void>;
    groupInviteCode: (jid: string) => Promise<string | undefined>;
    groupRevokeInvite: (jid: string) => Promise<string | undefined>;
    groupAcceptInvite: (code: string) => Promise<string | undefined>;
    groupRevokeInviteV4: (groupJid: string, invitedJid: string) => Promise<boolean>;
    groupAcceptInviteV4: (key: string | WAMessageKey, inviteMessage: proto.Message.IGroupInviteMessage) => Promise<any>;
    groupGetInviteInfo: (code: string) => Promise<import("../Types/index.js").GroupMetadata>;
    groupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>;
    groupSettingUpdate: (jid: string, setting: "announcement" | "not_announcement" | "locked" | "unlocked") => Promise<void>;
    groupMemberAddMode: (jid: string, mode: "admin_add" | "all_member_add") => Promise<void>;
    groupJoinApprovalMode: (jid: string, mode: "on" | "off") => Promise<void>;
    groupFetchAllParticipating: () => Promise<{
        [_: string]: import("../Types/index.js").GroupMetadata;
    }>;
    serverProps: {
        privacyTokenOn1to1: boolean;
        profilePicPrivacyToken: boolean;
        lidTrustedTokenIssueToLid: boolean;
    };
    createCallLink: (type: "audio" | "video", event?: {
        startTime: number;
    }, timeoutMs?: number) => Promise<string | undefined>;
    getBotListV2: () => Promise<import("../Types/index.js").BotListInfo[]>;
    messageMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    receiptMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    appStatePatchMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    notificationMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    upsertMessage: (msg: WAMessage, type: import("../Types/index.js").MessageUpsertType) => Promise<void>;
    appPatch: (patchCreate: import("../Types/index.js").WAPatchCreate) => Promise<void>;
    sendPresenceUpdate: (type: import("../Types/index.js").WAPresence, toJid?: string) => Promise<void>;
    presenceSubscribe: (toJid: string) => Promise<void>;
    profilePictureUrl: (jid: string, type?: "preview" | "image", timeoutMs?: number) => Promise<string | undefined>;
    fetchBlocklist: () => Promise<(string | undefined)[]>;
    fetchStatus: (...jids: string[]) => Promise<import("../WAUSync/index.js").USyncQueryResultList[] | undefined>;
    fetchTextStatus: (...jids: string[]) => Promise<import("../WAUSync/index.js").USyncQueryResultList[] | undefined>;
    fetchDisappearingDuration: (...jids: string[]) => Promise<import("../WAUSync/index.js").USyncQueryResultList[] | undefined>;
    updateProfilePicture: (jid: string, content: WAMediaUpload, dimensions?: {
        width: number;
        height: number;
    }) => Promise<void>;
    findUserId: (pnOrLid: string) => Promise<import("../index.js").UserIdLookup>;
    updatePanoramaProfilePicture: (jid: string, content: WAMediaUpload, opts?: {
        maxWidth?: number;
        quality?: number;
    }) => Promise<void>;
    removeProfilePicture: (jid: string) => Promise<void>;
    updateProfileStatus: (status: string | import("../Types/index.js").TextStatusInput) => Promise<void>;
    updateProfileAbout: (status: string | import("../Types/index.js").TextStatusInput) => Promise<void>;
    updateProfileName: (name: string) => Promise<void>;
    updateBlockStatus: (jid: string, action: "block" | "unblock") => Promise<void>;
    updateDisableLinkPreviewsPrivacy: (isPreviewsDisabled: boolean) => Promise<void>;
    updateCallPrivacy: (value: import("../Types/index.js").WAPrivacyCallValue) => Promise<void>;
    updateMessagesPrivacy: (value: import("../Types/index.js").WAPrivacyMessagesValue) => Promise<void>;
    updateLastSeenPrivacy: (value: import("../Types/index.js").WAPrivacyValue) => Promise<void>;
    updateOnlinePrivacy: (value: import("../Types/index.js").WAPrivacyOnlineValue) => Promise<void>;
    updateProfilePicturePrivacy: (value: import("../Types/index.js").WAPrivacyValue) => Promise<void>;
    updateStatusPrivacy: (value: import("../Types/index.js").WAPrivacyValue) => Promise<void>;
    updateReadReceiptsPrivacy: (value: import("../Types/index.js").WAReadReceiptsValue) => Promise<void>;
    updateGroupsAddPrivacy: (value: import("../Types/index.js").WAPrivacyGroupAddValue) => Promise<void>;
    updateDefaultDisappearingMode: (duration: number) => Promise<void>;
    getBusinessProfile: (jid: string) => Promise<import("../Types/index.js").WABusinessProfile | void>;
    getBroadcastListInfo: (jid: string) => Promise<{
        name?: string;
        recipients: string[];
    }>;
    resyncAppState: (collections: readonly ("critical_unblock_low" | "regular_high" | "regular_low" | "critical_block" | "regular")[], isInitialSync: boolean) => Promise<void>;
    chatModify: (mod: import("../Types/index.js").ChatModification, jid: string) => Promise<void>;
    clearMessage: (jid: string, key: WAMessageKey, timeStamp: number | import("long").default) => Promise<void>;
    deleteChat: (jid: string, key: WAMessageKey, timeStamp: number | import("long").default) => Promise<void>;
    cleanDirtyBits: (type: "account_sync" | "groups", fromTimestamp?: number | string) => Promise<void>;
    addOrEditContact: (jid: string, contact: proto.SyncActionValue.IContactAction) => Promise<void>;
    removeContact: (jid: string) => Promise<void>;
    placeholderResendCache: import("../Types/index.js").CacheStore;
    addLabel: (jid: string, labels: import("../Types/Label.js").LabelActionBody) => Promise<void>;
    addChatLabel: (jid: string, labelId: string) => Promise<void>;
    removeChatLabel: (jid: string, labelId: string) => Promise<void>;
    addMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    removeMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    star: (jid: string, messages: {
        id: string;
        fromMe?: boolean;
    }[], star: boolean) => Promise<void>;
    addOrEditQuickReply: (quickReply: import("../Types/Bussines.js").QuickReplyAction) => Promise<void>;
    removeQuickReply: (timestamp: string) => Promise<void>;
    type: "md";
    ws: import("./Client/websocket.js").WebSocketClient;
    ev: import("../Types/index.js").BaileysEventEmitter & {
        process(handler: (events: Partial<import("../Types/index.js").BaileysEventMap>) => void | Promise<void>): () => void;
        buffer(): void;
        createBufferedFunction<A extends any[], T>(work: (...args: A) => Promise<T>): (...args: A) => Promise<T>;
        flush(): boolean;
        isBuffering(): boolean;
        destroy(): void;
    };
    authState: {
        creds: import("../Types/index.js").AuthenticationCreds;
        keys: import("../Types/index.js").SignalKeyStoreWithTransaction;
    };
    signalRepository: import("../Types/index.js").SignalRepositoryWithLIDStore;
    user: import("../Types/index.js").Contact | undefined;
    generateMessageTag: () => string;
    query: (node: BinaryNode, timeoutMs?: number) => Promise<any>;
    waitForMessage: <T>(msgId: string, timeoutMs?: number | undefined) => Promise<T | undefined>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: Uint8Array | Buffer) => Promise<void>;
    sendNode: (frame: BinaryNode) => Promise<void>;
    logout: (msg?: string) => Promise<void>;
    end: (error: Error | undefined) => Promise<void>;
    registerSocketEndHandler: (handler: (error: Error | undefined) => void | Promise<void>) => void;
    onUnexpectedError: (err: Error | Boom, msg: string) => void;
    uploadPreKeys: (count?: number) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    digestKeyBundle: () => Promise<void>;
    rotateSignedPreKey: () => Promise<void>;
    requestPairingCode: (phoneNumber: string, customPairingCode?: string) => Promise<string>;
    updateServerTimeOffset: ({ attrs }: BinaryNode) => void;
    sendUnifiedSession: () => Promise<void>;
    wamBuffer: import("../index.js").BinaryInfo;
    waitForConnectionUpdate: (check: (u: Partial<import("../Types/index.js").ConnectionState>) => Promise<boolean | undefined>, timeoutMs?: number) => Promise<void>;
    sendWAMBuffer: (wamBuffer: Buffer) => Promise<any>;
    executeUSyncQuery: (usyncQuery: USyncQuery) => Promise<import("../WAUSync/index.js").USyncQueryResult | undefined>;
    onWhatsApp: (...phoneNumber: string[]) => Promise<{
        jid: string;
        exists: boolean;
        lid: string | undefined;
    }[] | undefined>;
    fetchAccountReachoutTimelock: () => Promise<import("../Types/index.js").ReachoutTimelockState>;
    fetchNewChatMessageCap: () => Promise<import("../Types/index.js").NewChatMessageCapInfo>;
};
//# sourceMappingURL=messages-send.d.ts.map