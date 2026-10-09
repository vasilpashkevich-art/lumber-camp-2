// Эскиз v58: новая столица — фонтан, аллея из плит, лестница, королевский замок (3 варианта), масштаб.
import { LOOK } from '../../../src/art/look.js';
import { BLD } from '../../../src/art/bld.js';
import { person } from '../../../src/art/rig.js';
import { LIGHTS, castle, stairs, brazierFire, paving, roundPlaza, fountain, lamp, flowerbed, wall, roundTower, cone, merlons, masonry, gate } from '../../../src/art/castle.js';

const RO = 55;   // рост героя в шагах мира
const HERO = { cls: 'warrior', chest: 1, legs: 1, head: 0, wt: 0 };
const GUARD = { cls: 'warrior', chest: 3, legs: 3, head: 2, wt: 1, band: '#2f4f8a' };
const man = (g, L, x, y, t, view = 'front', sc = 1.15) => { g.save(); g.translate(x, y); g.scale(sc, sc); person(g, L, view, { walk: -1, t }); g.restore(); };
let V = 'a', NIGHT = false;

// ---------------------------------------------------------------- 1. сцена
const SW = 1500, SH = 1400, CX = 750, BASE = 720, STEP = 14, NST = 6, FY = 1200;
const scene = document.getElementById('scene'), sg = scene.getContext('2d');
scene.width = SW; scene.height = SH;
const bg = document.createElement('canvas'); bg.width = SW; bg.height = SH;
{
  const g = bg.getContext('2d'); LOOK.use(g); LOOK.ground(0, 0, SW, SH, 'z1', 53, 2);
  // терраса перед замком
  paving(g, 250, BASE - 70, 1000, 70, 5, false);
  // аллея и боковые дорожки
  const AW = 190, ay = BASE + NST * STEP;
  paving(g, CX - AW / 2, ay, AW, FY - ay, 7);
  paving(g, 0, FY - 70, SW, 140, 8);
  roundPlaza(g, CX, FY, 250, 9);
  for (let i = 0; i < 160; i++) { const x = Math.random() * SW, y = BASE + 100 + Math.random() * (SH - BASE - 100); if (Math.abs(x - CX) < 130 || Math.abs(y - FY) < 90 || Math.hypot(x - CX, y - FY) < 270) continue; LOOK.tuft(x, y, 1, 'z1', Math.random()); }
}
function city(g, t) {
  // городская стена за замком: 3 роста
  const H = 3 * RO;
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -40 : CX + 300, w = sd < 0 ? CX - 300 + 40 : SW - CX - 300 + 40;
    wall(g, x0, BASE - 90 - H, w, H, '#8d8a82', 7 + sd);
  }
  for (const x of [120, SW - 120]) { const top = roundTower(g, x, BASE - 90, 110, H + 70, '#8d8a82', 3 + x); merlons(g, x - 60, top, 120, '#8d8a82'); cone(g, x, top - 22, 150, 120, '#a8322a', t, '#c43a2c'); }
}
function terraceFront(g) {
  // подпорная стенка террасы по бокам лестницы
  const sw = 240, h = NST * STEP;
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? 250 : CX + sw / 2 + NST * 5 + 20, x1 = sd < 0 ? CX - sw / 2 - NST * 5 - 20 : 1250;
    masonry(g, x0, BASE, x1 - x0, h, '#a39d90', 30 + sd, 12);
    g.strokeStyle = '#24180f'; g.lineWidth = 2; g.strokeRect(x0, BASE, x1 - x0, h);
    // балюстрада
    g.fillStyle = '#c9c2b2'; g.fillRect(x0, BASE - 8, x1 - x0, 8); g.strokeRect(x0, BASE - 8, x1 - x0, 8);
    for (let x = x0 + 8; x < x1 - 4; x += 14) { g.beginPath(); g.roundRect(x, BASE - 30, 7, 22, 3); g.fillStyle = '#ddd6c6'; g.fill(); g.lineWidth = 1; g.stroke(); }
    g.fillStyle = '#c9c2b2'; g.fillRect(x0, BASE - 36, x1 - x0, 7); g.lineWidth = 1.6; g.strokeRect(x0, BASE - 36, x1 - x0, 7);
  }
}
const props = [];
// фонари вдоль аллеи
for (let y = BASE + 170; y < FY - 220; y += 130) for (const sd of [-1, 1]) props.push({ y, d: (g, t) => { g.save(); g.translate(CX + sd * 118, y); lamp(g, t, NIGHT); g.restore(); } });
// клумбы и деревья на газонах (деревья ×1,5)
for (const [x, y, w, h] of [[470, 920, 200, 60], [1030, 920, 200, 60], [470, 1060, 160, 50], [1030, 1060, 160, 50]]) props.push({ y: y - 40, d: g => { g.save(); g.translate(x, y); flowerbed(g, w, h, x + y); g.restore(); } });
for (const [x, y, k] of [[300, 880, 1], [1200, 880, 1], [180, 1060, 2], [1330, 1060, 2], [330, 1360, 3], [1180, 1370, 3]]) props.push({ y, d: g => { LOOK.use(g); LOOK.tree(k, x, y, 1.5, (x % 7) / 7, 1.2); } });
// стража: у лестницы и у ворот
const guards = [[CX - 175, BASE + NST * STEP + 30, 'front'], [CX + 175, BASE + NST * STEP + 30, 'front'], [CX - 64, BASE - 4, 'front'], [CX + 64, BASE - 4, 'front']];
for (const [x, y, v] of guards) props.push({ y, d: (g, t) => man(g, GUARD, x, y, t, v) });
props.push({ y: 990, d: (g, t) => man(g, HERO, CX - 40, 990, t, "back") });
props.push({ y: FY + 8, d: (g, t) => { g.save(); g.translate(CX, FY + 8); fountain(g, t, 110); g.restore(); } });

function drawScene(t) {
  const g = sg; LIGHTS.length = 0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0);
  g.lineJoin = 'round'; g.lineCap = 'round';
  city(g, t);
  g.save(); g.translate(CX, BASE - 70); castle(g, V, t, NIGHT); g.restore();
  // ворота замка стоят на террасе: от фасада до края террасы — плиты; лестница
  terraceFront(g);
  g.save(); g.translate(CX, BASE); stairs(g, 240, NST, STEP); g.restore();
  const bx = 240 / 2 + NST * 5 + 12;
  for (const sd of [-1, 1]) brazierFire(g, CX + sd * (bx + 4), BASE + NST * STEP - 46, t, NIGHT);
  props.sort((a, b) => a.y - b.y); for (const p of props) p.d(g, t);
  if (NIGHT) { g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(70,80,140,0.55)'; g.fillRect(0, 0, SW, SH); g.globalCompositeOperation = 'source-over';
    // свет поверх ночи: окна заново, вокруг огней — мягкое сияние
    for (const L of LIGHTS) if (L.w) { g.fillStyle = L.kind === 'lamp' ? '#fff0b0' : '#ffd36a'; g.beginPath(); g.roundRect(L.x + 1, L.y + 1, L.w - 2, L.h - 2, [L.w / 2, L.w / 2, 1, 1]); g.fill(); }
    g.globalCompositeOperation = 'lighter';
    for (const L of LIGHTS) { const cx = L.x + L.w / 2, cy = L.y + L.h / 2, gr = g.createRadialGradient(cx, cy, 1, cx, cy, L.r); gr.addColorStop(0, L.kind === 'fire' ? 'rgba(255,140,50,.42)' : 'rgba(255,200,100,.30)'); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.fillRect(cx - L.r, cy - L.r, L.r * 2, L.r * 2); }
    g.globalCompositeOperation = 'source-over'; }
  // подписи ростов
  g.font = 'bold 18px Georgia'; g.textAlign = 'left'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,14,8,.85)'; g.fillStyle = '#ffe9a8';
  const tx = (s, x, y) => { g.strokeText(s, x, y); g.fillText(s, x, y); };
  tx('ворота 2,3 роста', CX + 48, BASE - 140); tx('стена города 3 роста', 30, BASE - 90 - 3 * RO - 40); tx("герой", CX - 30, 1022);
}

// ---------------------------------------------------------------- 2. план
{
  const cv = document.getElementById('plan'), g = cv.getContext('2d'), S = 1100, R = 820, k = S / (2 * R + 360), C = S / 2;
  cv.width = S * 2; cv.height = S * 2; g.setTransform(2, 0, 0, 2, 0, 0); g.lineJoin = 'round'; g.lineCap = 'round';
  const P = (x, y) => [C + x * k, C + y * k];
  g.fillStyle = '#5f7a3a'; g.fillRect(0, 0, S, S);
  // дороги снаружи
  g.strokeStyle = '#c9b48a'; g.lineWidth = 60 * k; g.beginPath(); g.moveTo(...P(R, 0)); g.lineTo(...P(R + 200, 30)); g.moveTo(...P(0, R)); g.lineTo(...P(30, R + 200)); g.stroke();
  // внутри: газон
  g.fillStyle = '#7a9a46'; g.beginPath(); g.arc(C, C, R * k, 0, 7); g.fill();
  const slab = '#c4beb0', slabD = '#8f897c';
  const path = (pts, w) => { g.strokeStyle = slabD; g.lineWidth = w * k + 4; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...P(...p)) : g.moveTo(...P(...p))); g.stroke(); g.strokeStyle = slab; g.lineWidth = w * k; g.stroke(); };
  // аллея юг → фонтан → замок, восток → фонтан, кольцо
  path([[0, R], [0, -R + 360]], 190);
  path([[R, 0], [0, 0]], 140); path([[-R + 40, 0], [0, 0]], 140);
  g.strokeStyle = slabD; g.lineWidth = 90 * k + 4; g.beginPath(); g.arc(C, C, 470 * k, 0, 7); g.stroke(); g.strokeStyle = slab; g.lineWidth = 90 * k; g.stroke();
  g.fillStyle = slab; g.strokeStyle = slabD; g.lineWidth = 2; g.beginPath(); g.arc(C, C, 250 * k, 0, 7); g.fill(); g.stroke();
  // фонтан
  g.fillStyle = '#c9c2b2'; g.beginPath(); g.arc(C, C, 110 * k, 0, 7); g.fill(); g.strokeStyle = '#24180f'; g.stroke(); g.fillStyle = '#4f8fb0'; g.beginPath(); g.arc(C, C, 90 * k, 0, 7); g.fill();
  // терраса и замок у северной стены
  const tw = 1000, ty = -R + 60;
  g.fillStyle = '#b9b3a6'; g.fillRect(...P(-tw / 2, ty + 230), tw * k, 120 * k);
  g.fillStyle = '#8d8a82'; g.strokeStyle = '#24180f'; g.lineWidth = 2; g.fillRect(...P(-340, ty), 680 * k, 250 * k); g.strokeRect(...P(-340, ty), 680 * k, 250 * k);
  for (const x of [-300, 300]) { g.beginPath(); g.arc(...P(x, ty + 190), 60 * k, 0, 7); g.fillStyle = '#a8322a'; g.fill(); g.stroke(); }
  g.fillStyle = '#9a978e'; g.fillRect(...P(-60, ty - 10), 120 * k, 130 * k); g.strokeRect(...P(-60, ty - 10), 120 * k, 130 * k);
  // клумбы
  for (const [x, y] of [[-200, -330], [200, -330], [-200, 330], [200, 330]]) { g.fillStyle = '#4a6a2a'; g.beginPath(); g.ellipse(...P(x, y), 80 * k, 30 * k, 0, 0, 7); g.fill(); g.strokeStyle = '#5a3e26'; g.lineWidth = 2; g.stroke(); for (let i = 0; i < 9; i++) { g.fillStyle = ['#e85a5a', '#f4c766', '#fff', '#b86ad8'][i % 4]; g.beginPath(); g.arc(...P(x - 60 + i * 15, y + (i % 2 ? 8 : -8)), 2.2, 0, 7); g.fill(); } }
  for (const [x, y] of [[-200, 640], [220, 640], [-300, 250], [300, -250], [300, 250], [-300, -250]]) { g.fillStyle = '#3e6a2a'; g.beginPath(); g.arc(...P(x, y), 46 * k, 0, 7); g.fill(); g.strokeStyle = '#24180f'; g.lineWidth = 1.4; g.stroke(); }
  // постройки
  const B = [['Рынок', -640, 0, 220, 170, '#c98a4a'], ['Таверна', -470, 470, 220, 150, '#a8743e'], ['Кузница', 480, -440, 200, 140, '#6a6660'], ['Гильдия рудокопов', 470, 470, 230, 150, '#7a6a52'], ['Мастерская чар', -480, -440, 200, 140, '#6a4a8a'], ['Дом', 690, -200, 120, 120, '#b08050'], ['Дом', 690, 200, 120, 120, '#b08050'], ['Дом', -660, 230, 120, 110, '#b08050'], ['Дом', -660, -230, 120, 110, '#b08050']];
  g.font = 'bold 13px Georgia'; g.textAlign = 'center';
  for (const [n, x, y, w, h, c] of B) { g.fillStyle = c; g.strokeStyle = '#24180f'; g.lineWidth = 2; g.fillRect(...P(x - w / 2, y - h / 2), w * k, h * k); g.strokeRect(...P(x - w / 2, y - h / 2), w * k, h * k); const [lx, ly] = P(x, y); g.lineWidth = 4; g.strokeStyle = 'rgba(20,14,8,.85)'; g.strokeText(n, lx, ly + 4); g.fillStyle = '#fff2d8'; g.fillText(n, lx, ly + 4); }
  // стена: старая пунктиром, новая
  g.setLineDash([8, 6]); g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(C, C, 560 * k, 0, 7); g.stroke(); g.setLineDash([]);
  g.strokeStyle = '#6a6760'; g.lineWidth = 26 * k + 4; g.beginPath(); for (const [a0, a1] of [[0.12, Math.PI / 2 - 0.1], [Math.PI / 2 + 0.1, Math.PI * 2 - 0.12]]) { g.moveTo(C + Math.cos(a0) * R * k, C + Math.sin(a0) * R * k); g.arc(C, C, R * k, a0, a1); } g.stroke();
  for (const a of [0.12, -0.12, Math.PI / 2 - 0.1, Math.PI / 2 + 0.1, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5 - 0.5, Math.PI * 1.5 + 0.5]) { g.fillStyle = '#8d8a82'; g.strokeStyle = '#24180f'; g.lineWidth = 1.6; g.beginPath(); g.arc(C + Math.cos(a) * R * k, C + Math.sin(a) * R * k, 34 * k, 0, 7); g.fill(); g.stroke(); }
  const T = (s, x, y, c = '#ffe9a8', z = 15) => { g.font = `bold ${z}px Georgia`; g.lineWidth = 4; g.strokeStyle = 'rgba(20,14,8,.9)'; g.strokeText(s, x, y); g.fillStyle = c; g.fillText(s, x, y); };
  T('Королевский замок', ...P(0, ty + 130), '#ffe9a8', 17); T('Фонтан', C, C + 4, '#e8f4ff', 13);
  T('Восточные ворота', ...P(R + 90, -40), '#ffd34d', 13); T('Южные ворота', ...P(0, R + 90), '#ffd34d', 13);
  T('нынешняя стена', ...P(-330, 650), 'rgba(255,240,200,.85)', 12);
  // масштаб
  const sx = 40, sy = S - 30; g.fillStyle = '#fff'; g.fillRect(sx, sy, 10 * RO * k, 5); g.strokeStyle = '#24180f'; g.strokeRect(sx, sy, 10 * RO * k, 5); g.textAlign = 'left'; T('10 ростов', sx, sy - 8, '#fff', 12);
}

// ---------------------------------------------------------------- 3. масштаб
{
  const cv = document.getElementById('scale'), g = cv.getContext('2d'), W = 1100, H = 330, GY = 270;
  cv.width = W * 2; cv.height = H * 2;
  const draw = t => {
    g.setTransform(2, 0, 0, 2, 0, 0); g.fillStyle = '#3a4a24'; g.fillRect(0, 0, W, H); g.fillStyle = '#5f7a3a'; g.fillRect(0, GY, W, H - GY);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let k = 1; k <= 4; k++) { const y = GY - k * RO; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; g.font = '11px Georgia'; g.textAlign = 'left'; g.fillText(k + ' рост' + (k === 1 ? '' : 'а'), 6, y - 3); }
    g.lineJoin = 'round'; g.lineCap = 'round';
    man(g, HERO, 120, GY - 12 * 1.15, t);
    g.save(); g.translate(230, GY - 12 * 0.55); g.scale(0.55, 0.55); person(g, GUARD, 'front', { walk: -1, t }); g.restore();
    man(g, GUARD, 320, GY - 12 * 1.15, t);
    g.save(); g.translate(500, GY); BLD.use(g, false); g.scale(1.6, 1.6); BLD.house(1, 0); g.restore(); man(g, HERO, 590, GY - 12 * 1.15, t);
    g.save(); g.translate(800, GY); masonry(g, -90, -190, 180, 190, '#8d8a82', 4); g.strokeStyle = '#24180f'; g.lineWidth = 2; g.strokeRect(-90, -190, 180, 190); gate(g, 0, 0, 74, 126, '#8d8a82'); g.restore(); man(g, HERO, 800, GY - 12 * 1.15 + 4, t, 'back');
    g.save(); LOOK.use(g); LOOK.tree(2, 960, GY, 1, 0.4, 1.2); LOOK.tree(2, 1050, GY, 1.5, 0.4, 1.2); g.restore();
    const T = (s, x) => { g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,14,8,.9)'; g.strokeText(s, x, GY + 24); g.fillStyle = '#ffe9a8'; g.fillText(s, x, GY + 24); };
    T('герой', 120); T('стража сейчас', 230); T('стража новая', 320); T('дом сейчас: дверь 0,4', 520); T('ворота замка 2,3', 800); T('дерево ×1 и ×1,5', 1005);
  };
  const loop = t => { draw(t / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- кнопки и цикл
document.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { V = b.dataset.v; document.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b)); });
document.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { NIGHT = b.dataset.n === '1'; document.querySelectorAll('[data-n]').forEach(x => x.classList.toggle('on', x === b)); });
const loop = t => { drawScene(t / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
