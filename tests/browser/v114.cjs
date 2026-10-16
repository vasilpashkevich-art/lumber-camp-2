// Версия 114: края зон по карте континента — море с песком и пеной, обрыв с горами, топь, опушка; перенесённые выходы (Брод, Гать, Каменный перевал);
// мини-карта и большая карта. Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v114p' : 'v114';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 1200) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=archer]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Мореход'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const quiet = () => ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  // точка у края: от середины стороны идём наружу, пока проходимо, и отступаем внутрь
  const edge = async (side, along, back = 260) => ev(([side, along, back]) => { const G = window.__G.G, W = G.W, Z = W.Z;
    const P = side === 'west' ? [Z.W * 0.5, Z.H * along, -1, 0] : side === 'east' ? [Z.W * 0.5, Z.H * along, 1, 0] : side === 'north' ? [Z.W * along, Z.H * 0.5, 0, -1] : [Z.W * along, Z.H * 0.5, 0, 1];
    let [x, y, dx, dy] = P; while (W.inside(x + dx * 40, y + dy * 40)) { x += dx * 40; y += dy * 40; } x -= dx * back; y -= dy * back;
    G.P.x = x; G.P.y = y; G.P.target = null; }, [side, along, back]);
  const go = async zone => { await ev(z => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y; }, zone); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(1600); await quiet(); };
  await quiet();
  await edge('west', 0.45); await shot('pine-sea');
  if (!phone) { await edge('north', 0.4, 200); await shot('pine-cliff'); await p.keyboard.press('KeyK'); await shot('pine-map', 600); await p.keyboard.press('Escape'); }
  await go('farms');
  await edge('south', 0.5, 90); await shot('farms-sea');
  if (!phone) { await ev(() => { const G = window.__G.G, e = G.W.exits.find(e => e.to === 'Болотный край'); G.P.x = e.x - 160; G.P.y = e.y + 40; }); await shot('farms-brod');
    await p.keyboard.press('KeyK'); await shot('farms-map', 600); await p.keyboard.press('Escape'); }
  await go('pine'); await go('shroom');
  await edge('east', 0.4); await shot('shroom-sea');
  if (!phone) { await ev(() => { const G = window.__G.G, e = G.W.exits.find(e => e.to === 'Скалистое нагорье'); G.P.x = e.x + 120; G.P.y = e.y + 160; }); await shot('shroom-pass');
    await ev(() => { const G = window.__G.G, e = G.W.exits.find(e => e.to === 'Болотный край'); G.P.x = e.x - 150; G.P.y = e.y - 120; }); await shot('shroom-gat');
    await p.keyboard.press('KeyK'); await shot('shroom-map', 600); await p.keyboard.press('Escape'); }
  if (errs.length) console.log('ОШИБКИ', errs.slice(0, 5)); else console.log(tag, 'ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
