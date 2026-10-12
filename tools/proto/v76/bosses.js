import { beastSpr, personSpr, drawFrame, MOB_SCALE, FRAMES } from '../../../src/art/sprites.js';
import { newHero } from '../../../src/entities/hero.js';
import { lookOf } from '../../../src/systems/items.js';
const hero = lookOf(newHero('Гость', 'warrior'));
const B = [['boss_bulk', 'Воевода Бульк'], ['boss_priestess', 'Жрица Квакша'], ['boss_aspid', 'Храмовый аспид'], ['boss_king', 'Король квакунов'], ['boss_toad', 'Король-жаба (3-я фаза)']];
export function gallery(cv, t) {
  const g = cv.getContext('2d'), SC = 2.1; g.fillStyle = '#3f4a3a'; g.fillRect(0, 0, cv.width, cv.height);
  B.forEach(([k, name], i) => { const y = 40 + (i + 1) * 215 - 20 + (i === 4 ? 40 : 0), sc = SC * (MOB_SCALE[k] || 1);
    g.fillStyle = '#ece6d2'; g.font = 'bold 15px sans-serif'; g.fillText(name, 12, y - 190);
    drawFrame(g, personSpr(hero, 'side', 'idle', 0), 70, y, 1, SC);
    [['side', 'idle', 0], ['front', 'idle', 0], ['back', 'idle', 0], ['side', 'walk', Math.floor(t * 10) % 8], ['side', 'atk', Math.floor(t * 7) % 6]].forEach(([v, m, f], j) => drawFrame(g, beastSpr(k, v, m, f), (k === 'boss_toad' ? 250 : 230) + j * (k === 'boss_toad' ? 235 : 190), y, 1, sc));
  });
}
