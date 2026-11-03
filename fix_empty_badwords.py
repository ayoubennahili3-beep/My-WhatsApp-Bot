#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نقراو الكلمات من الملف
words_file = Path.home() / "bad-words.txt"
try:
    custom_words = [line.strip() for line in words_file.read_text(encoding='utf-8').splitlines() if line.strip()]
    print(f"✅ لقيت {len(custom_words)} كلمة فـ bad-words.txt")
except Exception as e:
    print(f"❌ مشكل فـ قراءة bad-words.txt: {e}")
    custom_words = []

# 2. نلقاو badWordsList ونبدلو بالكلمات الحقيقية
pattern = r"const badWordsList = \[.*?\];"
match = re.search(pattern, src, re.DOTALL)

if match:
    new_list = f"const badWordsList = {json.dumps(custom_words, ensure_ascii=False)};"
    src = src[:match.start()] + new_list + src[match.end():]
    print("✅ تم تحديث badWordsList بالكلمات الحقيقية")
else:
    print("❌ ما لقيتش badWordsList.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
