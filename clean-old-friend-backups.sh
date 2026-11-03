#!/data/data/com.termux/files/usr/bin/bash

H="$HOME"

mapfile -d '' ITEMS < <(
  find "$H" -maxdepth 1 \
  \( \
    -name 'bot-friend.js.backup*' -o \
    -name 'bot-commands.json.backup*' -o \
    -name 'update-bot-commands.js.backup*' -o \
    -name 'voice.js.backup*' -o \
    -name 'bot.js.backup*' -o \
    -name 'session-ayoub-friend-backup-*' -o \
    -name 'session-ayoub-friend-rejected-*' -o \
    -name 'bot-friend-transfer-*' -o \
    -name 'bot-friend-transfer.tar.gz' -o \
    -name 'bot-friend-full-transfer' -o \
    -name 'bot-friend-clean-backup-*' -o \
    -name 'bot-friend-backup-*.tar.gz' -o \
    -name 'bot_backup_20261031_001044' -o \
    -name 'bot_backup_commands_20261031_142613.js' -o \
    -name 'session-backup' -o \
    -name 'session-backup.tar.gz' -o \
    -name 'backups' -o \
    -name 'song-commands-backup-*' -o \
    -name 'sticker-pack-helper.js.backup' -o \
    -name 'hazma-images.js.backup-*' -o \
    -name 'security-fix-backup-*' -o \
    -name 'bot-friend-backup-cache.js' \
  \) -print0
)

echo "النسخ القديمة المرشحة للحذف:"
printf '%s\n' "${ITEMS[@]##*/}"
echo
echo "عدد العناصر: ${#ITEMS[@]}"
echo
read -r -p "اكتب DELETE للتأكيد: " CONFIRM

if [ "$CONFIRM" = "DELETE" ]; then
  for p in "${ITEMS[@]}"; do
    rm -rf -- "$p"
  done
  rm -rf -- "$H/.friend-final-stage"
  echo "تم حذف النسخ القديمة المحددة."
else
  echo "تم الإلغاء. لم يتم حذف شيء."
fi

echo
echo "النسخة النهائية:"
ls -lh "$H/BOT-FRIEND-FINAL-BACKUP.tar.gz"
