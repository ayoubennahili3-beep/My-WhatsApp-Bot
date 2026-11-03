const fs = require('fs');
const path = require('path');

const home = process.env.HOME;
const main = path.join(home, '𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js');
const commandsDir = path.join(home, 'commands');
const songFile = path.join(commandsDir, 'song.js');

if (!fs.existsSync(main)) {
  console.error('❌ ما لقيتش ملف البوت الرئيسي.');
  process.exit(1);
}

let source = fs.readFileSync(main, 'utf8');
const start = source.indexOf('                const songMatch = body.match(');
const end = source.indexOf(
  "                if (command === 'عام' || command === 'خاص')",
  start
);

if (start < 0 || end < 0 || end <= start) {
  console.error('❌ ما قدرتش نحدد حدود أمر الأغنية بأمان. ما تبدل حتى ملف.');
  process.exit(1);
}

if (source.slice(start, end).includes("require(path.join(process.env.HOME, 'commands/song.js'))")) {
  console.error('⚠️ يبدو أن المعالج المستقل مربوط من قبل. أوقف التعديل لتفادي التكرار.');
  process.exit(1);
}

fs.mkdirSync(commandsDir, { recursive: true });

const songSource = String.raw`'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const yts = require('yt-search');

const activeChats = new Set();

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
    let tempDir;
    const started = Date.now();
    let phase = 'البحث';

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

        phase = 'التحميل';
        tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ayoub-song-'));
        const outputTemplate = path.join(tempDir, 'song.%(ext)s');
        const downloadStarted = Date.now();

        const printedPath = await new Promise((resolve, reject) => {
            execFile('yt-dlp', [
                '--js-runtimes', 'node',
                '--remote-components', 'ejs:github',
                '--no-playlist',
                '-f', 'bestaudio/best',
                '-x',
                '--audio-format', 'mp3',
                '--max-filesize', '25M',
                '--no-overwrites',
                '--no-warnings',
                '--quiet',
                '-o', outputTemplate,
                '--print', 'after_move:filepath',
                result.url
            ], {
                timeout: 180000,
                maxBuffer: 2 * 1024 * 1024,
                encoding: 'utf8'
            }, (error, stdout, stderr) => {
                if (error) {
                    const detail = String(stderr || error.message || '').trim().slice(-1000);
                    reject(new Error(detail || 'فشل تحميل الصوت'));
                    return;
                }
                resolve(String(stdout || '').trim().split(/\r?\n/).filter(Boolean).pop() || '');
            });
        });

        console.log('[SONG] download_ms=' + (Date.now() - downloadStarted));

        if (!printedPath) throw new Error('yt-dlp ما رجّعش مسار الملف');

        const audioPath = path.resolve(printedPath);
        const allowedDir = path.resolve(tempDir) + path.sep;

        if (!audioPath.startsWith(allowedDir)) {
            throw new Error('مسار ملف الصوت خارج المجلد المؤقت');
        }

        const stat = await fs.promises.stat(audioPath);
        if (!stat.isFile() || stat.size < 1 || stat.size > 25 * 1024 * 1024) {
            throw new Error('حجم ملف الصوت غير صالح');
        }

        phase = 'إرسال الصوت';
        const audio = await fs.promises.readFile(audioPath);
        const sendStarted = Date.now();

        await sock.sendMessage(from, {
            audio,
            mimetype: 'audio/mpeg',
            fileName: 'song.mp3'
        }, { quoted: mek });

        console.log('[SONG] send_ms=' + (Date.now() - sendStarted));
        console.log('[SONG] total_ms=' + (Date.now() - started) +
            ' title=' + String(result.title || query).slice(0, 100));

    } catch (err) {
        console.error('[SONG ERROR][' + phase + ']', err.stack || err.message);

        try {
            await sock.sendMessage(from, {
                text: '⚠️ تعذّر إكمال ' + phase +
                    '. جرّب أغنية أخرى أو عاود المحاولة لاحقاً.'
            }, { quoted: mek });
        } catch (sendError) {
            console.error('[SONG ERROR] تعذّر إرسال رسالة الخطأ:', sendError.message);
        }
    } finally {
        activeChats.delete(from);

        if (tempDir) {
            try {
                await fs.promises.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('[SONG CLEANUP]', cleanupError.message);
            }
        }
    }
}

module.exports = { name: 'اغنية', execute };
`;

const replacement = String.raw`                const songMatch = body.match(/^[.!]\s*اغنية(?:\s+([\s\S]+))?$/i);
                if (songMatch) {
                    const songHandler = require(path.join(process.env.HOME, 'commands/song.js'));
                    await songHandler.execute({
                        sock,
                        from,
                        mek,
                        query: songMatch[1] || ''
                    });
                    continue;
                }

`;

const backup = main + '.backup-independent-song-' +
  new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

fs.copyFileSync(main, backup);

try {
  fs.writeFileSync(songFile, songSource, 'utf8');
  source = source.slice(0, start) + replacement + source.slice(end);
  fs.writeFileSync(main, source, 'utf8');

  const { spawnSync } = require('child_process');
  for (const file of [songFile, main]) {
    const check = spawnSync(process.execPath, ['--check', file], {
      encoding: 'utf8'
    });
    if (check.status !== 0) {
      throw new Error(check.stderr || 'فشل فحص JavaScript: ' + file);
    }
  }

  console.log('✅ تم فصل أمر الأغنية في ملف مستقل.');
  console.log('📁 المعالج:', songFile);
  console.log('🛡️ النسخة الاحتياطية:', backup);
  console.log('✅ فحص الملفين ناجح.');
  console.log('ℹ️ باقي أوامر البوت وملفات MP3 القديمة لم يتم حذفها.');
} catch (err) {
  fs.copyFileSync(backup, main);
  console.error('❌ وقع خطأ ورجّعت ملف البوت الرئيسي من النسخة الاحتياطية.');
  console.error(err.message);
  process.exit(1);
}
