/* Personajes originales. (x, y) = base (pies) del personaje, s = escala. */
'use strict';

// ---------- Eti, la molécula de etanol fiestera ----------
function drawEti(x, y, s, t, o = {}) {
  const m = o.m !== undefined ? o.m : talk('ETA', t);
  const hop = o.hop ? Math.abs(Math.sin(t * 9)) * 18 * o.hop : 0;
  const bob = Math.sin(t * 4) * 3;
  ctx.save(); ctx.translate(x, y - hop); ctx.scale(s * (o.flip ? -1 : 1), s); if (o.rot) ctx.rotate(o.rot);
  // piernas
  const st = o.walk ? Math.sin(t * 14) * 14 : 0;
  limb(-18, -40, -22 + st, 0, 12, '#f2b437'); limb(18, -40, 22 - st, 0, 12, '#f2b437');
  for (const [fx] of [[-24 + st], [24 - st]]) { ctx.beginPath(); ctx.ellipse(fx, 2, 17, 9, 0, 0, TAU); ctx.fillStyle = '#e8453c'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.translate(0, bob);
  // átomos de atrás (como orejitas) con sus enlaces
  const atoms = [[-60, -150, 27], [62, -146, 25]];
  for (const [ax, ay] of atoms) { limb(0, -100, ax, ay, 10, '#d9d6e6'); }
  for (const [ax, ay, ar] of atoms) {
    const g = ctx.createRadialGradient(ax - ar * 0.3, ay - ar * 0.35, 2, ax, ay, ar);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a9a6c4');
    ctx.beginPath(); ctx.arc(ax, ay, ar, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
    for (const k of [-1, 1]) { const hx = ax + k * ar * 0.9, hy = ay - ar * 0.7; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); }
  }
  // brazos
  const armL = o.armL || 'down', armR = o.armR || 'down';
  const armPos = (a, sd) => a === 'up' ? [sd * 78, -170 + Math.sin(t * 10) * 10] : a === 'point' ? [sd * 105, -110] : a === 'reach' ? [sd * 95, -70] : a === 'hip' ? [sd * 70, -60] : [sd * 70, -40];
  for (const [a, sd] of [[armL, -1], [armR, 1]]) { const [hx, hy] = armPos(a, sd); limb(sd * 52, -88, hx, hy, 10, '#f2b437', sd * 72, -90); hand(hx, hy, 11, '#f7c95a'); }
  // cuerpo esfera ámbar
  const g = ctx.createRadialGradient(-22, -128, 8, 0, -95, 72);
  g.addColorStop(0, '#ffe7a0'); g.addColorStop(0.5, '#f6b733'); g.addColorStop(1, '#c47a12');
  ctx.beginPath(); ctx.arc(0, -95, 64, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // burbujitas internas
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  for (let k = 0; k < 5; k++) { const by = -60 - fract(t * 0.6 + k * 0.21) * 70, bx = -30 + k * 14; ctx.beginPath(); ctx.arc(bx, by, 3 + (k % 2) * 2, 0, TAU); ctx.fill(); }
  shine(-28, -132, 18, 9, 0.75);
  // gorrito de fiesta
  if (!o.noHat) {
    ctx.save(); ctx.translate(6, -152); ctx.rotate(0.12 + (o.hatOff || 0) * -0.9); ctx.translate(0, -(o.hatOff || 0) * 40);
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(24, 0); ctx.lineTo(0, -64); ctx.closePath();
    ctx.fillStyle = '#5b8def'; ctx.fill(); ctx.save(); ctx.clip();
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 8; for (let k = -2; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-30, -k * 18); ctx.lineTo(30, -k * 18 - 20); ctx.stroke(); }
    ctx.restore(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -66, 10, 0, TAU); ctx.fillStyle = '#ff5e7e'; ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // cara
  const lid = Math.max(o.lid || 0, blink('eti', t));
  eyes(0, -105, 50, 17, 20, { lx: o.lx ?? 0.2, ly: o.ly ?? 0, lid, lidCol: '#f2b030', brow: o.brow ?? 0.1, spiral: o.spiral, pupil: 0.55 });
  mouth(0, -66, 34, m, { smile: o.smile ?? 0.8 });
  ctx.fillStyle = 'rgba(255,110,110,0.45)'; ctx.beginPath(); ctx.ellipse(-40, -78, 10, 6, 0, 0, TAU); ctx.ellipse(40, -78, 10, 6, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

// ---------- Estómago gruñón ----------
function drawEstomago(x, y, s, t, o = {}) {
  const m = talk('EST', t);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const br = Math.sin(t * 2) * 0.015;
  ctx.scale(1 - br, 1 + br);
  // piernas
  limb(-40, -30, -46, 0, 18, '#e98479'); limb(40, -30, 46, 0, 18, '#e98479');
  for (const fx of [-50, 50]) { ctx.beginPath(); ctx.ellipse(fx, 2, 24, 11, 0, 0, TAU); ctx.fillStyle = '#5c3a2e'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  // cuerpo en forma de J
  const p = new Path2D();
  p.moveTo(-40, -330); p.bezierCurveTo(-10, -350, 40, -330, 40, -290);
  p.bezierCurveTo(40, -250, 130, -260, 135, -170); p.bezierCurveTo(140, -70, 70, -20, 0, -22);
  p.bezierCurveTo(-90, -22, -130, -80, -110, -150); p.bezierCurveTo(-95, -200, -70, -220, -70, -270);
  p.bezierCurveTo(-70, -300, -70, -320, -40, -330); p.closePath();
  const hot = o.hot || 0;
  const g = ctx.createLinearGradient(-130, -330, 130, 0);
  g.addColorStop(0, hot ? '#ff9b8a' : '#f7a99d'); g.addColorStop(0.6, hot ? '#f05a4a' : '#e8806f'); g.addColorStop(1, hot ? '#b82e24' : '#b9564a');
  fillOutline(p, g, 7);
  ctx.save(); ctx.clip(p);
  ctx.strokeStyle = 'rgba(150,50,45,0.35)'; ctx.lineWidth = 7;
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-120 + k * 10, -180 + k * 25); ctx.quadraticCurveTo(0, -150 + k * 28, 130, -200 + k * 26); ctx.stroke(); }
  if (hot) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -120, 160, '255,120,60', 0.35 * hot); }
  ctx.restore();
  shine(-30, -300, 18, 8, 0.5);
  // brazos (cruzados si está molesto)
  if (o.cross) {
    limb(-105, -150, 40, -115, 18, '#e98479', -30, -100); limb(110, -150, -40, -120, 18, '#e98479', 30, -95);
  } else {
    const wv = speaking('EST', t) ? Math.sin(t * 6) * 15 : 0;
    limb(-108, -150, -160, -90 + wv, 18, '#e98479'); hand(-160, -90 + wv, 14, '#f2a093');
    limb(130, -160, 180, -110 - wv, 18, '#e98479'); hand(180, -110 - wv, 14, '#f2a093');
  }
  // cara (en el lóbulo grande)
  const lid = Math.max(o.lid ?? 0.45, blink('est', t));
  eyes(10, -175, 70, 22, 22, { lid, lidCol: '#e98c7e', brow: o.brow ?? -0.8, ly: 0.2, pupil: 0.48 });
  // uniceja tupida
  ctx.strokeStyle = '#3d2418'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-42, -212); ctx.quadraticCurveTo(10, -200 + (o.brow ?? -0.8) * 10, 62, -212); ctx.stroke();
  // bigote
  ctx.fillStyle = '#4a2c1e';
  ctx.beginPath(); ctx.moveTo(10, -140); ctx.bezierCurveTo(-30, -150, -50, -128, -36, -118); ctx.bezierCurveTo(-20, -126, 0, -128, 10, -130);
  ctx.bezierCurveTo(20, -128, 40, -126, 56, -118); ctx.bezierCurveTo(70, -128, 50, -150, 10, -140); ctx.fill();
  mouth(10, -112, 40, m, { smile: o.smile ?? -0.6 });
  ctx.restore();
}

// ---------- Cerebro científico ----------
function drawCerebro(x, y, s, t, o = {}) {
  const m = talk('CER', t);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.rot) ctx.rotate(o.rot);
  // cuerpo con bata
  const coat = new Path2D(); coat.moveTo(-70, 0); coat.lineTo(-58, -150); coat.quadraticCurveTo(0, -175, 58, -150); coat.lineTo(70, 0); coat.closePath();
  fillOutline(coat, '#f4f6fb', 6);
  ctx.strokeStyle = 'rgba(80,90,120,0.4)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -160); ctx.lineTo(0, 0); ctx.stroke();
  ctx.fillStyle = '#8fa3d8'; rr(ctx, 18, -110, 30, 22, 4); ctx.fill(); ctx.fillStyle = '#e8453c'; ctx.fillRect(26, -122, 4, 16); ctx.fillStyle = '#3a6fd8'; ctx.fillRect(34, -120, 4, 14);
  const ges = speaking('CER', t) ? Math.sin(t * 7) * 18 : 0;
  const armUp = o.panic ? Math.sin(t * 16) * 20 - 60 : 0;
  limb(-55, -135, -105, -80 + ges + armUp, 16, '#f4f6fb'); hand(-105, -80 + ges + armUp, 13, '#f3a7b9');
  limb(55, -135, 105, -85 - ges + armUp, 16, '#f4f6fb'); hand(105, -85 - ges + armUp, 13, '#f3a7b9');
  // cerebro (cabeza)
  const r = rnd(4); const blobs = [];
  for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; blobs.push([Math.cos(a) * 95, -260 + Math.sin(a) * 72, 40 + r() * 10]); }
  const head = new Path2D(); head.ellipse(0, -260, 110, 85, 0, 0, TAU);
  for (const [bx, by, br] of blobs) { head.moveTo(bx + br, by); head.arc(bx, by, br, 0, TAU); }
  ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  for (const [bx, by, br] of blobs) { ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -260, 110, 85, 0, 0, TAU); ctx.stroke();
  const g = ctx.createRadialGradient(-40, -310, 10, 0, -260, 150); g.addColorStop(0, '#ffd1dc'); g.addColorStop(0.6, '#f3a1b6'); g.addColorStop(1, '#d26f8c');
  ctx.fillStyle = g; for (const [bx, by, br] of blobs) { ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, -260, 110, 85, 0, 0, TAU); ctx.fill();
  // surcos
  ctx.strokeStyle = 'rgba(160,60,90,0.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -335); ctx.bezierCurveTo(-10, -300, 10, -280, 0, -250); ctx.stroke();
  for (const [a, b, c, d] of [[-90, -300, -50, -320], [-100, -250, -60, -270], [60, -320, 95, -290], [70, -260, 110, -240], [-70, -220, -30, -205], [40, -210, 85, -215]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2, b - 25, c, d); ctx.stroke(); }
  if (o.ice) { // bolsa de hielo
    ctx.fillStyle = '#7ec4e8'; rr(ctx, -70, -360, 130, 50, 20); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = '#d9f1ff'; for (const [ix, iy] of [[-40, -340], [0, -345], [30, -335]]) { ctx.fillRect(ix, iy, 16, 14); }
  }
  shine(-55, -318, 22, 10, 0.55);
  ctx.restore();
  // cara
  const lid = Math.max(o.lid || 0, blink('cer', t));
  const spiral = o.dizzy ? t * 8 : 0;
  eyes(0, -255, 70, 26, 28, { lid, lidCol: '#f3a1b6', brow: o.brow ?? 0.6, spiral: o.dizzy ? spiral : 0, lx: o.lx || 0, pupil: 0.45, browUp: 6 });
  // lentes redondos
  ctx.strokeStyle = '#3a2c52'; ctx.lineWidth = 6;
  for (const sx of [-35, 35]) { ctx.beginPath(); ctx.arc(sx, -255, 36, 0, TAU); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-1, -258); ctx.lineTo(1, -258); ctx.stroke();
  ctx.fillStyle = 'rgba(200,230,255,0.18)'; for (const sx of [-35, 35]) { ctx.beginPath(); ctx.arc(sx, -255, 33, 0, TAU); ctx.fill(); }
  mouth(0, -205, 46, m, { smile: o.smile ?? 0 });
  ctx.restore();
}

// ---------- Riñones gemelas ----------
function drawRinon(x, y, s, t, o = {}) {
  const q = o.q || 'RI1';
  const m = talk(q, t);
  const col = q === 'RI1' ? ['#d3667f', '#a83a55'] : ['#c75a8e', '#93306a'];
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const bob = Math.sin(t * 3 + (q === 'RI1' ? 0 : 1.5)) * 4; ctx.translate(0, bob);
  limb(-25, -30, -30, 0, 14, col[0]); limb(25, -30, 30, 0, 14, col[0]);
  for (const fx of [-34, 34]) { ctx.beginPath(); ctx.ellipse(fx, 2, 18, 9, 0, 0, TAU); ctx.fillStyle = q === 'RI1' ? '#ffd23f' : '#5bc0eb'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  // frijol
  const p = new Path2D();
  p.moveTo(-10, -250); p.bezierCurveTo(70, -265, 115, -190, 105, -130); p.bezierCurveTo(95, -60, 40, -20, -10, -25);
  p.bezierCurveTo(-60, -28, -90, -60, -70, -95); p.bezierCurveTo(-55, -120, -50, -150, -70, -175); p.bezierCurveTo(-95, -215, -60, -245, -10, -250); p.closePath();
  const g = ctx.createLinearGradient(-90, -250, 110, -20); g.addColorStop(0, o.dry ? '#d9a0a8' : col[0]); g.addColorStop(1, o.dry ? '#9b6a70' : col[1]);
  fillOutline(p, g, 6);
  if (o.dry) { ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(80,30,40,0.5)'; ctx.lineWidth = 3; for (const [a, b, c, d] of [[-40, -200, 0, -170], [0, -170, -10, -140], [40, -120, 70, -90], [60, -200, 80, -160]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); } ctx.restore(); }
  shine(-20, -225, 22, 10, 0.5);
  // moño
  const bc = q === 'RI1' ? '#ffd23f' : '#5bc0eb';
  ctx.save(); ctx.translate(30, -252);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(sd * 40, -40, sd * 46, 0); ctx.quadraticCurveTo(sd * 40, 30, 0, 0); ctx.fillStyle = bc; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  // brazos
  const ges = speaking(q, t) ? Math.sin(t * 7 + (q === 'RI1' ? 0 : 2)) * 16 : 0;
  if (o.facepalm) { limb(-60, -110, 10, -175, 13, col[0], -40, -170); hand(10, -175, 13, col[0]); }
  else { limb(-62, -110, -110, -70 + ges, 13, col[0]); hand(-110, -70 + ges, 12, col[0]); }
  if (o.glass) { limb(98, -120, 130, -100, 13, col[0]); ctx.save(); ctx.translate(140, -120); ctx.fillStyle = 'rgba(220,240,255,0.6)'; ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(14, -30); ctx.lineTo(10, 10); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); hand(130, -100, 12, col[0]); }
  else { limb(98, -120, 145, -80 - ges, 13, col[0]); hand(145, -80 - ges, 12, col[0]); }
  // cara con pestañas
  const lid = Math.max(o.lid || 0, blink(q, t));
  eyes(15, -165, 58, 20, 24, { lid, lidCol: col[0], brow: o.brow ?? 0.7, lx: o.lx ?? (q === 'RI1' ? 0.5 : -0.5), pupil: 0.55 });
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const sx of [-14, 44]) for (const k of [-1, 0, 1]) { const ex = sx + k * 12 * (sx < 15 ? -1 : 1); ctx.beginPath(); ctx.moveTo(sx + k * 9, -188); ctx.lineTo(sx + k * 14, -200); ctx.stroke(); }
  mouth(15, -110, 32, m, { smile: o.smile ?? 0 });
  ctx.fillStyle = 'rgba(255,140,170,0.5)'; ctx.beginPath(); ctx.ellipse(-25, -128, 11, 6, 0, 0, TAU); ctx.ellipse(58, -128, 11, 6, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

// ---------- Hígado trabajador ----------
function drawHigado(x, y, s, t, o = {}) {
  const m = talk('HIG', t);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const br = Math.sin(t * 1.8) * 0.012; ctx.scale(1 + br, 1 - br);
  limb(-60, -30, -66, 0, 22, '#7d2a24'); limb(50, -30, 56, 0, 22, '#7d2a24');
  for (const fx of [-72, 60]) { ctx.beginPath(); ctx.ellipse(fx, 2, 30, 13, 0, 0, TAU); ctx.fillStyle = '#4b3b2a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  // forma del hígado (cuña)
  const p = new Path2D();
  p.moveTo(-170, -230); p.bezierCurveTo(-90, -300, 60, -290, 150, -250); p.bezierCurveTo(200, -230, 210, -190, 170, -160);
  p.bezierCurveTo(110, -100, 30, -40, -40, -28); p.bezierCurveTo(-120, -20, -190, -60, -195, -130); p.bezierCurveTo(-198, -180, -190, -210, -170, -230); p.closePath();
  const g = ctx.createLinearGradient(-190, -290, 170, -30); g.addColorStop(0, '#c0473c'); g.addColorStop(0.55, '#93302a'); g.addColorStop(1, '#5e1b18');
  fillOutline(p, g, 7);
  ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(60,10,10,0.35)'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-10, -285); ctx.quadraticCurveTo(10, -170, -40, -30); ctx.stroke();
  if (o.heat) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -150, 200, '255,90,40', 0.3 * o.heat); }
  ctx.restore();
  shine(-110, -238, 30, 12, 0.45);
  // brazos con guantes
  const ges = speaking('HIG', t) ? Math.sin(t * 5) * 14 : 0;
  const pt = o.point || 0;
  limb(-180, -150, -235, -95 + ges, 22, '#93302a'); hand(-235, -95 + ges, 20, '#ffd23f');
  limb(170, -170, lerp(220, 270, pt), lerp(-110, -200, pt) - ges * (1 - pt), 22, '#93302a'); hand(lerp(220, 270, pt), lerp(-110, -200, pt) - ges * (1 - pt), 20, '#ffd23f');
  // casco amarillo
  ctx.save(); ctx.translate(-20, -272); ctx.rotate(-0.08);
  ctx.beginPath(); ctx.moveTo(-95, 0); ctx.bezierCurveTo(-90, -80, 90, -80, 95, 0); ctx.closePath(); ctx.fillStyle = '#ffcc1f'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  rr(ctx, -110, -8, 220, 18, 9); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e6a800'; ctx.fillRect(-12, -62, 24, 56); shine(-50, -45, 20, 8, 0.5);
  ctx.restore();
  // cara cansada
  const lid = Math.max(o.lid ?? 0.35, blink('hig', t));
  eyes(-20, -185, 80, 25, 27, { lid, lidCol: '#a5372f', brow: o.brow ?? 0.2, pupil: 0.45, lx: o.lx ?? 0.3 });
  ctx.strokeStyle = 'rgba(40,10,10,0.6)'; ctx.lineWidth = 4;
  for (const sx of [-60, 20]) { ctx.beginPath(); ctx.arc(sx, -150, 18, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke(); }
  ctx.fillStyle = 'rgba(40,10,10,0.35)'; for (let k = 0; k < 18; k++) { ctx.beginPath(); ctx.arc(-60 + (k % 6) * 16, -112 + Math.floor(k / 6) * 9, 1.8, 0, TAU); ctx.fill(); }
  mouth(-20, -122, 52, m, { smile: o.smile ?? -0.1 });
  if (o.sweat) { for (let k = 0; k < 2; k++) { const u = fract(t * 0.7 + k * 0.5); ctx.fillStyle = `rgba(150,210,255,${1 - u})`; const sx = 70 + k * 40, sy = -240 + u * 70; ctx.beginPath(); ctx.moveTo(sx, sy - 14); ctx.quadraticCurveTo(sx + 9, sy, sx, sy + 6); ctx.quadraticCurveTo(sx - 9, sy, sx, sy - 14); ctx.fill(); } }
  ctx.restore();
}

// ---------- Acetaldehído (villano) ----------
function drawAce(x, y, s, t, o = {}) {
  const m = talk('ACE', t);
  ctx.save(); ctx.translate(x, y + Math.sin(t * 5) * 8); ctx.scale(s, s);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 170, '160,60,220', 0.35); ctx.restore();
  const p = new Path2D(); const N = 14;
  for (let k = 0; k <= N * 2; k++) { const a = k / (N * 2) * TAU + t * 0.6, r = k % 2 ? 62 : 88 + Math.sin(t * 8 + k) * 4; const X = Math.cos(a) * r, Y = Math.sin(a) * r; k ? p.lineTo(X, Y) : p.moveTo(X, Y); }
  p.closePath();
  const g = ctx.createRadialGradient(-20, -25, 5, 0, 0, 90); g.addColorStop(0, '#eaff8a'); g.addColorStop(0.6, '#a8d23a'); g.addColorStop(1, '#5d8a14');
  fillOutline(p, g, 6);
  shine(-22, -30, 16, 8, 0.55);
  eyes(0, -10, 54, 17, 15, { brow: -1, lid: 0.25, lidCol: '#a8d23a', pupil: 0.6, lx: o.lx || 0 });
  // sonrisa malvada con colmillos
  const w = 60, open = Math.max(0.25, m);
  ctx.beginPath(); ctx.moveTo(-w / 2, 20); ctx.quadraticCurveTo(0, 20 + 40 * open, w / 2, 20); ctx.quadraticCurveTo(0, 30, -w / 2, 20); ctx.closePath();
  ctx.fillStyle = '#3a0f2a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#fff'; for (const tx of [-20, -6, 8, 22]) { ctx.beginPath(); ctx.moveTo(tx - 6, 22); ctx.lineTo(tx + 6, 22); ctx.lineTo(tx, 34); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

// ---------- Acetato (tranquilo) ----------
function drawAcetato(x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.5) * 6); ctx.scale(s, s);
  const p = new Path2D(); p.moveTo(-70, 0); p.bezierCurveTo(-80, -90, -30, -120, 0, -120); p.bezierCurveTo(30, -120, 80, -90, 70, 0); p.quadraticCurveTo(0, 14, -70, 0); p.closePath();
  const g = ctx.createRadialGradient(-20, -80, 6, 0, -50, 110); g.addColorStop(0, '#d8f2ff'); g.addColorStop(0.6, '#7cc8f0'); g.addColorStop(1, '#3d8fc4');
  fillOutline(p, g, 6); shine(-25, -92, 16, 8, 0.6);
  eyes(0, -62, 44, 13, 10, { lid: 0.5, lidCol: '#7cc8f0', pupil: 0.5 });
  mouth(0, -32, 26, 0, { smile: 1 });
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let k = 0; k < 4; k++) { const a = t * 2 + k * 1.6; const sx = Math.cos(a) * 95, sy = -60 + Math.sin(a) * 50; ctx.save(); ctx.translate(sx, sy); ctx.rotate(a); ctx.fillRect(-2, -9, 4, 18); ctx.fillRect(-9, -2, 18, 4); ctx.restore(); }
  ctx.restore();
}

// ---------- Persona (escenas de afuera) ----------
function drawPersona(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const skin = '#f0c09a', hoodie = '#2fa59b';
  const dance = o.dance ? Math.sin(t * 7) : 0;
  ctx.translate(0, -Math.abs(dance) * 8);
  // piernas
  const lg = o.peeDance ? Math.sin(t * 14) * 10 : dance * 8;
  limb(-28, -150, -34 - lg, 0, 30, '#2d3a5c'); limb(28, -150, 34 + lg, 0, 30, '#2d3a5c');
  for (const fx of [-38 - lg, 38 + lg]) { ctx.beginPath(); ctx.ellipse(fx, 2, 30, 13, 0, 0, TAU); ctx.fillStyle = '#f4f4f4'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  // cuerpo (sudadera)
  const body = new Path2D(); body.moveTo(-70, -140); body.quadraticCurveTo(-80, -290, 0, -300); body.quadraticCurveTo(80, -290, 70, -140); body.quadraticCurveTo(0, -125, -70, -140); body.closePath();
  fillOutline(body, hoodie, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; rr(ctx, -40, -210, 80, 40, 12); ctx.fill();
  // brazos
  if (o.cheers) {
    const up = Math.sin(t * 3) * 10;
    limb(55, -270, 110, -360 + up, 26, hoodie); hand(110, -362 + up, 17, skin);
    // vaso con bebida ámbar
    ctx.save(); ctx.translate(112, -400 + up); ctx.beginPath(); ctx.moveTo(-26, -50); ctx.lineTo(26, -50); ctx.lineTo(18, 30); ctx.lineTo(-18, 30); ctx.closePath();
    ctx.fillStyle = 'rgba(230,240,255,0.5)'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#f2b23a'; ctx.fillRect(-30, -25, 60, 60); ctx.fillStyle = '#fff6dc'; ctx.fillRect(-30, -32, 60, 10); ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    limb(-55, -270, -90, -160 + dance * 20, 26, hoodie); hand(-90, -160 + dance * 20, 17, skin);
  } else if (o.peeDance) {
    limb(-55, -270, -30, -150, 26, hoodie, -80, -200); hand(-28, -150, 17, skin);
    limb(55, -270, 30, -150, 26, hoodie, 80, -200); hand(28, -150, 17, skin);
  } else {
    limb(-55, -270, -85, -150, 26, hoodie); hand(-85, -150, 17, skin); limb(55, -270, 85, -150, 26, hoodie); hand(85, -150, 17, skin);
  }
  // cabeza
  ctx.beginPath(); ctx.arc(0, -370, 78, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // pelo
  ctx.beginPath(); ctx.moveTo(-80, -370); ctx.bezierCurveTo(-90, -470, 80, -480, 80, -380); ctx.bezierCurveTo(50, -420, 0, -410, -20, -430); ctx.bezierCurveTo(-30, -400, -60, -400, -80, -370); ctx.fillStyle = '#3b2418'; ctx.fill(); ctx.stroke();
  const lid = Math.max(o.lid || 0, blink('per', t));
  eyes(0, -365, 54, 15, 18, { lid, lidCol: skin, brow: o.brow ?? 0.2, pupil: 0.55, lx: o.lx || 0, spiral: o.spiral });
  mouth(0, -322, 34, o.m || 0, { smile: o.smile ?? 0.7 });
  ctx.fillStyle = 'rgba(240,100,100,0.4)'; ctx.beginPath(); ctx.ellipse(-48, -340, 12, 7, 0, 0, TAU); ctx.ellipse(48, -340, 12, 7, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
