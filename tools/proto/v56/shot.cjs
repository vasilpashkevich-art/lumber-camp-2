// Снимки эскиза: все действия и стороны. NODE_PATH=$(npm root -g) node tools/proto/v56/shot.cjs
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'anim.html')); await p.waitForTimeout(400);
  const out = (n) => path.resolve(__dirname, '../../../tests/browser/out/' + n);
  for (const [m, list] of [['walk', [0, 1, 2]], ['atk', [1, 0, 2]], ['dead', [1]], ['idle', [0]]]) {
    await p.click(`[data-mode=${m}]`);
    for (const d of list) { await p.click(`[data-dir="${d}"]`); await p.waitForTimeout(m === 'atk' ? 520 : m === 'dead' ? 1500 : 300); await p.screenshot({ path: out(`v56-${m}-${d}.png`), fullPage: true }); }
  }
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close();
})();
