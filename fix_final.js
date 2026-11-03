const fs = require('fs');
let code = fs.readFileSync('bot-friend.js', 'utf8');

// تنظيف أي أكواد سابقة تالفة
code = code.replace(/if\s*\(command === '\.صوت'[\s\S]*?\n\s*\}/g, '');
code = code.replace(/if\s*\(m\.text && \(m\.text === '\.صوت'[\s\S]*?\n\s*\}/g, '');

const voiceCode = `
// --- أمر .صوت لـ 5 نماذج نسائية حقيقية ---
if (m.text && (m.text.startsWith('.صوت') || m.text.startsWith('صوت'))) {
    const args = m.text.trim().split(' ').slice(1);
    const modelNum = args[0] || '1';
    const textToSpeak = args.slice(1).join(' ') || ("مرحباً، هذا النموذج رقم " + modelNum);

    const voiceIds = {
        '1': '21m00Tcm4TlvDq8ikWAM',
        '2': 'AZnzlk1XvdvUeBnXmlld',
        '3': 'EXAVITQu4vr4xnSDxMaL',
        '4': 'MF3mGyEYCl7XYWbV9V6O',
        '5': 'ThT5KcBeYPX3keUQqHPh'
    };

    const selectedVoice = voiceIds[modelNum] || voiceIds['1'];
    const apiKey = 'YOUR_API_KEY_HERE';

    await sock.sendMessage(m.chat, { text: "⏳ جاري توليد الصوت النسائي (نموذج " + modelNum + ")..." });

    try {
        const axios = require('axios');
        const res = await axios.post("https://api.elevenlabs.io/v1/text-to-speech/" + selectedVoice, {
            text: textToSpeak,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        }, {
            headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': apiKey },
            responseType: 'arraybuffer'
        });

        fs.writeFileSync('./temp_voice.mp3', Buffer.from(res.data));
        await sock.sendMessage(m.chat, { audio: { url: './temp_voice.mp3' }, mimetype: 'audio/mp4', ptt: true });
        fs.unlinkSync('./temp_voice.mp3');
    } catch (e) {
        console.error("خطأ الصوت:", e);
    }
}
`;

code += '\n' + voiceCode;
fs.writeFileSync('bot-friend.js', code, 'utf8');
console.log('✅ تم تصحيح الملف وتثبيت الأنماط الـ 5 بنجاح!');
