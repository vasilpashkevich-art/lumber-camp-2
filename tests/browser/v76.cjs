// Версия 76: врата Храма квакунов во впадине Полоза (Грибной лес): фасад, подпись, действие у врат, карта.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 600) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/v76-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Лесник'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await ev(() => { const G = window.__G.G; G.hero.lvl = 14; window.__G.refresh(); G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  const calm = () => ev(() => { const G = window.__G.G; G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); });
  const go = async (x, y) => { await ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.P.nav = null; }, [x, y]); await calm(); };
  const T = await ev(() => window.__G.G.W.temple); console.log('храм:', JSON.stringify(T));
  await go(T.x, T.y + 150); await shot('gate-far');
  await go(T.x - 60, T.y + 40); await shot('gate-near');
  await go(T.x, T.y - 40); await shot('gate-in');   // герой в проёме — фасад просвечивает
  await p.keyboard.press('KeyE'); await p.waitForTimeout(300); const toast = await ev(() => document.querySelector('#toasts') && document.querySelector('#toasts').textContent); console.log('ответ у врат:', toast);
  await shot('gate-toast', 200);
  await go(T.x + 420, T.y - 120); await shot('gate-side');
  // стены: в фасад не пройти, в проём — можно
  console.log('стена не проходима:', await ev(T => !window.__G.G.W.walkable(T.x - 150, T.y - 100), T), 'проём проходим:', await ev(T => window.__G.G.W.walkable(T.x, T.y - 40), T), 'порог до стены:', await ev(T => !window.__G.G.W.walkable(T.x, T.y - 90), T));
  // карта
  await p.keyboard.press('KeyK'); await shot('map', 500); await p.keyboard.press('Escape');
  // телефон
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push(e.message));
  await p2.goto(URL); await p2.waitForTimeout(400); await p2.click('#selNew', { noWaitAfter: true }); await p2.waitForTimeout(100); await p2.click('.clsCard[data-c=warrior]'); await p2.fill('#newName', 'Палец'); await p2.click('[data-x=ok]'); await p2.waitForTimeout(150); await p2.click('.slot:nth-child(1)'); await p2.click('#selEnter'); await p2.waitForTimeout(900);
  const ev2 = (f, a) => p2.evaluate(f, a);
  await ev2(() => { const G = window.__G.G; G.hero.lvl = 14; window.__G.refresh(); G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; }); await p2.keyboard.press('KeyE'); await p2.waitForTimeout(1500);
  await ev2(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); }, [T.x - 40, T.y + 50]); await p2.waitForTimeout(700); await p2.screenshot({ path: `${OUT}/v76-phone.png` }); console.log('кнопка действия:', await ev2(() => document.querySelector('#actUse') && document.querySelector('#actUse').textContent));
  await b.close();

  if (errs.length) { console.log('ОШИБКИ:', errs.slice(0, 5)); process.exit(1); }
  console.log('v76: готово');
})();
