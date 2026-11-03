const fs = require('fs');
const lines = fs.readFileSync('bot-friend.js', 'utf8').split('\n');
console.log("=== فحص السطور من 715 إلى 735 في bot-friend.js ===");
for (let i = 714; i < Math.min(lines.length, 735); i++) {
    console.log(`${i + 1}: ${lines[i] !== undefined ? lines[i] : ''}`);
}
