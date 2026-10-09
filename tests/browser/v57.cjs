// Версия 57: переход в Хуторские угодья, вид зоны, карта, новые мобы, возврат, сохранение зоны.
// Запуск: NODE_PATH=$(npm root -g) node tests/browser/v57.cjs
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=mage]'); await p.fill('#newName', 'Мирна'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a);
  // к южной дороге и E
  await ev(() => { const G = window.__G.G; G.hero.lvl = 7; const e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y - 70; });
  await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v57-exit-pine.png' });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1200);
  const z = await ev(() => ({ zone: window.__G.G.hero.zone, name: window.__G.G.W.Z.name, x: Math.round(window.__G.G.P.x), y: Math.round(window.__G.G.P.y) }));
  console.log('после перехода:', z); if (z.zone !== 'farms') errs.push('переход не случился');
  await p.screenshot({ path: OUT + '/v57-arrive.png' });
  const spots = [['village', 3000, 1150], ['river', 2600, 2380], ['fields', 5000, 950], ['mill', 1450, 4250], ['burned', 6300, 3330], ['scare', 6500, 1650], ['pasture', 2000, 3400]];
  for (const [n, x, y] of spots) { await ev(([x, y]) => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.P.x = x; G.P.y = y; }, [x, y]); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/v57-${n}.png` }); }
  // Мельник в бою
  await ev(() => { const G = window.__G.G; const m = G.mobs.find(m => m.kind === 'miller'); G.P.x = m.x + 180; G.P.y = m.y + 60; m.state = 'chase'; });
  await p.waitForTimeout(6000); await p.screenshot({ path: OUT + '/v57-miller-fight.png' });
  await p.keyboard.press('KeyK'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v57-bigmap.png' }); await p.keyboard.press('KeyK');
  const fps = await ev(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); }));
  console.log('кадров в секунду:', fps); if (fps < 30) errs.push('мало кадров ' + fps);
  // выход и вход — герой остаётся во второй зоне
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.click('[data-x=exit]'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/v57-select.png' });
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const z2 = await ev(() => window.__G.G.hero.zone); console.log('после повторного входа зона:', z2); if (z2 !== 'farms') errs.push('зона не сохранилась');
  // обратно в Сосновый дол
  await ev(() => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === 'pine'); G.P.x = e.x; G.P.y = e.y + 80; });
  await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(900);
  const z3 = await ev(() => ({ zone: window.__G.G.hero.zone, x: Math.round(window.__G.G.P.x), y: Math.round(window.__G.G.P.y) })); console.log('назад:', z3); if (z3.zone !== 'pine') errs.push('назад не перешёл');
  await p.screenshot({ path: OUT + '/v57-back-pine.png' });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
