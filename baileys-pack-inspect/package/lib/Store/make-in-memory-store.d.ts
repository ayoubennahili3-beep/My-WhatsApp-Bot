import type { Logger } from 'pino';
import { proto } from '../../WAProto/index.js';
import type { BaileysEventEmitter, Chat, Contact, GroupMetadata, PresenceData, WAMessage, WAMessageCursor, WAMessageKey } from '../Types/index.js';
import type { Label } from '../Types/Label.js';
import type { LabelAssociation } from '../Types/LabelAssociation.js';
import { ObjectRepository } from './object-repository.js';
export type BaileysInMemoryStoreConfig = {
    logger?: Logger;
};
export declare const waChatKey: (pin: boolean) => {
    key: (c: Chat) => string;
    compare: (k1: string, k2: string) => number;
};
export declare const waMessageID: (m: WAMessage) => string;
export declare const waLabelAssociationKey: {
    key: (la: LabelAssociation) => string;
    compare: (k1: string, k2: string) => number;
};
/**
 * Simple in-memory store that subscribes to Baileys events and keeps
 * chats, contacts, messages, groups, presences, and labels up to date.
 *
 * @example
 * const store = makeInMemoryStore({})
 * store.readFromFile('./baileys_store.json')
 * setInterval(() => store.writeToFile('./baileys_store.json'), 10_000)
 * store.bind(sock.ev)
 */
export declare const makeInMemoryStore: (config: BaileysInMemoryStoreConfig) => {
    chats: {
        [id: string]: Chat;
    };
    contacts: {
        [id: string]: Contact;
    };
    messages: {
        [jid: string]: {
            array: WAMessage[];
            dict: {
                [id: string]: WAMessage;
            };
            get: (id: string) => WAMessage | undefined;
            upsert: (item: WAMessage, mode: "append" | "prepend") => void;
            updateAssign: (id: string, update: Partial<WAMessage>) => boolean;
            remove: (item: WAMessage) => boolean;
            clear: () => void;
            filter: (predicate: (item: WAMessage) => boolean) => void;
            toJSON: () => WAMessage[];
            fromJSON: (items: WAMessage[]) => void;
        };
    };
    groupMetadata: {
        [id: string]: GroupMetadata;
    };
    presences: {
        [id: string]: {
            [participant: string]: PresenceData;
        };
    };
    labels: ObjectRepository<Label>;
    labelAssociations: LabelAssociation[];
    bind: (ev: BaileysEventEmitter) => void;
    loadMessages: (jid: string, count: number, cursor: WAMessageCursor) => Promise<WAMessage[]>;
    loadMessage: (jid: string, id: string) => Promise<WAMessage | undefined>;
    mostRecentMessage: (jid: string) => Promise<WAMessage | undefined>;
    getMessage: (key: WAMessageKey) => Promise<proto.IMessage | undefined>;
    fetchGroupMetadata: (jid: string, sock: {
        groupMetadata(jid: string): Promise<GroupMetadata>;
    } | null) => Promise<GroupMetadata | undefined>;
    getChatLabels: (chatId: string) => LabelAssociation[];
    getMessageLabels: (messageId: string) => string[];
    toJSON: () => {
        chats: Chat[];
        contacts: {
            [id: string]: Contact;
        };
        messages: {
            [k: string]: WAMessage[];
        };
        labels: Label[];
        labelAssociations: LabelAssociation[];
    };
    fromJSON: (json: {
        chats?: Chat[];
        contacts?: {
            [id: string]: Contact;
        };
        messages?: {
            [jid: string]: proto.IWebMessageInfo[];
        };
        labels?: Label[];
        labelAssociations?: LabelAssociation[];
    }) => void;
    writeToFile: (path: string) => void;
    readFromFile: (path: string) => void;
};
//# sourceMappingURL=make-in-memory-store.d.ts.map