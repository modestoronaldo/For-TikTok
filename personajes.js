/* Personajes originales: Gato (tu yo de ahora) y Gatito (tu yo del pasado). */
'use strict';
const FUR = '#f2a552', FUR_SH = '#cf7a35', FUR_LT = '#ffcf94', STRIPE = 'rgba(186,98,38,0.8)';
const WHITE = '#fff6ea', PINK = '#f5a9ac', NOSE = '#e9808c', CINK = '#3b2620';
const COAT = '#f6c534', COAT_SH = '#d89a18';

function eyeCute(x, y, rx, ry, lid, lx, ly, lidCol, opt = {}) {
  const tilt = opt.tilt || 0, side = opt.side || 1, wet = opt.wet || 0;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = '#1b120e'; ctx.fill(); ctx.clip();
  const g = ctx.createRadialGradient(x + lx, y + ly + ry * 0.45, 1, x + lx, y + ly, ry * 0.95);
  g.addColorStop(0, '#d39a48'); g.addColorStop(1, '#4a2c16');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x + lx, y + ly + ry * 0.06, rx * 0.82, ry * 0.82, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0e0907'; ctx.beginPath(); ctx.ellipse(x + lx, y + ly + ry * 0.06, rx * 0.5, ry * 0.55, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(x + lx + rx * 0.3, y + ly - ry * 0.3, rx * 0.38, ry * 0.35, -0.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x + lx - rx * 0.34, y + ly + ry * 0.32, rx * 0.15, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x + lx + rx * 0.02, y + ly - ry * 0.02, rx * 0.07, 0, TAU); ctx.fill();
  if (wet > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${0.7 * wet})`; ctx.lineWidth = ry * 0.14;
    ctx.beginPath(); ctx.ellipse(x, y + ry * 0.02, rx * 0.8, ry * 0.8, 0, 0.18 * Math.PI, 0.82 * Math.PI); ctx.stroke();
    ctx.fillStyle = `rgba(180,215,255,${0.25 * wet})`; ctx.fillRect(x - rx, y + ry * 0.55, 2 * rx, ry * 0.5);
  }
  if (lid > 0.001) {
    const base = y - ry + 2 * ry * lid;
    const lo = base + tilt * ry * 0.55 * (1 - lid), li = base - tilt * ry * 0.22 * (1 - lid);
    const yl = side < 0 ? lo : li, yr = side < 0 ? li : lo, mid = (yl + yr) / 2 + ry * 0.16;
    ctx.fillStyle = lidCol; ctx.beginPath();
    ctx.moveTo(x - rx - 3, y - ry - 3); ctx.lineTo(x + rx + 3, y - ry - 3); ctx.lineTo(x + rx + 3, yr);
    ctx.quadraticCurveTo(x, mid, x - rx - 3, yl); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = CINK; ctx.lineWidth = Math.max(3, rx * 0.16); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - rx - 1, yl); ctx.quadraticCurveTo(x, mid, x + rx + 1, yr); ctx.stroke();
  }
  ctx.restore();
}

function catEar(x, y, ang, size, mirror) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(mirror, 1);
  const w = size * 0.6, h = size;
  ctx.beginPath(); ctx.moveTo(-w, 6); ctx.quadraticCurveTo(-w * 0.6, -h * 0.7, -w * 0.08, -h);
  ctx.quadraticCurveTo(w * 0.3, -h * 0.95, w * 0.6, -h * 0.55); ctx.quadraticCurveTo(w * 0.88, -h * 0.22, w, 6); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.strokeStyle = CINK; ctx.lineWidth = size * 0.1; ctx.stroke(); ctx.fillStyle = FUR; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w * 0.55, -h * 0.05); ctx.quadraticCurveTo(-w * 0.38, -h * 0.6, -w * 0.08, -h * 0.8);
  ctx.quadraticCurveTo(w * 0.32, -h * 0.55, w * 0.55, -h * 0.05); ctx.closePath();
  const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#f7b9b9'); g.addColorStop(1, '#e88f98');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,246,234,0.9)'; ctx.lineWidth = size * 0.035; ctx.lineCap = 'round';
  for (const [a, b, c, d] of [[-w * 0.3, -h * 0.1, -w * 0.12, -h * 0.42], [-w * 0.05, -h * 0.08, w * 0.02, -h * 0.38], [w * 0.22, -h * 0.1, w * 0.12, -h * 0.36]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
  ctx.restore();
}

function fluff(s, rx, ry, cy) {
  const p = new Path2D();
  const pts = [[0.78, 0.22], [1.08, 0.38], [0.97, 0.5], [1.07, 0.61], [0.9, 0.7], [0.96, 0.81], [0.45, 0.8]];
  p.moveTo(s * pts[0][0] * rx, cy + pts[0][1] * ry);
  for (const [px, py] of pts.slice(1)) p.lineTo(s * px * rx, cy + py * ry);
  p.closePath();
  return p;
}

// Cabeza de gato completa (orejas, cara). opts: earL, earR (ángulos), lid, lx, ly, tilt, wet, m (boca), mood (-1 triste .. 1 sonrisa), lw
function catHead(hy, rx, ry, o) {
  const lw = o.lw || 12;
  catEar(-rx * 0.58, hy - ry * 0.68, -o.earL, rx * 0.72, -1);
  catEar(rx * 0.58, hy - ry * 0.68, o.earR, rx * 0.72, 1);
  const E = new Path2D(); E.ellipse(0, hy, rx, ry, 0, 0, TAU);
  const FL = fluff(-1, rx, ry, hy), FR = fluff(1, rx, ry, hy);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = CINK; ctx.lineWidth = lw; ctx.stroke(E); ctx.stroke(FL); ctx.stroke(FR);
  ctx.fillStyle = FUR; ctx.fill(FL); ctx.fill(FR);
  let g = ctx.createRadialGradient(-rx * 0.3, hy - ry * 0.45, 6, 0, hy, rx * 1.15);
  g.addColorStop(0, FUR_LT); g.addColorStop(0.55, FUR); g.addColorStop(1, FUR_SH);
  ctx.fillStyle = g; ctx.fill(E);
  ctx.save(); ctx.clip(E);
  ctx.strokeStyle = STRIPE; ctx.lineWidth = rx * 0.07;
  for (const [x0, y0, x1, y1] of [[-0.15, -0.95, -0.11, -0.66], [0, -1.02, 0, -0.7], [0.15, -0.95, 0.11, -0.66]]) {
    ctx.beginPath(); ctx.moveTo(x0 * rx, hy + y0 * ry); ctx.lineTo(x1 * rx, hy + y1 * ry); ctx.stroke();
  }
  for (const s of [-1, 1]) for (const k of [0, 1]) { ctx.beginPath(); ctx.moveTo(s * rx, hy + ry * (0.0 + k * 0.2)); ctx.lineTo(s * rx * 0.8, hy + ry * (0.04 + k * 0.2)); ctx.stroke(); }
  if (o.rim) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, hy - ry * 1.3, rx * 1.5, o.rim, 0.25); }
  ctx.restore();
  // hocico blanco
  ctx.fillStyle = WHITE;
  ctx.beginPath(); ctx.ellipse(-rx * 0.17, hy + ry * 0.42, rx * 0.24, ry * 0.23, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(rx * 0.17, hy + ry * 0.42, rx * 0.24, ry * 0.23, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, hy + ry * 0.6, rx * 0.18, ry * 0.15, 0, 0, TAU); ctx.fill();
  // mejillas
  for (const s of [-1, 1]) {
    const cx = s * rx * 0.63, cy = hy + ry * 0.3, cr = rx * 0.2;
    const g2 = ctx.createRadialGradient(cx, cy, 1, cx, cy, cr); g2.addColorStop(0, `rgba(240,110,125,${0.55 + 0.1 * (o.blush || 0)})`); g2.addColorStop(1, 'rgba(240,110,125,0)');
    ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(cx, cy, cr, cr * 0.65, 0, 0, TAU); ctx.fill();
  }
  // ojos
  const ex = rx * 0.39, er = rx * 0.19, ery = rx * 0.21;
  const hp = o.happy || 0;
  for (const s of [-1, 1]) {
    const x = s * ex, y = hy + ry * 0.02;
    if (hp >= 0.5) { // ojitos cerrados felices ( ^ ^ )
      ctx.strokeStyle = CINK; ctx.lineWidth = er * 0.24; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - er * 0.95, y + ery * 0.3); ctx.quadraticCurveTo(x, y - ery * 0.8, x + er * 0.95, y + ery * 0.3); ctx.stroke();
    } else {
      eyeCute(x, y, er, ery, o.lid + (1 - o.lid) * hp * 2, o.lx, o.ly, FUR, { side: s, tilt: o.tilt || 0, wet: o.wet || 0 });
    }
  }
  // nariz
  const ny = hy + ry * 0.26, nw = rx * 0.085;
  ctx.fillStyle = NOSE; ctx.beginPath(); ctx.moveTo(-nw, ny); ctx.quadraticCurveTo(0, ny - nw * 0.35, nw, ny);
  ctx.quadraticCurveTo(nw * 0.35, ny + nw * 1.15, 0, ny + nw * 1.15); ctx.quadraticCurveTo(-nw * 0.35, ny + nw * 1.15, -nw, ny); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-nw * 0.3, ny + nw * 0.25, nw * 0.3, nw * 0.18, 0, 0, TAU); ctx.fill();
  // boca
  const my = ny + nw * 1.15, m = o.m || 0, mood = o.mood || 0, u = rx * 0.1;
  if (m > 0.06) {
    ctx.fillStyle = '#5b2630'; ctx.beginPath(); ctx.ellipse(0, my + u * 1.1 + m * u * 0.3, u * (0.75 + 0.45 * m), u * (0.3 + 0.95 * m), 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e57b89'; ctx.beginPath(); ctx.ellipse(0, my + u * 1.1 + m * u * 0.9, u * (0.5 + 0.3 * m), u * (0.18 + 0.35 * m), 0, 0, Math.PI); ctx.fill();
  }
  ctx.strokeStyle = CINK; ctx.lineWidth = Math.max(3, rx * 0.025);
  ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(0, my + u * 0.7); ctx.stroke();
  if (mood >= 0) {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, my + u * 0.7); ctx.quadraticCurveTo(s * u * 0.5, my + u * (1.4 + 0.3 * mood), s * u * 1.35, my + u * (0.85 - 0.2 * mood)); ctx.stroke(); }
  } else {
    const k = -mood;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, my + u * 0.7); ctx.quadraticCurveTo(s * u * 0.6, my + u * (1.2 - 0.6 * k), s * u * 1.2, my + u * (1.0 + 0.5 * k)); ctx.stroke(); }
  }
  // bigotes
  ctx.strokeStyle = 'rgba(255,248,236,0.9)'; ctx.lineWidth = Math.max(2, rx * 0.017);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    ctx.beginPath(); ctx.moveTo(s * rx * 0.36, hy + ry * (0.38 + k * 0.08)); ctx.quadraticCurveTo(s * rx * 0.7, hy + ry * (0.3 + k * 0.12), s * rx * 1.02, hy + ry * (0.2 + k * 0.2)); ctx.stroke();
  }
}

// ---------------- Gato adulto (tu yo de ahora) ----------------
const EAR_TWITCH = [1.7, 8.6, 16.4];
function drawCat(t, lt, scIdx) {
  const f = Math.round(t * TL.fps), bo = TL.boca;
  const m = clamp(((bo[f - 1] || 0) + 2 * (bo[f] || 0) + (bo[f + 1] || 0)) / 4, 0, 1);
  const br = Math.sin(TAU * t / 3.3);
  ctx.save();
  ctx.translate(540, 1104); ctx.scale(1 - 0.005 * br, 1 + 0.012 * br);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // cola enroscada
  const sw = Math.sin(t * 1.3);
  const tx = 188 + 16 * sw, ty = -178 + 6 * Math.cos(t * 1.3);
  const tail = new Path2D(); tail.moveTo(90, -28); tail.bezierCurveTo(205, -12, 232, -110, tx, ty);
  ctx.strokeStyle = CINK; ctx.lineWidth = 48; ctx.stroke(tail);
  ctx.strokeStyle = FUR; ctx.lineWidth = 36; ctx.stroke(tail);
  ctx.save(); ctx.lineCap = 'butt'; ctx.strokeStyle = STRIPE; ctx.lineWidth = 36; ctx.setLineDash([11, 30]); ctx.lineDashOffset = -20; ctx.stroke(tail); ctx.restore();
  ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(tx, ty, 17, 0, TAU); ctx.fill();
  // cuerpo
  const body = new Path2D(); body.moveTo(-118, 0); body.bezierCurveTo(-152, -70, -140, -160, -84, -210);
  body.quadraticCurveTo(0, -240, 84, -210); body.bezierCurveTo(140, -160, 152, -70, 118, 0); body.closePath();
  ctx.strokeStyle = CINK; ctx.lineWidth = 12; ctx.stroke(body);
  let g = ctx.createLinearGradient(-140, -230, 140, 0); g.addColorStop(0, FUR_LT); g.addColorStop(0.5, FUR); g.addColorStop(1, FUR_SH);
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.clip(body);
  ctx.strokeStyle = STRIPE; ctx.lineWidth = 12;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(s * 156, -158 + i * 46); ctx.quadraticCurveTo(s * 120, -146 + i * 46, s * 104, -124 + i * 46); ctx.stroke(); }
  ctx.fillStyle = WHITE; ctx.beginPath(); ctx.ellipse(0, -112, 70, 112, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(200,170,140,0.25)'; ctx.beginPath(); ctx.ellipse(18, -60, 50, 70, 0, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -270, 220, '255,190,110', 0.2);
  ctx.restore();
  // patitas traseras y delantera
  const paw = (x, y, rx, ry) => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.strokeStyle = CINK; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = WHITE; ctx.fill();
    ctx.strokeStyle = 'rgba(59,38,32,0.6)'; ctx.lineWidth = 3;
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + k * rx * 0.3, y + ry * 0.1); ctx.lineTo(x + k * rx * 0.3, y + ry * 0.75); ctx.stroke(); }
  };
  paw(-64, -8, 44, 22); paw(64, -8, 44, 22); paw(38, -40, 30, 24);
  // bufanda
  const scarf = new Path2D(); scarf.moveTo(-108, -202); scarf.quadraticCurveTo(0, -150, 108, -202);
  ctx.strokeStyle = CINK; ctx.lineWidth = 52; ctx.stroke(scarf);
  ctx.strokeStyle = '#3f918b'; ctx.lineWidth = 40; ctx.stroke(scarf);
  ctx.save(); ctx.lineCap = 'butt'; ctx.strokeStyle = '#2d706b'; ctx.setLineDash([9, 17]); ctx.stroke(scarf); ctx.restore();
  const ss = 3 * Math.sin(t * 1.4);
  ctx.beginPath(); ctx.moveTo(46, -192); ctx.lineTo(94, -198); ctx.lineTo(104 + ss, -96); ctx.lineTo(60 + ss, -92); ctx.closePath();
  ctx.fillStyle = '#3a8a84'; ctx.fill(); ctx.strokeStyle = CINK; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = '#2d706b'; ctx.lineWidth = 6; for (const y of [-168, -140, -114]) { ctx.beginPath(); ctx.moveTo(52 + ss * 0.5, y); ctx.lineTo(98 + ss * 0.5, y - 3); ctx.stroke(); }
  ctx.strokeStyle = '#3f918b'; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { const x = lerp(64, 102, i / 4) + ss; ctx.beginPath(); ctx.moveTo(x, -94); ctx.lineTo(x + 1, -74); ctx.stroke(); }
  // cabeza
  let tw = 0; for (const e of EAR_TWITCH) { const d = (t - e) / 0.3; if (d >= 0 && d <= 1) tw = Math.sin(Math.PI * d); }
  const happy = scIdx === 5 ? ease((t - 17.45) / 0.35) : 0;
  const lid = 0.06 + 0.94 * blinkVal(t, NUBE_BLINKS, 0.17);
  const toPhone = scIdx === 0 ? 1 - ease((lt - 0.9) / 0.5) : 0;
  ctx.save(); ctx.translate(0, -300); ctx.rotate(0.025 * Math.sin(t * 0.8) - 0.03); ctx.translate(0, 300);
  catHead(-308, 148, 118, {
    earL: 0.3, earR: 0.3 + 0.25 * tw, lid, lx: lerp(2 * Math.sin(t * 0.8), -6, toPhone), ly: lerp(1.5 * Math.sin(t * 0.6), 4, toPhone),
    m, mood: scIdx === 5 ? 1 : 0.4, rim: '255,195,120', blush: 1, happy, tilt: 0.3,
  });
  ctx.restore();
  // brazo levantado con el teléfono
  ctx.save(); ctx.translate(-166, -318); ctx.rotate(-0.22);
  ctx.fillStyle = '#151924'; rr(ctx, -22, -44, 44, 88, 10); ctx.fill();
  ctx.fillStyle = '#a3d4ff'; rr(ctx, -17, -38, 34, 76, 6); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 90, '140,200,255', 0.3);
  ctx.restore();
  const arm = new Path2D(); arm.moveTo(-96, -178); arm.quadraticCurveTo(-150, -196, -152, -262);
  ctx.strokeStyle = CINK; ctx.lineWidth = 50; ctx.stroke(arm);
  ctx.strokeStyle = FUR; ctx.lineWidth = 38; ctx.stroke(arm);
  ctx.beginPath(); ctx.arc(-152, -266, 27, 0, TAU); ctx.strokeStyle = CINK; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = WHITE; ctx.fill();
  ctx.strokeStyle = 'rgba(59,38,32,0.55)'; ctx.lineWidth = 3; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-152 + k * 9, -288); ctx.lineTo(-152 + k * 9, -270); ctx.stroke(); }
  ctx.restore();
}

// ---------------- Gatito (tu yo del pasado) ----------------
function drawKitten(t, lt, scIdx, shake) {
  const hope = scIdx === 4 ? ease((t - 13.45) / 0.9) : 0;
  const br = Math.sin(TAU * t / 2.9);
  ctx.save(); ctx.translate(540, 1012);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // mochila a su lado
  ctx.save(); ctx.translate(126, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 2, 46, 8, 0, 0, TAU); ctx.fill();
  const bag = new Path2D(); bag.roundRect(-38, -84, 76, 86, [26, 26, 10, 10]);
  ctx.strokeStyle = CINK; ctx.lineWidth = 7; ctx.stroke(bag); ctx.fillStyle = '#4f74ad'; ctx.fill(bag);
  ctx.fillStyle = '#3f5f92'; rr(ctx, -38, -84, 76, 34, [26, 26, 6, 6]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5d84c0'; rr(ctx, -24, -38, 48, 30, 8); ctx.fill(); ctx.strokeStyle = 'rgba(30,40,70,0.6)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.arc(0, -52, 5, 0, TAU); ctx.fill();
  ctx.strokeStyle = CINK; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -86, 12, Math.PI, 0); ctx.stroke();
  ctx.restore();
  // piecitos colgando
  for (const s of [-1, 1]) {
    const sw = Math.sin(t * 2.1 + (s > 0 ? Math.PI : 0)) * (4 + 6 * hope);
    const leg = new Path2D(); leg.moveTo(s * 26, 4); leg.lineTo(s * 28 + sw, 44);
    ctx.strokeStyle = CINK; ctx.lineWidth = 34; ctx.stroke(leg); ctx.strokeStyle = FUR; ctx.lineWidth = 24; ctx.stroke(leg);
    ctx.beginPath(); ctx.ellipse(s * 28 + sw, 50, 18, 12, 0, 0, TAU); ctx.strokeStyle = CINK; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = WHITE; ctx.fill();
  }
  ctx.scale(1, 1 + 0.012 * br);
  // impermeable grande
  const hem = shake * 4 * Math.sin(t * 28);
  const coat = new Path2D(); coat.moveTo(-84, 16); coat.bezierCurveTo(-96, -40, -72, -94, -40, -110);
  coat.quadraticCurveTo(0, -124, 40, -110); coat.bezierCurveTo(72, -94, 96, -40, 84 + hem, 16); coat.quadraticCurveTo(0, 30, -84, 16); coat.closePath();
  ctx.strokeStyle = CINK; ctx.lineWidth = 10; ctx.stroke(coat);
  let g = ctx.createLinearGradient(-90, -120, 90, 20); g.addColorStop(0, '#ffe07a'); g.addColorStop(0.5, COAT); g.addColorStop(1, COAT_SH);
  ctx.fillStyle = g; ctx.fill(coat);
  ctx.save(); ctx.clip(coat);
  ctx.strokeStyle = 'rgba(150,95,10,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(4, -112); ctx.lineTo(4, 26); ctx.stroke();
  ctx.fillStyle = '#b77f12'; for (const y of [-74, -42, -10]) { ctx.beginPath(); ctx.arc(14, y, 5, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(150,95,10,0.5)'; rr(ctx, -64, -34, 34, 22, 5); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, -10, -140, 160, '255,225,160', 0.22);
  ctx.restore();
  // manga derecha descansando
  const sl = new Path2D(); sl.moveTo(44, -92); sl.quadraticCurveTo(74, -44, 30, -22);
  ctx.strokeStyle = CINK; ctx.lineWidth = 40; ctx.stroke(sl); ctx.strokeStyle = COAT; ctx.lineWidth = 30; ctx.stroke(sl);
  ctx.beginPath(); ctx.arc(24, -20, 11, 0, TAU); ctx.strokeStyle = CINK; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = WHITE; ctx.fill();
  // cuello del impermeable
  ctx.beginPath(); ctx.ellipse(0, -110, 60, 17, 0, 0, TAU); ctx.fillStyle = '#efb92a'; ctx.fill(); ctx.strokeStyle = CINK; ctx.lineWidth = 7; ctx.stroke();
  // cabeza
  const droop = lerp(0.98, 0.2, hope) + shake * 0.1 * Math.sin(t * 33);
  const lidDef = lerp(0.3, 0.12, hope);
  const lid = lidDef + (1 - lidDef) * blinkVal(t, CACT_BLINKS, 0.3);
  const hy = -194;
  ctx.save(); ctx.translate(0, -120); ctx.rotate(0.03 * Math.sin(t * 0.7) + lerp(0.05, 0, hope)); ctx.translate(0, 120);
  catHead(hy, 104, 88, {
    earL: droop, earR: droop + 0.04 * Math.sin(t * 1.9), lid, lx: lerp(-2, 0, hope), ly: lerp(6, -1, hope),
    tilt: lerp(0.9, 0.15, hope), wet: 1 - 0.55 * hope, m: 0, mood: lerp(-1, 0.7, hope), lw: 10, rim: '255,225,170', blush: 1,
  });
  // lágrima
  if (scIdx === 1) {
    const u = (t - 4.6) / 1.9;
    if (u > 0 && u < 1) {
      const x = 40 + 4, y0 = hy + 24, y = y0 + 64 * ease(u), a = u < 0.8 ? 1 : (1 - u) / 0.2;
      ctx.strokeStyle = `rgba(200,230,255,${0.35 * a})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 1, y - 8); ctx.stroke();
      ctx.fillStyle = `rgba(195,228,255,${0.95 * a})`; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.quadraticCurveTo(x + 9, y + 2, x, y + 8); ctx.quadraticCurveTo(x - 9, y + 2, x, y - 12); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(x - 2, y + 1, 2.2, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  // manga izquierda levantada con el teléfono en la oreja
  ctx.save(); ctx.translate(-118, hy + 2); ctx.rotate(-0.26);
  ctx.fillStyle = '#131722'; rr(ctx, -16, -32, 32, 64, 7); ctx.fill();
  ctx.fillStyle = 'rgba(160,215,255,0.9)'; rr(ctx, -12, -27, 24, 54, 4); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 70, '140,205,255', 0.3);
  ctx.restore();
  const slL = new Path2D(); slL.moveTo(-46, -96); slL.quadraticCurveTo(-104, -98, -110, hy + 36);
  ctx.strokeStyle = CINK; ctx.lineWidth = 42; ctx.stroke(slL); ctx.strokeStyle = COAT; ctx.lineWidth = 32; ctx.stroke(slL);
  ctx.beginPath(); ctx.arc(-110, hy + 34, 13, 0, TAU); ctx.strokeStyle = CINK; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = WHITE; ctx.fill();
  ctx.restore();
}

// ---------------- Lluvia (escena del andén) ----------------
function rain(t, seed, n, y0, y1, len, speed, wid, aTop, aBot) {
  const r = rnd(seed);
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(195,210,255,${aTop})`); g.addColorStop(1, `rgba(195,210,255,${aBot})`);
  ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = wid; ctx.lineCap = 'round'; ctx.beginPath();
  const span = y1 - y0 + len;
  for (let i = 0; i < n; i++) {
    const sx = r(), sy = r(), sp = 0.8 + 0.4 * r();
    const y = y0 - len + fract(sy + t * speed * sp / span) * span;
    const x = -120 + sx * (W + 240) - (y - y0) * 0.1;
    ctx.moveTo(x, y); ctx.lineTo(x - len * 0.1, y + len);
  }
  ctx.stroke(); ctx.restore();
}
function splashes(t, seed, n) {
  const r = rnd(seed);
  ctx.save(); ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const x = r() * W, yy = [1338, 1448, 1300 + r() * 260][i % 3], ph = fract(r() + t * (1.4 + r()));
    ctx.strokeStyle = `rgba(200,215,255,${0.4 * (1 - ph)})`;
    ctx.beginPath(); ctx.ellipse(x, yy, 3 + ph * 14, 1 + ph * 3, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
