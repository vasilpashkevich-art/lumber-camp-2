import { beastSpr, personSpr, drawFrame, MOB_LOOK, MOB_SCALE, STYLE } from '../../../src/art/sprites.js';
const K = (window.KINDS || 'wolf,boar,kvakun,ataman,bandit,snake').split(',');
const SC = window.SC || 2.2;
const cv = document.getElementById(window.CMP_ID || 'c'), g = cv.getContext('2d');
const VIEWS = ['side', 'front', 'back'];
function frame(k, view, mode, f) { return MOB_LOOK[k] ? personSpr(MOB_LOOK[k], view === 'side' ? 'fs' : view, mode, f) : beastSpr(k, view, mode, f); }
function draw(t) {
  g.fillStyle = '#6d8f45'; g.fillRect(0, 0, cv.width, cv.height);
  const colW = SC * 62, rowH = SC * 64;
  K.forEach((k, i) => {
    for (const soft of [false, true]) { STYLE.soft = soft;
      const y = 30 + SC * 46 + i * rowH, x0 = soft ? cv.width / 2 + 10 : 10, sc = SC * (MOB_SCALE[k] || 1);
      VIEWS.forEach((v, j) => drawFrame(g, frame(k, v, 'idle', 0), x0 + colW * (j + 0.5), y, 1, sc));
      drawFrame(g, frame(k, 'side', 'walk', Math.floor(t * 10) % 8), x0 + colW * 3.5, y, 1, sc);
    }
    g.fillStyle = '#fff'; g.font = '14px sans-serif'; g.fillText(k, 8, 40 + i * rowH);
  });
  g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif'; g.fillText('Сейчас', 200, 20); g.fillText('Новое', cv.width / 2 + 200, 20);
}
let t = 0; function loop() { t += 1 / 60; draw(t); if (!window.STILL) requestAnimationFrame(loop); } loop();
