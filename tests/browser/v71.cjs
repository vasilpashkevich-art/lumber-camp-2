// Версия 71: Грибной лес с рельефом — ярусы, откосы, каменные холмы и овраг, склоны, великаны и кроны, заслон, кадры в секунду.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
const ONLY = process.argv[2];
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Лесник'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a);
  const shot = async n => { await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/v71-${n}.png` }); };
  await ev(() => { const G = window.__G.G; G.hero.lvl = 12; G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x - 80; G.P.y = e.y; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  console.log('зона:', await ev(() => window.__G.G.hero.zone));
  const calm = () => ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); });
  const go = async (n, x, y, zoom) => { await calm(); await ev(([x, y, z]) => { const M = window.__G, G = M.G; G.P.x = x; G.P.y = y; if (z) { M.R().uz = z; M.R().resize(); } }, [x, y, zoom || 0]); if (!ONLY || n.includes(ONLY)) await shot(n); };
  const SP = [
    ['arrive', 559, 3250], ['valley', 2600, 3500], ['lowland-edge', 2500, 4250], ['marsh', 3500, 5100], ['iron-hill', 8450, 1450], ['iron-top', 8150, 900],
    ['spider-hill', 6640, 1500], ['spider-top', 6650, 1000], ['ravine-in', 6950, 3950], ['ravine', 7650, 4600], ['snake-dip', 8700, 5450], ['giant-oak', 1150, 4260], ['giant-pine', 2310, 2140],
    ['behind-hill', 8500, 520], ['hump', 1500, 2150],
  ];
  for (const [n, x, y] of SP) await go(n, x, y, 1.25);
  await go('giant-close', 1150, 4180, 2);
  // заслон: герой у северного края холма (за холмом) и в овраге у южной стены; волк рядом
  const edgeN = await ev(() => { const R = window.__G.G.W.relief; let y = 300; while (R.levelAt(8550, y) !== 1 && y < 1500) y += 2; return y; });
  await go('occl-hill', 8550, edgeN - 14, 2);
  await ev(([y]) => { const G = window.__G.G, m = G.mobs.find(m => m.kind === 'weaver'); m.x = 8610; m.y = y - 30; m.stun = 99; m.state = 'idle'; }, [edgeN]);
  await go('occl-hill2', 8550, edgeN - 40, 2); await go('far', 8450, 1400, 0.8);
  await ev(() => { const M = window.__G; M.R().uz = 1.25; M.R().resize(); });
  await p.keyboard.press('KeyK'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v71-map.png' }); await p.keyboard.press('KeyK'); await p.waitForTimeout(200);
  for (const [n, x, y] of [['низина', 3500, 5100], ['холм', 8450, 1300], ['великан', 1150, 4250]]) {
    await go('fps', x, y); await p.waitForTimeout(500);
    const fps = await ev(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); }));
    console.log('кадров в секунду,', n + ':', fps); if (fps < 30) errs.push('мало кадров ' + n + ' ' + fps);
  }
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
})();
