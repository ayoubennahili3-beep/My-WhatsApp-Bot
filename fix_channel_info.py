#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# الكود القديم
old_send = """        // --- CHANNEL FORWARD INJECTION ---
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
        // ---------------------------------"""

# الكود الجديد
new_send = """        // --- CHANNEL FORWARD INJECTION ---
        try {
            if (content && (content.text || content.caption)) {
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                        newsletterName: 'SUPPORT TOJI BOT ⚱️',
                        serverMessageId: Math.floor(Math.random() * 90000) + 10000,
                        contentType: 1 // 1 يعني نص عادي
                    }
                };
            }
        } catch (err) {
            console.error('Channel injection error:', err.message);
        }
        // ---------------------------------"""

if old_send in src:
    src = src.replace(old_send, new_send, 1)
    print("✅ تم تحديث معلومات القناة (contentType + serverMessageId)")
else:
    print("❌ ما لقيتش الكود القديم. ممكن الملف تبدل.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
