import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
for (const [n, h] of [['cmp', 1100], ['fx', 26 + 8 * 200]]) {
  const r = await build({ entryPoints: [`tools/proto/v75/${n}.js`], bundle: true, format: 'iife', write: false });
  writeFileSync(`tools/proto/v75/${n}.html`, `<body style="margin:0;background:#222"><canvas id="c" width="${n === 'fx' ? 1400 : 1800}" height="${n === 'fx' ? 26 + 8 * 260 : h}" style="max-width:100%"></canvas><script>window.STILL=location.hash.includes('still');const Q=new URLSearchParams(location.search);window.SC=+Q.get('s')||undefined;window.KINDS=Q.get('k')||undefined;window.FIXT=Q.has('t')?+Q.get('t'):undefined;</script><script>${r.outputFiles[0].text}</script></body>`);
}
