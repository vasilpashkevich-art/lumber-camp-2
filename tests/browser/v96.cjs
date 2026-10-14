// Версия 96: новый сундук подземелья (мультяшный) — все 5 сундуков храма закрытыми и открытыми, рядом с героем (компьютер и телефон).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function enter(p, cls) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${cls}]`); await p.waitForTimeout(100);
  await p.evaluate(() => { document.querySelector('#newName').value = 'Сундучник'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await p.evaluate(() => { const G = window.__G.G; G.hero.lvl = 16; window.__G.refresh(); const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const T = G.W.temple; G.P.x = T.x; G.P.y = T.y - 40; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e18; }); G.W.unseal && G.W.unseal(); });
}
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await enter(p, 'warrior');
  const C = await p.evaluate(() => window.__G.G.W.Z.decor.chests);
  for (let i = 0; i < C.length; i++) {
    const [x, y] = C[i];
    await p.evaluate(([x, y]) => { const G = window.__G.G; G.P.x = x - 70; G.P.y = y + 40; }, [x, y]); await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/v96-chest${i}-closed.png` });
    await p.evaluate(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y + 34; }, [x, y]); await p.keyboard.press('KeyE'); await p.waitForTimeout(400); await p.keyboard.press('Escape');
    await p.evaluate(([x, y]) => { const G = window.__G.G; G.P.x = x - 70; G.P.y = y + 40; }, [x, y]); await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/v96-chest${i}-open.png` });
    console.log('сундук', i, await p.evaluate(i => !!window.__G.G.dg.chests[i], i) ? 'открыт' : 'НЕ ОТКРЫТ');
  }
  // сквозь сундук не пройти
  console.log('сквозь:', await p.evaluate(([x, y]) => { const G = window.__G.G; return G.W.walkable(x, y - 6) ? 'проходит' : 'не пройти'; }, C[0]));
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const ph = await ctx.newPage(); ph.on('pageerror', e => errs.push('phone ' + e.message));
  await enter(ph, 'mage');
  await ph.evaluate(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y + 34; }, C[1]); await ph.waitForTimeout(500); await ph.screenshot({ path: `${OUT}/v96-phone-closed.png` });
  await ph.tap('#actUse'); await ph.waitForTimeout(500); await ph.tap('.modal .xclose'); await ph.waitForTimeout(400); await ph.screenshot({ path: `${OUT}/v96-phone-open.png` });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
