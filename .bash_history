    print("✅ تم إرجاع كود عرض القناة (بلا رابط فـ النص)")
else:
    print("❌ ما لقيتش الكود القديم. غادي نعطيك أمر نلقاه.")

FILE.write_text(src, encoding='utf-8')
print("DONE")
ENDOFPYTHON

python channel_ui_fix.py && node --check "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" && echo "SYNTAX OK"
cd ~ && grep -n -A15 "sock.sendMessage = async" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -25
cd ~ && cp "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js.before-uifix-$(date +%Y%m%d-%H%M%S)" && cat > fix_channel_ui_final.py << 'ENDOFPYTHON'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو البلوك اللي كيبدا بـ CHANNEL FORWARD INJECTION
pattern = r"// --- CHANNEL FORWARD INJECTION ---.*?// ---------------------------------"
match = re.search(pattern, src, re.DOTALL)

if not match:
    print("❌ ما لقيتش بلوك التوجيه. يمكن تبدل.")
    raise SystemExit(1)

# الكود الجديد
new_block = """// --- CHANNEL FORWARD UI ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                        newsletterName: 'SUPPORT TOJI BOT ⚱️',
                        serverMessageId: 1, // رقم صغير باش واتساب يقبلو
                        contentType: 1 // 1 = نص
                    }
                };
            }
        } catch (err) {
            console.error('Channel UI error:', err.message);
        }
        // ---------------------------------"""

# نبدلو البلوك القديم بالجديد
src = src[:match.start()] + new_block + src[match.end():]

FILE.write_text(src, encoding='utf-8')
print("✅ تم تطبيق كود عرض القناة بنجاح (بلا رابط فـ النص).")
ENDOFPYTHON

python fix_channel_ui_final.py && node --check "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" && echo "SYNTAX OK"
cd ~ && node "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~ && cp "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js.before-finalui-$(date +%Y%m%d-%H%M%S)" && cat > final_ui.py << 'ENDOFPYTHON'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# نلقاو البلوك القديم
pattern = r"// --- CHANNEL FORWARD INJECTION ---.*?// ---------------------------------"
match = re.search(pattern, src, re.DOTALL)

if not match:
    # إلا كان البلوك تبدل، كنقلبو على الاسم الجديد
    pattern = r"// --- CHANNEL FORWARD UI ---.*?// ---------------------------------"
    match = re.search(pattern, src, re.DOTALL)

if not match:
    print("❌ ما لقيتش بلوك التوجيه.")
    raise SystemExit(1)

# الكود الجديد النظيف والآمن
new_block = """// --- CHANNEL TEXT UI ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                // 1. نخليو علامة إعادة التوجيه تبان
                content.contextInfo = {
                    ...(content.contextInfo || {}),
                    forwardingScore: 999,
                    isForwarded: true
                };

                // 2. نزيدو اسم القناة والرابط فـ النص باش يبان بحال التوجيه
                const channelHeader = '> 🌹 *𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐* 𓂀\\n> 📢 *SUPPORT TOJI BOT* ⚱️\\n> https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i\\n\\n';
                
                if (content.text) content.text = channelHeader + content.text;
                if (content.caption) content.caption = channelHeader + content.caption;
            }
        } catch (err) {
            console.error('Channel Text UI error:', err.message);
        }
        // ---------------------------------"""

src = src[:match.start()] + new_block + src[match.end():]
FILE.write_text(src, encoding='utf-8')
print("✅ تم تطبيق التصميم النصي للقناة بنجاح.")
ENDOFPYTHON

python final_ui.py && node --check "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" && echo "SYNTAX OK"
cd ~ && node "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~ && cp "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js.before-realchannel2-$(date +%Y%m%d-%H%M%S)" && cat > real_channel_final.py << 'ENDOFPYTHON'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نمسحو داك النص اللي درت (اللي فيه الرابط)
pattern_text = r"// --- CHANNEL TEXT UI ---.*?// ---------------------------------"
src = re.sub(pattern_text, "", src, flags=re.DOTALL)

# 2. نلقاو فين كيتصاوب sendMessage ونحطو الكود الحقيقي
old_send = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        
        const result = await originalSendMessage(jid, content, options);"""

new_send = """    sock.sendMessage = async (jid, content, options) => {
        const imageStarted = content?.image ? process.hrtime.bigint() : null;
        
        // --- REAL CHANNEL FORWARD UI ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                if (global.realChannelMsgId) {
                    content.contextInfo = {
                        ...(content.contextInfo || {}),
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                            newsletterName: 'SUPPORT TOJI BOT ⚱️',
                            serverMessageId: global.realChannelMsgId, // هنا كيتحط الـ ID الحقيقي
                            contentType: 1
                        }
                    };
                }
            }
        } catch (err) {
            console.error('Channel UI error:', err.message);
        }
        // ---------------------------------

        const result = await originalSendMessage(jid, content, options);"""

if old_send in src:
    src = src.replace(old_send, new_send, 1)
    print("✅ تم تركيب كود عرض القناة (الحقيقي)")
else:
    # يلا كان الكود تبدل، كنقلبو على أي بلوك ديال sendMessage
    print("⚠️ الكود تبدل شوية، غادي نديرو طريقة أخرى...")
    # كنقلبو على فين كيبدا sendMessage وكنحطو الكود

# 3. نضيفو كود باش نسمعو للقناة وناخدو الـ ID الحقيقي
anchor_listen = "if (type !== 'notify') return;"
new_listen = """if (type !== 'notify') return;
            
            // --- CAPTURE REAL CHANNEL ID ---
            for (const m of messages) {
                if (m.key?.remoteJid === '0029VbDb2LaJUM2T99gn2D1i@newsletter') {
                    global.realChannelMsgId = m.key.id;
                    console.log(`[CHANNEL] ✅ تم التقاط ID حقيقي من القناة: ${global.realChannelMsgId}`);
                }
            }
            // -------------------------------"""

if anchor_listen in src and "CAPTURE REAL CHANNEL ID" not in src:
    src = src.replace(anchor_listen, new_listen, 1)
    print("✅ تم إضافة رصد رسائل القناة باش ناخدو الـ ID")

FILE.write_text(src, encoding='utf-8')
print("DONE")
ENDOFPYTHON

python real_channel_final.py && node --check "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" && echo "SYNTAX OK"
cd ~ && node "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~ && grep -n -A20 "sock.sendMessage = async" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -30
cd ~ && cp "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js.before-realspot-$(date +%Y%m%d-%H%M%S)" && cat > spot_channel.py << 'ENDOFPYTHON'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import re

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. نمسحو أي كود قديم للقناة
src = re.sub(r"// --- CHANNEL FORWARD INJECTION ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
src = re.sub(r"// --- CHANNEL FORWARD UI ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
src = re.sub(r"// --- CHANNEL TEXT UI ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
src = re.sub(r"// --- REAL CHANNEL FORWARD UI ---.*?// ---------------------------------", "", src, flags=re.DOTALL)
print("✅ تم مسح أي كود قديم")

# 2. نتأكدو أننا عندنا متغير نخزنو فيه ID
if "realChannelMsgId" not in src:
    src = src.replace("let reconnectTimer = null;", "let realChannelMsgId = null;\nlet reconnectTimer = null;", 1)
    print("✅ تم إضافة المتغير realChannelMsgId")

# 3. نتأكدو أننا كنسمعو للقناة باش ناخدو الـ ID الحقيقي
if "CAPTURE REAL CHANNEL ID" not in src:
    anchor = "if (type !== 'notify') return;"
    new_listen = """if (type !== 'notify') return;
            
            // --- CAPTURE REAL CHANNEL ID ---
            for (const m of messages) {
                if (m.key?.remoteJid === '0029VbDb2LaJUM2T99gn2D1i@newsletter') {
                    global.realChannelMsgId = m.key.id;
                    console.log(`[CHANNEL] ✅ تم التقاط ID حقيقي من القناة: ${global.realChannelMsgId}`);
                }
            }
            // -------------------------------"""
    if anchor in src:
        src = src.replace(anchor, new_listen, 1)
        print("✅ تم إضافة التقاط رسائل القناة")

# 4. نحطو كود التوجيه فـ السطر 280 (قبل const result)
# الكود اللي كاين فـ السطر 280
anchor_send = "        const result = await originalSendMessage(jid, content, options);"

# الكود ديال التوجيه
forward_code = """        
        // --- REAL CHANNEL FORWARD UI ---
        try {
            if (content && (content.text || content.caption) && !content.image && !content.video && !content.audio) {
                if (global.realChannelMsgId) {
                    content.contextInfo = {
                        ...(content.contextInfo || {}),
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '0029VbDb2LaJUM2T99gn2D1i@newsletter',
                            newsletterName: 'SUPPORT TOJI BOT ⚱️',
                            serverMessageId: global.realChannelMsgId, // كنستعملو الـ ID الحقيقي اللي تلقط
                            contentType: 1
                        }
                    };
                }
            }
        } catch (err) {
            console.error('Channel UI error:', err.message);
        }
        // ---------------------------------
        
"""

if anchor_send in src and "REAL CHANNEL FORWARD UI" not in src:
    src = src.replace(anchor_send, forward_code + anchor_send, 1)
    print("✅ تم تركيب كود عرض القناة فـ المكان الصحيح")
else:
    print("⚠️ الكود راه موجود ولا السطر تبدل")

FILE.write_text(src, encoding='utf-8')
print("DONE")
ENDOFPYTHON

python spot_channel.py && node --check "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" && echo "SYNTAX OK"
cd ~ && node "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
grep -n -A35 -B5 'originalSendMessage\|sock.sendMessage =' ~/bot-friend.js
cd ~
ls -lb *.js
grep -n -A35 -B5 'originalSendMessage\|sock.sendMessage =' "$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~
grep -n -A45 -B5 "REAL CHANNEL FORWARD UI\|originalSendMessage\|SPEED_STATS_MONITOR" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~
node -p "require('@whiskeysockets/baileys/package.json').version"
grep -R -n -m 8 "buttonUrl\|urlButton\|nativeFlowMessage\|buttonsMessage" node_modules/@whiskeysockets/baileys/lib 2>/dev/null | head -30
cd ~
grep -R -n -m 12 "buttonsMessage\|templateButtons\|buttonParamsJson\|cta_url" node_modules/@whiskeysockets/baileys/lib/Utils node_modules/@whiskeysockets/baileys/lib/Types 2>/dev/null | head -40
cd ~
grep -R -n -m 20 "export interface AnyMessageContent\|type AnyMessageContent\|URLButton\|Button" node_modules/@whiskeysockets/baileys/lib/Types node_modules/@whiskeysockets/baileys/lib 2>/dev/null | head -50
cd ~
sed -n '190,245p' node_modules/@whiskeysockets/baileys/lib/Types/Message.d.ts
cd ~
grep -n "AnyRegularMessageContent\|templateButtons\|urlButton\|buttons:" node_modules/@whiskeysockets/baileys/lib/Types/Message.d.ts
cd ~
sed -n '150,210p' node_modules/@whiskeysockets/baileys/lib/Types/Message.d.ts
cd ~
grep -R -n -m 10 "cta_url\|nativeFlowMessage\|interactiveMessage" node_modules/@whiskeysockets/baileys/lib/WAProto node_modules/@whiskeysockets/baileys/lib 2>/dev/null | head -25
cd ~
grep -R -n -m 10 "cta_url\|nativeFlowMessage\|InteractiveMessage" node_modules/@whiskeysockets/baileys --exclude='*.map' 2>/dev/null | head -30.
cd ~
grep -R -n -m 10 "cta_url\|nativeFlowMessage\|InteractiveMessage" node_modules/@whiskeysockets/baileys --exclude='*.map' 2>/dev/null | head -30
cd ~
grep -n -A75 -B5 "message NativeFlowMessage" node_modules/@whiskeysockets/baileys/WAProto/WAProto.proto
cd ~
grep -n "require('@whiskeysockets/baileys')\|from '@whiskeysockets/baileys'\|relayMessage\|const proto" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -30
cd ~
grep -n -A35 -B10 "تست" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -100
cd ~
grep -n -E "match\[1\]|test 1|تست 1|test 2|تست 2|test 3|تست 3|test 4|تست 4|test 5|تست 5" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -50
cd ~
sed -n '700,900p' "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~
grep -n -E "body\.trim|switch \(command\)|command ===|command\.startsWith|case 'تست'|case \"تست\"" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -70
cd ~
echo "===== ردود menu و fm ====="
sed -n '980,1080p' "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
echo "===== نهاية معالج الأوامر ====="
sed -n '2425,2505p' "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
echo "===== تعريف الزر التفاعلي ====="
grep -n -A65 "message InteractiveMessage" node_modules/@whiskeysockets/baileys/WAProto/WAProto.proto | head -70
cd ~
node - <<'NODE'
const b = require('@whiskeysockets/baileys');
console.log('Baileys exports proto:', !!b.proto);
console.log('Socket relayMessage:', typeof b.default?.prototype?.relayMessage);
NODE

grep -R -n -m 8 "interactiveButtons" node_modules/@whiskeysockets/baileys/lib
sed -n '260,350p' "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~
python - <<'PY'
from pathlib import Path

p = Path.home() / '𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js'
if not p.exists():
    raise SystemExit('❌ الملف غير موجود؛ ما تبدل والو.')

s = p.read_text()
needle = "                if (command === 'ارسل') {"

block = r'''                // --- TEST: رابط القناة بزر تفاعلي ---
                if (command === 'زر') {
                    try {
                        const { proto } = require('@whiskeysockets/baileys');
                        if (typeof sock.relayMessage !== 'function') {
                            throw new Error('relayMessage غير متوفر');
                        }

                        const channelUrl = 'https://whatsapp.com/channel/0029VbDb2LaJUM2T99gn2D1i';
                        const msg = {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    interactiveMessage:
                                        proto.Message.InteractiveMessage.create({
                                            header:
                                                proto.Message.InteractiveMessage.Header.create({
                                                    title: '𝑻𝑶𝑱𝑰 𝑭𝑼𝑺𝑯𝑰𝑮𝑼𝑹𝑶',
                                                    hasMediaAttachment: false
                                                }),
                                            body:
                                                proto.Message.InteractiveMessage.Body.create({
                                                    text: 'هذا اختبار لزر القناة.'
                                                }),
                                            footer:
                                                proto.Message.InteractiveMessage.Footer.create({
                                                    text: 'SUPPORT TOJI BOT ⚱️'
                                                }),
                                            nativeFlowMessage:
                                                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                                    buttons: [{
                                                        name: 'cta_url',
                                                        buttonParamsJson: JSON.stringify({
                                                            display_text: 'عرض القناة',
                                                            url: channelUrl,
                                                            merchant_url: channelUrl
                                                        })
                                                    }]
                                                })
                                        })
                                }
                            }
                        };

                        await sock.relayMessage(from, msg, {});
                    } catch (err) {
                        console.error('[زر القناة]', err);
                        await sock.sendMessage(from, {
                            text: '❌ فشل اختبار الزر: ' +
                                (err?.message || String(err))
                        }, { quoted: mek });
                    }
                    continue;
                }
                // --- END TEST BUTTON ---

'''

count = s.count(needle)
if count != 1:
    raise SystemExit(f'❌ موضع الإدراج غير واضح ({count})؛ الملف لم يتغير.')

backup = p.with_name(p.name + '.backup-channel-button-test')
if not backup.exists():
    backup.write_text(s)

p.write_text(s.replace(needle, block + needle, 1))
print('✅ أُضيف أمر الاختبار .زر')
print('📦 النسخة الاحتياطية:', backup)
PY

node --check "$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~ && node "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~
grep -n -E "const command|let command|var command|command =|if \(command === 'زر'\)|if \(command === 'ارسل'\)" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -60
cd ~
sed -n '590,690p' "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
grep -n -E "relayMessage|sock\.sendMessage|fromMe|isDeveloper|botMode" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -60
pgrep -af 'Toji|node'
pgrep -af node
cd ~ && node "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
cd ~
grep -n -E "messages\.upsert|messages\\.upsert|console\.error|catch \(error\)|start\(\)" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" | head -50
cd ~ && node "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
echo "===== NODE PROCESSES ====="
pgrep -af node
echo "===== BOT PROCESSES ====="
ps -A | grep -E 'node|PID'
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
echo "===== BAILEYS CONNECTIONS ====="
grep -nE "makeWASocket|useMultiFileAuthState|sock *=|connection.update|DisconnectReason" "$F"
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
sed -n '245,445p' "$F"
start().catch(err => console.log('reconnect error:', err.message));
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
sed -n '420,510p' "$F"
echo "===== FILE END ====="
tail -35 "$F"
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
echo "===== MESSAGE HANDLERS ====="
grep -n -E "messages.upsert|messages.update|messages.set|MSG DEBUG|ignored|تجاهل نوع الحدث" "$F"
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
sed -n '510,680p' "$F"
if (type !== 'notify') {
}
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
sed -n '680,850p' "$F"
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
sed -n '850,1030p' "$F"
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
sed -n '1030,1200p' "$F"
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
sed -n '1200,1400p' "$F"
if (     botMode === 'private' &&     !(/* استثناء مجموعة dm */); ) continue;
const developerNumbers = [
];
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
grep -n -E "botMode|MODE_FILE|developerNumbers" "$F"
cat "$HOME/bot-mode-friend.json"
F="$HOME/𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
grep -n -A 12 -B 5 "messages.upsert" "$F"
cd ~ && cp "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js.before-deeptrace-$(date +%Y%m%d-%H%M%S)" && cat > add_deep_trace.py << 'ENDOFPYTHON'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

FILE = Path.home() / "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js"
src = FILE.read_text(encoding='utf-8')

# 1. كاميرا 1: قبل شرط النوع (باش نشوفو كلشي كيدخل)
anchor_upsert = "sock.ev.on('messages.upsert', async ({ messages, type }) => {"
trace_upsert = anchor_upsert + """
    console.log('\\n🚨 [TRACE 1] وصل حدث جديد. النوع:', type);
"""
if anchor_upsert in src and "🚨 [TRACE 1]" not in src:
    src = src.replace(anchor_upsert, trace_upsert, 1)
    print("✅ تمت إضافة كاميرا 1 (عند البوابة)")

# 2. كاميرا 2: داخل الحلقة (باش نشوفو محتوى الرسالة الخام)
anchor_loop = "for (const mek of messages || []) {"
trace_loop = anchor_loop + """
        if (mek.message) {
            const rawText = mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || 'لا يوجد نص مباشر';
            console.log('🚨 [TRACE 2] رسالة من:', mek.key.remoteJid, '| fromMe:', mek.key.fromMe, '| النص:', rawText.substring(0, 30));
        }
"""
if anchor_loop in src and "🚨 [TRACE 2]" not in src:
    src = src.replace(anchor_loop, trace_loop, 1)
    print("✅ تمت إضافة كاميرا 2 (داخل الحلقة)")

# 3. كاميرا 3: قبل التحقق من الأمر (باش نشوفو واش وصل للفحص)
anchor_fahs = "if (command === 'فحص') {"
trace_fahs = """console.log('🚨 [TRACE 3] البوت وصل لمرحلة التحقق من الأوامر. الأمر المستخرج:', command);
                if (command === 'فحص') {
                    console.log('🚨 [TRACE 4] 🎯 البوت دخل لأمر .فحص بنجاح!');"""
if anchor_fahs in src and "🚨 [TRACE 3]" not in src:
    src = src.replace(anchor_fahs, trace_fahs, 1)
    print("✅ تمت إضافة كاميرا 3 و 4 (عند تنفيذ الأمر)")

FILE.write_text(src, encoding='utf-8')
print("DONE: تم تركيب الكاميرات بنجاح.")
ENDOFPYTHON

python add_deep_trace.py && node --check "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐.js" && echo "SYNTAX OK"
pkill -9 -f "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐" ; sleep 2 ; pgrep -af "𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐" || echo "✅ كلشي تقتل — ما كاين حتى بوت خدام"
rm -f ~/.toji-bot.lock && echo "✅ تم مسح ملف الـ Lock"
exit
