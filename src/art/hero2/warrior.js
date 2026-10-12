// Воин в новом стиле (эскиз v74): тело, лицо, борода, плащ и 5 комплектов вещей (по ярусам: старт, кожа, кольчуга, латы, фиолетовые).
// Рисуется по скелету из rig.js (любая сторона), объёмом из paint.js. Части сортируются по близости к зрителю.
import { proj, add, sub, mul, mv, dot, norm, cross, len, lerpV, clamp, CAM, rotY, mm, rotX, frameFrom, SK } from './rig.js';
import { MAT, tone, mix, rgba, capsule, limb, aoAt, sphereHull, boxHull, blob, plate, band, surf, dotAt, gemAt, lineW, hull, smooth, lw, OUT, TAU, spec } from './paint.js';
import { drawWeapon2 } from './weapons.js';

// ---------------------------------------------------------------- комплекты
const STEEL = (c = '#b9c2cb') => MAT(c, { metal: true });
export const SETS = {
  start: { name: 'Новобранец', skin: '#e9b38a', hair: '#c4652c', beard: 'full',
    shirt: MAT('#dccb9f'), sleeve: MAT('#dccb9f'), forearm: 'skin', pants: MAT('#6a5642'), boots: MAT('#4a2f1c'), belt: MAT('#6b4426'), buckle: STEEL('#c9b27a'),
    helm: null, pauld: 'pad', pauldMat: MAT('#b8a27a'), weapon: 'hatchet', wpn: { steel: STEEL('#aab2b8'), wood: MAT('#8a5a32'), wrap: MAT('#5a3a20') } },
  leather: { name: 'Кожа', skin: '#e9b38a', hair: '#c4652c', beard: 'braid',
    shirt: MAT('#9a5a2c', { tex: 'leather' }), sleeve: MAT('#4f7a3a'), forearm: MAT('#6b4022', { tex: 'bracer' }), pants: MAT('#5b5a48'), boots: MAT('#432a18'), belt: MAT('#3e2615'), buckle: STEEL('#d8b25a'),
    helm: 'cap', helmMat: MAT('#7a4a28'), pauld: 'leather', pauldMat: MAT('#7a4826'), weapon: 'bearded', wpn: { steel: STEEL('#c2cad0'), wood: MAT('#6b4428'), wrap: MAT('#3d6b3a') } },
  mail: { name: 'Кольчуга', skin: '#e9b38a', hair: '#c4652c', beard: 'braid',
    shirt: MAT('#8f99a4', { metal: true, tex: 'mail' }), sleeve: MAT('#8f99a4', { metal: true, tex: 'mail' }), forearm: MAT('#5a3a22', { tex: 'bracer' }), pants: MAT('#8d959e', { metal: true, tex: 'mail' }), boots: MAT('#4a2e1a'), belt: MAT('#3e2615'), buckle: STEEL('#e0b84a'),
    tabard: MAT('#b2332a'), trim: MAT('#e0b450', { metal: true }), helm: 'nasal', helmMat: STEEL('#aab4bf'), pauld: 'round', pauldMat: STEEL('#a3adb8'), knee: STEEL('#adb7c1'),
    weapon: 'sword', wpn: { steel: STEEL('#d3dae0'), wood: MAT('#4a2a1a'), wrap: MAT('#7a2222'), gold: MAT('#e0b84a', { metal: true }) } },
  plate: { name: 'Латы', skin: '#e9b38a', hair: '#c4652c', beard: 'braid',
    shirt: STEEL('#a9b4c0'), sleeve: STEEL('#9fabb8'), forearm: STEEL('#a9b4c0'), pants: STEEL('#9aa6b3'), boots: STEEL('#8e9aa8'), belt: MAT('#3a2414'), buckle: STEEL('#f0c860'),
    tabard: MAT('#2c4f8e'), trim: MAT('#e2b54a', { metal: true }), helm: 'horned', helmMat: STEEL('#b0bac6'), pauld: 'plate', pauldMat: STEEL('#a6b1be'), knee: STEEL('#b4bec9'), gauntlet: STEEL('#98a4b1'),
    cape: MAT('#2c4f8e'), weapon: 'hammer', wpn: { steel: STEEL('#b8c2cc'), wood: MAT('#3a2416'), wrap: MAT('#24406e'), gold: MAT('#e2b54a', { metal: true }), gem: '#4a9eff' } },
  epic: { name: 'Фиолетовые', skin: '#e9b38a', hair: '#c4652c', beard: 'braid', glow: '#b46aff',
    shirt: MAT('#4d4566', { metal: true }), sleeve: MAT('#463f5e', { metal: true }), forearm: MAT('#4d4566', { metal: true }), pants: MAT('#423b58', { metal: true }), boots: MAT('#3c3650', { metal: true }), belt: MAT('#2a1a2a'), buckle: MAT('#e7c35a', { metal: true }),
    tabard: MAT('#4a2378'), trim: MAT('#e7c35a', { metal: true }), helm: 'crown', helmMat: MAT('#4d4566', { metal: true }), pauld: 'spiked', pauldMat: MAT('#4f4769', { metal: true }), knee: MAT('#575073', { metal: true }), gauntlet: MAT('#4d4566', { metal: true }),
    cape: MAT('#3a1f5a'), weapon: 'greataxe', wpn: { steel: MAT('#6e6890', { metal: true }), wood: MAT('#2a1a2a'), wrap: MAT('#3a1f5a'), gold: MAT('#e7c35a', { metal: true }), gem: '#c58bff', glow: '#b46aff' } },
};

// ---------------------------------------------------------------- узоры
const TEX = {
  leather(g, S, b) { g.strokeStyle = 'rgba(40,20,8,.35)'; g.lineWidth = Math.max(0.5, S.k * 0.22); g.setLineDash([S.k * 0.9, S.k * 0.7]); g.beginPath(); g.moveTo(b.cx - b.w * 0.18, b.y0); g.lineTo(b.cx - b.w * 0.14, b.y1); g.moveTo(b.cx + b.w * 0.2, b.y0); g.lineTo(b.cx + b.w * 0.16, b.y1); g.stroke(); g.setLineDash([]); },
  mail(g, S, b) { const st = Math.max(1.4, S.k * 1.15); g.fillStyle = 'rgba(30,34,44,.32)'; for (let y = b.y0; y < b.y1; y += st) for (let x = b.x0 + ((y / st) % 2) * st / 2; x < b.x1; x += st) { g.beginPath(); g.arc(x, y, st * 0.32, 0, TAU); g.fill(); } g.fillStyle = 'rgba(255,255,255,.18)'; for (let y = b.y0; y < b.y1; y += st) for (let x = b.x0 + ((y / st) % 2) * st / 2; x < b.x1; x += st * 2) g.fillRect(x - st * 0.3, y - st * 0.35, st * 0.25, st * 0.2); },
  bracer(g, S, q) { g.strokeStyle = 'rgba(30,14,6,.45)'; g.lineWidth = Math.max(0.5, S.k * 0.3); for (const k of [0.3, 0.62]) { const x = q.A.x + (q.B.x - q.A.x) * k, y = q.A.y + (q.B.y - q.A.y) * k; g.beginPath(); g.moveTo(x + q.nx * q.r1 * 1.2, y + q.ny * q.r1 * 1.2); g.lineTo(x - q.nx * q.r1 * 1.2, y - q.ny * q.r1 * 1.2); g.stroke(); } },
};
const texOf = mat => mat && mat.tex ? (mat.tex === 'bracer' ? TEX.bracer : (g, S, b) => TEX[mat.tex](g, S, b.bb || b)) : null;
const capTex = mat => mat && mat.tex === 'mail' ? (g, S, q) => TEX.mail(g, S, q.bb) : mat && mat.tex === 'bracer' ? TEX.bracer : null;

// ---------------------------------------------------------------- фигура
/**
 * Нарисовать воина. B — скелет в мире (toWorld), S = {x, y, k} — точка земли на экране и масштаб (точек на единицу роста 100).
 * look — комплект из SETS; o: { t — время, speed — скорость (плащ), weaponTrail }.
 */
export function drawWarrior(g, S, B, look, o = {}) {
  const t = o.t || 0, parts = [], P = (d, fn) => parts.push({ d, fn });
  const skin = MAT(look.skin), skinD = MAT(tone(look.skin, -0.12));
  const fwd = mv(B.pelvisM, [0, 0, 1]), side = (s, w) => dot(sub(w, B.pelvis), mv(rotY(B.heading), [0, 0, 0])) ;
  void side;
  // тень на земле
  { const c = proj([B.pelvis[0], 0, B.pelvis[2]], S); g.fillStyle = 'rgba(20,14,8,.32)'; g.beginPath(); g.ellipse(c.x, c.y, 17 * S.k, 7 * S.k, 0, 0, TAU); g.fill(); }
  const dep = w => proj(w, S).d;

  // ---- ноги
  const plateLegs = look.pants.metal && !look.pants.tex;
  for (const s of ['L', 'R']) {
    const hip = B['hip' + s], kn = B['kn' + s], an = B['an' + s], to = B['to' + s];
    const dTh = dep(lerpV(hip, kn, 0.5)) - 0.5, dSh = dep(lerpV(kn, an, 0.5)) - 0.3;
    P(dTh, () => {
      if (plateLegs) { limb(g, S, hip, kn, 6.4, 6.8, 5.3, MAT(tone(look.pants.base, -0.35))); limb(g, S, lerpV(hip, kn, 0.12), lerpV(hip, kn, 0.88), 6.9, 7.4, 6, look.pants); }
      else limb(g, S, hip, kn, 6.6, 7.3, 5.4, look.pants, capTex(look.pants));
    });
    P(dSh, () => {
      if (plateLegs) { limb(g, S, kn, an, 5.2, 5.6, 4.6, MAT(tone(look.pants.base, -0.35))); limb(g, S, lerpV(kn, an, 0.14), lerpV(kn, an, 0.97), 5.9, 6.3, 5.3, look.boots); }
      else {
        const mid = lerpV(kn, an, 0.32);
        limb(g, S, kn, mid, 5.4, 5.5, 5.1, look.pants, capTex(look.pants));
        limb(g, S, mid, an, 5.4, 5.6, 4.8, look.boots);
        const c = lerpV(kn, an, 0.3); limb(g, S, c, lerpV(c, an, 0.16), 6.1, 6.2, 5.9, MAT(tone(look.boots.base, 0.14)));   // отворот голенища
      }
      if (look.knee) { const kc = blob(g, S, sphereHull(S, add(kn, mul(fwd, 2.4)), 5, frameFrom(fwd, [0, 1, 0]), d => d[2] > -0.15, [], true), look.knee); if (look.glow && kc) gemAt(g, S, add(kn, mul(fwd, 7.2)), 1, '#c58bff', look.glow); }
    });
    P(dep(lerpV(an, to, 0.5)) + 0.4, () => {
      const heel = add(an, mul(norm(sub(an, to)), 2.2));
      limb(g, S, heel, to, 4.6, 5, 4.7, look.boots);
      if (look.boots.metal) { const p0 = lerpV(an, to, 0.5); lineW(g, S, [add(p0, [0, 2.6, 0]), add(p0, [0, -1.8, 0])], rgba(OUT, 0.45), 0.4); }
    });
  }

  // ---- плащ (за спиной)
  if (look.cape) {
    const back = mul(mv(rotY(B.heading), [0, 0, 1]), -1), sp = o.speed || 0;
    const top = [mv(B.chestM, [9.5, 17.5, -8]), mv(B.chestM, [-9.5, 17.5, -8])].map(v => add(B.waist, v));
    const wave = k => Math.sin(t * 3.2 + k) * (1.2 + sp * 2.5);
    const bot = top.map((p, i) => add(add([p[0], 10 + Math.max(0, sp * 6), p[2]], mul(back, 6 + sp * 14 + wave(i * 1.7))), mul(mv(B.chestM, [i ? -1 : 1, 0, 0]), 4)));
    const mid = top.map((p, i) => add(lerpV(p, bot[i], 0.5), mul(back, 2.5 + sp * 3 + wave(i + 2) * 0.5)));
    const dc = (dep(top[0]) + dep(top[1]) + dep(bot[0]) + dep(bot[1])) / 4 - 3;
    P(dc, () => {
      const pts = [top[0], mid[0], bot[0], lerpV(bot[0], bot[1], 0.5), bot[1], mid[1], top[1]].map(w => proj(w, S));
      pts[3].y += 2 * S.k + Math.sin(t * 4) * S.k;
      const cp = new Path2D(); cp.moveTo(pts[0].x, pts[0].y); cp.quadraticCurveTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y); cp.quadraticCurveTo(pts[3].x, pts[3].y, pts[4].x, pts[4].y); cp.quadraticCurveTo(pts[5].x, pts[5].y, pts[6].x, pts[6].y); cp.closePath();
      const bx = Math.min(...pts.map(p => p.x)), by = Math.min(...pts.map(p => p.y)), bw = Math.max(...pts.map(p => p.x)) - bx, bh = Math.max(...pts.map(p => p.y)) - by;
      const gr = g.createLinearGradient(bx, by, bx + bw, by + bh); gr.addColorStop(0, look.cape.hi); gr.addColorStop(0.5, look.cape.base); gr.addColorStop(1, look.cape.lo); g.fillStyle = gr; g.fill(cp);
      g.save(); g.clip(cp); g.strokeStyle = rgba(look.cape.lo, 0.55); g.lineWidth = S.k * 1.1; for (const k of [0.3, 0.55, 0.78]) { const a = lerpV(top[0], top[1], k), b2 = lerpV(bot[0], bot[1], k + Math.sin(t * 2 + k * 5) * 0.06); const A = proj(a, S), Bq = proj(b2, S); g.beginPath(); g.moveTo(A.x, A.y + 4 * S.k); g.lineTo(Bq.x, Bq.y); g.stroke(); }
      if (look.trim) { g.strokeStyle = look.trim.base; g.lineWidth = S.k * 1.2; g.beginPath(); g.moveTo(pts[2].x, pts[2].y); g.quadraticCurveTo(pts[3].x, pts[3].y, pts[4].x, pts[4].y); g.stroke(); }
      g.restore(); g.strokeStyle = OUT; g.lineWidth = lw(S); g.stroke(cp);
    });
  }

  // ---- корпус
  const br = 1 + (B.breathe || 0) * 0.035;
  const ringsU = [[0, 12.2, 9.6], [6, 15.6, 11.4], [11, 17.8, 11.8], [15.5, 17.6, 10.4], [19, 12.6, 8.4]].map(r => [r[0], r[1] * (r[0] > 4 ? br : 1), r[2] * (r[0] > 4 ? br : 1)]);
  const ringsL = [[-6.5, 13, 10], [0, 12.6, 9.8], [6, 12.4, 9.7]];
  const torsoPts = [];
  for (const [y, rx, rz] of ringsU) for (let i = 0; i < 20; i++) torsoPts.push(proj(add(B.waist, mv(B.chestM, [Math.sin(i / 20 * TAU) * rx, y, Math.cos(i / 20 * TAU) * rz])), S));
  for (const [y, rx, rz] of ringsL) for (let i = 0; i < 20; i++) torsoPts.push(proj(add(B.pelvis, mv(B.pelvisM, [Math.sin(i / 20 * TAU) * rx, y - 2, Math.cos(i / 20 * TAU) * rz])), S));
  const dT = dep(B.chest);
  // радиусы корпуса на высоте y (от поясницы): для пряжек, кромок, ремней
  const RU = y => { for (let i = 1; i < ringsU.length; i++) if (y <= ringsU[i][0]) { const a = ringsU[i - 1], c = ringsU[i], q = (y - a[0]) / (c[0] - a[0]); return [a[1] + (c[1] - a[1]) * q, a[2] + (c[2] - a[2]) * q]; } return ringsU[ringsU.length - 1].slice(1); };
  P(dT, () => {
    const H = hull(torsoPts); const b = blob(g, S, H, look.shirt, { tex: texOf(look.shirt) });
    const C = B.waist, M = B.chestM, PL = B.pelvis, PM = B.pelvisM;
    g.save(); g.beginPath(); smooth(g, H); g.clip();
    // затенение у шеи и под плечами
    aoAt(g, S, add(B.neck, mv(M, [0, -3.5, 4])), 9, 5, 0.38);
    for (const sg of [1, -1]) aoAt(g, S, add(C, mv(M, [sg * 14.5, 12, 1])), 6, 7, 0.3);
    aoAt(g, S, add(PL, mv(PM, [0, 6, 6])), 12, 4, 0.18);
    g.restore();
    // штаны на бёдрах
    band(g, S, PL, PM, [13.1, 10.1], [12.5, 9.8], -8.5, 1.5, look.pants, { tex: texOf(look.pants) });
    // латы: кромки пластин, гребень, ворот
    if (look.shirt.metal && !look.shirt.tex) {
      for (const y of [3.5, 8]) { const r0 = RU(y), r1 = RU(y + 1.2); band(g, S, C, M, [r0[0] + 0.25, r0[1] + 0.25], [r1[0] + 0.3, r1[1] + 0.3], y, y + 1.2, MAT(tone(look.shirt.base, -0.2), { metal: true }), { thin: true }); }
      const top = surf(C, M, ...RU(14), 0, 14, 1.01), mid = surf(C, M, ...RU(1), 0, 1, 1.01);
      if (top.vis > 0) lineW(g, S, [top.w, mid.w], rgba('#ffffff', 0.5 * top.vis), 0.6);
      const r0 = RU(16.5), r1 = RU(19); band(g, S, C, M, [r0[0] + 0.5, r0[1] + 0.5], [r1[0] + 0.3, r1[1] + 0.3], 16.5, 19.5, look.trim || MAT(tone(look.shirt.base, 0.1), { metal: true }), { thin: true });
      // набедренные пластины (юбка лат)
      for (const [y0, y1, k] of [[-1, -5, 0], [-4.4, -8.6, 0.6]]) band(g, S, PL, PM, [13.4 + k, 10.3 + k], [14 + k, 10.7 + k], y0, y1, look.trim && k ? look.trim : MAT(tone(look.shirt.base, -0.08), { metal: true }), { thin: true });
    }
    // кожа: ворот и шнуровка
    if (look.shirt.tex === 'leather') { const r0 = RU(16), r1 = RU(19); band(g, S, C, M, [r0[0] + 0.4, r0[1] + 0.4], [r1[0], r1[1]], 16, 19.4, MAT(tone(look.shirt.base, -0.18))); const a = surf(C, M, ...RU(14), 0, 14, 1.01), b2 = surf(C, M, ...RU(4), 0, 4, 1.01); if (a.vis > 0.2) { lineW(g, S, [a.w, b2.w], rgba('#2a160a', 0.75), 0.55); for (let k = 0; k < 5; k++) { const p = lerpV(a.w, b2.w, k / 5); lineW(g, S, [add(p, mv(M, [-1.4, 0, 0])), add(p, mv(M, [1.4, -0.9, 0]))], '#e0c08e', 0.35); } } }
    // рубаха: вырез и складки
    if (!look.shirt.metal && !look.shirt.tex) { const a = surf(C, M, ...RU(19), 0, 19, 1.0); if (a.vis > 0.1) { const p = proj(a.w, S); g.fillStyle = tone(look.skin, -0.08); g.beginPath(); g.moveTo(p.x - 3.4 * S.k, p.y - 0.4 * S.k); g.lineTo(p.x, p.y + 5 * S.k); g.lineTo(p.x + 3.4 * S.k, p.y - 0.4 * S.k); g.closePath(); g.fill(); g.strokeStyle = OUT; g.lineWidth = lw(S) * 0.7; g.stroke(); } if (b) { g.save(); g.beginPath(); smooth(g, H); g.clip(); g.strokeStyle = rgba(look.shirt.lo, 0.5); g.lineWidth = S.k * 0.7; for (const k of [-0.22, 0.05, 0.25]) { g.beginPath(); g.moveTo(b.cx + b.w * k, b.cy - b.h * 0.05); g.quadraticCurveTo(b.cx + b.w * (k + 0.05), b.cy + b.h * 0.2, b.cx + b.w * (k - 0.02), b.cy + b.h * 0.42); g.stroke(); } g.restore(); } }
    // накидка-табард спереди и сзади
    if (look.tabard) for (const sd of [1, -1]) {
      const zf = RU(6)[1] + 0.6, f = surf(C, M, ...RU(6), sd > 0 ? 0 : Math.PI, 6, 1.06); if (f.vis < -0.05) continue;
      const w1 = 6, sway = Math.sin(t * 2.4 + sd) * 0.6 + (o.speed || 0) * -2.5 * sd;
      const pts = [add(C, mv(M, [w1 * 1.15, 16, sd * (RU(16)[1] + 0.5)])), add(C, mv(M, [-w1 * 1.15, 16, sd * (RU(16)[1] + 0.5)])), add(PL, mv(PM, [-w1, -6, sd * 10.6])), add(PL, mv(PM, [-w1 * 0.95, -21, sd * (9.6 - sway)])), add(PL, mv(PM, [0, -23.5, sd * (9.6 - sway)])), add(PL, mv(PM, [w1 * 0.95, -21, sd * (9.6 - sway)])), add(PL, mv(PM, [w1, -6, sd * 10.6]))];
      void zf;
      plate(g, S, pts, look.tabard, { tex: (g2, S2, bb) => { if (look.trim) { g2.strokeStyle = look.trim.base; g2.lineWidth = S.k * 1.1; g2.stroke(); } if (sd > 0 && f.vis > 0.3) { const e = proj(add(C, mv(M, [0, 7, RU(7)[1] + 1.2])), S); emblem(g2, S, e, look); } } });
    }
    // ремень с пряжкой
    band(g, S, PL, PM, [13, 10.1], [12.8, 10], 1.8, 4.8, look.belt);
    const bk = surf(PL, PM, 13, 10.2, 0, 3.3, 1.03);
    if (bk.vis > 0.15) { const p = proj(bk.w, S), w = 2.6 * S.k * Math.min(1, bk.vis + 0.2); g.beginPath(); g.roundRect(p.x - w, p.y - 1.9 * S.k, w * 2, 3.8 * S.k, 0.7 * S.k); const gr = g.createLinearGradient(p.x - w, p.y - 2 * S.k, p.x + w, p.y + 2 * S.k); gr.addColorStop(0, look.buckle.hi); gr.addColorStop(1, look.buckle.lo); g.fillStyle = gr; g.fill(); g.strokeStyle = OUT; g.lineWidth = lw(S) * 0.7; g.stroke(); g.strokeRect(p.x - w * 0.45, p.y - 0.9 * S.k, w * 0.9, 1.8 * S.k); }
    if (look.glow) { const c = surf(C, M, ...RU(11), 0, 11, 1.04); if (c.vis > 0.2) gemAt(g, S, c.w, 1.8, '#c58bff', look.glow); }
  });

  // ---- шея и голова
  P(Math.min(dep(B.neck) + 0.2, dep(B.head) + 1.9), () => limb(g, S, B.neck, lerpV(B.neck, B.head, 0.45), 5.2, 5.3, 4.9, skinD));
  P(dep(B.head) + 2, () => drawHead(g, S, B, look, t));

  // ---- руки
  const plateArms = look.sleeve.metal && !look.sleeve.tex;
  for (const s of ['L', 'R']) {
    const sh = B['sh' + s], el = B['el' + s], ha = B['ha' + s], sg = s === 'L' ? 1 : -1;
    const dU = dep(lerpV(sh, el, 0.5)), dF = dep(lerpV(el, ha, 0.5)), dH = dep(ha);
    const shTop = add(sh, mv(B.chestM, [0, 1.6, 0]));
    P(dU, () => {
      if (plateArms) { limb(g, S, shTop, el, 5.6, 5.9, 4.6, MAT(tone(look.sleeve.base, -0.35))); limb(g, S, lerpV(shTop, el, 0.25), lerpV(shTop, el, 0.92), 6.1, 6.4, 5.2, look.sleeve); }
      else limb(g, S, shTop, el, 6.2, 6.8, 4.9, look.sleeve, capTex(look.sleeve));
      if (plateArms || look.knee) blob(g, S, sphereHull(S, el, 4.4, B.chestM, null, [], false), look.knee || look.sleeve);   // налокотник
    });
    P(dF, () => {
      const fm = look.forearm === 'skin' ? skin : look.forearm;
      limb(g, S, el, ha, 5.1, 5.6, 4.1, fm, capTex(fm));
      if (look.forearm === 'skin') limb(g, S, el, lerpV(el, ha, 0.2), 5.7, 5.8, 5.5, look.sleeve);   // закатанный рукав
      if (look.gauntlet) limb(g, S, lerpV(el, ha, 0.45), lerpV(el, ha, 0.95), 5.4, 5.7, 5.2, look.gauntlet);
    });
    // кисть: держит рукоять (пальцы обхватывают древко, большой палец сверху) или сжата в кулак
    const grips = s === 'R' || B.twoHand;
    P(dH + 0.9, () => drawHand(g, S, B, look, s, grips && !B.dropped));
    const shM = frameFrom(norm(add(mul(mv(B.chestM, [sg, 0, 0]), 1), [0, 0.7, 0])), mv(B.chestM, [0, 0, 1]));
    P(dep(sh) + 2.2, () => drawShoulder(g, S, B, look, sh, shM, sg, t));
  }

  // ---- оружие
  const wcen = add(B.grip, mul(B.wDir, 34));
  if (o.trail) P(dep(wcen) - 0.05, () => trail(g, S, B, o.trail, look));
  P(B.dropped ? dep(B.grip) - 0.2 : dep(B.haR) + 0.85, () => drawWeapon2(g, S, B, look, 'haft'));
  P(dep(wcen) + (dot(B.wDir, CAM.toCam) > 0 ? 0.4 : -0.4), () => drawWeapon2(g, S, B, look, 'head'));

  parts.sort((a, b) => a.d - b.d);
  for (const p of parts) p.fn();
}

// ---------------------------------------------------------------- голова
/** Голова. Черты лица — точки на поверхности головы (глаза, брови, нос, усы поворачиваются вместе с ней).
 *  Голова чуть повёрнута к зрителю (камера сверху), иначе лицо видно хуже. */
const HEAD_CHEAT = -0.3;
function drawHead(g, S, B, look, t) {
  const c = B.head, R = SK.headR;
  // небольшой «киношный» наклон лица к камере (вокруг оси экрана)
  const M = mm(rotAxisW([1, 0, 0], HEAD_CHEAT), B.headM);
  const toW = (d, out = 1) => add(c, mul(mv(M, norm(d)), R * out));
  const fac = d => dot(mv(M, norm(d)), CAM.toCam);
  const skin = MAT(look.skin), hair = MAT(look.hair), beardM = MAT(tone(look.hair, -0.04));
  const helm = look.helm, hideHair = helm === 'nasal' || helm === 'horned' || helm === 'crown';
  // точки черт лица: центр dc (направление), смещения u (вбок, в долях радиуса), v (вверх)
  const FX = (dc, out = 1.0) => { const z = norm(dc), x = norm(cross([0, 1, 0], z)), y = cross(z, x); return (u, v, o = 0) => proj(add(c, mul(mv(M, norm(add(z, add(mul(x, u), mul(y, v))))), R * (out + o))), S); };
  const poly = (pts, fill, stroke, w = 0.7) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw(S) * w; g.stroke(); } };
  const curve = (pts, col, w) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
  const arcPts = (f, n, fn) => { const r = []; for (let i = 0; i <= n; i++) { const [u, v] = fn(i / n); r.push(f(u, v)); } return r; };
  const ear = sg => { const e = toW([sg * 0.93, 0.02, -0.12], 1); return blob(g, S, sphereHull(S, e, 2.3, mm(M, [1, 0, 0, 0, 1.35, 0, 0, 0, 0.6]), null), MAT(tone(look.skin, -0.05))); };
  if (!hideHair) for (const sg of [1, -1]) ear(sg);
  // череп и скулы
  const hb = blob(g, S, sphereHull(S, c, R, M, null, [[0, -R * 1.06, R * 0.32], [R * 0.55, -R * 0.75, R * 0.55], [-R * 0.55, -R * 0.75, R * 0.55]]), skin);
  const front = fac([0, 0, 1]);
  // мягкие тени лица: глазницы, под носом, румянец
  if (hb && front > -0.1) { g.save(); g.beginPath(); smooth(g, sphereHull(S, c, R, M, null, [[0, -R * 1.06, R * 0.32], [R * 0.55, -R * 0.75, R * 0.55], [-R * 0.55, -R * 0.75, R * 0.55]])); g.clip();
    for (const sg of [1, -1]) { const f = FX([sg * 0.36, 0.2, 0.92]); if (fac([sg * 0.36, 0.2, 0.92]) > 0) { const p = f(0, 0.02); aoAt(g, S, toW([sg * 0.36, 0.24, 0.92]), 3.4, 2.4, 0.42); const q = FX([sg * 0.5, -0.12, 0.86])(0, 0); const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, 3.2 * S.k); gr.addColorStop(0, 'rgba(225,95,75,.42)'); gr.addColorStop(1, 'rgba(225,95,75,0)'); g.fillStyle = gr; g.fillRect(q.x - 4 * S.k, q.y - 4 * S.k, 8 * S.k, 8 * S.k); void p; } }
    g.restore(); }
  // затылок и волосы сзади (до бороды)
  const hairTex = (g2, S2, b) => { g2.strokeStyle = rgba(tone(look.hair, -0.45), 0.55); g2.lineWidth = S.k * 0.5; for (let i = -4; i <= 4; i++) { g2.beginPath(); g2.moveTo(b.cx + i * b.w * 0.1, b.y0); g2.quadraticCurveTo(b.cx + i * b.w * 0.13 + b.w * 0.08, b.cy, b.cx + i * b.w * 0.11, b.y1); g2.stroke(); } g2.strokeStyle = rgba(tone(look.hair, 0.4), 0.45); g2.beginPath(); g2.moveTo(b.x0 + b.w * 0.25, b.y0 + b.h * 0.25); g2.quadraticCurveTo(b.cx, b.y0 + b.h * 0.1, b.x0 + b.w * 0.7, b.y0 + b.h * 0.3); g2.stroke(); };
  const nape = sphereHull(S, c, R * 1.06, M, hideHair ? d => d[2] < 0.15 && d[1] > -0.72 && d[1] < 0.5 && !(d[2] > -0.2 && d[1] < -0.2) : d => d[2] < -0.25 && d[1] > -0.62 && d[1] < 0.62, [], true);
  if (nape.length > 2) blob(g, S, nape, hair, { tex: hairTex });
  // борода: подбородок и щёки, лопатой вниз
  if (fac([0, -0.5, 0.8]) > -0.6) {
    const bd = sphereHull(S, c, R * 1.07, M, d => d[2] > -0.4 && (d[1] < -0.5 || (Math.abs(d[0]) > 0.7 && d[1] < -0.05)), [[0, -R * 1.7, R * 0.6], [R * 0.55, -R * 1.5, R * 0.42], [-R * 0.55, -R * 1.5, R * 0.42]], true);
    blob(g, S, bd, beardM, { tex: (g2, S2, b) => { g2.strokeStyle = rgba(tone(look.hair, -0.42), 0.6); g2.lineWidth = S.k * 0.45; for (let i = -4; i <= 4; i++) { g2.beginPath(); g2.moveTo(b.cx + i * b.w * 0.08, b.y0 + b.h * 0.3); g2.quadraticCurveTo(b.cx + i * b.w * 0.11, b.cy + b.h * 0.2, b.cx + i * b.w * 0.07, b.y1 - b.h * 0.06); g2.stroke(); } g2.strokeStyle = rgba(tone(look.hair, 0.35), 0.5); for (let i = -3; i <= 3; i += 2) { g2.beginPath(); g2.moveTo(b.cx + i * b.w * 0.09 - S.k, b.y0 + b.h * 0.35); g2.quadraticCurveTo(b.cx + i * b.w * 0.11 - S.k, b.cy, b.cx + i * b.w * 0.08 - S.k, b.cy + b.h * 0.25); g2.stroke(); } } });
    if (look.beard === 'braid') { const top = toW([0, -1.5, 0.6], 1), dn = mv(M, [0, -1, 0.12]); if (fac([0, -0.4, 0.9]) > -0.2) { for (let i = 0; i < 3; i++) blob(g, S, sphereHull(S, add(top, mul(dn, 1.2 + i * 2.1)), 1.7 - i * 0.25, M, null), beardM); limb(g, S, add(top, mul(dn, 6.6)), add(top, mul(dn, 7.6)), 1.25, 1.3, 1.25, look.buckle || MAT('#c9b27a', { metal: true })); } }
  }
  if (!hideHair) {
    const top = sphereHull(S, c, R * 1.08, M, d => d[1] > (d[2] > 0 ? 0.6 : 0.6 + d[2] * 1.4), [[0, R * 1.2, -R * 0.05], [R * 0.3, R * 1.12, R * 0.45], [-R * 0.3, R * 1.12, R * 0.45]], true);
    blob(g, S, top, hair, { tex: hairTex });
    for (const sg of [1, -1]) { const tp = sphereHull(S, c, R * 1.07, M, d => d[0] * sg > 0.78 && d[1] > -0.1 && d[1] < 0.75 && d[2] < 0.12 && d[2] > -0.5, [], true); if (tp.length > 2) blob(g, S, tp, hair, { tex: hairTex }); }
  }
  // ---- черты лица (видны, если лицо обращено к зрителю)
  if (front > -0.15) {
    // глаза: миндалина, радужка, зрачок, блик, тяжёлое верхнее веко
    for (const sg of [1, -1]) {
      const dc = [sg * 0.35, 0.2, 0.92]; if (fac(dc) < 0.08) continue;
      const f = FX(dc, 1.0), W2 = 0.215, H2 = 0.095;
      const alm = arcPts(f, 14, q => { const a = q * TAU; return [Math.cos(a) * W2, Math.sin(a) * H2 * (Math.sin(a) > 0 ? 1.15 : 0.8) + Math.cos(a) * 0.02 * sg]; });
      poly(alm, '#fbf1df', null);
      g.save(); g.beginPath(); alm.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.clip();
      const ir = arcPts(f, 16, q => [0.02 * sg * -1 + Math.cos(q * TAU) * 0.085, -0.005 + Math.sin(q * TAU) * 0.085]); poly(ir, '#3d6f95', null);
      const pu = arcPts(f, 12, q => [0.02 * sg * -1 + Math.cos(q * TAU) * 0.045, -0.005 + Math.sin(q * TAU) * 0.045]); poly(pu, '#110d0a', null);
      const lid = arcPts(f, 10, q => { const a = Math.PI * q; return [Math.cos(a) * W2 * 1.1, H2 * 0.55 + Math.sin(a) * H2 * 0.9]; }); poly(lid.concat(arcPts(f, 6, q => [-W2 * 1.1 + q * W2 * 2.2, H2 * 2.2])), rgba(tone(look.skin, -0.3), 0.65), null);
      g.restore();
      const hl = f(-0.04 * sg - 0.03, 0.035); g.fillStyle = '#fff'; g.beginPath(); g.arc(hl.x, hl.y, Math.max(0.6, 0.55 * S.k), 0, TAU); g.fill();
      curve(arcPts(f, 10, q => { const a = Math.PI * (1 - q); return [Math.cos(a) * W2 * 1.08, Math.sin(a) * H2 * 1.2 + 0.005]; }), OUT, lw(S) * 1.15);
      curve(arcPts(f, 6, q => [-W2 * 0.7 + q * W2 * 1.4, -H2 * 1.05]), rgba(OUT, 0.35), lw(S) * 0.5);
      // бровь — клин, к переносице ниже (суровый взгляд)
      const bw = arcPts(f, 8, q => [(-0.27 + q * 0.54) * -sg, 0.155 + (q - 0.5) * 0.09 * 1 + Math.sin(q * Math.PI) * 0.035]);
      const bwLow = arcPts(f, 8, q => [(-0.27 + q * 0.54) * -sg, 0.105 + (q - 0.5) * 0.11 + Math.sin(q * Math.PI) * 0.02]);
      poly(bw.concat(bwLow.reverse()), tone(look.hair, -0.25), OUT, 0.7);
    }
    // нос — объёмная «картошка» с крыльями
    if (fac([0, -0.02, 1]) > 0.05) {
      const nc = toW([0, -0.03, 1], 1.02), nM = M;
      // спинка носа и кончик одной формой; ноздри — тенью
      blob(g, S, sphereHull(S, toW([0, -0.05, 1], 0.99), R * 0.165, mm(nM, [1, 0, 0, 0, 1.1, 0, 0, 0, 1]), null, [mul(mv(nM, [0, 0.12, 0.02]), R)]), MAT(tone(look.skin, -0.04)), { spec: true });
      for (const sg of [1, -1]) { const q = FX([sg * 0.07, -0.13, 1], 1.12)(0, 0); g.fillStyle = rgba(tone(look.skin, -0.55), 0.6); g.beginPath(); g.ellipse(q.x, q.y, 0.55 * S.k, 0.35 * S.k, 0, 0, TAU); g.fill(); }
      void nc;
    }
    // рот и усы
    if (fac([0, -0.4, 0.9]) > 0.05) {
      const f = FX([0, -0.36, 0.93], 1.07);
      poly(arcPts(f, 10, q => { const a = q * TAU; return [Math.cos(a) * 0.12, Math.sin(a) * 0.045 - 0.03]; }), '#5a1c12', OUT, 0.6);
      const m = FX([0, -0.25, 0.97], 1.08), mc = tone(look.hair, 0.08);
      for (const sg of [1, -1]) { const top = arcPts(m, 10, q => [sg * q * 0.46, 0.03 - q * q * 0.22]), bot = arcPts(m, 10, q => [sg * (1 - q) * 0.46, -0.21 + (1 - q) * 0.03 - (1 - q) * (1 - q) * 0.0 + q * q * 0.13]); poly(top.concat(bot), mc, OUT, 0.8); const s2 = arcPts(m, 6, q => [sg * (0.05 + q * 0.3), -0.02 - q * q * 0.16]); curve(s2, rgba(tone(look.hair, 0.45), 0.7), lw(S) * 0.6); }
    }
  }
  if (helm) drawHelm(g, S, { ...B, headM: M }, look, t);
}
/** Поворот вокруг оси мира (для наклона лица к камере). */
function rotAxisW(ax, a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }

// ---------------------------------------------------------------- кисти
/** Кисть руки s. grip — держит древко: кулак вытянут вдоль древка, 4 пальца поперёк, большой палец сверху. */
function drawHand(g, S, B, look, s, grip) {
  const el = B['el' + s], ha = B['ha' + s], fa = norm(sub(ha, el));
  const mat = look.gauntlet || (look.forearm !== 'skin' && look.forearm.metal ? look.forearm : MAT(look.skin));
  // оси кулака: h — вдоль древка (или поперёк предплечья), bk — тыльная сторона, n — третья
  let h, c;
  if (grip) { h = B.wDir; c = s === 'R' ? B.grip : ha; }
  else { h = norm(cross(fa, mv(B.chestM, [0, 0, 1]))); if (len(h) < 0.1) h = [1, 0, 0]; c = add(ha, mul(fa, 1.6)); }
  let bk = norm(sub(fa, mul(h, dot(fa, h)))); if (len(bk) < 0.1) bk = [0, 1, 0];
  bk = mul(bk, -1);   // тыльная сторона смотрит к локтю… кулак сжат вокруг древка: костяшки — прочь от предплечья
  const n = norm(cross(h, bk));
  const L = 4.4, T = 3.2, D = 3.5;   // полуразмеры: вдоль древка, толщина, глубина
  const cen = add(c, mul(bk, -0.6));
  const pts = boxHull(S, cen, [mul(h, L), mul(bk, T), mul(n, D)], 0.55);
  const b = blob(g, S, pts, mat, { spec: mat.metal });
  if (!b) return;
  // пальцы: 3 борозды поперёк, на стороне, что видна зрителю
  const side = dot(n, CAM.toCam) >= 0 ? 1 : -1, fs = mul(n, side * D * 0.98);
  g.save(); g.beginPath(); smooth(g, pts); g.clip();
  for (const k of [-0.5, 0, 0.5]) { const a = proj(add(add(cen, fs), add(mul(h, k * L), mul(bk, T * 0.9))), S), z = proj(add(add(cen, fs), add(mul(h, k * L), mul(bk, -T * 0.9))), S); g.strokeStyle = rgba(OUT, 0.55); g.lineWidth = lw(S) * 0.6; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(z.x, z.y); g.stroke(); }
  // костяшки — блики по тыльному ребру
  for (const k of [-0.75, -0.25, 0.25, 0.75]) { const p = proj(add(add(cen, mul(bk, -T * 0.8)), add(mul(h, k * L), mul(n, side * D * 0.6))), S); g.fillStyle = mat.metal ? 'rgba(255,255,245,.55)' : 'rgba(255,235,215,.45)'; g.beginPath(); g.arc(p.x, p.y, Math.max(0.6, 0.55 * S.k), 0, TAU); g.fill(); }
  g.restore();
  // большой палец: лежит поверх пальцев, у верхнего края
  const th0 = add(cen, add(mul(h, L * 0.75), add(mul(n, side * D * 0.9), mul(bk, T * 0.5)))), th1 = add(th0, add(mul(bk, -T * 1.3), mul(h, -L * 0.35)));
  limb(g, S, th0, th1, 1.45, 1.55, 1.3, mat);
  // манжета перчатки
  if (look.gauntlet) limb(g, S, add(ha, mul(fa, -3.5)), add(ha, mul(fa, 0.2)), 4.8, 5, 4.9, look.gauntlet);
}

// ---------------------------------------------------------------- шлемы
function drawHelm(g, S, B, look, t) {
  const c = B.head, M = B.headM, R = SK.headR, m = look.helmMat, toW = (d, out = 1) => add(c, mul(mv(M, norm(d)), R * out));
  const fac = d => dot(mv(M, norm(d)), CAM.toCam);
  // нижний край шлема: над бровями спереди, ниже к затылку
  const cap = look.helm === 'cap', front = cap ? 0.5 : look.helm === 'crown' ? 0.36 : 0.42, edgeY = z => front - (z < 0 ? -z * (cap ? 0.6 : 1.05) : 0);
  const RH = R * (cap ? 1.09 : 1.14);
  const tex = cap ? (g2, S2, b) => TEX.leather(g2, S2, b) : (g2, S2, b) => { g2.strokeStyle = rgba('#ffffff', 0.28); g2.lineWidth = S.k * 0.45; g2.beginPath(); g2.moveTo(b.cx, b.y0 + b.h * 0.05); g2.lineTo(b.cx, b.y1); g2.stroke(); };
  blob(g, S, sphereHull(S, c, RH, M, d => d[1] > edgeY(d[2]), [], true), m, { tex });
  // обод: видимая кривая по краю, толстая полоса с заклёпками
  const rim = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU, z = Math.cos(a), x = Math.sin(a), y = edgeY(z), r0 = Math.sqrt(Math.max(0, 1 - y * y)), d = [x * r0, y, z * r0], wd = mv(M, d); rim.push(dot(wd, CAM.toCam) > 0.02 ? proj(add(c, mul(wd, RH * 1.02)), S) : null); }
  const rimCol = cap ? tone(m.base, -0.25) : (look.trim ? look.trim.base : tone(m.base, -0.15));
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [col, w] of [[OUT, 3.2], [rimCol, 2.1], [rgba('#fff8e0', 0.35), 0.6]]) { g.strokeStyle = col; g.lineWidth = lw(S) * w; g.beginPath(); let st = false; for (const p of rim) { if (!p) { st = false; continue; } if (!st) { g.moveTo(p.x, p.y); st = true; } else g.lineTo(p.x, p.y); } g.stroke(); }
  if (!cap) for (let i = -4; i <= 4; i++) { const a = i * 0.36, z = Math.cos(a), y = edgeY(z) + 0.04, r0 = Math.sqrt(1 - y * y), d = [Math.sin(a) * r0, y, z * r0]; if (fac(d) > 0.1) dotAt(g, S, add(c, mul(mv(M, d), RH * 1.03)), 0.5, '#f4ecd0'); }
  if (cap) return;
  // наносник: от обода до кончика носа
  if (fac([0, 0, 1]) > 0.05) { const a = toW([0, front + 0.02, 0.92], 1.16), b2 = toW([0, 0.05, 1], 1.2); limb(g, S, a, b2, 0.95, 0.9, 0.75, m); }
  if (look.helm === 'horned' || look.helm === 'crown') {
    for (const sg of [1, -1]) {
      const base = toW([sg * 0.8, 0.55, -0.05], 1.1);
      const dir1 = norm(add(mv(M, [sg, 0.35, 0.1]), [0, 0, 0])), up = mv(M, [0, 1, 0]);
      const p1 = add(base, mul(dir1, 5)), p2 = add(p1, add(mul(up, 6), mul(dir1, 1.5))), p3 = add(p2, add(mul(up, 3.5), mul(dir1, -1.6)));
      const hm = look.helm === 'crown' ? MAT('#e7c35a', { metal: true }) : MAT('#efe2c4');
      const draw = () => { capsule(g, S, base, p1, 1.9, 1.6, hm); capsule(g, S, p1, p2, 1.6, 1.0, hm); capsule(g, S, p2, p3, 1.0, 0.35, hm); };
      draw();
    }
  }
  if (look.helm === 'crown') { for (let i = -2; i <= 2; i++) { const s0 = surf(c, M, R * 0.95, R * 0.95, i * 0.42, R * 0.55); if (s0.vis < 0.05) continue; const top = add(s0.w, mul(mv(M, [0, 1, 0]), 4.2 - Math.abs(i) * 0.9)); capsule(g, S, s0.w, top, 0.9, 0.2, MAT('#e7c35a', { metal: true })); } const gm = surf(c, M, R * 0.98, R * 0.98, 0, R * 0.52); if (gm.vis > 0.1) gemAt(g, S, gm.w, 1.4, '#c58bff', look.glow); }
}

// ---------------------------------------------------------------- плечи
/** Наплечник: купол и под ним 1–2 пластины-ламы внахлёст вниз по руке; кромка, заклёпки, ремень. У каждого комплекта свой. */
function drawShoulder(g, S, B, look, sh, shM0, sg, t) {
  const kind = look.pauld; if (!kind) return;
  const out = mv(B.chestM, [sg, 0, 0]), fwd = mv(B.chestM, [0, 0, 1]);
  const axis = norm(add(mul(out, 0.75), [0, 0.85, 0]));   // ось купола: вверх и наружу
  const zz = norm(cross(fwd, axis)), xx = norm(cross(axis, zz));
  const M = [xx[0], axis[0], zz[0], xx[1], axis[1], zz[1], xx[2], axis[2], zz[2]];
  const P = { pad: [6.6, 2, 2.2], leather: [6.6, 3, 2.1], round: [7, 2, 2.4], plate: [8.4, 3, 2.6], spiked: [8.8, 3, 2.7] }[kind];
  const [r, nL, step] = P, down = norm(add(mul(out, 0.5), [0, -1, 0]));
  const c0 = add(sh, add(mul(axis, kind === 'pad' ? 0.3 : 1.2), mul(out, 0.8)));
  const m = look.pauldMat, trim = look.trim;
  const cut = kind === 'pad' ? -0.3 : -0.12;
  for (let i = nL - 1; i >= 0; i--) {
    const c = add(c0, mul(down, i * step)), ri = r * (1 - i * 0.07), mat = i % 2 && kind !== 'pad' ? MAT(tone(m.base, -0.1), { metal: m.metal }) : m;
    const pts = sphereHull(S, c, ri, M, d => d[1] > cut, [], true);
    const b = blob(g, S, pts, mat, { tex: kind === 'pad' ? quilt : kind === 'leather' ? (g2, S2, bb) => TEX.leather(g2, S2, bb) : null });
    if (!b) continue;
    // кромка ламы: видимая дуга по нижнему краю (золотая у лат)
    const rim = []; for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU, d = [Math.cos(a) * Math.sqrt(1 - cut * cut), cut, Math.sin(a) * Math.sqrt(1 - cut * cut)], wd = mv(M, d); if (dot(wd, CAM.toCam) > 0.02) rim.push(proj(add(c, mul(wd, ri * 1.01)), S)); else if (rim.length) rim.push(null); }
    g.lineCap = 'round';
    for (const [col, w] of [[OUT, 1.9], [trim && (kind === 'plate' || kind === 'spiked') ? trim.base : kind === 'leather' ? tone(m.base, 0.25) : tone(m.base, 0.35), 0.9]]) { g.strokeStyle = col; g.lineWidth = lw(S) * w; g.beginPath(); let st = false; for (const p of rim) { if (!p) { st = false; continue; } if (!st) { g.moveTo(p.x, p.y); st = true; } else g.lineTo(p.x, p.y); } g.stroke(); }
    // заклёпки по кромке
    if (kind !== 'pad') for (const a of [-0.9, -0.3, 0.3, 0.9]) { const d = [Math.cos(a + Math.PI / 2) * 0.93, cut + 0.2, Math.sin(a + Math.PI / 2) * 0.93], wd = mv(M, d); if (dot(wd, CAM.toCam) > 0.15) dotAt(g, S, add(c, mul(wd, ri * 1.0)), 0.55, kind === 'leather' ? '#d8b878' : '#efe6c8'); }
  }
  // гребень по куполу у лат
  if (kind === 'plate' || kind === 'spiked') { const a0 = add(c0, mul(mv(M, norm([0, 1, -0.75])), r * 1.02)), a1 = add(c0, mul(mv(M, [0, 1, 0]), r * 1.04)), a2 = add(c0, mul(mv(M, norm([0, 1, 0.75])), r * 1.02)); limb(g, S, a0, a1, 0.9, 1, 0.9, trim || m); limb(g, S, a1, a2, 0.9, 1, 0.9, trim || m); }
  // ремень через плечо у кожи и стёганки
  if (kind === 'pad' || kind === 'leather') { const a = add(c0, mul(mv(M, norm([0, 0.5, 1])), r * 1.0)), b2 = add(c0, mul(mv(M, norm([0, 0.5, -1])), r * 1.0)); const mid = add(c0, mul(mv(M, [0, 1, 0]), r * 1.05)); limb(g, S, a, mid, 0.8, 0.85, 0.8, MAT('#3e2615')); limb(g, S, mid, b2, 0.8, 0.85, 0.8, MAT('#3e2615')); dotAt(g, S, mid, 0.8, look.buckle.base); }
  if (kind === 'spiked') for (const [x, z] of [[0, 0], [0.5, 0.45], [0.5, -0.45]]) { const b0 = add(c0, mul(mv(M, norm([x * 0.5, 1, z])), r * 0.95)), tip = add(b0, mul(mv(M, norm([x * 0.3, 1, z * 0.6])), 7)); limb(g, S, b0, tip, 1.8, 1.4, 0.2, MAT('#d8d0e8', { metal: true })); }
  if (look.glow && kind === 'spiked') { const gm = add(c0, mul(mv(M, norm([0.8, 0.5, 0])), r * 1.0)); gemAt(g, S, gm, 1.2, '#c58bff', look.glow); }
  void t; void shM0;
}
/** Стёганка: ромбы прошивки. */
function quilt(g, S, b) { g.strokeStyle = 'rgba(70,50,30,.45)'; g.lineWidth = Math.max(0.5, S.k * 0.3); g.setLineDash([S.k * 0.8, S.k * 0.6]); const st = S.k * 3.2; for (let x = b.x0 - b.h; x < b.x1 + b.h; x += st) { g.beginPath(); g.moveTo(x, b.y0); g.lineTo(x + b.h, b.y1); g.moveTo(x + b.h, b.y0); g.lineTo(x, b.y1); g.stroke(); } g.setLineDash([]); }

// ---------------------------------------------------------------- герб на табарде
function emblem(g, S, p, look) {
  const s = S.k * 2.6; g.save(); g.translate(p.x, p.y);
  g.fillStyle = look.trim ? look.trim.base : '#e0b450'; g.strokeStyle = OUT; g.lineWidth = lw(S) * 0.6;
  g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.8, -s * 0.6); g.lineTo(s * 0.7, s * 0.4); g.lineTo(0, s * 1.1); g.lineTo(-s * 0.7, s * 0.4); g.lineTo(-s * 0.8, -s * 0.6); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = look.tabard.lo; g.beginPath(); g.moveTo(0, -s * 0.5); g.lineTo(s * 0.35, s * 0.2); g.lineTo(0, s * 0.6); g.lineTo(-s * 0.35, s * 0.2); g.closePath(); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- оружие
/** Точка в системе оружия: u — вдоль рукояти от хвата, v — в сторону лезвия, w — поперёк. */
const WS = 1.45;   // оружие крупнее, как в рисованных играх
const WP = B => { const sd = norm(cross(B.wDir, B.wEdge)); return (u, v = 0, w = 0) => add(B.grip, add(mul(B.wDir, u * WS), add(mul(B.wEdge, v * WS), mul(sd, w * WS)))); };
export function drawWeapon(g, S, B, look, t, o = {}) {
  const W = look.wpn, at = WP(B), kind = look.weapon;
  if (o.trail) trail(g, S, B, o.trail, look);
  if (kind === 'hatchet') {
    capsule(g, S, at(-5), at(22), 1.15, 1.05, W.wood); capsule(g, S, at(-1.5), at(2.5), 1.35, 1.35, W.wrap);
    plate(g, S, [at(16.5, 0.5), at(22, 0.5), at(24, 6.5), at(21.5, 9), at(15.5, 8.5), at(13.5, 6)], W.steel, { tex: edgeShine(at(23.6, 7.4), at(14, 7.6), S) });
    plate(g, S, [at(17, -0.9), at(21.5, -0.9), at(20.5, -3.2), at(17.5, -3.2)], MAT(tone(W.steel.base, -0.2), { metal: true }));
  } else if (kind === 'bearded') {
    capsule(g, S, at(-6), at(27), 1.3, 1.15, W.wood); capsule(g, S, at(-2), at(4), 1.5, 1.5, W.wrap);
    plate(g, S, [at(20, 0.6), at(27.5, 0.6), at(29.5, 8), at(26, 10.5), at(21, 10.2), at(14, 11.5), at(12.5, 9), at(17, 6.5)], W.steel, { tex: edgeShine(at(29, 8.5), at(13, 11), S) });
    capsule(g, S, at(26.5), at(29.5), 1.6, 0.6, W.steel);
    for (const u of [21.5, 25.5]) dotAt(g, S, at(u, 1.4, 0.4), 0.45, '#e8dcc0');
  } else if (kind === 'sword') {
    // меч: клинок вдоль dir, плоскость — edge (лезвия по обе стороны)
    capsule(g, S, at(-5.5), at(1.5), 1.25, 1.25, W.wrap); dotAt(g, S, at(-6.3), 1.8, W.gold.base);
    plate(g, S, [at(1.8, -5.5), at(3.2, -5.5), at(3.2, 5.5), at(1.8, 5.5)], W.gold);
    plate(g, S, [at(3.2, -1.9), at(29, -1.6), at(33.5, 0), at(29, 1.6), at(3.2, 1.9)], W.steel, { tex: (g2, S2) => { const a = proj(at(4), S2), b = proj(at(30), S2); g2.strokeStyle = 'rgba(80,90,105,.55)'; g2.lineWidth = S2.k * 0.45; g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(b.x, b.y); g2.stroke(); const c = proj(at(5, 1), S2), d = proj(at(28, 1), S2); g2.strokeStyle = 'rgba(255,255,255,.6)'; g2.beginPath(); g2.moveTo(c.x, c.y); g2.lineTo(d.x, d.y); g2.stroke(); } });
  } else if (kind === 'hammer') {
    capsule(g, S, at(-6.5), at(25), 1.3, 1.2, W.wood); capsule(g, S, at(-3), at(4), 1.5, 1.5, W.wrap); dotAt(g, S, at(-7), 1.5, W.gold.base);
    // боёк — объёмный брус
    const hx = 5.2, hy = 4.2, hz = 3.4, u0 = 22, u1 = 30;
    const box = (u, v, w) => at(u, v, w);
    const faces = [[[u0, -hx, -hz], [u1, -hx, -hz], [u1, hx, -hz], [u0, hx, -hz]], [[u0, -hx, hz], [u1, -hx, hz], [u1, hx, hz], [u0, hx, hz]], [[u1, -hx, -hz], [u1, hx, -hz], [u1, hx, hz], [u1, -hx, hz]], [[u0, -hx, -hz], [u0, hx, -hz], [u0, hx, hz], [u0, -hx, hz]], [[u0, hx, -hz], [u1, hx, -hz], [u1, hx, hz], [u0, hx, hz]], [[u0, -hx, -hz], [u1, -hx, -hz], [u1, -hx, hz], [u0, -hx, hz]]];
    const F = faces.map(f => ({ w: f.map(p => box(...p)), d: f.reduce((s, p) => s + proj(box(...p), S).d, 0) / 4 })).sort((a, b) => a.d - b.d);
    for (const f of F) plate(g, S, f.w, W.steel);
    band2(g, S, at, u0 + 3.2, hx, hz, W.gold); band2(g, S, at, u1 - 3.2, hx, hz, W.gold);
    if (W.gem) gemAt(g, S, at((u0 + u1) / 2, 0, hz + 0.3), 1.3, W.gem);
    capsule(g, S, at(u1 - 0.5), at(u1 + 4), 1.4, 0.4, W.steel);
    void hy;
  } else if (kind === 'greataxe') {
    capsule(g, S, at(-14), at(30), 1.5, 1.35, W.wood); for (const u of [-10, -2, 6]) capsule(g, S, at(u), at(u + 3), 1.75, 1.75, W.wrap);
    // два лезвия-полумесяца с рунами
    for (const sv of [1, -1]) plate(g, S, [at(20, sv * 1), at(29, sv * 1), at(34, sv * 5.5), at(37.5, sv * 11.5), at(32, sv * 12.6), at(25, sv * 13.2), at(18, sv * 12.6), at(12, sv * 11.5), at(15.5, sv * 5.5)], W.steel, { round: true, tex: (g2, S2, b) => { g2.strokeStyle = rgba(W.glow, 0.95); g2.shadowColor = W.glow; g2.shadowBlur = 6 * S2.k / 3; g2.lineWidth = S2.k * 0.5; for (const [u, v] of [[22, 6], [26, 8], [29, 6]]) { const p = proj(at(u, sv * v), S2); g2.beginPath(); g2.moveTo(p.x - S2.k, p.y - S2.k); g2.lineTo(p.x, p.y + S2.k); g2.lineTo(p.x + S2.k, p.y - S2.k * 0.4); g2.stroke(); } g2.shadowBlur = 0; edgeShine(at(36.5, sv * 11.5), at(13, sv * 11.5), S2)(g2, S2); } });
    capsule(g, S, at(29), at(36), 1.9, 0.4, W.gold); gemAt(g, S, at(25, 0, 1.4), 1.6, W.gem, W.glow);
  }
}
/** Полоса-обвязка вокруг бойка молота. */
function band2(g, S, at, u, hx, hz, mat) { const pts = [[u, -hx - 0.3, hz + 0.3], [u + 1.2, -hx - 0.3, hz + 0.3], [u + 1.2, hx + 0.3, hz + 0.3], [u, hx + 0.3, hz + 0.3]].map(p => at(...p)); plate(g, S, pts, mat); }
/** Блик по кромке лезвия. */
function edgeShine(a, b, S) { return (g, S2) => { const A = proj(a, S2), Bq = proj(b, S2); g.strokeStyle = 'rgba(255,255,250,.85)'; g.lineWidth = S2.k * 0.7; g.lineCap = 'round'; g.beginPath(); g.moveTo(A.x, A.y); g.quadraticCurveTo((A.x + Bq.x) / 2 + (Bq.y - A.y) * 0.15, (A.y + Bq.y) / 2 - (Bq.x - A.x) * 0.15, Bq.x, Bq.y); g.stroke(); }; }
/** След удара — светлый серп по дуге конца оружия. tr: массив точек мира (конец оружия по времени). */
function trail(g, S, B, tr, look) {
  if (!tr || tr.length < 2) return; const P = tr.map(w => proj(w, S));
  for (let i = 1; i < P.length; i++) { const k = i / P.length; g.strokeStyle = look.glow ? `rgba(200,150,255,${0.6 * k})` : `rgba(255,250,235,${0.6 * k})`; g.lineWidth = S.k * (1 + 5 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(P[i - 1].x, P[i - 1].y); g.lineTo(P[i].x, P[i].y); g.stroke(); }
}
