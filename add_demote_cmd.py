#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نضيفو أمر .خفض قبل أمر .فحص
anchor_cmd = "if (command === 'فحص') {"
demote_cmd = """if (command === 'خفض') {
                    if (!from.endsWith('@g.us')) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }

                    // التحقق واش اللي كيصيفط أدمن ولا المطور
                    let isSenderAdmin = mek.key.fromMe;
                    try {
                        const md = await sock.groupMetadata(from);
                        const p = md.participants.find(x => x.id === (mek.key.participant || senderNumber + '@s.whatsapp.net'));
                        if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isSenderAdmin = true;
                    } catch (_) {}
                    
                    if (!isSenderAdmin) {
                        await sock.sendMessage(from, { text: '⛔ هاد الأمر خاص بالأدمن أو المطور فقط.' }, { quoted: mek });
                        continue;
                    }

                    // استخراج الهدف (بالرد، بالمنشن، ولا بالرقم)
                    const contextInfo = mek.message.extendedTextMessage?.contextInfo;
                    let target = null;

                    if (contextInfo?.participant) {
                        target = contextInfo.participant;
                    } else if (contextInfo?.mentionedJid?.length > 0) {
                        target = contextInfo.mentionedJid[0];
                    } else {
                        const parts = body.split(/\\s+/);
                        const numberMatch = parts.find(p => /^\\d{10,15}$/.test(p));
                        if (numberMatch) target = numberMatch + '@s.whatsapp.net';
                    }

                    if (!target) {
                        await sock.sendMessage(from, { text: '⚠️ من فضلك رد على رسالة الشخص، أو اعمل منشن ليه، أو اكتب رقمه.' }, { quoted: mek });
                        continue;
                    }

                    // تنفيذ الخفض
                    try {
                        const groupMetadata = await sock.groupMetadata(from);
                        const targetNum = target.split('@')[0];
                        
                        // البحث عن العضو الحقيقي (حل مشكل LID)
                        const targetParticipant = groupMetadata.participants.find(p => 
                            p.id === target || 
                            (p.lid && p.lid === target) || 
                            p.id.includes(targetNum)
                        );

                        if (!targetParticipant) {
                            await sock.sendMessage(from, { text: '❌ لم يتم العثور على العضو في المجموعة.' }, { quoted: mek });
                            continue;
                        }

                        if (targetParticipant.admin !== 'admin' && targetParticipant.admin !== 'superadmin') {
                            await sock.sendMessage(from, { text: '⚠️ هذا العضو ليس مشرفاً بالفعل.' }, { quoted: mek });
                            continue;
                        }

                        const realJid = targetParticipant.id;
                        
                        await sock.groupParticipantsUpdate(from, [realJid], 'demote');
                        
                        await sock.sendMessage(from, { 
                            text: `📉 *تم خفض رتبة المشرف بنجاح.*`,
                            mentions: [realJid]
                        }, { quoted: mek });
                        console.log(`[DEMOTE] تم خفض ${realJid} من ${from}`);

                    } catch (err) {
                        console.error('خطأ أمر الخفض:', err);
                        await sock.sendMessage(from, { text: '❌ فشل خفض الرتبة. تأكد من صلاحيات البوت.' }, { quoted: mek });
                    }
                    continue;
                }

                if (command === 'فحص') {"""

if anchor_cmd in src and "if (command === 'خفض')" not in src:
    src = src.replace(anchor_cmd, demote_cmd, 1)
    print("✅ تم إضافة كود أمر .خفض")
else:
    print("⚠️ ما لقيتش مكان الإدراج، أو الأمر راه موجود.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
