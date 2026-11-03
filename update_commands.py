#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json
from datetime import datetime

FILE = Path.home() / "bot-commands.json"
backup = FILE.parent / ("bot-commands.json.before-delete-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(FILE.read_text(encoding='utf-8'), encoding='utf-8')
print("BACKUP:", backup.name)

data = json.loads(FILE.read_text(encoding='utf-8'))
print("BEFORE:", len(data), "commands")

# الأوامر اللي تحذفو
to_remove = ["عائلة", "تفكير", "سياسة", "The two princes are intelligent",
             "فزياء", "من هو اقوى", "من هو عظيم", "اقتباس", "أما تحب",
             "two princes", "the two princes", "the two princes ayoub"]

# نحذفو
data = [cmd for cmd in data if cmd not in to_remove]
print("AFTER:", len(data), "commands")
print("REMOVED:", len(to_remove))

FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print("DONE")
