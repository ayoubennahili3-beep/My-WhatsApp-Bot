#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# كنقلبو على النص (سواء كان بالحروف العادية ولا المزخرفة) وكنمسحوه مع الأسطر الخاوية اللي من بعدو
pattern = r"(𝑻𝑯𝑬 𝑬𝑴𝑷𝑬𝑹𝑶𝑹 𝑨𝒀𝑶𝑼𝑩|THE EMPEROR AYOUB)\s*🌹?\s*"

new_src, count = re.subn(pattern, "", src)

if count > 0:
    FILE.write_text(new_src, encoding='utf-8')
    print(f"✅ تم حذف 'THE EMPEROR AYOUB 🌹' بنجاح (عدد التطابقات: {count}).")
else:
    print("⚠️ ما لقيتش النص بضبط. غادي نعرض ليك الكود ديال .ملك باش نشوفوه.")
    # إلا ما لقيناهش، كنطبعو البلوك ديال .ملك
    match = re.search(r"command\s*===\s*['\"]ملك['\"].*?(continue;)", src, re.DOTALL)
    if match:
        print("--- بداية الكود ---")
        print(match.group(0)[:800])
        print("--- نهاية الكود ---")
    else:
        print("❌ ما لقيتش أمر .ملك.")

print("DONE")
