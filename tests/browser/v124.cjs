// v124: окно «Как играть» у нового героя (без #dev) и золотая стрелка к Гордею; компьютер и телефон
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const BASE = 'file://' + path.resolve(__dirname, '../../index.html');
async function run(phone) {
  const b = await chromium.launch(); const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); const n = phone ? 'phone' : 'pc';
  const tap = s => phone ? p.tap(s) : p.click(s);
  await p.goto(BASE); await p.waitForTimeout(500);
  await tap('#selNew'); await p.waitForTimeout(450); await tap('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Новичок'); await tap('[data-x=ok]'); await p.waitForTimeout(450);
  await tap('.slot:nth-child(1)'); await tap('#selEnter'); await p.waitForTimeout(1200);
  const shown = await p.evaluate(() => !!document.querySelector('.howto'));
  await p.screenshot({ path: `${OUT}/v124-${n}-window.png` });
  if (!shown) throw new Error('FAIL: окно «Как играть» не открылось у нового героя');
  await p.waitForTimeout(400); await tap('.howto [data-x=ok]'); await p.waitForTimeout(500);
  if (await p.evaluate(() => !!document.querySelector('.howto'))) throw new Error('FAIL: окно не закрылось');
  await p.screenshot({ path: `${OUT}/v124-${n}-arrow.png` });
  // повторный вход — окна нет
  await p.reload(); await p.waitForTimeout(500); await tap('.slot:nth-child(1)'); await tap('#selEnter'); await p.waitForTimeout(1000);
  if (await p.evaluate(() => !!document.querySelector('.howto'))) throw new Error('FAIL: окно открылось повторно');
  // из меню
  await tap('#btnMenu').catch(() => p.keyboard.press('Escape')); await p.waitForTimeout(400);
  const hb = await p.$('.box [data-x=howto]'); if (hb) { await p.waitForTimeout(300); await tap('.box [data-x=howto]'); await p.waitForTimeout(300); console.log(n, 'из меню:', await p.evaluate(() => !!document.querySelector('.howto'))); await p.screenshot({ path: `${OUT}/v124-${n}-menu.png` }); }
  else console.log(n, 'меню: кнопка не найдена');
  console.log(n, errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет'); await b.close();
}
(async () => { await run(false); await run(true); })().catch(e => { console.error(e.message); process.exit(1); });
