#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نمسحو أي كود قديم للقناة
src = re.sub(r"// --- CHANNEL FORWARD INJECTION ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
src = re.sub(r"// --- CHANNEL FORWARD UI ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
src = re.sub(r"// --- CHANNEL TEXT UI ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
src = re.sub(r"// --- REAL CHANNEL FORWARD UI ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
print("✅ تم مسح أي كود قديم")

# 2. نتأكدو أننا عندنا متغير نخزنو فيه ID
if "realChannelMsgId" not in src:
    src = src.replace("let reconnectTimer = null;", "let realChannelMsgId = null;\nlet reconnectTimer = null;", 1)
    print("✅ تم إضافة المتغير realChannelMsgId")

# 3. نتأكدو أننا كنسمعو للقناة باش ناخدو الـ ID الحقيقي
if "CAPTURE REAL CHANNEL ID" not in src:
    anchor = "if (type !== 'notify') return;"
    new_listen = """if (type !== 'notify') return;
            
            // --- CAPTURE REAL CHANNEL ID ---
            for (const m of messages) {
                if (m.key?.remoteJid === '0029VbDb2LaJUM2T99gn2D1i@newsletter') {
                    global.realChannelMsgId = m.key.id;
                    console.log(`[CHANNEL] ✅ تم التقاط ID حقيقي من القناة: ${global.realChannelMsgId}`);
                }
            }
            // -------------------------------"""
    if anchor in src:
        src = src.replace(anchor, new_listen, 1)
        print("✅ تم إضافة التقاط رسائل القناة")

# 4. نحطو كود التوجيه فـ السطر 280 (قبل const result)
# الكود اللي كاين فـ السطر 280
anchor_send = "        const result = await originalSendMessage(jid, content, options);"

# الكود ديال التوجيه
forward_code = """        
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
                            serverMessageId: global.realChannelMsgId, // كنستعملو الـ ID الحقيقي اللي تلقط
                            contentType: 1
                        }
                    };
                }
            }
        } catch (err) {
            console.error('Channel UI error:', err.message);
        }
        // ---------------------------------
        
"""

if anchor_send in src and "REAL CHANNEL FORWARD UI" not in src:
    src = src.replace(anchor_send, forward_code + anchor_send, 1)
    print("✅ تم تركيب كود عرض القناة فـ المكان الصحيح")
else:
    print("⚠️ الكود راه موجود ولا السطر تبدل")

FILE.write_text(src, encoding='utf-8')
print("DONE")
