// Эскиз v75: умения мобов — было / стало (одна и та же сцена, слева старая рисовка, справа новая).
import { beastSpr, personSpr, drawFrame, MOB_LOOK, MOB_SCALE, STYLE, FRAMES } from '../../../src/art/sprites.js';
import * as M from '../../../src/art/mobfx.js';
import { newHero } from '../../../src/entities/hero.js';
import { lookOf } from '../../../src/systems/items.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
const hero = lookOf(newHero('Гость', 'warrior'));
const SC = 1.9, CW = cv.width / 2, RH = 260, PER = 3.4;
const SCN = [
  ['Атаман: удар топором по площади', 'ataman', 'smash', 'slam', 110],
  ['Великий Полоз: бросок кольцами', 'snake', 'smash', 'coil', 120],
  ['Кабан: разбег и таран', 'boar', 'charge'],
  ['Поджигатель: бутыль с огнём', 'firestarter', 'shot', 'bottle'],
  ['Споровик: споры', 'sporo', 'shot', 'spore'],
  ['Квакун-шаман: тина (проклятие)', 'kvak_shaman', 'shot', 'curse'],
  ['Паук: ядовитый укус', 'spider', 'bite'],
  ['Призыв: вороны, сородич, выводок', 'miller', 'summon'],
];
const spr = (k, v, mode, f) => MOB_LOOK[k] ? personSpr(MOB_LOOK[k], v, mode, f) : beastSpr(k, v, mode, f);
const fr = (mode, q) => Math.min(FRAMES[mode] - 1, Math.floor(q * FRAMES[mode]));
function mob(k, x, y, mode, q, dir = 1) { drawFrame(g, spr(k, 'side', mode, fr(mode, q)), x, y, dir, MOB_SCALE[k] || 1); }
function heroAt(x, y) { drawFrame(g, personSpr(hero, 'side', 'idle', 0), x, y, -1, 1); }
function oldTele(x, y, r, q) { g.fillStyle = `rgba(255,80,40,${0.12 + q * 0.18})`; g.strokeStyle = 'rgba(255,120,60,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r, r * 0.5, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,80,40,.25)'; g.beginPath(); g.ellipse(x, y, r * q, r * q * 0.5, 0, 0, 7); g.fill(); }
function oldRing(x, y, r0, max, a, col) { const q = a / 0.35; if (q >= 1) return; g.strokeStyle = col; g.globalAlpha = 1 - q; g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, r0 + (max - r0) * q, (r0 + (max - r0) * q) * 0.5, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
function scene(s, T, NEW) {
  const [, k, kind, style, R] = s, mx = -95, hx = 75;
  if (kind === 'smash') {
    const W = 1.1, f = { x: hx, y: 0, r: R, style, seed: 5 };
    if (T < W) { if (NEW) { M.telegraph(g, f, T / W, T); M.gather(g, f, T / W); } else oldTele(hx, 0, R, T / W); }
    else if (NEW) M.slam(g, f, T - W); else oldRing(hx, 0, 10, R, T - W, '#ffb347');
    const q = T < W ? 0.5 * T / W : Math.min(1, 0.5 + 0.5 * (T - W) / 0.3);
    heroAt(hx, 0); mob(k, k === 'snake' ? mx - 20 : mx, 0, T < W + 0.3 ? 'atk' : 'idle', q);
  } else if (kind === 'charge') {
    const run = 0.8, x = T < run ? mx - 40 + (hx - 40 - mx + 40) * (T / run) : hx - 40;
    if (NEW) for (let i = 0; i < 14; i++) { const t0 = i * 0.06; if (t0 > Math.min(T, run)) break; const px = mx - 40 + (hx - 40 - mx + 40) * (t0 / run) - 18; M.hoofDust(g, px, 0, T - t0, i + 1); }
    heroAt(hx, 0); mob(k, x, 0, T < run ? 'walk' : 'idle', (T * 3) % 1);
    if (T > run) { if (NEW) M.ram(g, { x: hx, y: 0, seed: 3 }, T - run); else oldRing(hx, 0, 6, 40, T - run, '#e8d7a8'); }
  } else if (kind === 'shot') {
    const fl = 0.55, x0 = mx + 15, y0 = -18, x1 = hx, y1 = -16, q = T / fl;
    heroAt(hx, 0); mob(k, mx, 0, T < 0.42 ? 'atk' : 'idle', T / 0.42);
    if (q < 1) { const sh = { x: x0 + (x1 - x0) * q, y: y0 + (y1 - y0) * q - Math.sin(q * Math.PI) * (style === 'bottle' ? 30 : 0), vx: 300, vy: 0, age: T };
      if (NEW) (style === 'bottle' ? M.bottleShot : style === 'spore' ? M.sporeShot : M.curseShot)(g, sh, T);
      else if (style === 'bottle') { g.save(); g.translate(sh.x, sh.y); g.rotate(T * 11); g.fillStyle = '#6a8a6a'; g.strokeStyle = '#24180f'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, 4, 6, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#ffb347'; g.beginPath(); g.moveTo(-2, -6); g.quadraticCurveTo(0, -14, 2, -6); g.fill(); g.restore(); }
      else if (style === 'spore') for (let i = 0; i < 5; i++) { const a = T * 5 + i * 1.26; g.fillStyle = `rgba(210,232,140,${0.75 - i * 0.1})`; g.beginPath(); g.arc(sh.x + Math.cos(a) * 5, sh.y + Math.sin(a) * 4, 4.5 - i * 0.4, 0, 7); g.fill(); }
      else { const g2 = g.createRadialGradient(sh.x, sh.y, 1, sh.x, sh.y, 14); g2.addColorStop(0, 'rgba(200,255,220,1)'); g2.addColorStop(0.5, 'rgba(120,255,170,.85)'); g2.addColorStop(1, 'rgba(60,200,120,0)'); g.fillStyle = g2; g.beginPath(); g.arc(sh.x, sh.y, 14, 0, 7); g.fill(); }
    } else if (NEW) { const e = { x: hx, y: 0, seed: 4, max: 1.6 }, a = T - fl; style === 'bottle' ? M.fireSplash(g, e, a) : style === 'spore' ? M.sporeBurst(g, e, a) : M.curseHit(g, e, a); }
  } else if (kind === 'bite') {
    const b = T % 1.2; heroAt(hx, 0); mob(k, hx - 46, 0, b < 0.35 ? 'atk' : 'idle', b / 0.35);
    if (NEW) M.venom(g, { x: hx, y: 0, seed: 2 + Math.floor(T / 1.2) }, b);
  } else if (kind === 'summon') {
    mob(k, mx, 0, T < 0.5 ? 'atk' : 'idle', T / 0.5); heroAt(hx + 40, 0);
    const pts = [['crow', -20, -30], ['kvakun', 30, 20], ['weaver', -40, 30]];
    for (const [kk, dx, dy] of pts) { const a = T - 0.3; if (a < 0) continue; if (NEW) M.summonFx(g, { x: dx, y: dy, kind: kk, seed: dx + 50 }, a); if (a > 0.25) { g.globalAlpha = Math.min(1, (a - 0.25) / 0.25); mob(kk, dx, dy - (kk === 'crow' ? 10 : 0), 'idle', 0); g.globalAlpha = 1; } }
    if (!NEW) for (const [, dx, dy] of pts) { const a = T - 0.3; if (a > 0 && a < 1) { g.fillStyle = `rgba(255,255,255,${1 - a})`; g.beginPath(); g.ellipse(dx, dy, 26 * (0.4 + a), 10, 0, 0, 7); g.fill(); } }
  }
}
function draw(t) {
  g.fillStyle = '#5f7d3c'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#e8e2c8'; g.font = 'bold 15px sans-serif'; g.fillText('Сейчас', CW / 2 - 25, 18); g.fillText('Новое', CW * 1.5 - 25, 18);
  SCN.forEach((s, i) => {
    const T = (t + i * 0.37) % PER;
    for (const NEW of [false, true]) { STYLE.soft = NEW;
      g.save(); g.beginPath(); g.rect(NEW ? CW : 0, 26 + i * RH, CW, RH); g.clip();
      g.translate((NEW ? CW : 0) + CW / 2, 26 + i * RH + RH * 0.7); g.scale(SC, SC); scene(s, T, NEW); g.restore(); }
    g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText(s[0], 8, 44 + i * RH);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 26 + (i + 1) * RH - 1, cv.width, 1);
  });
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(CW - 1, 26, 2, cv.height);
}
let t0 = performance.now(); const fix = window.FIXT;
function loop() { draw(fix != null ? fix : (performance.now() - t0) / 1000); if (fix == null) requestAnimationFrame(loop); } loop();
