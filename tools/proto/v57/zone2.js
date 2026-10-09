// Эскиз второй зоны: карта Хуторских угодий, вид местности, новые мобы в движении.
import { FARMS } from '../../../data/zones.js';
import { MOBS } from '../../../data/mobs.js';
import { lairGlyph } from '../../../src/ui/map.js';
import { LOOK } from '../../../src/art/look.js';
import { BLD } from '../../../src/art/bld.js';
import { person } from '../../../src/art/rig.js';
import { beast } from '../../../src/art/beasts.js';
import { MOB_LOOK, MOB_SCALE } from '../../../src/art/sprites.js';
import { field, river, bridge, haystack, wattle, millBase, millBlades, well, riverAt } from '../../../src/art/farmland.js';
import { lvlColor } from '../../../data/balance.js';

const Z = FARMS;
// ---------------------------------------------------------------- 1. карта
{
  const cv = document.getElementById('map'), g = cv.getContext('2d'), CW = 1100, CH = Math.round(CW * Z.H / Z.W), k = CW / Z.W;
  cv.width = CW * 2; cv.height = CH * 2; g.setTransform(2, 0, 0, 2, 0, 0);
  g.fillStyle = '#2a2a1a'; g.fillRect(0, 0, CW, CH);
  g.beginPath(); Z.edge.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.closePath(); g.fillStyle = '#a8a058'; g.fill(); g.strokeStyle = '#6a6a3a'; g.lineWidth = 2; g.stroke();
  const col = { wheat: '#d8b44a', sun: '#c9b030', cabbage: '#7ab04a', pasture: '#9aaa52', orchard: '#6a8a3a' };
  for (const F of Z.fields) { g.save(); g.translate(F.x * k, F.y * k); g.rotate(F.a); g.fillStyle = col[F.crop]; g.globalAlpha = 0.85; g.fillRect(-F.w * k / 2, -F.h * k / 2, F.w * k, F.h * k); g.globalAlpha = 1; g.strokeStyle = 'rgba(60,40,20,.5)'; g.strokeRect(-F.w * k / 2, -F.h * k / 2, F.w * k, F.h * k); g.restore(); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const rd of Z.roads) { g.beginPath(); rd.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.strokeStyle = '#c9b48a'; g.lineWidth = 4; g.stroke(); }
  g.beginPath(); Z.river.pts.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.strokeStyle = '#3f7a92'; g.lineWidth = Z.river.w * k + 3; g.stroke();
  for (const bx of Z.river.bridges) { const p = riverAt(Z.river.pts, bx); g.save(); g.translate(p.x * k, p.y * k); g.rotate(p.a); g.fillStyle = '#8a6a42'; g.strokeStyle = '#24180f'; g.lineWidth = 1; g.fillRect(-5, -9, 10, 18); g.strokeRect(-5, -9, 10, 18); g.restore(); }
  for (const f of Z.farmsteads) { const x = f.x * k, y = f.y * k; g.fillStyle = f.burned ? '#4a3a32' : '#c98a4a'; g.strokeStyle = '#24180f'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 6, y + 4); g.lineTo(x - 6, y - 2); g.lineTo(x, y - 7); g.lineTo(x + 6, y - 2); g.lineTo(x + 6, y + 4); g.closePath(); g.fill(); g.stroke(); if (f.burned) { g.fillStyle = '#ff7a2a'; g.beginPath(); g.arc(x + 4, y - 7, 2.4, 0, 7); g.fill(); } }
  const V = Z.village; g.fillStyle = 'rgba(217,199,154,.75)'; g.strokeStyle = '#6a5a3a'; g.lineWidth = 2; g.beginPath(); g.arc(V.x * k, V.y * k, V.R * k, 0, 7); g.fill(); g.stroke();
  for (const b of V.buildings) { const x = (V.x + b.dx) * k, y = (V.y + b.dy) * k; g.fillStyle = '#c98a4a'; g.strokeStyle = '#24180f'; g.lineWidth = 1; g.fillRect(x - 4, y - 4, 8, 8); g.strokeRect(x - 4, y - 4, 8, 8); }
  const gx = Z.graveyard.x * k, gy = Z.graveyard.y * k; g.fillStyle = '#eee'; g.fillRect(gx - 1.2, gy - 6, 2.4, 12); g.fillRect(gx - 4, gy - 3, 8, 2.4);
  for (const cp of Z.camps) { const x = cp.x * k, y = cp.y * k, r = Math.max(16, (cp.r + 90) * k); g.fillStyle = 'rgba(80,40,30,.18)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.setLineDash([5, 4]); g.strokeStyle = 'rgba(80,40,30,.7)'; g.lineWidth = 1.5; g.stroke(); g.setLineDash([]); lairGlyph(g, cp.lair, x, y, 1.3); }
  const text = (s, x, y, c, size, bold = true) => { g.font = `${bold ? 'bold ' : ''}${size}px Georgia, serif`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,14,8,.9)'; g.strokeText(s, x, y); g.fillStyle = c; g.fillText(s, x, y); };
  for (const cp of Z.camps) { const r = Math.max(16, (cp.r + 90) * k); text(cp.name, cp.x * k, cp.y * k + r + 13, '#fff2d8', 13); text(cp.lvl[0] === cp.lvl[1] ? `ур. ${cp.lvl[0]}` : `ур. ${cp.lvl[0]}–${cp.lvl[1]}`, cp.x * k, cp.y * k + r + 27, lvlColor(cp.lvl[1], 7), 12); }
  text(V.name, V.x * k, V.y * k + 4, '#ffe9a8', 15); text('Кладбище', gx, gy + 18, '#e8e0cc', 11, false);
  text('река', 5200 * k, 2560 * k, '#cfeaff', 12, false);
  for (const e of Z.exits) { g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(e.x * k, e.y * k, 6, 0, 7); g.fill(); text(`${e.to} · ${e.lvl}`, e.x * k, e.y * k + (e.y < 1000 ? 22 : -10), '#ffd34d', 12); }
}

// ---------------------------------------------------------------- 2. вид местности
const scene = document.getElementById('scene'), sg = scene.getContext('2d'), SW = 1100, SH = 620;
scene.width = SW * 2; scene.height = SH * 2;
const bg = document.createElement('canvas'); bg.width = SW; bg.height = SH;
{ const g = bg.getContext('2d'); LOOK.use(g); LOOK.ground(0, 0, SW, SH, 'z3', 61, 2);
  field(g, { x: 230, y: 150, w: 380, h: 220, a: 0.06, crop: 'wheat' }); field(g, { x: 640, y: 130, w: 300, h: 180, a: -0.05, crop: 'sun' }); field(g, { x: 930, y: 470, w: 260, h: 200, a: 0.1, crop: 'cabbage' });
  river(g, { w: 90, pts: [[-20, 360], [300, 330], [600, 400], [900, 340], [1120, 370]] });
  for (let i = 0; i < 40; i++) LOOK.tuft(Math.random() * SW, 420 + Math.random() * 200, 1, 'z3', Math.random()); }
const props = [];
props.push({ y: 470, d: g => { g.save(); g.translate(600, 400); g.rotate(Math.atan2(70, 300) * 0 + 0.2); bridge(g, 170); g.restore(); } });
props.push({ y: 300, d: g => { g.save(); g.translate(470, 300); haystack(g); g.restore(); } });
props.push({ y: 250, d: g => { g.save(); g.translate(30, 260); wattle(g, 380, -10); g.restore(); } });
props.push({ y: 600, d: (g, t) => { g.save(); g.translate(130, 600); millBase(g, false); g.translate(0, -112); millBlades(g, t * 0.6, false); g.restore(); } });
props.push({ y: 230, d: g => { g.save(); g.translate(930, 230); BLD.use(g, false); g.scale(1.1, 1.1); BLD.farm(2, false, 0, false); g.restore(); } });
props.push({ y: 590, d: g => { g.save(); g.translate(1010, 590); BLD.use(g, false); BLD.farm(2, false, 0, true); g.restore(); } });
props.push({ y: 560, d: g => { g.save(); g.translate(380, 560); well(g); g.restore(); } });
const actors = [
  { k: 'dog', x: 300, y: 520, vx: 60, vy: 0 }, { k: 'dog', x: 250, y: 540, vx: 60, vy: 0 },
  { k: 'scarecrow', x: 250, y: 180, vx: 0, vy: 0 }, { k: 'crow', x: 640, y: 190, vx: -40, vy: 10 }, { k: 'crow', x: 700, y: 140, vx: -40, vy: 14 },
  { k: 'bull', x: 820, y: 560, vx: -45, vy: 0 }, { k: 'robber', x: 560, y: 480, vx: 0, vy: 30 }, { k: 'firestarter', x: 760, y: 250, vx: 0, vy: -20 }, { k: 'miller', x: 210, y: 560, vx: 0, vy: 0 },
];
function drawActor(g, A, t) {
  const hum = !!MOB_LOOK[A.k], sc = (MOB_SCALE[A.k] || 1) * (hum ? 1.15 : 1);
  const mv = Math.hypot(A.vx, A.vy) > 1, view = !mv ? 'front' : Math.abs(A.vy) > Math.abs(A.vx) * 0.9 ? (A.vy > 0 ? 'front' : 'back') : 'side', dir = view === 'side' && A.vx < 0 ? -1 : 1;
  const pose = { t, walk: mv ? (t * 1.4 + A.x * 0.01) % 1 : -1, atk: -1 };
  g.save(); g.translate(A.x, A.y); g.scale(sc * (view === 'side' ? dir : 1), sc);
  if (hum) person(g, MOB_LOOK[A.k], view, pose); else beast(g, A.k, view, pose); g.restore();
}
let last = performance.now();
function loop(now) {
  const t = now / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
  for (const A of actors) { A.x += A.vx * dt; A.y += A.vy * dt; if (A.x < 40 || A.x > SW - 40) A.vx *= -1; if (A.y < 120 || A.y > SH - 20) A.vy *= -1; }
  sg.setTransform(2, 0, 0, 2, 0, 0); sg.drawImage(bg, 0, 0);
  const L = props.map(p => ({ y: p.y, f: g => p.d(g, t) })).concat(actors.map(A => ({ y: A.y, f: g => drawActor(g, A, t) })));
  L.sort((a, b) => a.y - b.y); for (const o of L) o.f(sg);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------------------------------------------------------------- 3. новые мобы: все действия и стороны
const LIST = [['dog', 'Дикий пёс'], ['crow', 'Чёрная ворона'], ['scarecrow', 'Ожившее пугало'], ['bull', 'Бешеный бык'], ['robber', 'Грабитель'], ['firestarter', 'Поджигатель'], ['miller', 'Мельник-колдун · редкий']];
const DIRS = [['вниз', 'front', 1], ['вправо', 'side', 1], ['вверх', 'back', 1], ['влево', 'side', -1]];
let mode = 'walk', dirMode = 'cycle';
const row = document.getElementById('mobs'), cells = [];
for (const [k, n] of LIST) { const f = document.createElement('figure'), cv = document.createElement('canvas'), cap = document.createElement('figcaption'); cv.width = cv.height = 220; const D = MOBS[k]; cap.innerHTML = `<b>${n}</b><small>${D.trait === 'pack' ? 'зовёт своих' : D.trait === 'dormant' ? 'стоит неживым, пока не подойдёшь' : D.trait === 'charge' ? 'таранит с разбега' : D.trait === 'ranged' ? 'бросает огонь издалека, поджигает' : D.trait === 'caster' ? 'колдует издалека, зовёт ворон' : ''}${D.flying ? ', летает' : ''}</small>`; f.append(cv, cap); row.append(f); cells.push({ cv, k }); }
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b)); });
document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => { dirMode = b.dataset.dir; document.querySelectorAll('[data-dir]').forEach(x => x.classList.toggle('on', x === b)); });
function gallery(now) {
  const t = now / 1000, di = dirMode === 'cycle' ? Math.floor(t / 2.4) % 4 : +dirMode, [, view, dir] = DIRS[di];
  for (const C of cells) {
    const g = C.cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#a8a058'; g.fillRect(0, 0, 220, 220);
    const pose = { t, walk: -1, atk: -1, hit: 0, dead: 0 };
    if (mode === 'walk') pose.walk = (t * 1.6) % 1; if (mode === 'atk') { const q = (t % 1.4) / 1.4; pose.atk = q < 0.75 ? q / 0.75 : -1; } if (mode === 'dead') pose.dead = Math.min(1, ((t % 2.4) / 2.4) * 1.5);
    const hum = !!MOB_LOOK[C.k], sc = hum ? 3.0 * (MOB_SCALE[C.k] || 1) : 2.6 * (MOB_SCALE[C.k] || 1);
    g.save(); g.translate(110, hum ? 140 : 170); g.scale(sc * (view === 'side' ? dir : 1), sc);
    if (hum) person(g, MOB_LOOK[C.k], view, pose); else beast(g, C.k, view, pose); g.restore();
  }
  requestAnimationFrame(gallery);
}
requestAnimationFrame(gallery);
