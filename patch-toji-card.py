from pathlib import Path
import shutil

p = Path.home() / "commands/song.js"
s = p.read_text()

start = s.index("async function makeCard(")
end = s.index("\nfunction runYtDlp(", start)

new_function = r'''
async function makeCard(title, channel, duration) {
    const bg = path.join(__dirname, 'toji-song-bg.png');

    const t = xml(shorten(title, 52));
    const c = xml(shorten(channel, 42));
    const d = xml(duration || 'غير معروف');

    const overlay = [
      '<svg width="1404" height="1536" viewBox="0 0 1404 1536" xmlns="http://www.w3.org/2000/svg">',
      '<defs><linearGradient id="panel" x1="0" y1="0" x2="1" y2="0">',
      '<stop offset="0%" stop-color="#08020f" stop-opacity=".98"/>',
      '<stop offset="100%" stop-color="#10051c" stop-opacity=".96"/>',
      '</linearGradient></defs>',

      '<rect x="490" y="680" width="570" height="112" rx="12" fill="url(#panel)"/>',
      '<rect x="490" y="840" width="520" height="65" rx="10" fill="url(#panel)"/>',
      '<rect x="490" y="955" width="280" height="65" rx="10" fill="url(#panel)"/>',

      '<text x="520" y="730" font-family="Arial, sans-serif" font-size="38" font-weight="bold" fill="#ffffff">' + t + '</text>',
      '<text x="520" y="775" font-family="Arial, sans-serif" font-size="32" fill="#ffffff">' + c + '</text>',
      '<text x="520" y="885" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#ffffff">' + c + '</text>',
      '<text x="520" y="1000" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">' + d + '</text>',
      '</svg>'
    ].join('');

    return sharp(bg)
        .composite([{ input: Buffer.from(overlay), left: 0, top: 0 }])
        .png()
        .toBuffer();
}
'''

backup = p.with_name("song.js.backup-before-toji-bg")
shutil.copy2(p, backup)

s = s[:start] + new_function + s[end:]

old = "caption: '🎧 *AUDIO SEARCH*\\n> 𝑻𝒐𝒋𝒊 𝑭𝒖𝒔𝒉𝒊𝒈𝒖𝒓𝒐'"
if old not in s:
    print("لم أجد caption بالنص المتوقع؛ لم أحفظ التعديل.")
    raise SystemExit(1)

s = s.replace(old, "caption: ''", 1)
p.write_text(s)
print("تم تعديل البطاقة. النسخة الاحتياطية:", backup)
