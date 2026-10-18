const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 1200 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'mount.html')); await p.waitForTimeout(500);
  for (const [T, n] of [[0.05, 'a'], [0.2, 'b'], [0.36, 'c']]) { await p.evaluate(t => window.__T = t, T); await p.waitForTimeout(120); await (await p.$('canvas')).screenshot({ path: path.join(__dirname, 's' + n + '.png') }); }
  await p.evaluate(() => { document.getElementById('walk').click(); window.__T = 2; }); await p.waitForTimeout(150); await (await p.$('canvas')).screenshot({ path: path.join(__dirname, 'sidle.png') });
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close(); })();
