// Версия 140: прозрачная вода с дном и рыбами, отмели и глубина, герой по пояс в воде, водные звери (щука, зубатка, пираньи, крокодил):
// тень под водой, нападение в воде. Все края с водой: Хутор (река), Грибной лес (пруды), Болотный край (топь). Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v140p' : 'v140';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 1200) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Пловец'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const quiet = () => ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  const go = async zone => { await ev(z => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y; }, zone); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(1600); await quiet(); };
  const at = (x, y) => ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.P.target = null; }, [x, y]);
  const wake = (kind, n = 9) => ev(([kind, n]) => { const G = window.__G.G; let k = 0; for (const m of G.mobs) if (m.kind === kind && k < n) { m.state = 'idle'; m.respawnAt = 0; m.hp = m.max; m.x = m.hx; m.y = m.hy; k++; } }, [kind, n]);
  await quiet(); await ev(() => { window.__G.G.hero.lvl = 16; });
  // Хутор: река с отмелями, щуки
  await go('farms'); await wake('pike');
  await at(4600, 2470); await shot('river');
  console.log('в воде:', await ev(() => { const G = window.__G.G; return [G.P.wet, G.W.depthAt(G.P.x, G.P.y)]; }));
  await ev(() => { const G = window.__G.G, P = G.P; const m = G.mobs.find(m => m.kind === 'pike' && m.state !== 'dead'); if (m) { m.state = 'chase'; m.x = m.hx = P.x + 60; m.y = m.hy = P.y; m.cd = 0; } }); await shot('pike', 500);
  // Грибной лес: пруд с зубатками, пираньи
  await go('pine'); await go('shroom'); await wake('catfish'); await wake('piranha');
  await at(2106, 5070 + 150); await shot('pond');
  await at(6170, 5660 + 110); await ev(() => { const G = window.__G.G, P = G.P; for (const m of G.mobs) if (m.kind === 'piranha' && m.state !== 'dead') { m.state = 'chase'; m.x = m.hx = P.x + 30 + Math.random() * 40; m.y = m.hy = P.y - 20 + Math.random() * 40; } }); await shot('piranha', 500);
  // Болотный край: крокодилы, мель, большой пруд
  await go('swamp'); await wake('crocodile'); await wake('piranha');
  await at(5500, 3260); await shot('croc-lurk');
  await ev(() => { const G = window.__G.G, P = G.P; const m = G.mobs.find(m => m.kind === 'crocodile' && m.state !== 'dead'); if (m) { m.state = 'chase'; m.x = m.hx = P.x + 70; m.y = m.hy = P.y + 10; m.cd = 0; m.smash.t = 0.3; } }); await shot('croc', 900);
  await at(5450, 3150); await shot('shoal');
  if (!phone) { await p.keyboard.press('KeyK'); await shot('map', 600); await p.keyboard.press('Escape'); }
  console.log(tag, errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
