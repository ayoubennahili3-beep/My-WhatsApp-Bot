#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-speedmenu-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# الكود القديم ديال pairColumns
old_func = r"const pairColumns = \(left, right\) => \{.*?return rows;\s*\};"

# الكود الجديد (أسرع بزاف)
new_func = """const pairColumns = (left, right) => {
                        const rows = [];
                        const count = Math.max(left.length, right.length);
                        for (let i = 0; i < count; i++) {
                            const l = left[i] ? shown(left[i]) : '';
                            const r = right[i] ? shown(right[i]) : '';
                            if (l.length > 18 || r.length > 18) {
                                if (l) rows.push(l);
                                if (r) rows.push(r);
                                continue;
                            }
                            // تبسيط التنسيق باش يكون أسرع
                            const lPad = l + ' '.repeat(14 - l.length);
                            const rPad = ' '.repeat(13 - r.length) + r;
                            rows.push(lPad + ' │ ' + rPad);
                        }
                        return rows;
                    };"""

match = re.search(old_func, src, re.DOTALL)
if not match:
    print("ERROR: pairColumns not found")
    raise SystemExit(1)

src = src[:match.start()] + new_func + src[match.end():]

# تخزين القائمة باش ما تتحسبش كل مرة
# نضيفو متغير فوق باش نخزنو فيه القائمة
cache_code = """
let __cachedCaption = null;
let __cachedCommandsHash = '';
"""

# نلقاو فين نضيفو الكاش (قبل start)
if "let __cachedCaption" not in src:
    src = src.replace("let reconnectTimer = null;", "let __cachedCaption = null;\nlet reconnectTimer = null;", 1)

# فـ بلاصة بناء caption، نخليو الكود يستعمل الكاش
# نلقاو فين كيتبنى caption
old_caption_build = "const caption = ["
new_caption_build = """
                    const currentHash = rawCommands.join(',');
                    if (__cachedCaption && __cachedCommandsHash === currentHash) {
                        // استعمل الكاش
                    } else {
                        // يبني القائمة الجديدة
                        __cachedCommandsHash = currentHash;
                    }
                    
                    const caption = ["""

# ملاحظة: هنا غير كنشرحو، التعديل الحقيقي كيحتاج نغيرو الهيكلة كاملة.
# باش نكونو آمنين، غادي نصلحو غير pairColumns دابا.

FILE.write_text(src, encoding='utf-8')
print("DONE: pairColumns optimized")
