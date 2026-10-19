import { build } from 'esbuild'; import fs from 'fs';
const r = await build({ entryPoints: ['tools/proto/v126/ram.js'], bundle: true, write: false, format: 'iife', minify: true });
const js = r.outputFiles[0].text;
fs.writeFileSync('tools/proto/v126/ram.html', `<title>Боевой баран</title><style>body{margin:0;background:#2a1e12;color:#f0e2c0;font:15px Georgia,serif;padding:16px}canvas{max-width:100%;border:3px solid #8a6a3a;border-radius:6px}label{margin:8px 14px 8px 0;display:inline-block}</style><h1 style="margin:0 0 6px;font-size:26px">Боевой баран — эскиз</h1><p style="margin:0 0 6px">Редкий скакун за жетоны: три расцветки, 8 сторон, рысь, всадник трёх классов, рядом пеший герой для масштаба, призыв.</p><label><input type="checkbox" id="walk" checked> идёт</label><label><input type="checkbox" id="slow"> медленно</label><br><canvas id="c"></canvas><script>${js.replace(/<\/script/g, '<\\/script')}</script>`);
console.log('ok', (js.length / 1024).toFixed(0) + ' КБ');
