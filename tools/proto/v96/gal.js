// Эскиз v96: сундук подземелья — было и стало, закрытый и открытый, рядом с героем в масштабе игры и крупно.
import { lookOf } from '../../../src/systems/items.js';
import { newHero } from '../../../src/entities/hero.js';
import { personSpr, drawFrame, PEOPLE_K } from '../../../src/art/sprites.js';
import { chest, floor } from '../../../src/art/temple.js';
import { chestBig } from '../../../src/art/chest.js';

export function gallery(root) {
  const mk = (w, h, title, note) => { const s = document.createElement('section'); s.innerHTML = `<h2>${title}</h2>${note ? `<p>${note}</p>` : ''}`; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; s.append(cv); root.append(s); return cv; };
  const L = lookOf(newHero('Герой', 'warrior'));
  const a = mk(1200, 420, 'В масштабе игры (приближение ×2,4)', 'Слева — как было, справа — новый. Герой рядом для сравнения роста: сундук по пояс, шире героя в плечах.');
  const b = mk(1200, 520, 'Крупно (×6)', 'Закрытый: выпуклая крышка, кованые полосы и уголки, ножки, висячий замок. Открытый: крышка откинута на петлях и стоит за ящиком, замок висит отомкнутый, внутри монеты, самоцвет, кубок и свет.');
  const tick = now => {
    const t = now / 1000;
    { const g = a.getContext('2d'), K = 2.4; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, a.width, a.height); g.save(); g.scale(K, K); floor(g, 0, 0, a.width / K, a.height / K, 3, 40, false);
      const y = 140; const row = [[60, 'old', false], [120, 'old', true], [200, 'hero'], [290, 'new', false], [380, 'new', true], [455, 'hero2']];
      for (const [x, k, o] of row) { if (k === 'hero' || k === 'hero2') { g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x, y + 2, 15 * PEOPLE_K / 1.15, 5 * PEOPLE_K / 1.15, 0, 0, 7); g.fill(); drawFrame(g, personSpr(L, k === 'hero' ? 'front' : 'fs', 'idle', 0), x, y, k === 'hero' ? 1 : -1, PEOPLE_K); } else if (k === 'old') chest(g, x, y, o); else chestBig(g, x, y, o, t); }
      g.restore(); g.font = '16px Georgia'; g.fillStyle = '#e9dfc8'; g.textAlign = 'center';
      for (const [x, s] of [[90, 'Было: закрытый · открытый'], [335, 'Стало: закрытый · открытый']]) g.fillText(s, x * K, 395); }
    { const g = b.getContext('2d'), K = 6; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, b.width, b.height); g.save(); g.scale(K, K); floor(g, 0, 0, b.width / K, b.height / K, 5, 30, false);
      chestBig(g, 52, 66, false, t); chestBig(g, 145, 66, true, t); g.restore();
      g.font = '18px Georgia'; g.fillStyle = '#e9dfc8'; g.textAlign = 'center'; g.fillText('Закрытый', 52 * K, 500); g.fillText('Открытый', 145 * K, 500); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
