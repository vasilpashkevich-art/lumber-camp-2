// Проба low-poly: башня чар, изба, телега с бочками, ёлки, камни, грибы, котёл; герой для масштаба (рост ≈ 62).
import { P, face, shade, shadow, box, cyl, cone, blockCyl, glowWin, smoke } from '../../../src/art/lowpoly.js';
import { person } from '../../../src/art/body.js';
import { starterLook } from '../../../src/systems/items.js';
const STONE = '#b4b7c0', WOOD = '#a06a3c', WOOD2 = '#7a4e2a', PLASTER = '#ece4d0', HAT = '#4a4470', GREEN = '#5e9a4a', GREEN2 = '#3f7a35', ROCK = '#8f8a84';
const H = 62; // рост героя

/** Башня чар ≈ 6 ростов: камень кладкой, деревянное кольцо, фахверковый ярус, шляпа-крыша с полями, окошко на шляпе, труба, подзорная труба. */
function wizardTower(g) {
  const R = 54, h1 = 2.1 * H, h2 = 1.3 * H;
  shadow(g, 14, 10, 96, 30, 0.28);
  blockCyl(g, R, h1, STONE, 11, 9, 0, 0, 0, 3);
  // дверь 1,3 роста в каменной арке на лице (y = −R)
  const dw = 34, dh = 1.3 * H;
  const A = (x, z) => P(x, -R, z);
  const arc = (w, hh, col) => { g.fillStyle = col; g.beginPath(); const b0 = A(-w / 2, 0), b1 = A(w / 2, 0), t = A(0, hh - w / 2); g.moveTo(b0[0], b0[1]); g.lineTo(b0[0], t[1]); g.arc(t[0], t[1], w / 2, Math.PI, 0); g.lineTo(b1[0], b1[1]); g.closePath(); g.fill(); };
  arc(dw + 16, dh + 8, shade(STONE, 0.4)); arc(dw, dh, '#5a3a22');
  const kn = A(8, dh * 0.45); g.fillStyle = '#e8c14a'; g.beginPath(); g.arc(kn[0], kn[1], 2.4, 0, 7); g.fill();
  const w1 = A(-22, h1 * 0.62); glowWin(g, w1[0], w1[1], 16, 28);
  const w1b = P(30, -R * 0.82, h1 * 0.62); glowWin(g, w1b[0], w1b[1], 14, 26);
  // кольцо-карниз
  cyl(g, R * 1.1, 9, WOOD2, 11, 0, 0, h1, true);
  // ярус 2: штукатурка с балками
  const z2 = h1 + 9, R2 = R * 0.95;
  cyl(g, R2, h2, PLASTER, 11, 0, 0, z2, false);
  for (let i = 0; i <= 11; i++) { const a = i / 11 * Math.PI, x = Math.cos(a) * (R2 + 1), y = -Math.sin(a) * (R2 + 1); const f = 0.58 - Math.cos(a) * 0.3; face(g, [P(x - 3, y, z2), P(x + 3, y, z2), P(x + 3, y, z2 + h2), P(x - 3, y, z2 + h2)], WOOD2, f); }
  for (let i = 0; i < 11; i += 2) { const a0 = i / 11 * Math.PI, a1 = (i + 1) / 11 * Math.PI, x0 = Math.cos(a0) * (R2 + 1), y0 = -Math.sin(a0) * (R2 + 1), x1 = Math.cos(a1) * (R2 + 1), y1 = -Math.sin(a1) * (R2 + 1); const f = 0.58 - Math.cos((a0 + a1) / 2) * 0.3; face(g, [P(x0, y0, z2 + 6), P(x1, y1, z2 + h2 - 6), P(x1, y1, z2 + h2 - 12), P(x0, y0, z2 + 12)], WOOD2, f); }
  const w2 = P(0, -R2 - 1, z2 + h2 * 0.55); glowWin(g, w2[0], w2[1], 16, 26);
  const w3 = P(-38, -R2 * 0.72, z2 + h2 * 0.55); glowWin(g, w3[0], w3[1], 13, 22);
  // кольцо под шляпой и поля
  const z3 = z2 + h2; cyl(g, R2 * 1.06, 7, WOOD2, 11, 0, 0, z3, true);
  cone(g, R * 1.5, 22, HAT, 11, 0, 0, z3 + 7, 0, true);
  cone(g, R * 1.0, 2.6 * H, HAT, 9, 0, 0, z3 + 16, 34);
  // слуховое окошко на шляпе
  const dz = z3 + 16 + 40, dx = 14, dyy = -R * 0.62;
  face(g, [P(dx - 11, dyy, dz), P(dx + 11, dyy, dz), P(dx + 11, dyy, dz + 24), P(dx - 11, dyy, dz + 24)], WOOD, 'front'); face(g, [P(dx + 11, dyy, dz), P(dx + 22, dyy + 14, dz + 2), P(dx + 22, dyy + 14, dz + 22), P(dx + 11, dyy, dz + 24)], WOOD, 'right'); face(g, [P(dx - 15, dyy - 2, dz + 24), P(dx + 15, dyy - 2, dz + 24), P(dx, dyy - 2, dz + 42)], HAT, 0.5);
  const w4 = P(dx, dyy - 1, dz + 3); glowWin(g, w4[0], w4[1], 12, 16, false);
  // флажок на кончике шляпы и ступень у двери
  const tipP = P(34, 0, z3 + 16 + 2.6 * H); g.fillStyle = WOOD2; g.fillRect(tipP[0] - 1, tipP[1] - 22, 2, 24); face(g, [[tipP[0] + 1, tipP[1] - 22], [tipP[0] + 22, tipP[1] - 16], [tipP[0] + 1, tipP[1] - 9]], '#d8b040', 0.9);
  const st = A(0, 0); face(g, [[st[0] - 26, st[1] + 2], [st[0] + 26, st[1] + 2], [st[0] + 24, st[1] + 8], [st[0] - 24, st[1] + 8]], STONE, 0.5); face(g, [[st[0] - 26, st[1] - 2], [st[0] + 26, st[1] - 2], [st[0] + 26, st[1] + 2], [st[0] - 26, st[1] + 2]], STONE, 'top');
  // труба слева с дымом
  box(g, 14, 14, 46, STONE, -46, -6, z3 + 30); const sm = P(-46, -6, z3 + 76); smoke(g, sm[0], sm[1]);
  // подзорная труба справа, на штативе
  const tp = P(44, -26, z3 + 16 + 86); g.fillStyle = WOOD2; g.fillRect(tp[0] - 2, tp[1], 4, 28); g.fillRect(tp[0] - 11, tp[1] + 26, 22, 3);
  g.save(); g.translate(tp[0], tp[1]); g.rotate(-0.55); g.fillStyle = WOOD2; g.fillRect(-6, -4, 40, 8); g.fillStyle = '#e8c14a'; g.fillRect(30, -6, 10, 12); g.fillStyle = '#5a3a1a'; g.fillRect(-9, -3, 5, 6); g.restore();
}
/** Изба: стена 1,6 роста, с крышей 2,8; брёвна, двускатная гранёная крыша, дверь 1,2 роста, окно со светом, труба. */
function hut(g) {
  const w = 150, d = 110, h = 1.6 * H; shadow(g, 20, 10, 100, 28);
  box(g, w, d, h, WOOD);
  for (let z = 10; z < h; z += 14) { face(g, [P(-w / 2, 0, z), P(w / 2, 0, z), P(w / 2, 0, z + 3.5), P(-w / 2, 0, z + 3.5)], WOOD2, 0.5); face(g, [P(w / 2, 0, z), P(w / 2, d, z), P(w / 2, d, z + 3.5), P(w / 2, 0, z + 3.5)], WOOD2, 0.3); }
  const rh = 1.2 * H, e = 14;
  face(g, [P(w / 2, 0, h), P(w / 2, d, h), P(w / 2, d / 2, h + rh)], WOOD2, 0.3);
  face(g, [P(-w / 2 - e, d + e * 0.6, h - 4), P(w / 2 + e, d + e * 0.6, h - 4), P(w / 2 + e, d / 2, h + rh), P(-w / 2 - e, d / 2, h + rh)], '#8a4a3a', 0.4);
  face(g, [P(-w / 2 - e, -e * 0.6, h - 4), P(w / 2 + e, -e * 0.6, h - 4), P(w / 2 + e, d / 2, h + rh), P(-w / 2 - e, d / 2, h + rh)], '#b45a44', 0.72);
  for (let i = 1; i < 5; i++) { const t = i / 5; face(g, [P(-w / 2 - e + (w + 2 * e) * t - 1, -e * 0.6 + (d / 2 + e * 0.6) * 0, h - 4), P(-w / 2 - e + (w + 2 * e) * t + 1, -e * 0.6, h - 4), P(-w / 2 - e + (w + 2 * e) * t + 1, d / 2, h + rh), P(-w / 2 - e + (w + 2 * e) * t - 1, d / 2, h + rh)], '#8a4a3a', 0.6); }
  box(g, 14, 14, 30, STONE, w * 0.25, d * 0.6, h + 28); const sm = P(w * 0.25, d * 0.6, h + 58); smoke(g, sm[0], sm[1], 0.9);
  const dh = 1.2 * H, dr = P(-34, 0, 0); g.fillStyle = shade(WOOD2, 0.45); g.fillRect(dr[0] - 15, dr[1] - dh - 4, 30, dh + 4); g.fillStyle = '#4a2e1a'; g.fillRect(dr[0] - 12, dr[1] - dh, 24, dh); g.fillStyle = '#e8c14a'; g.fillRect(dr[0] + 6, dr[1] - dh * 0.5, 3, 3);
  const wn = P(34, 0, 36); glowWin(g, wn[0], wn[1], 22, 22, false);
  const st = P(-34, -6, 0); face(g, [[st[0] - 20, st[1]], [st[0] + 20, st[1]], [st[0] + 20, st[1] + 5], [st[0] - 20, st[1] + 5]], STONE, 'front');
}
/** Телега с бочками: по грудь герою, кузов, восьмиугольные колёса, оглобли. */
function cart(g) {
  shadow(g, 10, 6, 64, 15);
  const wheel = (x, y, r = 16) => { const c = P(x, y, r); g.fillStyle = shade(WOOD2, 0.5); g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r); } g.closePath(); g.fill(); g.fillStyle = shade(WOOD, 0.75); g.beginPath(); g.arc(c[0], c[1], 4, 0, 7); g.fill(); g.strokeStyle = shade(WOOD, 0.75); g.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI; g.beginPath(); g.moveTo(c[0] - Math.cos(a) * r * 0.8, c[1] - Math.sin(a) * r * 0.8); g.lineTo(c[0] + Math.cos(a) * r * 0.8, c[1] + Math.sin(a) * r * 0.8); g.stroke(); } };
  wheel(-30, 44); wheel(30, 44);
  box(g, 86, 46, 26, WOOD, 0, 0, 20);
  for (let z = 26; z < 46; z += 8) face(g, [P(-43, 0, z), P(43, 0, z), P(43, 0, z + 2), P(-43, 0, z + 2)], WOOD2, 0.5);
  wheel(-30, 0); wheel(30, 0);
  const sh = P(43, 12, 26), sh2 = P(84, 12, 20); g.strokeStyle = shade(WOOD2, 0.5); g.lineWidth = 5; g.beginPath(); g.moveTo(sh[0], sh[1]); g.lineTo(sh2[0], sh2[1]); g.stroke();
  barrel(g, -18, 18, 46); barrel(g, 16, 14, 46); sack(g, 30, 36, 46);
}
function barrel(g, x, y, z) { cyl(g, 13, 30, '#9a6a3c', 7, x, y, z, true); for (const dz of [7, 21]) for (let i = 0; i < 7; i++) { const a0 = i / 7 * Math.PI, a1 = (i + 1) / 7 * Math.PI; const x0 = Math.cos(a0) * 13.5, y0 = -Math.sin(a0) * 13.5, x1 = Math.cos(a1) * 13.5, y1 = -Math.sin(a1) * 13.5; face(g, [P(x + x0, y + y0, z + dz), P(x + x1, y + y1, z + dz), P(x + x1, y + y1, z + dz + 3), P(x + x0, y + y0, z + dz + 3)], '#5a5a60', 0.58 - Math.cos((a0 + a1) / 2) * 0.3); } }
function sack(g, x, y, z) { const c = P(x, y, z); face(g, [[c[0] - 12, c[1]], [c[0] + 12, c[1]], [c[0] + 10, c[1] - 16], [c[0] + 4, c[1] - 22], [c[0] - 6, c[1] - 21], [c[0] - 11, c[1] - 14]], '#d8c89a', 'front'); face(g, [[c[0] + 10, c[1] - 16], [c[0] + 4, c[1] - 22], [c[0] - 6, c[1] - 21], [c[0] - 2, c[1] - 15]], '#d8c89a', 'top'); }
/** Ёлка ≈ 3 роста: три гранёных конуса и ствол, свет слева. */
function pine(g, s = 1) { g.save(); g.scale(s, s); shadow(g, 8, 6, 40, 12); cyl(g, 6, 24, WOOD2, 6, 0, 0, 0, false); cone(g, 42, 60, GREEN2, 7, 0, 0, 18); cone(g, 33, 56, GREEN, 7, 0, 0, 52); cone(g, 23, 50, GREEN, 7, 0, 0, 88); g.restore(); }
/** Камень по колено: несколько граней. */
function rock(g, s = 1) { g.save(); g.scale(s, s); shadow(g, 4, 3, 24, 7); face(g, [[-22, 0], [-16, -14], [-2, -22], [14, -17], [22, -5], [18, 2], [-8, 4]], ROCK, 'front'); face(g, [[-16, -14], [-2, -22], [0, -11], [-10, -7]], ROCK, 'top'); face(g, [[14, -17], [22, -5], [9, -6], [0, -11]], ROCK, 'right'); face(g, [[-2, -22], [14, -17], [0, -11]], ROCK, 0.92); g.restore(); }
function mushroom(g, s = 1) { g.save(); g.scale(s, s); shadow(g, 2, 2, 9, 3); face(g, [[-3.5, 0], [3.5, 0], [3.5, -11], [-3.5, -11]], '#e8dcc4', 'front'); face(g, [[-11, -10], [11, -10], [8, -18], [0, -21], [-8, -18]], '#d84a4a', 'top'); face(g, [[-11, -10], [11, -10], [0, -7]], '#b83a3a', 0.4); g.fillStyle = '#fff'; g.beginPath(); g.arc(-3, -15, 1.8, 0, 7); g.arc(4, -13, 1.3, 0, 7); g.fill(); g.restore(); }
function cauldron(g) { shadow(g, 3, 3, 20, 7); cyl(g, 16, 22, '#3a3a44', 8, 0, 0, 5, false); const c = P(0, 0, 27); g.fillStyle = '#7ad06a'; g.beginPath(); g.ellipse(c[0], c[1], 16, 8, 0, 0, 7); g.fill(); for (const dx of [-12, 0, 12]) { g.strokeStyle = '#2a2a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(dx, 4); g.lineTo(dx * 0.3, -14); g.stroke(); } face(g, [[-8, 6], [-3, -5], [0, 2], [4, -7], [8, 6]], '#ffb040', 1); face(g, [[-4, 6], [-1, 0], [3, 6]], '#ffe080', 1); const b = P(0, 0, 31); for (const [bx, by, r] of [[-5, -4, 2.2], [4, -7, 1.6], [0, -12, 1.2]]) { g.fillStyle = '#b8f0a0'; g.beginPath(); g.arc(b[0] + bx, b[1] + by, r, 0, 7); g.fill(); } }
function fence(g, n = 5) { for (let i = 0; i < n; i++) { const x = i * 22; shadow(g, x + 2, 2, 5, 2, 0.15); face(g, [[x - 3, 0], [x + 3, 0], [x + 3, -30], [x, -35], [x - 3, -30]], WOOD, 'front'); } face(g, [[-3, -12], [(n - 1) * 22 + 3, -12], [(n - 1) * 22 + 3, -8], [-3, -8]], WOOD2, 0.5); face(g, [[-3, -26], [(n - 1) * 22 + 3, -26], [(n - 1) * 22 + 3, -22], [-3, -22]], WOOD2, 0.5); }

export function draw(cv) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  const bg = g.createLinearGradient(0, 0, 0, cv.height); bg.addColorStop(0, '#a9c8e6'); bg.addColorStop(0.5, '#8fb45a'); bg.addColorStop(1, '#6f9a44'); g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#86b650'; g.beginPath(); g.moveTo(40, 500); g.lineTo(300, 370); g.lineTo(700, 350); g.lineTo(1040, 410); g.lineTo(1100, 560); g.lineTo(900, 660); g.lineTo(300, 670); g.lineTo(60, 610); g.closePath(); g.fill();
  g.fillStyle = '#98c25c'; g.beginPath(); g.moveTo(380, 640); g.lineTo(470, 600); g.lineTo(780, 610); g.lineTo(820, 650); g.lineTo(700, 700); g.lineTo(420, 690); g.closePath(); g.fill();
  const at = (x, y, f, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); f(g); g.restore(); };
  at(130, 480, g => pine(g, 1.25)); at(215, 530, g => pine(g, 1.0)); at(905, 455, g => pine(g, 1.2)); at(990, 545, g => pine(g, 0.95)); at(1050, 500, g => pine(g, 0.8));
  at(430, 590, wizardTower);
  at(780, 580, hut);
  at(560, 655, g => rock(g, 1.1)); at(600, 668, g => rock(g, 0.7));
  at(640, 655, cart);
  at(300, 650, g => rock(g, 1.3)); at(345, 665, g => rock(g, 0.8)); at(880, 640, g => rock(g, 1.1));
  at(560, 600, g => mushroom(g, 1.4)); at(585, 612, g => mushroom(g, 1)); at(950, 610, g => mushroom(g, 1.2)); at(975, 600, g => mushroom(g, 0.9));
  at(260, 610, cauldron);
  at(840, 690, g => fence(g, 6));
  g.save(); g.translate(500, 675); g.scale(1.45, 1.45); person(g, starterLook('warrior'), 'front', {}); g.restore();
  g.font = 'bold 15px Georgia'; g.fillStyle = '#2a2a30'; g.textAlign = 'center'; for (const [t, x, y] of [['Мастерская чар', 430, 120], ['Изба', 780, 350], ['Телега', 640, 700], ['Котёл', 260, 650], ['Герой', 500, 700]]) g.fillText(t, x, y);
}
