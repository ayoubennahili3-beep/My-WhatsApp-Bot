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
import { MediaManager } from './MediaManager.js';
export class Context {
    constructor(bot, message) {
        this.bot = bot;
        this.message = message;
    }
    get remoteJid() {
        return this.message.key.remoteJid;
    }
    /**
     * P2 FIX: Also extracts text from image/video captions so commands like
     * `!sticker` sent as a caption on an image are properly matched.
     */
    get text() {
        return (this.message.message?.conversation ||
            this.message.message?.extendedTextMessage?.text ||
            // P2 FIX: media captions
            this.message.message?.imageMessage?.caption ||
            this.message.message?.videoMessage?.caption ||
            this.message.message?.documentMessage?.caption ||
            undefined);
    }
    get quoted() {
        return this.message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    }
    // P2 FIX: unknown default generics for session methods
    session() {
        return this.bot.sessions?.get(this.remoteJid || '');
    }
    setSession(data) {
        this.bot.sessions?.set(this.remoteJid || '', data);
    }
    updateSession(updater) {
        this.bot.sessions?.update(this.remoteJid || '', updater);
    }
    clearSession() {
        this.bot.sessions?.delete(this.remoteJid || '');
    }
    async reply(content, options) {
        // Silently returning here would make a caller believe the reply went
        // out when it never did — throw instead so the failure is visible.
        if (!this.remoteJid)
            throw new Error('Cannot reply: remoteJid is undefined');
        await this.bot.sendMessage(this.remoteJid, {
            ...content
            // inject quoted context so WA shows as a reply
        }, {
            quoted: this.message,
            ...options
        });
    }
    async react(emoji) {
        if (!this.remoteJid)
            throw new Error('Cannot react: remoteJid is undefined');
        await this.bot.sendMessage(this.remoteJid, {
            react: { text: emoji, key: this.message.key }
        });
    }
    async replySticker(inputPathOrBuffer, metadata) {
        if (!this.remoteJid)
            throw new Error('Cannot reply: remoteJid is undefined');
        const buffer = await MediaManager.convertToSticker(inputPathOrBuffer, metadata);
        await this.reply({ sticker: buffer });
    }
    async replyVoiceNote(inputPathOrBuffer) {
        if (!this.remoteJid)
            throw new Error('Cannot reply: remoteJid is undefined');
        const buffer = await MediaManager.convertToVoiceNote(inputPathOrBuffer);
        await this.reply({
            audio: buffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        });
    }
}
//# sourceMappingURL=Context.js.map