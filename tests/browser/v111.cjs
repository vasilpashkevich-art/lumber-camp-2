// Версия 111: задания Хуторских угодий и Грибного леса — жители, предметы заданий (сундучки, мешки, ключ, тотемы, коконы, кладки),
// окно разговора, сторожка Фрола; телефон — окно жителя. Снимки рядом с героем для масштаба.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v111p' : 'v111';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 500) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=warrior]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Странник'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const quiet = () => ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  const go = async zone => { await ev(z => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y; }, zone); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(1600); await quiet(); };
  const at = async (x, y, n) => { await ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; }, [x, y]); await shot(n, 900); };
  await ev(() => { const h = window.__G.G.hero; h.lvl = 14; Object.assign(h.quests.done, { pine_ataman: 1 }); });
  await quiet();
  if (!phone) { const n = await ev(() => window.__G.Q.NPCS.frol); await at(n.x - 40, n.y + 60, 'frol'); }
  await go('farms');
  await ev(() => { const X = window.__G, G = X.G, h = G.hero; Object.assign(h.quests.done, { farm_dogs: 1, farm_crows: 1, farm_scare: 1, farm_fire: 1, farm_runaway: 1 }); for (const id of ['farm_ashes', 'farm_flour', 'farm_key']) X.Q.qAccept(G, id); });
  let n = await ev(() => window.__G.Q.NPCS.evsey); await at(n.x + 60, n.y + 50, 'evsey');
  // окно разговора
  await ev(() => { const n = window.__G.Q.NPCS.evsey, G = window.__G.G; G.P.x = n.x; G.P.y = n.y + 40; });
  if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await shot('talk', 700);
  await ev(() => document.querySelectorAll('.modal').forEach(m => m.remove())); await p.keyboard.press('Escape');
  if (!phone) {
    n = await ev(() => window.__G.Q.NPCS.matvey); await at(n.x + 60, n.y + 50, 'matvey');
    n = await ev(() => window.__G.Q.NPCS.yeremka); await at(n.x + 60, n.y + 50, 'yeremka');
    await at(6100 - 50, 3230 + 60, 'ashes'); await at(860, 1760, 'sacks'); await at(3390 + 50, 3610 + 40, 'key');
  }
  await go('pine'); await go('shroom');
  await ev(() => { const X = window.__G, G = X.G, h = G.hero; Object.assign(h.quests.done, { sh_road: 1, sh_spores: 1, sh_slime: 1, sh_tikhon: 1 }); for (const id of ['sh_totems', 'sh_webs', 'sh_brood']) X.Q.qAccept(G, id); });
  for (const k of phone ? ['savva'] : ['savva', 'luka', 'tikhon']) { n = await ev(k => window.__G.Q.NPCS[k], k); await at(n.x + 60, n.y + 50, k); }
  if (!phone) { await at(3460 + 50, 5060 + 50, 'totems'); await at(5560, 4260, 'cocoons'); await at(9100, 2700, 'eggs'); }
  await p.keyboard.press('KeyL'); await shot('journal', 600);
  if (errs.length) console.log('ОШИБКИ', errs.slice(0, 5)); else console.log(tag, 'ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
