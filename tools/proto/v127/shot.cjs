const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 300 }, deviceScaleFactor: 2 }); await p.goto('file://' + path.resolve(__dirname, 'seal.html')); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 'seal.png') }); await b.close(); })();
