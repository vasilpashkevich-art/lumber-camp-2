const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'rigtest.html'));
  const which = process.argv.slice(2); const sets = which.length ? which : ['warrior', 'mage', 'archer', 'people']; const SL = (process.env.ROWS || '0-99').split('-').map(Number), SC = +(process.env.SC || 3);
  for (const s of sets) for (const mode of ['views', 'anim']) {
    const url = await p.evaluate(([s, mode, SL, SC]) => { const cv = document.createElement('canvas'); window.sheet(cv, window.SETS[s].slice(SL[0], SL[1] + 1), mode === 'anim' ? SC * 0.75 : SC, mode); return cv.toDataURL(); }, [s, mode, SL, SC]);
    require('fs').writeFileSync(`${OUT}/v97-${s}-${mode}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close(); })();
