/* Querido yo — animación original dibujada con código (canvas 2D).
   Escenas: A = balcón (Nube, tu yo de ahora), B = andén de tren (Cactus, tu yo del pasado),
            C = faro junto al mar (pausa / llegada). */
'use strict';
const W = 1080, H = 1920;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const TAU = Math.PI * 2;
const FIRMA = 'Querido yo';

// ---------- utilidades ----------
function rnd(seed) { let a = seed >>> 0; return function () { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const fract = x => x - Math.floor(x);
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function glow(g, x, y, r, col, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.35, `rgba(${col},${a * 0.42})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function blinkVal(t, times, dur) { for (const bt of times) { const d = (t - bt) / dur; if (d >= 0 && d <= 1) return Math.sin(Math.PI * d); } return 0; }
function blinkTimes(seed, a, b, min, max) { const r = rnd(seed), out = []; let t = a + r() * min; while (t < b) { out.push(t); t += min + r() * (max - min); } return out; }
function stars(g, seed, n, x0, y0, x1, y1, maxR) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, r()), y = lerp(y0, y1, Math.pow(r(), 1.3)), s = 0.6 + Math.pow(r(), 3) * maxR, a = 0.35 + r() * 0.6;
    g.fillStyle = `rgba(235,240,255,${a})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
    if (s > maxR * 0.6) glow(g, x, y, s * 6, '200,215,255', 0.25);
  }
}
function twinkles(seed, n, x0, y0, x1, y1, t) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), ph = r() * TAU, sp = 1.5 + r() * 3;
    const a = Math.max(0, Math.sin(t * sp + ph)) ** 6;
    if (a > 0.02) { ctx.fillStyle = `rgba(240,245,255,${a * 0.9})`; ctx.beginPath(); ctx.arc(x, y, 1.6 + a * 1.4, 0, TAU); ctx.fill(); glow(ctx, x, y, 14, '210,225,255', a * 0.4); }
  }
}

// ---------- línea de tiempo ----------
const SCENES = [
  { k: 'A', a: 0.0, b: 2.6 }, { k: 'B', a: 2.6, b: 7.0 }, { k: 'A', a: 7.0, b: 10.0 }, { k: 'C', a: 10.0, b: 12.0 },
  { k: 'B', a: 12.0, b: 15.6 }, { k: 'A', a: 15.6, b: 18.4 }, { k: 'C', a: 18.4, b: 21.5 },
];
const TRAINS = [{ a: 2.6, d: 1.4 }, { a: 14.3, d: 1.3 }];
const NUBE_BLINKS = blinkTimes(5, 0.6, 22, 2.0, 3.4);
const CACT_BLINKS = blinkTimes(9, 3.4, 22, 2.4, 3.8);

// ---------- textura de grano y viñeta ----------
const grain = mk(512, 512);
(() => { const g = grain.getContext('2d'), d = g.createImageData(512, 512), r = rnd(77);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); })();
const vign = mk(W, H);
(() => { const g = vign.getContext('2d');
  let gr = g.createRadialGradient(540, 860, 380, 540, 900, 1250); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.62)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  gr = g.createLinearGradient(0, 1480, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = gr; g.fillRect(0, 1480, W, H - 1480); })();

// =====================================================================
// ESCENA A — Balcón con Nube
// =====================================================================
function leaf(g, x, y, len, ang, wid, col, rim) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.45, -wid, len, 0); g.quadraticCurveTo(len * 0.45, wid, 0, 0);
  g.fillStyle = col; g.fill();
  if (rim) { g.strokeStyle = rim; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.45, -wid, len, 0); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(4, 0); g.lineTo(len * 0.9, 0); g.stroke();
  g.restore();
}
function curtain(g, x, y, w, h, dir) {
  g.save(); g.beginPath();
  g.moveTo(x, y); g.lineTo(x + dir * w, y);
  g.bezierCurveTo(x + dir * w * 0.95, y + h * 0.3, x + dir * w * 0.35, y + h * 0.45, x + dir * w * 0.42, y + h * 0.56);
  g.bezierCurveTo(x + dir * w * 0.5, y + h * 0.7, x + dir * w * 0.95, y + h * 0.9, x + dir * w * 0.85, y + h);
  g.lineTo(x, y + h); g.closePath();
  const gr = g.createLinearGradient(x, 0, x + dir * w, 0);
  gr.addColorStop(0, 'rgba(255,236,205,0.78)'); gr.addColorStop(1, 'rgba(255,226,180,0.45)');
  g.fillStyle = gr; g.fill(); g.clip();
  g.strokeStyle = 'rgba(160,90,40,0.22)'; g.lineWidth = 6;
  for (let i = 1; i < 7; i++) { const fx = x + dir * w * i / 7; g.beginPath(); g.moveTo(fx, y); g.quadraticCurveTo(x + dir * w * (0.3 + i / 18), y + h * 0.55, fx, y + h); g.stroke(); }
  g.restore();
  // lazo
  g.fillStyle = 'rgba(150,95,50,0.55)'; g.fillRect(x + dir * w * 0.42 - 7, y + h * 0.53, 14, 32);
}
const BULBS = [];
const bgA = mk(W, H);
(() => {
  const g = bgA.getContext('2d'), r = rnd(11);
  let gr = g.createLinearGradient(0, 0, 0, 1090); gr.addColorStop(0, '#0b1b21'); gr.addColorStop(1, '#14303a');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1095);
  // ladrillo tenue
  g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 3;
  for (let y = 0, row = 0; y < 1090; y += 56, row++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = row % 2 ? 0 : 66; x < W; x += 132) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 56); g.stroke(); }
  }
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '70,110,115'},${0.025 + r() * 0.04})`; g.beginPath(); g.ellipse(r() * W, r() * 1090, 8 + r() * 40, 5 + r() * 18, r() * 3, 0, TAU); g.fill(); }
  // luz cálida sobre la pared
  g.globalCompositeOperation = 'lighter'; glow(g, 540, 520, 760, '255,160,70', 0.26); g.globalCompositeOperation = 'source-over';
  // ventana
  const wx = 266, wy = 196, ww = 548, wh = 630;
  g.fillStyle = '#071013'; rr(g, wx - 30, wy - 30, ww + 60, wh + 60, 12); g.fill();
  gr = g.createRadialGradient(540, 470, 30, 540, 520, 470); gr.addColorStop(0, '#fff0bf'); gr.addColorStop(0.45, '#fcc067'); gr.addColorStop(1, '#a85a26');
  g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  // interior: repisa, libros, lámpara, cuadro
  g.fillStyle = 'rgba(110,50,18,0.32)'; g.fillRect(wx + 300, wy + 360, 210, 10);
  for (let i = 0; i < 9; i++) { const bw = 12 + r() * 10, bh = 40 + r() * 34; g.fillRect(wx + 310 + i * 21, wy + 360 - bh, bw, bh); }
  g.fillRect(wx + 120, wy + 120, 90, 110); g.fillStyle = 'rgba(255,240,200,0.35)'; g.fillRect(wx + 132, wy + 132, 66, 86);
  g.fillStyle = 'rgba(110,50,18,0.3)'; g.fillRect(wx + 418, wy, 4, 120); g.beginPath(); g.moveTo(wx + 380, wy + 160); g.lineTo(wx + 460, wy + 160); g.lineTo(wx + 440, wy + 118); g.lineTo(wx + 400, wy + 118); g.fill();
  g.globalCompositeOperation = 'lighter'; glow(g, wx + 420, wy + 175, 140, '255,230,170', 0.5); g.globalCompositeOperation = 'source-over';
  curtain(g, wx, wy, 150, wh, 1); curtain(g, wx + ww, wy, 150, wh, -1);
  // marcos de la ventana
  g.fillStyle = '#081215';
  g.fillRect(540 - 10, wy, 20, wh); g.fillRect(wx, wy + wh * 0.40 - 8, ww, 16); g.fillRect(wx, wy + wh * 0.72 - 7, ww, 14);
  g.fillRect(wx + ww * 0.25 - 5, wy, 10, wh); g.fillRect(wx + ww * 0.75 - 5, wy, 10, wh);
  // reflejos del vidrio
  g.fillStyle = 'rgba(255,255,255,0.07)';
  g.beginPath(); g.moveTo(wx + 40, wy + wh); g.lineTo(wx + 140, wy + wh); g.lineTo(wx + 330, wy); g.lineTo(wx + 230, wy); g.fill();
  g.beginPath(); g.moveTo(wx + 300, wy + wh); g.lineTo(wx + 330, wy + wh); g.lineTo(wx + 520, wy); g.lineTo(wx + 490, wy); g.fill();
  // alféizar
  g.fillStyle = '#0a1518'; g.fillRect(220, 848, 640, 28); g.fillStyle = 'rgba(255,190,110,0.35)'; g.fillRect(220, 848, 640, 3);
  // enredadera desde arriba a la derecha
  g.strokeStyle = '#0d2a22'; g.lineWidth = 6; g.beginPath(); g.moveTo(1090, -10);
  g.bezierCurveTo(960, 120, 900, 300, 860, 520); g.bezierCurveTo(845, 600, 870, 680, 850, 760); g.stroke();
  for (let i = 0; i < 46; i++) {
    const u = i / 46, x = lerp(1060, 852, u) + Math.sin(u * 12) * 16, y = lerp(10, 760, u);
    leaf(g, x, y, 34 + r() * 22, (r() < 0.5 ? -0.6 : 3.7) + r() * 0.8, 12, i % 3 ? '#174536' : '#1d5442', x < 900 ? 'rgba(255,190,110,0.45)' : null);
  }
  // piso de madera
  gr = g.createLinearGradient(0, 1090, 0, 1430); gr.addColorStop(0, '#2c1e14'); gr.addColorStop(1, '#100a06');
  g.fillStyle = gr; g.fillRect(0, 1090, W, 340);
  g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 3;
  for (const y of [1108, 1130, 1157, 1190, 1230, 1278, 1336, 1405]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (let i = 0; i < 40; i++) { const y = [1090, 1108, 1130, 1157, 1190, 1230, 1278, 1336][i % 8]; const x = r() * W; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 18 + (i % 8) * 6); g.stroke(); }
  g.fillStyle = '#081013'; g.fillRect(0, 1078, W, 16);
  g.globalCompositeOperation = 'lighter';
  gr = g.createLinearGradient(0, 1092, 0, 1430); gr.addColorStop(0, 'rgba(255,165,80,0.22)'); gr.addColorStop(1, 'rgba(255,165,80,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(290, 1094); g.lineTo(790, 1094); g.lineTo(960, 1430); g.lineTo(120, 1430); g.fill();
  g.globalCompositeOperation = 'source-over';
  gr = g.createLinearGradient(0, 1420, 0, H); gr.addColorStop(0, '#0a0705'); gr.addColorStop(1, '#030202');
  g.fillStyle = gr; g.fillRect(0, 1420, W, H - 1420);
  // planta grande a la izquierda
  g.fillStyle = '#1a0e09'; g.beginPath(); g.moveTo(70, 955); g.lineTo(225, 955); g.lineTo(205, 1088); g.lineTo(90, 1088); g.fill();
  g.fillStyle = '#26150d'; g.fillRect(62, 948, 170, 22);
  for (let i = 0; i < 16; i++) {
    const a = -2.75 + i * 0.13 + (r() - 0.5) * 0.12, len = 140 + r() * 160;
    leaf(g, 148, 955, len, a, 34 + r() * 18, i % 2 ? '#123a2e' : '#174838', Math.cos(a) > -0.4 ? 'rgba(255,180,95,0.5)' : null);
  }
  // planta de lengua de suegra a la derecha
  g.fillStyle = '#1a0e09'; g.beginPath(); g.moveTo(876, 985); g.lineTo(1004, 985); g.lineTo(990, 1088); g.lineTo(890, 1088); g.fill();
  g.fillStyle = '#26150d'; g.fillRect(868, 978, 144, 18);
  for (let i = 0; i < 9; i++) {
    const bx = 892 + i * 13, top = 700 + r() * 140, lean = (i - 4) * 9;
    g.beginPath(); g.moveTo(bx - 12, 985); g.quadraticCurveTo(bx - 10 + lean * 0.5, (985 + top) / 2, bx + lean, top); g.quadraticCurveTo(bx + 12 + lean * 0.5, (985 + top) / 2, bx + 12, 985);
    g.fillStyle = i % 2 ? '#1b4a34' : '#235a40'; g.fill();
    g.strokeStyle = 'rgba(190,200,120,0.35)'; g.lineWidth = 2; g.stroke();
  }
  // cable de las lucecitas
  g.strokeStyle = '#05090a'; g.lineWidth = 3; g.beginPath();
  for (let i = 0; i <= 60; i++) { const u = i / 60, x = lerp(-20, 1100, u), y = lerp(108, 132, u) + Math.sin(u * Math.PI) * 88; if (i) g.lineTo(x, y); else g.moveTo(x, y); if (i % 4 === 2 && i < 59) BULBS.push([x, y + 10]); }
  g.stroke();
})();

function drawLantern(t) {
  const a = 0.05 * Math.sin(t * 1.25) + 0.015 * Math.sin(t * 2.9);
  const px = 170, py = 0, L = 300;
  const lx = px + Math.sin(a) * (L + 70), ly = py + Math.cos(a) * (L + 70);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const fl = 0.9 + 0.1 * Math.sin(t * 7.1) * Math.sin(t * 3.3);
  glow(ctx, lx, ly, 420, '255,140,60', 0.33 * fl);
  ctx.restore();
  ctx.save(); ctx.translate(px, py); ctx.rotate(-a);
  ctx.strokeStyle = '#05080a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, L - 10); ctx.stroke();
  const gr = ctx.createRadialGradient(-14, L + 60, 8, 0, L + 70, 90);
  gr.addColorStop(0, '#fff1c2'); gr.addColorStop(0.5, '#ffad55'); gr.addColorStop(1, '#d35c22');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, L + 70, 72, 84, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(150,60,20,0.45)'; ctx.lineWidth = 2.5;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(0, L + 70 + i * 22, 72 * Math.sqrt(1 - (i * 22 / 84) ** 2), 6, 0, 0, Math.PI); ctx.stroke(); }
  ctx.fillStyle = '#1a0d07'; rr(ctx, -30, L - 18, 60, 14, 4); ctx.fill(); rr(ctx, -26, L + 150, 52, 12, 4); ctx.fill();
  ctx.strokeStyle = '#a8401f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, L + 162); ctx.lineTo(Math.sin(t * 1.7) * 4, L + 205); ctx.stroke();
  ctx.restore();
}

function eye(x, y, rx, ry, lid, lx, ly, lidCol, ink, iris) {
  ctx.save();
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = '#161a28'; ctx.fill(); ctx.clip();
  ctx.fillStyle = iris; ctx.beginPath(); ctx.ellipse(x + lx, y + ly + ry * 0.15, rx * 0.72, ry * 0.7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0b0d14'; ctx.beginPath(); ctx.ellipse(x + lx, y + ly + ry * 0.15, rx * 0.36, ry * 0.36, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + lx + rx * 0.32, y + ly - ry * 0.3, rx * 0.36, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x + lx - rx * 0.32, y + ly + ry * 0.38, rx * 0.15, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  if (lid > 0.001) {
    const ly2 = y - ry + 2 * ry * lid;
    ctx.fillStyle = lidCol; ctx.beginPath(); ctx.moveTo(x - rx - 3, y - ry - 3); ctx.lineTo(x + rx + 3, y - ry - 3); ctx.lineTo(x + rx + 3, ly2); ctx.quadraticCurveTo(x, ly2 + ry * 0.22, x - rx - 3, ly2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(x - rx - 3, ly2); ctx.quadraticCurveTo(x, ly2 + ry * 0.22, x + rx + 3, ly2); ctx.stroke();
  }
  ctx.restore();
}

function drawSceneA(t, lt, scIdx) {
  ctx.drawImage(bgA, 0, 0);
  // lucecitas del cable
  BULBS.forEach(([x, y], i) => {
    const tw = 0.7 + 0.3 * Math.sin(t * 2.3 + i * 1.9) * Math.sin(t * 1.1 + i);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 60, '255,190,100', 0.42 * tw); ctx.restore();
    ctx.fillStyle = `rgba(255,${200 + 40 * tw},${130 + 60 * tw},1)`; ctx.beginPath(); ctx.ellipse(x, y, 7, 10, 0, 0, TAU); ctx.fill();
  });
  drawLantern(t);
  // polvo flotando en la luz de la ventana
  const r = rnd(31);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 34; i++) {
    const sx = r(), sy = r(), sp = 0.4 + r(), ph = r() * TAU;
    const x = 290 + 500 * fract(sx + t * 0.012 * sp) + 10 * Math.sin(t * 0.7 + ph), y = 250 + 820 * fract(sy - t * 0.008 * sp);
    const a = 0.25 + 0.25 * Math.sin(t * 2 + ph);
    ctx.fillStyle = `rgba(255,220,160,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + r() * 2.2, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // banquito + taza de té con vapor
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(866, 1114, 92, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1b11'; ctx.fillRect(800, 1052, 10, 60); ctx.fillRect(922, 1052, 10, 60);
  ctx.fillStyle = '#3d2817'; rr(ctx, 786, 1038, 160, 18, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,180,100,0.35)'; ctx.fillRect(790, 1038, 152, 3);
  ctx.fillStyle = '#e7d8c1'; rr(ctx, 840, 980, 54, 60, [4, 4, 12, 12]); ctx.fill();
  ctx.fillStyle = '#c4503a'; ctx.fillRect(840, 998, 54, 10);
  ctx.strokeStyle = '#e7d8c1'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(898, 1008, 13, -1.3, 1.3); ctx.stroke();
  ctx.fillStyle = '#6b3a17'; ctx.beginPath(); ctx.ellipse(867, 982, 25, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(120,70,40,0.35)'; ctx.fillRect(866, 1012, 28, 28);
  ctx.save(); ctx.lineCap = 'round'; ctx.filter = 'blur(3px)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let k = 0; k <= 26; k++) {
      const u = k / 26, y = 975 - u * 170, x = 862 + i * 9 + 14 * Math.sin(u * 7 + t * 2.2 + i * 2.1) * u;
      if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    const a = 0.16 + 0.06 * Math.sin(t * 1.3 + i);
    ctx.strokeStyle = `rgba(255,245,230,${a})`; ctx.lineWidth = 7 - i; ctx.stroke();
  }
  ctx.restore();
  // cojín
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(540, 1128, 250, 26, 0, 0, TAU); ctx.fill();
  let gr = ctx.createLinearGradient(0, 1068, 0, 1150); gr.addColorStop(0, '#d9a23a'); gr.addColorStop(1, '#7f5a1a');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(540, 1108, 232, 42, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 6; ctx.stroke();
  drawCat(t, lt, scIdx);
  // baranda en primer plano
  ctx.fillStyle = '#04080a';
  ctx.fillRect(0, 1442, W, 24); ctx.fillRect(0, 1850, W, 18);
  for (let x = 24; x < W; x += 78) ctx.fillRect(x, 1466, 12, 400);
  ctx.fillStyle = 'rgba(255,170,90,0.16)'; ctx.fillRect(0, 1442, W, 3);
}

// =====================================================================
// ESCENA B — Andén con Cactus
// =====================================================================
const bgB = mk(W, H);
(() => {
  const g = bgB.getContext('2d'), r = rnd(21);
  let gr = g.createLinearGradient(0, 0, 0, 1080); gr.addColorStop(0, '#070a1e'); gr.addColorStop(0.7, '#1a1640'); gr.addColorStop(1, '#2d1f50');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1090);
  stars(g, 4, 160, 0, 90, W, 820, 2.4);
  // ciudad lejana
  for (let layer = 0; layer < 2; layer++) {
    let x = -20;
    while (x < W) {
      const bw = 50 + r() * 90, bh = (layer ? 120 : 200) + r() * (layer ? 160 : 260), top = 1040 - bh;
      g.fillStyle = layer ? '#141235' : '#1b1844'; g.fillRect(x, top, bw, bh);
      for (let wy = top + 14; wy < 1030; wy += 22) for (let wx = x + 8; wx < x + bw - 10; wx += 16) {
        if (r() < (layer ? 0.18 : 0.12)) { g.fillStyle = r() < 0.8 ? `rgba(255,${190 + r() * 40},120,${0.35 + r() * 0.4})` : 'rgba(150,210,255,0.45)'; g.fillRect(wx, wy, 7, 10); }
      }
      x += bw + (layer ? 4 : 18);
    }
  }
  g.fillStyle = '#121030'; g.fillRect(694, 610, 26, 430); g.fillRect(704, 520, 6, 90);
  // valla del fondo
  g.fillStyle = '#0b0a1c'; g.fillRect(0, 990, W, 10); for (let x = 0; x < W; x += 60) g.fillRect(x, 990, 6, 90);
  g.fillRect(0, 1030, W, 6);
  // techo del andén
  g.fillStyle = '#0a0916'; g.fillRect(0, 0, W, 96);
  g.fillStyle = '#16142a'; g.fillRect(0, 86, W, 14);
  // pilares
  for (const px of [90, 950]) {
    g.fillStyle = '#100e20'; g.fillRect(px, 96, 42, 1000);
    g.fillStyle = 'rgba(255,220,160,0.12)'; g.fillRect(px + (px < 540 ? 34 : 0), 96, 8, 1000);
  }
  // letrero ANDÉN 3
  g.strokeStyle = '#05040b'; g.lineWidth = 3; g.beginPath(); g.moveTo(200, 96); g.lineTo(200, 186); g.moveTo(330, 96); g.lineTo(330, 186); g.stroke();
  g.fillStyle = '#1e2c58'; rr(g, 168, 184, 194, 62, 8); g.fill(); g.strokeStyle = '#d8dff0'; g.lineWidth = 3; rr(g, 174, 190, 182, 50, 6); g.stroke();
  g.fillStyle = '#eef2ff'; g.font = '800 30px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ANDÉN 3', 265, 216);
  // máquina expendedora
  g.fillStyle = '#1f2638'; rr(g, 150, 770, 172, 322, 10); g.fill();
  gr = g.createLinearGradient(0, 790, 0, 1000); gr.addColorStop(0, '#d9f1ff'); gr.addColorStop(1, '#7fc0e6');
  g.fillStyle = gr; g.fillRect(166, 790, 112, 210);
  const cols = ['#e05a4f', '#f2c14e', '#5fbf8f', '#6a8de0', '#e58fb4'];
  for (let row = 0; row < 5; row++) for (let c = 0; c < 4; c++) { g.fillStyle = cols[(row + c * 2) % 5]; g.fillRect(174 + c * 26, 802 + row * 40, 16, 26); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(170, 832 + row * 40, 104, 3); }
  g.fillStyle = '#2e3850'; g.fillRect(286, 800, 28, 120); for (let i = 0; i < 6; i++) { g.fillStyle = '#9fd7ff'; g.fillRect(292, 810 + i * 16, 16, 8); }
  g.fillStyle = '#0c0f18'; g.fillRect(176, 1020, 94, 40);
  // banca
  g.fillStyle = '#2b1e18'; g.fillRect(370, 1010, 340, 16); g.fillRect(384, 1026, 12, 64); g.fillRect(684, 1026, 12, 64);
  g.fillRect(370, 946, 340, 15); g.fillRect(370, 972, 340, 15); g.fillRect(384, 946, 10, 64); g.fillRect(686, 946, 10, 64);
  g.fillStyle = 'rgba(255,215,150,0.26)'; g.fillRect(370, 1010, 340, 3); g.fillRect(370, 946, 340, 2); g.fillRect(370, 972, 340, 2);
  // piso del andén
  gr = g.createLinearGradient(0, 1080, 0, 1256); gr.addColorStop(0, '#34304a'); gr.addColorStop(1, '#211e30');
  g.fillStyle = gr; g.fillRect(0, 1082, W, 174);
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let x = 0; x < W; x += 120) { g.beginPath(); g.moveTo(x, 1082); g.lineTo(x - 30, 1210); g.stroke(); }
  g.fillStyle = '#b8962f'; g.fillRect(0, 1212, W, 20);
  g.fillStyle = 'rgba(80,60,10,0.55)'; for (let x = 6; x < W; x += 16) for (const y of [1217, 1226]) { g.beginPath(); g.arc(x + (y === 1226 ? 8 : 0), y, 2.6, 0, TAU); g.fill(); }
  g.fillStyle = '#4a4562'; g.fillRect(0, 1246, W, 10);
  // vías
  g.fillStyle = '#09080f'; g.fillRect(0, 1256, W, 310);
  for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${90 + r() * 60},${85 + r() * 50},${100 + r() * 50},${0.06 + r() * 0.12})`; g.fillRect(r() * W, 1300 + r() * 250, 3, 2); }
  for (let x = -10; x < W; x += 62) { g.fillStyle = '#17121a'; g.fillRect(x, 1336, 30, 120); }
  for (const y of [1334, 1444]) { g.fillStyle = '#3d3a52'; g.fillRect(0, y, W, 12); g.fillStyle = 'rgba(200,190,230,0.35)'; g.fillRect(0, y, W, 3); }
  gr = g.createLinearGradient(0, 1566, 0, H); gr.addColorStop(0, '#13111c'); gr.addColorStop(1, '#06050a');
  g.fillStyle = gr; g.fillRect(0, 1566, W, H - 1566);
  g.fillStyle = 'rgba(184,150,47,0.35)'; g.fillRect(0, 1586, W, 14);
  g.fillStyle = '#2a2738'; g.fillRect(0, 1566, W, 6);
  // luces estáticas: cono del tubo + resplandor de la máquina
  g.globalCompositeOperation = 'lighter';
  gr = g.createLinearGradient(0, 136, 0, 1250); gr.addColorStop(0, 'rgba(255,226,165,0.24)'); gr.addColorStop(1, 'rgba(255,226,165,0.04)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(396, 136); g.lineTo(684, 136); g.lineTo(900, 1250); g.lineTo(180, 1250); g.closePath(); g.fill();
  glow(g, 540, 1160, 420, '255,215,150', 0.22);
  glow(g, 236, 900, 320, '140,205,255', 0.2);
  glow(g, 236, 1150, 220, '140,205,255', 0.14);
  // reflejos del piso mojado
  gr = g.createLinearGradient(0, 1090, 0, 1240); gr.addColorStop(0, 'rgba(150,210,255,0.18)'); gr.addColorStop(1, 'rgba(150,210,255,0)');
  g.fillStyle = gr; g.fillRect(166, 1090, 112, 150);
  gr = g.createLinearGradient(0, 1100, 0, 1240); gr.addColorStop(0, 'rgba(255,225,170,0.12)'); gr.addColorStop(1, 'rgba(255,225,170,0)');
  g.fillStyle = gr; g.fillRect(400, 1100, 280, 140);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(220,230,255,${0.03 + r() * 0.05})`; g.fillRect(150 + r() * 700, 1095 + r() * 110, 30 + r() * 90, 2); }
  g.globalCompositeOperation = 'source-over';
  // lámpara de tubo
  g.fillStyle = '#1a1828'; rr(g, 386, 104, 308, 26, 6); g.fill();
  g.fillStyle = '#fff6dc'; rr(g, 398, 126, 284, 10, 5); g.fill();
  g.globalCompositeOperation = 'lighter'; glow(g, 540, 132, 260, '255,235,190', 0.45); g.globalCompositeOperation = 'source-over';
})();

// tren (sprite fijo de 3 vagones)
const TRAIN_LEN = 3420;
const trainSpr = mk(TRAIN_LEN, 470);
(() => {
  const g = trainSpr.getContext('2d');
  for (let c = 0; c < 3; c++) {
    const x0 = c * 1140;
    const gr = g.createLinearGradient(0, 0, 0, 470); gr.addColorStop(0, '#2e3554'); gr.addColorStop(0.5, '#1b2036'); gr.addColorStop(1, '#0d1020');
    g.fillStyle = gr; rr(g, x0, 0, 1110, 470, c === 0 ? [90, 18, 18, 30] : 18); g.fill();
    g.fillStyle = 'rgba(190,200,255,0.18)'; g.fillRect(x0 + 20, 8, 1070, 5);
    g.fillStyle = '#8a2d2d'; g.fillRect(x0, 372, 1110, 20);
    for (let k = 0; k < 6; k++) {
      const wx = x0 + 60 + k * 175;
      if (k === 2) { g.fillStyle = '#121527'; g.fillRect(wx, 60, 120, 300); g.fillStyle = 'rgba(255,214,140,0.7)'; g.fillRect(wx + 12, 80, 42, 140); g.fillRect(wx + 66, 80, 42, 140); continue; }
      const wg = g.createLinearGradient(0, 70, 0, 230); wg.addColorStop(0, '#ffe7ae'); wg.addColorStop(1, '#f0a24c');
      g.fillStyle = wg; rr(g, wx, 70, 140, 160, 12); g.fill();
      g.fillStyle = 'rgba(120,60,20,0.35)'; g.fillRect(wx + 10, 170, 50, 60); g.fillRect(wx + 80, 170, 50, 60);
    }
  }
  // faro delantero
  g.fillStyle = '#fffbe8'; g.beginPath(); g.ellipse(40, 300, 22, 16, 0, 0, TAU); g.fill();
})();

function drawSceneB(t, lt, scIdx) {
  ctx.drawImage(bgB, 0, 0);
  twinkles(41, 40, 0, 120, W, 760, t);
  // luz roja de la torre
  const bl = fract(t / 1.6) < 0.3 ? 1 : 0.15;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 707, 516, 40, '255,60,60', 0.8 * bl); ctx.restore();
  // nubes moviéndose despacio
  ctx.save(); ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(90,70,150,0.25)';
  for (let i = 0; i < 4; i++) { const x = ((i * 380 + t * 14) % 1500) - 250; ctx.beginPath(); ctx.ellipse(x, 300 + i * 110, 240, 26, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
  rain(t, 81, 170, 96, 990, 38, 900, 1.4, 0.22, 0.0);
  // reloj de la estación (las 3:00)
  const cx = 830, cy = 252;
  ctx.fillStyle = '#05040b'; ctx.fillRect(826, 96, 8, 92);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, cx, cy, 170, '255,240,200', 0.2); ctx.restore();
  ctx.fillStyle = '#efe6cf'; ctx.beginPath(); ctx.arc(cx, cy, 62, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#1a1626'; ctx.lineWidth = 11; ctx.stroke();
  ctx.lineWidth = 4; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44); ctx.lineTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52); ctx.stroke(); }
  ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 30, cy); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 46); ctx.stroke();
  const sa = Math.floor(t) / 60 * TAU - Math.PI / 2 + 0.3;
  ctx.strokeStyle = '#b8322f'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - Math.cos(sa) * 10, cy - Math.sin(sa) * 10); ctx.lineTo(cx + Math.cos(sa) * 50, cy + Math.sin(sa) * 50); ctx.stroke();
  ctx.fillStyle = '#1a1626'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill();
  // parpadeo leve de la máquina expendedora
  const vf = 0.85 + 0.15 * (Math.sin(t * 13) > 0.92 ? 0 : 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 222, 895, 170, '170,220,255', 0.12 * vf); ctx.restore();
  // polillas alrededor de la lámpara
  for (let i = 0; i < 3; i++) {
    const mx = 540 + Math.cos(t * (2.4 + i * 0.7) + i * 2) * (90 + i * 30), my = 175 + Math.sin(t * (3.3 + i * 0.5) + i) * 30;
    const wg = Math.abs(Math.sin(t * 40 + i)) * 6 + 2;
    ctx.fillStyle = 'rgba(255,240,210,0.85)'; ctx.beginPath(); ctx.ellipse(mx - 3, my, wg, 3, 0.5, 0, TAU); ctx.ellipse(mx + 3, my, wg, 3, -0.5, 0, TAU); ctx.fill();
  }
  // tren
  let shake = 0, flick = 0, trainDraw = null;
  for (const tr of TRAINS) {
    const u = (t - tr.a) / tr.d;
    if (u >= -0.15 && u <= 1) {
      const startX = W + 80, endX = -TRAIN_LEN - 200;
      const x = lerp(startX, endX, clamp(u, 0, 1));
      trainDraw = { x, u };
      shake = Math.max(shake, Math.sin(Math.PI * clamp(u, 0, 1)));
    }
  }
  if (trainDraw && trainDraw.x < W) {
    const x = trainDraw.x;
    const visL = Math.max(0, -x), visR = Math.min(TRAIN_LEN, W - x);
    flick = visR > visL ? 1 : 0;
  }
  drawKitten(t, lt, scIdx, shake);
  if (trainDraw) {
    const { x, u } = trainDraw;
    // luz de ventanas barriendo el andén
    if (flick) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 18; k++) {
        const wx = x + 60 + k * 175 + Math.floor(k / 6) * 90;
        if (wx > -200 && wx < W + 100) { ctx.fillStyle = 'rgba(255,200,120,0.07)'; ctx.beginPath(); ctx.moveTo(wx, 1260); ctx.lineTo(wx + 140, 1260); ctx.lineTo(wx + 230, 900); ctx.lineTo(wx + 80, 900); ctx.fill(); }
      }
      ctx.restore();
    }
    // tren con desenfoque de movimiento
    ctx.save();
    for (let k = 0; k < 7; k++) { ctx.globalAlpha = k === 0 ? 1 : 0.16; ctx.drawImage(trainSpr, x + k * 14, 1176); }
    ctx.restore();
    // resplandor del faro delantero
    const fx = x + 40, fy = 1176 + 300;
    if (fx > -400 && fx < W + 500) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, fx, fy, 520, '255,240,200', 0.55); glow(ctx, fx, fy, 120, '255,255,240', 0.9);
      ctx.fillStyle = 'rgba(255,245,220,0.25)'; ctx.fillRect(fx - 600, fy - 3, 1200, 6);
      ctx.restore();
    }
  }
}

// =====================================================================
// ESCENA C — Faro junto al mar
// =====================================================================
const HZ = 1010;
const bgC = mk(W, H);
(() => {
  const g = bgC.getContext('2d'), r = rnd(51);
  let gr = g.createLinearGradient(0, 0, 0, HZ); gr.addColorStop(0, '#030918'); gr.addColorStop(0.6, '#0a1a33'); gr.addColorStop(1, '#1d3c5a');
  g.fillStyle = gr; g.fillRect(0, 0, W, HZ);
  // vía láctea
  g.save(); g.filter = 'blur(45px)'; g.fillStyle = 'rgba(120,150,210,0.16)';
  g.beginPath(); g.ellipse(560, 420, 900, 120, -0.55, 0, TAU); g.fill(); g.restore();
  stars(g, 8, 260, 0, 0, W, 940, 2.2);
  const r2 = rnd(9); for (let i = 0; i < 500; i++) { const u = r2(); const x = lerp(-100, 1200, u), y = 420 + (x - 560) * -0.62 + (r2() - 0.5) * 220; g.fillStyle = `rgba(220,230,255,${0.15 + r2() * 0.4})`; g.fillRect(x, y, 1.6, 1.6); }
  // luna
  g.globalCompositeOperation = 'lighter'; glow(g, 190, 300, 230, '200,215,255', 0.22); g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#efe8d2'; g.beginPath(); g.arc(190, 300, 44, 0, TAU); g.fill();
  g.fillStyle = 'rgba(160,150,130,0.35)'; for (const [x, y, s] of [[176, 290, 9], [204, 312, 7], [194, 284, 5]]) { g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
  // colinas lejanas
  g.fillStyle = '#0a1828'; g.beginPath(); g.moveTo(0, HZ); g.lineTo(0, 955); g.quadraticCurveTo(120, 930, 240, 968); g.quadraticCurveTo(330, 990, 430, HZ); g.fill();
  g.beginPath(); g.moveTo(880, HZ); g.quadraticCurveTo(980, 965, W, 972); g.lineTo(W, HZ); g.fill();
  // mar
  gr = g.createLinearGradient(0, HZ, 0, H); gr.addColorStop(0, '#132c45'); gr.addColorStop(0.3, '#081728'); gr.addColorStop(1, '#030912');
  g.fillStyle = gr; g.fillRect(0, HZ, W, H - HZ);
  for (let i = 0; i < 900; i++) {
    const v = r(), y = HZ + 4 + Math.pow(v, 1.7) * (H - HZ), len = 10 + (y - HZ) * 0.12 * (0.5 + r());
    g.fillStyle = `rgba(150,190,230,${0.04 + r() * 0.07})`; g.fillRect(r() * W, y, len, 1 + (y - HZ) / 400);
  }
  // isla
  g.fillStyle = '#0a121b'; g.beginPath(); g.moveTo(520, 1034); g.quadraticCurveTo(560, 1000, 620, 994); g.quadraticCurveTo(700, 975, 790, 992); g.quadraticCurveTo(860, 1000, 900, 1034); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(160,190,220,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(560, 1006); g.quadraticCurveTo(640, 986, 700, 982); g.quadraticCurveTo(780, 984, 850, 1004); g.stroke();
  // casita del farero
  g.fillStyle = '#b9b2a2'; g.fillRect(752, 958, 86, 44); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(800, 958, 38, 44);
  g.fillStyle = '#3e1a1a'; g.beginPath(); g.moveTo(744, 960); g.lineTo(795, 922); g.lineTo(846, 960); g.fill();
  g.fillStyle = '#2c2a2a'; g.fillRect(820, 920, 10, 26);
  g.fillStyle = '#ffd27a'; g.fillRect(764, 972, 16, 16); g.fillRect(810, 972, 16, 16);
  g.globalCompositeOperation = 'lighter'; glow(g, 772, 980, 50, '255,200,110', 0.5); glow(g, 818, 980, 50, '255,200,110', 0.5); g.globalCompositeOperation = 'source-over';
  // faro
  const tx = 700;
  const tower = new Path2D(); tower.moveTo(tx - 46, 996); tower.lineTo(tx - 30, 656); tower.lineTo(tx + 30, 656); tower.lineTo(tx + 46, 996); tower.closePath();
  gr = g.createLinearGradient(tx - 46, 0, tx + 46, 0); gr.addColorStop(0, '#e6e2d6'); gr.addColorStop(0.55, '#bdb8ab'); gr.addColorStop(1, '#6f6b63');
  g.fillStyle = gr; g.fill(tower);
  g.save(); g.clip(tower); g.fillStyle = 'rgba(140,40,40,0.85)'; g.fillRect(tx - 60, 750, 120, 40); g.fillRect(tx - 60, 870, 120, 40); g.restore();
  g.fillStyle = '#ffd27a'; g.fillRect(tx - 7, 820, 14, 22); g.fillRect(tx - 10, 966, 20, 30);
  g.globalCompositeOperation = 'lighter'; glow(g, tx, 830, 40, '255,200,110', 0.5); glow(g, tx, 980, 50, '255,200,110', 0.5); g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#1a1616'; g.fillRect(tx - 46, 640, 92, 16);
  g.strokeStyle = '#1a1616'; g.lineWidth = 3; for (let x = tx - 44; x <= tx + 44; x += 11) { g.beginPath(); g.moveTo(x, 640); g.lineTo(x, 622); g.stroke(); } g.beginPath(); g.moveTo(tx - 46, 622); g.lineTo(tx + 46, 622); g.stroke();
  g.fillStyle = '#fff2c4'; g.fillRect(tx - 24, 590, 48, 50);
  g.fillStyle = '#1a1616'; g.fillRect(tx - 2, 590, 4, 50);
  g.fillStyle = '#5a1f1f'; g.beginPath(); g.moveTo(tx - 30, 592); g.quadraticCurveTo(tx, 548, tx + 30, 592); g.fill();
  g.fillRect(tx - 2, 536, 4, 20);
})();
const fogSpr = mk(2400, 300);
(() => { const g = fogSpr.getContext('2d'), r = rnd(61); g.filter = 'blur(30px)';
  for (let i = 0; i < 26; i++) { const x = r() * 2400; g.fillStyle = `rgba(150,180,210,${0.1 + r() * 0.12})`; g.beginPath(); g.ellipse(x, 150 + (r() - 0.5) * 80, 160 + r() * 260, 30 + r() * 30, 0, 0, TAU); g.fill();
    if (x > 2000) { g.beginPath(); g.ellipse(x - 2400, 150, 200, 40, 0, 0, TAU); g.fill(); } }
})();

function drawBoat(x, y, s, t) {
  ctx.save(); ctx.translate(x, y + 4 * Math.sin(t * 1.6 + 1)); ctx.scale(s, s); ctx.rotate(0.05 * Math.sin(t * 1.6));
  // reflejo de la linterna
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 10; k++) { const a = 0.22 * (1 - k / 10) * (0.6 + 0.4 * Math.sin(t * 4 + k * 1.3)); ctx.fillStyle = `rgba(255,200,110,${a})`; ctx.fillRect(48 - 8 - k * 1.5 + Math.sin(t * 3 + k) * 4, 26 + k * 9, 16 + k * 3, 3); }
  glow(ctx, 50, -70, 120, '255,190,100', 0.45); ctx.restore();
  // gatito a bordo con su impermeable
  ctx.fillStyle = '#c99a26'; ctx.beginPath(); ctx.moveTo(-42, -8); ctx.quadraticCurveTo(-40, -54, -14, -56); ctx.quadraticCurveTo(12, -54, 14, -8); ctx.fill();
  ctx.fillStyle = '#b8783a';
  ctx.beginPath(); ctx.moveTo(-34, -78); ctx.lineTo(-30, -104); ctx.lineTo(-17, -86); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-11, -86); ctx.lineTo(2, -104); ctx.lineTo(6, -78); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-14, -72, 23, 19, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,120,0.55)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(-14, -72, 23, 19, 0, -1.2, 0.6); ctx.stroke();
  // casco
  ctx.fillStyle = '#0b0e16'; ctx.beginPath(); ctx.moveTo(-90, -12); ctx.lineTo(90, -16); ctx.quadraticCurveTo(70, 26, 0, 26); ctx.quadraticCurveTo(-70, 26, -90, -12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,190,110,0.5)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-88, -12); ctx.lineTo(88, -16); ctx.stroke();
  // linterna en un poste
  ctx.strokeStyle = '#0b0e16'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(58, -14); ctx.lineTo(50, -58); ctx.stroke();
  ctx.fillStyle = '#ffe6a6'; rr(ctx, 42, -80, 16, 20, 3); ctx.fill();
  ctx.restore();
}

function drawSceneC(t, lt, scIdx, sc) {
  const dur = sc.b - sc.a, z = 1 + 0.04 * (lt / dur);
  ctx.save(); ctx.translate(680, 920); ctx.scale(z, z); ctx.translate(-680, -920);
  ctx.drawImage(bgC, 0, 0);
  twinkles(71, 60, 0, 0, W, 900, t);
  // reflejo de la luna
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 40; k++) { const y = HZ + 8 + k * 14, a = 0.1 * (1 - k / 40) * (0.5 + 0.5 * Math.sin(t * 2.4 + k * 2.1)); ctx.fillStyle = `rgba(210,220,255,${a})`; ctx.fillRect(190 - 20 - k * 1.2 + Math.sin(t * 1.7 + k) * 8, y, 40 + k * 2.4, 3); }
  ctx.restore();
  // haz giratorio del faro
  const O = [700, 615], th = t * 1.25;
  let flare = 0;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(10px)';
  for (const off of [0, Math.PI]) {
    const c = Math.cos(th + off), s = Math.sin(th + off), side = Math.sign(c) || 1;
    const L = 80 + 1150 * Math.abs(c), spread = 26 + 130 * Math.abs(c), a0 = 0.13 + 0.25 * Math.max(0, s);
    flare = Math.max(flare, Math.max(0, s) ** 6);
    const gr = ctx.createLinearGradient(O[0], 0, O[0] + side * L, 0);
    gr.addColorStop(0, `rgba(255,240,190,${a0})`); gr.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(O[0], O[1] - 10); ctx.lineTo(O[0] + side * L, O[1] - spread); ctx.lineTo(O[0] + side * L, O[1] + spread * 0.8); ctx.lineTo(O[0], O[1] + 10); ctx.closePath(); ctx.fill();
  }
  ctx.filter = 'none';
  glow(ctx, O[0], O[1], 140 + 380 * flare, '255,235,180', 0.5 + 0.4 * flare);
  glow(ctx, O[0], O[1], 40, '255,255,235', 0.95);
  ctx.restore();
  // camino de luz del faro sobre el agua
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 64; k++) {
    const y = 1040 + Math.pow(k, 1.25) * 9.5; if (y > H) break;
    const w = 10 + k * 2.6, a = (0.12 + 0.2 * flare) * (1 - k / 64) * (0.45 + 0.55 * Math.sin(t * 3.1 + k * 1.7));
    ctx.fillStyle = `rgba(255,214,140,${Math.max(0, a)})`; ctx.fillRect(700 - w / 2 + Math.sin(t * 2 + k * 0.9) * (4 + k * 0.5), y, w, 2 + k * 0.06);
  }
  ctx.restore();
  // humo de la chimenea
  ctx.save(); ctx.filter = 'blur(4px)';
  for (let i = 0; i < 6; i++) { const u = fract(t * 0.18 + i / 6); ctx.fillStyle = `rgba(170,185,200,${0.18 * (1 - u)})`; ctx.beginPath(); ctx.arc(825 + u * 40 + Math.sin(u * 6 + t) * 6, 916 - u * 120, 6 + u * 16, 0, TAU); ctx.fill(); }
  ctx.restore();
  // niebla
  ctx.globalAlpha = 0.7;
  const fo = (t * 16) % 2400; ctx.drawImage(fogSpr, -fo, 860); ctx.drawImage(fogSpr, 2400 - fo, 860);
  ctx.globalAlpha = 0.45; const fo2 = (t * 9 + 900) % 2400; ctx.drawImage(fogSpr, -fo2, 1000); ctx.drawImage(fogSpr, 2400 - fo2, 1000);
  ctx.globalAlpha = 1;
  // barquito con el cactus, acercándose al faro
  if (scIdx === 3) drawBoat(lerp(250, 290, lt / dur), 1300, 1.0, t);
  else drawBoat(lerp(470, 505, lt / dur), 1128, 0.62, t);
  ctx.restore();
}

// =====================================================================
// Texto (subtítulos + firma), viñeta, grano
// =====================================================================
function drawText(t) {
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (const s of TL.subs) {
    if (t < s.a || t > s.b) continue;
    const a = Math.min(1, (t - s.a) / 0.1, (s.b - t) / 0.1);
    const lines = s.txt.split('\n');
    ctx.globalAlpha = a; ctx.font = '900 52px Nunito';
    lines.forEach((ln, i) => {
      const y = 1352 + (i - (lines.length - 1) / 2) * 62;
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
      ctx.strokeStyle = 'rgba(15,10,0,0.7)'; ctx.lineWidth = 8; ctx.strokeText(ln, 540, y);
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#ffd83a'; ctx.fillText(ln, 540, y);
    });
  }
  ctx.globalAlpha = 0.95; ctx.font = '700 74px Caveat'; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff'; ctx.fillText(FIRMA, 540, 1508);
  ctx.restore();
}

let pat = null;
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let idx = SCENES.findIndex(s => t >= s.a && t < s.b); if (idx < 0) idx = SCENES.length - 1;
  const sc = SCENES[idx], lt = t - sc.a;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (sc.k === 'A') drawSceneA(t, lt, idx);
  else if (sc.k === 'B') { drawSceneB(t, lt, idx); splashes(t, 91, 36); rain(t, 83, 120, 1150, 1700, 72, 1700, 2.2, 0.0, 0.32); }
  else drawSceneC(t, lt, idx, sc);
  ctx.drawImage(vign, 0, 0);
  // grano de película
  if (!pat) pat = ctx.createPattern(grain, 'repeat');
  const r = rnd(Math.floor(t * 24) + 1);
  ctx.save(); ctx.globalAlpha = 0.06; ctx.globalCompositeOperation = 'overlay'; ctx.translate(-r() * 512, -r() * 512);
  ctx.fillStyle = pat; ctx.fillRect(0, 0, W + 512, H + 512); ctx.restore();
  drawText(t);
  // fundido de entrada y salida
  const fade = Math.max(1 - t / 0.35, (t - (TL.dur - 0.55)) / 0.55);
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(fade, 0, 1)})`; ctx.fillRect(0, 0, W, H); }
}

window.render = render;
window.ready = Promise.all([
  document.fonts.load('900 52px Nunito'), document.fonts.load('800 30px Nunito'), document.fonts.load('700 74px Caveat'),
]).then(() => { /* rehacer el letrero con la fuente cargada */
  const g = bgB.getContext('2d');
  g.fillStyle = '#1e2c58'; g.fillRect(178, 194, 174, 42);
  g.fillStyle = '#eef2ff'; g.font = '800 30px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ANDÉN 3', 265, 216);
  return true;
});
