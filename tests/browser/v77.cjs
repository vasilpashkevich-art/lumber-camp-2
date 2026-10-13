// Версия 77: Преддверие Храма квакунов — вход через врата, зал с костром, коридоры, Караульная, Зал врат, выход наружу, карта, телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 600) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/v77-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Лесник'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await ev(() => { const G = window.__G.G; G.hero.lvl = 20; window.__G.refresh(); G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const T = G.W.temple; G.P.x = T.x; G.P.y = T.y - 40; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; });
  console.log('зона:', await ev(() => window.__G.G.hero.zone + ' ' + Math.round(window.__G.G.P.x) + ',' + Math.round(window.__G.G.P.y)));
  await shot('hall');
  const go = async (x, y) => { await ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.P.nav = null; G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); }, [x, y]); };
  await go(1600, 1700); await shot('corridor');
  await go(1600, 1400); await shot('guard');
  await go(2200, 1360); await shot('corridor2');
  await go(2700, 1300); await shot('gate-hall');
  await go(2700, 1160); await p.keyboard.press('KeyE'); await p.waitForTimeout(300); console.log('врата:', await ev(() => document.querySelector('#toasts').textContent));
  await shot('gate-locked', 200);
  // бой: страж и лягушка
  await go(1600, 1600); await ev(() => { const G = window.__G.G; const m = G.mobs.find(o => o.kind === 'kvak_guard'); m.state = 'chase'; G.P.target = m; }); await shot('fight', 1200);
  console.log('мобы:', await ev(() => window.__G.G.mobs.map(m => m.D.name + ' ' + m.lvl + ' hp' + Math.round(m.max)).join('; ')));
  // путь: щелчок по земле в Зале врат из Преддверия — идёт по коридорам
  await go(1600, 2100); await ev(() => { const G = window.__G.G; const p = G.W.path(G.P.x, G.P.y, 2700, 1300, 60000); window.__pl = p && p.length; }); console.log('путь в Зал врат, точек:', await ev(() => window.__pl));
  // наружу
  await go(1600, 2240); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500); console.log('вышел:', await ev(() => window.__G.G.hero.zone + ' ' + Math.round(window.__G.G.P.x) + ',' + Math.round(window.__G.G.P.y)));
  await shot('outside');
  // обратно и карта
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const T = G.W.temple; G.P.x = T.x; G.P.y = T.y - 40; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(1200); await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; });
  await p.keyboard.press('KeyK'); await shot('map', 500); await p.keyboard.press('Escape');
  // гибель внутри — возрождение у костра
  await ev(() => { const G = window.__G.G; G.P.x = 2700; G.P.y = 1300; G.st.maxHp = 600; G.P.hp = 1; const m = G.mobs.find(o => o.kind === 'kvak_guard' && o.hy < 1500 && o.hx > 2400); m.state = 'chase'; });
  await p.waitForTimeout(4000); console.log('после гибели:', await ev(() => (window.__G.G.P.dead ? 'мёртв' : 'жив') + ' ' + Math.round(window.__G.G.P.x) + ',' + Math.round(window.__G.G.P.y)));
  await shot('after-death', 300);
  // телефон
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push(e.message));
  await p2.goto(URL); await p2.waitForTimeout(400); await p2.click('#selNew', { noWaitAfter: true }); await p2.waitForTimeout(100); await p2.click('.clsCard[data-c=warrior]'); await p2.fill('#newName', 'Палец'); await p2.click('[data-x=ok]'); await p2.waitForTimeout(150); await p2.click('.slot:nth-child(1)'); await p2.click('#selEnter'); await p2.waitForTimeout(900);
  const ev2 = (f, a) => p2.evaluate(f, a);
  await ev2(() => { const G = window.__G.G; G.hero.lvl = 20; window.__G.refresh(); G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; }); await p2.keyboard.press('KeyE'); await p2.waitForTimeout(1500);
  await ev2(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const T = G.W.temple; G.P.x = T.x; G.P.y = T.y - 40; }); await p2.keyboard.press('KeyE'); await p2.waitForTimeout(1500);
  await p2.waitForTimeout(600); await p2.screenshot({ path: `${OUT}/v77-phone.png` }); console.log('телефон зона:', await ev2(() => window.__G.G.hero.zone), 'кнопка:', await ev2(() => document.querySelector('#actUse') && document.querySelector('#actUse').textContent));
  await b.close();
  if (errs.length) { console.log('ОШИБКИ:', errs.slice(0, 5)); process.exit(1); }
  console.log('v77: готово');
})();
