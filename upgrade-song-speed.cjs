const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const file = path.join(process.env.HOME, 'commands/song.js');

if (!fs.existsSync(file)) {
  console.error('❌ ما لقيتش commands/song.js');
  process.exit(1);
}

const backup = file + '.backup-speed-' +
  new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const code = String.raw`'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const yts = require('yt-search');

const activeChats = new Set();

function runYtDlp(args, timeout = 180000) {
    return new Promise((resolve, reject) => {
        execFile('yt-dlp', args, {
            timeout,
            maxBuffer: 2 * 1024 * 1024,
            encoding: 'utf8'
        }, (error, stdout, stderr) => {
            if (error) {
                const detail = String(stderr || error.message || '')
                    .trim().slice(-1000);
                reject(new Error(detail || 'فشل yt-dlp'));
                return;
            }
            const result = String(stdout || '').trim()
                .split(/\r?\n/).filter(Boolean).pop() || '';
            if (!result) {
                reject(new Error('yt-dlp ما رجعش مسار الملف'));
                return;
            }
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
            text: '▰▰ *جـــاري الـتَّـحْـمـيـل أُغْــنِــيَــة* ▰▰ 🎵'
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

        tempDir = await fs.promises.mkdtemp(
            path.join(os.tmpdir(), 'ayoub-song-')
        );

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
            console.log('[SONG] trying direct M4A');

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
            console.log('[SONG] direct M4A unavailable; fallback to MP3:',
                directError.message.slice(0, 300));

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
        const allowedDir = path.resolve(tempDir) + path.sep;

        if (!resolvedAudio.startsWith(allowedDir)) {
            throw new Error('مسار ملف الصوت خارج المجلد المؤقت');
        }

        const stat = await fs.promises.stat(resolvedAudio);

        if (!stat.isFile() || stat.size < 1 ||
            stat.size > 25 * 1024 * 1024) {
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
            ' title=' + String(result.title || query).slice(0, 100));

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
                await fs.promises.rm(tempDir, {
                    recursive: true,
                    force: true
                });
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

  if (check.status !== 0) {
    throw new Error(check.stderr || 'فشل فحص JavaScript');
  }

  const mod = require(file);
  if (mod.name !== 'اغنية' || typeof mod.execute !== 'function') {
    throw new Error('التحقق من المعالج فشل');
  }

  console.log('✅ تم تحديث سرعة معالج الأغنية.');
  console.log('🎵 الأولوية: M4A مباشرة، ثم MP3 احتياطياً.');
  console.log('🛡️ النسخة الاحتياطية:', backup);
  console.log('✅ فحص JavaScript والتحميل ناجح.');
} catch (err) {
  fs.copyFileSync(backup, file);
  console.error('❌ فشل التحديث ورجعت النسخة الاحتياطية.');
  console.error(err.message);
  process.exit(1);
}
