#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نلقاو فين كيتصاوب sendMessage
old_send = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        const result = await originalSendMessage(jid, content, options);"""

# 2. الكود الجديد اللي كيزيد القناة
new_send = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        
        // --- CHANNEL FORWARD INJECTION ---
        try {
            if (content && (content.text || content.caption)) {
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                        newsletterName: 'SUPPORT TOJI BOT ⚱️',
                        serverMessageId: 1
                    }
                };
            }
        } catch (err) {
            console.error('Channel injection error:', err.message);
        }
        // ---------------------------------

        const result = await originalSendMessage(jid, content, options);"""

if old_send in src:
    src = src.replace(old_send, new_send, 1)
    print("✅ تمت إضافة ميزة التوجيه من القناة بنجاح")
else:
    print("❌ ما لقيتش الكود ديال sendMessage. ممكن الملف تبدل.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
