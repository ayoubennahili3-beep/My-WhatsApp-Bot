import { proto } from '../../WAProto/index.js';
import type { MessageContentGenerationOptions } from '../Types/index.js';
import type { AdminInviteInfo, CallCreationInfo, PaymentInviteInfo, PaymentMessageOptions, StickerPack } from '../Types/Message.js';
/**
 * Build newsletterAdminInviteMessage from adminInvite content
 */
export declare function buildAdminInviteMessage(adminInvite: AdminInviteInfo, contextInfo: any, options: MessageContentGenerationOptions): Promise<proto.Message.INewsletterAdminInviteMessage>;
/**
 * Build scheduledCallCreationMessage from call content, including the
 * 'Call Creation' default title.
 */
export declare function buildCallMessage(call: CallCreationInfo): proto.Message.IScheduledCallCreationMessage;
/**
 * Build paymentInviteMessage from paymentInvite content
 */
export declare function buildPaymentInviteMessage(paymentInvite: PaymentInviteInfo): proto.Message.IPaymentInviteMessage;
/**
 * Build requestPaymentMessage from payment content. `amount` is in the
 * currency's smallest unit (e.g. cents) — both the legacy `amount1000`
 * field and the modern `Money` shape are populated for compatibility.
 */
export declare function buildPaymentMessage(payment: PaymentMessageOptions): proto.Message.IRequestPaymentMessage;
/**
 * Check if buffer is a valid WebP file (magic bytes: RIFF....WEBP)
 * Source: PR #84 rsalcara/InfiniteAPI
 */
export declare function isWebPBuffer(buffer: Buffer): boolean;
/**
 * Detect animated WebP by checking VP8X chunk animation flag
 * Source: PR #84 rsalcara/InfiniteAPI
 */
export declare function isAnimatedWebP(buffer: Buffer): boolean;
/**
 * Detect Lottie/WAS format (gzip-compressed or raw Lottie JSON)
 * WAS = WhatsApp Animated Sticker = gzip-compressed Lottie JSON
 * Source: PR #260 rsalcara/InfiniteAPI
 */
export declare function isLottieBuffer(buffer: Buffer): boolean;
export declare function buildStickerPackMessage(stickerPack: StickerPack, options: MessageContentGenerationOptions): Promise<proto.Message.IStickerPackMessage>;
//# sourceMappingURL=from-messages.d.ts.map