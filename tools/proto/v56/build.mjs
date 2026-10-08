import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
const r = await build({ entryPoints: ['tools/proto/v56/anim.js'], bundle: true, format: 'iife', write: false, minifyWhitespace: true });
const html = readFileSync('tools/proto/v56/page.html', 'utf8').replace('<!--SCRIPT-->', () => `<script>${r.outputFiles[0].text}</script>`);
writeFileSync('tools/proto/v56/anim.html', html); console.log('эскиз собран', (html.length / 1024).toFixed(0), 'КБ');
