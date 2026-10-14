// Эскиз v97, проба 4: Чёрный полководец в движении — 8 сторон × (стоит, шаг, удар), и в масштабе игры.
import { knight, poseOf, DIRS } from './rig.js';
import { floor } from '../../../src/art/temple.js';
import { chestBig } from '../../../src/art/chest.js';
import { PEOPLE_K } from '../../../src/art/sprites.js';

export function gallery(root) {
  const mk = (w, h, title, note) => { const s = document.createElement('section'); s.innerHTML = `<h2>${title}</h2>${note ? `<p>${note}</p>` : ''}`; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; s.append(cv); root.append(s); return cv; };
  const grid = mk(1200, 1060, '8 сторон: стоит · шаг · удар', 'Сверху вниз — стоит, идёт, бьёт секирой (замах из-за головы и рубящий удар). Слева направо — лицом, вполоборота, боком, вполоборота спиной, спиной и то же влево.');
  const strip = mk(1200, 360, 'Кадры удара и шага (боком)', 'Шесть кадров удара секирой и шесть кадров шага — как они пойдут в игру готовыми картинками.');
  const scene = mk(1200, 520, 'В масштабе игры (×2,4)', 'Полководец обходит сундук по кругу (сторона меняется по направлению шага), потом останавливается и рубит.');
  const draw = (g, x, y, s, dir, deg, pose, t) => { g.save(); g.translate(x, y); g.scale(s * dir, s); knight(g, deg, pose, t); g.restore(); };
  const tick = now => {
    const t = now / 1000;
    { const g = grid.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, grid.width, grid.height); g.save(); g.scale(2, 2); floor(g, 0, 0, 600, 530, 6, 40, false); g.restore();
      g.font = '14px Georgia'; g.textAlign = 'center';
      DIRS.forEach(([name, deg, dir], i) => {
        const x = 75 + i * 150;
        draw(g, x, 320, 4.4, dir, deg, poseOf('idle', 0, t + i), t + i);
        draw(g, x, 660, 4.4, dir, deg, poseOf('walk', (t * 1.25) % 1, t), t);
        const q = (t * 0.9) % 1.4, pa = poseOf('atk', Math.min(1, q), t); if (q > 0.55 && q < 0.85) pa.trail = 0.6; draw(g, x, 1000, 4.4, dir, deg, pa, t);
        g.fillStyle = '#e9dfc8'; g.fillText(name, x, 30);
      });
      g.fillStyle = '#b9ad94'; g.textAlign = 'left'; g.fillText('стоит', 8, 60); g.fillText('шаг', 8, 400); g.fillText('удар', 8, 740); }
    { const g = strip.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, strip.width, strip.height); g.save(); g.scale(2, 2); floor(g, 0, 0, 600, 180, 8, 40, false); g.restore();
      for (let i = 0; i < 6; i++) { const pa = poseOf('atk', i / 6 + 0.04, 0); if (i === 3) pa.trail = 0.6; draw(g, 60 + i * 95, 320, 3.6, 1, 90, pa, 0); }
      for (let i = 0; i < 6; i++) draw(g, 640 + i * 95, 320, 3.6, 1, 90, poseOf('walk', i / 6, 0), 0); }
    { const g = scene.getContext('2d'), K = 2.4, s = 39 / 40 * PEOPLE_K; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, scene.width, scene.height); g.save(); g.scale(K, K); floor(g, 0, 0, 500, 217, 7, 40, false);
      const cx = 250, cy = 120, cyc = t % 12;
      // путь: круг вокруг сундука 9 с, потом удар 3 с
      let x, y, deg, dir, pose;
      if (cyc < 9) { const ang = cyc / 9 * TAU0; x = cx + Math.cos(ang) * 120; y = cy + Math.sin(ang) * 55; const vx = -Math.sin(ang), vy = Math.cos(ang); const v = viewOf8(vx, vy); deg = v.deg; dir = v.dir; pose = poseOf('walk', (t * 1.3) % 1, t); }
      else { x = cx + 120; y = cy; deg = 90; dir = -1; const q = ((cyc - 9) * 0.9) % 1; pose = poseOf('atk', q, t); if (q > 0.55 && q < 0.85) pose.trail = 0.6; }
      const L = [{ y: cy, f: () => chestBig(g, cx, cy, true, t) }, { y, f: () => draw(g, x, y, s, dir, deg, pose, t) }]; L.sort((a, b) => a.y - b.y); for (const o of L) o.f();
      g.restore(); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const TAU0 = Math.PI * 2;
function viewOf8(dx, dy) {   // направление шага → угол и зеркало
  const ang = Math.atan2(dx, dy) * 180 / Math.PI;   // 0 — вниз (лицом), 90 — вправо, 180 — вверх
  const a = Math.round(Math.abs(ang) / 45) * 45; return { deg: a, dir: ang < 0 ? -1 : 1 };
}
