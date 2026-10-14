import { build } from 'esbuild'; import { writeFileSync } from 'node:fs';
const r = await build({ stdin: { contents: `import { gallery } from './gal.js'; gallery(document.getElementById('root'));`, resolveDir: 'tools/proto/v92' }, bundle: true, format: 'iife', write: false });
writeFileSync('tools/proto/v92/gal.html', `<title>Героические вещи</title><style>
:root{color-scheme:dark}body{margin:0;background:#1d1a16;color:#e9dfc8;font:15px Georgia,serif;padding:16px}h1{font-size:24px;margin:0 0 4px}h2{font-size:19px;color:#d8b8ff;margin:18px 0 4px}p{max-width:72ch;color:#b9ad94}
canvas{display:block;max-width:100%;height:auto;background:radial-gradient(ellipse at 50% 70%,#3a3a2e,#1d1a16 70%);border-radius:8px}
.icons{display:flex;flex-wrap:wrap;gap:12px;margin:10px 0}.ic{position:relative;width:96px;text-align:center}.ic img{display:block;margin:0 auto}.ic small{display:block;font-size:12px;color:#c8bea8;margin-top:4px;line-height:1.2}
.sock{position:absolute;left:58px;top:46px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#6a6a6a,#2a2a2a);border:2px solid #9a9a9a;box-shadow:0 0 0 1px #000}
</style><body><h1>Героические (фиолетовые) вещи — эскиз v92</h1><p>Слева направо: зелёные, синие и три фиолетовых комплекта. У фиолетовых своя форма и расцветка, свечения нет — вместо него живые эффекты: огонь, руны, звёзды, иней, листья, блёстки. Ниже — значки всех фиолетовых вещей класса; серый кружок — гнездо под камень.</p><div id="root"></div><script>${r.outputFiles[0].text}</script></body>`);
console.log('ok');
