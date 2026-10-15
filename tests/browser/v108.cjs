// Версия 108: камень возвращения — кнопка сбоку и H, полоска переноса, дом в Столице, постоялый двор Хутора («Остановиться здесь»),
// перенос из Соснового дола в Хутор (смена зоны), перезарядка на кнопке, подсказка камня. Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v108p' : 'v108';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Домосед'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const quiet = () => ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  await quiet();
  console.log('сумка пуста (камень не занимает места):', await ev(() => window.__G.G.hero.bag.length === 0));
  // уйти в Хутор и остановиться на постоялом дворе
  await ev(() => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y; }); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(1500); await quiet();
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.bind); G.P.x = b.x; G.P.y = b.y + 80; }); await p.waitForTimeout(500);
  if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(500); await shot('inn');
  await ev(() => document.querySelector('[data-x=bind]').click()); await p.waitForTimeout(300);
  console.log('дом:', await ev(() => JSON.stringify(window.__G.G.hero.home)));
  // назад в Сосновый дол, далеко от дома
  await ev(() => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === 'pine'); G.P.x = e.x; G.P.y = e.y; }); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(1500); await quiet();
  // подсказка камня в сумке (компьютер)
  if (!phone) { await p.hover('#btnHearth'); console.log('подсказка кнопки:', await ev(() => document.querySelector('#btnHearth').title)); }
  // перенос
  if (phone) await p.click('#btnHearth'); else await p.keyboard.press('KeyH'); await p.waitForTimeout(4000); await shot('cast', 0);
  console.log('идёт перенос:', await ev(() => !!window.__G.G.P.hearth));
  await p.waitForTimeout(7500);
  console.log('зона после переноса:', await ev(() => window.__G.G.W.Z.id), await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.bind); return Math.round(Math.hypot(G.P.x - b.x, G.P.y - b.y)); }));
  await shot('home', 600);
  console.log('перезарядка на кнопке:', await ev(() => document.querySelector('#btnHearth .hcd').textContent));
  if (errs.length) console.log('ОШИБКИ', errs.slice(0, 5)); else console.log('ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
