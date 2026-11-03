const fs = require('fs');
const path = require('path');

const file = path.join(process.env.HOME, 'bot-friend.js');
let code = fs.readFileSync(file, 'utf8');

if (code.includes('CHANGE_OWNER_NAME_FEATURE')) {
  console.log('ℹ️ ميزة تغيير الاسم موجودة مسبقاً؛ لم يتم تعديل أي شيء.');
  process.exit(0);
}

function replaceOnce(oldText, newText, label) {
  const count = code.split(oldText).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: وجدت ${count} مواضع مطابقة بدل موضع واحد. أوقفت التعديل.`);
  }
  code = code.replace(oldText, newText);
}

replaceOnce(
  'const KICKALL_PENDING = new Map();',
  `const KICKALL_PENDING = new Map();

// CHANGE_OWNER_NAME_FEATURE
const OWNER_NAME_FILE = path.join(process.env.HOME || __dirname, 'bot-owner-name.json');
const CHANGE_NAME_PENDING = new Map();
const OWNER_NAME_MAP = {
  'أيوب': 'AYOUB', 'ayoub': 'أيوب', 'ayo ub': 'أيوب', 'ahoub': 'أيوب',
  'أحمد': 'AHMED', 'احمد': 'AHMED', 'ahmed': 'أحمد',
  'أمين': 'AMIN', 'amin': 'أمين',
  'محمد': 'MOHAMMED', 'mohammed': 'محمد', 'mohamed': 'محمد',
  'يوسف': 'YOUSSEF', 'youssef': 'يوسف', 'youcef': 'يوسف',
  'عمر': 'OMAR', 'omar': 'عمر',
  'علي': 'ALI', 'ali': 'علي',
  'حمزة': 'HAMZA', 'hamza': 'حمزة',
  'بلال': 'BILAL', 'bilal': 'بلال',
  'عثمان': 'OTHMAN', 'othman': 'عثمان',
  'أسامة': 'OUSSAMA', 'اسامة': 'OUSSAMA', 'oussama': 'أسامة',
  'ياسين': 'YASSINE', 'yassine': 'ياسين'
};
let ownerNameConfig = { arabic: 'أحمد', latin: 'AHMED' };

try {
  if (fs.existsSync(OWNER_NAME_FILE)) {
    const saved = JSON.parse(fs.readFileSync(OWNER_NAME_FILE, 'utf8'));
    if (saved && typeof saved.arabic === 'string' && typeof saved.latin === 'string') {
      ownerNameConfig = saved;
    }
  }
} catch (e) {
  console.error('تعذر قراءة إعداد اسم المالك:', e.message);
}

function transliterateArabicName(name) {
  const letters = {
    'ا':'a','أ':'a','إ':'i','آ':'aa','ب':'b','ت':'t','ث':'th','ج':'j',
    'ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh',
    'ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q',
    'ك':'k','ل':'l','م':'m','ن':'n','ه':'h','ة':'a','و':'ou','ي':'y',
    'ى':'a','ء':'','ئ':'y','ؤ':'w','پ':'p','ڤ':'v','گ':'g'
  };
  return [...name].map(ch => letters[ch] || (/[\\u064B-\\u065F\\u0670ـ]/u.test(ch) ? '' : ch))
    .join('').replace(/\\s+/g, ' ').trim().toUpperCase();
}

function setOwnerName(input) {
  const name = input.trim().replace(/\\s+/g, ' ');
  const key = name.toLocaleLowerCase();
  const isArabic = /[\\u0600-\\u06FF]/u.test(name);
  let arabic, latin;

  if (isArabic) {
    arabic = name;
    latin = OWNER_NAME_MAP[name] || transliterateArabicName(name);
  } else {
    latin = name.toUpperCase();
    arabic = OWNER_NAME_MAP[key] || name;
  }

  ownerNameConfig = { arabic, latin };
  fs.writeFileSync(OWNER_NAME_FILE, JSON.stringify(ownerNameConfig, null, 2), 'utf8');
  return ownerNameConfig;
}

function replaceOwnerText(value) {
  if (typeof value !== 'string') return value;
  const arabic = ownerNameConfig.arabic;
  const latin = ownerNameConfig.latin;

  return value
    .replace(/أَحْـمَـدَ|أَحْـمَـدُ|أَحْـمَـد|أَحْمَـد|أَحْمَد|أحمد|احمد/gu, arabic)
    .replace(/𝐀𝐇𝐌𝐄𝐃|𝘈𝘏𝘔𝘌𝘋|AHMED/gi, latin.toUpperCase())
    .replace(/Ahmed/g, latin.charAt(0).toUpperCase() + latin.slice(1).toLowerCase())
    .replace(/ahmed/g, latin.toLowerCase());
}

function customizeOutgoingContent(content) {
  if (!content || typeof content !== 'object') return content;
  const result = { ...content };
  if (typeof result.text === 'string') result.text = replaceOwnerText(result.text);
  if (typeof result.caption === 'string') result.caption = replaceOwnerText(result.caption);
  return result;
}
// END CHANGE_OWNER_NAME_FEATURE`,
  'تعريف ميزة تغيير الاسم'
);

replaceOnce(
  `    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false
    });`,
  `    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false
    });

    // تطبيق الاسم المخصص على النصوص والتعليقات واسم المجموعة دون لمس مسارات الملفات.
    const originalSendMessage = sock.sendMessage.bind(sock);
    sock.sendMessage = (jid, content, options) =>
        originalSendMessage(jid, customizeOutgoingContent(content), options);

    if (typeof sock.groupUpdateSubject === 'function') {
        const originalGroupUpdateSubject = sock.groupUpdateSubject.bind(sock);
        sock.groupUpdateSubject = (jid, subject) =>
            originalGroupUpdateSubject(jid, replaceOwnerText(subject));
    }`,
  'ربط التخصيص بالإرسال'
);

replaceOnce(
  `const isDeveloper = developerNumbers.includes(senderNumber);`,
  `const isDeveloper = developerNumbers.includes(senderNumber);

// أمر تغيير اسم المالك: متاح في الخاص، أو للمطورين داخل المجموعات.
const senderKey = senderJid || from;
if (/^[.!]?\\\\s*تغير\\\\s*$/i.test(body)) {
    const isPrivateChat = from.endsWith('@s.whatsapp.net');
    if (!isPrivateChat && !isDeveloper) {
        await sock.sendMessage(from, { text: '⛔ استخدم أمر تغيير الاسم في الخاص مع البوت.' }, { quoted: mek });
        continue;
    }
    CHANGE_NAME_PENDING.set(senderKey, from);
    await sock.sendMessage(from, {
        text: '✍️ أرسل الاسم الجديد فقط، بالعربية أو باللاتينية.\\\\nمثال: أيوب أو AYOUB\\\\nغادي نحفظ الاسم ونستعمل الصيغتين قدر الإمكان.'
    }, { quoted: mek });
    continue;
}

if (CHANGE_NAME_PENDING.has(senderKey)) {
    if (/^[.!]/.test(body)) {
        CHANGE_NAME_PENDING.delete(senderKey);
    } else if (body && body.length <= 50) {
        try {
            const chosen = setOwnerName(body);
            CHANGE_NAME_PENDING.delete(senderKey);
            await sock.sendMessage(from, {
                text: '✅ تبدل اسم المالك وتحفظ بنجاح.\\\\n👑 العربية: ' + chosen.arabic +
                      '\\\\n🌐 اللاتينية: ' + chosen.latin +
                      '\\\\nالتغيير محفوظ حتى بعد إعادة تشغيل البوت.'
            }, { quoted: mek });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ ما قدرتش نحفظ الاسم: ' + e.message }, { quoted: mek });
        }
        continue;
    }
}`,
  'إضافة محادثة تغيير الاسم'
);

fs.writeFileSync(file, code, 'utf8');
console.log('✅ تمت إضافة ميزة .تغير.');
