import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { draw } from './gal.js'; window.draw = draw;`, resolveDir: 'tools/proto/v130' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v130/gal.html', `<body style="margin:0;background:#222"><canvas id="c"></canvas><script>${r.outputFiles[0].text}</script><script>draw(document.getElementById('c'))</script></body>`); console.log('ok');
