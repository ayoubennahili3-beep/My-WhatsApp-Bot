const crypto = require('crypto');
const sharp = require('sharp');

function decodeUrl(s) {
  return s.replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\\u003c/g, '<');
}

async function searchImages(character) {
  const queries = [
    'site:pinterest.com ' + character,
    character + ' images photos',
    character + ' pictures'
  ];
  const urls = [];
  const seen = new Set();

  for (const q of queries) {
    for (const first of [1, 36, 71]) {
      try {
        const page = 'https://www.bing.com/images/search?q=' +
          encodeURIComponent(q) + '&first=' + first;
        const res = await fetch(page, {
          headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36' },
          signal: AbortSignal.timeout(20000)
        });
        if (!res.ok) continue;
        const html = await res.text();
        const re = /\bm="([^"]+)"/g;
        let m;
        while ((m = re.exec(html))) {
          try {
            const data = JSON.parse(decodeUrl(m[1]));
            const url = new URL(data.murl).href;
            if (!/^https?:$/.test(new URL(url).protocol) || seen.has(url)) continue;
            seen.add(url);
            urls.push(url);
          } catch {}
        }
        console.log('🔎 روابط الصور حتى الآن:', urls.length);
        if (urls.length >= 100) return urls;
      } catch {}
    }
  }
  return urls;
}
async function buildPack(character) {
  const urls = await searchImages(character);
  const stickers = [];
  const hashes = new Set();

  for (const url of urls) {
    if (stickers.length >= 30) break;
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(12000)
      });
      if (!res.ok) continue;
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) continue;

      const len = Number(res.headers.get('content-length') || 0);
      if (len > 4 * 1024 * 1024) continue;
      const data = Buffer.from(await res.arrayBuffer());
      if (data.length < 5000 || data.length > 4 * 1024 * 1024) continue;

      const meta = await sharp(data, { failOn: 'none', limitInputPixels: 40000000 }).metadata();
      if (!meta.width || !meta.height || meta.width < 80 || meta.height < 80) continue;

      const webp = await sharp(data, { failOn: 'none', limitInputPixels: 40000000 })
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 70 }).toBuffer();
      const hash = crypto.createHash('sha256').update(webp).digest('hex');
      if (hashes.has(hash)) continue;
      hashes.add(hash);
      stickers.push({ data: webp, emojis: ['✨'], accessibilityLabel: `${character} ${stickers.length + 1}` });
      console.log(`تم تنزيل ${stickers.length}/30`);
    } catch {}
  }

  if (stickers.length < 30) {
    throw new Error(`وجدت ${stickers.length} صورة صالحة فقط من ${urls.length} رابطًا؛ لم أرسل حزمة ناقصة.`);
  }

  return {
    name: `${character} Sticker Pack`,
    publisher: 'AHMED BOT',
    description: `30 صور للشخصية ${character}`,
    cover: stickers[0].data,
    stickers
  };
}

module.exports = { buildPack };
