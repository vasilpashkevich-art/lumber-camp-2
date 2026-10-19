// v128: голубые знаки доски заказов — над доской, на мини-карте и большой карте
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(500);
  await p.click('#selNew'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Знак'); await p.click('[data-x=ok]'); await p.waitForTimeout(300); await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const G = window.__G.G, bd = G.W.boards[0]; G.P.x = bd.x + 120; G.P.y = bd.y + 80; }); await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/v128-excl.png` });
  await p.keyboard.press('KeyK'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v128-map.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // взять первый и выполнить — знак «?»
  await p.evaluate(() => { const G = window.__G.G, O = window.__G.orders, T = O.boardOf('pine')[0]; G.hero.prof.mining = 1; G.hero.prof.herbal = 1; O.oTake(G, T); O.oState(G.hero).act[T.key].n = T.need; if (T.k === 'gather') window.__G.addStack(G.hero, window.__G.makeStack(T.kind, T.metal, T.need)); }); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/v128-quest.png` });
  console.log('знак:', await p.evaluate(() => window.__G.orders.boardMark(window.__G.G.hero, 'pine')));
  console.log(errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет'); await b.close(); })();
