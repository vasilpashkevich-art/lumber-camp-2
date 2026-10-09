// Готовые картинки: сложное рисуется один раз и потом только копируется (как в ветке I, v50).
import { LOOK } from './look.js';
import { BLD } from './bld.js';
import { BEASTS, beast, BOX } from './beasts.js';
import { person, doll } from './body.js';
import { palette } from './gear.js';
import { mossTree, giantShroom } from './forest.js';

const CACHE = new Map();

/** Нарисовать в отдельный холст размера w×h (мировые единицы) с началом в (ox,oy) и чёткостью q. */
export function sprite(key, w, h, ox, oy, q, draw) {
  if (CACHE.has(key)) return CACHE.get(key);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * q); cv.height = Math.ceil(h * q);
  const g = cv.getContext('2d'); let out = null;
  if (g && g.setTransform) {
    g.setTransform(q, 0, 0, q, 0, 0); g.translate(ox, oy); g.lineJoin = 'round'; g.lineCap = 'round';
    try { draw(g); out = { cv, w, h, ox, oy }; } catch (e) { console.warn('sprite', key, e); }
  }
  CACHE.set(key, out); return out;
}

/** Где у картинки непрозрачное (в шагах мира от начала): считается один раз. */
export function sprBox(s) {
  if (!s) return null; if (s.box) return s.box;
  let b = { x0: -s.ox, y0: -s.oy, x1: s.w - s.ox, y1: s.h - s.oy };
  try {
    const W = s.cv.width, H = s.cv.height, d = s.cv.getContext('2d').getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const k = s.w / W; if (x1 >= 0) b = { x0: x0 * k - s.ox, y0: y0 * k - s.oy, x1: x1 * k - s.ox, y1: y1 * k - s.oy };
  } catch (e) { /* без холста — по размеру картинки */ }
  return (s.box = b);
}
export function drawSpr(c, s, x, y, a = 1, sc = 1) {
  if (!s) return false;
  if (a < 1) c.globalAlpha = a;
  c.drawImage(s.cv, x - s.ox * sc, y - s.oy * sc, s.w * sc, s.h * sc);
  if (a < 1) c.globalAlpha = 1;
  return true;
}

/** Белая вспышка при попадании: копия картинки, залитая белым. */
export function flashOf(s) {
  if (!s) return null; if (s.flash) return s.flash;
  const cv = document.createElement('canvas'); cv.width = s.cv.width; cv.height = s.cv.height;
  const g = cv.getContext('2d'); g.drawImage(s.cv, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,250,235,.75)'; g.fillRect(0, 0, cv.width, cv.height);
  return s.flash = { ...s, cv };
}

// ---------------------------------------------------------------- герой и люди
export function heroSpr(L, dir) {
  return sprite('h|' + L.key + '|' + dir, 90, 104, 45, 72, 3, g => doll(g, 0, 0, 1, dir, L, 0.3));
}

// ---------------------------------------------------------------- анимация (v56): кадры по виду, действию и номеру
// view: front (идёт вниз) / side (вбок, рисуется вправо, влево — зеркально) / back (вверх)
// mode: idle — стоит, walk — 8 кадров шага, atk — 6 кадров удара, dead — 4 кадра падения
export const FRAMES = { idle: 1, walk: 8, atk: 6, dead: 4 };
const poseOf = (mode, f) => mode === 'walk' ? { walk: f / 8 } : mode === 'atk' ? { atk: (f + 0.5) / 6 } : mode === 'dead' ? { dead: (f + 1) / 4 } : { walk: -1 };
const lookKey = L => L.key || JSON.stringify([L.cls, L.head && L.head.m, L.chest && L.chest.m, L.legs && L.legs.m, L.weapon && L.weapon.m]);
/** Кадр человека (герой, разбойники). Начало — как у heroSpr: ступни на +12,6. */
export function personSpr(L, view, mode, f) {
  return sprite('p|' + lookKey(L) + '|' + view + '|' + mode + '|' + f, 100, 104, 50, 72, 2.2, g => person(g, L, view, poseOf(mode, f)));
}
/** Кадр зверя. Начало — земля под ним. */
export function beastSpr(kind, view, mode, f) {
  const B = BOX[kind] || [130, 84, 65, 68];
  return sprite('bz|' + kind + '|' + view + '|' + mode + '|' + f, B[0], B[1], B[2], B[3], 2, g => beast(g, kind, view, { ...poseOf(mode, f), t: 1 }));
}
/** Нарисовать кадр; dir = −1 — зеркально (вид сбоку влево). */
export function drawFrame(c, s, x, y, dir = 1, sc = 1, a = 1) {
  if (!s) return; if (a < 1) c.globalAlpha = a;
  if (dir < 0) { c.save(); c.translate(x, y); c.scale(-1, 1); c.drawImage(s.cv, -s.ox * sc, -s.oy * sc, s.w * sc, s.h * sc); c.restore(); }
  else c.drawImage(s.cv, x - s.ox * sc, y - s.oy * sc, s.w * sc, s.h * sc);
  if (a < 1) c.globalAlpha = 1;
}
/** Куда смотрит по направлению движения: вниз — лицом, вверх — спиной, иначе боком. */
export function viewOf(dx, dy) { return Math.abs(dy) > Math.abs(dx) * 0.9 ? (dy > 0 ? 'front' : 'back') : 'side'; }

// люди мира (v64): то же тело, что у героя, вещи — моделями из gear.js
const NP = (rar, seed, over = {}) => ({ ...palette(rar, seed), ...over });
const RAG = NP('common', 5, { cloth: ['#6b4a2c', '#5a3a1c'], leather: '#5a3a1c' });
export const MOB_LOOK = {
  bandit: { key: 'mob-bandit', hair: '#4a2e1a', hood: '#5a4a3a', mask: '#7a2e22', chest: { m: 'jerkin', P: RAG }, legs: { m: 'trousers', P: RAG }, weapon: { m: 'cleaver', P: NP('common', 9) } },
  bandit_archer: { key: 'mob-bandit-archer', cls: 'archer', hair: '#3a2416', hairStyle: 'tail', mask: '#7a2e22', head: { m: 'lhood', P: RAG }, chest: { m: 'jerkin', P: RAG }, legs: { m: 'leggings', P: RAG }, weapon: { m: 'hunt', P: NP('common', 4) }, quiver: true },
  ataman: { key: 'mob-ataman', hair: '#2a1a10', beard: 'full', broad: 1.12, patch: true, chest: { m: 'scale', P: NP('good', 12, { cloth: ['#7a2222', '#5a1818'] }) }, legs: { m: 'leggings', P: RAG }, head: { m: 'band', P: NP('common', 1, { cloth: ['#a8282a', '#7a1818'] }) }, weapon: { m: 'crescent', P: NP('good', 14) } },
  robber: { key: 'mob-robber', hair: '#3a3a42', mask: '#4a4a52', head: { m: 'band', P: NP('common', 2, { cloth: ['#3a3a42', '#2a2a32'] }) }, chest: { m: 'hauberk', P: NP('common', 6) }, legs: { m: 'leggings', P: RAG }, weapon: { m: 'mace', P: NP('common', 7) } },
  firestarter: { key: 'mob-fire', hair: '#2a1a10', mask: '#2a2a2a', hood: '#3a3430', chest: { m: 'gambeson', P: NP('common', 8, { cloth: ['#5a4a3a', '#4a3a2a'] }) }, legs: { m: 'trousers', P: RAG }, weapon: { m: 'torch', P: NP('common', 3) } },
  miller: { key: 'mob-miller', hair: '#c8c2b8', hairStyle: 'long', beard: 'grey', eyes: '#3aa86a', head: { m: 'straw', P: NP('common', 1) }, chest: { m: 'robe', P: NP('common', 3, { cloth: ['#cfc6b0', '#b8ae98'] }) }, legs: { m: 'trousers', P: NP('common', 3, { cloth: ['#5a4a3a', '#5a4a3a'] }) }, weapon: { m: 'sickle', P: NP('good', 2) } },
};
// городской стражник: кольчуга, синяя накидка, шапель, копьё
const GP = NP('good', 8, { cloth: ['#2f5d9a', '#24497a'], acc: '#e7c35a' });
// купец (v65): кафтан с золотой каймой, шляпа с пером — за прилавками городов и у тележки в Грибном лесу
export const MERCH_LOOK = { key: 'npc-merchant', hair: '#5a3a22', beard: 'full', head: { m: 'ranger', P: { ...palette('rare', 3), leather: '#5a2a4a', gem: '#e7c35a' } }, chest: { m: 'robe_emb', P: { ...palette('rare', 5), cloth: ['#6a2a4a', '#4a1a34'], acc: '#e7c35a' } }, legs: { m: 'leggings', P: palette('common', 2) } };
export const GUARD_LOOK = { key: 'npc-guard', hair: '#6a4a2a', beard: 'full', chest: { m: 'brig', P: GP }, legs: { m: 'chausses', P: GP }, head: { m: 'kettle', P: GP }, weapon: { m: 'spear', P: GP } };
// люди-мобы — в том же масштабе, что герой (1,15), вожаки крупнее
export const MOB_SCALE = { ataman: 1.45, bandit: 1.15, bandit_archer: 1.15, robber: 1.2, firestarter: 1.12, miller: 1.32 };

/** Моб: звери с кадрами шага, люди — облик героя. */
export function mobSpr(kind, dir, frame, bite) {
  if (MOB_LOOK[kind]) return heroSpr(MOB_LOOK[kind], dir);
  const k = 'm|' + kind + '|' + dir + '|' + frame + '|' + (bite ? 1 : 0), B = BOX[kind] || [130, 84, 65, 68];
  return sprite(k, B[0], B[1], B[2], B[3], 2, g => { g.scale(dir, 1); BEASTS[kind](g, frame / 4, bite ? 1 : 0); });
}

// ---------------------------------------------------------------- мир
/** Деревья в 1,5 раза выше прежнего (v58): 2,5–3 роста героя. */
export const TREE_K = 1.5;
export function treeSpr(kind, v) {
  const vb = Math.floor(v * 4) % 4, k = TREE_K;
  if (kind === 'moss') return sprite('t|moss|' + vb, 160, 160, 80, 140, 1.6, g => mossTree(g, 118 + vb * 6, vb * 7 + 3));
  if (kind === 'gshroom') return sprite('t|gshroom|' + vb, 110, 120, 55, 112, 1.6, g => giantShroom(g, 88 + vb * 6, vb === 3 ? 2 : vb % 2));
  return sprite('t|' + kind + '|' + vb, 90 * k, 116 * k, 45 * k, 94 * k, 1.6, g => { g.scale(k, k); LOOK.use(g); LOOK.tree(kind, 0, 0, 1, (vb + 0.5) / 4, 1.2); });
}

export function wallSpr(R, i, n) {
  const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2, px = Math.cos(am) * R, py = Math.sin(am) * R;
  const s = sprite('w|' + R + '|' + n + '|' + i, 72, 80, 36, 56, 2, g => { LOOK.use(g); LOOK.fenceSeg(-px, -py, R, 4, a0, a1, i); });
  if (s) { s.px = px; s.py = py; }
  return s;
}

export function hallSpr() {
  return sprite('hall', 240, 250, 120, 225, 2, g => { LOOK.use(g); LOOK.setNoFx(true); LOOK.HQ[6](0, false); LOOK.setNoFx(false); });
}

/** Постройка через BLD в готовую картинку. */
export function bldSpr(key, w, h, ox, oy, s, fn) {
  return sprite('b|' + key, w, h, ox, oy, 2, g => { BLD.use(g, false); g.scale(s, s); fn(BLD, g); });
}

/** Гора за краем зоны. */
export function mountainSpr(v) {
  const vb = Math.floor(v * 5);
  return sprite('mt|' + vb, 260, 200, 130, 180, 1.5, g => {
    const r = n => (Math.sin(vb * 12.9 + n * 78.2) * 43758.5) % 1, w = 100 + Math.abs(r(1)) * 30, h = 120 + Math.abs(r(2)) * 50;
    const O = '#24180f';
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(10, 2, w + 10, 16, 0, 0, 7); g.fill();
    // склон
    g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.35, -h * 0.7); g.lineTo(0, -h); g.lineTo(w * 0.4, -h * 0.62); g.lineTo(w, 0); g.closePath();
    g.fillStyle = '#7a7266'; g.fill(); g.strokeStyle = O; g.lineWidth = 2; g.stroke();
    // тень правого склона
    g.beginPath(); g.moveTo(0, -h); g.lineTo(w * 0.4, -h * 0.62); g.lineTo(w, 0); g.lineTo(w * 0.15, 0); g.lineTo(w * 0.05, -h * 0.4); g.closePath(); g.fillStyle = '#5c564c'; g.fill();
    // снег
    g.beginPath(); g.moveTo(-w * 0.35 * 0.45, -h * 0.82); g.lineTo(0, -h); g.lineTo(w * 0.4 * 0.5, -h * 0.8); g.lineTo(w * 0.08, -h * 0.74); g.lineTo(-w * 0.06, -h * 0.8); g.closePath();
    g.fillStyle = '#eef2f4'; g.fill(); g.strokeStyle = O; g.lineWidth = 1.4; g.stroke();
    // трещины
    g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { const x = -w * 0.6 + i * w * 0.35; g.beginPath(); g.moveTo(x, -h * 0.15); g.lineTo(x + 8, -h * 0.35); g.lineTo(x + 2, -h * 0.5); g.stroke(); }
  });
}
