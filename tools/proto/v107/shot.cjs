const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 1100 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => errs.push(m.text().slice(0, 300)));
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(1500);
  for (const f of (process.env.F || '0,3').split(',').map(Number)) { await p.evaluate(f => { const cv = document.createElement('canvas'); sheet(cv, 0, f); document.body.innerHTML = ''; document.body.appendChild(cv); }, f); await p.waitForTimeout(200); await p.screenshot({ path: path.join(__dirname, `../../../tests/browser/out/v107-sheet${f}.png`), fullPage: true }); }
  console.log(errs.slice(0, 5)); await b.close(); })();
