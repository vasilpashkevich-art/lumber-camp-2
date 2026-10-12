// Версия 75: мягкий облик мобов и людей (обводка тоном своего цвета), умения мобов в игре:
// замах Атамана и удар, разбег кабана, бутыль поджигателя, споры, тина шамана, яд паука, призыв, бросок Полоза.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
// герой ждёт моба: моб рядом, бессмертный, герой бессмертный; остальные спят
const SETUP = ([kind, dx, dy]) => {
  const M = window.__G, G = M.G; G.hero.lvl = 20; M.refresh(); G.st.maxHp = G.P.hp = 99999; G.P.target = null; G.P.auto = null;
  const m = G.mobs.find(o => o.kind === kind && o.state !== 'dead') || G.mobs.find(o => o.kind === kind); if (!m) return 'нет ' + kind;
  for (const o of G.mobs) if (o !== m) { o.state = 'dead'; o.respawnAt = 1e9; }
  m.state = 'chase'; m.hp = m.max = 1e6; m.aggroOff = 1; m.cd = 0; if (m.smash) { m.smash.t = 0; m.smash.wind = 0; } if (m.charge) m.charge.cd = 0; m.sumT = 0.3;
  G.P.x = m.x + dx; G.P.y = m.y + dy; G.fx = []; G.shots = []; return m.key;
};
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ev = (f, a) => p.evaluate(f, a), shot = async (n, w = 0) => { if (w) await p.waitForTimeout(w); await p.screenshot({ path: `${OUT}/v75-${n}.png` }); };
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Лесник'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const goZone = async z => { await ev(z => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y; }, z); await p.keyboard.press('KeyE'); await p.waitForTimeout(1500); };
  const fxSeen = async () => ev(() => [...new Set(window.__G.G.fx.map(f => f.k))].join(','));
  // Сосновый дол: Атаман — замах и удар; кабан — разбег; паук — яд
  console.log(await ev(SETUP, ['ataman', 100, 0])); await shot('ataman-wind', 350); console.log('атаман замах:', await fxSeen());
  await shot('ataman-slam', 900); console.log('атаман удар:', await fxSeen());
  console.log(await ev(SETUP, ['boar', 260, 0])); await shot('boar-charge', 600); console.log('кабан:', await fxSeen()); await shot('boar-ram', 500);
  console.log(await ev(SETUP, ['spider', 30, 0])); await shot('spider-venom', 700); console.log('паук:', await fxSeen());
  // Хуторские угодья: поджигатель — бутыль; мельник — призыв ворон
  await goZone('farms');
  console.log(await ev(SETUP, ['firestarter', 160, 0])); await shot('bottle-fly', 450); await shot('bottle-hit', 500); console.log('поджигатель:', await fxSeen());
  console.log(await ev(SETUP, ['miller', 170, 0])); await shot('miller-summon', 700); console.log('мельник:', await fxSeen());
  // Грибной лес: споровик, шаман, Полоз
  await goZone('pine'); await goZone('shroom');
  console.log(await ev(SETUP, ['sporo', 150, 0])); await shot('spore-fly', 600); await shot('spore-hit', 900); console.log('споровик:', await fxSeen());
  console.log(await ev(SETUP, ['kvak_shaman', 150, 0])); await shot('curse-fly', 600); await shot('curse-hit', 900); console.log('шаман:', await fxSeen());
  console.log(await ev(SETUP, ['snake', 100, 0])); await shot('snake-wind', 400); await shot('snake-coil', 450); console.log('полоз:', await fxSeen());
  // галерея облика: все мобы и люди в игре рядом с героем
  await ev(() => { const G = window.__G.G; for (const o of G.mobs) { o.state = 'dead'; o.respawnAt = 1e9; } G.fx = []; G.P.x = 3000; G.P.y = 2700; });
  await shot('shroom-people', 600);
  await ev(() => { const G = window.__G.G, ks = ['kvakun', 'kvak_shaman', 'gribo', 'sporo', 'weaver', 'broodmother', 'snake']; let i = 0; for (const k of ks) { const m = G.mobs.find(o => o.kind === k); if (!m) continue; m.state = 'idle'; m.hp = m.max; m.x = m.hx = G.P.x - 300 + i * 100; m.y = m.hy = G.P.y - 60 + (i % 2) * 90; m.aggroOff = 1; m.D = { ...m.D, speed: 0, aggro: 0 }; i++; } });
  await shot('shroom-gallery', 600);
  // память: готовых картинок не больше, чем было (в пределах бюджета)
  console.log('картинки:', JSON.stringify(await ev(() => window.__G.spriteStats())));
  await b.close();
  if (errs.length) { console.log('ОШИБКИ:', errs.slice(0, 5)); process.exit(1); }
  console.log('v75: готово');
})();
