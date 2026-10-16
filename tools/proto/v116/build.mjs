import { build } from 'esbuild'; import fs from 'fs';
const r = await build({ entryPoints: ['tools/proto/v116/anim.js'], bundle: true, write: false, format: 'iife', minify: true });
const js = r.outputFiles[0].text;
fs.writeFileSync('tools/proto/v116/anim.html', `<title>Связка ударов</title><style>body{margin:0;background:#2a1e12;color:#f0e2c0;font:15px Georgia,serif;padding:16px}canvas{max-width:100%;border:3px solid #8a6a3a;border-radius:6px}label{display:block;margin:8px 0}</style><h1 style="margin:0 0 6px;font-size:26px">Связка ударов</h1><p style="margin:0 0 6px">Каждый обычный удар — следующее движение по кругу; после паузы больше 3 с связка начинается сначала.</p><label><input type="checkbox" id="slow"> медленно</label><canvas id="c"></canvas><script>${js.replace(/<\/script/g, '<\\/script')}</script>`);
console.log('ok', (js.length / 1024).toFixed(0) + ' КБ');
