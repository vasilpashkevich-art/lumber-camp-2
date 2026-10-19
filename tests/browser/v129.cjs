// v129: заказы в журнале (L), под мини-картой и голубая штриховка на картах; синий гриб без дымки
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(500);
  await p.click('#selNew'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Журнал'); await p.click('[data-x=ok]'); await p.waitForTimeout(300); await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const G = window.__G.G, O = window.__G.orders; G.hero.prof.mining = 1; G.hero.prof.herbal = 1; for (const T of O.boardOf('pine')) O.oTake(G, T); const bd = G.W.boards[0]; G.P.x = bd.x; G.P.y = bd.y + 300; }); await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/v129-track.png` });
  await p.keyboard.press('KeyL'); await p.waitForTimeout(500); console.log('журнал — заказов:', await p.evaluate(() => document.querySelectorAll('.jq.ord').length)); await p.screenshot({ path: `${OUT}/v129-journal.png` }); await p.keyboard.press('KeyL'); await p.waitForTimeout(200);
  await p.keyboard.press('KeyK'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v129-map.png` }); await p.keyboard.press('Escape');
  console.log(errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет'); await b.close(); })();
