const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2200, height: 760 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, 'houses.html')); await p.waitForTimeout(400); await p.screenshot({ path: path.resolve(__dirname, '../../../tests/browser/out/v58-houses.png') }); console.log(errs.join('\n') || 'ok'); await b.close(); })();
