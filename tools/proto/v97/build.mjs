import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { gallery } from './gal.js'; gallery(document.getElementById('root'));`, resolveDir: 'tools/proto/v97' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v97/hero.html', `<title>Мультяшный герой</title><style>
:root{color-scheme:dark}body{margin:0;background:#1d1a16;color:#e9dfc8;font:15px Georgia,serif;padding-block:16px;padding-inline:16px}h1{font-size:24px;margin:0 0 4px}h2{font-size:19px;color:#f0c24a;margin:18px 0 4px}p{max-width:72ch;color:#b9ad94}
canvas{display:block;max-width:100%;height:auto;border-radius:8px}
</style><body><h1>Мультяшный герой — эскиз, проба 3</h1><p>Вариант А с суровыми лицами. Синие и фиолетовые вещи — тяжёлые глянцевые латы в духе присланных картинок, но свои: огромные наплечники в два слоя, золотая кайма, юбка из пластин, крупные наколенники, большие шлемы (бараньи рога, крылья, загнутые рога с огнём в прорези, гребень), щиты с гербами. Пока вид спереди и стоя.</p><div id="root"></div><script>${r.outputFiles[0].text}</script></body>`);
console.log('ok');
