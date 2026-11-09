/* Escenas v2: fondos e imágenes generados en Figma + efectos animados encima. */
'use strict';
const SC = {};
for (const s of TL.escenas) SC[s.k] = s;
const BGI = {};
const bgReady = Promise.all(['fiesta', 'estomago', 'cerebro', 'rinones', 'pasillo', 'higado', 'cuarto', 'descanso'].map(k => new Promise((res, rej) => { const im = new Image(); im.onload = () => { BGI[k] = im; res(); }; im.onerror = rej; im.src = `img/bg_${k}.png`; })));
function bg(k) { ctx.imageSmoothingQuality = 'high'; ctx.drawImage(BGI[k], 0, 0, W, H); }

// Posiciones: [imagen, x, y(base), alto]
const PL = {
  estomago: { ETA: ['eti', 720, 870, 300], EST: ['estomago', 1320, 900, 450] },
  cerebro: { ETA: ['eti', 760, 900, 300], CER: ['cerebro', 1520, 960, 470] },
  rinones: { RI1: ['rinon1', 800, 960, 400], RI2: ['rinon2', 1120, 960, 400] },
  higado: { HIG: ['higado', 360, 1010, 470], ETA: ['eti', 650, 790, 230], ACE: ['ace', 1300, 760, 230] },
  manana: { CER: ['cerebro', 330, 980, 400], EST: ['estomago', 720, 990, 400], RI1: ['rinon1', 1060, 975, 340], RI2: ['rinon2', 1260, 975, 340], HIG: ['higado', 1620, 1000, 400] },
  final: { ETA: ['eti', 960, 960, 520] },
};
function closeOf(k, q) { const p = PL[k] && PL[k][q]; if (!p) return null; return faceOf(p[0], p[1], p[2], p[3]); }

// ======================= CÁMARA =======================
const WIDE_LINES = new Set([2, 6, 12, 16, 23, 29]);
function camera(t, sc) {
  const lt = t - sc.a;
  if (sc.k === 'intro') { const z = 1 + 0.03 * lt + 3.0 * Math.pow(span(t, LN(1).a + 0.3, sc.b), 2.2); return [lerp(960, 960, 0), lerp(540, 640, span(t, 7, sc.b)), z]; }
  if (sc.k === 'bano' || (sc.k === 'final' && t > EV.tarjeta)) return [960, 540, 1 + 0.02 * lt];
  const l = lineAt(t);
  if (l && l.escena === sc.k && !WIDE_LINES.has(l.id) && !(sc.k === 'manana' && t < 122.3)) {
    const pr = span(t, l.a, l.b + 0.3);
    if (l.id === 21) return [1660, 600, 1.55 + 0.06 * pr];
    if (l.id === 19) return [1300, 620, 1.5 + 0.06 * pr];
    const f = closeOf(sc.k, l.quien);
    if (f) return [f[0], f[1] + 40, 1.6 + 0.07 * pr];
  }
  if (sc.k === 'higado' && t > EV.ding - 0.2 && t < LN(22).a) return [1600, 700, 1.3];
  return [960, 540, 1.0 + 0.03 * fract(lt / 6)];
}

// ======================= ESCENAS =======================
function sceneIntro(t, lt) {
  bg('fiesta');
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 6; k++) { const x = 960 + Math.sin(t * 0.9 + k * 1.3) * 800, y = 650 + Math.cos(t * 1.1 + k) * 250; glow(ctx, x, y, 170, ['255,80,160', '80,200,255', '255,220,80'][k % 3], 0.18); }
  ctx.restore();
  const d = Math.sin(t * 6);
  drawChar('persona', 980, 1040, 760, t, { rot: d * 0.03, hop: 0.25, m: 0, smile: 0.9 });
  const p = popIn(t, 3.2) * (1 - span(t, 7.2, 7.5));
  if (p > 0) {
    ctx.save(); ctx.translate(430, 260); ctx.scale(p, p);
    ctx.fillStyle = '#fff6e8'; rr(ctx, -270, -120, 540, 240, 34); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
    ctx.font = '700 66px Fredoka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK; ctx.fillText('1 trago ≈ 1 hora', 0, -40);
    ctx.beginPath(); ctx.arc(0, 55, 40, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
    const a = t * 3; ctx.beginPath(); ctx.moveTo(0, 55); ctx.lineTo(Math.cos(a) * 28, 55 + Math.sin(a) * 28); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 55); ctx.lineTo(0, 30); ctx.stroke();
    ctx.restore();
  }
  label('Contenido educativo', 1680, 1035, { size: 30, color: 'rgba(255,255,255,0.85)' });
}

function sceneEstomago(t, lt) {
  bg('estomago');
  const acid = 1 + 1.2 * span(t, LN(5).a, LN(5).a + 0.6);
  const r = rnd(2);
  for (let k = 0; k < 26 * acid; k++) { const x = r() * W, u = fract(r() + t * (0.4 + r() * 0.8)); ctx.beginPath(); ctx.arc(x, 1070 - u * 230, 5 + r() * 12, 0, TAU); ctx.fillStyle = `rgba(230,255,140,${0.55 * (1 - u)})`; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(80,110,10,${0.7 * (1 - u)})`; ctx.stroke(); }
  const P = PL.estomago;
  const s0 = EV.tobogan, s1 = s0 + 1.15;
  let ex, ey, rot = 0, hop = 0;
  if (t < s0) ex = null;
  else if (t < s1) { const u = span(t, s0, s1); ex = lerp(260, P.ETA[1], u); ey = lerp(160, P.ETA[2], u * u); rot = u * TAU * 1.5; }
  else if (t < LN(5).b + 0.2) { ex = P.ETA[1]; ey = P.ETA[2]; hop = t < s1 + 0.4 ? 1 : 0; }
  else { const u = span(t, LN(5).b + 0.2, SC.estomago.b - 0.05); ex = lerp(P.ETA[1], 1780, easeOut(u)); ey = lerp(P.ETA[2], 520, u); }
  if (ex !== null) drawChar('eti', ex, ey, P.ETA[3], t, { rot, hop: speaking('ETA', t) ? 0.35 : hop, flip: t > LN(4).a && t < LN(4).b, noShadow: t < s1 });
  drawChar('estomago', P.EST[1], P.EST[2], P.EST[3], t, { flip: true });
  const p1 = popIn(t, LN(4).a + 2.2);
  if (t > LN(4).a + 2.2 && t < LN(5).a) { label('INTESTINO →', 1480, 200, { size: 62 * p1, bg: '#ffd23f', color: INK, stroke: false }); label('~20% se absorbe aquí', 560, 260, { size: 48 * p1, bg: '#fff6e8', color: INK, stroke: false }); }
  if (t > LN(5).a + 0.5 && t < LN(5).b + 0.3) label('¡ÁCIDO!', 960, 760, { size: 84 * popIn(t, LN(5).a + 0.5), color: '#d8ff6a', rot: -0.08 });
  label('SANGRE →', 1720, 260, { size: 42 });
}

function sceneCerebro(t, lt) {
  bg('cerebro');
  const pal = span(t, EV.palanca, EV.palanca + 0.3);
  // las pantallas parpadean más lento cuando entra el alcohol
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const pulse = 0.5 + 0.5 * Math.sin(t * lerp(6, 1.5, pal));
  for (const [x, y] of [[760, 420], [1250, 380], [1720, 420]]) glow(ctx, x, y, 200, '120,180,255', 0.12 * pulse);
  ctx.restore();
  const levers = [['FRENO', 1000, pal], ['EQUILIBRIO', 1180, span(t, LN(11).a, LN(11).a + 0.8) * 0.8], ['REFLEJOS', 1360, span(t, EV.palanca + 0.4, EV.palanca + 1.5) * 0.6]];
  for (const [nm, lx, v] of levers) {
    ctx.fillStyle = '#3a3460'; rr(ctx, lx - 26, 560, 52, 70, 14); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.save(); ctx.translate(lx, 600); ctx.rotate(lerp(-0.5, 0.65, v)); limb(0, 0, 0, -120, 14, '#d8d8e8'); ctx.beginPath(); ctx.arc(0, -128, 24, 0, TAU); ctx.fillStyle = nm === 'FRENO' ? '#ff3b4e' : '#ffd23f'; ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
    label(nm, lx, 665, { size: 26 });
  }
  if (t > EV.palanca) { const a = Math.max(0, Math.sin(t * 9)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 960, 60, 700, '255,40,60', 0.32 * a); ctx.restore(); }
  const P = PL.cerebro;
  let ex = P.ETA[1], walk = 0;
  if (t < SC.cerebro.a + 1.2) { ex = lerp(220, 620, easeOut(span(t, SC.cerebro.a + 0.1, SC.cerebro.a + 1.2))); walk = 1; }
  else if (t < LN(8).a) ex = 620;
  else ex = lerp(620, P.ETA[1], span(t, LN(8).a, LN(8).a + 1.4));
  drawChar('eti', ex, P.ETA[2], P.ETA[3], t, { hop: walk ? 0.5 : (speaking('ETA', t) ? 0.25 : 0), smile: t > LN(10).a ? 0.1 : 0.8, rot: t > LN(10).a && t < LN(10).b ? -0.1 : 0 });
  const diz = t > LN(11).a;
  drawChar('cerebro', P.CER[1], P.CER[2], P.CER[3], t, { dizzy: diz, rot: diz ? Math.sin(t * 3) * 0.08 : (t > LN(9).a && t < LN(9).b ? Math.sin(t * 18) * 0.04 : 0), smile: diz ? -0.3 : -0.4 });
  if (t > EV.palanca && t < LN(11).a) label('¡FRENO ABAJO!', 960, 160, { size: 78 * popIn(t, EV.palanca), color: '#ff5e7e', rot: -0.05 });
  if (diz) label('EQUILIBRIO: 35%', 960, 160, { size: 66 * popIn(t, LN(11).a), color: '#ffd23f' });
}

function sceneRinones(t, lt) {
  bg('rinones');
  // nivel del agua en el tanque
  const lvl = lerp(0.85, 0.35, span(t, LN(13).a + 0.6, LN(14).b));
  const y0 = 190, y1 = 700, top = y0 + (y1 - y0) * (1 - lvl);
  ctx.save(); rr(ctx, 1530, y0, 220, y1 - y0, 20); ctx.clip();
  ctx.fillStyle = 'rgba(20,30,60,0.55)'; ctx.fillRect(1530, y0, 220, top - y0);
  const gr = ctx.createLinearGradient(0, top, 0, y1); gr.addColorStop(0, 'rgba(120,215,255,0.85)'); gr.addColorStop(1, 'rgba(40,130,210,0.9)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(1520, y1 + 10); for (let x = 1520; x <= 1760; x += 10) ctx.lineTo(x, top + Math.sin(x * 0.05 + t * 4) * 6); ctx.lineTo(1760, y1 + 10); ctx.closePath(); ctx.fill();
  ctx.restore();
  label(`${Math.round(lvl * 100)}%`, 1640, Math.min(top + 50, 660), { size: 58 });
  label('AGUA DEL CUERPO', 1640, 70, { size: 38, bg: '#fff6e8', color: INK, stroke: false });
  if (t > LN(13).a + 0.6) { ctx.save(); ctx.strokeStyle = 'rgba(120,200,255,0.9)'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.setLineDash([40, 18]); ctx.lineDashOffset = -t * 300; ctx.beginPath(); ctx.moveTo(1780, 760); ctx.quadraticCurveTo(1900, 800, 1910, 1080); ctx.stroke(); ctx.restore(); label('→ VEJIGA', 1740, 900, { size: 44, color: '#bfe9ff' }); }
  // señal de la radio
  const sig = 1 - span(t, LN(12).a + 1.0, LN(12).a + 2.2);
  ctx.fillStyle = 'rgba(15,20,40,0.85)'; rr(ctx, 120, 300, 300, 120, 16); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  for (let k = 0; k < 5; k++) { ctx.fillStyle = k < Math.round(sig * 5) ? '#7ae582' : '#3a3a55'; ctx.fillRect(150 + k * 50, 400 - 18 - k * 14, 34, 18 + k * 14); }
  label('SEÑAL: HORMONA', 270, 270, { size: 30, color: '#8fe3ff' });
  if (sig < 0.05 && fract(t * 2) < 0.6) label('SIN SEÑAL', 270, 350, { size: 44, color: '#ff5e7e' });
  const P = PL.rinones;
  drawChar('rinon1', P.RI1[1], P.RI1[2], P.RI1[3], t, { rot: t > LN(14).a + 0.3 ? -0.12 : 0, smile: t > LN(12).a ? -0.5 : 0.2 });
  drawChar('rinon2', P.RI2[1], P.RI2[2], P.RI2[3], t, { flip: true, smile: -0.4 });
}

function sceneBano(t, lt) {
  bg('pasillo');
  ctx.fillStyle = '#f4f4f4'; rr(ctx, 1260, 250, 200, 80, 14); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.font = '700 50px Fredoka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BAÑO', 1360, 292);
  ctx.fillStyle = 'rgba(25,10,45,0.82)';
  for (const [x, ph] of [[1080, 0], [930, 1.3]]) { const b = Math.sin(t * 12 + ph) * 6; ctx.beginPath(); ctx.arc(x, 500 + b, 60, 0, TAU); ctx.fill(); rr(ctx, x - 70, 560 + b, 140, 400, 50); ctx.fill(); }
  drawChar('persona', 640, 1040, 760, t, { rot: Math.sin(t * 14) * 0.05, hop: 0.2, m: 0, smile: -0.7 });
  const v = Math.min(5, 1 + Math.floor(lt * 1.1));
  label(`Visitas al baño: ${v}`, 420, 160, { size: 64, bg: '#fff6e8', color: INK, stroke: false });
  if (t > SC.bano.a + 2.0) {
    const p = popIn(t, SC.bano.a + 2.0);
    ctx.save(); ctx.translate(300, 380); ctx.scale(p, p);
    ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(60, 0, 0, 50); ctx.quadraticCurveTo(-60, 0, 0, -80); ctx.fillStyle = '#5bc0eb'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
    label('DESHIDRATACIÓN ↑', 300, 500, { size: 52 * p, color: '#ffd23f' });
  }
}

function beltY(x) { return 722 + (x - 80) * 0.098; }
function sceneHigado(t, lt) {
  bg('higado');
  const m1 = t > EV.maquina1 && t < LN(19).a, m2 = t > EV.maquina2 && t < EV.ding;
  for (const [mx, my, on, col] of [[960, 580, m1, '255,190,80'], [1660, 600, m2, '220,120,255']]) {
    if (!on) continue;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, mx, my, 260, col, 0.45 + 0.2 * Math.sin(t * 30)); ctx.restore();
    for (let k = 0; k < 5; k++) { const u = fract(t * 1.4 + k * 0.2); ctx.fillStyle = `rgba(240,240,250,${0.55 * (1 - u)})`; ctx.beginPath(); ctx.arc(mx + 40 + Math.sin(u * 6 + k) * 20, 200 - u * 220, 26 + u * 50, 0, TAU); ctx.fill(); }
  }
  // fila de clones de etanol sobre la banda
  for (let k = 0; k < 4; k++) { const qx = 130 + k * 95; drawChar('eti', qx + Math.sin(t * 2 + k) * 3, beltY(qx), 130, t + k * 0.6, { m: 0, smile: 0.6, noShadow: true }); }
  // Eti en la banda → máquina 1
  if (t < EV.maquina1 + 0.5) {
    const u = span(t, LN(18).b + 0.05, EV.maquina1 + 0.5);
    const ex = lerp(PL.higado.ETA[1], 960, u);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 790, H); ctx.clip();
    drawChar('eti', ex, beltY(ex), PL.higado.ETA[3], t, { smile: t > LN(18).a ? -0.3 : 0.8, noShadow: true });
    ctx.restore();
  }
  // Acetaldehído: sale de la máquina 1 y entra a la máquina 2
  if (t > LN(19).a - 0.2 && t < EV.maquina2 + 0.5) {
    const pop = popIn(t, LN(19).a - 0.2, 0.4);
    const u = span(t, LN(20).b + 0.05, EV.maquina2 + 0.5);
    const ax = lerp(1300, 1660, u);
    ctx.save(); if (u > 0) { ctx.beginPath(); ctx.rect(0, 0, 1390, H); ctx.clip(); }
    drawChar('ace', ax, 790 + Math.sin(t * 5) * 8, 230 * pop, t, { noShadow: true });
    ctx.restore();
    if (t < LN(20).a) label('ACETALDEHÍDO', 1300, 470, { size: 50 * pop, color: '#d8ff6a' });
    if (t > LN(20).a + 1.5 && t < LN(20).b + 0.2) label('Causa parte de la resaca', 1240, 470, { size: 42, bg: '#fff6e8', color: INK, stroke: false });
  }
  // ACE dentro de la ventanilla de la máquina 2
  if (t > EV.maquina2 + 0.5 && t < EV.ding) {
    const sh = Math.sin(t * 50) * 6;
    ctx.save(); ctx.beginPath(); ctx.arc(1660 + sh, 600, 118, 0, TAU); ctx.clip(); drawChar('ace', 1660 + sh, 720, 230, t, { noShadow: true }); ctx.restore();
  }
  if (t > EV.ding - 0.05) {
    const p = popIn(t, EV.ding - 0.05, 0.4);
    drawChar('acetato', 1640, 1040, 220 * p, t, {});
    label('ACETATO', 1640, 780, { size: 50 * p, color: '#bfe9ff' });
    if (t > LN(22).a + 3.2) label('→ CO₂ + H₂O', 1640, 700, { size: 54 * popIn(t, LN(22).a + 3.2), bg: '#fff6e8', color: INK, stroke: false });
  }
  // carteles y barra
  ctx.fillStyle = '#f4f4f4'; rr(ctx, 40, 40, 470, 130, 16); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#c0392b'; ctx.font = '700 40px Fredoka'; ctx.fillText('FILA DE ESPERA', 275, 85); ctx.fillStyle = INK; ctx.font = '700 46px Fredoka'; ctx.fillText('4 TRAGOS', 275, 138);
  const work = lerp(0.85, 1.0, span(t, SC.higado.a, LN(19).a));
  bar(40, 245, 470, 54, work, work > 0.95 ? '#ff5e4e' : '#ffb03a', 'TRABAJO DEL HÍGADO');
  label('1 trago / hora', 760, 90, { size: 40, bg: 'rgba(30,10,10,0.6)' });
  const P = PL.higado;
  drawChar('higado', P.HIG[1], P.HIG[2], P.HIG[3], t, { sweat: true, heat: span(t, SC.higado.a, LN(19).a) * 0.6, smile: t > LN(22).a ? 0.6 : -0.1 });
}

function sceneManana(t, lt) {
  if (t < 122.3) {
    bg('cuarto');
    // cabeza de la persona en la almohada
    const im = IMG.persona, hh = 300;
    ctx.save(); ctx.translate(330, 600); ctx.rotate(-0.4);
    ctx.beginPath(); ctx.rect(-62, -260, 160, 200); ctx.clip();
    drawChar('persona', 0, 520, 760, t, { m: 0, smile: -0.8, noShadow: true });
    ctx.restore();
    // estrellitas de mareo
    for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.1; label('★', 300 + Math.cos(a) * 110, 380 + Math.sin(a) * 30, { size: 40, color: '#ffd23f' }); }
    label('A LA MAÑANA SIGUIENTE…', 1100, 140, { size: 82 * popIn(t, LN(23).a), color: '#ffd23f' });
    return;
  }
  bg('descanso');
  const P = PL.manana;
  drawChar('cerebro', P.CER[1], P.CER[2], P.CER[3], t, { ice: true, smile: -0.6 });
  drawChar('estomago', P.EST[1], P.EST[2], P.EST[3], t, { heat: 0.7 + 0.3 * Math.sin(t * 5), filter: 'saturate(1.35) brightness(1.05)' });
  if (t > LN(25).a) for (let k = 0; k < 3; k++) { const u = fract(t * 0.8 + k * 0.33); ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - u)})`; ctx.beginPath(); ctx.arc(700 + k * 34, 560 - u * 140, 22 + u * 22, 0, TAU); ctx.fill(); }
  drawChar('rinon1', P.RI1[1], P.RI1[2], P.RI1[3], t, { filter: 'saturate(0.55) brightness(0.92)', cracks: true, smile: -0.5, m: 0 });
  drawChar('rinon2', P.RI2[1], P.RI2[2], P.RI2[3], t, { filter: 'saturate(0.55) brightness(0.92)', cracks: true, flip: true, smile: -0.5 });
  drawChar('higado', P.HIG[1], P.HIG[2], P.HIG[3], t, { sweat: true, smile: t > LN(27).a ? 0.4 : -0.3 });
  if (t > LN(27).a + 2.0) {
    const tips = [['💧 Agua entre trago y trago', LN(27).a + 2.0], ['🍞 Come algo antes', LN(27).a + 3.4], ['⏳ Dale tiempo a tu hígado', LN(27).a + 4.6]];
    tips.forEach(([txt, at], k) => { if (t > at) label(txt, 960, 120 + k * 100, { size: 54 * popIn(t, at), bg: '#fff6e8', color: INK, stroke: false }); });
  }
}

function sceneFinal(t, lt) {
  let gr = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100); gr.addColorStop(0, '#ffb05a'); gr.addColorStop(1, '#d4326a'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H * 0.62); ctx.rotate(t * 0.1); for (let k = 0; k < 24; k++) { ctx.rotate(TAU / 24); if (k % 2) { ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1600, -200); ctx.lineTo(1600, 200); ctx.fill(); } } ctx.restore();
  ctx.fillStyle = '#5a1a3a'; ctx.beginPath(); ctx.ellipse(W / 2, 970, 620, 90, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
  const r = rnd(8); const cols = ['#ffd23f', '#5bc0eb', '#ff5e7e', '#7ae582', '#ffffff'];
  for (let k = 0; k < 90; k++) { const x = r() * W, sp = 0.3 + r() * 0.5, y = fract(r() + lt * sp * 0.25) * (H + 100) - 50; ctx.save(); ctx.translate(x + Math.sin(lt * 2 + k) * 20, y); ctx.rotate(lt * 3 + k); ctx.fillStyle = cols[k % 5]; ctx.fillRect(-8, -4, 16, 8); ctx.restore(); }
  if (t < EV.tarjeta) {
    const shy = span(t, LN(28).a + 2.4, LN(28).a + 3.0);
    drawChar('eti', 960, 960, 520, t, { hop: t < LN(28).a + 2.2 ? 0.5 : 0, rot: shy * -0.12, smile: shy > 0.5 ? 0.1 : 0.9 });
    return;
  }
  const p = popIn(t, EV.tarjeta, 0.45);
  ctx.save(); ctx.translate(960, 380); ctx.scale(p, p);
  ctx.fillStyle = '#e8263a'; rr(ctx, -360, -90, 720, 180, 90); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  ctx.font = '700 96px Fredoka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('SUSCRÍBETE', 0, 6);
  ctx.save(); ctx.translate(430, 0); ctx.rotate(Math.sin(t * 12) * 0.25);
  ctx.beginPath(); ctx.moveTo(-40, 30); ctx.quadraticCurveTo(-40, -60, 0, -60); ctx.quadraticCurveTo(40, -60, 40, 30); ctx.closePath(); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 7; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 38, 12, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.restore();
  drawChar('eti', 960, 1000, 380, t, { hop: 0.4, m: 0, smile: 1 });
  label('Video educativo. Si eres mayor de edad y decides beber, hazlo con moderación.', 960, 1048, { size: 30 });
}

const SCENE_FN = { intro: sceneIntro, estomago: sceneEstomago, cerebro: sceneCerebro, rinones: sceneRinones, bano: sceneBano, higado: sceneHigado, manana: sceneManana, final: sceneFinal };

function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  const sc = TL.escenas.find(s => t >= s.a && t < s.b) || TL.escenas[TL.escenas.length - 1];
  const lt = t - sc.a;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let [cx, cy, z] = camera(t, sc);
  // temblor cuando las máquinas trabajan o cae la palanca
  let shx = 0, shy = 0;
  if ((t > EV.maquina1 && t < LN(19).a) || (t > EV.maquina2 && t < EV.ding)) { shx = Math.sin(t * 47) * 3; shy = Math.cos(t * 39) * 3; }
  const hz = W / (2 * z), vz = H / (2 * z);
  const X = clamp(cx, hz, W - hz), Y = clamp(cy, vz, H - vz);
  ctx.setTransform(z, 0, 0, z, W / 2 - X * z + shx, H / 2 - Y * z + shy);
  SCENE_FN[sc.k](t, lt);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tr = 1 - span(t, sc.a, sc.a + 0.18);
  if (sc.a > 0 && tr > 0) { ctx.fillStyle = `rgba(255,255,255,${tr * 0.8})`; ctx.fillRect(0, 0, W, H); }
  if (sc.k === 'intro' && t > sc.b - 0.5) { ctx.fillStyle = `rgba(255,180,170,${span(t, sc.b - 0.5, sc.b)})`; ctx.fillRect(0, 0, W, H); }
  const fade = Math.max(1 - t / 0.4, span(t, TL.dur - 0.6, TL.dur));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
window.ready = Promise.all([document.fonts.load('700 48px Fredoka'), imgsReady, bgReady]).then(() => true);
