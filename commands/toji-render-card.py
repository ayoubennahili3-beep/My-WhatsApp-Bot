from PIL import Image, ImageDraw, ImageFont
import sys, textwrap

bg, title, channel, duration = sys.argv[1:5]

img = Image.open(bg).convert("RGBA")
draw = ImageDraw.Draw(img)

font_bold = "/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"
font_regular = "/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans.ttf"

def font(size, bold=False):
    return ImageFont.truetype(font_bold if bold else font_regular, size)

# مساحات المعلومات
draw.rounded_rectangle((485, 680, 1075, 792), radius=12, fill=(12, 3, 22, 245))
draw.rounded_rectangle((485, 840, 1025, 908), radius=10, fill=(12, 3, 22, 245))
draw.rounded_rectangle((485, 955, 785, 1025), radius=10, fill=(12, 3, 22, 245))

def fit_text(text, max_width, max_size, min_size=22, bold=True):
    text = " ".join(str(text).split()) or "غير معروف"
    for size in range(max_size, min_size - 1, -2):
        f = font(size, bold)
        if draw.textbbox((0, 0), text, font=f)[2] <= max_width:
            return text, f
    return text, font(min_size, bold)

# العنوان: سطر أو سطران حسب الطول
title = " ".join(title.split()) or "غير معروف"
words = title.split()
lines, current = [], ""

for word in words:
    candidate = (current + " " + word).strip()
    if draw.textbbox((0, 0), candidate, font=font(34, True))[2] <= 535:
        current = candidate
    else:
        if current:
            lines.append(current)
        current = word

if current:
    lines.append(current)

if len(lines) > 2:
    lines = [lines[0], " ".join(lines[1:])]

for i, line in enumerate(lines):
    line, f = fit_text(line, 535, 34, 23)
    draw.text((520, 690 + i * 43), line, font=f, fill=(255, 255, 255, 255))

channel, f = fit_text(channel, 480, 30, 21)
draw.text((520, 852), channel, font=f, fill=(255, 255, 255, 255))

duration, f = fit_text(duration, 240, 34, 24)
draw.text((520, 965), duration, font=f, fill=(255, 255, 255, 255))

sys.stdout.buffer.write(img.convert("RGB").save_to_bytes() if False else b"")
import io
out = io.BytesIO()
img.convert("RGB").save(out, format="PNG", optimize=True)
sys.stdout.buffer.write(out.getvalue())
