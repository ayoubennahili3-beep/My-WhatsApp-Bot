#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نعدلو رسالة أمر .رابط
old_link_msg = """await sock.sendMessage(from, { 
                            text: state.links ? '🛡️ *تم منع روابط.*' : '🛑 *تم إلغاء منع الروابط.*' 
                        }, { quoted: mek });"""
new_link_msg = """await sock.sendMessage(from, { 
                            text: state.links ? '🛡️ *تم منع روابط.*' : '🛑 *إلغاء رابط*' 
                        }, { quoted: mek });"""

if old_link_msg in src:
    src = src.replace(old_link_msg, new_link_msg, 1)
    print("✅ تم تحديث رسالة .رابط")

# 2. نعدلو رسالة أمر .جهات
old_contact_msg = """await sock.sendMessage(from, { 
                            text: state.contacts ? '🛡️ *تم منع جهات اتصال.*' : '🛑 *تم إلغاء منع جهات الاتصال.*' 
                        }, { quoted: mek });"""
new_contact_msg = """await sock.sendMessage(from, { 
                            text: state.contacts ? '🛡️ *تم منع جهات اتصال.*' : '🛑 *إلغاء جهات*' 
                        }, { quoted: mek });"""

if old_contact_msg in src:
    src = src.replace(old_contact_msg, new_contact_msg, 1)
    print("✅ تم تحديث رسالة .جهات")

FILE.write_text(src, encoding='utf-8')
print("DONE")
