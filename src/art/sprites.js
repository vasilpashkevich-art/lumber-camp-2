// Готовые картинки: сложное рисуется один раз и потом только копируется (как в ветке I, v50).
import { LOOK } from './look.js';
import { BLD } from './bld.js';
import { doll } from './hero.js';
import { BEASTS } from './beasts.js';

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
  const k = 'h|' + [L.cls, L.head, L.chest, L.legs, L.wt, L.rar, L.mask || '', L.band || '', L.patch ? 1 : 0, dir].join(',');
  return sprite(k, 64, 86, 32, 62, 3, g => doll(g, 0, 0, 1, dir, L, 0.3));
}

export const MOB_LOOK = {
  bandit: { cls: 'warrior', chest: 1, legs: 1, head: 0, wt: 0, mask: '#7a2a2a', band: '#7a2a2a' },
  bandit_archer: { cls: 'archer', chest: 1, legs: 1, head: 0, wt: 0, mask: '#7a2a2a' },
  ataman: { cls: 'warrior', chest: 2, legs: 2, head: 0, wt: 2, patch: true, band: '#a8282a', rar: 'good' },
};
export const MOB_SCALE = { ataman: 1.35, bandit: 1.05, bandit_archer: 1.05 };

/** Моб: звери с кадрами шага, люди — облик героя. */
export function mobSpr(kind, dir, frame, bite) {
  if (MOB_LOOK[kind]) return heroSpr(MOB_LOOK[kind], dir);
  const k = 'm|' + kind + '|' + dir + '|' + frame + '|' + (bite ? 1 : 0);
  return sprite(k, 72, 48, 36, 38, 3, g => { g.scale(dir, 1); BEASTS[kind](g, frame / 4, bite ? 1 : 0); });
}

// ---------------------------------------------------------------- мир
export function treeSpr(kind, v) {
  const vb = Math.floor(v * 4) % 4;
  return sprite('t|' + kind + '|' + vb, 90, 116, 45, 94, 2, g => { LOOK.use(g); LOOK.tree(kind, 0, 0, 1, (vb + 0.5) / 4, 1.2); });
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
