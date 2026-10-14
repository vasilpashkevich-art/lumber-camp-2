// Версия 95: задания — жители со знаками, разговор, журнал (L), отслеживание, области на карте, предметы заданий (компьютер и телефон).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function enter(p, cls, name) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${cls}]`); await p.waitForTimeout(100);
  await p.evaluate(n => { document.querySelector('#newName').value = n; document.querySelector('[data-x=ok]').click(); }, name); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(1000);
}
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 500) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/v95-${n}.png` }); };
  const at = (x, y) => ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.P.goal = null; }, [x, y]);
  await enter(p, 'warrior', 'Лесник');
  const N = await ev(() => { const G = window.__G.G; return Object.fromEntries(G.npcs.map(n => [n.id, [n.x, n.y]])); });
  console.log('жители:', JSON.stringify(N));
  await at(N.gordey[0] - 30, N.gordey[1] + 110); await shot('gordey-mark');
  await at(N.gordey[0], N.gordey[1] + 50); await p.keyboard.press('KeyE'); await shot('dialog-take', 400);
  await p.click('.qrow .btn.main'); await p.waitForTimeout(300); await shot('dialog-after', 200); await p.keyboard.press('Escape');
  await shot('tracker', 300);
  // к Фролу: сдать «Приказ капитана», взять лис и шкуры
  await at(N.frol[0], N.frol[1] + 50); await p.keyboard.press('KeyE'); await shot('frol-turnin', 400); await p.click('.qrow .btn.main'); await p.waitForTimeout(300); await shot('frol-list', 200);
  await p.click('.qli[data-q=pine_foxes]'); await p.waitForTimeout(150); await p.click('.qrow .btn.main'); await p.waitForTimeout(200); await p.keyboard.press('Escape');
  await ev(() => { const G = window.__G.G; G.hero.lvl = 2; window.__G.refresh && window.__G.refresh(); });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(300); await p.click('.qli[data-q=pine_pelts]'); await p.waitForTimeout(200); await shot('pelts-offer', 200); await p.click('.qrow .btn.main'); await p.keyboard.press('Escape');
  await ev(() => { const G = window.__G.G; G.hero.quests.act.pine_pelts.n[0] = 4; G.hero.quests.act.pine_foxes.n[0] = 6; G.hero.quests.act.pine_foxes.ready = 1; });
  await at(N.frol[0] - 200, N.frol[1] + 160); await shot('frol-ready', 500);
  await p.keyboard.press('KeyK'); await shot('map', 500); await p.keyboard.press('Escape');
  await p.keyboard.press('KeyL'); await shot('journal', 400); await p.keyboard.press('Escape');
  // силки: взять задание «Чужие силки», подойти к силкам
  await ev(() => { const G = window.__G.G, S = G.hero.quests; S.done.pine_foxes = 1; delete S.act.pine_foxes; S.track = S.track.filter(x => x !== 'pine_foxes'); });
  await at(N.frol[0], N.frol[1] + 50); await p.keyboard.press('KeyE'); await p.waitForTimeout(300); const has = await ev(() => !!document.querySelector('.qli[data-q=pine_snares]')); if (has) { await p.click('.qli[data-q=pine_snares]'); await p.waitForTimeout(150); } await p.click('.qrow .btn.main'); await p.keyboard.press('Escape');
  const sn = await ev(() => window.__G.G.qobjs.map(o => [o.x, o.y]));
  console.log('силков:', sn.length);
  await at(sn[0][0] + 60, sn[0][1] + 60); await shot('snare', 500); await at(sn[0][0], sn[0][1] + 20); await p.keyboard.press('KeyE'); await p.waitForTimeout(400); console.log('силки:', await ev(() => window.__G.G.hero.quests.act.pine_snares.n[0]));
  // шатры: задание «Красный петух» — сразу взятое, подойти и поджечь
  await ev(() => { const G = window.__G.G, S = G.hero.quests; G.hero.lvl = 4; for (const id of ['pine_road', 'pine_foxes', 'pine_pelts', 'pine_snares', 'pine_boars', 'pine_spiders', 'pine_letter', 'pine_scout']) { S.done[id] = 1; delete S.act[id]; } S.track = []; S.act.pine_tents = { n: [0, 2], got: [[], []] }; S.track.push('pine_tents'); });
  await ev(() => window.__G.Q.qObjs(window.__G.G));
  await at(6650, 1700); await p.waitForTimeout(200); await ev(() => window.__G.G.mobs.forEach(m => { if (m.kind.startsWith('bandit')) { m.state = 'dead'; m.respawnAt = 1e12; } }));
  await shot('tents', 500);
  await at(6638, 1630); await p.keyboard.press('KeyE'); await p.waitForTimeout(300); await at(6856, 1640); await p.keyboard.press('KeyE'); await at(6750, 1720); await shot('tents-fire', 700);
  console.log('шатры:', await ev(() => window.__G.G.hero.quests.act.pine_tents.n.join('/')));
  // телефон
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const ph = await ctx.newPage(); ph.on('pageerror', e => errs.push('phone ' + e.message));
  await enter(ph, 'archer', 'Стрелок');
  const Np = await ph.evaluate(() => { const n = window.__G.G.npcs.find(n => n.id === 'gordey'); return [n.x, n.y]; });
  await ph.evaluate(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y + 60; }, Np); await ph.waitForTimeout(500); await ph.screenshot({ path: `${OUT}/v95-phone-npc.png` });
  await ph.tap('#actUse'); await ph.waitForTimeout(500); await ph.screenshot({ path: `${OUT}/v95-phone-dialog.png` });
  await ph.tap('.qrow .btn.main'); await ph.waitForTimeout(300); await ph.tap('.modal .xclose'); await ph.waitForTimeout(400); await ph.screenshot({ path: `${OUT}/v95-phone-tracker.png` });
  await ph.tap('#btnQuest'); await ph.waitForTimeout(400); await ph.screenshot({ path: `${OUT}/v95-phone-journal.png` });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
