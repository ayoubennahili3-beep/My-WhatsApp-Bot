import { randomBytes } from 'crypto';
import { delay, generateWAMessage, generateWAMessageFromContent } from '../Utils/index.js';
import { getUrlInfo } from '../Utils/link-preview.js';
import { isJidGroup, isPnUser, jidNormalizedUser, STORIES_JID } from '../WABinary/index.js';
export const STATUS_BROADCAST_JID = 'status@broadcast';
export const STATUS_BACKGROUNDS = {
    solid: {
        green: '#25D366',
        blue: '#34B7F1',
        purple: '#8B5CF6',
        red: '#EF4444',
        orange: '#F97316',
        yellow: '#EAB308',
        pink: '#EC4899',
        teal: '#14B8A6',
        gray: '#6B7280',
        black: '#000000',
        white: '#FFFFFF'
    },
    gradient: {
        sunset: ['#F97316', '#EF4444'],
        ocean: ['#3B82F6', '#06B6D4'],
        forest: ['#22C55E', '#10B981'],
        purple: ['#8B5CF6', '#EC4899'],
        midnight: ['#1E3A8A', '#4C1D95'],
        aurora: ['#06B6D4', '#8B5CF6', '#EC4899']
    }
};
export const STATUS_FONTS = {
    SANS_SERIF: 0,
    SERIF: 1,
    NORICAN: 2,
    BRYNDAN: 3,
    BEBASNEUE: 4,
    OSWALD: 5,
    DAMION: 6,
    DANCING: 7,
    COMFORTAA: 8,
    EXOTWO: 9
};
export const generateStatusMessageId = () => `4NY4W3B${randomBytes(16).toString('hex').toUpperCase()}`;
export const getStatusJid = () => STATUS_BROADCAST_JID;
// ── Status content builders ────────────────────────────────────────────────
export const createTextStatus = (options) => ({
    text: options.text,
    backgroundColor: options.backgroundColor || STATUS_BACKGROUNDS.solid.green,
    font: options.font ?? STATUS_FONTS.SANS_SERIF,
    textColor: options.textColor || '#FFFFFF',
    contextInfo: { mentionedJid: options.mentions || [], isForwarded: false }
});
export const createImageStatus = (media, options) => ({
    image: typeof media === 'string' ? { url: media } : media,
    caption: options?.caption || ''
});
export const createVideoStatus = (media, options) => ({
    video: typeof media === 'string' ? { url: media } : media,
    caption: options?.caption || '',
    gifPlayback: options?.gifPlayback || false
});
export const createAudioStatus = (media, options) => ({
    audio: typeof media === 'string' ? { url: media } : media,
    ptt: true,
    mimetype: 'audio/ogg; codecs=opus',
    waveform: options?.waveform
});
export const StatusHelper = {
    text: (text, backgroundColor, font) => createTextStatus({ text, backgroundColor, font }),
    image: (buffer, caption) => createImageStatus(buffer, { caption }),
    imageUrl: (url, caption) => createImageStatus(url, { caption }),
    video: (buffer, caption) => createVideoStatus(buffer, { caption }),
    videoUrl: (url, caption) => createVideoStatus(url, { caption }),
    gif: (buffer, caption) => createVideoStatus(buffer, { caption, gifPlayback: true }),
    voiceNote: (buffer) => createAudioStatus(buffer),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send: async (sock, content, jidList = []) => {
        if (!jidList || jidList.length === 0) {
            console.warn('StatusHelper: jidList is empty.');
        }
        const groups = jidList.filter(j => j?.endsWith('@g.us'));
        const individuals = jidList.filter(j => j?.endsWith('@s.whatsapp.net') || j?.endsWith('@lid'));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let lastResult;
        if (groups.length > 0) {
            // Ship BOTH field placements defensively:
            //  - `groupStatus: true` (top-level) — this is the one WA's
            //    server is confirmed to expect.
            //  - `isGroupStatus: true` (nested in contextInfo) — the original
            //    queenanya field/placement, kept alongside in case any code
            //    path (older WA client versions, other tooling) reads it from
            //    there instead. Harmless extra data if unused.
            const groupContent = {
                ...content,
                groupStatus: true,
                contextInfo: { ...content.contextInfo, isGroupStatus: true }
            };
            for (const groupJid of groups) {
                lastResult = await sock.sendMessage(groupJid, groupContent, { messageId: generateStatusMessageId() });
            }
        }
        if (individuals.length > 0 || jidList.length === 0) {
            const result = await sock.sendMessage(STATUS_BROADCAST_JID, content, {
                statusJidList: individuals.length > 0 ? individuals : undefined,
                messageId: generateStatusMessageId()
            });
            if (!lastResult)
                lastResult = result;
        }
        return lastResult;
    }
};
const _getRandomHexColor = () => '#' +
    Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
/**
 * Addon factory — send a WhatsApp Status/Story and tag specific users or groups.
 * Resolves group participants automatically.
 *
 * @example
 * const addon = makeStatusMentionsAddon({ authState, logger, relayMessage, ... })
 * return { ...sock, ...addon }
 *
 * // Usage:
 * await sock.sendStatusMentions(
 *     { text: 'Hello!', backgroundColor: '#25D366' },
 *     ['1234567890@s.whatsapp.net', '120363xxx@g.us']
 * )
 */
export const makeStatusMentionsAddon = (ctx) => {
    const { authState, logger, linkPreviewImageThumbnailWidth, axiosOptions, relayMessage, waUploadToServer, groupMetadata, cachedGroupMetadata, config } = ctx;
    const sendStatusMentions = async (content, jids = []) => {
        const userJid = jidNormalizedUser(authState.creds.me.id);
        const allUsers = new Set();
        allUsers.add(userJid);
        for (const id of jids) {
            if (isJidGroup(id)) {
                try {
                    const metadata = (cachedGroupMetadata ? await cachedGroupMetadata(id) : undefined) || (await groupMetadata(id));
                    metadata.participants.map(p => jidNormalizedUser(p.id)).forEach(j => allUsers.add(j));
                }
                catch (error) {
                    logger.error(`Error getting metadata for group ${id}: ${error}`);
                }
            }
            else if (isPnUser(id)) {
                allUsers.add(jidNormalizedUser(id));
            }
        }
        const uniqueUsers = Array.from(allUsers);
        const isMedia = !!(content.image || content.video || content.audio);
        const isAudio = !!content.audio;
        const messageContent = { ...content };
        if (isMedia && !isAudio) {
            if (messageContent.text) {
                messageContent.caption = messageContent.text;
                delete messageContent.text;
            }
            delete messageContent.ptt;
            delete messageContent.font;
            delete messageContent.backgroundColor;
            delete messageContent.textColor;
        }
        if (isAudio) {
            delete messageContent.text;
            delete messageContent.caption;
            delete messageContent.font;
            delete messageContent.textColor;
        }
        const font = !isMedia ? (content.font ?? Math.floor(Math.random() * 9)) : undefined;
        const textColor = !isMedia ? content.textColor || _getRandomHexColor() : undefined;
        const backgroundColor = !isMedia || isAudio ? content.backgroundColor || _getRandomHexColor() : undefined;
        const ptt = isAudio ? (typeof content.ptt === 'boolean' ? content.ptt : true) : undefined;
        let msg;
        try {
            msg = await generateWAMessage(STORIES_JID, messageContent, {
                logger,
                userJid,
                getUrlInfo: (text) => getUrlInfo(text, {
                    thumbnailWidth: linkPreviewImageThumbnailWidth,
                    fetchOpts: { timeout: 3000, ...(axiosOptions || {}) },
                    logger
                }),
                upload: async (encFilePath, opts) => {
                    const res = await waUploadToServer(encFilePath, { ...opts });
                    return {
                        mediaUrl: res.url ?? '',
                        directPath: res.directPath ?? '',
                        handle: res.handle,
                        mediaKey: res.mediaKey,
                        fileEncSha256: res.fileEncSha256,
                        fileSha256: res.fileSha256,
                        fileLength: res.fileLength
                    };
                },
                mediaCache: config.mediaCache,
                options: config.options,
                ...(font !== undefined && { font }),
                ...(textColor && { textColor }),
                ...(backgroundColor && { backgroundColor }),
                ...(ptt !== undefined && { ptt })
            });
        }
        catch (error) {
            logger.error(`Error generating status message: ${error}`);
            throw error;
        }
        await relayMessage(STORIES_JID, msg.message, {
            messageId: msg.key.id,
            statusJidList: uniqueUsers,
            additionalNodes: [
                {
                    tag: 'meta',
                    attrs: {},
                    content: [
                        {
                            tag: 'mentioned_users',
                            attrs: {},
                            content: jids.map(jid => ({ tag: 'to', attrs: { jid: jidNormalizedUser(jid) } }))
                        }
                    ]
                }
            ]
        });
        for (const id of jids) {
            try {
                const normalizedId = jidNormalizedUser(id);
                const isPrivate = isPnUser(normalizedId);
                const type = isPrivate ? 'statusMentionMessage' : 'groupStatusMentionMessage';
                const protocolMessage = {
                    [type]: { message: { protocolMessage: { key: msg.key, type: 25 } } },
                    messageContextInfo: { messageSecret: randomBytes(32) }
                };
                const statusMsg = await generateWAMessageFromContent(normalizedId, protocolMessage, { userJid });
                await relayMessage(normalizedId, statusMsg.message, {
                    additionalNodes: [
                        {
                            tag: 'meta',
                            attrs: isPrivate ? { is_status_mention: 'true' } : { is_group_status_mention: 'true' }
                        }
                    ]
                });
                await delay(2000);
            }
            catch (error) {
                logger.error(`Error sending status mention to ${id}: ${error}`);
            }
        }
    };
    return { sendStatusMentions };
};
//# sourceMappingURL=status-posting.js.map