#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "commands" / "song.js"
src = FILE.read_text(encoding='utf-8')

# نمسحو أي إضافة زايدة فـ الكابسيون ونخليو غير الاسم
old1 = "caption: '🌹 𝐓𝐎𝐉𝐈 𝐁𝐎𝐓 | 𝐓𝐎𝐉𝐈 𝐒𝐎𝐍𝐆\\n\\n⏳ *جاري التحميل...*'"
new1 = "caption: '🌹 𝐓𝐎𝐉𝐈 𝐁𝐎𝐓 | 𝐓𝐎𝐉𝐈 𝐒𝐎𝐍𝐆'"

if old1 in src:
    src = src.replace(old1, new1, 1)
    print("✅ تم مسح 'جاري التحميل'")
else:
    print("⚠️ ما لقيتش الكابسيون الأول")

# نمسحو التعديل اللي كيقول "تم التحميل"
old2 = """        // تعديل البطاقة باش نقولو "تم التحميل"
        if (cardMsgKey) {
            try {
                await sock.sendMessage(from, {
                    text: '🌹 𝐓𝐎𝐉𝐈 𝐁𝐎𝐓 | 𝐓𝐎𝐉𝐈 𝐒𝐎𝐍𝐆\\n\\n✅ *تم التحميل بنجاح!*',
                    edit: cardMsgKey
                });
            } catch (e) {
                console.error('[SONG EDIT ERROR]', e.message);
            }
        }"""
new2 = ""

if old2 in src:
    src = src.replace(old2, new2, 1)
    print("✅ تم مسح 'تم التحميل' والتعديل")
else:
    print("⚠️ ما لقيتش بلوك التعديل")

FILE.write_text(src, encoding='utf-8')
print("DONE")
