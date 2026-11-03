#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
if not FILE.exists():
    print("ERROR: file not found:", FILE)
    raise SystemExit(1)

src = FILE.read_text(encoding='utf-8')
backup = FILE.parent / (FILE.stem + ".before440-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

# 1) add counters after reconnectTimer declaration
old1 = "let reconnectTimer = null;"
new1 = "let reconnectTimer = null;\nlet reconnectAttempts = 0;\nconst MAX_RECONNECT_DELAY = 60000;"
if old1 not in src:
    print("ERROR: reconnectTimer not found"); raise SystemExit(1)
src = src.replace(old1, new1, 1)

# 2) insert 440 handler before 401 check
old2 = "            if (statusCode === 401) {"
new2 = """            if (statusCode === 440) {
                reconnectAttempts++;
                const delay440 = Math.min(30000 * reconnectAttempts, MAX_RECONNECT_DELAY);
                console.log('440 conflict, attempt ' + reconnectAttempts + ', retry in ' + (delay440/1000) + 's');
                if (reconnectTimer) clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(() => {
                    reconnectTimer = null;
                    start().catch(err => console.log('reconnect error:', err.message));
                }, delay440);
                return;
            }

            if (statusCode === 401) {"""
if old2 not in src:
    print("ERROR: 401 block not found"); raise SystemExit(1)
src = src.replace(old2, new2, 1)

# 3) exponential backoff for default reconnect
old3 = """            if (!reconnectTimer) {
                reconnectTimer = setTimeout(() => {
                    reconnectTimer = null;
                    start().catch(err => console.log('\u274c \u062e\u0637\u0623 \u0641\u064a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644:', err.message));
                }, 5000);
            }"""
new3 = """            if (!reconnectTimer) {
                reconnectAttempts++;
                const backoff = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
                console.log('reconnect attempt ' + reconnectAttempts + ' in ' + (backoff/1000) + 's');
                reconnectTimer = setTimeout(() => {
                    reconnectTimer = null;
                    start().catch(err => console.log('reconnect error:', err.message));
                }, backoff);
            }"""
if old3 not in src:
    print("WARN: default reconnect block not found (skipping)")
else:
    src = src.replace(old3, new3, 1)

# 4) reset counter on open
old4 = """        } else if (connection === 'open') {
            console.log('\u2705 \u062a\u0645 \u0627\u062a\u0635\u0627\u0644 \u0627\u0644\u0628\u0648\u062a \u0628\u0646\u062c\u0627\u062d \u0648\u0647\u0648 \u062c\u0627\u0647\u0632 \u0627\u0644\u0622\u0646 \u0644\u0627\u0633\u062a\u0642\u0628\u0627\u0644 \u0627\u0644\u0623\u0648\u0627\u0645\u0631!');
        }"""
new4 = """        } else if (connection === 'open') {
            reconnectAttempts = 0;
            console.log('\u2705 \u062a\u0645 \u0627\u062a\u0635\u0627\u0644 \u0627\u0644\u0628\u0648\u062a \u0628\u0646\u062c\u0627\u062d \u0648\u0647\u0648 \u062c\u0627\u0647\u0632 \u0627\u0644\u0622\u0646 \u0644\u0627\u0633\u062a\u0642\u0628\u0627\u0644 \u0627\u0644\u0623\u0648\u0627\u0645\u0631!');
        }"""
if old4 not in src:
    print("WARN: open block not found (skipping reset)")
else:
    src = src.replace(old4, new4, 1)

FILE.write_text(src, encoding='utf-8')
print("DONE: patched", FILE.name)
