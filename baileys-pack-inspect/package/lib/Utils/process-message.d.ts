import { proto } from '../../WAProto/index.js';
import type { AuthenticationCreds, BaileysEventEmitter, CacheStore, SignalKeyStoreWithTransaction, SignalRepositoryWithLIDStore, SocketConfig, WAMessage, WAMessageKey } from '../Types/index.js';
import type { ILogger } from './logger.js';
type ProcessMessageContext = {
    shouldProcessHistoryMsg: boolean;
    placeholderResendCache?: CacheStore;
    creds: AuthenticationCreds;
    keyStore: SignalKeyStoreWithTransaction;
    ev: BaileysEventEmitter;
    logger?: ILogger;
    options: RequestInit;
    signalRepository: SignalRepositoryWithLIDStore;
    getMessage: SocketConfig['getMessage'];
};
/** Cleans a received message to further processing */
export declare const cleanMessage: (message: WAMessage, meId: string, meLid: string) => void;
export declare const isRealMessage: (message: WAMessage) => boolean;
export declare const shouldIncrementChatUnread: (message: WAMessage) => boolean;
/**
 * Get the ID of the chat from the given key.
 * Typically -- that'll be the remoteJid, but for broadcasts, it'll be the participant
 */
export declare const getChatId: ({ remoteJid, participant, fromMe }: WAMessageKey) => string;
type PollContext = {
    /** normalised jid of the person that created the poll */
    pollCreatorJid: string;
    /** ID of the poll creation message */
    pollMsgId: string;
    /** poll creation message enc key */
    pollEncKey: Uint8Array;
    /** jid of the person that voted */
    voterJid: string;
};
type EventContext = {
    /** normalised jid of the person that created the event */
    eventCreatorJid: string;
    /** ID of the event creation message */
    eventMsgId: string;
    /** event creation message enc key */
    eventEncKey: Uint8Array;
    /** jid of the person that responded */
    responderJid: string;
};
/**
 * Decrypt a poll vote
 * @param vote encrypted vote
 * @param ctx additional info about the poll required for decryption
 * @returns list of SHA256 options
 */
export declare function decryptPollVote({ encPayload, encIv }: proto.Message.IPollEncValue, { pollCreatorJid, pollMsgId, pollEncKey, voterJid }: PollContext): proto.Message.PollVoteMessage & proto.Message.PollVoteMessage.$Properties;
/**
 * Decrypt an event response
 * @param response encrypted event response
 * @param ctx additional info about the event required for decryption
 * @returns event response message
 */
export declare function decryptEventResponse({ encPayload, encIv }: proto.Message.IPollEncValue, { eventCreatorJid, eventMsgId, eventEncKey, responderJid }: EventContext): proto.Message.EventResponseMessage & proto.Message.EventResponseMessage.$Properties;
type EditContext = {
    /** normalised jid of the person that sent the original (pre-edit) message */
    originalSenderJid: string;
    /** ID of the original message */
    originalMsgId: string;
    /** original message's enc key (messageContextInfo.messageSecret) */
    editEncKey: Uint8Array;
    /** jid of the person that sent the edit */
    editorJid: string;
};
/**
 * Decrypt an E2EE message edit envelope (`secretEncryptedMessage` with
 * `secretEncType: MESSAGE_EDIT`, new in 2026-05). Replaces the older
 * `protocolMessage.editedMessage` path for direct text edits.
 *
 * Same HKDF-style derivation as decryptEventResponse/decryptPollVote above:
 *   info = msgId || origSenderJid || editorJid || "Message Edit"
 *   aad  = (empty)              <-- differs from Poll Vote / Event Response
 *   key  = HKDF-SHA256(salt=zeros, ikm=messageSecret, info, L=32)
 *
 * The decrypted plaintext is a regular `proto.Message` whose
 * `protocolMessage.editedMessage` field holds the new content — same
 * shape as the legacy edit path, so consumers can treat the result
 * identically.
 *
 * @param edit encrypted edit payload (encPayload + encIv from SecretEncryptedMessage)
 * @param ctx info about the original message required for decryption
 * @returns decoded outer Message whose protocolMessage.editedMessage carries the new content
 */
export declare function decryptMessageEdit({ encPayload, encIv }: proto.Message.IPollEncValue, { originalSenderJid, originalMsgId, editEncKey, editorJid }: EditContext): proto.Message & proto.Message.$Shape;
declare const processMessage: (message: WAMessage, { shouldProcessHistoryMsg, placeholderResendCache, ev, creds, signalRepository, keyStore, logger, options, getMessage }: ProcessMessageContext) => Promise<void>;
export default processMessage;
//# sourceMappingURL=process-message.d.ts.map