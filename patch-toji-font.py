from pathlib import Path
import re, shutil, time, sys

p = Path.home() / "commands/song.js"
s = p.read_text()
backup = Path(str(p) + ".backup-font-" + time.strftime("%Y%m%d-%H%M%S"))
shutil.copy2(p, backup)

new_func = r"""
async function makeCard(title, channel, duration) {
    const bg = path.join(__dirname, 'toji-song-bg.png');
    const renderer = path.join(__dirname, 'render-song-card.py');
    const output = path.join(os.tmpdir(),
        'toji-card-' + process.pid + '-' + Date.now() + '.png');

    try {
        await new Promise((resolve, reject) => {
            execFile('python', [
                renderer, bg,
                String(title || 'غير معروف'),
                String(channel || 'غير معروف'),
                String(duration || 'غير معروف'),
                output
            ], { timeout: 30000, maxBuffer: 1024 * 1024 },
            (error) => error ? reject(error) : resolve());
        });

        return await fs.promises.readFile(output);
    } finally {
        try { await fs.promises.unlink(output); } catch (_) {}
    }
}
"""

pattern = r"async function makeCard\(title, channel, duration\)\s*\{[\s\S]*?\n\}\s*(?=function runYtDlp)"
updated, count = re.subn(pattern, new_func + "\n", s, count=1)

if count != 1:
    print("❌ لم أجد دالة makeCard بالشكل المتوقع. لم يتغير الملف.")
    sys.exit(1)

p.write_text(updated)
print("✅ تم تحديث الخط وطريقة رسم معلومات الأغنية.")
print("النسخة الاحتياطية:", backup)
