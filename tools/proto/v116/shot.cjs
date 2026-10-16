// снимки эскиза: кадры каждого движения (в замедлении)
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'anim.html')); await p.waitForTimeout(500);
  for (let i = 0; i < 4; i++) for (const f of [0.12, 0.25]) { await p.evaluate(T => window.__T = T, i * 0.75 + f * 0.75); await p.waitForTimeout(150); await p.locator('canvas').screenshot({ path: path.join(__dirname, `s${i}${f === 0.12 ? 'a' : 'b'}.png`) }); }
  console.log(errs.length ? errs : 'ошибок нет'); await b.close(); })();
