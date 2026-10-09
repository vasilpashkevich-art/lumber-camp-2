// Версия 63: кирка при копании (3 класса, 4 стороны, искры), значки руды/слитков/кирки, дороги и мосты, прозрачность построек.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(300);
  const ev = (f, a) => p.evaluate(f, a);
  for (const [i, cls] of ['warrior', 'mage', 'archer'].entries()) {
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click(`.clsCard[data-c=${cls}]`); await p.fill('#newName', 'Горняк' + i); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
    await p.click(`.slot:nth-child(${i + 1})`); await p.click('#selEnter'); await p.waitForTimeout(900);
    await ev(() => { const { G, makeStack, addStack, makePick } = window.__G; const h = G.hero; h.prof = { mining: 80 }; const pk = makePick(); pk.pos = 31; h.bag.push(pk); G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); G.st.maxHp = G.P.hp = 99999; });
    // копание с разных сторон: жила справа, слева, сверху, снизу
    for (const [n, dx, dy] of [['side', -34, 6], ['back', 0, 40], ['front', 0, -30]]) {
      await ev(([dx, dy]) => { const G = window.__G.G; const v = G.veins[0]; G.P.x = v.x + dx; G.P.y = v.y + dy; G.P.lastCombat = -99; G.P.mine = null; }, [dx, dy]);
      await p.waitForTimeout(250); await p.keyboard.press('KeyE'); await p.waitForTimeout(n === 'side' ? 1110 : 900);
      const ok = await ev(() => !!window.__G.G.P.mine); if (!ok) errs.push(cls + ' ' + n + ': не копает');
      await p.screenshot({ path: `${OUT}/v63-mine-${cls}-${n}.png`, clip: { x: 620, y: 330, width: 200, height: 170 } });
      await ev(() => { const G = window.__G.G; G.P.mine = null; });
    }
    if (i === 0) { // значки в сумке
      await ev(() => { const M = window.__G, h = M.G.hero; M.addStack(h, M.makeStack('ore', 'copper', 12)); M.addStack(h, M.makeStack('ore', 'tin', 7)); M.addStack(h, M.makeStack('bar', 'copper', 5)); M.addStack(h, M.makeStack('bar', 'tin', 3)); M.addStack(h, M.makeStack('gem', 'tigerseye', 1)); M.addStack(h, M.makeStack('gem', 'amethyst', 1)); M.refresh(); });
      await p.keyboard.press('KeyI'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v63-bag.png' }); await p.keyboard.press('KeyI'); await p.waitForTimeout(200);
      // моб гонится за героем за домом: оба видны сквозь дом
      await ev(() => { const G = window.__G.G; const hs = G.W.houses.find(b => b.id === 'h3'); G.P.x = hs.x + 10; G.P.y = hs.y - 70; const m = G.mobs.find(m => m.kind === 'fox'); m.state = 'chase'; m.hp = m.max = 9999; m.x = hs.x + 60; m.y = hs.y - 50; m.respawnAt = 0; });
      await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v63-behind-house.png' });
    }
    await ev(() => window.__G.toSelect && window.__G.toSelect()); await p.waitForTimeout(100);
    await p.goto(URL); await p.waitForTimeout(400);
  }
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'без ошибок');
  await b.close();
})();
