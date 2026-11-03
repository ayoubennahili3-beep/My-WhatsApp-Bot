/**
 * from-chats.ts
 * Source: src/Socket/chats.ts
 *
 * Chat modification helpers ported from baileys.
 * These are imported back into makeChatsSocket.
 */
import Long from 'long';
import type { ChatModification, WAMessageKey } from '../Types/index.js';
/**
 * Build the ChatModification object for clearing/deleting a message (for me)
 * Source: chats.ts → clearMessage
 *
 * @example
 * const mod = buildClearMessageModification(key, timestamp)
 * chatModify(mod, jid)
 */
export declare function buildClearMessageModification(key: WAMessageKey, timeStamp: number | Long): ChatModification;
/**
 * Factory: creates clearMessage bound to chatModify
 * Source: chats.ts → clearMessage
 *
 * @example
 * const { clearMessage } = createChatHelpers(chatModify)
 * await clearMessage(jid, key, timestamp)
 */
export declare function createChatHelpers(chatModify: (mod: ChatModification, jid: string) => Promise<any>): {
    clearMessage: (jid: string, key: WAMessageKey, timeStamp: number | Long) => Promise<any>;
};
//# sourceMappingURL=from-chats.d.ts.map