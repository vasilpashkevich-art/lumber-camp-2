// Версия 94: боссы с фазами — Воевода Бульк (конус, рывок, щит, топот, прыжок) и Храмовый аспид (бросок, кольцо, сброс кожи, лужи); тактика в окне J.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function enter(p, cls, name, phone) {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${cls}]`); await p.waitForTimeout(100);
  await p.evaluate(n => { document.querySelector('#newName').value = n; document.querySelector('[data-x=ok]').click(); }, name); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  // в храм: снаружи к вратам, E
  await p.evaluate(() => { const G = window.__G.G; G.hero.lvl = 17; window.__G.refresh(); const e = G.W.exits.find(e => e.zone === 'shroom'); G.P.x = e.x; G.P.y = e.y; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); const T = G.W.temple; G.P.x = T.x; G.P.y = T.y - 40; });
  await p.keyboard.press('KeyE'); await p.waitForTimeout(1500);
}
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 0) => { if (w) await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/v94-${n}.png` }); };
  await enter(p, 'warrior', 'Лесник');
  console.log('зона:', await ev(() => window.__G.G.hero.zone));
  // бой с боссом: остальных — спать, герою — бессмертие; начать умение k (фаза по здоровью)
  const fight = (kind, hp, dx = -90) => ev(([k, hp, dx]) => { const G = window.__G.G; G.mobs.forEach(m => { if (m.kind !== k && m.state !== 'dead') { m.state = 'dead'; m.respawnAt = 1e12; } }); const m = G.mobs.find(m => m.kind === k); m.state = 'chase'; m.hp = m.max * hp; m.x = m.hx; m.y = m.hy; G.st.maxHp = 2000; G.P.hp = 2000; G.P.x = m.x + dx; G.P.y = m.y + 20; G.P.target = m; window.__boss = m; }, [kind, hp, dx]);
  const act = k => ev(k => { const m = window.__boss, G = window.__G.G; G.P.hp = 2000; if (!m.B) return 'нет B'; for (const q in m.B.cd) m.B.cd[q] = 99; m.B.cd[k] = 0; m.B.act = null; m.stun = 0; m.cd = 0; return 'ok'; }, k);
  const st = () => ev(() => { const m = window.__boss; return m.B ? `фаза ${m.B.phase + 1}, умение ${m.B.act ? m.B.act.k : '—'}, щит открыт ${m.B.open.toFixed(1)}, неуязв. ${m.B.immune.toFixed(1)}, оглушён ${m.stun.toFixed(1)}` : 'нет'; });
  // Бульк
  await fight('boss_bulk', 1); await p.waitForTimeout(300);
  console.log(await act('cone')); await shot('bulk-cone', 450); console.log('конус:', await st());
  await p.waitForTimeout(1200); await fight('boss_bulk', 1, -260); await p.waitForTimeout(200); await act('charge'); await shot('bulk-charge', 450); console.log('рывок:', await st());
  await p.waitForTimeout(1600); console.log('после рывка:', await st()); await shot('bulk-after-charge');
  await fight('boss_bulk', 0.5); await p.waitForTimeout(400); await act('cone'); await ev(() => { window.__boss.B.cd.cone = 99; window.__boss.B.act = null; }); await shot('bulk-shield', 300); console.log('щит:', await st(), await ev(() => document.querySelector('#toasts').textContent.slice(0, 90)));
  await act('stomp'); await shot('bulk-stomp', 600); await p.waitForTimeout(800); console.log('топот:', await st()); await shot('bulk-open');
  await fight('boss_bulk', 0.2, -240); await p.waitForTimeout(300); await act('leap'); await p.waitForTimeout(800); await shot('bulk-leap'); console.log('прыжок:', await st(), 'высота', await ev(() => window.__boss.jumpH | 0));
  await p.waitForTimeout(900); console.log('приземлился:', await st()); await shot('bulk-stunned');
  // Аспид
  await fight('boss_aspid', 1, -120); await p.waitForTimeout(300); await act('lunge'); await shot('aspid-lunge', 450); console.log('бросок:', await st());
  await p.waitForTimeout(1200); await fight('boss_aspid', 0.5, -80); await p.waitForTimeout(300); await act('ring'); await shot('aspid-ring', 900); console.log('кольцо:', await st(), 'колец', await ev(() => window.__G.G.rings.length));
  await p.waitForTimeout(2600); await shot('aspid-ring-hit');
  await fight('boss_aspid', 0.25, -100); await p.waitForTimeout(300); await act('shed'); await shot('aspid-shed', 400); console.log('кожа:', await st());
  await p.waitForTimeout(1500); await shot('aspid-puddles'); console.log('лужи:', await ev(() => window.__G.G.hazards.length));
  // окно J с тактикой
  await ev(() => { const G = window.__G.G; G.mobs.forEach(m => { if (m.state === 'chase') { m.state = 'idle'; m.x = m.hx; m.y = m.hy; } }); G.P.x = 3300; G.P.y = 1500; });
  await p.keyboard.press('KeyJ'); await p.waitForTimeout(300); await p.click('.dgwin .bosses li:nth-child(1) summary'); await p.click('.dgwin .bosses li:nth-child(2) summary'); await p.waitForTimeout(1300);
  console.log('тактика открыта после обновления:', await ev(() => document.querySelectorAll('.dgwin details[open]').length)); await shot('dg-tactic');
  await p.keyboard.press('Escape');
  // телефон: кольцо и окно
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const ph = await ctx.newPage(); ph.on('pageerror', e => errs.push('phone ' + e.message));
  await enter(ph, 'archer', 'Стрелок', true);
  await ph.evaluate(() => { const G = window.__G.G; const m = G.mobs.find(m => m.kind === 'boss_aspid'); G.mobs.forEach(o => { if (o !== m) { o.state = 'dead'; o.respawnAt = 1e12; } }); m.state = 'chase'; m.hp = m.max * 0.5; G.st.maxHp = G.P.hp = 2000; G.P.x = m.x - 80; G.P.y = m.y + 20; window.__boss = m; });
  await ph.waitForTimeout(300); await ph.evaluate(() => { const m = window.__boss; for (const q in m.B.cd) m.B.cd[q] = 99; m.B.cd.ring = 0; m.B.act = null; });
  await ph.waitForTimeout(900); await ph.screenshot({ path: `${OUT}/v94-phone-ring.png` });
  await ph.evaluate(() => { const G = window.__G.G; G.mobs.forEach(m => { m.state = 'dead'; }); G.rings = []; });
  await ph.tap('#btnDg'); await ph.waitForTimeout(400); await ph.tap('.dgwin .bosses li:nth-child(2) summary'); await ph.waitForTimeout(300); await ph.screenshot({ path: `${OUT}/v94-phone-tactic.png` });
  console.log('телефон окно:', await ph.evaluate(() => document.querySelectorAll('.dgwin details[open]').length));
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
