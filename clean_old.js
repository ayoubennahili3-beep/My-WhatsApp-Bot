const fs = require('fs');
let code = fs.readFileSync('bot-friend.js', 'utf8');

let startIndex = code.indexOf("if (command === '.صوت'");
if (startIndex !== -1) {
    let braceCount = 0;
    let endIndex = startIndex;
    let foundOpen = false;
    for (let i = startIndex; i < code.length; i++) {
        if (code[i] === '{') {
            braceCount++;
            foundOpen = true;
        } else if (code[i] === '}') {
            braceCount--;
        }
        if (foundOpen && braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }
    code = code.substring(0, startIndex) + code.substring(endIndex);
    fs.writeFileSync('bot-friend.js', code, 'utf8');
    console.log('✅ تمت إزالة الكود القديم التالف بنجاح!');
} else {
    console.log('⚠️ الكود القديم غير موجود أو تم حذفه مسبقاً.');
}
