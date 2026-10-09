// Проверка в браузере: экран выбора, создание героя, вход в мир, бой, окна. Снимки — в tests/browser/out/.
// Запуск: NODE_PATH=$(npm root -g) node tests/browser/smoke.cjs
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + '/1-select-empty.png' });
  // создать героя
  await p.click('#selNew'); await p.waitForTimeout(300);
  await p.click('.clsCard[data-c=archer]'); await p.fill('#newName', 'Ясь'); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/2-create.png' });
  await p.click('[data-x=ok]'); await p.waitForTimeout(300);
  await p.click('#selNew'); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Торвальд'); await p.click('[data-x=ok]');
  await p.click('#selNew'); await p.click('.clsCard[data-c=mage]'); await p.fill('#newName', 'Мирна'); await p.click('[data-x=ok]');
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/3-select.png' });
  // войти воином
  await p.click('.slot:nth-child(2)'); await p.click('#selEnter'); await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + '/4-city.png' });
  // выйти за ворота на восток и найти лис
  const G = () => p.evaluate(() => { const G = window.__G.G; return { x: G.P.x, y: G.P.y, hp: G.P.hp, lvl: G.hero.lvl, xp: G.hero.xp, gold: G.hero.gold, kills: G.hero.stats.kills }; });
  await p.evaluate(() => { const G = window.__G.G; G.P.x = 3700; G.P.y = 3000; });
  await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + '/5-field.png' });
  // бой: держать пробел у ближайших лис
  await p.evaluate(() => { const G = window.__G.G; const m = G.mobs.find(m => m.kind === 'fox'); G.P.x = m.x - 40; G.P.y = m.y; });
  await p.keyboard.down('Space'); await p.waitForTimeout(3500); await p.screenshot({ path: OUT + '/6-fight.png' }); await p.waitForTimeout(3000); await p.keyboard.up('Space');
  console.log('после боя', await G());
  // все виды мобов рядом для снимка
  await p.evaluate(() => { const G = window.__G.G; const kinds = ['wolf', 'boar', 'spider', 'bandit', 'bandit_archer', 'ataman', 'fox']; G.P.x = 4000; G.P.y = 2000; let i = 0; for (const k of kinds) { const m = G.mobs.find(m => m.kind === k && m.state !== 'dead'); if (m) { m.x = m.hx = 3700 + i * 100; m.y = m.hy = 1980 + (i % 2) * 50; m.state = 'idle'; i++; } } });
  await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/7-mobs.png' });
  // окно персонажа с добычей
  await p.evaluate(() => { const G = window.__G.G; G.mobs.forEach(m => m.state = 'dead'); });
  await p.evaluate(() => { const G = window.__G.G; G.hero.gold = 120; const mk = G.W.houses.find(b => b.vendor); G.P.x = mk.x; G.P.y = mk.y + 50; });
  await p.keyboard.press('KeyI'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/8-char.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await p.keyboard.press('KeyE'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/9-vendor.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // гибель
  await p.evaluate(() => { const G = window.__G.G; G.P.x = 3000; G.P.y = 3300; G.P.hp = 1; G.mobs.forEach(m => { if (m.state === 'dead') { m.state = 'idle'; m.hp = m.max; } }); const m = G.mobs.find(m => m.kind === 'wolf'); m.x = m.hx = 3020; m.y = m.hy = 3300; m.state = 'chase'; m.cd = 0; });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: OUT + '/10-death.png' });
  await p.click('.box.death [data-x=ok]'); await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + '/11-graveyard.png' });
  // выход к выбору и обратно — сохранение
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.click('[data-x=exit]'); await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/12-select-after.png' });
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('lumber-camp2-heroes')));
  console.log('героев сохранено:', saved.length, saved.map(h => `${h.name} ${h.lvl} ${h.gold}`).join(', '));
  // телефон
  const m = await b.newPage({ viewport: { width: 400, height: 820 }, isMobile: true, hasTouch: true });
  m.on('pageerror', e => errs.push('mobile: ' + e.message));
  await m.goto(URL); await m.waitForTimeout(500); await m.screenshot({ path: OUT + '/13-phone-select.png' });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
