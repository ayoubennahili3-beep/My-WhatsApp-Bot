const fs = require('fs');
const path = require('path');

const home = process.env.HOME;
const listPath = path.join(home, 'bot-commands.json');

// هذه هي القائمة الرسمية الوحيدة للأوامر
const OFFICIAL_COMMANDS = [
    'تست برو',
    'تست 1',
    'تست 2',
    'تست 3',
    'تست 4',
    'تست 5',
    'اغنية',
    'حزمة',
    'اقتباس',
    'من هو اقوى',
    'من هو عظيم',
    'AOA',
    'two princes',
    'oussama',
    'marjana',
    'bilal',
    'love',
    'الامير',
    'مطور',
    'عام',
    'خاص',
    'فحص',
    'ارسل',
    'أما تحب',
    'أشكوا حزني',
    'a',
    's',
    'The two princes are intelligent',
    'ملك',
    'منضمة a.o.a',
    'حياء',
    'the prince ahmed',
    'سياسة',
    'كبرياء',
    'عائلة',
    'فزياء',
    'تفكير',
    'صلاة',
    'vv',
    'مرجانة',
    'الأمير',
    'the two princes',
    'speed',
    'اوامر',
    'تست',
    'the prince Ayoub',
    'تغير'
];

function normalize(value) {
    return String(value)
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/𓂀/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function updateCommands() {
    const seen = new Set();
    const result = [];

    for (const item of OFFICIAL_COMMANDS) {
        const name = normalize(item);
        const key = name.toLowerCase();

        if (!name || key === 'ayoub' || seen.has(key)) continue;

        seen.add(key);
        result.push(name);
    }

    fs.writeFileSync(
        listPath,
        JSON.stringify(result, null, 2) + '\n'
    );

    console.log('✅ تم تحديث القائمة الرسمية');
    console.log('📋 عدد الأوامر:', result.length);
    console.log('👑 أمر Ayoub:', result.includes('the prince Ayoub') ? 'موجود مرة واحدة' : 'غير موجود');
    console.log('👑 أمر Ahmed:', result.includes('the prince ahmed') ? 'موجود' : 'غير موجود');
    console.log('🚫 أمر Ayoub القديم:', 'محذوف');
    console.log('🔁 التكرارات:', 'تم منعها');
}

if (require.main === module) updateCommands();
module.exports = updateCommands;
