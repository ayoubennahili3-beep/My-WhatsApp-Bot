#!/data/data/com.termux/files/usr/bin/bash
set -e

H="$HOME"
B="$H/bot-friend-clean-backup-20261102-065616"
T="$H/bot-friend-transfer-20261030/bot-package"
OUT="$H/BOT-FRIEND-FINAL-BACKUP.tar.gz"
STAGE="$H/.friend-final-stage"

echo "1/5 تجهيز الملفات..."
rm -rf "$STAGE"
mkdir -p "$STAGE"

cp -a "$B/." "$STAGE/"
cp -a "$H/voice.js" "$STAGE/"
cp -a "$H/dm-blocks-friend.json" "$STAGE/"
cp -a "$H/bot-friend.js" "$STAGE/"
cp -a "$H/bot-commands.json" "$STAGE/"
cp -a "$H/package.json" "$STAGE/"
cp -a "$H/package-lock.json" "$STAGE/"
cp -a "$H/commands" "$STAGE/"
cp -a "$H/bot-friend-media" "$STAGE/"

if [ -f "$H/update-bot-commands.js" ]; then
  cp -a "$H/update-bot-commands.js" "$STAGE/"
elif [ -f "$T/update-bot-commands.js" ]; then
  cp -a "$T/update-bot-commands.js" "$STAGE/"
fi

echo "2/5 جمع الوسائط الموجودة..."
mkdir -p "$STAGE/phone-media"

for d in \
"New Folder kingo 7" \
"mesiand20000005" \
"New Folder kibraya2" \
"1" "blodemyooooor" "kendi9790" \
"New Folder 8890" "New Folder fizya2 bons" \
"4" "salat5801" "mom new" "new 3" \
"New Folder pawar los 233" "Ahmad"; do
  if [ -d "/storage/emulated/0/$d" ]; then
    cp -a "/storage/emulated/0/$d" "$STAGE/phone-media/"
  fi
done

echo "3/5 إنشاء الأرشيف..."
rm -f "$OUT"
tar -czf "$OUT" -C "$STAGE" .

echo "4/5 فحص سلامة الأرشيف..."
gzip -t "$OUT"
tar -tzf "$OUT" >/dev/null

echo "5/5 التحقق من الملفات الأساسية..."
for f in bot-friend.js voice.js commands/imagine.js \
session-ayoub-friend/creds.json bot-friend-media \
package.json package-lock.json; do
  tar -tzf "$OUT" | grep -Fq "./$f" || {
    echo "خطأ: الملف ناقص: $f"
    exit 1
  }
done

echo
echo "نجح إنشاء النسخة النهائية:"
ls -lh "$OUT"
echo "المسار: $OUT"
echo "لم يتم حذف أي نسخة قديمة."
