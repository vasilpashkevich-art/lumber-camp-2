const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() !== 'log') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'gal.html'));
  for (const w of ['old', 'new']) { const u = await p.evaluate(w => { const cv = document.createElement('canvas'); window.draw(cv, w); return cv.toDataURL(); }, w); fs.writeFileSync(path.join(__dirname, `../../../tests/browser/out/v99-gal-${w}.png`), Buffer.from(u.split(',')[1], 'base64')); }
  console.log(errs.length ? errs.slice(0, 5).join('\n') : 'ошибок нет'); await b.close(); })();
