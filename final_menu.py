#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-finalmenu-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# 1. نستخرجو caption الجديدة (1996) - من const caption = [ حتى ].join('\n');
pattern_new = r"                        const caption = \[.*?\]\.join\('\\n'\);"
match_new = re.search(pattern_new, src, re.DOTALL)
if not match_new:
    print("ERROR: new caption not found")
    raise SystemExit(1)

new_caption_code = match_new.group(0)
print("NEW caption length:", len(new_caption_code))

# 2. نحذفو caption الجديدة من مكانها
src = src[:match_new.start()] + src[match_new.end():]

# 3. نلقاو caption القديمة
pattern_old = r"                    const caption = \[.*?\]\.join\('\\n'\);"
match_old = re.search(pattern_old, src, re.DOTALL)
if not match_old:
    print("ERROR: old caption not found")
    raise SystemExit(1)

# 4. نبدلو caption القديمة بالجديدة
src = src[:match_old.start()] + new_caption_code + src[match_old.end():]

FILE.write_text(src, encoding='utf-8')
print("DONE: new caption moved, old caption removed")
