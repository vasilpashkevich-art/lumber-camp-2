// Версия 110: пассивные аксессуары — подсказка (параметры, «срабатывает само»), ячейка 1 с перезарядкой, новые значки,
// срабатывания с эффектами (тень, волки, плащ, молния, феникс). Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone, cls) {
  const errs = [], tag = (phone ? 'v110p-' : 'v110-') + cls;
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 300) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click(`.clsCard[data-c=${cls}]`); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Оберег'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  // все 12 аксессуаров в сумку, Зеркало — надеть
  await ev(() => { const X = window.__G, G = X.G, H = G.hero; H.lvl = 12;
    const ids = ['stoneheart','rage','breath','windfeather','stormeye','thorns','phoenix','mirror','pack','shadowcloak','hourglass','gravity'];
    ids.forEach((id, i) => { const it = X.makeTrinket(H.cls, 12, i < 6 ? 'rare' : 'epic', null, id); it.pos = i; H.bag.push(it); });
    const m = H.bag.find(x => x.trinket === 'mirror'); H.bag.splice(H.bag.indexOf(m), 1); H.eq.trinket = m; X.refresh(); });
  await p.keyboard.press('KeyI'); await p.waitForTimeout(500);
  if (phone) { await ev(() => { const c = [...document.querySelectorAll('.bag .cell')].find(c => c.innerHTML.includes('svg')); c && c.click(); }); await shot('sheet', 500); }
  else { const c = await p.$('.bag .cell'); await c.hover(); await shot('tip', 500);
    console.log('подсказка:', await ev(() => (document.querySelector('.tip') || {}).innerText)); }
  await p.keyboard.press('Escape'); await ev(() => document.querySelectorAll('.modal').forEach(m => m.remove())); await p.waitForTimeout(300);
  // бой: поставить моба рядом, вызвать срабатывания
  await ev(() => { const X = window.__G, G = X.G; G.st.maxHp = G.P.hp = 99999;
    const m = G.mobs.find(m => m.state !== 'dead'); m.x = G.P.x + 60; m.y = G.P.y; m.hx = m.x; m.hy = m.y; m.hp = m.maxHp * 50; m.maxHp *= 50; m.state = 'chase'; G.target = m;
    const r = G.rand; G.rand = () => 0.001; X.trinketProc(G, 'hit', m); G.rand = r;
    G.hero.eq.trinket = G.hero.bag.find(x => x.trinket === 'pack'); G.P.tcd = 0; G.rand = () => 0.001; X.trinketProc(G, 'kill', m); G.rand = r; });
  await shot('procs', 1500);
  console.log('баффы:', await ev(() => JSON.stringify(Object.fromEntries(Object.entries(window.__G.G.P.buf).filter(([k, v]) => v > 0).map(([k, v]) => [k, +v.toFixed(1)])))));
  console.log('ячейка 1:', await ev(() => { const e = document.querySelector('[data-a=trinket], #actTrinket'); return e ? e.className + ' | ' + (e.title || '') : 'нет'; }));
  await ev(() => { const X = window.__G, G = X.G, H = G.hero; H.eq.trinket = H.bag.find(x => x.trinket === 'phoenix'); X.refresh(); G.P.tcd = 0; G.P.hp = 1; G.st.maxHp = 500;
    const m = G.mobs.find(m => m.state !== 'dead'); X.trinketProc(G, 'death', m); });
  await shot('phoenix', 400);
  console.log('феникс — жив, здоровье:', await ev(() => Math.round(window.__G.G.P.hp)));
  if (errs.length) console.log('ОШИБКИ', errs.slice(0, 5)); else console.log('ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); for (const c of ['warrior', 'mage']) await runOn(b, false, c); await runOn(b, true, 'archer'); await b.close(); })();
