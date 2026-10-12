const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
  const k = process.argv[2] || '';
  await p.goto('file://' + __dirname + '/cmp.html' + '?k=' + k + '&s=' + (process.argv[4]||2.2) + '#still'); await p.waitForTimeout(500);
  await p.screenshot({ path: __dirname + '/out/' + (process.argv[3] || 'cmp') + '.png' }); await b.close(); })();
