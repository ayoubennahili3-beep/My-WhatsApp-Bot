#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "commands" / "song.js"
src = FILE.read_text(encoding='utf-8')

# 1. نضيفو مجلد الكاش فوق
old_req = "const yts = require('yt-search');"
new_req = """const yts = require('yt-search');
const CACHE_DIR = path.join(os.tmpdir(), 'toji-song-cache');"""
if old_req not in src:
    print("ERROR: yts require not found")
    raise SystemExit(1)
src = src.replace(old_req, new_req, 1)

# 2. نعدلو دالة makeCard باش تشوف الكاش الأول
old_makecard = """async function makeCard(title, channel, duration) {
    const bg = path.join(__dirname, 'bloody.png');
    const renderer = path.join(__dirname, 'render-song-card.py');
    const output = path.join(os.tmpdir(),
        'toji-card-' + process.pid + '-' + Date.now() + '.png');
    try {
        await new Promise((resolve, reject) => {
            execFile('python', [
                renderer, bg,
                String(title || 'غير معروف'),
                String(channel || 'غير معروف'),
                String(duration || 'غير معروف'),
                output
            ], { timeout: 30000, maxBuffer: 1024 * 1024 },
            (error) => error ? reject(error) : resolve());
        });
        return await fs.promises.readFile(output);
    } finally {
        try { await fs.promises.unlink(output); } catch (_) {}
    }
}"""

new_makecard = """async function makeCard(title, channel, duration) {
    const bg = path.join(__dirname, 'bloody.png');
    const renderer = path.join(__dirname, 'render-song-card.py');
    
    // إنشاء مجلد الكاش إذا ما كانش
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    // إنشاء اسم ملف فريد بناءً على النص
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(title + channel + duration).digest('hex');
    const cachePath = path.join(CACHE_DIR, hash + '.png');

    // إذا كانت الصورة موجودة فـ الكاش، نرجعوها فوراً
    if (fs.existsSync(cachePath)) {
        return await fs.promises.readFile(cachePath);
    }

    // إذا ما كانتش، نرسموها ونحفظوها فـ الكاش
    const output = path.join(os.tmpdir(),
        'toji-card-' + process.pid + '-' + Date.now() + '.png');
    try {
        await new Promise((resolve, reject) => {
            execFile('python', [
                renderer, bg,
                String(title || 'غير معروف'),
                String(channel || 'غير معروف'),
                String(duration || 'غير معروف'),
                output
            ], { timeout: 30000, maxBuffer: 1024 * 1024 },
            (error) => error ? reject(error) : resolve());
        });
        
        const buffer = await fs.promises.readFile(output);
        // نحفظو الصورة فـ الكاش للمرات الجاية
        await fs.promises.writeFile(cachePath, buffer);
        return buffer;
    } finally {
        try { await fs.promises.unlink(output); } catch (_) {}
    }
}"""

if old_makecard not in src:
    print("ERROR: makeCard function not found")
    raise SystemExit(1)
src = src.replace(old_makecard, new_makecard, 1)

FILE.write_text(src, encoding='utf-8')
print("DONE: cache logic added")
