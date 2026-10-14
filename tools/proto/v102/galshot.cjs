const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() !== 'log') errs.push(m.text().slice(0, 300)); });
  await p.goto('file://' + path.resolve(__dirname, 'gal.html'));
  const sets = (process.env.SETS || 'cap,vil').split(','), whiches = (process.env.W || 'old,new').split(',');
  for (const s of sets) for (const w of whiches) { const u = await p.evaluate(([w, s]) => { const cv = document.createElement('canvas'); window.draw(cv, w, s); return cv.toDataURL(); }, [w, s]); fs.writeFileSync(path.join(__dirname, `../../../tests/browser/out/v102-${s}-${w}.png`), Buffer.from(u.split(',')[1], 'base64')); }
  console.log(errs.length ? errs.slice(0, 5).join('\n') : 'ошибок нет'); await b.close(); })();
