import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const js = async n => (await build({ entryPoints: [`tools/proto/v75/${n}.js`], bundle: true, format: 'iife', write: false, minify: true })).outputFiles[0].text;
const fx = await js('fx'), cmp = await js('cmp');
writeFileSync('tools/proto/v75/sketch.html', `<title>Мобы v75 — эскиз</title>
<style>:root{--bg:#1d1f17;--fg:#ece6d2;--mut:#b4ad94}body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;padding:16px;padding-block:16px}h1{font-size:20px;margin:0 0 6px}h2{font-size:16px;margin:22px 0 6px}p{color:var(--mut);max-width:70ch;margin:0 0 10px}canvas{max-width:100%;height:auto;display:block;border-radius:6px}</style>
<h1>Мобы: мягкий облик и умения</h1>
<p>Слева — как в игре сейчас, справа — новое. Обводка тонкая, тоном своего цвета; внутри — без чёрных линий, только тени и свет.</p>
<h2>Умения мобов (сцены крутятся по кругу)</h2>
<canvas id="c" width="1400" height="${26 + 8 * 260}"></canvas>
<h2>Облик: сбоку, спереди, сзади и шаг</h2>
<canvas id="c2" width="1800" height="1300"></canvas>
<script>${fx}</script><script>window.CMP_ID='c2';window.SC=2.6;window.KINDS='wolf,boar,bull,kvakun,ataman,bandit,snake';</script><script>${cmp}</script>`);
