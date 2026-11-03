#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "commands" / "song.js"
src = FILE.read_text(encoding='utf-8')

# الكود القديم اللي كيصيفط الصورة
old_block = """            const card = await makeCard(title, channel, duration);
            await sock.sendMessage(from, {
                image: card,
                mimetype: 'image/png',
                caption: ''
            }, { quoted: mek });"""

# الكود الجديد اللي كيزيد الكابسيون
new_block = """            const card = await makeCard(title, channel, duration);
            await sock.sendMessage(from, {
                image: card,
                mimetype: 'image/png',
                caption: '🌹 𝐀𝐘𝐎𝐔𝐁 𝐁𝐎𝐓 | 𝐀𝐈 𝐈𝐌𝐀𝐆𝐄\\n\\n⏳ *Downloading audio...*'
            }, { quoted: mek });"""

if old_block not in src:
    print("ERROR: block not found")
    raise SystemExit(1)

src = src.replace(old_block, new_block, 1)
FILE.write_text(src, encoding='utf-8')
print("DONE: caption added")
