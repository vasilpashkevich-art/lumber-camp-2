// v104: приметы логов, мост, скалы, жилы в игре — было / стало. ONLY=old|new.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out'); const URL = 'file://' + path.resolve(__dirname, '../../../index.html') + '#dev';
(async () => { const b = await chromium.launch();
  for (const old of (process.env.ONLY ? [process.env.ONLY === 'old'] : [true, false])) { const tag = old ? 'old' : 'new'; const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } });
    await ctx.addInitScript(o => { window.__oldLairs = o; try { localStorage.setItem('lumber-camp2-zoom', '1.1'); } catch (e) {} }, old);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.evaluate(() => { document.querySelector('#newName').value = 'Следопыт'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
    const at = async (name, fn, arg) => { await p.evaluate(fn, arg); await p.waitForTimeout(1100); await p.screenshot({ path: `${OUT}/v104-${tag}-${name}.png` }); };
    const lairs = async kinds => { for (const k of kinds) await at('lair-' + k, k => { const G = window.__G.G, cp = G.W.camps.find(c => c.lair === k); G.st.maxHp = G.P.hp = 99999; G.mobs.length = 0; if (cp) { G.P.x = cp.x + 110; G.P.y = cp.y + 70; } }, k); };
    await lairs(['den', 'wolf', 'boar', 'web', 'bandit', 'ataman']);
    await at('rock', () => { const G = window.__G.G, o = (G.W.rocks || [])[0]; if (o) { G.P.x = o.x + o.w * 0.7; G.P.y = o.y + 50; } });
    await p.evaluate(() => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
    await lairs(['kennel', 'crowfield', 'scarefield', 'pasture', 'burned']);
    await at('bridge', () => { const G = window.__G.G, b = G.W.river.bridgeAt[0]; G.mobs.length = 0; G.P.x = b.x + 90; G.P.y = b.y + 40; });
    await at('vein', () => { const G = window.__G.G; window.__G.refresh(); const v = (G.veins || [])[0]; if (v) { G.P.x = v.x + 70; G.P.y = v.y + 40; } });
    if (errs.length) console.log(errs.slice(0, 5)); await ctx.close(); }
  console.log('готово'); await b.close(); })();
