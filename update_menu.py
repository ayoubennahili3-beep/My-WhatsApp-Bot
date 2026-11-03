#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-menu-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# القائمة الجديدة كاملة
NEW_MENU = r'''
                    const caption = [
                        '╔══════════════════════════════════════╗',
                        '║   🌹 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐 𓂀  👑   ║',
                        '║     ⚜️  𝐅𝐑𝐈𝐄𝐍𝐃 𝐁𝐎𝐓  ⚜️      ║',
                        '╚══════════════════════════════════════╝',
                        '',
                        '👑 الملك: 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐 𓂀',
                        '⚜️ المطوّر: 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐 𓂀',
                        '🎨 المصمم: 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐 𓂀',
                        '🤖 الحالة: يعمل بنجاح ✅',
                        '📊 عدد الأوامر: ' + commandsList.length,
                        '',
                        '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮',
                        '┃      ✦ 𝐀𝐑𝐀𝐁𝐈𝐂 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦      ┃',
                        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯',
                        ...pairColumns(
                            arabicCommands.slice(0, Math.ceil(arabicCommands.length / 2)),
                            arabicCommands.slice(Math.ceil(arabicCommands.length / 2))
                        ),
                        '',
                        '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮',
                        '┃      ✦ 𝐅𝐎𝐑𝐄𝐈𝐆𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦     ┃',
                        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯',
                        ...pairColumns(
                            foreignCommands.slice(0, Math.ceil(foreignCommands.length / 2)),
                            foreignCommands.slice(Math.ceil(foreignCommands.length / 2))
                        ),
                        '',
                        '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮',
                        '┃     ✦ 𝐆𝐑𝐎𝐔𝐏 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦       ┃',
                        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯',
                        ...(availableGroupCommands.length
                            ? availableGroupCommands.map(shown)
                            : ['لا توجد أوامر مجموعة']),
                        '',
                        '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮',
                        '┃      ✦ 𝐌𝐄𝐃𝐈𝐀 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ✦       ┃',
                        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯',
                        ...pairColumns(
                            availableMediaCommands.slice(0, Math.ceil(availableMediaCommands.length / 2)),
                            availableMediaCommands.slice(Math.ceil(availableMediaCommands.length / 2))
                        ),
                        '',
                        '╔══════════════════════════════════════╗',
                        '║   🌹 𝐏𝐎𝐖𝐄𝐑 • 𝐏𝐑𝐄𝐂𝐈𝐒𝐈𝐎𝐍 • 𝐄𝐋𝐄𝐆𝐀𝐍𝐂𝐄 🌹   ║',
                        '║      ⚜️  بوت متطور • مطور محترف  ⚜️      ║',
                        '╚══════════════════════════════════════╝'
                    ].join('\n');
'''

# نلقاو بداية الكود القديم (من const caption = [ حتى ].join('\n');)
import re
pattern = r"const caption = \[.*?\]\.join\('\\n'\);"
match = re.search(pattern, src, re.DOTALL)
if not match:
    print("ERROR: caption not found")
    raise SystemExit(1)

src = src[:match.start()] + NEW_MENU.strip() + src[match.end():]
FILE.write_text(src, encoding='utf-8')
print("DONE: menu updated")
