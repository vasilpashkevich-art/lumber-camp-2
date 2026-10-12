const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 1 }); const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'warrior.html')); await p.waitForTimeout(1200);
  const out = path.join(__dirname, 'out'); require('fs').mkdirSync(out, { recursive: true });
  const shots = (process.argv[2] || 'idle:0.5').split(',');
  for (const s of shots) { const [anim, t, set, dir] = s.split(':'); await p.evaluate(([a, t, set, dir]) => { const S = window.__sk.st; S.anim = a; if (set) S.set = set; if (dir) { S.spin = false; S.dir = +dir; } S.fix = +t; window.__sk.ui(); }, [anim, t, set, dir]); await p.waitForTimeout(40); await (await p.$('#big')).screenshot({ path: `${out}/${anim}-${t}-${set || ''}-${dir || ''}.png` }); }
  await p.evaluate(() => { window.__sk.st.fix = null; });
  if (process.argv[3]) { for (const id of ['turn', 'setsCv', 'game']) { const el = await p.$('#' + id); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(60); await el.screenshot({ path: `${out}/${id}.png` }); } }
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close(); })();
