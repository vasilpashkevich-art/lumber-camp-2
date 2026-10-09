// Эскиз v61: жилы руды в мире, окно героя с 7 местами и сумкой 8×4, аксессуары, подсказки, плавильня.
import { LOOK } from '../../../src/art/look.js';
import { person } from '../../../src/art/rig.js';
import { doll } from '../../../src/art/hero.js';
import { vein, glint, outcrop } from '../../../src/art/ore.js';
import { itemIcon, accIcon, ABIL_ICON } from '../../../src/ui/icons.js';
import { makeItem, lookOf, itemLines } from '../../../src/systems/items.js';
import { TRINKETS, ORES } from '../../../data/trinkets.js';
import { RAR_COL, RAR_NAME } from '../../../data/balance.js';
import { newHero } from '../../../src/entities/hero.js';
import { CLASSES } from '../../../data/classes.js';

const $ = s => document.querySelector(s);
const HERO = { cls: 'warrior', chest: 2, legs: 2, head: 1, wt: 1, rar: 'good' };

// ---------------------------------------------------------------- 1. мир
const cv = $('#world'), g = cv.getContext('2d'), SW = 1400, SH = 640;
cv.width = SW; cv.height = SH;
const bg = document.createElement('canvas'); bg.width = SW; bg.height = SH;
{ const b = bg.getContext('2d'); LOOK.use(b); LOOK.ground(0, 0, 820, SH, 'z1', 53, 2); LOOK.ground(820, 0, SW - 820, SH, 'z3', 61, 2);
  b.fillStyle = 'rgba(28,40,26,.85)'; b.beginPath(); b.moveTo(0, 0); b.lineTo(820, 0); b.lineTo(820, 70); for (let x = 820; x >= 0; x -= 40) b.lineTo(x, 70 + Math.sin(x * 0.05) * 14); b.closePath(); b.fill();
  for (let i = 0; i < 70; i++) { const x = Math.random() * SW, y = 120 + Math.random() * (SH - 130); LOOK.tuft(x, y, 1, x < 820 ? 'z1' : 'z3', Math.random()); }
  b.strokeStyle = 'rgba(255,255,255,.25)'; b.setLineDash([6, 6]); b.beginPath(); b.moveTo(820, 0); b.lineTo(820, SH); b.stroke(); }
const props = [
  { y: 150, d: () => { g.save(); g.translate(150, 150); outcrop(g, 190, 120, 5); g.restore(); } },
  { y: 175, d: (t) => { g.save(); g.translate(330, 175); outcrop(g, 150, 100, 9); g.translate(-10, 18); vein(g, 'copper', 4); glint(g, 'copper', t, 1); g.restore(); } },
  { y: 160, d: () => { g.save(); g.translate(560, 160); outcrop(g, 210, 110, 13); g.restore(); } },
  { y: 420, d: (t) => { g.save(); g.translate(300, 420); vein(g, 'copper', 7); glint(g, 'copper', t, 2); g.restore(); } },
  { y: 470, d: () => { g.save(); g.translate(560, 470); vein(g, 'copper', 2, 0); g.restore(); } },
  { y: 380, d: (t) => { g.save(); g.translate(1060, 380); vein(g, 'tin', 5); glint(g, 'tin', t, 3); g.restore(); } },
  { y: 180, d: () => { g.save(); g.translate(1200, 180); outcrop(g, 170, 105, 21); g.restore(); } },
];
const tree = (k, x, y) => ({ y, d: () => { LOOK.use(g); LOOK.tree(k, x, y, 1.5, (x % 7) / 7, 1.2); } });
props.push(tree(2, 60, 330), tree(1, 720, 300), tree(3, 1330, 470), tree(2, 900, 560));
const man = (x, y, view, pose, L = HERO) => { g.save(); g.translate(x, y); if (view === 'left') g.scale(-1.15, 1.15); else g.scale(1.15, 1.15); person(g, L, view === 'left' ? 'side' : view, pose); g.restore(); };
const label = (s, x, y, c = '#ffe9a8', z = 15) => { g.font = `bold ${z}px Georgia`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,14,8,.9)'; g.strokeText(s, x, y); g.fillStyle = c; g.fillText(s, x, y); };
function drawWorld(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0); g.lineJoin = 'round'; g.lineCap = 'round';
  const L = [...props, { y: 425, d: t => { // герой копает: удар кирки по кругу 0,9 с
    const q = (t / 0.9) % 1; man(245, 425, 'side', { atk: q });
    g.save(); g.translate(245, 425); const a = -1.9 + Math.sin(q * Math.PI) * 1.6; g.restore();
    const pr = Math.min(1, (t % 3.6) / 3); g.fillStyle = 'rgba(20,14,8,.9)'; g.fillRect(205, 362, 80, 9); g.fillStyle = '#e0a060'; g.fillRect(206, 363, 78 * pr, 7); label('Медная руда', 245, 356, '#ffe9a8', 13);
    if (pr >= 1 && (t % 3.6) < 3.5) label('+3 медной руды', 300, 330, '#f0a060', 14);
  } }, { y: 395, d: () => man(1000, 395, 'front', { walk: -1 }, { cls: 'mage', chest: 2, legs: 1, head: 2, wt: 1, rar: 'good' }) }];
  L.sort((a, b) => a.y - b.y); for (const p of L) p.d(t);
  label('скала у края — 2,5 роста', 330, 50, '#e8dcc0', 13); label('медная жила — 1,2 роста', 300, 470, '#e8dcc0', 13); label('выкопана — щебень', 560, 500, '#e8dcc0', 13); label('оловянная жила', 1060, 420, '#e8dcc0', 13);
  label('Сосновый дол', 410, SH - 18, '#ffe9a8', 17); label('Хуторские угодья', 1110, SH - 18, '#ffe9a8', 17);
}
const loop = t => { drawWorld(t / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop);

// ---------------------------------------------------------------- 2. окно героя
const h = newHero('Мирослав', 'warrior'); h.lvl = 9;
h.eq.head = makeItem('warrior', 'head', 8, 'good', () => 0.5); h.eq.chest = makeItem('warrior', 'chest', 9, 'rare', () => 0.4); h.eq.legs = makeItem('warrior', 'legs', 8, 'common', () => 0.5); h.eq.weapon = makeItem('warrior', 'weapon', 9, 'good', () => 0.6);
{ const d = $('#doll').getContext('2d'); d.scale(2, 2); doll(d, 85, 196, 3.5, 1, lookOf(h), 0.3); }
const cell = (inner, cls = '') => `<div class="cell ${cls}">${inner}</div>`;
const slot = (s, inner) => cell(inner || `<span class="empty">${s}</span>`);
$('#eqL').innerHTML = slot('Голова', itemIcon(h.eq.head, 44)) + slot('Шея', accIcon('neck', 'good', 44, '#5fd35f')) + slot('Тело', itemIcon(h.eq.chest, 44)) + slot('Ноги', itemIcon(h.eq.legs, 44));
$('#eqR').innerHTML = slot('Оружие', itemIcon(h.eq.weapon, 44)) + slot('Кольцо', accIcon('ring', 'rare', 44, '#4a9eff')) + slot('Аксессуар', accIcon('stoneheart', 'rare', 44)) + `<div class="cell" style="opacity:.35"><span class="empty">пусто</span></div>`;
$('#stats').innerHTML = [['Уровень', 9], ['Здоровье', 512], ['Сила', 21], ['Сила удара', '68,2'], ['Урон в секунду', '84,5'], ['Крит', '13,4%'], ['Блок', '3,8%'], ['Броня', '94 (−41%)']].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
const bagItems = [
  cell(accIcon('ore_copper', 'common', 44) + '<span class="n">17</span>'), cell(accIcon('ore_copper', 'common', 44) + '<span class="n">20</span>'), cell(accIcon('bar_copper', 'common', 44) + '<span class="n">6</span>'), cell(accIcon('ore_tin', 'common', 44) + '<span class="n">4</span>'),
  cell(accIcon('pickaxe', 'common', 44)), cell(accIcon('ring', 'good', 44, '#5fd35f')), cell(accIcon('neck', 'rare', 44, '#4a9eff') + '<span class="new">новое</span>'), cell(itemIcon(makeItem('warrior', 'legs', 9, 'good', () => 0.3), 44)),
  cell(accIcon('windfeather', 'rare', 44)), cell(itemIcon(makeItem('warrior', 'head', 7, 'common', () => 0.3), 44)), cell(accIcon('bar_tin', 'common', 44) + '<span class="n">2</span>'), cell(itemIcon(makeItem('warrior', 'weapon', 8, 'common', () => 0.3), 44)),
  cell(accIcon('ring', 'common', 44, '#c8b898')), cell(itemIcon(makeItem('warrior', 'chest', 6, 'common', () => 0.3), 44)),
];
$('#bag').innerHTML = Array.from({ length: 32 }, (_, i) => bagItems[i] || cell('')).join('');

// ---------------------------------------------------------------- 3. панель
const act = (ico, k, n = '', cls = '') => `<div class="act ${cls}"><span class="ico">${ico}</span><span class="k">${k}</span>${n ? `<span class="n">${n}</span>` : ''}</div>`;
$('#actbar').innerHTML = act(ABIL_ICON.attack.warrior, 'Пробел') + act(ABIL_ICON.charge, 'C') + act(ABIL_ICON.whirl, 'V') + act(accIcon('stoneheart', 'rare', 44).replace(/width="44" height="44"/, 'width="100%" height="100%"'), '1', '', 'tr') + act(`<svg viewBox="0 0 32 32"><rect x="13" y="3" width="6" height="6" fill="#c9a06a" stroke="#24180f"/><path d="M12 9h8v4l5 6v6a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-6l5-6z" fill="#e8e0cc" stroke="#24180f"/><path d="M8 19h16v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#d8323a"/></svg>`, 'Q', '3');

// ---------------------------------------------------------------- 4. аксессуары
const tcard = T => `<div class="card ${T.rar}">${accIcon(T.id, T.rar, 52)}<div><b>${T.name}</b><small>${RAR_NAME[T.rar]} · аксессуар · ${T.passive ? 'срабатывает сам' : 'клавиша 1'} · перезарядка ${T.cd >= 120 ? T.cd / 60 + ' мин' : T.cd + ' с'}</small><p>${T.d}</p></div></div>`;
$('#blue').innerHTML = TRINKETS.filter(t => t.rar === 'rare').map(tcard).join('');
$('#epic').innerHTML = TRINKETS.filter(t => t.rar === 'epic').map(tcard).join('');

// ---------------------------------------------------------------- 5. подсказки
const tip = (head, rar, slot, lines, extra = '') => `<div class="tcard"><b style="color:${RAR_COL[rar]}">${head}</b><small>${RAR_NAME[rar]} · ${slot}</small>${lines.map(l => `<p class="${l[1] || ''}">${l[0]}</p>`).join('')}${extra}</div>`;
$('#tips').innerHTML =
  tip('Серебряное кольцо орла', 'rare', 'Кольцо', [['+5 к силе'], ['+7 к выносливости'], ['+2,6% к криту', 'prop'], ['+4,1% к скорости удара', 'prop'], ['Уровень вещи: 9']], '<p class="gold">Цена у торговца: 38 меди</p>') +
  tip('Амулет родника', 'good', 'Шея', [['+4 к силе'], ['+6 к выносливости'], ['+1,2 здоровья в секунду', 'prop'], ['Уровень вещи: 8']], '<p class="gold">Цена у торговца: 15 меди</p>') +
  tip('Каменное сердце', 'rare', 'Аксессуар', [['Нажмите 1: 6 с получаете вдвое меньше урона', 'ab'], ['Перезарядка 60 с'], ['Уровень вещи: 6']], '<p class="gold">Цена у торговца: 1 серебро</p>') +
  tip('Сердце феникса', 'epic', 'Аксессуар', [['Срабатывает само: при гибели раз в 10 минут встаёте на месте с половиной здоровья, вокруг — огненная вспышка', 'ab'], ['Уровень вещи: 14']], '<p class="gold">Цена у торговца: 5 серебра</p>');

// ---------------------------------------------------------------- 6. плавильня
const sm = (k, have, ok) => { const O = ORES[k]; return `<div class="rowb">${accIcon('bar_' + k, 'common', 40)}<div class="t"><b>${O.bar}</b><small>2 × ${O.ore.toLowerCase()} · у вас ${have} · продаётся за ${O.barP} меди (руда — по ${O.oreP})</small></div><button class="btn ${ok ? '' : 'dis'}">Переплавить</button><button class="btn ${ok ? '' : 'dis'}">Всё (${Math.floor(have / 2)})</button></div>`; };
$('#smelt').innerHTML = sm('copper', 37, true) + sm('tin', 4, true) + `<p style="font-size:13px;margin:4px 0 0">Навык горного дела: 37 / 100. Олово плавится с 50.</p>`;
