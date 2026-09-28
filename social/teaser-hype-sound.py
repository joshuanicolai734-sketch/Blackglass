"""Soundtrack for the Blackglass hype teaser: 150 BPM, A minor, synthesised from scratch (no samples, nothing to license).

    python3 teaser-hype-sound.py      # writes .build/teaser-hype-sound.wav (48 kHz stereo, 21.6 s)

The timeline matches teaser-hype.client.js (a beat is 0.4 s). Needs numpy only.
  0.0  boot: drone, data chatter, a blip per octagon side, snare roll and reverse swell into the drop
  3.2  drop: impact, then kick, offbeat bass, hats, claps and a 16th-note arp (Am F C G, a bar each)
  4.0  a chord stab on every word          6.4  whoosh in, zap on beat 3 and a stutter out, per feature
 12.8  a tick and noise hit per strobe cut 14.4  build: drums out, snare roll, riser; silence at 15.8
 16.0  final drop                          19.2  last hit, long chord, echoes into the fade
"""
import wave
from pathlib import Path
import numpy as np

SR, DUR = 48_000, 21.6
N = int(SR * DUR)
BEAT = 0.4
rng = np.random.default_rng(150)
L, R = np.zeros(N), np.zeros(N)       # sidechained bus
KL, KR = np.zeros(N), np.zeros(N)     # kick and impacts, not ducked
send = np.zeros(N)                    # reverb send (mono)

KICKS = [round(3.2 + i * BEAT, 2) for i in range(28)] + [round(16.0 + i * BEAT, 2) for i in range(9)]  # 3.2..14.0, 16.0..19.2
FEATS = [6.4, 8.0, 9.6, 11.2]
WORDS = [4.0 + i * BEAT for i in range(6)]
CHORDS = {"Am": ([69, 72, 76], 45), "F": ([65, 69, 72], 41), "C": ([72, 76, 79], 48), "G": ([67, 71, 74], 43)}  # arp tones, bass root (MIDI)
PROG = ["Am", "F", "C", "G"]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def chord_at(t):
    return PROG[int(max(0.0, t - 3.2) // 1.6) % 4]


def put(t0, sig, pan=0.0, rev=0.0, bus="main"):
    """Mix a mono signal in at t0 seconds. pan -1..1, equal power."""
    i = int(round(t0 * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    gl, gr = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    if bus == "kick":
        KL[i:i + len(sig)] += sig * gl
        KR[i:i + len(sig)] += sig * gr
    else:
        L[i:i + len(sig)] += sig * gl
        R[i:i + len(sig)] += sig * gr
    send[i:i + len(sig)] += sig * rev


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def band(x, lo=0.0, hi=SR / 2):
    """Soft band-pass by FFT (for short snippets)."""
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.clip((f - lo * .7) / (lo * .3 + 1e-9), 0, 1) if lo > 0 else np.ones_like(f)
    g *= np.clip((hi * 1.3 - f) / (hi * .3), 0, 1) if hi < SR / 2 else 1
    return np.fft.irfft(np.fft.rfft(x) * g, len(x))


def sweep(dur, lo_fn, hi_fn, seed=0):
    """Noise through a moving band: 40 ms Hann chunks at 50% overlap, each filtered for its moment."""
    n = int(dur * SR)
    x = np.random.default_rng(seed).standard_normal(n + 4096)
    hop, win = 960, np.hanning(1920)
    out = np.zeros(n + 4096)
    for s in range(0, n, hop):
        u = s / max(n, 1)
        out[s:s + 1920] += band(x[s:s + 1920] * win, lo_fn(u), hi_fn(u))
    return out[:n]


def saw(f, dur, bright=1.0, decay=4.0, voices=(0.0,), maxh=40):
    """Band-limited saw by additive synthesis; upper harmonics decay faster, like a closing filter."""
    t = tt(dur)
    out = np.zeros_like(t)
    for dc in voices:
        fv = f * 2 ** (dc / 1200)
        ph = rng.uniform(0, 2 * np.pi)
        for n in range(1, maxh + 1):
            if n * fv > 15000:
                break
            out += np.sin(2 * np.pi * n * fv * t + ph * n) / n * np.exp(-t * (decay + n * decay * .45 / bright))
    return out / len(voices)


def env(t, a=0.003, r=0.02, dur=None):
    dur = dur if dur is not None else t[-1]
    return np.minimum(1, t / a) * np.clip((dur - t) / r, 0, 1)


# ---------- Instruments ----------
def kick(amp=1.0):
    t = tt(0.5)
    f = 46 + 120 * np.exp(-t * 30) + 60 * np.exp(-t * 160)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5) * np.minimum(1, t / .002)
    click = band(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t * 320) * .5
    return np.tanh((body + click) * 1.8) * amp


def clap(amp=1.0):
    t = tt(0.4)
    x = rng.standard_normal(len(t))
    e = sum(np.where(t >= o, np.exp(-(t - o) * 140), 0) for o in (0, .011, .022)) + np.where(t >= .03, np.exp(-(t - .03) * 16), 0) * .7
    return band(x * e, 900, 5500) * amp


def snare(amp=1.0):
    t = tt(0.22)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28)
    nz = band(rng.standard_normal(len(t)), 1500, 9500) * np.exp(-t * 20)
    return (tone * .5 + nz) * amp


def hat(amp=1.0, open_=False):
    t = tt(0.25 if open_ else 0.06)
    return band(rng.standard_normal(len(t)), 7000, 16000) * np.exp(-t * (13 if open_ else 60)) * amp


def bass(m, dur=0.17):
    t = tt(dur)
    f = hz(m)
    s = saw(f, dur, bright=.8, decay=3, voices=(-6, 6), maxh=18) + .6 * np.sin(2 * np.pi * f / 2 * t)
    return np.tanh(s * 1.4) * env(t, .002, .03)


def pluck(m, dur=0.14, bright=1.0):
    t = tt(dur)
    return saw(hz(m), dur, bright=bright, decay=9, maxh=24) * env(t, .002, .03)


def stab(ms, dur=0.3, decay=5.0):
    t = tt(dur)
    s = sum(saw(hz(m), dur, bright=1.4, decay=decay, voices=(-11, 0, 11), maxh=30) for m in ms) / len(ms)
    return s * env(t, .003, min(.08, dur / 3))


def boom(amp=1.0, f0=72, f1=30, decay=1.3, dur=2.0):
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay) * np.minimum(1, t / .004) * amp


def crash(amp=1.0, dur=2.5):
    t = tt(dur)
    nz = band(rng.standard_normal(len(t)), 3000, 16000) * np.exp(-t * 2.2)
    metal = sum(np.sin(2 * np.pi * f * t) for f in (3150, 4420, 5870, 7310)) * np.exp(-t * 3) * .05
    return (nz + metal) * np.minimum(1, t / .002) * amp


def blip(f, amp=1.0, dur=0.18):
    t = tt(dur)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 26) * np.minimum(1, t / .001) * amp


def zap(amp=1.0):
    t = tt(0.1)
    f = 200 + 2200 * np.exp(-t * 45)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * amp


def stutter(seed, amp=1.0):
    """Bit-crushed square chirps chopped in 32nds: the glitch-out sound."""
    r = np.random.default_rng(seed)
    out = []
    for _ in range(4):
        t = tt(0.05)
        f = r.uniform(180, 1400)
        sq = np.sign(np.sin(2 * np.pi * f * t * (1 + t * r.uniform(-6, 6))))
        out.append(np.round(sq * np.exp(-t * 25) * 6) / 6 * (r.uniform(.5, 1)))
    return np.concatenate(out) * amp


def whoosh(dur=0.34, seed=0, amp=1.0):
    x = sweep(dur, lambda u: 300 + 3000 * np.sin(np.pi * u) ** 2, lambda u: 1200 + 9000 * np.sin(np.pi * u) ** 2, seed)
    t = tt(dur)
    return x * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5 * amp


# ---------- Boot 0–3.2 ----------
t_all = np.arange(N) / SR
drone = sum(np.sin(2 * np.pi * f * t_all + p) * a for f, a, p in [(55, .5, 0), (82.41, .3, 1), (110, .18, 2)])
drone *= np.clip(t_all / 1.2, 0, 1) * np.clip((3.2 - t_all) / .05, 0, 1) * (1 + .6 * np.clip((t_all - 2.4) / .8, 0, 1))
L += drone * .12
R += drone * .12
for i in range(24):  # data chatter, 16ths
    tc = .4 + i * .1
    if tc < 2.4 and rng.random() < .6:
        put(tc, blip(rng.choice([1760, 2093, 2637, 3136, 3520]), .035, .05), pan=rng.uniform(-.8, .8), rev=.2)
for i, m in enumerate([81, 84, 86, 88, 91, 93, 96, 98]):  # one blip per octagon side, 8th notes
    put(.8 + i * .2, blip(hz(m), .22), pan=(-.5 if i % 2 else .5), rev=.5)
    put(.8 + i * .2, hat(.25), pan=.3)
for i in range(16):  # snare roll into the drop: 16ths, then 32nds
    ts = 2.4 + (i * .1 if i < 4 else .4 + (i - 4) * .05 * (4 / 6))
    if ts < 3.2:
        put(ts, snare(.18 + .5 * (ts - 2.4) / .8), rev=.25)
rev_swell = sweep(1.0, lambda u: 2000 + 4000 * u, lambda u: 9000 + 6000 * u, 3) * np.linspace(0, 1, int(SR * 1.0)) ** 3
put(2.2, rev_swell * .5, rev=.3)
riser = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (tt(.8) / .8 * 3)) / SR) * (tt(.8) / .8) ** 2
put(2.4, riser * .08, rev=.4)

# ---------- Groove (3.2–14.4 and 16.0–19.2) ----------
def groove(a, b, *, arp=True, claps=True):
    s = a
    step = 0
    while s < b - 1e-6:
        c = chord_at(s + 1e-6)
        tones, root = CHORDS[c]
        if step % 2 == 0:
            put(s, hat(.14), pan=.25)
        else:
            put(s, hat(.2, open_=(step % 4 == 2)), pan=.25)
        if step % 4 == 2:  # offbeat bass
            put(s, bass(root, .19) * .5)
        if claps and step % 8 == 4:
            put(s, clap(.5), rev=.35)
        if arp:
            seq = [0, 1, 2, 1, 0, 2, 1, 2]
            m = tones[seq[step % 8]] + (12 if step % 16 >= 8 else 0)
            put(s, pluck(m, .13) * .11, pan=(-.45 if step % 2 else .45), rev=.25)
        s = round(s + BEAT / 4, 4)
        step += 1


groove(3.2, 14.4)
groove(16.0, 19.2)
for kt in KICKS:
    put(kt, kick(.95), bus="kick")

# Drops and impacts
for at, big in [(3.2, 1.0), (16.0, 1.25)]:
    put(at, boom(.9 * big), bus="kick")
    put(at, crash(.35 * big), rev=.4)
    put(at, stab([57, 64, 69, 72, 76], .7, decay=3) * .35 * big, rev=.6)
    put(at - .5, sweep(.5, lambda u: 400 + 7000 * u ** 2, lambda u: 2000 + 12000 * u, 9) * np.linspace(0, 1, int(SR * .5)) ** 2 * .35)

# Word stabs, one per beat
for i, w in enumerate(WORDS):
    tones, _ = CHORDS[chord_at(w + 1e-6)]
    put(w, stab([m - 12 for m in tones] + [tones[0]], .6 if i == 5 else .26, decay=3 if i == 5 else 6) * .28, pan=(-.2 if i % 2 else .2), rev=.45)
put(6.0, sweep(.4, lambda u: 6000 - 5000 * u, lambda u: 12000 - 8000 * u, 21) * np.linspace(1, 0, int(SR * .4)) * .25)

# Features: whoosh in, zap on beat 3, stutter out
for i, a in enumerate(FEATS):
    d = -1 if i % 2 else 1
    w = whoosh(.34, seed=30 + i, amp=.45)
    put(a - .06, w * np.linspace(1, .3, len(w)), pan=.6 * d)
    put(a - .06, w * np.linspace(.3, 1, len(w)), pan=-.6 * d)
    put(a + .8, zap(.3), rev=.3)
    put(a + 1.38, stutter(40 + i, .12), pan=-.3 * d)

# Montage: tick per cut, noise hit on inverted cuts
for c in range(8):
    tc = 12.8 + c * .2
    put(tc, blip(hz(93 + (c % 4) * 2), .12, .08), pan=(-.5 if c % 2 else .5), rev=.2)
    if c in (1, 3, 5):
        put(tc, band(rng.standard_normal(int(SR * .05)), 2000, 14000) * np.exp(-tt(.05) * 40) * .3)

# ---------- Build 14.4–15.8, then silence ----------
roll = []
s = 14.4
while s < 15.8 - 1e-6:
    roll.append(s)
    s += .2 if s < 15.0 else .1 if s < 15.4 else .05
for s in roll:
    put(s, snare(.15 + .55 * (s - 14.4) / 1.4), rev=.3)
up = sweep(1.4, lambda u: 200 + 6000 * u ** 2, lambda u: 1500 + 13000 * u ** 1.5, 12) * np.linspace(0, 1, int(SR * 1.4)) ** 2
put(14.4, up * .45, rev=.3)
f = 110 * 2 ** (tt(1.4) / 1.4 * 3.5)
put(14.4, np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt(1.4) / 1.4) ** 2 * .1, rev=.4)
for i in range(14):  # arp keeps pulsing, opening up
    m = CHORDS["G"][0][[0, 1, 2, 1][i % 4]] + 12
    put(14.4 + i * .1, pluck(m, .1, bright=.6 + i * .12) * (.06 + .08 * i / 14), pan=(-.4 if i % 2 else .4), rev=.3)

# ---------- Final hit and tail ----------
put(19.2, boom(1.0, decay=.9, dur=2.4), bus="kick")
put(19.2, crash(.45, 2.4), rev=.5)
put(19.2, stab([45, 57, 64, 69, 72, 76], 2.4, decay=.9) * .35, rev=.9)
for i in range(6):  # echoing arp into the fade
    put(19.6 + i * .3, pluck(81 - [0, 3, 5, 7, 10, 12][i], .2) * .08 * .75 ** i, pan=(-.6 if i % 2 else .6), rev=.8)
pad = sum(np.sin(2 * np.pi * hz(m) * t_all) for m in (45, 52, 57, 60)) * .04
pad *= np.clip((t_all - 19.2) / .6, 0, 1)
L += pad
R += pad

# ---------- Sidechain, reverb, silence gap, master ----------
kk = np.array(KICKS)
idx = np.searchsorted(kk, t_all, side="right") - 1
since = np.where(idx >= 0, t_all - kk[np.clip(idx, 0, None)], 9)
duck = 1 - .6 * np.exp(-since * 13)
L *= duck
R *= duck
ir_len = int(SR * 1.8)
for side, seed in ((0, 11), (1, 12)):
    ir = np.random.default_rng(seed).standard_normal(ir_len) * np.exp(-np.arange(ir_len) / SR * 3.2)
    ir = band(ir, 200, 7000)
    ir /= np.sqrt((ir ** 2).sum())
    size = 1 << int(np.ceil(np.log2(N + ir_len)))
    wet = np.fft.irfft(np.fft.rfft(send, size) * np.fft.rfft(ir, size), size)[:N] * .3
    if side == 0:
        L += wet
    else:
        R += wet
master = np.stack([L + KL, R + KR], axis=1)
gap = (t_all >= 15.8) & (t_all < 16.0)
master[gap] = 0
fade = np.clip(t_all / .02, 0, 1) * np.clip((DUR - t_all) / .6, 0, 1)
master *= fade[:, None]
master /= np.abs(master).max()
master = np.tanh(master * 2.2) / np.tanh(2.2)
master *= 10 ** (-1 / 20) / np.abs(master).max()

out = Path(__file__).parent / ".build" / "teaser-hype-sound.wav"
out.parent.mkdir(exist_ok=True)
with wave.open(str(out), "wb") as fh:
    fh.setnchannels(2)
    fh.setsampwidth(2)
    fh.setframerate(SR)
    fh.writeframes((master * 32767).astype("<i2").tobytes())
rms = 20 * np.log10(np.sqrt((master ** 2).mean()))
print(f"wrote {out} ({DUR} s, RMS {rms:.1f} dBFS)")
