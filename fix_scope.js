const fs = require('fs');
let c = fs.readFileSync('bot-friend.js', 'utf8');

// إزالة كود الصوت السابق من النهاية
c = c.replace(/\/\/ --- أمر الصوت[\s\S]*$/, '');

// إضافة الكود الصحيح بدالة async مستقلة تماماً
c += `
// --- أمر الصوت النظيف الآمن ---
if (m.text && (m.text.startsWith('.صوت') || m.text.startsWith('صوت'))) {
    (async () => {
        try {
            const args = m.text.trim().split(' ').slice(1);
            const num = args[0] || '1';
            const txt = args.slice(1).join(' ') || 'مرحباً، نموذج ' + num;
            const voices = {'1':'21m00Tcm4TlvDq8ikWAM','2':'AZnzlk1XvdvUeBnXmlld','3':'EXAVITQu4vr4xnSDxMaL','4':'MF3mGyEYCl7XYWbV9V6O','5':'ThT5KcBeYPX3keUQqHPh'};
            const vId = voices[num] || voices['1'];
            await sock.sendMessage(m.chat, { text: '⏳ توليد الصوت ' + num + '...' });
            
            const ax = require('axios');
            const res = await ax.post('https://api.elevenlabs.io/v1/text-to-speech/' + vId, {
                text: txt, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            }, { headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': 'YOUR_API_KEY_HERE' }, responseType: 'arraybuffer' });
            
            fs.writeFileSync('./v.mp3', Buffer.from(res.data));
            await sock.sendMessage(m.chat, { audio: { url: './v.mp3' }, mimetype: 'audio/mp4', ptt: true });
            fs.unlinkSync('./v.mp3');
        } catch(e) { console.error("خطأ في الصوت:", e); }
    })();
}
`;

fs.writeFileSync('bot-friend.js', c);
console.log('✅ تم تصحيح البنية البرمجية بنجاح تام!');
