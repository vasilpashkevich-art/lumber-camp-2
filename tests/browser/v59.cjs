// Версия 59: свойства вещей, подсказка со сравнением, стрелка «лучше», старое сохранение.
// Запуск: NODE_PATH=$(npm root -g) node tests/browser/v59.cjs
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 7).join(' '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  // старое сохранение (v1): вещи с «силой удара», без главного параметра
  await p.goto(URL); await p.waitForTimeout(300);
  await p.evaluate(() => {
    const old = { v: 1, id: 'old1', name: 'Старожил', cls: 'warrior', lvl: 6, xp: 0, gold: 500, potions: 2, zone: 'pine', dead: {}, worldT: 0, stats: {},
      eq: { head: null, chest: { id: 'c1', cls: 'warrior', slot: 'chest', ilvl: 6, rar: 'rare', tier: 3, armor: 30, stam: 10, pow: 4, name: 'Латы' }, legs: { id: 'l1', cls: 'warrior', slot: 'legs', ilvl: 5, rar: 'common', tier: 1, armor: 15, stam: 5, name: 'Кожаные штаны' }, weapon: { id: 'w1', cls: 'warrior', slot: 'weapon', ilvl: 6, rar: 'good', tier: 2, wt: 2, dmg: 14, stam: 4, name: 'Секира' } },
      bag: [{ id: 'b1', cls: 'warrior', slot: 'head', ilvl: 4, rar: 'common', tier: 1, armor: 8, stam: 3, pos: 0, name: 'Кожаная шапка' }] };
    localStorage.setItem('lumber-camp2-hero-old1', JSON.stringify(old));
    localStorage.setItem('lumber-camp2-heroes', JSON.stringify([{ id: 'old1', name: 'Старожил', cls: 'warrior', lvl: 6, zone: 'pine', play: 0, seen: Date.now(), eq: { head: null, chest: { tier: 3, rar: 'rare' }, legs: { tier: 1, rar: 'common' }, weapon: { tier: 2, wt: 2, rar: 'good' } } }]));
  });
  await p.reload(); await p.waitForTimeout(500);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const mig = await p.evaluate(() => { const h = window.__G.G.hero; return { v: h.v, chest: h.eq.chest.name, main: h.eq.chest.main, props: h.eq.chest.props, pow: h.eq.chest.pow, bag: h.bag.map(i => i.name + ':' + i.pos) }; });
  console.log('старое сохранение:', JSON.stringify(mig));
  if (mig.v !== 2 || !mig.main || mig.pow || Object.keys(mig.props || {}).length !== 2) errs.push('пересчёт старых вещей не сработал');
  // в сумку: вещи разных цветов и одна чужая
  await p.evaluate(() => { const { G, makeItem } = window.__G; const h = G.hero; h.bag = [];
    const put = (it, pos) => { it.pos = pos; h.bag.push(it); };
    put(makeItem('warrior', 'chest', 7, 'rare'), 0); put(makeItem('warrior', 'weapon', 7, 'good'), 1); put(makeItem('warrior', 'head', 6, 'common'), 2);
    put(makeItem('warrior', 'legs', 3, 'common'), 3); put(makeItem('mage', 'chest', 7, 'rare'), 4); put(makeItem('warrior', 'weapon', 11, 'rare'), 5); });
  await p.keyboard.press('KeyI'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/v59-char.png' });
  const marks = await p.$$eval('.bag .cell .upmark', a => a.length); console.log('стрелок «лучше»:', marks);
  for (const [n, i] of [['rare-chest', 0], ['good-weapon', 1], ['weak-legs', 3], ['mage-item', 4]]) {
    await (await p.$$('.bag .cell'))[i].hover(); await p.waitForTimeout(250); await p.screenshot({ path: `${OUT}/v59-tip-${n}.png` });
  }
  const tipTxt = await p.$eval('.tip', e => e.innerText); if (!/Не для вашего класса/.test(tipTxt)) errs.push('нет пометки чужого класса');
  await (await p.$$('.bag .cell'))[0].hover(); await p.waitForTimeout(200);
  const t2 = await p.$eval('.tip', e => e.innerText); console.log(t2.replace(/\n+/g, ' | '));
  if (!/Если надеть/.test(t2) || !/Урон в секунду/.test(t2) || !/Сейчас надето/.test(t2)) errs.push('нет сравнения в подсказке');
  // надеть и проверить, что параметры видны в окне
  await (await p.$$('.bag .cell'))[0].click(); await p.waitForTimeout(250);
  await p.screenshot({ path: OUT + '/v59-char-after.png' });
  const st = await p.$eval('.stats', e => e.innerText); console.log('характеристики:', st.replace(/\n+/g, ' | '));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
