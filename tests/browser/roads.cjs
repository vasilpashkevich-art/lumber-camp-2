// Обзор дорог: стыки, мосты, концы дорог, въезды в столицу и посёлок.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=warrior]'); await p.fill('#newName', 'Путник'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const go = async (n, x, y) => { await p.evaluate(([x, y]) => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); G.P.x = x; G.P.y = y; }, [x, y]); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/road-${n}.png` }); };
  const spots = JSON.parse(process.argv[2] || '[]');
  for (const [z, n, x, y] of spots) {
    const zone = await p.evaluate(() => window.__G.G.hero.zone);
    if (zone !== z) { await p.evaluate(z => { const G = window.__G.G; const e = G.W.exits.find(e => e.zone === z); G.P.x = e.x; G.P.y = e.y + (e.y < 1000 ? 80 : -80); }, z); await p.waitForTimeout(300); await p.keyboard.press('KeyE'); await p.waitForTimeout(1200); }
    await go(n, x, y);
  }
  await b.close();
})();
