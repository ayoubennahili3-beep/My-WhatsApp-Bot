#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نلقاو بلوك .الغاء ونبدلوه بالكود الذكي
pattern = r"if \(command === 'الغاء'\) \{.*?continue;\s*\}"
new_cancel = """if (command === 'الغاء') {
                        let cancelled = false;
                        
                        // 1. إلغاء الرصد/الهجوم (إلا كان شاعل)
                        if (state && state.mode !== 'off') {
                            state.mode = 'off';
                            state.suspects.clear();
                            radarGroups.set(from, state);
                            await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر هجوم*' }, { quoted: mek });
                            cancelled = true;
                        }
                        
                        // 2. إلغاء مضاد الشتائم (إلا كان شاعل)
                        if (typeof badWordGroups !== 'undefined' && badWordGroups.has(from)) {
                            badWordGroups.delete(from);
                            await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر شتائم*' }, { quoted: mek });
                            cancelled = true;
                        }
                        
                        // 3. إلا ما كان حتى شي حاجة شاعلة
                        if (!cancelled) {
                            await sock.sendMessage(from, { text: '⚠️ ما كاين حتى أمر نشط باش يتلغى.' }, { quoted: mek });
                        }
                        continue;
                    }"""

src = re.sub(pattern, new_cancel, src, flags=re.DOTALL)
print("✅ تم تحديث أمر .الغاء باش يفرق بين الهجوم والشتائم")

# 2. نصلحو رسالة .إيقاف (خاصة بالشتائم) باش تقول نفس الكلام
old_if = """} else if (command === 'إيقاف') {
                        badWordGroups.delete(from);
                        await sock.sendMessage(from, { text: '🛑 *تم إيقاف مضاد الشتائم.*' }, { quoted: mek });
                    }"""
new_if = """} else if (command === 'إيقاف') {
                        badWordGroups.delete(from);
                        await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر شتائم*' }, { quoted: mek });
                    }"""

if old_if in src:
    src = src.replace(old_if, new_if, 1)
    print("✅ تم تحديث رسالة .إيقاف باش تقول 'شتائم'")

FILE.write_text(src, encoding='utf-8')
print("DONE")
