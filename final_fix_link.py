#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نلقاو السطر ديال الشرط ديال .رابط و .جهات
marker = "if (command === 'رابط' || command === 'جهات') {"
if marker not in src:
    print("❌ ما لقيتش الشرط ديال .رابط و .جهات.")
    raise SystemExit(1)

# 2. نضيفو تعريف المتغيرات مباشرة من بعد الشرط (باش ما يطيحش البوت)
injection = """
                    const senderJid = mek.key.participant || mek.key.remoteJid;
                    const senderNum = senderJid.split('@')[0];
"""
if "const senderJid = mek.key.participant" not in src:
    src = src.replace(marker, marker + injection, 1)
    print("✅ تم إضافة تعريف senderJid و senderNum")

# 3. نصلحو السطر اللي فيه الخطأ (كنعوضو senderNumber بـ senderNum)
old_find = "const p = md.participants.find(x => x.id === (mek.key.participant || senderNumber + '@s.whatsapp.net'));"
new_find = "const p = md.participants.find(x => x.id === senderJid || x.id.includes(senderNum));"

if old_find in src:
    src = src.replace(old_find, new_find, 1)
    print("✅ تم إصلاح سطر البحث عن الأدمن")

FILE.write_text(src, encoding='utf-8')
print("DONE")
