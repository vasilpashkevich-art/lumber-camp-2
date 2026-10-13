import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { draw } from './scene.js'; draw(document.getElementById('g'));`, resolveDir: 'tools/proto/v89' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v89/scene.html', `<title>Low-poly: проба</title><style>body{margin:0;background:#1d1a16;color:#e9dfc8;font:14px Georgia,serif}.bar{padding:8px 14px;background:#2a2218}canvas{display:block;max-width:100%;height:auto}</style><body><div class="bar"><b>v89 — проба стиля low-poly</b> · башня чар, изба, телега, ёлки, камни, грибы, котёл; герой для масштаба</div><canvas id="g" width="1100" height="720"></canvas><script>${r.outputFiles[0].text}</script></body>`);
console.log('ok');
