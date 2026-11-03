#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو البلوك القديم
pattern = r"// --- CHANNEL FORWARD INJECTION ---.*?// ---------------------------------"
match = re.search(pattern, src, re.DOTALL)

if not match:
    # إلا كان البلوك تبدل، كنقلبو على الاسم الجديد
    pattern = r"// --- CHANNEL FORWARD UI ---.*?// ---------------------------------"
    match = re.search(pattern, src, re.DOTALL)

if not match:
    print("❌ ما لقيتش بلوك التوجيه.")
    raise SystemExit(1)

# الكود الجديد النظيف والآمن
new_block = """// --- CHANNEL TEXT UI ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                // 1. نخليو علامة إعادة التوجيه تبان
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true
                };

                // 2. نزيدو اسم القناة والرابط فـ النص باش يبان بحال التوجيه
                const channelHeader = '> 🌹 *𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐* 𓂀\\n> 📢 *SUPPORT TOJI BOT* ⚱️\\n> https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i\\n\\n';
                
                if (content.text) content.text = channelHeader + content.text;
                if (content.caption) content.caption = channelHeader + content.caption;
            }
        } catch (err) {
            console.error('Channel Text UI error:', err.message);
        }
        // ---------------------------------"""

src = src[:match.start()] + new_block + src[match.end():]
FILE.write_text(src, encoding='utf-8')
print("✅ تم تطبيق التصميم النصي للقناة بنجاح.")
