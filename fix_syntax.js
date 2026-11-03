const fs = require('fs');
let code = fs.readFileSync('bot-friend.js', 'utf8');

// 1. تنظيف أي إضافات خاطئة سابقة في نهاية الملف
code = code.replace(/const handleVoiceCmd[\s\S]*$/, '');
code = code.replace(/if \(typeof handleVoiceCmd[\s\S]*$/, '');

// 2. إضافة الـ require في أعلى الملف إذا لم تكن موجودة
if (!code.includes('voice.js')) {
    code = "const handleVoiceCmd = require('./voice.js');\n" + code;
}

// 3. البحث عن أول نقطة فحص للرسائل (مثل m.text) لحقن أمر الصوت داخل الدالة البرمجية الصحيحة
let targetPos = code.indexOf('if (m.text');
if (targetPos === -1) targetPos = code.indexOf('m.text');

if (targetPos !== -1) {
    code = code.slice(0, targetPos) + "if (await handleVoiceCmd(m, sock)) return;\n    " + code.slice(targetPos);
    fs.writeFileSync('bot-friend.js', code, 'utf8');
    console.log('✅ تم إصلاح الملف وربط أمر الصوت في المكان الصحيح داخل الدالة بنجاح تام!');
} else {
    console.log('⚠️ تعذر العثور على نقطة الفحص تلقائياً.');
}
