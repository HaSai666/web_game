# -*- coding: utf-8 -*-
# 制作 jump scare 用图：浴室镜子里的脸（特写增亮）+ 角落里的人影
import random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

IMG = r"D:/wk_github/web_game/site/assets/img"
random.seed(44)

def grain(im, amount=7):
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            n = random.gauss(0, amount)
            r, g, b = px[x, y]
            px[x, y] = (max(0, min(255, int(r + n))),
                        max(0, min(255, int(g + n))),
                        max(0, min(255, int(b + n))))
    return im

# ---- 1. scare_face.jpg：浴室照片里那张脸的特写，提亮拉对比 ----
src = Image.open(IMG + "/bathroom.jpg").convert("RGB")
# 脸在原图右侧中部（按800x600原图估算区域），裁切后放大
face = src.crop((500, 230, 760, 500)).resize((800, 600), Image.LANCZOS)
face = ImageEnhance.Brightness(face).enhance(1.5)
face = ImageEnhance.Contrast(face).enhance(1.35)
face = ImageEnhance.Color(face).enhance(0.55)
face = grain(face, 8)
face = face.filter(ImageFilter.GaussianBlur(0.5))
face.save(IMG + "/scare_face.jpg", quality=70)
print("scare_face.jpg done")

# ---- 2. corner_figure.jpg：亮版角落图压暗 + 左角一个人影 ----
base = Image.open(IMG + "/corner.jpg").convert("RGB")
base = ImageEnhance.Brightness(base).enhance(0.5)
w, h = base.size
fig = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(fig)
cx, top = int(w * 0.16), int(h * 0.22)   # 人影位置：左角
# 头
d.ellipse([cx - 26, top, cx + 26, top + 64], fill=(8, 6, 6, 255))
# 肩/身（向下渐宽）
d.polygon([(cx - 30, top + 58), (cx + 30, top + 58), (cx + 58, h), (cx - 58, h)], fill=(8, 6, 6, 255))
# 极淡的边缘光（右侧），让它“刚刚能看出来”
edge = Image.new("RGBA", (w, h), (0, 0, 0, 0))
de = ImageDraw.Draw(edge)
de.arc([cx - 26, top, cx + 26, top + 64], start=-60, end=60, fill=(90, 80, 70, 90), width=2)
de.line([(cx + 30, top + 62), (cx + 56, h)], fill=(90, 80, 70, 60), width=2)
fig = fig.filter(ImageFilter.GaussianBlur(2))
edge = edge.filter(ImageFilter.GaussianBlur(3))
base = Image.alpha_composite(base.convert("RGBA"), fig)
base = Image.alpha_composite(base, edge)
out = grain(base.convert("RGB"), 6)
out.save(IMG + "/corner_figure.jpg", quality=72)
print("corner_figure.jpg done")
