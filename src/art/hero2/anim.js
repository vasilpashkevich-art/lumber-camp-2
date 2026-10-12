// Движения воина (эскиз v74): поза по времени. Все точки — в системе тела (X — левая сторона, Y — вверх, Z — вперёд).
// Ключевые позы смешиваются плавно (ease); шаг и бег — циклы по фазе; падение — поворотом всего тела.
import { SK, clamp, lerp } from './rig.js';
const TAU = Math.PI * 2;
const ease = t => t * t * (3 - 2 * t);
const easeOut = t => 1 - (1 - t) * (1 - t);

/** Глубокое смешивание поз (числа и векторы [x,y,z]). */
export function blend(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t);
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => lerp(v, b[i], t));
  if (a && b && typeof a === 'object') { const r = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) r[k] = k in a && k in b ? blend(a[k], b[k], t) : (k in b ? b[k] : a[k]); return r; }
  return t < 0.5 ? a : b;
}
/** Позы по ключам [[время, поза], ...] (время по возрастанию), между ключами — плавно. */
export function keys(t, K, e = ease) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const q = (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return blend(K[i - 1][1], K[i][1], e(q)); }
  return K[K.length - 1][1];
}
const over = (base, p) => blend(base, { ...base, ...p, hand: { ...base.hand, ...(p.hand || {}) }, foot: { ...base.foot, ...(p.foot || {}) }, elbow: { ...base.elbow, ...(p.elbow || {}) }, knee: { ...base.knee, ...(p.knee || {}) }, weapon: { ...base.weapon, ...(p.weapon || {}) }, head: { ...base.head, ...(p.head || {}) }, toe: { ...base.toe, ...(p.toe || {}) } }, 1);

// ---------------------------------------------------------------- стойка
export const STAND = {
  root: [0, -1.2, 0], yaw: 0, lean: 0.04, side: 0, twist: 0.08, bend: 0.04, sideBend: 0, breathe: 0,
  head: { pitch: 0.02, yaw: -0.05, roll: 0 },
  hand: { L: [14.5, 47, 6], R: [-11, 51, 12] }, elbow: { L: [1, -0.3, -0.6], R: [-1, -0.4, -0.5] },
  foot: { L: [9, SK.ankleY, 2.5], R: [-8.5, SK.ankleY, -2] }, knee: { L: [0.35, 0, 1], R: [-0.35, 0, 1] }, toe: { L: 0, R: 0 },
  footYaw: { L: 0.15, R: -0.18 },
  weapon: { dir: [0.18, 0.8, 0.55], edge: [0.1, -0.35, 1] }, twoHand: 0,
};

/** Стоит и дышит: грудь поднимается, оружие чуть покачивается, голова оглядывается. */
export function idle(t) {
  const b = Math.sin(t * 1.9), s = Math.sin(t * 0.7);
  return over(STAND, { breathe: b, root: [0, -1.2 + b * 0.25, 0], twist: 0.08 + s * 0.04, head: { pitch: 0.02 - b * 0.03, yaw: -0.05 + Math.sin(t * 0.45) * 0.25 * clamp(Math.sin(t * 0.3) * 3, -1, 1), roll: 0 },
    hand: { L: [14.5, 47 + b * 0.5, 6], R: [-11, 51 + b * 0.6, 12] }, weapon: { dir: [0.18 + s * 0.04, 0.8, 0.55], edge: [0.1, -0.35, 1] } });
}

// ---------------------------------------------------------------- шаг и бег
/** Шаг: фаза p 0..1 (полный цикл — два шага). Перекат с пятки на носок, таз качается, руки навстречу ногам. */
export function walk(p, t = 0) {
  const leg = (q, sg) => {
    q = ((q % 1) + 1) % 1; const L = 12;
    if (q < 0.58) { const s = q / 0.58; return { f: [sg * 8.2, SK.ankleY, L - s * 2 * L], toe: s < 0.15 ? 0.3 * (1 - s / 0.15) : s > 0.75 ? -0.45 * (s - 0.75) / 0.25 : 0 }; }
    const s = (q - 0.58) / 0.42, e = ease(s); return { f: [sg * 8.2, SK.ankleY + Math.sin(s * Math.PI) * 6.5 + (s < 0.3 ? s * 4 : 0), -L + e * 2 * L], toe: s < 0.4 ? -0.6 + s * 1.2 : 0.25 * (s - 0.4) / 0.6 };
  };
  const A = leg(p, 1), Bf = leg(p + 0.5, -1), w = Math.sin(p * TAU), bob = Math.abs(Math.cos(p * TAU));
  return over(STAND, {
    root: [0, -2.2 + bob * 1.6, 0], lean: 0.08, yaw: w * 0.12, twist: -w * 0.2 + 0.05, bend: 0.06, side: w * 0.04, sideBend: -w * 0.03, breathe: Math.sin(t * 2.4) * 0.4,
    foot: { L: A.f, R: Bf.f }, toe: { L: A.toe, R: Bf.toe }, footYaw: { L: 0.08, R: -0.08 },
    hand: { L: [15, 45 + Math.abs(w) * 2, -w * 10 + 2], R: [-13, 47 + Math.abs(w) * 1.5, w * 5 + 9] },
    weapon: { dir: [0.25, 0.75 + w * 0.05, 0.5 + w * 0.12], edge: [0.1, -0.3, 1] },
    head: { pitch: 0.04, yaw: w * 0.06, roll: 0 },
  });
}
/** Бег: шаг шире, полёт, высоко поднятое колено, корпус вперёд, руки согнуты и работают. */
export function run(p, t = 0) {
  const leg = (q, sg) => {
    q = ((q % 1) + 1) % 1; const L = 17;
    if (q < 0.4) { const s = q / 0.4; return { f: [sg * 7.6, SK.ankleY, L * 0.8 - s * 2 * L], toe: s > 0.6 ? -0.6 * (s - 0.6) / 0.4 : 0.1 }; }
    const s = (q - 0.4) / 0.6, e = easeOut(s); return { f: [sg * 7.6, SK.ankleY + Math.sin(Math.min(1, s * 1.15) * Math.PI) * 13 + (s < 0.35 ? 8 * s : 2.8 * (1 - s)), -L * 1.2 + e * L * 2], toe: -0.7 + s * 0.9 };
  };
  const A = leg(p, 1), Bf = leg(p + 0.5, -1), w = Math.sin(p * TAU), bob = Math.abs(Math.sin(p * TAU));
  return over(STAND, {
    root: [0, -3 + bob * 3.4, 2], lean: 0.24, yaw: w * 0.14, twist: -w * 0.32, bend: 0.12, side: w * 0.05, breathe: 0.6,
    foot: { L: A.f, R: Bf.f }, toe: { L: A.toe, R: Bf.toe }, footYaw: { L: 0, R: 0 }, knee: { L: [0.2, 0.3, 1], R: [-0.2, 0.3, 1] },
    hand: { L: [14, 58 + w * 6, -w * 13 + 4], R: [-13, 58 - w * 6, w * 11 + 6] }, elbow: { L: [0.6, -0.5, -1], R: [-0.6, -0.5, -1] },
    weapon: { dir: [0.35, 0.55, -0.7 + w * 0.3], edge: [0, 1, 0.2] },
    head: { pitch: -0.1, yaw: w * 0.05, roll: 0 },
  });
}

// ---------------------------------------------------------------- садится (X) — k 0..1 от стоя до сидя
const CROUCH = over(STAND, { root: [0, -19, -2], lean: 0.32, bend: 0.25, foot: { L: [10, SK.ankleY, 6], R: [-10, SK.ankleY, 1] }, knee: { L: [0.5, 0.2, 1], R: [-0.5, 0.2, 1] }, hand: { L: [14, 28, 18], R: [-13, 24, 16] }, weapon: { dir: [0.4, -0.2, 1], edge: [0, 1, 0] }, head: { pitch: 0.25, yaw: 0, roll: 0 } });
const SIT = over(STAND, { root: [0, -41.5, -3], lean: -0.04, bend: 0.2, sideBend: 0, twist: 0, foot: { L: [-4, 3.2, 16], R: [5, 3.2, 12.5] }, toe: { L: 0.3, R: 0.3 }, footYaw: { L: -1.1, R: 1.1 }, knee: { L: [1, 0.5, 0.2], R: [-1, 0.5, 0.2] },
  hand: { L: [13, 18, 13], R: [-13, 17, 12] }, elbow: { L: [1, -0.2, -0.3], R: [-1, -0.2, -0.3] }, head: { pitch: 0.12, yaw: 0, roll: 0.05 }, weapon: { dir: [0.05, 0, 1], edge: [0, 1, 0] } });
export function sit(k, t = 0) {
  const p = k < 0.5 ? blend(idle(t), CROUCH, ease(k / 0.5)) : blend(CROUCH, SIT, ease((k - 0.5) / 0.5));
  if (k >= 1) { const b = Math.sin(t * 1.4); p.breathe = b * 1.2; p.head = { pitch: 0.14 + b * 0.04, yaw: Math.sin(t * 0.3) * 0.2, roll: 0.05 }; }
  // оружие кладёт рядом на землю (после середины)
  p.drop = k > 0.55 ? { at: [-20, 1.6, 8], dir: [0.15, 0.02, 1], edge: [0, 1, 0], k: ease(clamp((k - 0.55) / 0.3)) } : null;
  return p;
}

// ---------------------------------------------------------------- удары
/** Обычный удар топором: замах из-за плеча, рубка вниз с шагом, проводка, возврат. q 0..1 */
const READY = STAND;
export function chop(q) {
  return keys(q, [
    [0, READY],
    [0.32, over(READY, { twist: -0.55, bend: -0.06, lean: -0.02, root: [0, -1.5, -1], hand: { R: [-9, 86, -3], L: [16, 52, 9] }, elbow: { R: [-1, 0.3, -0.4] }, weapon: { dir: [0.2, 0.35, -1], edge: [0, 1, 0] }, foot: { L: [9, SK.ankleY + 1.5, 5] }, head: { pitch: -0.05, yaw: 0.25, roll: 0 } })],
    [0.5, over(READY, { twist: 0.42, bend: 0.32, lean: 0.12, root: [0, -4.5, 3], hand: { R: [-3, 36, 24], L: [17, 44, -2] }, weapon: { dir: [0.05, -0.55, 1], edge: [0, -1, -0.1] }, foot: { L: [9.5, SK.ankleY, 11] }, head: { pitch: 0.22, yaw: -0.1, roll: 0 } })],
    [0.66, over(READY, { twist: 0.55, bend: 0.38, lean: 0.14, root: [0, -5, 3], hand: { R: [3, 28, 15], L: [17, 44, -4] }, weapon: { dir: [0.4, -0.9, 0.2], edge: [-0.2, 0, -1] }, foot: { L: [9.5, SK.ankleY, 11] }, head: { pitch: 0.25, yaw: -0.1, roll: 0 } })],
    [1, READY],
  ]);
}
/** Рывок: разгон-бросок вперёд низко, прыжок и удар с ходу. q 0..1 (сдвиг вперёд — dz) */
export function charge(q, t = 0) {
  if (q < 0.55) { const p = run((q / 0.55) * 1.6, t); p.lean = 0.42; p.bend = 0.2; p.weapon = { dir: [0.3, 0.2, -1], edge: [0, 1, 0] }; p.hand = { ...p.hand, R: [-15, 52, -10] }; p.dz = ease(q / 0.55) * 120; return p; }
  const s = (q - 0.55) / 0.45, p = chop(0.32 + s * 0.68 * 0.75); p.dz = 120 + easeOut(Math.min(1, s * 2)) * 14; if (s < 0.25) p.root = [p.root[0], p.root[1] + Math.sin(s / 0.25 * Math.PI) * 6, p.root[2]]; return p;
}
/** Вихрь: раскручивается на месте, оружие на вытянутой руке, ноги широко. q 0..1 за dur секунд — 2,5 оборота. */
export function whirl(q) {
  const spin = easeIn2(q) * TAU * 2.5, k = clamp(q / 0.12) * clamp((1 - q) / 0.12);
  const P = over(STAND, { spin, root: [0, -6, 0], lean: 0.1, twist: 0.25, bend: 0.1, foot: { L: [12, SK.ankleY, 3], R: [-12, SK.ankleY, -2] }, knee: { L: [0.6, 0, 1], R: [-0.6, 0, 1] },
    hand: { R: [-30, 64, 6], L: [24, 66, -6] }, elbow: { R: [0, -1, -0.3], L: [0, -1, 0.3] }, weapon: { dir: [-1, 0.08, 0.35], edge: [0, 0, 1] }, head: { pitch: 0.05, yaw: 0.15, roll: 0 } });
  const r = blend(STAND, P, ease(k)); r.spin = spin; return r;
}
const easeIn2 = t => t < 0.2 ? 2.5 * t * t : 0.1 + (t - 0.2) * 1.125;
/** Сокрушающий удар: присед, прыжок с оружием над головой двумя руками, удар в землю, выпрямление. q 0..1 */
export function crush(q) {
  const two = { twoHand: 7 };
  return keys(q, [
    [0, READY],
    [0.22, over(READY, { ...two, root: [0, -10, -2], lean: 0.2, bend: 0.1, hand: { R: [-4, 70, 6] }, weapon: { dir: [0, 0.6, -0.8], edge: [0, 1, 0] }, foot: { L: [10, SK.ankleY, 4], R: [-10, SK.ankleY, -3] }, head: { pitch: 0.1, yaw: 0, roll: 0 } })],
    [0.42, over(READY, { ...two, root: [0, 9, 4], lean: -0.12, bend: -0.2, hand: { R: [-3, 98, -2] }, elbow: { R: [-1, 0.6, -0.3], L: [1, 0.6, -0.3] }, weapon: { dir: [0, 0.25, -1], edge: [0, 1, 0] }, foot: { L: [9, SK.ankleY + 6, 7], R: [-9, SK.ankleY + 8, -5] }, toe: { L: -0.5, R: -0.6 }, head: { pitch: -0.15, yaw: 0, roll: 0 } })],
    [0.56, over(READY, { ...two, root: [0, -12, 8], lean: 0.55, bend: 0.5, hand: { R: [-2, 22, 26] }, weapon: { dir: [0, -0.75, 0.66], edge: [0, -0.66, -0.75] }, foot: { L: [11, SK.ankleY, 14], R: [-10, SK.ankleY, -6] }, head: { pitch: 0.3, yaw: 0, roll: 0 } })],
    [0.78, over(READY, { ...two, root: [0, -12, 8], lean: 0.5, bend: 0.45, hand: { R: [-2, 22, 26] }, weapon: { dir: [0, -0.75, 0.66], edge: [0, -0.66, -0.75] }, foot: { L: [11, SK.ankleY, 14], R: [-10, SK.ankleY, -6] }, head: { pitch: 0.1, yaw: 0, roll: 0 } })],
    [1, READY],
  ]);
}
/** Ярость берсерка: собирается, потом рёв — грудь вперёд, руки в стороны, голова вверх, дрожь. q 0..1 */
export function roar(q, t = 0) {
  const sh = q > 0.3 && q < 0.85 ? Math.sin(t * 60) * 0.6 : 0;
  return keys(q, [
    [0, READY],
    [0.25, over(READY, { root: [0, -7, -1], lean: 0.25, bend: 0.35, hand: { L: [10, 52, 12], R: [-10, 50, 12] }, weapon: { dir: [0.2, 0.9, 0.3], edge: [0, 0, 1] }, head: { pitch: 0.4, yaw: 0, roll: 0 }, foot: { L: [11, SK.ankleY, 3], R: [-11, SK.ankleY, -2] } })],
    [0.4, over(READY, { root: [sh * 0.3, -3, 0], lean: -0.08, bend: -0.32, breathe: 2.5, hand: { L: [27, 78, 2], R: [-27, 80, 2] }, elbow: { L: [0, -1, -0.5], R: [0, -1, -0.5] }, weapon: { dir: [-0.3, 1, -0.1], edge: [-1, 0, 0] }, head: { pitch: -0.45, yaw: 0, roll: sh * 0.04 }, foot: { L: [12, SK.ankleY, 3], R: [-12, SK.ankleY, -2] } })],
    [0.82, over(READY, { root: [sh * 0.3, -3, 0], lean: -0.08, bend: -0.32, breathe: 2.5, hand: { L: [27, 79, 2], R: [-27, 81, 2] }, elbow: { L: [0, -1, -0.5], R: [0, -1, -0.5] }, weapon: { dir: [-0.3, 1, -0.1], edge: [-1, 0, 0] }, head: { pitch: -0.4, yaw: 0, roll: sh * 0.04 }, foot: { L: [12, SK.ankleY, 3], R: [-12, SK.ankleY, -2] } })],
    [1, READY],
  ]);
}
/** Отдача от удара: корпус назад, голова дёргается, руки прикрываются. q 0..1 */
export function hurt(q) { const k = Math.sin(clamp(q) * Math.PI); return blend(READY, over(READY, { root: [0, -2.5, -3], lean: -0.18, bend: -0.12, head: { pitch: -0.25, yaw: 0.2, roll: 0.1 }, hand: { L: [12, 62, 10] } }), k); }
/** Падение: колени подгибаются, тело валится на бок. q 0..1 */
export function death(q) {
  const P = keys(q, [
    [0, READY],
    [0.35, over(READY, { root: [0, -16, 2], lean: 0.35, bend: 0.3, foot: { L: [9, SK.ankleY, 6], R: [-9, SK.ankleY, -1] }, knee: { L: [0.4, 0, 1], R: [-0.4, 0, 1] }, hand: { L: [15, 34, 14], R: [-13, 30, 14] }, head: { pitch: 0.4, yaw: 0, roll: 0 }, weapon: { dir: [0.4, -0.4, 1], edge: [0, 1, 0] } })],
    [1, over(READY, { root: [0, -1, 0], lean: 0.02, bend: 0.05, foot: { L: [9, SK.ankleY, 3], R: [-6, SK.ankleY, -3] }, knee: { L: [0.3, 0, 1], R: [-0.3, 0, 1] }, hand: { L: [26, 60, 4], R: [-24, 48, 10] }, elbow: { L: [0, 1, 0], R: [0, -1, 0] }, head: { pitch: -0.1, yaw: 0.5, roll: 0 }, weapon: { dir: [-0.3, -0.1, 1], edge: [0, 1, 0] } })],
  ]);
  P.fall = q < 0.35 ? 0 : ease((q - 0.35) / 0.65) * (Math.PI / 2 - 0.05);
  return P;
}
