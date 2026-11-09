"""Arma el audio del video "Tus órganos cuando bebes alcohol":
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
EXTRA = {  # pausa antes de la frase (s)
    0: 0.9, 2: 1.6, 6: 1.5, 10: 0.7, 12: 1.5, 15: 1.3, 16: 1.6, 19: 1.9, 21: 1.5, 22: 0.9, 23: 1.6, 24: 1.0, 28: 1.6,
}
t, tl = 0.0, []
for l in LINEAS:
    t += EXTRA.get(l['id'], 0.32)
    d = len(clips[l['id']]) / SR
    tl.append({**l, 'a': round(t, 3), 'b': round(t + d, 3)})
    t += d
DUR = round(t + 3.2, 2)  # cierre con tarjeta final

# escenas: desde un poco antes de su primera frase hasta la siguiente escena
orden = []
for l in tl:
    if not orden or orden[-1]['k'] != l['escena']:
        orden.append({'k': l['escena'], 'a': l['a'] - EXTRA.get(l['id'], 0.32) + 0.05})
orden[0]['a'] = 0.0
for i, s in enumerate(orden):
    s['b'] = orden[i + 1]['a'] if i + 1 < len(orden) else DUR
L = {l['id']: l for l in tl}
EV = {  # eventos para animación y efectos
    'tobogan': L[2]['a'] - 1.2, 'palanca': L[10]['a'] - 0.45, 'maquina1': L[19]['a'] - 1.6,
    'maquina2': L[21]['a'] - 1.3, 'ding': L[22]['a'] - 0.6, 'tarjeta': L[29]['b'] + 0.3,
}

# ---------- pistas ----------
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
    j = min(n, i + len(sig)); sfx[i:j] += (sig[:j - i] * g).astype(np.float32)


def whoosh(d=0.6):
    m = int(d * SR); tt = np.arange(m) / SR
    return ruido_banda(m, 300, 4000) * np.sin(np.pi * tt / d) ** 2


def pop(f=600):
    tt = np.arange(int(0.12 * SR)) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-tt * 40)) * tt) * env(0.12, 0.002, 30)


def slide(d=1.1):
    tt = np.arange(int(d * SR)) / SR
    fr = 900 - 600 * tt / d
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * tt / d) * 0.6


def clunk():
    tt = np.arange(int(0.35 * SR)) / SR
    return (np.sin(2 * np.pi * 110 * tt) * env(0.35, 0.002, 14) + 0.5 * ruido_banda(len(tt), 200, 2500) * env(0.35, 0.001, 40))


def maquina(d):
    m = int(d * SR); tt = np.arange(m) / SR
    zumbido = 0.5 * np.sign(np.sin(2 * np.pi * 55 * tt)) * 0.3 + 0.4 * ruido_banda(m, 100, 1500) * (0.6 + 0.4 * np.sin(2 * np.pi * 8 * tt))
    golpes = np.zeros(m)
    for k in np.arange(0, d - 0.2, 0.32):
        g = clunk(); j = int(k * SR); golpes[j:j + len(g)] += g[:m - j]
    vapor = ruido_banda(m, 2000, 8000) * np.clip((tt - d + 0.5) / 0.5, 0, 1)
    return (zumbido * np.minimum(1, tt / 0.1) * np.clip((d - tt) / 0.1, 0, 1) + 0.7 * golpes + 0.5 * vapor) * 0.6


def ding():
    tt = np.arange(int(1.2 * SR)) / SR
    return (np.sin(2 * np.pi * 1318 * tt) + 0.5 * np.sin(2 * np.pi * 1976 * tt)) * env(1.2, 0.002, 4)


def mareo(d=1.6):
    tt = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (500 + 120 * np.sin(2 * np.pi * 3 * tt)) * tt) * np.sin(np.pi * tt / d) * 0.35


def burbujas(d=1.5):
    m = int(d * SR); out = np.zeros(m)
    for _ in range(int(d * 14)):
        p = pop(rng.uniform(400, 1200)) * rng.uniform(0.2, 0.6); j = rng.integers(0, m - len(p))
        out[j:j + len(p)] += p
    return out


def descarga():  # agua del baño (cómica)
    m = int(1.8 * SR); tt = np.arange(m) / SR
    return ruido_banda(m, 200, 3000) * np.sin(np.pi * tt / 1.8) ** 0.5 * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * tt)) * 0.7


def pajaros():
    m = int(1.6 * SR); out = np.zeros(m)
    for k in range(5):
        tt = np.arange(int(0.12 * SR)) / SR
        ch = np.sin(2 * np.pi * (3000 + 1500 * np.sin(2 * np.pi * 18 * tt)) * tt) * env(0.12, 0.005, 20)
        j = int((0.1 + k * 0.28 + rng.uniform(0, 0.08)) * SR); out[j:j + len(ch)] += ch
    return out * 0.4


for s in orden[1:]:
    poner(whoosh(), s['a'] - 0.25, 0.35)
poner(burbujas(1.4), 0.2, 0.25)
poner(slide(), EV['tobogan'], 0.35); poner(pop(500), EV['tobogan'] + 1.15, 0.5)
poner(clunk(), EV['palanca'], 0.6); poner(mareo(), L[11]['a'] - 0.2, 0.4)
poner(descarga(), L[15]['a'] - 0.6, 0.35)
poner(maquina(1.5), EV['maquina1'], 0.5); poner(maquina(1.2), EV['maquina2'], 0.5); poner(ding(), EV['ding'], 0.35)
poner(pajaros(), L[23]['a'] - 1.4, 0.5)
poner(pop(700), EV['tarjeta'], 0.5); poner(ding(), EV['tarjeta'] + 0.15, 0.25)

# ---------- música de fondo (divertida, tipo marimba + bajo pizzicato) ----------
BPM = 112; beat = 60 / BPM
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def fq(nm):
    return 440 * 2 ** ((12 * (int(nm[-1]) + 1) + NOTE[nm[0]] + (1 if '#' in nm else 0) - 69) / 12)


def marimba(f, d=0.5):
    tt = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt * 25)) * env(d, 0.003, 9)


def pizz(f, d=0.35):
    tt = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * env(d, 0.004, 12)


mus = np.zeros(n, np.float32)
prog = [('C', ['C4', 'E4', 'G4']), ('A', ['A3', 'C4', 'E4']), ('F', ['F3', 'A3', 'C4']), ('G', ['G3', 'B3', 'D4'])]
mel = ['E5', 'G5', 'C5', 'D5', 'E5', 'C5', 'A4', 'G4', 'A4', 'C5', 'F5', 'E5', 'D5', 'B4', 'G4', 'D5']
k = 0; t0 = 0.0
while t0 < DUR:
    root, ch = prog[(k // 4) % 4]
    b = k % 4
    def add(sig, at, g):
        i = int(at * SR)
        if i >= n: return
        j = min(n, i + len(sig)); mus[i:j] += (sig[:j - i] * g).astype(np.float32)
    add(pizz(fq(root + '2')), t0, 0.5)
    if b in (1, 3): add(pizz(fq(root + '3')), t0 + beat * 0.5, 0.25)
    for jj, nt in enumerate(ch):
        add(marimba(fq(nt), 0.4), t0 + beat * (0.5 if jj == 0 else 0.25 * jj + 0.5), 0.12)
    add(marimba(fq(mel[k % 16]), 0.45), t0, 0.16)
    if k % 2: add(marimba(fq(mel[(k + 5) % 16]), 0.35), t0 + beat * 0.5, 0.1)
    # golpecito de percusión suave
    add(ruido_banda(int(0.05 * SR), 3000, 9000) * env(0.05, 0.001, 70), t0 + beat * 0.5, 0.08)
    k += 1; t0 += beat
# la mañana siguiente: música más lenta y baja
ms = orden[[s['k'] for s in orden].index('manana')]
tt = np.arange(n) / SR
gm = np.where((tt > ms['a']) & (tt < ms['b']), 0.45, 1.0)
gm = np.convolve(gm, np.ones(int(0.4 * SR)) / int(0.4 * SR), mode='same')
mus *= gm.astype(np.float32)
mus *= np.minimum(1, tt / 1.0) * np.clip((DUR - tt) / 1.5, 0, 1)

# ducking bajo la voz
e = np.convolve(np.abs(voz), np.ones(int(0.2 * SR)) / int(0.2 * SR), mode='same')
duck = np.convolve(np.where(e > 0.004, 0.45, 1.0), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same')
mus_n = mus / (np.abs(mus).max() + 1e-9)
mezcla = voz * 1.0 + sfx * 0.9 + mus_n * 0.22 * duck
mezcla = np.stack([mezcla, mezcla], 1)
mezcla /= np.abs(mezcla).max() + 1e-9; mezcla *= 0.9
with wave.open('audio/mezcla_pre.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mezcla * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/mezcla_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
                '-ar', str(SR), 'audio/mezcla.wav'], check=True)

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
