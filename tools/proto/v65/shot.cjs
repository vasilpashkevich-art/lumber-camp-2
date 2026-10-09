// Снимки эскиза v65 по разделам. NODE_PATH=$(npm root -g) node tools/proto/v65/shot.cjs
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 1 }); const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'forest.html')); await p.waitForTimeout(2500);
  const secs = await p.$$('section');
  for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: path.resolve(__dirname, `../../../tests/browser/out/v65s-${i + 1}.png`) });
  console.log(secs.length, 'разделов;', errs.length ? errs.join('\n') : 'ошибок нет'); await b.close();
})();
