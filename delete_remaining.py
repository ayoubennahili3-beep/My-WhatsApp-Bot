#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-remaining-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

lines = src.split('\n')

def find_block_end(lines, start_idx):
    depth = 0
    started = False
    i = start_idx
    while i < len(lines):
        for ch in lines[i]:
            if ch == '{':
                depth += 1
                started = True
            elif ch == '}':
                depth -= 1
        if started and depth == 0:
            return i
        i += 1
    return -1

# أنماط البحث (regex)
patterns = [
    r"تفكير",
    r"فزياء",
    r"The two princes are intelligent"
]

blocks_to_delete = []
i = 0
while i < len(lines):
    line = lines[i]
    for pat in patterns:
        if pat in line and ("command" in line or "test" in line):
            end = find_block_end(lines, i)
            if end > i:
                blocks_to_delete.append((i, end))
            break
    i += 1

# حذف من الآخر للأول
blocks_to_delete.sort(reverse=True)
total = 0
for start, end in blocks_to_delete:
    del lines[start:end+1]
    total += (end - start + 1)

result = '\n'.join(lines)
FILE.write_text(result, encoding='utf-8')
print(f"DONE: deleted {len(blocks_to_delete)} blocks, {total} lines")
print(f"New size: {len(result)} chars, {len(lines)} lines")
