// Эскиз v100: рынок и тележка купца — было / стало, рядом герой.
import * as TM from '../../../src/art/tmarket.js';
import { BLD2 } from '../../../src/art/bld2.js';
import * as FOR from '../../../src/art/forest.js';
import { person } from '../../../src/art/body.js';
import { personSpr, drawFrame, PEOPLE_K, MERCH_LOOK, styled } from '../../../src/art/sprites.js';
import { starterLook } from '../../../src/systems/items.js';
const merchant = g => { g.translate(0, -12.6 * PEOPLE_K); g.scale(PEOPLE_K, PEOPLE_K); person(g, MERCH_LOOK, 'front', {}); };
function scene(g, old, t) {
  const hero = { ...starterLook('warrior'), key: 'gal100' };
  g.save(); g.translate(170, 300);
  if (old) { g.save(); g.translate(0, -44); g.scale(PEOPLE_K, PEOPLE_K); person(g, MERCH_LOOK, 'front', {}); g.restore(); BLD2.stall(g, 0, 0.4); } else TM.stall(g, t, merchant);
  g.restore();
  drawFrame(g, personSpr(hero, 'fs', 'idle', 0), 330, 330, -1, PEOPLE_K);
  g.save(); g.translate(560, 300);
  if (old) { FOR.cart(g, 0); g.save(); g.translate(46, 6); g.scale(1.25, 1.25); person(g, MERCH_LOOK, 'front', {}); g.restore(); } else TM.cart(g, t, merchant);
  g.restore();
}
export function draw(cv, which) {
  const W = 760, H = 360; cv.width = W * 2; cv.height = H * 2; const g = cv.getContext('2d'); g.scale(2, 2);
  g.fillStyle = '#9a9488'; g.fillRect(0, 0, W, H); g.fillStyle = '#8a8478'; for (let i = 0; i < 300; i++) { g.beginPath(); g.roundRect((i * 53) % W, (i * 97) % H, 22, 12, 5); g.fill(); }
  const t = document.createElement('canvas'); t.width = W * 2; t.height = H * 2; const tg = t.getContext('2d'); tg.scale(2, 2); tg.lineJoin = tg.lineCap = 'round'; styled(gg => scene(gg, which === 'old', 0.4))(tg); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(t, 0, 0);
}
