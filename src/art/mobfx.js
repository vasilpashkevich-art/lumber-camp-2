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
  const { x, y, r } = e, coil = e.style === 'coil', mud = e.style === 'mud';
  if (mud) { const f = clamp(1 - a / 1.2); g.fillStyle = `rgba(30,40,24,${0.45 * f})`; ell(g, x, y, r * 0.6); g.fill(); for (let i = 0; i < 6; i++) { const aa = i * TAU / 6 + a * 2, rr2 = r * (0.3 + 0.5 * clamp(a / 0.5)); g.fillStyle = `rgba(70,90,50,${0.7 * f})`; g.beginPath(); g.arc(x + Math.cos(aa) * rr2, y + Math.sin(aa) * rr2 * 0.5 - a * 20, 4 + (i % 3) * 2, 0, TAU); g.fill(); } }
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

/** v136: сеть рыбака в полёте — круг верёвок с грузилами. */
export function netShot(g, s, t) {
  const r = 14 + Math.sin(t * 14) * 1.5; g.save(); g.translate(s.x, s.y); g.rotate(t * 5);
  g.strokeStyle = 'rgba(220,210,160,.9)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r); g.lineTo(-Math.cos(a) * r, -Math.sin(a) * r); g.stroke(); }
  g.fillStyle = '#5a5a5a'; for (let i = 0; i < 6; i++) { const a = i * TAU / 6; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 2, 0, TAU); g.fill(); } g.restore();
}
/** v136: сеть накрыла героя — сетка оседает и держится. */
export function netHit(g, e, a) {
  const { x, y } = e, q = clamp(a / 1.6), r = 30 - q * 6, yy = y - 40 + q * 20;
  g.strokeStyle = `rgba(220,210,160,${0.85 * (1 - q * 0.6)})`; g.lineWidth = 1.1;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(x + i * 9, yy - r); g.quadraticCurveTo(x + i * 9 * 1.1, yy, x + i * 9, yy + r * 0.5); g.stroke(); g.beginPath(); g.moveTo(x - r, yy + i * 7); g.quadraticCurveTo(x, yy + i * 7 + 4, x + r, yy + i * 7); g.stroke(); }
}
/** v136: хватка утопленника — зелёные руки-тени из земли вокруг ног героя. */
export function grab(g, e, a) {
  const { x, y } = e, q = clamp(a / e.max); g.fillStyle = `rgba(60,110,80,${0.6 * (1 - q)})`;
  for (const [dx, h] of [[-14, 18], [12, 22], [-4, 14], [20, 12]]) { g.beginPath(); g.moveTo(x + dx - 3, y + 2); g.quadraticCurveTo(x + dx - 4, y - h * 0.6, x + dx + 1, y - h); g.quadraticCurveTo(x + dx + 4, y - h * 0.5, x + dx + 3, y + 2); g.closePath(); g.fill(); }
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

// ---------------------------------------------------------------- v94: умения боссов
/** Конус удара перед боссом: f.a — направление, f.arc — ширина, f.r — дальность; q — доля замаха. */
export function teleCone(g, f, q, age = 1) {
  const { x, y, r, a, arc } = f, inA = clamp(age / 0.15), k = '255,200,140';
  g.save(); g.translate(x, y); g.scale(1, 0.5);
  g.fillStyle = `rgba(${k},${(0.12 + 0.12 * q) * inA})`; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a - arc / 2, a + arc / 2); g.closePath(); g.fill();
  g.fillStyle = `rgba(${k},${(0.1 + 0.12 * q) * inA})`; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r * (0.1 + 0.9 * q * q), a - arc / 2, a + arc / 2); g.closePath(); g.fill();
  g.lineWidth = 3.2; g.strokeStyle = `rgba(${k},${(0.45 + 0.5 * q) * inA})`; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a - arc / 2, a + arc / 2); g.closePath(); g.stroke();
  g.restore();
}
/** Полоса рывка или броска: от (x,y) до (x2,y2) шириной w. */
export function teleLine(g, f, q, age = 1) {
  const { x, y, x2, y2, w } = f, inA = clamp(age / 0.15), k = f.col || '255,200,140', an = Math.atan2(y2 - y, x2 - x), L = Math.hypot(x2 - x, y2 - y);
  g.save(); g.translate(x, y); g.rotate(an);
  const ky = 0.5 + 0.5 * Math.abs(Math.cos(an)), hw = w / 2 * ky;   // ширина сплющена по взгляду сверху
  g.fillStyle = `rgba(${k},${(0.12 + 0.1 * q) * inA})`; g.fillRect(0, -hw, L, hw * 2);
  g.fillStyle = `rgba(${k},${(0.1 + 0.14 * q) * inA})`; g.fillRect(0, -hw, L * q, hw * 2);
  g.lineWidth = 2.6; g.strokeStyle = `rgba(${k},${(0.45 + 0.5 * q) * inA})`; g.strokeRect(0, -hw, L, hw * 2);
  // стрелки вдоль
  g.fillStyle = `rgba(255,240,210,${0.35 * inA})`; for (let s = 30; s < L - 10; s += 46) { g.beginPath(); g.moveTo(s, -hw * 0.5); g.lineTo(s + 16, 0); g.lineTo(s, hw * 0.5); g.closePath(); g.fill(); }
  g.restore();
}
/** Кольцо змеи вокруг героя с просветом: чешуйчатые изгибы, просвет подсвечен; q — доля до сжатия. */
export function coilRing(g, R, q, t) {
  const { x, y, r, gap, gw } = R;
  g.save(); g.translate(x, y); g.scale(1, 0.5);
  // тёмная граница сжатия
  g.fillStyle = `rgba(40,70,20,${0.12 + 0.15 * q})`; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  const a0 = gap + gw / 2, a1 = gap - gw / 2 + TAU, n = 40;
  for (let pass = 0; pass < 2; pass++) {
    g.lineWidth = pass ? 12 : 18; g.lineCap = 'round'; g.strokeStyle = pass ? '#6f8a32' : '#1d2a0e';
    g.beginPath(); for (let i = 0; i <= n; i++) { const an = a0 + (a1 - a0) * i / n, rr = r + Math.sin(i * 1.3 + t * 6) * 4; const px = Math.cos(an) * rr, py = Math.sin(an) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke();
  }
  g.fillStyle = 'rgba(210,220,120,.55)'; for (let i = 1; i < n; i += 2) { const an = a0 + (a1 - a0) * i / n; g.beginPath(); g.arc(Math.cos(an) * r, Math.sin(an) * r, 2.6, 0, TAU); g.fill(); }
  // просвет — светлая дорожка наружу
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);
  g.strokeStyle = `rgba(200,255,170,${0.5 + 0.4 * pulse})`; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r, gap - gw / 2 + 0.05, gap + gw / 2 - 0.05); g.stroke();
  g.fillStyle = `rgba(200,255,170,${0.25 + 0.25 * pulse})`; g.beginPath(); g.moveTo(Math.cos(gap) * r * 0.55, Math.sin(gap) * r * 0.55); g.lineTo(Math.cos(gap - 0.25) * r * 0.8, Math.sin(gap - 0.25) * r * 0.8); g.lineTo(Math.cos(gap) * r * 1.15, Math.sin(gap) * r * 1.15); g.lineTo(Math.cos(gap + 0.25) * r * 0.8, Math.sin(gap + 0.25) * r * 0.8); g.closePath(); g.fill();
  // голова змеи у края просвета
  const hx = Math.cos(a1) * r, hy = Math.sin(a1) * r; g.fillStyle = '#3d5418'; g.beginPath(); g.ellipse(hx, hy, 14, 11, a1 + Math.PI / 2, 0, TAU); g.fill(); g.fillStyle = '#e8d040'; g.beginPath(); g.arc(hx + 4, hy - 3, 2.4, 0, TAU); g.fill();
  g.restore();
  // счёт к сжатию: внутреннее кольцо стягивается
  g.lineWidth = 2; g.strokeStyle = `rgba(255,120,80,${0.3 + 0.5 * q})`; ell(g, x, y, r * (1 - q * 0.9)); g.stroke();
}
/** Лужа яда на полу: пузыри, края дрожат. life — сколько осталось из max. */
export function puddle(g, h, t) {
  const f = clamp(h.t / 1.2) * clamp((h.max - h.t) / 0.5), r = rng(h.seed || 5);
  g.save(); g.translate(h.x, h.y); g.scale(1, 0.5);
  const gr = g.createRadialGradient(0, 0, h.r * 0.2, 0, 0, h.r);
  gr.addColorStop(0, `rgba(120,200,40,${0.55 * f})`); gr.addColorStop(0.75, `rgba(80,150,30,${0.45 * f})`); gr.addColorStop(1, 'rgba(60,110,20,0)');
  g.fillStyle = gr; g.beginPath(); for (let i = 0; i <= 16; i++) { const an = i / 16 * TAU, rr = h.r * (0.88 + 0.12 * Math.sin(an * 3 + h.seed + t)); g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.fill();
  g.restore();
  for (let i = 0; i < 4; i++) { const ph = (t * 0.8 + r()) % 1, bx = h.x + (r() - 0.5) * h.r, by = h.y + (r() - 0.5) * h.r * 0.4; g.strokeStyle = `rgba(200,255,140,${0.6 * (1 - ph) * f})`; g.lineWidth = 1.2; g.beginPath(); g.arc(bx, by - ph * 6, 1.5 + ph * 3, 0, TAU); g.stroke(); }
}
/** Сброс кожи: шелуха разлетается, зелёная вспышка. */
export function shed(g, e, a) {
  const r = rng(e.seed);
  add(g, () => glowE(g, e.x, e.y - 20, 70 * (1 + a), 40 * (1 + a), '170,255,120', 0.5 * clamp(1 - a / 0.8)));
  for (let i = 0; i < 14; i++) { const an = r() * TAU, d = 20 + easeOut(clamp(a / 1.2)) * (60 + r() * 60), f = clamp(1 - a / 1.6); g.fillStyle = `rgba(200,190,140,${0.8 * f})`; g.save(); g.translate(e.x + Math.cos(an) * d, e.y - 20 + Math.sin(an) * d * 0.5 + a * 20); g.rotate(an + a * 3); g.fillRect(-5, -2, 10, 4); g.restore(); }
}
/** Щит спереди (Воевода): дуга в сторону dir; open — опущен. */
export function shieldArc(g, x, y, dir, r, t, open) {
  if (open) return;
  g.save(); g.translate(x, y); g.scale(1, 0.5);
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  g.lineCap = 'round'; g.lineWidth = 7; g.strokeStyle = `rgba(255,220,120,${0.35 + 0.2 * pulse})`; g.beginPath(); g.arc(0, 0, r, dir - 1.2, dir + 1.2); g.stroke();
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,250,220,.8)'; g.beginPath(); g.arc(0, 0, r, dir - 1.2, dir + 1.2); g.stroke();
  g.restore();
}
/** Неуязвим: переливающаяся оболочка. */
export function immuneShell(g, x, y, w, h, t) {
  const p = 0.5 + 0.5 * Math.sin(t * 6);
  g.strokeStyle = `rgba(200,255,170,${0.5 + 0.3 * p})`; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y - h * 0.45, w * 0.75, h * 0.62, 0, 0, TAU); g.stroke();
  g.fillStyle = `rgba(170,255,140,${0.08 + 0.06 * p})`; g.fill();
}

// ---------------------------------------------------------------- v117: Жрица Квакша и Король квакунов
// Язык формы и цвета: лист кувшинки — укрытие (доброе: круглое, тёплое зелёное); дождь, тина, обряд — опасное (острое, ядовитое).

/** Лист кувшинки на лужице воды. left — сколько секунд ещё держится (0 — утонул), up — сколько держится всего. */
export function lilyPad(g, p, left, t) {
  const r = rng(p.seed || 3), R = p.r;
  // лужица всегда: тут появится лист
  g.save(); g.translate(p.x, p.y); g.scale(1, 0.55);
  const gw = g.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.15); gw.addColorStop(0, 'rgba(90,150,150,.55)'); gw.addColorStop(1, 'rgba(60,100,100,0)');
  g.fillStyle = gw; g.beginPath(); g.arc(0, 0, R * 1.15, 0, TAU); g.fill();
  for (let i = 0; i < 2; i++) { const q = (t * 0.5 + i * 0.5 + r()) % 1; g.strokeStyle = `rgba(200,240,240,${0.35 * (1 - q)})`; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, R * (0.4 + q * 0.8), 0, TAU); g.stroke(); }
  if (left > 0) {
    const sink = left < 1.6, bl = sink ? 0.55 + 0.45 * Math.sin(t * 16) : 1, k = Math.min(1, (p.up - left) / 0.35 + 0.2), sc = sink ? 0.85 + 0.15 * (left / 1.6) : 1;
    g.globalAlpha = bl * k; g.scale(sc, sc);
    g.fillStyle = '#2c5a24'; g.beginPath(); g.arc(3, 4, R, 0.25, TAU - 0.25); g.lineTo(3, 4); g.closePath(); g.fill();   // тень и обводка
    const gl = g.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R); gl.addColorStop(0, '#9ad860'); gl.addColorStop(0.7, '#5aa83a'); gl.addColorStop(1, '#3f8a2a');
    g.fillStyle = gl; g.strokeStyle = '#2a5a1e'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R, 0.25, TAU - 0.25); g.lineTo(0, 0); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(40,90,30,.55)'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { const a = 0.5 + i / 7 * (TAU - 1); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85); g.stroke(); }
    g.fillStyle = 'rgba(255,255,230,.45)'; g.beginPath(); g.ellipse(-R * 0.4, -R * 0.42, R * 0.28, R * 0.14, -0.5, 0, TAU); g.fill();
    if (p.i % 2 === 0) { g.fillStyle = '#f4b8d0'; g.strokeStyle = '#9a4a6a'; g.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.ellipse(R * 0.42 + Math.cos(a) * 6, R * 0.25 + Math.sin(a) * 6, 6, 3.6, a, 0, TAU); g.fill(); g.stroke(); } g.fillStyle = '#ffe070'; g.beginPath(); g.arc(R * 0.42, R * 0.25, 3.5, 0, TAU); g.fill(); }
  }
  g.restore();
}
/** Ядовитый дождь: острые зелёные струи по видимой части зала и мутная дымка. */
export function poisonRain(g, x0, y0, w, h, t) {
  g.fillStyle = 'rgba(80,140,30,.10)'; g.fillRect(x0, y0, w, h);
  const N = Math.round(w * h / 9000), r = rng(77);
  g.strokeStyle = 'rgba(170,240,70,.55)'; g.lineWidth = 1.6; g.beginPath();
  for (let i = 0; i < N; i++) { const sx = r() * w, sp = 0.6 + r() * 0.5, q = (t * sp + r()) % 1, x = x0 + (sx + q * 40) % w, y = y0 + q * h; g.moveTo(x, y); g.lineTo(x - 7, y - 22); }
  g.stroke();
  g.fillStyle = 'rgba(190,255,90,.6)'; for (let i = 0; i < N / 3; i++) { const q = (t * 1.3 + r()) % 1, x = x0 + r() * w, y = y0 + r() * h; if (q < 0.3) { g.beginPath(); g.ellipse(x, y, 2 + q * 14, (2 + q * 14) * 0.4, 0, 0, TAU); g.globalAlpha = 1 - q / 0.3; g.fill(); } }
  g.globalAlpha = 1;
}
/** Обряд: из тотемов к жрице тянутся рваные нити тины, над купелью — ядовитое сияние. q — сколько обряда прошло. */
export function riteBeams(g, m, totems, q, t) {
  const cx = m.x, cy = m.y - 40;
  glowE(g, cx, m.y - 10, 120 + 30 * Math.sin(t * 5), 60, '150,230,60', 0.25 + 0.25 * q);
  for (const o of totems) {
    const sx = o.x, sy = o.y - 70, n = 9; g.strokeStyle = `rgba(160,240,70,${0.55 + 0.3 * Math.sin(t * 9 + o.x)})`; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy);
    for (let i = 1; i <= n; i++) { const k = i / n, x = sx + (cx - sx) * k + (i < n ? Math.sin(t * 13 + i * 2.1 + o.x) * 10 : 0), y = sy + (cy - sy) * k - Math.sin(k * Math.PI) * 40; g.lineTo(x, y); }
    g.stroke(); g.strokeStyle = 'rgba(40,70,10,.6)'; g.lineWidth = 1; g.stroke();
  }
  // песок обряда: кольцо над жрицей, сжимается к концу
  g.strokeStyle = `rgba(220,255,140,.85)`; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy - 46, 16, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - q)); g.stroke();
}
/** Свечение тотема (над картинкой). */
export function totemGlow(g, x, y, t) { glowE(g, x, y - 70, 22 + 4 * Math.sin(t * 7 + x), 22, '170,250,80', 0.55); }
/** Король набирает воздуха: красная граница растёт по залу, за целыми колоннами — синие тени укрытия. */
export function kvakWind(g, m, cols, q, t) {
  const R = 160 + q * 700;
  g.save(); g.translate(m.x, m.y); g.scale(1, 0.5); g.strokeStyle = `rgba(255,90,60,${0.35 + 0.5 * q})`; g.lineWidth = 5; g.setLineDash([18, 12]); g.lineDashOffset = -t * 60; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke(); g.setLineDash([]); g.restore();
  for (const c of cols) {
    const a = Math.atan2(c.y - m.y, c.x - m.x), L = 240, w0 = 30, w1 = 62, px = -Math.sin(a), py = Math.cos(a);
    const x1 = c.x + Math.cos(a) * L, y1 = c.y + Math.sin(a) * L;
    g.fillStyle = `rgba(110,170,255,${0.18 + 0.2 * q + 0.08 * Math.sin(t * 8)})`; g.strokeStyle = `rgba(160,210,255,${0.5 + 0.4 * q})`; g.lineWidth = 2;
    g.beginPath(); g.moveTo(c.x + px * w0, c.y + py * w0 * 0.5); g.lineTo(x1 + px * w1, y1 + py * w1 * 0.5); g.lineTo(x1 - px * w1, y1 - py * w1 * 0.5); g.lineTo(c.x - px * w0, c.y - py * w0 * 0.5); g.closePath(); g.fill(); g.stroke();
  }
}
/** «КВАК!»: волна по полу от Короля. */
export function kvakWave(g, e, a) {
  const q = clamp(a / 1.0), R = 60 + easeOut(q) * e.r;
  g.save(); g.translate(e.x, e.y); g.scale(1, 0.5);
  g.strokeStyle = `rgba(255,220,160,${0.8 * (1 - q)})`; g.lineWidth = 16 * (1 - q) + 2; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
  g.strokeStyle = `rgba(255,120,80,${0.6 * (1 - q)})`; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R * 0.8, 0, TAU); g.stroke();
  g.restore();
}
/** Язык Короля: от пасти до героя (в плену). */
export function tongue(g, x0, y0, x1, y1, t) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - 12 + Math.sin(t * 10) * 3;
  g.lineCap = 'round'; g.strokeStyle = '#6a1a2a'; g.lineWidth = 13; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke();
  g.strokeStyle = '#e0607a'; g.lineWidth = 9; g.stroke(); g.strokeStyle = 'rgba(255,200,210,.7)'; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = '#e0607a'; g.strokeStyle = '#6a1a2a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x1, y1, 10, 7, 0, 0, TAU); g.fill(); g.stroke(); g.lineCap = 'butt';
}
/** Над пленником: полоска «вырваться» и подсказка. q — сколько осталось (1 → 0). */
export function heldBar(g, x, y, q, txt, t) {
  const w = 90, h = 10; g.fillStyle = 'rgba(20,14,8,.85)'; g.fillRect(x - w / 2 - 2, y - 2, w + 4, h + 4);
  g.fillStyle = '#e0607a'; g.fillRect(x - w / 2, y, w * clamp(q), h);
  g.strokeStyle = '#ffd34d'; g.lineWidth = 1.5; g.strokeRect(x - w / 2 - 2, y - 2, w + 4, h + 4);
  g.font = 'bold 13px Georgia, serif'; g.textAlign = 'center'; g.lineWidth = 3.5; g.strokeStyle = 'rgba(20,14,8,.92)'; const s = 1 + 0.06 * Math.sin(t * 12);
  g.save(); g.translate(x, y + h + 18); g.scale(s, s); g.strokeText(txt, 0, 0); g.fillStyle = '#ffe9a8'; g.fillText(txt, 0, 0); g.restore();
}
/** Трещины на колонне, которая выдержала один квак. */
export function colCrack(g, x, y, i) {
  const r = rng(i * 13 + 5); g.strokeStyle = 'rgba(30,24,18,.85)'; g.lineWidth = 2; g.lineJoin = 'miter';
  for (let k = 0; k < 2; k++) { let px = x - 6 + r() * 12, py = y - 120 + k * 50; g.beginPath(); g.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (r() - 0.5) * 14; py += 10 + r() * 10; g.lineTo(px, py); } g.stroke(); }
  g.fillStyle = 'rgba(120,110,95,.9)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - 20 + r() * 40, y + 2); g.lineTo(x - 16 + r() * 40, y - 3); g.lineTo(x - 12 + r() * 40, y + 3); g.fill(); }
}

/** v123: Песочные часы перевернулись — над героем золотые часы делают полуоборот, песок сыплется вниз, искры кругом. a — возраст (0…1,6 с). */
export function hourglassFx(g, x, y, a) {
  const k = Math.min(1, a / 0.5), rot = (1 - Math.pow(1 - k, 3)) * Math.PI, fade = a < 1.1 ? 1 : Math.max(0, 1 - (a - 1.1) / 0.5), cy = y - 88 - Math.min(1, a / 0.3) * 6;
  g.save(); g.globalAlpha = fade;
  glow(g, x, cy, 46 + 8 * Math.sin(a * 10), '255,210,110', 0.55);
  g.translate(x, cy); g.rotate(rot);
  const W = 15, H = 22, gold = '#e0b040', ink = '#5a3a10';
  // колба
  g.beginPath(); g.moveTo(-W + 2, -H + 4); g.quadraticCurveTo(-W + 2, -3, -2, 0); g.quadraticCurveTo(-W + 2, 3, -W + 2, H - 4); g.lineTo(W - 2, H - 4); g.quadraticCurveTo(W - 2, 3, 2, 0); g.quadraticCurveTo(W - 2, -3, W - 2, -H + 4); g.closePath();
  g.fillStyle = 'rgba(220,240,255,.45)'; g.fill(); g.strokeStyle = '#3a5a7a'; g.lineWidth = 1.6; g.stroke();
  // песок: сверху убывает, снизу растёт (после переворота сыплется)
  const q = Math.max(0, Math.min(1, (a - 0.45) / 1)), top = 1 - q, sand = '#f2c86a';
  g.save(); g.clip();
  g.fillStyle = sand; g.beginPath(); g.ellipse(0, -H + 4 + (H - 6) * (1 - top * 0.8), W - 4, (H - 8) * top * 0.6 + 0.5, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-W + 3, H - 4); g.quadraticCurveTo(0, H - 4 - (H - 6) * (0.2 + q * 0.7), W - 3, H - 4); g.closePath(); g.fill();
  if (a > 0.45 && q < 1) { g.strokeStyle = sand; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -1); g.lineTo(0, H - 6); g.stroke(); }
  g.restore();
  // рамка: донца и стойки
  for (const s of [-1, 1]) { g.beginPath(); g.roundRect(-W - 2, s * H - 3, (W + 2) * 2, 6, 3); g.fillStyle = gold; g.fill(); g.strokeStyle = ink; g.lineWidth = 1.4; g.stroke(); g.beginPath(); g.moveTo(s * (W - 1), -H + 2); g.lineTo(s * (W - 1), H - 2); g.lineWidth = 3.4; g.strokeStyle = ink; g.stroke(); g.lineWidth = 2; g.strokeStyle = gold; g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(-W + 6, -H + 9, 1.6, 5, 0.3, 0, Math.PI * 2); g.fill();
  g.restore();
  // искры по кругу у ног и песчинки, летящие к герою
  const r = rng(91);
  for (let i = 0; i < 14; i++) { const an = r() * 6.283 + a * 2, rr = 30 + r() * 26, life = (a * 1.4 + r()) % 1; g.fillStyle = `rgba(255,220,120,${(1 - life) * fade})`; g.beginPath(); g.arc(x + Math.cos(an) * rr * (1 - life * 0.4), y - 20 - life * 70 + Math.sin(an) * 8, 2.2, 0, 6.283); g.fill(); }
  g.strokeStyle = `rgba(255,215,110,${0.7 * fade * Math.max(0, 1 - a)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y + 2, 26 + a * 50, (26 + a * 50) * 0.42, 0, 0, 6.283); g.stroke();
}
