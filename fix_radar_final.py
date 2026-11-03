#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نلقاو ونمسحو البلوك القديم ديال أوامر الرصد
start_marker = "if (['رصد', 'اخضع', 'الغاء'].includes(command)) {"
end_marker = "if (command === 'فحص') {"

start_idx = src.find(start_marker)
end_idx = src.find(end_marker, start_idx)

if start_idx == -1 or end_idx == -1:
    print("ERROR: old radar block not found")
    raise SystemExit(1)

# الكود الجديد النظيف
new_block = """if (['رصد', 'اخضع', 'الغاء'].includes(command)) {
                    const isGroup = from.endsWith('@g.us');
                    if (!isGroup) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    let senderNumber = '';
                    if (mek.key.participant) {
                        senderNumber = mek.key.participant.split('@')[0];
                    } else if (mek.key.remoteJid) {
                        senderNumber = mek.key.remoteJid.split('@')[0];
                    }

                    let isAllowed = mek.key.fromMe || devNumbers.includes(senderNumber);
                    if (!isAllowed) {
                        try {
                            const md = await sock.groupMetadata(from);
                            const p = md.participants.find(x => x.id === (mek.key.participant || senderNumber + '@s.whatsapp.net'));
                            if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isAllowed = true;
                        } catch (_) {}
                    }
                    
                    if (!isAllowed) {
                        await sock.sendMessage(from, { text: '⛔ للأدمن أو المطور فقط.' }, { quoted: mek });
                        continue;
                    }
                    
                    let state = radarGroups.get(from) || { mode: 'off', suspects: new Set() };
                    
                    if (command === 'رصد') {
                        state.mode = 'radar';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '📡 *تم تفعيل الرصد.*' }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        // صامت: بلا أي رسالة
                        continue;
                    }
                    
                    if (command === 'الغاء') {
                        state.mode = 'off';
                        state.suspects.clear();
                        radarGroups.set(from, state);
                        // صامت: بلا أي رسالة
                        continue;
                    }
                }

                """

src = src[:start_idx] + new_block + src[end_idx:]
print("✅ تم استبدال بلوك الأوامر")

# 2. نمسحو رسالة "تم اكتشاف بوت" فـ وضع الهجوم (باش يطرد بصمت)
old_kick = """try {
                                        await sock.sendMessage(mek.key.remoteJid, {
                                            text: `⚔️ *تم اكتشاف بوت وهجوم!*\\n\\n🎯 @${senderNumber} كيبان بوت.\\n🚀 جاري الطرد...`,
                                            mentions: [sender]
                                        }, { quoted: mek });
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');"""
new_kick = """try {
                                        // طرد صامت
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');"""

if old_kick in src:
    src = src.replace(old_kick, new_kick, 1)
    print("✅ تم مسح رسالة الطرد (صامت)")

# 3. نحذفو رسالة تنبيه الأدمن (باش يبقى صامت)
old_admin = """await sock.sendMessage(mek.key.remoteJid, {
                                        text: `⚠️ *تنبيه:* @${senderNumber} كيبان بوت ولكنه أدمن، ما قدرتش نطردو!`,
                                        mentions: [sender]
                                    }, { quoted: mek }).catch(() => {});"""
new_admin = """console.log(`[RADAR] بوت أدمن تم تجاهله: ${senderNumber}`);"""

if old_admin in src:
    src = src.replace(old_admin, new_admin, 1)
    print("✅ تم مسح رسالة تنبيه الأدمن")

FILE.write_text(src, encoding='utf-8')
print("DONE: Radar fixed")
