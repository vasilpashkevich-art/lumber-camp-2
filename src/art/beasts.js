// Звери в стиле героев: тёмная обводка, 2–3 тона, мягкая тень.
// Каждая функция рисует зверя, стоящего в точке (x,y) — это земля под ним, смотрит вправо при dir=1.
// a — фаза шага (0..1 по кругу), bite — 0..1 укус/удар.
const O = '#24180f';

function hp(c, fn, fill, lw = 1.1) { c.beginPath(); fn(); c.fillStyle = fill; c.fill(); c.strokeStyle = O; c.lineWidth = lw; c.stroke(); }
function shadow(c, rx, ry) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 1, rx, ry, 0, 0, 7); c.fill(); }
function legs(c, xs, top, h, w, col, a, amp = 2.5) {
  xs.forEach((x, i) => { const o = Math.sin((a + i * 0.5) * Math.PI * 2) * amp; hp(c, () => c.roundRect(x + o * 0.4 - w / 2, top, w, h + Math.min(0, o * 0.3), 1.4), col, 0.9); });
}
function eye(c, x, y, r = 1.1, col = O) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 0.35, y - 0.4, r * 0.35, 0, 7); c.fill(); }

/** Волк (и лиса — другой окрас, меньше). */
function canine(c, a, bite, fox) {
  const body = fox ? '#d9783a' : '#8a8f96', dark = fox ? '#a8542a' : '#5e636a', light = fox ? '#f4e6d0' : '#c9cdd2';
  shadow(c, 17, 4);
  const bob = Math.sin(a * Math.PI * 4) * 0.8;
  // хвост
  hp(c, () => { c.moveTo(-13, -15 + bob); c.quadraticCurveTo(-24, -18, fox ? -27 : -25, fox ? -10 : -23); c.quadraticCurveTo(-20, -15, -12, -11 + bob); c.closePath(); }, fox ? body : dark);
  if (fox) hp(c, () => { c.moveTo(-27, -10); c.quadraticCurveTo(-25, -13, -23, -14); c.quadraticCurveTo(-23, -10, -27, -10); }, '#fff', 0.7);
  legs(c, [-9, -4], -10, 10, 3.4, dark, a);
  hp(c, () => c.ellipse(0, -14 + bob, 14, 7.5, 0, 0, 7), body);
  hp(c, () => c.ellipse(2, -10.5 + bob, 9, 3, 0, 0, 7), light, 0.6);
  legs(c, [5, 10], -10, 10, 3.4, body, a + 0.25);
  // голова
  c.save(); c.translate(13, -19 + bob); c.rotate(bite ? -0.25 * bite : 0);
  hp(c, () => { c.moveTo(-1, -5); c.lineTo(-4, -13); c.lineTo(3, -7); c.closePath(); }, dark);
  hp(c, () => { c.moveTo(4, -6); c.lineTo(5, -14); c.lineTo(9, -6); c.closePath(); }, dark);
  hp(c, () => c.ellipse(2, 0, 7, 6, 0, 0, 7), body);
  hp(c, () => { c.moveTo(5, -2); c.lineTo(15, 1); c.quadraticCurveTo(15, 4, 12, 4.5); c.lineTo(4, 4); c.closePath(); }, body);
  hp(c, () => { c.moveTo(4, 2); c.lineTo(12, 4.5); c.quadraticCurveTo(8, 6, 3, 5); c.closePath(); }, light, 0.6);
  c.fillStyle = O; c.beginPath(); c.arc(14.5, 1.6, 1.4, 0, 7); c.fill();
  eye(c, 5.5, -1.5, 1.1, fox ? '#3a2410' : '#d8b44a');
  if (bite) { c.fillStyle = '#fff'; c.fillRect(9, 4, 1, 1.6); c.fillRect(11, 4.3, 1, 1.4); }
  c.restore();
}

export function wolf(c, a, bite) { canine(c, a, bite, false); }
export function fox(c, a, bite) { c.save(); c.scale(0.85, 0.85); canine(c, a, bite, true); c.restore(); }

export function boar(c, a, bite) {
  shadow(c, 19, 5);
  const bob = Math.sin(a * Math.PI * 4) * 0.7, body = '#6b4a32', dark = '#4a3020', light = '#8a6a4a';
  legs(c, [-10, -4], -9, 9, 4, dark, a, 2);
  hp(c, () => c.ellipse(0, -14 + bob, 17, 11, 0, 0, 7), body, 1.2);
  // щетина по хребту
  c.fillStyle = dark; c.beginPath(); c.moveTo(-14, -18 + bob);
  for (let i = 0; i <= 8; i++) { const x = -14 + i * 3.6; c.lineTo(x, -25 + bob + (i % 2) * 3); }
  c.lineTo(14, -18 + bob); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = 1; c.stroke();
  hp(c, () => c.ellipse(-2, -9 + bob, 11, 4, 0, 0, 7), light, 0.6);
  legs(c, [6, 11], -9, 9, 4, body, a + 0.25, 2);
  // голова
  c.save(); c.translate(15, -14 + bob); c.rotate(bite ? 0.3 * bite : 0);
  hp(c, () => { c.moveTo(-2, -8); c.lineTo(1, -14); c.lineTo(4, -7); c.closePath(); }, dark);
  hp(c, () => c.ellipse(3, 0, 9, 8, 0, 0, 7), body, 1.2);
  hp(c, () => c.ellipse(11, 2, 4, 4.5, 0, 0, 7), '#c98a7a', 1);
  c.fillStyle = '#6a3a2a'; c.beginPath(); c.arc(11, 1, 0.9, 0, 7); c.arc(12.4, 3.4, 0.9, 0, 7); c.fill();
  hp(c, () => { c.moveTo(7, 5); c.quadraticCurveTo(10, 9, 13, 4); c.quadraticCurveTo(10, 7, 8, 3.5); c.closePath(); }, '#f4ecd8', 0.8);
  eye(c, 5, -2.5, 1.1);
  c.restore();
}

export function spider(c, a, bite) {
  shadow(c, 18, 5);
  const bob = Math.sin(a * Math.PI * 6) * 0.6, body = '#3a2a3a', leg = '#2a1e2a';
  // ноги: по 4 с каждой стороны, суставы
  for (let side of [-1, 1]) for (let i = 0; i < 4; i++) {
    const ph = Math.sin((a * 2 + i * 0.25 + (side > 0 ? 0.5 : 0)) * Math.PI * 2) * 2.5;
    const bx = -2 + i * 4, by = -11, kx = bx + (i - 1.5) * 6, ky = -20 + ph + (side > 0 ? 2 : 0), fx = bx + (i - 1.5) * 10 + ph, fy = 0;
    c.strokeStyle = O; c.lineWidth = 3.2; c.beginPath(); c.moveTo(bx, by); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    c.strokeStyle = side > 0 ? '#4a3a4a' : leg; c.lineWidth = 1.6; c.stroke();
  }
  hp(c, () => c.ellipse(-7, -13 + bob, 11, 9, -0.15, 0, 7), body, 1.2);
  // красный знак на брюшке
  hp(c, () => { c.moveTo(-9, -18 + bob); c.lineTo(-6, -14 + bob); c.lineTo(-9, -10 + bob); c.lineTo(-12, -14 + bob); c.closePath(); }, '#c8323a', 0.6);
  c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.ellipse(-9, -18 + bob, 4, 2, -0.3, 0, 7); c.fill();
  hp(c, () => c.ellipse(6, -11 + bob, 6.5, 5.5, 0, 0, 7), '#4a3a4a', 1.1);
  for (const [x, y] of [[8, -13], [10.5, -12], [9, -10.5]]) { c.fillStyle = '#ff4a3a'; c.beginPath(); c.arc(x, y + bob, 0.9, 0, 7); c.fill(); }
  // жвала
  const j = bite ? 2 : 0;
  hp(c, () => { c.moveTo(10, -9 + bob); c.quadraticCurveTo(14 + j, -8 + bob, 12, -5 + bob); c.lineTo(10.5, -7 + bob); c.closePath(); }, '#d8c8a4', 0.6);
}

export const BEASTS = { wolf, fox, boar, spider };
