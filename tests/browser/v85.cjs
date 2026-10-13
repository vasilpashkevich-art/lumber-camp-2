// Версия 85: ячейки панели действий меняются местами перетаскиванием (мышь и палец); клавиша остаётся у ячейки; порядок хранится в герое; «Вернуть порядок».
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v85p' : 'v85';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(100);
  await ev(() => { document.querySelector('#newName').value = 'Панель'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); G.hero.lvl = 10; window.__G.refresh(); });
  await shot('before', 400);
  const bar = () => ev(() => window.__G.G.hero.bar.join(','));
  console.log('было:', await bar());
  if (!phone) {
    // мышью: Рывок (C) на место Вихря (V)
    const a = await p.locator('#actAbil').boundingBox(), c = await p.locator('#actAbil2').boundingBox();
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await p.mouse.move(a.x + 10, a.y + 10, { steps: 3 }); await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 12 }); await p.mouse.up();
  } else {
    const cdp = await ctx.newCDPSession(p);
    const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i })) });
    const a = await p.locator('#actAbil').boundingBox(), c = await p.locator('#actAbil2').boundingBox(); const x0 = a.x + a.width / 2, y0 = a.y + a.height / 2, x1 = c.x + c.width / 2, y1 = c.y + c.height / 2;
    await touch('touchStart', [[x0, y0]]); await p.waitForTimeout(350);
    for (let i = 1; i <= 8; i++) { await touch('touchMove', [[x0 + (x1 - x0) * i / 8, y0 + (y1 - y0) * i / 8]]); await p.waitForTimeout(30); }
    await touch('touchEnd', []); await p.waitForTimeout(250);
  }
  await p.waitForTimeout(400); console.log('стало:', await bar()); await shot('swapped');
  const ok1 = (await bar()).startsWith('attack,ab1,ab0'); if (!ok1) errs.push('обмен C↔V не произошёл');
  // умение при перетаскивании не сработало (перезарядка Рывка пустая)
  console.log('перезарядки:', await ev(() => JSON.stringify(window.__G.G.P.acd)));
  if (!phone) {
    // клавиша V теперь — Рывок (dash): цель рядом, нажать V
    await ev(() => { const G = window.__G.G, m = G.mobs[0]; m.state = 'idle'; m.hp = m.max; m.x = G.P.x + 120; m.y = G.P.y; m.hx = m.x; m.hy = m.y; G.P.target = m; });
    await p.keyboard.press('KeyV'); await p.waitForTimeout(200);
    const acd = await ev(() => Object.keys(window.__G.G.P.acd).filter(k => window.__G.G.P.acd[k] > 0).join(','));
    console.log('после V в перезарядке:', acd); if (!acd.includes('charge')) errs.push('V не запустила Рывок после обмена');
  }
  // сохранилось: перезайти
  await ev(() => window.__G.toSelect()); await p.waitForTimeout(500); await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(800);
  console.log('после входа:', await bar()); if (!(await bar()).startsWith('attack,ab1,ab0')) errs.push('порядок не сохранился');
  // вернуть порядок — в окне развития героя
  await p.click('#pfRing'); await p.waitForTimeout(400); await shot('dev');
  await ev(() => document.querySelector('[data-x=barReset]').click()); await p.waitForTimeout(200);
  console.log('после сброса:', await bar()); if (!(await bar()).startsWith('attack,ab0,ab1')) errs.push('сброс не вернул порядок');
  await ev(() => document.querySelectorAll('.modal .box').forEach(m => m.close && m.close())); await shot('reset', 300);
  await ctx.close();
  if (errs.length) { console.log('ОШИБКИ', tag, errs.slice(0, 6)); process.exitCode = 1; }
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); console.log('v85: готово'); })();
