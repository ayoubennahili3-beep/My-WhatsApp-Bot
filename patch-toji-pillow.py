from pathlib import Path
import shutil

p = Path.home() / "commands/song.js"
s = p.read_text()

start = s.index("async function makeCard(")
end = s.index("\nfunction runYtDlp(", start)

new = r'''
async function makeCard(title, channel, duration) {
    const bg = path.join(__dirname, 'toji-song-bg.png');
    const renderer = path.join(__dirname, 'toji-render-card.py');

    return new Promise((resolve, reject) => {
        execFile(
            'python',
            [renderer, bg, String(title || ''), String(channel || ''), String(duration || '')],
            {
                encoding: 'buffer',
                timeout: 30000,
                maxBuffer: 12 * 1024 * 1024
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(String(stderr || error.message).trim()));
                    return;
                }
                resolve(stdout);
            }
        );
    });
}
'''

backup = p.with_name("song.js.backup-before-pillow-render")
shutil.copy2(p, backup)
p.write_text(s[:start] + new + s[end:])

print("✅ تم ربط البطاقة برسم Pillow.")
print("النسخة الاحتياطية:", backup)
