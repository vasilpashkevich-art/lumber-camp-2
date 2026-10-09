import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
await import('../../make-rig.mjs');
const r = await build({ entryPoints: ['tools/proto/v57/zone2.js'], bundle: true, format: 'iife', write: false, minifyWhitespace: true });
const html = readFileSync('tools/proto/v57/page.html', 'utf8').replace('<!--SCRIPT-->', () => `<script>${r.outputFiles[0].text}</script>`);
writeFileSync('tools/proto/v57/zone2.html', html); console.log('эскиз собран', (html.length / 1024).toFixed(0), 'КБ');
