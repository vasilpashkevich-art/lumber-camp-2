// Версия 121: скакуны — Конный двор на западном берегу Соснового дола (конюшня, загон, конюший), покупка с 15-го, Z — сесть, рысь, слезть от удара.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function enter(p, cls, name) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${cls}]`); await p.waitForTimeout(100);
  await p.evaluate(n => { document.querySelector('#newName').value = n; document.querySelector('[data-x=ok]').click(); }, name); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
}
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 0, pg = p) => { if (w) await pg.waitForTimeout(w); await pg.screenshot({ path: `${OUT}/v121-${n}.png` }); };
  await enter(p, 'warrior', 'Всадник');
  await ev(() => { const G = window.__G.G; G.hero.lvl = 14; G.hero.gold = 20000; window.__G.refresh(); const Y = G.W.yard; G.P.x = Y.x + Y.stable.dx; G.P.y = Y.y + Y.stable.dy + 60; });
  await shot('yard', 600);
  await p.keyboard.press('KeyE'); await shot('stable-14', 500); console.log('окно 14-го:', await ev(() => [...document.querySelectorAll('.stablewin [data-buy]')].map(b => b.disabled).join(',')));
  await p.keyboard.press('Escape'); await ev(() => { const G = window.__G.G; G.hero.lvl = 15; window.__G.refresh(); }); await p.waitForTimeout(200);
  await p.keyboard.press('KeyE'); await p.waitForTimeout(400); await p.click('.stablewin [data-buy=grey]'); await shot('stable-bought', 300);
  console.log('куплен:', await ev(() => JSON.stringify([window.__G.G.hero.mounts, window.__G.G.hero.mount, window.__G.G.hero.gold])));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // сесть: Z, 1,5 с
  await p.keyboard.press('KeyZ'); await shot('summon', 700); await p.waitForTimeout(1100); console.log('верхом:', await ev(() => window.__G.G.P.ride));
  // скорость: 1 с вправо пешком и верхом
  const run = async () => { const x0 = await ev(() => window.__G.G.P.x); await p.keyboard.down('KeyD'); await p.waitForTimeout(1000); await p.keyboard.up('KeyD'); return Math.round(await ev(() => window.__G.G.P.x) - x0); };
  const dRide = await run(); await ev(() => { window.__G.G.P.y += 40; });
  await p.keyboard.down('KeyS'); await p.waitForTimeout(400); await shot('ride-down'); await p.keyboard.up('KeyS');
  await p.keyboard.down('KeyA'); await p.waitForTimeout(300); await shot('ride-left'); await p.keyboard.up('KeyA');
  await p.keyboard.down('KeyW'); await p.waitForTimeout(300); await shot('ride-up'); await p.keyboard.up('KeyW');
  await p.keyboard.press('KeyZ'); await p.waitForTimeout(200); console.log('слез по Z:', !(await ev(() => window.__G.G.P.ride)));
  const dWalk = await run(); console.log('за 1 с: верхом', dRide, 'пешком', dWalk);
  // удар по герою — сбрасывает
  await p.keyboard.press('KeyZ'); await p.waitForTimeout(1700);
  await ev(() => { const G = window.__G.G, m = G.mobs.find(o => o.state !== 'dead'); m.x = G.P.x + 400; m.y = G.P.y; }); 
  console.log('перед ударом верхом:', await ev(() => window.__G.G.P.ride), 'удар:', await ev(() => { const G = window.__G.G; G.P.lastCombat = -99; const m = G.mobs.find(o => o.state !== 'dead'); m.state = 'chase'; m.x = G.P.x + 30; m.y = G.P.y; m.cd = 0; return 'ok'; }));
  await p.waitForTimeout(1500); console.log('после удара верхом:', await ev(() => window.__G.G.P.ride), await ev(() => document.querySelector('#toasts').textContent.slice(0, 120)));
  await p.keyboard.press('KeyM'); await p.keyboard.press('KeyK'); await shot('map', 400); await p.keyboard.press('KeyK');
  // телефон
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const ph = await ctx.newPage(); ph.on('pageerror', e => errs.push('phone ' + e.message));
  await enter(ph, 'mage', 'Маг');
  await ph.evaluate(() => { const G = window.__G.G; G.hero.lvl = 16; G.hero.gold = 20000; G.hero.mounts = ['black']; G.hero.mount = 'black'; window.__G.refresh(); const Y = G.W.yard; G.P.x = Y.x + Y.stable.dx; G.P.y = Y.y + Y.stable.dy + 60; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e12; }); });
  await ph.waitForTimeout(500); console.log('кнопка на телефоне видна:', await ph.evaluate(() => !document.querySelector('#btnMount').hidden), 'кнопка действия:', await ph.evaluate(() => document.querySelector('#actUse').textContent));
  await ph.tap('#btnMount'); await ph.waitForTimeout(1800); console.log('телефон верхом:', await ph.evaluate(() => window.__G.G.P.ride)); await shot('phone-ride', 0, ph);
  await ph.tap('#actUse'); await shot('phone-stable', 500, ph);
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
