/* Through Black Glass: the figures in the field guide.
   Every figure rests until a visitor uses it: nothing here moves on load or on scroll. The mystery drawings play
   while hovered, focused or pressed, then finish their loop and rest on the finished frame, which is also what
   reduced motion shows. The live network in chapter 08 is real: it trains by backpropagation with Adam. */
(() => {
  'use strict';
  const { m, d, P } = BG;
  const { clamp, lerp, k, expo } = m;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const RULE = 'rgba(241,238,230,.17)', RULE2 = 'rgba(241,238,230,.38)';
  const MINUS = '−';
  const fmt = (v, n = 2) => (v < -0.0049 ? MINUS : '') + Math.abs(v).toFixed(n);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  /* A segmented control: exactly one button pressed per group. */
  function seg(group, onPick) {
    const btns = $$('button', group);
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onPick(b);
    }));
    return btns;
  }
  const press = (btns, test) => btns.forEach((b) => b.setAttribute('aria-pressed', String(test(b))));
  /* A short tween on the shared frame, or an instant jump with reduced motion. */
  function tween(dur, fn, done) {
    if (BG.reduced()) { fn(1); if (done) done(); return; }
    let t = 0;
    const f = (dt) => { t += dt; const e = clamp(t / dur); fn(e); if (e >= 1) { BG.pause(f); if (done) done(); } };
    BG.play(f);
  }
  const G = BG.rgb(P.ground), FG = BG.rgb(P.fg), EM = BG.rgb(P.ember);
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  /* ==========================================================================================================
     01 Agent trace: each step is the same call to the model.
     ========================================================================================================== */
  (() => {
    const fig = $('[data-fig="agent"]');
    if (!fig) return;
    const STEPS = [
      ['task', 'Task', 'The nightly build fails. Find out why and fix it.', 18],
      ['think', 'Think', 'Start by reproducing the failure.', 9],
      ['call', 'Tool call', 'run("pnpm test")', 8],
      ['result', 'Result', '1 failed · parser › empty input: expected [] but got undefined', 46],
      ['think', 'Think', 'The parser returns nothing for empty input. Read it.', 14],
      ['call', 'Tool call', 'read_file("src/parser.ts")', 9],
      ['result', 'Result', '212 lines · line 14: if (!input) return;', 2400],
      ['think', 'Think', 'Return an empty list instead of nothing.', 11],
      ['call', 'Tool call', 'edit_file("src/parser.ts", "return;" → "return [];")', 21],
      ['result', 'Result', '1 edit applied', 4],
      ['call', 'Tool call', 'run("pnpm test")', 8],
      ['result', 'Result', '42 passed', 3],
      ['answer', 'Answer', 'Fixed. The parser now returns an empty list for empty input, and all 42 tests pass.', 22],
    ];
    const STATION = { task: 0, think: 1, call: 2, result: 3, answer: 1 };
    const log = $('[data-agent-log]', fig), bar = $('[data-agent-ctx]', fig), tokEl = $('[data-agent-tokens]', fig), stepEl = $('[data-agent-step]', fig);
    const next = $('[data-agent-next]', fig), run = $('[data-agent-run]', fig), reset = $('[data-agent-reset]', fig);
    const S = BG.surface($('canvas', fig));
    let n = 0, from = 0, to = 0, tw = 1, timer = 0, tokens = 0;
    const SA = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    function draw() {
      if (!S.W) return;
      S.begin();
      const ctx = S.ctx, W = S.W, H = S.H, cx = W / 2, cy = H / 2, RL = Math.min(W, H) * 0.31, R = RL * 0.42;
      ctx.lineWidth = 1; ctx.strokeStyle = P.fg;
      ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(cx, cy, RL, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < 4; i++) { const a = -Math.PI / 4 + (i * Math.PI) / 2; d.head(ctx, cx + RL * Math.cos(a), cy + RL * Math.sin(a), a + Math.PI / 2, 5); }
      ctx.globalAlpha = 1;
      d.octagon(ctx, cx, cy, R); ctx.fillStyle = P.pane; ctx.fill(); ctx.strokeStyle = to === 1 && tw >= 1 && n ? P.signal : P.facet; ctx.stroke();
      d.label(ctx, 'Model', cx, cy, 9, P.fg3, 'center');
      ['Read', 'Think', 'Act', 'Observe'].forEach((nm, i) => {
        const x = cx + RL * Math.cos(SA[i]), y = cy + RL * Math.sin(SA[i]), on = i === to && tw >= 1;
        d.sq(ctx, x, y, 5, on ? P.fg : P.fg3);
        const ly = i === 0 ? y - 13 : y + 14;
        d.label(ctx, nm, x, ly, 9, on ? P.fg : P.fg3, 'center');
      });
      let da = SA[to] - SA[from];
      while (da < 0) da += Math.PI * 2;
      if (from === to) da = 0;
      const a = SA[from] + da * expo(tw);
      d.sq(ctx, cx + RL * Math.cos(a), cy + RL * Math.sin(a), 8, P.signal);
    }
    S.redraw = draw;
    BG.onFonts(draw);
    function add(i, fresh) {
      const [kind, lab, text, tk] = STEPS[i];
      const li = document.createElement('li');
      li.className = `is-${kind}${fresh ? ' is-new' : ''}`;
      li.innerHTML = `<span class="label">${lab}</span><p>${esc(text)}</p>`;
      $$('.is-new', log).forEach((e) => e.classList.remove('is-new'));
      log.appendChild(li);
      log.scrollTop = log.scrollHeight;
      const piece = document.createElement('span');
      piece.className = kind === 'call' ? 'k-call' : kind === 'result' ? 'k-result' : 'k-text';
      piece.style.setProperty('--n', String(tk));
      bar.appendChild(piece);
      tokens += tk;
      tokEl.textContent = tokens.toLocaleString('en-NZ');
      const st = STATION[kind];
      from = i ? STATION[STEPS[i - 1][0]] : st; to = st;
      if (fresh && from !== to) { tw = 0; tween(0.22, (e) => { tw = e; draw(); }); } else { tw = 1; draw(); }
    }
    function sync() {
      stepEl.textContent = `Step ${n} of ${STEPS.length}`;
      next.disabled = n >= STEPS.length;
      run.disabled = n >= STEPS.length;
      if (n >= STEPS.length) stopRun();
    }
    function step() { if (n < STEPS.length) { add(n, true); n++; sync(); } }
    function stopRun() { clearInterval(timer); timer = 0; run.textContent = 'Run to the end'; }
    function restart() {
      stopRun(); log.textContent = ''; bar.textContent = ''; tokens = 0; n = 0;
      for (let i = 0; i < 4; i++) { add(i, false); n++; }
      sync();
    }
    next.addEventListener('click', step);
    run.addEventListener('click', () => {
      if (timer) { stopRun(); return; }
      run.textContent = 'Pause';
      step();
      timer = setInterval(step, 950);
    });
    reset.addEventListener('click', restart);
    restart();
  })();

  /* ==========================================================================================================
     02 Toy tokenizer: greedy longest match against a small hand-made vocabulary.
     ========================================================================================================== */
  (() => {
    const fig = $('[data-fig="tokenizer"]');
    if (!fig) return;
    const WORDS = ('the of and to a in is it that was for on are with as be at by this have from or one had not but what all were when we there can an your which their said if do will each about how up out them then she many some so these would other into has more her two like him see time could no make than first been its who now people my made over did down only way find use may water long little very after words called just where most know get through back much go good new write our me man too any day same right look think also around another came come work three word must because does part even place well such here take why help put different away again off went old number great tell men say small every found still between name should home big give air line set own under read last never us left end along while might next sound below saw something thought both few those always show large often together asked house world going want school important until form food keep children feet land side without boy once life enough took four head above kind began almost live page got earth need far hand high year mother light country father let night picture being study second soon story since white ever paper hard near sentence better best across during today however sure knew try told young sun thing whole hear example heard several change answer room sea against top turned learn point city play toward five himself usually money seen car morning capital state containing Dallas Texas Austin model language network neural token text numbers machine mind black glass brain science understand works training test build fix nightly parser straw red bridge glowed dusk later many').split(' ');
    const CAPS = 'The A An How What Why When Where Who It In This That I We You They If And But Or So Later Token'.split(' ');
    const PIECES = ['ing', 'ed', 'er', 'ers', 'est', 'ly', 'tion', 'tions', 'sion', 's', 'es', 'al', 'ally', 'ic', 'ical', 'ous', 'ness', 'ment', 'ments', 'able', 'ably', 'ible', 'ity', 'ive', 'ist', 'ism', 'ise', 'isation', 'ised', 'ize', 'ization', 'ful', 'less', 'ary', 'ory', 'ure', 'ent', 'ence', 'ance', 'ant', 'en', 'an', 'on', 'in', 're', 'un', 'de', 'dis', 'pre', 'con', 'com', 'pro', 'ex', 'per', 'ter', 'ver', 'ted', 'ting', 'ple', 'ble', 'tle', 'age', 'ate', 'ated', 'ating', 'our', 'ou', 'ow', 'ay', 'ey', 'oy', 'ie', 'ia', 'io', 'ea', 'ee', 'oo', 'ai', 'au', 'th', 'sh', 'ch', 'ck', 'ng', 'nk', 'st', 'str', 'pl', 'pr', 'tr', 'gr', 'br', 'cr', 'dr', 'fr', 'bl', 'cl', 'fl', 'gl', 'sl', 'sp', 'sw', 'wh', 'qu', 'ph', 'gh', 'll', 'ss', 'tt', 'pp', 'rr', 'mm', 'nn', 'dd', 'ff', 'te', 'ti', 'to', 'ta', 'po', 'pa', 'pe', 'pi', 'ra', 'ro', 'ri', 'ru', 'la', 'li', 'lo', 'le', 'ma', 'me', 'mi', 'mo', 'na', 'ne', 'ni', 'no', 'ha', 'he', 'hi', 'ho', 'berry', 'believ', 'even', "'s", "'t", "'re", "'ll", "'ve", "'d", "n't"];
    const PRE = ['un', 're', 'de', 'in', 'dis', 'pre', 'con', 'com', 'pro', 'ex', 'Dal', 'str', 'Tok', 'Te', 'te'];
    const SINGLE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:\'"()-'.split('');
    const vocab = [' '];
    SINGLE.forEach((c) => vocab.push(c));
    'abcdefghijklmnopqrstuvwxyz'.split('').forEach((c) => vocab.push(` ${c}`));
    WORDS.forEach((w) => vocab.push(` ${w}`));
    CAPS.forEach((w) => vocab.push(w));
    PIECES.forEach((p) => vocab.push(p));
    PRE.forEach((p) => vocab.push(` ${p}`));
    const V = new Map();
    vocab.forEach((p) => { if (!V.has(p)) V.set(p, V.size); });
    const MAXL = Math.max(...[...V.keys()].map((p) => p.length));
    function tokenize(text) {
      const out = [];
      let i = 0;
      while (i < text.length) {
        let hit = null;
        for (let L = Math.min(MAXL, text.length - i); L > 0; L--) { const s = text.slice(i, i + L); if (V.has(s)) { hit = s; break; } }
        if (hit) { out.push([hit, V.get(hit)]); i += hit.length; continue; }
        const ch = String.fromCodePoint(text.codePointAt(i));
        out.push([ch, 1000 + text.codePointAt(i)]);
        i += ch.length;
      }
      return out;
    }
    const input = $('#tok-input'), outEl = $('[data-tok-out]', fig), stats = $('[data-tok-stats]', fig);
    const exBtns = seg($('[data-tok-examples]', fig), (b) => { input.value = b.dataset.text; render(); });
    function render() {
      const toks = tokenize(input.value);
      outEl.innerHTML = toks.map(([s, id]) => {
        const lead = s.startsWith(' ');
        const body = lead ? s.slice(1) : s;
        return `<span class="tok-chip"><b>${lead ? '<i>·</i>' : ''}${esc(body)}</b><small>${id}</small></span>`;
      }).join('');
      const chars = [...input.value].length;
      stats.textContent = toks.length ? `${chars} characters · ${toks.length} tokens` : '–';
    }
    input.addEventListener('input', () => { press(exBtns, (b) => b.dataset.text === input.value); render(); });
    const cap = fig.querySelector('figcaption');
    if (cap) cap.textContent = cap.textContent.replace('about 500 pieces', `${V.size} pieces`);
    render();
  })();

  /* ==========================================================================================================
     04 Attention explorer: four idealised head types, applied by rule.
     ========================================================================================================== */
  (() => {
    const fig = $('[data-fig="attention"]');
    if (!fig) return;
    const EX = [['The bridge glowed red at dusk. Later, the bridge glowed', 'ind', 'bridge'], ['When Mary and John went to the store, John gave a drink to', 'dup', 'john'], ['The capital of the state containing Dallas is', 'prev', null]];
    const split = (s) => s.match(/\s*[\p{L}\p{N}’'-]+|\s*[^\s\p{L}\p{N}]/gu) || [];
    const hsh = (i, j) => { const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };
    let toks = [], norm = [], head = 'ind', focus = 0, M = [];
    const wrap = $('[data-att-tokens]', fig), note = $('[data-att-note]', fig), input = $('#att-input');
    const S = BG.surface($('.att-matrix', fig));
    const headBtns = seg($('[data-att-heads]', fig), (b) => { head = b.dataset.head; compute(); update(); });
    const exBtns = seg($('[data-att-examples]', fig), (b) => { const ex = EX[+b.dataset.ex]; input.value = ''; setText(ex[0], ex[1], ex[2]); });
    const score = (i, j) => {
      if (head === 'prev') return j === i - 1 || (i === 0 && j === 0) ? 6 : 0;
      if (head === 'dup') return j < i && norm[j] === norm[i] ? 6 : j === 0 ? 2.5 : 0;
      if (head === 'ind') return j > 0 && j - 1 < i && norm[j - 1] === norm[i] ? 6 : j === 0 ? 2.5 : 0;
      return j === 0 ? 4 : 0.6 * hsh(i, j);
    };
    function compute() {
      M = toks.map((_, i) => {
        const s = Array.from({ length: i + 1 }, (_, j) => Math.exp(score(i, j)));
        const z = s.reduce((a, b) => a + b, 0);
        return s.map((v) => v / z);
      });
    }
    function setText(text, h, word) {
      toks = split(text).slice(0, 40);
      norm = toks.map((t) => t.trim().toLowerCase());
      if (h) { head = h; press(headBtns, (b) => b.dataset.head === h); }
      // Start on the most telling token: the last repeat, or the final token.
      focus = toks.length - 1;
      for (let i = toks.length - 1; i > 0; i--) if (norm.slice(0, i).includes(norm[i]) && /\p{L}/u.test(norm[i])) { focus = i; break; }
      if (head === 'prev' || head === 'sink') focus = toks.length - 1;
      if (word) { const at = norm.lastIndexOf(word); if (at >= 0) focus = at; }
      wrap.innerHTML = toks.map((t, i) => `<button type="button" class="att-tok" data-i="${i}" tabindex="${i === focus ? 0 : -1}"><span>${esc(t.trim())}</span><small>·</small></button>`).join('');
      compute();
      update();
    }
    const q = (s) => `“${s.trim()}”`;
    function explain() {
      const i = focus, row = M[i] || [], cur = toks[i];
      if (!cur) return '';
      let best = 0;
      row.forEach((w, j) => { if (w > row[best]) best = j; });
      if (head === 'prev') return i === 0 ? `${q(cur)} is the first token, so it can only look at itself.` : `${q(cur)} looks at ${q(toks[i - 1])}, the token just before it. Heads like this let later layers read short phrases and word order.`;
      if (head === 'sink') return 'Most of the attention rests on the first token. Many heads park their attention there when nothing else is relevant: an “attention sink” (Xiao et al., 2023).';
      if (head === 'dup') {
        if (best === 0 && norm[0] !== norm[i]) return `No earlier ${q(cur)}, so this head rests on the first token, as heads often do when nothing is relevant.`;
        const ioi = norm[i] === 'john' && norm.includes('mary');
        return `${q(cur)} appeared before, at position ${best + 1}. A duplicate-token head looks back at the earlier copy.${ioi ? ' In GPT-2 small, heads like this help the model work out that the answer here is “Mary”, not “John” (Wang et al., 2022).' : ''}`;
      }
      if (best === 0 && !(norm[0] === norm[i] && i > 0)) return `No earlier ${q(cur)} to match, so the induction head rests on the first token.`;
      const nxt = toks[best];
      const came = toks[i + 1] && norm[i + 1] === norm[best];
      return `${q(cur)} appeared before, followed by ${q(nxt)}. The induction head looks at ${q(nxt)}, which predicts that ${q(nxt)} comes next.${came ? ' Here it does.' : ''}`;
    }
    function update() {
      const row = M[focus] || [];
      const mx = Math.max(...row);
      $$('.att-tok', wrap).forEach((b, j) => {
        const w = j <= focus ? row[j] : 0;
        b.style.setProperty('--w', j === focus ? '0' : w.toFixed(3));
        b.setAttribute('aria-pressed', String(j === focus));
        b.toggleAttribute('data-strong', j < focus && w === mx);
        b.toggleAttribute('data-masked', j > focus);
        b.lastElementChild.textContent = j > focus ? '·' : w < 0.005 ? '0' : w.toFixed(2).replace(/^0/, '');
        const t = toks[j].trim();
        b.setAttribute('aria-label', j === focus ? `${t}, chosen` : j < focus ? `${t}, ${Math.round(w * 100)}% of the attention` : `${t}, after the chosen token`);
      });
      note.textContent = explain();
      draw();
    }
    function draw() {
      if (!S.W) return;
      S.begin();
      const ctx = S.ctx, n = toks.length, W = S.W;
      if (!n) return;
      const lab = n <= 16 ? Math.min(78, W * 0.28) : 0;
      const size = W - lab - 4, c = size / n, x0 = lab, y0 = 2;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = x0 + j * c, y = y0 + i * c;
        if (j > i) { if (c > 7) { ctx.globalAlpha = 0.1; ctx.strokeStyle = P.fg; d.line(ctx, x + 2, y + c - 2, x + c - 2, y + 2); } continue; }
        ctx.globalAlpha = 0.06 + 0.94 * Math.sqrt(M[i][j]);
        ctx.fillStyle = P.fg;
        ctx.fillRect(x + 0.5, y + 0.5, c - 1, c - 1);
      }
      ctx.globalAlpha = 1; ctx.strokeStyle = RULE2; ctx.strokeRect(x0 - 0.5, y0 - 0.5, size + 1, size + 1);
      if (lab) toks.forEach((t, i) => d.code(ctx, t.trim().slice(0, 10), x0 - 6, y0 + (i + 0.5) * c, Math.min(10, c * 0.8), i === focus ? P.fg : P.fg3, 'right'));
      ctx.strokeStyle = P.signal; ctx.lineWidth = 1.5;
      d.brackets(ctx, x0 - 3, y0 + focus * c - 3, size + 6, c + 6, Math.min(8, c));
      ctx.lineWidth = 1;
    }
    S.redraw = draw;
    BG.onFonts(draw);
    wrap.addEventListener('click', (e) => { const b = e.target.closest('.att-tok'); if (!b) return; focus = +b.dataset.i; roving(); update(); });
    wrap.addEventListener('keydown', (e) => {
      const n = toks.length;
      const mv = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (mv == null && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      focus = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (focus + mv + n) % n;
      roving(); update();
      $$('.att-tok', wrap)[focus].focus();
    });
    function roving() { $$('.att-tok', wrap).forEach((b, j) => { b.tabIndex = j === focus ? 0 : -1; }); }
    input.addEventListener('input', () => {
      const v = input.value.trim();
      press(exBtns, () => false);
      if (v) setText(v); else { const b = exBtns[0]; b.click(); }
    });
    setText(EX[0][0], EX[0][1], EX[0][2]);
  })();

  /* ==========================================================================================================
     06 One neuron: weights, a bias and a bend, with its response to every input.
     ========================================================================================================== */
  (() => {
    const fig = $('[data-fig="neuron"]');
    if (!fig) return;
    const canvas = $('.neuron-canvas', fig), S = BG.surface(canvas);
    const sl = { w1: $('#nw1'), w2: $('#nw2'), b: $('#nb') };
    const outs = { w1: $('[data-out="nw1"]'), w2: $('[data-out="nw2"]'), b: $('[data-out="nb"]') };
    const readEl = $('[data-neuron-readout]', fig);
    const ACT = {
      relu: (z) => Math.max(0, z),
      gelu: (z) => 0.5 * z * (1 + Math.tanh(0.7978845608 * (z + 0.044715 * z * z * z))),
      tanh: Math.tanh,
      none: (z) => z,
    };
    const NAME = { relu: 'ReLU', gelu: 'GELU', tanh: 'tanh', none: 'no bend' };
    let x1 = 0.6, x2 = -0.3, act = 'gelu', box = null;
    const off = document.createElement('canvas');
    off.width = off.height = 72;
    seg($('[data-neuron-act]', fig), (b) => { act = b.dataset.act; draw(); });
    const val = (key) => parseFloat(sl[key].value);
    function draw() {
      if (!S.W) return;
      S.begin();
      const ctx = S.ctx, W = S.W, H = S.H, pr = W / H < 1.15;
      const w1 = val('w1'), w2 = val('w2'), b = val('b'), f = ACT[act];
      const z = w1 * x1 + w2 * x2 + b, a = f(z);
      // The response map.
      const ms = pr ? Math.min(W - 44, H * 0.5) : Math.min(H - 40, W * 0.46);
      const mx = pr ? (W - ms) / 2 + 12 : W - ms - 8, my = pr ? H - ms - 24 : (H - ms) / 2 - 6;
      box = { mx, my, ms };
      const oc = off.getContext('2d'), img = oc.createImageData(72, 72);
      let amax = 1e-6;
      const vals = new Float32Array(72 * 72);
      for (let j = 0; j < 72; j++) for (let i = 0; i < 72; i++) {
        const X = -1 + (2 * (i + 0.5)) / 72, Y = 1 - (2 * (j + 0.5)) / 72;
        const v = f(w1 * X + w2 * Y + b);
        vals[j * 72 + i] = v;
        amax = Math.max(amax, Math.abs(v));
      }
      for (let p = 0; p < vals.length; p++) {
        const v = vals[p] / amax;
        const c = v >= 0 ? mixc(G, FG, 0.06 + 0.6 * v) : mixc(G, EM, 0.15 + 0.7 * -v);
        img.data[p * 4] = c[0]; img.data[p * 4 + 1] = c[1]; img.data[p * 4 + 2] = c[2]; img.data[p * 4 + 3] = 255;
      }
      oc.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, mx, my, ms, ms);
      ctx.strokeStyle = RULE2; ctx.strokeRect(mx - 0.5, my - 0.5, ms + 1, ms + 1);
      const SX = (v) => mx + ((v + 1) / 2) * ms, SY = (v) => my + ((1 - v) / 2) * ms;
      // Where the weighted sum is zero.
      const pts = [];
      if (Math.abs(w2) > 1e-6) [-1, 1].forEach((X) => { const Y = -(w1 * X + b) / w2; if (Y >= -1 && Y <= 1) pts.push([X, Y]); });
      if (Math.abs(w1) > 1e-6) [-1, 1].forEach((Y) => { const X = -(w2 * Y + b) / w1; if (X > -1 && X < 1) pts.push([X, Y]); });
      if (pts.length >= 2) { ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.7; ctx.setLineDash([4, 4]); d.line(ctx, SX(pts[0][0]), SY(pts[0][1]), SX(pts[1][0]), SY(pts[1][1])); ctx.setLineDash([]); ctx.globalAlpha = 1; }
      [-1, 0, 1].forEach((v) => {
        d.label(ctx, v ? fmt(v, 0) : '0', SX(v), my + ms + 12, 9, P.fg3, 'center');
        d.label(ctx, v ? fmt(v, 0) : '0', mx - 6, SY(v), 9, P.fg3, 'right');
      });
      d.label(ctx, 'Input 1', mx + ms, my + ms + 24 > H - 2 ? my + ms + 12 : my + ms + 24, 9, P.fg3, 'right');
      d.label(ctx, 'Input 2', mx, my - 10, 9, P.fg3, 'left');
      ctx.globalAlpha = 0.5; ctx.strokeStyle = P.signal; ctx.setLineDash([2, 3]);
      d.line(ctx, SX(x1), SY(x2), SX(x1), my + ms); d.line(ctx, mx, SY(x2), SX(x1), SY(x2));
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      d.sq(ctx, SX(x1), SY(x2), 11, P.signal);
      ctx.strokeStyle = P.ground; ctx.strokeRect(SX(x1) - 5.5, SY(x2) - 5.5, 11, 11);

      // The diagram: inputs, weights, the sum, the bend, the output.
      const dx = 8, dy = pr ? 10 : (H - Math.min(H, 240)) / 2 + 6, dw = pr ? W - 16 : W - ms - 40, dh = pr ? H - ms - 60 : Math.min(H, 240) - 12;
      const i1 = [dx + 8, dy + dh * 0.28], i2 = [dx + 8, dy + dh * 0.72], sg = [dx + dw * 0.4, dy + dh * 0.5];
      const pb = [dx + dw * 0.55, dy + dh * 0.16, dw * 0.3, dh * 0.62], on = [dx + dw - 8, dy + dh * 0.5];
      const cellAt = (x, y, v) => { ctx.globalAlpha = 0.2 + 0.8 * Math.min(1, Math.abs(v)); ctx.fillStyle = v >= 0 ? P.fg : P.ember; ctx.fillRect(x - 6, y - 6, 12, 12); ctx.globalAlpha = 1; ctx.strokeStyle = RULE2; ctx.strokeRect(x - 6.5, y - 6.5, 13, 13); };
      [[i1, w1, x1, 'In 1'], [i2, w2, x2, 'In 2']].forEach(([p, w, x, nm]) => {
        ctx.globalAlpha = 0.9; ctx.strokeStyle = w >= 0 ? P.fg : P.ember; ctx.lineWidth = 0.6 + 2.2 * Math.abs(w);
        d.line(ctx, p[0] + 8, p[1], sg[0] - 15, sg[1]); ctx.lineWidth = 1; ctx.globalAlpha = 1;
        cellAt(p[0], p[1], x);
        d.label(ctx, `${nm} ${fmt(x)}`, p[0] - 6, p === i1 ? p[1] - 16 : p[1] + 18, 9, P.fg2, 'left');
        const mxp = lerp(p[0] + 8, sg[0] - 15, 0.62), myp = lerp(p[1], sg[1], 0.62);
        d.code(ctx, `×${fmt(w)}`, mxp + 4, myp + (p === i1 ? -11 : 13), 10, P.fg, 'left');
      });
      ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.6; d.line(ctx, sg[0], sg[1] + 15, sg[0], sg[1] + 34); ctx.globalAlpha = 1;
      d.label(ctx, `+ ${fmt(b)} bias`, sg[0], sg[1] + 44, 9, P.fg2, 'center');
      d.chamfer(ctx, sg[0] - 14, sg[1] - 14, 28, 28, 4); ctx.fillStyle = P.pane; ctx.fill(); ctx.strokeStyle = P.fg; ctx.stroke();
      ctx.font = d.sans(15, 600); ctx.fillStyle = P.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Σ', sg[0], sg[1] + 1);
      d.label(ctx, `Sum ${fmt(z)}`, sg[0] + 18, sg[1] - 10, 9, P.fg, 'left');
      // The bend.
      const [px, py, pw, ph] = pb, zr = 3, yr = act === 'tanh' ? [-1.2, 1.2] : act === 'none' ? [-3, 3] : [-0.5, 3];
      const X = (v) => px + ((v + zr) / (2 * zr)) * pw, Y = (v) => py + ph - ((v - yr[0]) / (yr[1] - yr[0])) * ph;
      ctx.strokeStyle = RULE2; d.line(ctx, px, Y(0), px + pw, Y(0)); d.line(ctx, X(0), py, X(0), py + ph);
      ctx.strokeStyle = P.fg; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i <= 48; i++) { const v = -zr + (i / 48) * 2 * zr; const yy = Y(clamp(f(v), yr[0], yr[1])); if (i) ctx.lineTo(X(v), yy); else ctx.moveTo(X(v), yy); }
      ctx.stroke(); ctx.lineWidth = 1;
      const zc = clamp(z, -zr, zr);
      d.sq(ctx, X(zc), Y(clamp(f(zc), yr[0], yr[1])), 8, P.signal);
      d.label(ctx, NAME[act], px, py - 10, 9, P.fg3, 'left');
      ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.6;
      d.arrow(ctx, sg[0] + 16, sg[1], px - 6, sg[1], 5); d.arrow(ctx, px + pw + 6, sg[1], on[0] - 10, sg[1], 5);
      ctx.globalAlpha = 1;
      cellAt(on[0], on[1], a / Math.max(1, amax));
      d.label(ctx, `Out ${fmt(a)}`, on[0] + 6, on[1] + 20, 9, P.fg, 'right');
      const pv = (v) => (v < -0.0049 ? `(${fmt(v)})` : fmt(v));
      readEl.innerHTML = `z = ${pv(w1)} × ${pv(x1)} + ${pv(w2)} × ${pv(x2)} + ${pv(b)} = ${fmt(z)} → ${NAME[act]} → <em>${fmt(a)}</em>`;
    }
    S.redraw = draw;
    BG.onFonts(draw);
    Object.keys(sl).forEach((key) => { outs[key].textContent = fmt(val(key)); sl[key].addEventListener('input', () => { outs[key].textContent = fmt(val(key)); draw(); }); });
    const pick = (e) => {
      if (!box) return;
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      x1 = clamp(((x - box.mx) / box.ms) * 2 - 1, -1, 1); x2 = clamp(1 - ((y - box.my) / box.ms) * 2, -1, 1);
      draw();
    };
    let drag = false;
    canvas.addEventListener('pointerdown', (e) => {
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (!box || x < box.mx - 12 || x > box.mx + box.ms + 12 || y < box.my - 12 || y > box.my + box.ms + 12) return;
      drag = true; canvas.setPointerCapture(e.pointerId); pick(e);
    });
    canvas.addEventListener('pointermove', (e) => { if (drag) pick(e); });
    canvas.addEventListener('pointerup', () => { drag = false; });
    canvas.addEventListener('pointercancel', () => { drag = false; });
    canvas.addEventListener('keydown', (e) => {
      const mv = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] }[e.key];
      if (!mv) return;
      e.preventDefault();
      x1 = clamp(x1 + mv[0], -1, 1); x2 = clamp(x2 + mv[1], -1, 1);
      draw();
    });
    draw();
  })();

  /* ==========================================================================================================
     07 Next-token draw: nine illustrative candidates plus a power-law tail for the rest of the vocabulary.
     ========================================================================================================== */
  (() => {
    const fig = $('[data-fig="sampler"]');
    if (!fig) return;
    const C = [[' Austin', 0.74], [' Texas', 0.06], [' Houston', 0.045], [' located', 0.03], [' the', 0.028], [' Dallas', 0.022], [' home', 0.015], [' Fort', 0.012], [' a', 0.01]];
    // The other 99,991 tokens: probability falling as rank^-1.6 from rank 10, sized to take what the nine leave.
    const TAILN = 99991, ALPHA = 1.6;
    const lr = new Float64Array(TAILN);
    let s1 = 0;
    for (let i = 0; i < TAILN; i++) { lr[i] = Math.log(10 + i); s1 += Math.exp(-ALPHA * lr[i]); }
    const lnC = Math.log((1 - C.reduce((a, c) => a + c[1], 0)) / s1);
    const JUNK = [' ponder', 'ilib', ' 1897', ' quasi', 'erk', ' kettle', ' (', 'ogne', ' syll', ' Ö', ' Wait', ' thus', 'ement', ' "'];
    const bars = $('[data-samp-bars]', fig), cont = $('[data-samp-cont]', fig), draws = $('[data-samp-draws]', fig);
    const temp = $('#temp'), tOut = $('[data-out="temp"]');
    const counts = new Array(C.length + 1).fill(0);
    let dist = null, hist = [], hit = -1;
    bars.innerHTML = C.map(([tk]) => `<li><span class="tk">${esc(tk.replace(/^ /, '·'))}</span><span class="bar"><span></span></span><span class="pc"></span></li>`).join('')
      + '<li><span class="tk dim">99,991 other tokens</span><span class="bar"><span></span></span><span class="pc"></span></li>';
    const rows = $$('li', bars);
    function compute(T) {
      const e = C.map(([, p]) => Math.exp(Math.log(p) / T));
      let tail = 0;
      for (let i = 0; i < TAILN; i++) tail += Math.exp((lnC - ALPHA * lr[i]) / T);
      const z = e.reduce((a, b) => a + b, 0) + tail;
      return e.map((v) => v / z).concat(tail / z);
    }
    const pct = (p) => (p >= 0.1 ? (p * 100).toFixed(0) : p >= 0.001 ? (p * 100).toFixed(1) : p > 0 ? '<0.1' : '0') + '%';
    function render() {
      rows.forEach((li, i) => {
        li.querySelector('.bar span').style.setProperty('--p', dist[i].toFixed(4));
        li.querySelector('.pc').innerHTML = `${pct(dist[i])}${counts[i] ? `<span class="ct">drawn ${counts[i]}×</span>` : ''}`;
        li.classList.toggle('is-hit', i === hit);
      });
      draws.innerHTML = hist.slice(0, 40).map((s) => `<span>${esc(s.replace(/^ /, '·'))}</span>`).join('');
    }
    function setT() { const T = parseFloat(temp.value); tOut.textContent = T.toFixed(2); dist = compute(T); render(); }
    function drawOne() {
      let u = Math.random(), i = 0;
      while (i < dist.length - 1 && u >= dist[i]) { u -= dist[i]; i++; }
      counts[i]++; hit = i;
      const tok = i < C.length ? C[i][0] : JUNK[Math.floor(Math.random() * JUNK.length)];
      hist.unshift(tok);
      cont.textContent = tok;
    }
    $('[data-samp-one]', fig).addEventListener('click', () => { drawOne(); render(); });
    $('[data-samp-many]', fig).addEventListener('click', () => { for (let i = 0; i < 20; i++) drawOne(); render(); });
    $('[data-samp-clear]', fig).addEventListener('click', () => { counts.fill(0); hist = []; hit = -1; cont.textContent = ''; render(); });
    temp.addEventListener('input', setT);
    setT();
  })();

  /* ==========================================================================================================
     08 Live network: 2 inputs → n → n → 1, tanh and a sigmoid, trained full-batch with Adam in this page.
     ========================================================================================================== */
  (() => {
    const fig = $('[data-fig="playground"]');
    if (!fig) return;
    const netS = BG.surface($('.play-net', fig)), mapS = BG.surface($('.play-map', fig)), lossS = BG.surface($('.play-loss', fig));
    const runBtn = $('[data-pg-run]', fig), stepEl = $('[data-pg-step]', fig), lossEl = $('[data-pg-loss]', fig), accEl = $('[data-pg-acc]', fig);
    const weightsEl = $('[data-pg-weights]');
    let kind = 'circle', n = 6, lr = 0.01, seed = 1, net, data, steps = 0, loss = NaN, acc = NaN, hist = [], running = false, userRun = false;

    function makeData(name) {
      const r = BG.rng({ circle: 3, xor: 5, spiral: 7, moons: 9 }[name]), pts = [];
      for (let i = 0; i < 200; i++) {
        const c = i % 2;
        let x, y;
        if (name === 'circle') {
          const rad = c ? 0.62 + r() * 0.36 : r() * 0.42, a = r() * Math.PI * 2;
          x = rad * Math.cos(a) + r.n() * 0.03; y = rad * Math.sin(a) + r.n() * 0.03;
        } else if (name === 'xor') {
          do { x = r() * 2 - 1; y = r() * 2 - 1; } while (Math.abs(x) < 0.1 || Math.abs(y) < 0.1);
          pts.push([x * 0.95, y * 0.95, x * y > 0 ? 1 : 0]);
          continue;
        } else if (name === 'spiral') {
          const j = Math.floor(i / 2) / 100, rad = 0.06 + j * 0.92, a = j * 1.75 * Math.PI * 2 + (c ? Math.PI : 0);
          x = rad * Math.sin(a) + r.n() * 0.025; y = rad * Math.cos(a) + r.n() * 0.025;
        } else {
          const a = r() * Math.PI;
          x = c ? 1 - Math.cos(a) : Math.cos(a); y = c ? 0.5 - Math.sin(a) : Math.sin(a);
          x = (x - 0.5) * 0.62 + r.n() * 0.04; y = (y - 0.25) * 0.62 + r.n() * 0.04;
        }
        pts.push([x, y, c]);
      }
      return pts;
    }
    function makeNet() {
      const r = BG.rng(seed * 7919), sizes = [2, n, n, 1];
      const W = [], B = [];
      for (let l = 0; l < 3; l++) {
        const fi = sizes[l], fo = sizes[l + 1], sd = Math.sqrt(2 / (fi + fo));
        W.push(Array.from({ length: fo }, () => Float64Array.from({ length: fi }, () => r.n() * sd)));
        B.push(Float64Array.from({ length: fo }, () => r.n() * 0.1));
      }
      const zeros = () => ({ W: W.map((L) => L.map((row) => new Float64Array(row.length))), B: B.map((b) => new Float64Array(b.length)) });
      return { sizes, W, B, m: zeros(), v: zeros(), t: 0 };
    }
    // Forward pass for one point; fills the hidden activations when asked.
    const h1 = new Float64Array(8), h2 = new Float64Array(8);
    function fwd(x, y) {
      const [W0, W1, W2] = net.W, [B0, B1, B2] = net.B;
      for (let j = 0; j < n; j++) h1[j] = Math.tanh(B0[j] + W0[j][0] * x + W0[j][1] * y);
      for (let j = 0; j < n; j++) { let s = B1[j]; for (let i = 0; i < n; i++) s += W1[j][i] * h1[i]; h2[j] = Math.tanh(s); }
      let s = B2[0];
      for (let i = 0; i < n; i++) s += W2[0][i] * h2[i];
      return 1 / (1 + Math.exp(-s));
    }
    function train(count) {
      const [, W1, W2] = net.W;
      const g = { W: net.W.map((L) => L.map((row) => new Float64Array(row.length))), B: net.B.map((b) => new Float64Array(b.length)) };
      const d2 = new Float64Array(n), d1 = new Float64Array(n);
      for (let c = 0; c < count; c++) {
        g.W.forEach((L) => L.forEach((row) => row.fill(0))); g.B.forEach((b) => b.fill(0));
        let L = 0, ok = 0;
        for (const [x, y, lab] of data) {
          const o = fwd(x, y);
          L -= lab ? Math.log(o + 1e-9) : Math.log(1 - o + 1e-9);
          if ((o > 0.5) === (lab === 1)) ok++;
          const d3 = o - lab;
          g.B[2][0] += d3;
          for (let i = 0; i < n; i++) { g.W[2][0][i] += d3 * h2[i]; d2[i] = d3 * W2[0][i] * (1 - h2[i] * h2[i]); }
          for (let i = 0; i < n; i++) { g.B[1][i] += d2[i]; for (let j = 0; j < n; j++) g.W[1][i][j] += d2[i] * h1[j]; }
          for (let j = 0; j < n; j++) { let s = 0; for (let i = 0; i < n; i++) s += d2[i] * W1[i][j]; d1[j] = s * (1 - h1[j] * h1[j]); }
          for (let j = 0; j < n; j++) { g.B[0][j] += d1[j]; g.W[0][j][0] += d1[j] * x; g.W[0][j][1] += d1[j] * y; }
        }
        // Adam.
        net.t++;
        const N = data.length, b1 = 0.9, b2 = 0.999, c1 = 1 - Math.pow(b1, net.t), c2 = 1 - Math.pow(b2, net.t);
        const upd = (p, gr, mm, vv) => { for (let i = 0; i < p.length; i++) { const gi = gr[i] / N; mm[i] = b1 * mm[i] + (1 - b1) * gi; vv[i] = b2 * vv[i] + (1 - b2) * gi * gi; p[i] -= (lr * (mm[i] / c1)) / (Math.sqrt(vv[i] / c2) + 1e-8); } };
        for (let l = 0; l < 3; l++) { net.W[l].forEach((row, j) => upd(row, g.W[l][j], net.m.W[l][j], net.v.W[l][j])); upd(net.B[l], g.B[l], net.m.B[l], net.v.B[l]); }
        loss = L / N; acc = ok / N; steps++;
        hist.push(loss);
        if (hist.length > 600) hist = hist.filter((_, i) => i % 2 === 0);
      }
    }
    function evalStats() {
      let L = 0, ok = 0;
      for (const [x, y, lab] of data) { const o = fwd(x, y); L -= lab ? Math.log(o + 1e-9) : Math.log(1 - o + 1e-9); if ((o > 0.5) === (lab === 1)) ok++; }
      loss = L / data.length; acc = ok / data.length;
    }

    // Rendering.
    const GM = 50, outCan = document.createElement('canvas'), nCan = document.createElement('canvas');
    outCan.width = outCan.height = GM;
    const NM = 18;
    nCan.width = NM; nCan.height = NM;
    const outVals = new Float32Array(GM * GM);
    const DOM = 1.2;
    const colOut = (p) => mixc(mixc(G, FG, 0.12), mixc(G, EM, 0.4), p);
    function paintOut() {
      const c = outCan.getContext('2d'), img = c.createImageData(GM, GM);
      for (let j = 0; j < GM; j++) for (let i = 0; i < GM; i++) {
        const x = -DOM + ((i + 0.5) / GM) * 2 * DOM, y = DOM - ((j + 0.5) / GM) * 2 * DOM;
        const p = fwd(x, y), q = j * GM + i;
        outVals[q] = p;
        const col = colOut(p);
        img.data[q * 4] = col[0]; img.data[q * 4 + 1] = col[1]; img.data[q * 4 + 2] = col[2]; img.data[q * 4 + 3] = 255;
      }
      c.putImageData(img, 0, 0);
    }
    function paintNeuron(layer, idx) {
      const c = nCan.getContext('2d'), img = c.createImageData(NM, NM);
      for (let j = 0; j < NM; j++) for (let i = 0; i < NM; i++) {
        const x = -DOM + ((i + 0.5) / NM) * 2 * DOM, y = DOM - ((j + 0.5) / NM) * 2 * DOM;
        let v;
        if (layer < 0) v = idx ? y / DOM : x / DOM;
        else if (layer === 2) v = fwd(x, y) * 2 - 1;
        else { fwd(x, y); v = (layer ? h2 : h1)[idx]; }
        const col = v >= 0 ? mixc(G, FG, 0.08 + 0.62 * v) : mixc(G, EM, 0.1 + 0.55 * -v);
        const q = (j * NM + i) * 4;
        img.data[q] = col[0]; img.data[q + 1] = col[1]; img.data[q + 2] = col[2]; img.data[q + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      return nCan;
    }
    function drawMap() {
      if (!mapS.W) return;
      mapS.begin();
      const ctx = mapS.ctx, s = Math.min(mapS.W, mapS.H) - 2, x0 = (mapS.W - s) / 2, y0 = (mapS.H - s) / 2;
      paintOut();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(outCan, x0, y0, s, s);
      // The boundary where the output crosses one half (marching squares).
      const cs = s / GM;
      ctx.beginPath();
      for (let j = 0; j < GM - 1; j++) for (let i = 0; i < GM - 1; i++) {
        const v = [outVals[j * GM + i], outVals[j * GM + i + 1], outVals[(j + 1) * GM + i + 1], outVals[(j + 1) * GM + i]];
        const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => [x0 + (a + 0.5) * cs, y0 + (b + 0.5) * cs]);
        const pts = [];
        for (let e = 0; e < 4; e++) {
          const a = e, b = (e + 1) % 4;
          if ((v[a] > 0.5) !== (v[b] > 0.5)) { const t = (0.5 - v[a]) / (v[b] - v[a]); pts.push([lerp(c[a][0], c[b][0], t), lerp(c[a][1], c[b][1], t)]); }
        }
        if (pts.length >= 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); }
        if (pts.length === 4) { ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); }
      }
      ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.25; ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 1;
      for (const [x, y, lab] of data) {
        const px = x0 + ((x + DOM) / (2 * DOM)) * s, py = y0 + ((DOM - y) / (2 * DOM)) * s;
        ctx.fillStyle = P.ground; ctx.fillRect(px - 3.5, py - 3.5, 7, 7);
        ctx.fillStyle = lab ? P.signal : P.fg; ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
      }
      ctx.strokeStyle = RULE2; ctx.strokeRect(x0 - 0.5, y0 - 0.5, s + 1, s + 1);
    }
    function drawNet() {
      if (!netS.W) return;
      netS.begin();
      const ctx = netS.ctx, W = netS.W, H = netS.H;
      const cols = [W * 0.07, W * 0.37, W * 0.67, W * 0.93], sizes = [2, n, n, 1];
      const top = 22, avail = H - top - 6;
      const ns = Math.min(34, (avail / Math.max(...sizes)) * 0.72);
      const pos = sizes.map((cnt, l) => Array.from({ length: cnt }, (_, i) => [cols[l], top + (i + 0.5) * (avail / cnt)]));
      ['Inputs', 'Layer 1', 'Layer 2', 'Out'].forEach((nm, l) => d.label(ctx, nm, cols[l], 9, 9, P.fg3, l === 0 ? 'left' : l === 3 ? 'right' : 'center'));
      // Weights: thickness for size, bone for positive, dark red for negative.
      let wmax = 1e-6;
      net.W.forEach((L) => L.forEach((row) => row.forEach((w) => { wmax = Math.max(wmax, Math.abs(w)); })));
      for (let l = 0; l < 3; l++) net.W[l].forEach((row, j) => row.forEach((w, i) => {
        const a = pos[l][i], b = pos[l + 1][j], r = Math.min(1, Math.abs(w) / wmax);
        ctx.globalAlpha = 0.2 + 0.7 * r; ctx.strokeStyle = w >= 0 ? P.fg : P.ember; ctx.lineWidth = 0.4 + 2.8 * r;
        d.line(ctx, a[0] + (l === 0 ? ns / 2 : ns / 2), a[1], b[0] - ns / 2, b[1]);
      }));
      ctx.globalAlpha = 1; ctx.lineWidth = 1;
      ctx.imageSmoothingEnabled = true;
      pos.forEach((col, l) => col.forEach(([x, y], i) => {
        const c = paintNeuron(l === 0 ? -1 : l === 3 ? 2 : l - 1, i);
        const left = l === 0 ? x : l === 3 ? x - ns : x - ns / 2;
        ctx.drawImage(c, left, y - ns / 2, ns, ns);
        ctx.strokeStyle = P.facet; ctx.strokeRect(left - 0.5, y - ns / 2 - 0.5, ns + 1, ns + 1);
        if (l === 0) d.label(ctx, i ? 'y' : 'x', left + ns + 4, y - ns / 2 + 6, 9, P.fg3);
      }));
    }
    function drawLoss() {
      if (!lossS.W) return;
      lossS.begin();
      const ctx = lossS.ctx, W = lossS.W, H = lossS.H;
      d.label(ctx, 'Loss', 0, 8, 9, P.fg3);
      ctx.strokeStyle = RULE; d.line(ctx, 0, H - 1, W, H - 1);
      if (hist.length < 2) { d.label(ctx, 'Press Train', W, 8, 9, P.fg3, 'right'); return; }
      const lo = Math.log(Math.min(0.01, ...hist)), hi = Math.log(Math.max(0.8, ...hist));
      const Y = (v) => 16 + (1 - (Math.log(v) - lo) / (hi - lo)) * (H - 20);
      ctx.strokeStyle = P.fg; ctx.lineWidth = 1.25; ctx.beginPath();
      hist.forEach((v, i) => { const x = (i / (hist.length - 1)) * (W - 8); if (i) ctx.lineTo(x, Y(v)); else ctx.moveTo(x, Y(v)); });
      ctx.stroke(); ctx.lineWidth = 1;
      d.sq(ctx, W - 8, Y(hist[hist.length - 1]), 6, P.signal);
      d.label(ctx, 'Log scale', W, 8, 9, P.fg3, 'right');
    }
    function stats() {
      stepEl.textContent = steps.toLocaleString('en-NZ');
      lossEl.textContent = !Number.isFinite(loss) ? '–' : loss < 0.001 ? '<0.001' : loss.toFixed(3);
      accEl.textContent = Number.isFinite(acc) ? `${Math.round(acc * 100)}%` : '–';
    }
    function renderAll() { drawMap(); drawNet(); drawLoss(); stats(); }
    mapS.redraw = drawMap; netS.redraw = drawNet; lossS.redraw = drawLoss;
    BG.onFonts(renderAll);
    const frame = () => { train(6); renderAll(); };
    function setRunning(on) {
      if (on === running) return;
      running = on;
      runBtn.setAttribute('aria-pressed', String(on));
      runBtn.textContent = on ? 'Pause' : 'Train';
      if (on) BG.play(frame); else BG.pause(frame);
    }
    function reset() {
      net = makeNet(); data = makeData(kind); steps = 0; hist = [];
      evalStats();
      weightsEl.textContent = String(n * n + 5 * n + 1);
      renderAll();
    }
    runBtn.addEventListener('click', () => { userRun = !running; setRunning(!running); });
    $('[data-pg-one]', fig).addEventListener('click', () => { train(1); renderAll(); });
    $('[data-pg-reset]', fig).addEventListener('click', () => { seed++; reset(); });
    seg($('[data-pg-data]', fig), (b) => { kind = b.dataset.v; reset(); });
    seg($('[data-pg-n]', fig), (b) => { n = +b.dataset.v; reset(); });
    seg($('[data-pg-lr]', fig), (b) => { lr = parseFloat(b.dataset.v); });
    BG.watch(fig, (v) => { if (!v) setRunning(false); else if (userRun) setRunning(true); });
    reset();
  })();

  /* ==========================================================================================================
     09 Superposition explorer: n features in two neurons.
     ========================================================================================================== */
  (() => {
    const fig = $('[data-fig="superposition"]');
    if (!fig) return;
    const NAMES = ['Golden Gate', 'DNA', 'Sarcasm', 'Base64', 'French', 'Code error', 'Rhyme'];
    const S = BG.surface($('.sp-canvas', fig));
    const feats = $('[data-sp-feats]', fig), note = $('[data-sp-note]', fig), meta = $('[data-sp-meta]', fig);
    let n = 5, on = [1, 0, 0, 0, 0], shownOn = on.slice(), shownH = BG.sp.hidden(5, on);
    function draw() {
      if (!S.W) return;
      S.begin();
      const ctx = S.ctx, W = S.W, H = S.H, pr = W / H < 1.15, ls = clamp(W / 60, 10, 12);
      const pb = pr ? [0, 0, W, H * 0.56] : [0, 0, W * 0.5, H];
      const rb = pr ? [4, H * 0.62, W - 8, H * 0.36] : [W * 0.54, H * 0.14, W * 0.45, H * 0.72];
      BG.sp.plane(ctx, pb[0], pb[1], pb[2], pb[3], n, NAMES.slice(0, n), shownOn, shownH, ls, { unit: 0.55 });
      ctx.globalAlpha = 1;
      BG.sp.rows(ctx, rb[0], rb[1], rb[2], rb[3], n, NAMES.slice(0, n), on, BG.sp.read(n, shownH), ls);
    }
    S.redraw = draw;
    BG.onFonts(draw);
    function explain() {
      const act = on.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
      const read = BG.sp.read(n, BG.sp.hidden(n, on));
      const wrong = read.map((r, i) => ((r > 0.02) !== (on[i] > 0.5) ? NAMES[i] : null)).filter(Boolean);
      if (!act.length) return 'All features off. Switch one on.';
      if (!wrong.length) return act.length === 1 ? `One feature on: ${NAMES[act[0]]} reads back cleanly and the others stay silent.` : `${act.length} features on and all read back correctly${act.length === 2 ? ': they are neighbours, so they barely interfere' : ''}.`;
      return `Interference: ${wrong.join(', ')} ${wrong.length > 1 ? 'read' : 'reads'} back wrong. ${n} features share 2 neurons, which only works while few are active at once.`;
    }
    function build() {
      feats.innerHTML = NAMES.slice(0, n).map((nm, i) => `<button type="button" aria-pressed="${on[i] ? 'true' : 'false'}" data-i="${i}">${nm}</button>`).join('');
      meta.textContent = `${n} features · 2 neurons`;
    }
    function go() {
      const fromOn = shownOn.slice(), fromH = shownH.slice(), toH = BG.sp.hidden(n, on);
      note.textContent = explain();
      $$('button', feats).forEach((b, i) => b.setAttribute('aria-pressed', String(!!on[i])));
      tween(0.22, (e) => {
        const x = expo(e);
        shownOn = on.map((v, i) => lerp(fromOn[i] || 0, v, x));
        shownH = [lerp(fromH[0], toH[0], x), lerp(fromH[1], toH[1], x)];
        draw();
      });
    }
    feats.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i; on[i] = on[i] ? 0 : 1; go(); });
    seg($('[data-sp-n]', fig), (b) => { n = +b.dataset.v; on = Array(n).fill(0); on[0] = 1; shownOn = on.slice(); shownH = BG.sp.hidden(n, on); build(); go(); });
    $('[data-sp-clear]', fig).addEventListener('click', () => { on = Array(n).fill(0); go(); });
    build();
    note.textContent = explain();
    draw();
  })();

  /* ==========================================================================================================
     10 The mystery drawings. Each draw(ctx, W, H, t) shows the finished picture at t = period.
     ========================================================================================================== */
  const ax = (ctx, x0, y0, x1, y1, xl, yl) => {
    ctx.strokeStyle = RULE2; ctx.lineWidth = 1;
    d.line(ctx, x0, y0, x0, y1); d.line(ctx, x0, y1, x1, y1);
    d.label(ctx, yl, x0 + 6, y0 + 4, 9, P.fg3);
    d.label(ctx, xl, x1, y1 + 11, 9, P.fg3, 'right');
  };
  function curve(ctx, f, x0, y0, x1, y1, upto, color, width = 1.5, dash = null) {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    const N = 80;
    for (let i = 0; i <= N * upto; i++) { const u = i / N, x = lerp(x0, x1, u), y = lerp(y1, y0, f(u)); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
  }
  const GLYPHS = {
    features: {
      period: 5,
      draw(ctx, W, H, t) {
        const cur = Math.floor(t) % 5, cx = W * 0.19, cy = H * 0.5, r = Math.min(W * 0.13, H * 0.3);
        const dirs = BG.sp.dirs(5);
        ctx.strokeStyle = RULE; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        dirs.forEach((w, i) => { ctx.globalAlpha = i === cur ? 1 : 0.3; ctx.strokeStyle = P.fg; ctx.lineWidth = i === cur ? 2 : 1; d.arrow(ctx, cx, cy, cx + w[0] * r, cy - w[1] * r, 5); });
        ctx.globalAlpha = 1; ctx.lineWidth = 1;
        d.label(ctx, '2 neurons', cx, H - 12, 9, P.fg3, 'center');
        const n = 24, x0 = W * 0.42, x1 = W * 0.95, cs = (x1 - x0) / n, lit = [3, 9, 14, 19, 22][cur];
        ctx.globalAlpha = 0.55; ctx.strokeStyle = P.signal;
        d.line(ctx, cx + dirs[cur][0] * r, cy - dirs[cur][1] * r, x0 + (lit + 0.5) * cs, cy - cs / 2 - 2);
        ctx.globalAlpha = 1;
        for (let i = 0; i < n; i++) { ctx.fillStyle = i === lit ? P.signal : 'rgba(241,238,230,.12)'; ctx.fillRect(x0 + i * cs + 1, cy - cs / 2, cs - 2, cs - 2); }
        d.label(ctx, 'Many features, few active', x0, H - 12, 9, P.fg3);
      },
    },
    scale: {
      period: 3,
      draw(ctx, W, H, t) {
        const x0 = 26, y0 = 14, x1 = W - 12, y1 = H - 22;
        ax(ctx, x0, y0, x1, y1, 'Compute (log)', 'Loss (log)');
        for (let i = 1; i < 4; i++) { ctx.strokeStyle = RULE; d.line(ctx, lerp(x0, x1, i / 4), y1, lerp(x0, x1, i / 4), y1 - 4); d.line(ctx, x0, lerp(y0, y1, i / 4), x0 + 4, lerp(y0, y1, i / 4)); }
        const pts = Array.from({ length: 9 }, (_, i) => { const u = 0.08 + i * 0.105; return [u, 0.86 - 0.74 * u + Math.sin(i * 2.3) * 0.018]; });
        pts.forEach(([u, v], i) => { const a = expo(k(t, i * 0.22, i * 0.22 + 0.2)); if (a > 0) { ctx.globalAlpha = a; d.sq(ctx, lerp(x0, x1, u), lerp(y1, y0, v), 6, P.fg); } });
        const ln = expo(k(t, 2.1, 2.8));
        ctx.globalAlpha = 1;
        if (ln > 0) curve(ctx, (u) => 0.9 - 0.74 * u, x0, y0, x1, y1, ln, P.signal, 1.25, [4, 4]);
        if (ln > 0.9) d.label(ctx, 'A straight line: a power law', lerp(x0, x1, 0.42), lerp(y1, y0, 0.86), 9, P.fg, 'left');
      },
    },
    emergence: {
      period: 3,
      draw(ctx, W, H, t) {
        const x0 = 26, y0 = 14, x1 = W - 12, y1 = H - 22, u = expo(k(t, 0, 2.6));
        ax(ctx, x0, y0, x1, y1, 'Model size (log)', 'Score');
        curve(ctx, (x) => 0.05 + 0.72 * Math.pow(x, 1.4), x0, y0, x1, y1, u, P.fg3, 1.25, [3, 4]);
        curve(ctx, (x) => 0.03 + 0.8 / (1 + Math.exp(-(x - 0.7) * 26)), x0, y0, x1, y1, u, P.fg, 2);
        if (u > 0.95) { d.label(ctx, 'All-or-nothing score', lerp(x0, x1, 0.22), lerp(y1, y0, 0.12), 9, P.fg); d.label(ctx, 'Partial credit', lerp(x0, x1, 0.5), lerp(y1, y0, 0.5), 9, P.fg3); }
      },
    },
    generalise: {
      period: 3,
      draw(ctx, W, H, t) {
        const x0 = 26, y0 = 14, x1 = W - 12, y1 = H - 22, u = expo(k(t, 0, 2.6)), th = 0.42;
        ax(ctx, x0, y0, x1, y1, 'Model size', 'Error');
        ctx.strokeStyle = RULE2; ctx.setLineDash([2, 3]); d.line(ctx, lerp(x0, x1, th), y0 + 10, lerp(x0, x1, th), y1); ctx.setLineDash([]);
        curve(ctx, (x) => 0.6 * Math.pow(Math.max(0, 1 - x / th), 1.5), x0, y0, x1, y1, u, P.fg3, 1.25);
        curve(ctx, (x) => 0.5 * Math.exp(-4.2 * x) + 0.55 * Math.exp(-((x - th) ** 2) / 0.0035) + 0.18 - 0.1 * x, x0, y0, x1, y1, u, P.signal, 2);
        if (u > 0.95) { d.label(ctx, 'Fits every example', lerp(x0, x1, th) + 6, y0 + 10, 9, P.fg2); d.label(ctx, 'Test', x1, lerp(y1, y0, 0.2), 9, P.fg, 'right'); d.label(ctx, 'Train', lerp(x0, x1, 0.3), y1 - 8, 9, P.fg3, 'right'); }
      },
    },
    grokking: {
      period: 3.5,
      draw(ctx, W, H, t) {
        const x0 = 26, y0 = 14, x1 = W - 12, y1 = H - 22, u = k(t, 0, 3.1);
        ax(ctx, x0, y0, x1, y1, 'Training steps (log)', '100%');
        curve(ctx, (x) => 1 / (1 + Math.exp(-(x - 0.2) * 32)), x0, y0, x1, y1, u, P.fg3, 1.5);
        curve(ctx, (x) => 0.04 + 0.96 / (1 + Math.exp(-(x - 0.74) * 34)), x0, y0, x1, y1, u, P.signal, 2);
        if (u > 0.3) d.label(ctx, 'Train: memorised', lerp(x0, x1, 0.4), y0 + 16, 9, P.fg3);
        if (u > 0.95) d.label(ctx, 'Test: suddenly right', x1, lerp(y1, y0, 0.55), 9, P.fg, 'right');
      },
    },
    icl: {
      period: 3,
      draw(ctx, W, H, t) {
        const words = ['Golden', 'Gate', '…', 'Golden', '?'], y = H * 0.68;
        const xs = words.map((_, i) => lerp(W * 0.12, W * 0.88, i / 4));
        const arc = expo(k(t, 0.5, 1.4)), ans = expo(k(t, 1.7, 2.0));
        const p = [xs[3], y - 16, xs[3], y - 16 - H * 0.42, xs[1], y - 16 - H * 0.42, xs[1], y - 16];
        ctx.strokeStyle = P.signal; ctx.lineWidth = 1.75;
        if (arc > 0) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); const N = 30; for (let i = 1; i <= N * arc; i++) { const s = i / N, q = 1 - s; ctx.lineTo(q * q * q * p[0] + 3 * q * q * s * p[2] + 3 * q * s * s * p[4] + s * s * s * p[6], q * q * q * p[1] + 3 * q * q * s * p[3] + 3 * q * s * s * p[5] + s * s * s * p[7]); } ctx.stroke(); }
        ctx.lineWidth = 1;
        words.forEach((w, i) => {
          if (i === 4) {
            if (ans < 1) d.chip(ctx, '?', xs[i], y, 11, { align: 'center', upper: false, alpha: 1 - ans, frame: RULE2 });
            if (ans > 0) d.chip(ctx, 'Gate', xs[i], y, 11, { align: 'center', upper: false, alpha: ans, frame: P.signal });
          } else d.chip(ctx, w, xs[i], y, 11, { align: 'center', upper: false, frame: i === 3 || (i === 1 && arc > 0.9) ? P.fg : RULE2 });
        });
        d.label(ctx, 'Seen once, copied next time', W * 0.12, H - 10, 9, P.fg3);
      },
    },
    faithful: {
      period: 3,
      draw(ctx, W, H, t) {
        const a = [W * 0.14, H * 0.55], top = [W * 0.48, H * 0.36], bot = [W * 0.48, H * 0.76], out = [W * 0.86, H * 0.56], said = [W * 0.6, H * 0.12];
        ctx.strokeStyle = RULE2; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(a[0], a[1] - 14); ctx.quadraticCurveTo(a[0] + 30, said[1], said[0] - 46, said[1]); ctx.stroke(); ctx.setLineDash([]);
        d.chip(ctx, 'Says: carried the 1', said[0], said[1], 9, { align: 'left', frame: RULE2, color: P.fg2 });
        ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.6;
        [[a, top], [top, out], [a, bot], [bot, out]].forEach(([p, q]) => d.line(ctx, p[0], p[1], q[0], q[1]));
        ctx.globalAlpha = 1;
        const lp = (p, q, s) => [lerp(p[0], q[0], s), lerp(p[1], q[1], s)];
        [[a, top, out], [a, bot, out]].forEach(([p, q, r], j) => {
          const s = ((t * 0.9 + j * 0.37) % 1) * 2, pt = s < 1 ? lp(p, q, s) : lp(q, r, s - 1);
          if (t < 3) d.sq(ctx, pt[0], pt[1], 5, P.fg);
        });
        d.chip(ctx, '36 + 59', a[0], a[1], 10, { align: 'center', upper: false, frame: P.fg });
        d.chip(ctx, 'Rough size', top[0], top[1], 9, { align: 'center' });
        d.chip(ctx, 'Last digit 5', bot[0], bot[1], 9, { align: 'center' });
        d.chip(ctx, '95', out[0], out[1], 11, { align: 'center', upper: false, frame: P.signal });
      },
    },
    hallucinate: {
      period: 4.8,
      draw(ctx, W, H, t) {
        const c = Math.min(2, Math.floor(t / 1.6));
        const name = ['Michael Jordan', 'Michael Batkin', 'A name that feels familiar'][c];
        const outT = ['Answers: basketball', 'Says it does not know', 'Makes something up'][c];
        const known = [1, 0, 1][c], cant = [0, 1, 0][c];
        const nm = [W * 0.04, H * 0.5], kn = [W * 0.5, H * 0.24], ca = [W * 0.5, H * 0.74], ou = [W * 0.97, H * 0.5];
        ctx.strokeStyle = P.fg;
        ctx.globalAlpha = known ? 0.8 : 0.2; d.line(ctx, nm[0] + 80, nm[1], kn[0] - 40, kn[1]);
        ctx.globalAlpha = cant ? 0.8 : 0.2; d.line(ctx, ca[0] + 40, ca[1], ou[0] - 90, ou[1]);
        ctx.globalAlpha = known ? 0.9 : 0.2; ctx.strokeStyle = c === 2 ? P.signal : P.fg;
        d.line(ctx, kn[0], kn[1] + 12, ca[0], ca[1] - 16); d.line(ctx, ca[0] - 7, ca[1] - 16, ca[0] + 7, ca[1] - 16);
        ctx.globalAlpha = 1;
        d.label(ctx, 'Off', kn[0] - 8, (kn[1] + ca[1]) / 2, 9, P.fg3, 'right');
        d.chip(ctx, name, nm[0], nm[1], 9, { align: 'left', upper: false, frame: P.fg });
        d.chip(ctx, 'Known name', kn[0], kn[1], 9, { align: 'center', frame: known ? (c === 2 ? P.signal : P.fg) : RULE, color: known ? P.fg : P.fg3 });
        d.chip(ctx, 'Can’t answer', ca[0], ca[1], 9, { align: 'center', frame: cant ? P.fg : RULE, color: cant ? P.fg : P.fg3 });
        d.chip(ctx, outT, ou[0], ou[1], 9, { align: 'right', frame: c === 2 ? P.signal : P.fg });
      },
    },
    introspect: {
      period: 5.5,
      draw(ctx, W, H, t) {
        const n = 5, gap = 8, pw = (W - 16 - gap * (n - 1)) / n, ph = H * 0.56, y0 = 12;
        const seen = 2;
        for (let i = 0; i < n; i++) {
          const a = expo(k(t, i * 0.9, i * 0.9 + 0.3));
          if (a <= 0) continue;
          const x0 = 8 + i * (pw + gap);
          ctx.globalAlpha = a;
          ctx.strokeStyle = RULE; ctx.strokeRect(x0 + 0.5, y0 + 0.5, pw - 1, ph - 1);
          ctx.fillStyle = P.fg;
          for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) { ctx.globalAlpha = a * 0.22; ctx.fillRect(x0 + (q + 0.5) * (pw / 5) - 1, y0 + (r + 0.5) * (ph / 4) - 1, 2, 2); }
          const ix = x0 + pw * (0.25 + 0.5 * ((i * 0.37) % 1)), iy = y0 + ph * (0.3 + 0.4 * ((i * 0.61) % 1));
          ctx.globalAlpha = a; d.sq(ctx, ix, iy, 7, P.signal);
          if (i === seen) { ctx.strokeStyle = P.fg; d.brackets(ctx, x0 - 3, y0 - 3, pw + 6, ph + 6, 7); }
          d.label(ctx, i === seen ? 'Noticed' : 'Missed', x0 + pw / 2, y0 + ph + 12, 9, i === seen ? P.fg : P.fg3, 'center');
        }
        ctx.globalAlpha = 1;
        if (t > n * 0.9) d.label(ctx, 'Noticed 1 of 5: about 20% with the best method', 8, H - 10, 9, P.fg2);
      },
    },
  };
  $$('.glyph[data-glyph]').forEach((btn) => {
    const g = GLYPHS[btn.dataset.glyph];
    if (!g) return;
    const S = BG.surface($('canvas', btn)), card = btn.closest('.card');
    let t = g.period, on = false, engaged = false;
    const render = () => { if (!S.W) return; S.begin(); g.draw(S.ctx, S.W, S.H, Math.min(t, g.period)); S.ctx.globalAlpha = 1; };
    S.redraw = render;
    // Play through, hold the finished frame briefly, loop while engaged; once let go, finish and rest.
    const frame = (dt) => {
      t += dt;
      if (t >= g.period + 0.9) { if (engaged) t = 0; else { t = g.period; stop(); return; } }
      render();
    };
    const start = () => { if (on) return; on = true; if (t >= g.period) t = 0; card.classList.add('is-on'); BG.play(frame); };
    function stop() { on = false; BG.pause(frame); card.classList.remove('is-on'); render(); }
    card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !BG.reduced()) { engaged = true; start(); } });
    card.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') engaged = false; });
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible') && !BG.reduced()) { engaged = true; start(); } });
    btn.addEventListener('blur', () => { engaged = false; });
    btn.addEventListener('click', () => { if (on && engaged) engaged = false; else { engaged = true; start(); } });
    BG.watch(card, (v) => { if (!v && on) { engaged = false; t = g.period; stop(); } });
    BG.onFonts(render);
    render();
  });

  /* ==========================================================================================================
     Chapter plates: a film chapter at its still, playable in place.
     ========================================================================================================== */
  $$('[data-plate]').forEach((fig) => {
    if (!BG.film) return;
    const i = +fig.dataset.plate, sc = BG.film.scenes[i];
    const S = BG.surface($('.plate-canvas', fig)), btn = $('[data-plate-play]', fig);
    let t = sc.poster, on = false;
    const render = () => { if (!S.W) return; S.begin(); BG.film.drawScene(i, BG.film.mkG(S.ctx, S.W, S.H), t); };
    S.redraw = render;
    const frame = (dt) => { t += dt; if (t > sc.dur) t = 0; render(); };
    const set = (v) => {
      on = v;
      btn.setAttribute('aria-pressed', String(v));
      btn.textContent = v ? 'Pause' : 'Play chapter';
      if (v) BG.play(frame); else BG.pause(frame);
    };
    btn.addEventListener('click', () => set(!on));
    BG.watch(fig, (v) => { if (!v && on) set(false); });
    BG.onFonts(render);
    render();
  });
})();
