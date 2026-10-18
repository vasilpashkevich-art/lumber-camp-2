import { build } from 'esbuild'; import fs from 'fs';
const r = await build({ entryPoints: ['tools/proto/v121/yard.js'], bundle: true, write: false, format: 'iife', minify: true });
const js = r.outputFiles[0].text;
fs.writeFileSync('tools/proto/v121/yard.html', `<title>Конный двор</title><style>body{margin:0;background:#2a1e12;color:#f0e2c0;font:15px Georgia,serif;padding:16px}canvas{max-width:100%;border:3px solid #8a6a3a;border-radius:6px}</style><h1 style="margin:0 0 6px;font-size:26px">Конный двор — эскиз</h1><p style="margin:0 0 10px">Западный берег Соснового дола: конюшня, загон, поилка, конюший; дорога от Столицы и дальше к воде, где потом встанет пристань.</p><canvas id="c"></canvas><script>${js.replace(/<\/script/g, '<\\/script')}</script>`);
console.log('ok', (js.length / 1024).toFixed(0) + ' КБ');
