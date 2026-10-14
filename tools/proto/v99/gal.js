// Эскиз v99: стены, башни и ворота столицы — было / стало, рядом герой и стражник для масштаба.
import * as OLD from '../../../src/art/city.js';
import * as NEW from '../../../src/art/tcity.js';
import { personSpr, drawFrame, PEOPLE_K, GUARD_LOOK, styled } from '../../../src/art/sprites.js';
import { starterLook } from '../../../src/systems/items.js';
const C = OLD.CITY;
function scene(g, M, ox, oy) {
  const th = C.th, H = C.H;
  // кусок стены с проёмом под надвратную башню: стена 420 + ворота + стена 420
  const gw = C.gate.w + 2 * C.gate.towerR;
  g.save(); g.translate(ox, oy);
  for (const [x, w] of [[0, 420], [420 + gw, 420]]) { g.save(); g.translate(x, 0); M.wallFace(g, w, H, 3); g.translate(0, -H - th); M.wallTop(g, w, th, 40, true); g.restore(); }
  g.save(); g.translate(420 + gw / 2, 0); M.gatehouse(g, C.gate.w, C.gate.towerR, H + 10, 30); g.restore();
  // угловая башня справа
  g.save(); g.translate(420 * 2 + gw + 110, C.towerR * 0.3); M.tower(g, C.towerR, C.towerH, 20); g.restore();
  // торец стены (боевой ход сверху) слева
  g.save(); g.translate(-90, -H - th - 160); M.wallSide(g, 320, th, 60, false); g.restore();
  // герой и стражник
  const L = { ...starterLook('warrior'), key: 'gal-hero' };
  drawFrame(g, personSpr(L, 'front', 'idle', 0), 300, 70, 1, PEOPLE_K);
  drawFrame(g, personSpr(GUARD_LOOK, 'front', 'idle', 0), 420 + gw / 2 - 110, 40, 1, PEOPLE_K);
  drawFrame(g, personSpr(GUARD_LOOK, 'front', 'idle', 0), 420 + gw / 2 + 110, 40, 1, PEOPLE_K);
  g.restore();
}
export function draw(cv, which) {
  const W = 1500, Hh = 560; cv.width = W; cv.height = Hh; const g = cv.getContext('2d');
  g.fillStyle = '#7aa24c'; g.fillRect(0, 0, W, Hh); g.fillStyle = '#6f9a44'; for (let i = 0; i < 200; i++) { g.beginPath(); g.ellipse((i * 137) % W, 380 + (i * 53) % 180, 6, 2, 0, 0, 7); g.fill(); }
  const M = which === 'old' ? OLD : NEW; const draw2 = styled(gg => scene(gg, M, 130, 430));
  // как в игре — через мягкий контур: рисуем во временный холст и кладём
  const t = document.createElement('canvas'); t.width = W; t.height = Hh; const tg = t.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.lineJoin = tg.lineCap = 'round'; draw2(tg); g.drawImage(t, 0, 0);
}
