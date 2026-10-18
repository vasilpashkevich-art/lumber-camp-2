// v121 (эскиз): ездовой конь в мультяшном стиле — объёмная кукла, как люди (toon.js).
// Части на своих местах в теле: l — вбок (к левому боку), f — вперёд, y — вниз (земля 0, рост героя ≈ 41).
// Поворот на угол стороны a: x = l·cos a + f·sin a, глубина z = −l·sin a + f·cos a; ближнее к нам рисуется позже
// и чуть ниже (вид сверху-сбоку: DK). Тело — три шара одним силуэтом (сначала обводки, потом заливки), шея, голова,
// грива, хвост, четыре ноги с рысью. Седло с попоной, стремена, уздечка и поводья. Масти — COATS.
import { sh } from './gear.js';
const TAU = Math.PI * 2, LW = 0.8, DK = 0.3, HS = 1.1;   // HS — конь чуть крупнее: в холке ≈ 0,9 роста героя
const VIEW_A = { front: 0, fs: 45, side: 90, bs: 135, back: 180 };
const ink = c => sh(c, -0.6);
export const COATS = {
  bay: { name: 'Гнедой', body: '#a0602e', dark: '#2c1c14', mane: '#2a1a12', muzzle: '#6a3a1e', sock: '#2c1c14', blaze: true, cloth: '#2f5a9a', trim: '#e0b840' },
  black: { name: 'Вороной', body: '#34303a', dark: '#1c1a22', mane: '#16141c', muzzle: '#46404c', sock: '#1c1a22', blaze: false, cloth: '#9a2a32', trim: '#e0b840' },
  grey: { name: 'Серый в яблоках', body: '#cfcfca', dark: '#8a8a88', mane: '#6e6e72', muzzle: '#9a9a98', sock: '#9a9a98', dapple: '#aeaeaa', blaze: false, cloth: '#3a7a3a', trim: '#e0b840' },
};
const SADDLE = '#7a4622';

function paint(g, col, lw = LW, y0, y1) {
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(col, 0.18)); gr.addColorStop(1, sh(col, -0.2)); g.fillStyle = gr; } else g.fillStyle = col;
  g.fill(); if (lw) { g.strokeStyle = ink(col); g.lineWidth = lw; g.stroke(); }
}
function cap(g, x1, y1, x2, y2, w1, w2, col) {   // капсула с сужением: обводка толще заливки
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  const path = (k) => { g.beginPath(); g.moveTo(x1 + nx * w1 * k, y1 + ny * w1 * k); g.lineTo(x2 + nx * w2 * k, y2 + ny * w2 * k); g.arc(x2, y2, w2 * k, a + Math.PI / 2, a - Math.PI / 2, true); g.lineTo(x1 - nx * w1 * k, y1 - ny * w1 * k); g.arc(x1, y1, w1 * k, a - Math.PI / 2, a + Math.PI / 2, true); g.closePath(); };
  return { stroke: () => { path(1); g.lineWidth = LW * 2; g.strokeStyle = ink(col); g.stroke(); }, fill: (top, bot) => { path(1); const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, sh(col, 0.16)); gr.addColorStop(1, sh(col, -0.18)); g.fillStyle = gr; g.fill(); } };
}

/**
 * Конь. view — сторона (front/fs/side/bs/back; влево — зеркально снаружи), pose: { walk: 0…1 или −1, t, rider: true — в седле кто-то есть }.
 * Вызывающий ставит (0,0) в точку на земле; рисует в единицах куклы (как toon.js после RIG.K).
 * Возвращает высоту седла (y < 0). Всадник — pose.riderFn(seat, x): рисуется в нужном месте по глубине.
 */
export function horse(g, coat, view, pose = {}) {
  const C = COATS[coat] || COATS.bay, a = (VIEW_A[view] ?? 90) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), Aca = Math.abs(ca), Asa = Math.abs(sa);
  const X = (l, f) => l * ca + f * sa, Zd = (l, f) => -l * sa + f * ca, Y = (l, f, y) => y + Zd(l, f) * DK;
  const P = (l, f, y) => [X(l, f), Y(l, f, y)];
  const t = pose.t || 0, walk = pose.walk >= 0 ? pose.walk : -1, ph = walk >= 0 ? walk * TAU : 0;
  const bob = walk >= 0 ? -Math.abs(Math.sin(ph)) * 1.1 : Math.sin(t * 1.6) * 0.25;
  const breathe = walk >= 0 ? 0 : Math.sin(t * 1.6) * 0.3;
  const items = [], add = (z, fn) => items.push({ z, fn });
  const SEAT = -33 + bob;
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.scale(HS, HS);

  // ---------------- ноги: рысь — диагональные пары вместе
  const LEGS = [[-4.4, 9.5, 0], [4.4, 9.5, 0.5], [-4.4, -9.5, 0.5], [4.4, -9.5, 0]];   // [l, f, фаза]
  for (const [l, f0, o] of LEGS) {
    const w = ph + o * TAU, sw = walk >= 0 ? Math.sin(w) * 5.5 : 0, lift = walk >= 0 ? Math.max(0, Math.cos(w)) * 3.4 : 0;
    const front = f0 > 0, z = Zd(l, f0);
    add(z - 2, () => {
      const top = P(l, f0, -21 + bob), kn = P(l, f0 + sw * 0.45 + (front ? 0.6 : -1.2), -10.5 - lift * 0.7), hf = P(l, f0 + sw, -1.6 - lift);
      const near = z >= 0, col = near ? C.body : sh(C.body, -0.14), low = near ? C.sock : sh(C.sock, -0.1);
      const up = cap(g, top[0], top[1], kn[0], kn[1], front ? 3.1 : 3.6, 2.1, col), dn = cap(g, kn[0], kn[1], hf[0], hf[1], 1.9, 1.7, low);
      up.stroke(); dn.stroke(); up.fill(top[1], kn[1]); dn.fill(kn[1], hf[1]);
      // путо (мохнатая щётка над копытом) и копыто
      g.beginPath(); g.ellipse(hf[0], hf[1] - 0.4, 2.4, 1.4, 0, 0, TAU); paint(g, sh(low, -0.08), 0.5);
      g.beginPath(); g.roundRect(hf[0] - 2.3, hf[1] - 0.1, 4.6, 2.2, 0.9); paint(g, '#3a3036', 0.6, hf[1], hf[1] + 2);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(hf[0] - 1.2, hf[1] + 0.5, 0.9, 0.4, 0, 0, TAU); g.fill();
    });
  }

  // ---------------- хвост (за крупом)
  add(Zd(0, -16) - 0.5, () => {
    const sway = pose.tail != null ? pose.tail * 2.8 : walk >= 0 ? Math.sin(ph * 2) * 1.6 : Math.sin(t * 1.3) * 1;   // v122: tail — взмах хвостом
    const r0 = P(0, -15.5, -28 + bob), r1 = P(sway * 0.4, -20, -20 + bob), r2 = P(sway, -19.5, -10 + bob);
    g.beginPath(); g.moveTo(r0[0], r0[1]); g.quadraticCurveTo(r1[0], r1[1], r2[0], r2[1]);
    g.lineCap = 'round'; g.strokeStyle = ink(C.mane); g.lineWidth = 6.6; g.stroke(); g.strokeStyle = C.mane; g.lineWidth = 5; g.stroke();
    g.strokeStyle = sh(C.mane, 0.25); g.lineWidth = 0.5; for (const d of [-1.2, 0, 1.2]) { g.beginPath(); g.moveTo(r0[0] + d * 0.5, r0[1] + 1); g.quadraticCurveTo(r1[0] + d, r1[1], r2[0] + d * 0.8, r2[1] - 1); g.stroke(); }
  });

  // ---------------- тело: три шара одним силуэтом
  const BODY = [[0, -10, -24.5, 9, 9.2], [0, 0, -23.6, 8.2, 8.6], [0, 10, -24.2, 8.4, 8.8]];   // [l, f, y, r вдоль, r высота]
  add(0, () => {
    const E = BODY.map(([l, f, y, rf, ry]) => { const [x, yy] = P(l, f, y + bob + breathe * 0.3); return [x, yy, Math.sqrt((rf * sa) ** 2 + (7.2 * ca) ** 2), ry + Math.abs(rf * ca) * DK]; });
    for (const [x, y, rx, ry] of E) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.lineWidth = LW * 2; g.strokeStyle = ink(C.body); g.stroke(); }
    const top = -34, bot = -14;
    for (const [x, y, rx, ry] of E) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, sh(C.body, 0.2)); gr.addColorStop(0.6, C.body); gr.addColorStop(1, sh(C.body, -0.22)); g.fillStyle = gr; g.fill(); }
    if (C.dapple) { g.save(); g.beginPath(); for (const [x, y, rx, ry] of E) { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, TAU); } g.clip(); g.strokeStyle = C.dapple; g.lineWidth = 0.7; for (let i = 0; i < 16; i++) { const f = -12 + (i % 6) * 4.6, yy = -29 + Math.floor(i / 6) * 4.4 + (i % 2) * 1.6, l = Asa > 0.7 ? -7 * Math.sign(sa) : (i % 2 ? 3 : -3), [x, y] = P(l, f, yy + bob); g.beginPath(); g.arc(x, y, 1.5, 0, TAU); g.stroke(); } g.restore(); }
    // блик по спине слева сверху
    const [bx, by] = P(0, 2, -30 + bob); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(bx - 2, by, Math.max(2, 9 * Asa + 3 * Aca), 1.6, -0.12, 0, TAU); g.fill();
    // тень брюха справа снизу
    const [ux, uy] = P(0, 0, -16.5 + bob); g.fillStyle = 'rgba(20,10,4,.14)'; g.beginPath(); g.ellipse(ux + 1, uy, 12 * Asa + 5 * Aca, 2.2, 0, 0, TAU); g.fill();
  });

  // ---------------- попона, седло, стремена (у неосёдланного коня в загоне — нет)
  if (!pose.bare) add(0.3, () => {
    const [cx, cy] = P(0, -0.5, -31.6 + bob), hw = Math.sqrt((6.6 * sa) ** 2 + (8.2 * ca) ** 2), drop = 7.5 * Asa + 3 * Aca;
    // попона: сверху по спине и вниз по боку
    g.beginPath(); g.moveTo(cx - hw, cy - 1); g.quadraticCurveTo(cx, cy - 3.4, cx + hw, cy - 1); g.lineTo(cx + hw * 0.92, cy + drop); g.quadraticCurveTo(cx, cy + drop + 1.6, cx - hw * 0.92, cy + drop); g.closePath();
    paint(g, C.cloth, LW, cy - 3, cy + drop);
    g.beginPath(); g.moveTo(cx + hw * 0.92, cy + drop - 0.9); g.quadraticCurveTo(cx, cy + drop + 0.7, cx - hw * 0.92, cy + drop - 0.9); g.strokeStyle = ink(C.trim); g.lineWidth = 1.7; g.stroke(); g.strokeStyle = C.trim; g.lineWidth = 1.1; g.stroke();
    // седло
    const sw = Math.sqrt((5 * sa) ** 2 + (5.6 * ca) ** 2);
    g.beginPath(); g.ellipse(cx, cy - 1.4, sw, 2.6, 0, 0, TAU); paint(g, SADDLE, LW, cy - 4, cy + 1);
    const [px, py] = P(0, 4.6, -35 + bob), [qx, qy] = P(0, -5, -35.4 + bob);
    for (const [x, y, r] of [[qx, qy, 2.4], [px, py, 1.7]]) { g.beginPath(); g.ellipse(x, y, r * (0.6 + 0.4 * Aca) + 0.6, r, 0, 0, TAU); paint(g, sh(SADDLE, 0.08), LW, y - r, y + r); }
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(cx - sw * 0.35, cy - 2.4, sw * 0.3, 0.7, -0.2, 0, TAU); g.fill();
    // стремена (если в седле никого — висят)
    if (!pose.rider) for (const l of [-7.6, 7.6]) { if (Asa > 0.4 && Zd(l, 0) < -1) continue; const [x0, y0] = P(l * 0.9, 0, -31 + bob), [x1, y1] = P(l, 0.4, -19 + bob); g.strokeStyle = '#3a2412'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1 - 1.5); g.stroke(); g.beginPath(); g.ellipse(x1, y1, 1.4, 1.6, 0, 0, TAU); g.strokeStyle = '#8a8e96'; g.lineWidth = 0.8; g.stroke(); }
  });

  // ---------------- шея, грива, голова
  const gz = pose.graze === true ? 1 : +pose.graze || 0;   // v122: пасётся — 0…1 (голова опускается к траве), chew — морда жуёт
  const nod = walk >= 0 ? Math.sin(ph * 2) * 0.8 : gz ? gz * 17 + (pose.chew ? 1.1 : 0) : Math.sin(t * 1.6 + 1) * 0.4;
  add(Zd(0, 15), () => {
    const nb = P(0, 11.5, -28 + bob), nt = P(0, 16.8, -38.8 + bob + nod), sk = P(0, 18.8, -41 + bob + nod), mz = P(0, 24.6, -34.8 + bob + nod);
    const neck = cap(g, nb[0], nb[1], nt[0], nt[1], 5.4, 3.6, C.body), head = cap(g, sk[0], sk[1], mz[0], mz[1], 3.9, 3.0, C.body);
    // грива — за шеей (по гребню), рисуется до заливки шеи
    const crest = (k, dy = 0) => P(0, 11 + k * 6.9 - 1.6, -30 + bob - k * 10.8 + nod * k + dy);
    const mane = () => { g.beginPath(); const N = 6; for (let i = 0; i <= N; i++) { const [x, y] = crest(i / N); const r = 2.4 - i * 0.12; if (!i) g.moveTo(x, y); g.arc(x, y, r, 0, TAU); } g.fillStyle = C.mane; g.fill(); };
    neck.stroke(); head.stroke();
    if (Asa > 0.3 || ca < 0) { g.save(); g.lineWidth = LW * 2; g.strokeStyle = ink(C.mane); const N = 6; for (let i = 0; i <= N; i++) { const [x, y] = crest(i / N); g.beginPath(); g.arc(x, y, 2.4 - i * 0.12, 0, TAU); g.stroke(); } g.restore(); mane(); }
    neck.fill(-40, -26); head.fill(-43, -31);
    if (Asa <= 0.3 && ca >= 0) mane();   // спереди грива видна гребнем по середине
    // морда темнее
    g.beginPath(); g.ellipse(mz[0], mz[1], 2.9 * (0.6 + 0.4 * Asa) + 0.8, 2.6, 0, 0, TAU); paint(g, C.muzzle, LW, mz[1] - 2.6, mz[1] + 2.6);
    if (ca > -0.3) { const [nx, ny] = P(Asa > 0.7 ? 0 : 1.2, 26, -35 + bob + nod); g.fillStyle = sh(C.muzzle, -0.5); g.beginPath(); g.ellipse(nx, ny, 0.6, 0.8, 0, 0, TAU); g.fill(); if (Asa < 0.7) { const [n2, m2] = P(-1.2, 26, -35 + bob + nod); g.beginPath(); g.ellipse(n2, m2, 0.6, 0.8, 0, 0, TAU); g.fill(); } }
    if (C.blaze && ca > -0.2) { const a1 = P(0, 20, -42.8 + bob + nod), a2 = P(0, 23.6, -36.6 + bob + nod); g.strokeStyle = '#f4ece0'; g.lineWidth = 1.4 * (0.4 + 0.6 * Aca) + 0.4; g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke(); }
    // уши
    for (const l of [-1.5, 1.5]) { if (Asa > 0.8 && Zd(l, 0) < 0) continue; const [ex, ey] = P(l, 18, -44.6 + bob + nod); g.beginPath(); g.moveTo(ex - 1.1, ey + 0.6); g.quadraticCurveTo(ex - 0.7, ey - 3.2, ex + 0.3, ey - 3.6); g.quadraticCurveTo(ex + 1.1, ey - 1.6, ex + 1, ey + 0.6); g.closePath(); paint(g, C.body, LW * 0.8, ey - 3.6, ey + 0.6); }
    // чёлка
    if (ca > -0.5) { const [fx, fy] = P(0, 19.6, -43.2 + bob + nod); g.beginPath(); g.ellipse(fx, fy, 1.8, 1.4, 0.3, 0, TAU); g.fillStyle = C.mane; g.fill(); }
    // глаза (наклейки): видны со своей стороны
    for (const l of [-2.6, 2.6]) { const vis = -Math.sign(l) * sa; if (ca < -0.5 || (Asa > 0.5 && vis < 0.2)) continue; const [ex, ey] = P(l * (0.55 + 0.45 * Asa), 20, -41.4 + bob + nod); g.fillStyle = '#1c1410'; g.beginPath(); g.ellipse(ex, ey, 0.85 * (0.5 + 0.5 * Math.max(Asa, Aca * 0.8)), 1, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 0.25, ey - 0.35, 0.28, 0, TAU); g.fill(); g.strokeStyle = ink(C.body); g.lineWidth = 0.45; g.beginPath(); g.arc(ex, ey - 0.2, 1.3, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    // уздечка: ремни через голову и у морды, поводья — к рукам всадника или на шею
    g.strokeStyle = '#4a2c16'; g.lineWidth = 0.8;
    const b1 = P(0, 18.6, -43.8 + bob + nod), b2 = P(0, 23.4, -33.6 + bob + nod), b3 = P(0, 22.2, -38 + bob + nod), b4 = P(0, 25.8, -36.8 + bob + nod);
    g.beginPath(); g.moveTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]); g.moveTo(b3[0], b3[1]); g.lineTo(b4[0], b4[1]); g.stroke();
    g.fillStyle = '#e0b840'; g.beginPath(); g.arc(b2[0], b2[1], 0.6, 0, TAU); g.fill();
    const hand = pose.rider ? P(0, 5.5, -38 + bob) : P(0, 12.4, -31 + bob);
    if (!pose.bare) {
    g.strokeStyle = '#3a2210'; g.lineWidth = 0.6; for (const d of [-0.6, 0.6]) { g.beginPath(); g.moveTo(b2[0] + d, b2[1]); g.quadraticCurveTo((b2[0] + hand[0]) / 2 + d, Math.max(b2[1], hand[1]) + 3, hand[0] + d, hand[1]); g.stroke(); } }
    // блик на шее
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse((nb[0] + nt[0]) / 2 - 1.5, (nb[1] + nt[1]) / 2, 1.2, 4, 0.4 * Math.sign(sa || 1), 0, TAU); g.fill();
  });

  // всадник — между телом коня и тем, что ближе к нам (голова спереди, ближние ноги); рисует вызывающий: riderFn(seat, X)
  if (pose.riderFn) add(0.5, () => { g.save(); g.scale(1 / HS, 1 / HS); pose.riderFn(SEAT * HS, X(0, -1) * HS); g.restore(); });
  items.sort((p, q) => p.z - q.z); for (const it of items) it.fn();
  g.restore();
  return SEAT * HS;
}

/** Тень коня на земле (рисуется под всем). */
export function horseShadow(g, view) {
  const a = (VIEW_A[view] ?? 90) * Math.PI / 180, rx = Math.sqrt((19 * Math.sin(a)) ** 2 + (8 * Math.cos(a)) ** 2) * HS;
  g.fillStyle = 'rgba(0,0,0,.26)'; g.beginPath(); g.ellipse(1.5, 1, rx, 4 + 3 * Math.abs(Math.cos(a)), 0, 0, TAU); g.fill();
}
