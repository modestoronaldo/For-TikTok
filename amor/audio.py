"""Arma el audio del video "Tus órganos cuando te enamoras":
- separa las frases de cada voz (pausas largas),
- las coloca en la línea de tiempo con sus pausas y transiciones,
- agrega efectos de sonido y música de fondo generados con código,
- exporta audio/mezcla.wav y timeline.js (tiempos de frases, escenas, eventos y bocas por cuadro).
"""
import json, subprocess, wave
import numpy as np

SR, FPS = 44100, 24
G = json.load(open('guion.json', encoding='utf-8'))
LINEAS = G['lineas']
rng = np.random.default_rng(5)


def leer(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768


def partir(x, n):
    """Divide en n frases usando los n-1 silencios más largos."""
    win = int(0.02 * SR)
    env = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode='same'))
    voz = env > 10 ** (-40 / 20)
    # tramos de silencio
    sil, i = [], 0
    while i < len(voz):
        if not voz[i]:
            j = i
            while j < len(voz) and not voz[j]:
                j += 1
            sil.append((i, j)); i = j
        else:
            i += 1
    internos = [s for s in sil if s[0] > 0 and s[1] < len(voz)]
    cortes = sorted(sorted(internos, key=lambda s: s[1] - s[0], reverse=True)[:n - 1])
    bordes = [0] + [(a + b) // 2 for a, b in cortes] + [len(x)]
    clips = []
    for a, b in zip(bordes[:-1], bordes[1:]):
        seg = x[a:b]; e = voz[a:b]
        idx = np.nonzero(e)[0]
        s0, s1 = max(0, idx[0] - int(0.04 * SR)), min(len(seg), idx[-1] + int(0.12 * SR))
        c = seg[s0:s1].copy()
        f = int(0.01 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
        clips.append(c)
    return clips


clips = {}
for q in G['voces']:
    ids = [l['id'] for l in LINEAS if l['quien'] == q]
    for i, c in zip(ids, partir(leer(f'audio/voz_{q}.mp3'), len(ids))):
        clips[i] = c

# ---------- línea de tiempo ----------
EXTRA = {0: 1.6, 1: 1.4, 3: 1.8, 6: 1.4, 7: 0.3, 8: 0.3, 9: 0.5, 10: 1.4, 11: 0.7, 12: 0.3, 13: 0.3, 14: 1.7, 15: 0.4,
         18: 1.4, 20: 0.4, 21: 2.4, 22: 1.0, 23: 0.4, 24: 1.6, 26: 0.5, 28: 1.6}
t, tl = 0.0, []
for l in LINEAS:
    t += EXTRA.get(l['id'], 0.32)
    d = len(clips[l['id']]) / SR
    tl.append({**l, 'a': round(t, 3), 'b': round(t + d, 3)})
    t += d
DUR = round(t + 4.0, 2)
orden = []
for l in tl:
    if not orden or orden[-1]['k'] != l['escena']:
        orden.append({'k': l['escena'], 'a': l['a'] - EXTRA.get(l['id'], 0.32) + 0.05})
orden[0]['a'] = 0.0
for i, s_ in enumerate(orden):
    s_['b'] = orden[i + 1]['a'] if i + 1 < len(orden) else DUR
L = {l['id']: l for l in tl}
SCN = {s_['k']: s_ for s_ in orden}
EV = {'grillos': L[20]['b'] + 0.2, 'ding': L[22]['a'] - 0.6, 'confeti': L[23]['a'], 'enviado': L[20]['b'] + 0.05,
      'rayon': SCN['fiesta']['a'] + 0.2, 'mariposas': L[11]['a'] - 0.3, 'tarjeta': L[28]['b'] + 0.2}

n = int(DUR * SR)
voz = np.zeros(n, np.float32); por = {q: np.zeros(n, np.float32) for q in G['voces']}
for l in tl:
    c = clips[l['id']]; i = int(l['a'] * SR)
    voz[i:i + len(c)] += c; por[l['quien']][i:i + len(c)] += c

def env(d, at=0.005, dec=8.0):
    tt = np.arange(int(d * SR)) / SR
    return np.minimum(1, tt / at) * np.exp(-tt * dec)

def ruido_banda(m, lo, hi):
    X = np.fft.rfft(rng.normal(0, 1, m)); f = np.fft.rfftfreq(m, 1 / SR)
    H = (1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / np.sqrt(1 + (f / hi) ** 4))
    y = np.fft.irfft(X * H, m); return y / (np.abs(y).max() + 1e-9)

sfx = np.zeros(n, np.float32)
def poner(sig, t0, g):
    i = int(t0 * SR)
    if i < 0: sig, i = sig[-i:], 0
    if i >= n: return
    j = min(n, i + len(sig)); sfx[i:j] += (sig[:j - i] * g).astype(np.float32)
def tono(f, d, dec=6):
    tt = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * tt) * env(d, 0.003, dec)
def whoosh(d=0.6):
    m = int(d * SR); tt = np.arange(m) / SR; return ruido_banda(m, 300, 4000) * np.sin(np.pi * tt / d) ** 2
def latido():
    a = tono(55, 0.18, 20) + 0.6 * tono(80, 0.18, 30); b = np.zeros(int(0.45 * SR)); b[:len(a)] += a; j = int(0.2 * SR); b[j:j + len(a)] += 0.7 * a; return b
def boing():
    tt = np.arange(int(0.5 * SR)) / SR; f = 200 + 300 * np.exp(-tt * 6) * (1 + 0.3 * np.sin(2 * np.pi * 18 * tt)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.5, 0.003, 5)
def sirena(d):
    tt = np.arange(int(d * SR)) / SR; f = 650 + 250 * np.sin(2 * np.pi * 1.2 * tt); return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25 * np.minimum(1, tt / 0.1) * np.clip((d - tt) / 0.2, 0, 1)
def rayon():
    m = int(0.45 * SR); tt = np.arange(m) / SR; f = 1200 * np.exp(-tt * 5) + 200; return ruido_banda(m, 300, 3000) * 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.45, 0.002, 4)
def tecla():
    return ruido_banda(int(0.03 * SR), 2000, 8000) * env(0.03, 0.001, 120)
def ding():
    return tono(1318, 1.0, 4) + 0.5 * tono(1976, 1.0, 5)
def grillo(d):
    m = int(d * SR); tt = np.arange(m) / SR; g = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 30 * tt) > 0) * (np.sin(2 * np.pi * 1.6 * tt) > 0.2); return g * 0.25
def aleteo(d):
    m = int(d * SR); tt = np.arange(m) / SR; return ruido_banda(m, 400, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * tt)) ** 4 * 0.5
def brillo():
    out = np.zeros(int(1.2 * SR))
    for k, f in enumerate([1568, 1976, 2349, 3136]):
        s_ = tono(f, 0.6, 7); j = int(k * 0.09 * SR); out[j:j + len(s_)] += s_[:len(out) - j]
    return out * 0.5
def confeti():
    out = np.zeros(int(1.5 * SR)); p = tono(180, 0.15, 25) + ruido_banda(int(0.15 * SR), 1000, 6000) * env(0.15, 0.001, 30); out[:len(p)] += p
    for _ in range(25):
        c = tono(rng.uniform(2000, 4000), 0.05, 60) * 0.3; j = rng.integers(0, len(out) - len(c)); out[j:j + len(c)] += c
    return out

poner(brillo(), 0.3, 0.5)
for s_ in orden[1:]: poner(whoosh(), s_['a'] - 0.25, 0.35)
poner(sirena(L[5]['b'] - L[3]['a'] + 0.6), L[3]['a'] - 0.4, 0.35)
poner(boing(), L[3]['a'] - 0.3, 0.5); poner(boing(), L[7]['a'] - 0.3, 0.5); poner(boing(), L[12]['a'] - 0.3, 0.5)
# latidos: lentos y luego cada vez más rápidos
tb = SCN['gym']['a'] + 0.3
while tb < SCN['gym']['b']:
    rate = 60 if tb < L[7]['b'] else min(170, 60 + (tb - L[7]['b']) * 40)
    poner(latido(), tb, 0.7); tb += 60 / rate
poner(aleteo(L[13]['b'] - EV['mariposas']), EV['mariposas'], 0.5)
poner(rayon(), EV['rayon'], 0.7)
for k in range(int((L[18]['b'] - L[18]['a']) / 0.11)): poner(tecla(), L[18]['a'] + 0.4 + k * 0.11, 0.35)
poner(whoosh(0.4), EV['enviado'], 0.5); poner(grillo(2.0), EV['grillos'], 0.6)
poner(ding(), EV['ding'], 0.4); poner(confeti(), EV['confeti'] - 0.1, 0.6)
poner(brillo(), L[24]['a'] - 0.8, 0.5); poner(brillo(), EV['tarjeta'], 0.5)
for k in range(4): poner(latido(), L[26]['a'] + 0.2 + k * 0.86, 0.4)

# ---------- música ----------
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def fq(nm): return 440 * 2 ** ((12 * (int(nm[-1]) + 1) + NOTE[nm[0]] + (1 if '#' in nm else 0) - 69) / 12)
def pluck(f, d=0.5):
    tt = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) + 0.15 * np.sin(2 * np.pi * 3 * f * tt)) * env(d, 0.002, 7)
mus = np.zeros(n, np.float32)
def add(sig, at, g):
    i = int(at * SR)
    if i >= n or i < 0: return
    j = min(n, i + len(sig)); mus[i:j] += (sig[:j - i] * g).astype(np.float32)
fa, fb = SCN['fiesta']['a'], SCN['fiesta']['b']
prog = [('F', ['F4', 'A4', 'C5']), ('D', ['D4', 'F4', 'A4']), ('A', ['A3', 'C4', 'F4']), ('C', ['C4', 'E4', 'G4'])]
mel = ['A5', 'C6', 'A5', 'G5', 'F5', 'G5', 'A5', 'F5', 'D5', 'F5', 'A5', 'G5', 'E5', 'G5', 'C6', 'A5']
bt, k = 60 / 100, 0; tcur = 0.0
while tcur < DUR:
    in_party = fa <= tcur < fb
    root, ch = prog[(k // 4) % 4]
    if in_party:  # ritmo de discoteca
        b2 = 60 / 124
        add(tono(55, 0.25, 14) * 1.4, tcur, 0.9)
        add(ruido_banda(int(0.06 * SR), 6000, 12000) * env(0.06, 0.001, 50), tcur + b2 / 2, 0.25)
        for nt in ch: add(pluck(fq(nt), 0.25), tcur + b2 / 2, 0.12)
        add(pluck(fq(root + '2'), 0.3), tcur, 0.4)
        tcur += b2; k += 1; continue
    add(pluck(fq(root + '3')), tcur, 0.35)
    for j, nt in enumerate(ch): add(pluck(fq(nt), 0.35), tcur + bt * (0.5 + 0.17 * j), 0.1)
    add(pluck(fq(mel[k % 16]), 0.4), tcur, 0.16)
    if k % 2: add(pluck(fq(mel[(k + 3) % 16]), 0.3), tcur + bt * 0.5, 0.1)
    tcur += bt; k += 1
tt = np.arange(n) / SR
gm = np.ones(n)
gm[(tt > EV['grillos'] - 0.1) & (tt < EV['grillos'] + 2.0)] = 0.0   # silencio incómodo
cs = SCN['calma']; gm[(tt > cs['a']) & (tt < cs['b'])] = 0.6
gm = np.convolve(gm, np.ones(int(0.15 * SR)) / int(0.15 * SR), mode='same')
mus *= gm.astype(np.float32); mus *= np.minimum(1, tt / 0.8) * np.clip((DUR - tt) / 1.5, 0, 1)

e = np.convolve(np.abs(voz), np.ones(int(0.2 * SR)) / int(0.2 * SR), mode='same')
duck = np.convolve(np.where(e > 0.004, 0.45, 1.0), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same')
mus_n = mus / (np.abs(mus).max() + 1e-9)
mezcla = voz * 1.0 + sfx * 0.9 + mus_n * 0.22 * duck
mezcla = np.stack([mezcla, mezcla], 1); mezcla /= np.abs(mezcla).max() + 1e-9; mezcla *= 0.9
with wave.open('audio/mezcla_pre.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mezcla * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/mezcla_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'audio/mezcla.wav'], check=True)

# bocas por cuadro
spf = SR // FPS; nf = int(DUR * FPS); boca = {}
for q, p in por.items():
    v = []
    for f in range(nf):
        s = p[f * spf:(f + 1) * spf]; r = float(np.sqrt(np.mean(s ** 2))) if len(s) else 0
        v.append(round(float(np.clip((20 * np.log10(r + 1e-6) + 42) / 22, 0, 1)), 2))
    boca[q] = v
with open('timeline.js', 'w', encoding='utf-8') as fh:
    fh.write('window.TL = ' + json.dumps({'dur': DUR, 'fps': FPS, 'lineas': tl, 'escenas': orden, 'ev': EV, 'boca': boca},
                                         ensure_ascii=False) + ';\n')
print('DUR', DUR)
for s in orden: print(f"{s['k']:9s} {s['a']:6.2f} - {s['b']:6.2f}")
