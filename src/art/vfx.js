// Эффекты умений (v73): рывок, вихрь, сокрушающий удар, жажда битвы, ярость; огненный шар, ледяная стрела,
// огненный столп, возгорание, кольцо льда; кровоточащая стрела, сеть, залп, добивание, капкан.
// Всё рисуется по «возрасту» эффекта a (секунды с начала) и зерну — без своего состояния: одинаково в игре и в эскизе.
// Координаты — мира (земля под эффектом); рост героя ≈ 48 на экране. Свет слева сверху, огонь и лёд светятся («lighter»).
const TAU = Math.PI * 2;
export const rng = s => { s = (s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const easeOut = t => 1 - (1 - clamp(t)) ** 3;
const fadeIO = (a, d, i = 0.08, o = 0.3) => clamp(a / i) * clamp((d - a) / o);

// ---------------------------------------------------------------- готовые пятна (один раз)
const CAN = typeof document !== 'undefined';
const BLOB = {};
/** Круглое пятно света или дыма заданного цвета (rgb строкой «r,g,b»). */
function blob(rgb, soft = 0.5) {
  const k = rgb + soft; if (BLOB[k]) return BLOB[k]; if (!CAN) return null;
  const c = document.createElement('canvas'); c.width = c.height = 64; const q = c.getContext('2d'), gr = q.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(soft, `rgba(${rgb},.45)`); gr.addColorStop(1, `rgba(${rgb},0)`); q.fillStyle = gr; q.fillRect(0, 0, 64, 64);
  return (BLOB[k] = c);
}
function glow(g, x, y, r, rgb, a = 1, soft = 0.5) { const b = blob(rgb, soft); if (!b || a <= 0.01 || r <= 0.5) return; g.globalAlpha = a; g.drawImage(b, x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; }
function glowE(g, x, y, rx, ry, rgb, a = 1) { const b = blob(rgb, 0.4); if (!b || a <= 0.01) return; g.globalAlpha = a; g.drawImage(b, x - rx, y - ry, rx * 2, ry * 2); g.globalAlpha = 1; }
const add = (g, fn) => { const o = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = o; };

// ---------------------------------------------------------------- общие части
/** Пыль: клубы у земли, расходятся и тают. */
export function dust(g, x, y, a, seed = 1, n = 6, size = 1, rgb = '170,150,115') {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const an = r() * TAU, sp = (20 + r() * 40) * size, q = clamp(a / (0.55 + r() * 0.3)), R = (6 + r() * 8 + q * 16) * size;
    const px = x + Math.cos(an) * sp * easeOut(q), py = y + Math.sin(an) * sp * 0.4 * easeOut(q) - q * 10 * size;
    glow(g, px, py, R, rgb, 0.42 * (1 - q), 0.35);
  }
}
/** Искры: короткие светящиеся черты разлетаются и падают. */
export function sparks(g, x, y, a, seed, n = 12, sp = 160, rgb = '255,220,140', up = 0.6, life = 0.45) {
  const r = rng(seed);
  add(g, () => {
    for (let i = 0; i < n; i++) {
      const an = -Math.PI / 2 + (r() - 0.5) * TAU * up, v = sp * (0.5 + r() * 0.7), L = life * (0.6 + r() * 0.6), q = a / L; if (q >= 1) { r(); continue; }
      const t = a, px = x + Math.cos(an) * v * t, py = y + Math.sin(an) * v * t + 260 * t * t, vx = Math.cos(an) * v, vy = Math.sin(an) * v + 520 * t, len = 0.035 + r() * 0.02;
      g.strokeStyle = `rgba(${rgb},${(1 - q).toFixed(3)})`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(px, py); g.lineTo(px - vx * len, py - vy * len); g.stroke();
    }
  });
}
/** Ударная волна: эллипс по земле. */
function ring(g, x, y, r, w, rgb, a) { if (a <= 0.01) return; g.strokeStyle = `rgba(${rgb},${a.toFixed(3)})`; g.lineWidth = w; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, TAU); g.stroke(); }
/** Язык пламени: от (x,y) вверх на h, ширина w, колышется по фазе. */
export function flame(g, x, y, h, w, ph, a = 1, hot = 0) {
  const s1 = Math.sin(ph * 1.7) * w * 0.35, s2 = Math.sin(ph * 2.9 + 1) * w * 0.5, o = g.globalCompositeOperation; g.globalCompositeOperation = 'source-over';
  const path = (k) => { g.beginPath(); g.moveTo(x - w * k, y); g.bezierCurveTo(x - w * 1.1 * k, y - h * 0.4 * k, x - w * 0.3 * k + s1, y - h * 0.65 * k, x + s2 * k, y - h * k); g.bezierCurveTo(x + w * 0.4 * k + s1, y - h * 0.6 * k, x + w * 1.1 * k, y - h * 0.35 * k, x + w * k, y); g.closePath(); };
  // внешний язык — красно-оранжевый, внутренний — жёлтый, у основания — почти белый
  let gr = g.createLinearGradient(x, y, x, y - h); gr.addColorStop(0, `rgba(255,120,30,${a})`); gr.addColorStop(0.5, `rgba(225,62,18,${a * 0.85})`); gr.addColorStop(1, 'rgba(140,24,10,0)'); g.fillStyle = gr; path(1); g.fill();
  gr = g.createLinearGradient(x, y, x, y - h * 0.7); gr.addColorStop(0, `rgba(255,${215 + hot * 40},${110 + hot * 110},${a})`); gr.addColorStop(0.6, `rgba(255,165,45,${a * 0.8})`); gr.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gr; path(0.62); g.fill();
  g.globalCompositeOperation = o;
}
/** Угольки: поднимаются и гаснут (циклично по времени t). */
export function embers(g, x, y, t, seed, n = 8, w = 30, h = 70, rgb = '255,170,70') {
  const r = rng(seed);
  add(g, () => { for (let i = 0; i < n; i++) { const off = r(), sp = 0.7 + r() * 0.6, q = (t * sp / 1.4 + off) % 1, dx = (r() - 0.5) * w + Math.sin(t * 3 + i) * 6 * q, px = x + dx, py = y - q * h; glow(g, px, py, 3 + (1 - q) * 2, rgb, (1 - q) * 0.9, 0.3); } });
}
/** Дым: тёмные клубы поднимаются. */
function smoke(g, x, y, a, seed, n = 5, rgb = '70,64,60', rise = 60, life = 1.2) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const d = r() * 0.25, q = clamp((a - d) / life); if (q <= 0 || q >= 1) { r(); r(); continue; } const px = x + (r() - 0.5) * 30 + q * 14, py = y - q * rise, R = 10 + q * 26; glow(g, px, py, R, rgb, 0.35 * Math.sin(q * Math.PI), 0.3); }
}
/** Капли крови: брызги дугой по направлению удара (dir — угол), падают и оставляют пятна. */
export function blood(g, x, y, a, seed, n = 12, dir = 0, spread = 1.4, power = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const an = dir + (r() - 0.5) * spread, v = (60 + r() * 110) * power, vz = 60 + r() * 120, s = 1.4 + r() * 2.2;
    const tl = vz / 300 * 2, t = Math.min(a, tl), gx = x + Math.cos(an) * v * t, gy = y + Math.sin(an) * v * t * 0.5, hgt = 22 + vz * t - 150 * t * t;
    if (a < tl) { g.fillStyle = '#9a1414'; g.beginPath(); g.ellipse(gx, gy - hgt, s, s * 1.3, an, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,140,140,.6)'; g.beginPath(); g.arc(gx - s * 0.3, gy - hgt - s * 0.4, s * 0.35, 0, TAU); g.fill(); }
    else { const f = clamp(1 - (a - tl) / 1.4); if (f > 0) { g.fillStyle = `rgba(110,10,10,${0.7 * f})`; g.beginPath(); g.ellipse(gx, gy, s * 1.6, s * 0.7, 0, 0, TAU); g.fill(); } }
  }
}
/** Обломки: камешки взлетают и падают, у земли — тень. */
function debris(g, x, y, a, seed, n = 8, col = ['#8a8070', '#6a5a48', '#a89a84']) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const an = r() * TAU, v = 50 + r() * 90, vz = 90 + r() * 120, tl = vz / 380 * 2, t = Math.min(a, tl), s = 2 + r() * 3, c = col[i % col.length], rot = r() * 6 + a * 10;
    const gx = x + Math.cos(an) * v * t, gy = y + Math.sin(an) * v * t * 0.45, h = Math.max(0, vz * t - 190 * t * t), f = clamp(1 - (a - tl) / 0.6);
    if (f <= 0) continue;
    g.fillStyle = `rgba(0,0,0,${0.25 * f})`; g.beginPath(); g.ellipse(gx, gy, s, s * 0.4, 0, 0, TAU); g.fill();
    g.save(); g.translate(gx, gy - h); g.rotate(rot); g.globalAlpha = f; g.fillStyle = c; g.strokeStyle = '#24180f'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-s, -s * 0.4); g.lineTo(-s * 0.2, -s); g.lineTo(s, -s * 0.3); g.lineTo(s * 0.5, s * 0.8); g.lineTo(-s * 0.7, s * 0.6); g.closePath(); g.fill(); g.stroke(); g.restore(); g.globalAlpha = 1;
  }
}
/** Трещины в земле: ломаные лучи из точки. */
function cracks(g, x, y, a, seed, n = 6, len = 70, life = 1.4) {
  const r = rng(seed), grow = easeOut(a / 0.12), f = clamp((life - a) / 0.5);
  if (f <= 0) return;
  for (let i = 0; i < n; i++) {
    let an = i / n * TAU + r() * 0.5, px = x, py = y; const L = len * (0.5 + r() * 0.6) * grow, segs = 5;
    const pts = [[px, py]]; for (let k = 0; k < segs; k++) { an += (r() - 0.5) * 0.7; px += Math.cos(an) * L / segs; py += Math.sin(an) * L / segs * 0.45; pts.push([px, py]); }
    for (const [w, c] of [[3.2, `rgba(20,12,6,${0.75 * f})`], [1.2, `rgba(255,170,90,${0.5 * f * clamp(1 - a / 0.5)})`]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([u, v], k) => k ? g.lineTo(u, v) : g.moveTo(u, v)); g.stroke(); }
  }
}
/** Ледяные шипы: треугольники из земли. */
function iceSpike(g, x, y, h, w, a = 1) {
  if (h < 1) return;
  g.globalAlpha = a;
  g.fillStyle = '#e8f6ff'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * 0.15, y - h); g.lineTo(x, y); g.closePath(); g.fill();
  g.fillStyle = '#8ec4ea'; g.beginPath(); g.moveTo(x, y); g.lineTo(x - w * 0.15, y - h); g.lineTo(x + w, y); g.closePath(); g.fill();
  g.strokeStyle = '#2a5a80'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * 0.15, y - h); g.lineTo(x + w, y); g.stroke();
  g.globalAlpha = 1;
}
/** Снежинка-блёстка. */
function glint(g, x, y, s, a) { g.strokeStyle = `rgba(235,250,255,${a})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.moveTo(x - s * 0.6, y - s * 0.6); g.lineTo(x + s * 0.6, y + s * 0.6); g.moveTo(x + s * 0.6, y - s * 0.6); g.lineTo(x - s * 0.6, y + s * 0.6); g.stroke(); }

// ================================================================ ВОИН
/** Рывок: шлейф пыли под ногами (каждый след). */
export function dashDust(g, e, a) { dust(g, e.x, e.y, a, e.seed, 3, 0.7); }
/** Удар с разбега: вспышка, две волны, искры, камешки, пыль кольцом. dur 0.6 */
export function impact(g, e, a) {
  const { x, y } = e, d = 0.6;
  add(g, () => { if (a < 0.12) glow(g, x, y - 20, 46 * (1 - a / 0.12 * 0.4), '255,245,220', 1 - a / 0.12); });
  ring(g, x, y, 10 + easeOut(a / 0.4) * 70, 5 * (1 - a / d), '255,233,168', 0.9 * (1 - a / 0.45));
  ring(g, x, y, 6 + easeOut(a / 0.55) * 46, 2.5, '255,255,255', 0.6 * (1 - a / 0.55));
  dust(g, x, y, a, e.seed + 3, 8, 1.1);
  debris(g, x, y, a, e.seed + 7, 7);
  sparks(g, x, y - 20, a, e.seed + 1, 14, 190);
}
/** Вихрь: три светлых серпа вокруг героя, ветер, пыль кольцом, листья в стороны. a — с начала, R — радиус. */
export function whirl(g, e, a, part = null) {
  const { x, y } = e, R = e.r || 92, cy = y - 16, rot = a * 15, f = fadeIO(a, e.dur || 1.2, 0.08, 0.25), side = an => Math.sin(an) < 0 ? 'back' : 'front';
  // пыль у земли — кольцо, что расходится толчками (рисуется с задней частью)
  if (part !== 'front') for (let k = 0; k < 2; k++) { const q = ((a * 2.2 + k * 0.5) % 1); ring(g, x, y, R * (0.5 + q * 0.6), 6 * (1 - q), '190,170,130', 0.35 * (1 - q) * f); }
  if (part !== 'front') dust(g, x, y, (a % 0.6), e.seed + Math.floor(a / 0.6), 5, 1.2);
  add(g, () => {
    for (let k = 0; k < 3; k++) {
      const head = rot + k * TAU / 3, span = 1.9, N = 22;
      for (let i = 0; i < N; i++) {
        const t0 = head - span * (1 - i / N), t1 = head - span * (1 - (i + 1) / N), q = i / N;
        const ang0 = t0, ang1 = t1, rr = R * (0.78 + 0.22 * q);
        if (part && side((t0 + t1) / 2) !== part) continue;
        g.lineCap = 'round';
        for (const [w, al] of [[14, 0.08], [7, 0.22], [2.4, 0.85]]) {
          g.strokeStyle = `rgba(255,${235 - (1 - q) * 40},${200 - (1 - q) * 80},${al * q * q * f})`; g.lineWidth = w * (0.4 + q * 0.6);
          g.beginPath(); g.moveTo(x + Math.cos(ang0) * rr, cy + Math.sin(ang0) * rr * 0.5); g.lineTo(x + Math.cos(ang1) * rr, cy + Math.sin(ang1) * rr * 0.5); g.stroke();
        }
      }
      // блик на острие
      if (!part || side(head) === part) glow(g, x + Math.cos(head) * R, cy + Math.sin(head) * R * 0.5, 12, '255,250,220', 0.8 * f);
    }
    if (part === 'back') return;
    // тонкие струи ветра дальше
    g.lineWidth = 1.2; for (let k = 0; k < 5; k++) { const h0 = -rot * 0.8 + k * 1.3, rr = R * (1.15 + (k % 2) * 0.12); g.strokeStyle = `rgba(230,240,255,${0.25 * f})`; g.beginPath(); g.ellipse(x, cy - 4 + k * 2, rr, rr * 0.5, 0, h0, h0 + 0.9); g.stroke(); }
  });
  if (part === 'back') return;
  // листья и травинки летят по касательной
  const r = rng(e.seed + 9);
  for (let i = 0; i < 14; i++) {
    const t0 = r() * 1.1, b = a - t0; if (b < 0 || b > 0.6) { r(); r(); continue; }
    const an = t0 * 15 + r() * 6, out = R * (0.7 + b * 1.6), px = x + Math.cos(an + b * 4) * out, py = cy + Math.sin(an + b * 4) * out * 0.5 - b * 20, s = 2.5 + r() * 1.5;
    g.save(); g.translate(px, py); g.rotate(a * 12 + i); g.globalAlpha = (1 - b / 0.6) * f; g.fillStyle = i % 3 ? '#6e9a3a' : '#a8843a'; g.beginPath(); g.ellipse(0, 0, s, s * 0.45, 0, 0, TAU); g.fill(); g.restore(); g.globalAlpha = 1;
  }
}
/** Сокрушающий удар: серп сверху вниз, вспышка, трещины, брызги крови, пыль. dur 1.4 */
export function crush(g, e, a) {
  const { x, y } = e, dir = e.dir || 0;
  cracks(g, x, y, a, e.seed, 6, 66, 1.4);
  if (a < 0.16) add(g, () => {   // серп удара сверху вниз
    const q = a / 0.16, h0 = -Math.PI * 0.95, h1 = h0 + Math.PI * 0.9 * easeOut(q), cx = x - 6, cy = y - 34;
    for (const [w, al] of [[18, 0.1], [9, 0.3], [3, 0.95]]) { g.strokeStyle = `rgba(255,${230 - w * 4},${200 - w * 8},${al * (1 - q * 0.5)})`; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, 46, h0, h1); g.stroke(); }
  });
  add(g, () => { if (a > 0.1 && a < 0.3) glow(g, x, y - 10, 50, '255,200,150', 1 - (a - 0.1) / 0.2); });
  if (a > 0.1) { ring(g, x, y, 12 + easeOut((a - 0.1) / 0.35) * 56, 4, '255,220,180', 0.8 * (1 - (a - 0.1) / 0.35)); dust(g, x, y, a - 0.1, e.seed + 2, 7, 1); debris(g, x, y, a - 0.1, e.seed + 4, 6); blood(g, x, y - 4, a - 0.1, e.seed + 5, 14, dir, 1.8, 1.1); }
}
/** Рана (урон со временем): капли стекают с цели. t — время раны. */
export function wound(g, x, y, t, seed, h = 30) {
  const r = rng(seed);
  for (let i = 0; i < 3; i++) { const q = (t * 0.9 + i / 3 + r() * 0.2) % 1, px = x + (r() - 0.5) * 16, py = y - h + q * h * 0.9; g.fillStyle = `rgba(150,12,12,${0.9 * (1 - q * 0.6)})`; g.beginPath(); g.ellipse(px, py, 1.8, 2.6, 0, 0, TAU); g.fill(); }
}
/** Жажда битвы: красный туман из павшего струится к герою, у героя — вспышка лечения. e.x,e.y — тело, e.tx,e.ty — герой. dur 1.2 */
export function thirst(g, e, a) {
  const r = rng(e.seed), x0 = e.x, y0 = e.y - 14, x1 = e.tx, y1 = e.ty - 26, mx = (x0 + x1) / 2 + (r() - 0.5) * 60, my = Math.min(y0, y1) - 60;
  add(g, () => {
    for (let i = 0; i < 18; i++) {
      const st = i * 0.025, q = clamp((a - st) / 0.6); if (q <= 0 || q >= 1) continue;
      const s = easeOut(q), u = 1 - s, px = u * u * x0 + 2 * u * s * mx + s * s * x1 + Math.sin(q * 9 + i) * 6, py = u * u * y0 + 2 * u * s * my + s * s * y1;
      glow(g, px, py, 7, '230,40,40', 0.8 * Math.sin(q * Math.PI)); glow(g, px, py, 2.5, '255,220,180', 0.9 * Math.sin(q * Math.PI));
    }
    if (a > 0.6) { const q = (a - 0.6) / 0.6; glow(g, x1, y1, 40 * (0.5 + q), '255,80,60', 0.7 * (1 - q)); }
  });
  if (a > 0.6) { const q = (a - 0.6) / 0.6; ring(g, e.tx, e.ty, 14 + q * 40, 3, '255,120,90', 0.8 * (1 - q)); for (let i = 0; i < 6; i++) { const px = e.tx + (i - 2.5) * 8, py = e.ty - 20 - q * 50 - (i % 2) * 10; g.fillStyle = `rgba(140,255,140,${0.9 * (1 - q)})`; g.fillRect(px - 1, py - 4, 2, 8); g.fillRect(px - 4, py - 1, 8, 2); } }
}
/** Ярость берсерка, начало: красный рёв — три волны, вспышка, трещины. dur 0.9 */
export function berserkCast(g, e, a) {
  const { x, y } = e;
  add(g, () => { glow(g, x, y - 26, 70 * (0.6 + a), '255,40,20', 0.8 * (1 - a / 0.9)); });
  for (let k = 0; k < 3; k++) { const q = clamp((a - k * 0.12) / 0.5); if (q > 0 && q < 1) ring(g, x, y, 16 + q * 110, 6 * (1 - q), '255,70,40', 0.85 * (1 - q)); }
  cracks(g, x, y, a, e.seed, 5, 50, 0.9); dust(g, x, y, a, e.seed + 1, 9, 1.3, '150,110,90');
}
/** Ярость берсерка, пока длится: красное пламя вокруг тела, угольки, свечение земли. t — время, k — сила 0..1 */
export function berserkAura(g, x, y, t, k = 1, seed = 5) {
  add(g, () => {
    glowE(g, x, y, 34, 12, '255,40,20', 0.45 * k);
    for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + t * 0.6, px = x + Math.cos(an) * 19, py = y + Math.sin(an) * 6 - 1, h = (20 + 12 * Math.sin(t * 7 + i * 1.7)) * (0.7 + 0.3 * k); flame(g, px, py, h, 4.5, t * 8 + i * 2.1, 0.42 * k); }
    glow(g, x, y - 30, 26, '255,60,30', 0.25 * k * (0.8 + 0.2 * Math.sin(t * 9)));
  });
  embers(g, x, y - 6, t, seed, 10, 34, 70, '255,90,50');
}

// ================================================================ МАГ
/** Подготовка заклинания: искры стягиваются к навершию посоха (x,y), col — цвет. q 0..1 */
export function channel(g, x, y, q, seed, rgb = '255,170,70') {
  const r = rng(seed);
  add(g, () => {
    for (let i = 0; i < 12; i++) { const an = r() * TAU, d0 = 24 + r() * 16, d = d0 * (1 - ((q + r()) % 1)); glow(g, x + Math.cos(an) * d, y + Math.sin(an) * d, 2.4, rgb, 0.9 * q); }
    glow(g, x, y, 10 + 8 * q, rgb, 0.85 * q); glow(g, x, y, 4 + 2 * q, '255,255,240', q);
  });
}
/** Огненный шар в полёте: ядро, языки, хвост пламени и дыма вдоль пути. s: x,y,vx,vy; t — время; big */
export function fireball(g, s, t) {
  const sp = Math.hypot(s.vx, s.vy) || 1, ux = s.vx / sp, uy = s.vy / sp, big = s.big ? 1.25 : 0.85, r = rng(Math.floor(t * 30));
  for (let i = 12; i >= 6; i--) { const b = i * 0.014, px = s.x - s.vx * b + Math.sin(t * 20 + i) * 3, py = s.y - s.vy * b - i * 0.9; glow(g, px, py, (9 + i) * big, '70,60,55', 0.12, 0.3); }
  add(g, () => {
    for (let i = 10; i >= 1; i--) { const b = i * 0.011, px = s.x - s.vx * b + (r() - 0.5) * 4, py = s.y - s.vy * b + (r() - 0.5) * 4 - i * 0.5, q = i / 10; glow(g, px, py, (15 - i * 1.1) * big, q > 0.6 ? '220,60,20' : q > 0.3 ? '255,130,30' : '255,200,80', 0.55 * (1 - q * 0.7)); }
    glow(g, s.x, s.y, 26 * big, '255,120,30', 0.55); glow(g, s.x, s.y, 14 * big, '255,210,110', 0.9); glow(g, s.x, s.y, 6 * big, '255,255,230', 1);
    for (let i = 0; i < 4; i++) { const an = Math.atan2(-uy, -ux) + (i - 1.5) * 0.45 + Math.sin(t * 25 + i) * 0.2; flameDir(g, s.x, s.y, an, 18 * big, 5 * big, t * 30 + i); }
  });
}
function flameDir(g, x, y, an, L, w, ph) {
  g.save(); g.translate(x, y); g.rotate(an + Math.PI / 2); flame(g, 0, 0, L * (0.8 + 0.2 * Math.sin(ph)), w, ph, 0.7, 0.4); g.restore();
}
/** Взрыв огня: вспышка, огненная сфера, искры, дым, подпалина. dur 1.4 */
export function explosion(g, e, a) {
  const { x, y } = e, s = e.big ? 1.25 : 1, sy = y - 16;
  if (a < 1.4) { g.fillStyle = `rgba(30,20,10,${0.35 * clamp(1 - a / 1.4)})`; g.beginPath(); g.ellipse(x, y, 30 * s, 12 * s, 0, 0, TAU); g.fill(); }
  smoke(g, x, sy, a - 0.15, e.seed + 2, 6, '60,54,50', 70, 1.1);
  add(g, () => {
    if (a < 0.1) glow(g, x, sy, 70 * s, '255,250,220', 1 - a / 0.1);
    const q = clamp(a / 0.45); if (q < 1) { const R = (16 + easeOut(q) * 46) * s; glow(g, x, sy, R * 1.3, '255,90,20', 0.6 * (1 - q)); glow(g, x, sy, R, '255,170,60', 0.8 * (1 - q)); glow(g, x, sy, R * 0.5, '255,240,180', 0.9 * (1 - q) ** 2); }
    for (let i = 0; i < 7; i++) { const an = i / 7 * TAU + e.seed, L = (24 + 30 * easeOut(q)) * s; if (q < 1) flameDir(g, x + Math.cos(an) * 6, sy + Math.sin(an) * 4, an - Math.PI / 2 + Math.PI, L * (1 - q * 0.5), 6 * s, a * 30 + i); }
  });
  sparks(g, x, sy, a, e.seed, 16, 200, '255,190,90', 1, 0.6);
}
/** Горение на цели: несколько языков и угольки. t — время. */
export function burning(g, x, y, t, seed, k = 1) {
  add(g, () => { glowE(g, x, y - 6, 18, 8, '255,110,30', 0.35 * k); for (let i = 0; i < 4; i++) flame(g, x - 10 + i * 7, y - 2 - (i % 2) * 6, (16 + 8 * Math.sin(t * 9 + i * 2)) * k, 4, t * 10 + i * 1.9, 0.6 * k); });
  embers(g, x, y - 8, t, seed, 5, 22, 46);
}
/** Ледяная стрела: гранёный осколок, искристый след, туман. */
export function frostBolt(g, s, t) {
  const sp = Math.hypot(s.vx, s.vy) || 1, ux = s.vx / sp, uy = s.vy / sp, an = Math.atan2(uy, ux), r = rng(7);
  add(g, () => {
    for (let i = 1; i <= 9; i++) { const b = i * 0.016, px = s.x - s.vx * b, py = s.y - s.vy * b; glow(g, px, py, 14 - i, '120,190,255', 0.35 * (1 - i / 10)); }
    glow(g, s.x, s.y, 20, '150,210,255', 0.55);
  });
  for (let i = 0; i < 6; i++) { const b = ((t * 3 + r()) % 1) * 0.12, px = s.x - s.vx * b + (r() - 0.5) * 10, py = s.y - s.vy * b + (r() - 0.5) * 10; glint(g, px, py, 2.4, 0.9 * (1 - b / 0.12)); }
  g.save(); g.translate(s.x, s.y); g.rotate(an);
  g.fillStyle = '#eaf8ff'; g.beginPath(); g.moveTo(17, 0); g.lineTo(-2, -5.5); g.lineTo(-13, 0); g.closePath(); g.fill();
  g.fillStyle = '#8ec8f0'; g.beginPath(); g.moveTo(17, 0); g.lineTo(-13, 0); g.lineTo(-2, 5.5); g.closePath(); g.fill();
  g.strokeStyle = '#2a5a80'; g.lineWidth = 1; g.beginPath(); g.moveTo(17, 0); g.lineTo(-2, -5.5); g.lineTo(-13, 0); g.lineTo(-2, 5.5); g.closePath(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.moveTo(12, -0.6); g.lineTo(-3, -3.6); g.stroke();
  g.restore();
}
/** Удар льда: осколки во все стороны, иней кольцом, туман, блёстки. dur 0.8 */
export function frostHit(g, e, a) {
  const { x, y } = e, r = rng(e.seed), sy = y - 16;
  ring(g, x, y, 10 + easeOut(a / 0.4) * 40, 3, '200,235,255', 0.8 * (1 - a / 0.5));
  add(g, () => { if (a < 0.12) glow(g, x, sy, 40, '220,245,255', 1 - a / 0.12); glow(g, x, sy, 30, '130,200,255', 0.4 * (1 - a / 0.8)); });
  for (let i = 0; i < 10; i++) { const an = r() * TAU, v = 80 + r() * 90, t = a, q = a / 0.55; if (q >= 1) continue; const px = x + Math.cos(an) * v * t, py = sy + Math.sin(an) * v * t * 0.7 + 120 * t * t; g.save(); g.translate(px, py); g.rotate(an + a * 8); g.globalAlpha = 1 - q; g.fillStyle = i % 2 ? '#dff4ff' : '#9ccff2'; g.beginPath(); g.moveTo(5, 0); g.lineTo(-3, -2); g.lineTo(-3, 2); g.closePath(); g.fill(); g.restore(); g.globalAlpha = 1; }
  for (let i = 0; i < 6; i++) glint(g, x + (r() - 0.5) * 50, sy + (r() - 0.5) * 30, 3, 0.9 * (1 - a / 0.8));
}
/** Холод на цели: иней у ног, кристаллики, голубой отсвет. */
export function chilled(g, x, y, t, seed) {
  const r = rng(seed);
  add(g, () => glowE(g, x, y - 14, 24, 22, '120,190,255', 0.25));
  g.fillStyle = 'rgba(220,240,255,.55)'; g.beginPath(); g.ellipse(x, y, 20, 7, 0, 0, TAU); g.fill();
  for (let i = 0; i < 4; i++) iceSpike(g, x - 14 + i * 9 + r() * 3, y + 2, 7 + r() * 6, 3);
  for (let i = 0; i < 3; i++) { const q = (t * 0.6 + i / 3) % 1; glint(g, x + (r() - 0.5) * 30, y - 10 - q * 30, 2.4, 0.9 * Math.sin(q * Math.PI)); }
}
/** Огненный столп: руны на земле, потом столп огня (5 с), угольки по спирали, жар. e.r — радиус, e.dur. */
export function pillar(g, e, a, part = null) {
  const { x, y } = e, R = e.r || 62, D = e.dur || 5.4, f = clamp((D - a) / 0.5), t = a, me = py => !part || (part === 'front') === (py > y);
  // руны (с задней частью)
  const rq = clamp(a / 0.45);
  if (part !== 'front') { g.save(); g.globalAlpha = rq * f;
  add(g, () => { glowE(g, x, y, R * 1.25, R * 0.55, '255,110,30', 0.45); });
  g.strokeStyle = 'rgba(255,190,90,.9)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, R, R * 0.45, 0, 0, TAU * rq); g.stroke();
  g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, R * 0.8, R * 0.36, 0, 0, TAU); g.stroke();
  for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + t * 0.6, px = x + Math.cos(an) * R * 0.9, py = y + Math.sin(an) * R * 0.405; g.beginPath(); g.moveTo(px - 3, py - 2); g.lineTo(px, py + 2); g.lineTo(px + 3, py - 2); g.moveTo(px, py - 3); g.lineTo(px, py + 2); g.stroke(); }
  g.restore(); }
  if (a < 0.35) return;
  const k = clamp((a - 0.35) / 0.25) * f;
  if (part !== 'front') add(g, () => glow(g, x, y - 60, 70, '255,110,30', 0.3 * k));
  // языки огня по кругу (задние — за врагами, передние — перед ними) и высокое ядро в середине
  const F = [];
  for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, px = x + Math.cos(an) * R * 0.6, py = y + Math.sin(an) * R * 0.27; F.push([py, () => flame(g, px, py, (70 + 36 * Math.sin(t * 5 + i * 1.3)) * k, 10, t * 7 + i * 1.7, 0.85, 0)]); }
  for (let i = 0; i < 5; i++) { const an = i / 5 * TAU + 0.3, px = x + Math.cos(an) * R * 0.22, py = y + Math.sin(an) * R * 0.08; F.push([py, () => flame(g, px, py, (125 + 35 * Math.sin(t * 6 + i)) * k, 10, t * 9 + i * 2.3, 0.9, 0.6)]); }
  F.sort((a2, b) => a2[0] - b[0]); for (const [py, fn] of F) if (me(py)) fn();
  if (part === 'back') return;
  add(g, () => glow(g, x, y - 70, 40, '255,200,110', 0.35 * k));
  const r = rng(e.seed); add(g, () => { for (let i = 0; i < 18; i++) { const q = (t * (0.5 + r() * 0.4) + r()) % 1, an = r() * TAU + q * 5, px = x + Math.cos(an) * R * (0.3 + q * 0.4), py = y - q * 170 + Math.sin(an) * R * 0.2; glow(g, px, py, 3, '255,190,90', (1 - q) * k, 0.3); } });
  if (a > 0.4) sparks(g, x, y - 30, a - 0.4, e.seed + 3, 10, 150, '255,200,100', 1, 0.6);
}
/** Возгорание: короткая вспышка-искра над целью, когда крит поджигает. dur 0.5 */
export function igniteFlash(g, e, a) { add(g, () => { glow(g, e.x, e.y - 30, 26 * (1 + a), '255,150,40', 1 - a / 0.5); }); sparks(g, e.x, e.y - 30, a, e.seed, 8, 120, '255,210,120', 1, 0.4); }
/** Кольцо льда: волна холода расходится, за ней шипы, туман, иней по земле. e.r — радиус. dur 1.5 */
export function nova(g, e, a) {
  const { x, y } = e, R = e.r || 170, q = easeOut(a / 0.4), rr = 18 + q * R, f = clamp((1.5 - a) / 0.6), r = rng(e.seed);
  g.fillStyle = `rgba(215,238,255,${0.3 * f})`; g.beginPath(); g.ellipse(x, y, rr, rr * 0.45, 0, 0, TAU); g.fill();
  add(g, () => { if (a < 0.15) glow(g, x, y - 20, 70, '220,245,255', 1 - a / 0.15); glowE(g, x, y, rr, rr * 0.45, '130,200,255', 0.35 * f); });
  ring(g, x, y, rr, 4, '235,250,255', 0.9 * (1 - q * 0.6) * f);
  for (let i = 0; i < 28; i++) { const an = i / 28 * TAU + r() * 0.1, d = R * (0.82 + r() * 0.18); if (d > rr) continue; const px = x + Math.cos(an) * d, py = y + Math.sin(an) * d * 0.45, h = (12 + r() * 16) * f * clamp((rr - d) / 30 + 0.3); iceSpike(g, px, py, h, 4 + r() * 2, f); }
  for (let i = 0; i < 10; i++) glint(g, x + (r() - 0.5) * rr * 2, y + (r() - 0.5) * rr * 0.9 - 10, 3, 0.9 * f * Math.abs(Math.sin(a * 6 + i)));
  for (let i = 0; i < 8; i++) { const an = r() * TAU, px = x + Math.cos(an) * rr * 0.9, py = y + Math.sin(an) * rr * 0.4; glow(g, px, py - 6, 22, '230,240,250', 0.3 * f, 0.3); }
}
/** Ледяная глыба вокруг замороженного: полупрозрачный гранёный лёд с бликами и трещинами. w,h — размеры. */
export function iceBlock(g, x, y, w, h, t = 0, a = 1) {
  const d = w * 0.35, x0 = x - w / 2, y0 = y - h;
  g.save(); g.globalAlpha = a;
  const gf = g.createLinearGradient(x0, y0, x0 + w, y); gf.addColorStop(0, 'rgba(230,248,255,.55)'); gf.addColorStop(1, 'rgba(120,180,230,.45)');
  g.fillStyle = gf; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 3, y0 + 6); g.lineTo(x0 + w * 0.45, y0); g.lineTo(x0 + w - 2, y0 + 8); g.lineTo(x0 + w, y); g.closePath(); g.fill();
  g.fillStyle = 'rgba(240,252,255,.6)'; g.beginPath(); g.moveTo(x0 + 3, y0 + 6); g.lineTo(x0 + w * 0.45, y0); g.lineTo(x0 + w - 2, y0 + 8); g.lineTo(x0 + w * 0.5, y0 + 12); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,90,130,.9)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 3, y0 + 6); g.lineTo(x0 + w * 0.45, y0); g.lineTo(x0 + w - 2, y0 + 8); g.lineTo(x0 + w, y); g.closePath(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 + 6, y - 8); g.lineTo(x0 + 9, y0 + 14); g.stroke();
  g.strokeStyle = 'rgba(40,90,130,.5)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x0 + w * 0.6, y0 + 14); g.lineTo(x0 + w * 0.52, y0 + h * 0.5); g.lineTo(x0 + w * 0.66, y0 + h * 0.7); g.stroke();
  g.restore(); glint(g, x0 + w * 0.3, y0 + 10, 3, 0.6 + 0.4 * Math.sin(t * 4));
  void d;
}

// ================================================================ ЛУЧНИК
/** Стрела в полёте (любая): древко, наконечник, оперение; red — кровавый след. */
export function arrow(g, s, t, red = false) {
  const an = Math.atan2(s.vy, s.vx), sp = Math.hypot(s.vx, s.vy) || 1;
  if (red) { for (let i = 1; i <= 8; i++) { const b = i * 0.008, px = s.x - s.vx * b + Math.sin(t * 30 + i) * 1.5, py = s.y - s.vy * b + Math.cos(t * 26 + i) * 1.5; g.fillStyle = `rgba(200,20,20,${0.6 * (1 - i / 9)})`; g.beginPath(); g.arc(px, py, 2.6 - i * 0.22, 0, TAU); g.fill(); } add(g, () => glow(g, s.x, s.y, 10, '255,40,40', 0.5)); }
  else { g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(s.x - s.vx / sp * 26, s.y - s.vy / sp * 26); g.lineTo(s.x - s.vx / sp * 10, s.y - s.vy / sp * 10); g.stroke(); }
  g.save(); g.translate(s.x, s.y); g.rotate(an);
  g.strokeStyle = '#24180f'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(-16, 0); g.lineTo(7, 0); g.stroke();
  g.strokeStyle = s.from === 'mob' ? '#8a5a3a' : '#c9a06a'; g.lineWidth = 1.6; g.stroke();
  g.fillStyle = red ? '#ff5a5a' : '#cfd8de'; g.strokeStyle = '#24180f'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(11, 0); g.lineTo(5, -3.2); g.lineTo(6.2, 0); g.lineTo(5, 3.2); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = red ? '#d83a3a' : '#e8e0cc'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(-16, 0); g.lineTo(-12, sd * 4); g.lineTo(-9, sd * 4); g.lineTo(-12, 0); g.closePath(); g.fill(); }
  g.restore();
}
/** Попадание кровоточащей стрелы: брызги по ходу стрелы, вспышка. dur 1.2 */
export function bloodHit(g, e, a) { add(g, () => { if (a < 0.12) glow(g, e.x, e.y - 18, 22, '255,80,80', 1 - a / 0.12); }); blood(g, e.x, e.y - 6, a, e.seed, 10, e.dir || 0, 0.9, 0.8); }
/** Сеть в полёте: сетка раскрывается, по углам грузики крутятся. age — сколько летит. */
export function netFly(g, s, age) {
  const q = easeOut(age / 0.35), S = 10 + q * 30, rot = age * 7, n = 4;
  g.save(); g.translate(s.x, s.y); g.rotate(rot);
  const P = (i, j) => { const u = i / n - 0.5, v = j / n - 0.5, sag = (1 - (u * u + v * v) * 2) * 4 * q; return [u * S * 2, v * S * 2 + sag]; };
  g.strokeStyle = '#e8dcc0'; g.lineWidth = 1.3; g.lineCap = 'round';
  for (let i = 0; i <= n; i++) { g.beginPath(); for (let j = 0; j <= n; j++) { const [x, y] = P(i, j); j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.beginPath(); for (let j = 0; j <= n; j++) { const [x, y] = P(j, i); j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.strokeStyle = 'rgba(36,24,15,.5)'; g.lineWidth = 0.6; for (let i = 0; i <= n; i++) { g.beginPath(); for (let j = 0; j <= n; j++) { const [x, y] = P(i, j); j ? g.lineTo(x, y + 0.8) : g.moveTo(x, y + 0.8); } g.stroke(); }
  for (const [i, j] of [[0, 0], [n, 0], [0, n], [n, n]]) { const [x, y] = P(i, j); g.fillStyle = '#7a6a5a'; g.strokeStyle = '#24180f'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); g.stroke(); }
  g.restore();
}
/** Сеть на пойманном: купол из верёвок с узлами, грузики у земли, подрагивает. w,h — размеры цели. */
export function netWrap(g, x, y, w, h, t) {
  const jit = Math.sin(t * 22) * 0.8, top = y - h - 4, n = 6;
  g.strokeStyle = '#e8dcc0'; g.lineWidth = 1.3;
  for (let i = 0; i <= n; i++) { const u = i / n, bx = x - w / 2 - 4 + u * (w + 8); g.beginPath(); g.moveTo(bx, y + 2); g.quadraticCurveTo(x + (bx - x) * 0.4 + jit, top - 4, x + (bx - x) * 0.15, top + 2); g.stroke(); }
  for (let k = 1; k <= 3; k++) { const yy = y - h * k / 4, ww = (w / 2 + 6) * (1 - (k / 4) ** 2 * 0.5); g.beginPath(); g.ellipse(x + jit * 0.5, yy, ww, 4, 0, 0, Math.PI); g.stroke(); }
  g.fillStyle = '#c9a06a'; for (let i = 0; i <= n; i += 2) { const u = i / n, bx = x - w / 2 - 4 + u * (w + 8); g.beginPath(); g.arc(bx, y + 2, 2, 0, TAU); g.fill(); }
  g.fillStyle = '#7a6a5a'; g.strokeStyle = '#24180f'; g.lineWidth = 1; for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * (w / 2 + 6), y + 3, 3, 0, TAU); g.fill(); g.stroke(); }
}
/** Залп: стрелы уходят в небо, потом дождь стрел по кругу с тенями, пыль, воткнутые стрелы. e.x,e.y — середина, e.hx,e.hy — лучник, e.r, e.dur. */
export function volley(g, e, a, part = null) {
  const { x, y } = e, R = e.r || 105, D = e.dur || 3, r = rng(e.seed), f = clamp((D + 0.4 - a) / 0.4), air = part !== 'ground', grd = part !== 'air';
  // круг цели на земле
  if (grd) { g.strokeStyle = `rgba(255,220,150,${0.35 * f * clamp(a / 0.3)})`; g.lineWidth = 1.5; g.setLineDash([6, 6]); g.beginPath(); g.ellipse(x, y, R, R * 0.45, 0, 0, TAU); g.stroke(); g.setLineDash([]); }
  // вверх
  if (air && a < 0.45 && e.hx != null) for (let i = 0; i < 5; i++) { const q = a / 0.45, px = e.hx + (i - 2) * 6 + q * 20 * (i - 2), py = e.hy - 30 - q * 260; arrow(g, { x: px, y: py, vx: (i - 2) * 30, vy: -800 }, a); }
  // вниз — 46 стрел
  const N = 46;
  for (let i = 0; i < N; i++) {
    const t0 = 0.35 + r() * (D - 0.6), an = r() * TAU, d = Math.sqrt(r()) * R, gx = x + Math.cos(an) * d, gy = y + Math.sin(an) * d * 0.45, fall = 0.26, b = a - t0, tilt = (r() - 0.5) * 0.5;
    if (b < 0) continue;
    if (b < fall) {
      if (!air) continue;
      const q = b / fall, h = (1 - q) * 280; g.fillStyle = `rgba(0,0,0,${0.3 * q})`; g.beginPath(); g.ellipse(gx, gy, 4 + q * 3, 2, 0, 0, TAU); g.fill();
      const ax = gx + tilt * h * 0.3, ay = gy - h - 8; g.strokeStyle = 'rgba(255,250,230,.45)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ax - tilt * 12, ay - 40); g.lineTo(ax, ay - 6); g.stroke();
      g.save(); g.translate(ax, ay); g.scale(1.35, 1.35); arrow(g, { x: 0, y: 0, vx: -tilt * 300, vy: 1000 }, a); g.restore();
    } else {
      if (!grd) continue;
      const k = clamp(1 - (b - fall) / 0.9) * f; if (b - fall < 0.4) dust(g, gx, gy, b - fall, i + 3, 2, 0.4);
      if (k > 0) { g.save(); g.globalAlpha = k; g.translate(gx, gy); g.rotate(tilt); g.strokeStyle = '#24180f'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -14); g.stroke(); g.strokeStyle = '#c9a06a'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = '#e8e0cc'; g.beginPath(); g.moveTo(0, -14); g.lineTo(-3, -18); g.lineTo(0, -16); g.lineTo(3, -18); g.closePath(); g.fill(); g.restore(); g.globalAlpha = 1; }
    }
  }
}
/** Метка добивания: красные уголки вокруг раненого врага, медленно вращаются и пульсируют. */
export function executeMark(g, x, y, t, s = 1) {
  const k = 1 + 0.12 * Math.sin(t * 6), R = 22 * s * k, cy = y - 22 * s;
  g.save(); g.translate(x, cy); g.rotate(t * 0.8); g.strokeStyle = 'rgba(255,60,50,.9)'; g.lineWidth = 2.2; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(R, -7); g.lineTo(R, -R * 0.15); g.lineTo(R - 7, -R * 0.15); g.stroke(); }
  g.restore(); add(g, () => glow(g, x, cy, 8, '255,60,50', 0.5));
}
/** Вспышка крита: белые и красные лучи. dur 0.35 */
export function critBurst(g, e, a) {
  const q = a / 0.35, r = rng(e.seed), cy = e.y - 22;
  add(g, () => { glow(g, e.x, cy, 30 * (1 + q), '255,120,100', 1 - q); g.lineCap = 'round'; for (let i = 0; i < 10; i++) { const an = r() * TAU, L0 = 6 + q * 18, L1 = L0 + 12 + r() * 14; g.strokeStyle = `rgba(255,${200 + r() * 55},${200 + r() * 55},${1 - q})`; g.lineWidth = 2.2 * (1 - q); g.beginPath(); g.moveTo(e.x + Math.cos(an) * L0, cy + Math.sin(an) * L0); g.lineTo(e.x + Math.cos(an) * L1, cy + Math.sin(an) * L1); g.stroke(); } });
}
/** Капкан: стальные челюсти. open 0..1 — раскрыт (1) или сомкнут (0); у земли цепь и колышек. */
export function trap(g, x, y, open = 1, t = 0) {
  const R = 16, n = 9;
  g.strokeStyle = '#24180f'; g.lineWidth = 1.2;
  // цепь и колышек
  g.strokeStyle = '#6a6a70'; g.lineWidth = 1.6; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + R + 4 + i * 5, y + 2, 2.6, 1.6, 0, 0, TAU); g.stroke(); }
  g.fillStyle = '#6b4a2c'; g.strokeStyle = '#24180f'; g.lineWidth = 1; g.beginPath(); g.rect(x + R + 22, y - 2, 3, 6); g.fill(); g.stroke();
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x, y + 2, R + 4, (R + 4) * 0.4, 0, 0, TAU); g.fill();
  // основание
  g.fillStyle = '#5a5a62'; g.beginPath(); g.ellipse(x, y, R * 0.55, R * 0.22, 0, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#c8b070'; g.beginPath(); g.ellipse(x, y - 1, R * 0.28, R * 0.11, 0, 0, TAU); g.fill();
  // две дуги-челюсти: раскрыты — лежат по земле, сомкнуты — стоят зубьями вверх
  for (const sd of [-1, 1]) {
    const lift = (1 - open);   // 0 — лежит, 1 — стоит
    g.save(); g.translate(x, y);
    const pts = []; for (let i = 0; i <= n; i++) { const u = i / n, an = Math.PI * u; pts.push([Math.cos(an) * R, sd * Math.sin(an) * R * 0.42 * (1 - lift) - lift * Math.sin(an) * R * 0.9]); }
    g.strokeStyle = '#24180f'; g.lineWidth = 4; g.beginPath(); pts.forEach(([u, v], i) => i ? g.lineTo(u, v) : g.moveTo(u, v)); g.stroke();
    g.strokeStyle = '#9a9aa4'; g.lineWidth = 2.2; g.stroke();
    g.fillStyle = '#dcdce4'; g.strokeStyle = '#24180f'; g.lineWidth = 0.7;
    for (let i = 1; i < n; i++) { const [u, v] = pts[i], an = Math.PI * i / n, tx = -Math.cos(an) * 0.3, ty = lift > 0.5 ? (sd < 0 ? 4 : -4) : -sd * 4; g.beginPath(); g.moveTo(u - 2, v); g.lineTo(u + tx * 6, v + ty); g.lineTo(u + 2, v); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }
  if (open > 0.9) add(g, () => glow(g, x, y - 2, 6, '255,240,180', 0.3 + 0.3 * Math.sin(t * 5)));
}
/** Захлоп капкана: искры, пыль, кровь. dur 0.9 */
export function trapSnap(g, e, a) { sparks(g, e.x, e.y - 6, a, e.seed, 12, 140, '255,230,170', 1, 0.4); dust(g, e.x, e.y, a, e.seed + 1, 5, 0.8); blood(g, e.x, e.y - 4, a, e.seed + 2, 6, -Math.PI / 2, 2.4, 0.6); }
/** Оглушение: три звезды кружат над головой и оставляют след. */
export function stunStars(g, x, y, t) {
  add(g, () => { for (let i = 0; i < 3; i++) { for (let k = 4; k >= 0; k--) { const an = t * 5 - k * 0.12 + i * TAU / 3, px = x + Math.cos(an) * 13, py = y + Math.sin(an) * 4; if (k) glow(g, px, py, 4 - k * 0.5, '255,230,120', 0.25 * (1 - k / 5)); else star(g, px, py, 4.4); } } });
}
function star(g, x, y, r) { g.fillStyle = '#ffe066'; g.strokeStyle = '#7a5a10'; g.lineWidth = 0.8; g.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * 0.42 : r, b = k * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); } g.closePath(); g.fill(); g.stroke(); }
