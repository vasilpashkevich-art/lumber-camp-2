// Версия 65: Грибной лес — переход, стоянка купца, логова, туман, жители, звери, карта, тележка-торговец, железо.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Лесник'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a);
  const shot = async n => { await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/v65-${n}.png` }); };
  // переход с востока Соснового дола
  await ev(() => { const G = window.__G.G; G.hero.lvl = 12; G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x - 80; G.P.y = e.y; });
  await shot('exit-pine');
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  const z = await ev(() => ({ zone: window.__G.G.hero.zone, x: Math.round(window.__G.G.P.x), y: Math.round(window.__G.G.P.y) })); console.log('после перехода:', z);
  await shot('arrive');
  const go = async (n, x, y, calm = true) => { await ev(([x, y, calm]) => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; if (calm) G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); G.P.x = x; G.P.y = y; }, [x, y, calm]); await shot(n); };
  await go('camp', 3000, 2700);
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(b => b.vendor); G.P.x = b.x + 30; G.P.y = b.y + 40; }); await p.waitForTimeout(400); await p.keyboard.press('KeyE'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v65-vendor.png' }); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const Z = await ev(() => window.__G.G.W.Z.camps.map(c => [c.lair, c.name, c.x, c.y, c.r]));
  for (const [l, n, x, y, r] of Z) await go('lair-' + n.replace(/ /g, '_'), x + 40, y + r + 130);
  await go('pond', 1600, 3950); await go('fog', 5900, 3800); await go('grove', 3300, 950);
  for (const [n, x, y] of [['туман', 5900, 3800], ['туман снова', 5900, 3800], ['роща', 3300, 950], ['стоянка', 3000, 2700]]) {
    await ev(([x, y]) => { const G = window.__G.G; G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); G.P.x = x; G.P.y = y; }, [x, y]); await p.waitForTimeout(500);
    const fps = await ev(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); }));
    console.log('кадров в секунду,', n + ':', fps); if (fps < 30) errs.push('мало кадров ' + n + ' ' + fps);
  }
  // жители рядом с героем
  await ev(() => { const G = window.__G.G, seen = {}; let i = 0; G.P.x = 3600; G.P.y = 2900; for (const m of G.mobs) { if (seen[m.kind]) continue; seen[m.kind] = 1; m.state = 'idle'; m.hp = m.max; m.x = G.P.x - 420 + i * 120; m.y = G.P.y + 110; m.stun = 999; m.respawnAt = 0; i++; } });
  await shot('mobs');
  // бой: моб гонится, туман не прячет полоски
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => m.stun = 0); const c = G.W.Z.camps.find(c => c.lair === 'frog'); G.P.x = c.x + 60; G.P.y = c.y + 40; });
  await p.waitForTimeout(1500); await shot('fight');
  await p.keyboard.press('KeyK'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v65-map.png' }); await p.keyboard.press('KeyK'); await p.waitForTimeout(200);
  // железо: жила и копание
  await ev(() => { const M = window.__G, G = M.G, h = G.hero; h.prof = { mining: 110 }; const pk = M.makePick(); pk.pos = 31; h.bag.push(pk); const v = G.veins.find(v => v.metal === 'iron'); G.P.x = v.x - 36; G.P.y = v.y + 6; G.P.lastCombat = -99; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  await shot('iron-vein'); await p.keyboard.press('KeyE'); await p.waitForTimeout(3600);
  const ore = await ev(() => window.__G.G.hero.bag.filter(i => i.kind === 'ore').map(i => i.name + ' ' + i.n)); console.log('руда:', ore);
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
})();
