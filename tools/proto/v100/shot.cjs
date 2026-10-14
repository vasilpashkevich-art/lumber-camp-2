// Эскиз v100: рынок столицы, лавка Хутора, тележка в Грибном лесу — в игре.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out'); const URL = 'file://' + path.resolve(__dirname, '../../../index.html') + '#dev';
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('lumber-camp2-zoom', '1.2'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.evaluate(() => { document.querySelector('#newName').value = 'Покупатель'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const at = async (n, f) => { await p.evaluate(f); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/v100-${n}.png` }); };
  await at('capital', () => { const G = window.__G.G, c = G.W.Z.capital; G.st.maxHp = G.P.hp = 99999; G.P.x = c.x - 140; G.P.y = c.y + 20; });
  for (const [zone, n, dx, dy] of [['farms', 'hutor', -40, 60], ['shroom', 'cart', 40, 60]]) {
    await p.evaluate(z => { const G = window.__G.G, e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y; }, zone); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
    await at(n, new Function(`const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e12; }); const h = G.W.houses.find(h => h.art === 'stall' || h.art === 'cart'); G.P.x = h.x + ${dx}; G.P.y = h.y + ${dy};`));
    await p.evaluate(() => { const G = window.__G.G, e = G.W.exits.find(e => e.zone === 'pine'); G.P.x = e.x; G.P.y = e.y; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  }
  console.log(errs.length ? errs.join('\n') : 'ошибок нет'); await b.close(); })();
