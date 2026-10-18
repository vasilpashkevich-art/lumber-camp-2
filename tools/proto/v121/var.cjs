const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1540, height: 600 } });
  await p.goto('file://' + path.resolve(__dirname, 'mount.html') + '#big'); await p.waitForTimeout(300);
  const V = JSON.parse(process.argv[2]);
  for (const [i, rp] of V.entries()) { await p.evaluate(rp => { window.__T = 1; window.__W = false; window.__R = 0; window.__RP = rp; }, rp); await p.waitForTimeout(150); await (await p.$('canvas')).screenshot({ path: path.join(__dirname, 'var' + i + '.png') }); }
  await b.close(); })();
