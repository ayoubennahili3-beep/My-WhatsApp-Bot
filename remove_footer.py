#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو السطر ديال footer ونمسحوه
old_footer = "footer: 'SUPPORT TOJI BOT',"
new_footer = "footer: ''," # كنخليوه خاوي

if old_footer in src:
    src = src.replace(old_footer, new_footer, 1)
    print("✅ تم مسح 'SUPPORT TOJI BOT' من التذييل")
else:
    print("⚠️ ما لقيتش السطر ديال footer. يمكن تبدل.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
