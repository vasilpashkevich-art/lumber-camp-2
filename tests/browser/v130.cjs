// v130: кварталы Столицы — таблички, огород, вагонетка, ювелирная мастерская; кварталы на мини-карте и карте K
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(500);
  await p.click('#selNew'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Квартал'); await p.click('[data-x=ok]'); await p.waitForTimeout(300); await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(1200);
  const spots = { craft: [600, -120], arcane: [-600, -120], herb: [-560, 220], bank: [760, 240], rest: [200, 700] };
  for (const [k, [dx, dy]] of Object.entries(spots)) { await p.evaluate(([dx, dy]) => { const G = window.__G.G, c = G.W.cap; G.P.x = c.x + dx; G.P.y = c.y + dy; }, [dx, dy]); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/v130-${k}.png` }); }
  await p.keyboard.press('KeyK'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v130-map.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // ювелир — E даёт надпись «скоро»
  await p.evaluate(() => { const G = window.__G.G, c = G.W.cap, b = G.W.houses.find(h => h.id === 'jeweler'); G.P.x = b.x; G.P.y = b.y + 60; }); await p.waitForTimeout(400); await p.keyboard.press('KeyE'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v130-jeweler-e.png` });
  console.log('ювелир:', await p.evaluate(() => (document.querySelector('.toast') || {}).textContent || '—'));
  console.log(errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет'); await b.close(); })();
