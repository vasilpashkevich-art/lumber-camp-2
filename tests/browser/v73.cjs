// Версия 73: умения R/F и пассивные, эффекты всех умений, окно развития героя с живыми образцами ▶, таланты и сброс у наставника; телефон — дуга кнопок.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
// герой 20-го уровня у лагеря: три моба рядом, бессмертные и безвредные
const SETUP = ([lvl, tal]) => {
  const M = window.__G, G = M.G, h = G.hero; h.lvl = lvl; h.talents = tal || {}; M.refresh(); G.P.hp = G.st.maxHp;
  const near = G.mobs.filter(m => m.state !== 'dead' && !m.D.flying).sort((a, b) => Math.hypot(a.x - 1800, a.y - 1500) - Math.hypot(b.x - 1800, b.y - 1500)).slice(0, 3);
  const c = near[0]; G.P.x = c.x - 300; G.P.y = c.y + 140; G.areas = []; G.traps = []; G.P.buf.berserk = 0; G.P.dir = 1; G.P.mvx = 1; G.P.mvy = 0;
  near.forEach((m, i) => { m.hp = m.max = 1e5; m.dmg = 0; m.x = G.P.x + 110 + [0, 40, 10][i]; m.y = G.P.y + [0, -40, 45][i]; m.hx = m.x; m.hy = m.y; m.burn = m.bleed = m.venom = null; m.stun = m.root = m.chill = m.frozen = 0; m.state = 'chase'; m.D = { ...m.D, speed: 8, trait: null, smash: null, summon: null }; });
  for (const o of G.mobs) if (!near.includes(o) && Math.hypot(o.x - c.x, o.y - c.y) < 900) { o.state = 'dead'; o.respawnAt = 1e9; }
  G.P.target = near[0]; G.P.acd = {}; return near.map(m => m.key);
};
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 0) => { if (w) await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/v73-${n}.png` }); };
  const mk = async (name, cls) => { await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click(`.clsCard[data-c=${cls}]`); await p.fill('#newName', name); await p.click('[data-x=ok]'); await p.waitForTimeout(150); };
  const key = async (k, w) => { await p.keyboard.press(k); if (w) await p.waitForTimeout(w); };
  await p.goto(URL); await p.waitForTimeout(300);
  const plan = {
    warrior: [['KeyC', 330, 'charge'], ['KeyV', 420, 'whirl'], ['KeyR', 200, 'crush'], ['KeyF', 300, 'berserk'], ['KeyF', 1500, 'berserk2']],
    mage: [['KeyC', 600, 'fireball'], ['KeyV', 550, 'frost'], ['KeyR', 1600, 'pillar'], ['KeyF', 350, 'nova'], ['', 900, 'frozen']],
    archer: [['KeyC', 420, 'bleed'], ['KeyV', 700, 'net'], ['KeyR', 1300, 'volley'], ['KeyF', 400, 'trap']],
  };
  let n = 0;
  for (const cls of ['warrior', 'mage', 'archer']) {
    await mk('Герой' + n, cls); await p.click(`.slot:nth-child(${++n})`); await p.click('#selEnter'); await p.waitForTimeout(900);
    await ev(SETUP, [20, {}]); await p.waitForTimeout(300);
    await shot(cls + '-hud');
    for (const [k, w, name] of plan[cls]) {
      await ev(SETUP, [20, {}]); await p.waitForTimeout(150);
      if (name === 'frozen') continue;
      if (name === 'crush' || name === 'whirl' || name === 'nova' || name === 'berserk2') await ev(() => { const G = window.__G.G, m = G.P.target; G.P.x = m.x - 45; G.P.y = m.y; });
      if (k) await key(k, w); await shot(cls + '-' + name);
      if (name === 'nova') { await p.waitForTimeout(900); await shot(cls + '-frozen'); }
      if (name === 'trap') { await ev(() => { const G = window.__G.G, tr = G.traps[0], m = G.P.target; if (tr && m) { m.x = tr.x + 8; m.y = tr.y; } }); await shot(cls + '-trap2', 250); }
    }
    // пассивное: Жажда битвы (воин) — моба добить
    if (cls === 'warrior') { await ev(SETUP, [20, {}]); await ev(() => { const G = window.__G.G; G.P.hp = G.st.maxHp * 0.5; const m = G.P.target; G.P.x = m.x - 50; m.hp = 1; }); await key('Space', 500); await shot('warrior-thirst'); }
    if (cls === 'archer') { await ev(SETUP, [20, {}]); await ev(() => { const m = window.__G.G.P.target; m.hp = m.max * 0.2; }); await shot('archer-execute', 300); }
    if (cls === 'mage') { await ev(SETUP, [20, {}]); await ev(() => { const G = window.__G.G; G.st.crit = 100; }); await key('KeyC', 650); await shot('mage-ignite'); }
    // окно развития героя
    await ev(SETUP, [17, {}]); await ev(() => document.querySelectorAll('.modal').forEach(m => m.remove())); await p.waitForTimeout(200);
    console.log(cls, 'значок «можно выбрать талант»:', await ev(() => !document.querySelector('#pfTal').hidden));
    await p.click('#pfRing'); await p.waitForTimeout(400); await shot(cls + '-dev');
    const plays = await p.$$('.dab .play'); console.log(cls, 'кнопок ▶ у умений:', plays.length);
    await plays[2].hover(); await p.waitForTimeout(900); await shot(cls + '-preview');
    const tl = await p.$$('.trow:not(.locked) .play'); if (tl.length) { await tl[0].hover(); await p.waitForTimeout(700); await shot(cls + '-preview-talent'); }
    await p.mouse.move(5, 5); await p.click('.tal.can'); await p.waitForTimeout(200); await shot(cls + '-ask'); await p.click('[data-a=yes]'); await p.waitForTimeout(200);
    console.log(cls, 'таланты после выбора:', await ev(() => JSON.stringify(window.__G.G.hero.talents)));
    await shot(cls + '-dev2'); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await ev(() => window.__G.toSelect()); await p.waitForTimeout(400);
  }
  // наставник в Столице: сброс талантов за деньги
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await ev(() => { const G = window.__G.G, b = G.W.houses.find(h => h.mentor); G.hero.gold = 5000; G.P.x = b.x + 30; G.P.y = b.y + 60; }); await p.waitForTimeout(400); await shot('mentor-house');
  await key('KeyE', 500); await shot('mentor');
  const rb = await p.$('[data-x=reset]'); if (rb) { await rb.click(); await p.waitForTimeout(200); }
  console.log('после сброса у наставника:', await ev(() => JSON.stringify(window.__G.G.hero.talents)), 'денег', await ev(() => window.__G.G.hero.gold));
  await p.keyboard.press('Escape');
  // телефон
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const q = await ctx.newPage();
  q.on('pageerror', e => errs.push('телефон: ' + e.message));
  await q.goto(URL); await q.waitForTimeout(400); await q.tap('#selNew'); await q.waitForTimeout(150); await q.tap('.clsCard[data-c=warrior]'); await q.fill('#newName', 'Палец'); await q.tap('[data-x=ok]'); await q.waitForTimeout(150);
  await q.tap('.slot:nth-child(1)'); await q.tap('#selEnter'); await q.waitForTimeout(1000);
  await q.evaluate(SETUP, [20, {}]); await q.waitForTimeout(400); await q.screenshot({ path: `${OUT}/v73-phone.png` });
  await q.tap('#actAbil2'); await q.waitForTimeout(400); await q.screenshot({ path: `${OUT}/v73-phone-whirl.png` });
  await q.tap('#actAbil4'); await q.waitForTimeout(700); await q.screenshot({ path: `${OUT}/v73-phone-berserk.png` });
  console.log('телефон — ярость:', await q.evaluate(() => window.__G.G.P.buf.berserk > 0));
  await q.tap('#pfRing'); await q.waitForTimeout(500); await q.screenshot({ path: `${OUT}/v73-phone-dev.png` });
  await q.tap('.dab .play >> nth=3'); await q.waitForTimeout(800); await q.screenshot({ path: `${OUT}/v73-phone-preview.png` });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close();
})();
