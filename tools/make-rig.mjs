// Собирает src/art/rig.js из шаблона tools/parts/rig.tpl.js и частей облика из src/art/hero.js
// (торс, наплечники, голова сбоку, плащ, колчан), чтобы облик героя был описан один раз.
// Запуск: node tools/make-rig.mjs  (вызывается из build.mjs)
import { readFileSync, writeFileSync } from 'node:fs';
const hero = readFileSync('src/art/hero.js', 'utf8').split('\n');
const between = (a, b) => { const i = hero.findIndex(l => l.includes(a)), j = hero.findIndex((l, k) => k > i && l.includes(b)); if (i < 0 || j < 0) throw new Error('нет метки ' + a + ' / ' + b); return hero.slice(i + 1, j).join('\n'); };
const parts = {
  CAPE: between('// плащ сзади', '// колчан у лучника'),
  QUIVER: between('// колчан у лучника', '// оружие за спиной'),
  TORSO: [between('// тело', '// руки и плечи')].join('\n'),
  PADS: between("hp(()=>c.ellipse(-8,0,2.6,4,0.2,0,7),sl,.9);", "hp(()=>c.ellipse(8,0,2.6,4,-0.2,0,7),sl,.9);"),
  HEAD: between('// голова', '// кисть'),
};
// плащ и колчан в шаблоне — по одной строке-метке; у колчана нужна сама строка после метки
parts.CAPE = hero[hero.findIndex(l => l.includes('// плащ сзади')) + 1] + '\n' + hero[hero.findIndex(l => l.includes('// плащ сзади')) + 2] + '\n' + hero[hero.findIndex(l => l.includes('// плащ сзади')) + 3];
parts.QUIVER = hero[hero.findIndex(l => l.includes('// колчан у лучника')) + 1];
let out = readFileSync('tools/parts/rig.tpl.js', 'utf8');
for (const [k, v] of Object.entries(parts)) { if (!out.includes('__' + k + '__')) throw new Error('нет места для ' + k); out = out.replace('__' + k + '__', () => v); }
writeFileSync('src/art/rig.js', '// СОБРАНО tools/make-rig.mjs — правки делать в tools/parts/rig.tpl.js и src/art/hero.js\n' + out);
console.log('rig.js собран');
