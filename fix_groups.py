#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-groupfix-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# الكود القديم (عمود واحد)
old = """                        ...(availableGroupCommands.length
                            ? availableGroupCommands.map(shown)
                            : ['لا توجد أوامر مجموعة مسجلة']),"""

# الكود الجديد (جوج أعمدة)
new = """                        ...(availableGroupCommands.length
                            ? pairColumns(
                                availableGroupCommands.slice(0, Math.ceil(availableGroupCommands.length / 2)),
                                availableGroupCommands.slice(Math.ceil(availableGroupCommands.length / 2))
                            )
                            : ['لا توجد أوامر مجموعة مسجلة']),"""

if old not in src:
    print("ERROR: old block not found")
    raise SystemExit(1)

src = src.replace(old, new, 1)
FILE.write_text(src, encoding='utf-8')
print("DONE: groups now in 2 columns")
