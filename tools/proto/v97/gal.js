// Эскиз v97, проба 2: суровый мультяшный герой (вариант А) в разных вещах — по 5 комплектов на класс; и в масштабе игры с сундуком.
import { lookOf } from '../../../src/systems/items.js';
import { newHero } from '../../../src/entities/hero.js';
import { personSpr, drawFrame, PEOPLE_K } from '../../../src/art/sprites.js';
import { floor } from '../../../src/art/temple.js';
import { chestBig } from '../../../src/art/chest.js';
import { toonHero } from './toon.js';
import './heavy.js';

const SETS = {
  warrior: [
    ['Зелёные: шапель, кольчуга, меч', { head: { m: 'kettle', c: '#9aa2ae' }, chest: { m: 'mail', c: '#3e6a3a', sign: '#d8c070' }, legs: { m: 'mail', c: '#7a828e' }, boots: '#4a3020', weapon: { m: 'sword', c: '#c8d0da', c2: '#8a6a3a' } }],
    ['Синие: Бараньи латы', { chest: { m: 'heavy', c: '#3a78c8', c2: '#22406e', emblem: '#e8b440' }, head: { m: 'helm_ram', c: '#3a78c8' }, weapon: { m: 'sword', c: '#d8e0ea', c2: '#e8b440' }, shield: { c: '#2a5ea8', sign: 'sun' } }],
    ['Синие: Алый страж', { chest: { m: 'heavy', c: '#c8382c', c2: '#6a1a16' }, head: { m: 'helm_wings', c: '#c8382c' }, weapon: { m: 'sword', c: '#d8e0ea', c2: '#e8b440' }, shield: { c: '#a82a22', sign: 'wolf' } }],
    ['Фиолетовые: Чёрный полководец', { chest: { m: 'heavy', c: '#3e3e48', c2: '#1c1c22', trim: '#c8382c', spikes: '#d8d0c8', emblem: '#ff5030' }, head: { m: 'helm_horns', c: '#3e3e48', trim: '#c8382c', horn: '#b02a24', eyes: '#ff5a30' }, weapon: { m: 'battleaxe', c: '#5a5a66', c2: '#c8382c', wood: '#2a1a16' }, cape: '#6a1810' }],
    ['Фиолетовые: Светлый крестоносец', { chest: { m: 'heavy', c: '#e4dccb', c2: '#5a6a8a', emblem: '#3a78c8' }, head: { m: 'helm_crest', c: '#e4dccb', crest: '#3a6ab0' }, weapon: { m: 'hammer', c: '#e4dccb', c2: '#e8b440', glow: true, wood: '#3a2a20' }, cape: '#2a4a8a' }],
  ],
  mage: [
    ['Зелёные: капюшон, мантия, посох', { head: { m: 'hood', c: '#4a5a8a' }, chest: { m: 'robe', c: '#4a5a8a', c2: '#c8b070' }, boots: '#2a2a3a', weapon: { m: 'staff' } }],
    ['Синие: шляпа, мантия, посох огня', { head: { m: 'wizard', c: '#8a2a2a', c2: '#e0b040' }, chest: { m: 'robe', c: '#8a2a2a', c2: '#e0b040' }, boots: '#3a1e1e', weapon: { m: 'firestaff' } }],
    ['Синие: Ледяной чародей', { chest: { m: 'heavy', c: '#4a8ac8', c2: '#1e3a66', robe: '#2a4a86', big: 4.3, emblem: '#8ae0ff' }, head: { m: 'magecollar', c: '#1e3a66', gem: '#8ae0ff' }, weapon: { m: 'staff', wood: '#2a2a3a' } }],
    ['Фиолетовые: Звёздный архимаг', { chest: { m: 'heavy', c: '#7a3ab0', c2: '#3a1a5a', robe: '#4a1e70', big: 4.6, emblem: '#ffd060' }, head: { m: 'magecollar', c: '#3a1a5a', gem: '#c8a0ff' }, weapon: { m: 'crystal', c2: '#e8b440', wood: '#2a1e30' }, cape: '#2a1240' }],
  ],
  archer: [
    ['Зелёные: капюшон, куртка, лук', { head: { m: 'hood', c: '#3e6a32' }, chest: { m: 'leather', c: '#6a4a2c', c2: '#3e6a32' }, legs: { m: 'pants', c: '#5a4430' }, boots: '#3e2a18', weapon: { m: 'bow', c: '#9a6a34' } }],
    ['Синие: шапка с пером, клёпаная куртка', { head: { m: 'feathercap', c: '#3a5a7a', c2: '#d84a3a' }, chest: { m: 'leather', c: '#4a3a2a', c2: '#3a5a7a', studs: true }, legs: { m: 'pants', c: '#3a3a44' }, boots: '#2a2018', weapon: { m: 'longbow', c: '#7a4a24' } }],
    ['Синие: Лесной следопыт', { chest: { m: 'heavy', c: '#5a7a3a', c2: '#3a2a1e', leather: true, one: true, big: 4.4, trim: '#c8a060' }, head: { m: 'maskhood', c: '#3e5a32', mask: '#2a2a2a', trim: '#c8a060' }, weapon: { m: 'longbow', c: '#6a3e1e' } }],
    ['Фиолетовые: Белый Олень', { chest: { m: 'heavy', c: '#ece4d0', c2: '#5a4630', leather: true, one: true, big: 4.6, emblem: '#4ac080' }, head: { m: 'maskhood', c: '#f4f0e6', mask: '#3a3a44' }, weapon: { m: 'goldbow' }, cape: '#2e5a3a', quiver: '#e0b040' }],
  ],
};
const NAME = { warrior: 'Воин', mage: 'Маг', archer: 'Лучник' };

export function gallery(root) {
  const mk = (w, h, title, note) => { const s = document.createElement('section'); s.innerHTML = `<h2>${title}</h2>${note ? `<p>${note}</p>` : ''}`; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; s.append(cv); root.append(s); return cv; };
  const rows = ['warrior', 'mage', 'archer'].map(cls => ({ cls, cv: mk(1200, 470, NAME[cls], cls === 'warrior' ? 'Слева нынешний герой, дальше новый: начальные и зелёные вещи — как в прошлой пробе; синие и фиолетовые — тяжёлые глянцевые латы: огромные наплечники в два слоя, золотая кайма, юбка из пластин, крупные наколенники, большие шлемы, щиты.' : '') }));
  const scene = mk(1200, 380, 'В масштабе игры (приближение ×2,4) рядом с новым сундуком', 'Нынешний Воин слева, дальше новые — по одному комплекту каждого класса.');
  const L = { warrior: lookOf(newHero('В', 'warrior')), mage: lookOf(newHero('М', 'mage')), archer: lookOf(newHero('Л', 'archer')) };
  const tick = now => {
    const t = now / 1000;
    for (const { cls, cv } of rows) {
      const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.save(); g.scale(2, 2); floor(g, 0, 0, 600, 235, cls.length, 36, false); g.restore();
      const KC = 6.4, KT = KC * 39 / 40, y = 405;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(70, y + 2, 32, 8, 0, 0, 7); g.fill(); drawFrame(g, personSpr(L[cls], 'front', 'idle', 0), 70, y - 12.6 * KC, 1, KC);
      [['Начало', {}], ...SETS[cls]].forEach(([lab, gear], i) => { const x = 205 + i * (cls === 'warrior' ? 165 : 195); g.save(); g.translate(x, y); g.scale(KT, KT); toonHero(g, cls, gear, t + i * 0.7); g.restore(); g.font = '13px Georgia'; g.fillStyle = lab.startsWith('Фиол') ? '#d8b8ff' : lab.startsWith('Син') ? '#8ab8ff' : '#e9dfc8'; g.textAlign = 'center'; const [l1, l2] = lab.split(': '); g.fillText(l1, x, 440); if (l2) { g.fillStyle = '#b9ad94'; g.fillText(l2, x, 458); } });
      g.font = '14px Georgia'; g.fillStyle = '#b9ad94'; g.textAlign = 'center'; g.fillText('сейчас', 70, 440);
    }
    { const g = scene.getContext('2d'), K = 2.4, s = 39 / 40 * PEOPLE_K; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, scene.width, scene.height); g.save(); g.scale(K, K); floor(g, 0, 0, 500, 160, 4, 40, false);
      const y = 130; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(40, y + 2, 15, 5, 0, 0, 7); g.fill(); drawFrame(g, personSpr(L.warrior, 'front', 'idle', 0), 40, y - 12.6 * PEOPLE_K, 1, PEOPLE_K);
      const put = (x, cls, i) => { g.save(); g.translate(x, y); g.scale(s, s); toonHero(g, cls, SETS[cls][i][1], t + x); g.restore(); };
      put(90, 'warrior', 1); put(140, 'warrior', 3); chestBig(g, 215, y, true, t); put(290, 'mage', 2); put(340, 'mage', 3); put(395, 'archer', 2); put(445, 'archer', 3);
      g.restore(); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
