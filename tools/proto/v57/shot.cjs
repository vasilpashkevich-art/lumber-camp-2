const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'zone2.html')); await p.waitForTimeout(800);
  const out = n => path.resolve(__dirname, '../../../tests/browser/out/' + n);
  await (await p.$('#map')).screenshot({ path: out('v57-map.png') });
  await (await p.$('#scene')).screenshot({ path: out('v57-scene.png') });
  await (await p.$('#mobs')).screenshot({ path: out('v57-mobs.png') });
  await p.click('[data-dir="1"]'); await p.waitForTimeout(200); await (await p.$('#mobs')).screenshot({ path: out('v57-mobs-side.png') });
  await p.click('[data-mode=atk]'); await p.waitForTimeout(500); await (await p.$('#mobs')).screenshot({ path: out('v57-mobs-atk.png') });
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close();
})();
