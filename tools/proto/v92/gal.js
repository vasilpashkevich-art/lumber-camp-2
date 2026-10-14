// Эскиз v92: героические (фиолетовые) вещи против зелёных и синих, живые эффекты, значки, гнёзда.
import { makeItem, lookOf, itemName } from '../../../src/systems/items.js';
import { personSpr, drawFrame } from '../../../src/art/sprites.js';
import { itemIcon } from '../../../src/ui/icons.js';
import { gearFx } from '../../../src/art/gearfx.js';
import { itemLook, fxOf } from '../../../src/art/gear.js';
import { rng } from '../../../src/engine/util.js';

const SETS = {
  warrior: [{ weapon: 'flameblade', head: 'dragonhelm', chest: 'ember', legs: 'emberleg' }, { weapon: 'runeaxe', head: 'warlord', chest: 'warlord', legs: 'warlordleg' }, { weapon: 'thunder', head: 'warlord', chest: 'warlord', legs: 'warlordleg' }],
  mage: [{ weapon: 'starfall', head: 'astral', chest: 'astralrobe', legs: 'astralleg' }, { weapon: 'phoenix', head: 'astral', chest: 'flamerobe', legs: 'flameleg' }, { weapon: 'glacier', head: 'frostcowl', chest: 'astralrobe', legs: 'astralleg' }],
  archer: [{ weapon: 'stagbow', head: 'staghood', chest: 'stagarmor', legs: 'stagleg' }, { weapon: 'nightbow', head: 'hawkmask', chest: 'nightleather', legs: 'nightleg' }, { weapon: 'sunbow', head: 'hawkmask', chest: 'stagarmor', legs: 'stagleg' }],
};
const NAME = { warrior: 'Воин', mage: 'Маг', archer: 'Лучник' };
function hero(cls, rar, models) {
  const eq = {}; let s = rar === 'good' ? 3 : rar === 'rare' ? 41 : 77;
  for (const sl of ['head', 'chest', 'legs', 'weapon']) { const it = makeItem(cls, sl, 16, rar, rng(s += 11)); if (models) { it.m = models[sl]; it.name = itemName(it); } eq[sl] = it; }
  return { cls, eq };
}
const fxList = h => ['weapon', 'head', 'chest'].map(sl => { const it = h.eq[sl]; if (!it) return null; const f = fxOf(sl, itemLook(it).m); return f ? [f, sl] : null; }).filter(Boolean);

export function gallery(root) {
  const K = 3.6, H = 37 * K;
  const cards = [];
  for (const cls of ['warrior', 'mage', 'archer']) {
    const row = document.createElement('section'); row.innerHTML = `<h2>${NAME[cls]}</h2>`;
    const cv = document.createElement('canvas'); cv.width = 1180; cv.height = 380; row.append(cv);
    const heroes = [['Зелёные', hero(cls, 'good')], ['Синие', hero(cls, 'rare')], ...SETS[cls].map((m, i) => ['Фиолетовые ' + (i + 1), hero(cls, 'epic', m)])];
    cards.push({ cv, heroes });
    const icons = document.createElement('div'); icons.className = 'icons';
    const all = [];
    for (const m of SETS[cls]) for (const sl of ['weapon', 'head', 'chest', 'legs']) if (!all.some(x => x.sl === sl && x.m === m[sl])) all.push({ sl, m: m[sl] });
    let s = 90; for (const { sl, m } of all) { const it = makeItem(cls, sl, 16, 'epic', rng(s += 7)); it.m = m; it.name = itemName(it); const d = document.createElement('div'); d.className = 'ic'; d.innerHTML = itemIcon(it, 64) + `<span class="sock"></span><small>${it.name.replace(/ [а-яё]+$/i, '')}</small>`; icons.append(d); }
    for (const sl of ['ring', 'neck']) for (const m of sl === 'ring' ? ['crownring', 'dragonring'] : ['sunamulet', 'dragoneye']) { const it = makeItem(cls, sl, 16, 'epic', rng(s += 7)); it.m = m; it.name = itemName(it); const d = document.createElement('div'); d.className = 'ic'; d.innerHTML = itemIcon(it, 64) + (sl === 'neck' ? '<span class="sock"></span>' : '') + `<small>${it.name.replace(/ [а-яё]+$/i, '')}</small>`; icons.append(d); }
    row.append(icons); root.append(row);
  }
  // сравнение значков: зелёная, синяя, фиолетовая; гнездо пустое и с камнем
  const cmp = document.createElement('section'); cmp.innerHTML = '<h2>Значки и гнёзда</h2><div class="icons cmp"></div>'; root.append(cmp);
  const C = cmp.querySelector('.cmp'); let s = 300;
  for (const [rar, sock, label] of [['good', 0, 'Зелёная без гнезда'], ['good', 1, 'Зелёная с гнездом'], ['rare', 1, 'Синяя: пустое гнездо'], ['rare', '#d8a040', 'Синяя: Тигровый глаз'], ['epic', 1, 'Фиолетовая: пустое'], ['epic', '#3ac878', 'Фиолетовая: Изумруд']]) {
    const it = makeItem('warrior', 'chest', 16, rar, rng(s += 5)); const d = document.createElement('div'); d.className = 'ic'; d.innerHTML = itemIcon(it, 64) + (sock ? `<span class="sock" ${sock !== 1 ? `style="background:radial-gradient(circle at 35% 35%,#fff8 0 20%,${sock} 45%)"` : ''}></span>` : '') + `<small>${label}</small>`; C.append(d);
  }
  const tick = now => {
    const t = now / 1000;
    for (const { cv, heroes } of cards) {
      const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
      heroes.forEach(([lab, h], i) => {
        const x = 110 + i * 236, y = 300, L = lookOf(h), f = Math.floor(t * 8) % 8;
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 2, 46, 12, 0, 0, 7); g.fill();
        drawFrame(g, personSpr(L, 'front', 'idle', 0), x, y, 1, K);
        gearFx(g, fxList(h), x, y, t + i, H);
        g.fillStyle = i < 2 ? '#c8bea8' : '#d8b8ff'; g.font = '15px Georgia'; g.textAlign = 'center'; g.fillText(lab, x, 368);
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
