// v103: убранство в игре — было / стало. ONLY=old|new.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out'); const URL = 'file://' + path.resolve(__dirname, '../../../index.html') + '#dev';
(async () => { const b = await chromium.launch();
  for (const old of (process.env.ONLY ? [process.env.ONLY === 'old'] : [true, false])) { const tag = old ? 'old' : 'new'; const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } });
    await ctx.addInitScript(o => { window.__oldProps = o; try { localStorage.setItem('lumber-camp2-zoom', '1.1'); } catch (e) {} }, old);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.evaluate(() => { document.querySelector('#newName').value = 'Садовник'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
    const at = async (name, fn, arg) => { await p.evaluate(fn, arg); await p.waitForTimeout(1200); await p.screenshot({ path: `${OUT}/v103-${tag}-${name}.png` }); };
    await p.evaluate(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.length = 0; });
    await at('fountain', () => { const G = window.__G.G, c = G.W.cap; G.P.x = c.x + 150; G.P.y = c.y + 140; });
    await at('yard', () => { const G = window.__G.G, c = G.W.cap; G.P.x = c.x + 960; G.P.y = c.y - 280; });
    await at('yard2', () => { const G = window.__G.G, c = G.W.cap; G.P.x = c.x + 700; G.P.y = c.y + 160; });
    await at('grave', () => { const G = window.__G.G, gy = G.W.graveyard; G.P.x = gy.x + 60; G.P.y = gy.y + 140; });
    await at('camp', () => { const G = window.__G.G, cp = G.W.camps.find(c => c.lair === 'bandit'); G.mobs.length = 0; G.P.x = cp.x + 80; G.P.y = cp.y + 100; });
    await at('sign', () => { const G = window.__G.G, e = G.W.exits[0]; G.P.x = e.x + 60; G.P.y = e.y + 60; });
    await p.evaluate(() => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
    await p.evaluate(() => { const G = window.__G.G; G.mobs.length = 0; });
    await at('well', () => { const G = window.__G.G, v = G.W.village; G.P.x = v.x + 60; G.P.y = v.y + 70; });
    await at('hay', () => { const G = window.__G.G, h = G.W.props.find(p => p.kind === 'hay'); G.P.x = h.x + 60; G.P.y = h.y + 40; });
    if (errs.length) console.log(errs.slice(0, 5)); await ctx.close(); }
  console.log('готово'); await b.close(); })();
