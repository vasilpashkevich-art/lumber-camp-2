// Новый герой (эскиз v74): каркас фигуры в объёме — кости, поворот на любую сторону (8 сторон и всё между ними),
// руки и ноги ставятся по точкам кистей и ступней (обратная кинематика). Рисовка — в paint.js, облик — в warrior.js.
// Система тела: X — левая сторона героя, Y — вверх, Z — вперёд (куда смотрит). Рост героя = 100.
// Мир экрана: Xw — вправо, Yw — вверх, Zw — к зрителю (вниз по экрану). Камера сверху-спереди.

// ---------------------------------------------------------------- векторы
export const V = (x = 0, y = 0, z = 0) => [x, y, z];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = a => Math.hypot(a[0], a[1], a[2]);
export const norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerpV = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;

// ---------------------------------------------------------------- повороты (матрица 3×3 строками)
export const M_ID = [1, 0, 0, 0, 1, 0, 0, 0, 1];
export const mm = (A, B) => { const R = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return R; };
export const mv = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
/** Поворот вокруг Y (рысканье): положительный — нос к +X (налево от героя). */
export const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
/** Вокруг X (наклон): положительный — верх уходит вперёд (+Z). */
export const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
/** Вокруг Z (крен): положительный — верх уходит к +X. */
export const rotZ = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, -s, c, 0, 0, 0, 1]; };
/** Поворот вокруг произвольной оси. */
export function rotAxis(ax, a) {
  const [x, y, z] = norm(ax), c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
}
/** Рамка из оси «вперёд» f и подсказки «вверх» u: столбцы — x, y, z. */
export function frameFrom(f, u) { const z = norm(f), x = norm(cross(u, z)), y = cross(z, x); return [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]]; }

// ---------------------------------------------------------------- камера
export const CAM = { ky: 0.94, kz: 0.48, toCam: norm([0, 0.55, 1]) };
/** Мировая точка → экран (x вправо, y вниз), d — близость к зрителю (больше — ближе). */
export const proj = (w, S) => ({ x: S.x + w[0] * S.k, y: S.y + (-w[1] * CAM.ky + w[2] * CAM.kz) * S.k, d: w[2] + w[1] * 0.25 });

// ---------------------------------------------------------------- скелет (рост 100)
export const SK = {
  hipY: 45, hipX: 7.6, thigh: 21, shin: 20, ankleY: 4.6, foot: 8.5,
  waistY: 55, chestY: 66, shY: 73, shX: 18, neckY: 78.5, headY: 89.8, headR: 11,
  upper: 16, fore: 14.5, handR: 4.6,
};

/** Двухзвенная обратная кинематика: от a (плечо/бедро) к цели t, длины l1, l2, колено/локоть в сторону pole. */
export function ik2(a, t, l1, l2, pole) {
  let d = sub(t, a), dl = len(d); const maxL = (l1 + l2) * 0.999, minL = Math.abs(l1 - l2) + 0.01;
  if (dl > maxL) { d = mul(d, maxL / dl); dl = maxL; } if (dl < minL) { d = mul(norm(d), minL); dl = minL; }
  const dn = mul(d, 1 / dl), ca = clamp((l1 * l1 + dl * dl - l2 * l2) / (2 * l1 * dl), -1, 1), sa = Math.sqrt(1 - ca * ca);
  let p = sub(pole, mul(dn, dot(pole, dn))); if (len(p) < 1e-4) p = Math.abs(dn[1]) < 0.9 ? [0, 1, 0] : [0, 0, 1]; p = norm(p);
  const mid = add(a, add(mul(dn, l1 * ca), mul(p, l1 * sa)));
  return { mid, end: add(a, d) };
}

/**
 * Поза → точки скелета в системе тела (потом поворачиваются в мир).
 * P: { root:[x,y,z], yaw, lean, side, twist, bend, sideBend, head:{pitch,yaw,roll}, breathe,
 *      hand:{L:[x,y,z],R:[..]}, elbow:{L:pole,R:pole}, foot:{L:[x,y,z],R}, toe:{L,R}, knee:{L:pole,R:pole},
 *      weapon:{dir, edge}, grip:'R'|'2' }  — кисти и ступни заданы в системе тела (от земли под тазом).
 */
export function solve(P) {
  const S = SK, B = {};
  const root = P.root || [0, 0, 0];
  // таз: наклон и крен вокруг точки таза
  const pelvisM = mm(rotY(P.yaw || 0), mm(rotX(P.lean || 0), rotZ(P.side || 0)));
  const pelvis = add(root, [0, S.hipY + 2, 0]);
  B.pelvisM = pelvisM; B.pelvis = pelvis;
  const atPelvis = v => add(pelvis, mv(pelvisM, v));
  B.hipL = atPelvis([S.hipX, -2, 0]); B.hipR = atPelvis([-S.hipX, -2, 0]);
  // корпус: от поясницы — поворот, наклон, крен
  const waist = atPelvis([0, S.waistY - S.hipY - 2, 0]);
  const chestM = mm(pelvisM, mm(rotY(P.twist || 0), mm(rotX(P.bend || 0), rotZ(P.sideBend || 0))));
  const br = P.breathe || 0;
  const atChest = v => add(waist, mv(chestM, v));
  B.waist = waist; B.chestM = chestM;
  B.chest = atChest([0, S.chestY - S.waistY, 0]);
  B.shL = atChest([S.shX, S.shY - S.waistY + br * 0.6, -0.5]); B.shR = atChest([-S.shX, S.shY - S.waistY + br * 0.6, -0.5]);
  B.neck = atChest([0, S.neckY - S.waistY + br * 0.4, -0.6]);
  const H = P.head || {};
  B.headM = mm(chestM, mm(rotY(H.yaw || 0), mm(rotX(H.pitch || 0), rotZ(H.roll || 0))));
  B.head = add(B.neck, mv(B.headM, [0, S.headY - S.neckY, 0.6]));
  B.breathe = br;
  // руки (правая первой: левая может держать древко двумя руками — twoHand: расстояние ниже хвата)
  const hand = P.hand || {}, el = P.elbow || {}, Wd = norm((P.weapon && P.weapon.dir) || [0, 1, 0.3]);
  for (const s of ['R', 'L']) {
    const sh = B['sh' + s], sg = s === 'L' ? 1 : -1;
    const t = s === 'L' && P.twoHand ? add(B.haR, mul(Wd, -P.twoHand)) : hand[s] || add(sh, [sg * 3, -31, 2]);
    const pole = el[s] || [sg * 0.6, -0.2, -1];
    const r = ik2(sh, t, S.upper, S.fore, pole);
    B['el' + s] = r.mid; B['ha' + s] = r.end;
  }
  // ноги
  const foot = P.foot || {}, kn = P.knee || {}, toe = P.toe || {};
  for (const s of ['L', 'R']) {
    const hp = B['hip' + s], sg = s === 'L' ? 1 : -1;
    const t = foot[s] || [sg * S.hipX, S.ankleY, 0];
    const r = ik2(hp, t, S.thigh, S.shin, kn[s] || [sg * 0.15, 0, 1]);
    B['kn' + s] = r.mid; B['an' + s] = r.end;
    // стопа: вперёд по направлению таза, носок может быть поднят/опущен (toe — угол)
    const fwd = mv(mm(rotY((P.yaw || 0) + (P.footYaw ? P.footYaw[s] || 0 : 0)), rotX(-(toe[s] || 0))), [sg * 0.12, 0, 1]);
    B['to' + s] = add(r.end, add(mul(norm(fwd), S.foot), [0, -S.ankleY * 0.55, 0]));
  }
  // оружие: из правой кисти по направлению dir, плоскость лезвия — edge
  const W = P.weapon || {};
  B.wDir = norm(W.dir || [0, 1, 0.3]); B.wEdge = norm(sub(W.edge || [0, 0, 1], mul(B.wDir, dot(W.edge || [0, 0, 1], B.wDir))));
  B.grip = B.haR; B.twoHand = P.twoHand || 0; B.dropped = !!(P.drop && P.drop.k > 0.5);
  // оружие положено на землю (сидит)
  if (P.drop) { const k = P.drop.k; B.grip = lerpV(B.haR, add(root, P.drop.at), k); B.wDir = norm(lerpV(B.wDir, P.drop.dir, k)); B.wEdge = norm(lerpV(B.wEdge, P.drop.edge, k)); }
  // падение на бок: всё тело поворачивается вокруг точки у ног
  if (P.fall) { const R = rotZ(P.fall), f = P.fall / (Math.PI / 2), lift = f * 6, piv = [root[0], 0, root[2]];
    for (const k in B) { const v = B[k]; if (Array.isArray(v) && v.length === 3 && k !== 'wDir' && k !== 'wEdge') B[k] = add(add(mv(R, sub(v, piv)), piv), [-f * 42, lift, 0]); else if (Array.isArray(v) && v.length === 9) B[k] = mm(R, v); }
    B.wDir = mv(R, B.wDir); B.wEdge = mv(R, B.wEdge); }
  return B;
}

/** Скелет в мир: поворот на сторону h (рад., 0 — лицом к зрителю), сдвиг. */
export function toWorld(B, h) {
  const R = rotY(h), W = {};
  for (const k in B) { const v = B[k]; W[k] = Array.isArray(v) && v.length === 3 ? mv(R, v) : Array.isArray(v) && v.length === 9 ? mm(R, v) : v; }
  W.heading = h; return W;
}

/** Направление движения на экране → сторона: dx вправо, dy вниз. */
export const headingOf = (dx, dy) => Math.atan2(dx, dy);
/** Сторона, округлённая до одной из 8. */
export const snap8 = h => Math.round(h / (Math.PI / 4)) * (Math.PI / 4);
