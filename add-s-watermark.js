const fs = require('fs');
const path = require('path');

const file = path.join(process.env.HOME, 'bot-friend.js');
let code = fs.readFileSync(file, 'utf8');

const oldFilter = `"fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000"`;

const newFilter = `"fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,drawtext=fontfile=/system/fonts/NotoNaskhArabic-Bold.ttf:textfile=${'$'}{watermarkPath}:fontcolor=white:fontsize=10:borderw=1:bordercolor=black@0.65:x=(w-text_w)/2:y=h-text_h-5"`;

if (!code.includes(oldFilter)) {
    console.error('لم أجد سطر تحويل الفيديو المتوقع. لم يتم تغيير الملف.');
    process.exit(1);
}

if (code.includes('const watermarkPath = path.join(__dirname')) {
    console.error('يبدو أن الحقوق أضيفت من قبل. لم يتم إجراء تعديل.');
    process.exit(1);
}

const marker = "fs.writeFileSync(inputPath, mediaBuffer);";
if (!code.includes(marker)) {
    console.error('لم أجد موضع إنشاء ملف الفيديو.');
    process.exit(1);
}

code = code.replace(
    marker,
    marker + `
        const watermarkPath = path.join(__dirname, '.sticker-watermark-' + process.pid + '-' + Date.now() + '.txt');
        fs.writeFileSync(watermarkPath, '🍁 𝒀𝒐𝒉𝒂𝒏 𝑳𝒊𝒆𝒃𝒆𝒓𝒕 ツ 🤍༻ : 🌹 𝐓𝐡𝐞 𝐏𝐫𝐢𝐧𝐜𝐞 🌹', 'utf8');
`
);

code = code.replace(oldFilter, newFilter);

code = code.replace(
    'for (const p of [inputPath, outputPath])',
    'for (const p of [inputPath, outputPath, watermarkPath])'
);

fs.writeFileSync(file, code);
console.log('تمت إضافة حقوق .S أسفل الستيكر المتحرك.');
