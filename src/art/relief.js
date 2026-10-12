// Рисование рельефа (v71): стенки обрывов и травяные откосы, кромки, склоны и лестницы, свет на ярусах.
// Модель (высота, края, склоны) — src/world/relief.js. Вид сверху-сбоку: всё на высоте h рисуется выше на h.
import { LH } from '../world/relief.js';
const O = '#24180f';
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

/** Обвести многоугольник (сдвинутый по y на dy). */
export function poly(g, P, dy = 0) { g.moveTo(P[0][0], P[0][1] + dy); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1] + dy); g.closePath(); }

/** Свет на ярусе: низина сырее и темнее, высота суше и светлее. */
export const TINT = L => L <= -1 ? 'rgba(30,50,25,.30)' : L < 0 ? 'rgba(30,50,25,.14)' : L >= 2 ? 'rgba(230,220,190,.13)' : L >= 1 ? 'rgba(255,240,180,.13)' : L > 0 ? 'rgba(255,240,180,.04)' : null;

/** Откос в пол яруса сверху: к середине светлеет (бугор) или темнеет (ложбина), свет слева сверху. Координаты экрана: dy = −L·LH. */
export function softGlow(g, q, L, dy) {
  const P = q.poly; let cx = 0, cy = 0; for (const p of P) { cx += p[0]; cy += p[1]; } cx /= P.length; cy /= P.length;
  const rr = Math.min(900, Math.max(...P.map(p => Math.hypot(p[0] - cx, p[1] - cy))));
  g.save(); g.beginPath(); poly(g, P, dy); g.clip();
  const gr = g.createRadialGradient(cx - rr * 0.3, cy + dy - rr * 0.3, rr * 0.1, cx, cy + dy, rr * 1.05);
  if (L > 0) { gr.addColorStop(0, 'rgba(255,250,200,.16)'); gr.addColorStop(0.7, 'rgba(255,250,200,0)'); gr.addColorStop(1, 'rgba(20,30,10,.12)'); }
  else { gr.addColorStop(0, 'rgba(20,35,15,.14)'); gr.addColorStop(0.75, 'rgba(20,35,15,.05)'); gr.addColorStop(1, 'rgba(255,250,200,.08)'); }
  g.fillStyle = gr; g.fillRect(cx - rr * 1.2, cy + dy - rr * 1.2, rr * 2.4, rr * 2.4); g.restore();
}
/** Тень у подножия каменного обрыва (на ярусе ниже). */
export function footShadow(g, e, dy) {
  const gr = g.createLinearGradient(0, e.y0 + dy, 0, e.y0 + dy + 28); gr.addColorStop(0, 'rgba(15,10,5,.38)'); gr.addColorStop(1, 'rgba(15,10,5,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(e.x0, e.y0 + dy - 2); g.lineTo(e.x1, e.y1 + dy - 2); g.lineTo(e.x1, e.y1 + dy + 28); g.lineTo(e.x0, e.y0 + dy + 28); g.closePath(); g.fill();
}

/**
 * Стенка под краем e уровня L. Камень (обрыв) — слои породы, трещины, кусты и глыбы у подножия;
 * откос (в пол яруса) — травяной склон без камня, светлее сверху, с дёрном по кромке.
 * Рисуется в мировых координатах (y экрана = y − h).
 */
export function drawFace(g, e, L, seed) {
  if (e.ny < -0.05) return;
  const top = L * LH, bot = e.bot * LH, H = top - bot, r = rnd(Math.abs(Math.round(seed)) + 11), dens = Math.hypot(e.x1 - e.x0, e.y1 - e.y0) / 20;
  const q = (a, b) => { g.beginPath(); g.moveTo(e.x0, e.y0 - top + a); g.lineTo(e.x1, e.y1 - top + a); g.lineTo(e.x1, e.y1 - top + b); g.lineTo(e.x0, e.y0 - top + b); g.closePath(); };
  const lit = Math.max(0, Math.min(1, 0.55 - e.nx * 0.45 + e.ny * 0.1));
  if (e.soft) {
    const c0 = [Math.round(100 + lit * 30), Math.round(142 + lit * 26), Math.round(60 + lit * 16)], c1 = c0.map(v => Math.round(v * 0.74)), c2 = c0.map(v => Math.round(v * 0.86));
    const gr = g.createLinearGradient(0, e.y0 - top, 0, e.y0 - bot); gr.addColorStop(0, `rgb(${c0})`); gr.addColorStop(0.6, `rgb(${c1})`); gr.addColorStop(1, `rgb(${c2})`);
    q(-1, H + 1.5); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(40,70,20,.35)'; g.lineWidth = 1;   // травинки по откосу
    if (r() < dens * 0.6) for (let k = 0; k < 2; k++) { const t = r(), x = e.x0 + (e.x1 - e.x0) * t, y = e.y0 + (e.y1 - e.y0) * t - top + 3 + r() * (H - 6); g.beginPath(); g.moveTo(x, y + 3); g.lineTo(x - 1.5, y - 2); g.moveTo(x, y + 3); g.lineTo(x + 2, y - 1.5); g.stroke(); }
    return;
  }
  const col = [Math.round(108 + lit * 40), Math.round(98 + lit * 36), Math.round(86 + lit * 30)];
  const gr = g.createLinearGradient(0, e.y0 - top, 0, e.y0 - bot); gr.addColorStop(0, `rgb(${col})`); gr.addColorStop(1, `rgb(${col.map(v => Math.round(v * 0.62))})`);
  q(-1, H + 1); g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(36,24,15,.26)'; g.lineWidth = 1;
  for (let k = 0.3; k < 0.95; k += 0.3 * (H / LH > 0.9 ? 1 : 2)) { const off = (r() - 0.5) * 4; g.beginPath(); g.moveTo(e.x0, e.y0 - top + H * k + off); g.lineTo(e.x1, e.y1 - top + H * k + off + (r() - 0.5) * 3); g.stroke(); }
  if (r() < 0.45 * dens) { const x = e.x0 + (e.x1 - e.x0) * r(), y = e.y0 - top + 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + H * 0.4); g.lineTo(x + (r() - 0.5) * 8, y + H * 0.75); g.stroke(); }
  g.fillStyle = 'rgba(255,245,220,.10)'; q(0, 4); g.fill();
  // у подножия: глыбы, кусты, трава
  const x = e.x0 + (e.x1 - e.x0) * r(), y = e.y0 + (e.y1 - e.y0) * 0.5 - bot + 2, roll = r() / Math.max(0.05, dens);
  if (roll < 0.16) { const s = 4 + r() * 6; g.fillStyle = `rgb(${col.map(v => Math.round(v * 0.92))})`; g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, s, s * 0.65, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.3, s * 0.4, s * 0.25, 0, 0, 7); g.fill(); }
  else if (roll < 0.22) { for (const [dx, s, c] of [[-5, 7, '#3f6a2a'], [4, 8, '#4f7a30'], [0, 6, '#5f8a3a']]) { g.fillStyle = O; g.beginPath(); g.arc(x + dx, y - s * 0.5, s + 1.2, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x + dx, y - s * 0.5, s, 0, 7); g.fill(); } }
}
/** Кромка: у обрыва — обводка, свет на ребре и травяной козырёк; у откоса — мягкая светлая линия. */
export function drawRim(g, e, L) {
  const top = L * LH; g.lineCap = 'round';
  if (e.soft) { if (e.ny > 0.05) { g.strokeStyle = `rgba(220,240,160,${(0.35 * Math.min(1, e.ny * 1.6)).toFixed(3)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 0.5); g.lineTo(e.x1, e.y1 - top - 0.5); g.stroke(); } return; }
  if (e.ny > -0.05) {
    g.strokeStyle = O; g.lineWidth = 3; g.beginPath(); g.moveTo(e.x0, e.y0 - top + 1); g.lineTo(e.x1, e.y1 - top + 1); g.stroke();
    g.strokeStyle = L > 1 ? '#7a8a50' : L <= 0 ? '#4e6e30' : '#5f8a3a'; g.lineWidth = 3.6; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 1); g.lineTo(e.x1, e.y1 - top - 1); g.stroke();
    g.strokeStyle = 'rgba(220,240,160,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 2.5); g.lineTo(e.x1, e.y1 - top - 2.5); g.stroke();
  } else { g.strokeStyle = 'rgba(36,24,15,.28)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(e.x0, e.y0 - top); g.lineTo(e.x1, e.y1 - top); g.stroke(); }
}

/** Ось склона плавной кривой с высотой и шириной в каждой точке: [{x,y,h,w,nx,ny}]. */
function rampLine(rp) {
  const P = rp.pts, out = [];
  // кривая через точки (Катмулл-Ром), чтобы повороты были плавными
  const pt = i => P[Math.max(0, Math.min(P.length - 1, i))];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2), n = Math.max(6, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 6));
    for (let k = 0; k < n + (i === P.length - 2 ? 1 : 0); k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: cr(p0[0], p1[0], p2[0], p3[0]), y: cr(p0[1], p1[1], p2[1], p3[1]), l: p1[2] + (p2[2] - p1[2]) * t });
    }
  }
  const lowFirst = P[0][2] <= P[P.length - 1][2];
  out.forEach((p, i) => {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)], d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    p.nx = -(b.y - a.y) / d; p.ny = (b.x - a.x) / d; p.h = p.l * LH;
    const f = i / (out.length - 1), k = lowFirst ? 1 - f : f; p.w = rp.w / 2 * (1 + 0.5 * k * k);
  });
  return out;
}
const sidePts = (line, s, kw = 1, wob = null) => line.map((p, i) => { const w = p.w * kw * (wob ? 1 + (wob[i % wob.length] - 0.5) * 0.12 : 1); return [p.x + p.nx * w * s, p.y + p.ny * w * s - p.h]; });
function curve(g, pts, move = true) { if (move) g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]); }

/** Склон или лестница целиком (вся ломаная): раструб внизу, плавные края, земляные борта, тропа или ступени из камней. */
export function drawRampWhole(g, rp, seed = 1) {
  const line = rampLine(rp), r = rnd(seed), wob = Array.from({ length: 23 }, () => r());
  const minL = Math.min(...rp.pts.map(p => p[2])), floor = minL * LH, raised = minL >= 0 && Math.max(...rp.pts.map(p => p[2])) > 0;
  if (rp.kind === 'road') {   // съезд дороги: та же дорога, лентой по склону (без бортов и травы)
    const C = line.map(p => [p.x, p.y - p.h]); g.lineCap = 'butt'; g.lineJoin = 'round';
    for (const [w, c] of [[78, 'rgba(90,70,40,.55)'], [64, '#b39a6a'], [30, 'rgba(210,190,140,.45)']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); curve(g, C); g.stroke(); }
    for (let i = 0; i < 30; i++) { const j = Math.floor(r() * line.length), p = line[j], k = (r() - 0.5) * 0.8, x = p.x + p.nx * 32 * k, y = p.y + p.ny * 32 * k - p.h; g.fillStyle = r() < 0.5 ? 'rgba(120,100,70,.55)' : 'rgba(230,215,180,.5)'; g.beginPath(); g.ellipse(x, y, 2 + r() * 2, 1.4 + r(), 0, 0, 7); g.fill(); }
    return;
  }
  const L = sidePts(line, 1, 1, wob), Rt = sidePts(line, -1, 1, wob);
  // борта насыпи: земля под травой, до уровня нижнего конца — только у насыпи над землёй
  if (raised) [[L, 1], [Rt, -1]].forEach(([S, sd]) => {
    // насыпь: борт — пологий земляной откос, к низу расходится в стороны и сливается с травой
    const base = S.map((p, i) => { const q = line[i], dh = q.h - floor; return [p[0] + q.nx * sd * dh * 0.7, p[1] + q.ny * sd * dh * 0.7 + dh]; });
    g.beginPath(); curve(g, S); const bb = [...base].reverse(); g.lineTo(bb[0][0], bb[0][1]); curve(g, bb, false); g.closePath();
    const yTop = Math.min(...S.map(p => p[1])), yBot = Math.max(...base.map(p => p[1]));
    const gr = g.createLinearGradient(0, yTop, 0, yBot); gr.addColorStop(0, '#73903f'); gr.addColorStop(0.3, '#7d6a4a'); gr.addColorStop(0.75, '#5f6e38'); gr.addColorStop(1, 'rgba(95,130,56,0)'); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(70,95,35,.6)'; g.lineWidth = 1; for (let i = 2; i < base.length - 2; i += 4) { const [x, y] = base[i], [tx, ty] = S[i]; const mx = tx + (x - tx) * 0.6, my = ty + (y - ty) * 0.6; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx - 2, my - 5); g.moveTo(mx, my); g.lineTo(mx + 2, my - 4); g.stroke(); }
  });
  // полотно: трава по краям
  const surf = () => { g.beginPath(); curve(g, L); const rr = [...Rt].reverse(); curve(g, rr, false); g.closePath(); };
  const road = rp.kind === 'road';
  surf(); g.fillStyle = road ? '#6a8a40' : rp.kind === 'stairs' ? '#6f8a42' : '#6c9442'; g.fill();
  g.save(); surf(); g.clip();
  // свет слева сверху на полотне
  const yT = Math.min(...L.map(p => p[1]), ...Rt.map(p => p[1])), yB = Math.max(...L.map(p => p[1]), ...Rt.map(p => p[1]));
  if (rp.kind === 'stairs') {
    // ступени — ряды неровных камней поперёк, сверху вниз (дальние первыми)
    const n = Math.max(4, Math.round(Math.abs(line[line.length - 1].h - line[0].h) / 7 + line.length / 6));
    const idx = Array.from({ length: n }, (_, i) => Math.round(i / (n - 1) * (line.length - 1)));
    idx.sort((a, b) => (line[a].y - line[a].h) - (line[b].y - line[b].h));
    for (const i of idx) {
      const p = line[i], stones = 3 + (p.w > 30 ? 1 : 0), w = p.w * 0.86;
      for (let k = 0; k < stones; k++) {
        const t = -1 + (k + 0.5) / stones * 2, x = p.x + p.nx * w * t, y = p.y + p.ny * w * t - p.h + Math.abs(t) * 1.5, sw = w / stones * (0.95 + r() * 0.2), sh = 5 + r() * 1.5;
        g.fillStyle = 'rgba(20,12,6,.35)'; g.beginPath(); g.ellipse(x + 1, y + 2.5, sw, sh, Math.atan2(p.ny, p.nx), 0, 7); g.fill();
        const c = 150 + Math.floor(r() * 30); g.fillStyle = `rgb(${c},${c - 8},${c - 20})`; g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, sw, sh, Math.atan2(p.ny, p.nx), 0, 7); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,250,235,.35)'; g.beginPath(); g.ellipse(x - sw * 0.25, y - sh * 0.35, sw * 0.45, sh * 0.35, Math.atan2(p.ny, p.nx), 0, 7); g.fill();
      }
    }
  } else if (road) {
    // съезд дороги: та же дорога, светлая середина, камушки
    const C = line.map(p => [p.x, p.y - p.h]); g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(90,70,40,.35)'; g.lineWidth = 78; g.beginPath(); curve(g, C); g.stroke(); g.strokeStyle = '#b39a6a'; g.lineWidth = 64; g.stroke();
    g.strokeStyle = 'rgba(210,190,140,.45)'; g.lineWidth = 30; g.beginPath(); curve(g, C); g.stroke();
    for (let i = 0; i < 30; i++) { const j = Math.floor(r() * line.length), p = line[j], k = (r() - 0.5) * 1.4, x = p.x + p.nx * p.w * k, y = p.y + p.ny * p.w * k - p.h; g.fillStyle = r() < 0.5 ? 'rgba(120,100,70,.55)' : 'rgba(230,215,180,.5)'; g.beginPath(); g.ellipse(x, y, 2 + r() * 2, 1.4 + r(), 0, 0, 7); g.fill(); }
  } else {
    // тропа посередине чуть виляет, края — трава с дёрном
    const C = line.map((p, i) => { const k = Math.sin(i / 7 + seed) * 0.12; return [p.x + p.nx * p.w * k, p.y + p.ny * p.w * k - p.h]; });
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [w, c] of [[1.15, 'rgba(110,85,50,.35)'], [0.95, '#a8885a'], [0.55, '#b89a6a']]) { g.strokeStyle = c; g.lineWidth = line[Math.floor(line.length / 2)].w * w; g.beginPath(); curve(g, C); g.stroke(); }
    for (let i = 0; i < 40; i++) { const j = Math.floor(r() * line.length), p = line[j], k = (r() - 0.5) * 0.9, x = p.x + p.nx * p.w * k, y = p.y + p.ny * p.w * k - p.h; g.fillStyle = r() < 0.5 ? 'rgba(80,60,35,.35)' : 'rgba(240,225,190,.35)'; g.beginPath(); g.ellipse(x, y, 1.5 + r() * 2.5, 1 + r(), 0, 0, 7); g.fill(); }
  }
  const gr = g.createLinearGradient(0, yT, 0, yB); gr.addColorStop(0, 'rgba(255,250,210,.10)'); gr.addColorStop(1, 'rgba(20,15,5,.10)'); g.fillStyle = gr; g.fillRect(-1e4, yT, 2e4, yB - yT);
  g.restore();
  // кромки: дёрн с травинками, без прямых линий (у дороги — земляная обочина)
  if (road) return;
  for (const S of [L, Rt]) { g.strokeStyle = 'rgba(40,60,20,.55)'; g.lineWidth = 2; g.beginPath(); curve(g, S); g.stroke(); g.strokeStyle = '#5f8a3a'; g.lineWidth = 1.2; for (let i = 2; i < S.length - 2; i += 3) { const [x, y] = S[i]; g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x - 2, y - 4); g.moveTo(x, y + 1); g.lineTo(x + 2, y - 4); g.stroke(); } }
}
