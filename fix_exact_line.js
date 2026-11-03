const fs = require('fs');
let lines = fs.readFileSync('bot-friend.js', 'utf8').split('\n');

// إذا كان السطر 719 أو حوله يحتوي على فاصلة أو رمز تالف، نقوم بتنظيفه
if (lines.length >= 719) {
    console.log("تم العثور على أسطر، جاري فحص النطاق...");
    // إزالة السطور الفارغة أو الفواصل المعزولة في النطاق المتضرر
    for (let i = 715; i < Math.min(lines.length, 730); i++) {
        if (lines[i] && lines[i].trim() === ',') {
            lines[i] = '// تم حذف الفاصلة التالفة هنا';
        }
    }
}

fs.writeFileSync('bot-friend.js', lines.join('\n'), 'utf8');
console.log('✅ تم تصحيح السطر بدقة!');
