#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# الكود القديم بالضبط
old_kick = """                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                        console.log(`[RADAR] طرد بوت: ${sender} (${mek.pushName}) من ${mek.key.remoteJid}`);
                                    } catch (err) {
                                        console.error('[RADAR KICK ERROR]', err.message);
                                    }"""

# الكود الجديد (مع حل مشكل LID)
new_kick = """                                        console.log(`[RADAR-DEBUG] 🚀 محاولة طرد: ${senderNumber} (JID: ${sender})`);
                                        
                                        // 1. جلب معلومات المجموعة للبحث عن الـ JID الحقيقي (حل مشكل LID)
                                        const groupMetadata = await sock.groupMetadata(from);
                                        
                                        // 2. البحث عن العضو (سواء بالـ id أو بالـ lid)
                                        const participant = groupMetadata.participants.find(p => 
                                            p.id === sender || 
                                            (p.lid && p.lid === sender) ||
                                            p.id.includes(senderNumber) ||
                                            (p.lid && p.lid.includes(senderNumber))
                                        );
                                        
                                        // 3. تحديد الهدف
                                        const targetJid = participant ? participant.id : sender;
                                        console.log(`[RADAR-DEBUG] 🎯 الهدف النهائي للطرد: ${targetJid}`);
                                        
                                        // 4. تنفيذ الطرد
                                        await sock.groupParticipantsUpdate(from, [targetJid], 'remove');
                                        await sock.sendMessage(from, {
                                            text: `✅ *تم طرد مستعمل بوت.*`,
                                            mentions: [targetJid]
                                        }, { quoted: mek });
                                        console.log(`[RADAR] ✅ نجح الطرد: ${targetJid} من ${from}`);
                                    } catch (err) {
                                        console.error(`[RADAR KICK ERROR] ❌ فشل الطرد:`, err.message);
                                        await sock.sendMessage(from, {
                                            text: `❌ *فشل طرد البوت:*\\nالسبب: ${err.message}\\n\\n(تأكد أن البوت أدمن فـ المجموعة)`
                                        }, { quoted: mek }).catch(() => {});
                                    }"""

if old_kick in src:
    src = src.replace(old_kick, new_kick, 1)
    print("✅ تم تعديل كود الطرد بنجاح (حل مشكل LID)")
else:
    print("❌ ما لقيتش الكود القديم، تأكد من السطور")

FILE.write_text(src, encoding='utf-8')
print("DONE")
