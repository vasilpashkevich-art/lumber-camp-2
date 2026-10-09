// Версия 66: значок «i» у характеристик в окне героя, подсказка при наведении.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const cls of ['warrior', 'mage', 'archer']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } }), p = await ctx.newPage(); p.setDefaultTimeout(8000);
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL); await p.waitForTimeout(300);
    await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click(`.clsCard[data-c=${cls}]`); await p.fill('#newName', 'Проба'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
    await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(800);
    await p.keyboard.press('KeyI'); await p.waitForTimeout(300);
    const n = await p.$$eval('.stats .si', a => a.length); console.log(cls, 'значков:', n); if (n < 7) errs.push(cls + ': мало значков ' + n);
    for (const [i, name] of [[2, 'stam'], [6, 'crit']]) {
      await p.hover(`.stats .si[data-i="${i}"]`); await p.waitForTimeout(200);
      const t = await p.$eval('.tip', e => e.hidden ? '' : e.textContent); if (!t) errs.push(cls + ': нет подсказки ' + name);
      await p.screenshot({ path: `${OUT}/v66-${cls}-${name}.png` });
    }
    await ctx.close();
  }
  console.log(errs.length ? errs : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
