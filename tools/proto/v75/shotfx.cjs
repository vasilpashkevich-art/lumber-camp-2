const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 2106 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  for (const t of process.argv.slice(2)) { await p.goto('file://' + __dirname + '/fx.html?t=' + t); await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/out/fx' + t + '.png' }); }
  await b.close(); })();
