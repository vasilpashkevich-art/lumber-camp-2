// Версия 72: банк в Столице — дом банкира, окно банка (личный 64, общий сундук 32), щелчок и перетаскивание, сохранение, второй герой; телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async n => { await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v72-${n}.png` }); };
  const mk = async (name, cls) => { await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click(`.clsCard[data-c=${cls}]`); await p.fill('#newName', name); await p.click('[data-x=ok]'); await p.waitForTimeout(150); };
  await p.goto(URL); await p.waitForTimeout(300);
  await mk('Вкладчик', 'warrior');
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  // герой у банка, рядом стражник и дом — масштаб
  await ev(() => { const M = window.__G, G = M.G, b = G.W.houses.find(h => h.bank); G.P.x = b.x - 40; G.P.y = b.y + 60; const h = G.hero; for (let i = 0; i < 4; i++) { const it = M.makeItem('warrior', ['head', 'chest', 'legs', 'weapon'][i], 4, i % 2 ? 'good' : 'common', () => 0.2 + i * 0.2); it.pos = 10 + i; h.bag.push(it); } M.addStack(h, M.makeStack('ore', 'copper', 26)); });
  await shot('building');
  await p.keyboard.press('KeyE'); await p.waitForTimeout(500);
  console.log('окно банка:', await ev(() => !!document.querySelector('.bankbox')), 'ячеек:', await ev(() => document.querySelectorAll('.bankgrid .cell').length));
  await shot('window');
  // щелчок по вещи в сумке — в банк; «Сложить руду»
  await p.click('.bagg .cell:nth-child(11)'); await p.click('.mats'); await p.waitForTimeout(200);
  console.log('в банке:', await ev(() => window.__G.G.hero.bank.map(i => i.name + (i.n > 1 ? '×' + i.n : ''))));
  // перетаскивание из сумки в ячейку банка 20
  await p.dragAndDrop('.bagg .cell:nth-child(12)', '.bankgrid .cell:nth-child(20)'); await p.waitForTimeout(200);
  console.log('после перетаскивания ячейки банка:', await ev(() => window.__G.G.hero.bank.map(i => i.pos)));
  // общий сундук
  await p.click('.tab[data-t=shared]'); await p.click('.bagg .cell:nth-child(13)'); await p.waitForTimeout(200);
  console.log('общий сундук:', await ev(() => window.__G.G.shared.items.map(i => i.name)));
  await shot('shared');
  await p.keyboard.press('KeyE'); await p.waitForTimeout(300);
  console.log('окно закрыто по E:', await ev(() => !document.querySelector('.bankbox')));
  // выход к выбору, второй герой видит общий сундук
  await ev(() => window.__G.toSelect()); await p.waitForTimeout(400);
  await mk('Второй', 'mage'); await p.click('.slot:nth-child(2)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const s2 = await ev(() => ({ shared: window.__G.G.shared.items.map(i => i.name), bank: window.__G.G.hero.bank.length })); console.log('второй герой: сундук', s2.shared, 'свой банк', s2.bank);
  if (!s2.shared.length || s2.bank !== 0) errs.push('общий сундук не виден второму герою или банк не свой');
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.bank); G.P.x = b.x; G.P.y = b.y + 50; }); await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(400); await p.click('.tab[data-t=shared]'); await p.waitForTimeout(200); await shot('second');
  await p.keyboard.press('Escape');
  // первый герой: банк сохранился после перезагрузки
  await ev(() => window.__G.toSelect()); await p.reload(); await p.waitForTimeout(400); await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  console.log('после перезагрузки банк первого:', await ev(() => window.__G.G.hero.bank.length));
  // телефон
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const q = await ctx.newPage();
  q.on('pageerror', e => errs.push('телефон: ' + e.message));
  await q.goto(URL); await q.waitForTimeout(400); await q.tap('#selNew'); await q.waitForTimeout(150); await q.tap('.clsCard[data-c=archer]'); await q.fill('#newName', 'Палец'); await q.tap('[data-x=ok]'); await q.waitForTimeout(150);
  await q.tap('.slot:nth-child(1)'); await q.tap('#selEnter'); await q.waitForTimeout(1000);
  await q.evaluate(() => { const M = window.__G, G = M.G, b = G.W.houses.find(h => h.bank); G.P.x = b.x; G.P.y = b.y + 50; const it = M.makeItem('archer', 'head', 4, 'good', () => 0.4); it.pos = 3; G.hero.bag.push(it); });
  await q.waitForTimeout(500); console.log('кнопка действия:', await q.evaluate(() => document.querySelector('#actUse') && document.querySelector('#actUse').textContent));
  await q.tap('#actUse'); await q.waitForTimeout(500); await q.screenshot({ path: `${OUT}/v72-phone.png` });
  await q.tap('.bagg .cell:nth-child(4)'); await q.waitForTimeout(300); await q.screenshot({ path: `${OUT}/v72-phone-sheet.png` });
  await q.tap('.itemsheet [data-i="0"]'); await q.waitForTimeout(300);
  console.log('телефон — в банке:', await q.evaluate(() => window.__G.G.hero.bank.length));
  await q.screenshot({ path: `${OUT}/v72-phone-after.png` });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
})();
