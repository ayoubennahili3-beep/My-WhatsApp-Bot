#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

old_kick = """else if (radarState.mode === 'submit') {
                                try {
                                    const md = await sock.groupMetadata(mek.key.remoteJid);
                                    const p = md.participants.find(x => x.id === sender || (x.lid && x.lid === sender) || x.id.includes(senderNumber));
                                    
                                    if (p && (p.admin === 'admin' || p.admin === 'superadmin')) {
                                        console.log(`[RADAR] العضو ${senderNumber} أدمن، تم تجاهله.`);
                                        continue;
                                    }

                                    const targetJid = p ? p.id : sender;
                                    await sock.groupParticipantsUpdate(mek.key.remoteJid, [targetJid], 'remove');
                                    
                                    await sock.sendMessage(mek.key.remoteJid, {
                                        text: `✅ *تم طرد صاحب بوت مشتبه به.*`
                                    }, { quoted: mek });
                                    console.log(`[RADAR] ✅ نجح الطرد: ${targetJid}`);
                                } catch (err) {
                                    console.error(`[RADAR KICK ERROR] ❌ فشل الطرد:`, err.message);
                                    await sock.sendMessage(mek.key.remoteJid, {
                                        text: `❌ *فشل الطرد.* تأكد أن البوت أدمن فـ المجموعة.`
                                    }, { quoted: mek }).catch(() => {});
                                }
                            }"""

new_kick = """else if (radarState.mode === 'submit') {
                                try {
                                    console.log(`[RADAR] 🚀 محاولة طرد: ${senderNumber} (JID: ${sender})`);
                                    
                                    // نستعملو sender مباشرة بلا ما نشيكو واش أدمن ولا لا
                                    await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                    
                                    await sock.sendMessage(mek.key.remoteJid, {
                                        text: `✅ *تم طرد صاحب بوت مشتبه به.*`,
                                        mentions: [sender]
                                    }, { quoted: mek });
                                    console.log(`[RADAR] ✅ نجح الطرد: ${sender}`);
                                } catch (err) {
                                    console.error(`[RADAR KICK ERROR] ❌ فشل الطرد:`, err.message);
                                    await sock.sendMessage(mek.key.remoteJid, {
                                        text: `❌ *فشل الطرد (ممكن يكون أدمن).*`
                                    }, { quoted: mek }).catch(() => {});
                                }
                            }"""

if old_kick in src:
    src = src.replace(old_kick, new_kick, 1)
    print("✅ تم مسح شرط الأدمن، والبوت دابا غادي يحاول يطرد أي واحد.")
else:
    print("❌ ما لقيتش الكود القديم، ممكن الملف تبدل.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
