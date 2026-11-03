#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "commands" / "song.js"
src = FILE.read_text(encoding='utf-8')

# 1. تعديل الكابسيون باش يولي فيه غير الزخرفة والاسم
old_caption = """caption: '🌹 𝐀𝐘𝐎𝐔𝐁 𝐁𝐎𝐓 | 𝐀𝐈 𝐈𝐌𝐀𝐆𝐄\\n\\n⏳ *Downloading audio...*'"""
new_caption = """caption: '🌹 𝐀𝐘𝐎𝐔𝐁 𝐁𝐎𝐓 | 𝐓𝐎𝐉𝐈 𝐒𝐎𝐍𝐆'"""

if old_caption not in src:
    print("ERROR: caption block not found")
    raise SystemExit(1)
src = src.replace(old_caption, new_caption, 1)

# 2. اختصار العنوان باش ياخد غير اسم الأغنية الحقيقي
old_title = """        const title = result.title || query;"""
new_title = """        // نختصرو العنوان باش نحيّدو القنوات والتفاصيل الزايدة
        let cleanTitle = result.title || query;
        cleanTitle = cleanTitle.split('|')[0].split(' - ')[0].split('(')[0].trim();
        const title = cleanTitle || query;"""

if old_title not in src:
    print("ERROR: title block not found")
    raise SystemExit(1)
src = src.replace(old_title, new_title, 1)

FILE.write_text(src, encoding='utf-8')
print("DONE: caption and title fixed")
