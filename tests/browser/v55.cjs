// Версия 55 в браузере (только компьютер): умения по уровням, окно умений, B/I открывают и закрывают сумку,
// перетаскивание вещей, лица в шлемах на портрете, сидение, рывок, сеть, лёд.
// Запуск: NODE_PATH=$(npm root -g) node tests/browser/v55.cjs
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
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(1000);
  const ev = (f, a) => p.evaluate(f, a);
  // панель действий: замок на V
  await p.screenshot({ path: OUT + '/v55-bar-locked.png', clip: { x: 520, y: 760, width: 400, height: 100 } });
  // окно умений по щелчку на портрет
  await p.click('#pfRing'); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/v55-abils.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  // B открывает и закрывает
  await p.keyboard.press('KeyB'); await p.waitForTimeout(250); const o1 = await ev(() => !!document.querySelector('.box.wide'));
  await p.keyboard.press('KeyB'); await p.waitForTimeout(250); const o2 = await ev(() => !!document.querySelector('.box.wide'));
  await p.keyboard.press('KeyI'); await p.waitForTimeout(250); const o3 = await ev(() => !!document.querySelector('.box.wide'));
  await p.keyboard.press('KeyI'); await p.waitForTimeout(250); const o4 = await ev(() => !!document.querySelector('.box.wide'));
  console.log('B/I: открыто', o1, 'закрыто', !o2, 'открыто', o3, 'закрыто', !o4); if (!(o1 && !o2 && o3 && !o4)) errs.push('B/I не открывают-закрывают');
  // перетаскивание: дать вещи и перетащить из ячейки 0 в 13
  await ev(() => { const G = window.__G.G; for (let i = 0; i < 3; i++) { const it = window.__G.makeItem('warrior', ['head', 'legs', 'chest'][i], 3, 'common', Math.random); it.pos = i; G.hero.bag.push(it); } });
  await p.keyboard.press('KeyI'); await p.waitForTimeout(250);
  await p.dragAndDrop('.bag .cell:nth-child(1)', '.bag .cell:nth-child(14)'); await p.waitForTimeout(200);
  await p.dragAndDrop('.bag .cell:nth-child(2)', '.eq .cell:nth-child(3)'); await p.waitForTimeout(200);
  const bag = await ev(() => window.__G.G.hero.bag.map(i => `${i.name}@${i.pos}`).join(', '));
  console.log('сумка после перетаскивания:', bag, '| штаны надеты:', await ev(() => window.__G.G.hero.eq.legs.name));
  await p.screenshot({ path: OUT + '/v55-bag-drag.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  // шлемы на портрете у всех классов и ярусов
  const shots = [];
  for (const cls of ['warrior', 'mage', 'archer']) for (const tier of [1, 3, 4]) {
    const png = await ev(([cls, tier]) => { const G = window.__G.G; G.hero.cls = cls; const it = window.__G.makeItem(cls, 'head', tier * 15, tier >= 4 ? 'epic' : ['common', 'common', 'good', 'good'][tier], Math.random); it.tier = tier; G.hero.eq.head = it;
      const ch = window.__G.makeItem(cls, 'chest', 5, 'good', Math.random); ch.tier = tier; G.hero.eq.chest = ch; return null; }, [cls, tier]);
    await p.waitForTimeout(120); await p.screenshot({ path: `${OUT}/v55-pf-${cls}-${tier}.png`, clip: { x: 8, y: 8, width: 86, height: 86 } });
  }
  await ev(() => { const G = window.__G.G; G.hero.cls = 'warrior'; G.hero.eq.head = null; });
  // сидение
  await ev(() => { const G = window.__G.G; G.P.x = 3300; G.P.y = 2950; G.P.hp = 30; G.P.lastCombat = -99; });
  await p.waitForTimeout(300); await p.keyboard.press('KeyX'); await p.waitForTimeout(600);
  console.log('сидит:', await ev(() => window.__G.G.P.sit));
  await p.screenshot({ path: OUT + '/v55-sit.png', clip: { x: 570, y: 300, width: 300, height: 260 } });
  // рывок к кабану
  await ev(() => { const G = window.__G.G; G.hero.lvl = 5; G.st.maxHp = 9999; G.P.hp = 9999; const m = G.mobs.find(m => m.kind === 'boar'); G.P.x = m.x - 230; G.P.y = m.y; G.P.target = m; G.P.sit = false; });
  await p.keyboard.press('KeyC'); await p.waitForTimeout(160); await p.screenshot({ path: OUT + '/v55-charge-mid.png', clip: { x: 420, y: 230, width: 600, height: 400 } });
  await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v55-charge-stun.png', clip: { x: 420, y: 230, width: 600, height: 400 } });
  await p.screenshot({ path: OUT + '/v55-bar-open.png', clip: { x: 520, y: 760, width: 400, height: 100 } });
  // лучник: сеть; маг: лёд
  for (const [cls, key, kind] of [['archer', 'KeyV', 'wolf'], ['mage', 'KeyV', 'spider'], ['mage', 'KeyC', 'spider']]) {
    await ev(([cls, kind]) => { const G = window.__G.G; G.hero.cls = cls; G.hero.eq.weapon = window.__G.makeItem(cls, 'weapon', 5, 'common', Math.random); G.st = G.st; G.P.acd = {}; const m = G.mobs.find(m => m.kind === kind && m.state !== 'dead'); G.P.x = m.x - 260; G.P.y = m.y; G.P.target = m; }, [cls, kind]);
    await p.waitForTimeout(250); await p.keyboard.press(key); await p.waitForTimeout(700);
    await p.screenshot({ path: `${OUT}/v55-${cls}-${key}.png`, clip: { x: 420, y: 230, width: 600, height: 400 } });
  }
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
