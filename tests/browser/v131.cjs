// v131: ювелирное дело — окно у Златана (учитель), вкладка с рецептами, значки профессий на вкладках; телефон
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
async function run(touch) {
  const b = await chromium.launch(); const p = await b.newPage(touch ? { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(500);
  const tap = async sel => touch ? p.tap(sel) : p.click(sel);
  await tap('#selNew'); await p.waitForTimeout(300); await tap('.clsCard[data-c=mage]'); await p.fill('#newName', 'Ювелир'); await tap('[data-x=ok]'); await p.waitForTimeout(300); await tap('.slot:nth-child(1)'); await tap('#selEnter'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const G = window.__G.G, h = G.hero, b = G.W.houses.find(x => x.id === 'jeweler'); G.P.x = b.x; G.P.y = b.y + 60; h.prof.mining = 60; h.prof.herbal = 30; h.prof.alchemy = 20; h.prof.enchant = 10; h.lvl = 12;
    const A = window.__G.addStack, S = window.__G.makeStack; A(h, S('gem', 'tigerseye', 5)); A(h, S('gem', 'amethyst', 2)); A(h, S('gem', 'emerald', 1)); A(h, S('bar', 'copper', 16)); A(h, S('bar', 'tin', 4)); A(h, S('bar', 'iron', 2)); });
  await p.waitForTimeout(400);
  if (touch) { await p.tap('#actUse'); } else await p.keyboard.press('KeyE');
  await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v131-${touch ? 'phone-' : ''}teach.png` });
  await tap('.learn .btn'); await p.waitForTimeout(400);
  const tabs = await p.$$eval('.profwin .tab', L => L.map(t => t.textContent.trim()));
  await p.screenshot({ path: `${OUT}/v131-${touch ? 'phone-' : ''}tab.png` });
  await p.evaluate(() => { window.__G.G.hero.prof.jewel = 60; }); await tap('.profwin .tab[data-t=jewel]'); await p.waitForTimeout(300);
  await tap('.recipes .ware2:nth-of-type(1) [data-x=all]'); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/v131-${touch ? 'phone-' : ''}craft.png` });
  await p.evaluate(() => { window.__G.G.CRAFT; }); await p.waitForTimeout(7000);
  const got = await p.evaluate(() => { const h = window.__G.G.hero; return h.bag.filter(i => i.kind === 'gem').map(i => i.metal + '×' + i.n).join(', '); });
  console.log((touch ? 'телефон ' : '') + 'вкладки:', tabs.join(' | ')); console.log('камни:', got);
  if (!touch) { await tap('.profwin .tab[data-t=mining]'); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/v131-tabs.png` }); }
  console.log(errs.length ? 'ОШИБКИ: ' + errs.join('\n') : 'ошибок нет'); await b.close();
}
(async () => { await run(false); await run(true); })();
