// v121: эскиз Конного двора на западном берегу Соснового дола — конюшня, загон с конями, поилка, сено, конюший; у воды — место под будущую пристань.
import { newHero } from '../../../src/entities/hero.js';
import { makeItem, lookOf } from '../../../src/systems/items.js';
import { person, RIG } from '../../../src/art/toon.js';
import { horse, horseShadow } from '../../../src/art/horse.js';
import { TVIL } from '../../../src/art/tbld.js';
import * as TP from '../../../src/art/tprops.js';
import { NPC_LOOK } from '../../../src/art/npc.js';
import { PEOPLE_K } from '../../../src/art/sprites.js';
import { rng } from '../../../src/engine/util.js';
const hero = (cls, seed) => { const h = newHero('Эскиз', cls); for (const sl of ['head', 'chest', 'legs', 'weapon']) h.eq[sl] = makeItem(cls, sl, 15, 'rare', rng(seed + sl.length)); return lookOf(h); };
const WAR = hero('warrior', 3), ARCH = hero('archer', 7);
const cv = document.getElementById('c'), g = cv.getContext('2d'); cv.width = 1500; cv.height = 860;
const KV = 1.15;
const at = (x, y, fn, s = 1, dir = 1) => { g.save(); g.translate(x, y); g.scale(s * dir, s); fn(); g.restore(); };
function man(x, y, L, view, dir = 1, t = 0) { at(x, y, () => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 12.6, 9, 3, 0, 0, 7); g.fill(); person(g, L, view, { t }); }, PEOPLE_K, dir); }
function steed(x, y, coat, view, dir, pose, L) { at(x, y, () => { g.translate(0, RIG.FOOT); g.scale(RIG.K, RIG.K); horseShadow(g, view); horse(g, coat, view, Object.assign({ rider: !!L, riderFn: L ? (seat, rx) => { g.save(); g.translate(rx, seat + 18.6); g.scale(1 / RIG.K, 1 / RIG.K); g.translate(0, -RIG.FOOT); person(g, L, view, { ride: true, t: pose.t }); g.restore(); } : null }, pose)); }, PEOPLE_K, dir); }
let T = 0, last = performance.now();
function frame(now) {
  T += Math.max(0, now - last) / 1000; last = now; if (window.__T != null) T = window.__T;
  // земля и берег
  g.fillStyle = '#7fae5a'; g.fillRect(0, 0, 1500, 860);
  g.fillStyle = 'rgba(90,140,60,.35)'; for (let i = 0; i < 80; i++) { const r = rng(i * 7 + 1), x = r() * 1500, y = r() * 860; g.beginPath(); g.ellipse(x, y, 30 + r() * 40, 10 + r() * 10, 0, 0, 7); g.fill(); }
  const coast = y => 210 + Math.sin(y / 120) * 26 + Math.sin(y / 47) * 8;
  g.beginPath(); g.moveTo(0, 0); for (let y = 0; y <= 860; y += 10) g.lineTo(coast(y) + 60, y); g.lineTo(0, 860); g.closePath(); g.fillStyle = '#e4cf96'; g.fill();
  g.beginPath(); g.moveTo(0, 0); for (let y = 0; y <= 860; y += 10) g.lineTo(coast(y), y); g.lineTo(0, 860); g.closePath(); const sea = g.createLinearGradient(0, 0, 260, 0); sea.addColorStop(0, '#2f6f8a'); sea.addColorStop(1, '#5aa0b4'); g.fillStyle = sea; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.beginPath(); for (let y = 0; y <= 860; y += 10) { const x = coast(y) - 4 + Math.sin(T * 2 + y / 30) * 3; y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = (i * 67 + T * 8) % 860, x = 40 + (i * 53) % 150; g.beginPath(); g.arc(x, y, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  // дорога: от Столицы (справа) к воротам конюшни и дальше к берегу (будущая пристань)
  g.strokeStyle = '#c9a774'; g.lineWidth = 64; g.lineCap = 'round'; g.beginPath(); g.moveTo(1520, 700); g.quadraticCurveTo(1100, 720, 820, 560); g.quadraticCurveTo(600, 470, 300, 520); g.stroke();
  g.strokeStyle = 'rgba(120,90,50,.25)'; g.lineWidth = 2; g.setLineDash([10, 14]); g.stroke(); g.setLineDash([]);
  // место под пристань — колышки и надпись
  g.fillStyle = 'rgba(60,40,20,.65)'; for (const [x, y] of [[250, 490], [250, 560], [180, 490], [180, 560]]) { g.beginPath(); g.ellipse(x, y, 5, 3, 0, 0, 7); g.fill(); }
  g.font = 'italic 14px Georgia'; g.fillStyle = '#2a1a0a'; g.textAlign = 'center'; g.fillText('здесь будет пристань', 215, 600);
  // загон: дальняя сторона забора, кони, ближняя сторона
  const PX0 = 900, PX1 = 1330, PY0 = 350, PY1 = 560;
  at(PX0, PY0, () => TP.fence(g, PX1 - PX0, true, 3));
  at(PX0, PY0 + 4, () => TP.fence(g, PY1 - PY0, false, 4)); at(PX1, PY0 + 4, () => TP.fence(g, PY1 - PY0, false, 5));
  at(1180, 420, () => TP.haystack(g), 0.9);
  steed(1000, 440, 'grey', 'side', 1, { t: T, bare: true, graze: true });
  steed(1240, 500, 'black', 'fs', -1, { t: T + 1, bare: true });
  steed(1080, 530, 'bay', 'side', -1, { t: T + 2, bare: true, graze: true });
  at(PX0, PY1, () => TP.fence(g, 150, true, 6)); at(PX0 + 240, PY1, () => TP.fence(g, PX1 - PX0 - 240, true, 7));   // проём — калитка
  // конюшня
  at(600, 380, () => TVIL.stable(g, T), KV);
  at(790, 470, () => TVIL.trough(g, T), KV);
  at(380, 420, () => TP.signpost(g), KV);
  // конюший у ворот, рядом пеший герой (масштаб), всадник на дороге
  man(640, 470, NPC_LOOK.farmer, 'front', 1, T);
  g.font = 'bold 15px Georgia'; g.fillStyle = '#ffe9a8'; g.strokeStyle = 'rgba(20,14,8,.9)'; g.lineWidth = 4; g.strokeText('Конюший Прохор', 640, 380); g.fillText('Конюший Прохор', 640, 380);
  g.font = '12px Georgia'; g.strokeText('‹Конный двор›', 640, 396); g.fillStyle = '#d8ccb0'; g.fillText('‹Конный двор›', 640, 396);
  man(720, 500, WAR, 'fs', -1, T);
  steed(980 + ((T * 70) % 700) * -1 + 700, 690, 'bay', 'side', -1, { t: T, walk: (T * 1.6) % 1 }, ARCH);
  // подпись места
  g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = 'rgba(20,14,8,.85)'; g.strokeText('Конный двор', 700, 120); g.fillStyle = '#ffe9a8'; g.fillText('Конный двор', 700, 120);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
