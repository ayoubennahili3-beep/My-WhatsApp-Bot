#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. مسح الجملة الزايدة من رسالة التفعيل
old_msg = "await sock.sendMessage(from, { text: '🛡️ *تم تفعيل مضاد الشتائم.*\\nأي شخص كيسب غادي تتحذف رسالتو ويتطرد فوراً.' }, { quoted: mek });"
new_msg = "await sock.sendMessage(from, { text: '🛡️ *تم تفعيل مضاد الشتائم.*' }, { quoted: mek });"

if old_msg in src:
    src = src.replace(old_msg, new_msg, 1)
    print("✅ تم مسح الجملة الزايدة من رسالة التفعيل")
else:
    print("⚠️ ما لقيتش رسالة التفعيل بالضبط، يمكن تبدلت.")

# 2. نصلحو كود الكشف (نديرو Log باش نشوفو شنو كيوقع)
old_logic = """                                if (foundBadWord) {
                                    try {
                                        // 1. حذف الرسالة
                                        await sock.sendMessage(mek.key.remoteJid, { delete: mek.key });"""

new_logic = """                                if (foundBadWord) {
                                    console.log(`[BAD WORD DETECTED] الكلمة: ${foundBadWord} | المرسل: ${senderNum}`);
                                    try {
                                        // 1. حذف الرسالة
                                        await sock.sendMessage(mek.key.remoteJid, { delete: mek.key });"""

if old_logic in src:
    src = src.replace(old_logic, new_logic, 1)
    print("✅ تم إضافة Debug Log باش نشوفو الكشف")
else:
    print("⚠️ ما لقيتش كود الكشف القديم.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
