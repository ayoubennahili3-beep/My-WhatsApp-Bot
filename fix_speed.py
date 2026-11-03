#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-speedfix-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# نلقاو وين كاين سطر "command === 'فحص'" باش نضيفو قبلو
anchor = "if (command === 'فحص') {"
if anchor not in src:
    print("ERROR: anchor not found")
    raise SystemExit(1)

# الكود الجديد ديال speed
speed_block = """if (command === 'speed') {
                    const start = Date.now();
                    const sentMsg = await sock.sendMessage(from, { text: '⚡ جاري قياس السرعة...' }, { quoted: mek });
                    const latency = Date.now() - start;
                    await sock.sendMessage(from, { text: `🚀 **السرعة الخارقة (2026):** ${latency}ms` }, { quoted: sentMsg });
                    continue;
                }
                
                """

# نضيفوه قبل 'فحص'
src = src.replace(anchor, speed_block + anchor, 1)

FILE.write_text(src, encoding='utf-8')
print("DONE: .speed block added")
