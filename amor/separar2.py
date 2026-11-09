"""Separa poses por figuras conectadas: las 4 más grandes son las poses; los detalles sueltos se unen a la más cercana."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
for nm in sys.argv[1:]:
    src = Image.open(f'img/{nm}.png').convert('RGB')
    im = np.array(src).astype(np.int16); h, w, _ = im.shape
    bl = (im.min(2) > 230) & ((im.max(2) - im.min(2)) < 24)
    lab_bg, _ = ndimage.label(bl)
    edge = set(np.unique(np.concatenate([lab_bg[0], lab_bg[-1], lab_bg[:, 0], lab_bg[:, -1]]))) - {0}
    fondo = np.isin(lab_bg, list(edge))
    alpha = Image.fromarray((~fondo * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = src.convert('RGBA'); rgba.putalpha(alpha)
    fg = np.array(alpha) > 40
    lab, n = ndimage.label(ndimage.binary_dilation(fg, iterations=2))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    big = list(np.argsort(sizes)[::-1][:4] + 1)
    cx = {i: ndimage.center_of_mass(lab == i)[1] for i in range(1, n + 1)}
    big.sort(key=lambda i: cx[i])
    asign = np.zeros_like(lab)
    for i in range(1, n + 1):
        tgt = i if i in big else min(big, key=lambda b: abs(cx[b] - cx[i]))
        asign[lab == i] = big.index(tgt) + 1
    arr = np.array(rgba)
    for k in range(4):
        m = (asign == k + 1) & fg
        a = arr.copy(); a[..., 3] = np.where(ndimage.binary_dilation(m, iterations=3), arr[..., 3], 0)
        p = Image.fromarray(a); p = p.crop(p.getbbox()); p.save(f'img/{nm}_{k + 1}.png'); print(nm, k + 1, p.size)
