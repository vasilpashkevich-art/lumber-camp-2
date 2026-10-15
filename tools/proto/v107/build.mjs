// Эскиз v107 одним файлом: живые кадры зверей. node tools/proto/v107/build.mjs → tools/proto/v107/index.html
import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { sheet, scene } from './gal.js'; window.sheet = sheet; window.scene = scene;`, resolveDir: 'tools/proto/v107' }, bundle: true, format: 'iife', write: false, minify: true });
const page = `<title>Звери: эскиз</title>
<style>:root{--bg:#1c1712;--fg:#f0e4c8;--mut:#b8a888}body{background:var(--bg);color:var(--fg);font:15px/1.5 Georgia,serif;padding-inline:16px;padding-block:20px;margin:0}
h1{font-size:24px;margin:0 0 4px;color:#f0c24a}p{margin:4px 0 14px;color:var(--mut);max-width:70ch}.wrap{overflow-x:auto;border-radius:10px;border:2px solid #6a4a24;margin-bottom:18px}canvas{display:block}
.row{display:flex;flex-wrap:wrap;gap:14px}.row .wrap{flex:1 1 380px;min-width:0}.row canvas{width:100%;height:auto}</style>
<h1>Лиса, волк, кабан — мультяшный стиль</h1>
<p>Сверху «было», снизу «стало». Кадры живые: стоит, бежит, кусает, бежит к нам и от нас, падает. Слева — герой для сравнения. Размеры и места те же, что в игре: меняется только рисунок.</p>
<div class="wrap"><canvas id="a"></canvas></div>
<div class="row"><div class="wrap"><canvas id="b"></canvas></div><div class="wrap"><canvas id="c"></canvas></div></div>
<script>${r.outputFiles[0].text}
const a=document.getElementById('a'),b=document.getElementById('b'),c=document.getElementById('c');
function loop(ts){const t=ts/1000;sheet(a,t);scene(b,t,'old');scene(c,t,'new');requestAnimationFrame(loop);}requestAnimationFrame(loop);</script>`;
writeFileSync('tools/proto/v107/index.html', page); console.log('ok', page.length);
