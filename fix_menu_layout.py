#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نضيفو 'خفض' لـ groupCommands
old_group = "const groupCommands = ['قفل', 'فتح', 'ترقية', 'منشن', 'طرد', 'تبنيد', 'kickall'];"
new_group = "const groupCommands = ['قفل', 'فتح', 'ترقية', 'منشن', 'طرد', 'تبنيد', 'kickall', 'خفض'];"

if old_group in src:
    src = src.replace(old_group, new_group, 1)
    print("✅ تم إضافة 'خفض' لقسم المجموعات (GROUP COMMANDS)")

# 2. نحيدو 'fm', 'dm', 'of' من controlCommands باش يبانو فـ FOREIGN
old_control = "const controlCommands = ['vv', 'a', 's', 'fm', 'dm', 'of'];"
new_control = "const controlCommands = ['vv', 'a', 's'];"

if old_control in src:
    src = src.replace(old_control, new_control, 1)
    print("✅ تم تحرير fm, dm, of من قسم التحكم باش يبانو فـ FOREIGN")

FILE.write_text(src, encoding='utf-8')
print("DONE")
