const fs = require('fs');
const lines = fs.readFileSync('bot-friend.js', 'utf8').split('\n');
console.log(`=== فحص من السطر 710 إلى النهاية (إجمالي السطور: ${lines.length}) ===`);
for (let i = 709; i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
