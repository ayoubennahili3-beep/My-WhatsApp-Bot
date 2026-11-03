#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو بداية دالة sock.sendMessage (بلا ما نهتمو بالمسافات)
start_pattern = r"(sock\.sendMessage\s*=\s*async\s*\(jid,\s*content,\s*options\)\s*=>\s*\{)"
# نلقاو فين كيتصيفط الطلب الأصلي
end_pattern = r"(const\s+result\s*=\s*await\s+originalSendMessage\(jid,\s*content,\s*options\);)"

start_match = re.search(start_pattern, src)
end_match = re.search(end_pattern, src)

if not start_match or not end_match:
    print("❌ ما لقيتش مكان الإدراج.")
    raise SystemExit(1)

# الكود اللي غادي نحطو قبل const result
injection_code = """
        // --- AUTO INTERACTIVE TEXT UI ---
        if (content && typeof content.text === 'string' && !content.image && !content.video && !content.audio && !content.document && !content.interactiveButtons && !content.mentions) {
            try {
                const { sendInteractiveMessage } = require('zqbaileys_helper');
                const res = await sendInteractiveMessage(sock, jid, {
                    title: '𝐓𝐎𝐉𝐈 𝐅𝐔𝐒𝐇𝐈𝐆𝐔𝐑𝐎 🌹',
                    text: content.text,
                    footer: '',
                    interactiveButtons: [{
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'عرض القناة',
                            url: 'https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i',
                            merchant_url: 'https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i'
                        })
                    }]
                }, options);
                
                // Speed monitor logic
                try {
                    const quotedId = options?.quoted?.key?.id;
                    const pending = quotedId ? speedPending.get(quotedId) : null;
                    if (pending) {
                        speedPending.delete(quotedId);
                        const elapsed = Number(process.hrtime.bigint() - pending.startedAt) / 1e6;
                        let data = { commands: {} };
                        try {
                            if (fs.existsSync(speedStatsFile)) {
                                data = JSON.parse(fs.readFileSync(speedStatsFile, 'utf8'));
                            }
                        } catch (_) {}
                        if (!data.commands) data.commands = {};
                        const item = data.commands[pending.command] || { count: 0, totalMs: 0, maxMs: 0, lastMs: 0 };
                        item.count++;
                        item.totalMs += elapsed;
                        item.maxMs = Math.max(item.maxMs, elapsed);
                        item.lastMs = elapsed;
                        item.avgMs = item.totalMs / item.count;
                        item.lastAt = new Date().toISOString();
                        data.commands[pending.command] = item;
                        const tempFile = speedStatsFile + '.tmp';
                        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
                        fs.renameSync(tempFile, speedStatsFile);
                    }
                } catch (e) {
                    console.error('SPEED STATS ERROR (interactive):', e.message);
                }

                return res;
            } catch (err) {
                console.error('[AUTO TOJI TEXT ERROR]', err.message);
                // إلا طاح الزر، كنرجعو نصيفطو النص العادي
            }
        }
        // --- END AUTO INTERACTIVE TEXT UI ---

        """

# كنحطو الكود قبل نهاية البحث
src = src[:end_match.start()] + injection_code + src[end_match.start():]

FILE.write_text(src, encoding='utf-8')
print("✅ تم إضافة التصميم التفاعلي لجميع النصوص بنجاح (بالطريقة الذكية).")
print("DONE")
