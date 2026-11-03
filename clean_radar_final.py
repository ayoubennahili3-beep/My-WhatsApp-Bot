#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نمسحو بلوك الأوامر (رصد، اخضع، الغاء) القديم
start_cmd = "if (['رصد', 'اخضع', 'الغاء'].includes(command)) {"
end_cmd = "if (command === 'فحص') {"
start_idx = src.find(start_cmd)
end_idx = src.find(end_cmd)

if start_idx != -1 and end_idx != -1:
    new_cmd = """if (['رصد', 'اخضع', 'الغاء'].includes(command)) {
                    if (!from.endsWith('@g.us')) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    // كيتحقق غير واش نتا اللي صيفطتي الأمر (بلا متغيرات زايدة)
                    if (!mek.key.fromMe) {
                        continue;
                    }
                    
                    let state = radarGroups.get(from) || { mode: 'off' };
                    
                    if (command === 'رصد') {
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
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر.*' }, { quoted: mek });
                        continue;
                    }
                }

                """
    src = src[:start_idx] + new_cmd + src[end_idx:]
    print("✅ تم إصلاح أوامر الرصد")

# 2. نمسحو بلوك الرصد (Anti-Bot) القديم اللي كان كيطيح
start_radar = "// --- RADAR & SUBMIT LOGIC ---"
end_radar = "// --- END RADAR & SUBMIT LOGIC ---"
start_r_idx = src.find(start_radar)
end_r_idx = src.find(end_radar)

if start_r_idx != -1 and end_r_idx != -1:
    new_radar = """// --- RADAR & SUBMIT LOGIC ---
                    const radarState = radarGroups.get(from);
                    if (radarState && radarState.mode !== 'off' && from.endsWith('@g.us') && !mek.key.fromMe) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const senderNumber = sender.split('@')[0];
                        const textMsg = (body || '').trim(); // كنستعملو body اللي كاين أصلاً

                        if (/^[.\\/!]/.test(textMsg) && textMsg.length > 1) {
                            
                            // وضع الرصد: تنبيه
                            if (radarState.mode === 'radar') {
                                await sock.sendMessage(from, {
                                    text: `📡 *تنبيه رصد*\\n\\n⚠️ العضو: @${senderNumber}\\n🤖 يبدو أنه رابط بوت.\\n> للهجوم: .اخضع\\n> للإلغاء: .الغاء`,
                                    mentions: [sender]
                                }, { quoted: mek }).catch(() => {});
                            }
                            
                            // وضع الهجوم: طرد نيشان
                            else if (radarState.mode === 'submit') {
                                try {
                                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                    await sock.sendMessage(from, {
                                        text: `✅ *تم طرد صاحب بوت مشتبه به.*`,
                                        mentions: [sender]
                                    }, { quoted: mek }).catch(() => {});
                                    console.log(`[RADAR] ✅ نجح الطرد: ${sender}`);
                                } catch (err) {
                                    console.error(`[RADAR KICK ERROR] ❌ فشل الطرد:`, err.message);
                                }
                            }
                        }
                    }
                    // --- END RADAR & SUBMIT LOGIC ---"""

    src = src[:start_r_idx] + new_radar + src[end_r_idx + len(end_radar):]
    print("✅ تم إصلاح كود الرصد")

FILE.write_text(src, encoding='utf-8')
print("DONE: Radar completely cleaned")
