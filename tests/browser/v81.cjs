// Версия 81: на телефоне — перетаскивание вещи пальцем (сумка, снаряжение, банк, у торговца), вкладка «Выкуп» у торговца.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async n => { await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/v81-${n}.png` }); };
  let cdp = null;
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i })) });
  const fingerDrag = async (from, to) => { // палец: нажал, подождал, повёл, отпустил
    const a = await p.locator(from).boundingBox(), c = await p.locator(to).boundingBox(); const x0 = a.x + a.width / 2, y0 = a.y + a.height / 2, x1 = c.x + c.width / 2, y1 = c.y + c.height / 2;
    await touch('touchStart', [[x0, y0]]); await p.waitForTimeout(350);
    for (let i = 1; i <= 8; i++) { await touch('touchMove', [[x0 + (x1 - x0) * i / 8, y0 + (y1 - y0) * i / 8]]); await p.waitForTimeout(30); }
    await touch('touchEnd', []); await p.waitForTimeout(250);
  };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(100);
  await ev(() => { document.querySelector('#newName').value = 'Палец'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900); cdp = await ctx.newCDPSession(p);
  await ev(() => { const M = window.__G, G = M.G, h = G.hero; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); h.bag = []; const add = (it, pos) => { it.pos = pos; h.bag.push(it); }; add(M.makeItem('warrior', 'head', 6, 'good'), 0); add(M.makeItem('warrior', 'ring', 6, 'rare'), 1); add(M.makeItem('warrior', 'chest', 7, 'common'), 2); h.gold = 5000; });
  // сумка: вещь из ячейки 1 в ячейку 20 пальцем
  await p.click('#btnBag'); await p.waitForTimeout(400);
  await fingerDrag('.bag .cell:nth-child(1)', '.bag .cell:nth-child(20)');
  console.log('сумка после переноса:', await ev(() => window.__G.G.hero.bag.map(i => i.slot + ':' + i.pos).join(' ')));
  // на снаряжение: кольцо из ячейки 2 на гнездо кольца
  await fingerDrag('.bag .cell:nth-child(2)', '.eqR .cell:nth-child(2)');
  console.log('кольцо надето:', await ev(() => !!window.__G.G.hero.eq.ring)); await shot('char');
  // короткое касание — по-прежнему лист вещи
  await p.tap('.bag .cell:nth-child(20)'); await p.waitForTimeout(300); console.log('лист вещи по касанию:', await ev(() => !!document.querySelector('.sheet, .box.sheet, .item-sheet') || document.querySelectorAll('.modal').length > 1)); await shot('sheet');
  await ev(() => document.querySelectorAll('.modal').forEach(m => m.remove())); await p.waitForTimeout(200);
  // банк: из сумки в ячейку банка пальцем
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.bank); G.P.x = b.x - 40; G.P.y = b.y + 60; }); await p.waitForTimeout(300);
  await p.click('#actUse'); await p.waitForTimeout(500); console.log('банк открыт:', await ev(() => !!document.querySelector('.bankbox')));
  await fingerDrag('.bagg .cell:nth-child(20)', '.bankgrid .cell:nth-child(5)');
  console.log('в банке:', await ev(() => window.__G.G.hero.bank.map(i => i.slot + ':' + i.pos).join(' '))); await shot('bank');
  await ev(() => document.querySelectorAll('.modal').forEach(m => m.remove())); await p.waitForTimeout(200);
  // торговец: продать, перетащить в сумке, выкупить
  await ev(() => { const G = window.__G.G, mk = G.W.houses.find(h => h.vendor); G.P.x = mk.x; G.P.y = mk.y + 50; }); await p.waitForTimeout(300);
  await p.click('#actUse'); await p.waitForTimeout(500);
  await p.tap('.vend .bag .cell:nth-child(3)'); await p.waitForTimeout(300); await shot('vend-sheet');
  const sellBtn = p.locator('.modal .btn', { hasText: 'Продать' }).last(); await sellBtn.tap(); await p.waitForTimeout(300);
  console.log('после продажи: сумка', await ev(() => window.__G.G.hero.bag.length), 'выкуп', await ev(() => window.__G.G.hero.buyback.length), 'деньги', await ev(() => window.__G.G.hero.gold));
  await p.tap('.tab[data-t=back]'); await p.waitForTimeout(300); await shot('buyback');
  await p.tap('.back .ware'); await p.waitForTimeout(300); const bb = p.locator('.modal .btn', { hasText: 'Выкупить' }).last(); await bb.tap(); await p.waitForTimeout(300);
  console.log('после выкупа: сумка', await ev(() => window.__G.G.hero.bag.length), 'выкуп', await ev(() => window.__G.G.hero.buyback.length), 'деньги', await ev(() => window.__G.G.hero.gold));
  await p.tap('.tab[data-t=buy]'); await p.waitForTimeout(200);
  await fingerDrag('.vend .bag .cell:nth-child(1)', '.vend .bag .cell:nth-child(9)');
  console.log('у торговца перенос в сумке:', await ev(() => window.__G.G.hero.bag.map(i => i.slot + ':' + i.pos).join(' '))); await shot('vend');
  await b.close();
  if (errs.length) { console.log('ОШИБКИ:', errs.slice(0, 5)); process.exit(1); }
  console.log('v81: готово');
})();
