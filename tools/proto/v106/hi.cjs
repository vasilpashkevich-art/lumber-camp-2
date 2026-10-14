const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => { const r = await require('esbuild').build({ entryPoints: [path.join(__dirname, 'hi.js')], bundle: true, format: 'iife', write: false });
  fs.writeFileSync(path.join(__dirname, 'hi.html'), `<body style="background:#333"><script>${r.outputFiles[0].text}</script></body>`);
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => errs.push(m.text().slice(0, 300)));
  await p.goto('file://' + path.join(__dirname, 'hi.html'));
  const urls = await p.evaluate(() => window.go());
  await p.setContent('<body style="background:#3a2a1a;margin:0">' + urls.map(u => `<img src="${u}" style="width:112px;background:#1a120c;margin:4px">`).join('') + '</body>');
  await p.setViewportSize({ width: 620, height: 380 }); await p.screenshot({ path: path.join(__dirname, '../../../tests/browser/out/v106-hi.png') });
  console.log(errs.slice(0, 5)); await b.close(); })();
