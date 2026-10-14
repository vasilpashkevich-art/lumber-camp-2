// Версия 97: новая мультяшная кукла всех людей — герой трёх классов, люди-мобы, стража, жители; окно героя, значки, выбор героя, телефон.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function enter(p, cls, name = 'Кукла') {
  await p.goto(URL); await p.waitForTimeout(400);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForSelector('#newName'); await p.waitForTimeout(150); await p.click(`.clsCard[data-c=${cls}]`); await p.waitForTimeout(100);
  await p.evaluate(n => { document.querySelector('#newName').value = n; document.querySelector('[data-x=ok]').click(); }, name); await p.waitForSelector('.modal', { state: 'detached' }); await p.waitForTimeout(200);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
}
const gear = (p, rar, lvl) => p.evaluate(([rar, lvl]) => { const W = window.__G, G = W.G, h = G.hero; h.lvl = lvl; for (const s of ['head', 'chest', 'legs', 'weapon']) h.eq[s] = W.makeItem(h.cls, s, lvl, rar, Math.random); W.refresh(); }, [rar, lvl]);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await enter(p, 'warrior');
  const ev = (f, a) => p.evaluate(f, a);
  // у южных ворот: Гордей и стража
  await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.P.x = 3010; G.P.y = 2990; }); await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/v97-gate.png` });
  // люди-мобы рядом с героем
  await ev(() => { const G = window.__G.G; G.P.x = 6650; G.P.y = 2600; const kinds = ['bandit', 'bandit_archer', 'ataman', 'robber', 'firestarter', 'miller']; let i = 0; const mk = G.mobs.slice(0, 6);
    for (const k of kinds) { const m = G.mobs.find(m => m.kind === k) || mk[i]; if (!m) continue; m.kind = k; m.x = G.P.x - 300 + i * 120; m.y = G.P.y + 90; m.stun = 999; m.state = 'idle'; i++; } }); await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/v97-mobs.png` });
  // герой в синем и фиолетовом, окно героя
  for (const [rar, lvl] of [['good', 8], ['rare', 18], ['epic', 24]]) { await gear(p, rar, lvl); await p.waitForTimeout(300); await p.keyboard.press('KeyI'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v97-char-${rar}.png` }); await p.keyboard.press('KeyI'); await p.waitForTimeout(200); }
  // ходьба и удар: снимки в движении
  await ev(() => { const G = window.__G.G; G.P.x = 3400; G.P.y = 2400; }); await p.keyboard.down('KeyD'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v97-walk.png` }); await p.keyboard.up('KeyD');
  await p.keyboard.down('Space'); await p.waitForTimeout(250); await p.screenshot({ path: `${OUT}/v97-hit.png` }); await p.keyboard.up('Space');
  // выбор героя
  await ev(() => window.__G.toSelect && window.__G.toSelect()); await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/v97-select.png` });
  // телефон
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const ph = await ctx.newPage(); ph.on('pageerror', e => errs.push('phone ' + e.message));
  await enter(ph, 'mage', 'Маг'); await ph.evaluate(() => { const G = window.__G.G; G.P.x = 3010; G.P.y = 2990; }); await ph.waitForTimeout(700); await ph.screenshot({ path: `${OUT}/v97-phone.png` });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close();
})();
