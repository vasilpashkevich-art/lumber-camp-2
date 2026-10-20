// Эскиз v136: Болотный край — план карты, жители топи рядом с героем, застава на сваях.
import { beast, SNAKES, T } from '../../../src/art/beasts.js';
import { personSpr, drawFrame, PEOPLE_K, styled } from '../../../src/art/sprites.js';
import { KIT, TB } from '../../../src/art/tbld.js';
import { starterLook } from '../../../src/systems/items.js';
import { palette } from '../../../src/art/gear.js';
const { sh, ink, paint, shine, rr, roofFill, stoneRect, barrelT, potT } = KIT, TAU = Math.PI * 2;
const O = '#1a140c';

// ---------------------------------------------------------------- план карты
export function drawMap(cv) {
  const W = 9600, H = 6000, k = 0.1; cv.width = W * k + 40; cv.height = H * k + 60; const g = cv.getContext('2d'); g.translate(20, 40);
  g.fillStyle = '#1c2a1a'; g.fillRect(-20, -40, cv.width, cv.height);
  // суша-топь
  g.fillStyle = '#4a5a2e'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W * k, 0); g.lineTo(W * k, H * k); g.lineTo(0, H * k); g.closePath(); g.fill();
  const water = (x, y, rx, ry, a = 0) => { g.fillStyle = '#243a30'; g.beginPath(); g.ellipse(x * k, y * k, rx * k, ry * k, a, 0, TAU); g.fill(); g.strokeStyle = '#1a2a22'; g.lineWidth = 2; g.stroke(); };
  const land = (x, y, rx, ry, col = '#5a6a36') => { g.fillStyle = col; g.beginPath(); g.ellipse(x * k, y * k, rx * k, ry * k, 0, 0, TAU); g.fill(); };
  // большая топь посередине и на юге, окна воды
  for (const [x, y, rx, ry] of [[4800, 3000, 2200, 1000], [2600, 4200, 1400, 800], [7000, 4300, 1600, 900], [3600, 1900, 1100, 600], [6400, 1700, 900, 500], [4800, 5000, 1400, 500], [1400, 2600, 700, 450], [8300, 2400, 800, 500]]) water(x, y, rx, ry);
  // сухие острова-холмы
  for (const [x, y, rx, ry] of [[4800, 3000, 700, 420], [2300, 1400, 900, 600], [7600, 1200, 900, 550], [1400, 4800, 800, 500], [8200, 5000, 700, 450], [6200, 3400, 500, 320]]) land(x, y, rx, ry);
  // гати (брёвна по воде) и дороги
  const road = (pts, col = '#8a7a52', w = 5) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.stroke(); };
  road([[4800, 0], [4800, 900], [4300, 1500], [4700, 2300], [4800, 3000]]);                 // от Гати (север) к острову посередине
  road([[0, 2400], [900, 2500], [1500, 2000], [2300, 1400], [3600, 1200], [4300, 1500]]);    // от Брода (запад) к Заставе
  road([[4800, 3000], [6200, 3400], [7600, 1200]]); road([[4800, 3000], [3800, 3900], [1400, 4800]]); road([[6200, 3400], [8200, 5000]]);
  // гати по воде — пунктир брёвен
  const gat = pts => { g.setLineDash([6, 4]); road(pts, '#a8783a', 4); g.setLineDash([]); };
  gat([[4700, 2300], [4800, 3000]]); gat([[4800, 3000], [6200, 3400]]); gat([[3800, 3900], [1400, 4800]]); gat([[7600, 1200], [8200, 2400]]); gat([[6200, 3400], [7000, 4300]]);
  // застава, входы, костры
  const dot = (x, y, col, r = 7) => { g.fillStyle = col; g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.arc(x * k, y * k, r, 0, TAU); g.fill(); g.stroke(); };
  const txt = (s, x, y, col = '#fff2d8', size = 12) => { g.font = `bold ${size}px Georgia`; g.textAlign = 'center'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText(s, x * k, y * k); g.fillStyle = col; g.fillText(s, x * k, y * k); };
  g.fillStyle = '#c9a070'; g.fillRect(4000 * k, 1000 * k, 700 * k, 450 * k); g.strokeStyle = O; g.strokeRect(4000 * k, 1000 * k, 700 * k, 450 * k); txt('Застава Сухой Кочки', 4350, 960, '#ffe9a8', 13);
  txt('торговец, горн, доска, костёр,', 4350, 1540, '#d8c8a8', 10); txt('учитель рудокопов', 4350, 1660, '#d8c8a8', 10);
  dot(4800, 60, '#ffd34d'); txt('Гать → Грибной лес', 4800, 230, '#ffd34d'); dot(60, 2400, '#ffd34d'); txt('Брод → Хутор', 420, 2300, '#ffd34d');
  dot(600, 2700, '#ff9a3a', 5); txt('костёр', 600, 2850, '#ffc080', 10);
  // логова
  const lairs = [['Змеиные кочки', 14, 3000, 2200, 'гадюки'], ['Тихая заводь', 14, 6000, 1900, 'пиявки'], ['Утопленный хутор', 15, 2300, 1400, 'утопленники'], ['Рыбацкие мостки', 15, 6400, 2500, 'топляки-рыбаки'],
    ['Гнилой остров', 16, 4800, 3000, 'утопленники, пиявки'], ['Чёрная протока', 16, 7000, 3700, 'гадюки, пиявки'], ['Ведьмин круг', 17, 1400, 4800, 'ведьмы'], ['Коряжник', 17, 3800, 3900, 'трясинники'],
    ['Старое капище', 17, 7600, 1200, 'ведьмы, утопленники'], ['Трясина', 18, 8200, 5000, 'трясинники, ведьмы'], ['Омут Хозяйки', 18, 2600, 5200, '★ Хозяйка топи'], ['Болотная гряда', 15, 8300, 2400, 'гадюки, рыбаки']];
  for (const [n, L, x, y, who] of lairs) { g.fillStyle = L >= 18 ? 'rgba(220,80,80,.3)' : L >= 16 ? 'rgba(220,160,60,.3)' : 'rgba(120,200,120,.3)'; g.beginPath(); g.arc(x * k, y * k, 26, 0, TAU); g.fill(); g.setLineDash([3, 3]); g.strokeStyle = 'rgba(255,255,255,.5)'; g.stroke(); g.setLineDash([]); txt(`${n} · ${L}`, x, y - 32, '#fff2d8', 11); txt(who, x, y + 44, '#c8e0b0', 10); }
  // руда и травы
  const area = (x, y, r, col, s) => { g.setLineDash([4, 3]); g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.arc(x * k, y * k, r * k, 0, TAU); g.stroke(); g.setLineDash([]); txt(s, x, y + r + 130, col, 10); };
  area(2300, 1400, 500, '#d8c8c0', 'железо'); area(7600, 1200, 450, '#e8e8ff', 'серебро'); area(6200, 3400, 400, '#e8e8ff', 'серебро'); area(1400, 4800, 420, '#9ad87a', 'болотник'); area(4800, 3000, 450, '#9ad87a', 'светлячковый гриб');
  g.font = 'bold 16px Georgia'; g.fillStyle = '#ffe9a8'; g.textAlign = 'left'; g.fillText('Болотный край · ур. 14–18 · 9600×6000 (как Грибной лес)', 0, -16);
}

// ---------------------------------------------------------------- новые звери (в стиле beasts.js)
let c; const F = (fn, fill, lw = 0.8) => { c.beginPath(); fn(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = O; c.lineWidth = lw; c.stroke(); } };
const grad = (y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
const eye = (x, y, r, col) => { F(() => c.ellipse(x, y, r, r * 0.8, 0, 0, TAU), col, 0.4); c.fillStyle = '#140c06'; c.beginPath(); c.arc(x + r * 0.1, y, r * 0.42, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.35, r * 0.2, 0, TAU); c.fill(); };
const shadow = (rx, ry) => { c.fillStyle = 'rgba(0,0,0,.26)'; c.beginPath(); c.ellipse(0, 0.6, rx, ry, 0, 0, TAU); c.fill(); };
/** Трясинник: горб болотной грязи с корнями-лапами, мох, кочки, два огонька-глаза. Опасное: рваный острый силуэт. */
function bogHulk(t = 0) {
  shadow(44, 12);
  const mud = '#3e4a2a', dark = '#1e2614';
  // лапы-корни
  for (const [x, y, dx] of [[-34, -6, -14], [34, -6, 14], [-20, -2, -8], [22, -2, 10]]) { F(() => { c.moveTo(x, y - 10); c.quadraticCurveTo(x + dx * 0.6, y - 4, x + dx, y + 2); c.lineTo(x + dx - 6, y + 4); c.quadraticCurveTo(x + dx * 0.2, y, x - 4, y - 6); c.closePath(); }, grad(y - 10, y + 4, sh(mud, 0.1), dark), 0.9); }
  // тело — ломаный горб
  F(() => { c.moveTo(-40, 0); c.lineTo(-44, -14); c.lineTo(-30, -30); c.lineTo(-18, -46); c.lineTo(-4, -40); c.lineTo(6, -54); c.lineTo(18, -44); c.lineTo(30, -36); c.lineTo(44, -18); c.lineTo(40, 0); c.closePath(); }, grad(-54, 0, sh(mud, 0.2), dark), 1.2);
  // мох и кочки
  for (const [x, y, r] of [[-22, -34, 9], [8, -46, 8], [26, -30, 7], [-6, -22, 6]]) { F(() => c.arc(x, y, r, 0, TAU), '#5a7a34', 0.7); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, TAU); c.fill(); }
  // ветки из спины
  c.strokeStyle = '#2a1e12'; c.lineWidth = 2.2; c.lineCap = 'round'; for (const [x, y, a] of [[-14, -44, -1.9], [12, -52, -1.3], [30, -36, -0.9]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); c.stroke(); }
  // пасть-трещина и глаза-огоньки
  F(() => { c.moveTo(-16, -14); c.lineTo(-8, -10); c.lineTo(0, -13); c.lineTo(8, -9); c.lineTo(16, -14); c.lineTo(10, -6); c.lineTo(0, -4); c.lineTo(-10, -6); c.closePath(); }, '#0e1208', 0.6);
  for (const s of [-1, 1]) { c.fillStyle = 'rgba(180,255,120,.35)'; c.beginPath(); c.arc(s * 12, -26, 7, 0, TAU); c.fill(); F(() => c.arc(s * 12, -26, 3.4, 0, TAU), '#c8ff60', 0.5); }
}
/** Пиявка: короткое толстое тело кольцами, присоска, стайный мелкий зверь. */
function leech(t = 0) {
  shadow(18, 5); const b = '#4a2a3a', d = '#2a1420';
  F(() => { c.moveTo(-18, 0); c.quadraticCurveTo(-20, -12, -8, -14); c.lineTo(10, -13); c.quadraticCurveTo(22, -11, 20, -3); c.quadraticCurveTo(18, 2, 8, 2); c.lineTo(-10, 2); c.closePath(); }, grad(-14, 2, sh(b, 0.25), d), 0.9);
  c.strokeStyle = sh(d, -0.2); c.lineWidth = 0.7; for (let x = -12; x < 16; x += 5) { c.beginPath(); c.moveTo(x, -12); c.quadraticCurveTo(x + 1, -6, x, 1); c.stroke(); }
  F(() => c.ellipse(18, -4, 4, 3, 0, 0, TAU), '#8a2a3a', 0.6); c.fillStyle = '#1a0a10'; c.beginPath(); c.arc(19, -4, 1.4, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-4, -10, 7, 2, 0, 0, TAU); c.fill();
}
/** Огонёк над водой (опасный: манит). */

// ---------------------------------------------------------------- застава на сваях
function stiltHut(g, w = 170, H = 86) {
  g.fillStyle = 'rgba(20,12,6,.06)'; g.beginPath(); g.ellipse(6, 2, w * 0.7, 14, 0, 0, TAU); g.fill();
  // вода под сваями
  g.fillStyle = '#243a30'; g.beginPath(); g.ellipse(0, 2, w * 0.75, 16, 0, 0, TAU); g.fill();
  // сваи
  for (const x of [-w / 2 + 10, -w / 6, w / 6, w / 2 - 10]) { rr(g, x - 5, -34, 10, 38, 4); paint(g, '#5a3e24', 1.3, -34, 4); }
  // настил
  rr(g, -w / 2 - 14, -40, w + 28, 10, 4); paint(g, '#8a6a40', 1.4, -40, -30); g.strokeStyle = sh('#8a6a40', -0.35); g.lineWidth = 0.8; for (let x = -w / 2 - 10; x < w / 2 + 14; x += 11) { g.beginPath(); g.moveTo(x, -40); g.lineTo(x, -30); g.stroke(); }
  // стены из досок
  g.save(); rr(g, -w / 2, -40 - H, w, H, 3); g.clip(); g.fillStyle = '#4a3420'; g.fillRect(-w / 2, -40 - H, w, H); for (let x = -w / 2; x < w / 2; x += 12) { rr(g, x + 0.5, -42 - H, 11, H + 6, 4); paint(g, sh('#9a7046', ((x / 12) | 0) % 3 === 0 ? 0.06 : -0.03), 1, -40 - H, -40, 0.12); } g.restore();
  rr(g, -w / 2, -40 - H, w, H, 3); g.strokeStyle = ink('#9a7046'); g.lineWidth = 1.6; g.stroke();
  // крыша камышом
  const top = -40 - H; roofFill(g, [[-w / 2 - 16, top + 4], [-w / 2 + 30, top - 52], [w / 2 - 30, top - 52], [w / 2 + 16, top + 4]], '#b89a50', 'thatch', 0);
  // дверь и окно
  rr(g, -22, -40 - 60, 34, 60, 3); paint(g, '#5a3a22', 1.5, -100, -40); rr(g, 34, -40 - 52, 26, 24, 3); paint(g, '#f0c060', 1.3, -92, -68);
  // фонарь на столбе и сети
  rr(g, w / 2 + 18, -120, 5, 82, 2); paint(g, '#5a3e24', 1.2); rr(g, w / 2 + 12, -134, 17, 18, 4); paint(g, '#ffd870', 1.3, -134, -116);
  g.strokeStyle = '#6a5a3a'; g.lineWidth = 0.9; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-w / 2 - 10 + i * 6, -40 - 20); g.lineTo(-w / 2 - 10 + i * 6 + 3, -40 + 10); g.stroke(); }
  // бочки и мостки
  barrelT(g, w / 2 - 16, -40); barrelT(g, w / 2 - 34, -40, 0.85);
  rr(g, -w / 2 - 70, -36, 60, 9, 3); paint(g, '#8a6a40', 1.3, -36, -27); for (const x of [-w / 2 - 62, -w / 2 - 20]) { rr(g, x - 4, -30, 8, 34, 3); paint(g, '#5a3e24', 1.2); }
}

// ---------------------------------------------------------------- галерея
export function draw(cv) {
  const CW = 300, CH = 360, list = [
    ['Болотная гадюка (14)', g => { SNAKES.bog_viper = { body: '#3e5a3a', dark: '#1a2a18', belly: '#c8c890', mark: '#c8d840', eye: '#e0e040' }; g.scale(1.05, 1.05); beast(g, 'bog_viper', 'side', { t: 0.3 }); }],
    ['Пиявка (14), стаей', g => { g.scale(1.8, 1.8); c = g; leech(); }],
    ['Утопленник (15)', g => { g.scale(PEOPLE_K, PEOPLE_K); }],
    ['Топляк-рыбак (15)', g => { g.scale(PEOPLE_K, PEOPLE_K); }],
    ['Болотная ведьма (17)', g => { g.scale(PEOPLE_K, PEOPLE_K); }],
    ['Трясинник (17)', g => { g.scale(1.5, 1.5); c = g; bogHulk(); }],
    ['★ Хозяйка топи (18)', g => { g.scale(PEOPLE_K * 1.3, PEOPLE_K * 1.3); }],
  ];
  cv.width = CW * list.length + 300; cv.height = CH; const g = cv.getContext('2d');
  g.fillStyle = '#3a4a2a'; g.fillRect(0, 0, cv.width, CH); g.fillStyle = '#243a30'; g.fillRect(0, CH - 70, cv.width, 70);
  const HAG = { ...palette('good', 7), cloth: ['#3a4a2a', '#26301c'], acc: '#8a9a40', gem: '#c8ff60' }, MIS = { ...palette('rare', 9), cloth: ['#1e2e24', '#101a14'], acc: '#a8c860', gem: '#80ff80', metal: '#6a7a5a' };
  const looks = {
    'Утопленник (15)': { key: 'm-drown', skin: '#7a9a84', hair: '#2a4a3a', hairStyle: 'long', eyes: '#c8ffd0', chest: { m: 'jerkin', P: palette('common', 3) }, legs: { m: 'trousers', P: palette('common', 3) } },
    'Топляк-рыбак (15)': { key: 'm-fisher', skin: '#8aa08a', hair: '#3a3a2a', beard: 'full', head: { m: 'straw', P: palette('common', 1) }, chest: { m: 'gambeson', P: palette('common', 5) }, legs: { m: 'trousers', P: palette('common', 5) }, weapon: { m: 'spear', P: palette('common', 4) } },
    'Болотная ведьма (17)': { key: 'm-hag', cls: 'mage', skin: '#9ab08a', hair: '#1a1a1a', hairStyle: 'long', eyes: '#d0ff60', head: { m: 'cowl', P: HAG }, chest: { m: 'robe', P: HAG }, legs: { m: 'trousers', P: HAG }, weapon: { m: 'root', P: HAG } },
    '★ Хозяйка топи (18)': { key: 'm-mistress', cls: 'mage', skin: '#6a8a6a', hair: '#0a1a10', hairStyle: 'long', eyes: '#80ff80', broad: 1.15, head: { m: 'circlet', P: MIS }, chest: { m: 'robe_emb', P: MIS }, legs: { m: 'trousers', P: MIS }, weapon: { m: 'serpent', P: MIS } },
  };
  list.forEach(([n, fn], i) => { const x = i * CW + CW / 2, y = CH - 80;
    if (looks[n]) { const L = looks[n], s = n.startsWith('★') ? PEOPLE_K * 1.3 : PEOPLE_K; drawFrame(g, personSpr(L, 'front', 'idle', 0), x, y, 1, s); }
    else { const t = document.createElement('canvas'); t.width = CW; t.height = CH; const tg = t.getContext('2d'); tg.lineJoin = tg.lineCap = 'round'; styled(gg => { gg.translate(CW / 2, CH - 80); fn(gg); })(tg); g.drawImage(t, i * CW, 0); }
    g.fillStyle = '#fff2d8'; g.font = 'bold 15px Georgia'; g.textAlign = 'center'; g.fillText(n, x, 28); });
  drawFrame(g, personSpr({ ...starterLook('warrior'), key: 'g136' }, 'front', 'idle', 0), CW * list.length + 150, CH - 80, 1, PEOPLE_K);
  g.fillStyle = '#fff2d8'; g.fillText('Герой', CW * list.length + 150, 28);
}
export function drawOutpost(cv) {
  cv.width = 760; cv.height = 420; const g = cv.getContext('2d'); g.fillStyle = '#4a5a2e'; g.fillRect(0, 0, 760, 420); g.fillStyle = '#243a30'; g.fillRect(0, 300, 760, 120);
  const t = document.createElement('canvas'); t.width = 760; t.height = 420; const tg = t.getContext('2d'); tg.lineJoin = tg.lineCap = 'round';
  styled(gg => { gg.translate(360, 330); gg.scale(1.35, 1.35); stiltHut(gg); })(tg); g.drawImage(t, 0, 0);
  drawFrame(g, personSpr({ ...starterLook('warrior'), key: 'g136b' }, 'front', 'idle', 0), 600, 350, 1, PEOPLE_K);
  g.fillStyle = '#fff2d8'; g.font = 'bold 16px Georgia'; g.fillText('Застава Сухой Кочки: изба на сваях, настил, мостки, сети, фонарь — купец и горн рядом', 20, 28);
}
