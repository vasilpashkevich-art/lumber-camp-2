// Эскиз v102: все постройки — было / стало, рядом герой.
import { BLD2 } from '../../../src/art/bld2.js';
import { TBLD, TVIL } from '../../../src/art/tbld.js';
import * as HS from '../../../src/art/houses.js';
import { millBase, millBlades } from '../../../src/art/farmland.js';
import { personSpr, drawFrame, PEOPLE_K, styled } from '../../../src/art/sprites.js';
import { starterLook } from '../../../src/systems/items.js';
const CAP = [['house', 0], ['house', 1], ['house', 2], ['forge'], ['tavern'], ['enchant'], ['miners'], ['herbal'], ['inn'], ['bank'], ['palace']];
const VIL = [['house', 0, 'h'], ['house', 1, 'h'], ['forge', 0, 'h'], ['inn', 0, 'h'], ['barn', 0, 'h'], ['farmstead', 0, 'f'], ['farmstead', 1, 'f'], ['mill', 0, 'm']];
export function draw(cv, which, set = 'cap') {
  const list = set === 'cap' ? CAP : VIL, cw = 560, ch = set === 'cap' ? 560 : 460, cols = 3, rows = Math.ceil(list.length / cols);
  const W = cw * cols, H = ch * rows; cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = '#9a9488'; g.fillRect(0, 0, W, H);
  list.forEach(([k, v, kind], i) => { const x = (i % cols) * cw + cw / 2 - 40, y = Math.floor(i / cols) * ch + ch - 50;
    const big = k === 'palace'; const t = document.createElement('canvas'); t.width = cw; t.height = ch; const tg = t.getContext('2d'); tg.lineJoin = tg.lineCap = 'round';
    styled(gg => { gg.translate(cw / 2 - 40, ch - 50); if (big) gg.scale(0.45, 0.45);
      if (kind === 'h') { gg.scale(0.78, 0.78); (which === 'old' ? (k === 'house' ? gg2 => HS.house(gg2, v) : HS[k]) : (gg2 => TVIL[k](gg2, v || 0, 0.4)))(gg); }
      else if (kind === 'f') { gg.scale(0.78, 0.78); (which === 'old' ? HS.farmstead : TVIL.farmstead)(gg, !!v); }
      else if (kind === 'm') { gg.scale(1.5, 1.5); if (which === 'old') { millBase(gg, false); gg.translate(0, -112); millBlades(gg, 0.3, false); } else { TVIL.millBase(gg); gg.translate(0, -112); TVIL.millBlades(gg, 0.3); } }
      else ((which === 'old' || !TBLD[k]) ? BLD2[k] : TBLD[k])(gg, v || 0, 0.4); })(tg);
    g.drawImage(t, x - cw / 2 + 40, y - ch + 50);
    drawFrame(g, personSpr({ ...starterLook('warrior'), key: 'g102' }, 'front', 'idle', 0), x + (big ? 230 : 150), y + 20, 1, PEOPLE_K * (big ? 0.45 : 1));
    g.fillStyle = '#1a120c'; g.font = '16px Georgia'; g.fillText(k + (v != null ? ' ' + v : ''), (i % cols) * cw + 8, Math.floor(i / cols) * ch + 20); });
}
