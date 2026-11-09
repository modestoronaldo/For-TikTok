"""Quita el fondo blanco de los personajes (relleno desde los bordes) y recorta al contenido."""
import json, sys
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
NOMBRES = ['eti', 'estomago', 'cerebro', 'rinon1', 'rinon2', 'higado', 'ace', 'acetato', 'persona']
info = {}
for nm in NOMBRES:
    im = np.array(Image.open(f'img/{nm}.png').convert('RGB')).astype(np.int16)
    h, w, _ = im.shape
    blanco = (im.min(axis=2) > 232) & ((im.max(axis=2) - im.min(axis=2)) < 22)
    fondo = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if blanco[y, x] and not fondo[y, x]: fondo[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if blanco[y, x] and not fondo[y, x]: fondo[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and blanco[yy, xx] and not fondo[yy, xx]:
                fondo[yy, xx] = True; q.append((yy, xx))
    alpha = Image.fromarray((~fondo * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = Image.open(f'img/{nm}.png').convert('RGBA'); rgba.putalpha(alpha)
    bb = rgba.getbbox(); rgba = rgba.crop(bb)
    rgba.save(f'img/{nm}_c.png')
    info[nm] = {'w': rgba.width, 'h': rgba.height, 'bbox': bb}
    print(nm, rgba.size)
json.dump(info, open('img/recortes.json', 'w'))
