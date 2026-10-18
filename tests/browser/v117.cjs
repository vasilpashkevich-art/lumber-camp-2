// Версия 117: карта подземелья — звёзды только у боссов; Жрица Квакша (головастики, обряд с тотемами, дождь и листья) и Король квакунов (трон, язык, жаба, квак и колонны, проглатывание).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function enter(p, cls, name) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${cls}]`); await p.waitForTimeout(100);
  await p.evaluate(n => { document.querySelector('#newName').value = n; document.querySelector('[data-x=ok]').click(); }, name); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await p.evaluate(() => { const G = window.__G.G; G.hero.lvl = 17; window.__G.refresh(); const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const T = G.W.temple; G.P.x = T.x; G.P.y = T.y - 40; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
}
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 0, pg = p) => { if (w) await pg.waitForTimeout(w); await pg.screenshot({ path: `${OUT}/v117-${n}.png` }); };
  await enter(p, 'mage', 'Чародей');
  console.log('зона:', await ev(() => window.__G.G.hero.zone));
  // карта: убит Бульк — его звезда тусклая
  await ev(() => { const G = window.__G.G; G.dg.bosses.boss_bulk = true; G.P.x = 3300; G.P.y = 2400; });
  await p.waitForTimeout(400); await shot('minimap');
  await p.keyboard.press('KeyK'); await shot('map', 400); await p.keyboard.press('KeyK'); await p.waitForTimeout(200);
  const fight = (kind, hp, dx = -200, dy = 40, keep = []) => ev(([k, hp, dx, dy, keep]) => { const G = window.__G.G; G.W.unseal(); G.mobs.forEach(m => { if (m.kind !== k && !keep.includes(m.camp.name)) { m.state = 'dead'; m.respawnAt = 1e12; } else if (m.kind !== k) { m.state = 'idle'; m.hp = m.max; m.x = m.hx; m.y = m.hy; m.respawnAt = 0; } }); const m = G.mobs.find(m => m.kind === k); m.state = 'chase'; m.hp = m.max * hp; m.x = m.hx; m.y = m.hy; m.B = null; G.st.maxHp = 4000; G.P.hp = 4000; G.P.held = null; G.P.stunT = 0; G.P.x = m.x + dx; G.P.y = m.y + dy; G.P.target = m; window.__boss = m; }, [kind, hp, dx, dy, keep]);
  const act = k => ev(k => { const m = window.__boss, G = window.__G.G; G.P.hp = 4000; if (!m.B) return 'нет B'; for (const q in m.B.cd) m.B.cd[q] = 99; m.B.cd[k] = 0; m.B.act = null; m.stun = 0; m.cd = 0; return 'ok'; }, k);
  const st = () => ev(() => { const m = window.__boss, G = window.__G.G; return m.B ? `фаза ${m.B.phase + 1}, умение ${m.B.act ? m.B.act.k : '—'}, неуязв. ${m.B.immune.toFixed(1)}, оглушён ${m.stun.toFixed(1)}, плен ${G.P.held ? G.P.held.kind : '—'}, помощников ${G.mobs.filter(o => o.owner === m && o.state !== 'dead').length}` : 'нет'; });
  const hold = () => ev(() => { window.__G.G.P.hp = 4000; });
  // Жрица
  await fight('boss_priestess', 1, -220); await p.waitForTimeout(300); await act('adds'); await shot('pr-adds', 900); console.log('головастики:', await st());
  await fight('boss_priestess', 0.55, -260, 120); await p.waitForTimeout(3500); await hold(); await shot('pr-rite'); console.log('обряд:', await st());
  await fight('boss_priestess', 0.25, -200, 80); await p.waitForTimeout(700); await ev(() => { const G = window.__G.G, pd = G.pads[0]; G.P.x = pd.x; G.P.y = pd.y; }); await p.waitForTimeout(300); await hold(); await shot('pr-rain'); console.log('дождь:', await st(), 'листьев', await ev(() => window.__G.G.pads.length));
  // Король
  await fight('boss_king', 1, -150, 180, ['Стража Короля']); await p.waitForTimeout(1500); await hold(); await shot('king-throne'); console.log('трон:', await st());
  await fight('boss_king', 0.6, -260, 60); await p.waitForTimeout(300); await act('tongue'); await shot('king-tongue-tele', 400); await p.waitForTimeout(700); await hold(); await shot('king-held', 200); console.log('язык:', await st());
  await fight('boss_king', 0.3, -60, 230); await p.waitForTimeout(1900); await act('kvak'); await shot('toad-kvak-wind', 1200); console.log('квак:', await st());
  await p.waitForTimeout(1300); await shot('toad-kvak-hit'); console.log('после:', await ev(() => `оглушён ${window.__G.G.P.stunT.toFixed(1)}`));
  await ev(() => { const G = window.__G.G; G.W.colHit = { 8: 2, 9: 1 }; const b = G.W.blocks.find(q => q.col === 8); if (b) b.off = true; G.P.stunT = 0; G.P.x = 2950; G.P.y = 880; }); await shot('toad-columns', 300);
  await fight('boss_king', 0.3, 90, 10); await p.waitForTimeout(1900); await act('swallow'); await p.waitForTimeout(1300); await hold(); await shot('toad-swallow'); console.log('пасть:', await st());
  await ev(() => { const G = window.__G.G; G.P.held = null; G.mobs.forEach(m => { m.state = 'dead'; }); G.rain = null; G.pads = []; });
  await p.keyboard.press('KeyJ'); await p.waitForTimeout(300); await p.click('.dgwin .bosses li:nth-child(3) summary'); await p.click('.dgwin .bosses li:nth-child(4) summary'); await shot('dg-window', 400); await p.keyboard.press('Escape');
  // телефон: дождь и плен
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const ph = await ctx.newPage(); ph.on('pageerror', e => errs.push('phone ' + e.message));
  await enter(ph, 'warrior', 'Воин');
  const pf = (f, a) => ph.evaluate(f, a);
  await pf(() => { const G = window.__G.G; G.W.unseal(); const m = G.mobs.find(m => m.kind === 'boss_priestess'); G.mobs.forEach(o => { if (o !== m) { o.state = 'dead'; o.respawnAt = 1e12; } }); m.state = 'chase'; m.hp = m.max * 0.25; G.st.maxHp = G.P.hp = 4000; G.P.x = m.x - 200; G.P.y = m.y + 60; window.__boss = m; });
  await ph.waitForTimeout(900); await pf(() => { const G = window.__G.G, pd = G.pads[1]; G.P.x = pd.x; G.P.y = pd.y; }); await shot('phone-rain', 300, ph);
  await pf(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; }); const m = G.mobs.find(m => m.kind === 'boss_king'); m.state = 'chase'; m.hp = m.max * 0.6; m.B = null; m.x = m.hx; m.y = m.hy; G.rain = null; G.pads = []; G.P.hp = 4000; G.P.x = m.x - 240; G.P.y = m.y + 40; window.__boss = m; });
  await ph.waitForTimeout(300); await pf(() => { const m = window.__boss; for (const q in m.B.cd) m.B.cd[q] = 99; m.B.cd.tongue = 0; m.B.act = null; m.cd = 0; });
  await ph.waitForTimeout(1300); await shot('phone-held', 0, ph); console.log('телефон плен:', await pf(() => window.__G.G.P.held ? 'да' : 'нет'));
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
