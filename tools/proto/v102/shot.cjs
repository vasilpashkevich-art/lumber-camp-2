// v102: постройки в игре — было / стало (столица, Хутор Подгорный, хутор, пепелище, мельница). OLD=1 — только было.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out'); const URL = 'file://' + path.resolve(__dirname, '../../../index.html') + '#dev';
(async () => { const b = await chromium.launch();
  for (const old of (process.env.ONLY ? [process.env.ONLY === 'old'] : [true, false])) { const tag = old ? 'old' : 'new'; const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } });
    await ctx.addInitScript(o => { window.__oldBld = o; try { localStorage.setItem('lumber-camp2-zoom', '0.8'); } catch (e) {} }, old);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.evaluate(() => { document.querySelector('#newName').value = 'Зодчий'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
    const at = async (name, fn) => { await p.evaluate(fn); await p.waitForTimeout(1200); await p.screenshot({ path: `${OUT}/v102-${tag}-${name}.png` }); };
    await p.evaluate(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.length = 0; });
    const cap = [['house', 0], ['forge'], ['tavern'], ['enchant'], ['miners'], ['herbal'], ['inn'], ['palace']];
    for (const [a, v] of cap) await at('cap-' + a + (v != null ? v : ''), new Function(`const G = window.__G.G, h = G.W.houses.find(h => h.art === '${a}'${v != null ? ` && (h.v || 0) === ${v}` : ''}); if (!h) return; G.P.x = h.x + ${a === 'palace' ? 0 : 120}; G.P.y = h.y + ${a === 'palace' ? 160 : 70};`));
    await p.evaluate(() => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
    await p.evaluate(() => { const G = window.__G.G; G.mobs.length = 0; });
    await at('vil', () => { const G = window.__G.G, v = G.W.village; G.P.x = v.x + 40; G.P.y = v.y + 60; });
    await at('vil2', () => { const G = window.__G.G, v = G.W.village; G.P.x = v.x + 300; G.P.y = v.y + 240; });
    await at('farm', () => { const G = window.__G.G, f = G.W.Z.farmsteads[0]; G.P.x = f.x + 200; G.P.y = f.y + 40; });
    await at('burned', () => { const G = window.__G.G, f = G.W.Z.farmsteads[3]; G.P.x = f.x + 160; G.P.y = f.y + 40; });
    await at('mill', () => { const G = window.__G.G, m = G.W.Z.mill; G.P.x = m.x + 120; G.P.y = m.y + 50; });
    if (errs.length) console.log(errs.slice(0, 5)); await ctx.close(); }
  console.log('готово'); await b.close(); })();
