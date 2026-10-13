// «Пластилиновый» камень (v88, проба): крупные скруглённые блоки с фаской, свет слева сверху, без тёмной обводки,
// щели между блоками тёмные, на гранях вмятины. Всё — кистью canvas, картинки кэшируются как обычно.
const rnd = s => { s = Math.abs(s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const hex = c => parseInt(c.slice(1), 16);
export const mix = (a, b, t) => { const pa = hex(a), pb = hex(b); const c = i => Math.round(((pa >> i) & 255) * (1 - t) + ((pb >> i) & 255) * t); return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1); };
export const SAND = { base: '#d8c39e', light: '#f2e6c8', dark: '#a98f68', deep: '#6f5840', gap: '#5a4530' };
export const GREY = { base: '#b7b2a8', light: '#dbd7cf', dark: '#86807a', deep: '#57524c', gap: '#403b36' };

/** Скруглённый многоугольник. */
export function rpoly(g, pts, r) {
  const n = pts.length; g.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1, rr = Math.min(r, d1 / 2, d2 / 2);
    const a = [p1[0] + (p0[0] - p1[0]) / d1 * rr, p1[1] + (p0[1] - p1[1]) / d1 * rr], b = [p1[0] + (p2[0] - p1[0]) / d2 * rr, p1[1] + (p2[1] - p1[1]) / d2 * rr];
    if (i === 0) g.moveTo(a[0], a[1]); else g.lineTo(a[0], a[1]);
    g.quadraticCurveTo(p1[0], p1[1], b[0], b[1]);
  }
  g.closePath();
}
/** Один блок: многоугольник pts (по часовой: верх-лево, верх-право, низ-право, низ-лево), палитра P, фаска bev, зерно seed; k — затемнение (0..1, тень формы). */
export function block(g, pts, P = SAND, bev = 3, seed = 1, k = 0) {
  const r = rnd(seed), xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const base = mix(P.base, P.deep, k * 0.55), light = mix(P.light, P.dark, k * 0.5), dark = mix(P.dark, P.deep, k * 0.5);
  const rr = bev * 1.8;
  // тело: светлее вверху слева
  const gr = g.createLinearGradient(x0, y0, x0 + (x1 - x0) * 0.6, y1); gr.addColorStop(0, mix(base, light, 0.3)); gr.addColorStop(1, mix(base, dark, 0.3));
  rpoly(g, pts, rr); g.fillStyle = gr; g.fill();
  g.save(); rpoly(g, pts, rr); g.clip();
  // фаска: внутренний контур — тёмная полоса снизу/справа, светлая сверху/слева
  g.lineWidth = bev * 2.2; g.lineJoin = 'round';
  g.strokeStyle = mix(base, dark, 0.6); g.save(); g.translate(bev * 0.8, bev * 0.8); rpoly(g, pts, rr); g.stroke(); g.restore();
  g.strokeStyle = mix(base, light, 0.85); g.save(); g.translate(-bev * 0.8, -bev * 0.8); rpoly(g, pts, rr); g.stroke(); g.restore();
  // грань: ровная площадка внутри фаски
  const inner = pts.map(([x, y]) => [x + (x < (x0 + x1) / 2 ? bev * 1.1 : -bev * 1.1), y + (y < (y0 + y1) / 2 ? bev * 1.1 : -bev * 1.1)]);
  const g2 = g.createLinearGradient(x0, y0, x1, y1); g2.addColorStop(0, mix(base, light, 0.26)); g2.addColorStop(1, mix(base, dark, 0.14));
  rpoly(g, inner, rr * 0.6); g.fillStyle = g2; g.fill();
  // вмятины
  const n = 1 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) { const px = x0 + bev * 2.5 + r() * Math.max(1, x1 - x0 - bev * 5), py = y0 + bev * 2.5 + r() * Math.max(1, y1 - y0 - bev * 5), s = 1.5 + r() * 2.5; g.fillStyle = mix(base, dark, 0.5); g.beginPath(); g.ellipse(px, py, s, s * 0.7, r() * 3, 0, 7); g.fill(); g.fillStyle = mix(base, light, 0.5); g.beginPath(); g.ellipse(px - s * 0.3, py - s * 0.45, s * 0.6, s * 0.3, 0, 0, 7); g.fill(); }
  g.restore();
}
/** Кладка лицом: ряды блоков со сдвигом, два размера блоков, ровные щели. k — затемнение всей плоскости. */
export function wallBlocks(g, x, y, w, h, P = SAND, seed = 1, row = 32, k = 0, gap = 2.4) {
  const r = rnd(seed);
  g.fillStyle = P.gap; g.fillRect(x, y, w, h);
  for (let yy = y, i = 0; yy < y + h - 2; yy += row, i++) {
    const rh = Math.min(row, y + h - yy); let xx = x - (i % 2 ? row * 1.1 : 0);
    while (xx < x + w) { const bw = r() < 0.5 ? row * 1.7 : row * 2.4; const bx0 = Math.max(x, xx), bx1 = Math.min(x + w, xx + bw); if (bx1 - bx0 > 8) block(g, [[bx0 + gap / 2, yy + gap / 2], [bx1 - gap / 2, yy + gap / 2], [bx1 - gap / 2, yy + rh - gap / 2], [bx0 + gap / 2, yy + rh - gap / 2]], P, 4, seed + i * 31 + Math.round(xx), k); xx += bw; }
  }
}
/** Круглая башня из колец блоков: блоки — трапеции по дуге, свет по косинусу угла; тень на землю; венец шире с зубцами. Возвращает верх венца. */
export function clayTower(g, cx, y0, R, H, P = SAND, seed = 1, row = 32) {
  const r = rnd(seed), rows = Math.ceil(H / row), gap = 2.4;
  g.fillStyle = 'rgba(20,12,6,.3)'; g.beginPath(); g.ellipse(cx + 10, y0 + 6, R * 1.3, R * 0.45, 0, 0, 7); g.fill();
  // тёмная подложка (щели) — цилиндр
  g.fillStyle = P.gap; g.beginPath(); g.moveTo(cx - R, y0 - H); g.lineTo(cx - R, y0); g.quadraticCurveTo(cx, y0 + R * 0.5, cx + R, y0); g.lineTo(cx + R, y0 - H); g.closePath(); g.fill();
  const N = 5;
  for (let i = 0; i < rows; i++) {
    const yb = y0 - i * row, yt = yb - Math.min(row, H - i * row), off = (i % 2) * 0.5;
    for (let k = -1; k <= N; k++) {
      const a0 = -Math.PI / 2 + (k + off) / N * Math.PI, a1 = -Math.PI / 2 + (k + 1 + off) / N * Math.PI;
      const A0 = Math.max(-Math.PI / 2, a0), A1 = Math.min(Math.PI / 2, a1); if (A1 - A0 < 0.12) continue;
      const xa = cx + Math.sin(A0) * R, xb = cx + Math.sin(A1) * R, da = Math.cos(A0) * R * 0.5, db = Math.cos(A1) * R * 0.5;
      const kk = Math.max(0, Math.min(1, (Math.sin((A0 + A1) / 2) + 0.15) * 0.75));
      block(g, [[xa + gap / 2, yt + da * 0 + gap / 2], [xb - gap / 2, yt + gap / 2], [xb - gap / 2, yb - gap / 2 + db * (i === 0 ? 1 : 0)], [xa + gap / 2, yb - gap / 2 + da * (i === 0 ? 1 : 0)]], P, 4, seed + i * 13 + k, kk);
    }
  }
  const yv = y0 - H;
  // венец: кольцо шире
  for (let k = 0; k < N + 1; k++) { const a0 = -Math.PI / 2 + k / (N + 1) * Math.PI, a1 = a0 + Math.PI / (N + 1); const Rw = R + 9; const xa = cx + Math.sin(a0) * Rw, xb = cx + Math.sin(a1) * Rw; const kk = Math.max(0, (Math.sin((a0 + a1) / 2) + 0.15) * 0.75); block(g, [[xa + 1.5, yv - 16], [xb - 1.5, yv - 16], [xb - 1.5, yv + 3 + Math.cos(a1) * 5], [xa + 1.5, yv + 3 + Math.cos(a0) * 5]], P, 4, seed + 90 + k, kk); }
  for (let k = 0; k < 4; k++) { const a = -Math.PI * 0.72 + k / 3 * Math.PI * 1.44, x = cx + Math.sin(a) * (R + 4), w = 14 + Math.cos(a) * 8; const kk = Math.max(0, (Math.sin(a) + 0.15) * 0.75); block(g, [[x - w / 2, yv - 38], [x + w / 2, yv - 38], [x + w / 2, yv - 16], [x - w / 2, yv - 16]], P, 3.5, seed + 120 + k, kk); }
  return yv - 38;
}
/** Арка клиньями над проёмом радиуса R (центр cx,cy), толщина th; замковый камень выше. */
export function clayArch(g, cx, cy, R, th, P = SAND, seed = 1, n = 9) {
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI + i / n * Math.PI, a1 = Math.PI + (i + 1) / n * Math.PI, key = i === Math.floor(n / 2), ro = R + th + (key ? 9 : 0), ri = R, e = 0.025;
    const p = [[cx + Math.cos(a0 + e) * ri, cy + Math.sin(a0 + e) * ri], [cx + Math.cos(a0 + e) * ro, cy + Math.sin(a0 + e) * ro], [cx + Math.cos(a1 - e) * ro, cy + Math.sin(a1 - e) * ro], [cx + Math.cos(a1 - e) * ri, cy + Math.sin(a1 - e) * ri]];
    const kk = Math.max(0, Math.cos((a0 + a1) / 2) * 0.6);
    block(g, p, P, 4.5, seed + i, kk);
  }
}
/** Гладкая глиняная коническая крыша. */
export function clayCone(g, cx, top, rw, h, col = '#3f6fb0') {
  const cg = g.createLinearGradient(cx - rw, 0, cx + rw, 0); cg.addColorStop(0, mix(col, '#ffffff', 0.35)); cg.addColorStop(0.45, col); cg.addColorStop(1, mix(col, '#000000', 0.4));
  g.fillStyle = cg; g.beginPath(); g.moveTo(cx - rw, top + 4); g.quadraticCurveTo(cx - rw * 0.3, top - h * 0.55, cx, top - h); g.quadraticCurveTo(cx + rw * 0.3, top - h * 0.55, cx + rw, top + 4); g.quadraticCurveTo(cx, top + 14, cx - rw, top + 4); g.fill();
  g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.moveTo(cx - rw * 0.7, top); g.quadraticCurveTo(cx - rw * 0.25, top - h * 0.5, cx - 2, top - h + 6); g.quadraticCurveTo(cx - rw * 0.3, top - h * 0.45, cx - rw * 0.4, top); g.fill();
  g.fillStyle = '#e8c14a'; g.beginPath(); g.arc(cx, top - h - 4, 5, 0, 7); g.fill();
}
