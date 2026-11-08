"""Coloca cada frase de la voz en su escena, mezcla con la música y exporta:
- audio/mezcla.wav       (audio final del video)
- timeline.js            (subtítulos + envolvente de voz por cuadro para mover la boca)
"""
import json, subprocess, wave
import numpy as np

SR = 44100
FPS = 24
DUR = 21.5
VOZ = 'audio/voz_toma1.mp3'

# (inicio_en_toma, fin_en_toma, inicio_en_video)  -- medidos con silencedetect
FRASES = [
    (0.00, 1.75, 0.40),    # Oye... ¿me escuchas?
    (2.47, 4.66, 4.00),    # Sé que esa noche parecía no terminar.
    (5.24, 8.01, 7.20),    # Caminabas sin mapa... con lo poco que tenías.
    (8.53, 10.59, 12.40),  # Y aun así... no te soltaste.
    (11.15, 12.54, 16.00), # Mira hasta dónde llegaste.
    (13.08, 14.40, 18.90), # Gracias por quedarte.
]

SUBS = [  # (texto, inicio, fin)
    ("Oye…", 0.40, 1.42),
    ("¿me escuchas?", 1.42, 2.58),
    ("Sé que esa noche\nparecía no terminar.", 3.98, 6.95),
    ("Caminabas sin mapa…", 7.18, 8.62),
    ("con lo poco\nque tenías.", 8.62, 9.98),
    ("Y aun así…", 12.38, 13.42),
    ("no te soltaste.", 13.42, 15.10),
    ("Mira hasta dónde\nllegaste.", 15.98, 18.38),
    ("Gracias por quedarte.", 18.88, 21.2),
]


def leer(path, ch):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', str(ch), '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768
    return a.reshape(-1, ch)


voz = leer(VOZ, 1)[:, 0]
mus = leer('musica.wav', 2)
n = int(SR * DUR)
mus = np.pad(mus, ((0, max(0, n - len(mus))), (0, 0)))[:n]

pista = np.zeros(n, dtype=np.float32)
for a, b, s in FRASES:
    i0, i1 = int(max(0, a - 0.06) * SR), int(min(len(voz) / SR, b + 0.18) * SR)
    seg = voz[i0:i1].copy()
    f = int(0.012 * SR)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-f * 4:] *= np.linspace(1, 0, f * 4)
    j0 = int((s - (a - max(0, a - 0.06))) * SR)
    pista[j0:j0 + len(seg)] += seg[: n - j0]

# Un toque de sala muy suave para integrar la voz con la música
rng = np.random.default_rng(3)
t = np.arange(int(SR * 0.9)) / SR
ir = rng.normal(0, 1, len(t)) * np.exp(-t * 7)
ir = np.convolve(ir, np.ones(8) / 8, mode='same')
ir /= np.sqrt(np.sum(ir ** 2))
m = len(pista) + len(ir) - 1
nf = 1 << (m - 1).bit_length()
wet = np.fft.irfft(np.fft.rfft(pista, nf) * np.fft.rfft(ir, nf), nf)[:n]
voz_final = pista + 0.10 * wet

# ---------- Sonidos de ambiente (generados con código) ----------
SCENES = [('A', 0, 2.6), ('B', 2.6, 7.0), ('A', 7.0, 10.0), ('C', 10.0, 12.0), ('B', 12.0, 15.6), ('A', 15.6, 18.4), ('C', 18.4, 21.5)]
TRAINS = [(2.6, 1.4), (14.3, 1.3)]
rg = np.random.default_rng(11)


def gate(kind):
    g = np.zeros(n)
    for k, a, b in SCENES:
        if k == kind:
            g[int(a * SR):int(b * SR)] = 1
    k = int(0.05 * SR)
    return np.convolve(g, np.ones(k) / k, mode='same')


def band(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    Hf = np.ones_like(fr)
    if lo: Hf *= 1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** 4)
    if hi: Hf *= 1 / np.sqrt(1 + (fr / hi) ** 4)
    return np.fft.irfft(X * Hf, len(x))


def unit(x):
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-9)


tt = np.arange(n) / SR
# lluvia: ruido suave + gotitas
lluvia = unit(band(rg.normal(0, 1, n), 400, 6500)) * 0.022
gotas = np.zeros(n); idx = rg.integers(0, n, int(DUR * 80)); gotas[idx] = rg.uniform(0.2, 1, len(idx)) * rg.choice([-1, 1], len(idx))
kl = int(0.004 * SR); ker = np.exp(-np.arange(kl) / (0.0012 * SR)) * np.sin(np.arange(kl) * 2 * np.pi * 2600 / SR)
gotas = np.convolve(gotas, ker, mode='same') * 0.05
gB = gate('B')
ambL = (lluvia + gotas) * gB
ambR = (np.roll(lluvia, 997) + np.roll(gotas, 431)) * gB
# tren: retumbo + soplido + traqueteo de ruedas, paneado de derecha a izquierda
for a, d in TRAINS:
    i0, Lt = int(a * SR), int((d + 0.3) * SR); ts = np.arange(Lt) / SR
    env = np.minimum(1, ts / 0.2) * np.clip((d + 0.3 - ts) / 0.5, 0, 1)
    rum = unit(band(rg.normal(0, 1, Lt), 0, 150)); wh = unit(band(rg.normal(0, 1, Lt), 500, 3500))
    clk = np.zeros(Lt); seg = np.arange(1800) / SR
    for c in np.arange(0.08, d, 0.34):
        for off in (0.0, 0.1):
            j = int((c + off) * SR)
            if j + 1800 < Lt:
                clk[j:j + 1800] += np.exp(-seg * 55) * np.sin(2 * np.pi * 78 * seg) + 0.35 * np.exp(-seg * 280) * rg.normal(0, 1, 1800)
    sig = (0.55 * rum + 0.35 * wh + 0.9 * clk) * env * 0.11
    pan = np.linspace(0.8, -0.8, Lt); j1 = min(n, i0 + Lt)
    ambL[i0:j1] += (sig * np.sqrt(0.5 * (1 - pan)))[:j1 - i0] * gB[i0:j1]
    ambR[i0:j1] += (sig * np.sqrt(0.5 * (1 + pan)))[:j1 - i0] * gB[i0:j1]
# olas del mar
swell = 0.35 + 0.65 * np.maximum(0, np.sin(2 * np.pi * tt / 4.6)) ** 2
espuma = np.maximum(0, np.sin(2 * np.pi * tt / 4.6 - 0.6)) ** 4
olas = (unit(band(rg.normal(0, 1, n), 60, 900)) * swell * 0.024 + unit(band(rg.normal(0, 1, n), 2000, 7000)) * espuma * 0.007) * gate('C')
ambL += olas; ambR += np.roll(olas, 1500)
# balcón: noche tranquila, muy tenue
noche = unit(band(rg.normal(0, 1, n), 80, 600)) * 0.004 * gate('A')
ambL += noche; ambR += np.roll(noche, 700)
amb = np.stack([ambL, ambR], axis=1)

# Ducking: la música baja cuando habla la voz (con suavizado)
env = np.abs(pista)
k = int(0.25 * SR)
env = np.convolve(env, np.ones(k) / k, mode='same')
duck = np.where(env > 0.004, 0.62, 1.0)
duck = np.convolve(duck, np.ones(k) / k, mode='same')
mezcla = (mus * 0.42 + amb) * duck[:, None] + voz_final[:, None] * 1.0
mezcla /= np.max(np.abs(mezcla)) + 1e-9
mezcla *= 0.92

with wave.open('audio/mezcla_pre.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mezcla * 32767).astype('<i2').tobytes())
# Normalizar volumen a nivel de redes sociales (~ -14 LUFS)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/mezcla_pre.wav', '-af',
                'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', str(SR), 'audio/mezcla.wav'], check=True)

# Envolvente de voz por cuadro (0..1) para la boca de Nube
spf = SR // FPS
frames = int(DUR * FPS)
boca = []
for f in range(frames):
    seg = pista[f * spf:(f + 1) * spf]
    r = float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0
    db = 20 * np.log10(r + 1e-6)
    boca.append(round(float(np.clip((db + 42) / 22, 0, 1)), 3))

with open('timeline.js', 'w', encoding='utf-8') as fh:
    fh.write('window.TL = ' + json.dumps({
        'dur': DUR, 'fps': FPS,
        'subs': [{'txt': s, 'a': a, 'b': b} for s, a, b in SUBS],
        'boca': boca,
    }, ensure_ascii=False) + ';\n')
print('mezcla.wav + timeline.js listos;', frames, 'cuadros')
