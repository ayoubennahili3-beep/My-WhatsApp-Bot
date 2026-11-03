#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import json

FILE = Path.home() / "bot-commands.json"
data = json.loads(FILE.read_text(encoding='utf-8'))

# 🎯 هنا كتكتب الأمر اللي بغيتي تزيدو (بلا نقطة)
new_command = "خفض" 

if new_command not in data:
    data.append(new_command)
    FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ تمت إضافة الأمر '{new_command}' إلى قائمة .فحص بنجاح.")
else:
    print(f"ℹ️ الأمر '{new_command}' راه موجود مسبقاً فـ القائمة.")
    
print(f"📊 إجمالي عدد الأوامر دابا: {len(data)}")
