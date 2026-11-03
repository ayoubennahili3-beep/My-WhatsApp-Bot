#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو الدالة ديال sendTojiText
pattern = r"const sendTojiText = async \(sock, jid, text\) => \{.*?\};"
match = re.search(pattern, src, re.DOTALL)

if not match:
    print("❌ ما لقيتش دالة sendTojiText.")
    raise SystemExit(1)

# نصنعو الدالة الجديدة بالعنوان الصحيح
new_func = """const sendTojiText = async (sock, jid, text) => {
    try {
        const { sendInteractiveMessage } = require('zqbaileys_helper');
        await sendInteractiveMessage(sock, jid, {
            title: 'SUPPORT TOJI BOT ⚱️', // هنا بدلنا العنوان
            text: text,
            footer: '', // خاويينا الفوتر
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
print("✅ تم تحديث العنوان لـ SUPPORT TOJI BOT ⚱️")
print("DONE")
