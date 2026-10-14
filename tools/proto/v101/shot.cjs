// Эскиз v101: банк в игре — было / стало.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out'); const URL = 'file://' + path.resolve(__dirname, '../../../index.html') + '#dev';
(async () => { const b = await chromium.launch();
  for (const old of [true, false]) { const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } });
    await ctx.addInitScript(o => { window.__oldBld = o; try { localStorage.setItem('lumber-camp2-zoom', '1'); } catch (e) {} }, old);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.evaluate(() => { document.querySelector('#newName').value = 'Вкладчик'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
    await p.evaluate(() => { const G = window.__G.G, h = G.W.houses.find(h => h.art === 'bank'); G.st.maxHp = G.P.hp = 99999; G.P.x = h.x - 60; G.P.y = h.y + 60; }); await p.waitForTimeout(900);
    await p.screenshot({ path: `${OUT}/v101-${old ? 'old' : 'new'}-bank.png` }); if (errs.length) console.log(errs); await ctx.close(); }
  console.log('готово'); await b.close(); })();
