// Версия 68: автоатака — пробел один раз, кнопка удара подсвечена, пока идёт.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Рубака'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a);
  await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; const m = G.mobs.find(m => m.kind === 'wolf'); m.hp = m.max = 120; G.P.x = m.x + 30; G.P.y = m.y; G.P.target = m; window.__m = m; });
  await p.keyboard.press('Space'); await p.waitForTimeout(600);
  const on = await ev(() => document.querySelector('#actAttack').classList.contains('auto')); if (!on) errs.push('кнопка не подсвечена');
  await p.screenshot({ path: OUT + '/v68-auto.png' });
  let dead = false; for (let i = 0; i < 40 && !dead; i++) { await p.waitForTimeout(250); dead = await ev(() => window.__m.state === 'dead'); }
  if (!dead) errs.push('волк не убит автоатакой'); await p.waitForTimeout(300);
  const off = await ev(() => !document.querySelector('#actAttack').classList.contains('auto')); if (!off) errs.push('подсветка не погасла');
  console.log(errs.length ? errs : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
