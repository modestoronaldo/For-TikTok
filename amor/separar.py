"""Quita el fondo blanco de cada hoja de personaje y separa las 4 poses en imágenes individuales."""
import json
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
NOMBRES = ['corazon', 'cerebro', 'estomago', 'dopamina', 'adrenalina', 'oxitocina', 'pareja']
info = {}
for nm in NOMBRES:
    src = Image.open(f'img/{nm}.png').convert('RGB')
    im = np.array(src).astype(np.int16); h, w, _ = im.shape
    bl = (im.min(2) > 230) & ((im.max(2) - im.min(2)) < 24)
    f = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bl[y, x] and not f[y, x]: f[y, x] = 1; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bl[y, x] and not f[y, x]: f[y, x] = 1; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and bl[yy, xx] and not f[yy, xx]: f[yy, xx] = 1; q.append((yy, xx))
    alpha = Image.fromarray((~f * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = src.convert('RGBA'); rgba.putalpha(alpha)
    a = np.array(alpha) > 40
    col = a.sum(0)
    # cortar en los 3 huecos verticales más anchos (4 poses)
    vacio = col < 2
    huecos, x = [], 0
    while x < w:
        if vacio[x]:
            j = x
            while j < w and vacio[j]: j += 1
            if x > 0 and j < w: huecos.append((x, j))
            x = j
        else: x += 1
    huecos = sorted(sorted(huecos, key=lambda g: g[1] - g[0], reverse=True)[:3])
    bordes = [0] + [(a0 + b0) // 2 for a0, b0 in huecos] + [w]
    # si hay poses pegadas: cortar el tramo más ancho por la columna con menos dibujo
    while len(bordes) < 5:
        segs = list(zip(bordes[:-1], bordes[1:]))
        x0, x1 = max(segs, key=lambda s: s[1] - s[0])
        lo, hi = x0 + int((x1 - x0) * 0.3), x0 + int((x1 - x0) * 0.7)
        cut = lo + int(np.argmin(col[lo:hi]))
        bordes = sorted(bordes + [cut])
    poses = []
    for k, (x0, x1) in enumerate(zip(bordes[:-1], bordes[1:])):
        p = rgba.crop((x0, 0, x1, h)); bb = p.getbbox(); p = p.crop(bb)
        p.save(f'img/{nm}_{k + 1}.png'); poses.append([p.width, p.height])
    info[nm] = {'huecos': len(huecos), 'poses': poses}
    print(nm, len(huecos), poses)
json.dump(info, open('img/poses.json', 'w'))
