// Версия 56: анимации героя и мобов в 4 стороны, частота кадров, время скрытой вкладки.
// Запуск: NODE_PATH=$(npm root -g) node tests/browser/v56.cjs
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(400);
  for (const [c, n] of [['warrior', 'Торвальд'], ['mage', 'Мирна'], ['archer', 'Ясь']]) { await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click(`.clsCard[data-c=${c}]`); await p.fill('#newName', n); await p.click('[data-x=ok]'); await p.waitForTimeout(100); }
  const ev = (f, a) => p.evaluate(f, a);
  const clip = { x: 570, y: 280, width: 300, height: 260 };
  for (const slot of [1, 2, 3]) {
    await p.click(`.slot:nth-child(${slot})`); await p.click('#selEnter'); await p.waitForTimeout(900);
    await ev(() => { const G = window.__G.G; G.P.x = 3300; G.P.y = 2950; });
    for (const [k, n] of [['KeyS', 'down'], ['KeyD', 'right'], ['KeyW', 'up'], ['KeyA', 'left']]) {
      await p.keyboard.down(k); await p.waitForTimeout(450); await p.screenshot({ path: `${OUT}/v56-hero${slot}-${n}.png`, clip }); await p.keyboard.up(k);
    }
    // удар: поставить лису рядом
    await ev(() => { const G = window.__G.G; const m = G.mobs.find(m => m.kind === 'boar'); G.P.x = m.x - 50; G.P.y = m.y; G.P.target = m; G.st.maxHp = 9999; G.P.hp = 9999; });
    await p.keyboard.down('Space'); await p.waitForTimeout(160); await p.screenshot({ path: `${OUT}/v56-hero${slot}-atk.png`, clip }); await p.waitForTimeout(1200); await p.keyboard.up('Space');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.click('[data-x=exit]'); await p.waitForTimeout(400);
  }
  // мобы: собрать всех видов вокруг, пусть гонятся
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await ev(() => { const G = window.__G.G; G.st.maxHp = 99999; G.P.hp = 99999; G.P.x = 4000; G.P.y = 2000; const kinds = ['wolf', 'fox', 'boar', 'spider', 'bandit', 'bandit_archer', 'ataman']; kinds.forEach((k, i) => { const m = G.mobs.find(m => m.kind === k && m.state !== 'dead'); const a = i / kinds.length * 6.28; m.x = 4000 + Math.cos(a) * 230; m.y = 2000 + Math.sin(a) * 160; m.hx = m.x; m.hy = m.y; m.state = 'chase'; }); });
  await p.waitForTimeout(600); await p.screenshot({ path: OUT + '/v56-mobs-chase.png' });
  await p.waitForTimeout(900); await p.screenshot({ path: OUT + '/v56-mobs-fight.png' });
  // частота кадров в бою
  const fps = await ev(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); }));
  console.log('кадров в секунду в бою:', fps); if (fps < 30) errs.push('мало кадров: ' + fps);
  // смерть моба — падает
  await ev(() => { const G = window.__G.G; G.mobs.filter(m => m.state === 'chase').forEach(m => { m.hp = 1; }); });
  await p.keyboard.down('Space'); await p.waitForTimeout(1500); await p.keyboard.up('Space'); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/v56-corpses.png' });
  // скрытая вкладка: 10 минут
  const t0 = await ev(() => window.__G.G.t);
  await ev(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('visibilitychange')); });
  await ev(() => { const real = Date.now; Date.now = () => real() + 600000; Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); window.dispatchEvent(new Event('visibilitychange')); Date.now = real; });
  const t1 = await ev(() => window.__G.G.t);
  console.log('время мира за скрытую вкладку:', Math.round(t1 - t0), 'с'); if (t1 - t0 < 590) errs.push('вкладка: время не засчитано');
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
