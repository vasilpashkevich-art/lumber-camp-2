// Проверка v74: люди на 8 сторон (стоит, шаг, удар) и новые пропорции — рядом со старыми видами.
import { personSpr, drawFrame, MOB_LOOK, viewOf8, sideways } from '../../../src/art/sprites.js';
import { lookOf, makeItem } from '../../../src/systems/items.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
const L = cls => lookOf({ cls, eq: Object.fromEntries(['head', 'chest', 'legs', 'weapon'].map((s, i) => [s, makeItem(cls, s, 14, 'rare', () => 0.25 + i * 0.17)])) });
const looks = [L('warrior'), L('mage'), L('archer'), lookOf({ cls: 'warrior', eq: Object.fromEntries(['chest', 'legs', 'weapon'].map((s, i) => [s, makeItem('warrior', s, 1, 'start', () => 0.3)])) }), MOB_LOOK.bandit];
const DIRS = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
window.draw = (mode, f) => {
  g.fillStyle = '#5f8a3a'; g.fillRect(0, 0, cv.width, cv.height);
  looks.forEach((lk, r) => DIRS.forEach(([dx, dy], i) => { const v = viewOf8(dx, dy), dir = sideways(v) ? (dx < 0 ? -1 : 1) : 1; const x = 60 + i * 110, y = 110 + r * 130; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 2, 16, 6, 0, 0, 7); g.fill(); drawFrame(g, personSpr(lk, v, mode, f), x, y, dir, 2.2); }));
};
draw('idle', 0);
