// v79: сцена экрана входа «Континент» — панорама: небо, луна и облака, горы, море, храм на холме, лес, поляна с костром.
// Неподвижное рисуется один раз в запас (по размеру экрана), живое — облака, звёзды, светлячки, огонь — каждый кадр.
import { rng } from '../engine/util.js';
const TAU = Math.PI * 2;
let BG = null;   // { cv, W, H }

function mountains(c, W, H, y0, amp, col, seed, step = 60, snow = null) {
  const r = rng(seed); c.fillStyle = col; c.beginPath(); c.moveTo(-10, H);
  let y = y0; const pts = [];
  for (let x = -10; x <= W + step; x += step) { y = y0 - amp * (0.45 + 0.55 * Math.abs(Math.sin(x * 0.0031 * (1 + seed * 0.07) + seed))) - r() * amp * 0.25; pts.push([x, y]); c.lineTo(x, y); }
  c.lineTo(W + 10, H); c.closePath(); c.fill();
  if (snow) { c.fillStyle = snow; for (const [x, y] of pts) if (y < y0 - amp * 0.72) { c.beginPath(); c.moveTo(x - step * 0.35, y + amp * 0.12); c.lineTo(x, y); c.lineTo(x + step * 0.4, y + amp * 0.14); c.lineTo(x + step * 0.1, y + amp * 0.1); c.lineTo(x - step * 0.1, y + amp * 0.2); c.closePath(); c.fill(); } }
}
function pine(c, x, y, h, col, dark) {
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h);
  for (let k = 0; k < 4; k++) { const yy = y - h + h * (k + 1) / 4; c.lineTo(x + h * 0.17 + k * h * 0.05, yy); c.lineTo(x + h * 0.06, yy - h * 0.04); }
  c.lineTo(x + h * 0.03, y); c.lineTo(x - h * 0.03, y);
  for (let k = 3; k >= 0; k--) { const yy = y - h + h * (k + 1) / 4; c.lineTo(x - h * 0.06, yy - h * 0.04); c.lineTo(x - h * 0.17 - k * h * 0.05, yy); }
  c.closePath(); c.fill();
  if (dark) { c.fillStyle = dark; c.beginPath(); c.moveTo(x, y - h); for (let k = 0; k < 4; k++) { const yy = y - h + h * (k + 1) / 4; c.lineTo(x + h * 0.17 + k * h * 0.05, yy); c.lineTo(x + h * 0.06, yy - h * 0.04); } c.lineTo(x + h * 0.03, y); c.lineTo(x, y); c.closePath(); c.fill(); }
}
function temple(c, x, y, s) {   // силуэт храма на холме: ступени, колонны, фронтон
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#18202e'; c.beginPath(); c.moveTo(-140, 0); c.quadraticCurveTo(-70, -36, 0, -38); c.quadraticCurveTo(70, -36, 140, 0); c.closePath(); c.fill();
  c.fillStyle = '#222c3c'; c.fillRect(-58, -46, 116, 12); c.fillRect(-50, -52, 100, 6);   // ступени
  c.fillStyle = '#2c3a4e'; for (let i = -3; i <= 3; i++) { c.fillRect(i * 15 - 3.5, -86, 7, 34); c.fillRect(i * 15 - 5, -88, 10, 3); }
  c.fillStyle = '#34445a'; c.fillRect(-54, -92, 108, 5); c.beginPath(); c.moveTo(-56, -92); c.lineTo(0, -112); c.lineTo(56, -92); c.closePath(); c.fill();
  c.fillStyle = '#1e2838'; c.beginPath(); c.moveTo(-46, -92); c.lineTo(0, -108); c.lineTo(46, -92); c.closePath(); c.fill();
  const gl = c.createRadialGradient(0, -68, 2, 0, -68, 40); gl.addColorStop(0, 'rgba(120,220,160,.5)'); gl.addColorStop(1, 'rgba(120,220,160,0)'); c.fillStyle = gl; c.fillRect(-40, -108, 80, 60);
  c.fillStyle = 'rgba(160,240,190,.7)'; c.fillRect(-6, -78, 12, 26);
  c.restore();
}
function build(W, H) {
  const cv = document.createElement('canvas'), d = Math.min(2, devicePixelRatio || 1); cv.width = W * d; cv.height = H * d;
  const c = cv.getContext('2d'); c.scale(d, d);
  // небо: закатное внизу, ночь вверху
  const sky = c.createLinearGradient(0, 0, 0, H * 0.62); sky.addColorStop(0, '#070a18'); sky.addColorStop(0.45, '#152044'); sky.addColorStop(0.8, '#3a3458'); sky.addColorStop(1, '#8a5a48'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  // луна с ореолом и дорожка на море
  const mx = W * 0.64, my = H * 0.19, R = Math.min(W, H) * 0.052;
  const mg = c.createRadialGradient(mx, my, R, mx, my, R * 4.5); mg.addColorStop(0, 'rgba(255,240,200,.35)'); mg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = mg; c.fillRect(mx - R * 5, my - R * 5, R * 10, R * 10);
  const mo = c.createRadialGradient(mx - R * 0.3, my - R * 0.3, R * 0.2, mx, my, R); mo.addColorStop(0, '#fff8e0'); mo.addColorStop(1, '#e8d8a8'); c.fillStyle = mo; c.beginPath(); c.arc(mx, my, R, 0, TAU); c.fill();
  c.fillStyle = 'rgba(180,160,120,.35)'; for (const [dx, dy, rr] of [[-0.3, 0.1, 0.22], [0.25, -0.25, 0.16], [0.15, 0.35, 0.12]]) { c.beginPath(); c.arc(mx + dx * R, my + dy * R, rr * R, 0, TAU); c.fill(); }
  // дальние горы — три слоя, снег на вершинах
  mountains(c, W, H, H * 0.52, H * 0.16, '#1c2440', 3, 70, 'rgba(220,230,255,.35)');
  mountains(c, W, H, H * 0.56, H * 0.12, '#222c48', 5, 52);
  // море справа: горизонт, дорожка луны
  c.fillStyle = '#1a2a46'; c.fillRect(W * 0.55, H * 0.555, W * 0.5, H * 0.1);
  const sea = c.createLinearGradient(0, H * 0.555, 0, H * 0.66); sea.addColorStop(0, '#2a4a6a'); sea.addColorStop(1, '#16283e'); c.fillStyle = sea; c.fillRect(W * 0.55, H * 0.555, W * 0.5, H * 0.11);
  const r = rng(21); c.fillStyle = 'rgba(255,240,200,.35)'; for (let i = 0; i < 40; i++) { const yy = H * 0.56 + r() * H * 0.1, ww = 6 + r() * 30 * (yy - H * 0.55) / (H * 0.1); c.fillRect(mx - ww / 2 + (r() - 0.5) * 60 * (yy - H * 0.55) / (H * 0.1), yy, ww, 1.2); }
  // ближние холмы с храмом слева и лесом
  mountains(c, W, H, H * 0.64, H * 0.1, '#141c2c', 7, 46);
  temple(c, W * 0.47, H * 0.63, Math.min(W, H) / 900 * 2.0);
  const r2 = rng(11);
  for (let i = 0; i < 70; i++) { const x = r2() * W, y = H * 0.66 + r2() * 26, h = 60 + r2() * 60; if (x > W * 0.36 && x < W * 0.58) continue; pine(c, x, y, h, '#101828', '#0a1020'); }
  for (let i = 0; i < 34; i++) { const x = r2() * W; if (x > W * 0.28 && x < W * 0.74) continue; pine(c, x, H * 0.78 + r2() * 50, 170 + r2() * 140, '#0c1218', '#070b10'); }
  // поляна: тёплая земля у костра, трава по краям
  const gr = c.createRadialGradient(W / 2, H * 0.86, 30, W / 2, H * 0.86, W * 0.5); gr.addColorStop(0, '#4a3a22'); gr.addColorStop(0.35, '#2a3018'); gr.addColorStop(0.7, '#141a10'); gr.addColorStop(1, '#0a0c08');
  c.fillStyle = gr; c.beginPath(); c.ellipse(W / 2, H * 0.9, W * 0.6, H * 0.24, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(90,120,50,.35)'; for (let i = 0; i < 160; i++) { const x = W * 0.1 + r2() * W * 0.8, y = H * 0.74 + r2() * H * 0.24, h = 4 + r2() * 8; c.beginPath(); c.moveTo(x - 2, y); c.lineTo(x + (r2() - 0.5) * 4, y - h); c.lineTo(x + 2, y); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(120,110,90,.5)'; for (let i = 0; i < 20; i++) { c.beginPath(); c.ellipse(W * 0.15 + r2() * W * 0.7, H * 0.8 + r2() * H * 0.16, 3 + r2() * 6, 2 + r2() * 3, 0, 0, TAU); c.fill(); }
  return { cv, W, H };
}
/** Неподвижная часть сцены (из запаса) + живое. */
export function scene(c, W, H, t) {
  if (!BG || BG.W !== W || BG.H !== H) BG = build(W, H);
  c.drawImage(BG.cv, 0, 0, W, H);
  // звёзды мерцают
  const r = rng(7); c.fillStyle = '#fff';
  for (let i = 0; i < 140; i++) { const x = r() * W, y = r() * H * 0.42, s = r(); c.globalAlpha = (0.3 + s * 0.6) * (0.7 + 0.3 * Math.sin(t * (0.6 + s) + i)); c.beginPath(); c.arc(x, y, s * 1.3 + 0.3, 0, TAU); c.fill(); }
  c.globalAlpha = 1;
  // облака плывут перед луной
  const r3 = rng(13);
  for (let i = 0; i < 6; i++) { const sp = 6 + r3() * 8, y = H * (0.1 + r3() * 0.22), w = 120 + r3() * 160, x = ((r3() * W + t * sp) % (W + w * 2)) - w; const a = 0.1 + r3() * 0.12;
    c.fillStyle = `rgba(220,215,235,${a})`; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + k * w / 5 + w / 10, y + Math.sin(k * 1.7) * 6, w / 6 + 10, 10 + (k % 2) * 6, 0, 0, TAU); c.fill(); } }
  // светлячки над поляной
  const r4 = rng(17);
  for (let i = 0; i < 18; i++) { const sp = 0.3 + r4() * 0.6, x0 = W * 0.1 + r4() * W * 0.8, y0 = H * 0.68 + r4() * H * 0.22, x = x0 + Math.sin(t * sp + i) * 30, y = y0 + Math.cos(t * sp * 0.7 + i * 2) * 14, a = 0.4 + 0.6 * Math.max(0, Math.sin(t * (1 + sp) + i * 3));
    c.fillStyle = `rgba(200,255,140,${a * 0.9})`; c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill(); c.fillStyle = `rgba(200,255,140,${a * 0.25})`; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
  // свет костра на поляне
  const fl = 0.5 + 0.05 * Math.sin(t * 7) + 0.03 * Math.sin(t * 13), fg = c.createRadialGradient(W / 2, H * 0.78, 10, W / 2, H * 0.78, Math.min(W, H) * 0.55);
  fg.addColorStop(0, `rgba(255,170,70,${fl})`); fg.addColorStop(0.4, 'rgba(255,120,40,.16)'); fg.addColorStop(1, 'rgba(255,100,30,0)');
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = fg; c.beginPath(); c.arc(W / 2, H * 0.78, Math.min(W, H) * 0.55, 0, TAU); c.fill(); c.restore();
}
/** Костёр: камни, поленья, угли, пламя слоями, искры, дым. */
export function campfire(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const r = rng(9);
  const stone = (a, front) => { const px = Math.cos(a) * 19, py = Math.sin(a) * 8 + 2, sw = 4.5 + r() * 2, sh = 3 + r(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(px + 1, py + 1.5, sw + 1, sh * 0.6, 0, 0, TAU); c.fill(); c.fillStyle = front ? '#6e6a62' : '#55524c'; c.strokeStyle = '#1e1a16'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(px, py, sw, sh, a * 0.3, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(px - sw * 0.3, py - sh * 0.35, sw * 0.4, sh * 0.3, 0, 0, TAU); c.fill(); if (front) { c.fillStyle = 'rgba(255,170,90,.3)'; c.beginPath(); c.ellipse(px, py - sh * 0.4, sw * 0.6, sh * 0.3, 0, 0, TAU); c.fill(); } };
  for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + 0.2; if (Math.sin(a) < 0) stone(a, false); }
  c.fillStyle = '#3a1a0a'; c.beginPath(); c.ellipse(0, 1, 13, 5, 0, 0, TAU); c.fill();
  for (let i = 0; i < 8; i++) { const pul = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7); c.fillStyle = `rgba(255,${90 + pul * 90 | 0},20,${0.6 + pul * 0.4})`; c.beginPath(); c.arc((r() - 0.5) * 18, (r() - 0.5) * 5, 1.2 + r(), 0, TAU); c.fill(); }
  for (const [a, dx, dy] of [[-0.35, -3, 0], [0.45, 2, -2]]) { c.save(); c.translate(dx, dy); c.rotate(a); c.fillStyle = '#4a3222'; c.strokeStyle = '#1e1a16'; c.lineWidth = 0.8; c.beginPath(); c.roundRect(-15, -3, 30, 6, 3); c.fill(); c.stroke(); c.fillStyle = '#5c3e2a'; c.fillRect(-14, -2.5, 28, 1.8); c.fillStyle = '#c8a070'; c.beginPath(); c.ellipse(15, 0, 2.4, 3, 0, 0, TAU); c.fill(); c.strokeStyle = '#8a6a40'; c.lineWidth = 0.5; c.beginPath(); c.ellipse(15, 0, 1.2, 1.6, 0, 0, TAU); c.stroke(); c.restore(); }
  for (const sx of [-1, 1]) { c.save(); c.translate(sx * 6, -4); c.rotate(sx * 0.5); c.fillStyle = '#3e2a1c'; c.strokeStyle = '#1e1a16'; c.lineWidth = 0.8; c.beginPath(); c.roundRect(-2.5, -16, 5, 18, 2); c.fill(); c.stroke(); c.restore(); }
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 6, ph = t * 9 + i * 2.1, f = Math.sin(ph) * 3, f2 = Math.cos(ph * 0.7) * 2, Hh = (26 + Math.sin(ph * 1.3) * 5) * (i === 1 ? 1.25 : 0.85), w = 8;
    for (const [col, kk] of [['#ff6a14', 1], ['#ffa83a', 0.68], ['#fff2b8', 0.36]]) { c.fillStyle = col; c.beginPath(); c.moveTo(ox - w * kk, -2); c.quadraticCurveTo(ox - w * kk * 0.5 + f * kk, -2 - Hh * kk * 0.55, ox + f2 * kk, -2 - Hh * kk); c.quadraticCurveTo(ox + w * kk * 0.5 - f * kk * 0.4, -2 - Hh * kk * 0.5, ox + w * kk, -2); c.closePath(); c.fill(); }
  }
  for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + 0.2; if (Math.sin(a) >= 0) stone(a, true); }
  const r5 = rng(5); for (let i = 0; i < 8; i++) { const sp = 0.6 + r5() * 0.8, ph = ((t * sp + r5() * 10) % 1.4) / 1.4, px = (r5() - 0.5) * 18 + Math.sin(ph * 9 + i) * 5, py = -20 - ph * 60; c.fillStyle = `rgba(255,${180 - ph * 120 | 0},60,${(1 - ph) * 0.9})`; c.fillRect(px, py, 1.5, 1.5); }
  for (let i = 0; i < 3; i++) { const ph = ((t * 0.3 + i * 0.33) % 1), R = 7 + ph * 16; c.fillStyle = `rgba(80,76,72,${0.2 * (1 - ph)})`; c.beginPath(); c.arc(Math.sin(ph * 4 + i) * 8 + 5, -34 - ph * 70, R, 0, TAU); c.fill(); }
  c.restore();
}
/** Заголовок объёмными золотыми буквами: тёмная обводка, тень, фаска, блик. */
export function title(c, text, x, y, size) {
  c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = `bold ${size}px Georgia, 'Times New Roman', serif`; c.lineJoin = 'round';
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = size * 0.25; c.shadowOffsetY = size * 0.08;
  c.lineWidth = size * 0.18; c.strokeStyle = '#2a1608'; c.strokeText(text, x, y);
  c.shadowColor = 'transparent';
  c.lineWidth = size * 0.1; c.strokeStyle = '#7a4a14'; c.strokeText(text, x, y + size * 0.03);
  const g = c.createLinearGradient(0, y - size * 0.75, 0, y + size * 0.05); g.addColorStop(0, '#fff2b0'); g.addColorStop(0.42, '#f3c84e'); g.addColorStop(0.5, '#a86a18'); g.addColorStop(0.58, '#e8b43a'); g.addColorStop(1, '#8a5210');
  c.fillStyle = g; c.fillText(text, x, y);
  c.save(); c.beginPath(); c.rect(x - size * 6, y - size * 0.8, size * 12, size * 0.36); c.clip(); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillText(text, x, y); c.restore();
  c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,240,190,.45)'; c.strokeText(text, x, y - 1);
  c.restore();
}
