const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1540, height: 600 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'mount.html') + '#big'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__T = 1; window.__W = false; }); await p.waitForTimeout(150); await (await p.$('canvas')).screenshot({ path: path.join(__dirname, 'big.png') });
  await p.evaluate(() => { window.__T = 0.1; window.__W = true; }); await p.waitForTimeout(150); await (await p.$('canvas')).screenshot({ path: path.join(__dirname, 'bigw.png') });
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close(); })();
