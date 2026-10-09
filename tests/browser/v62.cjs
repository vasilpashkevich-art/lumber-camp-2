// Версия 62: украшения у торговца, самоцветы в сумке, широкие полоски здоровья и опыта.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=mage]'); await p.fill('#newName', 'Покупатель'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a);
  await ev(() => { const { G } = window.__G; const h = G.hero; h.lvl = 6; h.xp = 1234; h.gold = 1200; window.__G.addStack(h, window.__G.makeStack('gem', 'tigerseye', 3)); window.__G.addStack(h, window.__G.makeStack('gem', 'amethyst', 1)); window.__G.refresh();
    const b = G.W.houses.find(b => b.vendor); G.P.x = b.x; G.P.y = b.y + 50; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v62-hud.png', clip: { x: 0, y: 0, width: 520, height: 120 } });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v62-vendor.png' });
  const w = await p.$$('.buy .ware'); if (w.length < 4) errs.push('нет украшений у торговца: ' + w.length);
  await w[1].hover(); await p.waitForTimeout(250); await p.screenshot({ path: OUT + '/v62-vendor-tip.png' });
  await w[1].click(); await p.waitForTimeout(250);
  const bought = await ev(() => window.__G.G.hero.bag.filter(i => i.slot === 'ring' || i.slot === 'neck').length); if (bought !== 1) errs.push('покупка не прошла');
  const gemCell = await ev(() => window.__G.G.hero.bag.find(i => i.kind === 'gem').pos); await (await p.$$('.vend .bag .cell'))[gemCell].hover(); await p.waitForTimeout(250); await p.screenshot({ path: OUT + '/v62-gem.png' });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
