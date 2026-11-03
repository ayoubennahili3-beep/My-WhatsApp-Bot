#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. متغيرات نظام الرصد
if "radarGroups" not in src:
    src = src.replace(
        "let reconnectTimer = null;",
        "const radarGroups = new Map(); // { chat: { mode: 'radar'|'submit'|'off', suspects: Set } }\nlet reconnectTimer = null;",
        1
    )
    print("✅ تمت إضافة متغير radarGroups")

# 2. أوامر الرصد والهجوم والإلغاء
anchor_cmd = "if (command === 'فحص') {"
radar_cmd = """if (['رصد', 'اخضع', 'الغاء'].includes(command)) {
                    const isGroup = from.endsWith('@g.us');
                    if (!isGroup) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر كيخدم غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    // خاص يكون أدمن ولا المطور
                    let isAllowed = mek.key.fromMe || devNumbers.includes(senderNumber);
                    if (!isAllowed) {
                        try {
                            const md = await sock.groupMetadata(from);
                            const p = md.participants.find(x => x.id === (mek.key.participant || senderNumber + '@s.whatsapp.net'));
                            if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isAllowed = true;
                        } catch (_) {}
                    }
                    if (!isAllowed) {
                        await sock.sendMessage(from, { text: '⛔ هاد الأمر خاص بالأدمن أو المطور.' }, { quoted: mek });
                        continue;
                    }
                    
                    let state = radarGroups.get(from) || { mode: 'off', suspects: new Set() };
                    
                    if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, {
                            text: `📡 *تم تفعيل وضع الرصد.*\\n\\n🔍 البوت غادي يراقب كل من كيبان ليه بوت فـ المجموعة.\\n📋 كيصيفط ليك تنبيه مع منشن.\\n\\n> للهجوم: *.اخضع*\\n> للإلغاء: *.الغاء*`
                        }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, {
                            text: `⚔️ *تم تفعيل وضع الهجوم!*\\n\\n🎯 أي بوت جديد كيبان فـ المجموعة غادي يتطرد فوراً.\\n🔥 البوتات الموجودة اللي كترسل أوامر غادي تتطرد أيضاً.\\n\\n> لوقف الحرب: *.الغاء*`
                        }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, {
                            text: `🛑 *تم إلغاء النظام بالكامل.*\\n\\n📋 تم مسح قائمة المشبوهين.\\n💤 الوضع الحالي: خامل.\\n\\n> لإعادة التفعيل: *.رصد* أو *.اخضع*`
                        }, { quoted: mek });
                        continue;
                    }
                }

                if (command === 'فحص') {"""

if anchor_cmd in src and "['رصد', 'اخضع', 'الغاء']" not in src:
    src = src.replace(anchor_cmd, radar_cmd, 1)
    print("✅ تمت إضافة أوامر الرصد/الهجوم/الإلغاء")

# 3. منطق الكشف (Radar / Submit)
anchor_logic = "if (type !== 'notify') return;"
radar_logic = """if (type !== 'notify') return;

            // --- Radar / Submit Anti-Bot Logic ---
            const radarState = radarGroups.get(from);
            if (radarState && radarState.mode !== 'off' && from.endsWith('@g.us')) {
                for (const m of messages) {
                    if (!m.message || m.key.fromMe) continue;
                    const sender = m.key.participant || m.key.remoteJid;
                    if (!sender || sender === sock.user.id) continue;

                    const senderNumber = sender.split('@')[0];
                    if (devNumbers.includes(senderNumber)) continue;

                    // تحقق أنه ليس أدمن
                    let isGroupAdmin = false;
                    try {
                        const md = await sock.groupMetadata(from);
                        const p = md.participants.find(x => x.id === sender);
                        if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isGroupAdmin = true;
                    } catch (_) {}
                    if (isGroupAdmin) continue;

                    // كشف البوت (الاسم أو السلوك)
                    const pushName = (m.pushName || '').toLowerCase();
                    const isBotName = pushName.includes('bot') || pushName.includes('بوت') || pushName.includes('🤖') || pushName.includes('toji');

                    const body = (m.message.conversation || m.message.extendedTextMessage?.text || '').trim();
                    const isCmdBehavior = /^[.!\\/]/.test(body) && body.length > 1;

                    if (!isBotName && !isCmdBehavior) continue;

                    // تسجيل المشتبه
                    if (!radarState.suspects.has(sender)) {
                        radarState.suspects.add(sender);
                        radarGroups.set(from, radarState);
                    }

                    // وضع الرصد: تنبيه فقط
                    if (radarState.mode === 'radar') {
                        await sock.sendMessage(from, {
                            text: `📡 *تنبيه رصد*\\n\\n⚠️ العضو: @${senderNumber}\\n🤖 يبدو أنه رابط بوت فـ هاد المجموعة.\\n📝 السبب: ${isBotName ? 'اسم البوت' : 'سلوك الأوامر'}\\n\\n> للهجوم: *.اخضع*\\n> لتجاهله: *.الغاء*`,
                            mentions: [sender]
                        }, { quoted: mek }).catch(() => {});
                    }
                    // وضع الهجوم: طرد فوري
                    else if (radarState.mode === 'submit') {
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
            }"""

if anchor_logic in src and "Radar / Submit Anti-Bot Logic" not in src:
    src = src.replace(anchor_logic, radar_logic, 1)
    print("✅ تمت إضافة منطق الرصد/الهجوم")

FILE.write_text(src, encoding='utf-8')
print("DONE: Radar System added")
