# -*- coding: utf-8 -*-
# 千禧年傻瓜机照片处理：机顶闪光灯 + CCD噪点 + 日期水印 + 低画质JPEG
import math, random, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

IMG = r"D:/wk_github/web_game/site/assets/img"
FONT = r"C:/Windows/Fonts/courbd.ttf"
random.seed(37)

def flash(im, strength=1.0, falloff=0.55):
    """机顶闪光灯：中心提亮、边缘快速衰减"""
    w, h = im.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    cx, cy = w / 2, h / 2
    maxr = math.hypot(cx, cy)
    for r in range(int(maxr), 0, -6):
        v = int(255 * (1 - r / maxr) ** 1.6)
        d.ellipse([cx - r * w / h, cy - r, cx + r * w / h, cy + r], fill=v)
    white = Image.new("RGB", (w, h), (255, 244, 225))
    out = Image.composite(
        Image.blend(im, white, 0.34 * strength), im, mask)
    # 边缘压暗
    inv = mask.point(lambda v: int((255 - v) * falloff))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(out, black, inv.point(lambda v: 255 - v))

def ccd_noise(im, amount=9):
    px = im.load()
    w, h = im.size
    for y in range(0, h):
        for x in range(0, w):
            n = random.gauss(0, amount)
            g = random.gauss(0, amount * 0.6)  # 绿色通道噪点更重（低光CCD）
            r, gch, b = px[x, y]
            px[x, y] = (
                max(0, min(255, int(r + n + 4))),        # 轻微偏暖
                max(0, min(255, int(gch + g))),
                max(0, min(255, int(b + n - 6))),        # 蓝通道压一点
            )
    return im

def datestamp(im, text):
    if not text:
        return im
    w, h = im.size
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype(FONT, int(h * 0.045))
    tw = d.textlength(text, font=font)
    x, y = w - tw - int(w * 0.03), h - int(h * 0.08)
    orange = (255, 128, 24)
    # LED 辉光：错位多画几次
    for dx, dy, c in [(1, 1, (120, 50, 0)), (0, 0, orange), (-1, 0, (255, 170, 60))]:
        d.text((x + dx, y + dy), text, font=font, fill=c)
    return im

def y2k(path, stamp, flash_s=1.0, noise=9, blur=0.7, sat=0.72, bright=1.0):
    im = Image.open(path).convert("RGB")
    im = ImageEnhance.Color(im).enhance(sat)
    if bright != 1.0:
        im = ImageEnhance.Brightness(im).enhance(bright)
    im = flash(im, strength=flash_s)
    im = ccd_noise(im, noise)
    im = im.filter(ImageFilter.GaussianBlur(blur))
    im = datestamp(im, stamp)
    im.save(path, quality=62)
    print("done", os.path.basename(path), "stamp:", stamp or "-")

JOBS = [
    ("crt.jpg",        None,               0.7, 7, 0.6, 0.80, 1.0),   # 站长2023年的手机照，少做旧
    ("crossroad.jpg",  "2005:02:23 23:58", 1.0, 10, 0.8, 0.68, 1.0),
    ("bathroom.jpg",   "2005:02:25 23:47", 1.1, 10, 0.8, 0.66, 1.0),
    ("oldroom.jpg",    "2004:12:18 21:05", 0.9, 9, 0.7, 0.72, 1.0),
    ("corner.jpg",     "2005:02:27 02:40", 1.2, 11, 0.9, 0.62, 1.0),
    ("corner_dark.jpg","2005:02:27 03:33", 0.0, 11, 0.9, 0.60, 1.0),  # 已经全黑，不再闪光
]

for name, stamp, fs, nz, bl, sat, br in JOBS:
    y2k(os.path.join(IMG, name), stamp, fs, nz, bl, sat, br)
print("all done")
