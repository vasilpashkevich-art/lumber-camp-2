// Версия 90: Храм квакунов целиком — залы, сундуки, боссы, запечатанный ход, портал, окно «Подземелья» (компьютер и телефон).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 600) => { await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/v90-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Лесник'); await p.click('[data-x=ok]'); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  // окно подземелий снаружи: готово к походу
  await p.keyboard.press('KeyJ'); await shot('dg-win-ready', 400); console.log('окно:', await ev(() => document.querySelector('.dgwin .dgst').textContent)); await p.keyboard.press('Escape');
  await ev(() => { const G = window.__G.G; G.hero.lvl = 16; window.__G.refresh(); G.st.maxHp = G.P.hp = 99999; const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const T = G.W.temple; G.P.x = T.x; G.P.y = T.y - 40; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; });
  console.log('зона:', await ev(() => window.__G.G.hero.zone));
  const go = async (x, y) => { await ev(([x, y]) => { const G = window.__G.G; G.P.x = x; G.P.y = y; G.P.nav = null; G.P.goal = null; G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); }, [x, y]); await p.waitForTimeout(400); };
  const kill = async kind => ev(k => { const G = window.__G.G, m = G.mobs.find(m => m.kind === k && m.state !== 'dead'); if (k === 'boss_king') { G.mobs.forEach(o => { if (o.camp.name === 'Стража Короля') { o.state = 'dead'; o.respawnAt = 1e12; } }); if (m.B) m.B.immune = 0; }   /* v117: на троне неуязвим, пока жива стража */ m.hp = 1; m.stun = 6; G.P.x = m.x - 50; G.P.y = m.y; G.P.target = m; return m.D.name; }, kind);
  // окно внутри
  await p.keyboard.press('KeyJ'); await shot('dg-win-inside', 400); console.log('окно внутри:', await ev(() => document.querySelector('.dgwin .dgst').textContent)); await p.keyboard.press('Escape');
  // сундук в Казармах: подойти, E — подсумок с вещью
  await go(1750, 2240); await p.keyboard.press('KeyE'); await p.waitForTimeout(500); console.log('сундук:', await ev(() => { const G = window.__G.G; return JSON.stringify(G.dg.chests) + ' ' + (document.querySelector('.modal') ? 'подсумок открыт' : 'нет окна'); })); await shot('chest', 300);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // Святилище: запечатанный ход закрыт
  await go(3300, 1500); await shot('shrine-sealed'); console.log('запечатан:', await ev(() => window.__G.G.W.sealed.size + ' ' + !window.__G.G.W.walkable(3300, 1100)));
  // боссы: Бульк, Аспид, Жрица — добить ударом (здоровье 1)
  for (const [k, x, y] of [['boss_bulk', 1100, 2350], ['boss_aspid', 5120, 2350], ['boss_priestess', 3300, 1450]]) {
    await go(x - 60, y); const n = await kill(k); for (let i = 0; i < 30; i++) { await p.keyboard.press('Space'); await p.waitForTimeout(120); if (await ev(k => window.__G.G.mobs.find(m => m.kind === k).state === 'dead', k)) break; }
    console.log(n, await ev(k => window.__G.G.mobs.find(m => m.kind === k).state, k));
    if (k === 'boss_bulk') await shot('bulk-dead', 500);
  }
  console.log('ход открыт:', await ev(() => window.__G.G.W.sealed.size === 0 && window.__G.G.W.walkable(3300, 1100)), 'тост:', await ev(() => document.querySelector('#toasts').textContent.slice(0, 80)));
  await go(3300, 1500); await shot('shrine-open');
  await go(3300, 700); await shot('throne');
  await go(3300, 640); const kn = await kill('boss_king'); for (let i = 0; i < 30; i++) { await p.keyboard.press('Space'); await p.waitForTimeout(120); if (await ev(() => window.__G.G.mobs.find(m => m.kind === 'boss_king').state === 'dead')) break; }
  console.log(kn, await ev(() => window.__G.G.mobs.find(m => m.kind === 'boss_king').state), 'портал:', await ev(() => window.__G.G.W.exits.some(e => e.portal)));
  await go(3650, 850); await shot('portal', 700);
  console.log('добыча Короля:', await ev(() => { const c = window.__G.G.corpses.find(c => c.kind === 'boss_king'); return c.items.map(i => i.rar + ' ' + i.name).join('; '); }));
  await p.keyboard.press('KeyJ'); await shot('dg-win-done', 400); console.log('окно после:', await ev(() => document.querySelector('.dgwin').textContent.replace(/\s+/g, ' ').slice(0, 400))); await p.keyboard.press('Escape');
  // портал наружу
  await go(3700, 830); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500); console.log('вышел:', await ev(() => window.__G.G.hero.zone), 'таймер:', await ev(() => { const h = window.__G.G.hero; return Math.round((h.dungeons.temple.resetAt - Date.now()) / 1000); }));
  await p.keyboard.press('KeyJ'); await shot('dg-win-timer', 400); console.log('окно снаружи:', await ev(() => document.querySelector('.dgwin .dgst').textContent)); await p.keyboard.press('Escape');
  // старое положение героя внутри по старым координатам — встаёт у костра
  await ev(() => { const G = window.__G.G; G.hero.zone = 'temple'; G.hero.pos = { x: 1600, y: 2230 }; });
  // телефон: окно подземелий
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const ph = await ctx.newPage(); ph.on('pageerror', e => errs.push('phone ' + e.message));
  await ph.goto(URL); await ph.waitForTimeout(500);
  await ph.click('#selNew', { noWaitAfter: true }); await ph.waitForSelector('#newName'); await ph.waitForTimeout(150); await ph.click('.clsCard[data-c=mage]'); await ph.waitForTimeout(100);
  await ph.evaluate(() => { document.querySelector('#newName').value = 'Маг'; document.querySelector('[data-x=ok]').click(); }); await ph.waitForSelector('.modal', { state: 'detached' }); await ph.waitForTimeout(200);
  await ph.click('.slot:nth-child(1)'); await ph.click('#selEnter'); await ph.waitForTimeout(900);
  await ph.tap('#btnDg'); await ph.waitForTimeout(500); await ph.screenshot({ path: `${OUT}/v90-phone-win.png` });
  console.log('телефон окно:', await ph.evaluate(() => !!document.querySelector('.dgwin')));
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
