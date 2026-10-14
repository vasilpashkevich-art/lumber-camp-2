import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { gallery } from './gal.js'; gallery(document.getElementById('root'));`, resolveDir: 'tools/proto/v96' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v96/chest.html', `<title>Сундук подземелья</title><style>
:root{color-scheme:dark}body{margin:0;background:#1d1a16;color:#e9dfc8;font:15px Georgia,serif;padding-block:16px;padding-inline:16px}h1{font-size:24px;margin:0 0 4px}h2{font-size:19px;color:#f0c24a;margin:18px 0 4px}p{max-width:72ch;color:#b9ad94}
canvas{display:block;max-width:100%;height:auto;border-radius:8px}
</style><body><h1>Сундук подземелья — эскиз</h1><p>Крупнее и добротнее: дубовые доски, кованые полосы, уголки, ножки и висячий замок. Открытый — крышка откинута на петлях и стоит за ящиком, а не висит в воздухе.</p><div id="root"></div><script>${r.outputFiles[0].text}</script></body>`);
console.log('ok');
