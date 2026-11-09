/* Tus órganos cuando te enamoras — escenas, poses y efectos (personajes originales). */
'use strict';
const SC = {}; for (const s of TL.escenas) SC[s.k] = s;
// ---------- carga de imágenes ----------
const IMG = {};
const LISTA = ['kurioso_c', 'bg_cafe', 'bg_gym', 'bg_estomago', 'bg_fiesta', 'bg_cerebro', 'bg_calma'];
for (const n of ['corazon', 'cerebro', 'estomago', 'dopamina', 'adrenalina', 'oxitocina', 'pareja']) for (let k = 1; k <= 4; k++) LISTA.push(`${n}_${k}`);
const imgsReady = Promise.all(LISTA.map(k => new Promise((res, rej) => { const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => rej(k); im.src = `img/${k}.png`; })));
const VOZ = { corazon: 'COR', cerebro: 'CER', estomago: 'EST', dopamina: 'DOP', adrenalina: 'ADR', oxitocina: 'OXI', kurioso: 'NAR' };
function bg(k) { ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG['bg_' + k], 0, 0, W, H); }

// ---------- dibujar una pose ----------
// o: q (voz para "hablar"), flip, rot, hop, shake, alpha, sc (escala extra), noShadow
function pose(key, x, y, h, t, o = {}) {
  const im = IMG[key]; if (!im) return;
  const q = o.q || VOZ[key.split('_')[0]];
  const m = q ? talk(q, t) : 0;
  const ph = key.length * 1.7;
  const breathe = Math.sin(t * 2.4 + ph) * 0.012;
  const hop = o.hop ? Math.abs(Math.sin(t * (o.hopSpeed || 9) + ph)) * h * 0.08 * o.hop : 0;
  const sh = o.shake ? (Math.sin(t * 61) * 5 + Math.sin(t * 37) * 3) * o.shake : 0;
  const tilt = (o.rot || 0) + (m > 0.1 ? Math.sin(t * 6 + ph) * 0.03 : Math.sin(t * 1.3 + ph) * 0.012);
  const sq = 1 + m * 0.06 + breathe;
  const s = h / im.height * (o.sc || 1);
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha = clamp(o.alpha, 0, 1);
  if (!o.noShadow) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y - 3, h * 0.22 * (o.sc || 1), h * 0.03, 0, 0, TAU); ctx.fill(); }
  ctx.translate(x + sh, y - hop); ctx.rotate(tilt);
  ctx.scale(s * (o.flip ? -1 : 1) * (2 - sq), s * sq);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(im, -im.width / 2, -im.height);
  ctx.restore();
}
// ---------- efectos ----------
function heart(x, y, r, col, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.beginPath();
  ctx.moveTo(0, r * 0.35); ctx.bezierCurveTo(-r * 1.1, -r * 0.4, -r * 0.5, -r * 1.2, 0, -r * 0.5); ctx.bezierCurveTo(r * 0.5, -r * 1.2, r * 1.1, -r * 0.4, 0, r * 0.35);
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = r * 0.14; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.18, r * 0.1, -0.6, 0, TAU); ctx.fill();
  ctx.restore();
}
function floatingHearts(t, seed, n, x0, x1, y0, y1, size) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), sp = 0.15 + r() * 0.25, u = fract(r() + t * sp); heart(x + Math.sin(t * 2 + i) * 20, lerp(y1, y0, u), size * (0.6 + r() * 0.6), ['#ff4d6d', '#ff8fab', '#ffb3c6', '#ff5fa2'][i % 4], Math.sin(Math.PI * u)); }
}
function butterfly(x, y, s, t, col) {
  const flap = Math.abs(Math.sin(t * 16)) * 0.8 + 0.2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.scale(sd * flap, 1);
    ctx.beginPath(); ctx.ellipse(16, -10, 18, 14, -0.5, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(12, 10, 11, 9, 0.5, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(18, -12, 4, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = INK; rr(ctx, -3, -16, 6, 32, 3); ctx.fill();
  ctx.restore();
}
function swarm(t, cx, cy, n, R, seed, s = 1) {
  const r = rnd(seed), cols = ['#ff7eb6', '#7ad7ff', '#ffd23f', '#8cff9e', '#c59bff'];
  for (let i = 0; i < n; i++) { const a = t * (0.8 + r()) + r() * TAU, rr2 = R * (0.5 + r() * 0.6); butterfly(cx + Math.cos(a) * rr2, cy + Math.sin(a * 1.3) * rr2 * 0.6, (0.9 + r() * 0.6) * s, t + i, cols[i % 5]); }
}
function confetti(t, t0, seed, n = 120) {
  const r = rnd(seed), cols = ['#ffd23f', '#5bc0eb', '#ff5e7e', '#7ae582', '#ffffff', '#c59bff'], u = t - t0; if (u < 0) return;
  for (let i = 0; i < n; i++) { const x = r() * W, vy = 300 + r() * 400, y = -40 + u * vy - Math.max(0, 1.2 - u) * 0, sw = Math.sin(u * 3 + i) * 40; if (y > H + 40) continue; ctx.save(); ctx.translate(x + sw, y); ctx.rotate(u * 6 + i); ctx.fillStyle = cols[i % 6]; ctx.fillRect(-10, -5, 20, 10); ctx.restore(); }
}
function speedLines(t, x, y, w, h, dir) {
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; const r = rnd(4);
  for (let i = 0; i < 9; i++) { const yy = y + r() * h, len = 80 + r() * 140, xx = x + fract(r() + t * 3) * w * dir; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - dir * len, yy); ctx.stroke(); }
  ctx.restore();
}
function sweat(t, x, y, n = 3) { for (let k = 0; k < n; k++) { const u = fract(t * 1.2 + k / n); ctx.fillStyle = `rgba(140,210,255,${1 - u})`; const sx = x + (k - 1) * 50, sy = y + u * 90; ctx.beginPath(); ctx.moveTo(sx, sy - 18); ctx.quadraticCurveTo(sx + 11, sy, sx, sy + 8); ctx.quadraticCurveTo(sx - 11, sy, sx, sy - 18); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(); } }
function rays(cx, cy, n, R, col, rot) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot || 0); for (let k = 0; k < n; k++) { if (k % 2) continue; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, k / n * TAU, (k + 1) / n * TAU); ctx.closePath(); ctx.fill(); } ctx.restore(); }
// texto grande de colores con relieve (títulos)
const PAL = [['#fff27a', '#ffb31a'], ['#ffb27a', '#ff5a1f'], ['#ff9ac4', '#ff2d78'], ['#d6a8ff', '#8a3dff'], ['#9ee4ff', '#1f9bff'], ['#a6ffb8', '#18c46a']];
function bigText(text, cx, cy, size, sc = 1, rot = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.font = `700 ${size}px Fredoka`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const ws = [...text].map(c => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0); let x = -tot / 2; let ci = 0;
  [...text].forEach((ch, i) => {
    if (ch === ' ') { x += ws[i]; return; }
    const pal = PAL[ci++ % PAL.length], yo = Math.sin(i * 1.3) * size * 0.04;
    for (let d = Math.round(size * 0.09); d > 0; d--) { ctx.fillStyle = '#3d1a78'; ctx.strokeStyle = INK; ctx.lineWidth = size * 0.18; ctx.strokeText(ch, x + d * 0.5, yo + d); ctx.fillText(ch, x + d * 0.5, yo + d); }
    ctx.lineWidth = size * 0.18; ctx.strokeStyle = INK; ctx.strokeText(ch, x, yo);
    const g = ctx.createLinearGradient(0, yo - size * 0.45, 0, yo + size * 0.4); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); ctx.fillStyle = g; ctx.fillText(ch, x, yo);
    x += ws[i];
  });
  ctx.restore();
}
function card(lines, x, y, size, p) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  ctx.font = `700 ${size}px Fredoka`; const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + size * 1.4, h = lines.length * size * 1.3 + size * 0.8;
  ctx.fillStyle = '#fff6e8'; rr(ctx, -w / 2, -h / 2, w, h, size * 0.5); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, 0, -h / 2 + size * 0.4 + size * 1.3 * (i + 0.5)));
  ctx.restore();
}
// pantalla de celular (chat)
function phone(t, typed, sent, reply) {
  ctx.save();
  ctx.fillStyle = 'rgba(30,10,50,0.55)'; ctx.fillRect(0, 0, W, H);
  ctx.translate(960, 540);
  ctx.fillStyle = '#1b1530'; rr(ctx, -330, -500, 660, 1000, 70); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#f4f0ff'; rr(ctx, -300, -470, 600, 940, 50); ctx.fill();
  ctx.fillStyle = '#8a5cff'; rr(ctx, -300, -470, 600, 130, [50, 50, 0, 0]); ctx.fill();
  heart(-210, -400, 32, '#ff4d6d');
  ctx.fillStyle = '#fff'; ctx.font = '700 46px Fredoka'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Ella', -160, -405);
  ctx.font = '600 26px Fredoka'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(reply ? 'en línea' : 'escribiendo…', -160, -365);
  // burbuja enviada (derecha)
  if (typed) {
    const y0 = sent ? -260 : 300;
    ctx.font = '700 40px Fredoka';
    const lines = wrap(typed, 400);
    const bh = lines.length * 54 + 40;
    ctx.fillStyle = sent ? '#7ae582' : '#ffffff'; rr(ctx, 260 - 470, y0, 470, bh, 30); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; lines.forEach((l, i) => ctx.fillText(l, 260 - 445, y0 + 45 + i * 54));
    if (!sent && fract(t * 2) < 0.5) { const lw = ctx.measureText(lines[lines.length - 1]).width; ctx.fillRect(260 - 445 + lw + 4, y0 + 22 + (lines.length - 1) * 54, 4, 44); }
    if (sent) { ctx.font = '700 30px Fredoka'; ctx.fillStyle = '#2a8cff'; ctx.fillText('✓✓', 190, y0 + bh + 26); }
  }
  if (reply) {
    ctx.font = '700 40px Fredoka'; const lines = wrap(reply, 420); const bh = lines.length * 54 + 40, y0 = 20;
    ctx.fillStyle = '#ffffff'; rr(ctx, -270, y0, 470, bh, 30); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; lines.forEach((l, i) => ctx.fillText(l, -245, y0 + 45 + i * 54));
  }
  // barra de escribir
  ctx.fillStyle = '#ffffff'; rr(ctx, -270, 380, 540, 70, 35); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#c9c2e0'; ctx.stroke();
  ctx.restore();
}
function wrap(txt, maxW) { const words = txt.split(' '), out = []; let cur = ''; for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > maxW && cur) { out.push(cur); cur = w; } else cur = tst; } if (cur) out.push(cur); return out; }

// ======================= CÁMARA =======================
// [x, y de la cara, zoom] para primeros planos según escena y hablante
const CL = {
  cafe: { CHA: [1260, 470], CHO: [700, 470] },
  alarma: { ADR: [1380, 560], CER: [760, 470] },
  gym: { COR: [940, 600], ADR: [420, 600] },
  estomago: { EST: [1160, 600], ADR: [480, 640] },
  fiesta: { DOP: [560, 520], CER: [1320, 520] },
  mensaje: { CER: [960, 520], COR: [430, 620], EST: [1500, 640] },
  calma: { OXI: [960, 480], COR: [470, 620], ADR: [1520, 830] },
};
const WIDE = new Set([3, 6, 10, 14, 23, 24]);
function camera(t, sc) {
  const lt = t - sc.a;
  if (sc.k === 'intro') return [960, 540, 1 + 0.02 * lt + 2.5 * Math.pow(span(t, LN(0).b - 0.3, sc.b), 2)];
  if (sc.k === 'final') return [960, 540, 1 + 0.01 * lt];
  if (sc.k === 'cafe' && t > LN(2).b) { const u = span(t, LN(2).b, sc.b); return [700, 440, lerp(1.6, 3.4, u * u)]; }
  const l = lineAt(t);
  if (l && l.escena === sc.k && CL[sc.k] && CL[sc.k][l.quien] && !WIDE.has(l.id)) { const pr = span(t, l.a, l.b + 0.3); const [x, y] = CL[sc.k][l.quien]; return [x, y, 1.5 + 0.08 * pr]; }
  return [960, 540, 1.0 + 0.03 * fract(lt / 6)];
}
function phoneOn(t) { return (t > LN(18).a + 1.2 && t < LN(18).b + 0.4) || (t > LN(20).a && t < EV.grillos) || (t > EV.ding - 0.1 && t < LN(22).b + 0.3); }

// ======================= ESCENAS =======================
function sceneIntro(t, lt) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff9ac4'); g.addColorStop(0.5, '#b58cff'); g.addColorStop(1, '#5fd3f5');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rays(960, 620, 36, 2000, 'rgba(255,255,255,0.12)', t * 0.15);
  floatingHearts(t, 3, 26, 0, W, 0, H, 34);
  const p = popIn(t, 0.4, 0.5);
  if (p > 0) { bigText('TUS ÓRGANOS', 960, 190, 120, p, -0.03); bigText('CUANDO TE ENAMORAS', 960, 330, 104, popIn(t, 0.8, 0.5), -0.03); }
  const kx = lerp(-300, 960, easeBack(span(t, 0.9, 1.6)));
  pose('kurioso_c', kx, 1040, 560, t, { q: 'NAR', hop: speaking('NAR', t) ? 0.15 : 0.35 });
  heart(1330, 760 + Math.sin(t * 4) * 10, 70 * popIn(t, 2.0), '#ff4d6d'); heart(600, 820 + Math.sin(t * 3) * 10, 50 * popIn(t, 2.3), '#ff8fab');
}

function sceneCafe(t, lt) {
  bg('cafe');
  const chicaX = lerp(2100, 1260, easeOut(span(t, SC.cafe.a, LN(1).a - 0.1)));
  const walking = t < LN(1).a - 0.1;
  const heartEyes = t > LN(2).b - 0.2;
  pose(heartEyes ? 'pareja_2' : 'pareja_1', 700, 1040, 720, t, { q: 'CHO', shake: t > LN(2).a && t < LN(2).b ? 0.8 : 0, hop: heartEyes ? 0.3 : 0 });
  pose(t > LN(1).b ? 'pareja_4' : 'pareja_3', chicaX, 1040, 720, t, { q: 'CHA', hop: walking ? 0.4 : 0, hopSpeed: 12 });
  if (t > LN(2).a && !heartEyes) sweat(t, 700, 360);
  if (heartEyes) floatingHearts(t, 5, 12, 520, 880, 200, 600, 30);
}

function sceneAlarma(t, lt) {
  bg('cerebro');
  if (t > LN(3).a - 0.4) { const a = Math.max(0, Math.sin(t * 10)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,30,50,${0.22 * a})`; ctx.fillRect(0, 0, W, H); ctx.restore(); if (fract(t * 2) < 0.6 && t < LN(5).b) bigText('¡ALERTA!', 960, 140, 120, 1, -0.04); }
  pose(t > LN(4).a ? 'cerebro_2' : 'cerebro_1', 760, 1030, 560, t, { shake: t > LN(4).a && t < LN(4).b + 0.5 ? 0.7 : 0 });
  if (t > LN(4).a && t < LN(5).a) sweat(t, 760, 470);
  // Adrenalina entra con megáfono y luego sale corriendo
  let ax = lerp(2200, 1380, easeBack(span(t, LN(3).a - 0.4, LN(3).a + 0.1)));
  let key = 'adrenalina_3';
  if (t > LN(5).a) { key = 'adrenalina_2'; ax = lerp(1380, -400, span(t, LN(5).b - 0.2, LN(5).b + 0.8)); }
  pose(key, ax, 1030, 460, t, { flip: key === 'adrenalina_2', hop: key === 'adrenalina_2' ? 0.4 : 0.15, hopSpeed: 14 });
  if (key === 'adrenalina_2' && t > LN(5).b - 0.2) speedLines(t, ax + 200, 650, 500, 300, 1);
}

function sceneGym(t, lt) {
  bg('gym');
  const panic = t > LN(7).b;
  const bpm = !panic ? 60 : Math.min(170, 60 + (t - LN(7).b) * 40);
  // corazón
  const ck = !panic ? (t > LN(6).b ? 'corazon_1' : 'corazon_1') : (t < LN(8).b ? 'corazon_4' : 'corazon_2');
  const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * bpm / 60)), 8);
  pose(ck, 940, 1000, 560 * (1 + beat * 0.05), t, { hop: ck === 'corazon_4' ? 0.6 : 0, hopSpeed: bpm / 8, shake: panic && ck !== 'corazon_4' ? 0.8 : 0, flip: ck === 'corazon_4' });
  if (ck === 'corazon_4') speedLines(t, 1250, 500, 420, 400, 1);
  if (panic) sweat(t, 940, 420, 4);
  // monitor de latidos
  ctx.save(); ctx.translate(1600, 210);
  ctx.fillStyle = '#121a2e'; rr(ctx, -220, -110, 440, 220, 30); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
  ctx.strokeStyle = panic ? '#ff4d6d' : '#7ae582'; ctx.lineWidth = 6; ctx.beginPath();
  for (let x = -190; x <= 190; x += 4) { const ph = (x / 40 + t * bpm / 30); const v = Math.pow(Math.max(0, Math.sin(ph)), 30) * 70 - Math.pow(Math.max(0, Math.sin(ph - 0.4)), 30) * 25; x === -190 ? ctx.moveTo(x, 30 - v) : ctx.lineTo(x, 30 - v); } ctx.stroke();
  ctx.restore();
  label(`${Math.round(bpm)} latidos/min`, 1600, 70, { size: 46, color: panic ? '#ff5e7e' : '#7ae582' });
  // adrenalina gritando
  if (t > LN(7).a - 0.4) pose(t < LN(7).b + 0.5 ? 'adrenalina_3' : 'adrenalina_4', lerp(-300, 420, easeBack(span(t, LN(7).a - 0.4, LN(7).a + 0.1))), 1000, 460, t, { hop: 0.2 });
  if (t > LN(9).a + 0.5) card(['⚡ ADRENALINA ↑', '❤️ late más rápido', '💦 manos sudadas'], 960, 300, 54, popIn(t, LN(9).a + 0.5));
}

function sceneEstomago(t, lt) {
  bg('estomago');
  const shocked = t > LN(11).a - 0.2, tickle = t > LN(13).a - 0.1;
  const ek = tickle ? 'estomago_3' : shocked ? 'estomago_2' : 'estomago_1';
  pose(ek, 1160, 1010, 560, t, { shake: tickle ? 0.6 : 0, hop: tickle ? 0.25 : 0 });
  if (t > EV.mariposas) { const n = Math.round(lerp(3, 14, span(t, EV.mariposas, EV.mariposas + 3))); swarm(t, 1160, 640, n, 300, 9, 1.4); }
  if (t > LN(12).a - 0.4) pose('adrenalina_1', lerp(-300, 480, easeBack(span(t, LN(12).a - 0.4, LN(12).a + 0.1))), 1010, 440, t, { hop: 0.1 });
  if (t > LN(12).b - 0.5) card(['🦋 Menos sangre al estómago', '= "mariposas"'], 960, 160, 50, popIn(t, LN(12).b - 0.5));
}

function sceneFiesta(t, lt) {
  bg('fiesta');
  // luces de discoteca
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 5; k++) { const a = Math.sin(t * 1.5 + k * 1.3) * 0.6; ctx.save(); ctx.translate(1180, 40); ctx.rotate(a + Math.PI / 2); const g = ctx.createLinearGradient(0, 0, 1200, 0); const c = ['255,60,200', '60,220,255', '255,230,80', '140,90,255', '80,255,160'][k]; g.addColorStop(0, `rgba(${c},0.35)`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1200, -120); ctx.lineTo(1200, 120); ctx.fill(); ctx.restore(); }
  ctx.restore();
  const beat = (t - SC.fiesta.a) * 124 / 60;
  const dk = t < LN(14).b ? (t < LN(14).a + 1.2 ? 'dopamina_3' : 'dopamina_1') : (t > LN(17).a ? 'dopamina_1' : 'dopamina_2');
  pose(dk, 560, 1000, dk === 'dopamina_3' ? 470 : 500, t, { hop: dk === 'dopamina_2' ? 0.35 : 0.08, hopSpeed: Math.PI * 124 / 60 });
  const ck = t > LN(15).a ? 'cerebro_3' : 'cerebro_1';
  pose(ck, 1320, 1010, 560, t, { rot: ck === 'cerebro_3' ? Math.sin(beat * Math.PI) * 0.05 : 0 });
  if (ck === 'cerebro_3') floatingHearts(t, 7, 14, 1100, 1540, 150, 550, 30);
  if (t > LN(15).a + 0.4 && t < LN(16).a) card(['😊 DOPAMINA = recompensa', 'Solo piensas en esa persona'], 960, 170, 48, popIn(t, LN(15).a + 0.4));
  floatingHearts(t, 11, 8, 0, W, 300, H, 22);
}

function sceneMensaje(t, lt) {
  bg('cerebro');
  const frozen = t > EV.grillos - 0.1 && t < LN(21).a;
  const cer = t > LN(18).a ? 'cerebro_4' : 'cerebro_1';
  pose(t > LN(20).b && t < LN(22).a ? 'cerebro_1' : cer, 960, 1020, 560, t, { hop: 0 });
  if (t > LN(19).a - 0.4) pose(t > LN(23).a - 0.1 ? 'corazon_3' : 'corazon_2', lerp(-300, 430, easeBack(span(t, LN(19).a - 0.4, LN(19).a + 0.1))), 1010, 470, t, { shake: t < LN(19).b ? 1 : 0, hop: t > LN(23).a - 0.1 ? 0.6 : 0 });
  if (t > LN(19).b) pose(t > LN(23).a ? 'estomago_3' : 'estomago_4', 1500, 1020, 470, t, { hop: t > LN(23).a ? 0.4 : 0 });
  if (frozen) { label('cri… cri…', 960, 200, { size: 64, color: '#d8ffb0' }); }
  if (t > LN(23).a) confetti(t, LN(23).a, 21);
  if (t > LN(23).a) bigText('¡DIJO QUE SÍ!', 960, 170, 110, popIn(t, LN(23).a), -0.04);
}
function overlayPhone(t) {
  if (!phoneOn(t)) return;
  const msg = 'Hola, ¿quieres casarte conmigo? 💍';
  let typed = '', sent = false, reply = null;
  if (t < LN(18).b + 0.5) { const u = span(t, LN(18).a + 1.4, LN(18).b - 0.2); typed = msg.slice(0, Math.round(u * msg.length)); }
  else { typed = msg; sent = true; }
  if (t > EV.ding - 0.1) reply = 'Jajaja eres muy chistoso. ¿Vamos por un café mañana? ☕';
  const p = easeBack(span(t, t < LN(20).a ? LN(18).a + 1.2 : (t < EV.ding - 0.1 ? LN(20).a : EV.ding - 0.1), (t < LN(20).a ? LN(18).a + 1.2 : (t < EV.ding - 0.1 ? LN(20).a : EV.ding - 0.1)) + 0.3));
  ctx.save(); ctx.translate(960, 540); ctx.scale(lerp(0.6, 1, p), lerp(0.6, 1, p)); ctx.translate(-960, -540); ctx.globalAlpha = clamp(p * 1.5, 0, 1);
  phone(t, typed, sent, reply);
  if (sent && t > LN(20).a && t < EV.grillos) label('ENVIADO', 960, 980, { size: 70, color: '#7ae582', rot: -0.05 });
  ctx.restore();
}

function sceneCalma(t, lt) {
  bg('calma');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 960, 400, 600, '255,190,230', 0.25); ctx.restore();
  const ok = t < LN(24).a + 2.2 ? 'oxitocina_1' : (t < LN(25).a + 0.5 ? 'oxitocina_2' : 'oxitocina_4');
  const oy = lerp(-200, 900, easeOut(span(t, SC.calma.a + 0.2, LN(24).a + 0.3)));
  pose(ok, 960, oy + Math.sin(t * 2) * 15, 430, t, { noShadow: true });
  floatingHearts(t, 13, 10, 700, 1220, 150, 800, 26);
  pose(t > LN(26).a - 0.2 ? 'corazon_1' : 'corazon_2', 470, 1010, 470, t, {});
  if (t > LN(26).a) label('70 latidos/min ❤️', 470, 430, { size: 46, color: '#7ae582' });
  // Adrenalina dormida en un cojín
  ctx.save(); ctx.translate(1520, 860); ctx.rotate(-1.5); pose('adrenalina_1', 0, 0, 380, t, { noShadow: true }); ctx.restore();
  if (t > LN(27).b - 0.3) for (let k = 0; k < 3; k++) { const u = fract(t * 0.5 + k / 3); label('Z', 1640 + u * 80, 700 - u * 220, { size: 40 + u * 30, color: '#ffffff' }); }
  // los enamorados de la mano (recuadro)
  if (t > LN(24).a + 3.0 && t < LN(26).a) {
    const p = popIn(t, LN(24).a + 3.0);
    ctx.save(); ctx.translate(1560, 300); ctx.scale(p, p);
    ctx.beginPath(); ctx.arc(0, 0, 210, 0, TAU); ctx.fillStyle = '#fff0f6'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke(); ctx.clip();
    pose('pareja_2', -70, 330, 520, t, { noShadow: true }); pose('pareja_4', 80, 330, 520, t, { noShadow: true });
    heart(0, -120, 40, '#ff4d6d');
    ctx.restore();
  }
}

function sceneFinal(t, lt) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5fd3f5'); g.addColorStop(0.55, '#a68bff'); g.addColorStop(1, '#ff8ac0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rays(960, 640, 40, 2200, 'rgba(255,255,255,0.12)', t * 0.1);
  floatingHearts(t, 17, 20, 0, W, 0, H, 28);
  if (t < EV.tarjeta) {
    pose('kurioso_c', 960, 1040, 600, t, { q: 'NAR', hop: 0.15 });
    const at = LN(28).a + 3.6; if (t > at) bigText('¡ES QUÍMICA!', 960, 180, 130, popIn(t, at), -0.04);
    return;
  }
  const cast = [['corazon_3', 260], ['dopamina_4', 540], ['oxitocina_4', 820], ['kurioso_c', 1100], ['estomago_3', 1380], ['cerebro_3', 1660]];
  cast.forEach(([k, x], i) => pose(k, x, 1060, k === 'kurioso_c' ? 470 : 420, t + i, { hop: 0.3, q: 'none' }));
  const p = popIn(t, EV.tarjeta, 0.45);
  ctx.save(); ctx.translate(960, 280); ctx.scale(p, p);
  ctx.fillStyle = '#e8263a'; rr(ctx, -380, -95, 760, 190, 95); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  ctx.font = '700 100px Fredoka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('SUSCRÍBETE', 0, 6);
  ctx.restore();
  bigText('SOY KURIOSO', 960, 470, 90, popIn(t, EV.tarjeta + 0.3), -0.03);
}

function switchOverlay(t) {
  if (t > LN(17).a + 0.6) {
    const off = t > LN(17).a + 1.6;
    ctx.save(); ctx.translate(960, 170); ctx.scale(popIn(t, LN(17).a + 0.6), popIn(t, LN(17).a + 0.6));
    ctx.fillStyle = '#fff6e8'; rr(ctx, -420, -80, 840, 160, 40); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
    ctx.font = '700 50px Fredoka'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('SENTIDO CRÍTICO', -380, 0);
    ctx.fillStyle = off ? '#ff4d6d' : '#7ae582'; rr(ctx, 120, -45, 250, 90, 45); ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(off ? 165 : 325, 0, 34, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '700 40px Fredoka'; ctx.textAlign = 'center'; ctx.fillText(off ? 'OFF' : 'ON', off ? 290 : 200, 2);
    ctx.restore();
  }
}
const SCENE_FN = { intro: sceneIntro, cafe: sceneCafe, alarma: sceneAlarma, gym: sceneGym, estomago: sceneEstomago, fiesta: sceneFiesta, mensaje: sceneMensaje, calma: sceneCalma, final: sceneFinal };
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  const sc = TL.escenas.find(s => t >= s.a && t < s.b) || TL.escenas[TL.escenas.length - 1];
  const lt = t - sc.a;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const [cx, cy, z] = camera(t, sc);
  let shx = 0, shy = 0;
  if (sc.k === 'gym' && t > LN(8).a && t < LN(8).b) { shx = Math.sin(t * 47) * 6; shy = Math.cos(t * 39) * 6; }
  if (sc.k === 'alarma' && t > LN(3).a && t < LN(3).b) { shx = Math.sin(t * 43) * 4; shy = Math.cos(t * 31) * 4; }
  const hz = W / (2 * z), vz = H / (2 * z);
  const X = clamp(cx, hz, W - hz), Y = clamp(cy, vz, H - vz);
  ctx.setTransform(z, 0, 0, z, W / 2 - X * z + shx, H / 2 - Y * z + shy);
  SCENE_FN[sc.k](t, lt);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (sc.k === 'mensaje') overlayPhone(t);
  if (sc.k === 'fiesta') switchOverlay(t);
  const tr = 1 - span(t, sc.a, sc.a + 0.18);
  if (sc.a > 0 && tr > 0) { ctx.fillStyle = `rgba(255,255,255,${tr * 0.8})`; ctx.fillRect(0, 0, W, H); }
  if (sc.k === 'cafe' && t > sc.b - 0.4) { ctx.fillStyle = `rgba(255,150,190,${span(t, sc.b - 0.4, sc.b)})`; ctx.fillRect(0, 0, W, H); }
  const fade = Math.max(1 - t / 0.4, span(t, TL.dur - 0.6, TL.dur));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
window.ready = Promise.all([document.fonts.load('700 48px Fredoka'), document.fonts.load('600 48px Fredoka'), imgsReady]).then(() => true);
