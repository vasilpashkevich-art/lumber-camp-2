// Эскиз v101: банк — было / стало, рядом герой и стражник.
import { BLD2 } from '../../../src/art/bld2.js';
import { TBLD } from '../../../src/art/tbld.js';
import { personSpr, drawFrame, PEOPLE_K, GUARD_LOOK, styled } from '../../../src/art/sprites.js';
import { starterLook } from '../../../src/systems/items.js';
export function draw(cv, which) {
  const W = 620, H = 470; cv.width = W * 2; cv.height = H * 2; const g = cv.getContext('2d'); g.scale(2, 2);
  g.fillStyle = '#9a9488'; g.fillRect(0, 0, W, H); g.fillStyle = '#8a8478'; for (let i = 0; i < 260; i++) { g.beginPath(); g.roundRect((i * 53) % W, (i * 97) % H, 22, 12, 5); g.fill(); }
  const t = document.createElement('canvas'); t.width = W * 2; t.height = H * 2; const tg = t.getContext('2d'); tg.scale(2, 2); tg.lineJoin = tg.lineCap = 'round';
  styled(gg => { gg.save(); gg.translate(270, 410); (which === 'old' ? BLD2 : TBLD).bank(gg, 0, 0.4); gg.restore(); })(tg);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(t, 0, 0); g.setTransform(2, 0, 0, 2, 0, 0);
  drawFrame(g, personSpr({ ...starterLook('warrior'), key: 'g101' }, 'front', 'idle', 0), 250, 440, 1, PEOPLE_K);
  drawFrame(g, personSpr(GUARD_LOOK, 'front', 'idle', 0), 120, 445, 1, PEOPLE_K);
}
