const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 1 }); const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'talents.html')); await p.waitForTimeout(1500);
  const out = path.join(__dirname, 'out'); require('fs').mkdirSync(out, { recursive: true });
  const T = process.argv[2] ? +process.argv[2] : null;
  if (T != null) await p.evaluate(t => { for (const s of window.__sk.stages) s.t0 = performance.now() / 1000 - t; }, T);
  await p.waitForTimeout(120);
  await p.screenshot({ path: out + '/full.png', fullPage: true });
  const cards = await p.$$('.card'); let i = 0; for (const c of cards) { await c.scrollIntoViewIfNeeded(); if (T != null) await p.evaluate(t => { for (const s of window.__sk.stages) s.t0 = performance.now() / 1000 - t; }, T); await p.waitForTimeout(150); await c.screenshot({ path: `${out}/card${String(i++).padStart(2, '0')}.png` }); }
  await (await p.$('#tw')).screenshot({ path: out + '/tw.png' }); await (await p.$('.phone')).screenshot({ path: out + '/phone.png' }); await (await p.$('#old')).screenshot({ path: out + '/old.png' });
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close(); })();
