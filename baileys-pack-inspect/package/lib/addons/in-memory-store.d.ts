/**
 * addon: in-memory-store
 *
 * A minimal in-memory data store for chats, contacts, and messages —
 * reintroduced for developers who want a quick starting point without
 * building their own persistence layer from scratch.
 *
 * Important: for anything beyond quick prototyping, build your own store.
 * Keeping someone's entire chat history in memory is a lot of RAM for
 * not much benefit once your bot has real usage.
 */
import type { BaileysEventEmitter, Chat, Contact, WAMessage } from '../Types/index.js';
import type { ILogger } from '../Utils/logger.js';
export type InMemoryStoreConfig = {
    logger?: ILogger;
    /** max messages retained per chat (default: 200) */
    maxMessagesPerChat?: number;
};
/** Minimal KeyedDB-like wrapper so `.all()` reads naturally, like the old Baileys store. */
declare class KeyedCollection<T extends Record<string, any>> {
    private keyFn;
    private map;
    constructor(keyFn: (item: T) => string);
    all(): T[];
    get(id: string): T | undefined;
    upsert(...items: T[]): void;
    update(...items: Partial<T>[]): void;
    delete(id: string): void;
    toJSON(): T[];
    fromJSON(items: T[]): void;
}
export type InMemoryStore = {
    chats: KeyedCollection<Chat>;
    contacts: {
        [jid: string]: Contact;
    };
    messages: Map<string, WAMessage[]>;
    bind: (ev: BaileysEventEmitter) => void;
    readFromFile: (path: string) => void;
    writeToFile: (path: string) => void;
    loadMessages: (jid: string, count: number) => WAMessage[];
    loadMessage: (jid: string, id: string) => WAMessage | undefined;
};
export declare const makeInMemoryStore: (config?: InMemoryStoreConfig) => InMemoryStore;
export {};
//# sourceMappingURL=in-memory-store.d.ts.map