const fs = require('fs');
let code = fs.readFileSync('bot-friend.js', 'utf8');

const voiceCode = `
if (m.text && (m.text === '.صوت' || m.text.startsWith('.صوت '))) {
    const args = m.text.split(' ').slice(1);
    const textToSpeak = args.join(' ') || "مرحباً، أنا هنا لمساعدتك بكل سلاسة.";
    const apiKey = 'YOUR_API_KEY_HERE';
    const voiceId = '21m00Tcm4TlvDq8ikWAM';

    await sock.sendMessage(m.chat, { text: "⏳ جاري توليد الصوت النسائي الحقيقي..." });

    const axios = require('axios');
    try {
        const res = await axios.post(\`https://api.elevenlabs.io/v1/text-to-speech/\${voiceId}\`, {
            text: textToSpeak,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        }, {
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            responseType: 'arraybuffer'
        });

        fs.writeFileSync('./temp_voice.mp3', Buffer.from(res.data));
        await sock.sendMessage(m.chat, {
            audio: { url: './temp_voice.mp3' },
            mimetype: 'audio/mp4',
            ptt: true 
        });
        fs.unlinkSync('./temp_voice.mp3');
    } catch (error) {
        console.error("خطأ في توليد الصوت:", error);
        await sock.sendMessage(m.chat, { text: "❌ حدث خطأ أثناء الاتصال بخدمة توليد الصوت السحابي." });
    }
}
`;

code += '\n' + voiceCode;
fs.writeFileSync('bot-friend.js', code, 'utf8');
console.log("✅ تمت إضافة أمر الصوت بنجاح تام!");
