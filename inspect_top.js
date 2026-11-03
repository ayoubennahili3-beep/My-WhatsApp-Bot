const fs = require('fs');
const lines = fs.readFileSync('bot-friend.js', 'utf8').split('\n');
console.log("=== فحص السطور من 680 إلى 717 ===");
for (let i = 679; i < 717; i++) {
    console.log(`${i + 1}: ${lines[i] !== undefined ? lines[i] : ''}`);
}
