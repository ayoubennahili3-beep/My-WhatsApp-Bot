#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
if not FILE.exists():
    print("ERROR: file not found")
    raise SystemExit(1)

src = FILE.read_text(encoding='utf-8')
backup = FILE.parent / (FILE.stem + ".beforelock-" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".js")
backup.write_text(src, encoding='utf-8')
print("BACKUP:", backup.name)

LOCK_BLOCK = '''// ==================== [ LOCK FILE - منع التشغيل المزدوج ] ====================
const __LOCK_PATH = require('path').join(require('os').homedir(), '.toji-bot.lock');
(function() {
    try {
        if (require('fs').existsSync(__LOCK_PATH)) {
            const __oldPid = parseInt(require('fs').readFileSync(__LOCK_PATH, 'utf8').trim(), 10);
            if (__oldPid && __oldPid !== process.pid) {
                try {
                    process.kill(__oldPid, 0);
                    console.log('WARNING: Bot already running (PID: ' + __oldPid + '). Exiting.');
                    process.exit(0);
                } catch (e) {}
            }
        }
        require('fs').writeFileSync(__LOCK_PATH, String(process.pid));
        process.on('exit', () => { try { require('fs').unlinkSync(__LOCK_PATH); } catch (_) {} });
        process.on('SIGINT', () => { try { require('fs').unlinkSync(__LOCK_PATH); } catch (_) {} process.exit(0); });
        process.on('SIGTERM', () => { try { require('fs').unlinkSync(__LOCK_PATH); } catch (_) {} process.exit(0); });
    } catch (e) {
        console.log('WARNING: lock file setup failed:', e.message);
    }
})();
// =====================================================================

'''

anchor = "const handleImagine = require('./commands/imagine.js');"
if anchor not in src:
    print("ERROR: anchor not found")
    raise SystemExit(1)

src = src.replace(anchor, LOCK_BLOCK + anchor, 1)
FILE.write_text(src, encoding='utf-8')
print("DONE: lock added to", FILE.name)
