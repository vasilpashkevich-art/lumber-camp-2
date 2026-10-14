// Эскиз v97, проба 4: один герой — Чёрный полководец — в движении: 8 сторон, стоит, шаг, удар секирой.
// Объёмная кукла: у каждой части своё место в теле (L — вбок, к левой руке героя; F — вперёд; y — вверх-вниз),
// при повороте на угол a место пересчитывается на экран: x = L·cos a + F·sin a, а глубина (кто ближе) = −L·sin a + F·cos a.
// Плоские детали (знак на груди, забрало, золотой клин) лежат на своей стороне тела и видны, когда эта сторона повёрнута к нам.
// a: 0 — лицом, 45 — вполоборота, 90 — боком вправо, 135 — вполоборота спиной, 180 — спиной. Влево — зеркально.
import { paint, capsule, shine, rivet, ink, sh } from './toon.js';
import { plate, trimLine } from './heavy.js';
const TAU = Math.PI * 2, LW = 0.8, rad = d => d * Math.PI / 180;

export const KNIGHT = { c: '#40404c', c2: '#1c1c22', trim: '#c8382c', horn: '#b02a24', eyes: '#ff5a30', cape: '#6a1810', spike: '#d8d0c8', axe: '#5e5e6c', wood: '#2a1a16' };
const TOP = -29.6, HIP = -18.6, SW = 5.6, HEADY = -35.3, HR = 5.6;

/** Поза по режиму: idle (t), walk (p 0..1), atk (q 0..1). Углы рук — в плоскости «вперёд-вниз»: 0 — рука вниз, π — вверх. */
export function poseOf(mode, k, t = 0) {
  const P = { bob: Math.sin(t * 2.2) * 0.2, foot: [0, 0], lift: [0, 0], armL: 0.15, armR: 0.3, axe: 0.3, lean: 0 };
  if (mode === 'walk') { const w = k * TAU; P.foot = [Math.sin(w) * 4.6, Math.sin(w + Math.PI) * 4.6]; P.lift = [Math.max(0, Math.cos(w)) * 1.8, Math.max(0, Math.cos(w + Math.PI)) * 1.8]; P.bob = -Math.abs(Math.sin(w)) * 0.7; P.armL = 0.15 - Math.sin(w) * 0.45; P.armR = 0.3 + Math.sin(w) * 0.25; P.axe = 0.3 + Math.sin(w) * 0.25; }
  if (mode === 'atk') {   // замах из-за головы и рубящий удар вниз-вперёд
    const K = [[0, 0.3, 0.3], [0.28, 2.5, 3.6], [0.45, 3.05, 4.1], [0.62, 1.7, 2.3], [0.8, 0.75, 1.15], [1, 0.3, 0.3]];
    let i = 0; while (i < K.length - 2 && k > K[i + 1][0]) i++; const [k0, a0, x0] = K[i], [k1, a1, x1] = K[i + 1], q = Math.min(1, Math.max(0, (k - k0) / (k1 - k0))), e = q * q * (3 - 2 * q);
    P.armR = a0 + (a1 - a0) * e; P.axe = x0 + (x1 - x0) * e; P.atk = Math.min(1, Math.sin(Math.PI * Math.min(1, k * 1.15)) * 1.6); P.lean = k > 0.55 && k < 0.95 ? 1.2 : 0; P.foot = [k > 0.5 ? 2.2 : 0, k > 0.5 ? -1.4 : 0];
  }
  return P;
}

/** Нарисовать рыцаря: угол a в градусах (0…180), поза, время. */
export function knight(g, aDeg, pose, t = 0, C = KNIGHT) {
  const a = rad(aDeg), ca = Math.cos(a), sa = Math.sin(a);
  const X = (L, F) => L * ca + F * sa, Z = (L, F) => -L * sa + F * ca, vis = phi => Math.cos(a + phi);   // phi: 0 — лицом вперёд, +π/2 — к левой руке героя
  const items = [];
  const add = (z, fn) => items.push({ z, fn });
  const by = pose.bob;
  g.save(); g.translate(0, by); g.lineJoin = 'round'; g.lineCap = 'round';
  // тень на земле (не качается)
  g.save(); g.translate(0, -by); g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, 0.6, 9.5, 2.8, 0, 0, TAU); g.fill(); g.restore();
  const lean = pose.lean || 0;   // наклон корпуса вперёд при ударе
  const tx = F => F * sa;        // сдвиг по экрану от выноса вперёд

  // ---- плащ: от плеч назад и вниз
  add(Z(0, -4), () => { const pts = [[-5.2, -3, TOP + 1], [5.2, -3, TOP + 1], [6.8, -5 - Math.abs(pose.foot[0]) * 0.2, -1.6], [-6.8, -5 - Math.abs(pose.foot[0]) * 0.2, -1.6]].map(([L, F, y]) => [X(L, F + lean * 0.5), y]);
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); g.quadraticCurveTo(pts[2][0] + 0.8 * Math.sign(pts[2][0] - pts[3][0] || 1), (pts[1][1] + pts[2][1]) / 2, pts[2][0], pts[2][1]);
    g.quadraticCurveTo((pts[2][0] + pts[3][0]) / 2, pts[2][1] + 1.2, pts[3][0], pts[3][1]); g.quadraticCurveTo(pts[3][0] - 0.8, (pts[0][1] + pts[3][1]) / 2, pts[0][0], pts[0][1]); g.closePath(); paint(g, ca < 0 ? C.cape : sh(C.cape, -0.25), LW, TOP, 0); });

  // ---- ноги
  for (const [i, L] of [[0, 2.9], [1, -2.9]]) {
    const fF = pose.foot[i], lift = pose.lift[i], kF = fF * 0.45 + 1.0, ky = -10 - lift * 0.4;
    add(Z(L, fF * 0.5) - 0.5, () => {
      const hx = X(L, 0), kx = X(L, kF), ax = X(L, fF), ay = -2.4 - lift;
      capsule(g, hx, HIP + 1, kx, ky, 4.3, C.c2);
      // поножь
      g.save(); g.translate(kx, ky); const sx = ax - kx, sy = ay - ky, len = Math.hypot(sx, sy), ang = Math.atan2(sx, sy); g.rotate(-ang);
      plate(g, () => { g.beginPath(); g.moveTo(-2.3, 0.6); g.quadraticCurveTo(-2.8, len * 0.6, -2.6, len); g.lineTo(2.6, len); g.quadraticCurveTo(2.8, len * 0.6, 2.3, 0.6); g.closePath(); }, C.c, 0, len, -0.9, len * 0.4, 0.5, 1.4); g.restore();
      // наколенник
      plate(g, () => { g.beginPath(); g.ellipse(kx + tx(0.6), ky, 2.8, 2.4, 0, 0, TAU); }, C.c, ky - 2.4, ky + 2.4, kx + tx(0.6) - 0.9, ky - 0.9, 0.8, 0.6);
      if (vis(0) > 0.1) { g.beginPath(); g.ellipse(kx + tx(1.6), ky, 1.0 * Math.max(0.3, vis(0)), 1.0, 0, 0, TAU); g.fillStyle = C.trim; g.fill(); }
      // латный сапог: вытянут вперёд
      const toe = X(L, fF + 2.2), heel = X(L, fF - 1.6), wid = 2.6 * Math.abs(ca) + 0.6;
      plate(g, () => { g.beginPath(); g.moveTo(Math.min(toe, heel) - wid, ay + 0.2); g.quadraticCurveTo(Math.min(toe, heel) - wid, ay - 3.6, (toe + heel) / 2, ay - 3.8); g.quadraticCurveTo(Math.max(toe, heel) + wid, ay - 3.6, Math.max(toe, heel) + wid + 0.4 * Math.sign(sa || 1) * (sa > 0.3 ? 1 : 0), ay + 0.2); g.quadraticCurveTo((toe + heel) / 2, ay + 1.4, Math.min(toe, heel) - wid, ay + 0.2); g.closePath(); }, C.c, ay - 3.8, ay + 1, (toe + heel) / 2 - 1, ay - 2.4, 0.9, 0.5);
    });
  }

  // ---- корпус: поддоспешник, кираса (силуэт по ширине и глубине), детали спереди или сзади
  const W = SW * 2 * Math.abs(ca) + 10 * Math.abs(sa), bx = tx(lean * 0.6);
  add(0, () => {
    g.beginPath(); g.roundRect(bx - W / 2, TOP - 0.4, W, HIP - TOP + 1, 3); paint(g, C.c2, LW, TOP, HIP);
    // кираса: выпуклость грудью вперёд
    const fx = bx + tx(1.6);
    plate(g, () => { g.beginPath(); g.moveTo(bx - W / 2 - 0.5, TOP + 1.2); g.quadraticCurveTo(bx - W / 2 - 1.1, TOP + 8, fx - W * 0.2, HIP - 1.6); g.quadraticCurveTo(fx, HIP - 0.6, fx + W * 0.2, HIP - 1.6); g.quadraticCurveTo(bx + W / 2 + 1.1, TOP + 8, bx + W / 2 + 0.5, TOP + 1.2); g.quadraticCurveTo(bx, TOP - 0.4, bx - W / 2 - 0.5, TOP + 1.2); g.closePath(); },
      C.c, TOP, HIP, fx - W * 0.25, TOP + 3.6, 1.1, 2.4);
    // лицевая сторона: ребро, красный клин, знак
    const v = vis(0);
    if (v > 0.05) { g.save(); g.translate(bx + tx(4.2), 0); g.scale(v, 1);
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, TOP + 1.4); g.quadraticCurveTo(0.3, TOP + 6, 0, HIP - 1.4); g.stroke();
      g.beginPath(); g.moveTo(-3.6, TOP + 1.6); g.quadraticCurveTo(0, TOP + 0.8, 3.6, TOP + 1.6); g.quadraticCurveTo(1.4, TOP + 2.4, 0, TOP + 4.6); g.quadraticCurveTo(-1.4, TOP + 2.4, -3.6, TOP + 1.6); g.closePath(); paint(g, C.trim, 0.6, TOP, TOP + 4.6);
      g.beginPath(); g.arc(0, TOP + 7.2, 1.3, 0, TAU); paint(g, C.eyes, 0.5); shine(g, -0.4, TOP + 6.8, 0.4, 0.3, 0.7); g.restore(); }
    // спина: хребет из пластин
    const vb = vis(Math.PI);
    if (vb > 0.05) { g.save(); g.translate(bx - tx(3.6), 0); g.scale(vb, 1); for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(-1.4, TOP + 2 + i * 2.4, 2.8, 2, 0.8); paint(g, sh(C.c, 0.1), 0.5); } g.restore(); }
    // пояс
    g.beginPath(); g.roundRect(bx - W / 2 + 0.2, HIP - 2.4, W - 0.4, 2.2, 1.1); paint(g, C.trim, 0.6, HIP - 2.4, HIP);
    if (v > 0.2) { g.beginPath(); g.roundRect(bx + tx(4) - 1.4 * v, HIP - 2.7, 2.8 * v, 2.8, 0.7); paint(g, sh(C.trim, -0.25), 0.5); }
    // ворот
    g.beginPath(); g.ellipse(bx, TOP + 0.2, 3.6 * Math.abs(ca) + 2.8 * Math.abs(sa), 1.6, 0, 0, TAU); paint(g, sh(C.c2, 0.15));
  });
  // ---- юбка из пластин: лепестки вокруг бёдер, каждый смотрит в свою сторону
  for (let i = 0; i < 8; i++) {
    const phi = i / 8 * TAU, L = Math.sin(phi) * 5.2, F = Math.cos(phi) * 3.6, v = vis(phi);
    if (v < -0.15) continue;
    add(Z(L, F) + 0.1, () => { const x = X(L, F) + tx(lean * 0.4), w = 4.3 * Math.max(0.25, v), h = 5.8 + (Math.abs(Math.cos(phi)) > 0.7 ? 0.8 : 0);
      plate(g, () => { g.beginPath(); g.moveTo(x - w / 2, HIP - 0.6); g.lineTo(x + w / 2, HIP - 0.6); g.quadraticCurveTo(x + w / 2 + 0.3, HIP + h * 0.7, x, HIP + h); g.quadraticCurveTo(x - w / 2 - 0.3, HIP + h * 0.7, x - w / 2, HIP - 0.6); g.closePath(); }, C.c, HIP, HIP + h, x - w * 0.18, HIP + h * 0.35, 0.4 * Math.max(0.4, v), h * 0.22);
      g.beginPath(); g.moveTo(x - w / 2 + 0.3, HIP + 0.4); g.lineTo(x + w / 2 - 0.3, HIP + 0.4); g.strokeStyle = C.trim; g.lineWidth = 0.7; g.stroke(); });
  }

  // ---- руки: плечо — локоть — кисть в плоскости «вперёд-вниз» своей стороны
  const arm = (L, th, bend) => { const sy = TOP + 2.2, ux = Math.sin(th) * 6.2, uy = Math.cos(th) * 6.2, ex = ux, ey = sy + uy, t2 = th + bend, hx = ex + Math.sin(t2) * 5.8, hy = ey + Math.cos(t2) * 5.8; return { sF: lean * 0.6, sy, eF: ex + lean * 0.6, ey, hF: hx + lean * 0.6, hy }; };
  const armDraw = (L, A) => {
    const s = [X(L, A.sF), A.sy], e = [X(L, A.eF), A.ey], h = [X(L, A.hF), A.hy];
    capsule(g, s[0], s[1], e[0], e[1], 3.6, C.c2);
    // наруч от локтя к кисти, расширяется
    const ang = Math.atan2(h[0] - e[0], h[1] - e[1]), len = Math.hypot(h[0] - e[0], h[1] - e[1]);
    g.save(); g.translate(e[0], e[1]); g.rotate(-ang); plate(g, () => { g.beginPath(); g.moveTo(-1.9, 0.4); g.lineTo(-2.3, len - 1.8); g.quadraticCurveTo(0, len - 0.6, 2.3, len - 1.8); g.lineTo(1.9, 0.4); g.closePath(); }, C.c, 0, len, -0.8, len * 0.4, 0.45, 1.2);
    g.beginPath(); g.ellipse(0, len - 1.6, 2.4, 0.8, 0, 0, TAU); paint(g, C.trim, 0.5); g.restore();
    plate(g, () => { g.beginPath(); g.ellipse(e[0], e[1], 2.1, 1.9, 0, 0, TAU); }, C.c, e[1] - 2, e[1] + 2, e[0] - 0.6, e[1] - 0.6, 0.6, 0.5);
    g.beginPath(); g.ellipse(h[0], h[1], 2.1, 2.0, 0, 0, TAU); paint(g, sh(C.c2, 0.08), LW, h[1] - 2, h[1] + 2);
    return h;
  };
  const AL = arm(SW + 1.2, pose.armL, -0.25), AR = arm(-(SW + 1.2), pose.armR, pose.armR > 1.5 ? -0.5 : 0.35);
  const zL = Z(SW + 1.2, (AL.eF + AL.hF) / 2), zR = Z(-(SW + 1.2), (AR.eF + AR.hF) / 2);
  add(zL + 0.2, () => armDraw(SW + 1.2, AL));
  // секира в правой руке: рукоять по направлению pose.axe в той же плоскости; лезвия — в плоскости удара
  const axeDraw = () => {
    const hF = AR.hF, hy = AR.hy, L = -(SW + 1.2), ps = pose.axe, dF = Math.sin(ps), dy = Math.cos(ps);
    const p0 = [X(L, hF - dF * 4), hy - dy * 4], p1 = [X(L, hF + dF * 15), hy + dy * 15];
    capsule(g, p0[0], p0[1], p1[0], p1[1], 1.5, C.wood);
    // лезвия: перпендикуляр к рукояти в плоскости удара — на экране (cos·sin a, −sin)
    // лезвия: в покое и на ходу — вбок (плоскость к нам лицом), в ударе — в плоскости удара
    const w = pose.atk || 0, nx = (Math.cos(ps) * sa) * w + ca * (1 - w), ny = -Math.sin(ps) * w, nn = Math.hypot(nx, ny) || 1, ux = (p1[0] - p0[0]) / 19, uy = (p1[1] - p0[1]) / 19;
    const thin = Math.max(0.4, nn);
    for (const s of [-1, 1]) {
      const bx = p1[0] - ux * 2.4, by2 = p1[1] - uy * 2.4, ox = nx / nn * 6.2 * s * (0.4 + 0.6 * thin), oy = ny / nn * 6.2 * s * (0.4 + 0.6 * thin);
      g.beginPath(); g.moveTo(bx + ux * 2.6, by2 + uy * 2.6); g.quadraticCurveTo(bx + ox + ux * 3.6, by2 + oy + uy * 3.6, bx + ox * 1.05 + ux * 0.2, by2 + oy * 1.05 + uy * 0.2); g.quadraticCurveTo(bx + ox - ux * 3.4, by2 + oy - uy * 3.4, bx - ux * 2.2, by2 - uy * 2.2); g.closePath();
      plate(g, () => {}, C.axe, by2 - 6, by2 + 6, null); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(bx + ox * 0.92 + ux * 2.2, by2 + oy * 0.92 + uy * 2.2); g.quadraticCurveTo(bx + ox * 1.02, by2 + oy * 1.02, bx + ox * 0.92 - ux * 2.2, by2 + oy * 0.92 - uy * 2.2); g.stroke();
      g.strokeStyle = C.trim; g.lineWidth = 0.7; g.beginPath(); g.moveTo(bx + ox * 0.35 + ux * 1.6, by2 + oy * 0.35 + uy * 1.6); g.lineTo(bx + ox * 0.35 - ux * 1.6, by2 + oy * 0.35 - uy * 1.6); g.stroke();
    }
    g.beginPath(); g.roundRect(p1[0] - ux * 3.6 - 1.3, p1[1] - uy * 3.6 - 1.3, 2.6, 2.6, 0.7); paint(g, C.trim, 0.5);
    // след удара
    if (pose.trail) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,190,140,${pose.trail})`; g.lineWidth = 2.2; g.beginPath(); const sF = AR.sF, sy = AR.sy; for (let k = 0; k <= 10; k++) { const th = ps + 0.25 + k * 0.12, F = sF + Math.sin(th) * 19, y = sy + Math.cos(th) * 19; k ? g.lineTo(X(L, F), y) : g.moveTo(X(L, F), y); } g.stroke(); g.restore(); }
  };
  add(zR + 0.2, () => { armDraw(-(SW + 1.2), AR); });
  add(zR + (Math.cos(pose.axe) < 0 && ca > 0.3 ? -0.6 : 0.5), axeDraw);

  // ---- наплечники: огромные купола, у каждого — шип и красная кайма
  for (const L of [SW + 1.3, -(SW + 1.3)]) add(Z(L, 0) + 0.8, () => {
    const x = X(L, lean * 0.6), y = TOP + 1.6, R = 4.9, side = Math.sign(L);
    plate(g, () => { g.beginPath(); g.moveTo(x - R, y + 1.4); g.quadraticCurveTo(x - R - 0.4, y + 4.2, x, y + 4.4); g.quadraticCurveTo(x + R + 0.4, y + 4.2, x + R, y + 1.4); g.closePath(); }, C.c, y, y + 4.4, null);
    g.beginPath(); g.moveTo(x - R + 0.2, y + 3.4); g.quadraticCurveTo(x, y + 5.2, x + R - 0.2, y + 3.4); trimLine(g, C.trim, 0.8);
    plate(g, () => { g.beginPath(); g.moveTo(x - R - 0.3, y + 1.6); g.bezierCurveTo(x - R - 0.6, y - R * 0.9, x + R + 0.6, y - R * 0.9, x + R + 0.3, y + 1.6); g.quadraticCurveTo(x, y + 3.4, x - R - 0.3, y + 1.6); g.closePath(); }, C.c, y - R, y + 2.4, x - 1.4, y - 2, 1.5, 0.9);
    g.beginPath(); g.moveTo(x - R, y + 1.7); g.quadraticCurveTo(x, y + 3.4, x + R, y + 1.7); trimLine(g, C.trim, 1.0);
    // шипы — смотрят наружу от плеча
    const out = Math.sign(X(L, 0)) || side;
    for (const k of [-0.3, 0.3]) { g.beginPath(); g.moveTo(x + k * R * 1.4 - 0.8, y - R * 0.6); g.lineTo(x + k * R * 1.4 + out * 1.1, y - R * 0.6 - 3.4); g.lineTo(x + k * R * 1.4 + 0.8, y - R * 0.6); g.closePath(); paint(g, C.spike, 0.5); }
  });

  // ---- голова: шлем, забрало с огнём в прорези, загнутые рога (каждый рог — по точкам в объёме)
  const hF = lean * 0.8;
  for (const L of [1, -1]) {   // рога: основание у виска, загиб наружу-вверх-назад
    const pts = [[0.75, 0, -0.45], [1.55, -0.35, -0.95], [1.5, -0.9, -1.8], [0.9, -1.35, -2.45]].map(([l, f, y]) => [X(L * l * HR, f * HR + hF), HEADY + y * HR]);
    add(Z(L * HR, -HR * 0.6) + 1.2, () => {
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1] + 1.6); g.bezierCurveTo(pts[1][0], pts[1][1] + 1.4, pts[2][0], pts[2][1] + 0.6, pts[3][0], pts[3][1]);
      g.bezierCurveTo(pts[2][0] - 0.8 * Math.sign(pts[2][0] - pts[0][0] || 1), pts[2][1], pts[1][0] - 0.6 * Math.sign(pts[1][0] - pts[0][0] || 1), pts[1][1] - 0.6, pts[0][0], pts[0][1] - 1.4); g.closePath();
      plate(g, () => {}, C.horn, pts[3][1], pts[0][1], null); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(pts[1][0], pts[1][1]); g.quadraticCurveTo(pts[2][0], pts[2][1], pts[3][0], pts[3][1] + 0.6); g.stroke();
    });
  }
  add(1.5, () => {
    const cx = X(0, hF), R = HR;
    plate(g, () => { g.beginPath(); g.moveTo(cx - R, HEADY + R * 0.85); g.lineTo(cx - R, HEADY - R * 0.1); g.bezierCurveTo(cx - R, HEADY - R * 1.25, cx + R, HEADY - R * 1.25, cx + R, HEADY - R * 0.1); g.lineTo(cx + R, HEADY + R * 0.85); g.quadraticCurveTo(cx, HEADY + R * 1.15, cx - R, HEADY + R * 0.85); g.closePath(); }, C.c, HEADY - R, HEADY + R, cx - R * 0.45, HEADY - R * 0.55, R * 0.18, R * 0.32);
    // гребень-ребро по куполу (виден с любой стороны)
    g.beginPath(); g.moveTo(cx + tx(R * 0.6), HEADY - R * 0.6); g.quadraticCurveTo(cx, HEADY - R * 1.15, cx - tx(R * 0.9), HEADY - R * 0.5); trimLine(g, C.trim, 0.8);
    // забрало: лицевая пластина на передней стороне шлема
    const v = vis(0);
    if (v > -0.1) { const fx = cx + tx(R * 0.62), sc = Math.max(0.18, v); g.save(); g.translate(fx, 0); g.scale(sc, 1);
      plate(g, () => { g.beginPath(); g.moveTo(-R * 0.74, HEADY - R * 0.32); g.quadraticCurveTo(0, HEADY - R * 0.5, R * 0.74, HEADY - R * 0.32); g.lineTo(R * 0.62, HEADY + R * 0.85); g.quadraticCurveTo(0, HEADY + R * 1.05, -R * 0.62, HEADY + R * 0.85); g.closePath(); }, sh(C.c, 0.06), HEADY - R * 0.5, HEADY + R, null);
      g.fillStyle = '#0e0c12'; g.beginPath(); g.roundRect(-R * 0.6, HEADY - R * 0.12, R * 1.2, R * 0.22, R * 0.1); g.fill();
      const p = 0.7 + 0.3 * Math.sin(t * 5); g.globalAlpha = p; g.fillStyle = C.eyes; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * R * 0.26, HEADY - R * 0.01, R * 0.13, R * 0.06, 0, 0, TAU); g.fill(); } g.globalAlpha = 1;
      g.fillStyle = '#0e0c12'; for (const xx of [-0.3, -0.1, 0.1, 0.3]) { g.beginPath(); g.roundRect(R * xx - R * 0.04, HEADY + R * 0.28, R * 0.08, R * 0.34, 0.2); g.fill(); }
      g.beginPath(); g.moveTo(-R * 0.74, HEADY - R * 0.32); g.quadraticCurveTo(0, HEADY - R * 0.5, R * 0.74, HEADY - R * 0.32); trimLine(g, C.trim, 0.9 / sc > 2 ? 1.8 : 0.9 / Math.max(sc, 0.5));
      g.restore(); }
    // затылок: пластины назатыльника
    const vb = vis(Math.PI);
    if (vb > 0.1) { g.save(); g.translate(cx - tx(R * 0.5), 0); g.scale(vb, 1); for (let i = 0; i < 3; i++) { g.beginPath(); g.roundRect(-R * 0.8 + i * 0.3, HEADY + R * 0.2 + i * 1.3, R * 1.6 - i * 0.6, 1.4, 0.6); paint(g, sh(C.c, -0.05 * i), 0.5); } g.restore(); }
  });

  items.sort((p, q) => p.z - q.z);
  for (const it of items) it.fn();
  g.restore();
}

/** 8 сторон: имя → угол и зеркало. */
export const DIRS = [['лицом', 0, 1], ['вполоборота вправо', 45, 1], ['вправо', 90, 1], ['спиной вправо', 135, 1], ['спиной', 180, 1], ['спиной влево', 135, -1], ['влево', 90, -1], ['вполоборота влево', 45, -1]];
