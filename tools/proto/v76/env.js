// Эскиз окружения Храма квакунов: вход, предбанник, коридор с залом, мобы рядом с героем.
import { beastSpr, personSpr, drawFrame, MOB_SCALE, FRAMES } from '../../../src/art/sprites.js';
import * as T from '../../../src/art/temple.js';
import { ground, mossTree, fern } from '../../../src/art/forest.js';
import { newHero } from '../../../src/entities/hero.js';
import { lookOf } from '../../../src/systems/items.js';
const hero = lookOf(newHero('Гость', 'warrior'));
const H = (g, x, y, v = 'side', m = 'idle', f = 0, d = 1) => drawFrame(g, personSpr(hero, v, m, f), x, y, d, 1);
const M = (g, k, x, y, v = 'side', m = 'idle', f = 0, d = 1) => drawFrame(g, beastSpr(k, v, m, f), x, y, d, MOB_SCALE[k] || 1);
export function entrance(cv, t) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.save(); g.scale(1.6, 1.6); ground(g, 0, 0, cv.width / 1.6, cv.height / 1.6, 4);
  // стены впадины по бокам
  g.fillStyle = '#44503e'; g.beginPath(); g.moveTo(0, 0); g.lineTo(90, 0); g.quadraticCurveTo(60, 160, 0, 240); g.closePath(); g.fill(); g.beginPath(); g.moveTo(cv.width / 1.6, 0); g.lineTo(cv.width / 1.6 - 90, 0); g.quadraticCurveTo(cv.width / 1.6 - 60, 160, cv.width / 1.6, 240); g.closePath(); g.fill();
  g.save(); g.translate(cv.width / 3.2, 200); T.entrance(g, t); g.restore();
  for (const [x, y, s] of [[70, 300, 0.9], [cv.width / 1.6 - 60, 290, 1], [120, 60, 0.7]]) { g.save(); g.translate(x, y); g.scale(s, s); mossTree(g, 110, x | 0); g.restore(); }
  for (const [x, y] of [[180, 310], [cv.width / 1.6 - 170, 320], [cv.width / 3.2 + 40, 330]]) { g.save(); g.translate(x, y); fern(g, 1.1, x | 0); g.restore(); }
  // дорога к ступеням
  g.fillStyle = 'rgba(150,130,90,.55)'; g.beginPath(); g.moveTo(cv.width / 3.2 - 40, 262); g.quadraticCurveTo(cv.width / 3.2 - 30, 330, cv.width / 3.2 - 20, cv.height / 1.6); g.lineTo(cv.width / 3.2 + 60, cv.height / 1.6); g.quadraticCurveTo(cv.width / 3.2 + 40, 330, cv.width / 3.2 + 40, 262); g.closePath(); g.fill();
  H(g, cv.width / 3.2 - 50, 290, 'back'); M(g, 'kvak_guard', cv.width / 3.2 + 95, 268, 'front'); M(g, 'kvak_guard', cv.width / 3.2 - 130, 268, 'front');
  g.restore();
}
export function antechamber(cv, t) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.scale(1.6, 1.6); const W = cv.width / 1.6, Hh = cv.height / 1.6;
  g.fillStyle = '#0e120e'; g.fillRect(0, 0, W, Hh);
  T.floor(g, 40, 150, W - 80, Hh - 150, 2); T.backWall(g, 40, 150, W - 80, 130, 3, t, [W * 0.25, W * 0.75]);
  T.sideWall(g, 0, 0, 40, Hh, 4); T.sideWall(g, W - 40, 0, 40, Hh, 5);
  T.doorway(g, W / 2, 150, 60, 86, true); T.doorway(g, W / 2, Hh + 10, 70, 60, true);
  g.fillStyle = '#ece6d2'; g.font = '9px sans-serif'; g.textAlign = 'center'; g.fillText('вглубь храма', W / 2, 60); g.fillText('наружу', W / 2, Hh - 6); g.textAlign = 'left';
  T.restFire(g, W / 2, 230, t);
  T.column(g, 110, 150, 90); T.column(g, W - 110, 150, 90);
  // алтарь-прилавок (пока пустой) и бочки
  g.save(); g.translate(W - 150, 230); T.chest(g, 0, 0); g.restore();
  for (const [x, y] of [[90, 250], [112, 262]]) { g.fillStyle = '#6a4a2a'; g.beginPath(); g.ellipse(x, y, 10, 14, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#24180f'; g.lineWidth = 1.2; g.stroke(); g.strokeStyle = '#3a2a1a'; g.beginPath(); g.moveTo(x - 10, y - 4); g.lineTo(x + 10, y - 4); g.moveTo(x - 10, y + 5); g.lineTo(x + 10, y + 5); g.stroke(); }
  T.rubble(g, W - 90, 150, 5, 8);
  H(g, W / 2 - 60, 268, 'fs');
  g.restore();
}
export function hall(cv, t) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.scale(1.6, 1.6); const W = cv.width / 1.6, Hh = cv.height / 1.6;
  g.fillStyle = '#0e120e'; g.fillRect(0, 0, W, Hh);
  // коридор снизу вливается в зал
  T.floor(g, 40, 150, W - 80, 180, 6); T.floor(g, W / 2 - 60, 320, 120, Hh - 320, 7, 30);
  T.backWall(g, 40, 150, W - 80, 140, 9, t, [120, W - 120]);
  T.sideWall(g, 0, 0, 40, 330, 10); T.sideWall(g, W - 40, 0, 40, 330, 11);
  T.sideWall(g, 40, 330, W / 2 - 100, 12, 12); T.sideWall(g, W / 2 + 60, 330, W / 2 - 100, 12, 13); T.sideWall(g, W / 2 - 72, 330, 12, Hh - 330, 14); T.sideWall(g, W / 2 + 60, 330, 12, Hh - 330, 15);
  for (const [x, lbl] of [[W * 0.25, 'Бульк'], [W / 2, 'Квакша'], [W * 0.75, 'Аспид']]) { T.doorway(g, x, 150, 54, 80, true); g.fillStyle = '#ece6d2'; g.font = '9px sans-serif'; g.textAlign = 'center'; g.fillText(lbl, x, 62); }
  T.channelV(g, 54, 150, 330, 10, t); T.channelV(g, W - 54, 150, 330, 10, t); T.column(g, W * 0.37, 150, 100); T.column(g, W * 0.63, 150, 100);
  T.rubble(g, 130, 300, 8, 21); T.chest(g, W - 130, 250);
  // мобы
  M(g, 'kvak_guard', W * 0.3, 250, 'side', 'walk', Math.floor(t * 10) % 8, -1); M(g, 'kvak_priest', W * 0.62, 230, 'front'); M(g, 'temple_frog', W * 0.5, 280, 'side', 'walk', Math.floor(t * 8) % 8);
  H(g, W / 2 + 10, 380, 'back');
  g.restore();
}
export function fight(cv, t) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.scale(2.4, 2.4); const W = cv.width / 2.4, Hh = cv.height / 2.4;
  T.floor(g, 0, 0, W, Hh, 3, 40, false);
  const f6 = Math.floor(t * 7) % 6, f8 = Math.floor(t * 10) % 8;
  // страж: идёт, бьёт, с героем
  g.fillStyle = '#ece6d2'; g.font = '7px sans-serif'; g.fillText('Квакун-страж: щит и дубина, 20 ур.', 10, 14); g.fillText('Храмовая лягушка: прыжок, язык, 20 ур.', 10, Hh / 2 + 12);
  M(g, 'kvak_guard', 50, 80, 'side'); M(g, 'kvak_guard', 110, 80, 'side', 'walk', f8); M(g, 'kvak_guard', 170, 80, 'front'); M(g, 'kvak_guard', 250, 80, 'side', 'atk', f6); H(g, 300, 82, 'side', 'atk', f6, -1);
  M(g, 'temple_frog', 50, Hh - 16, 'side'); M(g, 'temple_frog', 110, Hh - 16, 'side', 'walk', f8); M(g, 'temple_frog', 170, Hh - 16, 'front'); M(g, 'temple_frog', 240, Hh - 16, 'side', 'atk', f6); H(g, 300, Hh - 14, 'side', 'atk', f6, -1);
  g.restore();
}
