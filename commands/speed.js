const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'speed',

    async execute(sock, m, args) {
        const start = process.hrtime.bigint();
        const jid = m.key.remoteJid;

        const send = async (text, quoted = m) => {
            return sock.sendMessage(jid, { text }, { quoted });
        };


        // __TOJI_LIVE_SPEED_V2__
        const liveMap = globalThis.__TOJI_SPEED_LIVE__ ||
            (globalThis.__TOJI_SPEED_LIVE__ = new Map());

        const speedArgs = Array.isArray(args)
            ? args.map(v => String(v).toLowerCase()).join(" ")
            : String(args || "").toLowerCase();

        // إيقاف يدوي
        if (/(^|\s)stop(\s|$)/i.test(speedArgs)) {
            const current = liveMap.get(jid);

            if (!current) {
                return send("ℹ️ لا يوجد مؤشر سرعة نشط حالياً.");
            }

            current.active = false;
            clearInterval(current.timer);
            clearTimeout(current.durationTimer);
            liveMap.delete(jid);

            try {
                await sock.sendMessage(jid, {
                    text: current.render("⏹️ تم إيقاف المؤشر يدوياً"),
                    edit: current.messageKey
                });
            } catch (error) {
                console.error("[SPEED STOP ERROR]", error);
                return send("تم إيقاف المؤشر، لكن تعذر تعديل الرسالة القديمة.");
            }

            return;
        }

        // تشغيل جديد يلغي المؤشر السابق لنفس المحادثة
        const previous = liveMap.get(jid);

        if (previous) {
            previous.active = false;
            clearInterval(previous.timer);
            clearTimeout(previous.durationTimer);
            liveMap.delete(jid);

            try {
                await sock.sendMessage(jid, {
                    text: previous.render("♻️ تم استبداله بمؤشر جديد"),
                    edit: previous.messageKey
                });
            } catch (_) {}
        }

        const ms = value => `${value.toFixed(2)}ms`;

        const formatCmd = (cmd, max = 24) => {
            const name = String(cmd);
            return name.length > max
                ? name.substring(0, max - 3) + '...'
                : name;
        };

        const getSpeedLevel = avg => {
            if (avg < 500) return '🟢 سريع';
            if (avg < 1500) return '🟡 متوسط';
            return '🔴 بطيء';
        };

        try {
            const sentMsg = await send('⚡ جاري تحليل الأداء...');

            const sendTime = Number(
                process.hrtime.bigint() - start
            ) / 1e6;

            const statsFile = path.join(
                process.env.HOME,
                'bot-speed-stats.json'
            );

            let data;
            let lastModified = 'غير معروف';

            try {
                if (!fs.existsSync(statsFile)) {
                    return send(
                        `⏱️ *وقت إرسال الرسالة:* ${ms(sendTime)}\n⚠️ لا توجد إحصائيات محفوظة.`,
                        sentMsg
                    );
                }

                const stat = fs.statSync(statsFile);

                lastModified = new Intl.DateTimeFormat('ar-MA', {
                    timeZone: 'Africa/Casablanca',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }).format(stat.mtime);

                data = JSON.parse(
                    fs.readFileSync(statsFile, 'utf8')
                );

                if (
                    !data ||
                    typeof data !== 'object' ||
                    !data.commands ||
                    typeof data.commands !== 'object' ||
                    Array.isArray(data.commands)
                ) {
                    throw new Error('Invalid statistics structure');
                }

            } catch (error) {
                console.error('[SPEED READ ERROR]', error);

                return send(
                    `⏱️ *وقت إرسال الرسالة:* ${ms(sendTime)}\n⚠️ ملف الإحصائيات تالف أو غير قابل للقراءة.`,
                    sentMsg
                );
            }

            const entries = Object.entries(data.commands);

            let invalidCount = 0;
            let inconsistentCount = 0;
            let incompleteCount = 0;
            let invalidMaxCount = 0;
            const qualityIssueCommands = new Set();
            const validCommands = [];

            for (const [cmd, item] of entries) {
                if (!item || typeof item !== 'object' || Array.isArray(item)) {
                    invalidCount++;
                    qualityIssueCommands.add(cmd);
                    continue;
                }

                const count = Number(item.count);
                const avgMs = Number(item.avgMs);
                const rawTotal = Number(item.totalMs);

                if (
                    !Number.isSafeInteger(count) ||
                    count <= 0 ||
                    item.avgMs === null ||
                    item.avgMs === undefined ||
                    item.avgMs === '' ||
                    !Number.isFinite(avgMs) ||
                    avgMs < 0
                ) {
                    invalidCount++;
                    qualityIssueCommands.add(cmd);
                    continue;
                }

                const hasTotal =
                    item.totalMs !== null &&
                    item.totalMs !== undefined &&
                    item.totalMs !== '';

                let totalMs;

                if (
                    hasTotal &&
                    Number.isFinite(rawTotal) &&
                    rawTotal >= 0
                ) {
                    const calculatedAvg = rawTotal / count;
                    const tolerance = Math.max(5, avgMs * 0.02);

                    if (Math.abs(calculatedAvg - avgMs) > tolerance) {
                        inconsistentCount++;
                        qualityIssueCommands.add(cmd);
                        totalMs = avgMs * count;
                    } else {
                        totalMs = rawTotal;
                    }
                } else {
                    incompleteCount++;
                    qualityIssueCommands.add(cmd);
                    totalMs = avgMs * count;
                }

                if (!Number.isFinite(totalMs)) {
                    invalidCount++;
                    qualityIssueCommands.add(cmd);
                    continue;
                }

                const rawMax = item.maxMs;
                const hasMax =
                    rawMax !== null &&
                    rawMax !== undefined &&
                    rawMax !== '';

                const maxValue = Number(rawMax);

                let maxMs = null;

                if (
                    hasMax &&
                    Number.isFinite(maxValue) &&
                    maxValue >= avgMs
                ) {
                    maxMs = maxValue;
                } else if (hasMax) {
                    invalidMaxCount++;
                    qualityIssueCommands.add(cmd);
                }

                validCommands.push({
                    cmd,
                    count,
                    avgMs,
                    totalMs,
                    maxMs
                });
            }

            if (!validCommands.length) {
                return send(
                    `⏱️ *وقت إرسال الرسالة:* ${ms(sendTime)}\n⚠️ لا توجد قياسات صالحة حالياً.`,
                    sentMsg
                );
            }

            // الإحصائيات العامة
            const totalExecutions = validCommands.reduce(
                (sum, item) => sum + item.count,
                0
            );

            const totalTime = validCommands.reduce(
                (sum, item) => sum + item.totalMs,
                0
            );

            if (
                !Number.isSafeInteger(totalExecutions) ||
                !Number.isFinite(totalTime)
            ) {
                throw new Error('Statistics overflow');
            }

            const globalAvg = totalTime / totalExecutions;

            // ترتيب السرعة
            const sortedByAvg = [...validCommands].sort(
                (a, b) => a.avgMs - b.avgMs
            );

            const fastest = sortedByAvg[0];
            const slowest = sortedByAvg[sortedByAvg.length - 1];

            // أسرع أمر موثوق
            const reliableCommands = validCommands.filter(
                item => item.count >= 5
            );

            const fastestReliable = reliableCommands.length
                ? [...reliableCommands].sort(
                    (a, b) => a.avgMs - b.avgMs
                )[0]
                : null;

            // أكثر 3 أوامر استعمالاً
            const top3 = [...validCommands]
                .sort((a, b) =>
                    b.count - a.count ||
                    a.avgMs - b.avgMs
                )
                .slice(0, 3);

            // تحليل التذبذب التقريبي
            const spikeCommands = validCommands
                .filter(item =>
                    item.maxMs !== null &&
                    item.avgMs > 0
                )
                .map(item => ({
                    ...item,
                    spike: (
                        (item.maxMs - item.avgMs) /
                        item.avgMs
                    ) * 100
                }))
                .sort((a, b) => b.spike - a.spike);

            const biggestSpike = spikeCommands[0];

            // تصنيف الأوامر
            const fastCount = validCommands.filter(
                item => item.avgMs < 500
            ).length;

            const mediumCount = validCommands.filter(
                item => item.avgMs >= 500 && item.avgMs < 1500
            ).length;

            const slowCount = validCommands.filter(
                item => item.avgMs >= 1500
            ).length;

            // جودة البيانات: كل أمر متأثر يُحسب مرة واحدة
            const quality = entries.length > 0
                ? Math.max(
                    0,
                    ((entries.length - qualityIssueCommands.size)
                        / entries.length) * 100
                )
                : 0;

            const lowUsage = validCommands.filter(
                item => item.count < 5
            );

            // التقرير
            let report = `⚡ *TOJI PERFORMANCE SYSTEM*\n`;
            report += `━━━━━━━━━━━━━━━━━━\n\n`;

            report += `📡 *تقرير الأداء الحقيقي:*\n\n`;

            report += `⏱️ *وقت إرسال رسالة التحليل:* ${ms(sendTime)}\n`;
            report += `📊 *متوسط سرعة الأوامر:* ${ms(globalAvg)}\n`;
            report += `🔢 *إجمالي مرات التنفيذ:* ${totalExecutions}\n`;
            report += `📋 *عدد الأوامر المقاسة:* ${validCommands.length}\n`;
            report += `📅 *آخر تحديث:* ${lastModified}\n\n`;

            report += `━━━━━━━━━━━━━━━━━━\n`;
            report += `🏆 *تحليل السرعة*\n\n`;

            report += `🚀 *أسرع أمر إجمالاً:*\n`;
            report += `.${formatCmd(fastest.cmd)} (${ms(fastest.avgMs)} — ${fastest.count} مرة)\n\n`;

            if (fastestReliable) {
                report += `🥇 *أسرع أمر موثوق (5+ استعمالات):*\n`;
                report += `.${formatCmd(fastestReliable.cmd)} (${ms(fastestReliable.avgMs)} — ${fastestReliable.count} مرات)\n\n`;
            } else {
                report += `🥇 *أسرع أمر موثوق:* بيانات غير كافية\n\n`;
            }

            report += `🐢 *أبطأ أمر:*\n`;
            report += `.${formatCmd(slowest.cmd)} (${ms(slowest.avgMs)} — ${slowest.count} مرة)\n\n`;

            if (biggestSpike) {
                report += `📈 *أكبر فرق بين المتوسط وأعلى قياس:*\n`;
                report += `.${formatCmd(biggestSpike.cmd)}\n`;
                report += `أعلى قياس: ${ms(biggestSpike.maxMs)}\n`;
                report += `الفرق التقريبي: ${biggestSpike.spike.toFixed(1)}%\n\n`;
            }

            report += `━━━━━━━━━━━━━━━━━━\n`;
            report += `⚡ *تصنيف أداء الأوامر:*\n`;
            report += `🟢 سريع: ${fastCount}\n`;
            report += `🟡 متوسط: ${mediumCount}\n`;
            report += `🔴 بطيء: ${slowCount}\n\n`;

            report += `━━━━━━━━━━━━━━━━━━\n`;
            report += `📊 *أكثر 3 أوامر استعمالاً:*\n\n`;

            top3.forEach((item, index) => {
                report += `${index + 1}. .${formatCmd(item.cmd)}\n`;
                report += `   ${item.count} مرة | ${ms(item.avgMs)} | ${getSpeedLevel(item.avgMs)}\n`;
            });

            report += `\n━━━━━━━━━━━━━━━━━━\n`;
            report += `🔍 *تحليل الاستخدام:*\n`;
            report += `📌 أوامر بأقل من 5 استعمالات: ${lowUsage.length}\n`;
            report += `ℹ️ الأسرع الموثوق يحتاج 5 استعمالات على الأقل.\n`;

            report += `\n━━━━━━━━━━━━━━━━━━\n`;
            report += `🛡️ *سلامة البيانات:*\n`;
            report += `✅ سجلات صالحة: ${validCommands.length}\n`;
            report += `📈 مؤشر جودة البيانات: ${quality.toFixed(1)}%\n`;
            report += `⚠️ أوامر متأثرة بمشاكل البيانات: ${qualityIssueCommands.size}\n`;
            report += `⚠️ سجلات غير صالحة: ${invalidCount}\n`;
            report += `🔍 متوسطات غير متطابقة: ${inconsistentCount}\n`;
            report += `📌 بيانات ناقصة: ${incompleteCount}\n`;
            report += `⚠️ قياسات Max غير صالحة: ${invalidMaxCount}\n`;

            report += `\n━━━━━━━━━━━━━━━━━━\n`;
            report += `🌹 *TOJI FUSHIGURO*`;


            // مؤشر حي داخل نفس رسالة التقرير
            const LIVE_INTERVAL = 3000;
            const LIVE_DURATION = 10 * 60 * 1000;

            const state = {
                messageKey: sentMsg.key,
                report,
                timer: null,
                durationTimer: null,
                busy: false,
                active: true,
                failures: 0,
                startedAt: Date.now(),
                activity: 35,
                direction: 1,
                lastLatency: sendTime,
                minLatency: sendTime,
                maxLatency: sendTime
            };

            // النسبة هنا حركة بصرية مستمرة وليست قياساً مزيفاً للسرعة
            state.render = status => {
                state.activity += 5 * state.direction;

                if (state.activity >= 100) {
                    state.activity = 100;
                    state.direction = -1;
                }

                if (state.activity <= 40) {
                    state.activity = 40;
                    state.direction = 1;
                }

                const filled = Math.round(state.activity / 10);
                const gauge = Array.from({ length: 10 }, (_, i) =>
                    i < filled ? "🟩" : "▫️"
                ).join("");

                const elapsed = Math.floor(
                    (Date.now() - state.startedAt) / 1000
                );

                const duration = `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

                const last = state.lastLatency === null
                    ? "جارٍ القياس..."
                    : ms(state.lastLatency);

                return (
                    `⚡ *TOJI LIVE SPEED*\n` +
                    `${status}\n\n` +
                    `📶 *مؤشر النشاط: ${state.activity}%*\n` +
                    `${gauge}\n\n` +
                    `⏱️ آخر زمن إرسال: ${last}\n` +
                    `📉 أدنى قياس: ${ms(state.minLatency)}\n` +
                    `📈 أعلى قياس: ${ms(state.maxLatency)}\n` +
                    `⌛ مدة التشغيل: ${duration}\n` +
                    `🔄 تحديث تلقائي كل 3 ثوانٍ\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    state.report
                );
            };

            liveMap.set(jid, state);

            // تعديل رسالة البداية نفسها
            try {
                const firstStart = process.hrtime.bigint();

                await sock.sendMessage(jid, {
                    text: state.render("🟢 المؤشر يعمل"),
                    edit: state.messageKey
                });

                const firstLatency = Number(
                    process.hrtime.bigint() - firstStart
                ) / 1e6;

                state.lastLatency = firstLatency;
                state.minLatency = Math.min(state.minLatency, firstLatency);
                state.maxLatency = Math.max(state.maxLatency, firstLatency);

            } catch (error) {
                state.active = false;
                liveMap.delete(jid);
                throw error;
            }

            // التحديث المتواصل
            state.timer = setInterval(async () => {
                if (
                    !state.active ||
                    state.busy ||
                    liveMap.get(jid) !== state
                ) return;

                state.busy = true;

                try {
                    const tickStart = process.hrtime.bigint();

                    await sock.sendMessage(jid, {
                        text: state.render("🟢 المؤشر يعمل"),
                        edit: state.messageKey
                    });

                    if (!state.active || liveMap.get(jid) !== state) {
                        return;
                    }

                    const latency = Number(
                        process.hrtime.bigint() - tickStart
                    ) / 1e6;

                    state.lastLatency = latency;
                    state.minLatency = Math.min(state.minLatency, latency);
                    state.maxLatency = Math.max(state.maxLatency, latency);
                    state.failures = 0;

                } catch (error) {
                    state.failures++;
                    console.error("[SPEED LIVE ERROR]", error);

                    if (state.failures >= 3) {
                        state.active = false;
                        clearInterval(state.timer);
                        clearTimeout(state.durationTimer);
                        liveMap.delete(jid);

                        try {
                            await sock.sendMessage(jid, {
                                text: state.render(
                                    "⚠️ توقف المؤشر بعد 3 أخطاء متتالية"
                                ),
                                edit: state.messageKey
                            });
                        } catch (_) {}
                    }
                } finally {
                    state.busy = false;
                }
            }, LIVE_INTERVAL);

            // إيقاف تلقائي بعد 10 دقائق
            state.durationTimer = setTimeout(async () => {
                if (liveMap.get(jid) !== state) return;

                state.active = false;
                clearInterval(state.timer);
                liveMap.delete(jid);

                try {
                    await sock.sendMessage(jid, {
                        text: state.render(
                            "⏹️ توقف المؤشر تلقائياً بعد 10 دقائق"
                        ),
                        edit: state.messageKey
                    });
                } catch (error) {
                    console.error("[SPEED AUTO STOP ERROR]", error);
                }
            }, LIVE_DURATION);

            if (state.timer.unref) state.timer.unref();
            if (state.durationTimer.unref) state.durationTimer.unref();

        } catch (error) {
            console.error('[SPEED COMMAND ERROR]', error);

            try {
                await send(
                    '❌ وقع خطأ أثناء تحليل الأداء. راجع سجل Termux.'
                );
            } catch (sendError) {
                console.error('[SPEED ERROR REPORT]', sendError);
            }
        }
    }
};
