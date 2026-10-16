// Версия 84: травничество и алхимия — лавка травницы, кусты трав, сбор, окно «Профессии» (P), склянки у торговца, варка, зелья на клавише 2, таймеры под портретом.
// Компьютер (1440×860) и телефон (844×390).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v84p' : 'v84';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  const closeAll = async () => { await ev(() => document.querySelectorAll('.modal .box').forEach(m => m.close ? m.close() : m.parentElement.remove())); await p.waitForTimeout(150); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=archer]'); await p.waitForTimeout(100);
  await ev(() => { document.querySelector('#newName').value = 'Травник'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900); await ev(() => { const C = window.__G.CRAFT; for (const k in C) C[k] = 0.02; });   // v112: ремесло со временем — здесь проверяем окна, не ожидание
  const quiet = () => ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  await quiet();
  // 1. лавка травницы в Столице рядом с героем
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.alchemy); G.P.x = b.x - 60; G.P.y = b.y + 70; G.hero.gold = 5000; }); await shot('hut', 700);
  // окно профессий без профессий (P)
  await p.keyboard.press('KeyP'); await shot('prof-none'); console.log('окно профессий (пусто):', await ev(() => (document.querySelector('.profwin .pbody') || {}).textContent.slice(0, 40)));
  await p.keyboard.press('KeyP'); await p.waitForTimeout(200); console.log('закрылось по P:', await ev(() => !document.querySelector('.modal')));
  // у травницы: выучить обе
  if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(400);
  console.log('травница:', await ev(() => !!document.querySelector('.profwin .learn .btn')));
  await ev(() => { for (const b of document.querySelectorAll('.profwin .learn .btn')) b.click(); }); await p.waitForTimeout(300);
  console.log('выучено:', await ev(() => JSON.stringify(window.__G.G.hero.prof))); await shot('learned');
  await closeAll();
  // 2. кусты: герой у куста серебролиста, собирает
  await ev(() => { const G = window.__G.G, v = G.plants.find(x => !x.at); G.P.x = v.x + 30; G.P.y = v.y + 6; }); await shot('bush', 500);
  if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await shot('gather', 900);
  await p.waitForTimeout(1500); console.log('травы:', await ev(() => window.__G.G.hero.bag.filter(i => i.kind === 'herb').map(i => i.name + '×' + i.n).join(', ')));
  // 3. склянки у торговца
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.vendor); G.P.x = b.x; G.P.y = b.y + 70; });
  if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(400);
  await ev(() => document.querySelector('.fl5').click()); await p.waitForTimeout(200); console.log('склянок:', await ev(() => window.__G.G.hero.bag.filter(i => i.kind === 'flask').reduce((s, i) => s + i.n, 0))); await shot('vendor');
  await closeAll();
  // 4. варка у травницы: травы в сумку, сварить силу и стойкость, лечебное
  await ev(() => { const M = window.__G, G = M.G, h = G.hero, b = G.W.houses.find(x => x.alchemy); G.P.x = b.x - 60; G.P.y = b.y + 70; M.addStack(h, M.makeStack('herb', 'silverleaf', 12)); M.addStack(h, M.makeStack('herb', 'wormwood', 4)); h.prof.alchemy = 60; M.refresh(); });
  if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(400); await shot('brew');
  const brewed = await ev(() => { const bs = [...document.querySelectorAll('.recipes .ware2')]; const click = n => { const r = bs.find(x => x.querySelector('b').textContent === n); const btn = r && r.querySelector('[data-x=one]'); if (btn && !btn.disabled) btn.click(); return !!(btn && !btn.disabled); }; return [click('Зелье силы'), click('Зелье стойкости'), click('Зелье здоровья'), click('Зелье скорости'), click('Зелье мудрости')]; });
  console.log('сварено (сила, стойкость, здоровье, скорость, мудрость — последнее рано):', brewed.join(' '), await ev(() => window.__G.G.hero.bag.filter(i => i.kind === 'potion').map(i => i.name + '×' + i.n).join(', ')), 'зелий Q:', await ev(() => window.__G.G.hero.potions));
  await shot('brewed'); await closeAll();
  // 5. выпить из сумки, кнопка 2, таймеры
  await p.click('#btnBag'); await p.waitForTimeout(400);
  const drank = await ev(() => { const h = window.__G.G.hero; const cells = [...document.querySelectorAll('.bag .cell')]; const out = []; for (const id of ['strength', 'stone']) { const it = h.bag.find(i => i.kind === 'potion' && i.metal === id); const c = cells[it.pos]; c.click(); out.push(id); } return out; });
  await p.waitForTimeout(500);
  if (phone) { for (let k = 0; k < 2; k++) { await ev(() => { const b = [...document.querySelectorAll('.modal .btn')].reverse().find(x => x.textContent === 'Выпить'); b && b.click(); }); await p.waitForTimeout(500); } }
  await shot('char-pot'); await closeAll();
  console.log('действуют:', await ev(() => JSON.stringify(window.__G.G.hero.elixir)), 'кнопка 2:', await ev(() => !document.querySelector('#actPot2').hidden + ' ' + document.querySelector('#actPot2 .n').textContent), 'таймеры:', await ev(() => document.querySelectorAll('#pfElix .ex').length));
  await shot('elixirs', 500);
  if (!phone) { await p.keyboard.press('Digit2'); await p.waitForTimeout(300); console.log('после 2:', await ev(() => document.querySelector('#actPot2 .n').textContent)); }
  // окно профессий со всеми вкладками
  await p.keyboard.press('KeyP'); await p.waitForTimeout(300); await ev(() => { const t = [...document.querySelectorAll('.profwin .tab')].find(x => x.textContent.includes('Травничество')); t && t.click(); }); await shot('prof-herbal');
  await closeAll();
  await ctx.close();
  if (errs.length) { console.log('ОШИБКИ', tag, errs.slice(0, 5)); process.exitCode = 1; }
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); console.log('v84: готово'); })();
