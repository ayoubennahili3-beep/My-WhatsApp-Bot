from pathlib import Path
import shutil

p = Path.home() / "commands/song.js"
s = p.read_text()

start = s.index("async function makeCard(")
end = s.index("\nfunction runYtDlp(", start)

new = r'''
async function makeCard(title, channel, duration) {
    const bg = path.join(__dirname, 'toji-song-bg.png');
    const t = xml(shorten(title, 38));
    const c = xml(shorten(channel, 34));
    const d = xml(duration || 'غير معروف');

    const overlay = [
      '<svg width="1404" height="1536" viewBox="0 0 1404 1536" xmlns="http://www.w3.org/2000/svg">',
      '<defs>',
      '<filter id="glow" x="-20%" y="-30%" width="140%" height="160%">',
      '<feGaussianBlur stdDeviation="5" result="blur"/>',
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>',
      '</filter>',
      '<linearGradient id="panel" x1="0" y1="0" x2="1" y2="0">',
      '<stop offset="0%" stop-color="#08020f" stop-opacity="1"/>',
      '<stop offset="100%" stop-color="#10051c" stop-opacity="1"/>',
      '</linearGradient>',
      '</defs>',

      '<rect x="485" y="680" width="590" height="112" rx="12" fill="url(#panel)"/>',
      '<rect x="485" y="840" width="540" height="68" rx="10" fill="url(#panel)"/>',
      '<rect x="485" y="955" width="300" height="70" rx="10" fill="url(#panel)"/>',

      '<g font-family="DejaVu Sans, sans-serif" fill="#ffffff" filter="url(#glow)">',
      '<text x="520" y="730" font-size="37" font-weight="bold" stroke="#ffffff" stroke-width="0.7" paint-order="stroke fill">' + t + '</text>',
      '<text x="520" y="885" font-size="34" font-weight="bold" stroke="#ffffff" stroke-width="0.7" paint-order="stroke fill">' + c + '</text>',
      '<text x="520" y="1000" font-size="38" font-weight="bold" stroke="#ffffff" stroke-width="0.7" paint-order="stroke fill">' + d + '</text>',
      '</g>',
      '</svg>'
    ].join('');

    return sharp(bg)
        .composite([{ input: Buffer.from(overlay), left: 0, top: 0 }])
        .png()
        .toBuffer();
}
'''

backup = p.with_name("song.js.backup-text-fix")
shutil.copy2(p, backup)

s = s[:start] + new + s[end:]
s = s.replace(
    "module.exports = { name: 'اغنية', execute };",
    "module.exports = { name: 'اغنية', execute, makeCard };"
)
p.write_text(s)
print("تم إصلاح رسم النصوص.")
print("النسخة الاحتياطية:", backup)
