#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. كاميرا 1: قبل شرط النوع (باش نشوفو كلشي كيدخل)
anchor_upsert = "sock.ev.on('messages.upsert', async ({ messages, type }) => {"
trace_upsert = anchor_upsert + """
    console.log('\\n🚨 [TRACE 1] وصل حدث جديد. النوع:', type);
"""
if anchor_upsert in src and "🚨 [TRACE 1]" not in src:
    src = src.replace(anchor_upsert, trace_upsert, 1)
    print("✅ تمت إضافة كاميرا 1 (عند البوابة)")

# 2. كاميرا 2: داخل الحلقة (باش نشوفو محتوى الرسالة الخام)
anchor_loop = "for (const mek of messages || []) {"
trace_loop = anchor_loop + """
        if (mek.message) {
            const rawText = mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || 'لا يوجد نص مباشر';
            console.log('🚨 [TRACE 2] رسالة من:', mek.key.remoteJid, '| fromMe:', mek.key.fromMe, '| النص:', rawText.substring(0, 30));
        }
"""
if anchor_loop in src and "🚨 [TRACE 2]" not in src:
    src = src.replace(anchor_loop, trace_loop, 1)
    print("✅ تمت إضافة كاميرا 2 (داخل الحلقة)")

# 3. كاميرا 3: قبل التحقق من الأمر (باش نشوفو واش وصل للفحص)
anchor_fahs = "if (command === 'فحص') {"
trace_fahs = """console.log('🚨 [TRACE 3] البوت وصل لمرحلة التحقق من الأوامر. الأمر المستخرج:', command);
                if (command === 'فحص') {
                    console.log('🚨 [TRACE 4] 🎯 البوت دخل لأمر .فحص بنجاح!');"""
if anchor_fahs in src and "🚨 [TRACE 3]" not in src:
    src = src.replace(anchor_fahs, trace_fahs, 1)
    print("✅ تمت إضافة كاميرا 3 و 4 (عند تنفيذ الأمر)")

FILE.write_text(src, encoding='utf-8')
print("DONE: تم تركيب الكاميرات بنجاح.")
