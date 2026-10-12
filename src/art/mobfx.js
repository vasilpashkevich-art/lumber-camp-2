// v75: умения мобов — аккуратно и сдержанно. Как и vfx.js: всё по возрасту a (секунды) и зерну, без своего состояния.
// Удар по площади (Атаман, Полоз): тонкая граница на земле и заполнение к моменту удара, потом волна, пыль, трещины.
// Разбег и таран, яд, споры, бутыль с огнём, проклятие, призыв.
import { rng, clamp, easeOut, glow, glowE, add, ring, dust, debris, smoke, sparks } from './vfx.js';
const TAU = Math.PI * 2;
const ell = (g, x, y, r, k = 0.5) => { g.beginPath(); g.ellipse(x, y, r, r * k, 0, 0, TAU); };

/** Куда придётся удар: q — доля замаха (0…1), f.r — радиус. Без красной заливки: граница и спокойное заполнение. */
export function telegraph(g, f, q, age = 1) {
  const { x, y, r } = f, inA = clamp(age / 0.15), k = f.style === 'coil' ? '200,230,150' : '255,214,150';
  // мягкая полоса вдоль края изнутри
  g.save(); g.translate(x, y); g.scale(1, 0.5);
  const gr = g.createRadialGradient(0, 0, r * 0.55, 0, 0, r);
  gr.addColorStop(0, `rgba(${k},0)`); gr.addColorStop(1, `rgba(${k},${(0.16 + 0.14 * q) * inA})`);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  // заполнение к удару
  const rq = r * (0.08 + 0.92 * q * q);
  g.fillStyle = `rgba(${k},${(0.07 + 0.09 * q) * inA})`; g.beginPath(); g.arc(0, 0, rq, 0, TAU); g.fill();
  g.restore();
  g.lineWidth = 1; g.strokeStyle = `rgba(${k},${0.45 * inA * (0.4 + 0.6 * q)})`; ell(g, x, y, rq); g.stroke();
  // граница: тонкая, к удару ярче
  g.lineWidth = 1.6; g.strokeStyle = `rgba(${k},${(0.4 + 0.5 * q) * inA})`; ell(g, x, y, r); g.stroke();
  if (q > 0.85) { g.lineWidth = 3; g.strokeStyle = `rgba(255,250,235,${(q - 0.85) / 0.15 * 0.35})`; ell(g, x, y, r); g.stroke(); }
}

/** Песок и камешки, которые стягиваются к центру во время замаха (под ногами у цели). */
export function gather(g, f, q) {
  const r = rng(f.seed || 3);
  for (let i = 0; i < 10; i++) { const an = r() * TAU, d0 = f.r * (0.6 + r() * 0.4), ph = (q * 1.4 + r()) % 1, d = d0 * (1 - ph * 0.35), a = Math.sin(ph * Math.PI) * 0.35 * q;
    g.fillStyle = `rgba(90,70,50,${a})`; g.beginPath(); g.arc(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d * 0.5, 1.2 + r(), 0, TAU); g.fill(); }
}

/** Трещины без свечения: тонкие тёмные ломаные. */
function cleanCracks(g, x, y, a, seed, n, len, life = 1.6) {
  const r = rng(seed), grow = easeOut(a / 0.1), f = clamp((life - a) / 0.6); if (f <= 0) return;
  for (let i = 0; i < n; i++) {
    let an = i / n * TAU + r() * 0.6, px = x, py = y; const L = len * (0.45 + r() * 0.55) * grow;
    g.lineWidth = 1.6; g.strokeStyle = `rgba(30,20,12,${0.55 * f})`; g.beginPath(); g.moveTo(px, py);
    for (let k = 0; k < 4; k++) { an += (r() - 0.5) * 0.8; px += Math.cos(an) * L / 4; py += Math.sin(an) * L / 4 * 0.5; g.lineTo(px, py); } g.stroke();
  }
}

/** Пыль кольцом: клубы выходят к краю площади и тают. */
function dustRing(g, x, y, a, seed, R, n = 14, rgb = '168,148,118', life = 0.9) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const an = i / n * TAU + r() * 0.3, q = clamp(a / (life * (0.8 + r() * 0.4))), d = R * (0.3 + 0.75 * easeOut(q)), s = (7 + r() * 6) * (0.7 + q);
    glowE(g, x + Math.cos(an) * d, y + Math.sin(an) * d * 0.5 - q * 8, s * 1.3, s, rgb, 0.42 * (1 - q) * clamp(a / 0.05));
  }
}

/** Удар по площади. e.style: 'slam' — оружием в землю (Атаман), 'coil' — бросок кольцами (Полоз). */
export function slam(g, e, a) {
  const { x, y, r } = e, coil = e.style === 'coil';
  // вмятина
  const sc = clamp(1 - a / 1.6); if (sc > 0 && !coil) { g.fillStyle = `rgba(40,28,16,${0.22 * sc})`; ell(g, x, y, r * 0.32); g.fill(); }
  if (!coil) cleanCracks(g, x, y, a, e.seed, 7, r * 0.7);
  else { const f = clamp(1 - a / 1.4); g.strokeStyle = `rgba(40,30,18,${0.4 * f})`; g.lineWidth = 2.2; for (let i = 0; i < 2; i++) { g.beginPath(); g.ellipse(x, y, r * (0.35 + i * 0.22), r * (0.35 + i * 0.22) * 0.5, 0, 0.3 + i, 2.6 + i); g.stroke(); } }
  // вспышка и волна
  add(g, () => { if (a < 0.1) glowE(g, x, y - 4, r * 0.45, r * 0.22, coil ? '220,255,200' : '255,240,210', 0.7 * (1 - a / 0.1)); });
  const wq = clamp(a / 0.4); ring(g, x, y, r * (0.15 + 0.95 * easeOut(wq)), 2.4 * (1 - wq) + 0.5, coil ? '220,240,200' : '255,236,200', 0.75 * (1 - wq));
  ring(g, x, y, r * (0.1 + 0.7 * easeOut(clamp(a / 0.55))), 1, '255,255,255', 0.35 * (1 - clamp(a / 0.55)));
  dustRing(g, x, y, a, e.seed + 1, r, coil ? 16 : 14, coil ? '150,150,110' : '168,148,118');
  dust(g, x, y, a, e.seed + 2, 5, 0.9);
  if (!coil) debris(g, x, y, a, e.seed + 3, 7);
  else debris(g, x, y, a, e.seed + 3, 6, ['#6a7a3a', '#8a9a4a', '#5a4a30']);
}

/** Разбег: клубы из-под копыт (вызывается для каждого клуба по его возрасту). */
export function hoofDust(g, x, y, a, seed) {
  const r = rng(seed), q = clamp(a / 0.7); if (q >= 1) return;
  glowE(g, x + (r() - 0.5) * 6, y - q * 6, 6 + q * 10, 4 + q * 7, '176,156,124', 0.38 * (1 - q));
}
/** Таран: удар в цель — пыль, короткая волна, камешки. */
export function ram(g, e, a) {
  const { x, y } = e;
  ring(g, x, y, 8 + easeOut(clamp(a / 0.3)) * 34, 2, '240,225,190', 0.7 * (1 - clamp(a / 0.3)));
  dust(g, x, y, a, e.seed, 7, 0.8);
  debris(g, x, y, a, e.seed + 1, 4);
  if (a < 0.35) sparks(g, x, y - 18, a, e.seed + 2, 6, 120, '255,240,200', 0.8, 0.3);
}

/** Капли: яд, тина, кровь — дугой и пятна на земле. */
function drops(g, x, y, a, seed, n, col, spot, power = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const an = r() * TAU, v = (30 + r() * 60) * power, vz = 50 + r() * 80, s = 1.1 + r() * 1.4, tl = vz / 300 * 2, t = Math.min(a, tl);
    const gx = x + Math.cos(an) * v * t, gy = y + Math.sin(an) * v * t * 0.5, h = 20 + vz * t - 150 * t * t;
    if (a < tl) { g.fillStyle = col; g.beginPath(); g.ellipse(gx, gy - h, s, s * 1.25, 0, 0, TAU); g.fill(); }
    else { const f = clamp(1 - (a - tl) / 1.2); if (f > 0) { g.fillStyle = spot.replace('A', (0.55 * f).toFixed(3)); g.beginPath(); g.ellipse(gx, gy, s * 1.5, s * 0.6, 0, 0, TAU); g.fill(); } }
  }
}
/** Ядовитый укус: зелёные брызги и пузырьки над целью. */
export function venom(g, e, a) {
  const { x, y } = e;
  drops(g, x, y, a, e.seed, 9, '#7ac83a', 'rgba(70,120,30,A)', 0.9);
  const r = rng(e.seed + 5);
  for (let i = 0; i < 5; i++) { const d = r() * 0.4, q = clamp((a - d) / 0.7); if (q <= 0 || q >= 1) continue; const px = x + (r() - 0.5) * 22, py = y - 20 - q * 22, s = 1.6 + r() * 1.6;
    g.strokeStyle = `rgba(170,240,120,${0.8 * (1 - q)})`; g.lineWidth = 0.8; g.beginPath(); g.arc(px, py, s, 0, TAU); g.stroke(); }
}

/** Споры в полёте: мягкое облачко с крупинками. */
export function sporeShot(g, s, t) {
  const r = rng(7);
  glow(g, s.x, s.y, 13, '200,220,120', 0.45, 0.3);
  for (let i = 0; i < 7; i++) { const an = t * (1.5 + r()) + r() * TAU, d = 3 + r() * 6; g.fillStyle = `rgba(236,240,170,${0.6 + r() * 0.3})`; g.beginPath(); g.arc(s.x + Math.cos(an) * d, s.y + Math.sin(an) * d * 0.8, 0.9 + r() * 0.8, 0, TAU); g.fill(); }
}
/** Облако спор там, куда попало: расходится и оседает. */
export function sporeBurst(g, e, a) {
  const { x, y } = e, r = rng(e.seed);
  for (let i = 0; i < 9; i++) { const an = r() * TAU, d = 6 + r() * 26 * easeOut(clamp(a / 0.8)), q = clamp(a / (0.9 + r() * 0.4)), s = 10 + r() * 10 + q * 12;
    glow(g, x + Math.cos(an) * d, y - 18 + Math.sin(an) * d * 0.6 + q * 10, s, '196,214,120', 0.5 * (1 - q), 0.3); }
  for (let i = 0; i < 12; i++) { const an = r() * TAU, d = r() * 30 * easeOut(clamp(a / 0.6)), q = clamp(a / 1.2); g.fillStyle = `rgba(236,240,170,${0.8 * (1 - q)})`; g.beginPath(); g.arc(x + Math.cos(an) * d, y - 20 + Math.sin(an) * d * 0.6 + q * 16, 1, 0, TAU); g.fill(); }
}

/** Бутыль с горючим: стекло, горлышко, тряпка с огнём; крутится в полёте. */
export function bottleShot(g, s, t) {
  const a = (s.age || 0) * 9;
  add(g, () => glow(g, s.x, s.y - 4, 10, '255,170,70', 0.5));
  g.save(); g.translate(s.x, s.y); g.rotate(a);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0.6, 0.8, 3.6, 5, 0, 0, TAU); g.fill();
  g.fillStyle = '#5a7a5a'; g.beginPath(); g.ellipse(0, 1, 3.4, 4.6, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(200,120,40,.55)'; g.beginPath(); g.ellipse(0, 2.4, 2.8, 2.6, 0, 0, TAU); g.fill();   // горючее
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-1.2, -0.4, 0.8, 1.8, 0.3, 0, TAU); g.fill();
  g.fillStyle = '#4a6a4a'; g.fillRect(-1.1, -6, 2.2, 3); g.fillStyle = '#d8c8a0'; g.fillRect(-1.3, -7.4, 2.6, 1.6);
  g.restore();
  // пламя тряпки — всегда вверх
  const tx = s.x + Math.sin(a) * 6.5, ty = s.y - Math.cos(a) * 6.5, fl = Math.sin(t * 30) * 1;
  add(g, () => { glow(g, tx, ty - 3, 6, '255,190,90', 0.8); g.fillStyle = 'rgba(255,220,140,.9)'; g.beginPath(); g.moveTo(tx - 1.6, ty); g.quadraticCurveTo(tx + fl, ty - 7, tx + 1.6, ty); g.fill(); });
}
/** Бутыль разбилась: осколки, вспышка, лужа огня горит и гаснет. */
export function fireSplash(g, e, a) {
  const { x, y } = e, r = rng(e.seed), life = e.max || 1.6;
  add(g, () => { if (a < 0.12) glow(g, x, y - 10, 34, '255,200,120', 1 - a / 0.12); });
  const f = clamp((life - a) / 0.6) * clamp(a / 0.08);
  g.fillStyle = `rgba(40,20,10,${0.3 * f})`; ell(g, x, y, 18 * easeOut(clamp(a / 0.2)), 0.45); g.fill();   // пятно
  add(g, () => { for (let i = 0; i < 7; i++) { const px = x + (r() - 0.5) * 30, py = y + (r() - 0.5) * 10, h = (8 + r() * 10) * f * (0.75 + 0.25 * Math.sin(a * 14 + i * 2)); if (h < 1) continue;
    glow(g, px, py - h * 0.4, h * 0.8, '255,140,50', 0.35 * f); g.fillStyle = `rgba(255,${190 + (i % 3) * 20},110,${0.8 * f})`; g.beginPath(); g.moveTo(px - 3, py); g.quadraticCurveTo(px + Math.sin(a * 9 + i) * 2, py - h, px + 3, py); g.fill(); } });
  for (let i = 0; i < 6; i++) { const an = r() * TAU, v = 40 + r() * 50, t2 = Math.min(a, 0.35), px = x + Math.cos(an) * v * t2, py = y + Math.sin(an) * v * t2 * 0.5 - Math.max(0, 70 * t2 - 200 * t2 * t2) - 4, q = clamp(1 - a / 0.9);
    if (q <= 0) continue; g.fillStyle = `rgba(150,200,150,${0.8 * q})`; g.beginPath(); g.moveTo(px, py - 1.6); g.lineTo(px + 1.4, py + 0.6); g.lineTo(px - 1, py + 1); g.closePath(); g.fill(); }
  smoke(g, x, y - 6, a, e.seed + 3, 3, '70,64,60', 40, 1.2);
}

/** Проклятие (тина, зелёный сгусток): ядро и хвост завитками. */
export function curseShot(g, s, t) {
  const sp = Math.hypot(s.vx, s.vy) || 1, ux = s.vx / sp, uy = s.vy / sp;
  add(g, () => {
    for (let i = 1; i <= 6; i++) { const k = i * 4.5, w = Math.sin(t * 12 + i) * 2.2; glow(g, s.x - ux * k - uy * w, s.y - uy * k + ux * w, 7 - i * 0.7, '110,230,150', 0.4 - i * 0.05, 0.3); }
    glow(g, s.x, s.y, 12, '120,255,170', 0.55); glow(g, s.x, s.y, 5, '230,255,235', 0.95, 0.4);
  });
}
/** Проклятие попало: зелёные кольца стягиваются вокруг ног. */
export function curseHit(g, e, a) {
  const { x, y } = e;
  add(g, () => { if (a < 0.15) glow(g, x, y - 20, 24, '140,255,180', 0.7 * (1 - a / 0.15)); });
  for (let i = 0; i < 3; i++) { const q = clamp((a - i * 0.12) / 0.6); if (q <= 0 || q >= 1) continue; const rr = 26 * (1 - q * 0.6);
    g.strokeStyle = `rgba(140,240,170,${0.85 * (1 - q)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 4 - q * 10 - i * 5, rr, rr * 0.4, 0, 0, TAU); g.stroke(); }
}

/** Призыв: появление помощника. e.kind — crow (перья и тень), kvakun (брызги тины), weaver/иное (земля и паутинки). */
export function summonFx(g, e, a) {
  const { x, y } = e, r = rng(e.seed);
  if (e.kind === 'crow') {
    smoke(g, x, y - 20, a, e.seed, 4, '40,36,44', 30, 0.8);
    for (let i = 0; i < 6; i++) { const an = r() * TAU, d = 8 + a * 40 * (0.5 + r()), q = clamp(a / 0.9); if (q >= 1) break; const px = x + Math.cos(an) * d, py = y - 24 + Math.sin(an) * d * 0.6 + q * 20, rot = an + a * 4;
      g.save(); g.translate(px, py); g.rotate(rot); g.fillStyle = `rgba(30,28,36,${0.85 * (1 - q)})`; g.beginPath(); g.ellipse(0, 0, 3.2, 1, 0, 0, TAU); g.fill(); g.restore(); }
    return;
  }
  if (e.kind === 'kvakun') { drops(g, x, y, a, e.seed, 10, '#6a9a5a', 'rgba(60,90,40,A)', 0.8); ring(g, x, y, 6 + easeOut(clamp(a / 0.5)) * 26, 1.6, '170,210,160', 0.6 * (1 - clamp(a / 0.5))); return; }
  dust(g, x, y, a, e.seed, 5, 0.7, '120,100,80'); debris(g, x, y, a, e.seed + 1, 4, ['#5a4a38', '#7a6a50']);
  g.strokeStyle = `rgba(230,230,220,${0.5 * clamp(1 - a / 0.9)})`; g.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) { const an = r() * TAU, L = 14 + r() * 10; g.beginPath(); g.moveTo(x, y - 6); g.quadraticCurveTo(x + Math.cos(an) * L * 0.5, y - 14, x + Math.cos(an) * L, y - 4 + Math.sin(an) * L * 0.4); g.stroke(); }
}
