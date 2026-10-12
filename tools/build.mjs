// Сборка: все модули → один скрипт → одна страница.
//   dist/lumber-camp.html — для артефакта в Claude (без <html>/<head>)
//   index.html            — для сайта GitHub Pages (полная страница)
// Запуск: npm run build
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

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
<title>Лагерь лесоруба II</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-title" content="Лесоруб II"><meta name="apple-mobile-web-app-status-bar-style" content="black">
</head><body>
${frag}
</body></html>
`;
writeFileSync('index.html', full);
// v70: работник страницы для сайта — игра открывается без интернета; новая версия подтягивается при следующем запуске
const ver = (readFileSync('src/main.js', 'utf8').match(/const VERSION = (\d+)/) || [])[1] || '0';
writeFileSync('sw.js', `// Собрано tools/build.mjs — не править руками.
const CACHE = 'lumber-camp2-v${ver}';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// сначала сеть (свежая версия), без сети — из запаса
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
`);
console.log(`собрано: скрипт ${(js.length / 1024).toFixed(0)} КБ, страница ${(frag.length / 1024).toFixed(0)} КБ`);
