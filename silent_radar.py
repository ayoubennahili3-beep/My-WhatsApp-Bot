#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. مسح رسالة تفعيل الرصد
old_radar = """if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, {
                            text: `📡 *تم تفعيل وضع الرصد.*\\n\\n🔍 البوت غادي يراقب كل من كيبان ليه بوت فـ المجموعة.\\n📋 كيصيفط ليك تنبيه مع منشن.\\n\\n> للهجوم: *.اخضع*\\n> للإلغاء: *.الغاء*`
                        }, { quoted: mek });
                        continue;
                    }"""
new_radar = """if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        continue;
                    }"""
src = src.replace(old_radar, new_radar)

# 2. مسح رسالة تفعيل الهجوم
old_submit = """if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, {
                            text: `⚔️ *تم تفعيل وضع الهجوم!*\\n\\n🎯 أي بوت جديد كيبان فـ المجموعة غادي يتطرد فوراً.\\n🔥 البوتات الموجودة اللي كترسل أوامر غادي تتطرد أيضاً.\\n\\n> لوقف الحرب: *.الغاء*`
                        }, { quoted: mek });
                        continue;
                    }"""
new_submit = """if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        continue;
                    }"""
src = src.replace(old_submit, new_submit)

# 3. مسح رسالة إلغاء النظام
old_off = """if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, {
                            text: `🛑 *تم إلغاء النظام بالكامل.*\\n\\n📋 تم مسح قائمة المشبوهين.\\n💤 الوضع الحالي: خامل.\\n\\n> لإعادة التفعيل: *.رصد* أو *.اخضع*`
                        }, { quoted: mek });
                        continue;
                    }"""
new_off = """if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        continue;
                    }"""
src = src.replace(old_off, new_off)

# 4. مسح رسالة الهجوم والطرد فـ وضع .اخضع (باش يطرد بصمت)
old_kick = """try {
                                        await sock.sendMessage(mek.key.remoteJid, {
                                            text: `⚔️ *تم اكتشاف بوت وهجوم!*\\n\\n🎯 @${senderNumber} كيبان بوت.\\n🚀 جاري الطرد...`,
                                            mentions: [sender]
                                        }, { quoted: mek });
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');"""
new_kick = """try {
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');"""
src = src.replace(old_kick, new_kick)

# 5. مسح رسالة تنبيه الأدمن (باش ما يخربقش المجموعة)
old_admin = """await sock.sendMessage(mek.key.remoteJid, {
                                        text: `⚠️ *تنبيه:* @${senderNumber} كيبان بوت ولكنه أدمن، ما قدرتش نطردو!`,
                                        mentions: [sender]
                                    }, { quoted: mek }).catch(() => {});"""
new_admin = """console.log(`[RADAR] بوت أدمن تم تجاهله بصمت: ${senderNumber}`);"""
src = src.replace(old_admin, new_admin)

FILE.write_text(src, encoding='utf-8')
print("✅ تم مسح جميع رسائل الانتظار، ووضع .اخضع ولا يطرد بصمت.")
