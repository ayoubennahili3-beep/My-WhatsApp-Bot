#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-cleanmenu-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

NEW_MENU = r'''                        const caption = [
                        '🌹 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐 𓂀 👑',
                        '',
                        '👑 الملك: 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐 𓂀',
                        '⚜️ المطوّر: 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐 𓂀',
                        '🤖 الحالة: يعمل بنجاح ✅',
                        '📊 عدد الأوامر: ' + rawCommands.length,
                        '',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        '✦ 𝐀𝐑𝐀𝐁𝐈𝐂 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        ...pairColumns(
                            arabicCommands.slice(0, Math.ceil(arabicCommands.length / 2)),
                            arabicCommands.slice(Math.ceil(arabicCommands.length / 2))
                        ),
                        '',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        '✦ 𝐅𝐎𝐑𝐄𝐈𝐆𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        ...pairColumns(
                            foreignCommands.slice(0, Math.ceil(foreignCommands.length / 2)),
                            foreignCommands.slice(Math.ceil(foreignCommands.length / 2))
                        ),
                        '',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        '✦ 𝐆𝐑𝐎𝐔𝐏 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        ...(availableGroupCommands.length
                            ? pairColumns(
                                availableGroupCommands.slice(0, Math.ceil(availableGroupCommands.length / 2)),
                                availableGroupCommands.slice(Math.ceil(availableGroupCommands.length / 2))
                            )
                            : ['لا توجد أوامر مجموعة']),
                        '',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        '✦ 𝐌𝐄𝐃𝐈𝐀 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        ...pairColumns(
                            availableMediaCommands.slice(0, Math.ceil(availableMediaCommands.length / 2)),
                            availableMediaCommands.slice(Math.ceil(availableMediaCommands.length / 2))
                        ),
                        '',
                        '━━━━━━━━━━━━━━━━━━━━━━',
                        '🌹 POWER • PRECISION • ELEGANCE 🌹'
                    ].join('\n');
'''

pattern = r"                        const caption = \[.*?\]\.join\('\\n'\);"
match = re.search(pattern, src, re.DOTALL)
if not match:
    print("ERROR: caption not found")
    raise SystemExit(1)

src = src[:match.start()] + NEW_MENU.strip() + src[match.end():]
FILE.write_text(src, encoding='utf-8')
print("DONE: clean menu applied")
