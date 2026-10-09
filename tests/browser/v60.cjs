// Версия 60: Кровоточащая стрела Лучника — значок, полёт красной стрелы, капли, красные числа, «кровоточит».
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=archer]'); await p.fill('#newName', 'Стрелок'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  await p.evaluate(() => { const G = window.__G.G; const m = G.mobs.find(m => m.kind === 'boar'); m.hp = m.max = 5000; G.P.x = m.x - 250; G.P.y = m.y + 20; G.P.target = m; G.st.maxHp = G.P.hp = 9999; });
  await p.waitForTimeout(400);
  await p.keyboard.press('KeyC'); await p.waitForTimeout(450); await p.screenshot({ path: OUT + '/v60-shot.png' });
  await p.waitForTimeout(1300); await p.screenshot({ path: OUT + '/v60-bleed.png' });
  const st = await p.evaluate(() => ({ bleed: window.__G.G.mobs.some(m => m.bleed) })); console.log('цель:', st);
  if (!st.bleed) errs.push('кровотечение не повесилось');
  await p.hover('#pfRing').catch(() => {}); await p.click('#pfRing').catch(() => {}); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/v60-abils.png' });
  console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
