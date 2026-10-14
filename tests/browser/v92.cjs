// Версия 92: героические фиолетовые вещи (облик, эффекты в мире и в окне героя), гнёзда и камни (перенос, выбор, замена), телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const phone of [false, true]) {
    const tag = phone ? 'v92-phone' : 'v92';
    const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
    const p = await ctx.newPage(); p.setDefaultTimeout(8000);
    p.on('pageerror', e => errs.push(tag + ' ' + e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${phone ? 'mage' : 'warrior'}]`); await p.waitForTimeout(100);
    await ev(() => { document.querySelector('#newName').value = 'Герой'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
    await ev(cls => { const G = window.__G.G, M = window.__G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); G.hero.lvl = 16;
      for (const sl of ['weapon', 'head', 'chest', 'legs', 'neck']) { const it = M.makeItem(cls, sl, 16, 'epic', Math.random); G.hero.eq[sl] = it; }
      G.hero.bag.push(Object.assign(M.makeItem(cls, 'chest', 16, 'rare', Math.random), { pos: 0 }));
      M.addStack(G.hero, M.makeStack('gem', 'tigerseye', 3)); M.addStack(G.hero, M.makeStack('gem', 'emerald', 1)); M.refresh(); G.P.x += 300; }, phone ? 'mage' : 'warrior');
    console.log(tag, 'надето:', await ev(() => Object.values(window.__G.G.hero.eq).filter(Boolean).map(i => i.rar + ' ' + i.name).join('; ')));
    await shot('world', 900);
    if (!phone) {
      await p.keyboard.press('KeyI'); await shot('char', 700);
      // перенести тигровый глаз на синий нагрудник в сумке
      const gemCell = await ev(() => [...document.querySelectorAll('.bag .cell')].findIndex(c => c.innerHTML.includes('gem_tigerseye') || c.querySelector('svg')));
      await p.dragAndDrop(`.bag .cell:nth-child(${await ev(() => window.__G.G.hero.bag.find(i => i.metal === 'tigerseye').pos + 1)})`, '.bag .cell:nth-child(1)'); await p.waitForTimeout(300);
      console.log('вопрос:', await ev(() => (document.querySelector('.gemask') || {}).textContent || 'нет')); await shot('ask');
      await p.click('.gemask [data-x=yes]'); await p.waitForTimeout(300);
      console.log('вставлен:', await ev(() => window.__G.G.hero.bag.find(i => i.slot === 'chest').gem));
      // изумруд щелчком — выбор вещи
      await p.click(`.bag .cell:nth-child(${await ev(() => window.__G.G.hero.bag.find(i => i.metal === 'emerald').pos + 1)})`); await p.waitForTimeout(300); await shot('pick');
      console.log('выбор:', await ev(() => [...document.querySelectorAll('.gemask .tg b')].map(b => b.textContent).join(' | ')));
      await p.click('.gemask .tg:nth-child(1)'); await p.waitForTimeout(200); await p.click('.gemask [data-x=yes]'); await p.waitForTimeout(300);
      console.log('изумруд в:', await ev(() => { const h = window.__G.G.hero; return Object.values(h.eq).concat(h.bag).filter(i => i && i.gem === 'emerald').map(i => i.name).join(); }));
      // подсказка вещи с камнем
      await p.hover('.eqL .cell:nth-child(1)'); await shot('tip', 300);
      await p.keyboard.press('Escape');
    } else {
      await p.tap('#btnBag'); await p.waitForTimeout(600); await shot('char', 600);
      await p.tap(`.bag .cell:nth-child(${await ev(() => window.__G.G.hero.bag.find(i => i.metal === 'tigerseye').pos + 1)})`); await p.waitForTimeout(500);
      console.log('кнопки:', await ev(() => [...document.querySelectorAll('.itemsheet .btn')].map(b => b.textContent).join(', ')));
      await ev(() => [...document.querySelectorAll('.itemsheet .btn')].find(b => /Вставить/.test(b.textContent)).click()); await p.waitForTimeout(500); await shot('pick');
      await ev(() => document.querySelector('.gemask .tg').click()); await p.waitForTimeout(400); await ev(() => document.querySelector('.gemask [data-x=yes]').click()); await p.waitForTimeout(300);
      console.log('телефон вставлен:', await ev(() => { const h = window.__G.G.hero; return Object.values(h.eq).concat(h.bag).filter(i => i && i.gem).map(i => i.name + '=' + i.gem).join(); }));
    }
    await ctx.close();
  }
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
