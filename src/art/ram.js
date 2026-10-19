// v126 (эскиз): боевой баран — редкий скакун за жетоны. Та же объёмная кукла, что конь (horse.js): части на местах в теле
// (l — вбок, f — вперёд, y — вниз, земля 0), поворот на угол стороны, рисуется по глубине. Ниже и шире коня: в холке ≈ 0,8 роста героя.
// Тело — густая шерсть «облаком» (силуэт из кругов, завитки внутри), короткие толстые ноги с раздвоенными копытами,
// тяжёлая горбоносая голова, большие закрученные рога спиралью с кольцами роста, налобник. Седло с попоной и стременами.
import { sh } from './gear.js';
const TAU = Math.PI * 2, LW = 0.8, DK = 0.3, HS = 1.0;
const VIEW_A = { front: 0, fs: 45, side: 90, bs: 135, back: 180 };
const ink = c => sh(c, -0.6);
export const RAM_COATS = {
  snow: { name: 'Белогорский', body: '#ece2cc', wool: '#f6efe0', dark: '#5a4634', horn: '#c8a86a', hornTip: '#8a6a3a', cloth: '#8a2a32', trim: '#e0b840', plate: '#b8bcc8' },
  night: { name: 'Чёрный утёс', body: '#3c3640', wool: '#4e4854', dark: '#201c24', horn: '#e0d6c0', hornTip: '#a89c86', cloth: '#2f5a9a', trim: '#e0b840', plate: '#b8bcc8' },
  ember: { name: 'Рыжий гром', body: '#b06a3a', wool: '#c8824e', dark: '#3a2418', horn: '#4a3828', hornTip: '#2a1c12', cloth: '#2f6a3a', trim: '#e0b840', plate: '#c8a850' },
};
const SADDLE = '#7a4622';

function paint(g, col, lw = LW, y0, y1) {
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(col, 0.18)); gr.addColorStop(1, sh(col, -0.2)); g.fillStyle = gr; } else g.fillStyle = col;
  g.fill(); if (lw) { g.strokeStyle = ink(col); g.lineWidth = lw; g.stroke(); }
}
function cap(g, x1, y1, x2, y2, w1, w2, col) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  const path = (k) => { g.beginPath(); g.moveTo(x1 + nx * w1 * k, y1 + ny * w1 * k); g.lineTo(x2 + nx * w2 * k, y2 + ny * w2 * k); g.arc(x2, y2, w2 * k, a + Math.PI / 2, a - Math.PI / 2, true); g.lineTo(x1 - nx * w1 * k, y1 - ny * w1 * k); g.arc(x1, y1, w1 * k, a - Math.PI / 2, a + Math.PI / 2, true); g.closePath(); };
  return { stroke: () => { path(1); g.lineWidth = LW * 2; g.strokeStyle = ink(col); g.stroke(); }, fill: (top, bot) => { path(1); const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, sh(col, 0.16)); gr.addColorStop(1, sh(col, -0.18)); g.fillStyle = gr; g.fill(); } };
}

/** Баран. Те же договорённости, что у horse(): (0,0) — на земле, единицы куклы; pose: walk, t, rider, riderFn(seat, x), bare. Возвращает высоту седла. */
export function ram(g, coat, view, pose = {}) {
  const C = RAM_COATS[coat] || RAM_COATS.snow, a = (VIEW_A[view] ?? 90) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), Aca = Math.abs(ca), Asa = Math.abs(sa);
  const X = (l, f) => l * ca + f * sa, Zd = (l, f) => -l * sa + f * ca, Y = (l, f, y) => y + Zd(l, f) * DK;
  const P = (l, f, y) => [X(l, f), Y(l, f, y)];
  const t = pose.t || 0, walk = pose.walk >= 0 ? pose.walk : -1, ph = walk >= 0 ? walk * TAU : 0;
  const bob = walk >= 0 ? -Math.abs(Math.sin(ph)) * 1.4 : Math.sin(t * 1.4) * 0.25;
  const items = [], add = (z, fn) => items.push({ z, fn });
  const SEAT = -31 + bob;
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.scale(HS, HS);

  // ---------------- ноги: короткие, толстые, в шерсти до колена; копыто раздвоенное
  const LEGS = [[-5.2, 8, 0], [5.2, 8, 0.5], [-5.2, -8.5, 0.5], [5.2, -8.5, 0]];
  for (const [l, f0, o] of LEGS) {
    const w = ph + o * TAU, sw = walk >= 0 ? Math.sin(w) * 4.2 : 0, lift = walk >= 0 ? Math.max(0, Math.cos(w)) * 3 : 0;
    const front = f0 > 0, z = Zd(l, f0);
    add(z - 2, () => {
      const top = P(l, f0, -17 + bob), kn = P(l, f0 + sw * 0.4 + (front ? 0.4 : -1), -8.5 - lift * 0.6), hf = P(l, f0 + sw, -1.4 - lift);
      const near = z >= 0, col = near ? C.dark : sh(C.dark, -0.12), wool = near ? C.body : sh(C.body, -0.14);
      const up = cap(g, top[0], top[1], kn[0], kn[1], 3.8, 2.6, wool), dn = cap(g, kn[0], kn[1], hf[0], hf[1], 2.1, 1.9, col);
      up.stroke(); dn.stroke(); up.fill(top[1], kn[1]); dn.fill(kn[1], hf[1]);
      // поножи: пластина на голени со вставкой
      { const a1 = Math.atan2(hf[1] - kn[1], hf[0] - kn[0]), nx = -Math.sin(a1), ny = Math.cos(a1), k0 = [kn[0] + (hf[0] - kn[0]) * 0.18, kn[1] + (hf[1] - kn[1]) * 0.18], k1 = [kn[0] + (hf[0] - kn[0]) * 0.8, kn[1] + (hf[1] - kn[1]) * 0.8], w = 2.3;
        g.beginPath(); g.moveTo(k0[0] + nx * w, k0[1] + ny * w); g.lineTo(k1[0] + nx * w * 0.9, k1[1] + ny * w * 0.9); g.arc(k1[0], k1[1], w * 0.9, a1 + Math.PI / 2, a1 - Math.PI / 2, true); g.lineTo(k0[0] - nx * w, k0[1] - ny * w); g.closePath(); paint(g, near ? C.plate : sh(C.plate, -0.14), 0.6, k0[1], k1[1]);
        g.fillStyle = C.trim; g.beginPath(); g.arc((k0[0] + k1[0]) / 2, (k0[1] + k1[1]) / 2, 0.55, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(k0[0] - 0.6, k0[1] + 1.4, 0.5, 1.4, a1 + Math.PI / 2, 0, TAU); g.fill(); }
      // раздвоенное копыто
      g.beginPath(); g.roundRect(hf[0] - 2.5, hf[1] - 0.2, 5, 2.4, 1); paint(g, '#2e2630', 0.6, hf[1], hf[1] + 2.2);
      g.strokeStyle = sh('#2e2630', -0.5); g.lineWidth = 0.5; g.beginPath(); g.moveTo(hf[0], hf[1] + 0.2); g.lineTo(hf[0], hf[1] + 2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(hf[0] - 1.3, hf[1] + 0.5, 0.8, 0.4, 0, 0, TAU); g.fill();
    });
  }

  // ---------------- хвост: короткий пушистый
  add(Zd(0, -14) - 0.5, () => {
    const [tx, ty] = P(0, -14.8, -24 + bob); g.beginPath(); g.ellipse(tx, ty + 1.5, 2.2, 3, 0.2, 0, TAU); paint(g, C.wool, LW, ty - 2, ty + 4);
  });

  // ---------------- тело: шерсть облаком — круги по контуру одним силуэтом, внутри завитки
  add(0, () => {
    const cy = -21 + bob;
    // контур из «клубов»: [l, f, y, r]
    const K = [];
    for (let i = 0; i < 8; i++) { const f = -12 + i * 3.4; K.push([0, f, cy - 7.5 + Math.sin(i * 1.7) * 0.6, 3.6 + (i % 2) * 0.5]); }   // спина
    for (let i = 0; i < 7; i++) { const f = -11 + i * 3.7; K.push([0, f, cy + 6.5 + Math.cos(i * 1.3) * 0.5, 3.2 + (i % 2) * 0.4]); }   // живот
    for (const f of [-14, 13.5]) for (const y of [-4, 0, 4]) K.push([0, f, cy + y, 3.4]);   // зад и грудь
    for (const l of [-6.5, 6.5]) for (let i = 0; i < 5; i++) K.push([l, -9 + i * 4.6, cy - 1 + (i % 2) * 1.2, 3.8]);   // бока
    const E = K.map(([l, f, y, r]) => { const [x, yy] = P(l, f, y); return [x, yy, r * (0.75 + 0.25 * Asa) + Math.abs(r * ca) * 0.25, r]; });
    const core = [[0, -8, cy, 7, 8.6], [0, 0, cy + 0.3, 7.2, 8.8], [0, 8, cy, 7, 8.6]].map(([l, f, y, rf, ry]) => { const [x, yy] = P(l, f, y); return [x, yy, Math.sqrt((rf * sa) ** 2 + (7.6 * ca) ** 2), ry + Math.abs(rf * ca) * DK]; });
    const silhouette = () => { g.beginPath(); for (const [x, y, rx, ry] of core) { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, TAU); } for (const [x, y, rx, ry] of E) { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, TAU); } };
    silhouette(); g.lineWidth = LW * 2; g.strokeStyle = ink(C.body); g.stroke();
    const top = cy - 12, bot = cy + 10;
    silhouette(); { const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, sh(C.wool, 0.12)); gr.addColorStop(0.55, C.body); gr.addColorStop(1, sh(C.body, -0.24)); g.fillStyle = gr; g.fill(); }
    // завитки шерсти: мягкие дуги, тёмным тоном, редкие
    g.save(); silhouette(); g.clip(); g.strokeStyle = sh(C.body, -0.22); g.lineWidth = 0.6;
    for (let i = 0; i < 14; i++) { const f = -12 + (i % 7) * 4.1, yy = cy - 5 + Math.floor(i / 7) * 7 + (i % 2) * 2, l = Asa > 0.7 ? -7 * Math.sign(sa) : (i % 2 ? 3.5 : -3.5), [x, y] = P(l, f, yy); g.beginPath(); g.arc(x, y, 1.7, Math.PI * 0.9, Math.PI * 1.9); g.stroke(); }
    g.restore();
    // блик по спине и тень брюха
    const [bx, by] = P(0, 1, -29 + bob); g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(bx - 2, by, Math.max(2.5, 9 * Asa + 3 * Aca), 1.8, -0.12, 0, TAU); g.fill();
    const [ux, uy] = P(0, 0, -14 + bob); g.fillStyle = 'rgba(20,10,4,.14)'; g.beginPath(); g.ellipse(ux + 1, uy, 11 * Asa + 5 * Aca, 2.4, 0, 0, TAU); g.fill();
  });

  // ---------------- попона, седло, стремена
  if (!pose.bare) add(0.3, () => {
    const [cx, cy] = P(0, -0.5, -29.6 + bob), hw = Math.sqrt((6.8 * sa) ** 2 + (8.6 * ca) ** 2), drop = 8.5 * Asa + 3.2 * Aca;
    g.beginPath(); g.moveTo(cx - hw, cy - 1); g.quadraticCurveTo(cx, cy - 3.6, cx + hw, cy - 1); g.lineTo(cx + hw * 0.92, cy + drop); g.quadraticCurveTo(cx, cy + drop + 1.8, cx - hw * 0.92, cy + drop); g.closePath();
    paint(g, C.cloth, LW, cy - 3, cy + drop);
    g.beginPath(); g.moveTo(cx + hw * 0.92, cy + drop - 1); g.quadraticCurveTo(cx, cy + drop + 0.8, cx - hw * 0.92, cy + drop - 1); g.strokeStyle = ink(C.trim); g.lineWidth = 1.8; g.stroke(); g.strokeStyle = C.trim; g.lineWidth = 1.1; g.stroke();
    // герб на попоне — круг с рогом
    if (Asa > 0.5) { const [ex, ey] = P(7 * Math.sign(sa || 1), -0.5, -24 + bob); g.beginPath(); g.arc(ex, ey, 2.2, 0, TAU); paint(g, C.trim, 0.6); g.strokeStyle = ink(C.trim); g.lineWidth = 0.6; g.beginPath(); g.arc(ex + 0.3, ey, 1.1, Math.PI * 0.2, Math.PI * 1.6); g.stroke(); }
    const sw = Math.sqrt((5.2 * sa) ** 2 + (5.8 * ca) ** 2);
    g.beginPath(); g.ellipse(cx, cy - 1.4, sw, 2.7, 0, 0, TAU); paint(g, SADDLE, LW, cy - 4, cy + 1);
    const [px, py] = P(0, 4.8, -33 + bob), [qx, qy] = P(0, -5.2, -33.6 + bob);
    for (const [x, y, r] of [[qx, qy, 2.5], [px, py, 1.8]]) { g.beginPath(); g.ellipse(x, y, r * (0.6 + 0.4 * Aca) + 0.6, r, 0, 0, TAU); paint(g, sh(SADDLE, 0.08), LW, y - r, y + r); }
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(cx - sw * 0.35, cy - 2.4, sw * 0.3, 0.7, -0.2, 0, TAU); g.fill();
    if (!pose.rider) for (const l of [-8.4, 8.4]) { if (Asa > 0.4 && Zd(l, 0) < -1) continue; const [x0, y0] = P(l * 0.9, 0, -29 + bob), [x1, y1] = P(l, 0.4, -18 + bob); g.strokeStyle = '#3a2412'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1 - 1.5); g.stroke(); g.beginPath(); g.ellipse(x1, y1, 1.4, 1.6, 0, 0, TAU); g.strokeStyle = '#8a8e96'; g.lineWidth = 0.8; g.stroke(); }
  });

  // ---------------- голова: короткая толстая шея, горбоносая голова, уши, налобник; рога — спиралью с кольцами
  const nod = walk >= 0 ? Math.sin(ph * 2) * 0.9 : Math.sin(t * 1.4 + 1) * 0.4;
  const HZ = Zd(0, 15);
  const horn = (side) => {   // side: −1 левый, +1 правый; спираль трубкой в плоскости (f, y) у виска: от макушки назад, вниз за ухо и вперёд к щеке; уходит вбок с ростом угла
    const pts = []; const N = 36, cf = 13.2, cy0 = -35 + bob + nod;
    for (let i = 0; i <= N; i++) { const q = i / N, th = -1.25 + q * TAU * 1.38; const r = 6.4 - q * 4.3; const f = cf + Math.sin(th) * r * 1.02, y = cy0 - Math.cos(th) * r * 0.92, l = side * (3.3 + q * 4.2 + Math.sin(q * Math.PI) * 1.2); pts.push([...P(l, f, y), 2.3 - q * 1.7]); }
    return pts;
  };
  const drawHorn = (pts) => {
    const seg = (k, extra, col) => { for (let i = 1; i < pts.length; i++) { const [x0, y0, w0] = pts[i - 1], [x1, y1, w1] = pts[i]; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineWidth = Math.max(0.4, (w0 + w1) * k + extra); g.strokeStyle = col(i / pts.length); g.stroke(); } };
    seg(1, LW * 1.6, () => ink(C.horn));
    seg(1, 0, q => sh(C.horn, 0.14 - q * 0.3));
    // кольца роста поперёк
    g.strokeStyle = sh(C.horn, -0.42); g.lineWidth = 0.5;
    for (let i = 2; i < pts.length - 6; i += 2) { const [x0, y0] = pts[i - 1], [x1, y1, w] = pts[i]; const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a); g.beginPath(); g.moveTo(x1 + nx * w * 0.9, y1 + ny * w * 0.9); g.lineTo(x1 - nx * w * 0.9, y1 - ny * w * 0.9); g.stroke(); }
    // тёмный кончик и блик у основания
    const [tx, ty] = pts[pts.length - 1]; g.fillStyle = C.hornTip; g.beginPath(); g.arc(tx, ty, 0.75, 0, TAU); g.fill();
    const [hx, hy, hw] = pts[2]; g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(hx - 0.6, hy - 0.8, hw * 0.5, hw * 0.28, -0.4, 0, TAU); g.fill();
  };
  const farSide = sa >= 0 ? -1 : 1;   // дальний от зрителя рог — за головой
  if (Asa > 0.15) add(HZ - 1.5, () => drawHorn(horn(farSide)));
  add(HZ, () => {
    const nb = P(0, 10.5, -27 + bob), nt = P(0, 15.6, -36.4 + bob + nod), sk = P(0, 18.6, -38.6 + bob + nod), mz = P(0, 26.6, -32.6 + bob + nod);
    const neck = cap(g, nb[0], nb[1], nt[0], nt[1], 6.2, 4.6, C.body), head = cap(g, sk[0], sk[1], mz[0], mz[1], 4.6, 3.1, C.dark);
    neck.stroke(); head.stroke(); neck.fill(-38, -24); head.fill(-40, -28);
    // ошейник-горжет: три пластины вокруг шеи со вставками
    if (!pose.bare) for (let i = 0; i < 2; i++) { const q = 0.18 + i * 0.4, cxn = nb[0] + (nt[0] - nb[0]) * q, cyn = nb[1] + (nt[1] - nb[1]) * q, w = (6.4 - q * 1.8), wh = w * (0.55 + 0.45 * Aca) + 0.5, h = 3.2 - i * 0.6;
      g.beginPath(); g.ellipse(cxn, cyn, wh + 1, h + Math.abs(w * sa) * 0.4, 0, 0, TAU); paint(g, C.plate, 0.8, cyn - h, cyn + h);
      g.strokeStyle = ink(C.trim); g.lineWidth = 1.3; g.beginPath(); g.ellipse(cxn, cyn + 0.6, wh + 0.6, (h + Math.abs(w * sa) * 0.4) * 0.6, 0, Math.PI * 0.08, Math.PI * 0.92); g.stroke(); g.strokeStyle = C.trim; g.lineWidth = 0.7; g.stroke();
      if (!i) { g.beginPath(); g.arc(cxn, cyn - 0.3, 1.2, 0, TAU); paint(g, '#4a8ad0', 0.6); g.fillStyle = 'rgba(255,255,255,.65)'; g.beginPath(); g.arc(cxn - 0.4, cyn - 0.7, 0.35, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(cxn - wh * 0.5, cyn - h * 0.5, wh * 0.3, 0.7, -0.3, 0, TAU); g.fill(); }
    // горбинка носа — выпуклость сверху головы
    { const h1 = P(0, 20.8, -41.4 + bob + nod), h2 = P(0, 26.2, -35.9 + bob + nod); g.beginPath(); g.moveTo(sk[0], sk[1] - 3.8); g.quadraticCurveTo(h1[0], h1[1], h2[0], h2[1]); g.lineTo(mz[0], mz[1] - 2.6); g.quadraticCurveTo(h1[0] + 0.5, h1[1] + 2, sk[0], sk[1] - 1.6); g.closePath(); g.fillStyle = sh(C.dark, 0.1); g.fill(); }
    // шерсть на лбу — клубы, закрывают стык шеи и головы
    for (const [l, f, y, r] of [[-2.2, 16.4, -40.8, 2.4], [2.2, 16.4, -40.8, 2.4], [0, 15.4, -41.8, 2.6], [0, 18.6, -42.4, 2.1]]) { const [x, yy] = P(l, f, y + bob + nod); g.beginPath(); g.arc(x, yy, r, 0, TAU); paint(g, C.wool, LW * 0.9, yy - r, yy + r); }
    // налобник — металлическая пластина с заклёпками
    if (!pose.bare && ca > -0.2) { const p1 = P(0, 19.8, -42 + bob + nod), p2 = P(0, 24.2, -37 + bob + nod); const w = 1.6 * (0.5 + 0.5 * Aca) + 0.6; const an = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]), nx = -Math.sin(an) * w, ny = Math.cos(an) * w; g.beginPath(); g.moveTo(p1[0] + nx, p1[1] + ny); g.lineTo(p2[0] + nx * 0.7, p2[1] + ny * 0.7); g.lineTo(p2[0] - nx * 0.7, p2[1] - ny * 0.7); g.lineTo(p1[0] - nx, p1[1] - ny); g.closePath(); paint(g, C.plate, 0.6, p1[1], p2[1]); g.fillStyle = C.trim; for (const q of [0.25, 0.75]) { g.beginPath(); g.arc(p1[0] + (p2[0] - p1[0]) * q, p1[1] + (p2[1] - p1[1]) * q, 0.45, 0, TAU); g.fill(); } }
    // морда и ноздри
    g.beginPath(); g.ellipse(mz[0], mz[1] + 0.3, 3 * (0.6 + 0.4 * Asa) + 0.8, 2.6, 0, 0, TAU); paint(g, sh(C.dark, -0.08), LW, mz[1] - 2.4, mz[1] + 3);
    if (ca > -0.3) for (const l of (Asa > 0.7 ? [0] : [-1.3, 1.3])) { const [nx, ny] = P(l, 28, -32.8 + bob + nod); g.fillStyle = sh(C.dark, -0.5); g.beginPath(); g.ellipse(nx, ny, 0.7, 0.9, 0, 0, TAU); g.fill(); }
    // уши — короткие, вбок под рогами
    for (const l of [-3.4, 3.4]) { if (Asa > 0.8 && Zd(l, 0) < 0) continue; const [ex, ey] = P(l * 1.25, 17.6, -39.4 + bob + nod); g.beginPath(); g.ellipse(ex + Math.sign(l) * 1.4 * Aca, ey + 0.4, 1.9, 1.1, Math.sign(l) * 0.5 * Aca, 0, TAU); paint(g, C.dark, LW * 0.8, ey - 1, ey + 1.5); }
    // глаза — суровые, под тяжёлым лбом
    for (const l of [-2.9, 2.9]) { const vis = -Math.sign(l) * sa; if (ca < -0.5 || (Asa > 0.5 && vis < 0.2)) continue; const [ex, ey] = P(l * (0.55 + 0.45 * Asa), 22.4, -38.4 + bob + nod); g.fillStyle = '#e8c860'; g.beginPath(); g.ellipse(ex, ey, 1.05 * (0.5 + 0.5 * Math.max(Asa, Aca * 0.8)), 0.95, 0, 0, TAU); g.fill(); g.fillStyle = '#1c1410'; g.beginPath(); g.ellipse(ex, ey, 0.55 * (0.5 + 0.5 * Math.max(Asa, Aca * 0.8)), 0.8, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 0.3, ey - 0.4, 0.26, 0, TAU); g.fill(); g.strokeStyle = ink(C.dark); g.lineWidth = 0.7; g.beginPath(); g.moveTo(ex - 1.5, ey - 1.2); g.lineTo(ex + 1.3, ey - 0.9); g.stroke(); }
    // уздечка и поводья
    if (!pose.bare) { g.strokeStyle = '#4a2c16'; g.lineWidth = 0.8; const b2 = P(0, 25.4, -31.6 + bob + nod), b3 = P(0, 24, -35.8 + bob + nod), b4 = P(0, 27.8, -34.6 + bob + nod); g.beginPath(); g.moveTo(b3[0], b3[1]); g.lineTo(b4[0], b4[1]); g.stroke(); g.fillStyle = '#e0b840'; g.beginPath(); g.arc(b2[0], b2[1], 0.6, 0, TAU); g.fill();
      const hand = pose.rider ? P(0, 5.5, -36 + bob) : P(0, 11.6, -29 + bob); g.strokeStyle = '#3a2210'; g.lineWidth = 0.6; for (const d of [-0.6, 0.6]) { g.beginPath(); g.moveTo(b2[0] + d, b2[1]); g.quadraticCurveTo((b2[0] + hand[0]) / 2 + d, Math.max(b2[1], hand[1]) + 3, hand[0] + d, hand[1]); g.stroke(); } }
  });
  add(HZ + 1.5, () => drawHorn(horn(-farSide)));
  if (Asa <= 0.15 && ca > 0) add(HZ - 1.5, () => drawHorn(horn(farSide)));   // спереди оба рога видны по бокам
  if (Asa <= 0.15 && ca < 0) add(HZ + 1.6, () => drawHorn(horn(farSide)));

  if (pose.riderFn) add(0.5, () => { g.save(); g.scale(1 / HS, 1 / HS); pose.riderFn(SEAT * HS, X(0, -1) * HS); g.restore(); });
  items.sort((p, q) => p.z - q.z); for (const it of items) it.fn();
  g.restore();
  return SEAT * HS;
}

/** Тень барана на земле. */
export function ramShadow(g, view) {
  const a = (VIEW_A[view] ?? 90) * Math.PI / 180, rx = Math.sqrt((18 * Math.sin(a)) ** 2 + (9 * Math.cos(a)) ** 2) * HS;
  g.fillStyle = 'rgba(0,0,0,.26)'; g.beginPath(); g.ellipse(1.5, 1, rx, 4.5 + 3 * Math.abs(Math.cos(a)), 0, 0, TAU); g.fill();
}
