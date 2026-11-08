"""Música original de fondo: piano suave + colchón (pad) en La menor, con reverb.
Genera musica.wav (44.1 kHz, estéreo). Uso: python3 musica.py [duracion_segundos]
"""
import sys
import numpy as np

SR = 44100
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 21.5
rng = np.random.default_rng(7)
N = int(SR * (DUR + 3.0))  # cola extra para la reverb
L = np.zeros(N)
R = np.zeros(N)

NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


def freq(name):
    n, o = name[:-1], int(name[-1])
    midi = 12 * (o + 1) + NOTE[n]
    return 440.0 * 2 ** ((midi - 69) / 12)


def piano(f, dur, vel):
    """Piano de fieltro: armónicos con leve inarmonicidad y caída exponencial."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.00012
    for k in range(1, 9):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 7000:
            break
        amp = (1.0 / k ** 1.6) * (0.55 if k == 2 else 1.0)
        dec = (1.1 + 0.55 * k) * (f / 260) ** 0.35
        out += amp * np.exp(-t * dec) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28))
    # segundo componente de cuerda ligeramente desafinado (calidez)
    out += 0.25 * np.exp(-t * 0.9) * np.sin(2 * np.pi * f * 1.0018 * t)
    att = np.minimum(1, t / 0.006)
    rel = np.minimum(1, (dur - t) / 0.25).clip(0, 1)
    # golpe de martillo suave (ruido filtrado muy corto)
    ham = rng.normal(0, 1, n) * np.exp(-t * 90) * 0.03
    ham = np.convolve(ham, np.ones(18) / 18, mode='same')
    return (out * att * rel + ham) * vel


def pad(freqs, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.6, 0.0, 0.7):
            ff = f * 2 ** (det / 1200 * 8)
            out += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28))
            out += 0.18 * np.sin(2 * np.pi * 2 * ff * t)
    env = np.minimum(1, t / 1.4) * np.minimum(1, (dur - t) / 1.2).clip(0, 1)
    # trémolo muy lento
    env *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * t)
    return out * env / (len(freqs) * 3)


def add(sig, start, pan=0.0):
    i = int(start * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(N, i + len(sig))
    s = sig[: j - i]
    L[i:j] += s * np.sqrt(0.5 * (1 - pan))
    R[i:j] += s * np.sqrt(0.5 * (1 + pan))


# Progresión melancólica (compases de 2.5 s)
bar = 2.5
prog = [
    ('A2', ['A3', 'C4', 'E4'], ['E5', 'C5']),
    ('F2', ['F3', 'A3', 'E4'], ['C5', 'A4']),
    ('C3', ['G3', 'C4', 'E4'], ['G4', 'E5']),
    ('G2', ['G3', 'B3', 'D4'], ['D5', 'B4']),
    ('A2', ['A3', 'C4', 'E4'], ['C5', 'E5']),
    ('F2', ['F3', 'A3', 'C4', 'E4'], ['A4', 'C5']),
    ('D2', ['F3', 'A3', 'C4'], ['D5', 'C5']),
    ('E2', ['E3', 'G#3', 'B3', 'D4'], ['B4', 'G#4']),
]

t0 = 0.15
for i, (bass, chord, mel) in enumerate(prog):
    s = t0 + i * bar
    if s > DUR - 1:
        break
    hum = lambda: rng.normal(0, 0.012)
    add(piano(freq(bass), 3.6, 0.42), s + hum(), -0.25)
    add(piano(freq(bass[:-1] + str(int(bass[-1]) + 1)), 3.2, 0.16), s + hum(), -0.2)
    # arpegio lento
    for j, nt in enumerate(chord + [chord[1]]):
        add(piano(freq(nt), 2.6, 0.22 + 0.05 * rng.random()), s + 0.42 * (j + 1) + hum(), 0.15 * (j - 1.5))
    # melodía escasa arriba
    add(piano(freq(mel[0]), 3.0, 0.20), s + 0.05 + hum(), 0.3)
    add(piano(freq(mel[1]), 2.6, 0.15), s + 1.7 + hum(), 0.3)
    add(pad([freq(n) for n in chord], bar + 1.3), s - 0.3, 0.0)

# Final: La menor suspendido, se deja sonar
s_end = t0 + len(prog) * bar
if s_end < DUR - 0.5:
    add(piano(freq('A2'), 4.0, 0.40), s_end, -0.25)
    for j, nt in enumerate(['E3', 'A3', 'C4', 'E4']):
        add(piano(freq(nt), 3.5, 0.2), s_end + 0.12 * j, 0.1 * j)
    add(piano(freq('A4'), 3.5, 0.17), s_end + 0.9, 0.3)
    add(pad([freq(n) for n in ['A3', 'C4', 'E4']], 3.5), s_end - 0.3)

# Reverb por convolución (sala cálida, estéreo)
def ir(seed):
    r = np.random.default_rng(seed)
    n = int(SR * 2.8)
    t = np.arange(n) / SR
    x = r.normal(0, 1, n) * np.exp(-t * 2.3)
    x = np.convolve(x, np.ones(6) / 6, mode='same')  # oscurecer
    x[: int(SR * 0.012)] = 0
    return x / np.sqrt(np.sum(x ** 2))


def conv(a, b):
    m = len(a) + len(b) - 1
    nfft = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, nfft) * np.fft.rfft(b, nfft), nfft)[:len(a)]


wetL, wetR = conv(L, ir(1)), conv(R, ir(2))
outL = 0.72 * L + 0.55 * wetL
outR = 0.72 * R + 0.55 * wetR

# Filtro paso bajo suave (sonido más íntimo) + leve siseo de cinta
def lowpass(x, fc):
    # paso bajo de 2º orden aplicado en frecuencia (FFT)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X * H, len(x))


outL, outR = lowpass(outL, 5200), lowpass(outR, 5200)
hiss = rng.normal(0, 1, N) * 0.0025
hiss = lowpass(hiss, 3000)
outL += hiss
outR += np.roll(hiss, 300)

n_out = int(SR * DUR)
st = np.stack([outL[:n_out], outR[:n_out]], axis=1)
t = np.arange(n_out) / SR
fade = np.minimum(1, t / 0.6) * np.minimum(1, (DUR - t) / 2.2).clip(0, 1)
st *= fade[:, None]
st /= np.max(np.abs(st)) + 1e-9
st *= 0.89

import wave
with wave.open('musica.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('musica.wav listo', DUR, 's')
