// Версия 107: зачарование — Мастерская чар (учить, жезл из слитков), окно «Профессии» → «Зачарование» (материалы,
// распыление по одной и «все зелёные», чары на вещь), значок ✦ на зачарованной вещи, подсказка. Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v107p' : 'v107';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  const closeAll = async () => { await ev(() => document.querySelectorAll('.modal .box').forEach(m => m.close ? m.close() : m.parentElement.remove())); await p.waitForTimeout(150); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click('.clsCard[data-c=mage]'); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/${tag}-new.png` });
  await ev(() => { document.querySelector('#newName').value = 'Чародей'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900); await ev(() => { const C = window.__G.CRAFT; for (const k in C) C[k] = 0.02; });   // v112: ремесло со временем — здесь проверяем окна, не ожидание
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  // вещи и слитки в сумку
  await ev(() => { const G = window.__G.G, H = G.hero; H.bag.length = 0; window.__G.addStack(H, window.__G.makeStack('bar', 'copper', 12)); let k = 2;
    for (const [s, l, r] of [['chest', 5, 'good'], ['legs', 6, 'good'], ['head', 4, 'good'], ['weapon', 9, 'good'], ['legs', 12, 'good'], ['chest', 13, 'rare'], ['head', 15, 'epic']]) { const it = window.__G.makeItem('mage', s, l, r, Math.random); it.pos = k++; H.bag.push(it); } window.__G.refresh(); });
  // Мастерская чар
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.enchant); G.P.x = b.x + 10; G.P.y = b.y + 70; }); await shot('hut', 800);
  if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(500);
  console.log('мастерская открылась:', await ev(() => !!document.querySelector('.profwin .learn .btn'))); await shot('teach');
  await ev(() => document.querySelector('.profwin .learn .btn').click()); await p.waitForTimeout(200);
  await ev(() => document.querySelectorAll('.profwin .learn .btn')[1].click()); await p.waitForTimeout(300);
  console.log('навык и жезл:', await ev(() => JSON.stringify({ e: window.__G.G.hero.prof.enchant, rod: window.__G.G.hero.bag.some(i => i.tool === 'rod') }))); await shot('learned');
  // распылить все зелёные
  await ev(() => { const b = [...document.querySelectorAll('.profwin .detools .btn')][0]; b && b.click(); }); await p.waitForTimeout(200); await shot('ask-all');
  await ev(() => document.querySelector('.throwask [data-x=yes]').click()); await p.waitForTimeout(300); await shot('after-all');
  // синюю — с вопросом
  await ev(() => { const r = [...document.querySelectorAll('.profwin .delist .ware2')][0]; r.querySelector('.btn').click(); }); await p.waitForTimeout(200); await shot('ask-blue');
  await ev(() => document.querySelector('.throwask [data-x=yes]').click()); await p.waitForTimeout(300);
  console.log('материалы:', await ev(() => JSON.stringify(window.__G.G.hero.bag.filter(i => i.kind === 'ench').map(i => [i.metal, i.n]))));
  // чары на оружие
  await ev(() => { const r = [...document.querySelectorAll('.profwin .recipes .ware2')][0]; r.querySelector('.btn').click(); }); await p.waitForTimeout(200); await shot('pick');
  await ev(() => document.querySelector('.gemask .tg').click()); await p.waitForTimeout(300);
  console.log('чары на оружии:', await ev(() => window.__G.G.hero.eq.weapon && window.__G.G.hero.eq.weapon.ench));
  await ev(() => { const B = document.querySelector('.profwin .pbody'); B.scrollTop = 99999; }); await shot('recipes');
  await closeAll();
  // окно героя: значок ✦ и подсказка
  if (phone) await ev(() => document.querySelector('#btnBag').click()); else await p.keyboard.press('KeyI'); await p.waitForTimeout(500);
  if (!phone) { const c = await p.$('.eq .gwrap, .slotL .gwrap, .gwrap'); if (c) { await c.hover(); } }
  await shot('hero');
  console.log('значок чар:', await ev(() => !!document.querySelector('.enm')));
  if (errs.length) console.log('ОШИБКИ', errs.slice(0, 5)); else console.log('ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
