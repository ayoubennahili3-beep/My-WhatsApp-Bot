#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نصلحو مشكل senderNumber فـ بلوك الأوامر
old_cmd_block = """if (['رصد', 'اخضع', 'الغاء'].includes(command)) {
                    const isGroup = from.endsWith('@g.us');
                    if (!isGroup) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر كيخدم غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    // خاص يكون أدمن ولا المطور
                    let isAllowed = mek.key.fromMe || devNumbers.includes(senderNumber);"""

new_cmd_block = """if (['رصد', 'اخضع', 'الغاء'].includes(command)) {
                    const isGroup = from.endsWith('@g.us');
                    if (!isGroup) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر كيخدم غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    // تعريف الرقم ديال المرسل باش ما يطيحش البوت
                    const senderNumber = (mek.key.participant || mek.key.remoteJid).split('@')[0];
                    
                    // خاص يكون أدمن ولا المطور
                    let isAllowed = mek.key.fromMe || devNumbers.includes(senderNumber);"""

if old_cmd_block not in src:
    print("ERROR: command block not found")
    raise SystemExit(1)
src = src.replace(old_cmd_block, new_cmd_block, 1)
print("✅ تم إصلاح مشكل senderNumber")

# 2. نزيدو رسالة تأكيد صغيرة كتمسح راسها باش تعرف أن الرصد تفعل
old_radar_activate = """if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        continue;
                    }"""
new_radar_activate = """if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        const confirmMsg = await sock.sendMessage(from, { text: '📡 تم تفعيل الرصد...' }, { quoted: mek });
                        setTimeout(() => { sock.sendMessage(from, { delete: confirmMsg.key }).catch(()=>{}); }, 3000);
                        continue;
                    }"""

if old_radar_activate not in src:
    print("ERROR: radar activate block not found")
    raise SystemExit(1)
src = src.replace(old_radar_activate, new_radar_activate, 1)
print("✅ تمت إضافة رسالة تأكيد سريعة (تتمسح بعد 3 ثواني)")

FILE.write_text(src, encoding='utf-8')
print("DONE: Radar bug fixed")
