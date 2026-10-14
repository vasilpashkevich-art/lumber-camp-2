// Эскиз v97: герой в мультяшном стиле, как новый сундук — круглые формы, мягкие объёмы, обводка в цвет детали.
// Вид спереди, стоит. Ступни на y = 0, рост 40 единиц. prop: 'A' — пропорции как сейчас (≈4,3 головы), 'B' — мультяшнее (≈3,2 головы).
const TAU = Math.PI * 2;
export const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const ink = col => sh(col, -0.6);                    // обводка — тёмный тон своего цвета
const LW = 0.75;
function paint(g, fill, lw = LW, y0, y1) {
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(fill, 0.16)); gr.addColorStop(1, sh(fill, -0.14)); g.fillStyle = gr; } else g.fillStyle = fill;
  g.fill(); g.strokeStyle = ink(fill); g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
}
function capsule(g, x1, y1, x2, y2, w, col) {
  g.lineCap = 'round'; g.strokeStyle = ink(col); g.lineWidth = w + LW * 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = w * 0.3; g.beginPath(); g.moveTo(x1 - w * 0.22, y1 + 0.4); g.lineTo(x2 - w * 0.22, y2 - 0.4); g.stroke();
}
const blob = (g, x, y, rx, ry, col) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); paint(g, col, LW, y - ry, y + ry); };
const shine = (g, x, y, rx, ry, a = 0.35) => { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, -0.4, 0, TAU); g.fill(); };

export const PROPS = {
  A: { head: 4.7, hy: -35.3, sh: -29.6, hip: -18.6, sw: 5.6, hw: 4.4, leg: 3.7, arm: 3.1, hand: 1.9 },
  B: { head: 6.4, hy: -33.6, sh: -26.6, hip: -16.4, sw: 6.2, hw: 5.0, leg: 4.4, arm: 3.5, hand: 2.2 },
};
export const CLS = {
  warrior: { skin: '#f0bf92', hair: '#b8562a', beard: true, shirt: '#e6d6b2', sleeve: '#e6d6b2', belt: '#7a4a24', pants: '#7a5636', boots: '#5a3a24', weapon: 'axe' },
  mage: { skin: '#f0bf92', hair: '#d8d2c6', long: true, robe: '#3c5cb0', trim: '#f2c447', sleeve: '#3c5cb0', boots: '#3a3048', weapon: 'staff' },
  archer: { skin: '#f0bf92', hair: '#6a4024', tail: true, shirt: '#4f8a3e', sleeve: '#6a4a2c', belt: '#5a3a1c', pants: '#6a5236', boots: '#4a3020', hood: '#3f6e32', weapon: 'bow', quiver: true },
};

/** Мультяшный герой: класс, пропорции, время (дыхание и моргание). */
export function toonHero(g, cls, prop = 'A', t = 0) {
  const C = CLS[cls], P = PROPS[prop], br = Math.sin(t * 2.2) * 0.25, blink = (t % 3.6) < 0.12;
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  // тень
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0.6, 10, 2.6, 0, 0, TAU); g.fill();
  g.translate(0, br);
  // волосы сзади (длинные у Мага, хвост у Лучника), колчан
  if (C.long) { g.beginPath(); g.moveTo(-P.head * 0.95, P.hy - 1); g.quadraticCurveTo(-P.head * 1.25, P.sh + 6, -P.head * 0.6, P.sh + 7); g.lineTo(P.head * 0.6, P.sh + 7); g.quadraticCurveTo(P.head * 1.25, P.sh + 6, P.head * 0.95, P.hy - 1); g.closePath(); paint(g, C.hair, LW, P.hy, P.sh + 7); }
  if (C.quiver) { g.save(); g.translate(P.sw - 1, P.sh + 1); g.rotate(0.35); g.beginPath(); g.roundRect(-2, -9, 4.2, 12, 1.6); paint(g, '#7a4a24', LW, -9, 3); for (let i = 0; i < 3; i++) { g.strokeStyle = '#e8e0cc'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-1 + i * 1.3, -9); g.lineTo(-1.6 + i * 1.3, -12); g.stroke(); g.fillStyle = '#c84a3a'; g.beginPath(); g.moveTo(-1.6 + i * 1.3, -12); g.lineTo(-0.6 + i * 1.3, -13.5); g.lineTo(-2.4 + i * 1.3, -13.2); g.closePath(); g.fill(); } g.restore(); }
  // ноги и сапоги
  const robe = !!C.robe;
  for (const sx of [-1, 1]) {
    const hx = sx * (P.hw - P.leg * 0.55);
    if (!robe) capsule(g, hx, P.hip + 1, sx * (P.hw - P.leg * 0.45), -2.6, P.leg, C.pants);
    g.beginPath(); g.ellipse(sx * (P.hw - P.leg * 0.4) + sx * 0.6, -1.3, P.leg * 0.72, 1.7, 0, 0, TAU); paint(g, C.boots, LW, -3, 0.4);
    if (!robe) { g.beginPath(); g.roundRect(sx * (P.hw - P.leg * 0.45) - P.leg * 0.62, -5, P.leg * 1.24, 3.6, 1.2); paint(g, C.boots, LW, -5, -1.4); }
  }
  // туловище
  const top = P.sh, hip = P.hip;
  if (robe) {   // мантия до пят — широкий колокол с каймой
    g.beginPath(); g.moveTo(-P.sw + 0.6, top + 0.8); g.quadraticCurveTo(-P.sw - 0.5, top + 8, -P.sw - 2.6, -2.2); g.quadraticCurveTo(0, -0.6, P.sw + 2.6, -2.2); g.quadraticCurveTo(P.sw + 0.5, top + 8, P.sw - 0.6, top + 0.8); g.quadraticCurveTo(0, top - 1.5, -P.sw + 0.6, top + 0.8); g.closePath(); paint(g, C.robe, LW, top, 0);
    g.strokeStyle = C.trim; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-P.sw - 2.2, -2.6); g.quadraticCurveTo(0, -1.0, P.sw + 2.2, -2.6); g.stroke();
    g.beginPath(); g.moveTo(0, top + 1); g.lineTo(0, -1.4); g.stroke();
    g.fillStyle = sh(C.robe, -0.25); g.beginPath(); g.roundRect(-P.sw + 0.6, hip - 1.4, P.sw * 2 - 1.2, 2.2, 1); g.fill(); g.fillStyle = C.trim; g.beginPath(); g.arc(0, hip - 0.3, 1.2, 0, TAU); g.fill();
  } else {
    g.beginPath(); g.moveTo(-P.sw + 0.4, top + 0.6); g.quadraticCurveTo(-P.sw - 0.4, (top + hip) / 2, -P.hw - 0.4, hip + 1.6); g.quadraticCurveTo(0, hip + 2.6, P.hw + 0.4, hip + 1.6); g.quadraticCurveTo(P.sw + 0.4, (top + hip) / 2, P.sw - 0.4, top + 0.6); g.quadraticCurveTo(0, top - 1.6, -P.sw + 0.4, top + 0.6); g.closePath(); paint(g, C.shirt, LW, top, hip);
    // ворот и складки
    g.strokeStyle = ink(C.shirt); g.lineWidth = 0.55; g.beginPath(); g.moveTo(-1.6, top + 0.2); g.lineTo(0, top + 2.6); g.lineTo(1.6, top + 0.2); g.stroke();
    shine(g, -P.sw * 0.45, top + 3, 1.6, 3, 0.22);
    // пояс с пряжкой
    g.beginPath(); g.roundRect(-P.hw - 0.4, hip - 1.2, (P.hw + 0.4) * 2, 2.6, 1.2); paint(g, C.belt);
    g.beginPath(); g.roundRect(-1.3, hip - 1.4, 2.6, 3, 0.7); paint(g, '#f2c447');
    if (C.hood) { g.beginPath(); g.moveTo(-P.sw + 0.4, top + 1); g.quadraticCurveTo(0, top + 4.4, P.sw - 0.4, top + 1); g.quadraticCurveTo(0, top - 2.4, -P.sw + 0.4, top + 1); g.closePath(); paint(g, C.hood); }
    if (C.quiver) { g.strokeStyle = ink('#7a4a24'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-P.sw + 1, top + 0.8); g.lineTo(P.hw, hip - 1.4); g.stroke(); g.strokeStyle = '#7a4a24'; g.lineWidth = 0.9; g.stroke(); }
  }
  // руки
  const ax = P.sw - 0.2, hy = hip + 0.6;
  for (const sx of [-1, 1]) {
    const hx = sx * (P.sw + 1.2);
    capsule(g, sx * ax, top + 1.6, hx, hy - 1.4, P.arm, C.sleeve);
    if (robe) { g.beginPath(); g.ellipse(hx, hy - 1.8, P.arm * 0.85, 1.4, 0, 0, TAU); paint(g, C.trim); }
    blob(g, hx, hy, P.hand, P.hand * 0.95, C.skin);
  }
  // голова
  const hx0 = 0, hy0 = P.hy, R = P.head;
  capsule(g, 0, hy0 + R * 0.7, 0, top + 0.5, R * 0.62, C.skin);   // шея
  // уши
  for (const sx of [-1, 1]) blob(g, sx * R * 0.95, hy0 + R * 0.12, R * 0.22, R * 0.3, C.skin);
  g.beginPath(); g.ellipse(hx0, hy0, R * 0.92, R, 0, 0, TAU); paint(g, C.skin, LW, hy0 - R, hy0 + R);
  // румянец и блик
  g.fillStyle = 'rgba(232,120,100,.32)'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * R * 0.48, hy0 + R * 0.32, R * 0.2, R * 0.12, 0, 0, TAU); g.fill(); }
  shine(g, -R * 0.38, hy0 - R * 0.45, R * 0.22, R * 0.14, 0.4);
  // борода (Воин)
  if (C.beard) { g.beginPath(); g.moveTo(-R * 0.86, hy0 + R * 0.05); g.quadraticCurveTo(-R * 0.9, hy0 + R * 1.25, 0, hy0 + R * 1.38); g.quadraticCurveTo(R * 0.9, hy0 + R * 1.25, R * 0.86, hy0 + R * 0.05); g.quadraticCurveTo(R * 0.55, hy0 + R * 0.5, R * 0.3, hy0 + R * 0.45); g.quadraticCurveTo(0, hy0 + R * 0.62, -R * 0.3, hy0 + R * 0.45); g.quadraticCurveTo(-R * 0.55, hy0 + R * 0.5, -R * 0.86, hy0 + R * 0.05); g.closePath(); paint(g, C.hair, LW, hy0, hy0 + R * 1.4);
    // усы и рот
    g.beginPath(); g.moveTo(-R * 0.42, hy0 + R * 0.5); g.quadraticCurveTo(0, hy0 + R * 0.28, R * 0.42, hy0 + R * 0.5); g.quadraticCurveTo(0, hy0 + R * 0.46, -R * 0.42, hy0 + R * 0.5); g.closePath(); paint(g, sh(C.hair, -0.08), 0.5);
    g.fillStyle = '#8a3a2a'; g.beginPath(); g.ellipse(0, hy0 + R * 0.62, R * 0.14, R * 0.08, 0, 0, TAU); g.fill();
  } else { g.strokeStyle = '#8a3a2a'; g.lineWidth = 0.55; g.beginPath(); g.arc(0, hy0 + R * 0.38, R * 0.22, 0.25, Math.PI - 0.25); g.stroke(); }
  // нос
  g.strokeStyle = sh(C.skin, -0.35); g.lineWidth = 0.5; g.beginPath(); g.arc(0, hy0 + R * 0.12, R * 0.12, 0.2, Math.PI - 0.2); g.stroke();
  // глаза — крупные овалы с бликом
  for (const sx of [-1, 1]) {
    const ex = sx * R * 0.36, ey = hy0 - R * 0.08;
    if (blink) { g.strokeStyle = '#2a1a10'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(ex - R * 0.14, ey); g.lineTo(ex + R * 0.14, ey); g.stroke(); }
    else { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, ey, R * 0.17, R * 0.22, 0, 0, TAU); g.fill(); g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(ex + sx * R * 0.02, ey + R * 0.03, R * 0.11, R * 0.16, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - R * 0.04, ey - R * 0.05, R * 0.05, 0, TAU); g.fill(); }
    g.strokeStyle = sh(C.hair, -0.35); g.lineWidth = 0.7; g.beginPath(); g.moveTo(ex - R * 0.18, ey - R * 0.34 + sx * 0.0); g.quadraticCurveTo(ex, ey - R * 0.44, ex + R * 0.18, ey - R * 0.3); g.stroke();
  }
  // волосы сверху: шапка с чёлкой
  g.beginPath(); g.moveTo(-R * 0.98, hy0 + R * 0.05); g.bezierCurveTo(-R * 1.1, hy0 - R * 1.25, R * 1.1, hy0 - R * 1.25, R * 0.98, hy0 + R * 0.05);
  g.quadraticCurveTo(R * 0.86, hy0 - R * 0.45, R * 0.5, hy0 - R * 0.5); g.quadraticCurveTo(R * 0.2, hy0 - R * 0.28, 0, hy0 - R * 0.55); g.quadraticCurveTo(-R * 0.3, hy0 - R * 0.3, -R * 0.55, hy0 - R * 0.5); g.quadraticCurveTo(-R * 0.86, hy0 - R * 0.45, -R * 0.98, hy0 + R * 0.05); g.closePath();
  paint(g, C.hair, LW, hy0 - R, hy0); shine(g, -R * 0.35, hy0 - R * 0.78, R * 0.3, R * 0.12, 0.35);
  if (C.tail) { g.beginPath(); g.ellipse(R * 0.95, hy0 - R * 0.55, R * 0.28, R * 0.22, 0.5, 0, TAU); paint(g, '#c84a3a'); }
  // оружие в правой руке (с нашей стороны — слева) — Лучник держит лук в левой
  weapon(g, C.weapon, -(P.sw + 1.2), hip + 0.6, P, t);
  g.restore();
}

function weapon(g, kind, x, y, P, t) {
  if (kind === 'axe') {
    capsule(g, x, y + 5, x + 0.4, y - 12, 1.5, '#8a5a30');
    g.beginPath(); g.moveTo(x, y - 11); g.quadraticCurveTo(x - 6, y - 13, x - 6.2, y - 8.6); g.quadraticCurveTo(x - 6, y - 5, x, y - 6.4); g.closePath(); paint(g, '#b8c0cc', LW, y - 13, y - 4);
    g.strokeStyle = '#f2f6fa'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x - 5.6, y - 11); g.quadraticCurveTo(x - 6.3, y - 8.6, x - 5.5, y - 6); g.stroke();
    g.beginPath(); g.roundRect(x - 1.4, y - 12, 2.8, 6.4, 1); paint(g, '#5c6170');
    blob(g, x, y, P.hand, P.hand * 0.95, '#f0bf92');
  }
  if (kind === 'staff') {
    capsule(g, x, y + 16, x, y - 22, 1.5, '#7a5230');
    g.strokeStyle = ink('#c8a040'); g.lineWidth = 1.6; g.beginPath(); g.arc(x, y - 24, 3, 0.6, Math.PI * 2 - 0.6 + Math.PI, false); g.stroke(); g.strokeStyle = '#e8c050'; g.lineWidth = 0.9; g.stroke();
    const p = 0.8 + 0.2 * Math.sin(t * 4); const gr = g.createRadialGradient(x, y - 24.5, 0.2, x, y - 24.5, 7); gr.addColorStop(0, `rgba(180,230,255,${0.9 * p})`); gr.addColorStop(1, 'rgba(120,180,255,0)'); g.fillStyle = gr; g.fillRect(x - 7, y - 31.5, 14, 14);
    blob(g, x, y - 24.5, 2.2, 2.2, '#8ad8ff'); shine(g, x - 0.7, y - 25.3, 0.8, 0.5, 0.8);
    blob(g, x, y, P.hand, P.hand * 0.95, '#f0bf92');
  }
  if (kind === 'bow') {
    const bx = -x, by = y - 4;   // лук в другой руке
    g.lineCap = 'round'; g.strokeStyle = ink('#9a6a34'); g.lineWidth = 2.4; g.beginPath(); g.arc(bx - 9, by, 11, -0.95, 0.95); g.stroke(); g.strokeStyle = '#b07a3e'; g.lineWidth = 1.3; g.stroke();
    g.strokeStyle = '#e8e0cc'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(bx - 9 + Math.cos(-0.95) * 11, by + Math.sin(-0.95) * 11); g.lineTo(bx - 9 + Math.cos(0.95) * 11, by + Math.sin(0.95) * 11); g.stroke();
    g.beginPath(); g.roundRect(bx + 0.6, by - 1.6, 1.8, 3.2, 0.6); paint(g, '#5a3a1c', 0.5);
    blob(g, -x, y, P.hand, P.hand * 0.95, '#f0bf92');
  }
}
