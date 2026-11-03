/**
 * newsletter-role-updates.ts
 *
 * Builds and emits `newsletter-participants.update` events for
 * `NotificationNewsletterAdminPromote` / `NotificationNewsletterAdminDemote`
 * mex newsletter notifications.
 *
 * `NotificationNewsletterAdminDemote` was routed to
 * `handleLegacyMexNewsletterNotification` (see the opName switch in
 * Socket/messages-recv.ts) but had no case of its own there, so every
 * demotion fell through to the "unhandled mex newsletter notification"
 * default and never emitted an event. `emitNewsletterRoleUpdate` covers
 * both promote and demote from one place so that gap can't reopen.
 *
 * Also carries forward an author/user empty-string fallback for cases
 * where the server omits them, so downstream consumers don't have to
 * separately guard against undefined.
 */
import type { BaileysEventEmitter } from '../Types/index.js';
export type NewsletterRoleUpdateAction = 'promote' | 'demote';
/**
 * `updates` comes from `JSON.parse`d mex notification content, so it's
 * untyped at the call site; each entry is expected to carry `jid` and
 * `user` when it represents a role change.
 */
export declare const emitNewsletterRoleUpdate: (ev: BaileysEventEmitter, updates: Array<{
    jid?: string;
    user?: string;
}>, author: string | undefined, action: NewsletterRoleUpdateAction) => void;
//# sourceMappingURL=newsletter-role-updates.d.ts.map