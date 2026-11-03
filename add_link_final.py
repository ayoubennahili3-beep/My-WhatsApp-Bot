#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. تعريف المتغيرات (باش نتفاداو أي كراش)
if "const antispamGroups =" not in src:
    anchor = "const badWordGroups = new Map();"
    if anchor in src:
        src = src.replace(anchor, anchor + "\nconst antispamGroups = new Map();\nconst spamWarnings = new Map();", 1)
        print("✅ تمت إضافة المتغيرات")

# 2. إضافة الأوامر (رابط، جهات) قبل .فحص
anchor_cmd = "if (command === 'فحص') {"
cmd_block = """if (command === 'رابط' || command === 'جهات') {
                    if (!from.endsWith('@g.us')) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    const senderJid = mek.key.participant || mek.key.remoteJid;
                    const senderNum = senderJid.split('@')[0];
                    
                    let isAllowed = mek.key.fromMe;
                    if (!isAllowed) {
                        try {
                            const md = await sock.groupMetadata(from);
                            const p = md.participants.find(x => x.id === senderJid || x.id.includes(senderNum));
                            if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isAllowed = true;
                        } catch (_) {}
                    }
                    
                    if (!isAllowed) {
                        await sock.sendMessage(from, { text: '⛔ هاد الأمر خاص بالأدمن.' }, { quoted: mek });
                        continue;
                    }
                    
                    let state = antispamGroups.get(from) || { links: false, contacts: false };
                    
                    if (command === 'رابط') {
                        state.links = !state.links;
                        antispamGroups.set(from, state);
                        await sock.sendMessage(from, { 
                            text: state.links ? '🛡️ *تم منع روابط.*' : '🛑 *إلغاء رابط*' 
                        }, { quoted: mek });
                    } else if (command === 'جهات') {
                        state.contacts = !state.contacts;
                        antispamGroups.set(from, state);
                        await sock.sendMessage(from, { 
                            text: state.contacts ? '🛡️ *تم منع جهات اتصال.*' : '🛑 *إلغاء جهات*' 
                        }, { quoted: mek });
                    }
                    continue;
                }

                if (command === 'فحص') {"""

if anchor_cmd in src and "if (command === 'رابط' || command === 'جهات')" not in src:
    src = src.replace(anchor_cmd, cmd_block, 1)
    print("✅ تمت إضافة أوامر .رابط و .جهات")
else:
    print("⚠️ الأمر راه موجود ولا ما لقيتش مكان الإدراج")

# 3. إضافة منطق الحماية (الكشف عن الروابط والجهات)
anchor_logic = "// --- BAD WORDS KICK LOGIC ---"
spam_logic = """// --- ANTI-SPAM (Links & Contacts) ---
                    const antispamState = antispamGroups.get(mek.key.remoteJid);
                    if (antispamState && mek.key.remoteJid.endsWith('@g.us') && !mek.key.fromMe && (antispamState.links || antispamState.contacts)) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const senderNum = sender.split('@')[0];
                        const isDev = (senderNum === '212704777168' || mek.key.fromMe);
                        
                        if (!isDev) {
                            let isGroupAdmin = false;
                            try {
                                const md = await sock.groupMetadata(mek.key.remoteJid);
                                const p = md.participants.find(x => x.id === sender || (x.lid && x.lid === sender) || x.id.includes(senderNum));
                                if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isGroupAdmin = true;
                            } catch (_) {}
                            
                            if (!isGroupAdmin) {
                                const bodyText = (mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || mek.message.videoMessage?.caption || '');
                                const isContact = mek.message.contactMessage || mek.message.contactsArrayMessage;
                                
                                let violation = null;
                                if (antispamState.links && /(https?:\\/\\/|www\\.|wa\\.me\\/|t\\.me\\/|chat\\.whatsapp\\.com\\/|youtu\\.be\\/|bit\\.ly\\/)/i.test(bodyText)) {
                                    violation = 'روابط';
                                } else if (antispamState.contacts && isContact) {
                                    violation = 'جهات اتصال';
                                }
                                
                                if (violation) {
                                    const key = mek.key.remoteJid + ':' + sender;
                                    let warn = spamWarnings.get(key) || { count: 0, lastAt: 0 };
                                    
                                    if (Date.now() - warn.lastAt > 24 * 60 * 60 * 1000) {
                                        warn.count = 0;
                                    }
                                    
                                    warn.count++;
                                    warn.lastAt = Date.now();
                                    spamWarnings.set(key, warn);
                                    
                                    try {
                                        await sock.sendMessage(mek.key.remoteJid, { delete: mek.key });
                                    } catch (_) {}
                                    
                                    if (warn.count >= 2) {
                                        try {
                                            await sock.groupParticipantsUpdate(mek.key.remoteJid, [sender], 'remove');
                                            await sock.sendMessage(mek.key.remoteJid, {
                                                text: `🚫 *تم طرد العضو:* @${senderNum}\\n📝 *السبب:* إرسال ${violation} بعد التحذير.`,
                                                mentions: [sender]
                                            });
                                            spamWarnings.delete(key);
                                        } catch (err) {
                                            console.error('[ANTISPAM KICK ERROR]', err.message);
                                            await sock.sendMessage(mek.key.remoteJid, {
                                                text: `⚠️ @${senderNum} وصل للتحذير 2/2، ولكن فشل الطرد (تأكد أن البوت أدمن).`,
                                                mentions: [sender]
                                            }).catch(() => {});
                                        }
                                    } else {
                                        await sock.sendMessage(mek.key.remoteJid, {
                                            text: `⚠️ *تحذير ${warn.count}/2* @${senderNum}\\n📝 *السبب:* إرسال ${violation}\\n⚡ التحذير القادم = طرد فوري.`,
                                            mentions: [sender]
                                        });
                                    }
                                }
                            }
                        }
                    }
                    // --- END ANTI-SPAM ---
                    
                    // --- BAD WORDS KICK LOGIC ---"""

if anchor_logic in src and "ANTI-SPAM (Links & Contacts)" not in src:
    src = src.replace(anchor_logic, spam_logic, 1)
    print("✅ تمت إضافة منطق الحماية (الكشف عن الروابط والجهات)")

FILE.write_text(src, encoding='utf-8')
print("DONE")
