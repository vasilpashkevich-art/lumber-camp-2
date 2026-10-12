const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 680 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'dirs.html')); await p.waitForTimeout(300);
  for (const [m, f] of [['idle', 0], ['walk', 2], ['walk', 6], ['atk', 2], ['dead', 3]]) { await p.evaluate(([m, f]) => draw(m, f), [m, f]); await p.screenshot({ path: path.join(__dirname, `${m}${f}.png`) }); }
  console.log(errs); await b.close(); })();
