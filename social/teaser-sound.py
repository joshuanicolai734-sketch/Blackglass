"""Sound design for the Blackglass teaser, synthesised from scratch (no samples, nothing to license).

    python3 teaser-sound.py        # writes .build/teaser-sound.wav (48 kHz stereo, 24 s)

Hit times match BEATS in teaser.mjs. Needs numpy.
"""
import wave
from pathlib import Path
import numpy as np

SR, DUR = 48_000, 24.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)
send = np.zeros(N)  # reverb send (mono)

BEATS = dict(line=0.3, rim=1.3, glint=3.15, dive=5.2, land=6.2, words=[7.0, 8.4, 9.8, 11.2],
             head=12.6, collapse=16.6, impact=18.6, lock=19.2, end=20.2)


def env(start, attack, hold, release, curve=2.0):
    """Attack/hold/exponential-ish release envelope over the whole timeline."""
    e = np.zeros(N)
    a0, a1 = start, start + attack
    h1, r1 = a1 + hold, a1 + hold + release
    idx = (t >= a0) & (t < a1)
    e[idx] = ((t[idx] - a0) / max(attack, 1e-6)) ** curve
    e[(t >= a1) & (t < h1)] = 1
    idx = (t >= h1) & (t < r1)
    e[idx] = (1 - (t[idx] - h1) / max(release, 1e-6)) ** curve
    return e


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be an array (Hz) for sweeps."""
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # simple and fine for 24 s
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def add(sig, pan=0.0, rev=0.0):
    global L, R, send
    L += sig * np.sqrt(0.5 * (1 - pan))
    R += sig * np.sqrt(0.5 * (1 + pan))
    send += sig * rev


def bell(at, freqs, amp, decay=1.4, pan=0.0, rev=0.5):
    x = np.zeros(N)
    m = t >= at
    tt = t[m] - at
    for i, f in enumerate(freqs):
        x[m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * (decay + i * 0.8)) / (1 + i * 0.6)
    x[m] *= np.minimum(1, tt / 0.004)
    add(x * amp, pan, rev)


def boom(at, amp, f0=58, f1=34, decay=1.1):
    m = t >= at
    tt = t[m] - at
    f = f1 + (f0 - f1) * np.exp(-tt * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.zeros(N)
    x[m] = np.sin(ph) * np.exp(-tt * decay) * np.minimum(1, tt / 0.006)
    add(x * amp, 0, 0.15)


noise = rng.standard_normal(N)

# Drone pad: A1, E2, A2 with a quiet fifth, breathing slowly. Swells under the promise, ducks into the collapse.
pad = sum(np.sin(2 * np.pi * f * t + p) * a for f, a, p in [(55, .5, 0), (82.41, .32, 1), (110, .22, 2), (164.8, .08, 3), (329.6, .03, 4)])
pad *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t)
pad_env = env(0.2, 3.0, 20, 0.8) * (1 + 0.6 * env(12.6, 1.5, 2.0, 1.8)) * (1 - 0.85 * env(16.6, 1.9, 0.05, 0.4, 1.0))
pad_env *= np.where(t > 18.6, 1.0, 1.0) * (1 - env(22.6, 1.4, 5, 0.1, 1.0))
add(lowpass(pad, 900) * pad_env * 0.16, 0, 0.2)

# 1. The line of light: rising filtered air plus a thin tonal riser.
air = lowpass(noise, 300 + 5000 * np.clip((t - 0.3) / 1.2, 0, 1)) * env(0.3, 1.1, 0.1, 0.6)
add(air * 0.09, -0.3, 0.3)
f = 220 + 660 * np.clip((t - 0.3) / 1.3, 0, 1) ** 2
add(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.3, 1.2, 0, 0.5) * 0.025, 0.3, 0.4)

# 2. The rim draws: a glassy shimmer.
shimmer = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1318.5, .5), (1975.5, .35), (2637, .2)])
add(shimmer * env(1.3, 0.9, 0.2, 1.2) * 0.02, 0.2, 0.8)

# 3. The glint: a bell, bright and short.
bell(BEATS["glint"], [1760, 2637, 3520, 5274], 0.2, decay=1.6, pan=-0.2, rev=0.7)

# Slab turning: a slow low swell.
add(lowpass(noise, 180) * env(3.2, 1.6, 0.2, 0.6) * 0.12, 0, 0.1)

# 4. The dive: a whoosh into a sub impact.
whoosh = lowpass(noise, 200 + 7000 * np.clip((t - 5.0) / 1.2, 0, 1) ** 2) - lowpass(noise, 120)
add(whoosh * env(5.0, 1.15, 0.0, 0.25, 3.0) * 0.28, 0, 0.3)
boom(BEATS["land"], 0.55)
add(lowpass(noise, 900) * env(6.2, 0.005, 0.02, 0.5, 3.0) * 0.18, 0, 0.4)

# 5. The words: a tuned hit and a tick for each, alternating sides.
for i, w in enumerate(BEATS["words"]):
    boom(w, 0.38, f0=110, f1=55, decay=5.0)
    bell(w, [3000, 4500], 0.05, decay=30, pan=(-0.35 if i % 2 == 0 else 0.35), rev=0.3)
    add(lowpass(noise, 2500) * env(w, 0.002, 0.01, 0.08, 3.0) * 0.12, (-0.35 if i % 2 == 0 else 0.35), 0.2)

# 6. The promise: a soft riser under the headline.
add(lowpass(noise, 1200) * env(12.4, 1.0, 0.2, 1.5) * 0.05, 0, 0.6)

# 7. The collapse: a reverse whoosh sucked into the final impact, a chord, and the wordmark's swish.
suck = lowpass(noise, 300 + 6000 * np.clip((t - 16.6) / 2.0, 0, 1) ** 3)
add(suck * env(16.6, 2.0, 0.0, 0.03, 4.0) * 0.3, 0, 0.3)
boom(BEATS["impact"], 0.7, f0=62, f1=32, decay=0.8)
bell(BEATS["impact"], [880, 1318.5, 1760, 2217.5], 0.16, decay=0.55, rev=0.9)
add(lowpass(noise, 3000 + 3000 * np.clip((t - 19.2) / 0.5, 0, 1)) * env(19.2, 0.25, 0.05, 0.3) * 0.05, 0.4, 0.3)
bell(BEATS["end"], [440, 659.3, 880], 0.07, decay=0.45, rev=1.0)

# Reverb: convolve the send with a decaying noise impulse (2.4 s), decorrelated per side.
ir_len = int(SR * 2.4)
decay = np.exp(-np.arange(ir_len) / SR * 2.6)
for side, seed in ((0, 11), (1, 12)):
    ir = np.random.default_rng(seed).standard_normal(ir_len) * decay
    ir = lowpass(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    size = 1 << int(np.ceil(np.log2(N + ir_len)))
    wet = np.fft.irfft(np.fft.rfft(send, size) * np.fft.rfft(ir, size), size)[:N]
    if side == 0:
        L += wet * 0.35
    else:
        R += wet * 0.35

# Master: gentle fade in/out, soft clip, peak at -1 dBFS.
master = np.stack([L, R], axis=1)
fade = np.clip(t / 0.05, 0, 1) * np.clip((DUR - t) / 0.4, 0, 1)
master *= fade[:, None]
master = np.tanh(master * 1.2) / np.tanh(1.2)
master *= 10 ** (-1 / 20) / np.abs(master).max()

out = Path(__file__).parent / ".build" / "teaser-sound.wav"
out.parent.mkdir(exist_ok=True)
with wave.open(str(out), "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((master * 32767).astype("<i2").tobytes())
rms = 20 * np.log10(np.sqrt((master ** 2).mean()))
print(f"wrote {out} ({DUR:.0f} s, RMS {rms:.1f} dBFS)")
