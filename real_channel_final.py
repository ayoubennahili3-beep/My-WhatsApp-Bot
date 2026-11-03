#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نمسحو داك النص اللي درت (اللي فيه الرابط)
pattern_text = r"// --- CHANNEL TEXT UI ---.*?// ---------------------------------"
src = re.sub(pattern_text, "", src, flags=re.DOTALL)

# 2. نلقاو فين كيتصاوب sendMessage ونحطو الكود الحقيقي
old_send = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        
        const result = await originalSendMessage(jid, content, options);"""

new_send = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        
        // --- REAL CHANNEL FORWARD UI ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                if (global.realChannelMsgId) {
                    content.contextInfo = {
                        ...(content.contextInfo || {}),
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                            newsletterName: 'SUPPORT TOJI BOT ⚱️',
                            serverMessageId: global.realChannelMsgId, // هنا كيتحط الـ ID الحقيقي
                            contentType: 1
                        }
                    };
                }
            }
        } catch (err) {
            console.error('Channel UI error:', err.message);
        }
        // ---------------------------------

        const result = await originalSendMessage(jid, content, options);"""

if old_send in src:
    src = src.replace(old_send, new_send, 1)
    print("✅ تم تركيب كود عرض القناة (الحقيقي)")
else:
    # يلا كان الكود تبدل، كنقلبو على أي بلوك ديال sendMessage
    print("⚠️ الكود تبدل شوية، غادي نديرو طريقة أخرى...")
    # كنقلبو على فين كيبدا sendMessage وكنحطو الكود

# 3. نضيفو كود باش نسمعو للقناة وناخدو الـ ID الحقيقي
anchor_listen = "if (type !== 'notify') return;"
new_listen = """if (type !== 'notify') return;
            
            // --- CAPTURE REAL CHANNEL ID ---
            for (const m of messages) {
                if (m.key?.remoteJid === '0029VbDb2LaJUM2T99gn2D1i@newsletter') {
                    global.realChannelMsgId = m.key.id;
                    console.log(`[CHANNEL] ✅ تم التقاط ID حقيقي من القناة: ${global.realChannelMsgId}`);
                }
            }
            // -------------------------------"""

if anchor_listen in src and "CAPTURE REAL CHANNEL ID" not in src:
    src = src.replace(anchor_listen, new_listen, 1)
    print("✅ تم إضافة رصد رسائل القناة باش ناخدو الـ ID")

FILE.write_text(src, encoding='utf-8')
print("DONE")
