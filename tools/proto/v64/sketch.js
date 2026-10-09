// Эскиз v64: страница сравнения. Сборка: node tools/proto/v64/build.mjs
import { person, poseOf, FRAMES } from './body.js';
import { person as oldPerson } from '../../../src/art/rig.js';
import { WEAPONS, HELMS, CHESTS, LEGS, RINGS, NECKS, W_BY, palette, drawHelm, drawRing, drawNeck, itemLook, rng, O } from './gear.js';

const DPR = Math.min(2, window.devicePixelRatio || 1);
const RAR = ['common', 'good', 'rare', 'epic'], RAR_COL = { start: '#9d9d9d', common: '#e8e4da', good: '#5fd35f', rare: '#4a9eff', epic: '#b46aff' };
const RAR_RU = { start: 'начальная', common: 'белая', good: 'зелёная', rare: 'синяя', epic: 'фиолетовая' };
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// ------------------------------------------------------------- кадры с кэшем (как в игре: каждый кадр — готовая картинка)
const CACHE = new Map();
function frame(key, w, h, ox, oy, sc, draw) {
  const k = key + '|' + sc; if (CACHE.has(k)) return CACHE.get(k);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * sc * DPR); cv.height = Math.ceil(h * sc * DPR);
  const g = cv.getContext('2d'); g.setTransform(sc * DPR, 0, 0, sc * DPR, 0, 0); g.translate(ox, oy); g.lineJoin = g.lineCap = 'round'; draw(g);
  const f = { cv, w: w * sc, h: h * sc, ox: ox * sc, oy: oy * sc }; CACHE.set(k, f); return f;
}
const lookKey = L => JSON.stringify([L.head, L.chest, L.legs, L.weapon, L.hair, L.beard, L.hood, L.mask, L.broad, L.part].map(v => v && v.P ? [v.m, v.P.rar, v.P.metal, v.P.wrap, v.P.gem] : v));
const personFrame = (L, view, mode, f, sc) => frame('p' + lookKey(L) + view + mode + f, 100, 90, 50, 62, sc, g => person(g, L, view, poseOf(mode, f)));

// ------------------------------------------------------------- анимированные сцены
const scenes = [];
function scene(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w * DPR; cv.height = h * DPR; cv.style.width = w + 'px'; cv.style.height = h + 'px'; scenes.push({ cv, draw, w, h }); return cv; }
function grass(g, w, h, seed = 3) { g.fillStyle = '#6f9a45'; g.fillRect(0, 0, w, h); const r = rng(seed); for (let i = 0; i < w * h / 90; i++) { g.fillStyle = r() < 0.5 ? 'rgba(40,70,20,.18)' : 'rgba(200,230,140,.12)'; g.fillRect(r() * w, r() * h, 2, 1.5); } }
function shadow(g, x, y, s) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 1.5 * s, 9 * s, 3 * s, 0, 0, 7); g.fill(); }
function put(g, f, x, y, dir = 1) { g.save(); g.translate(x, y); g.scale(dir, 1); g.drawImage(f.cv, -f.ox, -f.oy, f.w, f.h); g.restore(); }
// 4 стороны по кругу: вниз, вправо, вверх, влево
const VIEWS = [['front', 1], ['side', 1], ['back', 1], ['side', -1]];
function walker(L, sc, opts = {}) {
  return (g, t, x, y) => {
    const ph = opts.atk ? (t * 0.9) % 1 : (t * 1.3) % 1, seg = Math.floor(t / 2.4) % 4, [view, dir] = opts.view ? [opts.view, opts.dir || 1] : VIEWS[seg];
    const mode = opts.mode || (opts.atk ? 'atk' : 'walk'), f = mode === 'idle' ? 0 : Math.floor(ph * FRAMES[mode]) % FRAMES[mode];
    shadow(g, x, y, sc); put(g, personFrame(L, view, mode, f, sc), x, y, dir);
  };
}

// ------------------------------------------------------------- значки: один рисунок вещи, вписанный в ячейку
const ICONS = new Map();
function iconCanvas(key, size, draw, rot = 0) {
  const k = key + '|' + size; if (ICONS.has(k)) return ICONS.get(k).cloneNode ? cloneCv(ICONS.get(k)) : ICONS.get(k);
  const T = 320, tmp = document.createElement('canvas'); tmp.width = tmp.height = T; const g = tmp.getContext('2d');
  g.translate(T / 2, T / 2); g.scale(6, 6); g.rotate(rot); g.lineJoin = g.lineCap = 'round'; draw(g);
  const d = g.getImageData(0, 0, T, T).data; let x0 = T, y0 = T, x1 = 0, y1 = 0;
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (d[(y * T + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const cv = document.createElement('canvas'); cv.width = cv.height = size * DPR; cv.style.width = cv.style.height = size + 'px';
  const o = cv.getContext('2d'), bw = x1 - x0 + 1, bh = y1 - y0 + 1, k2 = Math.min(size * DPR * 0.84 / bw, size * DPR * 0.84 / bh);
  o.imageSmoothingQuality = 'high'; o.drawImage(tmp, x0, y0, bw, bh, (size * DPR - bw * k2) / 2, (size * DPR - bh * k2) / 2, bw * k2, bh * k2);
  ICONS.set(k, cv); return cloneCv(cv);
}
function cloneCv(cv) { const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; c2.style.cssText = cv.style.cssText; c2.getContext('2d').drawImage(cv, 0, 0); return c2; }
function itemIcon(it, size) {
  const lk = it._lk || itemLook(it), key = it.slot + lk.m + it.rar + it.seed;
  if (it.slot === 'weapon') return iconCanvas(key, size, g => W_BY[lk.m].draw(g, lk.P), Math.PI / 4);
  if (it.slot === 'head') return iconCanvas(key, size, g => drawHelm(g, lk.m, lk.P, 'front'));
  if (it.slot === 'chest') return iconCanvas(key, size, g => { g.save(); g.beginPath(); g.rect(-30, -14.2, 60, 20); g.clip(); person(g, { chest: lk, part: 'chest', broad: 1.08 }, 'front', {}); g.restore(); });
  if (it.slot === 'legs') return iconCanvas(key, size, g => person(g, { legs: lk, part: 'legs' }, 'front', {}));
  if (it.slot === 'ring') return iconCanvas(key, size, g => drawRing(g, lk.m, lk.P));
  if (it.slot === 'neck') return iconCanvas(key, size, g => drawNeck(g, lk.m, lk.P));
}
function cell(it, size = 46) { const d = el('div', 'cell'); d.style.borderColor = RAR_COL[it.rar]; d.style.width = d.style.height = size + 'px'; d.appendChild(itemIcon(it, size - 6)); if (it.rar === 'epic') d.classList.add('ep'); return d; }

// ------------------------------------------------------------- герой в вещах
const look = (it) => it ? itemLook(it) : null;
const WAR = (eq, extra = {}) => ({ cls: 'warrior', hair: '#b8642a', beard: 'full', broad: 1.08, head: look(eq.head), chest: look(eq.chest), legs: look(eq.legs), weapon: look(eq.weapon), ...extra });
const mk = (slot, ilvl, rar, seed) => ({ slot, ilvl, rar, seed });
// наборы по ярусам: начало, ур.4 белое, ур.9 зелёное, ур.14 синее, ур.24 фиолетовое
const SETS = [
  { t: 'Начало игры', eq: { chest: mk('chest', 1, 'start', 1), legs: mk('legs', 1, 'start', 1), weapon: mk('weapon', 1, 'start', 3) } },
  { t: 'Ур. 4, белые вещи', eq: { head: mk('head', 4, 'common', 11), chest: mk('chest', 4, 'common', 12), legs: mk('legs', 4, 'common', 13), weapon: mk('weapon', 4, 'common', 16) } },
  { t: 'Ур. 9, зелёные', eq: { head: mk('head', 9, 'good', 21), chest: mk('chest', 9, 'good', 26), legs: mk('legs', 9, 'good', 23), weapon: mk('weapon', 9, 'good', 22) } },
  { t: 'Ур. 15, синие', eq: { head: mk('head', 15, 'rare', 34), chest: mk('chest', 15, 'rare', 32), legs: mk('legs', 15, 'rare', 33), weapon: mk('weapon', 15, 'rare', 31) } },
  { t: 'Ур. 25, фиолетовые', eq: { head: mk('head', 25, 'epic', 41), chest: mk('chest', 25, 'epic', 44), legs: mk('legs', 25, 'epic', 43), weapon: mk('weapon', 25, 'epic', 47) } },
];

// ================================================================= разделы
function sec(title, text) { const s = el('section'); s.appendChild(el('h2', null, title)); if (text) s.appendChild(el('p', null, text)); $('#main').appendChild(s); return s; }

// 1. было → стало
{
  const s = sec('1. Было → стало', 'Слева — герой сейчас (голова почти в половину роста). Справа — новое тело: пропорции ближе к человеку (≈ 4,3 головы), лицо с глазами, бровями, носом и бородой, плечи шире, руки и ноги длиннее. Рост в мире тот же. Сверху — как в игре (в натуральную величину), снизу — крупно.');
  const oldL = { cls: 'warrior', head: 2, chest: 2, legs: 2, wt: 2, rar: 'good' };
  const newL = WAR(SETS[2].eq);
  const W = 640, H = 150, cv = scene(W, H, (g, t) => { grass(g, W, H, 5); let x = 60;
    for (const [view, dir] of VIEWS) { const f = Math.floor((t * 1.3 % 1) * 8); shadow(g, x, 110, 1.15); g.save(); g.translate(x, 110); g.scale(1.15 * dir, 1.15); oldPerson(g, oldL, view, { walk: f / 8 }); g.restore(); x += 60; }
    x += 30; for (const [view, dir] of VIEWS) { const f = Math.floor((t * 1.3 % 1) * 8); shadow(g, x, 110, 1.15); put(g, personFrame(newL, view, 'walk', f, 1.15), x, 110, dir); x += 60; } });
  s.appendChild(cv);
  const W2 = 900, H2 = 300, cv2 = scene(W2, H2, (g, t) => { grass(g, W2, H2, 6); const sc = 3.6; g.save(); g.translate(150, 230); g.scale(sc, sc); shadow(g, 0, 0, 1); oldPerson(g, oldL, 'front', { t }); g.restore();
    g.fillStyle = '#ffe9a8'; g.font = '18px Georgia'; g.fillText('сейчас', 120, 30); g.fillText('новое', 520, 30);
    let x = 420; for (const [view, dir] of [['front', 1], ['side', 1], ['back', 1]]) { shadow(g, x, 230, sc); put(g, personFrame(newL, view, 'idle', 0, sc), x, 230, dir); x += 170; } });
  s.appendChild(cv2);
}

// 2. Воин по ярусам
{
  const s = sec('2. Воин по ярусам вещей', 'Каждый столбец — один и тот же Воин в разных вещах. Шлем, нагрудник, штаны и оружие выбираются из набора моделей по уровню и цвету вещи, расцветка — своя у каждой вещи. Фиолетовые светятся.');
  const W = 960, H = 340, cv = scene(W, H, (g, t) => { grass(g, W, H, 9);
    SETS.forEach((S, i) => { const L = WAR(S.eq), x = 100 + i * 190; walker(L, 3.0)(g, t, x, 270); g.fillStyle = '#ffe9a8'; g.font = '15px Georgia'; g.textAlign = 'center'; g.fillText(S.t, x, 328); walker(L, 1.15)(g, t + 0.4, x, 75); }); });
  s.appendChild(cv);
  const row = el('div', 'row'); s.appendChild(row);
  SETS.forEach(S => { const box = el('div', 'card'); box.appendChild(el('b', null, S.t)); const cells = el('div', 'cells'); for (const k of ['head', 'chest', 'legs', 'weapon']) if (S.eq[k]) { const it = S.eq[k], lk = itemLook(it); const w = el('div', 'ci'); w.appendChild(cell(it)); w.appendChild(el('span', null, `<i style="color:${RAR_COL[it.rar]}">${lk.name}</i>`)); cells.appendChild(w); } box.appendChild(cells); row.appendChild(box); });
}

// 3. оружие
{
  const s = sec('3. Оружие Воина — 15 моделей', 'Топоры, секиры, мечи, булавы, молоты. Каждая модель — в четырёх цветах: белая (железо), зелёная (сталь и бронза), синяя (светлая сталь, золото или серебро, камень, гравировка), фиолетовая (тёмный металл, свечение, руны). Внутри цвета — своя обмотка, дерево и камень у каждой вещи. Двуручные Воин держит двумя руками. Справа — как оно в руке в игре и крупно.');
  const grid = el('div', 'wgrid'); s.appendChild(grid);
  WEAPONS.filter(w => !w.npc).forEach((w, i) => {
    const card = el('div', 'wcard'); card.appendChild(el('b', null, w.name + (w.hands === 2 ? ' <small>двуручное</small>' : '')));
    card.appendChild(el('small', null, 'уровни вещи: ' + w.tiers.map(t => ['начало', '1–7', '8–15', '16–23', '24+'][t]).join(', ')));
    const cells = el('div', 'cells'); RAR.forEach((r, k) => { const it = { slot: 'weapon', rar: r, seed: 100 + i * 7 + k, ilvl: 10 }; const P = palette(r, it.seed); const c = el('div', 'cell'); c.style.borderColor = RAR_COL[r]; c.style.width = c.style.height = '52px'; if (r === 'epic') c.classList.add('ep'); c.appendChild(iconCanvas('w' + w.id + r + it.seed, 46, g => w.draw(g, P), Math.PI / 4)); cells.appendChild(c); }); card.appendChild(cells);
    const Ls = RAR.map((r, k) => WAR({ chest: mk('chest', 9, 'good', 26), legs: mk('legs', 9, 'good', 23), head: mk('head', 9, 'good', 21) }, { weapon: { m: w.id, P: palette(r, 100 + i * 7 + k) } }));
    const W2 = 300, H2 = 120; card.appendChild(scene(W2, H2, (g, t) => { grass(g, W2, H2, i); Ls.forEach((L, k) => { const atk = k === 3; walker(L, 1.15, { view: 'side', mode: atk ? 'atk' : 'idle' })(g, t + k * 0.2, 22 + k * 30, 70); }); walker(Ls[2], 2.0, { view: 'side', mode: 'atk' })(g, t, 220, 92); }));
    grid.appendChild(card);
  });
}

// 4. одна вещь — везде одинакова
{
  const s = sec('4. Выпавшая вещь выглядит одинаково везде', 'Восемь случайных выпавших вещей. Для каждой: ячейка сумки, окно героя (крупно), экран выбора героя и в мире (как в игре). Два топора одной модели отличаются расцветкой.');
  const r = rng(77), list = [];
  for (let i = 0; i < 8; i++) { const ilvl = 2 + Math.floor(r() * 26), rar = ['common', 'good', 'good', 'rare', 'rare', 'epic', 'common', 'good'][i]; list.push(mk('weapon', ilvl, rar, 500 + Math.floor(r() * 9999))); }
  const tbl = el('div', 'drops'); s.appendChild(tbl);
  list.forEach((it, i) => { const lk = itemLook(it), L = WAR({ chest: mk('chest', it.ilvl, it.rar, it.seed + 1), legs: mk('legs', it.ilvl, it.rar, it.seed + 2), head: mk('head', it.ilvl, it.rar, it.seed + 3), weapon: it });
    const row = el('div', 'drop'); const a = el('div', 'dc'); a.appendChild(cell(it, 50)); a.appendChild(el('div', 'nm', `<i style="color:${RAR_COL[it.rar]}">${lk.name}</i><br><small>ур. ${it.ilvl}, ${RAR_RU[it.rar]}</small>`)); row.appendChild(a);
    const W = 560, H = 150; row.appendChild(scene(W, H, (g, t) => { g.fillStyle = '#1c150e'; g.fillRect(0, 0, 230, H); g.fillStyle = '#2a2018'; g.fillRect(230, 0, 140, H); grass(g, 0, 0); g.save(); g.beginPath(); g.rect(370, 0, 190, H); g.clip(); grass(g, 560, H, i); g.restore();
      put(g, personFrame(L, 'front', 'idle', 0, 3.0), 115, 128); // окно героя
      const ff = Math.floor((t * 0.9 % 1) * 6); put(g, personFrame(L, 'side', 'atk', ff, 2.0), 300, 122); // экран выбора
      walker(L, 1.15)(g, t, 465, 100);
      g.fillStyle = '#a89878'; g.font = '12px Georgia'; g.textAlign = 'center'; g.fillText('окно героя', 115, 14); g.fillText('выбор героя', 300, 14); g.fillStyle = '#ffffffcc'; g.fillText('в мире', 465, 14); }));
    tbl.appendChild(row); });
}

// 5. шлемы, нагрудники, штаны
{
  const s = sec('5. Шлемы, нагрудники, штаны — моделями', 'Шлемы: 9 моделей, нагрудники: 8, штаны с сапогами: 4. Каждая — в цветах вещи. Ниже значок в сумке и как сидит на герое спереди, сбоку и сзади.');
  const grid = el('div', 'agrid'); s.appendChild(grid);
  const add = (title, it, Lfn) => { const card = el('div', 'acard'); card.appendChild(el('b', null, title)); const cells = el('div', 'cells'); cells.appendChild(cell(it, 50)); card.appendChild(cells);
    const L = Lfn(); const W = 230, H = 120; card.appendChild(scene(W, H, (g, t) => { grass(g, W, H, 2); [['front', 1], ['side', 1], ['back', 1]].forEach(([v, d], k) => { shadow(g, 40 + k * 75, 100, 2.2); put(g, personFrame(L, v, 'idle', 0, 2.2), 40 + k * 75, 100, d); }); })); grid.appendChild(card); };
  const base = { chest: mk('chest', 9, 'good', 26), legs: mk('legs', 9, 'good', 23), weapon: mk('weapon', 9, 'good', 22) };
  HELMS.forEach((h, i) => { const rar = RAR[Math.min(3, Math.max(0, h.tiers[0] - 1))], it = { slot: 'head', rar, seed: 900 + i, ilvl: 10 }; const lk = { m: h.id, P: palette(rar, it.seed) }; it.forceLook = lk;
    add(h.name, Object.assign(it, { _lk: lk }), () => ({ ...WAR(base), head: lk })); });
  CHESTS.forEach((h, i) => { const rar = h.tiers[0] === 0 ? 'start' : RAR[Math.min(3, h.tiers[0] - 1)], it = { slot: 'chest', rar, seed: 950 + i, ilvl: 10 }; const lk = { m: h.id, P: palette(rar, it.seed) };
    add(h.name, Object.assign(it, { _lk: lk }), () => ({ ...WAR({ legs: base.legs, weapon: base.weapon }), chest: lk })); });
  LEGS.forEach((h, i) => { const rar = h.tiers[0] === 0 ? 'start' : RAR[Math.min(3, h.tiers[0] - 1)], it = { slot: 'legs', rar, seed: 980 + i, ilvl: 10 }; const lk = { m: h.id, P: palette(rar, it.seed) };
    add(h.name, Object.assign(it, { _lk: lk }), () => ({ ...WAR({ chest: base.chest, weapon: base.weapon }), legs: lk })); });
}

// 6. кольца и шеи
{
  const s = sec('6. Кольца и шеи', 'По 6 моделей. Металл по цвету вещи: медь, серебро, золото; у синих и фиолетовых — камень, у фиолетовых — свечение. На теле не видны — только значок.');
  const grid = el('div', 'jgrid'); s.appendChild(grid);
  for (const [list, slot, fn] of [[RINGS, 'ring', drawRing], [NECKS, 'neck', drawNeck]]) list.forEach((m, i) => { const card = el('div', 'jcard'); card.appendChild(el('b', null, m.name)); const cells = el('div', 'cells');
    RAR.forEach((r, k) => { const P = palette(r, 300 + i * 5 + k); const c = el('div', 'cell'); c.style.borderColor = RAR_COL[r]; c.style.width = c.style.height = '50px'; if (r === 'epic') c.classList.add('ep'); c.appendChild(iconCanvas(slot + m.id + r + i, 44, g => fn(g, m.id, P))); cells.appendChild(c); }); card.appendChild(cells); grid.appendChild(card); });
}

// 7. люди мира в новом теле
{
  const s = sec('7. Разбойники, стража, жители — в том же теле', 'Все люди мира рисуются тем же телом. Слева направо: герой, разбойник, Атаман (крупнее, 1,25 роста), стражник с копьём, житель. Сверху — как в игре, снизу — крупно.');
  const banditP = { ...palette('common', 5), cloth: ['#6b4a2c', '#5a3a1c'], leather: '#5a3a1c' };
  const guardP = { ...palette('good', 8), cloth: ['#2f5d9a', '#24497a'], acc: '#e7c35a' };
  const people = [
    { n: 'Герой', L: WAR(SETS[2].eq), s: 1 },
    { n: 'Разбойник', L: { hair: '#4a2e1a', hood: '#5a4a3a', mask: '#7a2e22', chest: { m: 'jerkin', P: banditP }, legs: { m: 'trousers', P: banditP }, weapon: { m: 'cleaver', P: palette('common', 9) } }, s: 1 },
    { n: 'Атаман', L: { hair: '#2a1a10', beard: 'full', broad: 1.12, chest: { m: 'scale', P: { ...palette('good', 12), cloth: ['#7a2222', '#5a1818'] } }, legs: { m: 'leggings', P: banditP }, head: { m: 'horned', P: palette('common', 13) }, weapon: { m: 'crescent', P: palette('good', 14) } }, s: 1.25 },
    { n: 'Стражник', L: { hair: '#6a4a2a', beard: 'full', chest: { m: 'brig', P: guardP }, legs: { m: 'chausses', P: guardP }, head: { m: 'kettle', P: guardP }, weapon: { m: 'spear', P: guardP } }, s: 1 },
    { n: 'Житель', L: { hair: '#8a5a2a', beard: 'grey', chest: { m: 'shirt', P: { ...palette('start', 1), cloth: ['#b8a888', '#8a7a5a'] } }, legs: { m: 'trousers', P: { ...palette('start', 1), cloth: ['#6b5a46', '#5a4a38'] } } }, s: 1 },
  ];
  const W = 960, H = 410, cv = scene(W, H, (g, t) => { grass(g, W, H, 12);
    people.forEach((pp, i) => { const x = 80 + i * 90; walker(pp.L, 1.15 * pp.s)(g, t + i * 0.3, x, 80); });
    people.forEach((pp, i) => { const x = 110 + i * 185; walker(pp.L, 2.8 * pp.s, { view: 'front', mode: 'idle' })(g, t, x, 345); g.fillStyle = '#ffe9a8'; g.font = '15px Georgia'; g.textAlign = 'center'; g.fillText(pp.n, x, 400); });
    // мерило: дверь 1,3 роста рядом с героем (крупно)
  });
  s.appendChild(cv);
}

// ------------------------------------------------------------- цикл
let t0 = performance.now();
function tick(now) { const t = Math.max(0, (now - t0) / 1000); for (const S of scenes) { const g = S.cv.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); g.imageSmoothingQuality = 'high'; S.draw(g, t); } requestAnimationFrame(tick); }
requestAnimationFrame(tick);
