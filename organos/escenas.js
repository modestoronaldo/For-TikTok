/* Escenas, fondos y coreografía. */
'use strict';
const SC = {};
for (const s of TL.escenas) SC[s.k] = s;

// ======================= FONDOS (en caché) =======================
const BG = {};
function buildBGs() {
BG.intro = bgCache(g => {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1450'); gr.addColorStop(0.7, '#43206e'); gr.addColorStop(1, '#1d0f33');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.04)'; for (let x = 0; x < W; x += 120) g.fillRect(x, 0, 60, 820);
  gr = g.createLinearGradient(0, 820, 0, H); gr.addColorStop(0, '#3a2530'); gr.addColorStop(1, '#1a1015'); g.fillStyle = gr; g.fillRect(0, 820, W, H - 820);
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3; for (let y = 840; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // ventana con la ciudad de noche
  g.fillStyle = '#120a24'; rr(g, 1300, 120, 460, 380, 14); g.fill(); g.lineWidth = 14; g.strokeStyle = '#1a0e2e'; g.stroke();
  const r = rnd(9); for (let i = 0; i < 18; i++) { const bx = 1310 + i * 25, bh = 80 + r() * 200; g.fillStyle = '#1e1438'; g.fillRect(bx, 500 - bh, 24, bh); for (let k = 0; k < 8; k++) if (r() < 0.4) { g.fillStyle = 'rgba(255,210,120,0.8)'; g.fillRect(bx + 6, 500 - bh + 10 + k * 22, 6, 8); } }
  // mesa con botellas y vasos (sin marcas)
  g.fillStyle = '#5a3424'; g.fillRect(120, 640, 460, 26); g.fillRect(150, 666, 20, 160); g.fillRect(530, 666, 20, 160);
  for (const [bx, c] of [[170, '#3d7a3a'], [250, '#8a4b20'], [330, '#d9d9e8'], [420, '#3d7a3a']]) { g.fillStyle = c; rr(g, bx, 520, 44, 120, 10); g.fill(); g.fillRect(bx + 14, 480, 16, 44); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
  vignetteOn(g, W, H, 0.5);
});
BG.estomago = bgCache(g => {
  cells(g, W, H, { base: '#c25a52', light: '#ffb3a3', mid: '#e8806f', dark: '#9a3a34', rmin: 30, rmax: 110, count: 220, seed: 11 });
  folds(g, W, H, { dark: 'rgba(120,30,30,0.55)', mid: 'rgba(240,140,125,0.9)', light: 'rgba(255,210,195,0.6)', count: 9, seed: 4 });
  // entrada del esófago (tubo) arriba a la izquierda
  g.fillStyle = '#5a1418'; g.beginPath(); g.ellipse(250, 150, 150, 95, -0.2, 0, TAU); g.fill();
  g.lineWidth = 26; g.strokeStyle = '#e8806f'; g.stroke(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  // salida a la sangre a la derecha
  g.fillStyle = '#4a0b12'; g.beginPath(); g.ellipse(1800, 640, 110, 150, 0, 0, TAU); g.fill(); g.lineWidth = 24; g.strokeStyle = '#d4504a'; g.stroke(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  let gr = g.createLinearGradient(0, 900, 0, H); gr.addColorStop(0, 'rgba(60,10,10,0)'); gr.addColorStop(1, 'rgba(60,10,10,0.6)'); g.fillStyle = gr; g.fillRect(0, 900, W, 180);
  vignetteOn(g, W, H, 0.55);
});
BG.cerebro = bgCache(g => {
  cells(g, W, H, { base: '#8a4a7a', light: '#f7c6dc', mid: '#d68aae', dark: '#7a3a64', rmin: 40, rmax: 120, count: 200, seed: 21 });
  g.fillStyle = 'rgba(40,10,40,0.35)'; g.fillRect(0, 0, W, H);
  // monitores
  for (const [mx, my, mw, mh, tt] of [[360, 120, 380, 220, 'VISIÓN'], [780, 90, 420, 250, 'NEURONAS'], [1240, 120, 380, 220, 'MEMORIA']]) {
    g.fillStyle = '#1b1830'; rr(g, mx, my, mw, mh, 18); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#20345a'; rr(g, mx + 16, my + 16, mw - 32, mh - 32, 10); g.fill();
    g.fillStyle = '#8fe3ff'; g.font = '700 30px Fredoka'; g.textAlign = 'center'; g.fillText(tt, mx + mw / 2, my + mh - 34);
  }
  // consola
  g.fillStyle = '#3a3554'; g.beginPath(); g.moveTo(420, 760); g.lineTo(1080, 760); g.lineTo(1140, 1000); g.lineTo(360, 1000); g.closePath(); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#4c4670'; g.fillRect(420, 760, 660, 30);
  const cols = ['#ff5e7e', '#ffd23f', '#5bc0eb', '#7ae582'];
  for (let i = 0; i < 16; i++) { g.fillStyle = cols[i % 4]; g.beginPath(); g.arc(470 + i * 38, 850 + (i % 2) * 40, 11, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); }
  // puerta (vaso sanguíneo) a la izquierda
  g.fillStyle = '#3d0a14'; g.beginPath(); g.ellipse(140, 720, 110, 170, 0, 0, TAU); g.fill(); g.lineWidth = 22; g.strokeStyle = '#c8414a'; g.stroke(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  let gr = g.createLinearGradient(0, 960, 0, H); gr.addColorStop(0, '#5a2a52'); gr.addColorStop(1, '#2e1229'); g.fillStyle = gr; g.fillRect(0, 990, W, 90);
  vignetteOn(g, W, H, 0.5);
});
BG.rinones = bgCache(g => {
  cells(g, W, H, { base: '#6a2448', light: '#f29bbd', mid: '#c4557f', dark: '#5a1a3a', rmin: 35, rmax: 100, count: 220, seed: 31 });
  g.fillStyle = 'rgba(30,0,30,0.25)'; g.fillRect(0, 0, W, H);
  // tuberías
  g.lineCap = 'round';
  for (const [y, c] of [[140, '#9a8fc0'], [210, '#7f74a8']]) { g.strokeStyle = INK; g.lineWidth = 46; g.beginPath(); g.moveTo(-20, y); g.lineTo(W + 20, y); g.stroke(); g.strokeStyle = c; g.lineWidth = 34; g.stroke(); }
  // tanque de agua (marco)
  g.fillStyle = 'rgba(200,230,255,0.25)'; rr(g, 1470, 330, 300, 560, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#ffffff'; g.font = '700 34px Fredoka'; g.textAlign = 'center'; g.fillText('AGUA DEL CUERPO', 1620, 310);
  // radio / antena
  g.fillStyle = '#3d3a58'; rr(g, 200, 520, 340, 260, 20); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(480, 520); g.lineTo(520, 400); g.stroke(); g.fillStyle = '#ff5e7e'; g.beginPath(); g.arc(520, 396, 14, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#1b2440'; rr(g, 225, 545, 290, 140, 12); g.fill();
  // piso
  let gr = g.createLinearGradient(0, 940, 0, H); gr.addColorStop(0, '#4a1636'); gr.addColorStop(1, '#25081a'); g.fillStyle = gr; g.fillRect(0, 940, W, 140);
  vignetteOn(g, W, H, 0.5);
});
BG.bano = bgCache(g => {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a2a5a'); gr.addColorStop(1, '#22163a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.05)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 45, 860);
  g.fillStyle = '#4a3226'; g.fillRect(0, 860, W, 220);
  // puerta del baño
  g.fillStyle = '#7a4a30'; rr(g, 1350, 260, 330, 600, 10); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(1630, 580, 16, 0, TAU); g.fill(); g.lineWidth = 4; g.stroke();
  g.fillStyle = '#f4f4f4'; rr(g, 1405, 320, 220, 90, 14); g.fill(); g.lineWidth = 5; g.stroke();
  g.fillStyle = '#2a1a22'; g.font = '700 54px Fredoka'; g.textAlign = 'center'; g.fillText('BAÑO', 1515, 385);
  vignetteOn(g, W, H, 0.45);
});
BG.higado = bgCache(g => {
  g.fillStyle = '#5a1c18'; g.fillRect(0, 0, W, H);
  // lobulillos hexagonales del hígado
  const R = 70;
  for (let row = -1; row < 12; row++) for (let col = -1; col < 18; col++) {
    const cx = col * R * 1.5, cy = row * R * 1.73 + (col % 2 ? R * 0.86 : 0);
    const gr = g.createRadialGradient(cx - 15, cy - 20, 5, cx, cy, R);
    gr.addColorStop(0, '#d0675a'); gr.addColorStop(0.7, '#9a3a30'); gr.addColorStop(1, '#6e221d');
    g.fillStyle = gr; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; const X = cx + Math.cos(a) * (R - 5), Y = cy + Math.sin(a) * (R - 5); k ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.closePath(); g.fill();
    g.fillStyle = 'rgba(60,10,20,0.6)'; g.beginPath(); g.arc(cx, cy, 9, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(30,5,5,0.3)'; g.fillRect(0, 0, W, H);
  // máquinas (cuerpo)
  for (const [mx, txt, c] of [[1010, 'MÁQUINA 1', '#4f7cac'], [1490, 'MÁQUINA 2', '#6a5aa8']]) {
    g.fillStyle = c; rr(g, mx - 130, 470, 260, 350, 20); g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#26203a'; rr(g, mx - 90, 560, 180, 120, 60); g.fill(); g.lineWidth = 6; g.stroke();
    g.fillStyle = '#fff'; g.font = '700 30px Fredoka'; g.textAlign = 'center'; g.fillText(txt, mx, 520);
    g.strokeStyle = INK; g.lineWidth = 30; g.beginPath(); g.moveTo(mx + 60, 470); g.lineTo(mx + 60, 400); g.stroke(); g.strokeStyle = '#8c8aa0'; g.lineWidth = 20; g.stroke();
    g.fillStyle = '#ffd23f'; rr(g, mx - 110, 720, 220, 70, 10); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  }
  g.fillStyle = INK; g.font = '700 26px Fredoka';
  g.fillText('ADH', 1010, 765); g.fillText('ALDH', 1490, 765);
  // cartel "fila de espera"
  g.fillStyle = '#f4f4f4'; rr(g, 90, 120, 520, 150, 16); g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#c0392b'; g.font = '700 42px Fredoka'; g.textAlign = 'center'; g.fillText('FILA DE ESPERA', 350, 180); g.fillStyle = INK; g.font = '700 50px Fredoka'; g.fillText('4 TRAGOS', 350, 240);
  // banda transportadora
  g.fillStyle = '#2b2b38'; g.fillRect(0, 820, W, 60); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(-10, 820, W + 20, 60);
  for (let x = 30; x < W; x += 90) { g.fillStyle = '#555568'; g.beginPath(); g.arc(x, 850, 22, 0, TAU); g.fill(); g.lineWidth = 4; g.stroke(); }
  let gr = g.createLinearGradient(0, 880, 0, H); gr.addColorStop(0, '#3a1210'); gr.addColorStop(1, '#1a0606'); g.fillStyle = gr; g.fillRect(0, 880, W, 200);
  vignetteOn(g, W, H, 0.5);
});
BG.cuarto = bgCache(g => {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f7e3c4'); gr.addColorStop(1, '#e8c9a0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff6e0'; rr(g, 1200, 120, 520, 420, 12); g.fill(); g.lineWidth = 14; g.strokeStyle = '#9a7a5a'; g.stroke();
  gr = g.createLinearGradient(1200, 120, 1720, 540); gr.addColorStop(0, '#bfe6ff'); gr.addColorStop(1, '#ffe7a8'); g.fillStyle = gr; g.fillRect(1214, 134, 492, 392);
  g.fillStyle = '#9a7a5a'; g.fillRect(1452, 134, 14, 392); g.fillRect(1214, 322, 492, 14);
  g.fillStyle = '#8b6a4a'; g.fillRect(0, 900, W, 180);
  // cama
  g.fillStyle = '#6b4a34'; rr(g, 160, 560, 1100, 380, 20); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#fafafa'; rr(g, 200, 600, 300, 160, 40); g.fill(); g.stroke();
  vignetteOn(g, W, H, 0.3);
});
BG.descanso = bgCache(g => {
  cells(g, W, H, { base: '#a05a7a', light: '#ffd6e2', mid: '#e7a2b8', dark: '#9a4f6e', rmin: 40, rmax: 120, count: 180, seed: 41 });
  g.fillStyle = 'rgba(255,220,180,0.18)'; g.fillRect(0, 0, W, H);
  let gr = g.createLinearGradient(0, 930, 0, H); gr.addColorStop(0, '#7a3a56'); gr.addColorStop(1, '#4a1e34'); g.fillStyle = gr; g.fillRect(0, 930, W, 150);
  vignetteOn(g, W, H, 0.45);
});
BG.final = bgCache(g => {
  let gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100); gr.addColorStop(0, '#ff9a5a'); gr.addColorStop(1, '#b8325a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H * 0.6); for (let k = 0; k < 24; k++) { g.rotate(TAU / 24); g.fillStyle = k % 2 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(1400, -180); g.lineTo(1400, 180); g.fill(); } g.restore();
  g.fillStyle = '#5a1a3a'; g.beginPath(); g.ellipse(W / 2, 960, 600, 90, 0, 0, TAU); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
});

}
// ======================= CÁMARA =======================
// posiciones de cabeza de cada personaje por escena (para primeros planos)
const CLOSE = {
  estomago: { ETA: [720, 790], EST: [1300, 700] },
  cerebro: { ETA: [700, 790], CER: [1300, 640] },
  rinones: { RI1: [780, 730], RI2: [1070, 730] },
  higado: { HIG: [470, 720], ETA: [780, 720], ACE: [1240, 660] },
  manana: { CER: [420, 620], EST: [800, 720], RI2: [1180, 750], HIG: [1560, 720] },
  final: { ETA: [960, 700] },
};
const WIDE_LINES = new Set([2, 6, 12, 16, 21, 23, 29]);
function camera(t, sc) {
  const lt = t - sc.a;
  if (sc.k === 'intro') { const z = 1 + 0.03 * lt + 3.2 * Math.pow(span(t, LN(1).a + 0.3, sc.b), 2.2); return [lerp(960, 900, span(t, 7, sc.b)), lerp(540, 700, span(t, 7, sc.b)), z]; }
  if (sc.k === 'bano' || sc.k === 'final' && t > EV.tarjeta) return [960, 540, 1 + 0.02 * lt];
  const l = lineAt(t);
  const cl = CLOSE[sc.k];
  if (l && l.escena === sc.k && cl && cl[l.quien] && !WIDE_LINES.has(l.id) && !(sc.k === 'manana' && t < 122.3)) {
    const pr = span(t, l.a, l.b + 0.3);
    const [x, y] = cl[l.quien];
    // en el hígado, cuando habla ACE desde la máquina 2
    if (l.id === 21) return [1490, 640, 1.5 + 0.06 * pr];
    return [x, y, 1.55 + 0.07 * pr];
  }
  if (sc.k === 'higado' && t > EV.ding - 0.2 && t < LN(22).a) return [1500, 640, 1.25];
  return [960, 540, 1.0 + 0.03 * fract(lt / 6)];
}

// ======================= ESCENAS =======================
function sceneIntro(t, lt) {
  ctx.drawImage(BG.intro, 0, 0, W, H);
  // luces de discoteca
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 6; k++) { const x = 960 + Math.sin(t * 0.9 + k * 1.3) * 800, y = 420 + Math.cos(t * 1.1 + k) * 300; glow(ctx, x, y, 200, ['255,80,160', '80,200,255', '255,220,80'][k % 3], 0.25); }
  ctx.restore();
  // guirnalda de luces
  for (let k = 0; k < 22; k++) { const x = 40 + k * 88, y = 70 + Math.sin(k / 21 * Math.PI) * 60; const on = 0.6 + 0.4 * Math.sin(t * 4 + k); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 40, ['255,200,90', '255,90,150', '90,200,255'][k % 3], 0.5 * on); ctx.restore(); ctx.fillStyle = '#fff4d0'; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); }
  // siluetas bailando
  ctx.fillStyle = 'rgba(15,5,30,0.75)';
  for (const [x, ph] of [[180, 0], [380, 1.7], [1500, 0.8], [1720, 2.4]]) { const b = Math.abs(Math.sin(t * 6 + ph)) * 16; ctx.beginPath(); ctx.arc(x, 520 - b, 55, 0, TAU); ctx.fill(); rr(ctx, x - 65, 580 - b, 130, 300, 50); ctx.fill(); }
  drawPersona(900, 960, 1.15, t, { cheers: true, dance: 1, smile: 0.9 });
  // tarjeta: 1 trago ≈ 1 hora
  const p = popIn(t, 3.2) * (1 - span(t, 7.2, 7.5));
  if (p > 0) {
    ctx.save(); ctx.translate(380, 300); ctx.scale(p, p);
    ctx.fillStyle = '#fff6e8'; rr(ctx, -250, -120, 500, 240, 30); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
    ctx.font = '700 64px Fredoka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK;
    ctx.fillText('1 trago ≈ 1 hora', 0, -40);
    // reloj
    ctx.beginPath(); ctx.arc(0, 55, 40, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
    const a = t * 3; ctx.beginPath(); ctx.moveTo(0, 55); ctx.lineTo(Math.cos(a) * 28, 55 + Math.sin(a) * 28); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 55); ctx.lineTo(0, 30); ctx.stroke();
    ctx.restore();
  }
  label('Contenido educativo', 1660, 1030, { size: 30, color: 'rgba(255,255,255,0.8)' });
}

function sceneEstomago(t, lt) {
  ctx.drawImage(BG.estomago, 0, 0, W, H);
  // charco de ácido con burbujas
  const acid = 1 + 0.8 * span(t, LN(5).a, LN(5).a + 0.6);
  ctx.save();
  const gr = ctx.createLinearGradient(0, 960, 0, H); gr.addColorStop(0, 'rgba(190,230,60,0.85)'); gr.addColorStop(1, 'rgba(120,170,20,0.95)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 30) ctx.lineTo(x, 975 + Math.sin(x * 0.01 + t * 2) * 8);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  const r = rnd(2);
  for (let k = 0; k < 30 * acid; k++) { const x = r() * W, u = fract(r() + t * (0.5 + r())); ctx.beginPath(); ctx.arc(x, 1060 - u * 100, 4 + r() * 10, 0, TAU); ctx.fillStyle = `rgba(230,255,140,${0.8 * (1 - u)})`; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(60,80,10,${1 - u})`; ctx.stroke(); }
  ctx.restore();
  // Eti: tobogán desde el esófago
  const s0 = EV.tobogan, s1 = s0 + 1.15;
  let ex, ey, rot = 0, hop = 0;
  if (t < s0) { ex = -200; ey = 0; }
  else if (t < s1) { const u = span(t, s0, s1); ex = lerp(260, 720, u); ey = lerp(170, 900, u * u); rot = u * TAU * 1.5; }
  else if (t < LN(5).b + 0.2) { ex = 720; ey = 900; hop = t < s1 + 0.4 ? 1 : 0; }
  else { const u = span(t, LN(5).b + 0.2, sc_end('estomago') - 0.05); ex = lerp(720, 1800, easeOut(u)); ey = lerp(900, 760, u); }
  if (ex > -100) drawEti(ex, ey, 1.0, t, { rot, hop: speaking('ETA', t) ? 0.4 : hop, armL: t > LN(4).a && t < LN(4).b ? 'point' : (speaking('ETA', t) ? 'up' : 'down'), armR: speaking('ETA', t) ? 'hip' : 'down', walk: t > LN(5).b + 0.2, flip: t > LN(4).a && t < LN(4).b });
  drawEstomago(1300, 960, 1.15, t, { flip: true, cross: !speaking('EST', t) && t > LN(3).b, brow: -0.8 });
  // carteles
  const p1 = popIn(t, LN(4).a + 2.2);
  if (t > LN(4).a + 2.2 && t < LN(5).a) { label('INTESTINO →', 1500, 330, { size: 60 * p1, bg: '#ffd23f', color: INK, stroke: false }); label('~20% se absorbe aquí', 520, 330, { size: 46 * p1, bg: '#fff6e8', color: INK, stroke: false }); }
  if (t > LN(5).a + 0.5 && t < LN(5).b + 0.3) label('¡ÁCIDO!', 960, 870, { size: 70 * popIn(t, LN(5).a + 0.5), color: '#d8ff6a', rot: -0.08 });
  label('SANGRE →', 1800, 440, { size: 40, color: '#fff' });
}
function sc_end(k) { return SC[k].b; }

function sceneCerebro(t, lt) {
  ctx.drawImage(BG.cerebro, 0, 0, W, H);
  const pal = span(t, EV.palanca, EV.palanca + 0.3);
  // pantallas animadas
  ctx.save();
  ctx.strokeStyle = '#8fe3ff'; ctx.lineWidth = 4; ctx.beginPath();
  for (let x = 0; x < 340; x += 6) { const y = 205 + Math.sin(x * 0.05 + t * 6) * 30 * (1 - 0.7 * pal); x ? ctx.lineTo(380 + x, y) : ctx.moveTo(380 + x, y); } ctx.stroke();
  for (let k = 0; k < 9; k++) { const nx = 830 + (k % 3) * 160, ny = 150 + Math.floor(k / 3) * 55; const on = fract(t * (1 - 0.8 * pal) * 2 + k * 0.37) < 0.5; ctx.fillStyle = on ? '#ffd23f' : '#3a4a7a'; ctx.beginPath(); ctx.arc(nx, ny, 12, 0, TAU); ctx.fill(); }
  ctx.restore();
  label('MEMORIA', 1430, 210, { size: 38, color: t > EV.palanca ? '#ff5e7e' : '#7ae582' });
  if (t > EV.palanca) label('GUARDANDO… ERROR', 1430, 260, { size: 26, color: '#ff5e7e' });
  // palancas
  const levers = [['FRENO', 560, pal], ['EQUILIBRIO', 760, span(t, LN(11).a, LN(11).a + 0.8) * 0.8], ['REFLEJOS', 960, span(t, EV.palanca + 0.4, EV.palanca + 1.5) * 0.6]];
  for (const [nm, lx, v] of levers) {
    ctx.fillStyle = '#26223a'; rr(ctx, lx - 22, 650, 44, 120, 14); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    const ang = lerp(-0.5, 0.6, v);
    ctx.save(); ctx.translate(lx, 760); ctx.rotate(ang); limb(0, 0, 0, -110, 14, '#bbb'); ctx.beginPath(); ctx.arc(0, -118, 22, 0, TAU); ctx.fillStyle = nm === 'FRENO' ? '#ff3b4e' : '#ffd23f'; ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
    label(nm, lx, 800, { size: 24 });
  }
  // alarma
  if (t > EV.palanca) { const a = Math.max(0, Math.sin(t * 9)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 960, 30, 600, '255,40,60', 0.35 * a); ctx.restore(); }
  // Eti
  let ex = 220, ey = 900, walk = false, flip = false, armR = 'down';
  if (t < SC.cerebro.a + 1.2) { const u = span(t, SC.cerebro.a + 0.1, SC.cerebro.a + 1.2); ex = lerp(140, 380, easeOut(u)); walk = true; }
  else if (t < LN(8).a) ex = 380;
  else if (t < LN(8).a + 1.4) { ex = lerp(380, 480, span(t, LN(8).a, LN(8).a + 1.4)); walk = true; }
  else ex = 480;
  if (t > LN(8).a + 1.4) armR = 'reach';
  drawEti(ex, ey, 1.0, t, { walk, armR, armL: speaking('ETA', t) ? 'up' : 'down', smile: t > LN(10).a ? 0.3 : 0.8, brow: t > LN(10).a ? 0.8 : 0.1, lx: 0.6 });
  // Cerebro
  const diz = t > LN(11).a;
  drawCerebro(1300, 960, 1.15, t, { panic: t > LN(9).a && t < LN(9).b, dizzy: diz, rot: diz ? Math.sin(t * 3) * 0.06 : 0, brow: t > LN(7).a ? 1 : 0.5, lx: -0.5 });
  if (t > EV.palanca && t < LN(11).a) label('¡FRENO ABAJO!', 960, 470, { size: 72 * popIn(t, EV.palanca), color: '#ff5e7e', rot: -0.05 });
  if (diz) { label('EQUILIBRIO: 35%', 960, 470, { size: 60 * popIn(t, LN(11).a), color: '#ffd23f' }); }
}

function sceneRinones(t, lt) {
  ctx.drawImage(BG.rinones, 0, 0, W, H);
  // nivel del tanque
  const lvl = lerp(0.82, 0.38, span(t, LN(13).a + 0.6, LN(14).b));
  const top = 330 + 560 * (1 - lvl);
  ctx.save(); rr(ctx, 1475, 335, 290, 550, 26); ctx.clip();
  const gr = ctx.createLinearGradient(0, top, 0, 890); gr.addColorStop(0, '#7fd3ff'); gr.addColorStop(1, '#2a7fc4');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(1470, 900); for (let x = 1470; x <= 1770; x += 10) ctx.lineTo(x, top + Math.sin(x * 0.04 + t * 4) * 6); ctx.lineTo(1770, 900); ctx.closePath(); ctx.fill();
  ctx.restore();
  label(`${Math.round(lvl * 100)}%`, 1620, top + 50, { size: 54 });
  // chorro de salida
  if (t > LN(13).a + 0.6) { ctx.save(); ctx.strokeStyle = 'rgba(120,200,255,0.9)'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.setLineDash([40, 18]); ctx.lineDashOffset = -t * 300; ctx.beginPath(); ctx.moveTo(1770, 840); ctx.quadraticCurveTo(1880, 860, 1900, 1080); ctx.stroke(); ctx.restore(); label('→ VEJIGA', 1760, 960, { size: 40, color: '#bfe9ff' }); }
  // pantalla de señal
  const sig = 1 - span(t, LN(12).a + 1.0, LN(12).a + 2.2);
  for (let k = 0; k < 5; k++) { ctx.fillStyle = k < Math.round(sig * 5) ? '#7ae582' : '#3a3a55'; ctx.fillRect(250 + k * 50, 660 - k * 20, 36, 20 + k * 20); }
  label('SEÑAL: HORMONA', 370, 575, { size: 28, color: '#8fe3ff' });
  if (sig < 0.05) { const bl = fract(t * 2) < 0.6; if (bl) label('SIN SEÑAL', 370, 625, { size: 38, color: '#ff5e7e' }); }
  drawRinon(780, 950, 1.15, t, { q: 'RI1', facepalm: t > LN(14).a + 0.3, brow: 0.9 });
  drawRinon(1070, 950, 1.15, t, { q: 'RI2', flip: true, brow: 0.9 });
}

function sceneBano(t, lt) {
  ctx.drawImage(BG.bano, 0, 0, W, H);
  ctx.fillStyle = 'rgba(20,10,40,0.8)';
  for (const [x, ph] of [[1120, 0], [940, 1.3]]) { const b = Math.sin(t * 12 + ph) * 6; ctx.beginPath(); ctx.arc(x, 470 + b, 60, 0, TAU); ctx.fill(); rr(ctx, x - 70, 530 + b, 140, 330, 50); ctx.fill(); }
  drawPersona(700, 940, 1.0, t, { peeDance: true, brow: 0.9, smile: -0.6, lid: 0.1 });
  const v = Math.min(5, 1 + Math.floor(lt * 1.1));
  label(`Visitas al baño: ${v}`, 420, 200, { size: 64, bg: '#fff6e8', color: INK, stroke: false });
  const p = popIn(t, SC.bano.a + 2.0);
  if (t > SC.bano.a + 2.0) {
    ctx.save(); ctx.translate(420, 420); ctx.scale(p, p);
    ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(60, 0, 0, 50); ctx.quadraticCurveTo(-60, 0, 0, -80); ctx.fillStyle = '#5bc0eb'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
    label('DESHIDRATACIÓN ↑', 420, 560, { size: 50 * p, color: '#ffd23f' });
  }
}

function sceneHigado(t, lt) {
  ctx.drawImage(BG.higado, 0, 0, W, H);
  // reloj en la pared
  ctx.save(); ctx.translate(1750, 200); ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fillStyle = '#f4f4f4'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
  const a = t * 0.8; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 55, Math.sin(a) * 55); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -40); ctx.stroke(); ctx.restore();
  label('1 trago / hora', 1750, 320, { size: 36 });
  // fila de clones de etanol en la banda
  for (let k = 0; k < 4; k++) { const qx = 120 + k * 120 + Math.sin(t * 2 + k) * 3; drawEti(qx, 820, 0.48, t + k * 0.7, { m: 0, noHat: k % 2 === 1, smile: 0.6 }); }
  // máquinas: vibración
  const sh1 = (t > EV.maquina1 && t < LN(19).a) ? Math.sin(t * 60) * 6 : 0;
  const sh2 = (t > EV.maquina2 && t < EV.ding) ? Math.sin(t * 55) * 8 : 0;
  for (const [mx, sh, on] of [[1010, sh1, sh1 !== 0], [1490, sh2, sh2 !== 0]]) {
    ctx.save(); ctx.translate(sh, 0);
    ctx.fillStyle = on ? '#ffd23f' : '#5a5a7a'; ctx.beginPath(); ctx.arc(mx - 80, 490, 14, 0, TAU); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, mx, 620, 120, '255,220,120', 0.35); ctx.restore(); for (let k = 0; k < 4; k++) { const u = fract(t * 1.5 + k * 0.25); ctx.fillStyle = `rgba(230,230,240,${0.6 * (1 - u)})`; ctx.beginPath(); ctx.arc(mx + 60 + Math.sin(u * 6) * 10, 390 - u * 140, 18 + u * 30, 0, TAU); ctx.fill(); } }
    ctx.restore();
  }
  // Eti en la banda → máquina 1
  if (t < EV.maquina1 + 0.4) {
    const u = span(t, LN(18).b + 0.05, EV.maquina1 + 0.4);
    const ex = lerp(780, 1010, u);
    ctx.save(); if (u > 0.5) { ctx.beginPath(); ctx.rect(0, 0, 900, H); ctx.clip(); }
    drawEti(ex, 820, 0.9, t, { armL: speaking('ETA', t) ? 'point' : 'down', armR: 'hip', smile: t > LN(18).a ? -0.3 : 0.8, brow: t > LN(18).a ? 0.8 : 0.1, lx: -0.6 });
    ctx.restore();
  }
  // Acetaldehído sale de la máquina 1, luego entra a la máquina 2
  if (t > LN(19).a - 0.2 && t < EV.maquina2 + 0.4) {
    const pop = popIn(t, LN(19).a - 0.2, 0.4);
    const u = span(t, LN(20).b + 0.05, EV.maquina2 + 0.4);
    const ax = lerp(1240, 1490, u);
    ctx.save(); if (u > 0.6) { ctx.beginPath(); ctx.rect(0, 0, 1380, H); ctx.clip(); }
    drawAce(ax, 680, 1.0 * pop, t, { lx: -0.5 }); ctx.restore();
    if (t < LN(20).a) label('ACETALDEHÍDO', 1240, 520, { size: 46 * pop, color: '#d8ff6a' });
    if (t > LN(20).a + 1.5 && t < LN(20).b + 0.2) label('Causa parte de la resaca', 1240, 520, { size: 40, bg: '#fff6e8', color: INK, stroke: false });
  }
  // cara de ACE asomada en la ventanilla de la máquina 2
  if (t > EV.maquina2 + 0.4 && t < EV.ding) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(1400 + sh2, 560, 180, 120, 60); ctx.clip(); drawAce(1490 + sh2, 640, 0.75, t, {}); ctx.restore();
  }
  // Acetato + CO2 y agua
  if (t > EV.ding - 0.05) {
    const p = popIn(t, EV.ding - 0.05, 0.4);
    drawAcetato(1720, 820, 1.0 * p, t);
    label('ACETATO', 1720, 640, { size: 46 * p, color: '#bfe9ff' });
    if (t > LN(22).a + 3.2) {
      const q = popIn(t, LN(22).a + 3.2);
      label('→ CO₂ + H₂O', 1720, 560, { size: 52 * q, bg: '#fff6e8', color: INK, stroke: false });
    }
  }
  // barra de trabajo del hígado
  const work = lerp(0.85, 1.0, span(t, SC.higado.a, LN(19).a));
  bar(90, 330, 520, 54, work, work > 0.95 ? '#ff5e4e' : '#ffb03a', 'TRABAJO DEL HÍGADO');
  drawHigado(470, 940, 1.15, t, { point: t > LN(20).a + 2.6 && t < LN(20).b + 0.4 ? 1 : 0, sweat: true, heat: span(t, SC.higado.a, LN(19).a) * 0.6, smile: t > LN(22).a ? 0.6 : -0.1, lid: t > LN(22).a ? 0.25 : 0.4 });
}

function sceneManana(t, lt) {
  if (t < 122.3) {
    ctx.drawImage(BG.cuarto, 0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,180,0.15)';
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(1250 + k * 110, 140); ctx.lineTo(1330 + k * 110, 140); ctx.lineTo(900 + k * 150, 1080); ctx.lineTo(760 + k * 150, 1080); ctx.fill(); }
    ctx.restore();
    // persona en la cama, almohada sobre la cabeza
    ctx.save(); ctx.fillStyle = '#f0c09a'; ctx.beginPath(); ctx.arc(380, 690, 70, 0, TAU); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = '#3b2418'; ctx.beginPath(); ctx.arc(380, 660, 72, Math.PI, TAU); ctx.fill();
    eyes(380, 700, 46, 13, 12, { lid: 0.85, lidCol: '#f0c09a', brow: 1 }); mouth(380, 735, 26, 0, { smile: -0.8 });
    ctx.fillStyle = '#5b8def'; rr(ctx, 450, 640, 760, 240, 60); ctx.fill(); ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = '#fafafa'; rr(ctx, 260 + Math.sin(t * 2) * 4, 560, 260, 90, 40); ctx.fill(); ctx.stroke();
    ctx.restore();
    label('A LA MAÑANA SIGUIENTE…', 960, 220, { size: 80 * popIn(t, LN(23).a), color: '#ffd23f' });
    // pajaritos
    for (let k = 0; k < 2; k++) { const bx = 1300 + k * 160 + Math.sin(t * 2 + k) * 20, by = 260 + k * 40; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx - 20, by); ctx.quadraticCurveTo(bx - 10, by - 14 * Math.sin(t * 12 + k), bx, by); ctx.quadraticCurveTo(bx + 10, by - 14 * Math.sin(t * 12 + k), bx + 20, by); ctx.stroke(); }
    return;
  }
  ctx.drawImage(BG.descanso, 0, 0, W, H);
  drawCerebro(420, 960, 0.95, t, { ice: true, lid: 0.6, brow: 1, smile: -0.5 });
  drawEstomago(800, 960, 0.85, t, { hot: 0.8 + 0.2 * Math.sin(t * 5), lid: 0.6, brow: 0.6 });
  if (t > LN(25).a) for (let k = 0; k < 3; k++) { const u = fract(t * 0.8 + k * 0.33); ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - u)})`; ctx.beginPath(); ctx.arc(780 + k * 30, 580 - u * 120, 20 + u * 20, 0, TAU); ctx.fill(); }
  drawRinon(1110, 960, 0.8, t, { q: 'RI1', dry: true, lid: 0.5, brow: 1 });
  drawRinon(1260, 960, 0.8, t, { q: 'RI2', dry: true, lid: 0.5, brow: 1, glass: true, flip: true });
  drawHigado(1600, 960, 0.9, t, { lid: 0.5, sweat: true, smile: t > LN(27).a ? 0.4 : -0.3 });
  // consejos
  if (t > LN(27).a + 2.0) {
    const tips = [['💧 Agua entre trago y trago', LN(27).a + 2.0], ['🍞 Come algo antes', LN(27).a + 3.4], ['⏳ Dale tiempo a tu hígado', LN(27).a + 4.6]];
    tips.forEach(([txt, at], k) => { if (t > at) label(txt, 960, 140 + k * 100, { size: 52 * popIn(t, at), bg: '#fff6e8', color: INK, stroke: false }); });
  }
}

function sceneFinal(t, lt) {
  ctx.drawImage(BG.final, 0, 0, W, H);
  // confeti
  const r = rnd(8); const cols = ['#ffd23f', '#5bc0eb', '#ff5e7e', '#7ae582', '#ffffff'];
  for (let k = 0; k < 90; k++) { const x = r() * W, sp = 0.3 + r() * 0.5, y = fract(r() + lt * sp * 0.25) * (H + 100) - 50; ctx.save(); ctx.translate(x + Math.sin(lt * 2 + k) * 20, y); ctx.rotate(lt * 3 + k); ctx.fillStyle = cols[k % 5]; ctx.fillRect(-8, -4, 16, 8); ctx.restore(); }
  if (t < EV.tarjeta) {
    const hatOff = span(t, LN(28).a + 2.4, LN(28).a + 3.0);
    drawEti(960, 950, 1.35, t, { armL: 'up', armR: hatOff > 0.5 ? 'hip' : 'up', hatOff, hop: t < LN(28).a + 2.2 ? 0.6 : 0, smile: hatOff > 0.5 ? 0.2 : 0.9, brow: hatOff > 0.5 ? 0.7 : 0.1 });
    return;
  }
  // tarjeta final
  const p = popIn(t, EV.tarjeta, 0.45);
  ctx.save(); ctx.translate(960, 420); ctx.scale(p, p);
  ctx.fillStyle = '#e8263a'; rr(ctx, -360, -90, 720, 180, 90); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  ctx.font = '700 96px Fredoka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('SUSCRÍBETE', 0, 6);
  // campanita
  ctx.save(); ctx.translate(430, 0); ctx.rotate(Math.sin(t * 12) * 0.25);
  ctx.beginPath(); ctx.moveTo(-40, 30); ctx.quadraticCurveTo(-40, -60, 0, -60); ctx.quadraticCurveTo(40, -60, 40, 30); ctx.closePath(); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 7; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 38, 12, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.restore();
  drawEti(960, 980, 0.9, t, { armL: 'up', armR: 'up', m: 0, smile: 1, hop: 0.4 });
  label('Video educativo. Si eres mayor de edad y decides beber, hazlo con moderación.', 960, 1045, { size: 30 });
}

const SCENE_FN = { intro: sceneIntro, estomago: sceneEstomago, cerebro: sceneCerebro, rinones: sceneRinones, bano: sceneBano, higado: sceneHigado, manana: sceneManana, final: sceneFinal };

// ======================= RENDER =======================
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let sc = TL.escenas.find(s => t >= s.a && t < s.b) || TL.escenas[TL.escenas.length - 1];
  const lt = t - sc.a;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const [cx, cy, z] = camera(t, sc);
  // la cámara no muestra fuera del mundo
  const hz = W / (2 * z), vz = H / (2 * z);
  const X = clamp(cx, hz, W - hz), Y = clamp(cy, vz, H - vz);
  ctx.setTransform(z, 0, 0, z, W / 2 - X * z, H / 2 - Y * z);
  SCENE_FN[sc.k](t, lt);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // transición: destello rápido al cambiar de escena
  const tr = Math.min(span(t, sc.a, sc.a + 0.18) < 1 ? 1 - span(t, sc.a, sc.a + 0.18) : 0, 1);
  if (sc.a > 0 && tr > 0) { ctx.fillStyle = `rgba(255,255,255,${tr * 0.8})`; ctx.fillRect(0, 0, W, H); }
  if (sc.k === 'intro' && t > sc.b - 0.5) { ctx.fillStyle = `rgba(255,180,170,${span(t, sc.b - 0.5, sc.b)})`; ctx.fillRect(0, 0, W, H); }
  const fade = Math.max(1 - t / 0.4, span(t, TL.dur - 0.6, TL.dur));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
window.ready = Promise.all([document.fonts.load('700 48px Fredoka'), document.fonts.load('600 48px Fredoka')]).then(() => {
  buildBGs();
  return true;
});
