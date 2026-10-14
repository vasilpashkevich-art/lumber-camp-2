// Эскиз v97, проба 3: редкие и героические вещи — тяжёлые глянцевые латы: огромные круглые наплечники в два слоя,
// грудь с ребром и бликом, золотая кайма, юбка из пластин-лепестков, крупные наколенники, перчатки, сапоги-латы, большие шлемы.
// Вид спереди, ступни на 0, рост 40. Свой рисунок (не копия чужих персонажей): шлемы — с бараньими рогами, крыльями, загнутыми рогами, гребнем.
import { P, paint, capsule, blob, shine, rivet, ink, sh, face, weapon, quiver, HEAVY } from './toon.js';
const TAU = Math.PI * 2, LW = 0.8;

/** Глянцевая пластина: заливка сверху светлее, тёмный низ, обводка, блик-полоска. */
function plate(g, path, col, y0, y1, glossX, glossY, gw = 1, gh = 2.2) {
  path(); const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(col, 0.32)); gr.addColorStop(0.5, col); gr.addColorStop(1, sh(col, -0.32)); g.fillStyle = gr; g.fill();
  g.strokeStyle = ink(col); g.lineWidth = LW; g.lineJoin = 'round'; g.stroke();
  if (glossX != null) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(glossX, glossY, gw, gh, -0.35, 0, TAU); g.fill(); }
}
const trimLine = (g, col, w = 0.9) => { g.strokeStyle = ink(col); g.lineWidth = w + 0.6; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };

export function heavyHero(g, cls, B, gear, t, blink) {
  const A = gear.chest, c = A.c, c2 = A.c2 || sh(c, -0.45), tr = A.trim || '#e8b440', head = gear.head || {}, robe = A.robe, leather = A.leather;
  g.translate(0, Math.sin(t * 2.2) * 0.2);
  // плащ
  if (gear.cape) { g.beginPath(); g.moveTo(-P.sw - 1.5, P.top + 1); g.quadraticCurveTo(-P.sw - 5, -12, -P.sw - 3.5, -1.2); g.quadraticCurveTo(0, 0.6, P.sw + 3.5, -1.2); g.quadraticCurveTo(P.sw + 5, -12, P.sw + 1.5, P.top + 1); g.closePath(); paint(g, gear.cape, LW, P.top, 0); }
  if (cls === 'archer') quiver(g, gear.quiver || '#6a4022');
  // ---- ноги
  for (const sx of [-1, 1]) {
    const lx = sx * 2.9;
    if (!robe) {
      capsule(g, lx, P.hip + 1, lx, -9, 4.4, c2);                                                  // поддоспешник
      plate(g, () => { g.beginPath(); g.moveTo(lx - 2.3, -9.5); g.quadraticCurveTo(lx - 2.8, -4.5, lx - 2.6, -3); g.lineTo(lx + 2.6, -3); g.quadraticCurveTo(lx + 2.8, -4.5, lx + 2.3, -9.5); g.closePath(); }, c, -10, -3, lx - 1, -7, 0.5, 1.4);   // поножи
      plate(g, () => { g.beginPath(); g.ellipse(lx, -10.4, 2.9, 2.4, 0, 0, TAU); }, c, -12.8, -8, lx - 0.9, -11.3, 0.8, 0.6);   // наколенник
      g.beginPath(); g.arc(lx, -10.4, 1.1, 0, TAU); g.fillStyle = tr; g.fill();
    }
    plate(g, () => { g.beginPath(); g.moveTo(lx - 3, -3.4); g.quadraticCurveTo(lx - 3.6, 0.6, lx + sx * 0.6, 0.6); g.quadraticCurveTo(lx + 3.8 * 1, 0.6, lx + 3, -3.4); g.closePath(); }, robe ? sh(c2, 0.1) : c, -3.6, 0.6, lx - 1.2, -2.2, 0.9, 0.5);   // сапог-лата
  }
  // ---- юбка: мантия до пят или пластины-лепестки
  if (robe) { g.beginPath(); g.moveTo(-P.sw, P.hip - 2); g.quadraticCurveTo(-P.sw - 2, -8, -P.sw - 3, -2.4); g.quadraticCurveTo(0, -0.6, P.sw + 3, -2.4); g.quadraticCurveTo(P.sw + 2, -8, P.sw, P.hip - 2); g.closePath(); paint(g, robe, LW, P.hip, 0); g.strokeStyle = tr; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-P.sw - 2.6, -2.8); g.quadraticCurveTo(0, -1, P.sw + 2.6, -2.8); g.stroke(); g.beginPath(); g.moveTo(0, P.hip); g.lineTo(0, -1.6); g.stroke(); }
  const petal = (x, w, h, col) => plate(g, () => { g.beginPath(); g.moveTo(x - w / 2, P.hip - 0.6); g.lineTo(x + w / 2, P.hip - 0.6); g.quadraticCurveTo(x + w / 2 + 0.4, P.hip + h * 0.7, x, P.hip + h); g.quadraticCurveTo(x - w / 2 - 0.4, P.hip + h * 0.7, x - w / 2, P.hip - 0.6); g.closePath(); }, col, P.hip, P.hip + h, x - w * 0.18, P.hip + h * 0.35, 0.5, h * 0.22);
  for (const [x, w, h] of [[-4.8, 4.2, 5.6], [4.8, 4.2, 5.6], [-1.9, 4.2, 6.6], [1.9, 4.2, 6.6]]) petal(x, w, h, leather ? sh(c, -0.08) : c);
  // ---- туловище: поддоспешник, кираса с двумя выпуклостями и ребром, ворот
  g.beginPath(); g.roundRect(-P.sw, P.top - 0.5, P.sw * 2, P.hip - P.top + 1, 3); paint(g, c2, LW, P.top, P.hip);
  plate(g, () => { g.beginPath(); g.moveTo(-P.sw - 0.6, P.top + 1.2); g.quadraticCurveTo(-P.sw - 1.2, P.top + 8, -2.4, P.hip - 1.6); g.quadraticCurveTo(0, P.hip - 0.6, 2.4, P.hip - 1.6); g.quadraticCurveTo(P.sw + 1.2, P.top + 8, P.sw + 0.6, P.top + 1.2); g.quadraticCurveTo(0, P.top - 0.4, -P.sw - 0.6, P.top + 1.2); g.closePath(); }, c, P.top, P.hip, -2.8, P.top + 3.6, 1.1, 2.4);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, P.top + 1.4); g.quadraticCurveTo(0.3, P.top + 6, 0, P.hip - 1.4); g.stroke();
  g.strokeStyle = ink(c); g.lineWidth = 0.45; g.beginPath(); g.moveTo(0.4, P.top + 1.4); g.quadraticCurveTo(0.7, P.top + 6, 0.4, P.hip - 1.4); g.stroke();
  // золотой клин на груди (знак)
  g.beginPath(); g.moveTo(-3.6, P.top + 1.6); g.quadraticCurveTo(0, P.top + 0.8, 3.6, P.top + 1.6); g.quadraticCurveTo(1.4, P.top + 2.4, 0, P.top + 4.6); g.quadraticCurveTo(-1.4, P.top + 2.4, -3.6, P.top + 1.6); g.closePath(); paint(g, tr, 0.6, P.top, P.top + 4.6);
  if (A.emblem) { g.beginPath(); g.arc(0, P.top + 7.2, 1.3, 0, TAU); paint(g, A.emblem, 0.5); shine(g, -0.4, P.top + 6.8, 0.4, 0.3, 0.7); }
  // пояс
  g.beginPath(); g.roundRect(-P.sw + 0.2, P.hip - 2.4, P.sw * 2 - 0.4, 2.2, 1.1); paint(g, tr, 0.6, P.hip - 2.4, P.hip); g.beginPath(); g.roundRect(-1.4, P.hip - 2.7, 2.8, 2.8, 0.7); paint(g, sh(tr, -0.2), 0.5);
  // ворот
  g.beginPath(); g.ellipse(0, P.top + 0.2, 3.6, 1.6, 0, 0, TAU); paint(g, sh(c2, 0.15));
  // ---- руки: плечо, локоть, наруч, кулак
  const fist = sh(c2, 0.05);
  for (const sx of [-1, 1]) {
    const sx0 = sx * (P.sw + 0.8), ex = sx * (P.sw + 2.2), ey = P.top + 7.4, hx = sx * (P.sw + 2), hy = P.hip + 0.6;
    capsule(g, sx0, P.top + 2, ex, ey, 3.6, c2);
    plate(g, () => { g.beginPath(); g.moveTo(ex - 1.9, ey + 0.6); g.lineTo(hx - 2.3, hy - 2.6); g.quadraticCurveTo(hx, hy - 1.6, hx + 2.3, hy - 2.6); g.lineTo(ex + 1.9, ey + 0.6); g.closePath(); }, c, ey, hy, hx - 0.8 * sx, ey + 2.6, 0.45, 1.3);   // наруч
    plate(g, () => { g.beginPath(); g.ellipse(ex, ey, 2.1, 1.9, 0, 0, TAU); }, c, ey - 2, ey + 2, ex - 0.6, ey - 0.6, 0.6, 0.5);   // локоть
    g.beginPath(); g.ellipse(hx, hy - 2.4, 2.4, 0.8, 0, 0, TAU); paint(g, tr, 0.5);
  }
  // ---- наплечники: огромные, в два слоя, с золотой каймой
  for (const sx of [-1, 1]) {
    const x = sx * (P.sw + 1.2), y = P.top + 1.6, R = A.big || 4.9;
    if (A.one && sx > 0) continue;   // Лучник — один наплечник
    plate(g, () => { g.beginPath(); g.moveTo(x - R, y + 1.4); g.quadraticCurveTo(x - R - 0.4, y + 4.2, x, y + 4.4); g.quadraticCurveTo(x + R + 0.4, y + 4.2, x + R, y + 1.4); g.closePath(); }, c, y, y + 4.4, null);   // нижний слой
    g.beginPath(); g.moveTo(x - R + 0.2, y + 3.4); g.quadraticCurveTo(x, y + 5.2, x + R - 0.2, y + 3.4); trimLine(g, tr, 0.8);
    plate(g, () => { g.beginPath(); g.moveTo(x - R - 0.3, y + 1.6); g.bezierCurveTo(x - R - 0.6, y - R * 0.9, x + R + 0.6, y - R * 0.9, x + R + 0.3, y + 1.6); g.quadraticCurveTo(x, y + 3.4, x - R - 0.3, y + 1.6); g.closePath(); }, c, y - R, y + 2.4, x - sx * 0.2 - 1.4, y - 2, 1.5, 0.9);
    g.beginPath(); g.moveTo(x - R, y + 1.7); g.quadraticCurveTo(x, y + 3.4, x + R, y + 1.7); trimLine(g, tr, 1.0);
    for (const k of [-0.5, 0.5]) rivet(g, x + k * R, y + 1.9, 0.5);
    if (A.spikes) for (const k of [-0.35, 0.35]) { g.beginPath(); g.moveTo(x + k * R * 1.6 - 0.8, y - R * 0.55); g.lineTo(x + k * R * 1.6 + sx * 0.9, y - R * 0.55 - 3.4); g.lineTo(x + k * R * 1.6 + 0.8, y - R * 0.55); g.closePath(); paint(g, A.spikes, 0.5); }
  }
  // ---- голова
  if (head.m === 'helm_ram' || head.m === 'helm_horns' || head.m === 'helm_crest') closedHelm(g, head, t);
  else { face(g, B, head, blink); openHelm(g, head, B, t); }
  // ---- оружие и щит
  const hy = P.hip + 0.6;
  if (gear.shield) shield(g, gear.shield, P.sw + 3.2, hy - 6);
  else if (cls === 'archer' || cls === 'mage') { /* оружие рисует weapon() */ }
  weapon(g, gear.weapon || {}, -(P.sw + 2), hy, t, cls, fist);
  if (gear.shield) blob(g, P.sw + 2, hy, 2.1, 2, fist);
  else if (cls !== 'archer') blob(g, P.sw + 2, hy, 2.1, 2, fist);
}

/** Закрытые шлемы: с бараньими рогами (синий), с загнутыми рогами и огнём в прорези (тёмный), с гребнем и забралом. */
function closedHelm(g, h, t) {
  const R = P.head + 0.9, hy = P.hy, c = h.c, tr = h.trim || '#e8b440';
  if (h.m === 'helm_horns') for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * R * 0.7, hy - R * 0.55); g.bezierCurveTo(sx * R * 1.8, hy - R * 0.9, sx * R * 1.5, hy - R * 2.1, sx * R * 0.65, hy - R * 2.5); g.quadraticCurveTo(sx * R * 1.1, hy - R * 1.6, sx * R * 0.85, hy - R * 0.1); g.closePath(); plate(g, () => {}, h.horn || '#b02a24', hy - R * 2.5, hy, null); g.strokeStyle = ink(h.horn || '#b02a24'); g.lineWidth = LW; g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(sx * R * 1.15, hy - R * 1.3, 0.35, 1.4, sx * 0.4, 0, TAU); g.fill(); }
  if (h.m === 'helm_crest') { g.beginPath(); g.moveTo(-R * 0.25, hy - R * 0.95); g.bezierCurveTo(-R * 0.3, hy - R * 2.1, R * 1.4, hy - R * 2.4, R * 1.8, hy - R * 1.0); g.quadraticCurveTo(R * 0.9, hy - R * 1.5, R * 0.3, hy - R * 0.9); g.closePath(); paint(g, h.crest || '#c83a2a', LW, hy - R * 2.2, hy - R); }
  // купол
  plate(g, () => { g.beginPath(); g.moveTo(-R, hy + R * 0.85); g.lineTo(-R, hy - R * 0.1); g.bezierCurveTo(-R, hy - R * 1.25, R, hy - R * 1.25, R, hy - R * 0.1); g.lineTo(R, hy + R * 0.85); g.quadraticCurveTo(0, hy + R * 1.15, -R, hy + R * 0.85); g.closePath(); }, c, hy - R, hy + R, -R * 0.45, hy - R * 0.55, R * 0.18, R * 0.32);
  // лицевая пластина с прорезью
  plate(g, () => { g.beginPath(); g.moveTo(-R * 0.72, hy - R * 0.32); g.quadraticCurveTo(0, hy - R * 0.5, R * 0.72, hy - R * 0.32); g.lineTo(R * 0.6, hy + R * 0.85); g.quadraticCurveTo(0, hy + R * 1.05, -R * 0.6, hy + R * 0.85); g.closePath(); }, sh(c, 0.08), hy - R * 0.5, hy + R, null);
  g.fillStyle = '#0e0c12'; g.beginPath(); g.roundRect(-R * 0.6, hy - R * 0.12, R * 1.2, R * 0.22, R * 0.1); g.fill();
  if (h.eyes) { const p = 0.7 + 0.3 * Math.sin(t * 5); g.fillStyle = h.eyes; g.globalAlpha = p; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * R * 0.26, hy - R * 0.01, R * 0.13, R * 0.06, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; }
  if (h.m === 'helm_ram' || h.m === 'helm_crest') { g.fillStyle = '#0e0c12'; for (const xx of [-0.3, -0.1, 0.1, 0.3]) { g.beginPath(); g.roundRect(R * xx - R * 0.04, hy + R * 0.28, R * 0.08, R * 0.34, 0.2); g.fill(); } }
  // кайма вокруг лица и по куполу
  g.beginPath(); g.moveTo(-R * 0.72, hy - R * 0.32); g.quadraticCurveTo(0, hy - R * 0.5, R * 0.72, hy - R * 0.32); trimLine(g, tr, 0.9);
  g.beginPath(); g.moveTo(0, hy - R * 1.06); g.lineTo(0, hy - R * 0.45); trimLine(g, tr, 0.8);
  // бараньи рога — завиток у висков
  if (h.m === 'helm_ram') for (const sx of [-1, 1]) {
    const cx = sx * R * 1.05, cy = hy - R * 0.2, col = h.horn || '#efe2c4';
    g.lineCap = 'round'; g.strokeStyle = ink(col); g.lineWidth = 3.4; g.beginPath(); for (let i = 0; i <= 26; i++) { const a = -Math.PI * 0.6 + i / 26 * Math.PI * 1.7, r = R * (0.95 - i / 26 * 0.55); const px = cx + sx * Math.cos(a) * r * 0.9, py = cy + Math.sin(a) * r * 0.8 - R * 0.1; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    g.strokeStyle = col; g.lineWidth = 2.2; g.stroke(); g.strokeStyle = 'rgba(120,90,50,.45)'; g.lineWidth = 0.4; g.setLineDash([0.6, 0.9]); g.stroke(); g.setLineDash([]);
  }
}

/** Открытые: шлем с крыльями (лицо видно), высокий ворот мага с венцом, капюшон с маской лучника. */
function openHelm(g, h, B, t) {
  const R = P.head, hy = P.hy, c = h.c || '#a83a2a', tr = h.trim || '#e8b440';
  if (h.m === 'helm_wings') {
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const a = -0.4 - i * 0.28; g.save(); g.translate(sx * R * 0.9, hy - R * 0.55); g.scale(sx, 1); g.rotate(a); g.beginPath(); g.ellipse(R * 0.9, 0, R * 0.95 - i * 0.12 * R, R * 0.22, 0, 0, TAU); paint(g, '#f2eee4', 0.6); g.restore(); }
    plate(g, () => { g.beginPath(); g.moveTo(-R * 1.02, hy + R * 0.55); g.lineTo(-R * 1.02, hy - R * 0.35); g.bezierCurveTo(-R * 1.02, hy - R * 1.4, -R * 0.3, hy - R * 1.9, 0, hy - R * 2.1); g.bezierCurveTo(R * 0.3, hy - R * 1.9, R * 1.02, hy - R * 1.4, R * 1.02, hy - R * 0.35); g.lineTo(R * 1.02, hy + R * 0.55); g.lineTo(R * 0.76, hy + R * 0.55); g.quadraticCurveTo(R * 0.8, hy - R * 0.3, R * 0.5, hy - R * 0.38); g.quadraticCurveTo(0, hy - R * 0.62, -R * 0.5, hy - R * 0.38); g.quadraticCurveTo(-R * 0.8, hy - R * 0.3, -R * 0.76, hy + R * 0.55); g.closePath(); }, c, hy - R * 2, hy + R * 0.5, -R * 0.45, hy - R * 1.2, R * 0.16, R * 0.34);
    g.beginPath(); g.moveTo(-R * 0.62, hy - R * 0.4); g.quadraticCurveTo(0, hy - R * 0.68, R * 0.62, hy - R * 0.4); trimLine(g, tr, 0.9);
    g.beginPath(); g.moveTo(0, hy - R * 2.05); g.quadraticCurveTo(R * 0.15, hy - R * 1.2, 0, hy - R * 0.6); trimLine(g, tr, 0.8);
    return;
  }
  if (h.m === 'magecollar') {   // высокий ворот-веер за головой и венец
    g.save(); g.globalCompositeOperation = 'destination-over';
    g.beginPath(); g.moveTo(-R * 1.3, hy + R * 1.4); g.quadraticCurveTo(-R * 1.9, hy - R * 0.6, -R * 0.9, hy - R * 1.6); g.lineTo(R * 0.9, hy - R * 1.6); g.quadraticCurveTo(R * 1.9, hy - R * 0.6, R * 1.3, hy + R * 1.4); g.closePath(); paint(g, c, LW, hy - R * 1.6, hy + R); g.restore();
    hatCirclet(g, R, hy, tr, h.gem || '#58e0ff', t); return;
  }
  if (h.m === 'maskhood') {
    g.beginPath(); g.moveTo(-R * 1.15, hy + R * 0.95); g.bezierCurveTo(-R * 1.35, hy - R * 1.1, -R * 0.4, hy - R * 1.6, R * 0.1, hy - R * 1.5); g.bezierCurveTo(R * 1.2, hy - R * 1.3, R * 1.3, hy - R * 0.2, R * 1.15, hy + R * 0.95); g.quadraticCurveTo(R * 0.9, hy + R * 0.2, R * 0.78, hy - R * 0.2); g.quadraticCurveTo(0, hy - R * 0.95, -R * 0.78, hy - R * 0.2); g.quadraticCurveTo(-R * 0.9, hy + R * 0.2, -R * 1.15, hy + R * 0.95); g.closePath(); paint(g, c, LW, hy - R * 1.5, hy + R);
    plate(g, () => { g.beginPath(); g.moveTo(-R * 0.8, hy + R * 0.18); g.quadraticCurveTo(0, hy + R * 0.05, R * 0.8, hy + R * 0.18); g.lineTo(R * 0.7, hy + R * 0.85); g.quadraticCurveTo(0, hy + R * 1.2, -R * 0.7, hy + R * 0.85); g.closePath(); }, h.mask || '#2a2a30', hy, hy + R * 1.2, -R * 0.3, hy + R * 0.4, R * 0.18, R * 0.08);
    g.beginPath(); g.moveTo(-R * 0.8, hy + R * 0.18); g.quadraticCurveTo(0, hy + R * 0.05, R * 0.8, hy + R * 0.18); trimLine(g, tr, 0.6);
    return;
  }
}
function hatCirclet(g, R, hy, tr, gem, t) {
  g.beginPath(); g.moveTo(-R * 0.95, hy - R * 0.5); g.quadraticCurveTo(0, hy - R * 0.9, R * 0.95, hy - R * 0.5); g.lineTo(R * 0.95, hy - R * 0.28); g.quadraticCurveTo(0, hy - R * 0.68, -R * 0.95, hy - R * 0.28); g.closePath(); paint(g, tr, 0.55);
  for (const k of [-0.55, 0, 0.55]) { g.beginPath(); g.moveTo(R * k - R * 0.12, hy - R * (0.66 + (k ? 0 : 0.08))); g.lineTo(R * k, hy - R * (1.05 + (k ? 0 : 0.3))); g.lineTo(R * k + R * 0.12, hy - R * (0.66 + (k ? 0 : 0.08))); g.closePath(); paint(g, tr, 0.5); }
  const p = 0.75 + 0.25 * Math.sin(t * 4); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(120,230,255,${0.35 * p})`; g.beginPath(); g.arc(0, hy - R * 0.72, R * 0.4, 0, TAU); g.fill(); g.restore();
  g.beginPath(); g.ellipse(0, hy - R * 0.72, R * 0.16, R * 0.2, 0, 0, TAU); paint(g, gem, 0.5); shine(g, -R * 0.05, hy - R * 0.78, R * 0.05, R * 0.07, 0.9);
}

/** Большой овальный щит с золотым ободом и гербом. */
function shield(g, s, x, y) {
  const w = 7.2, h = 12;
  plate(g, () => { g.beginPath(); g.ellipse(x, y, w, h, 0.12, 0, TAU); }, s.rim || '#e8b440', y - h, y + h, null);
  plate(g, () => { g.beginPath(); g.ellipse(x, y, w - 1.4, h - 1.6, 0.12, 0, TAU); }, s.c, y - h, y + h, x - 2.4, y - 5, 1.1, 3.2);
  if (s.sign === 'sun') { g.beginPath(); g.arc(x + 0.3, y, 2.4, 0, TAU); paint(g, s.rim || '#e8b440', 0.6); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(x + 0.3 + Math.cos(a) * 3, y + Math.sin(a) * 3); g.lineTo(x + 0.3 + Math.cos(a) * 4.6, y + Math.sin(a) * 4.6); trimLine(g, s.rim || '#e8b440', 0.7); } }
  if (s.sign === 'wolf') { g.beginPath(); g.moveTo(x - 2.6, y - 3); g.lineTo(x - 1.4, y - 1); g.lineTo(x + 1.6, y - 1.2); g.lineTo(x + 2.8, y - 3.2); g.lineTo(x + 2.4, y + 0.6); g.quadraticCurveTo(x + 0.2, y + 4.4, x, y + 4.4); g.quadraticCurveTo(x - 0.2, y + 4.4, x - 2.4, y + 0.6); g.closePath(); paint(g, s.rim || '#e8b440', 0.6); }
}
HEAVY.draw = heavyHero;
