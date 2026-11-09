const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'miniatura.html'));
  const d = await p.evaluate(() => window.dibujar()); if (errs.length) console.log(errs);
  fs.writeFileSync(path.join(__dirname, 'miniatura_1920.png'), Buffer.from(d.split(',')[1], 'base64')); await b.close(); })();
