// v126: доска заказов, квартирмейстер, баран в мире; компьютер и телефон
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function run(phone) {
  const b = await chromium.launch(); const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); const n = phone ? 'phone' : 'pc', tap = s => phone ? p.tap(s) : p.click(s);
  await p.goto(URL); await p.waitForTimeout(500);
  await tap('#selNew'); await p.waitForTimeout(450); await tap('.clsCard[data-c=archer]'); await p.fill('#newName', 'Заказ'); await tap('[data-x=ok]'); await p.waitForTimeout(450); await tap('.slot:nth-child(1)'); await tap('#selEnter'); await p.waitForTimeout(1200);
  const ev = f => p.evaluate(f);
  // доска заказов в Столице
  await ev(() => { const G = window.__G.G, bd = G.W.boards[0]; G.P.x = bd.x + 20; G.P.y = bd.y + 60; G.hero.lvl = 5; G.hero.prof.mining = 1; window.__G.refresh(); }); await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/v126-${n}-board.png` });
  if (phone) await tap('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(500);
  console.log(n, 'окно доски:', await ev(() => !!document.querySelector('.boardwin')));
  await tap('.boardwin [data-take]'); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/v126-${n}-boardwin.png` });
  const taken = await ev(() => Object.keys(window.__G.G.hero.orders.act).length); console.log(n, 'взято:', taken);
  await ev(() => document.querySelector('.boardwin').close()); await p.waitForTimeout(200);
  // квартирмейстер
  await ev(() => { const G = window.__G.G, q = G.npcs.find(x => x.id === 'royal'); G.P.x = q.x + 10; G.P.y = q.y + 50; G.hero.tokens = 65; G.hero.lvl = 15; window.__G.refresh(); }); await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/v126-${n}-royal.png` });
  if (phone) await tap('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(600);
  console.log(n, 'окно лавки:', await ev(() => !!document.querySelector('.royalwin')));
  await p.screenshot({ path: `${OUT}/v126-${n}-royalwin.png` });
  await tap('.royalwin [data-buy=gems]'); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/v126-${n}-choose.png` });
  await tap('.choosewin [data-c=amethyst]'); await p.waitForTimeout(300);
  await tap('.royalwin [data-buy=ram_night]'); await p.waitForTimeout(400);
  console.log(n, 'куплено:', await ev(() => JSON.stringify([window.__G.G.hero.tokens, window.__G.G.hero.mounts, window.__G.G.hero.bag.map(i => i.name + (i.n ? '×' + i.n : ''))])));
  await ev(() => document.querySelector('.royalwin').close()); await p.waitForTimeout(200);
  // верхом на баране
  await ev(() => { const G = window.__G.G; G.P.x = 3000; G.P.y = 3600; }); await p.waitForTimeout(300);
  if (phone) await tap('#btnMount'); else await p.keyboard.press('KeyZ'); await p.waitForTimeout(2000);
  console.log(n, 'верхом:', await ev(() => window.__G.G.P.ride));
  if (!phone) { await p.keyboard.down('KeyD'); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/v126-${n}-ride.png` }); await p.keyboard.up('KeyD'); }
  else { await p.screenshot({ path: `${OUT}/v126-${n}-ride.png` }); }
  console.log(n, errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет'); await b.close();
}
(async () => { await run(false); await run(true); })().catch(e => { console.error(e.message); process.exit(1); });
