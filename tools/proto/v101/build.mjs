import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { draw } from './gal.js'; window.draw = draw;`, resolveDir: 'tools/proto/v101' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v101/gal.html', `<body style="margin:0;background:#222"><script>${r.outputFiles[0].text}</script></body>`); console.log('ok');
