#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نضيفو الدالة المساعدة فوق (قبل start)
if "const sendTojiText = async" not in src:
    anchor = "async function start() {"
    helper_func = """const sendTojiText = async (sock, jid, text) => {
    try {
        const { sendInteractiveMessage } = require('zqbaileys_helper');
        await sendInteractiveMessage(sock, jid, {
            title: '𝑻𝑶𝑱𝑰 𝑭𝑼𝑺𝑯𝑰𝑮𝑼𝑹𝑶',
            text: text,
            footer: 'SUPPORT TOJI BOT',
            interactiveButtons: [{
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: 'عرض القناة',
                    url: 'https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i',
                    merchant_url: 'https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i'
                })
            }]
        });
    } catch (err) {
        console.error('[TOJI TEXT BUTTON ERROR]', err.message);
        // إلا فشل الزر، كنصيفطو النص عادي باش ما نضيعوش الرسالة
        await sock.sendMessage(jid, { text: text });
    }
};

async function start() {"""
    if anchor in src:
        src = src.replace(anchor, helper_func, 1)
        print("✅ تمت إضافة دالة sendTojiText")

# 2. نبدلو ردود .رصد و .اخضع و .الغاء باش تستعمل الدالة الجديدة
# رصد
old_radar = """await sock.sendMessage(from, { text: '📡 *تم تفعيل الرصد.*' }, { quoted: mek });"""
new_radar = """await sendTojiText(sock, from, '📡 *تم تفعيل الرصد.*');"""
if old_radar in src:
    src = src.replace(old_radar, new_radar, 1)
    print("✅ تم تحديث رد .رصد")

# اخضع
old_submit = """await sock.sendMessage(from, { text: '⚔️ *تم تفعيل وضع الهجوم.*' }, { quoted: mek });"""
new_submit = """await sendTojiText(sock, from, '⚔️ *تم تفعيل وضع الهجوم.*');"""
if old_submit in src:
    src = src.replace(old_submit, new_submit, 1)
    print("✅ تم تحديث رد .اخضع")

# الغاء
old_cancel = """await sock.sendMessage(from, { text: '🛑 *تم إلغاء الأمر.*' }, { quoted: mek });"""
new_cancel = """await sendTojiText(sock, from, '🛑 *تم إلغاء الأمر.*');"""
if old_cancel in src:
    src = src.replace(old_cancel, new_cancel, 1)
    print("✅ تم تحديث رد .الغاء")

FILE.write_text(src, encoding='utf-8')
print("DONE")
