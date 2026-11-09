/* Motor de animación: utilidades, cámara, ojos, bocas, texturas orgánicas. Mundo de 1920x1080. */
'use strict';
const W = 1920, H = 1080, TAU = Math.PI * 2;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const FPS = TL.fps;
const INK = '#2a1a22';

function rnd(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeOut = t => { t = clamp(t, 0, 1); return 1 - (1 - t) * (1 - t) * (1 - t); };
const easeBack = t => { t = clamp(t, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const fract = x => x - Math.floor(x);
const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function glow(g, x, y, r, col, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.4, `rgba(${col},${a * 0.4})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
}
const LN = id => TL.lineas[id];
const EV = TL.ev;

// boca (0..1) del personaje q en el instante t
function talk(q, t) {
  const a = TL.boca[q]; if (!a) return 0;
  const f = Math.round(t * FPS);
  return clamp(((a[f - 1] || 0) + 2 * (a[f] || 0) + (a[f + 1] || 0)) / 4, 0, 1);
}
// ¿está hablando q? (para gestos)
function speaking(q, t) { return TL.lineas.some(l => l.quien === q && t >= l.a && t <= l.b); }
function lineAt(t) { let cur = null; for (const l of TL.lineas) if (t >= l.a - 0.05) cur = l; return cur; }

const BLINKS = {};
function blink(key, t) {
  if (!BLINKS[key]) { const r = rnd([...key].reduce((s, c) => s * 31 + c.charCodeAt(0), 7)); const a = []; let x = r() * 2; while (x < 200) { a.push(x); x += 1.8 + r() * 2.8; } BLINKS[key] = a; }
  for (const b of BLINKS[key]) { const d = (t - b) / 0.16; if (d >= 0 && d <= 1) return Math.sin(Math.PI * d); }
  return 0;
}

// ---------- ojo de caricatura ----------
// o: {lx, ly, lid (0 abierto..1 cerrado), lidCol, brow (-1 enojado .. 1 preocupado), spiral, pupil, angry}
function eye(x, y, rx, ry, o = {}) {
  ctx.save();
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = '#fffdf8'; ctx.fill();
  ctx.lineWidth = Math.max(2, rx * 0.14); ctx.strokeStyle = INK; ctx.stroke();
  ctx.clip();
  const px = x + (o.lx || 0) * rx * 0.4, py = y + (o.ly || 0) * ry * 0.4, pr = rx * (o.pupil || 0.5);
  if (o.spiral) {
    ctx.strokeStyle = INK; ctx.lineWidth = rx * 0.12; ctx.beginPath();
    for (let k = 0; k < 60; k++) { const a = k * 0.35 + o.spiral, r = k / 60 * rx * 0.85; const X = x + Math.cos(a) * r, Y = y + Math.sin(a) * r; k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1b1220'; ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 1.1, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px + pr * 0.35, py - pr * 0.4, pr * 0.33, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(px - pr * 0.35, py + pr * 0.35, pr * 0.14, 0, TAU); ctx.fill();
  }
  const lid = clamp(o.lid || 0, 0, 1);
  if (lid > 0.01) {
    const ly = y - ry + 2 * ry * lid, tilt = (o.lidTilt || 0) * ry;
    ctx.fillStyle = o.lidCol || '#ddd'; ctx.beginPath();
    ctx.moveTo(x - rx - 2, y - ry - 2); ctx.lineTo(x + rx + 2, y - ry - 2); ctx.lineTo(x + rx + 2, ly + tilt); ctx.lineTo(x - rx - 2, ly - tilt); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, rx * 0.12); ctx.beginPath(); ctx.moveTo(x - rx, ly - tilt); ctx.lineTo(x + rx, ly + tilt); ctx.stroke();
  }
  ctx.restore();
}
// par de ojos con cejas
function eyes(x, y, sep, rx, ry, o = {}) {
  const side = [-1, 1];
  for (const s of side) {
    const oo = { ...o, lidTilt: (o.lidTilt || 0) * s };
    eye(x + s * sep / 2, y, rx, ry, oo);
  }
  if (o.brow !== undefined) {
    ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3, rx * 0.22);
    for (const s of side) {
      const bx = x + s * sep / 2, by = y - ry - rx * 0.35 - (o.browUp || 0);
      const inner = o.brow * rx * 0.35; // >0 preocupado (interior arriba), <0 enojado
      ctx.beginPath(); ctx.moveTo(bx - s * rx * 0.75, by + inner * 0.2); ctx.lineTo(bx + s * rx * 0.55, by - inner); ctx.stroke();
    }
  }
}
// boca: open 0..1, smile -1..1
function mouth(x, y, w, open, o = {}) {
  const sm = o.smile || 0;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (open > 0.07) {
    const h = w * (0.12 + 0.55 * open);
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - sm * w * 0.1);
    ctx.quadraticCurveTo(x, y - h * 0.35 + sm * w * 0.05, x + w / 2, y - sm * w * 0.1);
    ctx.quadraticCurveTo(x, y + h + sm * w * 0.15, x - w / 2, y - sm * w * 0.1);
    ctx.closePath();
    ctx.fillStyle = '#4a1222'; ctx.fill();
    ctx.save(); ctx.clip();
    if (o.teeth !== false) { ctx.fillStyle = '#fff'; ctx.fillRect(x - w / 2, y - h, w, h * 0.55); }
    ctx.fillStyle = '#e8687c'; ctx.beginPath(); ctx.ellipse(x, y + h * 0.85, w * 0.28, h * 0.35, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2.5, w * 0.07); ctx.stroke();
  } else {
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2.5, w * 0.08);
    ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x, y + sm * w * 0.35, x + w / 2, y); ctx.stroke();
  }
  ctx.restore();
}
function shine(x, y, rx, ry, a = 0.5) {
  ctx.save(); ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.5, 0, TAU); ctx.fill(); ctx.restore();
}
function limb(x1, y1, x2, y2, w, col, cx, cy) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1);
  if (cx !== undefined) ctx.quadraticCurveTo(cx, cy, x2, y2); else ctx.lineTo(x2, y2);
  ctx.strokeStyle = INK; ctx.lineWidth = w + 6; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}
function hand(x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
function fillOutline(path, fill, lw = 5) { ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke(path); ctx.fillStyle = fill; ctx.fill(path); }

// ---------- texturas orgánicas (fondos semi-3D) ----------
function cells(g, w, h, o) {
  const r = rnd(o.seed || 1);
  g.fillStyle = o.base; g.fillRect(0, 0, w, h);
  const n = o.count || 160;
  const list = [];
  for (let i = 0; i < n; i++) list.push([r() * w, r() * h, lerp(o.rmin, o.rmax, Math.pow(r(), 1.5))]);
  list.sort((a, b) => b[2] - a[2]);
  for (const [x, y, rad] of list) {
    const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.05, x, y, rad);
    gr.addColorStop(0, o.light); gr.addColorStop(0.55, o.mid); gr.addColorStop(1, o.dark);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(x - rad * 0.35, y - rad * 0.45, rad * 0.22, rad * 0.12, -0.6, 0, TAU); g.fill();
  }
}
function folds(g, w, h, o) {
  const r = rnd(o.seed || 3);
  for (let i = 0; i < (o.count || 18); i++) {
    const x0 = r() * w, amp = 30 + r() * 60, wid = 30 + r() * 50;
    g.save(); g.lineCap = 'round';
    const path = new Path2D(); path.moveTo(x0, -20);
    for (let y = 0; y <= h + 40; y += 40) path.lineTo(x0 + Math.sin(y * 0.008 + i) * amp + Math.sin(y * 0.021 + i * 2) * amp * 0.3, y);
    g.strokeStyle = o.dark; g.lineWidth = wid + 18; g.stroke(path);
    g.strokeStyle = o.mid; g.lineWidth = wid; g.stroke(path);
    g.strokeStyle = o.light; g.lineWidth = wid * 0.3; g.translate(-wid * 0.18, 0); g.stroke(path);
    g.restore();
  }
}
function grainOver(g, w, h, a, seed) {
  const r = rnd(seed); g.save();
  for (let i = 0; i < w * h / 300; i++) { g.fillStyle = r() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.restore();
}
function vignetteOn(g, w, h, a) {
  const gr = g.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 1.05);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
// fondo en caché a 1.5x para que se vea nítido al acercar la cámara
const BGS = 1.5;
function bgCache(fn) { const c = mk(W * BGS, H * BGS), g = c.getContext('2d'); g.scale(BGS, BGS); fn(g); return c; }

// ---------- texto ----------
function label(txt, x, y, o = {}) {
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${o.weight || 700} ${o.size || 48}px Fredoka`;
  const w = ctx.measureText(txt).width, ph = (o.size || 48) * 0.5, pw = (o.size || 48) * 0.6;
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.scale !== undefined) ctx.scale(o.scale, o.scale);
  if (o.bg) { ctx.fillStyle = o.bg; rr(ctx, -w / 2 - pw, -ph - (o.size || 48) * 0.35, w + 2 * pw, 2 * ph + (o.size || 48) * 0.7, (o.size || 48) * 0.45); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.lineJoin = 'round';
  if (o.stroke !== false) { ctx.strokeStyle = o.strokeCol || INK; ctx.lineWidth = (o.size || 48) * 0.18; ctx.strokeText(txt, 0, 2); }
  ctx.fillStyle = o.color || '#fff'; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function popIn(t, a, d = 0.35) { return easeBack(span(t, a, a + d)); }
function bar(x, y, w, h, v, col, txt) {
  ctx.save();
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(20,10,20,0.55)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
  rr(ctx, x + 6, y + 6, Math.max(0, (w - 12) * clamp(v, 0, 1.2) / 1.2 * 1.2 > w - 12 ? w - 12 : (w - 12) * clamp(v, 0, 1)), h - 12, (h - 12) / 2); ctx.fillStyle = col; ctx.fill();
  if (txt) label(txt, x + w / 2, y - h * 0.7, { size: h * 0.7 });
  ctx.restore();
}
