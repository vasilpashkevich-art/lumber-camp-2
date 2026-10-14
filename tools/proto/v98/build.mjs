import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { sheet, hands } from './weaptest.js'; window.sheet = sheet; window.hands = hands;`, resolveDir: 'tools/proto/v98' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v98/weaptest.html', `<body style="margin:0;background:#222"><script>${r.outputFiles[0].text}</script></body>`); console.log('ok');
