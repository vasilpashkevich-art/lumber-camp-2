// Версия 67: камера ближе, приближение колесом и +/−, мини-карта с 4 шагами, уголки у края для тех, кто гонится.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.resolve(__dirname, '../../index.html') + '#dev';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 860 } }); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(300);
  await p.click('#selNew', { noWaitAfter: true }); await p.waitForTimeout(100); await p.click('.clsCard[data-c=archer]'); await p.fill('#newName', 'Глаз'); await p.click('[data-x=ok]'); await p.waitForTimeout(150);
  await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  const ev = (f, a) => p.evaluate(f, a), shot = async n => { await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/v67-${n}.png` }); };
  const uz = () => ev(() => window.__G.R().uz);
  console.log('приближение по умолчанию:', await uz());
  await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; const m = G.mobs.find(m => m.kind === 'wolf'); G.P.x = m.hx + 140; G.P.y = m.hy + 60; });
  await shot('default');
  for (let i = 0; i < 10; i++) await p.keyboard.press('Equal'); console.log('после +:', await uz()); await shot('max');
  for (let i = 0; i < 12; i++) { await p.mouse.move(700, 400); await p.mouse.wheel(0, 120); await p.waitForTimeout(30); } console.log('после колеса вниз:', await uz()); await shot('min');
  if (await uz() !== 0.8) errs.push('нижний предел'); 
  await p.mouse.wheel(0, -120); await p.waitForTimeout(50); const z1 = await uz();
  await p.reload(); await p.waitForTimeout(300); await p.click('.slot:nth-child(1)'); await p.click('#selEnter'); await p.waitForTimeout(900);
  console.log('после перезагрузки:', await uz(), 'было', z1); if (await uz() !== z1) errs.push('не запомнил приближение');
  // ближе всего — моб гонится из-за края
  for (let i = 0; i < 10; i++) await p.keyboard.press('Equal');
  await ev(() => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; const m = G.mobs.find(m => m.kind === 'wolf'); G.mobs.forEach(o => { if (o.state === 'chase') { o.state = 'idle'; o.x = o.hx; o.y = o.hy; } }); G.P.x = m.hx - 200; G.P.y = m.hy + 250; m.x = G.P.x + 420; m.y = G.P.y - 60; m.state = 'chase'; }); await p.waitForTimeout(60); await shot('chase-edge');
  // мини-карта: 4 шага
  for (let k = 0; k < 4; k++) { await p.screenshot({ path: `${OUT}/v67-mini${k}.png`, clip: { x: 1180, y: 0, width: 260, height: 180 } }); if (k < 3) { await p.click(`#miniZ button[data-z="1"]`); await p.waitForTimeout(250); } }
  const dis = await ev(() => document.querySelector('#miniZ button[data-z="1"]').disabled); if (!dis) errs.push('кнопка + не выключилась на последнем шаге');
  const modal = await ev(() => !!document.querySelector('.modal')); if (modal) errs.push('кнопка мини-карты открыла карту');
  console.log(errs.length ? errs : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
