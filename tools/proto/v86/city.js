// Эскиз v86: новая квадратная Столица целиком, вид как в игре, мягкий облик.
import { CITY, STREETS, cityGround, wallFace, wallTop, wallSide, tower, gatehouse, CITY_BUILDINGS, drawBuilding, drawYardItem, CITY_DECOR } from '../../../src/art/city.js';
import { castle, terrace, stairs, fountain, brazierFire, lamp } from '../../../src/art/castle.js';
import { person } from '../../../src/art/body.js';
import { setInk, INK, INK_HARD } from '../../../src/art/gear.js';

const O = '#24180f';
/** Мягкий облик (как soft в sprites.js): рисунок в свой холст, контур — затемнённая копия со сдвигом, свет слева сверху. */
function soft(g, w, h, ox, oy, draw, q = 2) {
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * q); cv.height = Math.ceil(h * q); const c = cv.getContext('2d');
  c.setTransform(q, 0, 0, q, ox * q, oy * q); c.lineJoin = c.lineCap = 'round'; setInk(INK); try { draw(c); } finally { setInk(INK_HARD); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
  const lg = c.createLinearGradient(cv.width * 0.3, cv.height * 0.25, cv.width * 0.7, cv.height * 0.85); lg.addColorStop(0, 'rgba(255,236,200,.10)'); lg.addColorStop(0.5, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(10,6,20,.16)');
  c.fillStyle = lg; c.fillRect(0, 0, cv.width, cv.height); c.restore();
  const dk = document.createElement('canvas'); dk.width = cv.width; dk.height = cv.height; const d2 = dk.getContext('2d'); d2.drawImage(cv, 0, 0); d2.globalCompositeOperation = 'source-atop'; d2.fillStyle = 'rgba(16,8,2,.62)'; d2.fillRect(0, 0, dk.width, dk.height);
  const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height; const o = out.getContext('2d'); const d = Math.max(1, q * 0.42);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o.drawImage(dk, Math.cos(a) * d, Math.sin(a) * d); }
  o.drawImage(cv, 0, 0);
  g.drawImage(out, -ox, -oy, w, h);
}
function grass(g, x0, y0, w, h) {
  g.fillStyle = '#7fae4e'; g.fillRect(x0, y0, w, h);
  let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 2600; i++) { const x = x0 + r() * w, y = y0 + r() * h, k = r(); g.fillStyle = k < 0.5 ? 'rgba(60,110,40,.35)' : k < 0.8 ? 'rgba(170,210,110,.3)' : 'rgba(40,80,30,.25)'; g.beginPath(); g.ellipse(x, y, 10 + r() * 24, 5 + r() * 10, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 900; i++) { const x = x0 + r() * w, y = y0 + r() * h; g.strokeStyle = 'rgba(40,90,30,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 6); g.moveTo(x, y); g.lineTo(x + 2, y - 7); g.stroke(); }
}
export function draw(cv, t) {
  const g = cv.getContext('2d'), C = CITY, S = 0.5, th = C.th, H = C.H;
  const W0 = C.x0 - th - 140, H0 = C.y0 - th - 260, WW = C.x1 - C.x0 + 2 * th + 280, HH = C.y1 - C.y0 + 2 * th + 420;
  cv.width = WW * S; cv.height = HH * S;
  g.setTransform(S, 0, 0, S, -W0 * S, -H0 * S); g.lineJoin = g.lineCap = 'round';
  grass(g, W0, H0, WW, HH);
  // дороги снаружи: к южным и восточным воротам
  g.fillStyle = '#b39a6a'; g.beginPath(); g.roundRect(C.southGate - 48, C.y1 + th - 10, 96, 200, 20); g.fill(); g.beginPath(); g.roundRect(C.x1 + th - 10, C.eastGate - 40, 200, 80, 20); g.fill();
  // мощение внутри
  g.save(); g.beginPath(); g.rect(C.x0, C.y0, C.x1 - C.x0, C.y1 - C.y0); g.clip(); cityGround(g); g.restore();
  // терраса дворца
  const K = { x: 0, y: -560, terrace: 360, stairs: 125, front: 70 };
  const items = [];
  const add = (y, w, h, ox, oy, x, yy, f) => items.push({ y, draw: () => { g.save(); g.translate(x, yy); soft(g, w, h, ox, oy, f); g.restore(); } });
  // стены: северная — лицо и верх; западная и восточная — верх; южная — верх и лицо; башни по углам; ворота
  const Lw = C.x1 - C.x0 + 2 * th;
  add(C.y0, Lw + 20, H + th + 30, 10, H + th + 20, C.x0 - th, C.y0, c => { wallFace(c, Lw, H, 3); c.save(); c.translate(0, -H - th); wallTop(c, Lw, th, 4, false); c.restore(); });
  const Lh = C.y1 - C.y0 + 2 * th;
  add(C.y0 + 1, th + 20, Lh + 20, 10, 10, C.x0 - th, C.y0 - th - H, c => wallSide(c, Lh, th, 5, false));
  add(C.y0 + 1, th + 20, Lh + 20, 10, 10, C.x1, C.y0 - th - H, c => { const gy = C.eastGate - th - H - (C.y0 - th - H), gw = C.gate.w + 2 * C.gate.towerR; wallSide(c, gy - gw / 2, th, 6, true); c.save(); c.translate(0, gy + gw / 2); wallSide(c, Lh - gy - gw / 2, th, 7, true); c.restore(); });
  const gw = C.gate.w + 2 * C.gate.towerR;
  add(C.y1 + th, Lw + 20, H + th + 30, 10, H + th + 20, C.x0 - th, C.y1 + th, c => {
    const a = C.southGate - gw / 2 - (C.x0 - th), b = Lw - a - gw;
    wallFace(c, a, H, 8); c.save(); c.translate(a + gw, 0); wallFace(c, b, H, 9); c.restore();
    c.save(); c.translate(0, -H - th); wallTop(c, a, th, 10, true); c.translate(a + gw, 0); wallTop(c, b, th, 11, true); c.restore();
  });
  // восточные ворота: проём в стене виден как мощение, две башни
  add(C.eastGate + 70, 100, 200, 50, 180, C.x1 + th / 2, C.eastGate + C.gate.w / 2 + C.gate.towerR, c => tower(c, C.gate.towerR, C.gate.towerH, 12, C.roof));
  add(C.eastGate - 70, 100, 200, 50, 180, C.x1 + th / 2, C.eastGate - C.gate.w / 2 - C.gate.towerR, c => tower(c, C.gate.towerR, C.gate.towerH, 13, C.roof));
  for (const [sx, sy, sd] of [[C.x0 - th / 2, C.y0 - th / 2, 20], [C.x1 + th / 2, C.y0 - th / 2, 21], [C.x0 - th / 2, C.y1 + th / 2, 22], [C.x1 + th / 2, C.y1 + th / 2, 23]])
    add(sy + C.towerR * 0.3, C.towerR * 2.6 + 40, C.towerH + C.towerR * 3, C.towerR * 1.3 + 20, C.towerH + C.towerR * 2.6, sx, sy + C.towerR * 0.3, c => tower(c, C.towerR, C.towerH, sd));
  add(C.y1 + th + 1, gw + 160, C.gate.towerH + 140, gw / 2 + 80, C.gate.towerH + 120, C.southGate, C.y1 + th, c => gatehouse(c, C.gate.w, C.gate.towerR, H + 10, 30));
  // дворец
  add(K.y, 700, 540, 350, 500, K.x, K.y, c => { c.scale(0.8, 0.8); castle(c, 'b', 0, false); });
  add(K.y + 56, 2 * K.terrace + 60, 160, K.terrace + 30, 50, K.x, K.y + 56, c => { terrace(c, K.terrace, K.stairs + 36, 67); c.save(); c.translate(0, -56); c.scale(0.8, 0.8); stairs(c, 240, 6, 14); c.restore(); });
  for (const sd of [-1, 1]) items.push({ y: K.y + 57, draw: () => brazierFire(g, K.x + sd * 133, K.y + 30, t, false) });
  // фонтан
  add(70 + 30, 300, 240, 150, 200, 0, 70, c => { c.scale(0.84, 0.84); fountain(c, t, 110); });
  // постройки и дворы
  for (const b of CITY_BUILDINGS) {
    add(b.y, 460, 360, 230, 330, b.x, b.y, c => drawBuilding(c, b));
    for (const it of b.yard || []) add(b.y + it[2] + 1, 300, 200, 150, 170, b.x, b.y, c => drawYardItem(c, it, t));
  }
  for (const it of CITY_DECOR) add(it[2] + 1, 300, 200, 150, 170, it[1], it[2], c => drawYardItem(c, [it[0], 0, 0, it[3]], t));
  // люди для масштаба: герой на площади, стража у ворот и у дворца
  const man = (x, y, look) => add(y, 80, 120, 40, 100, x, y, c => { c.scale(1.15, 1.15); person(c, look, 'front', {}); });
  man(40, 150, { cls: 'warrior', hair: '#b8642a', beard: 'full', broad: 1.08 });
  for (const dx of [-110, 110]) man(C.southGate + dx, C.y1 + th + 40, { cls: 'warrior', hair: '#3a2a1a', helm: 'kettle', broad: 1.05 });
  for (const dx of [-56, 56]) man(K.x + dx, K.y + 14, { cls: 'warrior', hair: '#3a2a1a', broad: 1.05 });
  items.sort((a, b) => a.y - b.y); for (const it of items) it.draw();
  // подписи
  g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillStyle = '#ffe9a8'; g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 4;
  for (const b of CITY_BUILDINGS) if (b.name) { g.strokeText(b.name, b.x, b.y - 150); g.fillText(b.name, b.x, b.y - 150); }
  g.strokeText('Королевский дворец', K.x, K.y - 450); g.fillText('Королевский дворец', K.x, K.y - 450);
}
