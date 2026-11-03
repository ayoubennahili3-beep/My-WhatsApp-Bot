import json
from pathlib import Path
FILE = Path.home() / "bot-commands.json"
data = json.loads(FILE.read_text(encoding='utf-8'))
if "خفض" not in data:
    data.append("خفض")
    FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print("✅ تمت إضافة .خفض لقائمة .فحص")
else:
    print("ℹ️ .خفض راه موجود فـ القائمة")
