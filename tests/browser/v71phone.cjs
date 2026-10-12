// Версия 71 на телефоне: Грибной лес с рельефом, касание вершины холма снизу — герой идёт в обход по склону; заслон, кадры.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/v71p-${n}.png` }); };
  const ev = (f, a) => p.evaluate(f, a);
  await p.goto(URL); await p.waitForTimeout(400);
  await p.tap('#selNew'); await p.waitForTimeout(150); await p.tap('.clsCard[data-c=archer]'); await p.fill('#newName', 'Склон'); await p.tap('[data-x=ok]'); await p.waitForTimeout(150);
  await p.tap('.slot:nth-child(1)'); await p.tap('#selEnter'); await p.waitForTimeout(1000);
  await ev(() => { const G = window.__G.G; G.hero.lvl = 12; G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x - 80; G.P.y = e.y; });
  await p.tap('#actUse'); await p.waitForTimeout(1500);
  console.log('зона:', await ev(() => window.__G.G.hero.zone));
  // под Паучьим холмом, к востоку от склона; касание вершины — путь через склон
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); G.P.x = 6900; G.P.y = 1330; const R = window.__G.R(); R.uz = 0.8; R.resize(); });
  await p.waitForTimeout(900); await shot('below');
  const toScreen = ([x, y]) => p.evaluate(([x, y]) => { const M = window.__G, R = M.R(), h = M.G.W.hAt(x, y); return [(x - R.cam.x) * R.cam.z / R.dpr + innerWidth / 2, (y - h - R.cam.y) * R.cam.z / R.dpr + innerHeight / 2]; }, [x, y]);
  const [sx, sy] = await toScreen([6720, 1060]); console.log('касание в', Math.round(sx), Math.round(sy));
  await p.touchscreen.tap(sx, sy); await p.waitForTimeout(300);
  const goal = await ev(() => { const g = window.__G.G.P.goal; return g && [g.k, Math.round(g.x), Math.round(g.y)]; }); console.log('цель касания:', goal);
  let t = 0, onTop = false, maxStuck = 0; let last = null;
  for (; t < 20; t += 0.5) { await p.waitForTimeout(500); const s = await ev(() => { const G = window.__G.G; return [G.P.x, G.P.y, G.W.relief.levelAt(G.P.x, G.P.y), !!G.P.goal]; }); if (last && Math.hypot(s[0] - last[0], s[1] - last[1]) < 1 && s[3]) maxStuck += 0.5; last = s; if (s[2] === 1 && !s[3]) { onTop = true; break; } if (t === 3) await shot('walking'); }
  console.log('на вершине:', onTop, 'за', t, 'с; стоял на месте', maxStuck, 'с');
  if (!onTop) errs.push('не дошёл до вершины холма');
  await shot('top');
  const fps = await ev(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); }));
  console.log('кадров в секунду (телефонный экран):', fps);
  // в низине у квакунов
  await ev(() => { const G = window.__G.G; G.P.x = 3500; G.P.y = 5000; }); await p.waitForTimeout(900); await shot('marsh');
  const mem = await ev(() => window.__G.spriteStats && window.__G.spriteStats()); console.log('готовые картинки:', mem);
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
})();
