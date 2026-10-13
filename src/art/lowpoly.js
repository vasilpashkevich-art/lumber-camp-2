// Low-poly (v89, проба): плоские грани своим тоном по свету (свет слева сверху спереди), без обводки,
// мягкие тени на земле, тёплый свет в окнах. Проекция как в bld2: x вдоль лица, y в глубину (вверх-вправо), z вверх.
const KX = 0.3, KY = 0.5;
export const P = (x, y, z) => [x + y * KX, -z - y * KY];
const hex = c => parseInt(c.slice(1), 16);
export const mix = (a, b, t) => { const pa = hex(a), pb = hex(b); const c = i => Math.round(((pa >> i) & 255) * (1 - t) + ((pb >> i) & 255) * t); return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1); };
/** Тон грани: f — лицо (0 … 1 к свету): 'top' 1.0, 'left' 0.75, 'front' 0.55, 'right' 0.25, число — своё. */
const TONE = { top: 1, left: 0.8, front: 0.58, right: 0.28, back: 0.4 };
export const shade = (col, f) => { const t = typeof f === 'number' ? f : TONE[f]; return t >= 0.58 ? mix(col, '#fff4dc', (t - 0.58) * 0.6) : mix(col, '#2a1e30', (0.58 - t) * 0.9); };
export function face(g, pts, col, f = 'front') { g.fillStyle = shade(col, f); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); }
export function shadow(g, x, y, rx, ry, a = 0.22) { g.fillStyle = `rgba(30,20,40,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); }
/** Коробка w×d×h с началом в середине лица у земли: лицо, правый бок, верх. */
export function box(g, w, d, h, col, x = 0, y = 0, z = 0) {
  const c = (a, b, cc) => P(a + x, b + y, cc + z);
  face(g, [c(w / 2, 0, 0), c(w / 2, d, 0), c(w / 2, d, h), c(w / 2, 0, h)], col, 'right');
  face(g, [c(-w / 2, 0, h), c(w / 2, 0, h), c(w / 2, d, h), c(-w / 2, d, h)], col, 'top');
  face(g, [c(-w / 2, 0, 0), c(w / 2, 0, 0), c(w / 2, 0, h), c(-w / 2, 0, h)], col, 'front');
}
/** Гранёный цилиндр радиуса R, высоты h, n граней; центр основания (x,y,z); тон по углу. */
export function cyl(g, R, h, col, n = 8, x = 0, y = 0, z = 0, top = true) {
  // задняя половина (видна только там, где её не закрывает передняя), затем передняя
  for (let j = 0; j < 2 * n; j++) {
    const i = (j + n) % (2 * n), a0 = i / n * Math.PI, a1 = (i + 1) / n * Math.PI;   // сначала задняя половина (y > 0), потом передняя
    const x0 = Math.cos(a0) * R, y0 = -Math.sin(a0) * R, x1 = Math.cos(a1) * R, y1 = -Math.sin(a1) * R;
    const nx = Math.cos((a0 + a1) / 2), back = i >= n, f = back ? 0.36 : 0.58 - nx * 0.3;
    face(g, [P(x + x0, y + y0, z), P(x + x1, y + y1, z), P(x + x1, y + y1, z + h), P(x + x0, y + y0, z + h)], col, f);
  }
  if (top) { g.fillStyle = shade(col, 'top'); g.beginPath(); const c = P(x, y, z + h); g.ellipse(c[0], c[1], R, R * KY, 0, 0, 7); g.fill(); }
}
/** Гранёный конус (крыша, ёлка): основание радиуса R на высоте z, вершина z+h, n граней. */
export function cone(g, R, h, col, n = 8, x = 0, y = 0, z = 0, tipX = 0, back = false) {
  const tip = P(x + tipX, y, z + h);
  for (let j = back ? 0 : n; j < 2 * n; j++) {
    const i = (j + n) % (2 * n), a0 = i / n * Math.PI, a1 = (i + 1) / n * Math.PI;
    const x0 = Math.cos(a0) * R, y0 = -Math.sin(a0) * R, x1 = Math.cos(a1) * R, y1 = -Math.sin(a1) * R;
    const nx = Math.cos((a0 + a1) / 2), f = i >= n ? 0.42 - nx * 0.1 : 0.62 - nx * 0.32;
    face(g, [P(x + x0, y + y0, z), P(x + x1, y + y1, z), tip], col, f);
  }
}
/** Окно с тёплым светом и свечением. */
export function glowWin(g, x, y, w, h, arch = true) {
  const gl = g.createRadialGradient(x, y - h / 2, 2, x, y - h / 2, Math.max(w, h) * 1.4); gl.addColorStop(0, 'rgba(255,200,90,.55)'); gl.addColorStop(1, 'rgba(255,200,90,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(x, y - h / 2, Math.max(w, h) * 1.4, 0, 7); g.fill();
  g.fillStyle = '#8a5a2a'; g.beginPath(); if (arch) { g.moveTo(x - w / 2 - 3, y); g.lineTo(x - w / 2 - 3, y - h + w / 2); g.arc(x, y - h + w / 2, w / 2 + 3, Math.PI, 0); g.lineTo(x + w / 2 + 3, y); } else g.rect(x - w / 2 - 3, y - h - 3, w + 6, h + 3); g.closePath(); g.fill();
  g.fillStyle = '#ffd66a'; g.beginPath(); if (arch) { g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + w / 2); g.arc(x, y - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y); } else g.rect(x - w / 2, y - h, w, h); g.closePath(); g.fill();
  g.fillStyle = '#8a5a2a'; g.fillRect(x - 1, y - h, 2, h); g.fillRect(x - w / 2, y - h / 2 - 1, w, 2);
}
export function smoke(g, x, y, t = 0.4) { for (let i = 0; i < 4; i++) { const q = (t * 0.3 + i / 4) % 1, s = 6 + q * 9; g.fillStyle = `rgba(240,236,228,${0.8 * (1 - q)})`; g.beginPath(); g.moveTo(x - s, y - q * 70); g.lineTo(x - s * 0.5, y - q * 70 - s); g.lineTo(x + s * 0.6, y - q * 70 - s * 0.9); g.lineTo(x + s, y - q * 70 + s * 0.2); g.lineTo(x, y - q * 70 + s * 0.9); g.closePath(); g.fill(); } }

/** Цилиндр каменной кладкой: ряды блоков со сдвигом через ряд, лёгкий разнобой тона, тёмные швы. */
export function blockCyl(g, R, h, col, n = 10, rows = 6, x = 0, y = 0, z = 0, seed = 1) {
  let a = seed * 9301 + 49297; const r = () => (a = (a * 9301 + 49297) % 233280) / 233280;
  const rh = h / rows;
  for (let k = 0; k < rows; k++) {
    const off = k % 2 ? 0.5 : 0;
    for (let i = -1; i < n; i++) {
      const t0 = Math.max(0, (i + off) / n), t1 = Math.min(1, (i + 1 + off) / n); if (t1 <= t0) continue;
      const a0 = t0 * Math.PI, a1 = t1 * Math.PI;
      const x0 = Math.cos(a0) * R, y0 = -Math.sin(a0) * R, x1 = Math.cos(a1) * R, y1 = -Math.sin(a1) * R;
      const nx = Math.cos((a0 + a1) / 2), f = 0.58 - nx * 0.3 + (r() - 0.5) * 0.1;
      const z0 = z + k * rh, z1 = z0 + rh;
      face(g, [P(x + x0, y + y0, z0), P(x + x1, y + y1, z0), P(x + x1, y + y1, z1), P(x + x0, y + y0, z1)], col, f);
      // швы
      g.strokeStyle = 'rgba(40,30,50,.18)'; g.lineWidth = 1.2; g.beginPath(); const p0 = P(x + x0, y + y0, z0), p1 = P(x + x1, y + y1, z0), p2 = P(x + x1, y + y1, z1); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke();
    }
  }
}
