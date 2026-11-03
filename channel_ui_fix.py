#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# الكود اللي درنا فيه الرابط
old_send = """        // --- CHANNEL LINK & FORWARD ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                // 1. نزيدو رابط القناة فـ آخر النص
                const channelLink = '\\n\\n📢 *قناتنا الرسمية:*\\nhttps://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i';
                if (content.text) content.text += channelLink;
                if (content.caption) content.caption += channelLink;

                // 2. نخلو خانة "تمت إعادة التوجيه" تبان (بلا ما نحاولو نخدعو بلي هي من القناة)
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true
                };
            }
        } catch (err) {
            console.error('Channel link error:', err.message);
        }
        // ---------------------------------"""

# الكود الجديد اللي كيرجع شكل "عرض القناة"
new_send = """        // --- CHANNEL FORWARD UI ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                        newsletterName: 'SUPPORT TOJI BOT ⚱️',
                        serverMessageId: 1, // رقم صغير باش واتساب يقبلو
                        contentType: 1 // 1 = نص
                    }
                };
            }
        } catch (err) {
            console.error('Channel UI error:', err.message);
        }
        // ---------------------------------"""

if old_send in src:
    src = src.replace(old_send, new_send, 1)
    print("✅ تم إرجاع كود عرض القناة (بلا رابط فـ النص)")
else:
    print("❌ ما لقيتش الكود القديم. غادي نعطيك أمر نلقاه.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
