#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نضيفو رسالة تأكيد و Log فـ .اخضع
old_submit = """if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        // صامت: بلا أي رسالة
                        continue;
                    }"""

new_submit = """if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        console.log(`[RADAR-DEBUG] ✅ Mode changed to SUBMIT for group: ${from}`);
                        await sock.sendMessage(from, { text: '⚔️ *تم تفعيل وضع الهجوم (Ninja Mode).*' }, { quoted: mek });
                        continue;
                    }"""

if old_submit in src:
    src = src.replace(old_submit, new_submit, 1)
    print("✅ تم تعديل .اخضع (أضفنا تأكيد و Debug)")
else:
    print("❌ ما لقيتش كود .اخضع")

# 2. نضيفو Debug Log فـ الرصد باش نشوفو واش كيدخل لـ Submit
old_radar_check = """if (/^[.\\/!]/.test(textMsg) && textMsg.length > 1) {
                            
                            if (!radarState.suspects.has(sender)) {"""

new_radar_check = """if (/^[.\\/!]/.test(textMsg) && textMsg.length > 1) {
                            console.log(`[RADAR-DEBUG] 🚨 Suspicious message from ${senderNumber} | Current Mode: ${radarState.mode}`);
                            
                            if (!radarState.suspects.has(sender)) {"""

if old_radar_check in src:
    src = src.replace(old_radar_check, new_radar_check, 1)
    print("✅ تم إضافة Debug للرصد")
else:
    print("❌ ما لقيتش كود الرصد")

# 3. نضيفو Debug Log فـ الطرد
old_kick = """try {
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');"""

new_kick = """try {
                                        console.log(`[RADAR-DEBUG] 🚀 Attempting to kick ${senderNumber}...`);
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');"""

if old_kick in src:
    src = src.replace(old_kick, new_kick, 1)
    print("✅ تم إضافة Debug للطرد")
else:
    print("❌ ما لقيتش كود الطرد")

FILE.write_text(src, encoding='utf-8')
print("DONE")
