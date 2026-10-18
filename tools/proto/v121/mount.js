// v121: эскиз ездового коня — 3 масти, 8 сторон, шаг (рысь), всадник трёх классов, рядом пеший герой для масштаба, призыв.
import { newHero } from '../../../src/entities/hero.js';
import { makeItem, lookOf } from '../../../src/systems/items.js';
import { person, RIG } from '../../../src/art/toon.js';
import { horse, horseShadow, COATS } from '../../../src/art/horse.js';
import { rng } from '../../../src/engine/util.js';
const hero = (cls, seed) => { const h = newHero('Эскиз', cls); for (const sl of ['head', 'chest', 'legs', 'weapon']) h.eq[sl] = makeItem(cls, sl, 15, 'rare', rng(seed + sl.length)); return lookOf(h); };
const RIDERS = [['Воин', hero('warrior', 3)], ['Маг', hero('mage', 5)], ['Лучник', hero('archer', 7)]];
const VIEWS = [['side', 1, 'вправо'], ['fs', 1, 'вниз-вправо'], ['front', 1, 'вниз'], ['fs', -1, 'вниз-влево'], ['side', -1, 'влево'], ['bs', -1, 'вверх-влево'], ['back', 1, 'вверх'], ['bs', 1, 'вверх-вправо']];
const COATK = ['bay', 'black', 'grey'];
const cv = document.getElementById('c'), g = cv.getContext('2d');
let slow = 1, moving = true; document.getElementById('slow').onchange = e => slow = e.target.checked ? 0.35 : 1; document.getElementById('walk').onchange = e => moving = e.target.checked;
const S = 2.1, CW = 190, RH = 175;
cv.width = 24 + CW * VIEWS.length; cv.height = 70 + RH * 4 + 230;
/** Конь со всадником: (x, y) — точка на земле, s — масштаб. */
function mount(x, y, coat, view, dir, L, walk, t, s = S, alpha = 1) {
  g.save(); g.translate(x, y); g.scale(dir * s, s); g.globalAlpha = alpha;
  g.save(); g.translate(0, RIG.FOOT); g.scale(RIG.K, RIG.K); horseShadow(g, view);
  horse(g, coat, view, { walk: walk ? (t * 1.6) % 1 : -1, t, rider: !!L, riderFn: L ? (seat, rx) => { g.save(); g.translate(rx, seat + 18.6); g.scale(1 / RIG.K, 1 / RIG.K); g.translate(0, -RIG.FOOT); person(g, L, view, Object.assign({ ride: true, t }, window.__RP || {})); g.restore(); } : null });
  g.restore(); g.restore();
}
let T = 0, last = performance.now();
let frame = function (now) {
  T += Math.max(0, now - last) / 1000 * slow; last = now; if (window.__T != null) T = window.__T;
  g.fillStyle = '#7fae5a'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#2a1a0a'; g.font = 'bold 14px Georgia'; g.textAlign = 'center';
  VIEWS.forEach(([, , n], i) => g.fillText(n, 24 + i * CW + CW / 2, 26));
  // строки: три масти с разными всадниками + пустой конь
  const rows = [['bay', RIDERS[0]], ['black', RIDERS[1]], ['grey', RIDERS[2]], ['bay', null]];
  rows.forEach(([coat, R], r) => {
    g.textAlign = 'left'; g.font = 'bold 13px Georgia'; g.fillStyle = '#2a1a0a'; g.fillText(COATS[coat].name + (R ? ' — ' + R[0] : ' — без всадника'), 10, 52 + r * RH);
    VIEWS.forEach(([view, dir], i) => mount(24 + i * CW + CW / 2, 52 + r * RH + 150, coat, view, dir, R && R[1], moving, T + i * 0.13));
  });
  // масштаб: пеший герой рядом с конём и всадником; призыв
  const by = 70 + RH * 4 + 190; g.textAlign = 'left'; g.font = 'bold 13px Georgia'; g.fillText('Масштаб: пеший герой рядом (рост героя — мерка)', 10, by - 170);
  g.save(); g.translate(150, by); g.scale(S * 1.2, S * 1.2); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 12.6, 9, 3, 0, 0, 7); g.fill(); person(g, RIDERS[0][1], 'fs', { t: T }); g.restore();
  mount(330, by, 'bay', 'side', 1, RIDERS[1][1], false, T, S * 1.2);
  mount(560, by, 'grey', 'side', -1, null, false, T, S * 1.2);
  // линейки роста
  g.strokeStyle = 'rgba(40,20,10,.5)'; g.setLineDash([4, 4]); g.lineWidth = 1; const foot = by + 12.6 * S * 1.2, hh = 41 * RIG.K * S * 1.2;
  for (const k of [1, 1.4]) { g.beginPath(); g.moveTo(90, foot - hh * k); g.lineTo(660, foot - hh * k); g.stroke(); g.fillStyle = '#2a1a0a'; g.font = '12px Georgia'; g.fillText(k + ' роста', 670, foot - hh * k + 4); }
  g.setLineDash([]);
  // призыв: 1,5 с — золотая пыль, конь проявляется
  const q = (T % 3) / 1.5; g.fillText('Призыв (1,5 с)', 760, by - 170);
  if (q < 1) { const k = q; for (let i = 0; i < 24; i++) { const an = i * 0.9 + T * 3, r = 70 * (1 - k) + 10; g.fillStyle = `rgba(255,220,120,${0.8 * (1 - k * 0.5)})`; g.beginPath(); g.arc(860 + Math.cos(an) * r, by + 20 + Math.sin(an) * r * 0.45 - k * 40 * Math.sin(i), 2.4, 0, 7); g.fill(); } mount(860, by, 'black', 'fs', 1, RIDERS[2][1], false, T, S * 1.2, k * k); }
  else mount(860, by, 'black', 'fs', 1, RIDERS[2][1], false, T, S * 1.2);
  requestAnimationFrame(t => frame(t));
};
if (location.hash !== '#big') requestAnimationFrame(t => frame(t));
// крупно для проверки (#big в адресе)
if (location.hash === '#big') { cv.width = 1500; cv.height = 520; frame = () => {}; const draw = () => { const t = window.__T || 0; g.fillStyle = '#7fae5a'; g.fillRect(0, 0, 1500, 520); [['side', 1], ['fs', 1], ['front', 1], ['bs', 1], ['back', 1]].forEach(([v, d], i) => mount(150 + i * 300, 430, 'bay', v, d, RIDERS[window.__R ?? (i % 3)][1], window.__W, t, 5)); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
