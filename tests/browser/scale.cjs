// Проверка масштаба: герой рядом с постройками, логовами и мобами в обеих зонах.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Мерило'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a);
  const go = async (n, x, y) => { await ev(([x, y]) => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.P.x = x; G.P.y = y; }, [x, y]); await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/scale-${n}.png` }); };
  const lineup = async n => {
    await ev(() => { const G = window.__G.G, seen = {}; let i = 0;
      for (const m of G.mobs) { if (seen[m.kind] || m.state === 'dead') continue; seen[m.kind] = 1; m.x = G.P.x - 330 + i * 95; m.y = G.P.y + 110; m.stun = 999; m.state = 'idle'; i++; }
      G.P.y -= 0; });
    await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/scale-${n}.png` });
  };
  // Сосновый дол: столица
  const C = await ev(() => { const c = window.__G.G.W.Z.capital; return { x: c.x, y: c.y, R: c.R, b: c.buildings }; });
  for (const bd of C.b) await go('pine-' + bd.id, C.x + bd.dx + 40, C.y + bd.dy + 70);
  await go('pine-gate', C.x + C.R + 30, C.y + 20);
  await go('pine-gate-s', C.x + 20, C.y + C.R + 30);
  const camps = await ev(() => window.__G.G.W.Z.camps.map(c => [c.lair, c.x, c.y]));
  const doneL = {}; for (const [l, x, y] of camps) { if (doneL[l]) continue; doneL[l] = 1; await go('pine-lair-' + l, x + 60, y + 90); }
  await go('pine-forest', 4500, 2700);
  await lineup('pine-mobs');
  // Хуторские угодья
  await ev(() => { const G = window.__G.G; G.hero.lvl = 7; const e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y - 70; });
  await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(1200);
  const V = await ev(() => { const Z = window.__G.G.W.Z; return { v: Z.village, fs: Z.farmsteads, mill: Z.mill }; });
  for (const bd of V.v.buildings) await go('farm-' + bd.id, V.v.x + bd.dx + 40, V.v.y + bd.dy + 70);
  if (V.fs) await go('farm-farmstead', V.fs[0].x + 40, V.fs[0].y + 80);
  const camps2 = await ev(() => window.__G.G.W.Z.camps.map(c => [c.lair, c.x, c.y]));
  const done2 = {}; for (const [l, x, y] of camps2) { if (done2[l]) continue; done2[l] = 1; await go('farm-lair-' + l, x + 60, y + 90); }
  await go('farm-bridge', 2600, 2380);
  await lineup('farm-mobs');
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
})();
