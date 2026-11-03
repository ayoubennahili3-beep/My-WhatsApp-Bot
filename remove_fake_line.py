#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو دالة sendTojiText
pattern = r"const sendTojiText = async \(sock, jid, text\) => \{.*?\};"
match = re.search(pattern, src, re.DOTALL)

if not match:
    print("❌ ما لقيتش دالة sendTojiText.")
    raise SystemExit(1)

# نصنعو الدالة الجديدة بلا الخط الوهمي
new_func = """const sendTojiText = async (sock, jid, text) => {
    try {
        const { sendInteractiveMessage } = require('zqbaileys_helper');
        
        await sendInteractiveMessage(sock, jid, {
            title: '𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐓𝐎𝐉𝐈 𝐁𝐎𝐓 🌹', 
            text: text, // هنا حيدنا الخط الوهمي، وواتساب غادي يرسم الخط الحقيقي أوتوماتيكياً
            footer: '', 
            interactiveButtons: [{
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: 'عرض القناة',
                    url: 'https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i',
                    merchant_url: 'https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i'
                })
            }]
        });
    } catch (err) {
        console.error('[TOJI TEXT BUTTON ERROR]', err.message);
        await sock.sendMessage(jid, { text: text });
    }
};"""

src = src[:match.start()] + new_func + src[match.end():]

FILE.write_text(src, encoding='utf-8')
print("✅ تم مسح الخط الوهمي. واتساب غادي يرسم الخط الفاصل الحقيقي.")
print("DONE")
