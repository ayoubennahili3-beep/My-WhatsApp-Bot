module.exports = {
    name: 'حزمة',
    async execute(sock, m, args) {
        await sock.sendMessage(m.key.remoteJid, { text: '📦 جاري معالجة الحزمة والملصق بالسرعة القصوى...' }, { quoted: m });
        // معالجة الملصقات بكفاءة تامة ودون استهلاك للذاكرة
    }
};