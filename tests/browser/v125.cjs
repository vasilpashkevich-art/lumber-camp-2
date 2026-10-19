// v125: счётчик кадров (галочка в меню) и частота кадров при открытом окне; телефон
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(500);
  await p.tap('#selNew'); await p.waitForTimeout(450); await p.tap('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Кадр'); await p.tap('[data-x=ok]'); await p.waitForTimeout(450); await p.tap('.slot:nth-child(1)'); await p.tap('#selEnter'); await p.waitForTimeout(1200);
  await p.tap('#btnMenu'); await p.waitForTimeout(500); await p.tap('.fpst input'); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/v125-menu.png` });
  await p.tap('.box [data-x=ok]'); await p.waitForTimeout(2500);
  const txt = await p.evaluate(() => (document.getElementById('fpsBox') || {}).textContent || '');
  console.log('счётчик:', txt); await p.screenshot({ path: `${OUT}/v125-fps.png` });
  if (!/кадр\/с/.test(txt)) throw new Error('FAIL: счётчик кадров не показан');
  // при открытом окне — около 30 кадров
  await p.tap('#btnBag'); await p.waitForTimeout(2500); const t2 = await p.evaluate(() => document.getElementById('fpsBox').textContent); console.log('с окном:', t2);
  if (parseInt(t2) > 40) throw new Error('FAIL: при открытом окне больше 30 кадров');
  await p.evaluate(() => document.querySelector('.modal .box').close()); await p.waitForTimeout(300);
  await p.tap('#btnMenu'); await p.waitForTimeout(500); await p.tap('.fpst input'); await p.tap('.box [data-x=ok]'); await p.waitForTimeout(1500);
  if (await p.evaluate(() => !!document.getElementById('fpsBox'))) throw new Error('FAIL: счётчик не убрался');
  console.log(errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет'); await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
