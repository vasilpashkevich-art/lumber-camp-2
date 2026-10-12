import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ entryPoints: ['tools/proto/v74b/mobs.js'], bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v74b/mobs.html', `<canvas id="c" width="940" height="520"></canvas><script>${r.outputFiles[0].text}</script>`);
