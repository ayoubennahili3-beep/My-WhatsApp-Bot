#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نتأكدو أن state كيتخلق مع suspects Set
old_state = "let state = radarGroups.get(from) || { mode: 'off' };"
new_state = "let state = radarGroups.get(from) || { mode: 'off', suspects: new Set() };"

if old_state in src:
    src = src.replace(old_state, new_state, 1)
    print("✅ تم إصلاح تعريف المتغير state")
else:
    print("⚠️ تعريف state ماشي هو اللي كنت متوقع، غادي نكملو")

# 2. نزيدو تسجيل المشتبه فيه فـ وضع الرصد
old_radar = """                            // 1. وضع الرصد: تنبيه
                            if (radarState.mode === 'radar') {
                                await sock.sendMessage(from, {"""

new_radar = """                            // 1. وضع الرصد: تنبيه + تسجيل فـ اللائحة
                            if (radarState.mode === 'radar') {
                                // تسجيل المشتبه فيه
                                if (!radarState.suspects) radarState.suspects = new Set();
                                if (!radarState.suspects.has(sender)) {
                                    radarState.suspects.add(sender);
                                    radarGroups.set(from, radarState);
                                }
                                
                                await sock.sendMessage(from, {"""

if old_radar in src:
    src = src.replace(old_radar, new_radar, 1)
    print("✅ تم إضافة تسجيل المشتبهين فـ وضع الرصد")
else:
    print("❌ ما لقيتش كود الرصد القديم")

FILE.write_text(src, encoding='utf-8')
print("DONE")
