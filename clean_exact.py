#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json
from datetime import datetime

FILE = Path.home() / "bot-commands.json"
backup = FILE.parent / ("bot-commands.json.before-exact-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(FILE.read_text(encoding='utf-8'), encoding='utf-8')
print("BACKUP:", backup.name)

data = json.loads(FILE.read_text(encoding='utf-8'))
print("BEFORE:", len(data))

# الأوامر اللي خاصها تتحذف بالضبط
to_remove = [
    "اقتباس", "من هو اقوى", "من هو عظيم", "سياسة", "عائلة",
    "فزياء", "تفكير", "أما تحب", "أشكوا حزني",
    "two princes", "the two princes", "the two princes ayoub",
    "The two princes are intelligent"
]

# نحذفو غير اللي كاينين بالضبط
removed = []
new_data = []
for cmd in data:
    if cmd in to_remove:
        removed.append(cmd)
    else:
        new_data.append(cmd)

print("REMOVED:", removed)
print("AFTER:", len(new_data))
print("COMMANDS:", new_data)

FILE.write_text(json.dumps(new_data, ensure_ascii=False, indent=2), encoding='utf-8')
print("DONE")
