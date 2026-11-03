/**
 * link-preview-extras.ts
 *
 * Adds two things beyond what `generateWAMessageContent`'s base
 * link-preview handling covers:
 *   - `linkPreviewMetadata` — social-post-type / video-duration hints
 *     WhatsApp uses to render richer previews (e.g. Reels).
 *   - `favicon` — a small image shown alongside the preview, separate
 *     from the main high-quality thumbnail.
 *
 * `generateWAMessageContent` calls `applyLinkPreviewMetadata` and
 * `buildFaviconMMSMetadata` at the point it builds the extended-text
 * message content; both are pure/self-contained so they live here rather
 * than inline in that function.
 *
 * `PrepareWAMessageMedia` is a type-only import of `prepareWAMessageMedia`
 * from Utils/messages.ts -- type-only imports are elided at compile time,
 * so this doesn't create a runtime circular import even though
 * Utils/messages.ts imports the runtime functions below from here.
 */
import type { MediaGenerationOptions, WAMediaUpload, WATextMessage, WAUrlInfo } from '../Types/index.js';
import type { prepareWAMessageMedia } from '../Utils/messages.js';
type PrepareWAMessageMedia = typeof prepareWAMessageMedia;
/**
 * Copies `urlInfo.linkPreviewMetadata` onto the extended-text content
 * being built, if present. No-op otherwise.
 */
export declare const applyLinkPreviewMetadata: (extContent: WATextMessage, urlInfo: WAUrlInfo | undefined) => void;
/**
 * Uploads `favicon` (if provided) as a `thumbnail-link` media item and
 * returns the `faviconMMSMetadata` block for it, or `undefined` if no
 * favicon was supplied.
 *
 * Takes `prepareWAMessageMedia` as a parameter rather than importing it
 * directly, to avoid a runtime circular import with Utils/messages.ts
 * (which is where `prepareWAMessageMedia` is defined and where this is
 * called from).
 */
export declare const buildFaviconMMSMetadata: (favicon: WAMediaUpload | undefined, options: MediaGenerationOptions, prepareMedia: PrepareWAMessageMedia) => Promise<WATextMessage["faviconMMSMetadata"] | undefined>;
export {};
//# sourceMappingURL=link-preview-extras.d.ts.map