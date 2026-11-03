const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    
    const client = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) // تم إضافة هذا السطر لإخفاء الرسائل والسجلات المزعجة تماماً
    });

    client.ev.on('creds.update', saveCreds);

    client.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ تم تشغيل البوت بنجاح وهو متصل الآن وجاهز!');
        }
    });

    client.ev.on('messages.upsert', async (m) => {
        if (!m.messages || m.messages.length === 0) return;
        const mek = m.messages[0];
        if (!mek.message || mek.key.fromMe) return;

        const from = mek.key.remoteJid;
        const type = Object.keys(mek.message)[0];
        
        let body = (type === 'conversation') ? mek.message.conversation : 
                   (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
        
        const command = body.trim().toLowerCase();

        switch (command) {
            case 'ousama': {
                // 1. إرسال النص المزخرف
                const textMessage = `*༺ كُـنَّـا إِخْـوَةً لَا تُـفَـرِّقُـنَـا الـلَّـيَـالِـي  فَـمَـا لِـي أَرَى الـدَّرْبَ قَـدْ قُـسِّـمَ ، وَصَـارَ الَّـذِي كَـانَ قَـرِيـبًـا يُـفَـارِقُ ، أَيْـنَ عَـهْـدُ الـرِّجَـالِ ؟ أَيْـنَ يَـمِـيـنُـنَـا؟ أَنَـمْـضِـي وَنَـنْـسَـى أَنَّـنَـا قَـدْ تَـعَـاهَـدْنَـا ؟ مَـا خَـانَ أَحْـمَـدُ ، وَلَا خَـانَ الْـفُـؤَادُ ، لَـكِـنَّـهَـا الْأَقدار شَـاءَتْ أَنْ نَـتَـمَـزَّقَ ، سَـنَـبْـقَـى وَإِنْ فَـرَّقَـتْـنَـا الْـمَـسَـافَـاتُ إخْـوَةَ دَمٍ ، لَا يَـذِلُّ وَلَا يُـسَـاوَمُ...🌹༻*`;
                await client.sendMessage(from, { text: textMessage }, { quoted: mek });

                // 2. إرسال الفيديو الدائري
                await client.sendMessage(from, {
                    video: { url: '/storage/emulated/0/ousama3.mp4' },
                    mimetype: 'video/mp4',
                    ptv: true
                }, { quoted: mek });

                // 3. إرسال التسجيل الصوتي
                await client.sendMessage(from, {
                    audio: { url: '/storage/emulated/0/sawt230.mp3' },
                    mimetype: 'audio/mp4',
                    ptt: true
                }, { quoted: mek });

                break;
            }
        }
    });
}

startBot().catch(err => console.log(err));
