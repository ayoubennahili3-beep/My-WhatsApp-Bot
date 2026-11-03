module.exports = {
    name: 'اوامر',
    async execute(sock, m, args) {
        const menuText = `🤖 **قائمة بوت Ayoub الخارق (2026)** 👑

` +
                         `⚡ .speed - قياس سرعة استجابة البوت
` +
                         `🎵 .اغنية [اسم] - جلب الأغاني فوراً
` +
                         `📦 .حزمة - معالجة الحزم والملصقات

` +
                         `🔥 *البوت يعمل بنظام الكاش والسرعة الفائقة!* 🦂`;
        await sock.sendMessage(m.key.remoteJid, { text: menuText }, { quoted: m });
    }
};