// v106: Грибной лес и значки шлемов — было / стало. ONLY=old|new.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '../../../tests/browser/out'); const URL = 'file://' + path.resolve(__dirname, '../../../index.html') + '#dev';
(async () => { const b = await chromium.launch();
  for (const old of (process.env.ONLY ? [process.env.ONLY === 'old'] : [true, false])) { const tag = old ? 'old' : 'new'; const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } });
    await ctx.addInitScript(o => { window.__oldLairs = o; window.__oldIcons = o; try { localStorage.setItem('lumber-camp2-zoom', '1.1'); } catch (e) {} }, old);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.evaluate(() => { document.querySelector('#newName').value = 'Грибник'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
    // значки шлемов: по 3 класса × ярусы в сумке
    await p.evaluate(() => { const G = window.__G.G; G.hero.bag.length = 0; let k = 0; for (const cls of ['warrior', 'mage', 'archer']) for (const [lv, rar] of [[2, 'common'], [9, 'good'], [16, 'rare'], [24, 'rare'], [30, 'epic']]) { const it = window.__G.makeItem(cls, 'head', lv, rar, Math.random); it.pos = k++; G.hero.bag.push(it); } window.__G.refresh(); });
    await p.keyboard.press('KeyI'); await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/v106-${tag}-helms.png` }); await p.keyboard.press('KeyI');
    const at = async (name, fn, arg) => { await p.evaluate(fn, arg); await p.waitForTimeout(1200); await p.screenshot({ path: `${OUT}/v106-${tag}-${name}.png` }); };
    await p.evaluate(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(1600);
    for (const k of ['frog', 'shroom', 'web2', 'brood', 'snake']) await at('lair-' + k, k => { const G = window.__G.G, cp = G.W.camps.find(c => c.lair === k); G.mobs.length = 0; if (cp) { G.P.x = cp.x + 100; G.P.y = cp.y + 60; } }, k);
    await at('log', () => { const G = window.__G.G, o = G.W.props.find(p => p.kind === 'log'); G.mobs.length = 0; G.P.x = o.x + 60; G.P.y = o.y + 40; });
    await at('reeds', () => { const G = window.__G.G, o = G.W.props.find(p => p.kind === 'reeds'); G.mobs.length = 0; G.P.x = o.x + 60; G.P.y = o.y + 60; });
    await at('glow', () => { const G = window.__G.G, o = G.W.props.find(p => p.kind === 'glow'); G.mobs.length = 0; G.P.x = o.x + 50; G.P.y = o.y + 40; });
    if (errs.length) console.log(errs.slice(0, 5)); await ctx.close(); }
  console.log('готово'); await b.close(); })();
