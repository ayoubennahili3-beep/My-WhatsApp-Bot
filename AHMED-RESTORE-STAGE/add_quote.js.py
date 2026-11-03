from pathlib import Path

p = Path.home() / "bot.js"
s = p.read_text()

marker = "if (command === 'هيبة') {"

if "command === 'اقتباس'" in s:
    print("الأمر .اقتباس موجود بالفعل؛ لم يتم إجراء أي تعديل.")
    raise SystemExit(0)

if marker not in s:
    print("لم أجد موضع أمر هيبة. لم يتم تعديل الملف.")
    raise SystemExit(1)

code = r'''
if (command === 'اقتباس') {
    const videoDir = '/storage/emulated/0/HIBA NEW';
    const indexFile = path.join(process.env.HOME, 'quote_index.json');

    const quotes = [
        '*ٱلعَظَمَةُ لَيْسَتْ حَرْفاً يُكْتَبُ، بَلْ هِيَ طَوْدٌ شَامِخٌ يَسْتَمِدُّ مِنْهُ الزَّمَانُ مَهَابَتَهُ، وَحَيْثُ يَحُلُّ أَحْمَدُ، يَسْتَحِيلُ الوُجُودُ هَيْبَةً. 🌹*',
        '*لَا يَسْأَلُ عَنِ المَجْدِ مَنْ كَانَ المَجْدُ طَوْعَ بَنَانِهِ؛ فَـأَحْمَدُ لَيْسَ عَابِراً فِي صَفَحَاتِ الخُلُودِ، بَلْ هُوَ السَّطْرُ الأَوَّلُ وَالعُنْوانُ الأَخِيرُ. 🌹*',
        '*كُلُّ شَيْءٍ يَنْتَهِي إلَّا العَظَمَةَ الَّتِي تَتَنَفَّسُ مِنَ المَعَانِي؛ وَفِي حَضْرَةِ اسْمِ أَحْمَدَ تَنْحَنِي الأَبْجَدِيَّةُ إجْلالاً لِمَا تَحْمِلُهُ حُرُوفُهُ مِنْ سُلْطَانٍ. 🌹*',
        '*العُقُولُ العَظِيمَةُ لَا تَبْحَثُ عَنْ نُورٍ، بَلْ هِيَ المِشْكَاةُ الَّتِي تُنِيرُ غَيَاهِبَ التَّارِيخِ؛ وَأَحْمَدُ شَمْسٌ تَرْفُضُ أَنْ تُغِيبَ بَيْنَ ظِلَالِ العَابِرِينَ. 🌹*',
        '*اَلْحِكْمَةُ الكُبْرَى أَنْ تَرَى الكَوْنَ صَغِيراً أَمَامَ هَامَةِ المَبْدَأ؛ وَأَحْمَدُ فِلْسَفَةٌ حَيَّةٌ، مَنْ قَرَأَهَا أَدْرَكَ أَنَّ العَظَمَةَ قَدْ خُلِقَتْ لِتُطَاعَ لَا لِتُوَصَفَ. 🌹*',
        '*اَلرُّوقِيُّ الحَقِيقِيُّ هُوَ أَنْ تَكُونَ كَالبَحْرِ، هَادِئاً فِي عُمْقِكَ، مُرْعِباً فِي طُوفَانِكَ؛ وَهَكَذَا هُوَ أَحْمَدُ، سَكِينَةٌ تَخْتَزِنُ وَرَاءَهَا عَاصِفَةَ العَظَمَةِ. 🌹*',
        '*لَمْ يَكُنِ الوُجُودُ سِوَى صَدَىً لِخُطُوَاتِ العُظَمَاءِ، وَحِينَ يَمْشِي أَحْمَدُ تَتَفَتَّحُ جَادَّةُ الأَبَدِيَّةِ إِيذَاناً بِأَنَّ المَلِكَ قَدْ مَرَّ هُنَا. 🌹*',
        '*اَلعَظَمَةُ صَمْتٌ نَاطِقٌ يَبْلَعُ ضَوْضَاءَ العَالَمِ؛ وَأَحْمَدُ هُوَ ذَلِكَ الصَّمْتُ المُهِيبُ الَّذِي إِذَا تَكَلَّمَ، خَرَّتِ الأَيَّامُ إِكْبَاراً لِعُلوِّهِ. 🌹*'
    ];

    let quoteIndex = 0;
    try {
        const saved = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
        if (Number.isInteger(saved.index)) {
            quoteIndex = ((saved.index % quotes.length) + quotes.length) % quotes.length;
        }
    } catch (_) {}

    const videoPath = path.join(
        videoDir,
        'vid' + String(quoteIndex + 1).padStart(3, '0') + '.mp4'
    );

    if (!fs.existsSync(videoPath)) {
        await sock.sendMessage(from, {
            text: '⚠️ لم أجد الفيديو: ' + videoPath
        }, { quoted: mek });
        continue;
    }

    await sock.sendMessage(from, {
        text: quotes[quoteIndex]
    }, { quoted: mek });

    await sock.sendMessage(from, {
        video: fs.readFileSync(videoPath),
        mimetype: 'video/mp4',
        ptv: true
    }, { quoted: mek });

    const nextIndex = (quoteIndex + 1) % quotes.length;
    fs.writeFileSync(indexFile, JSON.stringify({ index: nextIndex }));

    continue;
}

'''

Path(str(p) + '.before_quote').write_text(s)
p.write_text(s.replace(marker, code + marker, 1))
print("تمت إضافة الأمر .اقتباس، وحُفظت نسخة احتياطية باسم bot.js.before_quote")
