#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-blockdelete-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

lines = src.split('\n')

# الأمر اللي بغينا نحذفو (كاملين)
target_commands = [
    "عائلة", "تفكير", "سياسة", "The two princes are intelligent",
    "فزياء", "من هو اقوى", "من هو عظيم", "اقتباس", "أما تحب"
]

def find_block_end(lines, start_idx):
    """كيلقا نهاية البلوك (مستوى تعشيش 0) بداية من start_idx"""
    depth = 0
    started = False
    i = start_idx
    while i < len(lines):
        line = lines[i]
        # نحسبو الأقواس
        for ch in line:
            if ch == '{':
                depth += 1
                started = True
            elif ch == '}':
                depth -= 1
        # إلا وصلنا لـ depth 0 بعد ما بدا، هادا هو النهاية
        if started and depth == 0:
            return i
        i += 1
    return -1

# نلقاو كل بلوك
blocks_to_delete = []
i = 0
while i < len(lines):
    line = lines[i]
    # نشوفو واش هاد السطر فيه بداية أمر من target_commands
    for cmd in target_commands:
        pattern = f"command === '{cmd}'"
        if pattern in line or f'command === "{cmd}"' in line:
            end = find_block_end(lines, i)
            if end > i:
                blocks_to_delete.append((i, end))
            break
    i += 1

# نحذفو البلوكات من الآخر للأول (باش ما يتبدلش الترقيم)
blocks_to_delete.sort(reverse=True)
total_deleted = 0
for start, end in blocks_to_delete:
    del lines[start:end+1]
    total_deleted += (end - start + 1)

result = '\n'.join(lines)
FILE.write_text(result, encoding='utf-8')
print(f"DONE: deleted {len(blocks_to_delete)} blocks, {total_deleted} lines")
print(f"New size: {len(result)} chars, {len(lines)} lines")
