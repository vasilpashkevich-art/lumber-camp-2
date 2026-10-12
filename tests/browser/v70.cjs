// Версия 70: игра значком (манифест, работа без интернета) и память: прошлый край выгружается, запас картинок ограничен.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
(async () => {
  const srv = http.createServer((q, s) => { let f = decodeURIComponent(q.url.split('?')[0].split('#')[0]); if (f.endsWith('/')) f += 'index.html'; const p = path.join(ROOT, f); if (!p.startsWith(ROOT) || !fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); }).listen(8765);
  const URL = 'http://localhost:8765/#dev';
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(500);
  const man = await p.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); const r = await fetch(l.href); return r.ok ? (await r.json()).name : null; });
  console.log('манифест:', man); if (!man) errs.push('нет манифеста');
  const sw = await p.evaluate(() => navigator.serviceWorker.ready.then(r => !!r.active));
  console.log('работник страницы:', sw); if (!sw) errs.push('работник страницы не запустился');
  await p.reload(); await p.waitForTimeout(500);
  // без интернета: остановить сервер и перезагрузить
  srv.close(); await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(800);
  const off = await p.evaluate(() => !!document.querySelector('#selNew')); console.log('без интернета открылась:', off); if (!off) errs.push('без интернета не открылась');
  await ctx.setOffline(false);
  // меню на телефоне: блок про значок
  await p.tap('#selSet'); await p.waitForTimeout(300); const inst = await p.evaluate(() => { const e = document.querySelector('.inst'); return e ? e.textContent.slice(0, 80) : ''; });
  console.log('в меню:', inst); if (!inst) errs.push('нет блока «Значок на телефоне»'); await p.screenshot({ path: OUT + '/v70-menu.png' });
  await p.tap('.box .xclose'); await p.waitForTimeout(200);
  // память: пройти три края и посмотреть запас картинок
  await p.tap('#selNew'); await p.waitForTimeout(450); await p.tap('.clsCard[data-c=archer]'); await p.fill('#newName', 'Память'); await p.tap('[data-x=ok]'); await p.waitForTimeout(450);
  await p.tap('.slot:nth-child(1)'); await p.tap('#selEnter'); await p.waitForTimeout(1200);
  const st = () => p.evaluate(() => { const s = window.__G.spriteStats(); return { n: s.n, mb: Math.round(s.px * 4 / 1e6) }; });
  const walk = async () => { for (let i = 0; i < 6; i++) { await p.evaluate(i => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; const c = G.W.camps[i % G.W.camps.length]; G.P.x = c.x + 60; G.P.y = c.y + c.r + 100; }, i); await p.waitForTimeout(500); } };
  await walk(); const s1 = await st(); console.log('Сосновый дол:', s1);
  for (const [z, ex] of [['farms', 'farms'], ['shroom', 'shroom']]) {
    await p.evaluate(z => { const G = window.__G.G; G.st.maxHp = G.P.hp = 99999; G.hero.lvl = 12; const e = G.W.exits.find(e => e.zone === z) || G.W.exits[0]; G.P.x = e.x; G.P.y = e.y; }, ex);
    await p.waitForTimeout(300); await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' })));
    await p.waitForTimeout(400); const ok = await p.evaluate(z => window.__G.G.hero.zone === z, z);
    if (!ok) { const u = await p.$('#actUse:not([hidden])'); if (u) { await u.tap(); await p.waitForTimeout(1200); } }
    await walk(); console.log(z, await p.evaluate(() => window.__G.G.hero.zone), await st());
    if (z === 'farms') await p.evaluate(() => { const G = window.__G.G; }); 
  }
  const s3 = await st(); if (s3.mb > 96) errs.push('запас картинок больше бюджета телефона: ' + s3.mb + ' МБ');
  console.log(errs.length ? errs : 'ошибок нет'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
