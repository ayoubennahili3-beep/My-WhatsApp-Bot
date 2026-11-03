from pathlib import Path
import json

FILE = Path.home() / "bot-commands.json"
data = json.loads(FILE.read_text(encoding='utf-8'))

commands_to_check = ["خفض", "fm", "dm", "of"]
for cmd in commands_to_check:
    if cmd not in data:
        data.append(cmd)
        print(f"✅ تم إضافة {cmd} لملف الأوامر")

FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print("✅ ملف bot-commands.json محدث")
