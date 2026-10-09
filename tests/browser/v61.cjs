// Версия 61: окно героя с 7 местами и сумкой 8×4, Гильдия рудокопов, плавильня, жилы и копание, скалы, аксессуар на 1, окна закрываются по E.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Горняк'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a);
  // Гильдия рудокопов
  await ev(() => { const G = window.__G.G; G.hero.gold = 500; const b = G.W.houses.find(b => b.guild); G.P.x = b.x; G.P.y = b.y + 50; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/v61-guild.png' });
  await p.click('[data-x=learn]'); await p.click('[data-x=pick]'); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/v61-guild-after.png' });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(300);
  if (await p.$('.modal')) errs.push('Гильдия не закрылась по E');
  // к жиле, копать
  await ev(() => { const G = window.__G.G; const v = G.veins[0]; G.P.x = v.x + 34; G.P.y = v.y + 6; G.P.lastCombat = -99; });
  await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v61-vein.png' });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500); await p.screenshot({ path: OUT + '/v61-mining.png' });
  await p.waitForTimeout(2200); await p.screenshot({ path: OUT + '/v61-mined.png' });
  const ore = await ev(() => { const h = window.__G.G.hero; return { ore: h.bag.filter(i => i.kind === 'ore').reduce((s, i) => s + i.n, 0), skill: h.prof.mining }; });
  console.log('после копания:', ore); if (!ore.ore) errs.push('руда не добыта');
  // скалы у края
  await ev(() => { const G = window.__G.G; const o = G.W.rocks[0]; G.P.x = o.x + o.w; G.P.y = o.y + 60; }); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/v61-rocks.png' });
  // вещи: кольцо, шея, аксессуар, руда стопками
  await ev(() => { const { G, makeItem } = window.__G; const h = G.hero; const M = window.__G;
    h.eq.ring = makeItem('warrior', 'ring', 6, 'rare'); h.eq.neck = makeItem('warrior', 'neck', 5, 'good');
    const t = M.makeTrinket('warrior', 6, 'rare', Math.random, 'stoneheart'); h.eq.trinket = t;
    const add = (it, pos) => { it.pos = pos; h.bag.push(it); };
    add(M.makeTrinket('warrior', 6, 'rare', Math.random, 'stormeye'), 8); add(makeItem('warrior', 'ring', 7, 'good'), 9); add(makeItem('warrior', 'neck', 7, 'rare'), 10);
    M.addStack(h, M.makeStack('ore', 'copper', 26)); M.addStack(h, M.makeStack('bar', 'copper', 5)); M.addStack(h, M.makeStack('ore', 'tin', 3));
    window.__G.refresh(); });
  await p.keyboard.press('KeyI'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v61-char.png' });
  const tb = await p.$$('.bag .cell'); 
  const pos = await ev(() => window.__G.G.hero.bag.find(i => i.trinket).pos); await tb[pos].hover(); await p.waitForTimeout(250); await p.screenshot({ path: OUT + '/v61-tip-trinket.png' });
  const pos2 = await ev(() => window.__G.G.hero.bag.find(i => i.slot === 'neck').pos); await tb[pos2].hover(); await p.waitForTimeout(250); await p.screenshot({ path: OUT + '/v61-tip-neck.png' });
  const pos3 = await ev(() => window.__G.G.hero.bag.find(i => i.kind === 'ore').pos); await tb[pos3].hover(); await p.waitForTimeout(250); await p.screenshot({ path: OUT + '/v61-tip-ore.png' });
  await p.keyboard.press('KeyI'); await p.waitForTimeout(200);
  // аксессуар на 1
  await ev(() => { const G = window.__G.G; const m = G.mobs.find(m => m.kind === 'wolf'); m.state = 'idle'; m.hp = m.max = 999; m.x = G.P.x + 60; m.y = G.P.y; m.respawnAt = 0; });
  await p.keyboard.press('Digit1'); await p.waitForTimeout(250); await p.screenshot({ path: OUT + '/v61-stone.png' });
  // плавильня: кузница, закрытие по E
  await ev(() => { const G = window.__G.G; const b = G.W.houses.find(b => b.id === 'forge'); G.P.x = b.x; G.P.y = b.y + 50; G.P.lastCombat = -99; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); });
  await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v61-smelt.png' });
  await p.click('.ware2 [data-x=all]'); await p.waitForTimeout(200); await p.screenshot({ path: OUT + '/v61-smelt-after.png' });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(300); if (await p.$('.modal')) errs.push('плавильня не закрылась по E');
  // рынок: открыть E, закрыть E
  await ev(() => { const G = window.__G.G; const b = G.W.houses.find(b => b.vendor); G.P.x = b.x; G.P.y = b.y + 50; });
  await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v61-vendor.png' });
  if (!(await p.$('.modal'))) errs.push('рынок не открылся');
  await p.keyboard.press('KeyE'); await p.waitForTimeout(300); if (await p.$('.modal')) errs.push('рынок не закрылся по E');
  await p.keyboard.press('KeyE'); await p.waitForTimeout(300); if (!(await p.$('.modal'))) errs.push('рынок не открылся снова');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); if (await p.$('.modal')) errs.push('рынок не закрылся по Esc');
  // Хутор Подгорный: кузня, оловянная жила
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
