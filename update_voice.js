const fs = require('fs');
let code = fs.readFileSync('bot-friend.js', 'utf8');

const newVoiceCode = `
if (command === '.صوت' || text.startsWith('.صوت ')) {
    const textToSpeak = args.join(' ') || "مرحباً، أنا هنا لمساعدتك بكل سلاسة.";
    const apiKey = 'ضع_مفتاح_API_الخاص_بك_هنا';
    const voiceId = '21m00Tcm4TlvDq8ikWAM';

    await sock.sendMessage(msg.key.remoteJid, { text: "⏳ جاري توليد الصوت النسائي الحقيقي..." });

    const options = {
        method: 'POST',
        url: \`https://api.elevenlabs.io/v1/text-to-speech/\${voiceId}\`,
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
        },
        data: {
            text: textToSpeak,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        },
        responseType: 'arraybuffer'
    };

    try {
        const axios = require('axios');
        const response = await axios.request(options);
        const audioPath = './temp_voice.mp3';
        fs.writeFileSync(audioPath, Buffer.from(response.data));

        await sock.sendMessage(msg.key.remoteJid, {
            audio: { url: audioPath },
            mimetype: 'audio/mp4',
            ptt: true 
        });
        
        fs.unlinkSync(audioPath);
    } catch (error) {
        console.error("خطأ في توليد الصوت:", error);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ حدث خطأ أثناء الاتصال بخدمة توليد الصوت السحابي." });
    }
}
`;

if (code.includes('tons30.mp3')) {
    let lines = code.split('\n');
    let newLines = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('tons30.mp3')) {
            newLines.push(newVoiceCode);
            continue;
        }
        newLines.push(lines[i]);
    }
    code = newLines.join('\n');
    fs.writeFileSync('bot-friend.js', code, 'utf8');
    console.log("✅ تم استبدال الكود القديم وتحديث أمر .صوت بنجاح!");
} else {
    console.log("⚠️ لم يتم العثور على tons30.mp3 القديم.");
}
