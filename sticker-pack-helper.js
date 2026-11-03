const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { zip } = require('fflate');
const pino = require('pino');

const {
  encryptedStream,
  generateMessageIDV2,
  unixTimestampSeconds,
  proto
} = require('@whiskeysockets/baileys');

const logger = pino({ level: 'silent' });

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest();
}

function zipBuffer(files) {
  return new Promise((resolve, reject) => {
    zip(files, (err, data) => {
      if (err) return reject(err);
      resolve(Buffer.from(data));
    });
  });
}

async function sendStickerPack(sock, jid, pack) {
  if (!sock?.waUploadToServer || !sock?.relayMessage) {
    throw new Error('نسخة Baileys لا توفر دوال الرفع والإرسال المطلوبة');
  }

  if (!pack || !Array.isArray(pack.stickers) || !pack.stickers.length) {
    throw new Error('خاص الحزمة تحتوي على ستيكرات');
  }

  if (pack.stickers.length > 60) {
    throw new Error('الحد الأقصى هو 60 ستيكر');
  }

  if (!pack.cover) {
    throw new Error('خاص صورة غلاف للحزمة');
  }

  const stickers = [];
  const zipFiles = {};

  for (let i = 0; i < pack.stickers.length; i++) {
    const item = pack.stickers[i];
    if (!item?.data) throw new Error(`الستيكر رقم ${i + 1} ما عندوش بيانات`);

    const webp = await sharp(Buffer.from(item.data))
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    if (webp.length > 1024 * 1024) {
      throw new Error(`الستيكر رقم ${i + 1} أكبر من 1MB`);
    }

    const hash = sha256(webp);
    const fileName = hash.toString('base64').replace(/\//g, '-') + '.webp';

    zipFiles[fileName] = [new Uint8Array(webp), { level: 0 }];

    stickers.push({
      fileName,
      mimetype: 'image/webp',
      fileSha256: hash,
      isAnimated: false,
      emojis: item.emojis || ['🙂'],
      accessibilityLabel: item.accessibilityLabel || `Sticker ${i + 1}`
    });
  }

  const cover = await sharp(Buffer.from(pack.cover))
    .resize(512, 512, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  zipFiles['cover.webp'] = [new Uint8Array(cover), { level: 0 }];

  const zipData = await zipBuffer(zipFiles);
  const encryptedPack = await encryptedStream(zipData, 'sticker-pack', { logger });

  try {
    const upload = await sock.waUploadToServer(encryptedPack.encFilePath, {
      mediaType: 'sticker-pack',
      fileEncSha256B64: encryptedPack.fileEncSha256.toString('base64'),
      timeoutMs: 120000
    });

    const thumb = await sharp(cover)
      .resize(252, 252, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const encryptedThumb = await encryptedStream(thumb, 'thumbnail-sticker-pack', { logger, mediaKey: encryptedPack.mediaKey });

    try {
      const thumbUpload = await sock.waUploadToServer(encryptedThumb.encFilePath, {
        mediaType: 'thumbnail-sticker-pack',
        fileEncSha256B64: encryptedThumb.fileEncSha256.toString('base64'),
        timeoutMs: 120000
      });

      const packMessage = proto.Message.StickerPackMessage.fromObject({
        name: pack.name || 'Sticker Pack',
        publisher: pack.publisher || 'AHMED BOT',
        packDescription: pack.description || '',
        stickerPackId: generateMessageIDV2(),
        stickerPackOrigin: proto.Message.StickerPackMessage.StickerPackOrigin.USER_CREATED,
        stickerPackSize: zipData.length,
        stickers,
        fileSha256: encryptedPack.fileSha256,
        fileEncSha256: encryptedPack.fileEncSha256,
        mediaKey: encryptedPack.mediaKey,
        directPath: upload.directPath,
        fileLength: encryptedPack.fileLength,
        mediaKeyTimestamp: unixTimestampSeconds(),
        trayIconFileName: 'cover.webp',
        thumbnailDirectPath: thumbUpload.directPath,
        thumbnailSha256: encryptedThumb.fileSha256,
        thumbnailEncSha256: encryptedThumb.fileEncSha256,
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash: sha256(cover)
      });

      return await sock.relayMessage(
        jid,
        { stickerPackMessage: packMessage },
        { messageId: generateMessageIDV2() }
      );
    } finally {
      if (encryptedThumb.encFilePath) {
        await fs.promises.unlink(encryptedThumb.encFilePath).catch(() => {});
      }
    }
  } finally {
    if (encryptedPack.encFilePath) {
      await fs.promises.unlink(encryptedPack.encFilePath).catch(() => {});
    }
  }
}

module.exports = { sendStickerPack };
