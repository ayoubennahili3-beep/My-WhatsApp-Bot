/**
 * Copies `urlInfo.linkPreviewMetadata` onto the extended-text content
 * being built, if present. No-op otherwise.
 */
export const applyLinkPreviewMetadata = (extContent, urlInfo) => {
    if (urlInfo?.linkPreviewMetadata) {
        extContent.linkPreviewMetadata = urlInfo.linkPreviewMetadata;
    }
};
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
export const buildFaviconMMSMetadata = async (favicon, options, prepareMedia) => {
    if (!favicon) {
        return undefined;
    }
    const { imageMessage: faviconImage } = await prepareMedia({ image: favicon }, { ...options, mediaTypeOverride: 'thumbnail-link' });
    if (!faviconImage) {
        return undefined;
    }
    return {
        thumbnailDirectPath: faviconImage.directPath,
        mediaKey: faviconImage.mediaKey,
        mediaKeyTimestamp: faviconImage.mediaKeyTimestamp,
        thumbnailWidth: faviconImage.width,
        thumbnailHeight: faviconImage.height,
        thumbnailSha256: faviconImage.fileSha256,
        thumbnailEncSha256: faviconImage.fileEncSha256
    };
};
//# sourceMappingURL=link-preview-extras.js.map