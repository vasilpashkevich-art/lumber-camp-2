import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ entryPoints: ['tools/proto/v58/houses.js'], bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v58/houses.html', `<body style="margin:0;background:#222"><script>${r.outputFiles[0].text}</script></body>`);
