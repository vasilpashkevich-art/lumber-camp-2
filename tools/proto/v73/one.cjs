const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 900 } });
  await p.goto('file://' + path.resolve(__dirname, 'talents.html')); await p.waitForTimeout(800);
  const [id, ...ts] = process.argv.slice(2);
  const idx = await p.evaluate(id => window.__sk.stages.findIndex(s => s.id === id), id);
  const cv = (await p.$$('.card canvas'))[idx]; await cv.scrollIntoViewIfNeeded();
  for (const t of ts) { await p.evaluate(([i, t]) => { const s = window.__sk.stages[i]; s.t0 = performance.now() / 1000 - +t; }, [idx, t]); await p.waitForTimeout(30); await cv.screenshot({ path: path.join(__dirname, 'out', `${id}_${t}.png`) }); }
  await b.close(); })();
