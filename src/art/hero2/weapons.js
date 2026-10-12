// Оружие воина в объёме (эскиз v74): лезвия с толщиной (обух толще, кромка тонкая, грани и фаска), древко с обмоткой и кольцами,
// боёк молота брусом с гранями. Рисуется двумя проходами: древко (под кулаком) и навершие (по своей глубине).
// Система оружия: u — вдоль древка от хвата (вверх), v — в сторону лезвия, w — поперёк (толщина).
import { proj, add, sub, mul, dot, norm, cross, CAM } from './rig.js';
import { MAT, tone, rgba, capsule, limb, plate, gemAt, dotAt, lw, OUT, LIGHT3, smooth } from './paint.js';

/** Точка в системе оружия. */
export const weaponFrame = B => { const sd = norm(cross(B.wDir, B.wEdge)); return { sd, at: (u, v = 0, w = 0) => add(B.grip, add(mul(B.wDir, u), add(mul(B.wEdge, v), mul(sd, w)))) }; };

/** Пластина с толщиной: контур (u,v), толщина th(u,v). Задняя сторона, стенки и лицевая — с фаской у кромки. */
export function solid(g, S, F, uv, th, mat, o = {}) {
  const { at, sd } = F, s = dot(sd, CAM.toCam) >= 0 ? 1 : -1;
  const fr = uv.map(([u, v]) => at(u, v, s * th(u, v) / 2)), bk = uv.map(([u, v]) => at(u, v, -s * th(u, v) / 2));
  const P = a => a.map(w => proj(w, S));
  const fp = P(fr), bp = P(bk);
  const path = pts => { const q = new Path2D(); if (o.round) smooth(q, pts); else { pts.forEach((p, i) => i ? q.lineTo(p.x, p.y) : q.moveTo(p.x, p.y)); q.closePath(); } return q; };
  // задняя сторона — тёмная
  const bq = path(bp); g.fillStyle = mat.lo; g.fill(bq); g.strokeStyle = OUT; g.lineWidth = lw(S); g.stroke(bq);
  // стенки (торцы) — по глубине
  const walls = [];
  for (let i = 0; i < uv.length; i++) { const j = (i + 1) % uv.length, q = [fr[i], fr[j], bk[j], bk[i]]; const n = norm(cross(sub(q[1], q[0]), sub(q[3], q[0]))); walls.push({ q: P(q), d: (fp[i].d + fp[j].d) / 2, lit: Math.abs(dot(n, LIGHT3)) }); }
  walls.sort((a, b) => a.d - b.d);
  for (const w of walls) { g.beginPath(); w.q.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fillStyle = tone(mat.base, -0.45 + w.lit * 0.55); g.fill(); g.strokeStyle = rgba(OUT, 0.6); g.lineWidth = lw(S) * 0.5; g.stroke(); }
  // лицевая сторона
  let b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; for (const p of fp) { b.x0 = Math.min(b.x0, p.x); b.y0 = Math.min(b.y0, p.y); b.x1 = Math.max(b.x1, p.x); b.y1 = Math.max(b.y1, p.y); }
  const lit = Math.abs(dot(sd, LIGHT3)), base = tone(mat.base, (lit - 0.45) * 0.5);
  if (o.ridge) {
    // гранёный клинок: половина к свету — светлее
    for (const half of [1, -1]) {
      const pts = uv.map(([u, v], i) => ({ u, v, i })).filter(p => p.v * half >= -0.01).map(p => p.v * half <= 0.01 ? proj(at(p.u, 0, s * th(p.u, 0) / 2), S) : fp[p.i]);
      if (pts.length < 3) continue;
      g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath();
      const k = half > 0 ? 0.32 : -0.12; const gr = g.createLinearGradient(b.x0, b.y0, b.x1, b.y1); gr.addColorStop(0, tone(base, k + 0.25)); gr.addColorStop(1, tone(base, k - 0.25)); g.fillStyle = gr; g.fill();
    }
  } else {
    const gr = g.createLinearGradient(b.x0, b.y0, b.x1, b.y1); gr.addColorStop(0, tone(base, mat.metal ? 0.5 : 0.2)); gr.addColorStop(0.45, base); gr.addColorStop(1, tone(base, mat.metal ? -0.5 : -0.3)); g.fillStyle = gr; g.fill(path(fp));
  }
  const fq = path(fp);
  if (o.tex) { g.save(); g.clip(fq); o.tex(g, S, b, fp); g.restore(); }
  if (mat.glow) { g.save(); g.shadowColor = mat.glow; g.shadowBlur = 8 * S.k / 3; g.strokeStyle = rgba(mat.glow, 0.7); g.lineWidth = lw(S); g.stroke(fq); g.restore(); }
  g.strokeStyle = OUT; g.lineWidth = lw(S); g.stroke(fq);
  // фаска по кромке (точки с флагом edge): светлая полоса
  if (o.edge) { const E = o.edge.map(([u, v]) => proj(at(u, v, s * 0.15), S)); g.strokeStyle = 'rgba(255,255,250,.9)'; g.lineWidth = Math.max(1, S.k * 0.55); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); E.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke(); }
  return { fp, b };
}

/** Брус (боёк молота) от u0 до u1, полуширина hv, полутолщина hw, со снятыми гранями. */
function block(g, S, F, u0, u1, hv, hw, mat, ch = 1.2) {
  const { at } = F, C = [];
  // восьмиугольник в сечении (v,w) со скошенными углами, вытянутый вдоль u
  const sec = [[hv, hw - ch], [hv - ch, hw], [-hv + ch, hw], [-hv, hw - ch], [-hv, -hw + ch], [-hv + ch, -hw], [hv - ch, -hw], [hv, -hw + ch]];
  for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; C.push([[u0, ...sec[i]], [u1, ...sec[i]], [u1, ...sec[j]], [u0, ...sec[j]]]); }
  C.push(sec.map(p => [u0, ...p])); C.push(sec.map(p => [u1, ...p]));
  const faces = C.map(f => { const w = f.map(p => at(...p)), P = w.map(q => proj(q, S)); const n = norm(cross(sub(w[1], w[0]), sub(w[2], w[0]))); const c = mul(w.reduce((s, q) => add(s, q), [0, 0, 0]), 1 / w.length); const out = dot(n, sub(c, at((u0 + u1) / 2))) < 0 ? mul(n, -1) : n; return { P, d: P.reduce((s, p) => s + p.d, 0) / P.length, vis: dot(out, CAM.toCam), lit: dot(out, LIGHT3) }; });
  faces.filter(f => f.vis > -0.02).sort((a, b) => a.d - b.d).forEach(f => { g.beginPath(); f.P.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fillStyle = tone(mat.base, -0.45 + (f.lit + 1) * 0.36); g.fill(); g.strokeStyle = OUT; g.lineWidth = lw(S) * 0.8; g.stroke(); });
}
/** Древко: дерево с волокнами, обмотка, металлические кольца, навершие. */
function haft(g, S, F, u0, u1, r, W, o = {}) {
  const { at } = F;
  limb(g, S, at(u0), at(u1), r, r * 1.05, r * 0.95, W.wood, (g2, S2, q) => { g2.strokeStyle = rgba(tone(W.wood.base, -0.5), 0.5); g2.lineWidth = Math.max(0.5, S2.k * 0.22); for (const k of [-0.3, 0.25]) { g2.beginPath(); g2.moveTo(q.A.x + q.nx * q.r1 * k, q.A.y + q.ny * q.r1 * k); g2.lineTo(q.B.x + q.nx * q.r2 * k, q.B.y + q.ny * q.r2 * k); g2.stroke(); } });
  // обмотка рукояти: витки
  const [w0, w1] = o.wrap || [-4, 5];
  limb(g, S, at(w0), at(w1), r * 1.18, r * 1.2, r * 1.18, W.wrap, (g2, S2, q) => { g2.strokeStyle = rgba(OUT, 0.45); g2.lineWidth = Math.max(0.5, S2.k * 0.3); const n = Math.round((w1 - w0) / 1.3); for (let i = 1; i < n; i++) { const t = i / n, x = q.A.x + (q.B.x - q.A.x) * t, y = q.A.y + (q.B.y - q.A.y) * t; g2.beginPath(); g2.moveTo(x + q.nx * q.r1 * 1.2 - q.ux * S2.k * 0.5, y + q.ny * q.r1 * 1.2 - q.uy * S2.k * 0.5); g2.lineTo(x - q.nx * q.r1 * 1.2 + q.ux * S2.k * 0.5, y - q.ny * q.r1 * 1.2 + q.uy * S2.k * 0.5); g2.stroke(); } });
  for (const u of o.rings || []) limb(g, S, at(u), at(u + 1.2), r * 1.32, r * 1.35, r * 1.32, W.gold || W.steel);
  if (o.pommel) blobAt(g, S, at(u0 - 0.6), r * 1.5, W.gold || W.steel);
}
function blobAt(g, S, w, r, mat) { capsule(g, S, w, w, r, r, mat); }

/** Нарисовать оружие. part: 'haft' — древко/рукоять (под кулаком), 'head' — навершие, лезвие, боёк. */
export function drawWeapon2(g, S, B, look, part) {
  const W = look.wpn, F = weaponFrame(B), at = F.at, k = look.weapon;
  const wedge = (tSpine, tEdge, vMax) => (u, v) => Math.max(0.25, tSpine + (tEdge - tSpine) * Math.min(1, Math.abs(v) / vMax));
  if (k === 'hatchet') {
    if (part === 'haft') haft(g, S, F, -12, 33, 1.7, W, { wrap: [-6, 4], rings: [] });
    else {
      // обух и проушина
      block(g, S, F, 25.5, 33.5, 2.2, 2.0, W.steel, 0.7);
      solid(g, S, F, [[26, 1.8], [33, 1.8], [36, 6.5], [38.5, 12.5], [33, 13.8], [27.5, 13.6], [22, 12.6], [24.5, 7]], wedge(3.2, 0.3, 13), W.steel, { edge: [[38.5, 12.5], [35.5, 13.4], [31, 13.9], [26, 13.4], [22, 12.6]] });
      dotAt(g, S, at(29.5, 0.4, 2.1), 0.7, '#e8dcc0'); dotAt(g, S, at(29.5, 0.4, -2.1), 0.7, '#e8dcc0');
    }
  } else if (k === 'bearded') {
    if (part === 'haft') haft(g, S, F, -14, 40, 1.85, W, { wrap: [-7, 5], rings: [30] });
    else {
      block(g, S, F, 31, 40, 2.4, 2.2, W.steel, 0.8);
      solid(g, S, F, [[32, 2], [40, 2], [43, 7], [45.5, 14], [40, 15.5], [33, 16.5], [24, 17.5], [19.5, 16], [23, 12], [29, 6.5]], wedge(3.6, 0.3, 16), W.steel, { edge: [[45.5, 14], [42, 15.2], [36, 16.2], [29, 17.2], [22, 17.3], [19.5, 16]], tex: (g2, S2) => { for (const [u, v] of [[36, 6], [33, 10]]) dotAt(g2, S2, at(u, v, 1.6), 0.55, '#e8dcc0'); } });
      capsule(g, S, at(39.5), at(44), 1.9, 0.5, W.steel);
    }
  } else if (k === 'sword') {
    if (part === 'haft') {
      limb(g, S, at(-9), at(0), 1.55, 1.7, 1.6, W.wrap, (g2, S2, q) => { g2.strokeStyle = rgba(OUT, 0.5); g2.lineWidth = Math.max(0.5, S2.k * 0.3); for (let i = 1; i < 7; i++) { const t = i / 7, x = q.A.x + (q.B.x - q.A.x) * t, y = q.A.y + (q.B.y - q.A.y) * t; g2.beginPath(); g2.moveTo(x + q.nx * q.r1 * 1.1, y + q.ny * q.r1 * 1.1); g2.lineTo(x - q.nx * q.r1 * 1.1 + q.ux * S2.k, y - q.ny * q.r1 * 1.1 + q.uy * S2.k); g2.stroke(); } });
      capsule(g, S, at(-11.2), at(-11.2), 2.4, 2.4, W.gold); gemAt(g, S, at(-11.2, 0, 2.2), 0.9, '#e04848');
    } else {
      // гарда — объёмная перекладина с завитками
      limb(g, S, at(0.6, -8.5), at(0.6, 8.5), 1.5, 1.8, 1.5, W.gold);
      for (const sv of [1, -1]) capsule(g, S, at(0.6, sv * 8.5), at(-0.8, sv * 9.6), 1.6, 1.1, W.gold);
      limb(g, S, at(0), at(3), 2.6, 2.7, 2.2, W.gold);
      solid(g, S, F, [[2.5, 2.9], [40, 2.4], [46, 0], [40, -2.4], [2.5, -2.9]], (u, v) => Math.max(0.2, 1.8 * (1 - Math.abs(v) / 2.9)), W.steel, { ridge: true, edge: [[3, 2.85], [40, 2.35], [46, 0]], tex: (g2, S2) => { const a = proj(at(4, 0, 0.9), S2), b = proj(at(30, 0, 0.9), S2); g2.strokeStyle = 'rgba(60,70,85,.55)'; g2.lineWidth = Math.max(0.6, S2.k * 0.6); g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(b.x, b.y); g2.stroke(); } });
    }
  } else if (k === 'hammer') {
    if (part === 'haft') haft(g, S, F, -14, 34, 1.85, W, { wrap: [-7, 5], rings: [24, 27], pommel: true });
    else {
      block(g, S, F, 31, 42, 7.2, 4.8, W.steel, 1.6);
      // окованные пояса и клюв-шип сзади
      block(g, S, F, 33.8, 34.8, 7.45, 5.05, W.gold, 1.5); block(g, S, F, 38.2, 39.2, 7.45, 5.05, W.gold, 1.5);
      capsule(g, S, at(36.5, -7), at(36.5, -13.5), 2.6, 0.5, W.steel);
      capsule(g, S, at(41.5), at(47), 2, 0.5, W.steel);
      if (W.gem) gemAt(g, S, at(36.5, 7.7, 0), 1.6, W.gem);
    }
  } else if (k === 'greataxe') {
    if (part === 'haft') haft(g, S, F, -26, 44, 2.1, W, { wrap: [-9, 4], rings: [-20, 14, 36], pommel: true });
    else {
      block(g, S, F, 31, 43, 2.8, 2.6, W.gold, 0.9);
      for (const sv of [1, -1]) solid(g, S, F, [[32, sv * 2.4], [42, sv * 2.4], [46, sv * 7], [51, sv * 16.5], [44, sv * 18.2], [37, sv * 18.8], [30, sv * 18.2], [23, sv * 16.5], [28, sv * 7]], wedge(3.8, 0.3, 18), W.steel,
        { edge: [[51, sv * 16.5], [46, sv * 17.9], [37, sv * 18.8], [28, sv * 17.9], [23, sv * 16.5]], tex: (g2, S2) => { if (!W.glow) return; g2.strokeStyle = rgba(W.glow, 0.95); g2.shadowColor = W.glow; g2.shadowBlur = 6 * S2.k / 3; g2.lineWidth = Math.max(0.8, S2.k * 0.55); for (const [u, v] of [[33, 10], [37, 13], [41, 10]]) { const p = proj(at(u, sv * v, 1.5), S2); g2.beginPath(); g2.moveTo(p.x - S2.k, p.y - S2.k); g2.lineTo(p.x, p.y + S2.k); g2.lineTo(p.x + S2.k, p.y - S2.k * 0.4); g2.stroke(); } g2.shadowBlur = 0; } });
      capsule(g, S, at(42.5), at(51), 2.2, 0.5, W.gold); gemAt(g, S, at(37, 0, 2.8), 1.9, W.gem, W.glow);
    }
  }
}
