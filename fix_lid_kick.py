#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# الكود القديم ديال الطرد
old_kick = """                                    try {
                                        console.log(`[RADAR-DEBUG] 🚀 Attempting to kick ${senderNumber}...`);
                                        await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                        await sock.sendMessage(from, {
                                            text: `✅ *تم طرد مستعمل بوت.*`,
                                            mentions: [sender]
                                        }, { quoted: mek });
                                        console.log(`[RADAR] ✅ طرد بوت بنجاح: ${sender} من ${from}`);
                                    } catch (err) {
                                        console.error(`[RADAR KICK ERROR] ❌ فشل الطرد:`, err.message);
                                        // نرسلو رسالة فـ المجموعة باش نعرفو علاش فشل
                                        await sock.sendMessage(from, {
                                            text: `❌ *فشل طرد البوت:*\\nالسبب: ${err.message}\\n\\n(تأكد أن البوت أدمن فـ المجموعة)`
                                        }, { quoted: mek }).catch(() => {});
                                    }"""

# الكود الجديد اللي كيدير حل لمشكل LID
new_kick = """                                    try {
                                        console.log(`[RADAR-DEBUG] 🚀 محاولة طرد: ${senderNumber} (JID: ${sender})`);
                                        
                                        // 1. نجيبو معلومات المجموعة باش نلقاو الـ JID الحقيقي
                                        const groupMetadata = await sock.groupMetadata(from);
                                        
                                        // 2. نلقاو العضو فـ اللائحة (نشوفو واش الـ JID ولا الـ LID كيتطابق)
                                        const participant = groupMetadata.participants.find(p => 
                                            p.id === sender || 
                                            (p.lid && p.lid === sender) ||
                                            p.id.includes(senderNumber) ||
                                            (p.lid && p.lid.includes(senderNumber))
                                        );
                                        
                                        // 3. نستعملو الـ ID الرسمي اللي كيتعرف عليه واتساب
                                        const targetJid = participant ? participant.id : sender;
                                        console.log(`[RADAR-DEBUG] 🎯 الهدف النهائي للطرد: ${targetJid}`);
                                        
                                        // 4. نطردو
                                        await sock.groupParticipantsUpdate(from, [targetJid], 'remove');
                                        
                                        await sock.sendMessage(from, {
                                            text: `✅ *تم طرد مستعمل بوت.*`,
                                            mentions: [targetJid]
                                        }, { quoted: mek });
                                        console.log(`[RADAR] ✅ نجح الطرد: ${targetJid} من ${from}`);
                                    } catch (err) {
                                        console.error(`[RADAR KICK ERROR] ❌ فشل الطرد:`, err);
                                        await sock.sendMessage(from, {
                                            text: `❌ *فشل طرد البوت:*\\nالسبب: ${err.message}\\n\\n(تأكد أن البوت أدمن فـ المجموعة)`
                                        }, { quoted: mek }).catch(() => {});
                                    }"""

if old_kick in src:
    src = src.replace(old_kick, new_kick, 1)
    print("✅ تم تعديل كود الطرد باش يحل مشكل LID")
else:
    print("❌ ما لقيتش كود الطرد القديم")

FILE.write_text(src, encoding='utf-8')
print("DONE")
