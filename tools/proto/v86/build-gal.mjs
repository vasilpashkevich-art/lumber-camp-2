import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { gallery } from './gal.js'; const cv = document.getElementById('g'); gallery(cv, 0.4);`, resolveDir: 'tools/proto/v86' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v86/gal.html', `<title>Постройки: эскиз</title><style>body{margin:0;background:#1d1a16}</style><body><canvas id="g" width="1260" height="1400"></canvas><script>${r.outputFiles[0].text}</script></body>`);
console.log('ok');
