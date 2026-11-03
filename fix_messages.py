#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. إضافة رسالة الطرد فـ وضع .اخضع
old_kick = """                                    try {
                                        // طرد صامت
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                        console.log(`[RADAR] طرد بوت: ${sender} (${mek.pushName}) من ${mek.key.remoteJid}`);
                                    } catch (err) {
                                        console.error('[RADAR KICK ERROR]', err.message);
                                    }"""

new_kick = """                                    try {
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                        await sock.sendMessage(mek.key.remoteJid, {
                                            text: `✅ *تم طرد مستعمل بوت.*`,
                                            mentions: [sender]
                                        }, { quoted: mek });
                                        console.log(`[RADAR] طرد بوت: ${sender} (${mek.pushName}) من ${mek.key.remoteJid}`);
                                    } catch (err) {
                                        console.error('[RADAR KICK ERROR]', err.message);
                                    }"""

if old_kick in src:
    src = src.replace(old_kick, new_kick, 1)
    print("✅ تمت إضافة رسالة الطرد")
else:
    print("⚠️ ما لقيتش الكود ديال الطرد")

# 2. إضافة رسالة الإلغاء فـ أمر .الغاء
old_cancel = """                    if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        // صامت: بلا أي رسالة
                        continue;
                    }"""

new_cancel = """                    if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر.*' }, { quoted: mek });
                        continue;
                    }"""

if old_cancel in src:
    src = src.replace(old_cancel, new_cancel, 1)
    print("✅ تمت إضافة رسالة الإلغاء")
else:
    print("⚠️ ما لقيتش الكود ديال الإلغاء")

FILE.write_text(src, encoding='utf-8')
print("DONE")
