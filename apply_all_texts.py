#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نبدلو دالة sendTojiText القديمة عشان تولي غير تمرر الرسالة لـ sock.sendMessage
pattern_sendtoji = r"const sendTojiText = async \(sock, jid, text\) => \{.*?\};"
new_sendtoji = """const sendTojiText = async (sock, jid, text, quoted = null) => {
    try {
        const options = quoted ? { quoted } : {};
        return await sock.sendMessage(jid, { text: text }, options);
    } catch (err) {
        console.error('sendTojiText proxy error:', err.message);
    }
};"""
src = re.sub(pattern_sendtoji, new_sendtoji, src, flags=re.DOTALL)
print("✅ تم تحديث دالة sendTojiText باش تولي بروكسي")

# 2. نضيفو الاعتراض الذكي فـ sock.sendMessage
old_send_msg = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        
        const result = await originalSendMessage(jid, content, options);"""

new_send_msg = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        
        // --- AUTO INTERACTIVE TEXT UI ---
        // كنحولو غير النصوص، وكنتجاهلو الصور والفيديوهات والمنشنات
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
                
                // Speed monitor logic (باش نظام السرعة يبقى خدام مع الأزرار)
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

        const result = await originalSendMessage(jid, content, options);"""

if old_send_msg in src:
    src = src.replace(old_send_msg, new_send_msg, 1)
    print("✅ تم إضافة الاعتراض الذكي لـ sock.sendMessage")
else:
    print("❌ ما لقيتش كود sock.sendMessage")

FILE.write_text(src, encoding='utf-8')
print("DONE")
