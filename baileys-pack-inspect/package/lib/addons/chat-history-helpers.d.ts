/**
 * addon: chat-history-helpers
 *
 * Small convenience helpers that were referenced as "implement this on your
 * end" stubs elsewhere (getLastMessageInChat / getOldestMessageInChat /
 * copyNForward). This addon provides real implementations, built on top of
 * this fork's SimpleInMemoryStore and the existing
 * generateForwardMessageContent utility.
 */
import type { WAMessage } from '../Types/index.js';
import type { AnyMediaMessageContent, WAMediaUploadFunction } from '../Types/Message.js';
import type { InMemoryStore } from './in-memory-store.js';
/**
 * Get the most recently stored message in a chat.
 * Requires a SimpleInMemoryStore instance (see makeSimpleInMemoryStore) that
 * has been kept in sync with `messages.upsert` events for this chat.
 */
export declare const getLastMessageInChat: (store: InMemoryStore, jid: string) => WAMessage | undefined;
/**
 * Get the oldest stored message in a chat (useful as the `oldestMsgKey`
 * cursor for `sock.fetchMessageHistory(...)`, which pages backwards from it).
 * Requires a SimpleInMemoryStore instance kept in sync with `messages.upsert`.
 */
export declare const getOldestMessageInChat: (store: InMemoryStore, jid: string) => WAMessage | undefined;
/**
 * Re-send ("copy-forward") an existing message to a (possibly different) jid.
 * Thin wrapper around generateForwardMessageContent + sock.sendMessage —
 * strips the original sender's quoting/context the same way WhatsApp's own
 * "Forward" action does, and marks the copy as forwarded.
 *
 * Usage: await copyNForward(sock, targetJid, originalMessage)
 */
export declare const copyNForward: (sock: {
    sendMessage: (jid: string, content: unknown) => Promise<WAMessage | undefined>;
}, jid: string, message: WAMessage, forceForward?: boolean) => Promise<WAMessage | undefined>;
/**
 * Upload media directly to WhatsApp's own encrypted media CDN and get back
 * a ready-to-send message-content object (with mediaKey, url/directPath,
 * fileEncSha256, etc).
 *
 * IMPORTANT: WhatsApp clients only accept media that lives on WhatsApp's own
 * CDN, encrypted with a mediaKey the recipient can derive — there is no way
 * to point a WAMessage at an arbitrary third-party URL and have it render.
 * This wrapper does the real, official upload (same path prepareWAMessageMedia
 * / sock.waUploadToServer use internally) — it does not accept or return an
 * arbitrary external URL.
 *
 * Usage: const media = await uploadMediaToWhatsApp(sock, { image: buffer })
 *        await sock.sendMessage(jid, media)
 */
export declare const uploadMediaToWhatsApp: (sock: {
    waUploadToServer: WAMediaUploadFunction;
}, message: AnyMediaMessageContent, opts?: {
    logger?: import("../Utils/logger.js").ILogger;
    mediaTypeOverride?: import("../Defaults/index.js").MediaType;
}) => Promise<import("../index.js").proto.Message>;
//# sourceMappingURL=chat-history-helpers.d.ts.map