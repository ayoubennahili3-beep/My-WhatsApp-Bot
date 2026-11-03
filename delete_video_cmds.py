#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-delete-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# قائمة الأوامر اللي غادي نحذفو (بلوكات كاملة)
# كل بلوك كيبدا بـ if (command === '...') وينتهي بـ continue; ولا }
# هادشي معقد شوية، لذلك غادي نحذفو غير الأسطر المحددة بدقة
# أحسن طريقة: نحذفو الأسطر من الآخر للأول باش ما يتبدلش الترقيم

lines_to_delete = set()

# عائلة: 1062-1094 (البلوك كامل)
for i in range(1062, 1095):
    lines_to_delete.add(i)

# تفكير: 1283-1307
for i in range(1283, 1308):
    lines_to_delete.add(i)

# سياسة: 1309-1341
for i in range(1309, 1342):
    lines_to_delete.add(i)

# The two princes are intelligent: 1343-1390
for i in range(1343, 1391):
    lines_to_delete.add(i)

# فزياء: 1392-1428
for i in range(1392, 1429):
    lines_to_delete.add(i)

# من هو اقوى: 2362-2396
for i in range(2362, 2397):
    lines_to_delete.add(i)

# من هو عظيم: 2398-2435
for i in range(2398, 2436):
    lines_to_delete.add(i)

# اقتباس: 1255-1281 (فيديو 7aya2 + صوت motanabi2)
for i in range(1255, 1282):
    lines_to_delete.add(i)

# أما تحب: 1444-1470 (Empire + empty)
for i in range(1444, 1471):
    lines_to_delete.add(i)

# حذف الأسطر
lines = src.split('\n')
new_lines = [line for idx, line in enumerate(lines, 1) if idx not in lines_to_delete]

result = '\n'.join(new_lines)
FILE.write_text(result, encoding='utf-8')
print("DONE: deleted", len(lines_to_delete), "lines")
print("New file size:", len(result), "chars")
