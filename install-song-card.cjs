const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const file = path.join(process.env.HOME, 'commands/song.js');
if (!fs.existsSync(file)) {
  console.error('❌ ما لقيتش commands/song.js');
  process.exit(1);
}

try {
  require.resolve('sharp');
} catch {
  console.error('❌ مكتبة sharp ما لقيتهاش. ما تبدل حتى ملف.');
  process.exit(1);
}

const backup = file + '.backup-card-' +
  new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const code = String.raw`'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const yts = require('yt-search');
const sharp = require('sharp');

const activeChats = new Set();

function xml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function shorten(value, max = 52) {
    const s = String(value || 'غير معروف').replace(/\s+/g, ' ').trim();
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function makeCard(title, channel, duration, status) {
    const safeTitle = xml(shorten(title, 66));
    const safeChannel = xml(shorten(channel, 44));
    const safeDuration = xml(duration || 'غير معروف');
    const safeStatus = xml(status || 'جاري تحميل الأغنية...');

    const svg = `<svg width="1080" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#080510"/>
          <stop offset="55%" stop-color="#18052f"/>
          <stop offset="100%" stop-color="#030208"/>
        </linearGradient>
        <linearGradient id="neon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="50%" stop-color="#e879f9"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="1080" height="720" rx="32" fill="url(#bg)"/>
      <g opacity=".18" stroke="#a855f7" stroke-width="2">
        <path d="M0 100 L1080 560 M0 250 L1080 710 M120 0 L900 720"/>
        <circle cx="870" cy="140" r="110" fill="none"/>
        <circle cx="870" cy="140" r="145" fill="none"/>
      </g>
      <rect x="28" y="28" width="1024" height="664" rx="28"
        fill="none" stroke="url(#neon)" stroke-width="3"/>
      <text x="540" y="91" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="36" font-weight="bold"
        fill="#f3e8ff">TOJI FUSHIGURO</text>
      <text x="540" y="132" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="22" letter-spacing="8"
        fill="#c084fc">A U D I O   S E A R C H</text>
      <path d="M80 158 H1000" stroke="url(#neon)" stroke-width="3"/>
      <g transform="translate(105 210)" filter="url(#glow)">
        <circle cx="90" cy="90" r="82" fill="#120822" stroke="#a855f7" stroke-width="4"/>
        <circle cx="90" cy="90" r="61" fill="none" stroke="#d8b4fe" stroke-width="3"/>
        <circle cx="90" cy="90" r="13" fill="#c084fc"/>
        <path d="M90 28 V62 M90 118 V152 M28 90 H62 M118 90 H152
          M46 46 L68 68 M112 112 L134 134 M134 46 L112 68 M68 112 L46 134"
          stroke="#c084fc" stroke-width="5" stroke-linecap="round"/>
        <path d="M65 82 V50 Q90 30 115 50 V82 H101 V57 Q90 49 79 57 V82 Z"
          fill="#f5d0fe"/>
      </g>
      <text x="310" y="225" font-family="Arial,sans-serif"
        font-size="25" fill="#c084fc">العنوان</text>
      <text x="310" y="270" font-family="Arial,sans-serif"
        font-size="29" font-weight="bold" fill="#ffffff">${safeTitle}</text>
      <path d="M310 294 H970" stroke="#6b21a8" stroke-width="2"/>
      <text x="310" y="338" font-family="Arial,sans-serif"
        font-size="25" fill="#c084fc">القناة</text>
      <text x="310" y="378" font-family="Arial,sans-serif"
        font-size="27" fill="#f5f3ff">${safeChannel}</text>
      <path d="M310 400 H970" stroke="#6b21a8" stroke-width="2"/>
      <text x="310" y="443" font-family="Arial,sans-serif"
        font-size="25" fill="#c084fc">المدة</text>
      <text x="410" y="443" font-family="Arial,sans-serif"
        font-size="27" fill="#ffffff">${safeDuration}</text>
      <g transform="translate(75 495)" fill="url(#neon)" filter="url(#glow)">
        <rect x="0" y="48" width="12" height="25" rx="5"/>
        <rect x="24" y="28" width="12" height="45" rx="5"/>
        <rect x="48" y="8" width="12" height="65" rx="5"/>
        <rect x="72" y="34" width="12" height="39" rx="5"/>
        <rect x="96" y="0" width="12" height="73" rx="5"/>
        <rect x="120" y="25" width="12" height="48" rx="5"/>
        <rect x="144" y="42" width="12" height="31" rx="5"/>
        <rect x="168" y="16" width="12" height="57" rx="5"/>
        <rect x="192" y="35" width="12" height="38" rx="5"/>
        <rect x="216" y="5" width="12" height="68" rx="5"/>
      </g>
      <rect x="335" y="506" width="665" height="76" rx="18"
        fill="#10051d" stroke="#a855f7" stroke-width="2"/>
      <text x="667" y="551" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="28" font-weight="bold"
        fill="#f5d0fe">${safeStatus}</text>
      <text x="540" y="635" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="25" letter-spacing="4"
        fill="#c084fc">M U S I C  •  P O W E R  •  F O R E V E R</text>
    </svg>`;

    return sharp(Buffer.from(svg)).png().toBuffer();
}

function runYtDlp(args, timeout = 180000) {
    return new Promise((resolve, reject) => {
        execFile('yt-dlp', args, {
            timeout,
            maxBuffer: 2 * 1024 * 1024,
            encoding: 'utf8'
        }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(String(stderr || error.message || '')
                    .trim().slice(-1000) || 'فشل yt-dlp'));
                return;
            }
            const result = String(stdout || '').trim()
                .split(/\r?\n/).filter(Boolean).pop() || '';
            if (!result) return reject(new Error('ما رجعش مسار الملف'));
            resolve(result);
        });
    });
}

async function execute({ sock, from, mek, query }) {
    query = String(query || '').trim();

    if (!query) {
        await sock.sendMessage(from, {
            text: '🎵 اكتب اسم الأغنية بعد الأمر .اغنية'
        }, { quoted: mek });
        return;
    }

    if (activeChats.has(from)) {
        await sock.sendMessage(from, {
            text: '⏳ كاين تحميل أغنية آخر فهاد المحادثة، تسنّى حتى يسالي.'
        }, { quoted: mek });
        return;
    }

    activeChats.add(from);
    const started = Date.now();
    let tempDir;

    try {
        await sock.sendMessage(from, {
            text: '🔎 كنقلب على الأغنية...'
        }, { quoted: mek });

        const searchStarted = Date.now();
        const search = await yts(query);
        const result = search?.videos?.find(v => v && v.url);

        console.log('[SONG] search_ms=' + (Date.now() - searchStarted));

        if (!result) {
            await sock.sendMessage(from, {
                text: '❌ ما لقيتش نتيجة مناسبة. جرّب اسم الأغنية مع اسم الفنان.'
            }, { quoted: mek });
            return;
        }

        const title = result.title || query;
        const channel = result.author?.name || result.author || 'غير معروف';
        const duration = result.timestamp || 'غير معروف';

        try {
            const card = await makeCard(title, channel, duration, 'جاري تحميل الأغنية...');
            await sock.sendMessage(from, {
                image: card,
                mimetype: 'image/png',
                caption: '🎧 *AUDIO SEARCH*\n> 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐'
            }, { quoted: mek });
        } catch (cardError) {
            console.error('[SONG CARD ERROR]', cardError.stack || cardError.message);
            await sock.sendMessage(from, {
                text: '🎵 جاري تحميل الأغنية: ' + shorten(title, 120)
            }, { quoted: mek });
        }

        tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'toji-song-'));
        const commonArgs = [
            '--js-runtimes', 'node',
            '--remote-components', 'ejs:github',
            '--no-playlist',
            '--no-warnings',
            '--quiet',
            '-N', '4',
            '--max-filesize', '25M'
        ];

        let audioPath;
        let audioType;
        let downloadStarted = Date.now();

        try {
            audioPath = await runYtDlp([
                ...commonArgs,
                '-f', 'bestaudio[ext=m4a]',
                '-o', path.join(tempDir, 'direct.%(ext)s'),
                '--print', 'after_move:filepath',
                result.url
            ]);
            audioType = 'm4a';
            console.log('[SONG] direct_m4a_ms=' + (Date.now() - downloadStarted));
        } catch (directError) {
            console.log('[SONG] M4A fallback:', directError.message.slice(0, 250));
            downloadStarted = Date.now();
            audioPath = await runYtDlp([
                ...commonArgs,
                '-f', 'bestaudio/best',
                '-x',
                '--audio-format', 'mp3',
                '-o', path.join(tempDir, 'fallback.%(ext)s'),
                '--print', 'after_move:filepath',
                result.url
            ]);
            audioType = 'mp3';
            console.log('[SONG] fallback_mp3_ms=' + (Date.now() - downloadStarted));
        }

        const resolvedAudio = path.resolve(audioPath);
        if (!resolvedAudio.startsWith(path.resolve(tempDir) + path.sep)) {
            throw new Error('مسار ملف الصوت خارج المجلد المؤقت');
        }

        const stat = await fs.promises.stat(resolvedAudio);
        if (!stat.isFile() || stat.size < 1 || stat.size > 25 * 1024 * 1024) {
            throw new Error('حجم ملف الصوت غير صالح');
        }

        const audio = await fs.promises.readFile(resolvedAudio);
        const sendStarted = Date.now();

        await sock.sendMessage(from, {
            audio,
            mimetype: audioType === 'm4a' ? 'audio/mp4' : 'audio/mpeg',
            fileName: audioType === 'm4a' ? 'song.m4a' : 'song.mp3'
        }, { quoted: mek });

        console.log('[SONG] format=' + audioType +
            ' bytes=' + stat.size +
            ' send_ms=' + (Date.now() - sendStarted) +
            ' total_ms=' + (Date.now() - started) +
            ' title=' + shorten(title, 100));

    } catch (err) {
        console.error('[SONG ERROR]', err.stack || err.message);
        try {
            await sock.sendMessage(from, {
                text: '⚠️ تعذّر جلب الصوت. جرّب لاحقاً أو اختار أغنية أخرى.'
            }, { quoted: mek });
        } catch (sendError) {
            console.error('[SONG ERROR] send:', sendError.message);
        }
    } finally {
        activeChats.delete(from);
        if (tempDir) {
            try {
                await fs.promises.rm(tempDir, { recursive: true, force: true });
            } catch (err) {
                console.error('[SONG CLEANUP]', err.message);
            }
        }
    }
}

module.exports = { name: 'اغنية', execute };
`;

fs.copyFileSync(file, backup);

try {
  fs.writeFileSync(file, code, 'utf8');
  const check = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8'
  });

  if (check.status !== 0) throw new Error(check.stderr || 'فشل فحص JavaScript');

  delete require.cache[require.resolve(file)];
  const mod = require(file);
  if (mod.name !== 'اغنية' || typeof mod.execute !== 'function') {
    throw new Error('المعالج غير صالح');
  }

  console.log('✅ تم تركيب بطاقة الأغنية الديناميكية.');
  console.log('👑 الهوية: 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐');
  console.log('🎵 العنوان والقناة والمدة تتبدل حسب نتيجة البحث.');
  console.log('⚡ تم الحفاظ على M4A السريع والرجوع إلى MP3.');
  console.log('🛡️ النسخة الاحتياطية:', backup);
  console.log('✅ فحص JavaScript ناجح.');
} catch (err) {
  fs.copyFileSync(backup, file);
  console.error('❌ فشل التعديل، رجعت النسخة الاحتياطية.');
  console.error(err.message);
  process.exit(1);
}
