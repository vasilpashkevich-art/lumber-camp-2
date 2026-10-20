// Версия 136: Болотный край — застава на сваях, топь с кочками и гатями, логова, новые мобы (сеть рыбака, хватка утопленника,
// тина увальня), серебро, доска заказов; карта K и мини-карта. Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v136p' : 'v136';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 1200) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Болотник'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const quiet = () => ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  const go = async zone => { await ev(z => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y; }, zone); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(1600); await quiet(); };
  const at = (x, y) => ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.P.target = null; }, [x, y]);
  await quiet(); await ev(() => { window.__G.G.hero.lvl = 16; });
  await go('shroom'); await go('swamp');
  console.log('зона:', await ev(() => window.__G.G.W.Z.name));
  await shot('arrive');
  const V = await ev(() => { const v = window.__G.G.W.village; return [v.x, v.y]; });
  await at(V[0], V[1] + 80); await shot('zastava');
  await at(4800, 3000 - 420); await shot('gat');          // гать с севера на Гнилой остров
  await at(4800, 3000); await shot('island');
  // логова и мобы живыми: по одному каждого вида рядом с героем
  const spots = { snakes: [2450, 2550], drowned: [2300, 1400], fisher: [6400, 2650], hag: [7600, 1200], hulk: [3800, 3900], mistress: [2600, 5300] };
  for (const [k, [x, y]] of Object.entries(spots)) {
    await at(x, y + 150);
    await ev(([x, y]) => { const G = window.__G.G; for (const m of G.mobs) if (Math.hypot(m.hx - x, m.hy - y) < 300) { m.state = 'idle'; m.respawnAt = 0; m.hp = m.max; m.x = m.hx; m.y = m.hy; } }, [x, y]);
    await shot(k);
  }
  if (!phone) {
    // сеть рыбака и хватка утопленника — эффекты
    await at(6400, 2650 + 60); await ev(() => { const G = window.__G.G, P = G.P; const m = G.mobs.find(m => m.kind === 'fisher'); m.state = 'chase'; m.respawnAt = 0; m.hp = m.max; m.x = m.hx = P.x + 220; m.y = m.hy = P.y; m.cd = 0; });
    await shot('net', 700);
    await ev(() => { const G = window.__G.G, P = G.P; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const d = G.mobs.find(m => m.kind === 'drowned'); d.state = 'chase'; d.respawnAt = 0; d.hp = d.max; d.x = d.hx = P.x + 40; d.y = d.hy = P.y; d.cd = 0; });
    await shot('grab', 900);
    await ev(() => { const G = window.__G.G, P = G.P; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const d = G.mobs.find(m => m.kind === 'bog_hulk'); d.state = 'chase'; d.respawnAt = 0; d.hp = d.max; d.x = d.hx = P.x + 70; d.y = d.hy = P.y; d.cd = 0; d.smashAt = -99; });
    await shot('mud', 1500); await quiet();
    await p.keyboard.press('KeyK'); await shot('map', 600); await p.keyboard.press('Escape');
    // доска заказов
    await ev(() => { const G = window.__G.G, b = G.W.boards[0]; G.P.x = b.x; G.P.y = b.y + 50; }); await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await shot('board', 600); await p.keyboard.press('Escape');
    // выход на Брод
    await ev(() => { const G = window.__G.G, e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x + 200; G.P.y = e.y; }); await shot('brod');
  }
  console.log(tag, errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
