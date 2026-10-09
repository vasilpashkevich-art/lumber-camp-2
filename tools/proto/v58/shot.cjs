const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'capital.html')); await p.waitForTimeout(1500);
  const out = n => path.resolve(__dirname, '../../../tests/browser/out/' + n);
  for (const v of ['a', 'b', 'c']) { await p.click(`[data-v=${v}]`); await p.waitForTimeout(300); await (await p.$('#scene')).screenshot({ path: out(`v58-castle-${v}.png`) }); }
  await p.click('[data-n="1"]'); await p.waitForTimeout(300); await (await p.$('#scene')).screenshot({ path: out('v58-castle-night.png') });
  await (await p.$('#plan')).screenshot({ path: out('v58-plan.png') });
  await (await p.$('#scale')).screenshot({ path: out('v58-scale.png') });
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close();
})();
