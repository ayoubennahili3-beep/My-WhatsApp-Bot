#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "commands" / "song.js"
src = FILE.read_text(encoding='utf-8')

# 1. نلقاو فين كاين require('os') ونزيدو الكاش من تما
anchor = "const os = require('os');"
if anchor not in src:
    print("ERROR: os require not found")
    raise SystemExit(1)

if "AUDIO_CACHE_DIR" not in src:
    src = src.replace(anchor, anchor + "\nconst AUDIO_CACHE_DIR = require('path').join(os.tmpdir(), 'toji-audio-cache');", 1)
    print("✅ تمت إضافة AUDIO_CACHE_DIR")

# 2. نضيفو دالة getCachedAudio و saveToAudioCache قبل execute
anchor_exec = "async function execute({ sock, from, mek, query }) {"
if anchor_exec not in src:
    print("ERROR: execute function not found")
    raise SystemExit(1)

if "async function getCachedAudio" not in src:
    helpers = """async function getCachedAudio(hash) {
    const cachePath = require('path').join(AUDIO_CACHE_DIR, hash + '.m4a');
    if (require('fs').existsSync(cachePath)) return { path: cachePath, type: 'm4a' };
    const mp3Path = require('path').join(AUDIO_CACHE_DIR, hash + '.mp3');
    if (require('fs').existsSync(mp3Path)) return { path: mp3Path, type: 'mp3' };
    return null;
}

async function saveToAudioCache(hash, sourcePath, type) {
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(AUDIO_CACHE_DIR)) {
        fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
    }
    const destPath = path.join(AUDIO_CACHE_DIR, hash + '.' + type);
    await fs.promises.copyFile(sourcePath, destPath);
    
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

"""
    src = src.replace(anchor_exec, helpers + anchor_exec, 1)
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
