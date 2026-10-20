// Версия 139: задания Болотного края («Хозяйка топи»): жители Игнат, Марфа, Нестор, сети на мостках, идолы капища; значки логов на карте;
// дороги и гати по суше. Компьютер и телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function runOn(b, phone) {
  const errs = [], tag = phone ? 'v139p' : 'v139';
  const ctx = await b.newContext(phone ? { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 1200) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(300); await p.click('.clsCard[data-c=mage]'); await p.waitForTimeout(300);
  await ev(() => { document.querySelector('#newName').value = 'Ходок'; document.querySelector('[data-x=ok]').click(); }); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const quiet = () => ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  const go = async zone => { await ev(z => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y; }, zone); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await p.waitForTimeout(1600); await quiet(); };
  const at = (x, y) => ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.P.target = null; }, [x, y]);
  await quiet(); await ev(() => { window.__G.G.hero.lvl = 15; });
  await go('shroom'); await go('swamp');
  // жители у заставы со знаками
  await at(4450, 1560); await shot('npcs');
  // разговор с Игнатом и взятие задания
  await at(4120, 1545); await p.waitForTimeout(300); if (phone) await p.click('#actUse'); else await p.keyboard.press('KeyE'); await shot('ignat', 700);
  const acc = await ev(() => { const b = [...document.querySelectorAll('.modal button')].find(b => b.textContent.trim() === 'Взять'); if (b) { b.click(); return true; } return false; }); console.log('взято:', acc); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // сети на мостках и идолы капища — предметы заданий видны, когда задание взято
  const take = ids => ev(ids => { const G = window.__G.G, Q = window.__G.Q; G.hero.lvl = 17; for (const id of ids) { const a = Q.QUESTS[id].after; if (a && !G.hero.quests.done[a]) { delete G.hero.quests.act[a]; G.hero.quests.done[a] = 1; } Q.qAccept(G, id); } }, ids);
  await take(['sw_nets', 'sw_hamlet']);
  await at(6400, 2700); await shot('nets');
  await at(2300, 1450); await shot('hamlet');
  await take(['sw_idols']);
  await at(7600, 1250); await shot('idols');
  // перевозчик у Брода и дорога по суше
  await at(620, 2370); await shot('nestor');
  // гать от берега: начало на суше
  await at(4650, 1990); await shot('gat-start');
  if (!phone) { await p.keyboard.press('KeyK'); await shot('map', 600); await p.keyboard.press('Escape'); await p.keyboard.press('KeyL'); await shot('journal', 500); await p.keyboard.press('Escape'); }
  console.log(tag, errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет');
  await ctx.close();
}
(async () => { const b = await chromium.launch(); await runOn(b, false); await runOn(b, true); await b.close(); })();
