const fs = require('fs');

const file = 'bot.js';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("sock.ev.on('connection.update'")) {
  console.error('لم أجد معالج الاتصال؛ لم يتم تعديل الملف.');
  process.exit(1);
}

if (code.includes('CONNECTION_DIAGNOSTICS_PATCH')) {
  console.log('تعديل التشخيص موجود مسبقًا.');
  process.exit(0);
}

const oldHandler = /sock\.ev\.on\('connection\.update',\s*\(update\)\s*=>\s*\{\s*const \{ connection \} = update;[\s\S]*?if \(connection === 'close'\) start\(\);\s*\}\);/;

if (!oldHandler.test(code)) {
  console.error('شكل معالج الاتصال مختلف؛ لم يتم تعديل الملف.');
  process.exit(1);
}

const newHandler = `// CONNECTION_DIAGNOSTICS_PATCH
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            console.log('🔄 جارٍ الاتصال بواتساب...');
        }

        if (connection === 'open') {
            console.log('✅ تم الاتصال بواتساب؛ أوامر البوت جاهزة!');
        }

        if (connection === 'close') {
            const err = lastDisconnect?.error;
            const statusCode = err?.output?.statusCode;
            console.log('❌ انقطع الاتصال. الحالة:', statusCode ?? 'غير معروفة');
            console.log('تفاصيل الخطأ:', err?.message ?? 'لا توجد تفاصيل');

            if (statusCode === 401) {
                console.log('⚠️ الجلسة غير مسجلة؛ أعد الاقتران عند الحاجة.');
                return;
            }

            if (statusCode === 403) {
                console.log('⚠️ واتساب رفض الاتصال (403). لن تتم إعادة المحاولة تلقائيًا.');
                return;
            }

            if (statusCode === 515) {
                console.log('🔄 واتساب يطلب إعادة تشغيل الاتصال (515).');
            } else {
                console.log('ℹ️ أوقفنا إعادة الاتصال التلقائية لتجنب حلقة تشغيل.');
            }
        }
    });`;

code = code.replace(oldHandler, newHandler);
fs.writeFileSync(file, code);
console.log('تم تحديث معالج الاتصال فقط.');
