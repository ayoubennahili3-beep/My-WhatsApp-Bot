#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. المكان اللي غادي نحطو فيه الكود (بعد التأكد من أن الرسالة موجودة)
anchor = "if (!mek.message) continue;"

# 2. الكود ديال الرصد
radar_logic = """if (!mek.message) continue;

                    // --- RADAR & SUBMIT LOGIC ---
                    const radarState = radarGroups.get(mek.key.remoteJid);
                    if (radarState && radarState.mode !== 'off' && mek.key.remoteJid.endsWith('@g.us') && !mek.key.fromMe) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const senderNumber = sender.split('@')[0];
                        const textMsg = (mek.message.conversation || mek.message.extendedTextMessage?.text || '').trim();
                        
                        // كنشوفو واش الرسالة كتبدا بنقطة ولا ! ولا /
                        if (/^[.\\/!]/.test(textMsg) && textMsg.length > 1) {
                            
                            if (!radarState.suspects.has(sender)) {
                                radarState.suspects.add(sender);
                                radarGroups.set(mek.key.remoteJid, radarState);
                            }

                            if (radarState.mode === 'radar') {
                                await sock.sendMessage(mek.key.remoteJid, {
                                    text: `📡 *تنبيه رصد*\\n\\n⚠️ العضو: @${senderNumber}\\n🤖 يبدو أنه رابط بوت فـ هاد المجموعة.\\n📝 السبب: سلوك الأوامر (${textMsg})\\n\\n> للهجوم: *.اخضع*\\n> لتجاهله: *.الغاء*`,
                                    mentions: [sender]
                                }, { quoted: mek }).catch(() => {});
                            } else if (radarState.mode === 'submit') {
                                let isGroupAdmin = false;
                                try {
                                    const md = await sock.groupMetadata(mek.key.remoteJid);
                                    const p = md.participants.find(x => x.id === sender);
                                    if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isGroupAdmin = true;
                                } catch (_) {}

                                if (isGroupAdmin) {
                                    await sock.sendMessage(mek.key.remoteJid, {
                                        text: `⚠️ *تنبيه:* @${senderNumber} كيبان بوت ولكنه أدمن، ما قدرتش نطردو!`,
                                        mentions: [sender]
                                    }, { quoted: mek }).catch(() => {});
                                } else {
                                    try {
                                        await sock.sendMessage(mek.key.remoteJid, {
                                            text: `⚔️ *تم اكتشاف بوت وهجوم!*\\n\\n🎯 @${senderNumber} كيبان بوت.\\n🚀 جاري الطرد...`,
                                            mentions: [sender]
                                        }, { quoted: mek });
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                        console.log(`[RADAR] طرد بوت: ${sender} (${mek.pushName}) من ${mek.key.remoteJid}`);
                                    } catch (err) {
                                        console.error('[RADAR KICK ERROR]', err.message);
                                    }
                                }
                            }
                        }
                    }
                    // --- END RADAR & SUBMIT LOGIC ---"""

if anchor in src and "RADAR & SUBMIT LOGIC" not in src:
    src = src.replace(anchor, radar_logic, 1)
    print("✅ تمت إضافة كود الرصد بنجاح")
else:
    print("⚠️ الكود موجود مسبقاً ولا لم يتم العثور على المكان المناسب")

FILE.write_text(src, encoding='utf-8')
print("DONE")
