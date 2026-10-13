import { BLD2 } from '../../../src/art/bld2.js';
import { person } from '../../../src/art/body.js';
import { setInk, INK, INK_HARD } from '../../../src/art/gear.js';
function soft(g, w, h, ox, oy, draw, q = 2) {
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * q); cv.height = Math.ceil(h * q); const c = cv.getContext('2d');
  c.setTransform(q, 0, 0, q, ox * q, oy * q); c.lineJoin = c.lineCap = 'round'; setInk(INK); try { draw(c); } finally { setInk(INK_HARD); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
  const lg = c.createLinearGradient(cv.width * 0.3, cv.height * 0.25, cv.width * 0.7, cv.height * 0.85); lg.addColorStop(0, 'rgba(255,236,200,.10)'); lg.addColorStop(0.5, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(10,6,20,.16)');
  c.fillStyle = lg; c.fillRect(0, 0, cv.width, cv.height); c.restore();
  const dk = document.createElement('canvas'); dk.width = cv.width; dk.height = cv.height; const d2 = dk.getContext('2d'); d2.drawImage(cv, 0, 0); d2.globalCompositeOperation = 'source-atop'; d2.fillStyle = 'rgba(16,8,2,.62)'; d2.fillRect(0, 0, dk.width, dk.height);
  const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height; const o = out.getContext('2d'); const d = Math.max(1, q * 0.42);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o.drawImage(dk, Math.cos(a) * d, Math.sin(a) * d); }
  o.drawImage(cv, 0, 0); g.drawImage(out, -ox, -oy, w, h);
}
export function gallery(cv, t) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#7fae4e'; g.fillRect(0, 0, cv.width, cv.height);
  const list = [['house', 0], ['house', 1], ['house', 2], ['forge'], ['bank'], ['tavern'], ['enchant'], ['miners'], ['herbal'], ['inn'], ['stall'], ['palace']];
  const names = { palace: 'Королевский дворец', house: 'Изба', forge: 'Кузница', bank: 'Банк', tavern: 'Таверна', enchant: 'Мастерская чар', miners: 'Гильдия рудокопов', herbal: 'Лавка травницы', inn: 'Постоялый двор', stall: 'Прилавок' };
  const S = 0.6; let col = 0, row = 0;
  for (const [k, v] of list) {
    if (k === 'palace') { col = 0; row++; } const x = (k === 'palace' ? 560 : 60 + col * 300 + 150), y = 300 + row * 330 + (k === 'palace' ? 120 : 0);
    g.save(); g.translate(x, y); g.scale(S, S); soft(g, 1100, 700, 550, 650, c => { BLD2[k](c, v === undefined ? t : v, t); }); g.restore();
    g.save(); g.translate(x + (k === 'palace' ? 500 : 150) * S, y + 6); g.scale(1.15 * S, 1.15 * S); soft(g, 80, 120, 40, 100, c => person(c, { cls: 'warrior', hair: '#b8642a', beard: 'full', broad: 1.08 }, 'front', {})); g.restore();
    g.font = 'bold 18px Georgia'; g.textAlign = 'center'; g.fillStyle = '#ffe9a8'; g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 4; g.strokeText(names[k], x, y + 40); g.fillText(names[k], x, y + 40);
    col++; if (col === 4) { col = 0; row++; }
  }
}
