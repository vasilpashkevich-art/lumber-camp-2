// Эскиз v65: облик Грибного леса — мшистая земля, поваленные стволы, грибы-великаны, папоротники, пруд с камышом,
// хижины квакунов, грибной круг, паутина, логово Полоза, железная жила, туман, тележка купца, прилавок рынка.
// Единицы — мира (рост героя ≈ 41). Предмет стоит основанием в (0,0).
const O = '#24180f', TAU = Math.PI * 2;
export const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
export const rng = s => () => { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; };
let c;
const F = (fn, fill, lw = 0.8) => { c.beginPath(); fn(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = O; c.lineWidth = lw; c.stroke(); } };
const grad = (y0, y1, a, b) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
const shadow = (rx, ry = rx * 0.3, x = 0) => { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, 1, rx, ry, 0, 0, TAU); c.fill(); };

// ------------------------------------------------------------ земля: мох, кочки, листья, корни
export function ground(g, x0, y0, w, h, seed = 3) {
  c = g; const r = rng(seed);
  c.fillStyle = '#3e5a2c'; c.fillRect(x0, y0, w, h);
  for (let i = 0; i < w * h / 900; i++) { const x = x0 + r() * w, y = y0 + r() * h, s = 10 + r() * 40; const gr = c.createRadialGradient(x, y, 1, x, y, s); const col = r() < 0.5 ? '90,124,58' : r() < 0.6 ? '52,74,36' : '106,92,58'; gr.addColorStop(0, `rgba(${col},.55)`); gr.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, s, s * 0.6, 0, 0, TAU); c.fill(); }
  // моховые кочки: неровные, из нескольких бугорков, с тенью снизу
  for (let i = 0; i < w * h / 3200; i++) { const x = x0 + r() * w, y = y0 + r() * h, s = 3 + r() * 5, n = 2 + Math.floor(r() * 3), col = r() < 0.5 ? '#557c34' : '#4a6e2e';
    c.fillStyle = 'rgba(16,26,10,.28)'; c.beginPath(); c.ellipse(x + 1, y + s * 0.45, s * 1.3, s * 0.35, 0, 0, TAU); c.fill();
    for (let k = 0; k < n; k++) { const dx = (k - (n - 1) / 2) * s * 0.7, dy = (r() - 0.5) * s * 0.3, ss = s * (0.6 + r() * 0.4); c.fillStyle = col; c.beginPath(); c.ellipse(x + dx, y + dy, ss, ss * 0.6, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(190,220,120,.2)'; c.beginPath(); c.ellipse(x + dx - ss * 0.25, y + dy - ss * 0.22, ss * 0.45, ss * 0.2, 0, 0, TAU); c.fill(); } }
  // листья и хвоя
  for (let i = 0; i < w * h / 300; i++) { const x = x0 + r() * w, y = y0 + r() * h; c.fillStyle = ['#8a6a3a', '#a8783a', '#6a5a30', '#4a6a2a'][Math.floor(r() * 4)]; c.beginPath(); c.ellipse(x, y, 1.2, 0.6, r() * 3, 0, TAU); c.fill(); }
  // мелкие грибочки и травинки
  for (let i = 0; i < w * h / 14000; i++) { const x = x0 + r() * w, y = y0 + r() * h; tinyShroom(x, y, r() < 0.3 ? '#c8382a' : r() < 0.5 ? '#c89a5a' : '#e8e0d0', 0.7 + r() * 0.5); }
}
function tinyShroom(x, y, cap, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0.6, 0.4, 2, 0.6, 0, 0, TAU); c.fill(); F(() => c.rect(-0.5, -2.6, 1, 2.6), '#efe6d2', 0.3); F(() => { c.moveTo(-2, -2.4); c.quadraticCurveTo(0, -5, 2, -2.4); c.closePath(); }, cap, 0.35); c.restore(); }

// ------------------------------------------------------------ поваленный ствол
export function fallenLog(g, len = 90, seed = 2) {
  c = g; const r = rng(seed), d = 14, x0 = -len / 2, x1 = len / 2;
  shadow(len * 0.55, 6);
  const body = () => { c.moveTo(x0, -d); c.lineTo(x1, -d + 1); c.quadraticCurveTo(x1 + 3, -d / 2, x1, 0); c.lineTo(x0, 0); c.closePath(); };
  F(body, grad(-d, 0, '#7a5a3c', '#3e2a1a'), 0.9);
  c.save(); c.beginPath(); body(); c.clip();
  c.strokeStyle = 'rgba(30,18,8,.55)'; c.lineWidth = 0.6; for (let i = 0; i < 16; i++) { const y = -d + 1 + r() * (d - 2), x = x0 + r() * len; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8 + r() * 14, y + (r() - 0.5) * 1.4); c.stroke(); }
  c.fillStyle = 'rgba(255,230,190,.12)'; c.fillRect(x0, -d, len, 3);
  // мох сверху
  c.fillStyle = '#6e9a42'; c.beginPath(); c.moveTo(x0, -d + 2); for (let x = x0; x <= x1; x += 4) c.lineTo(x, -d - 1.6 + Math.sin(x * 0.3 + seed) * 1.4 - (r() < 0.2 ? 2 : 0)); c.lineTo(x1, -d + 3); c.lineTo(x0, -d + 4); c.closePath(); c.fill();
  c.restore();
  c.strokeStyle = O; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x0, -d - 0.4); for (let x = x0; x <= x1; x += 4) c.lineTo(x, -d - 1.6 + Math.sin(x * 0.3 + seed) * 1.4); c.stroke();
  // срез с кольцами
  F(() => c.ellipse(x0, -d / 2, 3.6, d / 2, 0, 0, TAU), '#c8a070', 0.8); c.strokeStyle = '#8a6a42'; c.lineWidth = 0.4; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(x0, -d / 2, 3.6 * k / 4, d / 2 * k / 4, 0, 0, TAU); c.stroke(); }
  // трутовики и сучок
  for (let i = 0; i < 3; i++) { const x = x0 + 15 + r() * (len - 30), y = -d * (0.3 + r() * 0.4); F(() => { c.moveTo(x - 4, y); c.quadraticCurveTo(x, y - 3.4, x + 4, y); c.quadraticCurveTo(x, y + 1, x - 4, y); c.closePath(); }, '#c89a5a', 0.5); c.strokeStyle = '#8a5a2a'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(x - 3, y - 0.4); c.quadraticCurveTo(x, y - 2.2, x + 3, y - 0.4); c.stroke(); }
  F(() => { c.moveTo(x1 - 22, -d + 1); c.lineTo(x1 - 16, -d - 9); c.lineTo(x1 - 14, -d - 8); c.lineTo(x1 - 18, -d + 1); c.closePath(); }, '#5a3e26', 0.6);
  for (let i = 0; i < 3; i++) tinyShroom(x0 + 10 + r() * (len - 20), -d - 1, '#e8b040', 0.9);
}

// ------------------------------------------------------------ гриб-великан (1,5–3 роста) и светящиеся грибочки
export function giantShroom(g, h = 90, kind = 0, t = 0) {
  c = g; const caps = [['#a8382a', '#f4ecd8'], ['#8a6a4a', '#e8d8b8'], ['#4a6aa8', '#c8e0ff']], [capC, spot] = caps[kind % 3], cw = h * 0.42, sw = h * 0.1;
  shadow(cw * 0.9, cw * 0.28);
  F(() => { c.moveTo(-sw, 0); c.bezierCurveTo(-sw * 1.2, -h * 0.3, -sw * 0.7, -h * 0.6, -sw * 0.75, -h * 0.82); c.lineTo(sw * 0.75, -h * 0.82); c.bezierCurveTo(sw * 0.7, -h * 0.6, sw * 1.2, -h * 0.3, sw, 0); c.quadraticCurveTo(0, sw * 0.4, -sw, 0); c.closePath(); }, grad(-h, 0, '#efe6d2', '#c8b898'), 0.8);
  c.fillStyle = 'rgba(80,60,30,.25)'; c.fillRect(sw * 0.2, -h * 0.8, sw * 0.6, h * 0.8);
  F(() => c.ellipse(0, -h * 0.52, sw * 1.6, sw * 0.5, 0, 0, TAU), '#e8dcc0', 0.6); // кольцо-юбочка
  F(() => c.ellipse(0, -h * 0.8, cw * 0.86, cw * 0.14, 0, 0, TAU), '#d8c8a8', 0.6);
  c.strokeStyle = 'rgba(120,90,60,.5)'; c.lineWidth = 0.4; for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(i * cw / 9, -h * 0.8 - cw * 0.1); c.lineTo(i * cw / 12, -h * 0.8 + cw * 0.08); c.stroke(); }
  const cap = () => { c.moveTo(-cw, -h * 0.8); c.bezierCurveTo(-cw * 0.95, -h * 0.8 - cw * 0.85, cw * 0.95, -h * 0.8 - cw * 0.85, cw, -h * 0.8); c.quadraticCurveTo(0, -h * 0.8 + cw * 0.12, -cw, -h * 0.8); c.closePath(); };
  if (kind % 3 === 2) { c.save(); c.shadowColor = '#7ec8ff'; c.shadowBlur = 10; F(cap, capC, 0); c.restore(); }
  F(cap, grad(-h * 0.8 - cw * 0.7, -h * 0.8, sh(capC, 0.2), sh(capC, -0.25)), 0.9);
  c.save(); c.beginPath(); cap(); c.clip(); const r = rng(kind * 7 + 3); c.fillStyle = spot; for (let i = 0; i < 11; i++) { c.beginPath(); c.ellipse((r() - 0.5) * cw * 1.7, -h * 0.8 - r() * cw * 0.6, 2 + r() * 3.4, 1.4 + r() * 2.2, 0, 0, TAU); c.fill(); } c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.ellipse(-cw * 0.35, -h * 0.8 - cw * 0.45, cw * 0.36, cw * 0.14, -0.4, 0, TAU); c.fill(); c.restore();
}
export function glowShrooms(g, n = 5, seed = 4, t = 0) {
  c = g; const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 22, y = (r() - 0.5) * 6, s = 0.8 + r() * 0.7, pulse = 0.6 + 0.4 * Math.sin(t * 2 + i);
    const gr = c.createRadialGradient(x, y - 3 * s, 0.5, x, y - 3 * s, 8 * s); gr.addColorStop(0, `rgba(140,220,255,${0.45 * pulse})`); gr.addColorStop(1, 'rgba(140,220,255,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y - 3 * s, 8 * s, 0, TAU); c.fill();
    c.save(); c.translate(x, y); c.scale(s, s); F(() => c.rect(-0.5, -3.4, 1, 3.4), '#d8e8f0', 0.3); F(() => { c.moveTo(-2.4, -3); c.quadraticCurveTo(0, -6.4, 2.4, -3); c.closePath(); }, '#7ec8ff', 0.35); c.restore(); }
}
export function fern(g, s = 1, seed = 1) {
  c = g; const r = rng(seed); c.save(); c.scale(s, s); shadow(9, 2.6);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.38 + (r() - 0.5) * 0.1, L = 12 + r() * 5, ex = Math.cos(a) * L, ey = Math.sin(a) * L * 0.8;
    c.strokeStyle = '#2e4a1e'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(ex * 0.5, ey * 0.7, ex, ey); c.stroke();
    for (let k = 1; k < 8; k++) { const q = k / 8, px = ex * q * (0.5 + q * 0.5), py = ey * q * (0.7 + q * 0.3) + q * q * 1.5; c.fillStyle = k % 2 ? '#4a7a2e' : '#5a8a36'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(px + sd * Math.sin(a) * 1.6 * (1 - q * 0.6), py - sd * Math.cos(a) * 1.6 * (1 - q * 0.6), 1.8 * (1 - q * 0.5), 0.7, a + sd * 0.9, 0, TAU); c.fill(); } } }
  c.restore();
}
// мшистое дерево: корни, мох на стволе, свисающий мох
export function mossTree(g, h = 115, seed = 5) {
  c = g; const r = rng(seed), tw = h * 0.09;
  shadow(h * 0.32, h * 0.1);
  for (const sx of [-1, 1]) F(() => { c.moveTo(sx * tw * 0.5, -6); c.quadraticCurveTo(sx * tw * 1.4, -2, sx * tw * 2.1, 0.6); c.lineTo(sx * tw * 0.4, 0.6); c.closePath(); }, '#4a3624', 0.6);
  const trunk = () => { c.moveTo(-tw, 0); c.bezierCurveTo(-tw * 1.05, -h * 0.3, -tw * 0.7, -h * 0.5, -tw * 0.6, -h * 0.62); c.lineTo(tw * 0.6, -h * 0.62); c.bezierCurveTo(tw * 0.7, -h * 0.5, tw * 1.05, -h * 0.3, tw, 0); c.closePath(); };
  F(trunk, grad(-h * 0.6, 0, '#5a4430', '#3a2a1c'), 0.8);
  c.save(); c.beginPath(); trunk(); c.clip(); c.strokeStyle = 'rgba(20,12,6,.5)'; c.lineWidth = 0.6; for (let i = 0; i < 10; i++) { const x = (r() - 0.5) * tw * 1.8, y = -r() * h * 0.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5), y - 6 - r() * 6); c.stroke(); } c.fillStyle = 'rgba(110,154,66,.75)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-tw * 0.55 + r() * tw * 0.4, -h * 0.05 - r() * h * 0.3, tw * 0.28, tw * 0.5, 0, 0, TAU); c.fill(); } c.fillStyle = 'rgba(20,10,4,.25)'; c.fillRect(tw * 0.2, -h, tw, h); c.restore();
  // крона
  const blobs = []; for (let i = 0; i < 9; i++) blobs.push([(r() - 0.5) * h * 0.55, -h * 0.68 - r() * h * 0.32, h * (0.15 + r() * 0.08)]);
  blobs.sort((a, b) => a[1] - b[1]);
  for (const [x, y, s] of blobs) F(() => c.arc(x, y, s, 0, TAU), grad(y - s, y + s, '#3e6a2a', '#1e3a16'), 0.7);
  for (const [x, y, s] of blobs) { c.fillStyle = 'rgba(160,200,100,.22)'; c.beginPath(); c.arc(x - s * 0.3, y - s * 0.35, s * 0.45, 0, TAU); c.fill(); }
  // свисающий мох
  c.strokeStyle = '#8aa860'; c.lineWidth = 0.8; for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * h * 0.55, y = -h * 0.6 - r() * h * 0.08, L = 6 + r() * 10; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 1, y + L * 0.5, x - 0.6, y + L); c.stroke(); }
}

// ------------------------------------------------------------ пруд с камышом и кувшинками
export function pond(g, rx = 90, ry = 44, seed = 6, t = 0) {
  c = g; const r = rng(seed);
  const edge = () => { for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, k = 1 + Math.sin(a * 3 + seed) * 0.06 + Math.sin(a * 5) * 0.04; c.lineTo(Math.cos(a) * rx * k, Math.sin(a) * ry * k); } c.closePath(); };
  c.save(); c.scale(1.08, 1.12); F(edge, '#4a3e26', 0); c.restore();
  F(edge, grad(-ry, ry, '#2a4a4a', '#1a3236'), 1);
  c.save(); c.beginPath(); edge(); c.clip(); c.strokeStyle = 'rgba(200,230,230,.25)'; c.lineWidth = 0.8; for (let i = 0; i < 6; i++) { const x = (r() - 0.5) * rx * 1.4, y = (r() - 0.5) * ry * 1.2, s = 6 + Math.sin(t + i) * 2; c.beginPath(); c.ellipse(x, y, s, s * 0.35, 0, 0, TAU); c.stroke(); }
  c.fillStyle = 'rgba(220,240,240,.18)'; c.beginPath(); c.ellipse(-rx * 0.3, -ry * 0.4, rx * 0.4, ry * 0.12, 0, 0, TAU); c.fill(); c.restore();
  for (let i = 0; i < 6; i++) { const a = r() * TAU, d = 0.3 + r() * 0.5, x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d; F(() => { c.moveTo(x, y); c.arc(x, y, 3.4, 0.3, TAU - 0.1); c.closePath(); }, '#4a8a3a', 0.5); if (i % 3 === 0) F(() => c.arc(x + 1, y - 0.6, 1.2, 0, TAU), '#f4d8e8', 0.3); }
}
export function reeds(g, n = 9, seed = 8, t = 0) {
  c = g; const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 22, h = 14 + r() * 12, sw = Math.sin(t * 1.4 + i) * 1.2; c.strokeStyle = O; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + sw * 0.3, -h * 0.5, x + sw, -h); c.stroke(); c.strokeStyle = r() < 0.5 ? '#6a8a3a' : '#8a9a4a'; c.lineWidth = 0.8; c.stroke();
    if (r() < 0.55) F(() => c.ellipse(x + sw, -h - 2.6, 1.2, 3, 0, 0, TAU), '#6a4428', 0.4); }
}

// ------------------------------------------------------------ логова: хижина квакунов, грибной круг, паутина, логово Полоза
export function reedHut(g, seed = 1) {
  c = g; const r = rng(seed), w = 34, h = 30; shadow(w * 0.75, 7);
  const dome = () => { c.moveTo(-w / 2, 0); c.bezierCurveTo(-w / 2, -h * 0.9, w / 2, -h * 0.9, w / 2, 0); c.closePath(); };
  F(dome, grad(-h, 0, '#b8a060', '#7a6438'), 0.9);
  c.save(); c.beginPath(); dome(); c.clip(); for (let i = -9; i <= 9; i++) { c.strokeStyle = i % 2 ? '#8a7440' : '#a89058'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(i * 2, 2); c.quadraticCurveTo(i * 1.4, -h * 0.5, i * 0.4, -h); c.stroke(); } c.strokeStyle = '#5a4428'; c.lineWidth = 1.2; for (const y of [-6, -14, -21]) { c.beginPath(); c.moveTo(-w, y); c.lineTo(w, y); c.stroke(); } c.fillStyle = 'rgba(20,10,4,.22)'; c.fillRect(4, -h, w, h); c.restore();
  F(() => { c.moveTo(-6, 0); c.bezierCurveTo(-6, -13, 6, -13, 6, 0); c.closePath(); }, '#1e140a', 0.7);
  F(() => { c.moveTo(-1, -h * 0.68); c.lineTo(0, -h * 0.9); c.lineTo(1, -h * 0.68); }, null, 0.6);
  // шест с вяленой рыбой
  c.strokeStyle = O; c.lineWidth = 1.6; c.beginPath(); c.moveTo(w / 2 + 4, 0); c.lineTo(w / 2 + 4, -24); c.stroke(); c.strokeStyle = '#8a6a42'; c.lineWidth = 0.8; c.stroke();
  for (let i = 0; i < 2; i++) F(() => { c.moveTo(w / 2 + 4, -21 + i * 6); c.quadraticCurveTo(w / 2 + 6, -17 + i * 6, w / 2 + 4.6, -14 + i * 6); c.lineTo(w / 2 + 3.4, -14.6 + i * 6); c.quadraticCurveTo(w / 2 + 3, -17 + i * 6, w / 2 + 4, -21 + i * 6); c.closePath(); }, '#9aa0a8', 0.4);
  for (let i = 0; i < 5; i++) { const x = -w / 2 + 2 + r() * (w - 4); F(() => { c.moveTo(x - 1.2, 0.4); c.quadraticCurveTo(x, -1.2, x + 1.2, 0.4); c.closePath(); }, '#f0e2d0', 0.3); }
}
export function shroomRing(g, R = 46, seed = 3) {
  c = g; const r = rng(seed);
  c.fillStyle = 'rgba(40,60,20,.35)'; c.beginPath(); c.ellipse(0, 0, R, R * 0.5, 0, 0, TAU); c.fill();
  const items = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + (r() - 0.5) * 0.1; items.push([Math.cos(a) * R, Math.sin(a) * R * 0.5, r()]); }
  items.sort((a, b) => a[1] - b[1]); for (const [x, y, q] of items) tinyShroom(x, y, q < 0.5 ? '#c8382a' : '#8a6a9a', 1.3 + q * 0.6);
}
export function web(g, w = 60, h = 50, seed = 2) {
  c = g; const cx = 0, cy = -h * 0.55;
  c.strokeStyle = 'rgba(240,240,240,.7)'; c.lineWidth = 0.4;
  const anchors = [[-w / 2, -h], [w / 2, -h * 0.95], [w / 2 + 2, -h * 0.3], [w / 3, 0], [-w / 3, 0], [-w / 2 - 2, -h * 0.35]];
  for (const [x, y] of anchors) { c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke(); }
  for (let k = 1; k <= 6; k++) { c.beginPath(); anchors.forEach(([x, y], i) => { const px = cx + (x - cx) * k / 7, py = cy + (y - cy) * k / 7; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath(); c.stroke(); }
  F(() => c.ellipse(w * 0.2, -h * 0.4, 2.4, 3.6, 0.3, 0, TAU), '#e8e0c8', 0.4); // кокон
}
export function snakeLair(g, seed = 4) {
  c = g; const r = rng(seed); shadow(46, 12);
  const rocks = []; for (let i = 0; i < 7; i++) rocks.push([(r() - 0.5) * 70, -2 + (r() - 0.5) * 14, 8 + r() * 10]); rocks.sort((a, b) => a[1] - b[1]);
  for (const [x, y, s] of rocks) { F(() => { c.moveTo(x - s, y); c.lineTo(x - s * 0.7, y - s * 0.8); c.lineTo(x + s * 0.2, y - s); c.lineTo(x + s, y - s * 0.4); c.lineTo(x + s * 0.9, y); c.closePath(); }, grad(y - s, y, '#7a766c', '#4a4640'), 0.7); c.fillStyle = 'rgba(110,154,66,.7)'; c.beginPath(); c.ellipse(x - s * 0.3, y - s * 0.8, s * 0.4, s * 0.14, 0, 0, TAU); c.fill(); }
  // кости и сброшенная кожа
  for (let i = 0; i < 4; i++) { const x = (r() - 0.5) * 60, y = 6 + r() * 6; c.save(); c.translate(x, y); c.rotate(r() * 3); F(() => { c.rect(-3, -0.5, 6, 1); c.moveTo(-3.5, 0); c.arc(-3.5, 0, 1, 0, TAU); c.moveTo(4.5, 0); c.arc(3.5, 0, 1, 0, TAU); }, '#ece4d0', 0.35); c.restore(); }
  c.strokeStyle = 'rgba(220,210,170,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, 10); c.bezierCurveTo(-15, 4, -10, 16, 6, 10); c.bezierCurveTo(16, 6, 22, 14, 30, 11); c.stroke(); c.strokeStyle = 'rgba(160,150,110,.6)'; c.lineWidth = 0.4; c.setLineDash([1, 1]); c.stroke(); c.setLineDash([]);
}

// ------------------------------------------------------------ железная жила (как медь и олово, но тёмная порода и ржавые прожилки)
export function ironVein(g, seed = 3) {
  c = g; const r = rng(seed + 11), w = 80, h = 52;
  shadow(w * 0.6, w * 0.16);
  const top = []; for (let k = 0; k < 9; k++) { const q = k / 8; top.push([-w / 2 + q * w, -h * Math.sin(Math.PI * Math.min(1, q * 1.08)) * (0.75 + r() * 0.35)]); }
  const body = () => { c.moveTo(-w / 2, 0); for (const p of top) c.lineTo(p[0], Math.min(0, p[1])); c.lineTo(w / 2, 0); c.quadraticCurveTo(0, w * 0.12, -w / 2, 0); c.closePath(); };
  F(body, grad(-h, 0, '#6e6a68', '#3e3a38'), 1.6);
  c.save(); c.beginPath(); body(); c.clip(); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w * 0.1, -h); c.lineTo(-w * 0.05, -h * 0.3); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(w * 0.05, -h); c.lineTo(w / 2, 0); c.lineTo(w * 0.1, w * 0.06); c.closePath(); c.fill();
  for (let i = 0; i < 3; i++) { let x = -w * 0.38 + i * w * 0.2, y = -h * (0.12 + r() * 0.2); const pts = [[x, y]]; for (let k = 0; k < 4; k++) { x += 7 + r() * 8; y -= 3 + r() * 7; pts.push([x, y]); }
    for (const [lw, col] of [[4.4, '#4a2010'], [2.8, '#a8502a'], [1, '#e8904a']]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); } }
  for (let i = 0; i < 5; i++) { const x = -w * 0.25 + r() * w * 0.5, y = -h * (0.12 + r() * 0.45), s = 2.4 + r() * 2.2; F(() => { c.moveTo(x - s, y); c.lineTo(x - s * 0.3, y - s); c.lineTo(x + s, y - s * 0.4); c.lineTo(x + s * 0.6, y + s * 0.7); c.closePath(); }, i % 2 ? '#b8c0c8' : '#8a929a', 1); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x - s * 0.4, y - s * 0.6, 1.4, 1.4); }
  c.restore();
  for (let i = 0; i < 5; i++) { const x = (r() - 0.5) * w * 1.1, y = 2 + r() * 6, s = 2.5 + r() * 3; F(() => c.ellipse(x, y, s, s * 0.7, 0, 0, TAU), '#5e5a56', 1); }
}

// ------------------------------------------------------------ туман: лёгкий везде, густые клочья местами
export function fog(g, x0, y0, w, h, t, dense = []) {
  c = g; const r = rng(9);
  for (let i = 0; i < 26; i++) { const x = x0 + ((r() * w + t * (6 + r() * 6)) % (w + 200)) - 100, y = y0 + r() * h, s = 60 + r() * 90; const gr = c.createRadialGradient(x, y, 4, x, y, s); gr.addColorStop(0, 'rgba(220,232,224,.16)'); gr.addColorStop(1, 'rgba(220,232,224,0)'); c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, s, s * 0.45, 0, 0, TAU); c.fill(); }
  for (const [x, y, R] of dense) for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * 0.1, xx = x + Math.cos(a) * R * 0.45, yy = y + Math.sin(a) * R * 0.2; const gr = c.createRadialGradient(xx, yy, 4, xx, yy, R * 0.7); gr.addColorStop(0, 'rgba(226,236,230,.42)'); gr.addColorStop(1, 'rgba(226,236,230,0)'); c.fillStyle = gr; c.beginPath(); c.ellipse(xx, yy, R * 0.7, R * 0.34, 0, 0, TAU); c.fill(); }
}

// ------------------------------------------------------------ тележка купца (колесо ≈ 0,65 роста, длина ≈ 2 роста)
export function cart(g, t = 0) {
  c = g; shadow(46, 9, -4);
  // оглобли
  for (const dy of [0, 2]) { c.strokeStyle = O; c.lineWidth = 2.2; c.beginPath(); c.moveTo(22, -14 + dy); c.lineTo(52, -4 + dy); c.stroke(); c.strokeStyle = '#8a6a42'; c.lineWidth = 1.2; c.stroke(); }
  // кузов
  F(() => c.rect(-40, -30, 64, 16), grad(-30, -14, '#9a7448', '#6a4a2c'), 0.9);
  c.strokeStyle = '#4a3220'; c.lineWidth = 0.6; for (let x = -32; x < 24; x += 8) { c.beginPath(); c.moveTo(x, -30); c.lineTo(x, -14); c.stroke(); }
  F(() => c.rect(-41, -31, 66, 2.4), '#5a3e26', 0.6);
  // тент на дугах
  const tent = () => { c.moveTo(-38, -31); c.bezierCurveTo(-38, -66, 22, -66, 22, -31); c.closePath(); };
  F(tent, grad(-64, -31, '#efe6d2', '#c8b898'), 0.9);
  c.save(); c.beginPath(); tent(); c.clip(); c.strokeStyle = 'rgba(120,90,60,.45)'; c.lineWidth = 1; for (const x of [-24, -8, 8]) { c.beginPath(); c.moveTo(x, -31); c.quadraticCurveTo(x * 0.9, -58, x * 0.8, -64); c.stroke(); } c.fillStyle = '#a8382a'; for (let x = -38; x < 22; x += 8) c.fillRect(x, -36, 4, 5); c.fillStyle = 'rgba(30,18,8,.16)'; c.fillRect(0, -70, 30, 40); c.restore();
  // товары у открытого бока
  F(() => c.ellipse(-30, -32, 5, 6, 0, 0, TAU), '#8a6a3a', 0.6); c.strokeStyle = '#5a3e26'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-34, -35); c.lineTo(-26, -35); c.moveTo(-34, -29); c.lineTo(-26, -29); c.stroke();
  F(() => c.rect(-20, -40, 12, 9), '#b8905a', 0.6); c.strokeStyle = '#6a4a2c'; c.lineWidth = 0.5; c.strokeRect(-20, -40, 12, 9);
  F(() => { c.moveTo(-4, -31); c.quadraticCurveTo(-6, -41, 0, -42); c.quadraticCurveTo(6, -41, 4, -31); c.closePath(); }, '#d8c8a0', 0.6);
  for (const [x, col] of [[10, '#c84a4a'], [14, '#4a8ac8'], [18, '#5fd35f']]) { F(() => c.roundRect(x - 1.4, -37, 2.8, 5, 1), col, 0.4); F(() => c.rect(x - 0.6, -38.6, 1.2, 1.6), '#8a6a42', 0.3); }
  // фонарь
  c.strokeStyle = O; c.lineWidth = 0.8; c.beginPath(); c.moveTo(22, -50); c.lineTo(28, -50); c.lineTo(28, -46); c.stroke();
  const pulse = 0.8 + 0.2 * Math.sin(t * 4); const gl = c.createRadialGradient(28, -42, 0.5, 28, -42, 14); gl.addColorStop(0, `rgba(255,200,110,${0.5 * pulse})`); gl.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = gl; c.beginPath(); c.arc(28, -42, 14, 0, TAU); c.fill();
  F(() => c.roundRect(25.6, -46, 4.8, 6, 1), '#ffd58a', 0.6);
  // колёса
  for (const [x, far] of [[-8, true], [-14, false]]) { const R = 13, y = -R; c.save(); c.translate(x, y); if (far) c.globalAlpha = 0.85;
    F(() => { c.arc(0, 0, R, 0, TAU); c.moveTo(R - 2.4, 0); c.arc(0, 0, R - 2.4, 0, TAU, true); }, far ? '#4a3220' : '#6a4a2c', 0.8);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.strokeStyle = O; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * (R - 2), Math.sin(a) * (R - 2)); c.stroke(); c.strokeStyle = far ? '#4a3220' : '#8a6a42'; c.lineWidth = 0.8; c.stroke(); }
    F(() => c.arc(0, 0, 2.2, 0, TAU), '#5a5a5a', 0.6); c.restore(); }
}
// прилавок рынка (новый): навес на столбах, стойка, товары; продавец стоит за стойкой
export function stallFront(g) {
  c = g; shadow(42, 8);
  for (const x of [-34, 34]) { c.strokeStyle = O; c.lineWidth = 3.4; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -54); c.stroke(); c.strokeStyle = '#7a5a36'; c.lineWidth = 2; c.stroke(); }
  F(() => c.rect(-36, -24, 72, 24), grad(-24, 0, '#a8804e', '#6a4a2c'), 0.9);
  c.strokeStyle = '#4a3220'; c.lineWidth = 0.6; for (let x = -28; x < 36; x += 9) { c.beginPath(); c.moveTo(x, -24); c.lineTo(x, 0); c.stroke(); }
  F(() => c.rect(-38, -26, 76, 3), '#5a3e26', 0.7);
}
export function stallTop(g) { // навес и товары — рисуются поверх продавца
  c = g;
  F(() => { c.moveTo(-40, -50); c.lineTo(40, -50); c.lineTo(36, -62); c.lineTo(-36, -62); c.closePath(); }, '#b8382a', 0.9);
  c.fillStyle = '#f0e6d0'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(-36 + i * 9, -62); c.lineTo(-31.5 + i * 9, -62); c.lineTo(-30 + i * 9, -50); c.lineTo(-35 + i * 9, -50); c.closePath(); c.fill(); }
  c.strokeStyle = O; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-40, -50); c.lineTo(40, -50); c.lineTo(36, -62); c.lineTo(-36, -62); c.closePath(); c.stroke();
  F(() => { for (let i = 0; i < 9; i++) { const x = -40 + i * 10; c.moveTo(x, -50); c.quadraticCurveTo(x + 5, -46, x + 10, -50); } }, '#b8382a', 0.7);
  // товар на стойке
  for (const [x, col] of [[-26, '#c84a4a'], [-21, '#4a8ac8'], [-16, '#5fd35f']]) { F(() => c.roundRect(x - 1.6, -32, 3.2, 6, 1.2), col, 0.4); F(() => c.rect(x - 0.6, -33.6, 1.2, 1.6), '#8a6a42', 0.3); }
  F(() => c.ellipse(0, -27, 7, 2.2, 0, 0, TAU), '#8a6a3a', 0.5); for (const [x, y] of [[-3, -29], [0, -30], [3, -29], [-1.4, -31.6], [1.6, -31.4]]) F(() => c.arc(x, y, 1.6, 0, TAU), '#d8402a', 0.35);
  F(() => c.rect(12, -33, 14, 7), '#c8a060', 0.5); c.strokeStyle = '#e7c35a'; c.lineWidth = 0.6; c.beginPath(); c.arc(19, -29.4, 2.2, 0, TAU); c.stroke();
}
