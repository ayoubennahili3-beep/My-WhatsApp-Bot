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
import makeWASocket from '../Socket/index.js';
import type { AnyMessageContent, MiscMessageGenerationOptions, SocketConfig } from '../Types/index.js';
import type { ILogger } from '../Utils/logger.js';
import { Context } from './Context.js';
import { SessionManager } from './SessionManager.js';
import { StatsManager } from './StatsManager.js';
export type MiddlewareFn = (ctx: Context, next: () => Promise<void>) => Promise<void> | void;
export type BotConfig = {
    /** makeWASocket config */
    socketConfig: Partial<SocketConfig>;
    /** Path for the SQLite database — defaults to 'baileys_store.db'
     *  P2 FIX: configurable so multiple Bot instances don't share state */
    dbPath?: string;
    /** Enable group analytics (StatsManager) */
    enableStats?: boolean;
    /** Pino-compatible logger — P2 FIX: required, no console.log fallback */
    logger?: ILogger;
};
type WASocket = ReturnType<typeof makeWASocket>;
type SendMessageReturn = ReturnType<WASocket['sendMessage']>;
export declare class Bot {
    private middlewares;
    private messageQueue;
    private isConnected;
    private reconnectAttempts;
    private reconnectTimer;
    private readonly BASE_RECONNECT_DELAY;
    private readonly MAX_RECONNECT_DELAY;
    socket: WASocket | null;
    sessions: SessionManager | null;
    stats: StatsManager | null;
    private readonly config;
    private readonly logger;
    private readonly store;
    constructor(config: BotConfig);
    /** Register a middleware function */
    use(middleware: MiddlewareFn): this;
    /**
     * Register a command handler.
     * P2 FIX: Uses exact match OR prefix + whitespace so '!sticker' does NOT
     * match '!stickerSpam' or '!stickerset'.
     */
    command(cmd: string, handler: (ctx: Context) => Promise<void> | void): this;
    /** Register a handler that fires on any non-empty text */
    onText(handler: (ctx: Context) => Promise<void> | void): this;
    /** Send a message — queues automatically when socket is disconnected */
    sendMessage(jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions): Promise<Awaited<SendMessageReturn>>;
    /**
     * Drain queued messages after reconnect.
     */
    private drainQueue;
    /**
     * Reject and clear the message queue.
     * P2 FIX: Called on loggedOut so callers don't hang forever.
     */
    private rejectQueue;
    /** Start the socket and wire all event handlers */
    start(): Promise<void>;
    private executeMiddlewares;
    /** Gracefully stop the bot */
    stop(): void;
}
export {};
//# sourceMappingURL=Bot.d.ts.map