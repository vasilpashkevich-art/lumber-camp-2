import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
const r = await build({ entryPoints: ['tools/proto/v74b/dirs.js'], bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v74b/dirs.html', `<canvas id="c" width="900" height="680"></canvas><script>${r.outputFiles[0].text}</script>`); console.log('ok');
