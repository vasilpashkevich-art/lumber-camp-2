// Версия 69: телефон — экран лёжа, джойстик, касания по миру (моб, тело, жила, постройка, земля), кнопки, окна.
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/v69-${n}.png` }); };
  const ev = (f, a) => p.evaluate(f, a);
  await p.goto(URL); await p.waitForTimeout(400);
  console.log('касание:', await ev(() => document.documentElement.classList.contains('touch')));
  await shot('select');
  await p.tap('#selNew'); await p.waitForTimeout(150); await shot('create'); await p.tap('.clsCard[data-c=mage]'); await p.fill('#newName', 'Палец'); await p.tap('[data-x=ok]'); await p.waitForTimeout(150);
  await p.tap('.slot:nth-child(1)'); await p.tap('#selEnter'); await p.waitForTimeout(1000);
  await shot('hud');
  const toScreen = ([x, y]) => p.evaluate(([x, y]) => { const R = window.__G.R(); return [(x - R.cam.x) * R.cam.z / R.dpr + innerWidth / 2, (y - R.cam.y) * R.cam.z / R.dpr + innerHeight / 2]; }, [x, y]);
  // джойстик: провести пальцем в левой части
  const x0 = await ev(() => window.__G.G.P.x);
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i })) });
  await touch('touchStart', [[150, 250]]); for (let i = 1; i <= 6; i++) { await touch('touchMove', [[150 + i * 10, 250]]); await p.waitForTimeout(30); }
  await p.waitForTimeout(600); await shot('joystick'); await touch('touchEnd', []);
  const x1 = await ev(() => window.__G.G.P.x); console.log('джойстик: сдвиг', Math.round(x1 - x0)); if (x1 - x0 < 40) errs.push('джойстик не ведёт');
  // касание земли — идёт туда
  await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.P.x = 2900; G.P.y = 3600; G.mobs.forEach(m => { if (Math.hypot(m.x - 2900, m.y - 3600) < 900) { m.state = 'dead'; m.respawnAt = 1e12; } }); });
  await p.waitForTimeout(300);
  let [sx, sy] = await toScreen([3050, 3600]); await p.touchscreen.tap(sx, sy); await p.waitForTimeout(150); await shot('goal'); await p.waitForTimeout(1500);
  const gx = await ev(() => window.__G.G.P.x); console.log('по касанию земли дошёл до', Math.round(gx)); if (Math.abs(gx - 3050) > 30) errs.push('не дошёл по касанию');
  // тело с добычей: касание — подходит и открывает подсумок
  await ev(() => { const G = window.__G.G, P = G.P; G.corpses.push({ id: 99, x: P.x + 200, y: P.y + 40, name: 'Волк', lvl: 2, money: 37, items: [window.__G.makeItem('mage', 'chest', 2, 'good', () => 0.3)], t: 999, until: G.t + 999 }); });
  await p.waitForTimeout(200); [sx, sy] = await toScreen(await ev(() => { const c = window.__G.G.corpses.at(-1); return [c.x, c.y]; }));
  await p.touchscreen.tap(sx, sy); await p.waitForTimeout(1800);
  const loot = await ev(() => !!document.querySelector('.box.loot')); console.log('подсумок:', loot); if (!loot) errs.push('касание тела не открыло подсумок');
  await shot('loot'); await p.tap('.box.loot [data-x=all]'); await p.waitForTimeout(300);
  // жила: касание — подходит и копает
  await ev(() => { const G = window.__G.G; window.__G.G.hero.prof.mining = 10; G.hero.bag.push(window.__G.makePick()); const v = G.veins[0]; v.at = 0; G.P.x = v.x - 220; G.P.y = v.y + 30; G.P.lastCombat = -99; window.__v = v; });
  await p.waitForTimeout(400); [sx, sy] = await toScreen(await ev(() => [window.__v.x, window.__v.y - 20]));
  await p.touchscreen.tap(sx, sy); await p.waitForTimeout(1600); const mining = await ev(() => !!window.__G.G.P.mine); console.log('копает:', mining); if (!mining) errs.push('касание жилы не начало копать');
  await shot('mine'); await p.waitForTimeout(3500);
  // моб: касание — цель, автоатака, подходит
  await ev(() => { const G = window.__G.G, P = G.P; P.x = 2900; P.y = 3600; const m = G.mobs.find(m => m.kind === 'wolf'); m.state = 'idle'; m.hp = m.max = 60; m.respawnAt = 0; m.x = m.hx = P.x + 330; m.y = m.hy = P.y; m.aggroOff = 1; window.__m = m; });
  await p.waitForTimeout(300); [sx, sy] = await toScreen(await ev(() => [window.__m.x, window.__m.y - 14]));
  await p.touchscreen.tap(sx, sy); await p.waitForTimeout(400);
  const auto = await ev(() => window.__G.G.P.auto === window.__m); console.log('автоатака по касанию:', auto); if (!auto) errs.push('касание моба не включило автоатаку');
  await shot('fight'); let dead = false; for (let i = 0; i < 30 && !dead; i++) { await p.waitForTimeout(300); dead = await ev(() => window.__m.state === 'dead'); } if (!dead) errs.push('моб не убит');
  // кнопка действия у торговца
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(b => b.vendor); G.P.x = b.x + 20; G.P.y = b.y + 50; }); await p.waitForTimeout(400);
  const use = await ev(() => { const u = document.querySelector('#actUse'); return u.hidden ? '' : u.textContent; }); console.log('кнопка действия:', use); if (use !== 'Торговать') errs.push('нет кнопки «Торговать»');
  await shot('use'); await p.tap('#actUse'); await p.waitForTimeout(400); await shot('vendor');
  await p.tap('.box .xclose'); await p.waitForTimeout(200);
  // окно героя и лист вещи
  await p.tap('#btnBag'); await p.waitForTimeout(400); await shot('char');
  await p.tap('.stats .si[data-i="6"]'); await p.waitForTimeout(200); await shot('char-help');
  const cell = await p.$('.charwin .bag .cell:not(:empty)'); console.log('вещь в сумке:', !!cell); if (cell) { await cell.tap(); await p.waitForTimeout(300); await shot('sheet'); const sh = await ev(() => !!document.querySelector('.itemsheet')); if (!sh) errs.push('лист вещи не открылся'); }
  const closeAll = async () => { for (let i = 0; i < 4; i++) { const x = await p.$$('.modal .xclose'); if (!x.length) break; await x[x.length - 1].tap(); await p.waitForTimeout(150); } }; await closeAll();
  // карта, меню, сведение пальцев
  await p.tap('#btnMap'); await p.waitForTimeout(400); await shot('map'); await closeAll();
  await p.tap('#btnMenu'); await p.waitForTimeout(300); await shot('menu'); await closeAll();
  const z0 = await ev(() => window.__G.R().uz);
  await touch('touchStart', [[300, 200], [500, 200]]); for (let i = 1; i <= 6; i++) { await touch('touchMove', [[300 - i * 15, 200], [500 + i * 15, 200]]); await p.waitForTimeout(30); } await touch('touchEnd', []);
  const z1 = await ev(() => window.__G.R().uz); console.log('пальцы: приближение', z0, '→', z1); if (!(z1 > z0)) errs.push('сведение пальцев не приближает');
  // вертикально
  await p.setViewportSize({ width: 390, height: 844 }); await shot('portrait'); await p.setViewportSize({ width: 844, height: 390 });
  console.log(errs.length ? errs : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
