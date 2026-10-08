// Сборка: все модули → один скрипт → одна страница.
//   dist/lumber-camp.html — для артефакта в Claude (без <html>/<head>)
//   index.html            — для сайта GitHub Pages (полная страница)
// Запуск: npm run build
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
await import('./make-rig.mjs');   // собрать src/art/rig.js из шаблона

const res = await build({
  entryPoints: ['src/main.js'], bundle: true, format: 'iife', write: false,
  target: 'es2020', legalComments: 'none', charset: 'utf8', minifyWhitespace: true, minifySyntax: true,
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const page = readFileSync('src/page.html', 'utf8');
const frag = page.replace('<!--SCRIPT-->', () => `<script>${js}</script>`);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/lumber-camp.html', frag);

const full = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#0e0b08">
</head><body>
${frag}
</body></html>
`;
writeFileSync('index.html', full);
console.log(`собрано: скрипт ${(js.length / 1024).toFixed(0)} КБ, страница ${(frag.length / 1024).toFixed(0)} КБ`);
