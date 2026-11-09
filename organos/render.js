// Renderiza la animación cuadro por cuadro con Chromium (Playwright).
// Uso: node render.js            -> todos los cuadros en frames/
//      node render.js 0.5 4.5    -> solo esos instantes (vista previa) en preview/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FPS = 24;
const DUR = JSON.parse(fs.readFileSync(path.join(__dirname,'timeline.js'),'utf8').slice(12,-2)).dur;
const preview = process.argv.slice(2).map(Number);
const outDir = path.join(__dirname, preview.length ? 'preview' : 'frames');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const url = 'file://' + path.join(__dirname, 'index.html');
  const jobs = preview.length ? preview.map((t, i) => ({ t, name: `p_${t.toFixed(2)}.png` }))
    : Array.from({ length: Math.round(DUR * FPS) }, (_, f) => ({ t: f / FPS, name: `${String(f).padStart(4, '0')}.png` }));
  const WORKERS = preview.length ? 1 : 4;
  let next = 0, done = 0;
  const t0 = Date.now();
  async function worker() {
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(url);
    await page.evaluate(() => window.ready);
    if (errs.length) { console.error('Errores en la página:', errs); process.exit(1); }
    while (next < jobs.length) {
      const j = jobs[next++];
      if (!preview.length && fs.existsSync(path.join(outDir, j.name)) && fs.statSync(path.join(outDir, j.name)).size > 1000) { done++; continue; }
      const data = await page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png'); }, j.t);
      fs.writeFileSync(path.join(outDir, j.name), Buffer.from(data.split(',')[1], 'base64'));
      if (++done % 48 === 0) console.log(`${done}/${jobs.length} cuadros (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    if (errs.length) { console.error('Errores en la página:', errs); process.exit(1); }
  }
  await Promise.all(Array.from({ length: WORKERS }, worker));
  await browser.close();
  console.log(`Listo: ${done} cuadros en ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${outDir}`);
})();
