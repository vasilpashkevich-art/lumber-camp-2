// Эскиз v107: лиса, волк, кабан — было / стало, живые кадры, рядом герой.
import { tbeast } from '../../../src/art/tbeasts.js';
import { sprite, styled, beastSpr, personSpr, drawFrame, PEOPLE_K, FRAMES } from '../../../src/art/sprites.js';
import { BOX } from '../../../src/art/beasts.js';
import { starterLook } from '../../../src/systems/items.js';
const poseOf = (mode, f) => mode === 'walk' ? { walk: f / 8 } : mode === 'atk' ? { atk: (f + 0.5) / 6 } : mode === 'dead' ? { dead: (f + 1) / 4 } : { walk: -1 };
const newSpr = (kind, view, mode, f) => { const B = BOX[kind] || [130, 84, 65, 68]; return sprite('tz|' + kind + '|' + view + '|' + mode + '|' + f, B[0], B[1], B[2], B[3], 2.4, styled(g => tbeast(g, kind, view, { ...poseOf(mode, f), t: 1 }))); };
const spr = (which, kind, view, mode, f) => which === 'new' ? newSpr(kind, view, mode, f) : beastSpr(kind, view, mode, f);
const KINDS = [['fox', 'Лиса'], ['wolf', 'Волк'], ['boar', 'Кабан']];
const COLS = [['side', 'idle', 'Стоит'], ['side', 'walk', 'Бежит'], ['side', 'atk', 'Кусает'], ['front', 'walk', 'К нам'], ['back', 'walk', 'От нас'], ['side', 'dead', 'Пал']];
const HERO = { ...starterLook('warrior'), key: 'g107' };
export function sheet(cv, t, fixed) {
  const K = 2.5, CW = 200, RH = 175, HW = 120, W = HW + CW * COLS.length, H = 34 + KINDS.length * (RH * 2 + 30);
  if (cv.width !== W) { cv.width = W; cv.height = H; }
  const g = cv.getContext('2d'); g.fillStyle = '#7da35a'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#20301a'; g.font = 'bold 15px Georgia'; COLS.forEach(([, , n], i) => g.fillText(n, HW + i * CW + 12, 22));
  KINDS.forEach(([kind, name], k) => {
    const y0 = 34 + k * (RH * 2 + 30);
    g.fillStyle = 'rgba(20,30,10,.75)'; g.font = 'bold 18px Georgia'; g.fillText(name, 10, y0 + 22);
    ['old', 'new'].forEach((w, r) => {
      const yy = y0 + 30 + r * RH; g.fillStyle = r ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.06)'; g.fillRect(0, yy, W, RH);
      g.fillStyle = '#20301a'; g.font = '14px Georgia'; g.fillText(r ? 'стало' : 'было', 12, yy + RH / 2 + 4);
      drawFrame(g, personSpr(HERO, 'front', 'idle', 0), 80, yy + RH - 18, 1, PEOPLE_K * K * 0.88);
      COLS.forEach(([view, mode], i) => {
        const n = FRAMES[mode], f = fixed != null ? Math.min(n - 1, fixed % n) : mode === 'dead' ? Math.min(n - 1, Math.floor(t * 4) % 10) : Math.floor(t * (mode === 'atk' ? 9 : 11)) % n;
        drawFrame(g, spr(w, kind, view, mode, f), HW + i * CW + CW / 2, yy + RH - 22, 1, K * 0.88);
      });
    });
  });
}
/** В игре: герой и звери в настоящем размере ×2 (как на экране при обычном приближении). */
export function scene(cv, t, which) {
  const W = 760, H = 230; cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.fillStyle = '#7da35a'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(40,60,20,.14)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse((i * 97) % W, (i * 53) % H, 18, 6, 0, 0, 7); g.fill(); }
  const K = 1.9, f8 = Math.floor(t * 11) % 8;
  const L = [[90, 170, 'hero'], [230, 175, 'fox', 'side', 'walk'], [400, 185, 'wolf', 'side', 'walk'], [600, 190, 'boar', 'side', 'walk'], [330, 110, 'wolf', 'front', 'walk'], [520, 100, 'fox', 'back', 'walk']].sort((a, b) => a[1] - b[1]);
  for (const [x, y, k, v, m] of L) k === 'hero' ? drawFrame(g, personSpr(HERO, 'side', 'idle', 0), x, y, 1, PEOPLE_K * K) : drawFrame(g, spr(which, k, v, m, f8), x, y, -1, K);
  g.fillStyle = '#20301a'; g.font = 'bold 15px Georgia'; g.fillText(which === 'new' ? 'стало — в игре' : 'было — в игре', 12, 22);
}
