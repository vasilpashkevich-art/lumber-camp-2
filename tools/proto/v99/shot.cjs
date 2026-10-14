// Эскиз v99: стены, башни и ворота столицы — было / стало, рядом с героем.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out'); const URL = 'file://' + path.resolve(__dirname, '../../../index.html') + '#dev';
async function run(b, old, tag, vw = 1440, vh = 860, mobile = false) {
  const ctx = await b.newContext(mobile ? { viewport: { width: vw, height: vh }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: vw, height: vh } });
  await ctx.addInitScript(o => { window.__oldCity = o; try { localStorage.setItem('lumber-camp2-zoom', '0.8'); } catch (e) {} }, old);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.evaluate(() => { document.querySelector('#newName').value = 'Зодчий'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const C = await p.evaluate(() => { const c = window.__G.G.W.Z.capital; return { x: c.x, y: c.y, s: c.square }; });
  const spots = { gate: [C.x + C.s.southGate + 150, C.y + C.s.y1 + C.s.th + 100], corner: [C.x + C.s.x1 + 60, C.y + C.s.y1 + 120], north: [C.x + 400, C.y + C.s.y0 + 90], east: [C.x + C.s.x1 + C.s.th + 120, C.y + C.s.eastGate + 60] };
  for (const [n, [x, y]] of Object.entries(spots)) { await p.evaluate(([x, y]) => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e12; }); G.P.x = x; G.P.y = y; }, [x, y]); await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/v99-${tag}-${n}.png` }); }
  if (errs.length) console.log(tag, errs); await ctx.close();
}
(async () => { const b = await chromium.launch(); await run(b, true, 'old'); await run(b, false, 'new'); if (process.env.PHONE) await run(b, false, 'phone', 844, 390, true); console.log('готово'); await b.close(); })();
