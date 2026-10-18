const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 1000 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'yard.html')); await p.waitForTimeout(500); await p.evaluate(() => window.__T = 3); await p.waitForTimeout(150);
  await (await p.$('canvas')).screenshot({ path: path.join(__dirname, 'yard.png') }); console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close(); })();
