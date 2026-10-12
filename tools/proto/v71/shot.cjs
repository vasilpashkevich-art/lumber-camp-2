const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, 'out'); require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, 'relief.html')); await p.waitForTimeout(2500);
  const v = await p.$('#view');
  const go = async (x, y, z, n) => { await p.evaluate(([x, y, z]) => { const s = window.__sk; s.hero.x = x; s.hero.y = y; s.cam.x = x; s.cam.y = y - s.RF.height(x, y) - 20; s.setZoom(s.Z0 * z); }, [x, y, z]); await p.waitForTimeout(700); await v.screenshot({ path: `${OUT}/${n}.png` }); };
  for (const [n, x, y, z] of (process.argv[2] ? JSON.parse(process.argv[2]) : [['game', 900, 780, 1], ['far', 1200, 780, 0.5], ['near-oak', 720, 600, 1.6], ['plateau', 560, 700, 1], ['serp', 1700, 600, 1], ['low', 985, 1000, 1], ['ravine', 1500, 900, 1], ['pine', 600, 1150, 1.6], ['behind', 520, 110, 1]])) await go(x, y, z, n);
  await (await p.$('#over')).screenshot({ path: OUT + '/over.png' });
  console.log(errs.length ? errs : 'ошибок нет'); await b.close();
})();
