/**
 * anya-bail — src/addons
 * Queen-Anya structure with WS-patched features merged in
 *
 * Quick reference:
 *   Button sender         → sendButtons, sendInteractiveMessage, sendListMessage ...
 *   Anti-delete           → MessageStore, createAntiDeleteHandler, createMessageStoreHandler
 *   Scheduler             → MessageScheduler, ScheduledMessageStatus, createMessageScheduler
 *   Auto-reply            → AutoReplyHandler, createAutoReply
 *   vCard                 → generateVCard, createContactCard, quickContact
 *   Status                → createTextStatus, createImageStatus, StatusHelper (TextStatusOptions, MediaStatusOptions)
 *   Status mentions       → makeStatusMentionsAddon → sendStatusMentions
 *   Templates             → TemplateManager, renderTemplate, PRESET_TEMPLATES
 *   JID utils             → parseJid, plotJid, JidPlotterWithMapping, createJidPlotter
 *   JID plot              → JidPlot, buildJidPlot, resolveJidPlot
 *   Message utils         → getMediaType, getMessageType, getButtonType, getButtonArgs
 *   Message WS extras     → buildMentionContextInfo, patchMessageForMdIfRequired,
 *                           prepareAlbumMessageContent, normalizeMediaInput
 *   Socket extras         → makeMessageExtrasAddon → profilePictureUrl, getEphemeralGroup
 *   Message search        → MessageType, RegexSearchOptions, searchMessages,
 *                           searchMessagesRegex, MessageSearchManager, createMessageSearch
 *   Interactive msgs      → generateInteractiveButtonMessage, generateTemplateMessage,
 *                           generateNativeFlowMessage, generateCombinedButtons ...
 *   Call handler          → makeCallHandlerAddon → initiateCall, acceptCall, muteCall ...
 *   Generics extras       → asciiDecode, getPlatformId, printQRIfNecessaryListener
 *   Rich response         → sendTable, sendList, sendCodeBlock, sendLatex ...
 *   Link preview          → applyLinkPreviewMetadata, buildFaviconMMSMetadata
 *   Newsletter roles      → emitNewsletterRoleUpdate (promote/demote)
 *   Find user ID          → findUserId (resolve PN/LID jid to both forms)
 *   Scheduler             → schedule, cancelScheduled, listScheduled ...
 *   Auth state            → useSingleFileAuthState, useMongoFileAuthState
 *   In-memory store       → makeInMemoryStore
 *   Typing indicator      → createTypingIndicator
 *   Read receipt control  → createReadReceiptController
 *
 *   From src/ re-exports (Anya originals):
 *     from-chats.ts         → chat socket helpers
 *     from-messages-recv.ts → messages-recv helpers
 *     from-messages-send.ts → StatusMentionDeps, normalizeStatusContent, buildStatusMentionNode
 *     from-messages.ts      → message content builders (buttons, stickers, albums...)
 *
 * NOTE: The following patch features are baked directly into Socket/Utils source:
 *   pairing-fix         → src/Socket/socket.ts
 *   browser-presets     → src/Utils/browser-utils.ts + src/Socket/socket.ts
 *   lid-support         → src/WABinary/jid-utils.ts
 *   outgoing-calls      → src/Socket/chats.ts + src/Socket/messages-recv.ts
 *   mex-linked-profiles → src/Socket/messages-recv.ts
 *   past-participants   → src/Utils/history.ts + src/Utils/event-buffer.ts
 *   privacy-tokens      → src/Socket/messages-send.ts
 *   stickerpack         → src/addons/from-messages.ts (buildStickerPackMessage)
 */
// ── Button Sender ──────────────────────────────────────────────────────────
export * from './button-sender.js';
// ── Anti-Delete ────────────────────────────────────────────────────────────
export * from './anti-delete.js';
// ── Auto-Reply ────────────────────────────────────────────────────────────
export * from './auto-reply.js';
// ── vCard / Contact Cards ─────────────────────────────────────────────────
export * from './vcard.js';
// ── Status Posting + Mentions ─────────────────────────────────────────────
export * from './status-posting.js';
// status-helpers.ts is kept in this folder as a pure, unmodified-scope
// alternate implementation (no StatusMentions extras) — but its 12 core functions
// (createTextStatus, createImageStatus, StatusHelper, etc.) are exact
// duplicates of what status-posting.ts already exports. Per policy: when a
// cloned file's functions already exist in an exported file, the clone is
// kept for reference/audit purposes but is NOT itself re-exported here.
// ── Message Templates ─────────────────────────────────────────────────────
export * from './templates.js';
// ── JID Plotting (anya-bail) ──────────────────────────────────────────────
export * from './jid-plotting.js';
// ── JID Plot ───────────────────────────────────────────────────────────────
export * from './jid-plot.js';
// ── Message Utils + WS Extras + Socket Extras ─────────────────────────────
export * from './message-utils.js';
// ── Message Composer (Rich / Bot / Meta AI messages) ──────────────────────
export * from './message-composer.js';
// ── Message Search ────────────────────────────────────────────────────────
export * from './message-search.js';
// ── Interactive / Button Message Generators ───────────────────────────────
export * from './interactive-message.js';
// interactive-message-basic.ts is kept in this folder as a pure, unmodified-
// scope alternate implementation — same 8 functions
// (generateInteractiveButtonMessage, generateInteractiveListMessage,
// generateTemplateMessage, generateNativeFlowMessage, generateCopyCodeButton,
// generateUrlButtonMessage, generateQuickReplyButtons,
// generateCombinedButtons) as interactive-message.ts already exports (which
// adds full TS param/return types on top but no behavior changes). Per
// policy: when a cloned file's functions already exist in an exported file,
// the clone is kept for reference/audit purposes but is NOT itself
// re-exported here.
// ── Call Handler ──────────────────────────────────────────────────────────
export * from './call-handler.js';
// ── Scheduler (anya-bail) ─────────────────────────────────────────────────
export * from './scheduling.js';
// ── Message Scheduler (alternate implementation) ──────────────────────────
export * from './message-scheduler.js';
// ── Rich Response ──────────────────────────────────────────────────────────
export * from './rich-response.js';
export * from './rich-message-utils.js';
// bot-forwarded-message.ts is kept in this folder as a pure, unmodified-scope
// earlier version of the same botForwardedMessage/unifiedResponse logic —
// rich-message-utils.ts's toUnified/wrapToBotForwardedMessage/
// prepareRichResponseMessage/etc. are a superset (adds richResponse content
// normalization on top). Per policy: when a cloned file's functions already
// exist in an exported file, the clone is kept for reference/audit purposes
// but is NOT itself re-exported here.
// ── From src/ (Anya originals) ────────────────────────────────────────────
export * from './from-chats.js';
export * from './from-messages-recv.js';
export * from './from-messages-send.js';
export * from './from-messages.js';
// ── Auth State — re-exported from src/Utils (canonical location) ───────────
export { useSingleFileAuthState } from '../Utils/use-single-file-auth-state.js';
export { useMongoFileAuthState } from '../Utils/use-mongo-file-auth-state.js';
export { migrateAuthState } from '../Utils/migrate-auth-state.js';
export * from './use-sqlite-auth-state.js';
export * from './use-cache-manager-auth-state.js';
// ── In-Memory Store ────────────────────────────────────────────────────────
export * from '../Store/index.js';
// ── Typing Indicator ───────────────────────────────────────────────────────
export * from './chat-control.js';
// ── Read Receipt Controller ────────────────────────────────────────────────
// ── Pinned Messages & Disappearing Message Durations ───────────────────────
// ── Lock Manager ────────────────────────────────────────────────────────────
export { makeLockManager } from '../Utils/lock-manager.js';
// ── Baileys Event Stream ────────────────────────────────────────────────────
export * from './baileys-event-stream.js';
// ── Lightweight In-Memory Store (addon variant, aliased to avoid clashing
//    with Store/make-in-memory-store.ts's makeInMemoryStore) ────────────────
export { makeInMemoryStore as makeSimpleInMemoryStore } from './in-memory-store.js';
// ── Chat History Helpers (getLastMessageInChat / getOldestMessageInChat / copyNForward) ──
export * from './chat-history-helpers.js';
// ── Sticker Pack (PR shell + alternate full builder + convertToWebP) ──
export * from './stickerpack.js';
// ── Jimp Profile-Picture Generators + Setters (full/panoramic + square) ────
export * from './media-messages.js';
export * from './media-set.js';
// ── VoIP Calling (vendored port of baileys-caller, standalone WA session) ──
export * from './voip-calling.js';
// ── Link Preview Extras — linkPreviewMetadata + favicon ────────────────────
export * from './link-preview-extras.js';
// ── Newsletter Role Updates — promote/demote event emission ────────────────
export * from './newsletter-role-updates.js';
// ── Find User ID — resolve a PN/LID jid to both forms ──────────────────────
export * from './find-user-id.js';
// ── Past Participants — process history-sync pastParticipants into a
//    structured, easy-to-use shape ─────────────────────────────────────────
export * from './past-participants.js';
//# sourceMappingURL=index.js.map