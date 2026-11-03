#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نضيفو متغير باش نخزنو فيه الـ ID الحقيقي
if "let realChannelMsgId =" not in src:
    src = src.replace("let reconnectTimer = null;", "let realChannelMsgId = null;\nlet reconnectTimer = null;", 1)

# 2. نضيفو كود باش نسمعو للرسائل اللي كتوصل من القناة وناخدو الـ ID
anchor_listen = "if (type !== 'notify') return;"
new_listen = """if (type !== 'notify') return;
            
            // --- CAPTURE REAL CHANNEL MESSAGE ID ---
            for (const mek of messages) {
                if (mek.key.remoteJid === '0029VbDb2LaJUM2T99gn2D1i@newsletter') {
                    realChannelMsgId = mek.key.id;
                    console.log(`[CHANNEL] ✅ تم التقاط ID حقيقي من القناة: ${realChannelMsgId}`);
                }
            }
            // ---------------------------------------"""

if anchor_listen in src and "CAPTURE REAL CHANNEL" not in src:
    src = src.replace(anchor_listen, new_listen, 1)

# 3. نعدلو كود التوجيه باش يستعمل الـ ID الحقيقي
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
                        serverMessageId: Math.floor(Math.random() * 90000) + 10000,
                        contentType: 1 // 1 يعني نص عادي
                    }
                };
            }
        } catch (err) {
            console.error('Channel injection error:', err.message);
        }
        // ---------------------------------"""

new_send = """        // --- CHANNEL FORWARD INJECTION ---
        try {
            if (content && (content.text || content.caption) && realChannelMsgId) {
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                        newsletterName: 'SUPPORT TOJI BOT ⚱️',
                        serverMessageId: realChannelMsgId, // كنستعملو الـ ID الحقيقي
                        contentType: 1
                    }
                };
            }
        } catch (err) {
            console.error('Channel injection error:', err.message);
        }
        // ---------------------------------"""

if old_send in src:
    src = src.replace(old_send, new_send, 1)
    print("✅ تم تحديث كود التوجيه ليستعمل الـ ID الحقيقي")

FILE.write_text(src, encoding='utf-8')
print("DONE")
