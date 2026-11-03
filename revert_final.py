#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو بداية ونهاية بلوك الرصد الحالي
start_str = "// --- RADAR & SUBMIT LOGIC ---"
end_str = "// --- END RADAR & SUBMIT LOGIC ---"

start_idx = src.find(start_str)
end_idx = src.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("❌ ما لقيتش بلوك الرصد")
    raise SystemExit(1)

# الكود الأول اللي كان خدام 100% (بلا تعقيدات، كيستعمل from و sender مباشرة)
first_working_code = """// --- RADAR & SUBMIT LOGIC ---
                    const radarState = radarGroups.get(mek.key.remoteJid);
                    if (radarState && radarState.mode !== 'off' && mek.key.remoteJid.endsWith('@g.us') && !mek.key.fromMe) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const senderNumber = sender.split('@')[0];
                        const textMsg = (mek.message.conversation || mek.message.extendedTextMessage?.text || '').trim();
                        
                        if (/^[.\\/!]/.test(textMsg) && textMsg.length > 1) {
                            
                            // وضع الرصد: تنبيه
                            if (radarState.mode === 'radar') {
                                await sock.sendMessage(from, {
                                    text: `📡 *تنبيه رصد*\\n\\n⚠️ العضو: @${senderNumber}\\n🤖 يبدو أنه رابط بوت.\\n> للهجوم: .اخضع\\n> للإلغاء: .الغاء`,
                                    mentions: [sender]
                                }, { quoted: mek }).catch(() => {});
                            }
                            // وضع الهجوم: طرد فوري ونيشان
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

# نبدلو البلوك القديم بالكود الأول
src = src[:start_idx] + first_working_code + src[end_idx + len(end_str):]

FILE.write_text(src, encoding='utf-8')
print("✅ تم استرجاع الكود الأول اللي كان خدام.")
