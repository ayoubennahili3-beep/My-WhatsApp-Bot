#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json
from datetime import datetime

FILE = Path.home() / "bot-commands.json"
backup = FILE.parent / ("bot-commands.json.before-radar-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(FILE.read_text(encoding='utf-8'), encoding='utf-8')
print("BACKUP:", backup.name)

data = json.loads(FILE.read_text(encoding='utf-8'))
print("BEFORE:", len(data), "commands")

new_commands = ["رصد", "اخضع", "الغاء"]

for cmd in new_commands:
    if cmd not in data:
        data.append(cmd)
        print(f"✅ تمت إضافة: .{cmd}")
    else:
        print(f"ℹ️ موجود مسبقاً: .{cmd}")

# إزالة أي تكرار والحفاظ على الترتيب
seen = set()
unique = []
for c in data:
    if c not in seen:
        seen.add(c)
        unique.append(c)

FILE.write_text(json.dumps(unique, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"AFTER: {len(unique)} commands")
print("DONE")
