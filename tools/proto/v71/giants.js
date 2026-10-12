// Эскиз v71: древние великаны. Низ ствола с корнями рисуется вместе с героем и мобами (по глубине),
// верх ствола и крона — отдельным слоем над всем миром: со сдвигом от середины экрана (кажется высоким)
// и с «окном» вокруг героя, когда камера близко (ныряешь под листву).
const O = '#24180f';
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };

/** Виды великанов: высота ствола до кроны, радиус кроны (в шагах мира; рост героя ≈ 48). */
export const GIANT = {
  oak:  { name: 'Древний дуб', trunkW: 64, low: 150, high: 300, crownR: 230, bark: '#6a4a32', leaf: ['#2f5a24', '#3f7a2e', '#5f9a3a', '#8cc050'] },
  pine: { name: 'Вековая сосна', trunkW: 46, low: 170, high: 380, crownR: 170, bark: '#8a4a2a', leaf: ['#173a2a', '#1f5236', '#2f6e44', '#4f8e5a'] },
};

/** Низ ствола: корни, кора, мох у земли. Начало — земля под серединой ствола. */
export function giantBase(g, kind, seed = 1) {
  const G = GIANT[kind], r = rnd(seed), w = G.trunkW, h = G.low;
  g.fillStyle = 'rgba(15,10,5,.3)'; g.beginPath(); g.ellipse(6, 4, w * 1.4, w * 0.4, 0, 0, 7); g.fill();
  // корни расходятся по земле
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.05 + i / 6 * 0.9) + (r() - 0.5) * 0.2, len = w * (0.8 + r() * 0.7), ex = Math.cos(a) * len * (a < Math.PI / 2 ? 1 : 1), ey = Math.sin(a) * len * 0.28;
    const sx = Math.cos(a) * w * 0.35;
    g.beginPath(); g.moveTo(sx - 9, -10); g.quadraticCurveTo(sx + ex * 0.4, ey * 0.2 - 14, sx + ex, ey + 2); g.quadraticCurveTo(sx + ex * 0.45, ey * 0.4 - 2, sx + 9, -4); g.closePath();
    g.fillStyle = shade(G.bark, a > Math.PI / 2 ? 1.08 : 0.82); g.fill(); g.strokeStyle = O; g.lineWidth = 1.8; g.stroke();
  }
  // ствол: расширение к корням, кора полосами, свет слева
  const body = () => { g.beginPath(); g.moveTo(-w / 2 - 14, 0); g.quadraticCurveTo(-w / 2, -h * 0.25, -w / 2 + 2, -h); g.lineTo(w / 2 - 2, -h); g.quadraticCurveTo(w / 2, -h * 0.25, w / 2 + 14, 0); g.quadraticCurveTo(0, 8, -w / 2 - 14, 0); g.closePath(); };
  body(); g.fillStyle = G.bark; g.fill();
  g.save(); body(); g.clip();
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0); gr.addColorStop(0, 'rgba(255,230,190,.28)'); gr.addColorStop(0.45, 'rgba(255,230,190,0)'); gr.addColorStop(1, 'rgba(10,5,0,.42)'); g.fillStyle = gr; g.fillRect(-w, -h - 4, w * 2, h + 12);
  g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1.4;
  for (let i = 0; i < 9; i++) { const x = -w / 2 + r() * w, y = -r() * h; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + (r() - 0.5) * 6, y - 20, x + (r() - 0.5) * 8, y - 40, x + (r() - 0.5) * 6, y - 60 - r() * 30); g.stroke(); }
  if (kind === 'oak') { g.fillStyle = 'rgba(36,24,15,.55)'; g.beginPath(); g.ellipse(-6, -h * 0.45, 9, 13, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(160,120,80,.6)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(-6, -h * 0.45, 11, 15, 0, 0, 7); g.stroke(); }  // дупло
  g.fillStyle = 'rgba(90,140,50,.55)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-w / 2 + r() * w, -r() * 30, 8 + r() * 10, 4, 0, 0, 7); g.fill(); }   // мох
  g.restore();
  body(); g.strokeStyle = O; g.lineWidth = 2.2; g.stroke();
}

/** Верх ствола от низа (bx,by) до кроны (cx,cy): клин, чуть сужается; рисуется в слое крон, наклоняется со сдвигом кроны. */
export function giantUpper(g, kind, bx, by, cx, cy, sc = 1) {
  const G = GIANT[kind], w0 = (G.trunkW / 2 - 2) * sc, w1 = w0 * 0.62;
  g.beginPath(); g.moveTo(bx - w0, by + 2); g.lineTo(cx - w1, cy); g.lineTo(cx + w1, cy); g.lineTo(bx + w0, by + 2); g.closePath();
  const gr = g.createLinearGradient(bx - w0, 0, bx + w0, 0); gr.addColorStop(0, shade(G.bark, 1.15)); gr.addColorStop(0.5, G.bark); gr.addColorStop(1, shade(G.bark, 0.6)); g.fillStyle = gr; g.fill();
  g.strokeStyle = O; g.lineWidth = 2 * sc; g.stroke();
  // толстые ветви уходят в крону
  if (kind === 'oak') for (const [k, a] of [[0.75, -0.9], [0.85, 0.7], [0.6, 1.1]]) { const x = bx + (cx - bx) * k, y = by + (cy - by) * k; g.strokeStyle = O; g.lineWidth = 9 * sc; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * 70 * sc, y - Math.cos(a) * 40 * sc); g.stroke(); g.strokeStyle = G.bark; g.lineWidth = 6 * sc; g.stroke(); }
}

/** Крона в готовую картинку. Начало — середина кроны. */
export function giantCrown(g, kind, seed = 1) {
  const G = GIANT[kind], r = rnd(seed + 5), R = G.crownR, L = G.leaf;
  if (kind === 'pine') {   // ярусы ветвей сверху вниз, свисающие лапы
    for (let i = 0; i < 6; i++) {
      const k = i / 5, y = -R * 0.95 + k * R * 1.55, w = R * (0.28 + k * 0.62), dr = 18 + k * 18;
      const pts = []; const n = 9 + i * 2; for (let j = 0; j <= n; j++) { const t = j / n, x = -w + t * w * 2, yy = y + Math.sin(t * Math.PI) * dr * 0.55 + (j % 2 ? dr : 0) * (1 - Math.abs(t - 0.5)); pts.push([x, yy]); }
      g.beginPath(); g.moveTo(0, y - dr * 1.7); for (const p of pts) g.lineTo(p[0], p[1] + dr); g.closePath();
      g.fillStyle = O; g.save(); g.translate(0, 2); g.fill(); g.restore();
      g.fillStyle = L[1]; g.fill();
      g.save(); g.clip(); g.fillStyle = L[0]; g.beginPath(); g.ellipse(w * 0.35, y + dr * 1.1, w * 0.85, dr * 1.1, 0, 0, 7); g.fill(); g.fillStyle = L[2]; g.beginPath(); g.ellipse(-w * 0.35, y, w * 0.5, dr * 0.7, -0.2, 0, 7); g.fill();
      g.strokeStyle = L[3]; g.lineWidth = 1.2; for (let q = 0; q < 14; q++) { const x = -w * 0.8 + r() * w * 0.9, yy = y - dr * 0.4 + r() * dr * 1.2; g.beginPath(); g.moveTo(x, yy); g.lineTo(x - 6, yy + 4); g.moveTo(x, yy); g.lineTo(x + 5, yy + 5); g.stroke(); }
      g.restore();
      g.strokeStyle = O; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, y - dr * 1.7); for (const p of pts) g.lineTo(p[0], p[1] + dr); g.closePath(); g.stroke();
    }
    return;
  }
  // дуб: 4 яруса крупных масс листвы; нижние темнее, верхние светлее; свет слева сверху
  const tiers = [[0.95, 0.45, 9, 0.26], [0.78, 0.15, 8, 0.26], [0.58, -0.18, 7, 0.27], [0.34, -0.5, 4, 0.28]];
  tiers.forEach(([spread, dy, n, rs], ti) => {
    const parts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + ti + r() * 0.4, d = R * spread * (0.55 + r() * 0.35); parts.push([Math.cos(a) * d, R * dy + Math.sin(a) * d * 0.55, R * rs * (0.75 + r() * 0.5)]); }
    if (ti === 3) parts.push([0, R * dy, R * rs * 1.2]);
    const cols = [shade(L[0], 1 - (3 - ti) * 0.05), L[Math.min(3, ti === 0 ? 0 : ti)], L[Math.min(3, ti + 1)]];
    g.fillStyle = O; for (const [x, y, s] of parts) { g.beginPath(); g.arc(x, y, s + 2.2, 0, 7); g.fill(); }
    g.fillStyle = cols[0]; for (const [x, y, s] of parts) { g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
    g.save(); g.beginPath(); for (const [x, y, s] of parts) { g.moveTo(x + s, y); g.arc(x, y, s, 0, 7); } g.clip();
    g.fillStyle = cols[1]; for (const [x, y, s] of parts) { g.beginPath(); g.arc(x - s * 0.18, y - s * 0.2, s * 0.78, 0, 7); g.fill(); }
    g.fillStyle = cols[2]; for (const [x, y, s] of parts) { g.beginPath(); g.arc(x - s * 0.38, y - s * 0.42, s * 0.42, 0, 7); g.fill(); }
    // листья: мелкие дужки и пятнышки света
    g.strokeStyle = shade(cols[0], 0.8); g.lineWidth = 1.3;
    for (const [x, y, s] of parts) for (let k = 0; k < 10; k++) { const a = r() * 6.28, d = r() * s * 0.85; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 4 + r() * 4, 0.4, 2.6); g.stroke(); }
    g.fillStyle = 'rgba(230,250,170,.35)'; for (const [x, y, s] of parts) for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x - s * 0.4 + r() * s * 0.4, y - s * 0.5 + r() * s * 0.4, 3, 2, 0.5, 0, 7); g.fill(); }
    g.restore();
  });
}

/** Тень кроны на земле: тёмное пятно с просветами (солнечные зайчики). Рисуется в слое земли. */
export function giantShade(g, kind, x, y, seed = 1) {
  const G = GIANT[kind], r = rnd(seed + 9), R = G.crownR * 0.95;
  const cx = x + R * 0.25, cy = y - 10;
  const gr = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); gr.addColorStop(0, 'rgba(10,20,5,.38)'); gr.addColorStop(0.75, 'rgba(10,20,5,.26)'); gr.addColorStop(1, 'rgba(10,20,5,0)');
  g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, R, R * 0.62, 0, 0, 7); g.fill();
  for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * R * 0.85, px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d * 0.62, s = 3 + r() * 9; const sg = g.createRadialGradient(px, py, 0, px, py, s); sg.addColorStop(0, 'rgba(255,245,180,.45)'); sg.addColorStop(1, 'rgba(255,245,180,0)'); g.fillStyle = sg; g.beginPath(); g.ellipse(px, py, s, s * 0.6, 0, 0, 7); g.fill(); }
}
