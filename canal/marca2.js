const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + path.join(__dirname, 'marca2.html'));
  const [l, bn] = await p.evaluate(() => window.dibujar()); if (errs.length) console.log(errs);
  fs.writeFileSync('logo_soy_kurioso.png', Buffer.from(l.split(',')[1], 'base64')); fs.writeFileSync('banner_tmp.png', Buffer.from(bn.split(',')[1], 'base64')); await b.close(); })();
