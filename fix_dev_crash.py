#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نصلحو الخطأ ديال devNumbers
old_block = """                        // تجاهل المطورين
                        if (!devNumbers.includes(senderNum)) {"""

new_block = """                        // تجاهل المطورين (حل مشكل devNumbers)
                        const isDev = (senderNum === '212704777168' || mek.key.fromMe);
                        if (!isDev) {"""

if old_block in src:
    src = src.replace(old_block, new_block, 1)
    print("✅ تم إصلاح خطأ devNumbers")
else:
    print("⚠️ ما لقيتش البلوك ديال تجاهل المطورين. غادي نعطيك أوامر نلقاه.")

# 2. نزيدو Log باش نتأكدو واش الكلمة النابية تلقات
old_log = """                            const msgText = (mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || '').toLowerCase();"""

new_log = """                            const msgText = (mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || '').toLowerCase();
                            if (msgText) console.log(`[BAD WORD CHECK] Checking: "${msgText}"`);"""

if old_log in src:
    src = src.replace(old_log, new_log, 1)
    print("✅ تم إضافة Log للكشف عن الكلمات")

FILE.write_text(src, encoding='utf-8')
print("DONE")
