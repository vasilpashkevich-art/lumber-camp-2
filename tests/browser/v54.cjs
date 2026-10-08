// Версия 54 в браузере: кнопки экрана входа на разных экранах, добыча в теле, карта K, логова, снятие вещей.
// Запуск: NODE_PATH=$(npm root -g) node tests/browser/v54.cjs
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';

(async () => {
  const b = await chromium.launch(); const errs = [];
  const watch = (p, tag) => { p.on('pageerror', e => errs.push(tag + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ': ' + m.text()); }); };
  // 1. экран входа с 5 героями: все кнопки видны
  let p = await b.newPage({ viewport: { width: 1366, height: 768 } }); watch(p, '1366'); p.setDefaultTimeout(5000);
  await p.goto(URL); await p.waitForTimeout(500);
  for (const [c, n] of [['warrior', 'Торвальд'], ['mage', 'Мирна'], ['archer', 'Ясь'], ['warrior', 'Бранко'], ['mage', 'Злата']]) {
    console.log('создаю', n); await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${c}]`); await p.fill('#newName', n); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  }
  for (const vp of [[1366, 768], [1280, 720], [1440, 860], [1920, 1080], [1024, 640]]) {
    await p.setViewportSize({ width: vp[0], height: vp[1] }); await p.waitForTimeout(250);
    const bad = await p.evaluate(() => ['#selNew', '#selDel', '#selSet', '#selSave', '#selLoad', '#selEnter'].filter(s => { const r = document.querySelector(s).getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return r.bottom > innerHeight || r.top < 0 || !(e && (e === document.querySelector(s) || document.querySelector(s).contains(e))); }));
    console.log(`экран ${vp[0]}×${vp[1]}: ${bad.length ? 'НЕ ВИДНО ' + bad.join(' ') : 'все кнопки видны'}`);
    if (bad.length) errs.push(`кнопки не видны на ${vp}: ${bad}`);
    await p.screenshot({ path: `${OUT}/v54-select-${vp[0]}x${vp[1]}.png` });
  }
  await p.setViewportSize({ width: 1440, height: 860 });
  // 2. в мир воином
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const G = window.__G.G; const m = G.mobs.find(m => m.kind === 'fox'); G.P.x = m.x - 40; G.P.y = m.y; m.hp = 1; G.P.target = m; });
  await p.keyboard.down('Space'); await p.waitForTimeout(2500); await p.keyboard.up('Space'); await p.waitForTimeout(300);
  const st = await p.evaluate(() => { const G = window.__G.G; const c = G.corpses.find(c => c.money > 0 || c.items.length); if (c) { c.items.push(window.__G.rollDrop('warrior', 3, true, Math.random), window.__G.rollDrop('warrior', 2, false, Math.random)); G.P.x = c.x + 30; G.P.y = c.y + 6; G.mobs.forEach(m => { if (Math.hypot(m.x - c.x, m.y - c.y) < 600) { m.state = 'dead'; m.respawnAt = G.t + 999; } }); } return { gold: G.hero.gold, corpses: G.corpses.length, money: c && c.money }; });
  console.log('после боя:', st);
  await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v54-corpse.png' });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/v54-loot.png' });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(400);
  const after = await p.evaluate(() => ({ gold: window.__G.G.hero.gold, open: !!document.querySelector('.box.loot') }));
  console.log('после E:', after); if (!(after.gold > 0) || after.open) errs.push('подсумок: деньги не взяты или окно не закрылось');
  await p.screenshot({ path: OUT + '/v54-after-loot.png', clip: { x: 1100, y: 0, width: 340, height: 230 } });
  // 3. карта K
  await p.keyboard.press('KeyK'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v54-map.png' });
  await p.keyboard.press('KeyK'); await p.waitForTimeout(200);
  if (await p.evaluate(() => !!document.querySelector('.box.map'))) errs.push('карта не закрылась по K');
  // 4. логова в мире
  const camps = await p.evaluate(() => window.__G.G.W.camps.map(c => ({ x: c.x, y: c.y, lair: c.lair, name: c.name })));
  const seen = new Set();
  for (const c of camps) {
    if (seen.has(c.lair)) continue; seen.add(c.lair);
    await p.evaluate(c => { const G = window.__G.G; G.P.x = c.x + 10; G.P.y = c.y + 170; G.mobs.forEach(m => { if (m.state !== 'dead') m.state = 'idle'; }); G.P.hp = 99999; }, c);
    await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v54-lair-${c.lair}.png`, clip: { x: 420, y: 160, width: 600, height: 420 } });
  }
  await p.screenshot({ path: OUT + '/v54-mini.png', clip: { x: 1180, y: 0, width: 260, height: 220 } });
  // 5. снять вещи: рубаха, штаны, оружие
  await p.evaluate(() => { const G = window.__G.G; G.P.hp = 50; G.P.x = G.W.cap.x; G.P.y = G.W.cap.y + 150; });
  await p.keyboard.press('KeyI'); await p.waitForTimeout(300);
  for (let i = 0; i < 3; i++) { await p.click('.eq .cell:nth-child(2)'); await p.waitForTimeout(100); if (i === 0) await p.click('.eq .cell:nth-child(3)'); if (i === 0) await p.click('.eq .cell:nth-child(4)'); }
  await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/v54-naked-char.png' });
  const eq = await p.evaluate(() => ({ eq: Object.values(window.__G.G.hero.eq).filter(Boolean).length, bag: window.__G.G.hero.bag.map(i => i.name) }));
  console.log('после снятия:', eq);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/v54-naked-world.png', clip: { x: 520, y: 260, width: 400, height: 300 } });
  await p.screenshot({ path: OUT + '/v54-hud.png', clip: { x: 0, y: 0, width: 420, height: 130 } });
  // назад в сумку — надеть всё обратно
  await p.keyboard.press('KeyI'); await p.waitForTimeout(200);
  for (let i = 0; i < 3; i++) { await p.click('.bag .cell:has(svg)'); await p.waitForTimeout(80); }
  console.log('надето обратно:', await p.evaluate(() => Object.values(window.__G.G.hero.eq).filter(Boolean).map(i => i.name)));
  await p.keyboard.press('Escape');
  // 6. старое сохранение v53 (деньги числом) загружается
  await p.evaluate(() => { const old = { v: 1, id: 'old53', name: 'Старый', cls: 'archer', lvl: 4, xp: 10, gold: 345, eq: { head: null, chest: null, legs: null, weapon: null }, bag: [], potions: 1, stats: { kills: 5, deaths: 0, gold: 345, items: 0, play: 100 }, dead: {}, worldT: 50 };
    localStorage.setItem('lumber-camp2-hero-old53', JSON.stringify(old)); });
  await p.evaluate(() => window.__G.start('old53')); await p.waitForTimeout(800);
  const old = await p.evaluate(() => ({ gold: window.__G.G.hero.gold, txt: document.querySelector('#gold').textContent }));
  console.log('старое сохранение:', old); if (old.gold !== 345) errs.push('старое сохранение: деньги потерялись');
  await p.screenshot({ path: OUT + '/v54-oldsave.png', clip: { x: 1100, y: 0, width: 340, height: 230 } });
  // 7. телефон: экран входа
  const m = await b.newPage({ viewport: { width: 400, height: 760 }, isMobile: true, hasTouch: true }); watch(m, 'phone');
  await m.goto(URL); await m.waitForTimeout(400);
  const dump = await p.evaluate(() => JSON.stringify(Object.assign({}, localStorage)));
  await m.evaluate(d => { for (const [k, v] of Object.entries(JSON.parse(d))) localStorage.setItem(k, v); }, dump); await m.reload(); await m.waitForTimeout(500);
  const badM = await m.evaluate(() => ['#selNew', '#selDel', '#selSet', '#selSave', '#selLoad', '#selEnter'].filter(s => { const r = document.querySelector(s).getBoundingClientRect(); return r.bottom > innerHeight || r.top < 0; }));
  console.log('телефон: ' + (badM.length ? 'НЕ ВИДНО ' + badM : 'все кнопки видны'));
  await m.screenshot({ path: OUT + '/v54-phone-select.png' });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
