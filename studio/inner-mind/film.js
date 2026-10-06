/* Through Black Glass: the film. Ten chapters, about two minutes, one canvas.
   render(t) is pure: each frame is computed from the time alone plus fixed, seeded data, so playing, scrubbing,
   jumping to a chapter, the chapter plates in the field guide and the reduced-motion stills all use one function.
   Scene changes take 0.6 s: the outgoing scene loads out, zooming a little as if the camera passes through it,
   and the incoming scene drives in behind it, so two scenes never double-expose. The film plays while at least half of it is on screen and the tab is
   visible, and never starts on its own when reduced motion is requested. */
(() => {
  'use strict';
  const { m, d, P } = BG;
  const { clamp, lerp, k, expo, load, quart, pulse } = m;
  const TAU = Math.PI * 2;
  const RULE2 = 'rgba(241,238,230,.38)';

  /* ---- Shared data: one prompt runs through the whole film ---- */
  const PROMPT = ['The', ' capital', ' of', ' the', ' state', ' containing', ' Dallas', ' is'];
  const IDS = [791, 6864, 315, 279, 1614, 8649, 19051, 374]; // illustrative
  const VEC = (() => { const r = BG.rng(7); return PROMPT.map(() => Array.from({ length: 16 }, () => clamp(r.n() * 0.55, -1, 1))); })();
  const gelu = (z) => 0.5 * z * (1 + Math.tanh(0.7978845608 * (z + 0.044715 * z * z * z)));

  /* Vector cells: bone for positive values, ember for negative, opacity by size. */
  function cell(ctx, x, y, s, v, a = 1) {
    ctx.globalAlpha = a * (0.14 + 0.86 * Math.min(1, Math.abs(v)));
    ctx.fillStyle = v >= 0 ? P.fg : P.ember;
    ctx.fillRect(x, y, s, s);
  }
  /* Cubic Bézier helpers: point at s, and a stroke from 0 to s. */
  const bz = (p, s) => {
    const u = 1 - s;
    return [u * u * u * p[0] + 3 * u * u * s * p[2] + 3 * u * s * s * p[4] + s * s * s * p[6], u * u * u * p[1] + 3 * u * u * s * p[3] + 3 * u * s * s * p[5] + s * s * s * p[7]];
  };
  function bzStroke(ctx, p, s) {
    if (s <= 0) return;
    ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    if (s >= 1) { ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]); ctx.stroke(); return; }
    const n = Math.max(2, Math.ceil(28 * s));
    for (let i = 1; i <= n; i++) { const q = bz(p, (i / n) * s); ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
  }
  /* Projects a 3-D point: yaw about the vertical axis, pitch about the horizontal, gentle perspective. */
  function proj(p, yaw, pitch, cx, cy, S, cam = 3.2) {
    const cyw = Math.cos(yaw), syw = Math.sin(yaw);
    const x = p[0] * cyw + p[2] * syw, z = -p[0] * syw + p[2] * cyw;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const y = p[1] * cp - z * sp, z2 = p[1] * sp + z * cp;
    const f = cam / (cam + z2);
    return [cx + x * S * f, cy + y * S * f, z2, f];
  }
  /* A step readout: an uppercase label followed by a code fragment in its own case. */
  function readout(ctx, x, y, lab, code, ls, color = P.fg) {
    d.label(ctx, lab, x, y, ls, color);
    if (code) { const w = d.labelW(ctx, lab, ls); d.code(ctx, code, x + w + ls * 0.6, y, ls * 1.02, P.fg2); }
  }
  /* Greedy label placement: nudges a label up or down a line at a time until it clears the boxes already placed.
     Returns the y to draw at, or null when every slot is taken. */
  function placer() {
    const boxes = [];
    const free = (b) => !boxes.some((o) => b[0] < o[0] + o[2] && b[0] + b[2] > o[0] && b[1] < o[1] + o[3] && b[1] + b[3] > o[1]);
    const api = (x, y, w, h, tries = [0, 1, -1, 2, -2]) => {
      for (const s of tries) {
        const yy = y + s * (h + 2), b = [x, yy - h / 2, w, h];
        if (free(b)) { boxes.push(b); return yy; }
      }
      return null;
    };
    api.block = (x, y, w, h) => boxes.push([x, y, w, h]);
    return api;
  }

  /* =========================================================================================================
     01 AGENT: a model in a loop. READ → THINK → ACT → OBSERVE, tools on the diagonals, a context window that
     fills, and two sub-agents with loops of their own.
     ========================================================================================================= */
  const TOOLS = ['Files', 'Search', 'Shell', 'Editor'];
  const TOOL_A = [-0.75 * Math.PI, -0.25 * Math.PI, 0.25 * Math.PI, 0.75 * Math.PI];
  const STEPS = [
    { s: 1.4, tool: 2, n: '01', call: 'run("tests")', res: '1 failed' },
    { s: 4.0, tool: 0, n: '02', call: 'read_file("parser.ts")', res: '212 lines' },
    { s: 10.2, tool: 3, n: '04', call: 'edit_file("parser.ts")', res: 'tests pass' },
  ];
  const SA = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // stations: read, think, act, observe
  const PK = (() => {
    const out = [[0, SA[0]]];
    const step = (s) => out.push([s, SA[0]], [s + 0.4, 0], [s + 0.8, 0], [s + 1.1, SA[2]], [s + 1.85, SA[2]], [s + 2.3, SA[3]], [s + 2.6, 1.5 * Math.PI]);
    step(1.4); step(4.0);
    out.push([6.6, SA[0]], [7.0, 0], [7.3, SA[2]], [9.6, SA[2]], [9.9, SA[3]], [10.2, 1.5 * Math.PI]);
    step(10.2);
    out.push([12.8, SA[0]], [13.1, 0]);
    return out;
  })();
  const THINK = [[1.8, 2.2], [4.4, 4.8], [7.0, 7.35], [10.6, 11.0], [13.1, 13.8]];
  // Context events: [time, cells, kind]; kind 0 model text, 1 tool call, 2 tool result.
  const CTX = [[1.35, 6, 0], [2.0, 1, 0], [2.5, 1, 1], [3.7, 3, 2], [4.6, 1, 0], [5.1, 1, 1], [6.3, 9, 2], [7.1, 1, 0], [7.3, 1, 1], [9.75, 4, 2], [10.8, 1, 0], [11.3, 1, 1], [12.5, 1, 2], [13.25, 2, 0]];
  function pulseAngle(t) {
    let i = 0;
    while (i < PK.length - 1 && PK[i + 1][0] <= t) i++;
    if (i >= PK.length - 1) return PK[PK.length - 1][1];
    const [t0, a0] = PK[i], [t1, a1] = PK[i + 1];
    let da = a1 - a0;
    while (da > Math.PI) da -= TAU;
    while (da < -Math.PI) da += TAU;
    return a0 + da * load(k(t, t0, t1));
  }
  function agentReadout(t) {
    const ph = (st) => {
      const x = t - st.s;
      if (x < 0.4) return [`Step ${st.n} · read`, ''];
      if (x < 1.1) return [`Step ${st.n} · think`, ''];
      if (x < 1.85) return [`Step ${st.n} · act ·`, st.call];
      return [`Step ${st.n} · observe ·`, st.res];
    };
    if (t < 1.4) return ['A task arrives', ''];
    if (t < 4.0) return ph(STEPS[0]);
    if (t < 6.6) return ph(STEPS[1]);
    if (t < 7.0) return ['Step 03 · think', ''];
    if (t < 9.6) return ['Step 03 · act ·', 'delegate(2 sub-agents)'];
    if (t < 10.2) return ['Step 03 · observe ·', '2 summaries'];
    if (t < 12.8) return ph(STEPS[2]);
    return ['Step 05 · answer', ''];
  }

  function sAgent(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const cx = W / 2, cy = H * (pr ? 0.4 : 0.45);
    const R = Math.min(W * (pr ? 0.085 : 0.058), H * 0.095);
    const RL = R * 2.05;
    const rx = pr ? W * 0.39 : Math.min(W * 0.33, H * 0.62), ry = pr ? H * 0.25 : H * 0.33;
    const ring = (a, r = RL) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const TP = TOOL_A.map((a) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    const SUB = pr ? [[cx - W * 0.2, cy + RL + H * 0.15], [cx + W * 0.2, cy + RL + H * 0.15]] : [[cx - RL * 2.4, cy], [cx + RL * 2.4, cy]];
    // Sub-agent connectors start clear of the station labels.
    const subFrom = pr ? [[cx - 8, cy + RL + 26], [cx + 8, cy + RL + 26]]
      : [[cx - RL - 23 - d.labelW(ctx, 'Observe', ls), cy], [cx + RL + 23 + d.labelW(ctx, 'Think', ls), cy]];
    ctx.lineWidth = 1;

    // Faint radial connectors from the loop to each tool.
    ctx.strokeStyle = P.fg;
    TOOL_A.forEach((a, i) => { ctx.globalAlpha = 0.08; const [x0, y0] = ring(a); d.line(ctx, x0, y0, TP[i][0], TP[i][1]); });
    // Calls light their connector while they run.
    STEPS.forEach((st) => {
      const on = pulse(t, st.s + 1.1, st.s + 2.3);
      if (on <= 0) return;
      const a = TOOL_A[st.tool], [x0, y0] = ring(a);
      ctx.globalAlpha = 0.6 * on; ctx.strokeStyle = P.fg; d.line(ctx, x0, y0, TP[st.tool][0], TP[st.tool][1]);
    });

    // The loop and its direction.
    ctx.globalAlpha = 0.24; ctx.strokeStyle = P.fg;
    ctx.beginPath(); ctx.arc(cx, cy, RL, 0, TAU); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 4 + (i * Math.PI) / 2, [x, y] = ring(a);
      ctx.globalAlpha = 0.45; d.head(ctx, x, y, a + Math.PI / 2, 5);
    }

    // The model: a black-glass octagon with one lit facet; its outline turns crimson while it thinks.
    const think = THINK.reduce((acc, [a, b]) => Math.max(acc, pulse(t, a, b)), 0);
    ctx.globalAlpha = 1;
    d.octagon(ctx, cx, cy, R); ctx.fillStyle = P.pane; ctx.fill();
    ctx.strokeStyle = P.facet; ctx.stroke();
    if (think > 0.01) { ctx.globalAlpha = think; ctx.strokeStyle = P.signal; ctx.lineWidth = 1.5; d.octagon(ctx, cx, cy, R); ctx.stroke(); ctx.lineWidth = 1; }
    const v4 = (i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
    ctx.globalAlpha = 0.6; ctx.strokeStyle = P.fg; ctx.lineWidth = 1.5;
    d.line(ctx, ...v4(4), ...v4(5)); ctx.lineWidth = 1;
    // Activity inside: a 4 x 4 grid of units that flickers while the model thinks.
    const gs = R * 0.17;
    for (let i = 0; i < 16; i++) {
      const gx = cx + ((i % 4) - 1.5) * gs * 1.9, gy = cy - R * 0.18 + (Math.floor(i / 4) - 1.5) * gs * 1.9;
      ctx.globalAlpha = 0.1 + 0.65 * think * (0.5 + 0.5 * Math.sin(t * 9 + i * 1.7));
      ctx.fillStyle = P.fg; ctx.fillRect(gx - gs / 2, gy - gs / 2, gs, gs);
    }
    ctx.globalAlpha = 1;
    d.label(ctx, 'Model', cx, cy + R * 0.58, ls * 0.82, P.fg3, 'center');

    // Stations.
    const pa = pulseAngle(t);
    const near = (a) => { let x = Math.abs((((pa - a) % TAU) + TAU) % TAU); x = Math.min(x, TAU - x); return x < 0.12; };
    ['Read', 'Think', 'Act', 'Observe'].forEach((nm, i) => {
      const [x, y] = ring(SA[i]), on = near(SA[i]);
      ctx.globalAlpha = 1; d.sq(ctx, x, y, 5, on ? P.fg : P.fg3);
      const off = 13;
      if (i === 0) d.label(ctx, nm, x, y - off, ls, on ? P.fg : P.fg3, 'center');
      if (i === 1) d.label(ctx, nm, x + off, y, ls, on ? P.fg : P.fg3, 'left');
      if (i === 2) d.label(ctx, nm, x, y + off + 1, ls, on ? P.fg : P.fg3, 'center');
      if (i === 3) d.label(ctx, nm, x - off, y, ls, on ? P.fg : P.fg3, 'right');
    });

    // Tools: chips; the one in use gets registration brackets.
    const toolOn = TOOLS.map(() => 0);
    STEPS.forEach((st) => { toolOn[st.tool] = Math.max(toolOn[st.tool], pulse(t, st.s + 1.5, st.s + 1.95)); });
    const subTool = SUB.map(([sx, sy]) => { let best = 0, bd = Infinity; TP.forEach(([x, y], i) => { const dd = Math.hypot(x - sx, y - sy); if (dd < bd) { bd = dd; best = i; } }); return best; });
    subTool.forEach((ti, j) => { toolOn[ti] = Math.max(toolOn[ti], pulse(t, 8.3 + j * 0.25, 8.5 + j * 0.25)); });
    const boxes = TOOLS.map((nm, i) => {
      const on = toolOn[i];
      ctx.globalAlpha = 1;
      const b = d.chip(ctx, nm, TP[i][0], TP[i][1], ls * 0.92, { align: 'center', frame: on > 0.5 ? P.fg : RULE2, color: on > 0.5 ? P.fg : P.fg2 });
      if (on > 0.01) { ctx.globalAlpha = on; ctx.strokeStyle = P.fg; d.brackets(ctx, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 6); }
      return b;
    });

    // Calls and results travel along the connector.
    STEPS.forEach((st) => {
      const a = TOOL_A[st.tool], [x0, y0] = ring(a), [x1, y1] = TP[st.tool];
      const go = k(t, st.s + 1.1, st.s + 1.55), back = k(t, st.s + 1.85, st.s + 2.3);
      if (go > 0 && go < 1) { const e = load(go) * 0.86; ctx.globalAlpha = 1; d.sq(ctx, lerp(x0, x1, e), lerp(y0, y1, e), 6, P.fg); }
      if (back > 0 && back < 1) { const e = 0.86 * (1 - load(back)); ctx.globalAlpha = 1; d.sq(ctx, lerp(x0, x1, e), lerp(y0, y1, e), 6, P.fg); }
      const show = pulse(t, st.s + 1.1, st.s + 2.4);
      if (show > 0) {
        const b = boxes[st.tool], below = y1 > cy;
        ctx.globalAlpha = show;
        d.code(ctx, st.call, x1, below ? b.y + b.h + 12 : b.y - 12, ls, P.fg2, 'center');
      }
    });

    // Sub-agents: same loop, own context, sent out along the reading axis and called back with a summary.
    const out = expo(k(t, 7.3, 7.65)), life = out * (1 - load(k(t, 9.7, 10.15)));
    if (life > 0.002) {
      SUB.forEach(([sx, sy], j) => {
        const x = lerp(cx, sx, out), y = lerp(cy, sy, out), sc = 0.7 + 0.3 * life;
        const rr = R * 0.85 * sc, or = R * 0.4 * sc;
        const [fx, fy] = subFrom[j], dl = Math.hypot(x - fx, y - fy);
        if (out > 0.9 && dl > rr + 6) {
          const ex = x - ((x - fx) / dl) * (rr + 4), ey = y - ((y - fy) / dl) * (rr + 4);
          ctx.globalAlpha = 0.45 * life * k(out, 0.9, 1); ctx.strokeStyle = P.fg; ctx.setLineDash([2, 4]);
          d.line(ctx, fx, fy, ex, ey); ctx.setLineDash([]);
        }
        ctx.globalAlpha = life;
        ctx.strokeStyle = RULE2; ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke();
        d.octagon(ctx, x, y, or); ctx.fillStyle = P.pane; ctx.fill(); ctx.strokeStyle = P.facet; ctx.stroke();
        const sa = -Math.PI / 2 + Math.max(0, t - 7.65) * 3.4;
        d.sq(ctx, x + rr * Math.cos(sa), y + rr * Math.sin(sa), 5, P.fg);
        d.label(ctx, 'Sub-agent', x, y + rr + 12, ls * 0.85, P.fg3, 'center');
        const [tx, ty] = TP[subTool[j]];
        const go = k(t, 8.0 + j * 0.25, 8.3 + j * 0.25), back = k(t, 8.5 + j * 0.25, 8.85 + j * 0.25);
        if (go > 0 && go < 1) { const e = load(go); d.sq(ctx, lerp(x, tx, e * 0.85), lerp(y, ty, e * 0.85), 5, P.fg); }
        if (back > 0 && back < 1) { const e = 1 - load(back); d.sq(ctx, lerp(x, tx, e * 0.85), lerp(y, ty, e * 0.85), 5, P.fg); }
        const sum = k(t, 9.3, 9.7);
        if (sum > 0 && sum < 1) { const e = load(sum); d.sq(ctx, lerp(x, cx, e), lerp(y, cy, e), 6, P.fg); }
      });
    }

    // The task arrives above READ; the answer leaves from THINK.
    const [rx0, ry0] = ring(SA[0]);
    const tin = expo(k(t, 0.15, 0.4)), tout = load(k(t, 1.05, 1.35));
    if (tin > 0 && tout < 1) d.chip(ctx, 'Task: fix the failing test', rx0, lerp(lerp(ry0 - 70, ry0 - 46, tin), ry0, tout), ls * 0.92, { align: 'center', alpha: tin * (1 - tout), frame: P.fg });
    const ans = expo(k(t, 13.1, 13.35));
    if (ans > 0) { const [x, y] = ring(0); d.chip(ctx, 'Answer: tests pass', x + 18 + 24 * ans, y - 24, ls * 0.92, { alpha: ans, frame: P.fg }); }

    // The pulse: the signal square travelling the loop.
    const [px, py] = ring(pa);
    ctx.globalAlpha = 1; d.sq(ctx, px, py, 8, P.signal);

    // Context window: the transcript so far. Grey model text, red tool calls, bone tool results.
    const bx = W * (pr ? 0.06 : 0.2), bw = W * (pr ? 0.88 : 0.6), by = H * (pr ? 0.915 : 0.885);
    const N = 48, gap = 2, cs = (bw - gap * (N - 1)) / N, ch = Math.min(cs, 14);
    ctx.globalAlpha = 1; ctx.strokeStyle = RULE2;
    ctx.strokeRect(bx - 3.5, by - ch / 2 - 3.5, bw + 7, ch + 7);
    let n = 0;
    CTX.forEach(([tc, cnt, kind]) => {
      for (let j = 0; j < cnt; j++, n++) {
        const a = expo(k(t, tc + j * 0.025, tc + j * 0.025 + 0.22));
        if (a <= 0) continue;
        ctx.globalAlpha = a * (kind === 0 ? 0.45 : kind === 1 ? 1 : 0.85);
        ctx.fillStyle = kind === 1 ? P.signal : kind === 2 ? P.fg : P.fg3;
        ctx.fillRect(bx + n * (cs + gap), by - ch / 2, cs, ch);
      }
    });
    ctx.globalAlpha = 1;
    d.label(ctx, 'Context window', bx - 3, by - ch / 2 - 15, ls * 0.9, P.fg3);
    d.label(ctx, 'Limit', bx + bw + 3, by - ch / 2 - 15, ls * 0.9, P.fg3, 'right');
    const [lab, code] = agentReadout(t);
    readout(ctx, bx - 3, by - ch / 2 - 37, lab, code, ls);
  }

  /* =========================================================================================================
     02 TOKENS: the prompt is typed, cut into tokens, given IDs, and each ID lifts its row out of the embedding
     table to become a vector.
     ========================================================================================================= */
  function promptLayout(g) {
    const { ctx, W, H, pr, ls } = g;
    const F = pr ? clamp(W * 0.055, 16, 24) : clamp(W * 0.026, 18, 34);
    ctx.font = d.sans(F, 600);
    const gapX = F * 0.36, padX = F * 0.26;
    const items = PROMPT.map((tk) => { const s = tk.trimStart(); return { s, w: ctx.measureText(s).width }; });
    const maxW = W * (pr ? 0.88 : 0.86);
    const lines = [[]];
    let lw = 0;
    items.forEach((it, i) => {
      const ln = lines[lines.length - 1];
      const add = (ln.length ? gapX : 0) + it.w + 2 * padX;
      if (ln.length && lw + add > maxW) { lines.push([i]); lw = it.w + 2 * padX; } else { ln.push(i); lw += add; }
    });
    const y0 = pr ? H * 0.17 : H * 0.22, lh = F * 2.2 + ls + 8;
    lines.forEach((ln, li) => {
      const tw = ln.reduce((a, i, j) => a + items[i].w + 2 * padX + (j ? gapX : 0), 0);
      let x = (W - tw) / 2;
      ln.forEach((i) => { const it = items[i]; it.x = x + padX; it.cx = x + padX + it.w / 2; it.y = y0 + li * lh; x += it.w + 2 * padX + gapX; });
    });
    const last = y0 + (lines.length - 1) * lh;
    const cs = pr ? 6 : clamp(H * 0.012, 5, 9), gap = 2;
    const vTop = pr ? last + F * 0.32 + ls + 40 : last + F * 0.32 + ls + 22;
    const colX = pr ? PROMPT.map((_, i) => W * 0.12 + (i * W * 0.76) / 7) : items.map((it) => it.cx);
    return { F, padX, items, colX, vTop, cs, gap };
  }
  const TABLE = (() => { const r = BG.rng(11); return Array.from({ length: 40 * 100 }, () => r()); })();

  function sTokens(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const L = promptLayout(g);
    const full = PROMPT.join('');
    const typed = Math.floor(k(t, 0.2, 1.9) * full.length + 1e-6);
    let pos = 0, caretX = null, caretY = 0;
    ctx.globalAlpha = 1;
    L.items.forEach((it, i) => {
      const tk = PROMPT[i], lead = tk.length - it.s.length;
      const vis = clamp(typed - pos - lead, 0, it.s.length);
      pos += tk.length;
      // chip
      const ca = expo(k(t, 2.05 + i * 0.07, 2.3 + i * 0.07));
      if (ca > 0) {
        ctx.globalAlpha = ca;
        d.chamfer(ctx, it.x - L.padX, it.y - L.F * 0.92, it.w + 2 * L.padX, L.F * 1.24, 5);
        ctx.fillStyle = P.pane; ctx.fill();
        ctx.strokeStyle = i === 7 ? P.signal : RULE2; ctx.stroke();
      }
      if (vis > 0) {
        ctx.globalAlpha = 1; ctx.font = d.sans(L.F, 600); ctx.fillStyle = P.fg; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        const s = it.s.slice(0, vis);
        ctx.fillText(s, it.x, it.y);
        if (vis < it.s.length || (typed < full.length && i === PROMPT.length - 1) || (typed - pos >= 0 && i < 7 && typed < full.length && vis === it.s.length)) { caretX = it.x + ctx.measureText(s).width; caretY = it.y; }
      }
      // ID
      const ia = expo(k(t, 2.9 + i * 0.06, 3.15 + i * 0.06));
      if (ia > 0) { ctx.globalAlpha = ia; d.label(ctx, String(IDS[i]), it.cx, it.y + L.F * 0.32 + 8 + ls / 2, ls * 0.92, P.fg3, 'center'); }
    });
    if (t >= 0.2 && t < 2.0 && caretX != null) { ctx.globalAlpha = 1; ctx.fillStyle = P.signal; ctx.fillRect(caretX + 2, caretY - L.F * 0.8, L.F * 0.42, L.F * 0.95); }
    ctx.globalAlpha = 1;
    if (!pr) d.label(ctx, `Prompt · ${typed >= full.length ? '8 tokens' : 'typing'}`, W * 0.07, L.items[0].y - L.F * 1.65, ls, P.fg3);

    // The embedding table.
    const rows = pr ? 10 : 18, cols = pr ? 40 : 84;
    const x0 = W * (pr ? 0.06 : 0.1), x1 = W * (pr ? 0.94 : 0.9), y0 = H * (pr ? 0.76 : 0.64), y1 = H * (pr ? 0.935 : 0.9);
    const cw = (x1 - x0) / cols, chh = (y1 - y0) / rows;
    const ta = expo(k(t, 3.4, 3.8));
    if (ta > 0) {
      ctx.fillStyle = P.fg;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        ctx.globalAlpha = ta * (0.035 + 0.13 * TABLE[r * 100 + c]);
        ctx.fillRect(x0 + c * cw, y0 + r * chh, cw - 1, chh - 1);
      }
      ctx.globalAlpha = ta;
      d.label(ctx, pr ? 'Embedding table' : 'Embedding table · one row per token', x0, y0 - 12, ls * 0.92, P.fg3);
      d.label(ctx, `${rows} of ~100,000 rows`, x1, y0 - 12, ls * 0.92, P.fg3, 'right');
    }
    // Each ID lifts its row: a horizontal strip folds into a vertical vector under its token.
    for (let i = 0; i < 8; i++) {
      const tl = 4.3 + i * 0.42;
      const r = (IDS[i] * 7) % rows, c0 = (i * 9 + 3) % (cols - 16);
      const hl = pulse(t, tl, tl + 0.9);
      if (hl > 0) { ctx.globalAlpha = hl; ctx.strokeStyle = P.signal; ctx.strokeRect(x0 + c0 * cw - 1.5, y0 + r * chh - 1.5, 16 * cw + 2, chh + 2); }
      for (let j = 0; j < 16; j++) {
        const p = expo(k(t, tl + 0.35 + j * 0.012, tl + 1.05 + j * 0.012));
        if (p <= 0) continue;
        const sx = x0 + (c0 + j) * cw, sy = y0 + r * chh;
        const ex = L.colX[i] - L.cs / 2 + (pr ? L.cs / 2 : 0), ey = L.vTop + j * (L.cs + L.gap);
        const s = lerp(Math.min(cw, chh) - 1, L.cs, p);
        cell(ctx, lerp(sx, ex, p), lerp(sy, ey, p), s, VEC[i][j]);
      }
    }
    const end = expo(k(t, 8.4, 8.7));
    if (end > 0) {
      ctx.globalAlpha = end;
      d.label(ctx, '8 tokens → 8 vectors · 16 of 12,288 numbers shown', x0, y1 + (pr ? 12 : 18), ls * 0.92, P.fg2);
    }
    ctx.globalAlpha = end > 0 ? 1 - end : 1;
    d.label(ctx, 'IDs illustrative', W * (pr ? 0.94 : 0.93), H * 0.965, ls * 0.85, P.fg3, 'right');
  }

  /* =========================================================================================================
     03 MEANING: the vectors land in a rotating cloud of meaning; state → capital is one direction.
     ========================================================================================================= */
  const CLOUD = (() => {
    const r = BG.rng(31);
    const clusters = [
      { name: 'Places', c: [0.5, -0.18, 0.32] }, { name: 'Civics', c: [-0.1, -0.5, 0.3] },
      { name: 'Function words', c: [-0.58, 0.12, -0.16] }, { name: 'Relations', c: [-0.34, 0.5, 0.34] },
      { name: 'Animals', c: [0.24, 0.52, -0.42] }, { name: 'Numbers', c: [0.6, 0.34, -0.08] },
      { name: 'Food', c: [-0.08, 0.04, -0.66] }, { name: 'Time', c: [0.08, -0.36, -0.5] },
    ];
    const pts = [];
    clusters.forEach((cl, ci) => { for (let i = 0; i < 62; i++) pts.push({ p: [cl.c[0] + r.n() * 0.11, cl.c[1] + r.n() * 0.11, cl.c[2] + r.n() * 0.11], h: 0, ci }); });
    for (let i = 0; i < 150; i++) {
      let x, y, z;
      do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1);
      pts.push({ p: [x * 0.92, y * 0.92, z * 0.92], h: 1, ci: -1 });
    }
    const at = (b, o) => [b[0] + o[0], b[1] + o[1], b[2] + o[2]];
    const D = [0.17, -0.07, -0.13];
    const N = {};
    const P0 = clusters[0].c;
    N.Texas = at(P0, [-0.17, 0.07, 0.03]); N.California = at(P0, [-0.03, 0.17, -0.07]);
    N.France = at(P0, [0.05, -0.12, 0.15]); N.Japan = at(P0, [-0.13, -0.09, -0.15]);
    [['Texas', 'Austin'], ['California', 'Sacramento'], ['France', 'Paris'], ['Japan', 'Tokyo']].forEach(([a, b]) => { N[b] = at(N[a], [D[0] + r.n() * 0.01, D[1] + r.n() * 0.01, D[2] + r.n() * 0.01]); });
    N.Dallas = at(N.Texas, [-0.08, 0.06, -0.05]);
    const C = (ci, o) => at(clusters[ci].c, o);
    const tokens = [C(2, [0.02, -0.07, 0.03]), C(1, [0.04, 0.02, -0.03]), C(2, [-0.08, 0.05, 0]), C(2, [0.06, 0.06, -0.05]), C(1, [-0.07, -0.04, 0.06]), C(3, [0, 0.03, 0]), N.Dallas, C(2, [-0.03, -0.09, -0.06])];
    return { clusters, pts, N, tokens };
  })();
  const PAIRS = [['Texas', 'Austin'], ['California', 'Sacramento'], ['France', 'Paris'], ['Japan', 'Tokyo']];

  function sMeaning(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const cx = W * 0.5, cy = H * (pr ? 0.5 : 0.52), S = Math.min(W, H) * (pr ? 0.44 : 0.42);
    const yaw = -0.85 + t * 0.15, pitch = 0.36;
    const pp = CLOUD.pts.map((q) => ({ q, s: proj(q.p, yaw, pitch, cx, cy, S) }));
    pp.sort((a, b) => b.s[2] - a.s[2]);
    ctx.fillStyle = P.fg;
    pp.forEach(({ q, s }) => {
      const depth = clamp((1 - s[2]) / 2);
      ctx.globalAlpha = (q.h ? 0.1 : 0.2) + (q.h ? 0.2 : 0.5) * depth;
      const z = 1.1 + 1.5 * depth;
      ctx.fillRect(s[0] - z / 2, s[1] - z / 2, z, z);
    });
    // Labels are placed most important first, each nudged clear of the ones before it.
    const place = placer(), lh = ls * 0.95 + 4;
    const L = promptLayout(g);
    const tokS = PROMPT.map((_, i) => proj(CLOUD.tokens[i], yaw, pitch, cx, cy, S));
    tokS.forEach((s) => place.block(s[0] - 4, s[1] - 4, 8, 8));

    // The prompt's vectors fly in from the previous chapter and land as points.
    const tokLab = [];
    PROMPT.forEach((tk, i) => {
      const s = tokS[i];
      const p = expo(k(t, 0.15 + i * 0.1, 1.2 + i * 0.1));
      const sx = L.colX[i], sy = L.vTop + 8 * (L.cs + L.gap);
      const x = lerp(sx, s[0], p), y = lerp(sy, s[1], p);
      const len = (1 - p) * 16 * (L.cs + L.gap);
      ctx.globalAlpha = 1;
      if (len > 1) { ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.6 * (1 - p); d.line(ctx, x, y - len / 2, x, y + len / 2); ctx.globalAlpha = 1; }
      d.sq(ctx, x, y, 6, P.fg);
      const la = expo(k(t, 1.1 + i * 0.1, 1.4 + i * 0.1)) * (1 - 0.55 * expo(k(t, 2.5, 2.8)));
      if (la > 0 && p > 0.98) tokLab.push([i, x, y, la]);
    });
    tokLab.sort((a, b) => (a[0] === 6 ? -1 : b[0] === 6 ? 1 : 0)).forEach(([i, x, y, la]) => {
      const txt = PROMPT[i].trimStart(), w = d.codeW(ctx, txt, ls * 0.95), right = i === 6;
      const yy = place(right ? x - 9 - w : x + 9, y, w, lh);
      if (yy == null) return;
      ctx.globalAlpha = la; d.code(ctx, txt, right ? x - 9 : x + 9, yy, ls * 0.95, right ? P.fg : P.fg2, right ? 'right' : 'left');
    });

    // State → capital: four arrows, one direction.
    PAIRS.forEach(([a, b], i) => {
      const ta = 2.6 + i * 0.7;
      const on = expo(k(t, ta, ta + 0.25));
      if (on <= 0) return;
      const A = proj(CLOUD.N[a], yaw, pitch, cx, cy, S), B = proj(CLOUD.N[b], yaw, pitch, cx, cy, S);
      const dr = expo(k(t, ta + 0.15, ta + 0.7));
      ctx.globalAlpha = on;
      d.sq(ctx, A[0], A[1], 5, P.fg); d.hollow(ctx, B[0], B[1], 7, P.fg);
      ctx.strokeStyle = i === 0 ? P.signal : P.fg; ctx.lineWidth = i === 0 ? 2 : 1.25;
      if (dr > 0) d.arrow(ctx, A[0], A[1], lerp(A[0], B[0], dr), lerp(A[1], B[1], dr), 7);
      ctx.lineWidth = 1;
      const wa = d.codeW(ctx, a, ls * 0.95), wb = d.codeW(ctx, b, ls * 0.95);
      const ya = place(A[0] - 8 - wa, A[1] + 1, wa, lh), yb = place(B[0] + 9, B[1] + 1, wb, lh);
      if (ya != null) d.code(ctx, a, A[0] - 8, ya, ls * 0.95, P.fg2, 'right');
      if (yb != null) d.code(ctx, b, B[0] + 9, yb, ls * 0.95, i === 0 ? P.fg : P.fg2, 'left');
    });
    // Cluster names last: they give way to everything else.
    CLOUD.clusters.forEach((cl, ci) => {
      if (pr && ci > 3) return;
      const s = proj(cl.c, yaw, pitch, cx, cy, S);
      const w = d.labelW(ctx, cl.name, ls * 0.86), y = s[1] - S * 0.2 * s[3];
      const yy = place(s[0] - w / 2, y, w, lh, [0, -1, 1]);
      if (yy == null) return;
      ctx.globalAlpha = 0.35 + 0.5 * clamp((1 - s[2]) / 2);
      d.label(ctx, cl.name, s[0], yy, ls * 0.86, P.fg3, 'center');
    });
    const cap = expo(k(t, 5.6, 5.9));
    ctx.globalAlpha = cap;
    if (cap > 0) { d.sq(ctx, W * 0.07, H * 0.925, 6, P.signal); d.label(ctx, 'State → capital: roughly one direction', W * 0.07 + 12, H * 0.925, ls, P.fg); }
    ctx.globalAlpha = 1;
    d.label(ctx, pr ? '3 of 12,288 dimensions' : '3 of 12,288 dimensions · positions illustrative', W * 0.93, H * (pr ? 0.965 : 0.925), ls * 0.85, P.fg3, 'right');
  }

  /* =========================================================================================================
     04 ATTENTION: query, keys, softmax, values; three heads in turn; the attention matrix.
     ========================================================================================================= */
  const HEADS = [
    { name: 'Head A · what is being asked?', t0: 0, t1: 4.6, focus: 7, w: [0.03, 0.38, 0.04, 0.03, 0.22, 0.07, 0.18, 0.05] },
    { name: 'Head B · previous token', t0: 4.6, t1: 8.0, prev: true },
    { name: 'Head C · where?', t0: 8.0, t1: 12.6, focus: 7, w: [0.02, 0.06, 0.01, 0.02, 0.12, 0.05, 0.68, 0.04] },
  ];
  const MATS = (() => {
    const r = BG.rng(19);
    return HEADS.map((h) => Array.from({ length: 8 }, (_, i) => {
      if (h.prev) { const row = Array(8).fill(0); if (!i) row[0] = 1; else for (let j = 0; j <= i; j++) row[j] = j === i - 1 ? 0.86 : 0.14 / i; return row; }
      if (i === h.focus) return h.w.slice();
      const s = Array.from({ length: 8 }, (_, j) => (j <= i ? Math.exp(r.n() * 1.1) : 0));
      const z = s.reduce((a, b) => a + b, 0);
      return s.map((v) => v / z);
    }));
  })();

  function sAttention(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const hi = t < HEADS[1].t0 ? 0 : t < HEADS[2].t0 ? 1 : 2;
    const hd = HEADS[hi], lt = t - hd.t0;
    const fs = pr ? 11 : clamp(W / 95, 11, 13.5);
    const out = 1 - load(k(t, hd.t1 - 0.35, hd.t1));
    let chips, ax;
    if (!pr) {
      const y = H * 0.8, x0 = W * 0.075, span = W * 0.58;
      chips = PROMPT.map((tk, i) => { const s = tk.trimStart(); return { s, cx: x0 + (i * span) / 7, cy: y, w: d.codeW(ctx, s, fs) + 16, h: fs + 14 }; });
    } else {
      const x = W * 0.08;
      chips = PROMPT.map((tk, i) => { const s = tk.trimStart(); const w = d.codeW(ctx, s, fs) + 14; return { s, cx: x + w / 2, cy: H * 0.17 + i * H * 0.06, w, h: fs + 12 }; });
      ax = Math.max(...chips.map((c) => c.cx + c.w / 2)) + 40;
    }
    const arc = (i, j) => {
      const a = chips[i], b = chips[j];
      if (!pr) { const y = a.cy - a.h / 2 - 4; const h = Math.min((a.cx - b.cx) * 0.52, H * 0.52); return [a.cx, y, a.cx, y - h, b.cx, y - h, b.cx, y]; }
      const bul = Math.min((a.cy - b.cy) * 0.75, W * 0.4);
      return [ax, a.cy, ax + bul, a.cy, ax + bul, b.cy, ax, b.cy];
    };
    // Head name.
    ctx.globalAlpha = expo(k(lt, 0, 0.3)) * out;
    d.sq(ctx, W * 0.075, H * (pr ? 0.115 : 0.14), 6, P.signal);
    d.label(ctx, hd.name, W * 0.075 + 12, H * (pr ? 0.115 : 0.14), ls, P.fg);

    // Arcs and the values they carry.
    const weights = hd.prev ? null : hd.w;
    const wmax = weights ? Math.max(...weights.slice(0, 7)) : 1;
    ctx.lineCap = 'round';
    if (hd.prev) {
      for (let i = 1; i < 8; i++) {
        const p = arc(i, i - 1), dr = expo(k(lt, 0.2 + (i - 1) * 0.1, 0.7 + (i - 1) * 0.1));
        ctx.globalAlpha = 0.85 * out; ctx.strokeStyle = P.fg; ctx.lineWidth = 2.2;
        bzStroke(ctx, p, dr);
        const q = k(lt, 1.4 + i * 0.06, 2.2 + i * 0.06);
        if (q > 0 && q < 1) { const pt = bz(p, 1 - load(q)); ctx.globalAlpha = out; d.sq(ctx, pt[0], pt[1], 5, P.fg); }
      }
    } else {
      const a0 = hi === 0 ? 1.9 : 0.25;
      for (let j = 0; j < 7; j++) {
        const w = weights[j], p = arc(7, j), dr = expo(k(lt, a0 + j * 0.03, a0 + 0.6 + j * 0.03));
        const top = w === wmax;
        ctx.globalAlpha = (0.18 + 0.82 * (w / wmax)) * out;
        ctx.strokeStyle = top ? P.signal : P.fg; ctx.lineWidth = 0.6 + 7 * w;
        bzStroke(ctx, p, dr);
        if (w >= 0.1) for (let q = 0; q < 3; q++) {
          const s = k(lt, a0 + 0.7 + q * 0.32, a0 + 1.6 + q * 0.32);
          if (s > 0 && s < 1) { const pt = bz(p, 1 - load(s)); ctx.globalAlpha = out; d.sq(ctx, pt[0], pt[1], 3 + 5 * w, top ? P.signal : P.fg); }
        }
      }
    }
    ctx.lineWidth = 1; ctx.lineCap = 'butt';

    // Head A first shows the raw query-key scores, then the softmax that turns them into weights.
    if (hi === 0) {
      const vis = pulse(lt, 0.6, 2.05, 0.3, 0.35), soft = load(k(lt, 1.2, 1.7));
      if (vis > 0) {
        const lw = weights.slice(0, 7).map((v) => Math.log(v)), lo = Math.min(...lw), hiL = Math.max(...lw);
        const Hm = pr ? W * 0.16 : H * 0.2;
        for (let j = 0; j < 7; j++) {
          const raw = 0.15 + 0.85 * (lw[j] - lo) / (hiL - lo), sm = weights[j] / wmax, v = lerp(raw, sm, soft);
          const c = chips[j];
          ctx.globalAlpha = vis * 0.9; ctx.fillStyle = P.fg;
          if (!pr) ctx.fillRect(c.cx - 3, c.cy - c.h / 2 - 8 - v * Hm, 6, v * Hm);
          else ctx.fillRect(ax - 30, c.cy - 3, v * Hm, 6);
        }
        ctx.globalAlpha = vis;
        d.label(ctx, soft < 0.5 ? 'Query · key scores' : 'Softmax: weights that sum to 1', W * 0.075, pr ? H * 0.665 : H * 0.8 - fs - 14 - Hm - 30, ls * 0.9, P.fg2);
      }
    }
    // Chips.
    chips.forEach((c, i) => {
      const focus = hd.prev ? false : i === hd.focus;
      ctx.globalAlpha = 1;
      d.chamfer(ctx, c.cx - c.w / 2, c.cy - c.h / 2, c.w, c.h, 4);
      ctx.fillStyle = P.pane; ctx.fill();
      ctx.strokeStyle = focus ? P.signal : RULE2; ctx.lineWidth = focus ? 1.5 : 1; ctx.stroke(); ctx.lineWidth = 1;
      d.code(ctx, c.s, c.cx, c.cy + 0.5, fs, P.fg, 'center');
      if (!hd.prev && i < 7 && (hi !== 0 || lt > 1.7)) {
        const wa = expo(k(lt, hi === 0 ? 1.7 : 0.6, hi === 0 ? 2.0 : 0.9)) * out;
        ctx.globalAlpha = wa;
        const txt = hd.w[i].toFixed(2).replace(/^0/, '');
        if (!pr) d.label(ctx, txt, c.cx, c.cy + c.h / 2 + 12, ls * 0.86, hd.w[i] === wmax ? P.fg : P.fg3, 'center');
        else d.label(ctx, txt, c.cx + c.w / 2 + 6, c.cy, ls * 0.84, hd.w[i] === wmax ? P.fg : P.fg3, 'left');
      }
      if (focus) { ctx.globalAlpha = out; if (!pr) d.label(ctx, 'Query', c.cx, c.cy + c.h / 2 + 12, ls * 0.86, P.signal, 'center'); else d.label(ctx, 'Query', c.cx + c.w / 2 + 6, c.cy, ls * 0.84, P.signal, 'left'); }
    });

    // The matrix: every token at once. Rows look back at columns; the upper triangle is masked.
    const M = pr ? Math.min(W * 0.42, H * 0.24) : Math.min(W * 0.21, H * 0.44);
    const mx = pr ? W * 0.4 : W * 0.735, my = pr ? H * 0.715 : H * 0.22, c = M / 8;
    const prevM = MATS[Math.max(0, hi - 1)], curM = MATS[hi], mix = hi ? expo(k(lt, 0, 0.4)) : 1;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const x = mx + j * c, y = my + i * c;
      if (j > i) { ctx.globalAlpha = 0.1; ctx.strokeStyle = P.fg; d.line(ctx, x + 2, y + c - 2, x + c - 2, y + 2); continue; }
      const v = lerp(prevM[i][j], curM[i][j], mix);
      ctx.globalAlpha = 0.06 + 0.94 * Math.sqrt(v); ctx.fillStyle = P.fg;
      ctx.fillRect(x + 1, y + 1, c - 2, c - 2);
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = RULE2; ctx.strokeRect(mx - 0.5, my - 0.5, M + 1, M + 1);
    PROMPT.forEach((tk, i) => d.code(ctx, tk.trimStart(), mx - 6, my + (i + 0.5) * c, Math.min(ls * 0.85, c * 0.8), P.fg3, 'right'));
    if (!hd.prev) { ctx.strokeStyle = P.signal; d.brackets(ctx, mx - 4, my + 7 * c - 4, M + 8, c + 8, 5); }
    d.label(ctx, 'Attention weights', mx, my - 14, ls * 0.9, P.fg3);
    if (!pr) d.label(ctx, 'Rows look back · upper half masked', mx, my + M + 16, ls * 0.84, P.fg3);
    if (!pr) d.label(ctx, 'Weights illustrative · each token sees only earlier tokens', W * 0.075, H * 0.94, ls * 0.85, P.fg3);
  }

  /* =========================================================================================================
     05 STREAM: eight positions rise through the layers; the published Dallas → Texas → Austin trace, then the
     intervention that swaps Texas for California.
     ========================================================================================================= */
  const NB = 12;
  const FEAT = [
    { lane: 6, band: 2, text: 'Dallas', side: 'L' },
    { lane: 1, band: 3, text: 'capital', side: 'R' },
    { lane: 4, band: 3, text: 'state', side: 'R' },
    { lane: 7, band: 6, text: 'Texas', alt: 'California', side: 'R' },
    { lane: 7, band: 8, text: 'say a capital', side: 'R' },
    { lane: 7, band: 10, text: 'say Austin', alt: 'say Sacramento', side: 'R', signal: true },
  ];
  const EDGES = [[0, 3, 'arc'], [1, 4, 'arc'], [2, 4, 'arc'], [3, 5, 'up'], [4, 5, 'up'], [0, 5, 'short']];
  const bandT = (b) => 0.6 + b * 0.42;

  function sStream(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const lx = (i) => (pr ? W * 0.14 + (i * W * 0.72) / 7 : W * 0.24 + (i * W * 0.46) / 7);
    const yb0 = H * (pr ? 0.8 : 0.82), yb1 = H * (pr ? 0.24 : 0.2);
    const by = (b) => lerp(yb0, yb1, b / (NB - 1));
    const bpos = clamp((t - 0.6) / 0.42, -0.6, NB - 1 + 0.4);
    const yw = lerp(yb0, yb1, bpos / (NB - 1));
    const sx = W * (pr ? 0.05 : 0.15);

    // Layer scale with the wavefront marker.
    ctx.globalAlpha = 1; ctx.strokeStyle = RULE2; ctx.lineWidth = 1;
    d.line(ctx, sx, by(0), sx, by(NB - 1));
    for (let b = 0; b < NB; b++) d.line(ctx, sx, by(b), sx + (b % 11 === 0 ? 8 : 4), by(b));
    if (pr) { d.label(ctx, 'Late', sx, by(NB - 1) - 14, ls * 0.85, P.fg3); d.label(ctx, 'Early', sx, by(0) + 14, ls * 0.85, P.fg3); }
    else { d.label(ctx, 'Late', sx - 10, by(NB - 1), ls * 0.88, P.fg3, 'right'); d.label(ctx, 'Middle', sx - 10, by(5.5), ls * 0.88, P.fg3, 'right'); d.label(ctx, 'Early', sx - 10, by(0), ls * 0.88, P.fg3, 'right'); d.label(ctx, 'Layers', sx - 10, by(0) + 22, ls * 0.8, P.fg3, 'right'); }
    d.sq(ctx, sx + 4, clamp(yw, by(NB - 1), by(0)), 7, P.signal);

    // Lanes: brighter below the wavefront, where the computation has already passed.
    for (let i = 0; i < 8; i++) {
      const x = lx(i);
      ctx.strokeStyle = P.fg;
      ctx.globalAlpha = 0.12; d.line(ctx, x, by(NB - 1) - 10, x, Math.max(by(NB - 1) - 10, yw));
      ctx.globalAlpha = 0.45; d.line(ctx, x, by(0) + 10, x, Math.min(by(0) + 10, yw));
    }
    // Bands: attention spans the lanes; each lane has an MLP block.
    for (let b = 0; b < NB; b++) {
      const done = expo(k(t, bandT(b), bandT(b) + 0.25)), y = by(b);
      ctx.globalAlpha = 0.05 + 0.1 * done; ctx.strokeStyle = P.fg;
      d.line(ctx, lx(0) - 8, y - 5, lx(7) + 8, y - 5);
      for (let i = 0; i < 8; i++) { ctx.globalAlpha = 0.16 + 0.34 * done; ctx.fillStyle = P.fg; ctx.fillRect(lx(i) - 2, y - 1, 4, 4); }
    }
    // Tokens at the foot of each lane.
    PROMPT.forEach((tk, i) => {
      ctx.globalAlpha = 1;
      if (!pr) d.code(ctx, tk.trimStart(), lx(i), by(0) + 30, ls * 0.98, P.fg2, 'center');
      else { ctx.save(); ctx.translate(lx(i) + 3, by(0) + 22); ctx.rotate(-Math.PI / 4); d.code(ctx, tk.trimStart(), 0, 0, ls * 0.9, P.fg2, 'right'); ctx.restore(); }
    });

    // The trace.
    const sw = expo(k(t, 8.4, 8.8)), sw2 = expo(k(t, 9.2, 9.6));
    const fpos = FEAT.map((f) => [lx(f.lane), by(f.band)]);
    const fon = FEAT.map((f) => expo(k(t, bandT(f.band) + 0.15, bandT(f.band) + 0.4)));
    EDGES.forEach(([a, b, kind], ei) => {
      const st = Math.max(bandT(FEAT[a].band), bandT(FEAT[b].band)) + 0.3;
      const dr = expo(k(t, st, st + 0.5));
      if (dr <= 0) return;
      const [x1, y1] = fpos[a], [x2, y2] = fpos[b];
      const dim = ei === 0 || ei === 5 ? 1 - 0.75 * sw : 1;
      ctx.globalAlpha = 0.85 * dim; ctx.strokeStyle = P.fg; ctx.lineWidth = 1.5;
      if (kind === 'short') ctx.setLineDash([3, 4]);
      const p = kind === 'up' ? [x1, y1, x1, lerp(y1, y2, 0.33), x2, lerp(y1, y2, 0.66), x2, y2]
        : kind === 'short' ? [x1, y1, x1 - W * 0.06, lerp(y1, y2, 0.4), x2 - W * 0.06, lerp(y1, y2, 0.75), x2, y2]
          : [x1, y1, x1, lerp(y1, y2, 0.6), x2, lerp(y1, y2, 0.4), x2, y2];
      bzStroke(ctx, p, dr);
      ctx.setLineDash([]); ctx.lineWidth = 1;
      if (kind === 'short' && dr > 0.6 && !pr) { const q = bz(p, 0.5); ctx.globalAlpha = (dr - 0.6) / 0.4 * dim; d.label(ctx, 'Shortcut', q[0] - 8, q[1], ls * 0.82, P.fg3, 'right'); }
    });
    FEAT.forEach((f, i) => {
      const a = fon[i];
      if (a <= 0) return;
      const [x, y] = fpos[i];
      const swap = i === 3 ? sw : i === 5 ? sw2 : 0;
      ctx.globalAlpha = a;
      d.sq(ctx, x, y, 7, f.signal ? P.signal : P.fg);
      const side = pr && f.lane === 7 ? 'L' : f.side;
      const fsz = ls * 0.95;
      const w0 = d.labelW(ctx, f.text, fsz), w1 = f.alt ? d.labelW(ctx, f.alt, fsz) : w0, w = lerp(w0, w1, swap) + fsz * 1.4, h = fsz + 12;
      const bx = side === 'R' ? x + 12 : x - 12 - w, byy = y - h / 2;
      d.chamfer(ctx, bx, byy, w, h, 4); ctx.fillStyle = P.pane; ctx.fill();
      ctx.strokeStyle = swap > 0 && swap < 1 ? P.signal : f.signal || (i === 3 && sw > 0.5) ? P.signal : RULE2; ctx.stroke();
      if (swap < 1) { ctx.globalAlpha = a * (1 - swap); d.label(ctx, f.text, bx + w / 2, y + 0.5, fsz, P.fg, 'center'); }
      if (swap > 0) { ctx.globalAlpha = a * swap; d.label(ctx, f.alt, bx + w / 2, y + 0.5, fsz, P.fg, 'center'); }
    });
    // Output at the top of the last lane.
    const oa = expo(k(t, 5.5, 5.8));
    if (oa > 0) {
      const x = lx(7), y = by(NB - 1) - (pr ? 30 : 34);
      ctx.globalAlpha = oa; ctx.strokeStyle = P.fg; d.line(ctx, x, by(NB - 1) - 10, x, y + 12);
      const F = pr ? 15 : clamp(W * 0.016, 15, 22);
      ctx.font = d.sans(F, 650);
      const w = Math.max(ctx.measureText(' Austin').width, lerp(ctx.measureText('Austin').width, ctx.measureText('Sacramento').width, sw2)) + 20;
      const bx = pr ? x - w + 14 : x - w / 2;
      d.chamfer(ctx, bx, y - F * 0.75, w, F * 1.5, 5); ctx.fillStyle = P.pane; ctx.fill(); ctx.strokeStyle = P.signal; ctx.stroke();
      ctx.fillStyle = P.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = oa * (1 - sw2); ctx.fillText('Austin', bx + w / 2, y + 1);
      ctx.globalAlpha = oa * sw2; ctx.fillText('Sacramento', bx + w / 2, y + 1);
      ctx.globalAlpha = oa; d.label(ctx, 'Output', pr ? bx - 8 : bx + w + 10, y, ls * 0.85, P.fg3, pr ? 'right' : 'left');
    }
    const iv = expo(k(t, 8.1, 8.4));
    if (iv > 0) {
      ctx.globalAlpha = iv;
      d.sq(ctx, W * (pr ? 0.06 : 0.075), H * (pr ? 0.115 : 0.14), 6, P.signal);
      d.label(ctx, pr ? 'Swap Texas for California' : 'Intervention · swap Texas for California', W * (pr ? 0.06 : 0.075) + 12, H * (pr ? 0.115 : 0.14), ls, P.fg);
    }
    ctx.globalAlpha = 1;
    d.label(ctx, 'After Lindsey et al. 2025 · simplified', W * 0.94, H * 0.965, ls * 0.85, P.fg3, 'right');
  }

  /* =========================================================================================================
     06 NEURONS: an MLP block widens, bends and narrows; one neuron magnified with its GELU curve.
     ========================================================================================================= */
  const MLP = (() => {
    const r = BG.rng(23), NI = 16, NH = 32;
    const W1 = Array.from({ length: NH }, () => Array.from({ length: NI }, () => r.n() * 0.42));
    const b1 = Array.from({ length: NH }, () => r.n() * 0.2);
    const W2 = Array.from({ length: NI }, () => Array.from({ length: NH }, () => r.n() * 0.3));
    const pats = [0, 1, 2].map(() => Array.from({ length: NI }, () => clamp(r.n() * 0.7, -1, 1)));
    const z = (x) => W1.map((w, h) => w.reduce((a, v, i) => a + v * x[i], b1[h]));
    let hm = 0, best = -1;
    for (let h = 0; h < NH; h++) {
      const zs = pats.map((p) => z(p)[h]), lo = Math.min(...zs), hi = Math.max(...zs);
      if (lo < -0.3 && hi > 0.5 && hi - lo > best) { best = hi - lo; hm = h; }
    }
    const top = W1[hm].map((w, i) => [Math.abs(w), i]).sort((a, b) => b[0] - a[0]).slice(0, 5).map((p) => p[1]);
    return { W1, b1, W2, pats, z, hm, top, NI, NH };
  })();

  function sNeurons(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const pi = Math.floor(t / 3.6), pt = t - pi * 3.6;
    const cur = MLP.pats[pi % 3], prv = MLP.pats[(pi + 2) % 3], mx = pi ? expo(k(pt, 0, 0.5)) : 1;
    const x = cur.map((v, i) => lerp(prv[i], v, mx));
    const z = MLP.z(x), a = z.map(gelu);
    const o = MLP.W2.map((w) => w.reduce((s, v, h) => s + v * a[h], 0));
    const l1 = pulse(pt, 0.15, 0.8, 0.2, 0.4), l2 = pulse(pt, 0.75, 1.4, 0.2, 0.4);
    const NHs = pr ? 24 : 32;
    const xi = W * (pr ? 0.1 : 0.08), xh = W * (pr ? 0.48 : 0.31), xo = W * (pr ? 0.86 : 0.53);
    const top = H * (pr ? 0.13 : 0.15), bot = H * (pr ? 0.49 : 0.85);
    const cs = pr ? 6 : clamp(H * 0.026, 6, 13), cg = 3;
    const colH = 16 * (cs + cg) - cg, cy0 = (top + bot) / 2 - colH / 2;
    const iy = (j) => cy0 + j * (cs + cg) + cs / 2;
    const hy = (h) => lerp(top, bot, h / (NHs - 1));
    // Weights, grouped by sign and strength so the 1,000 hairlines draw in a few paths.
    const draw = (from, to, wfn, bright) => {
      for (let sgn = 0; sgn < 2; sgn++) for (let b = 1; b <= 4; b++) {
        ctx.beginPath();
        for (let h = 0; h < NHs; h++) for (let j = 0; j < 16; j++) {
          const w = wfn(h, j);
          if ((w >= 0) !== (sgn === 0) || Math.min(4, Math.ceil(Math.abs(w) * 4.5)) !== b) continue;
          const [x1, y1, x2, y2] = from(h, j).concat(to(h, j));
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        }
        ctx.globalAlpha = 0.02 + b * 0.018 + bright * b * 0.05;
        ctx.strokeStyle = sgn ? P.ember : P.fg; ctx.stroke();
      }
    };
    ctx.lineWidth = 1;
    draw((h, j) => [xi + cs, iy(j)], (h) => [xh - 5, hy(h)], (h, j) => MLP.W1[h][j], l1);
    draw((h) => [xh + 5, hy(h)], (h, j) => [xo, iy(j)], (h, j) => MLP.W2[j][h], l2);
    for (let j = 0; j < 16; j++) { cell(ctx, xi, iy(j) - cs / 2, cs, x[j]); cell(ctx, xo, iy(j) - cs / 2, cs, clamp(o[j] * 1.2, -1, 1)); }
    for (let h = 0; h < NHs; h++) {
      const v = a[h];
      ctx.globalAlpha = 0.12 + 0.88 * clamp(v / 1.4);
      ctx.fillStyle = P.fg; ctx.fillRect(xh - 4, hy(h) - 4, 8, 8);
      if (z[h] < 0) { ctx.globalAlpha = 0.5; ctx.strokeStyle = P.ember; ctx.strokeRect(xh - 3.5, hy(h) - 3.5, 7, 7); }
    }
    ctx.globalAlpha = 1;
    if (!pr) d.label(ctx, 'MLP block', xi, Math.max(top - 30, 62), ls, P.fg);
    d.label(ctx, 'In', xi + cs / 2, cy0 + colH + 16, ls * 0.85, P.fg3, 'center');
    d.label(ctx, 'Out', xo + cs / 2, cy0 + colH + 16, ls * 0.85, P.fg3, 'center');
    d.label(ctx, pr ? 'MLP block · 4× wider' : 'Middle · 4× wider', xh, bot + 18, ls * 0.85, pr ? P.fg : P.fg3, 'center');

    // The magnified neuron.
    const hm = MLP.hm, hmY = hy(hm % NHs);
    const ix = W * (pr ? 0.06 : 0.62), iyy = H * (pr ? 0.575 : 0.15), iw = W * (pr ? 0.88 : 0.33), ih = H * (pr ? 0.36 : 0.7);
    d.sq(ctx, xh, hmY, 10, P.signal);
    ctx.globalAlpha = 0.6; ctx.strokeStyle = P.fg;
    if (!pr) { d.line(ctx, xh + 8, hmY, ix - 14, hmY); d.line(ctx, ix - 14, hmY, ix - 14, clamp(hmY, iyy + 10, iyy + ih - 10)); d.line(ctx, ix - 14, clamp(hmY, iyy + 10, iyy + ih - 10), ix - 6, clamp(hmY, iyy + 10, iyy + ih - 10)); }
    else { const dx = W * 0.68; d.line(ctx, xh + 8, hmY, dx, hmY); d.line(ctx, dx, hmY, dx, iyy - 8); }
    ctx.globalAlpha = 1; ctx.strokeStyle = P.fg;
    d.brackets(ctx, ix, iyy, iw, ih, 12);
    d.label(ctx, 'One neuron', ix + 14, iyy + 18, ls, P.fg);
    const zz = z[hm], aa = gelu(zz);
    const nIn = 5, n0 = iyy + (pr ? 40 : 52), n1 = iyy + ih - (pr ? 34 : 60);
    const sgx = ix + iw * (pr ? 0.36 : 0.36), sgy = (n0 + n1) / 2;
    MLP.top.slice(0, nIn).forEach((j, q) => {
      const y = lerp(n0, n1, q / (nIn - 1)), w = MLP.W1[hm][j];
      cell(ctx, ix + 14, y - 5, 10, x[j]);
      ctx.globalAlpha = 1;
      d.code(ctx, (x[j] >= 0 ? ' ' : '') + x[j].toFixed(2), ix + 30, y, ls * 0.9, P.fg2);
      ctx.globalAlpha = 0.85; ctx.strokeStyle = w >= 0 ? P.fg : P.ember; ctx.lineWidth = 0.6 + 3 * Math.abs(w);
      d.line(ctx, ix + 30 + ls * 4.2, y, sgx - 13, sgy); ctx.lineWidth = 1;
    });
    ctx.globalAlpha = 1;
    d.chamfer(ctx, sgx - 13, sgy - 13, 26, 26, 4); ctx.fillStyle = P.pane; ctx.fill(); ctx.strokeStyle = P.fg; ctx.stroke();
    ctx.font = d.sans(15, 600); ctx.fillStyle = P.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Σ', sgx, sgy + 1);
    d.label(ctx, '+ bias', sgx, sgy + 26, ls * 0.82, P.fg3, 'center');
    // The bend: GELU, with the current input marked.
    const px0 = ix + iw * 0.5, px1 = ix + iw - 16, py0 = iyy + (pr ? 34 : 50), py1 = iyy + ih - (pr ? 36 : 64);
    const X = (v) => lerp(px0, px1, (v + 3) / 6), Y = (v) => lerp(py1, py0, (v + 0.4) / 3.4);
    ctx.strokeStyle = RULE2; d.line(ctx, px0, Y(0), px1, Y(0)); d.line(ctx, X(0), py0, X(0), py1);
    ctx.strokeStyle = P.fg; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const v = -3 + (i / 60) * 6; const yy = Y(gelu(v)); if (i) ctx.lineTo(X(v), yy); else ctx.moveTo(X(v), yy); }
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.5; d.arrow(ctx, sgx + 15, sgy, px0 - 8, sgy, 5);
    const zc = clamp(zz, -3, 3);
    ctx.globalAlpha = 0.6; ctx.setLineDash([2, 3]); ctx.strokeStyle = P.signal;
    d.line(ctx, X(zc), Y(0), X(zc), Y(gelu(zc))); d.line(ctx, X(0), Y(gelu(zc)), X(zc), Y(gelu(zc)));
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    d.sq(ctx, X(zc), Y(gelu(zc)), 8, P.signal);
    d.label(ctx, 'GELU', px0, py0 + 2, ls * 0.85, P.fg3, 'left');
    readout(ctx, px0, py1 + (pr ? 18 : 22), 'In', `${zz >= 0 ? ' ' : ''}${zz.toFixed(2)}`, ls * 0.92);
    readout(ctx, px0 + (px1 - px0) * 0.52, py1 + (pr ? 18 : 22), 'Out', aa.toFixed(2), ls * 0.92);
    if (!pr) d.label(ctx, zz < 0 ? 'Negative in, almost nothing out' : 'Positive in, passes through', px0, py1 + 44, ls * 0.85, P.fg2);
    d.label(ctx, pr ? 'GPT-3: 49,152 per layer' : 'GPT-3: 49,152 neurons per layer · 96 layers', pr ? ix : ix, iyy + ih + (pr ? 14 : 22), ls * 0.85, P.fg3);
  }

  /* =========================================================================================================
     07 PREDICTION: score every token, soften or sharpen with temperature, draw one, append, repeat.
     ========================================================================================================= */
  const DIST = [
    { toks: [' Austin', ' Texas', ' Houston', ' located', ' the', ' Dallas', ' home', ' Fort'], p: [0.74, 0.06, 0.045, 0.03, 0.028, 0.022, 0.015, 0.012], tail: 0.048, u: 0.37 },
    { toks: ['.', ',', ' and', ' (', ' which', '\\n', '!', ' Texas'], p: [0.58, 0.2, 0.06, 0.04, 0.03, 0.025, 0.015, 0.01], tail: 0.04, u: 0.25 },
  ];
  const probs = (D, T) => {
    const l = D.p.map((v) => Math.log(v) / T), tl = 1000 * Math.exp(Math.log(D.tail / 1000) / T);
    const mx = Math.max(...l), e = l.map((v) => Math.exp(v - mx)), te = tl / Math.exp(mx);
    const zz = e.reduce((a, b) => a + b, 0) + te;
    return { p: e.map((v) => v / zz), tail: te / zz };
  };
  function tempAt(t) {
    if (t < 1.4) return 1;
    if (t < 2.6) return lerp(1, 0.35, load(k(t, 1.4, 2.6)));
    if (t < 3.9) return lerp(0.35, 1.8, load(k(t, 2.7, 3.9)));
    if (t < 5.6) return lerp(1.8, 1, load(k(t, 4.6, 5.6)));
    return 1;
  }

  function sPrediction(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const step = t < 8.0 ? 0 : 1, D = DIST[step], T = tempAt(t);
    const { p, tail } = probs(D, T);
    const lt = step ? t - 8.0 : t;
    const F = pr ? 15 : clamp(W * 0.018, 15, 24);
    // The sentence so far.
    const s1 = expo(k(t, 7.6, 7.75)), s2 = expo(k(t, 10.6, 10.75));
    ctx.font = d.sans(F, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const words = (PROMPT.join('') + (s1 > 0 ? ' Austin' : '') + (s2 > 0 ? '.' : '')).split(/(?= )/);
    let x = W * 0.07, y = H * (pr ? 0.2 : 0.15);
    const maxX = W * 0.93;
    words.forEach((wd, i) => {
      const w = ctx.measureText(wd).width;
      if (x + w > maxX) { x = W * 0.07; y += F * 1.35; wd = wd.trimStart(); }
      const isNew = (s1 > 0 && wd.trim() === 'Austin' && i >= 8) || (s2 > 0 && wd === '.');
      ctx.globalAlpha = 1; ctx.fillStyle = isNew ? P.signal : P.fg;
      ctx.fillText(wd, x, y);
      x += ctx.measureText(wd).width;
    });
    ctx.globalAlpha = 1; ctx.fillStyle = P.signal; ctx.fillRect(x + 3, y - F * 0.78, F * 0.42, F * 0.92);

    // Bars.
    const rowH = pr ? H * 0.052 : H * 0.058, y0 = pr ? H * 0.32 : H * 0.29;
    const labR = W * (pr ? 0.3 : 0.36), b0 = W * (pr ? 0.33 : 0.385), bW = W * (pr ? 0.5 : 0.34);
    const swap = step ? expo(k(lt, 0.25, 0.6)) : expo(k(t, 0.05, 0.4));
    const leave = step ? 0 : load(k(t, 8.0 - 0.3, 8.0));
    const drawP = step ? k(lt, 1.4, 1.9) : k(t, 6.0, 6.6);
    const pick = drawP >= 1 ? 0 : -1;
    D.toks.forEach((tk, i) => {
      const yy = y0 + (i + 0.5) * rowH, a = swap * (1 - leave);
      ctx.globalAlpha = a;
      d.code(ctx, tk.replace(/^ /, '·'), labR, yy, ls * 1.02, pick === i ? P.fg : P.fg2, 'right');
      ctx.fillStyle = 'rgba(241,238,230,.07)'; ctx.fillRect(b0, yy - rowH * 0.22, bW, rowH * 0.44);
      ctx.fillStyle = pick === i ? P.signal : P.fg; ctx.globalAlpha = a * (pick === i ? 1 : 0.85);
      ctx.fillRect(b0, yy - rowH * 0.22, Math.max(1, bW * p[i] * swap), rowH * 0.44);
      ctx.globalAlpha = a;
      d.label(ctx, `${(p[i] * 100).toFixed(p[i] < 0.1 ? 1 : 0)}%`, b0 + bW * p[i] * swap + 8, yy, ls * 0.88, P.fg3);
    });
    ctx.globalAlpha = swap * (1 - leave);
    if (pr) d.label(ctx, `All other tokens · ${(tail * 100).toFixed(1)}%`, W * 0.07, y0 + 8.7 * rowH, ls * 0.86, P.fg3);
    else d.label(ctx, `All other tokens · ${(tail * 100).toFixed(1)}%`, labR, y0 + 8.6 * rowH, ls * 0.86, P.fg3, 'right');
    d.label(ctx, step ? 'Next token after “Austin”' : 'Next token', b0, y0 - 12, ls * 0.9, P.fg3);

    // The draw: a strip of the whole distribution; a marker falls to a random point.
    const sx = W * (pr ? 0.925 : 0.82), sw = pr ? 8 : 12, sH = 8 * rowH, sy0 = y0;
    let acc = 0;
    p.forEach((v, i) => { ctx.globalAlpha = swap * (1 - leave) * (i % 2 ? 0.35 : 0.6); ctx.fillStyle = pick === i ? P.signal : P.fg; ctx.fillRect(sx, sy0 + acc * sH, sw, Math.max(0.5, v * sH - 1)); acc += v; });
    ctx.globalAlpha = 0.18; ctx.fillStyle = P.fg; ctx.fillRect(sx, sy0 + acc * sH, sw, tail * sH);
    ctx.globalAlpha = 1;
    if (!pr) d.label(ctx, 'Draw', sx + sw / 2, sy0 - 12, ls * 0.88, P.fg3, 'center');
    if (drawP > 0) {
      const my = lerp(sy0 - 30, sy0 + D.u * sH, quart(drawP));
      ctx.globalAlpha = 1 - leave; ctx.strokeStyle = P.signal; ctx.lineWidth = 1.5;
      d.line(ctx, sx - 8, my, sx + sw + 8, my); ctx.lineWidth = 1;
      d.sq(ctx, sx - 10, my, 7, P.signal);
    }
    // The chosen token flies to the end of the sentence.
    const fly = step ? k(lt, 2.0, 2.6) : k(t, 6.8, 7.6);
    if (fly > 0 && fly < 1) {
      const e = load(fly);
      ctx.globalAlpha = 1;
      d.code(ctx, D.toks[0].trim(), lerp(labR - 30, x, e), lerp(y0 + 0.5 * rowH, y - F * 0.35, e), ls * 1.1, P.signal, 'center');
    }
    // Temperature: a tick scale with the signal square riding it.
    const ty = H * (pr ? 0.86 : 0.88);
    const X = d.ticksH(ctx, b0, b0 + bW, ty, 0, 2, 0.1, [0, 0.5, 1, 1.5, 2], ls * 0.82, RULE2, (v) => v.toFixed(1));
    d.sq(ctx, X(T), ty - 7, 8, P.signal);
    d.label(ctx, pr ? 'Temp' : 'Temperature', labR, ty, ls * 0.9, P.fg2, 'right');
    d.label(ctx, T.toFixed(2), b0 + bW + 14, ty, ls, P.fg, 'left');
    d.label(ctx, pr ? 'Scores illustrative' : 'Scores illustrative · 8 of ~100,000 tokens shown', W * 0.07, H * 0.965, ls * 0.85, P.fg3);
  }

  /* =========================================================================================================
     08 TRAINING: a loss landscape, a noisy descent, the backward pass and the loss curve.
     ========================================================================================================= */
  /* A curved valley: gradient descent with momentum and a little noise drops in quickly, then crawls along the
     valley floor to the minimum, the shape of most real training curves. */
  const LAND = (() => {
    const f = (x, y) => 0.42 * (x - 0.55) ** 2 + 1.5 * (y - 0.9 * x * x + 0.5) ** 2 + 0.035 * Math.sin(7 * x + 1) * Math.cos(6 * y) + 0.12;
    const r = BG.rng(5), e = 1e-3;
    let px = -0.85, py = 0.8, vx = 0, vy = 0;
    const path = [[px, py]];
    for (let i = 0; i < 200; i++) {
      const gx = (f(px + e, py) - f(px - e, py)) / (2 * e), gy = (f(px, py + e) - f(px, py - e)) / (2 * e);
      vx = 0.8 * vx - 0.03 * gx + r.n() * 0.004; vy = 0.8 * vy - 0.03 * gy + r.n() * 0.004;
      px += vx; py += vy;
      path.push([px, py]);
    }
    const loss = path.map(([x, y]) => f(x, y));
    // Cumulative path length, so the ball can travel at an even pace on screen.
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    return { f, path, loss, cum };
  })();

  function sTraining(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const cx = W * (pr ? 0.5 : 0.35), cy = H * (pr ? 0.34 : 0.5), S = pr ? Math.min(W * 0.26, H * 0.22) : Math.min(W * 0.18, H * 0.38);
    const yaw = 0.65 + t * 0.06, pitch = 0.62, cam = 4.5;
    const hgt = (x, y) => -(2.2 * Math.tanh(LAND.f(x, y) / 2.2) * 0.3 - 0.3);
    const N = 26;
    // The surface as a hairline mesh, fainter with depth.
    ctx.strokeStyle = P.fg; ctx.lineWidth = 1;
    for (let dir = 0; dir < 2; dir++) for (let i = 0; i <= N; i++) {
      ctx.beginPath();
      let zsum = 0;
      for (let j = 0; j <= N; j++) {
        const u = -1 + (2 * i) / N, v = -1 + (2 * j) / N;
        const [x, y] = dir ? [u, v] : [v, u];
        const s = proj([x, hgt(x, y), y], yaw, pitch, cx, cy, S, cam);
        zsum += s[2];
        if (j) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]);
      }
      ctx.globalAlpha = 0.07 + 0.2 * clamp((1 - zsum / (N + 1)) / 2);
      ctx.stroke();
    }
    // The descent, travelling at an even pace along its own path.
    const K = LAND.path.length - 1, goal = load(k(t, 0.8, 10.6)) * LAND.cum[K];
    let idx = 0;
    while (idx < K && LAND.cum[idx + 1] <= goal) idx++;
    const frac = idx < K ? (goal - LAND.cum[idx]) / Math.max(1e-9, LAND.cum[idx + 1] - LAND.cum[idx]) : 0;
    const at = (q, f = 0) => {
      const a = LAND.path[q], b = LAND.path[Math.min(K, q + 1)];
      const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f);
      return proj([x, hgt(x, y) - 0.012, y], yaw, pitch, cx, cy, S, cam);
    };
    ctx.globalAlpha = 0.9; ctx.strokeStyle = P.fg; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let q = 0; q <= idx; q++) { const s = at(q); if (q) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); }
    const sn = at(idx, frac);
    ctx.lineTo(sn[0], sn[1]);
    ctx.stroke(); ctx.lineWidth = 1;
    const s0 = at(0);
    ctx.globalAlpha = 1; d.hollow(ctx, s0[0], s0[1], 8, P.fg);
    d.label(ctx, 'Random start', s0[0] + 10, s0[1] - 10, ls * 0.85, P.fg3);
    d.sq(ctx, sn[0], sn[1], 9, P.signal);
    const done = expo(k(t, 10.6, 10.9));
    if (done > 0) { ctx.globalAlpha = done; d.label(ctx, pr ? 'A low point' : 'A low point: one of many in a real network', sn[0] + 12, sn[1] + 16, ls * 0.85, P.fg); }
    ctx.globalAlpha = 1;
    d.label(ctx, pr ? '2 of billions of dimensions' : 'The landscape: 2 of billions of dimensions', W * 0.07, H * (pr ? 0.955 : 0.94), ls * 0.88, P.fg3);

    // The network: forward in bone, backward in red, then every weight moves.
    const nx = W * (pr ? 0.08 : 0.68), ny = H * (pr ? 0.66 : 0.17), nw = W * (pr ? 0.36 : 0.26), nh = H * (pr ? 0.17 : 0.27);
    const layers = [3, 5, 5, 2];
    const pos = layers.map((n, l) => Array.from({ length: n }, (_, i) => [nx + (l / (layers.length - 1)) * nw, ny + ((i + 0.5) / n) * nh]));
    const cyc = (t % 2.4) / 2.4, fw = k(cyc, 0.02, 0.38), bw = k(cyc, 0.46, 0.82), upd = pulse(cyc * 2.4, 2.0, 2.2, 0.08, 0.2);
    for (let l = 0; l < layers.length - 1; l++) pos[l].forEach((a, i) => pos[l + 1].forEach((b, j) => {
      const mid = (l + 0.5) / (layers.length - 1);
      const f = fw > mid ? 1 : 0, bk = bw > 1 - mid ? 1 : 0;
      const wseed = Math.sin((l + 1) * 12.9898 + i * 78.233 + j * 37.719) * 0.5 + 0.5;
      ctx.globalAlpha = 0.14 + 0.32 * f * (1 - bk) + 0.5 * bk * (1 - k(cyc, 0.86, 0.99));
      ctx.strokeStyle = bk && cyc < 0.99 ? P.signal : P.fg;
      ctx.lineWidth = 0.6 + 1.6 * wseed + upd * 1.2 * Math.sin(i * 3 + j * 5 + l);
      d.line(ctx, a[0], a[1], b[0], b[1]);
    }));
    ctx.lineWidth = 1; ctx.globalAlpha = 1;
    pos.flat().forEach(([x, y]) => d.sq(ctx, x, y, 7, P.fg));
    const fx = lerp(nx, nx + nw, fw), bx = lerp(nx + nw, nx, bw);
    if (fw > 0 && fw < 1) { ctx.strokeStyle = P.fg; ctx.globalAlpha = 0.7; d.line(ctx, fx, ny - 6, fx, ny + nh + 6); }
    if (bw > 0 && bw < 1) { ctx.strokeStyle = P.signal; ctx.globalAlpha = 0.9; d.line(ctx, bx, ny - 6, bx, ny + nh + 6); }
    ctx.globalAlpha = 1;
    d.label(ctx, 'Forward: predict', nx, ny - 18, ls * 0.88, fw > 0 && fw < 1 ? P.fg : P.fg3);
    d.sq(ctx, nx + 3, ny + nh + 20, 6, P.signal);
    d.label(ctx, pr ? 'Backward: error' : 'Backward: error to every weight', nx + 12, ny + nh + 20, ls * 0.88, bw > 0 && bw < 1 ? P.fg : P.fg3);

    // The loss curve.
    const lx0 = W * (pr ? 0.56 : 0.68), ly0 = H * (pr ? 0.66 : 0.58), lw = W * (pr ? 0.37 : 0.26), lh = H * (pr ? 0.17 : 0.24);
    ctx.strokeStyle = RULE2; d.line(ctx, lx0, ly0, lx0, ly0 + lh); d.line(ctx, lx0, ly0 + lh, lx0 + lw, ly0 + lh);
    const lmax = Math.max(...LAND.loss), lmin = Math.min(...LAND.loss);
    ctx.strokeStyle = P.fg; ctx.lineWidth = 1.25; ctx.beginPath();
    const LX = (q) => lx0 + (Math.log(1 + q) / Math.log(1 + K)) * lw;
    for (let q = 0; q <= idx; q++) { const xx = LX(q), yy = ly0 + lh - ((LAND.loss[q] - lmin) / (lmax - lmin)) * lh * 0.92; if (q) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
    ctx.stroke(); ctx.lineWidth = 1;
    d.sq(ctx, LX(idx), ly0 + lh - ((LAND.loss[idx] - lmin) / (lmax - lmin)) * lh * 0.92, 7, P.signal);
    d.label(ctx, 'Loss', lx0, ly0 - 12, ls * 0.88, P.fg3);
    d.label(ctx, pr ? 'Steps (log)' : 'Steps · log scale', lx0 + lw, ly0 + lh + 20, ls * 0.88, P.fg3, 'right');
  }

  /* =========================================================================================================
     09 SUPERPOSITION: five features in two neurons; clean reads, interference, then a sparse autoencoder.
     ========================================================================================================= */
  const SPN = ['Golden Gate', 'DNA', 'Sarcasm', 'Base64', 'French'];
  const SPSEQ = [[0, []], [0.6, [0]], [2.2, [2]], [3.8, [0, 1]], [5.4, [1, 3]], [7.4, [4]], [10.2, [0]], [11.6, [3]]];
  const SAE_IX = [3, 11, 6, 15, 8];
  function spState(t) {
    let i = 0;
    while (i < SPSEQ.length - 1 && SPSEQ[i + 1][0] <= t) i++;
    const [t0, set] = SPSEQ[i], prev = i ? SPSEQ[i - 1][1] : [];
    const e = expo(k(t, t0, t0 + 0.35));
    const on = SPN.map((_, j) => lerp(prev.includes(j) ? 1 : 0, set.includes(j) ? 1 : 0, e));
    return { on, set, h: BG.sp.hidden(5, on) };
  }

  function sSuper(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const { on, set, h } = spState(t);
    const pb = pr ? [W * 0.06, H * 0.13, W * 0.88, H * 0.38] : [W * 0.05, H * 0.12, W * 0.42, H * 0.74];
    BG.sp.plane(ctx, pb[0], pb[1], pb[2], pb[3], 5, SPN, on, h, ls, { unit: 0.5 });
    ctx.globalAlpha = 1;
    readout(ctx, pb[0] + (pr ? 0 : pb[2] * 0.12), pb[1] + pb[3] + (pr ? 8 : 4), 'Neurons:', `${h[0] >= 0 ? ' ' : ''}${h[0].toFixed(2)}  ${h[1] >= 0 ? ' ' : ''}${h[1].toFixed(2)}`, ls * 0.92);
    // Readout rows, then the sparse autoencoder.
    const rb = pr ? [W * 0.06, H * 0.6, W * 0.88, H * 0.27] : [W * 0.53, H * 0.3, W * 0.41, H * 0.46];
    const sae = expo(k(t, 8.6, 8.95));
    if (sae < 1) {
      ctx.globalAlpha = 1 - sae;
      const read = BG.sp.read(5, h);
      if (!pr) d.label(ctx, 'Each feature read back', rb[0], rb[1] - 18, ls * 0.9, P.fg3);
      ctx.save(); ctx.globalAlpha = 1 - sae;
      const wrong = BG.sp.rows(ctx, rb[0], rb[1], rb[2], rb[3], 5, SPN, on.map((v) => (v > 0.5 ? 1 : 0)), read, ls);
      ctx.restore();
      const intf = pulse(t, 5.6, 7.4) * (1 - sae);
      const sy = rb[1] + 5 * Math.min(30, rb[3] / 5) + 22;
      if (intf > 0 && wrong) { ctx.globalAlpha = intf; d.sq(ctx, rb[0], sy, 6, P.signal); d.label(ctx, 'Interference: two at once, read back wrong', rb[0] + 12, sy, ls * 0.92, P.fg); }
      ctx.globalAlpha = 1 - sae;
      if (t < 5.4 && t > 0.6) d.label(ctx, set.length > 1 ? 'Neighbours: still read back cleanly' : 'One at a time: read back cleanly', rb[0], sy, ls * 0.92, P.fg2);
    }
    if (sae > 0) {
      ctx.globalAlpha = sae;
      const x0 = rb[0], y0 = rb[1], w = rb[2], hh = rb[3];
      d.label(ctx, 'Sparse autoencoder', x0, y0 - 18, ls * 0.9, P.fg);
      const n1 = [x0 + 6, y0 + hh * 0.42], n2 = [x0 + 6, y0 + hh * 0.58];
      const lat = Array.from({ length: 20 }, (_, i) => [x0 + w * 0.62, y0 + (i + 0.5) * (hh / 20)]);
      const act = set.length ? SAE_IX[set[0]] : -1;
      lat.forEach(([lx, ly], i) => {
        ctx.globalAlpha = sae * (i === act ? 0.9 : 0.08); ctx.strokeStyle = i === act ? P.signal : P.fg;
        d.line(ctx, n1[0] + 10, n1[1], lx - 6, ly); d.line(ctx, n2[0] + 10, n2[1], lx - 6, ly);
      });
      ctx.globalAlpha = sae;
      cell(ctx, n1[0], n1[1] - 5, 10, clamp(h[0], -1, 1), sae); cell(ctx, n2[0], n2[1] - 5, 10, clamp(h[1], -1, 1), sae);
      ctx.globalAlpha = sae;
      d.label(ctx, '2 neurons', n1[0], n2[1] + 22, ls * 0.82, P.fg3);
      lat.forEach(([lx, ly], i) => {
        const s = Math.min(9, hh / 20 - 3);
        ctx.globalAlpha = sae; ctx.fillStyle = i === act ? P.signal : 'rgba(241,238,230,.14)';
        ctx.fillRect(lx - s / 2, ly - s / 2, s, s);
        if (i === act) d.label(ctx, SPN[set[0]], lx + 12, ly, ls * 0.9, P.fg);
      });
      ctx.globalAlpha = sae;
      d.label(ctx, '20 features · 1 active', x0 + w * 0.62, y0 + hh + 16, ls * 0.82, P.fg3, 'center');
      d.label(ctx, pr ? 'Claude 3 Sonnet: up to 34 million' : 'In Claude 3 Sonnet: up to 34 million features', x0, y0 + hh + 40, ls * 0.88, P.fg2);
    }
    ctx.globalAlpha = 1;
    d.label(ctx, pr ? 'After Elhage et al. 2022' : 'After Elhage et al. 2022 · names illustrative', W * 0.94, H * 0.972, ls * 0.85, P.fg3, 'right');
  }

  /* =========================================================================================================
     10 THE DARK: the whole model as a field; small lit islands are the mechanisms traced so far.
     ========================================================================================================= */
  const DARK = (() => {
    const r = BG.rng(47), E = [1.35, 0.72, 0.85];
    const inE = () => { let x, y, z; do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1); return [x * E[0], y * E[1], z * E[2]]; };
    const clumps = Array.from({ length: 30 }, inE);
    const pts = [];
    for (let i = 0; i < 2100; i++) {
      if (r() < 0.68) { const c = clumps[Math.floor(r() * clumps.length)]; pts.push([c[0] + r.n() * 0.13, c[1] + r.n() * 0.13, c[2] + r.n() * 0.13]); }
      else pts.push(inE());
    }
    const centers = [[-0.85, -0.22, 0.25], [-0.3, 0.38, -0.45], [0.2, -0.36, 0.5], [0.72, 0.18, -0.2], [0.05, 0.12, 0.05], [0.95, -0.3, 0.35]];
    const islands = centers.map((c) => Array.from({ length: 30 }, () => [c[0] + r.n() * 0.05, c[1] + r.n() * 0.05, c[2] + r.n() * 0.05]));
    return { pts, centers, islands };
  })();
  const ISL = [['Induction heads', '2022'], ['Indirect-object circuit', '2022'], ['Modular addition', '2023'], ['Golden Gate feature', '2024'], ['Two-hop reasoning', '2025'], ['Rhyme planning', '2025']];
  const QS = ['What is a feature?', 'Why does scale work?', 'Why does it generalise?', 'Does it say what it does?', 'Where do falsehoods come from?', 'Can it know itself?'];
  const QL = [[0.07, 0.22], [0.66, 0.16], [0.05, 0.78], [0.6, 0.86], [0.36, 0.1], [0.76, 0.66]];
  const QP = [[0.08, 0.17], [0.08, 0.3], [0.08, 0.43], [0.08, 0.56], [0.08, 0.69], [0.08, 0.82]];

  function sDark(g, t) {
    const { ctx, W, H, pr, ls } = g;
    const cx = W / 2, cy = H / 2, S = pr ? Math.min(H * 0.27, W * 0.45) : Math.min(W * 0.27, H * 0.45);
    const yaw = 0.3 + t * 0.05, pitch = 0.25;
    const P2 = (p) => { const s = proj(p, yaw, pitch, 0, 0, S); return pr ? [cx - s[1], cy + s[0], s[2]] : [cx + s[0], cy + s[1], s[2]]; };
    const title = expo(k(t, 12.6, 13.0));
    const dim = 1 - 0.6 * title;
    ctx.fillStyle = P.fg;
    DARK.pts.forEach((p) => {
      const s = P2(p), depth = clamp((1 - s[2]) / 2.4);
      ctx.globalAlpha = (0.07 + 0.21 * depth) * dim;
      const z = 1 + depth;
      ctx.fillRect(s[0] - z / 2, s[1] - z / 2, z, z);
    });
    const qa = expo(k(t, 6.4, 6.8));
    DARK.islands.forEach((isl, i) => {
      const li = 0.9 + i * 0.85, on = expo(k(t, li, li + 0.3));
      if (on <= 0) return;
      const fresh = 1 - load(k(t, li + 0.6, li + 1.1));
      isl.forEach((p) => { const s = P2(p); ctx.globalAlpha = on * 0.9 * dim; ctx.fillStyle = fresh > 0.5 ? P.signal : P.fg; ctx.fillRect(s[0] - 1.25, s[1] - 1.25, 2.5, 2.5); });
      const c = P2(DARK.centers[i]);
      const dx = c[0] - cx, dy = c[1] - cy, dl = Math.hypot(dx, dy) || 1;
      const reach = pr ? 36 : 54;
      let tx = c[0] + (dx / dl) * reach, ty = c[1] + (dy / dl) * reach;
      const txt = `${ISL[i][0]} · ${ISL[i][1]}`, tw = d.labelW(ctx, txt, ls * 0.86) + ls * 1.4;
      const right = dx >= 0;
      tx = clamp(tx, right ? 8 : tw + 8, right ? W - tw - 8 : W - 8); ty = clamp(ty, 56, H - 40);
      const la = on * (pr ? 1 - qa : 1 - 0.45 * qa) * dim;
      if (la < 0.01) return;
      ctx.globalAlpha = la; ctx.strokeStyle = P.fg;
      d.line(ctx, c[0], c[1], tx, ty);
      d.chip(ctx, txt, tx, ty, ls * 0.86, { align: right ? 'left' : 'right', alpha: la, frame: fresh > 0.5 ? P.signal : RULE2 });
    });
    QS.forEach((q, i) => {
      const a = expo(k(t, 6.6 + i * 0.85, 6.9 + i * 0.85)) * dim;
      if (a <= 0) return;
      const [px, py] = (pr ? QP : QL)[i];
      ctx.globalAlpha = a;
      d.hollow(ctx, W * px, H * py, 7, P.fg2);
      d.chip(ctx, q, W * px + 9, H * py, ls * 0.95, { alpha: a, fill: P.ground, frame: 'rgba(241,238,230,.2)', color: P.fg });
    });
    if (title > 0) {
      ctx.globalAlpha = title;
      const F = pr ? W * 0.1 : Math.min(W * 0.072, 92);
      ctx.font = d.sans(F, 800); ctx.fillStyle = P.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      d.track(ctx, -F * 0.03);
      if (pr) { ctx.fillText('THROUGH', cx, cy - F * 0.1); ctx.fillText('BLACK GLASS', cx, cy + F * 0.86); }
      else ctx.fillText('THROUGH BLACK GLASS', cx, cy + F * 0.3);
      d.track(ctx, 0);
      const tw = pr ? ctx.measureText('BLACK GLASS').width : ctx.measureText('THROUGH BLACK GLASS').width;
      const ly = pr ? cy + F * 1.25 : cy + F * 0.7;
      ctx.strokeStyle = RULE2; d.line(ctx, cx - tw / 2, ly, cx + tw / 2, ly);
      d.sq(ctx, cx - tw / 2 + 3, ly + 18, 6, P.signal);
      d.label(ctx, 'A field guide in motion', cx - tw / 2 + 14, ly + 18, ls, P.fg3);
    }
    ctx.globalAlpha = 1 - title;
    d.label(ctx, pr ? 'Lit: traced · dark: unknown · not to scale' : 'Lit: mechanisms traced so far · dark: everything else · not to scale', W * 0.06, H * 0.965, ls * 0.85, P.fg3);
  }

  /* =========================================================================================================
     Chapters and the timeline.
     ========================================================================================================= */
  const SCENES = [
    { name: 'Agent', title: 'A model in a loop', text: 'The agent reads its transcript, writes what comes next and, when that is a tool call, gets the result pasted back in. Sub-agents run the same loop with contexts of their own.', dur: 13.8, poster: 8.6, draw: sAgent },
    { name: 'Tokens', title: 'Text becomes numbers', text: 'The prompt is cut into tokens. Each token’s number picks a row of the embedding table, a list of thousands of numbers, which becomes that token’s vector.', dur: 11, poster: 9.2, draw: sTokens },
    { name: 'Meaning', title: 'A space of directions', text: 'Those numbers are coordinates. Training arranges them so related words sit close together, and some relationships, like state to capital, point the same way.', dur: 11, poster: 7.2, draw: sMeaning },
    { name: 'Attention', title: 'Tokens consult each other', text: 'A head compares the last token’s query with the keys of earlier tokens, turns the scores into weights with a softmax, and blends in the values of the best matches. Tokens only ever look back.', dur: 12.6, poster: 3.6, draw: sAttention },
    { name: 'Stream', title: 'Layer by layer', text: 'Every layer reads the running sum and adds to it. Traced in Claude 3.5 Haiku: Dallas activates Texas, and Texas plus “a capital” points to Austin. Swap Texas for California and it says Sacramento.', dur: 14, poster: 7.6, draw: sStream },
    { name: 'Neurons', title: 'A weighted sum and a bend', text: 'Inside each MLP block, neurons multiply, add and bend. About two-thirds of the weights live in these blocks, and facts seem to be stored among them.', dur: 11, poster: 2.6, draw: sNeurons },
    { name: 'Prediction', title: 'One token at a time', text: 'The final vector scores every token in the vocabulary. Temperature sharpens or flattens the odds. One token is drawn and appended, and the whole stack runs again.', dur: 12, poster: 7.7, draw: sPrediction },
    { name: 'Training', title: 'Nobody wrote the rules', text: 'The error on each guess flows backwards through the network and every weight moves a little downhill. Over trillions of tokens, the structure in the earlier chapters forms.', dur: 13, poster: 10.6, draw: sTraining },
    { name: 'Superposition', title: 'More ideas than neurons', text: 'Five features share two neurons as nearly perpendicular directions. One or two neighbours at a time read back cleanly; others interfere. A sparse autoencoder pulls features apart again.', dur: 13, poster: 6.4, draw: sSuper },
    { name: 'The dark', title: 'What is still unknown', text: 'Lit: mechanisms researchers have traced, one model and one behaviour at a time. Dark: everything else. The open questions live in the dark.', dur: 15, poster: 11.8, draw: sDark },
  ];
  let total = 0;
  SCENES.forEach((s) => { s.a = total; total += s.dur; });
  const X = 0.6;

  const lsFor = (W) => clamp(W / 100, 10, 12.5);
  const mkG = (ctx, W, H) => ({ ctx, W, H, pr: W / H < 1.15, ls: lsFor(W) });
  function drawScene(i, g, lt) {
    const s = SCENES[i];
    g.ctx.save();
    s.draw(g, clamp(lt, 0, s.dur));
    g.ctx.restore();
    g.ctx.globalAlpha = 1;
  }
  BG.film = { scenes: SCENES, total, drawScene, mkG };

  /* ---- The player ---- */
  const host = document.querySelector('[data-film]');
  if (!host) return;
  const canvas = host.querySelector('canvas');
  const S = BG.surface(canvas);
  const buf = [document.createElement('canvas'), document.createElement('canvas')];
  const sceneAt = (t) => { let i = 0; while (i < SCENES.length - 1 && SCENES[i + 1].a <= t) i++; return i; };
  const wrap = (t) => ((t % total) + total) % total;

  function render(t) {
    if (!S.W) return;
    S.begin();
    const ctx = S.ctx, n = SCENES.length;
    const i = sceneAt(t), lt = t - SCENES[i].a;
    let out = -1, inn = -1, e = 0, ltOut = 0, ltIn = 0;
    if (lt > SCENES[i].dur - X / 2) { out = i; inn = (i + 1) % n; e = (lt - (SCENES[i].dur - X / 2)) / X; ltOut = lt; ltIn = lt - SCENES[i].dur; }
    else if (lt < X / 2) { out = (i - 1 + n) % n; inn = i; e = (lt + X / 2) / X; ltOut = SCENES[out].dur + lt; ltIn = lt; }
    if (out < 0) { drawScene(i, mkG(ctx, S.W, S.H), lt); return; }
    const layer = (b, idx, ltx) => {
      if (b.width !== S.canvas.width || b.height !== S.canvas.height) { b.width = S.canvas.width; b.height = S.canvas.height; }
      const bc = b.getContext('2d');
      bc.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); bc.clearRect(0, 0, S.W, S.H); bc.globalAlpha = 1;
      drawScene(idx, mkG(bc, S.W, S.H), ltx);
    };
    layer(buf[0], out, ltOut); layer(buf[1], inn, ltIn);
    // The outgoing scene loads out first; the incoming one drives in as it goes, so the two barely overlap.
    const eo = load(k(e, 0, 0.6)), ei = expo(k(e, 0.4, 1));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const Wd = S.canvas.width, Hd = S.canvas.height;
    const so = 1 + 0.06 * eo, si = 0.97 + 0.03 * ei;
    ctx.globalAlpha = 1 - eo;
    ctx.drawImage(buf[0], (Wd - Wd * so) / 2, (Hd - Hd * so) / 2, Wd * so, Hd * so);
    ctx.globalAlpha = ei;
    ctx.drawImage(buf[1], (Wd - Wd * si) / 2, (Hd - Hd * si) / 2, Wd * si, Hd * si);
    ctx.globalAlpha = 1;
  }

  // Interface.
  const $ = (s) => host.querySelector(s);
  const btn = $('[data-film-play]'), track = $('[data-film-track]'), fill = $('[data-film-fill]'), headEl = $('[data-film-head]');
  const elN = $('[data-film-n]'), elName = $('[data-film-name]'), elTitle = $('[data-film-title]'), elText = $('[data-film-text]'), elTime = $('[data-film-time]'), elLink = $('[data-film-link]');
  const bar = $('[data-film-chapters]');
  const two = (v) => String(v).padStart(2, '0');
  const clock = (s) => `${two(Math.floor(s / 60))}:${two(Math.floor(s % 60))}`;
  $('[data-film-total]').textContent = clock(total);
  track.setAttribute('aria-valuemax', String(Math.round(total)));
  const chapBtns = SCENES.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.style.setProperty('--d', String(s.dur));
    b.tabIndex = i ? -1 : 0;
    b.setAttribute('aria-label', `Chapter ${i + 1}: ${s.name}`);
    b.innerHTML = `<span>${two(i + 1)}</span> <span class="nm">${s.name}</span>`;
    b.addEventListener('click', () => jump(i));
    bar.appendChild(b);
    return b;
  });
  let t = SCENES[0].poster, playing = false, userPaused = false, visible = false, cur = -1, lastSec = -1;

  function ui() {
    const i = sceneAt(t);
    const f = t / total;
    fill.style.transform = `scaleX(${f.toFixed(4)})`;
    headEl.style.left = `${(f * 100).toFixed(3)}%`;
    const sec = Math.floor(t);
    if (sec !== lastSec) {
      lastSec = sec;
      elTime.textContent = clock(t);
      track.setAttribute('aria-valuenow', String(sec));
      track.setAttribute('aria-valuetext', `${sec} seconds, chapter ${i + 1}, ${SCENES[i].name}`);
    }
    if (i !== cur) {
      cur = i;
      const s = SCENES[i];
      elN.textContent = two(i + 1); elName.textContent = s.name;
      elTitle.textContent = s.title; elText.textContent = s.text;
      elLink.href = `#s${two(i + 1)}`;
      elLink.firstElementChild.textContent = `Read chapter ${two(i + 1)}`;
      chapBtns.forEach((b, j) => { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    }
  }
  const frame = (dt) => { t = wrap(t + dt); render(t); ui(); };
  function setPlaying(on) {
    if (on === playing) return;
    playing = on;
    if (on) BG.play(frame); else BG.pause(frame);
    btn.textContent = on ? 'Pause' : 'Play';
    btn.setAttribute('aria-label', on ? 'Pause the film' : 'Play the film');
  }
  const seek = (v) => { t = wrap(v); render(t); ui(); };
  function jump(i) {
    // Playing: start the chapter just past its crossover. Paused: show the chapter's still.
    seek(SCENES[i].a + (playing ? X / 2 + 0.01 : SCENES[i].poster));
    chapBtns.forEach((b, j) => { b.tabIndex = j === i ? 0 : -1; });
  }
  btn.addEventListener('click', () => { userPaused = playing; setPlaying(!playing); });
  bar.addEventListener('keydown', (e) => {
    const i = chapBtns.indexOf(document.activeElement);
    if (i < 0) return;
    let j = i;
    if (e.key === 'ArrowRight') j = (i + 1) % SCENES.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + SCENES.length) % SCENES.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = SCENES.length - 1;
    else return;
    e.preventDefault();
    chapBtns[j].focus();
    jump(j);
  });
  // Scrubbing: drag along the track; playback resumes afterwards if it was running.
  let scrub = null;
  const at = (e) => { const r = track.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width) * (total - 0.01); };
  track.addEventListener('pointerdown', (e) => { scrub = { was: playing }; setPlaying(false); track.setPointerCapture(e.pointerId); seek(at(e)); });
  track.addEventListener('pointermove', (e) => { if (scrub) seek(at(e)); });
  const end = () => { if (!scrub) return; const was = scrub.was; scrub = null; if (was) setPlaying(true); };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 5, ArrowLeft: -5, PageUp: 15, PageDown: -15 }[e.key];
    if (step) { e.preventDefault(); seek(clamp(t + step, 0, total - 0.01)); }
    else if (e.key === 'Home') { e.preventDefault(); seek(0); }
    else if (e.key === 'End') { e.preventDefault(); seek(total - 0.01); }
  });

  S.redraw = () => { render(t); ui(); };
  BG.onFonts(() => render(t));
  BG.watch(host.querySelector('.film-stage'), (v) => {
    visible = v;
    if (v && !userPaused && !BG.reduced()) setPlaying(true);
    else if (!v) setPlaying(false);
  }, 0.5);
  BG.onReduced(() => { if (BG.reduced()) { setPlaying(false); userPaused = true; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); else if (visible && !userPaused && !BG.reduced()) setPlaying(true); });
  render(t); ui();
  // For captures: window.BG.film.seek(t) renders any frame.
  BG.film.seek = (v) => { setPlaying(false); userPaused = true; seek(v); };
})();
