import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { sheet, SETS } from './rigtest.js'; window.__old = v => window.__oldBody = v; window.SETS = SETS; window.sheet = sheet;`, resolveDir: 'tools/proto/v97' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v97/rigtest.html', `<body style="margin:0;background:#222"><script>${r.outputFiles[0].text}</script></body>`);
console.log('ok');
