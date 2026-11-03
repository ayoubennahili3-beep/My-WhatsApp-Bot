#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نمسحو البلوك القديم كامل
start_marker = "// --- RADAR & SUBMIT LOGIC ---"
end_marker = "// --- END RADAR & SUBMIT LOGIC ---"

start_idx = src.find(start_marker)
end_idx = src.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("❌ ما لقيتش بلوك الرصد")
    raise SystemExit(1)

# 2. الكود الجديد البسيط
new_radar = """// --- RADAR & SUBMIT LOGIC ---
                    const radarState = radarGroups.get(mek.key.remoteJid);
                    if (radarState && radarState.mode !== 'off' && mek.key.remoteJid.endsWith('@g.us') && !mek.key.fromMe) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const senderNumber = sender.split('@')[0];
                        const textMsg = (mek.message.conversation || mek.message.extendedTextMessage?.text || '').trim();
                        
                        if (/^[.\\/!]/.test(textMsg) && textMsg.length > 1) {
                            
                            // وضع الرصد: تنبيه فقط
                            if (radarState.mode === 'radar') {
                                await sock.sendMessage(mek.key.remoteJid, {
                                    text: `📡 *تنبيه رصد*\\n\\n⚠️ العضو: @${senderNumber}\\n🤖 يبدو أنه رابط بوت.\\n> للهجوم: .اخضع\\n> للإلغاء: .الغاء`,
                                    mentions: [sender]
                                }, { quoted: mek }).catch(() => {});
                            }
                            // وضع الهجوم: طرد فوري
                            else if (radarState.mode === 'submit') {
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
                            }
                        }
                    }
                    // --- END RADAR & SUBMIT LOGIC ---"""

# 3. نركبو الكود الجديد
src = src[:start_idx] + new_radar + src[end_idx + len(end_marker):]

# 4. نتأكدو أن أوامر .رصد و .اخضع و .الغاء بسيطين
old_cmd = """if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '📡 *تم تفعيل الرصد.*' }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        console.log(`[RADAR-DEBUG] ✅ Mode changed to SUBMIT for group: ${from}`);
                        await sock.sendMessage(from, { text: '⚔️ *تم تفعيل وضع الهجوم.*' }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر.*' }, { quoted: mek });
                        continue;
                    }"""

new_cmd = """if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '📡 *تم تفعيل الرصد.*' }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '⚔️ *تم تفعيل وضع الهجوم.*' }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر.*' }, { quoted: mek });
                        continue;
                    }"""

if old_cmd in src:
    src = src.replace(old_cmd, new_cmd, 1)
    print("✅ تم تبسيط الأوامر")

FILE.write_text(src, encoding='utf-8')
print("DONE: Simple Radar applied")
