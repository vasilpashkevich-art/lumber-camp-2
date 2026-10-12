// Эскиз v74: воин в новом стиле — 8 сторон, движения, 5 комплектов, сравнение с нынешним в размере игры.
import { LOOK } from '../../../src/art/look.js';
import { personSpr, drawFrame } from '../../../src/art/sprites.js';
import { lookOf, makeItem } from '../../../src/systems/items.js';
import { solve, toWorld, proj, add, mul } from '../../../src/art/hero2/rig.js';
import { drawWarrior, SETS } from '../../../src/art/hero2/warrior.js';
import * as A from '../../../src/art/hero2/anim.js';

const $ = s => document.querySelector(s);
const DPR = Math.min(2, window.devicePixelRatio || 1);
const GROUND = {};
function ground(w, h, seed = 7) {
  const k = w + 'x' + h + seed; if (GROUND[k]) return GROUND[k];
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); LOOK.use(g); LOOK.ground(0, 0, w, h, 'z1', seed, 3);
  const r = rnd(seed); for (let i = 0; i < w * h / 2600; i++) LOOK.tuft(r() * w, r() * h, 0.8 + r() * 0.5, 'z1', r());
  return (GROUND[k] = c);
}
function rnd(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

// ---------------------------------------------------------------- движения
const ANIMS = {
  idle: { name: 'Стоит', dur: 6, f: (q, t) => ({ P: A.idle(t) }) },
  walk: { name: 'Шаг', dur: 1.1, f: (q, t) => ({ P: A.walk(q, t), speed: 0.4 }) },
  run: { name: 'Бег', dur: 0.66, f: (q, t) => ({ P: A.run(q, t), speed: 1 }) },
  sit: { name: 'Садится', dur: 5, f: (q, t) => ({ P: A.sit(q < 0.18 ? 0 : q < 0.42 ? (q - 0.18) / 0.24 : q < 0.78 ? 1 : 1 - (q - 0.78) / 0.22, t) }) },
  chop: { name: 'Удар', dur: 1.2, f: (q) => ({ P: A.chop(Math.min(1, q / 0.62)), trail: 'chop' }) },
  charge: { name: 'Рывок', dur: 1.8, f: (q, t) => { const P = A.charge(Math.min(1, q / 0.75), t); return { P, dz: P.dz || 0, speed: q < 0.4 ? 1 : 0, trail: q > 0.41 ? 'charge' : null }; } },
  whirl: { name: 'Вихрь', dur: 2, f: (q) => ({ P: A.whirl(Math.min(1, q / 0.8)), speed: 0.8, trail: q < 0.8 ? 'whirl' : null }) },
  crush: { name: 'Сокрушающий удар', dur: 1.8, f: (q) => ({ P: A.crush(Math.min(1, q / 0.8)), trail: 'crush' }) },
  roar: { name: 'Ярость', dur: 2.4, f: (q, t) => ({ P: A.roar(Math.min(1, q / 0.85), t) }) },
  hurt: { name: 'Отдача', dur: 1, f: (q) => ({ P: A.hurt(Math.min(1, q / 0.35)) }) },
  death: { name: 'Падение', dur: 2.6, f: (q) => ({ P: A.death(Math.min(1, q / 0.55)) }) },
};

/** Скелет воина на момент времени. */
function frame(anim, t, heading) {
  const D = ANIMS[anim], q = (t % D.dur) / D.dur, r = D.f(q, t), B = toWorld(solve(r.P), heading + (r.P.spin || 0));
  if (r.dz) { const dd = r.dz - 67, off = [Math.sin(heading) * dd, 0, Math.cos(heading) * dd]; for (const k in B) if (Array.isArray(B[k]) && B[k].length === 3 && k !== 'wDir' && k !== 'wEdge') B[k] = add(B[k], off); }
  // след оружия: конец оружия за последние 0,12 с
  if (r.trail) { const tr = []; for (let i = 6; i >= 0; i--) { const tt = t - i * 0.02, qq = (tt % D.dur) / D.dur; if (qq > q) continue; const r2 = D.f(qq, tt), B2 = toWorld(solve(r2.P), heading + (r2.P.spin || 0)); const tip = add(B2.grip, mul(B2.wDir, 26)); if (r2.dz) { tip[0] += Math.sin(heading) * (r2.dz - 67); tip[2] += Math.cos(heading) * (r2.dz - 67); } tr.push(tip); } r.trailPts = tr; }
  return { B, r };
}
function paintHero(g, S, set, anim, t, heading) {
  const { B, r } = frame(anim, t, heading);
  drawWarrior(g, S, B, SETS[set], { t, speed: r.speed || 0, trail: r.trailPts && isSwing(anim, t) ? r.trailPts : null });
}
function isSwing(anim, t) {
  const D = ANIMS[anim], q = (t % D.dur) / D.dur;
  if (anim === 'chop') { const s = q / 0.62; return s > 0.36 && s < 0.7; }
  if (anim === 'charge') { const s = q / 0.75; return s > 0.68 && s < 0.9; }
  if (anim === 'whirl') return q > 0.08 && q < 0.75;
  if (anim === 'crush') { const s = q / 0.8; return s > 0.45 && s < 0.6; }
  return false;
}

// ---------------------------------------------------------------- большая сцена
const st = { anim: 'idle', set: 'plate', dir: 1, spin: false, t0: performance.now() / 1000 };
const DIRS = [['↓', 0], ['↘', Math.PI / 4], ['→', Math.PI / 2], ['↗', Math.PI * 3 / 4], ['↑', Math.PI], ['↖', -Math.PI * 3 / 4], ['←', -Math.PI / 2], ['↙', -Math.PI / 4]];
function ui() {
  $('#anims').innerHTML = Object.entries(ANIMS).map(([k, a]) => `<button data-a="${k}" class="${k === st.anim ? 'on' : ''}">${a.name}</button>`).join('');
  $('#sets').innerHTML = Object.entries(SETS).map(([k, s]) => `<button data-s="${k}" class="${k === st.set ? 'on' : ''}">${s.name}</button>`).join('');
  $('#dirs').innerHTML = DIRS.map(([n], i) => `<button data-d="${i}" class="${!st.spin && i === st.dir ? 'on' : ''}">${n}</button>`).join('') + `<button data-d="spin" class="${st.spin ? 'on' : ''}">крутить</button>`;
  document.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { st.anim = b.dataset.a; st.t0 = performance.now() / 1000; ui(); });
  document.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { st.set = b.dataset.s; ui(); });
  document.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (b.dataset.d === 'spin') st.spin = !st.spin; else { st.spin = false; st.dir = +b.dataset.d; } ui(); });
}
ui();
const big = $('#big');
function drawBig(now) {
  const g = big.getContext('2d'), W = big.width / DPR, H = big.height / DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.drawImage(ground(W, H, 5), 0, 0, W, H);
  const t = st.fix != null ? st.fix : now - st.t0, h = st.spin ? now * 0.6 : DIRS[st.dir][1];
  const k = st.anim === 'charge' ? 1.9 : 3.3;
  paintHero(g, { x: W / 2, y: H * 0.78, k }, st.set, st.anim, t, h);
}

// ---------------------------------------------------------------- 8 сторон
const turn = $('#turn');
function drawTurn(now) {
  const g = turn.getContext('2d'), W = turn.width / DPR, H = turn.height / DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.drawImage(ground(W, H, 9), 0, 0, W, H);
  const anim = $('#turnAnim').value;
  DIRS.forEach(([n, h], i) => { const x = W * (i + 0.5) / 8; paintHero(g, { x, y: H * 0.8, k: 1.45 }, st.set, anim, now, h); g.fillStyle = '#ffe9a8'; g.font = '15px Georgia'; g.textAlign = 'center'; g.fillText(n, x, 18); });
}
// ---------------------------------------------------------------- 5 комплектов
const sets = $('#setsCv');
function drawSets(now) {
  const g = sets.getContext('2d'), W = sets.width / DPR, H = sets.height / DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.drawImage(ground(W, H, 11), 0, 0, W, H);
  Object.entries(SETS).forEach(([k, s], i) => { const x = W * (i + 0.5) / 5; paintHero(g, { x, y: H * 0.84, k: 2.1 }, k, 'idle', now + i * 1.3, Math.PI / 5); g.fillStyle = '#ffe9a8'; g.font = '16px Georgia'; g.textAlign = 'center'; g.fillText(s.name, x, 22); });
}
// ---------------------------------------------------------------- в размере игры: было — стало
const game = $('#game');
const OLD = lookOf({ cls: 'warrior', eq: Object.fromEntries(['head', 'chest', 'legs', 'weapon'].map((s, i) => [s, makeItem('warrior', s, 22, 'rare', () => 0.25 + i * 0.15)])) });
function drawGame(now) {
  const g = game.getContext('2d'), W = game.width / DPR, H = game.height / DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.drawImage(ground(W, H, 13), 0, 0, W, H);
  g.fillStyle = '#ffe9a8'; g.font = '14px Georgia'; g.textAlign = 'center';
  // обычное приближение (125%) и самое близкое (200%)
  [[1.25, 0, 'обычное приближение'], [2.0, W / 2, 'приближение колесом до упора']].forEach(([Z, x0, cap]) => {
    const oy = H * 0.66, k = 0.46 * Z;
    drawFrame(g, personSpr(OLD, 'side', 'walk', Math.floor(now * 9) % 8), x0 + W * 0.07, oy, 1, 1.15 * Z); g.fillText('сейчас', x0 + W * 0.07, H - 10);
    paintHero(g, { x: x0 + W * 0.18, y: oy, k }, 'plate', 'idle', now, Math.PI / 4); g.fillText('стоит', x0 + W * 0.18, H - 10);
    paintHero(g, { x: x0 + W * 0.29, y: oy, k }, 'mail', 'walk', now, Math.PI / 2); g.fillText('идёт', x0 + W * 0.29, H - 10);
    paintHero(g, { x: x0 + W * 0.4, y: oy, k }, 'epic', 'chop', now, Math.PI / 2); g.fillText('бьёт', x0 + W * 0.4, H - 10);
    g.fillText(cap, x0 + W * 0.25, 18);
  });
}
function tick() { const now = performance.now() / 1000; drawBig(now); drawTurn(now); drawSets(now); drawGame(now); requestAnimationFrame(tick); }
for (const cv of [big, turn, sets, game]) { const r = cv.getBoundingClientRect(); cv.width = Math.round(r.width * DPR); cv.height = Math.round(r.height * DPR); }
requestAnimationFrame(tick);
window.__sk = { st, ui, ANIMS };
