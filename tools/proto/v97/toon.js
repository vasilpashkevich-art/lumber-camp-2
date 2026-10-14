// Эскиз v97 (проба 2): герой в мультяшном стиле сундука, но суровее — нахмуренные брови, узкие глаза, сжатый рот, щетина, шрамы.
// Пропорции как сейчас (≈4,3 головы). Вид спереди, стоит. Ступни на y = 0, рост 40 единиц.
// Вещи слоями: head (шлем/капюшон/шляпа), chest (рубаха, кольчуга, латы, куртка, мантия), legs, weapon — у каждой своя расцветка.
const TAU = Math.PI * 2;
export const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const ink = col => sh(col, -0.62);
const LW = 0.75;
function paint(g, fill, lw = LW, y0, y1) {
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(fill, 0.16)); gr.addColorStop(1, sh(fill, -0.16)); g.fillStyle = gr; } else g.fillStyle = fill;
  g.fill(); g.strokeStyle = ink(fill); g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
}
function capsule(g, x1, y1, x2, y2, w, col) {
  g.lineCap = 'round'; g.strokeStyle = ink(col); g.lineWidth = w + LW * 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = w * 0.28; g.beginPath(); g.moveTo(x1 - w * 0.22, y1 + 0.4); g.lineTo(x2 - w * 0.22, y2 - 0.4); g.stroke();
}
const blob = (g, x, y, rx, ry, col) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); paint(g, col, LW, y - ry, y + ry); };
const shine = (g, x, y, rx, ry, a = 0.32) => { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, -0.4, 0, TAU); g.fill(); };
const rivet = (g, x, y, r = 0.45) => { g.fillStyle = '#e8ecf2'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };

const P = { head: 4.7, hy: -35.3, top: -29.6, hip: -18.6, sw: 5.6, hw: 4.4, leg: 3.7, arm: 3.1, hand: 1.9 };
export const BASE = {
  warrior: { skin: '#e8b48a', hair: '#9a4a24', beard: 'full', scar: true },
  mage: { skin: '#e8b48a', hair: '#cfc8bc', beard: 'long', long: true },
  archer: { skin: '#e2ac80', hair: '#5a361e', tail: true, stubble: true },
};

/** Герой: cls, набор вещей gear = { head:{m,c}, chest:{m,c,c2}, legs:{m,c}, boots, weapon:{m,c} }, время. */
export function toonHero(g, cls, gear = {}, t = 0) {
  const B = BASE[cls], br = Math.sin(t * 2.2) * 0.25, blink = (t % 4.1) < 0.1;
  const head = gear.head || {}, chest = gear.chest || { m: 'shirt', c: '#d8c8a4' }, legs = gear.legs || { m: 'pants', c: '#6e5236' }, boots = gear.boots || '#4e3420', wp = gear.weapon || {};
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0.6, 10, 2.6, 0, 0, TAU); g.fill();
  g.translate(0, br);
  const robe = chest.m === 'robe' || chest.m === 'battlerobe';
  // сзади: длинные волосы, плащ, колчан
  if (gear.cape) { g.beginPath(); g.moveTo(-P.sw - 0.5, P.top + 1); g.quadraticCurveTo(-P.sw - 3.5, -10, -P.sw - 2.5, -1.5); g.lineTo(P.sw + 2.5, -1.5); g.quadraticCurveTo(P.sw + 3.5, -10, P.sw + 0.5, P.top + 1); g.closePath(); paint(g, gear.cape, LW, P.top, 0); }
  if (B.long && head.m !== 'hood') { g.beginPath(); g.moveTo(-P.head * 0.95, P.hy - 1); g.quadraticCurveTo(-P.head * 1.25, P.top + 6, -P.head * 0.6, P.top + 7); g.lineTo(P.head * 0.6, P.top + 7); g.quadraticCurveTo(P.head * 1.25, P.top + 6, P.head * 0.95, P.hy - 1); g.closePath(); paint(g, B.hair, LW, P.hy, P.top + 7); }
  if (cls === 'archer') quiver(g, gear.quiver || '#6a4022');
  // ноги
  for (const sx of [-1, 1]) {
    if (!robe) {
      capsule(g, sx * (P.hw - P.leg * 0.55), P.hip + 1, sx * (P.hw - P.leg * 0.45), -2.6, P.leg, legs.c);
      if (legs.m === 'mail') { g.fillStyle = 'rgba(30,34,44,.35)'; for (let yy = P.hip + 2; yy < -4; yy += 1.4) for (let k = -1; k <= 1; k++) { g.beginPath(); g.arc(sx * (P.hw - P.leg * 0.5) + k * 1.1 + (yy % 2.8 > 1.4 ? 0.55 : 0), yy, 0.32, 0, TAU); g.fill(); } }
      if (legs.m === 'plate') { blob(g, sx * (P.hw - P.leg * 0.5), -10.5, P.leg * 0.62, 1.7, legs.c2 || '#a8b0bc'); rivet(g, sx * (P.hw - P.leg * 0.5), -10.5); capsule(g, sx * (P.hw - P.leg * 0.47), -9, sx * (P.hw - P.leg * 0.45), -3.4, P.leg * 0.9, legs.c2 || '#a8b0bc'); }
    }
    g.beginPath(); g.ellipse(sx * (P.hw - P.leg * 0.4) + sx * 0.6, -1.3, P.leg * 0.74, 1.7, 0, 0, TAU); paint(g, boots, LW, -3, 0.4);
    if (!robe) { g.beginPath(); g.roundRect(sx * (P.hw - P.leg * 0.45) - P.leg * 0.64, -5.2, P.leg * 1.28, 3.8, 1.2); paint(g, boots, LW, -5.2, -1.4); g.fillStyle = sh(boots, 0.25); g.fillRect(sx * (P.hw - P.leg * 0.45) - P.leg * 0.64, -5.2, P.leg * 1.28, 0.8); }
  }
  // туловище
  torso(g, chest, cls);
  // руки
  const hy = P.hip + 0.6;
  for (const sx of [-1, 1]) {
    const hx = sx * (P.sw + 1.2), sleeve = chest.m === 'plate' ? (chest.c2 || '#a8b0bc') : chest.m === 'mail' ? '#8a929e' : chest.m === 'leather' ? (chest.c2 || sh(chest.c, -0.15)) : chest.c;
    capsule(g, sx * (P.sw - 0.2), P.top + 1.6, hx, hy - 1.4, P.arm, sleeve);
    if (robe) { g.beginPath(); g.ellipse(hx, hy - 1.9, P.arm * 0.95, 1.5, 0, 0, TAU); paint(g, chest.c2 || '#e0b040'); }
    if (chest.m === 'plate' || chest.m === 'mail' || chest.m === 'leather') { g.beginPath(); g.roundRect(hx - P.arm * 0.62, hy - 4.2, P.arm * 1.24, 2.8, 0.9); paint(g, chest.m === 'plate' ? (chest.c2 || '#a8b0bc') : '#5a3a20'); }
    blob(g, hx, hy, P.hand, P.hand * 0.95, chest.m === 'plate' ? '#7a828e' : B.skin);
  }
  // наплечники
  if (chest.pauldron) for (const sx of [-1, 1]) pauldron(g, sx, chest);
  // голова
  face(g, B, head, blink);
  hat(g, head, B);
  weapon(g, wp, -(P.sw + 1.2), hy, t, cls, chest.m === 'plate' ? '#7a828e' : B.skin);
  g.restore();
}

function torso(g, ch, cls) {
  const top = P.top, hip = P.hip, m = ch.m;
  const shape = (wTop = P.sw, wHip = P.hw, low = hip + 1.6) => { g.beginPath(); g.moveTo(-wTop + 0.4, top + 0.6); g.quadraticCurveTo(-wTop - 0.4, (top + hip) / 2, -wHip - 0.4, low); g.quadraticCurveTo(0, low + 1, wHip + 0.4, low); g.quadraticCurveTo(wTop + 0.4, (top + hip) / 2, wTop - 0.4, top + 0.6); g.quadraticCurveTo(0, top - 1.6, -wTop + 0.4, top + 0.6); g.closePath(); };
  if (m === 'robe' || m === 'battlerobe') {
    g.beginPath(); g.moveTo(-P.sw + 0.6, top + 0.8); g.quadraticCurveTo(-P.sw - 0.5, top + 8, -P.sw - 2.6, -2.2); g.quadraticCurveTo(0, -0.6, P.sw + 2.6, -2.2); g.quadraticCurveTo(P.sw + 0.5, top + 8, P.sw - 0.6, top + 0.8); g.quadraticCurveTo(0, top - 1.5, -P.sw + 0.6, top + 0.8); g.closePath(); paint(g, ch.c, LW, top, 0);
    const tr = ch.c2 || '#e0b040'; g.strokeStyle = tr; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-P.sw - 2.2, -2.6); g.quadraticCurveTo(0, -1, P.sw + 2.2, -2.6); g.stroke(); g.beginPath(); g.moveTo(0, top + 1); g.lineTo(0, -1.4); g.stroke();
    g.beginPath(); g.roundRect(-P.sw + 0.6, hip - 1.4, P.sw * 2 - 1.2, 2.3, 1); paint(g, sh(ch.c, -0.35)); g.beginPath(); g.arc(0, hip - 0.25, 1.1, 0, TAU); paint(g, tr, 0.5);
    if (m === 'battlerobe') { g.beginPath(); g.moveTo(-P.sw - 1.2, top + 2.5); g.quadraticCurveTo(0, top - 2.2, P.sw + 1.2, top + 2.5); g.quadraticCurveTo(P.sw, top + 6.5, P.sw - 2, top + 6.8); g.lineTo(0, top + 5); g.lineTo(-P.sw + 2, top + 6.8); g.quadraticCurveTo(-P.sw, top + 6.5, -P.sw - 1.2, top + 2.5); g.closePath(); paint(g, ch.c3 || sh(ch.c, -0.3), LW, top - 2, top + 7); for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 2.4, top + 4, 0.9, 0, TAU); paint(g, '#c8a0ff', 0.5); } }
    return;
  }
  if (m === 'shirt') { shape(); paint(g, ch.c, LW, top, hip); g.strokeStyle = ink(ch.c); g.lineWidth = 0.55; g.beginPath(); g.moveTo(-1.6, top + 0.2); g.lineTo(0, top + 2.6); g.lineTo(1.6, top + 0.2); g.stroke(); belt(g, ch.belt || '#6a3e1e'); return; }
  if (m === 'leather') {
    shape(); paint(g, ch.c, LW, top, hip);
    g.strokeStyle = ink(ch.c); g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, top + 1); g.lineTo(0, hip - 1); g.stroke();
    for (let yy = top + 3; yy < hip - 1; yy += 2.6) for (const sx of [-1, 1]) rivet(g, sx * 1.3, yy, 0.4);
    if (ch.studs) for (let yy = top + 3.4; yy < hip - 2; yy += 3) for (const xx of [-3.6, 3.6]) rivet(g, xx, yy, 0.42);
    belt(g, ch.belt || '#4a2e16');
    // кожаная накладка на левое плечо
    g.beginPath(); g.ellipse(-P.sw + 0.4, top + 1.6, 2.6, 1.9, -0.3, 0, TAU); paint(g, sh(ch.c, -0.2));
    return;
  }
  if (m === 'mail') {
    shape(P.sw, P.hw + 0.6, hip + 3.4); paint(g, '#8a929e', LW, top, hip + 3);
    g.save(); shape(P.sw, P.hw + 0.6, hip + 3.4); g.clip(); g.fillStyle = 'rgba(30,34,44,.38)'; for (let yy = top; yy < hip + 4; yy += 1.3) for (let xx = -7; xx < 7; xx += 1.2) { g.beginPath(); g.arc(xx + ((yy - top) % 2.6 > 1.3 ? 0.6 : 0), yy, 0.32, 0, TAU); g.fill(); } g.restore();
    // накидка-табард цвета вещи
    g.beginPath(); g.moveTo(-2.8, top + 0.6); g.lineTo(2.8, top + 0.6); g.lineTo(3.2, hip + 4.2); g.lineTo(0, hip + 5.2); g.lineTo(-3.2, hip + 4.2); g.closePath(); paint(g, ch.c, LW, top, hip + 5);
    if (ch.sign) { g.beginPath(); g.moveTo(0, top + 3.5); g.lineTo(1.5, top + 5.5); g.lineTo(0, top + 8); g.lineTo(-1.5, top + 5.5); g.closePath(); paint(g, ch.sign, 0.5); }
    belt(g, ch.belt || '#5a3a1c');
    return;
  }
  if (m === 'plate') {
    const st = ch.c2 || '#a8b0bc';
    shape(P.sw + 0.2, P.hw + 0.2); paint(g, st, LW, top, hip);
    // грудная пластина с рёбрами
    g.beginPath(); g.moveTo(-P.sw + 1.2, top + 1.2); g.quadraticCurveTo(0, top - 0.6, P.sw - 1.2, top + 1.2); g.quadraticCurveTo(P.sw - 0.8, top + 7, 0, top + 8.6); g.quadraticCurveTo(-P.sw + 0.8, top + 7, -P.sw + 1.2, top + 1.2); g.closePath(); paint(g, sh(st, 0.08), LW, top, top + 8);
    shine(g, -2.2, top + 3, 1.2, 2.4, 0.45);
    g.strokeStyle = ink(st); g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, top + 1); g.lineTo(0, top + 8); g.stroke();
    if (ch.c) { g.strokeStyle = ch.c; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-P.sw + 1.4, top + 1.4); g.quadraticCurveTo(0, top - 0.3, P.sw - 1.4, top + 1.4); g.stroke(); }
    // пластины живота
    for (let i = 0; i < 2; i++) { const yy = top + 9 + i * 2.2; g.beginPath(); g.roundRect(-P.hw - 0.2 + i * 0.2, yy, (P.hw + 0.2) * 2 - i * 0.4, 2.2, 0.8); paint(g, sh(st, -0.06 * i)); }
    belt(g, ch.belt || '#4a2e16');
    // юбка из пластин
    for (const sx of [-1, 1]) { g.beginPath(); g.roundRect(sx > 0 ? 0.4 : -P.hw - 0.6, hip + 0.8, P.hw + 0.2, 3.4, 1); paint(g, ch.c || st); }
    return;
  }
}
function belt(g, col) { g.beginPath(); g.roundRect(-P.hw - 0.4, P.hip - 1.2, (P.hw + 0.4) * 2, 2.6, 1.1); paint(g, col); g.beginPath(); g.roundRect(-1.3, P.hip - 1.4, 2.6, 3, 0.6); paint(g, '#b8a050'); g.fillStyle = sh(col, -0.3); g.fillRect(-0.4, P.hip - 0.8, 0.8, 1.8); }
function pauldron(g, sx, ch) {
  const col = ch.c2 || '#a8b0bc', x = sx * (P.sw + 0.2), y = P.top + 1.4;
  g.beginPath(); g.ellipse(x, y, 3.4, 2.6, sx * 0.25, Math.PI, 0); g.quadraticCurveTo(x + sx * 0, y + 2, x - 3.4, y); g.closePath();
  g.beginPath(); g.moveTo(x - 3.6, y + 0.8); g.quadraticCurveTo(x - 3.6, y - 3.4, x, y - 3.4); g.quadraticCurveTo(x + 3.6, y - 3.4, x + 3.6, y + 0.8); g.quadraticCurveTo(x, y + 2.2, x - 3.6, y + 0.8); g.closePath(); paint(g, col, LW, y - 3.4, y + 1.6);
  shine(g, x - 1.2, y - 2, 1.4, 0.6, 0.5);
  if (ch.c) { g.strokeStyle = ch.c; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - 3.2, y + 0.6); g.quadraticCurveTo(x, y + 1.8, x + 3.2, y + 0.6); g.stroke(); }
  if (ch.pauldron === 'spike') { g.beginPath(); g.moveTo(x - 0.9, y - 3.2); g.lineTo(x + sx * 1.2, y - 6.2); g.lineTo(x + 0.9, y - 3.2); g.closePath(); paint(g, '#d8dce4', 0.5); }
  rivet(g, x - 1.6, y - 0.6); rivet(g, x + 1.6, y - 0.6);
}

/** Лицо: суровое. Нахмуренные брови, узкие глаза с тёмной радужкой, сжатый рот; борода, щетина, шрам. */
function face(g, B, head, blink) {
  const R = P.head, hy = P.hy, sk = B.skin;
  capsule(g, 0, hy + R * 0.7, 0, P.top + 0.5, R * 0.64, sk);
  for (const sx of [-1, 1]) blob(g, sx * R * 0.94, hy + R * 0.1, R * 0.2, R * 0.28, sk);
  // голова: шире в скулах, твёрже в челюсти
  g.beginPath(); g.moveTo(0, hy - R); g.bezierCurveTo(R * 0.62, hy - R, R * 0.92, hy - R * 0.55, R * 0.92, hy - R * 0.05); g.bezierCurveTo(R * 0.92, hy + R * 0.55, R * 0.62, hy + R * 0.95, 0, hy + R * 0.98); g.bezierCurveTo(-R * 0.62, hy + R * 0.95, -R * 0.92, hy + R * 0.55, -R * 0.92, hy - R * 0.05); g.bezierCurveTo(-R * 0.92, hy - R * 0.55, -R * 0.62, hy - R, 0, hy - R); g.closePath(); paint(g, sk, LW, hy - R, hy + R);
  // тень под скулами и у глаз
  g.fillStyle = 'rgba(120,60,30,.16)'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * R * 0.6, hy + R * 0.38, R * 0.22, R * 0.3, sx * 0.3, 0, TAU); g.fill(); }
  if (B.stubble) { g.fillStyle = 'rgba(60,36,20,.28)'; g.beginPath(); g.moveTo(-R * 0.8, hy + R * 0.25); g.quadraticCurveTo(-R * 0.7, hy + R * 0.95, 0, hy + R * 0.98); g.quadraticCurveTo(R * 0.7, hy + R * 0.95, R * 0.8, hy + R * 0.25); g.quadraticCurveTo(0, hy + R * 0.55, -R * 0.8, hy + R * 0.25); g.fill(); }
  // глаза — узкие, под тяжёлыми бровями
  for (const sx of [-1, 1]) {
    const ex = sx * R * 0.36, ey = hy - R * 0.06;
    if (blink) { g.strokeStyle = '#2a1a10'; g.lineWidth = 0.55; g.beginPath(); g.moveTo(ex - R * 0.16, ey); g.lineTo(ex + R * 0.16, ey); g.stroke(); }
    else {
      g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(ex - R * 0.2, ey + R * 0.02); g.quadraticCurveTo(ex, ey - R * 0.15, ex + R * 0.2, ey); g.quadraticCurveTo(ex, ey + R * 0.12, ex - R * 0.2, ey + R * 0.02); g.closePath(); g.fill();
      g.fillStyle = B.eyes || '#3a2a1a'; g.beginPath(); g.arc(ex + sx * R * 0.02, ey + R * 0.0, R * 0.09, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(ex - R * 0.02, ey - R * 0.03, R * 0.03, 0, TAU); g.fill();
      g.strokeStyle = '#3a2214'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(ex - R * 0.21, ey + R * 0.02); g.quadraticCurveTo(ex, ey - R * 0.17, ex + R * 0.21, ey); g.stroke();   // верхнее веко
    }
    // бровь: толстая, к переносице опущена
    g.fillStyle = sh(B.hair, -0.3); g.beginPath(); g.moveTo(ex - sx * R * 0.3, ey - R * 0.24); g.quadraticCurveTo(ex, ey - R * 0.36, ex + sx * R * 0.08, ey - R * 0.26); g.lineTo(ex + sx * R * 0.2, ey - R * 0.15); g.quadraticCurveTo(ex, ey - R * 0.26, ex - sx * R * 0.3, ey - R * 0.18); g.closePath(); g.fill();
  }
  // складка между бровей
  g.strokeStyle = 'rgba(110,50,24,.5)'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(-R * 0.06, hy - R * 0.3); g.lineTo(-R * 0.03, hy - R * 0.18); g.moveTo(R * 0.06, hy - R * 0.3); g.lineTo(R * 0.03, hy - R * 0.18); g.stroke();
  // нос — крупнее, с тенью
  g.fillStyle = 'rgba(140,70,40,.25)'; g.beginPath(); g.moveTo(R * 0.02, hy - R * 0.1); g.lineTo(R * 0.14, hy + R * 0.22); g.lineTo(-R * 0.02, hy + R * 0.26); g.closePath(); g.fill();
  g.strokeStyle = sh(sk, -0.4); g.lineWidth = 0.5; g.beginPath(); g.moveTo(-R * 0.12, hy + R * 0.24); g.quadraticCurveTo(0, hy + R * 0.32, R * 0.14, hy + R * 0.22); g.stroke();
  // шрам через бровь
  if (B.scar) { g.strokeStyle = 'rgba(150,60,50,.75)'; g.lineWidth = 0.45; g.beginPath(); g.moveTo(R * 0.5, hy - R * 0.5); g.lineTo(R * 0.28, hy + R * 0.18); g.stroke(); }
  // борода
  if (B.beard) {
    const long = B.beard === 'long', low = long ? R * 1.9 : R * 1.32, col = B.hair;
    g.beginPath(); g.moveTo(-R * 0.88, hy + R * 0.02); g.quadraticCurveTo(-R * 0.92, hy + low * 0.85, 0, hy + low); g.quadraticCurveTo(R * 0.92, hy + low * 0.85, R * 0.88, hy + R * 0.02); g.quadraticCurveTo(R * 0.55, hy + R * 0.5, R * 0.32, hy + R * 0.46); g.quadraticCurveTo(0, hy + R * 0.58, -R * 0.32, hy + R * 0.46); g.quadraticCurveTo(-R * 0.55, hy + R * 0.5, -R * 0.88, hy + R * 0.02); g.closePath(); paint(g, col, LW, hy, hy + low);
    g.strokeStyle = sh(col, -0.25); g.lineWidth = 0.45; for (const k of [-0.4, 0, 0.4]) { g.beginPath(); g.moveTo(R * k, hy + R * 0.7); g.lineTo(R * k * 0.8, hy + low * 0.9); g.stroke(); }
    // усы и сжатый рот
    g.beginPath(); g.moveTo(-R * 0.46, hy + R * 0.54); g.quadraticCurveTo(-R * 0.2, hy + R * 0.34, 0, hy + R * 0.42); g.quadraticCurveTo(R * 0.2, hy + R * 0.34, R * 0.46, hy + R * 0.54); g.quadraticCurveTo(0, hy + R * 0.5, -R * 0.46, hy + R * 0.54); g.closePath(); paint(g, sh(col, -0.1), 0.5);
    g.strokeStyle = '#5a2a1a'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(-R * 0.16, hy + R * 0.62); g.lineTo(R * 0.16, hy + R * 0.62); g.stroke();
  } else { g.strokeStyle = '#7a3a26'; g.lineWidth = 0.55; g.beginPath(); g.moveTo(-R * 0.2, hy + R * 0.52); g.quadraticCurveTo(0, hy + R * 0.48, R * 0.2, hy + R * 0.54); g.stroke(); g.strokeStyle = 'rgba(120,60,30,.3)'; g.beginPath(); g.moveTo(-R * 0.12, hy + R * 0.66); g.lineTo(R * 0.12, hy + R * 0.66); g.stroke(); }
}

/** Голова сверху: волосы или головной убор. */
function hat(g, h, B) {
  const R = P.head, hy = P.hy, m = h.m, c = h.c || '#8a929e';
  const hair = () => { g.beginPath(); g.moveTo(-R * 0.98, hy + R * 0.02); g.bezierCurveTo(-R * 1.1, hy - R * 1.28, R * 1.1, hy - R * 1.28, R * 0.98, hy + R * 0.02); g.quadraticCurveTo(R * 0.9, hy - R * 0.5, R * 0.55, hy - R * 0.62); g.lineTo(R * 0.3, hy - R * 0.42); g.lineTo(R * 0.05, hy - R * 0.66); g.lineTo(-R * 0.22, hy - R * 0.44); g.lineTo(-R * 0.5, hy - R * 0.66); g.quadraticCurveTo(-R * 0.9, hy - R * 0.5, -R * 0.98, hy + R * 0.02); g.closePath(); paint(g, B.hair, LW, hy - R, hy); shine(g, -R * 0.35, hy - R * 0.8, R * 0.28, R * 0.11, 0.3); };
  if (!m) { hair(); if (B.tail) { g.beginPath(); g.ellipse(R * 0.95, hy - R * 0.5, R * 0.24, R * 0.2, 0.5, 0, TAU); paint(g, '#7a2a20'); } return; }
  if (m === 'kettle') { hair(); g.beginPath(); g.ellipse(0, hy - R * 0.62, R * 1.42, R * 0.34, 0, 0, TAU); paint(g, sh(c, -0.05)); g.beginPath(); g.moveTo(-R * 0.86, hy - R * 0.62); g.bezierCurveTo(-R * 0.9, hy - R * 1.55, R * 0.9, hy - R * 1.55, R * 0.86, hy - R * 0.62); g.closePath(); paint(g, c, LW, hy - R * 1.4, hy - R * 0.6); shine(g, -R * 0.35, hy - R * 1.12, R * 0.26, R * 0.14, 0.5); g.beginPath(); g.roundRect(-R * 0.88, hy - R * 0.82, R * 1.76, R * 0.24, 0.4); paint(g, h.c2 || sh(c, -0.25), 0.5); return; }
  if (m === 'horned') {
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * R * 0.8, hy - R * 0.75); g.quadraticCurveTo(sx * R * 1.9, hy - R * 1.0, sx * R * 1.7, hy - R * 2.0); g.quadraticCurveTo(sx * R * 1.5, hy - R * 1.25, sx * R * 0.86, hy - R * 0.4); g.closePath(); paint(g, '#efe4cc', LW, hy - R * 2, hy - R * 0.4); }
    g.beginPath(); g.moveTo(-R * 0.98, hy + R * 0.15); g.lineTo(-R * 0.98, hy - R * 0.4); g.bezierCurveTo(-R * 1.0, hy - R * 1.4, R * 1.0, hy - R * 1.4, R * 0.98, hy - R * 0.4); g.lineTo(R * 0.98, hy + R * 0.15); g.lineTo(R * 0.7, hy + R * 0.15); g.lineTo(R * 0.7, hy - R * 0.3); g.lineTo(-R * 0.7, hy - R * 0.3); g.lineTo(-R * 0.7, hy + R * 0.15); g.closePath(); paint(g, c, LW, hy - R * 1.2, hy);
    g.beginPath(); g.roundRect(-R * 0.14, hy - R * 0.35, R * 0.28, R * 0.72, 0.3); paint(g, sh(c, -0.1), 0.5);
    g.beginPath(); g.roundRect(-R, hy - R * 0.5, R * 2, R * 0.25, 0.4); paint(g, h.c2 || '#c8a040', 0.5); shine(g, -R * 0.4, hy - R * 0.95, R * 0.3, R * 0.14, 0.5);
    for (const xx of [-0.6, -0.2, 0.2, 0.6]) rivet(g, R * xx, hy - R * 0.38, 0.35);
    return;
  }
  if (m === 'greathelm') {   // глухой шлем с гребнем
    if (h.crest) { g.beginPath(); g.moveTo(0, hy - R * 1.05); g.quadraticCurveTo(R * 0.4, hy - R * 2.0, R * 1.6, hy - R * 1.6); g.quadraticCurveTo(R * 0.8, hy - R * 1.2, R * 0.3, hy - R * 0.95); g.closePath(); paint(g, h.crest); }
    g.beginPath(); g.roundRect(-R * 1.0, hy - R * 1.1, R * 2.0, R * 2.05, [R * 0.9, R * 0.9, R * 0.35, R * 0.35]); paint(g, c, LW, hy - R, hy + R);
    g.fillStyle = '#14161c'; g.beginPath(); g.roundRect(-R * 0.72, hy - R * 0.2, R * 1.44, R * 0.2, 0.3); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(-R * 0.36 + i * R * 0.22, hy + R * 0.2, R * 0.1, R * 0.4, 0.1); g.fill(); }
    g.beginPath(); g.roundRect(-R * 0.08, hy - R * 1.05, R * 0.16, R * 1.9, 0.2); paint(g, h.c2 || '#c8a040', 0.4); shine(g, -R * 0.5, hy - R * 0.7, R * 0.2, R * 0.35, 0.45);
    return;
  }
  if (m === 'hood' || m === 'cowl') {
    g.beginPath(); g.moveTo(-R * 1.15, hy + R * 0.95); g.bezierCurveTo(-R * 1.35, hy - R * 1.1, -R * 0.4, hy - R * 1.55, R * 0.15, hy - R * 1.45); g.bezierCurveTo(R * 1.2, hy - R * 1.3, R * 1.3, hy - R * 0.2, R * 1.15, hy + R * 0.95); g.quadraticCurveTo(R * 0.9, hy + R * 0.2, R * 0.78, hy - R * 0.2); g.quadraticCurveTo(0, hy - R * 0.95, -R * 0.78, hy - R * 0.2); g.quadraticCurveTo(-R * 0.9, hy + R * 0.2, -R * 1.15, hy + R * 0.95); g.closePath(); paint(g, c, LW, hy - R * 1.4, hy + R);
    g.fillStyle = 'rgba(20,10,4,.28)'; g.beginPath(); g.moveTo(-R * 0.78, hy - R * 0.2); g.quadraticCurveTo(0, hy - R * 0.95, R * 0.78, hy - R * 0.2); g.quadraticCurveTo(0, hy - R * 0.45, -R * 0.78, hy - R * 0.2); g.fill();
    if (m === 'cowl') { g.beginPath(); g.moveTo(-R * 0.82, hy + R * 0.42); g.quadraticCurveTo(0, hy + R * 0.95, R * 0.82, hy + R * 0.42); g.lineTo(R * 0.82, hy + R * 1.0); g.quadraticCurveTo(0, hy + R * 1.4, -R * 0.82, hy + R * 1.0); g.closePath(); paint(g, h.c2 || sh(c, -0.2)); }
    return;
  }
  if (m === 'wizard') {
    hair(); g.beginPath(); g.ellipse(0, hy - R * 0.62, R * 1.55, R * 0.36, 0, 0, TAU); paint(g, sh(c, -0.1));
    g.beginPath(); g.moveTo(-R * 0.86, hy - R * 0.68); g.quadraticCurveTo(-R * 0.4, hy - R * 1.8, R * 0.6, hy - R * 2.9); g.quadraticCurveTo(R * 0.55, hy - R * 1.6, R * 0.86, hy - R * 0.68); g.closePath(); paint(g, c, LW, hy - R * 2.9, hy - R * 0.6);
    g.beginPath(); g.roundRect(-R * 0.86, hy - R * 0.95, R * 1.72, R * 0.28, 0.4); paint(g, h.c2 || '#e0b040', 0.5);
    g.fillStyle = h.c2 || '#e0b040'; for (const [xx, yy] of [[-0.2, -1.5], [0.25, -2.1]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? 0.12 : 0.32, an = k * Math.PI / 4; g.lineTo(R * xx + Math.cos(an) * R * rr, hy + R * yy + Math.sin(an) * R * rr); } g.closePath(); g.fill(); }
    return;
  }
  if (m === 'circlet') { hair(); g.beginPath(); g.moveTo(-R * 0.92, hy - R * 0.5); g.quadraticCurveTo(0, hy - R * 0.85, R * 0.92, hy - R * 0.5); g.lineTo(R * 0.92, hy - R * 0.32); g.quadraticCurveTo(0, hy - R * 0.67, -R * 0.92, hy - R * 0.32); g.closePath(); paint(g, c, 0.5); g.beginPath(); g.moveTo(0, hy - R * 1.05); g.lineTo(R * 0.2, hy - R * 0.75); g.lineTo(0, hy - R * 0.52); g.lineTo(-R * 0.2, hy - R * 0.75); g.closePath(); paint(g, h.gem || '#b070ff', 0.5); shine(g, -R * 0.06, hy - R * 0.85, R * 0.06, R * 0.08, 0.8); return; }
  if (m === 'feathercap') { hair(); g.beginPath(); g.moveTo(-R * 1.0, hy - R * 0.5); g.bezierCurveTo(-R * 0.9, hy - R * 1.5, R * 0.9, hy - R * 1.55, R * 1.25, hy - R * 0.62); g.quadraticCurveTo(0, hy - R * 0.75, -R * 1.0, hy - R * 0.5); g.closePath(); paint(g, c, LW, hy - R * 1.4, hy - R * 0.5); g.beginPath(); g.moveTo(R * 0.4, hy - R * 1.0); g.quadraticCurveTo(R * 1.9, hy - R * 1.9, R * 2.2, hy - R * 2.6); g.quadraticCurveTo(R * 1.2, hy - R * 1.4, R * 0.4, hy - R * 1.0); g.closePath(); paint(g, h.c2 || '#c84a3a', 0.6); return; }
}

function quiver(g, col) {
  g.save(); g.translate(P.sw - 1, P.top + 1); g.rotate(0.35); g.beginPath(); g.roundRect(-2, -9, 4.2, 12, 1.6); paint(g, col, LW, -9, 3);
  for (let i = 0; i < 3; i++) { g.strokeStyle = '#d8d0bc'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-1 + i * 1.3, -9); g.lineTo(-1.6 + i * 1.3, -12); g.stroke(); g.fillStyle = '#b8b0a0'; g.beginPath(); g.moveTo(-1.6 + i * 1.3, -12); g.lineTo(-0.6 + i * 1.3, -13.5); g.lineTo(-2.4 + i * 1.3, -13.2); g.closePath(); g.fill(); }
  g.restore();
}

function weapon(g, w, x, y, t, cls, handCol) {
  const m = w.m, c = w.c || '#b8c0cc', hand = () => blob(g, x, y, P.hand, P.hand * 0.95, handCol);
  if (m === 'axe' || m === 'battleaxe') {
    capsule(g, x, y + 5, x + 0.4, y - 13, 1.5, w.wood || '#6e4626');
    const blade = sx => { g.beginPath(); g.moveTo(x, y - 12); g.quadraticCurveTo(x + sx * 6.2, y - 14, x + sx * 6.4, y - 9); g.quadraticCurveTo(x + sx * 6.2, y - 4.4, x, y - 6.6); g.closePath(); paint(g, c, LW, y - 14, y - 4); g.strokeStyle = '#f2f6fa'; g.lineWidth = 0.55; g.beginPath(); g.moveTo(x + sx * 5.8, y - 11.6); g.quadraticCurveTo(x + sx * 6.5, y - 9, x + sx * 5.7, y - 6.2); g.stroke(); };
    blade(-1); if (m === 'battleaxe') blade(1);
    g.beginPath(); g.roundRect(x - 1.3, y - 12.6, 2.6, 6.6, 0.9); paint(g, w.c2 || '#5c6170'); hand(); return;
  }
  if (m === 'sword' || m === 'flamesword') {
    g.beginPath(); g.moveTo(x - 1.1, y - 3); g.lineTo(x - 1.1, y - 21); g.lineTo(x, y - 23.5); g.lineTo(x + 1.1, y - 21); g.lineTo(x + 1.1, y - 3); g.closePath(); paint(g, c, LW, y - 24, y - 3);
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(x - 0.3, y - 4); g.lineTo(x - 0.3, y - 21.5); g.stroke();
    if (m === 'flamesword') { const p = 0.7 + 0.3 * Math.sin(t * 6); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const yy = y - 6 - i * 3.6, q = (t * 1.5 + i * 0.3) % 1; g.fillStyle = `rgba(255,${120 + i * 20},40,${0.5 * p})`; g.beginPath(); g.ellipse(x + Math.sin(t * 5 + i) * 0.8, yy - q * 2, 1.6, 2.4, 0, 0, TAU); g.fill(); } g.restore(); }
    g.beginPath(); g.roundRect(x - 3.6, y - 3.4, 7.2, 1.6, 0.7); paint(g, w.c2 || '#c8a040'); capsule(g, x, y - 1.6, x, y + 2.4, 1.3, '#5a3a20'); blob(g, x, y + 3.2, 0.9, 0.9, w.c2 || '#c8a040'); hand(); return;
  }
  if (m === 'hammer') {
    capsule(g, x, y + 6, x, y - 13, 1.5, w.wood || '#5a3a20');
    g.beginPath(); g.roundRect(x - 4.6, y - 17.5, 9.2, 5.6, 1.6); paint(g, c, LW, y - 17.5, y - 12); shine(g, x - 2.4, y - 16.4, 1.6, 0.6, 0.55);
    g.beginPath(); g.roundRect(x - 5.2, y - 15.6, 1.2, 1.8, 0.3); paint(g, w.c2 || '#c8a040', 0.4); g.beginPath(); g.roundRect(x + 4, y - 15.6, 1.2, 1.8, 0.3); paint(g, w.c2 || '#c8a040', 0.4);
    if (w.glow) { g.save(); g.globalCompositeOperation = 'lighter'; const p = 0.6 + 0.4 * Math.sin(t * 7); g.strokeStyle = `rgba(150,210,255,${p})`; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x - 4, y - 16); g.lineTo(x - 1, y - 14.5); g.lineTo(x - 2, y - 13.2); g.lineTo(x + 2, y - 15.5); g.stroke(); g.restore(); }
    hand(); return;
  }
  if (m === 'staff' || m === 'firestaff' || m === 'crystal') {
    capsule(g, x, y + 16, x, y - 21, 1.4, w.wood || '#6a4628');
    const p = 0.8 + 0.2 * Math.sin(t * 4), oc = m === 'firestaff' ? [255, 150, 60] : m === 'crystal' ? [200, 140, 255] : [140, 200, 255], cy = y - 24;
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, cy, 0.2, x, cy, 7); gr.addColorStop(0, `rgba(${oc},${0.8 * p})`); gr.addColorStop(1, `rgba(${oc},0)`); g.fillStyle = gr; g.fillRect(x - 7, cy - 7, 14, 14); g.restore();
    if (m === 'firestaff') { g.beginPath(); g.moveTo(x - 1, y - 21); g.quadraticCurveTo(x - 4, y - 24, x - 2, y - 27); g.quadraticCurveTo(x + 2, y - 25, x + 1, y - 21); g.closePath(); paint(g, '#6a4628'); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(255,${140 + i * 40},40,.8)`; g.beginPath(); g.ellipse(x - 1 + Math.sin(t * 7 + i) * 0.6, cy - 1 - i * 1.4, 1.8 - i * 0.4, 2.6 - i * 0.6, 0, 0, TAU); g.fill(); } g.restore(); }
    else if (m === 'crystal') { g.beginPath(); g.moveTo(x, cy - 4.5); g.lineTo(x + 2, cy - 0.5); g.lineTo(x, cy + 2.5); g.lineTo(x - 2, cy - 0.5); g.closePath(); paint(g, '#c8a0ff', 0.6); shine(g, x - 0.6, cy - 1.5, 0.5, 1, 0.8); for (const sx of [-1, 1]) { g.strokeStyle = ink(w.c2 || '#e0b040'); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y - 20.5); g.quadraticCurveTo(x + sx * 3.2, cy, x + sx * 0.8, cy - 3.6); g.stroke(); g.strokeStyle = w.c2 || '#e0b040'; g.lineWidth = 0.6; g.stroke(); } }
    else { g.strokeStyle = ink('#c8a040'); g.lineWidth = 1.4; g.beginPath(); g.arc(x, cy, 2.9, 0.7, Math.PI * 2.3); g.stroke(); g.strokeStyle = '#d8b050'; g.lineWidth = 0.7; g.stroke(); blob(g, x, cy, 2, 2, '#8ad0ff'); shine(g, x - 0.6, cy - 0.7, 0.7, 0.45, 0.8); }
    hand(); return;
  }
  if (m === 'bow' || m === 'longbow' || m === 'goldbow') {
    const bx = -x, by = y - 4, R = m === 'longbow' ? 15 : 11, a = m === 'longbow' ? 1.0 : 0.95, col = m === 'goldbow' ? '#d8a840' : c;
    g.lineCap = 'round'; g.strokeStyle = ink(col); g.lineWidth = 2.4; g.beginPath(); g.arc(bx - R + 2, by, R, -a, a); g.stroke(); g.strokeStyle = col; g.lineWidth = 1.3; g.stroke();
    if (m === 'goldbow') for (const s of [-1, 1]) { const ex = bx - R + 2 + Math.cos(s * a) * R, ey = by + Math.sin(s * a) * R; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + 1.6, ey + s * 1.8); g.lineTo(ex - 0.6, ey + s * 0.8); g.closePath(); paint(g, '#f0d070', 0.4); }
    g.strokeStyle = '#e8e0cc'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(bx - R + 2 + Math.cos(-a) * R, by + Math.sin(-a) * R); g.lineTo(bx - R + 2 + Math.cos(a) * R, by + Math.sin(a) * R); g.stroke();
    g.beginPath(); g.roundRect(bx + 0.6, by - 1.6, 1.8, 3.2, 0.6); paint(g, '#4a2e16', 0.5);
    blob(g, -x, y, P.hand, P.hand * 0.95, handCol); return;
  }
  hand();
}
