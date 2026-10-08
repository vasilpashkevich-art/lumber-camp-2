// Мелкие общие функции.

/** Повторяемый генератор случайных чисел по зерну (0..1). */
export function rng(seed) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Выбор по весам: [[значение, вес], ...] */
export function weighted(list, r = Math.random) {
  let sum = 0; for (const [, w] of list) sum += w;
  let x = r() * sum;
  for (const [v, w] of list) { if ((x -= w) < 0) return v; }
  return list[list.length - 1][0];
}

/** Точка внутри многоугольника. */
export function inPoly(x, y, pts) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}

/** Расстояние от точки до отрезка. */
export function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0;
  return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Склонение: 1 мобов → 1 моб, 2 моба, 5 мобов. */
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

export const fmt1 = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
