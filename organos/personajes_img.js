/* Personajes a partir de las imágenes generadas en Figma (diseños originales).
   m: [x, y, ancho] de la boca en coordenadas de la imagen recortada. */
'use strict';
const CH = {
  eti: { src: 'img/eti_c.png', q: 'ETA', m: [336, 622, 84], smile: 0.8, ph: 0 },
  estomago: { src: 'img/estomago_c.png', q: 'EST', m: [418, 452, 74], smile: -0.6, ph: 1 },
  cerebro: { src: 'img/cerebro_c.png', q: 'CER', m: [334, 452, 62], smile: -0.2, ph: 2, eyes: [[224, 312], [414, 312], 44] },
  rinon1: { src: 'img/rinon1_c.png', q: 'RI1', m: [280, 494, 56], smile: 0.2, ph: 3 },
  rinon2: { src: 'img/rinon2_c.png', q: 'RI2', m: [320, 518, 56], smile: 0.2, ph: 4 },
  higado: { src: 'img/higado_c.png', q: 'HIG', m: [414, 552, 80], smile: -0.1, ph: 5 },
  ace: { src: 'img/ace_c.png', q: 'ACE', m: [494, 580, 110], smile: 1, ph: 6, evil: true },
  acetato: { src: 'img/acetato_c.png', ph: 7 },
  persona: { src: 'img/persona_c.png', m: [254, 210, 36], smile: 0.8, ph: 8 },
};
const IMG = {};
const imgsReady = Promise.all(Object.entries(CH).map(([k, c]) => new Promise((res, rej) => { const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = rej; im.src = c.src; })));

function evilMouth(x, y, w, m) {
  const open = Math.max(0.3, m);
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x, y + w * 0.7 * open, x + w / 2, y); ctx.quadraticCurveTo(x, y + w * 0.12, x - w / 2, y); ctx.closePath();
  ctx.fillStyle = '#3a0f2a'; ctx.fill(); ctx.lineWidth = w * 0.08; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#fff';
  for (const k of [-0.32, -0.1, 0.12, 0.34]) { const tx = x + k * w; ctx.beginPath(); ctx.moveTo(tx - w * 0.08, y + w * 0.04); ctx.lineTo(tx + w * 0.08, y + w * 0.04); ctx.lineTo(tx, y + w * 0.22); ctx.closePath(); ctx.fill(); }
}

// Dibuja el personaje con base (pies) en (x, y) y altura h en píxeles del mundo.
function drawChar(name, x, y, h, t, o = {}) {
  const c = CH[name], im = IMG[name]; if (!im) return;
  const s = h / im.height;
  const m = o.m !== undefined ? o.m : (c.q ? talk(c.q, t) : 0);
  const talking = c.q && speaking(c.q, t);
  const br = Math.sin(t * 2.3 + c.ph) * 0.013 + m * 0.018;
  const hop = o.hop ? Math.abs(Math.sin(t * 9 + c.ph)) * h * 0.07 * o.hop : 0;
  const tilt = (o.rot || 0) + (talking ? Math.sin(t * 4.5 + c.ph) * 0.035 : Math.sin(t * 1.2 + c.ph) * 0.012);
  const fx = o.flip ? -1 : 1;
  ctx.save();
  // sombra en el piso
  if (!o.noShadow) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y - 4, h * 0.26 * (1 - hop / h), h * 0.035, 0, 0, TAU); ctx.fill(); }
  ctx.translate(x, y - hop); ctx.rotate(tilt); ctx.scale(s * fx * (1 - br * 0.6), s * (1 + br));
  if (o.filter) ctx.filter = o.filter;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(im, -im.width / 2, -im.height);
  ctx.filter = 'none';
  const ox = -im.width / 2, oy = -im.height;
  if (o.glow) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.restore(); }
  if (c.m && !o.noMouth) {
    const [mx, my, mw] = c.m;
    if (c.evil) evilMouth(ox + mx, oy + my, mw, m);
    else mouth(ox + mx, oy + my, mw, m, { smile: o.smile ?? c.smile });
  }
  if (o.dizzy && c.eyes) {
    const [[ax, ay], [bx, by], r] = c.eyes;
    for (const [ex, ey] of [[ax, ay], [bx, by]]) {
      ctx.beginPath(); ctx.arc(ox + ex, oy + ey, r, 0, TAU); ctx.fillStyle = '#fffdf8'; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath();
      for (let k = 0; k < 70; k++) { const a = k * 0.33 + t * 9, rr2 = k / 70 * r * 0.9; const X = ox + ex + Math.cos(a) * rr2, Y = oy + ey + Math.sin(a) * rr2; k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.stroke();
    }
  }
  if (o.ice) { // bolsa de hielo sobre la cabeza
    ctx.save(); ctx.translate(ox + im.width * 0.52, oy + 40); ctx.rotate(-0.15);
    ctx.fillStyle = '#7ec4e8'; rr(ctx, -130, -60, 260, 100, 45); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = 'rgba(230,248,255,0.9)'; for (const [ix, iy] of [[-80, -30], [-20, -40], [40, -25]]) { rr(ctx, ix, iy, 40, 36, 8); ctx.fill(); }
    ctx.restore();
  }
  if (o.cracks) {
    ctx.strokeStyle = 'rgba(70,20,30,0.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const [a, b, c2, d] of [[0.35, 0.45, 0.45, 0.52], [0.45, 0.52, 0.4, 0.6], [0.6, 0.62, 0.68, 0.7], [0.55, 0.35, 0.62, 0.42]]) { ctx.beginPath(); ctx.moveTo(ox + a * im.width, oy + b * im.height); ctx.lineTo(ox + c2 * im.width, oy + d * im.height); ctx.stroke(); }
  }
  ctx.restore();
  if (o.heat) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - h * 0.5, h * 0.55, '255,80,40', 0.28 * o.heat); ctx.restore(); }
  if (o.sweat) {
    for (let k = 0; k < 2; k++) { const u = fract(t * 0.7 + k * 0.5); ctx.fillStyle = `rgba(150,210,255,${1 - u})`; const sx = x + h * (0.25 + k * 0.08) * fx, sy = y - h * 0.8 + u * h * 0.15; ctx.beginPath(); ctx.moveTo(sx, sy - 16); ctx.quadraticCurveTo(sx + 10, sy, sx, sy + 7); ctx.quadraticCurveTo(sx - 10, sy, sx, sy - 16); ctx.fill(); }
  }
}
// punto de la cara (para la cámara)
function faceOf(name, x, y, h) { const c = CH[name], im = IMG[name]; const s = h / (im ? im.height : 1000); const my = c.m ? c.m[1] : (im ? im.height * 0.4 : 400); return [x, y - ((im ? im.height : 1000) - my) * s - h * 0.08]; }
