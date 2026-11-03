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
export * from './button-sender.js';
export * from './anti-delete.js';
export * from './auto-reply.js';
export * from './vcard.js';
export * from './status-posting.js';
export * from './templates.js';
export * from './jid-plotting.js';
export * from './jid-plot.js';
export * from './message-utils.js';
export * from './message-composer.js';
export * from './message-search.js';
export * from './interactive-message.js';
export * from './call-handler.js';
export * from './scheduling.js';
export * from './message-scheduler.js';
export * from './rich-response.js';
export * from './rich-message-utils.js';
export * from './from-chats.js';
export * from './from-messages-recv.js';
export * from './from-messages-send.js';
export * from './from-messages.js';
export { useSingleFileAuthState } from '../Utils/use-single-file-auth-state.js';
export { useMongoFileAuthState } from '../Utils/use-mongo-file-auth-state.js';
export { migrateAuthState } from '../Utils/migrate-auth-state.js';
export * from './use-sqlite-auth-state.js';
export * from './use-cache-manager-auth-state.js';
export * from '../Store/index.js';
export * from './chat-control.js';
export { makeLockManager } from '../Utils/lock-manager.js';
export * from './baileys-event-stream.js';
export { makeInMemoryStore as makeSimpleInMemoryStore, type InMemoryStore as SimpleInMemoryStore, type InMemoryStoreConfig as SimpleInMemoryStoreConfig } from './in-memory-store.js';
export * from './chat-history-helpers.js';
export * from './stickerpack.js';
export * from './media-messages.js';
export * from './media-set.js';
export * from './voip-calling.js';
export * from './link-preview-extras.js';
export * from './newsletter-role-updates.js';
export * from './find-user-id.js';
export * from './past-participants.js';
//# sourceMappingURL=index.d.ts.map