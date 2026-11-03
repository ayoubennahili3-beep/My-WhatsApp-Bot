#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

backup = FILE.parent / (FILE.stem + ".before-cleanpair-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# الكود القديم ديال pairColumns (فيه الإطارات)
old_func = r"const pairColumns = \(left, right\) => \{.*?return rows;\s*\};"

# الكود الجديد (بلا إطارات، غير الجدول)
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
                            const leftCell = l.padEnd(14, ' ');
                            const rightCell = r.padStart(13, ' ');
                            rows.push(leftCell + ' │ ' + rightCell);
                        }
                        return rows;
                    };"""

match = re.search(old_func, src, re.DOTALL)
if not match:
    print("ERROR: pairColumns not found")
    raise SystemExit(1)

src = src[:match.start()] + new_func + src[match.end():]
FILE.write_text(src, encoding='utf-8')
print("DONE: pairColumns cleaned (no borders)")
