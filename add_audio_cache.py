#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "commands" / "song.js"
src = FILE.read_text(encoding='utf-8')

# 1. نضيفو مجلد الكاش ديال الصوتيات (نحطوه فين ما كانش)
if "AUDIO_CACHE_DIR" not in src:
    anchor = "const CACHE_DIR = "
    idx = src.find(anchor)
    if idx == -1:
        print("ERROR: CACHE_DIR not found")
        raise SystemExit(1)
    
    # نلقاو نهاية السطر
    end_idx = src.find("\n", idx)
    line = src[idx:end_idx]
    
    # نزيدو السطر الجديد
    new_line = line + "\nconst AUDIO_CACHE_DIR = path.join(os.tmpdir(), 'toji-audio-cache');"
    src = src[:idx] + new_line + src[end_idx:]
    print("✅ تمت إضافة AUDIO_CACHE_DIR")

# 2. نضيفو الدوال المساعدة للكاش
if "async function getCachedAudio" not in src:
    anchor = "async function execute({ sock, from, mek, query }) {"
    helpers = """async function getCachedAudio(hash) {
    const cachePath = path.join(AUDIO_CACHE_DIR, hash + '.m4a');
    if (fs.existsSync(cachePath)) return { path: cachePath, type: 'm4a' };
    const mp3Path = path.join(AUDIO_CACHE_DIR, hash + '.mp3');
    if (fs.existsSync(mp3Path)) return { path: mp3Path, type: 'mp3' };
    return null;
}

async function saveToAudioCache(hash, sourcePath, type) {
    if (!fs.existsSync(AUDIO_CACHE_DIR)) {
        fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
    }
    const destPath = path.join(AUDIO_CACHE_DIR, hash + '.' + type);
    await fs.promises.copyFile(sourcePath, destPath);
    
    // نحافظو على 20 أغنية فقط
    const files = await fs.promises.readdir(AUDIO_CACHE_DIR);
    if (files.length > 20) {
        const stats = await Promise.all(files.map(async (f) => {
            const p = path.join(AUDIO_CACHE_DIR, f);
            const s = await fs.promises.stat(p);
            return { path: p, atime: s.atimeMs };
        }));
        stats.sort((a, b) => a.atime - b.atime);
        const toDelete = stats.slice(0, files.length - 20);
        for (const item of toDelete) {
            try { await fs.promises.unlink(item.path); } catch (_) {}
        }
    }
}

async function execute({ sock, from, mek, query }) {"""
    
    if anchor not in src:
        print("ERROR: execute anchor not found")
        raise SystemExit(1)
    src = src.replace(anchor, helpers, 1)
    print("✅ تمت إضافة الدوال المساعدة")

# 3. نضيفو الكاش فـ بلاصة التحميل
old_download = """        let audioPath;
        let audioType;
        let downloadStart = Date.now();

        try {
            audioPath = await runYtDlp(["""
new_download = """        let audioPath;
        let audioType;
        let downloadStart = Date.now();

        const crypto = require('crypto');
        const audioHash = crypto.createHash('md5').update(result.url).digest('hex');
        const cached = await getCachedAudio(audioHash);

        if (cached) {
            console.log('[SONG] CACHE HIT:', cached.type);
            audioPath = cached.path;
            audioType = cached.type;
        } else {
            try {
                audioPath = await runYtDlp(["""

if old_download not in src:
    print("ERROR: download block not found")
    raise SystemExit(1)
src = src.replace(old_download, new_download, 1)
print("✅ تمت إضافة كود البحث فـ الكاش")

# 4. نسدو البلوك ونحفظو فـ الكاش
old_end = """            audioType = 'm4a';
            console.log('[SONG] direct_m4a_ms=' + (Date.now() - downloadStart));
        } catch (e) {"""
new_end = """                audioType = 'm4a';
                console.log('[SONG] direct_m4a_ms=' + (Date.now() - downloadStart));
                await saveToAudioCache(audioHash, audioPath, 'm4a');
            } catch (e) {"""

if old_end not in src:
    print("ERROR: end block not found")
    raise SystemExit(1)
src = src.replace(old_end, new_end, 1)
print("✅ تمت إضافة حفظ الكاش بعد التحميل")

# 5. نكملو الـ fallback
old_fallback = """            console.log('[SONG] M4A fallback:', e.message.slice(0, 250));
            downloadStart = Date.now();
            audioPath = await runYtDlp([
                ...common,
                '-f', 'bestaudio/best',
                '-x',
                '--audio-format', 'mp3',
                '-o', path.join(tempDir, 'fallback.%(ext)s'),
                '--print', 'after_move:filepath',
                result.url
            ]);
            audioType = 'mp3';
            console.log('[SONG] fallback_mp3_ms=' + (Date.now() - downloadStart));
        }"""
new_fallback = """                console.log('[SONG] M4A fallback:', e.message.slice(0, 250));
                downloadStart = Date.now();
                audioPath = await runYtDlp([
                    ...common,
                    '-f', 'bestaudio/best',
                    '-x',
                    '--audio-format', 'mp3',
                    '-o', path.join(tempDir, 'fallback.%(ext)s'),
                    '--print', 'after_move:filepath',
                    result.url
                ]);
                audioType = 'mp3';
                console.log('[SONG] fallback_mp3_ms=' + (Date.now() - downloadStart));
                await saveToAudioCache(audioHash, audioPath, 'mp3');
            }
        }"""

if old_fallback not in src:
    print("ERROR: fallback block not found")
    raise SystemExit(1)
src = src.replace(old_fallback, new_fallback, 1)
print("✅ تمت إضافة حفظ الكاش بعد fallback")

FILE.write_text(src, encoding='utf-8')
print("DONE: audio cache added")
