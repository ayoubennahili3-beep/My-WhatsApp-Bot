import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

if len(sys.argv) < 5:
    print("Usage: render-song-card.py <bg> <title> <channel> <duration> [output]")
    sys.exit(1)

bg, title, channel, duration = sys.argv[1:5]
output = sys.argv[5] if len(sys.argv) > 5 else "out.png"

font_dir = os.path.join(os.environ.get("PREFIX", "/data/data/com.termux/files/usr"), "share/fonts/TTF")
BOLD = os.path.join(font_dir, "DejaVuSansCondensed-Bold.ttf")

base_im = Image.open(bg).convert("RGB")

def fit_text(text, font_path, max_w, max_h, max_size=34, min_size=14, max_lines=2):
    text = str(text or "غير معروف").strip()
    if not text: text = "غير معروف"
    
    dummy_draw = ImageDraw.Draw(base_im)
    for size in range(max_size, min_size - 1, -1):
        font = ImageFont.truetype(font_path, size)
        words = text.split()
        lines, line = [], ""
        for word in words:
            test = (line + " " + word).strip()
            bbox = dummy_draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] <= max_w - 10: 
                line = test
            else:
                if line: lines.append(line)
                line = word
        if line: lines.append(line)
        if not lines: lines = [text]
        
        line_heights = [dummy_draw.textbbox((0, 0), l, font=font)[3] - dummy_draw.textbbox((0, 0), l, font=font)[1] for l in lines]
        spacing = max(4, size // 4)
        total_h = sum(line_heights) + spacing * (len(lines) - 1)
        
        if len(lines) <= max_lines and total_h <= max_h:
            return font, lines, spacing, total_h
            
    font = ImageFont.truetype(font_path, min_size)
    return font, [text[:40] + "..."], 4, min_size

def draw_3d_text(im, text, x, y, w, h, font_path, max_size, min_size, max_lines=2):
    # 1. نحسبو الخط والتقسيم
    font, lines, spacing, total_h = fit_text(text, font_path, w, h, max_size, min_size, max_lines)
    cy = y + (h - total_h) // 2
    
    # 2. نصنعو طبقة شفافة للظل واللمعان
    glow_layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # 3. نرسمو النصوص فطبقة الظل
    for line in lines:
        bbox = glow_draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        tx = x + (w - tw) // 2
        
        # ظل أسود سميك
        glow_draw.text((tx, cy - bbox[1]), line, font=font, fill=(0, 0, 0, 255), stroke_width=6, stroke_fill=(0, 0, 0, 255))
        # هالة بنفسجية خفيفة
        glow_draw.text((tx, cy - bbox[1]), line, font=font, fill=(138, 43, 226, 100), stroke_width=3, stroke_fill=(138, 43, 226, 100))
        
        cy += (bbox[3] - bbox[1]) + spacing

    # 4. نطبقو Blur قوي على طبقة الظل باش يبان ناعم
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=4))
    
    # 5. نركبو طبقة الظل فوق الصورة الأصلية
    im.paste(glow_layer, (0, 0), glow_layer)
    
    # 6. نرسمو النص الأساسي بالبياض النقي فوق كلشي
    draw = ImageDraw.Draw(im)
    cy = y + (h - total_h) // 2
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        tx = x + (w - tw) // 2
        draw.text((tx, cy - bbox[1]), line, font=font, fill=(255, 255, 255))
        cy += (bbox[3] - bbox[1]) + spacing

# --- رسم العناصر بـ 3D ---
draw_3d_text(base_im, title, 520, 665, 430, 115, BOLD, 34, 14, 2)
draw_3d_text(base_im, channel, 520, 830, 430, 75, BOLD, 28, 14, 1)
draw_3d_text(base_im, duration, 520, 920, 430, 60, BOLD, 30, 18, 1)

base_im.save(output, "PNG")
print("✅ 3D CARD RENDERED SUCCESSFULLY")
