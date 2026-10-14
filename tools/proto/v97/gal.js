// Эскиз v97: мультяшный герой рядом с нынешним, два варианта пропорций, и в масштабе игры рядом с новым сундуком.
import { lookOf } from '../../../src/systems/items.js';
import { newHero } from '../../../src/entities/hero.js';
import { personSpr, drawFrame, PEOPLE_K } from '../../../src/art/sprites.js';
import { floor } from '../../../src/art/temple.js';
import { chestBig } from '../../../src/art/chest.js';
import { toonHero } from './toon.js';

const NAME = { warrior: 'Воин', mage: 'Маг', archer: 'Лучник' };
export function gallery(root) {
  const mk = (w, h, title, note) => { const s = document.createElement('section'); s.innerHTML = `<h2>${title}</h2>${note ? `<p>${note}</p>` : ''}`; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; s.append(cv); root.append(s); return cv; };
  const big = mk(1200, 560, 'Крупно: сейчас · вариант А · вариант Б', 'А — пропорции как сейчас (≈4,3 головы), только мультяшная рисовка: круглые формы, мягкий объём, обводка в цвет детали, крупные глаза с бликом. Б — мультяшнее: голова больше (≈3,2 головы), ноги короче и толще.');
  const scene = mk(1200, 380, 'В масштабе игры (приближение ×2,4) рядом с новым сундуком', 'Слева направо: нынешний Воин, вариант А, вариант Б, сундук, Маг А и Б, Лучник А и Б.');
  const H = { warrior: lookOf(newHero('В', 'warrior')), mage: lookOf(newHero('М', 'mage')), archer: lookOf(newHero('Л', 'archer')) };
  const tick = now => {
    const t = now / 1000;
    { const g = big.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, big.width, big.height); g.save(); g.scale(2, 2); floor(g, 0, 0, 600, 280, 3, 36, false); g.restore();
      ['warrior', 'mage', 'archer'].forEach((cls, i) => {
        const x0 = 75 + i * 395, y = 500, KC = 6.8, KT = KC * 39 / 40;
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x0, y + 2, 34, 9, 0, 0, 7); g.fill();
        drawFrame(g, personSpr(H[cls], 'front', 'idle', 0), x0, y - 12.6 * KC, 1, KC);
        g.save(); g.translate(x0 + 125, y); g.scale(KT, KT); toonHero(g, cls, 'A', t + i); g.restore();
        g.save(); g.translate(x0 + 255, y); g.scale(KT, KT); toonHero(g, cls, 'B', t + i + 1); g.restore();
        g.font = '15px Georgia'; g.fillStyle = '#e9dfc8'; g.textAlign = 'center';
        g.fillText(NAME[cls] + ': сейчас', x0, 545); g.fillText('А', x0 + 125, 545); g.fillText('Б', x0 + 255, 545);
      }); }
    { const g = scene.getContext('2d'), K = 2.4, s = 39 / 40 * PEOPLE_K; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, scene.width, scene.height); g.save(); g.scale(K, K); floor(g, 0, 0, 500, 160, 4, 40, false);
      const y = 130;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(45, y + 2, 15, 5, 0, 0, 7); g.fill(); drawFrame(g, personSpr(H.warrior, 'front', 'idle', 0), 45, y - 12.6 * PEOPLE_K, 1, PEOPLE_K);
      const put = (x, cls, p) => { g.save(); g.translate(x, y); g.scale(s, s); toonHero(g, cls, p, t + x); g.restore(); };
      put(100, 'warrior', 'A'); put(150, 'warrior', 'B'); chestBig(g, 220, y, true, t); put(290, 'mage', 'A'); put(335, 'mage', 'B'); put(390, 'archer', 'A'); put(440, 'archer', 'B');
      g.restore(); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
