/**
 * Context.ts
 * Message context helper — wraps a WAMessage with reply, react, session, and media helpers.
 *
 * Fixes applied vs PR #2710:
 *  - P1: `import makeWASocket` → `import type makeWASocket` (verbatimModuleSyntax)
 *  - P2: text getter now includes imageMessage.caption and videoMessage.caption
 *        so bot.command('!sticker') fires when user sends image with that caption.
 *  - P2: Session generics default to `unknown` not `any`.
 *  - P2: reply/react/replySticker/replyVoiceNote throw when remoteJid is
 *        missing instead of silently no-op'ing, so callers don't assume a
 *        message went out when it never did.
 *
 * Source: PR #2710 (LuferOS) — enterprise bot framework
 */
import type makeWASocket from '../Socket/index.js';
import type { AnyMessageContent, MiscMessageGenerationOptions, WAMessage } from '../Types/index.js';
import type { Bot } from './Bot.js';
import { type StickerMetadata } from './MediaManager.js';
export type WASocket = ReturnType<typeof makeWASocket>;
export declare class Context {
    readonly message: WAMessage;
    readonly bot: Bot;
    constructor(bot: Bot, message: WAMessage);
    get remoteJid(): string | null | undefined;
    /**
     * P2 FIX: Also extracts text from image/video captions so commands like
     * `!sticker` sent as a caption on an image are properly matched.
     */
    get text(): string | undefined;
    get quoted(): WAMessage['message'];
    session<T = unknown>(): T | undefined;
    setSession<T = unknown>(data: T): void;
    updateSession<T = unknown>(updater: (prev: T | undefined) => T): void;
    clearSession(): void;
    reply(content: AnyMessageContent, options?: MiscMessageGenerationOptions): Promise<void>;
    react(emoji: string): Promise<void>;
    replySticker(inputPathOrBuffer: string | Buffer, metadata?: StickerMetadata): Promise<void>;
    replyVoiceNote(inputPathOrBuffer: string | Buffer): Promise<void>;
}
//# sourceMappingURL=Context.d.ts.map