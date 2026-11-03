#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-speedrestore-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# نمسحو البلوك اللي زدت أنا (القديم)
old_block = """if (command === 'speed') {
                    const start = Date.now();
                    const sentMsg = await sock.sendMessage(from, { text: '⚡ جاري قياس السرعة...' }, { quoted: mek });
                    const latency = Date.now() - start;
                    await sock.sendMessage(from, { text: `🚀 **السرعة الخارقة (2026):** ${latency}ms` }, { quoted: sentMsg });
                    continue;
                }
                
                """

if old_block not in src:
    print("ERROR: old speed block not found")
    raise SystemExit(1)

src = src.replace(old_block, "", 1)

# دابا نتأكدو بلي commandsMap كيتنفذ فـ الكود الرئيسي
# نلقاو فين كاين تنفيذ commandsMap
if "global.commandsMap.get" not in src:
    print("WARNING: commandsMap execution not found! Will add it.")
    # نضيفو تنفيذ commandsMap إلا ما كانش
    anchor = "if (command === 'فحص') {"
    cmap_block = """if (global.commandsMap && global.commandsMap.has(command)) {
                    try {
                        await global.commandsMap.get(command)(sock, mek, body.split(/\\s+/).slice(1));
                    } catch (e) {
                        console.error('خطأ في تنفيذ الأمر من commandsMap:', command, e.message);
                    }
                    continue;
                }
                
                """
    src = src.replace(anchor, cmap_block + anchor, 1)
    print("ADDED: commandsMap execution block")

FILE.write_text(src, encoding='utf-8')
print("DONE: old speed block removed, commandsMap check done")
