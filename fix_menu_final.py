#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json
import re

# 1. تحديث ملف bot-commands.json
json_file = Path.home() / "bot-commands.json"
data = json.loads(json_file.read_text(encoding='utf-8'))

new_cmds = ["رابط", "جهات", "خفض"]
for cmd in new_cmds:
    if cmd not in data:
        data.append(cmd)
        print(f"✅ تم إضافة {cmd} لملف bot-commands.json")
    else:
        print(f"ℹ️ {cmd} راه موجود فـ bot-commands.json")

json_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

# 2. تحديث الكود باش يصنفهم تحت المجموعات
js_file = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = js_file.read_text(encoding='utf-8')

# نلقاو السطر ديال groupCommands ونبدلوه بلي فيه كلشي
pattern = r"const groupCommands = \[.*?\];"
new_group_line = "const groupCommands = ['قفل', 'فتح', 'ترقية', 'منشن', 'طرد', 'تبنيد', 'kickall', 'خفض', 'رابط', 'جهات'];"

if re.search(pattern, src):
    src = re.sub(pattern, new_group_line, src, count=1)
    print("✅ تم تحديث groupCommands فـ الكود باش يشمل الأوامر الجديدة")
else:
    print("⚠️ ما لقيتش groupCommands فـ الكود")

js_file.write_text(src, encoding='utf-8')
print("DONE")
