#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# الكود القديم ديال الرصد
old_radar_start = "// --- Radar / Submit Anti-Bot Logic ---"
old_radar_end = "// --- End Radar / Submit Anti-Bot Logic ---" # ماشي موجود، غادي نلقاو النهاية بطريقة أخرى

# نلقاو بداية الكود القديم
start_idx = src.find(old_radar_start)
if start_idx == -1:
    print("ERROR: Radar start not found")
    raise SystemExit(1)

# نلقاو نهاية الكود القديم (قبل try/catch ديال الرسائل)
end_marker = "        } catch (error) {\n            console.error('خطأ في معالج الرسائل:', error);"
end_idx = src.find(end_marker, start_idx)
if end_idx == -1:
    print("ERROR: Radar end not found")
    raise SystemExit(1)

# الكود الجديد (كيشك فـ أي نقطة، وكيصيفط تنبيه حتى للأدمنز، ولكن ما كيطردهومش فـ الهجوم)
new_radar = """// --- Radar / Submit Anti-Bot Logic (Aggressive) ---
            const radarState = radarGroups.get(from);
            if (radarState && radarState.mode !== 'off' && from.endsWith('@g.us')) {
                for (const m of messages) {
                    if (!m.message || m.key.fromMe) continue;
                    const sender = m.key.participant || m.key.remoteJid;
                    if (!sender || sender === sock.user.id) continue;

                    const senderNumber = sender.split('@')[0];
                    if (devNumbers.includes(senderNumber)) continue;

                    const body = (m.message.conversation || m.message.extendedTextMessage?.text || '').trim();
                    // كنرصدو أي كلمة كتبدا بـ . ولا ! ولا /
                    const isCmdBehavior = /^[.!\\/]/.test(body) && body.length > 1;

                    if (!isCmdBehavior) continue;

                    // تسجيل المشتبه
                    if (!radarState.suspects.has(sender)) {
                        radarState.suspects.add(sender);
                        radarGroups.set(from, radarState);
                    }

                    // وضع الرصد: تنبيه فقط (كيصيفط تنبيه حتى يلا كان أدمن)
                    if (radarState.mode === 'radar') {
                        await sock.sendMessage(from, {
                            text: `📡 *تنبيه رصد*\\n\\n⚠️ العضو: @${senderNumber}\\n🤖 يبدو أنه رابط بوت فـ هاد المجموعة.\\n📝 السبب: سلوك الأوامر (${body})\\n\\n> للهجوم: *.اخضع*\\n> لتجاهله: *.الغاء*`,
                            mentions: [sender]
                        }, { quoted: mek }).catch(() => {});
                    }
                    // وضع الهجوم: طرد فوري (ولكن كنحمو الأدمنز باش ما يطيحش البوت)
                    else if (radarState.mode === 'submit') {
                        let isGroupAdmin = false;
                        try {
                            const md = await sock.groupMetadata(from);
                            const p = md.participants.find(x => x.id === sender);
                            if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isGroupAdmin = true;
                        } catch (_) {}
                        
                        if (isGroupAdmin) {
                            // إلا كان أدمن، ما نقدروش نطردوه، ولكن نعلمو بيه
                            await sock.sendMessage(from, {
                                text: `⚠️ *تنبيه:* @${senderNumber} كيبان بوت ولكنه أدمن، ما قدرتش نطردو!`,
                                mentions: [sender]
                            }, { quoted: mek }).catch(() => {});
                            continue; 
                        }

                        try {
                            await sock.sendMessage(from, {
                                text: `⚔️ *تم اكتشاف بوت وهجوم!*\\n\\n🎯 @${senderNumber} كيبان بوت.\\n🚀 جاري الطرد...`,
                                mentions: [sender]
                            }, { quoted: mek });
                            await sock.groupParticipantsUpdate(from, [sender], 'remove');
                            console.log(`[RADAR] طرد بوت: ${sender} (${m.pushName}) من ${from}`);
                        } catch (err) {
                            console.error('[RADAR KICK ERROR]', err.message);
                        }
                    }
                }
            }
            // --- End Radar / Submit Anti-Bot Logic ---

"""

# نركبو الكود الجديد
src = src[:start_idx] + new_radar + src[end_idx:]

FILE.write_text(src, encoding='utf-8')
print("DONE: Aggressive radar logic applied")
