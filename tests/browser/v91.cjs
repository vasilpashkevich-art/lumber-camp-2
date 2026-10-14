// Версия 91: выбросить вещь из сумки (правый щелчок, перенос из окна, кнопка на телефоне) — мешок на земле; надпись про навык алхимии.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const phone of [false, true]) {
    const tag = phone ? 'v91-phone' : 'v91';
    const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
    const p = await ctx.newPage(); p.setDefaultTimeout(8000);
    p.on('pageerror', e => errs.push(tag + ' ' + e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(100);
    await ev(() => { document.querySelector('#newName').value = 'Сборщик'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
    await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); G.P.x += 400; });
    // вещи в сумку: белая и синяя
    await ev(() => { const G = window.__G.G; const mk = window.__G.makeItem; G.hero.bag.push(Object.assign(mk('warrior', 'head', 5, 'common', Math.random), { pos: 0 }), Object.assign(mk('warrior', 'legs', 5, 'rare', Math.random), { pos: 1 })); });
    console.log(tag, 'сумка:', await ev(() => window.__G.G.hero.bag.map(i => i.rar + ' ' + i.name).join('; ')));
    if (!phone) {
      await p.keyboard.press('KeyI'); await p.waitForTimeout(300);
      // правый щелчок по белой — сразу
      await p.click('.bag .cell:nth-child(1)', { button: 'right' }); await p.waitForTimeout(200);
      console.log('белая выброшена без вопроса:', await ev(() => window.__G.G.hero.bag.length === 1 && window.__G.G.corpses.some(c => c.dropped)));
      // синяя — перенести за окно: вопрос
      const cell = await p.$('.bag .cell[draggable=true]'); const bx = await cell.boundingBox();
      await p.dragAndDrop('.bag .cell[draggable=true]', '.modal', { targetPosition: { x: 30, y: 400 } }); await p.waitForTimeout(250);
      console.log('вопрос:', await ev(() => (document.querySelector('.throwask') || {}).textContent)); await shot('ask');
      await p.click('.throwask [data-x=yes]'); await p.waitForTimeout(200);
      console.log('синяя выброшена:', await ev(() => window.__G.G.hero.bag.length === 0 && window.__G.G.corpses.filter(c => c.dropped).length === 2));
      await p.keyboard.press('Escape'); await p.waitForTimeout(200); await shot('bags', 300);
      // поднять обратно E
      await ev(() => { const G = window.__G.G, c = G.corpses.find(c => c.dropped); G.P.x = c.x; G.P.y = c.y - 10; }); await p.keyboard.press('KeyE'); await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(300);
      console.log('подняли:', await ev(() => window.__G.G.hero.bag.length));
      // алхимия: надпись про навык
      await ev(() => { const G = window.__G.G; G.hero.prof.alchemy = 11; G.hero.prof.herbal = 16; document.querySelectorAll('.modal .box').forEach(m => m.close && m.close()); }); await p.waitForTimeout(200); await p.keyboard.press('KeyP'); await p.waitForTimeout(400);
      await ev(() => [...document.querySelectorAll('.profwin .tab')].find(t => /Алхимия/.test(t.textContent)).click()); await shot('alch', 300);
      console.log('надпись:', await ev(() => [...document.querySelectorAll('.profwin .need')].map(n => n.textContent.replace(/\s+/g, ' ')).slice(0, 2).join(' | ')));
    } else {
      await p.tap('#btnBag'); await p.waitForTimeout(600);
      await p.tap('.bag .cell:nth-child(2)'); await p.waitForTimeout(500); await shot('sheet');
      console.log('кнопки листа:', await ev(() => [...document.querySelectorAll('.itemsheet .btn')].map(b => b.textContent).join(', ')));
      await ev(() => [...document.querySelectorAll('.itemsheet .btn')].find(b => b.textContent === 'Выбросить').click()); await p.waitForTimeout(500); await shot('ask');
      await ev(() => document.querySelector('.throwask [data-x=yes]').click()); await p.waitForTimeout(300);
      console.log('телефон: синяя выброшена:', await ev(() => window.__G.G.hero.bag.length === 1 && window.__G.G.corpses.some(c => c.dropped)));
    }
    await ctx.close();
  }
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
