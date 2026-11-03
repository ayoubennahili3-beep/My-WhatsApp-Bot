#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نمسحو أي بلوك قديم للرصد (سواء كان مكسور ولا لا)
start_marker = "// --- RADAR & SUBMIT LOGIC ---"
end_marker = "// --- END RADAR & SUBMIT LOGIC ---"

while start_marker in src and end_marker in src:
    start_idx = src.find(start_marker)
    end_idx = src.find(end_marker, start_idx)
    if start_idx != -1 and end_idx != -1:
        src = src[:start_idx] + src[end_idx + len(end_marker):]

# 2. الكود الجديد ديال الرصد والهجوم
radar_logic = """
                    // --- RADAR & SUBMIT LOGIC ---
                    const radarState = radarGroups.get(from);
                    if (radarState && radarState.mode !== 'off' && from.endsWith('@g.us') && !mek.key.fromMe) {
                        const sender = mek.key.participant || mek.key.remoteJid;
                        const senderNumber = sender.split('@')[0];
                        const textMsg = (body || '').trim();

                        if (/^[.\\/!]/.test(textMsg) && textMsg.length > 1) {
                            
                            // 1. وضع الرصد: تنبيه
                            if (radarState.mode === 'radar') {
                                await sock.sendMessage(from, {
                                    text: `📡 *تنبيه رصد*\\n\\n⚠️ العضو: @${senderNumber}\\n🤖 يبدو أنه رابط بوت.\\n> للهجوم: .اخضع\\n> للإلغاء: .الغاء`,
                                    mentions: [sender]
                                }, { quoted: mek }).catch(() => {});
                            }
                            
                            // 2. وضع الهجوم: طرد فوري + رسالة
                            else if (radarState.mode === 'submit') {
                                try {
                                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                    await sock.sendMessage(from, {
                                        text: `✅ *تم طرد صاحب بوت مشتبه به.*`,
                                        mentions: [sender]
                                    }, { quoted: mek }).catch(() => {});
                                } catch (err) {
                                    console.error(`[RADAR KICK ERROR] ❌ فشل الطرد:`, err.message);
                                    await sock.sendMessage(from, { 
                                        text: `❌ *فشل الطرد (ممكن يكون أدمن).*` 
                                    }, { quoted: mek }).catch(() => {});
                                }
                            }
                        }
                    }
                    // --- END RADAR & SUBMIT LOGIC ---
"""

# 3. نلقاو فين كيتعرف body باش نحطو الكود من بعدو مباشرة
# كنقلبو على شي حاجة بحال: const body = ... أو let body = ...
match = re.search(r"(const|let)\s+body\s*=\s*.*?;", src)
if not match:
    print("❌ ما لقيتش فين كيتعرف body")
    raise SystemExit(1)

# 4. كنحطو الكود من بعد ما يتعرف body
insert_pos = match.end()
src = src[:insert_pos] + "\n" + radar_logic + src[insert_pos:]

FILE.write_text(src, encoding='utf-8')
print("✅ تم تركيب كود الرصد فـ البلاصة الصحيحة 100%")
