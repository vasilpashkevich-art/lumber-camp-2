// Версия 112: ремесло со временем — полоска над панелью (поверх окна), очередь «Все», прерывание шагом,
// режим распыления в окне героя (вещи в очереди), телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v112p' : 'v112';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 400) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=mage]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Мастер'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await ev(() => { const X = window.__G, G = X.G, H = G.hero; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; });
    H.prof = { mining: 60, enchant: 30, alchemy: 20 }; X.addStack(H, X.makeStack('ore', 'copper', 12)); H.lvl = 12;
    for (let i = 0; i < 4; i++) { const it = X.makeItem('mage', ['chest', 'legs', 'head', 'weapon'][i], 8, 'good'); it.pos = 5 + i; H.bag.push(it); }
    const r = { id: 'rodx', kind: 'tool', tool: 'rod', name: 'Медный жезл чародея', rar: 'common', price: 20, pos: 12 }; H.bag.push(r); });
  // кузница — плавильня
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.smelt); G.P.x = b.x; G.P.y = b.y + (b.col || 80) + 30; });
  await p.waitForTimeout(300); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(500);
  console.log('окно плавильни:', await ev(() => !!document.querySelector('.modal')));
  await ev(() => { const r = [...document.querySelectorAll('.ware2')].find(r => r.textContent.includes('Медный')); r.querySelector('[data-x=all]').click(); });
  await shot('smelt', 1600);
  console.log('полоска:', await ev(() => { const c = document.querySelector('#castBar'); return !c.hidden && c.innerText.replace(/\s+/g, ' '); }));
  await p.waitForTimeout(2000);
  console.log('слитков через ~3,6 с:', await ev(() => window.__G.G.hero.bag.filter(i => i.kind === 'bar').reduce((s, i) => s + i.n, 0)));
  await ev(() => document.querySelectorAll('.modal .box').forEach(b => b.close()));
  // шаг прерывает
  if (!phone) { await p.keyboard.down('KeyD'); await p.waitForTimeout(250); await p.keyboard.up('KeyD'); }
  else await ev(() => window.__G.G.P.craft && (window.__G.G.P.craft = null));
  await p.waitForTimeout(200); console.log('после шага идёт работа:', await ev(() => !!window.__G.G.P.craft));
  // окно героя — режим распыления, щёлкнуть две вещи
  await p.keyboard.press('KeyI'); await p.waitForTimeout(400);
  await ev(() => document.querySelector('.demode') && document.querySelector('.demode').click()); await p.waitForTimeout(200);
  for (let i = 0; i < 2; i++) { await ev(() => { const c = document.querySelector('.bag .cell.decan'); c && c.click(); }); await p.waitForTimeout(150); }
  await shot('de', 700);
  console.log('в очереди:', await ev(() => document.querySelectorAll('.bag .cell.deq').length), 'полоска:', await ev(() => { const c = document.querySelector('#castBar'); return c.hidden ? 'нет' : c.innerText.replace(/\s+/g, ' '); }));
  await p.waitForTimeout(4600);
  console.log('распылено, осталось зелёных:', await ev(() => window.__G.G.hero.bag.filter(i => i.rar === 'good').length));
  if (errs.length) console.log('ОШИБКИ', errs.slice(0, 5)); else console.log(tag, 'ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
