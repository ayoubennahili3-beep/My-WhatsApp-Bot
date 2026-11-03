#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json

FILE = Path.home() / "bot-commands.json"
data = json.loads(FILE.read_text(encoding='utf-8'))

# الأوامر اللي بغينا نزيدو
new_commands = ["fm", "dm", "of", "تفعيل"]

for cmd in new_commands:
    if cmd not in data:
        data.append(cmd)
        print(f"✅ تمت إضافة: {cmd}")
    else:
        print(f"ℹ️ راه موجود مسبقاً: {cmd}")

FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print("DONE: Menu updated")
