#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# الكود القديم ديال .اخضع
old_submit = """if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        await sock.sendMessage(from, { text: '⚔️ *تم تفعيل وضع الهجوم.*' }, { quoted: mek });
                        continue;
                    }"""

# الكود الجديد: كيطرد اللي تسجلو من قبل نيشان، وكيشعل وضع الهجوم
new_submit = """if (command === 'اخضع') {
                        state.mode = 'submit';
                        radarGroups.set(from, state);
                        
                        // 1. نطردو المشتبه فيهم اللي تسجلو من قبل فـ .رصد
                        if (state.suspects && state.suspects.size > 0) {
                            const toKick = Array.from(state.suspects);
                            try {
                                await sock.groupParticipantsUpdate(from, toKick, 'remove');
                                await sock.sendMessage(from, { 
                                    text: `✅ *تم طرد صاحب بوت مشتبه به.* (${toKick.length} عضو)` 
                                }, { quoted: mek });
                                state.suspects.clear(); // نمسحو اللائحة باش ما يطردهومش مرتين
                                radarGroups.set(from, state);
                            } catch (err) {
                                console.error('[MASS KICK ERROR]', err.message);
                                await sock.sendMessage(from, { 
                                    text: '❌ *فشل طرد بعض المشتبه بهم (ممكن يكونو أدمن).*' 
                                }, { quoted: mek });
                            }
                        } else {
                            await sock.sendMessage(from, { text: '⚔️ *تم تفعيل وضع الهجوم.* (لا يوجد مشتبه بهم حالياً)' }, { quoted: mek });
                        }
                        continue;
                    }"""

if old_submit in src:
    src = src.replace(old_submit, new_submit, 1)
    print("✅ تم إضافة الطرد الجماعي فـ .اخضع بنجاح")
else:
    print("❌ ما لقيتش كود .اخضع القديم، تأكد من السطور")

FILE.write_text(src, encoding='utf-8')
print("DONE")
