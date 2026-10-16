// Версия 109: зачарование без зависаний — аксессуар в сумке не ломает окно чар (раньше игра вставала), рецепты видны,
// режим распыления в окне героя (кнопка со значком, подсветка, щелчок — распылить), перенос вещей в сумке снова работает,
// на телефоне — «Распылить» со значком в листе вещи. Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v109p' : 'v109';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Чародей'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await ev(() => { const G = window.__G.G, H = G.hero; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); window.__G.addStack(H, window.__G.makeStack('bar', 'copper', 12)); let k = 2;
    for (const [s, l, r] of [['chest', 5, 'good'], ['legs', 6, 'good'], ['head', 12, 'rare'], ['weapon', 9, 'good'], ['legs', 4, 'common']]) { const it = window.__G.makeItem('warrior', s, l, r, Math.random); it.pos = k++; H.bag.push(it); }
    const t = window.__G.makeTrinket('warrior', 10, 'rare'); t.pos = k++; H.bag.push(t); window.__G.refresh(); });
  const moved = async () => { const a = await ev(() => window.__G.G.P.x); await ev(() => { window.__G.G.P.goal = null; }); if (phone) { await ev(() => { const G = window.__G.G; G.P.goal = { x: G.P.x + 200, y: G.P.y }; }); await p.waitForTimeout(500); } else { await p.keyboard.down('KeyD'); await p.waitForTimeout(400); await p.keyboard.up('KeyD'); } return Math.round(await ev(() => window.__G.G.P.x) - a); };
  const go = () => ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.enchant); G.P.x = b.x + 10; G.P.y = b.y + 70; });
  const useE = async () => { if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(500); };
  await go(); await p.waitForTimeout(300); await useE();
  await ev(() => document.querySelector('.profwin .learn .btn').click()); await p.waitForTimeout(150); await ev(() => document.querySelectorAll('.profwin .learn .btn')[1].click()); await p.waitForTimeout(300);
  console.log('рецептов в окне:', await ev(() => document.querySelectorAll('.profwin .recipes .ware2').length), 'кнопок «Наложить»:', await ev(() => [...document.querySelectorAll('.profwin .recipes .btn')].length));
  await shot('prof');
  for (let i = 0; i < 4; i++) { await ev(() => document.querySelector('.modal .box').close()); await p.waitForTimeout(200); await go(); await p.waitForTimeout(200); await useE(); }
  await ev(() => document.querySelector('.modal .box').close()); await p.waitForTimeout(300);
  console.log('после 5 открытий: окон', await ev(() => document.querySelectorAll('.modal').length), 'герой идёт:', await moved());
  // окно героя
  if (phone) await ev(() => document.querySelector('#btnBag').click()); else await p.keyboard.press('KeyI'); await p.waitForTimeout(500);
  if (!phone) {
    // перенос вещи мышью
    const before = await ev(() => window.__G.G.hero.bag.find(i => i.pos === 2).id);
    await p.dragAndDrop('.bag .cell:nth-child(3)', '.bag .cell:nth-child(20)'); await p.waitForTimeout(300);
    console.log('перенос в сумке работает:', await ev(id => window.__G.G.hero.bag.find(i => i.id === id).pos, before) === 19);
    await p.click('.demode'); await p.waitForTimeout(300); await shot('demode');
    console.log('подсвечено к распылению:', await ev(() => document.querySelectorAll('.bag .cell.decan').length));
    const n0 = await ev(() => window.__G.G.hero.bag.length); await p.click('.bag .cell.decan'); await p.waitForTimeout(300);
    console.log('распылено щелчком:', await ev(() => [...document.querySelectorAll('.toast')].some(t => t.textContent.startsWith('Распылено'))));
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); console.log('Esc вышел из режима, окно открыто:', await ev(() => !document.querySelector('.bag.deon') && !!document.querySelector('.charwin')));
  } else {
    await ev(() => { const c = [...document.querySelectorAll('.bag .cell')].find(c => c.querySelector('img,svg')); }); 
    await p.click('.bag .cell:nth-child(3)'); await p.waitForTimeout(400); await shot('sheet');
    console.log('кнопка «Распылить» со значком:', await ev(() => !![...document.querySelectorAll('.itemsheet .btn')].find(b => b.textContent.includes('Распылить') && b.querySelector('.deico'))));
  }
  if (errs.length) console.log('ОШИБКИ', errs.slice(0, 5)); else console.log('ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
