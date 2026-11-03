#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# الكود القديم اللي فيه الخطأ
old_block = """if (command === 'رابط' || command === 'جهات') {
                    if (!from.endsWith('@g.us')) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    let isAllowed = mek.key.fromMe;
                    if (!isAllowed) {
                        try {
                            const md = await sock.groupMetadata(from);
                            const p = md.participants.find(x => x.id === (mek.key.participant || senderNumber + '@s.whatsapp.net'));
                            if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isAllowed = true;
                        } catch (_) {}
                    }"""

# الكود الجديد اللي فيه الإصلاح (حطينا الرقم ديال المرسل مباشرة)
new_block = """if (command === 'رابط' || command === 'جهات') {
                    if (!from.endsWith('@g.us')) {
                        await sock.sendMessage(from, { text: '⚠️ هاد الأمر غير فـ المجموعات.' }, { quoted: mek });
                        continue;
                    }
                    
                    const senderJid = mek.key.participant || mek.key.remoteJid;
                    const senderNum = senderJid.split('@')[0];
                    
                    let isAllowed = mek.key.fromMe;
                    if (!isAllowed) {
                        try {
                            const md = await sock.groupMetadata(from);
                            const p = md.participants.find(x => x.id === senderJid || x.id.includes(senderNum));
                            if (p && (p.admin === 'admin' || p.admin === 'superadmin')) isAllowed = true;
                        } catch (_) {}
                    }"""

if old_block in src:
    src = src.replace(old_block, new_block, 1)
    print("✅ تم إصلاح مشكل senderNumber فـ .رابط و .جهات")
else:
    print("⚠️ ما لقيتش البلوك القديم بالضبط. غادي نستعملو regex")

# كإجراء احتياطي إلا ما لقاهش
import re
pattern = r"if \(command === 'رابط' \|\| command === 'جهات'\) \{.*?let isAllowed = mek\.key\.fromMe;.*?try \{.*?const md = await sock\.groupMetadata\(from\);.*?const p = md\.participants\.find\(x => x\.id === \(mek\.key\.participant \|\| senderNumber \+ '@s\.whatsapp\.net'\)\);.*?if \(p && \(p\.admin === 'admin' \|\| p\.admin === 'superadmin'\)\) isAllowed = true;.*?\} catch \(_\) \{\}\s*\}"
if re.search(pattern, src, re.DOTALL) and "senderJid" not in src:
    src = re.sub(pattern, new_block, src, flags=re.DOTALL)
    print("✅ تم الإصلاح بطريقة Regex")

FILE.write_text(src, encoding='utf-8')
print("DONE")
