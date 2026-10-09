// Версия 64: новое тело и вещи моделями — три класса в мире (4 стороны, удар), окно героя, сумка, экран выбора, люди-мобы и стража.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  const ev = (f, a) => p.evaluate(f, a);
  const CL = ['warrior', 'mage', 'archer'];
  for (const [i, cls] of CL.entries()) {
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(150);
    if (i === 0) await p.screenshot({ path: OUT + '/v64-create.png' });
    await p.click(`.clsCard[data-c=${cls}]`); await p.fill('#newName', 'Облик' + i); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  }
  for (const [i, cls] of CL.entries()) {
    await p.click(`.slot:nth-child(${i + 1})`); await p.click('#selEnter'); await p.waitForTimeout(900);
    // вещи: синие ур.18 и сумка из разных вещей
    await ev(cls => { const M = window.__G, h = M.G.hero, G = M.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); G.st.maxHp = G.P.hp = 99999;
      for (const s of ['head', 'chest', 'legs', 'weapon', 'ring', 'neck']) h.eq[s] = M.makeItem(cls, s, 18, 'rare');
      h.bag = []; let pos = 0; for (const r of ['common', 'good', 'rare', 'epic']) for (const s of ['weapon', 'head', 'chest', 'legs', 'ring', 'neck']) { const it = M.makeItem(cls, s, 4 + pos, r); it.pos = pos++; h.bag.push(it); }
      M.refresh(); G.P.x = 4500; G.P.y = 2700; }, cls);
    await p.waitForTimeout(400);
    // 4 стороны: идём и бьём
    for (const [n, dx, dy] of [['down', 0, 1], ['right', 1, 0], ['up', 0, -1]]) {
      await ev(([dx, dy]) => { const P = window.__G.G.P; P.mvx = dx; P.mvy = dy; P.face = Math.atan2(dy, dx); P.atkT = P.atkDur * 0.45; P.lastCombat = window.__G.G.t; }, [dx, dy]);
      await p.waitForTimeout(16); await p.screenshot({ path: `${OUT}/v64-${cls}-atk-${n}.png`, clip: { x: 620, y: 330, width: 200, height: 180 } });
    }
    await p.keyboard.down('KeyD'); await p.waitForTimeout(450); await p.screenshot({ path: `${OUT}/v64-${cls}-walk.png`, clip: { x: 570, y: 300, width: 300, height: 220 } }); await p.keyboard.up('KeyD');
    await p.keyboard.press('KeyI'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v64-${cls}-char.png` }); await p.keyboard.press('KeyI'); await p.waitForTimeout(200);
    await p.screenshot({ path: `${OUT}/v64-${cls}-hud.png`, clip: { x: 0, y: 0, width: 420, height: 120 } });
    await ev(() => window.__G.toSelect()); await p.waitForTimeout(600);
  }
  await p.screenshot({ path: OUT + '/v64-select.png' });
  // люди-мобы и стража рядом с героем
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const lineup = async (n) => { await ev(() => { const G = window.__G.G, seen = {}; let i = 0; G.st.maxHp = G.P.hp = 99999;
      for (const m of G.mobs) { if (seen[m.kind]) continue; seen[m.kind] = 1; m.state = 'idle'; m.hp = m.max; m.x = G.P.x - 380 + i * 90; m.y = G.P.y + 100; m.stun = 999; m.respawnAt = 0; i++; } });
    await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v64-${n}.png` }); };
  await ev(() => { const G = window.__G.G; G.P.x = 4800; G.P.y = 2500; }); await lineup('mobs-pine');
  await ev(() => { const G = window.__G.G, c = G.W.cap; G.P.x = c.x + 20; G.P.y = c.y + c.R + 60; }); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v64-guards.png' });
  await ev(() => { const G = window.__G.G; G.hero.lvl = 7; const e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y - 70; });
  await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(1200);
  await ev(() => { const G = window.__G.G; G.P.x = 4200; G.P.y = 3000; }); await lineup('mobs-farms');
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
})();
