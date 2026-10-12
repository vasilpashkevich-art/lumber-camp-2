const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1180 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'warning' && console.log(m.text()));
  await p.goto('file://' + __dirname + '/gal.html#still'); await p.waitForTimeout(500); await p.screenshot({ path: __dirname + '/out/gal.png' }); await b.close(); })();
