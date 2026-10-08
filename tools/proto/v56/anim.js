// Эскиз анимаций v56: все герои и мобы — ходьба в 4 стороны, стойка, удар, удар по ним, падение.
// Сборка: node tools/proto/v56/build.mjs → tools/proto/v56/anim.html
import { person } from '../../../src/art/rig.js';
import { beast } from '../../../src/art/beasts.js';
import { MOB_LOOK, MOB_SCALE } from '../../../src/art/sprites.js';

const ROWS = [
  ['Герои', [
    ['Воин, старт', { cls: 'warrior', head: 0, chest: 0, legs: 0, wt: 0 }],
    ['Воин, кольчуга', { cls: 'warrior', head: 2, chest: 2, legs: 2, wt: 1, rar: 'good' }],
    ['Воин, латы', { cls: 'warrior', head: 4, chest: 4, legs: 4, wt: 3, rar: 'epic' }],
    ['Маг, старт', { cls: 'mage', head: 0, chest: 0, legs: 0, wt: 0 }],
    ['Маг, роба', { cls: 'mage', head: 2, chest: 2, legs: 2, wt: 2, rar: 'good' }],
    ['Маг, мантия', { cls: 'mage', head: 4, chest: 4, legs: 4, wt: 3, rar: 'epic' }],
    ['Лучник, старт', { cls: 'archer', head: 0, chest: 0, legs: 0, wt: 0 }],
    ['Лучник, кожа', { cls: 'archer', head: 1, chest: 1, legs: 1, wt: 1 }],
    ['Лучник, чешуя', { cls: 'archer', head: 4, chest: 4, legs: 4, wt: 3, rar: 'rare' }],
    ['Без вещей', { cls: 'warrior', head: 0, chest: -1, legs: -1, wt: -1 }],
  ]],
  ['Мобы', [
    ['Разбойник', 'bandit'], ['Стрелок', 'bandit_archer'], ['Атаман', 'ataman'],
    ['Волк', 'wolf'], ['Лиса', 'fox'], ['Кабан', 'boar'], ['Паук', 'spider'],
  ]],
];
const DIRS = [['вниз', 'front', 1], ['вправо', 'side', 1], ['вверх', 'back', 1], ['влево', 'side', -1]];
let mode = 'walk', dirMode = 'cycle';

const root = document.getElementById('grid');
const cells = [];
for (const [title, list] of ROWS) {
  const h = document.createElement('h2'); h.textContent = title; root.append(h);
  const row = document.createElement('div'); row.className = 'row'; root.append(row);
  for (const [name, what] of list) {
    const box = document.createElement('figure'), cv = document.createElement('canvas'), cap = document.createElement('figcaption');
    cv.width = 220; cv.height = 220; cap.textContent = name; box.append(cv, cap); row.append(box);
    cells.push({ cv, what, cap, name });
  }
}
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b)); });
document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => { dirMode = b.dataset.dir; document.querySelectorAll('[data-dir]').forEach(x => x.classList.toggle('on', x === b)); });

function draw(now) {
  const t = now / 1000;
  const di = dirMode === 'cycle' ? Math.floor(t / 2.4) % 4 : +dirMode, [dn, view, dir] = DIRS[di];
  document.getElementById('dirNow').textContent = 'идёт ' + dn;
  for (const C of cells) {
    const c = C.cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 220, 220);
    // трава
    c.fillStyle = '#5d8a42'; c.fillRect(0, 0, 220, 220);
    const off = mode === 'walk' ? (t * 60) % 40 : 0;
    c.strokeStyle = 'rgba(40,70,25,.35)'; c.lineWidth = 2;
    for (let i = -1; i < 7; i++) { const k = i * 40 + (view === 'side' ? -off * dir : view === 'front' ? off * -1 : off); c.beginPath(); if (view === 'side') { c.moveTo(k, 170); c.lineTo(k + 6, 164); } else { c.moveTo(60, k); c.lineTo(66, k - 6); c.moveTo(160, k + 20); c.lineTo(166, k + 14); } c.stroke(); }
    const pose = { t, walk: -1, atk: -1, hit: 0, dead: 0 };
    if (mode === 'walk') pose.walk = (t * 1.6) % 1;
    if (mode === 'atk') { const q = (t % 1.4) / 1.4; pose.atk = q < 0.75 ? q / 0.75 : -1; }
    if (mode === 'hit') { const q = (t % 1.2) / 1.2; pose.hit = q < 0.3 ? Math.sin(q / 0.3 * Math.PI) : 0; }
    if (mode === 'dead') { const q = (t % 2.4) / 2.4; pose.dead = Math.min(1, q * 1.5); }
    c.save(); c.translate(110, 150); c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0, 13 * 3.4 / 3.4, 40, 12, 0, 0, 7); c.fill();
    const human = typeof C.what === 'object' || MOB_LOOK[C.what];
    const sc = human ? 3.4 * (MOB_SCALE[C.what] || 1) : 3.0;
    c.scale(sc * (view === 'side' ? dir : 1), sc);
    if (pose.hit) c.filter = 'none';
    if (human) person(c, typeof C.what === 'object' ? C.what : MOB_LOOK[C.what], view, pose);
    else { c.translate(0, 12); beast(c, C.what, view, pose); }
    c.restore();
    if (pose.hit > 0.2) { c.fillStyle = `rgba(255,250,235,${pose.hit * 0.35})`; c.fillRect(0, 0, 220, 220); }
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
