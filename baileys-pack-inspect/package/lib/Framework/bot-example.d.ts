/**
 * bot-example.ts
 * Example usage of the Enterprise Bot Framework.
 *
 * P0 FIX applied vs PR #2710:
 *   Original code called `bot.socket?.ev.on('creds.update', saveCreds)` BEFORE
 *   `await bot.start()`. At that point `bot.socket` is still `null`, so the
 *   optional chain (`?.`) silently no-ops — the listener never gets registered,
 *   and credentials are never persisted. Every restart forces a fresh QR scan.
 *
 *   Fix: `bot.start()` creates `bot.socket` internally and registers all of its
 *   own listeners (see Bot.ts). Consumers should register `creds.update` AFTER
 *   `start()` resolves, once `bot.socket` is guaranteed to exist.
 *
 * Source: PR #2710 (LuferOS) — fixed for @queenanya/baileys
 */
export {};
//# sourceMappingURL=bot-example.d.ts.map