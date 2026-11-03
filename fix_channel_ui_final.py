#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو البلوك اللي كيبدا بـ CHANNEL FORWARD INJECTION
pattern = r"// --- CHANNEL FORWARD INJECTION ---.*?// ---------------------------------"
match = re.search(pattern, src, re.DOTALL)

if not match:
    print("❌ ما لقيتش بلوك التوجيه. يمكن تبدل.")
    raise SystemExit(1)

# الكود الجديد
new_block = """// --- CHANNEL FORWARD UI ---
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

# نبدلو البلوك القديم بالجديد
src = src[:match.start()] + new_block + src[match.end():]

FILE.write_text(src, encoding='utf-8')
print("✅ تم تطبيق كود عرض القناة بنجاح (بلا رابط فـ النص).")
