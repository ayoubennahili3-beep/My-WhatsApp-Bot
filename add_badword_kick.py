#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. قراءة الكلمات من الملف
words_file = Path.home() / "bad-words.txt"
try:
    custom_words = [line.strip() for line in words_file.read_text(encoding='utf-8').splitlines() if line.strip()]
except:
    custom_words = []
    print("⚠️ ما لقيتش bad-words.txt، غادي نكملو بقائمة خاوية.")

# 2. تعريف المتغيرات
if "const badWordsList =" not in src:
    anchor_var = "const radarGroups = new Map();"
    words_def = f"""const badWordsList = {json.dumps(custom_words, ensure_ascii=False)};
const badWordGroups = new Map(); // المجموعات اللي مفعلا فيها الحماية
"""
    if anchor_var in src:
        src = src.replace(anchor_var, anchor_var + "\n" + words_def, 1)
        print("✅ تم إضافة قائمة الكلمات والمتغيرات")

# 3. إضافة أمر التفعيل والإيقاف
anchor_cmd = "if (command === 'فحص') {"
cmd_block = """if (command === 'تفعيل' || command === 'إيقاف') {
                    if (!from.endsWith('@g.us')) {
                        await sock.sendMessage(from, { text: '⚠️ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    // خاص يكون أدمن فـ المجموعة أو المطور
                    let isAllowed = mek.key.fromMe;
                    if (!isAllowed) {
                        try {
                            const md = await sock.groupMetadata(from);
                            const p = md.participants.find(x => x.id === (mek.key.participant || senderNumber + '@s.whatsapp.net'));
                            if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isAllowed = true;
                        } catch (_) {}
                    }
                    if (!isAllowed) {
                        await sock.sendMessage(from, { text: '⛔ هاد الأمر خاص بالأدمن فقط.' }, { quoted: mek });
                        continue;
                    }
                    
                    if (command === 'تفعيل') {
                        badWordGroups.set(from, true);
                        await sock.sendMessage(from, { text: '🛡️ *تم تفعيل مضاد الشتائم.*\\nأي شخص كيسب غادي تتحذف رسالتو ويتطرد فوراً.' }, { quoted: mek });
                    } else if (command === 'إيقاف') {
                        badWordGroups.delete(from);
                        await sock.sendMessage(from, { text: '🛑 *تم إيقاف مضاد الشتائم.*' }, { quoted: mek });
                    }
                    continue;
                }

                if (command === 'فحص') {"""

if anchor_cmd in src and "if (command === 'تفعيل' || command === 'إيقاف')" not in src:
    src = src.replace(anchor_cmd, cmd_block, 1)
    print("✅ تم إضافة أوامر التفعيل والإيقاف")

# 4. إضافة منطق الكشف والطرد
anchor_logic = "if (!mek.message) continue;"
logic_block = """if (!mek.message) continue;

                    // --- BAD WORDS KICK LOGIC ---
                    if (badWordGroups.has(mek.key.remoteJid) && mek.key.remoteJid.endsWith('@g.us') && !mek.key.fromMe) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const senderNum = sender.split('@')[0];
                        
                        // تجاهل المطورين
                        if (!devNumbers.includes(senderNum)) {
                            const msgText = (mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || '').toLowerCase();
                            
                            if (msgText) {
                                // كنقلبو واش كاينة شي كلمة نابية
                                const foundBadWord = badWordsList.find(word => msgText.includes(word.toLowerCase()));
                                
                                if (foundBadWord) {
                                    try {
                                        // 1. حذف الرسالة
                                        await sock.sendMessage(mek.key.remoteJid, { delete: mek.key });
                                        
                                        // 2. طرد الشخص فوراً
                                        await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                        
                                        // 3. إرسال رسالة تأكيد فـ المجموعة
                                        await sock.sendMessage(mek.key.remoteJid, {
                                            text: `🚫 *تم طرد العضو:* @${senderNum}\\n📝 *السبب:* استخدام كلمات نابية.`,
                                            mentions: [sender]
                                        });
                                        
                                        console.log(`[BAD WORD KICK] طرد ${senderNum} بسبب كلمة: ${foundBadWord}`);
                                    } catch (err) {
                                        console.error('[BAD WORD KICK ERROR]', err.message);
                                        // إلا فشل الطرد (مثلاً البوت ماشي أدمن)، كنحذفو الرسالة غير ونعلمو بيه
                                        await sock.sendMessage(mek.key.remoteJid, {
                                            text: `⚠️ تم حذف رسالة @${senderNum} لاحتوائها على كلمات نابية. (تعذر الطرد، تأكد أن البوت أدمن).`,
                                            mentions: [sender]
                                        }).catch(() => {});
                                    }
                                }
                            }
                        }
                    }
                    // --- END BAD WORDS KICK LOGIC ---"""

if anchor_logic in src and "BAD WORDS KICK LOGIC" not in src:
    src = src.replace(anchor_logic, logic_block, 1)
    print("✅ تم إضافة منطق الحذف والطرد الفوري")

FILE.write_text(src, encoding='utf-8')
print("DONE")
