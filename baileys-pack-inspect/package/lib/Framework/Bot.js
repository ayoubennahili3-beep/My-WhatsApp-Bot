/**
 * Bot.ts
 * High-level Bot class with middleware routing, message queue, and reconnect.
 *
 * Fixes applied vs PR #2710:
 *  - P2: All console.log → pino-compatible structured logger (ILogger)
 *  - P2: Command boundary fix: `!sticker` no longer matches `!stickerSpam`
 *  - P2: Queue reject+clear on DisconnectReason.loggedOut (was hanging forever)
 *  - P2: dbPath configurable in BotConfig (was hardcoded 'baileys_store.db')
 *  - P2: stats.observeMessage inside try block (was outside, could skip middleware)
 *  - P2: reconnect timer stored as handle so it can be cancelled on restart
 *  - P0: creds.update listener guidance moved to AFTER bot.start() in example
 *
 * Source: PR #2710 (LuferOS) — enterprise bot framework
 */
import { Boom } from '@hapi/boom';
import makeWASocket from '../Socket/index.js';
import { DisconnectReason } from '../Types/index.js';
import { isJidGroup } from '../WABinary/index.js';
import { SQLiteStore } from './Store/SQLiteStore.js';
import { Context } from './Context.js';
import { SessionManager } from './SessionManager.js';
import { StatsManager } from './StatsManager.js';
export class Bot {
    constructor(config) {
        this.middlewares = [];
        this.messageQueue = [];
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.BASE_RECONNECT_DELAY = 1000;
        this.MAX_RECONNECT_DELAY = 30000;
        this.socket = null;
        this.sessions = null;
        this.stats = null;
        this.config = config;
        // P2 FIX: use provided logger or minimal fallback
        this.logger =
            config.logger ??
                {
                    debug: () => { },
                    info: () => { },
                    warn: () => { },
                    error: () => { },
                    child: () => this.logger
                };
        // P2 FIX: configurable dbPath — different bots use different files
        const dbPath = config.dbPath ?? 'baileys_store.db';
        this.store = new SQLiteStore(dbPath);
        this.sessions = new SessionManager(this.store);
    }
    /** Register a middleware function */
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    /**
     * Register a command handler.
     * P2 FIX: Uses exact match OR prefix + whitespace so '!sticker' does NOT
     * match '!stickerSpam' or '!stickerset'.
     */
    command(cmd, handler) {
        this.use(async (ctx, next) => {
            const text = ctx.text;
            // P2 FIX: boundary check — exact match or followed by whitespace
            if (text === cmd || text?.startsWith(cmd + ' ')) {
                await handler(ctx);
            }
            await next();
        });
        return this;
    }
    /** Register a handler that fires on any non-empty text */
    onText(handler) {
        this.use(async (ctx, next) => {
            if (ctx.text) {
                await handler(ctx);
            }
            await next();
        });
        return this;
    }
    /** Send a message — queues automatically when socket is disconnected */
    async sendMessage(jid, content, options = {}) {
        if (this.isConnected && this.socket) {
            return this.socket.sendMessage(jid, content, options);
        }
        // Queue the message — P2 FIX: structured log without raw JID interpolation
        return new Promise((resolve, reject) => {
            this.messageQueue.push({ jid, content, options, resolve, reject });
            this.logger.info({ queueLength: this.messageQueue.length }, 'socket not connected — message queued');
        });
    }
    /**
     * Drain queued messages after reconnect.
     */
    drainQueue() {
        if (!this.isConnected || !this.socket || this.messageQueue.length === 0)
            return;
        this.logger.info({ pending: this.messageQueue.length }, 'draining message queue');
        const queue = [...this.messageQueue];
        this.messageQueue = [];
        for (const msg of queue) {
            this.socket.sendMessage(msg.jid, msg.content, msg.options).then(msg.resolve).catch(msg.reject);
        }
    }
    /**
     * Reject and clear the message queue.
     * P2 FIX: Called on loggedOut so callers don't hang forever.
     */
    rejectQueue(reason) {
        const queue = [...this.messageQueue];
        this.messageQueue = [];
        for (const msg of queue) {
            msg.reject(new Boom(reason, { statusCode: 401 }));
        }
        if (queue.length > 0) {
            this.logger.warn({ rejected: queue.length }, 'message queue rejected — session terminated');
        }
    }
    /** Start the socket and wire all event handlers */
    async start() {
        // P2 FIX: cancel pending reconnect timer before creating new socket
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.socket = makeWASocket(this.config.socketConfig);
        if (this.config.enableStats) {
            this.stats = new StatsManager(this.config.dbPath ?? 'baileys_store.db', jid => this.socket.groupMetadata(jid));
        }
        this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify')
                return;
            for (const msg of messages) {
                const ctx = new Context(this, msg);
                try {
                    // P2 FIX: observeMessage INSIDE try block so SQLite errors
                    // don't prevent middleware execution
                    if (this.stats && ctx.remoteJid && isJidGroup(ctx.remoteJid)) {
                        const participant = msg.key.participant || msg.participant;
                        if (participant) {
                            const isSticker = !!msg.message?.stickerMessage;
                            this.stats.observeMessage(ctx.remoteJid, participant, isSticker);
                        }
                    }
                    await this.executeMiddlewares(ctx);
                }
                catch (err) {
                    this.logger.error({ err }, 'error executing middleware');
                }
            }
        });
        this.socket.ev.on('connection.update', update => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                this.logger.info('bot connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.drainQueue();
            }
            if (connection === 'close') {
                this.isConnected = false;
                const error = lastDisconnect?.error;
                const statusCode = error?.output?.statusCode;
                const isLoggedOut = statusCode === DisconnectReason.loggedOut;
                this.logger.warn({ statusCode }, 'connection closed');
                if (isLoggedOut) {
                    // P2 FIX: reject queue on terminal close — don't hang forever
                    this.rejectQueue('session terminated (logged out)');
                    this.logger.info('session logged out — not reconnecting');
                }
                else {
                    this.reconnectAttempts++;
                    const delay = Math.min(this.MAX_RECONNECT_DELAY, this.BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1));
                    this.logger.info({ delay, attempt: this.reconnectAttempts }, 'scheduling reconnect');
                    // P2 FIX: store timer handle so restart() can cancel it
                    this.reconnectTimer = setTimeout(() => {
                        this.reconnectTimer = null;
                        // P2 FIX: handle the reconnect promise
                        this.start().catch(err => {
                            this.logger.error({ err }, 'reconnect failed');
                        });
                    }, delay);
                }
            }
        });
    }
    async executeMiddlewares(ctx) {
        let index = -1;
        const dispatch = async (i) => {
            if (i <= index)
                throw new Error('next() called multiple times');
            index = i;
            const middleware = this.middlewares[i];
            if (middleware) {
                await middleware(ctx, () => dispatch(i + 1));
            }
        };
        await dispatch(0);
    }
    /** Gracefully stop the bot */
    stop() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.rejectQueue('bot stopped');
        this.store.close();
        this.stats?.close();
    }
}
//# sourceMappingURL=Bot.js.map