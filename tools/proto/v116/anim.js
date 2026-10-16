// v116: живой эскиз связки ударов — Воин 4 движения, Маг 3, Лучник 3, разбойник и Атаман; три стороны.
import { newHero } from '../../../src/entities/hero.js';
import { makeItem, lookOf } from '../../../src/systems/items.js';
import { personSpr, drawFrame, PEOPLE_K, MOB_LOOK, sideways } from '../../../src/art/sprites.js';
import { SWING_N, swingOf } from '../../../src/art/toon.js';
import { rng } from '../../../src/engine/util.js';
const hero = (cls, seed) => { const h = newHero('Эскиз', cls); for (const sl of ['head', 'chest', 'legs', 'weapon']) h.eq[sl] = makeItem(cls, sl, 14, 'rare', rng(seed + sl.length)); return lookOf(h); };
const ROWS = [['Воин', hero('warrior', 3)], ['Маг', hero('mage', 5)], ['Лучник', hero('archer', 7)], ['Разбойник', MOB_LOOK.bandit], ['Атаман', MOB_LOOK.ataman]];
const VIEWS = ['side', 'fs', 'front'];
const NAMES = { chop: ['сверху', 'наискось слева', 'обратным ходом', 'укол'], cast: ['посох вверх', 'выпад посохом', 'взмах сбоку'], bow: ['обычный', 'быстрый с бедра', 'навесом'] };
const cv = document.getElementById('c'), g = cv.getContext('2d');
let slow = 1; document.getElementById('slow').onchange = e => slow = e.target.checked ? 0.35 : 1;
const CW = 210, RH = 150, SC = 1.9;
cv.width = 120 + CW * VIEWS.length; cv.height = 40 + RH * ROWS.length;
let T = 0, last = performance.now();
function frame(now) {
  T += Math.max(0, now - last) / 1000 * slow; last = now; if (window.__T != null) T = window.__T;   // __T — для снимков
  g.fillStyle = '#7fae5a'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#2a1a0a'; g.font = 'bold 14px Georgia'; VIEWS.forEach((v, i) => g.fillText({ side: 'боком', fs: 'вполоборота', front: 'лицом' }[v], 120 + i * CW + 70, 24));
  ROWS.forEach(([name, L], r) => {
    const st = swingOf(L), N = SWING_N[st], per = 0.75, k = Math.floor(T / per), ph = (T % per) / per, v = k % N, atk = ph < 0.45, f = Math.min(5, Math.floor(ph / 0.45 * 6));
    g.fillStyle = '#2a1a0a'; g.font = 'bold 15px Georgia'; g.fillText(name, 12, 40 + r * RH + 70); g.font = '12px Georgia'; g.fillText(atk ? NAMES[st][v] : '…', 12, 40 + r * RH + 90);
    VIEWS.forEach((view, i) => { const x = 120 + i * CW + CW / 2, y = 40 + r * RH + 120;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 4, 30, 9, 0, 0, 7); g.fill();
      const sp = personSpr(L, view, atk ? (v ? 'atk' + v : 'atk') : 'idle', atk ? f : 0); drawFrame(g, sp, x, y, 1, PEOPLE_K * SC); });
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
