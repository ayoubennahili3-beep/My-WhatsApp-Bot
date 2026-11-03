
const fs = require('fs');
const path = require('path');

const keyFile = path.join(process.env.HOME, '.config', 'elevenlabs.env');
if (fs.existsSync(keyFile)) {
    const line = fs.readFileSync(keyFile, 'utf8')
        .split(/\r?\n/)
        .find(x => x.startsWith('ELEVENLABS_API_KEY='));
    if (line) process.env.ELEVENLABS_API_KEY = line.slice('ELEVENLABS_API_KEY='.length).trim();
}
module.exports = async function handleVoiceCmd(mek, body, from, sock) {
    if (!/^[.!]?\s*صوت(?:\s|$)/.test(body || '')) return false;

    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            await sock.sendMessage(from, {
                text: '❌ مفتاح ElevenLabs غير مضبوط في Termux.'
            }, { quoted: mek });
            return true;
        }

        const context = mek.message?.extendedTextMessage?.contextInfo;
        let target = mek;

        if (context?.quotedMessage) {
            target = {
                key: {
                    remoteJid: from,
                    id: context.stanzaId,
                    participant: context.participant,
                    fromMe: false
                },
                message: context.quotedMessage
            };
        }

        let message = target.message;
        while (message?.ephemeralMessage?.message ||
               message?.viewOnceMessage?.message ||
               message?.viewOnceMessageV2?.message) {
            message = message.ephemeralMessage?.message ||
                      message.viewOnceMessage?.message ||
                      message.viewOnceMessageV2?.message;
        }

        if (!message?.audioMessage) {
            await sock.sendMessage(from, {
                text: '🎙️ ردّ على تسجيل صوتي بالأمر .صوت'
            }, { quoted: mek });
            return true;
        }

        await sock.sendMessage(from, {
            text: '*جـــاري الـتَّـحْـمـيـل صــــوْت* ▰▰ 🎶'
        }, { quoted: mek });

        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
        const audio = await downloadMediaMessage(
            target, 'buffer', {}, { logger: console }
        );

        const mime = message.audioMessage.mimetype || 'audio/ogg';
        const ext = mime.includes('ogg') ? 'ogg' :
                    mime.includes('wav') ? 'wav' :
                    mime.includes('mp4') ? 'm4a' : 'mp3';

        const data = new FormData();
        data.append('audio', new Blob([audio], { type: mime }), 'input.' + ext);
        data.append('model_id', 'eleven_multilingual_sts_v2');

        const voiceId = 'EXAVITQu4vr4xnSDxMaL';
        const response = await fetch(
            'https://api.elevenlabs.io/v1/speech-to-speech/' + voiceId,
            {
                method: 'POST',
                headers: { 'xi-api-key': apiKey, 'Accept': 'audio/mpeg' },
                body: data
            }
        );

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('ElevenLabs API details:', errorDetails);
            throw new Error('ElevenLabs HTTP ' + response.status + ': ' + errorDetails);
        }

        const result = Buffer.from(await response.arrayBuffer());

        const fs = require('fs');
        const os = require('os');
        const path = require('path');
        const { execFileSync } = require('child_process');

        const inputFile = path.join(os.tmpdir(), 'voice-' + Date.now() + '.mp3');
        const outputFile = path.join(os.tmpdir(), 'voice-' + Date.now() + '.ogg');

        try {
            fs.writeFileSync(inputFile, result);
            execFileSync('ffmpeg', [
                '-y', '-i', inputFile,
                '-vn', '-c:a', 'libopus',
                '-b:a', '32k', '-ac', '1', '-ar', '48000',
                '-application', 'voip',
                outputFile
            ], { stdio: 'ignore' });

            const convertedAudio = fs.readFileSync(outputFile);

            await sock.sendMessage(from, {
                audio: convertedAudio,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: mek });

        } finally {
            if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        }

    } catch (e) {
        console.error('Voice conversion error:', e);
        await sock.sendMessage(from, {
            text: '❌ فشل تحويل الصوت: ' + e.message
        }, { quoted: mek });
    }

    return true;
};
