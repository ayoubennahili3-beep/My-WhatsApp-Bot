#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نبدلو الشرط باش يقبل notify و append
old_condition = "if (type !== 'notify') {"
new_condition = "if (type !== 'notify' && type !== 'append') {"

if old_condition in src:
    src = src.replace(old_condition, new_condition, 1)
    print("✅ تم تعديل الشرط باش يقبل append أيضاً")
else:
    print("⚠️ ما لقيتش الشرط. غادي نعطيك أوامر نلقاه.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
