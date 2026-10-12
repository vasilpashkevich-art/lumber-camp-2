// Эскиз v73: иконки умений, живые образцы анимаций (код эффектов — из игры: src/art/vfx.js), окно талантов, кнопки телефона.
import { LOOK } from '../../../src/art/look.js';
import { personSpr, beastSpr, MOB_LOOK, drawFrame, flashOf } from '../../../src/art/sprites.js';
import { lookOf, makeItem } from '../../../src/systems/items.js';
import { CLASSES } from '../../../data/classes.js';
import { NEW_ABILS, TALENTS } from '../../../data/talents.js';
import { iconUrl } from '../../../src/art/abicons.js';
import { ABIL_ICON } from '../../../src/ui/icons.js';
import * as V from '../../../src/art/vfx.js';

const $ = s => document.querySelector(s);
const DPR = Math.min(2, window.devicePixelRatio || 1);
const LOOKS = Object.fromEntries(['warrior', 'mage', 'archer'].map(c => [c, lookOf({ cls: c, eq: Object.fromEntries(['head', 'chest', 'legs', 'weapon'].map((s, i) => [s, makeItem(c, s, 14, 'rare', () => 0.2 + i * 0.17)])) })]));
const PASSIVE = { thirst: 1, ignite: 1, execute: 1 };

// ---------------------------------------------------------------- сцена: земля, герой, враги
const SW = 300, SH = 180, ZK = 1.7;   // мир в окошке и масштаб
let GROUND = null;
function ground() {
  if (GROUND) return GROUND;
  const c = document.createElement('canvas'); c.width = SW * 2; c.height = SH * 2; const g = c.getContext('2d'); g.scale(2, 2); LOOK.use(g); LOOK.ground(0, 0, SW, SH, 'z1', 7, 3);
  const r = V.rng(3); for (let i = 0; i < 90; i++) LOOK.tuft(r() * SW, r() * SH, 0.8 + r() * 0.5, 'z1', r());
  return (GROUND = c);
}
const mob = (x, y, kind = 'bandit') => ({ x, y, kind, dir: -1, view: 'side', mode: 'idle', f: 0, hurt: 0, alpha: 1, hp: 1 });
function drawPerson(g, o, L, sc = 1.15) {
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(o.x, o.y + 2, 15 * (sc / 1.15), 5, 0, 0, 7); g.fill();
  const sp = personSpr(L, o.view, o.mode, o.f); g.globalAlpha = o.alpha ?? 1; drawFrame(g, o.hurt > 0 ? flashOf(sp) : sp, o.x, o.y, o.dir, sc); g.globalAlpha = 1;
}
function drawMob(g, m) {
  if (m.kind === 'wolf') { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(m.x, m.y + 2, 18, 5, 0, 0, 7); g.fill(); const sp = beastSpr('wolf', m.view, m.mode, m.f); g.globalAlpha = m.alpha; drawFrame(g, m.hurt > 0 ? flashOf(sp) : sp, m.x, m.y, m.dir); g.globalAlpha = 1; }
  else drawPerson(g, m, MOB_LOOK[m.kind] || MOB_LOOK.bandit, 1.1);
  if (m.hp < 1 && m.mode !== 'dead') { const w = 40, y = m.y - 66; g.fillStyle = 'rgba(20,14,8,.85)'; g.fillRect(m.x - w / 2 - 1, y - 1, w + 2, 6); g.fillStyle = '#c8323a'; g.fillRect(m.x - w / 2, y, w * m.hp, 4); }
}
const fr = (k, n = 6) => Math.min(n - 1, Math.max(0, Math.floor(k * n)));
const atkF = (t, t0, d = 0.35) => t >= t0 && t < t0 + d ? fr((t - t0) / d) : -1;
function float(g, x, y, s, col, big) { g.font = `bold ${big ? 17 : 13}px Georgia`; g.textAlign = 'center'; g.lineWidth = 3.5; g.strokeStyle = 'rgba(20,14,8,.9)'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); }
/** Всплывающее число: появилось в t0, поднимается 0,9 с. */
const num = (S, t, t0, x, y, s, col, big) => { if (t >= t0 && t < t0 + 0.9) S.texts.push([x, y - (t - t0) * 30, s, col, big, 1 - (t - t0) / 0.9]); };
const tip = (h, dir) => [h.x + dir * 13, h.y - 58];   // навершие посоха

// ---------------------------------------------------------------- сцены умений: (t) → что нарисовать
const SC = {
  // ===== воин
  charge: { P: 2.6, cls: 'warrior', mobs: () => [mob(225, 112)], fn(S, t) {
    const h = S.hero, m = S.mobs[0], x0 = 60, x1 = 196; h.x = x0; h.y = 112;
    if (t > 0.3 && t < 0.62) { const q = (t - 0.3) / 0.32; h.x = x0 + (x1 - x0) * q * q; h.mode = 'walk'; h.f = Math.floor(t * 40) % 8; for (let k = 1; k <= 4; k++) { const qq = Math.max(0, q - k * 0.12); S.ghosts.push({ x: x0 + (x1 - x0) * qq * qq, y: h.y, a: 0.32 - k * 0.07 }); } for (let k = 0; k < 4; k++) S.under.push(g => V.dashDust(g, { x: x0 + (x1 - x0) * (k / 4) ** 2, y: h.y, seed: k + 3 }, t - 0.3 - k * 0.08)); }
    else if (t >= 0.62) { h.x = x1; const f = atkF(t, 0.62, 0.32); if (f >= 0) { h.mode = 'atk'; h.f = f; } }
    if (t >= 0.62) { S.over.push(g => V.impact(g, { x: m.x - 8, y: m.y, seed: 11 }, t - 0.62)); if (t < 0.8) m.hurt = 1; m.hp = 0.6; if (t < 2.4) S.over.push(g => V.stunStars(g, m.x, m.y - 64, t)); num(S, t, 0.66, m.x, m.y - 72, '182', '#ffd34d', true); }
  } },
  whirl: { P: 2.6, cls: 'warrior', mobs: () => [mob(95, 95, 'wolf'), mob(210, 100), mob(155, 150, 'wolf')], fn(S, t) {
    const h = S.hero; h.x = 150; h.y = 118;
    if (t > 0.2 && t < 1.5) { const k = Math.floor(t / 0.06) % 4; h.view = ['front', 'side', 'back', 'side'][k]; h.dir = k === 3 ? -1 : 1; h.mode = 'atk'; h.f = 3; S.under.push(g => V.whirl(g, { x: h.x, y: h.y, r: 92, dur: 1.3, seed: 4 }, t - 0.2, 'back')); S.over.push(g => V.whirl(g, { x: h.x, y: h.y, r: 92, dur: 1.3, seed: 4 }, t - 0.2, 'front'));
      S.mobs.forEach((m, i) => { const ph = (t - 0.2 + i * 0.1) % 0.4; if (ph < 0.08) m.hurt = 1; m.hp = 1 - (t - 0.2) * 0.4; if (ph < 0.02) S.hits.push([m, t]); }); }
    S.mobs.forEach((m, i) => { for (let k = 0; k < 4; k++) num(S, t, 0.3 + k * 0.4 + i * 0.1, m.x, m.y - 70, String(40 + i * 3 + k), '#fff'); });
  } },
  crush: { P: 2.8, cls: 'warrior', mobs: () => [mob(190, 112)], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 150; h.y = 112; const f = atkF(t, 0.15, 0.4); if (f >= 0) { h.mode = 'atk'; h.f = f; }
    if (t > 0.38) { S.under.push(g => V.crush(g, { x: m.x - 4, y: m.y, seed: 21, dir: 0 }, t - 0.38)); m.hp = 0.55 - Math.min(0.3, (t - 0.38) * 0.12); if (t < 0.5) m.hurt = 1; if (t < 2.6) S.over.push(g => V.wound(g, m.x, m.y, t, 5, 40)); num(S, t, 0.42, m.x, m.y - 74, '216', '#ffd34d', true); for (let k = 0; k < 4; k++) num(S, t, 0.9 + k * 0.45, m.x + 10, m.y - 64, '30', '#ff5a5a'); }
  } },
  thirst: { P: 2.6, cls: 'warrior', mobs: () => [mob(205, 115, 'wolf')], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 165; h.y = 115; m.hp = t < 0.25 ? 0.1 : 0;
    const f = atkF(t, 0.05, 0.3); if (f >= 0) { h.mode = 'atk'; h.f = f; }
    if (t > 0.25) { m.mode = 'dead'; m.f = fr((t - 0.25) / 0.6, 4); m.view = 'side'; }
    if (t > 0.4) S.over.push(g => V.thirst(g, { x: m.x, y: m.y, tx: h.x, ty: h.y, seed: 8 }, t - 0.4));
    num(S, t, 1.0, h.x, h.y - 78, '+5% здоровья', '#7cff7c', true);
  } },
  berserk: { P: 4.2, cls: 'warrior', mobs: () => [mob(205, 112)], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 168; h.y = 112;
    if (t > 0.2 && t < 1.1) S.under.push(g => V.berserkCast(g, { x: h.x, y: h.y, seed: 3 }, t - 0.2));
    const k = Math.min(1, Math.max(0, (t - 0.25) / 0.3)) * Math.min(1, (3.9 - t) / 0.4);
    if (k > 0) { S.under.push(g => V.berserkAura(g, h.x, h.y, t, k)); S.overHero.push(g => V.berserkAura(g, h.x, h.y + 3, t + 0.5, k * 0.3, 9)); }
    if (t > 0.9 && t < 3.7) { const ph = (t - 0.9) % 0.55, f = fr(ph / 0.32); if (ph < 0.32) { h.mode = 'atk'; h.f = f; } if (ph > 0.18 && ph < 0.26) m.hurt = 1; m.hp = Math.max(0.2, 1 - (t - 0.9) * 0.25); }
    for (let i = 0; i < 5; i++) num(S, t, 1.1 + i * 0.55, m.x, m.y - 72, String(58 + i * 4), '#ffb070');
    if (t > 0.25 && t < 1) S.texts.push([h.x, h.y - 84 - (t - 0.25) * 12, 'Ярость!', '#ff5a3a', true, 1 - Math.max(0, t - 0.7) / 0.3]);
  } },
  // ===== маг
  fireball: { P: 2.4, cls: 'mage', mobs: () => [mob(240, 112, 'wolf')], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 60; h.y = 112; const [tx, ty] = tip(h, 1);
    if (t < 0.45) { h.mode = 'atk'; h.f = fr(t / 0.45 * 0.6); S.over.push(g => V.channel(g, tx, ty, t / 0.45, 5)); }
    if (t >= 0.45 && t < 0.9) { const q = (t - 0.45) / 0.45, x = tx + (m.x - tx) * q, y = ty + (m.y - 20 - ty) * q - Math.sin(q * Math.PI) * 14; S.over.push(g => V.fireball(g, { x, y, vx: (m.x - tx) / 0.45, vy: (m.y - 20 - ty) / 0.45, big: true }, t)); }
    if (t >= 0.9) { S.over.push(g => V.explosion(g, { x: m.x, y: m.y, seed: 9, big: true }, t - 0.9)); if (t < 1.0) m.hurt = 1; m.hp = 0.45; if (t < 2.3) S.over.push(g => V.burning(g, m.x, m.y, t, 4, Math.min(1, (t - 0.95) * 3))); num(S, t, 0.92, m.x, m.y - 72, '264', '#ffd34d', true); }
  } },
  frost: { P: 2.4, cls: 'mage', mobs: () => [mob(240, 112)], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 60; h.y = 112; const [tx, ty] = tip(h, 1);
    if (t < 0.4) { h.mode = 'atk'; h.f = fr(t / 0.4 * 0.6); S.over.push(g => V.channel(g, tx, ty, t / 0.4, 6, '140,200,255')); }
    if (t >= 0.4 && t < 0.8) { const q = (t - 0.4) / 0.4; S.over.push(g => V.frostBolt(g, { x: tx + (m.x - tx) * q, y: ty + (m.y - 22 - ty) * q, vx: (m.x - tx) / 0.4, vy: (m.y - 22 - ty) / 0.4 }, t)); }
    if (t >= 0.8) { S.over.push(g => V.frostHit(g, { x: m.x, y: m.y, seed: 3 }, t - 0.8)); if (t < 2.3) S.under.push(g => V.chilled(g, m.x, m.y, t, 2)); m.hp = 0.7; if (t < 0.9) m.hurt = 1; m.mode = 'walk'; m.f = Math.floor(t * 4) % 8; num(S, t, 0.82, m.x, m.y - 72, '121', '#9ad0ff', true); }
  } },
  pillar: { P: 6.4, cls: 'mage', mobs: () => [mob(205, 95, 'wolf'), mob(250, 120), mob(200, 140, 'wolf')], fn(S, t) {
    const h = S.hero, cx = 220, cy = 120; h.x = 70; h.y = 115; const [tx, ty] = tip(h, 1);
    if (t < 0.4) { h.mode = 'atk'; h.f = fr(t / 0.4 * 0.6); S.over.push(g => V.channel(g, tx, ty, t / 0.4, 7)); }
    if (t > 0.4) { S.under.push(g => V.pillar(g, { x: cx, y: cy, r: 62, dur: 5.6, seed: 4 }, t - 0.4, 'back')); S.over.push(g => V.pillar(g, { x: cx, y: cy, r: 62, dur: 5.6, seed: 4 }, t - 0.4, 'front')); }
    if (t > 0.9 && t < 5.9) S.mobs.forEach((m, i) => { m.hp = Math.max(0.1, 1 - (t - 0.9) * 0.17); const ph = (t + i * 0.3) % 1; if (ph < 0.08) m.hurt = 1; S.over.push(g => V.burning(g, m.x, m.y, t + i, 7 + i, 0.7)); for (let k = 0; k < 5; k++) num(S, t, 1 + k + i * 0.3, m.x, m.y - 70, '44', '#ffb070'); });
  } },
  ignite: { P: 2.4, cls: 'mage', mobs: () => [mob(235, 112, 'wolf')], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 60; h.y = 112; const [tx, ty] = tip(h, 1);
    if (t < 0.3) { h.mode = 'atk'; h.f = fr(t / 0.3); }
    if (t > 0.2 && t < 0.55) { const q = (t - 0.2) / 0.35; S.over.push(g => V.fireball(g, { x: tx + (m.x - tx) * q, y: ty + (m.y - 20 - ty) * q, vx: (m.x - tx) / 0.35, vy: (m.y - 20 - ty) / 0.35 }, t)); }
    if (t >= 0.55) { S.over.push(g => V.critBurst(g, { x: m.x, y: m.y, seed: 5 }, t - 0.55)); S.over.push(g => V.igniteFlash(g, { x: m.x, y: m.y, seed: 6 }, t - 0.6)); if (t > 0.6 && t < 2.3) S.over.push(g => V.burning(g, m.x, m.y, t, 8)); if (t < 0.65) m.hurt = 1; m.hp = 0.5; num(S, t, 0.56, m.x, m.y - 74, '210!', '#ffd34d', true); for (let k = 0; k < 3; k++) num(S, t, 1 + k * 0.45, m.x + 8, m.y - 62, '28', '#ffb070'); }
    if (t > 0.6 && t < 1.4) S.texts.push([m.x, m.y - 96, 'возгорание', '#ff9a40', false, 1]);
  } },
  nova: { P: 3.8, cls: 'mage', mobs: () => [mob(90, 100, 'wolf'), mob(225, 95), mob(110, 150), mob(215, 150, 'wolf')], fn(S, t) {
    const h = S.hero; h.x = 155; h.y = 120; h.view = 'front';
    if (t < 0.35) { h.mode = 'atk'; h.f = fr(t / 0.35 * 0.7); S.over.push(g => V.channel(g, h.x + 13, h.y - 58, t / 0.35, 9, '170,220,255')); }
    if (t > 0.35) S.under.push(g => V.nova(g, { x: h.x, y: h.y, r: 150, seed: 6 }, t - 0.35));
    S.mobs.forEach(m => { if (t > 0.55 && t < 3.4) { const a = Math.min(1, (t - 0.55) * 6) * Math.min(1, (3.4 - t) * 3); S.over.push(g => V.iceBlock(g, m.x, m.y + 4, m.kind === 'wolf' ? 52 : 40, m.kind === 'wolf' ? 46 : 64, t, a)); m.hp = 0.8; } });
    if (t > 0.55 && t < 1.5) S.mobs.forEach(m => S.texts.push([m.x, m.y - 80, 'вмёрз', '#bfe6ff', false, 1]));
  } },
  // ===== лучник
  bleed: { P: 2.6, cls: 'archer', mobs: () => [mob(240, 112)], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 60; h.y = 112;
    if (t < 0.4) { h.mode = 'atk'; h.f = fr(t / 0.4); }
    if (t >= 0.38 && t < 0.6) { const q = (t - 0.38) / 0.22, sx = h.x + 14, sy = h.y - 32; S.over.push(g => V.arrow(g, { x: sx + (m.x - sx) * q, y: sy + (m.y - 28 - sy) * q, vx: 900, vy: 0 }, t, true)); }
    if (t >= 0.6) { S.over.push(g => V.bloodHit(g, { x: m.x, y: m.y, seed: 7, dir: 0 }, t - 0.6)); if (t < 0.7) m.hurt = 1; m.hp = 0.6 - Math.min(0.3, (t - 0.6) * 0.15); if (t < 2.4) S.over.push(g => V.wound(g, m.x, m.y, t, 4, 40)); num(S, t, 0.62, m.x, m.y - 74, '96', '#fff', true); for (let k = 0; k < 4; k++) num(S, t, 1 + k * 0.4, m.x + 8, m.y - 62, '34', '#ff5a5a'); }
  } },
  net: { P: 2.8, cls: 'archer', mobs: () => [mob(235, 112, 'wolf')], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 60; h.y = 112;
    if (t < 0.38) { h.mode = 'atk'; h.f = fr(t / 0.38); }
    if (t < 0.4) { m.mode = 'walk'; m.f = Math.floor(t * 12) % 8; m.x = 235 - t * 40; }
    else m.x = 219;
    if (t >= 0.38 && t < 0.78) { const q = (t - 0.38) / 0.4, sx = h.x + 14, sy = h.y - 32, x = sx + (m.x - sx) * q, y = sy + (m.y - 30 - sy) * q - Math.sin(q * Math.PI) * 30; S.over.push(g => V.netFly(g, { x, y }, t - 0.38)); }
    if (t >= 0.78 && t < 2.6) { S.over.push(g => V.netWrap(g, m.x, m.y, 50, 38, t)); if (t < 1.4) S.texts.push([m.x, m.y - 74, 'в сети', '#e8e0cc', false, 1]); m.mode = 'walk'; m.f = Math.floor(t * 20) % 2; }
  } },
  volley: { P: 4.4, cls: 'archer', mobs: () => [mob(205, 100, 'wolf'), mob(250, 125), mob(195, 140, 'wolf')], fn(S, t) {
    const h = S.hero; h.x = 60; h.y = 120;
    if (t < 0.4) { h.mode = 'atk'; h.view = 'back'; h.f = fr(t / 0.4); }
    if (t > 0.1) S.under.push(g => V.volley(g, { x: 222, y: 122, hx: h.x, hy: h.y, r: 70, dur: 3, seed: 3 }, t - 0.1));
    if (t > 0.6 && t < 3.3) S.mobs.forEach((m, i) => { const ph = (t * 1.7 + i * 0.37) % 1; if (ph < 0.1) m.hurt = 1; m.hp = Math.max(0.2, 1 - (t - 0.6) * 0.26); for (let k = 0; k < 5; k++) num(S, t, 0.7 + k * 0.5 + i * 0.17, m.x, m.y - 70, '24', '#fff'); });
  } },
  execute: { P: 2.4, cls: 'archer', mobs: () => [mob(235, 112)], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 60; h.y = 112; m.hp = t < 0.7 ? 0.3 : 0;
    if (t < 0.7) S.over.push(g => V.executeMark(g, m.x, m.y - 18, t, 1.2));
    if (t < 0.4) { h.mode = 'atk'; h.f = fr(t / 0.4); }
    if (t >= 0.4 && t < 0.62) { const q = (t - 0.4) / 0.22, sx = h.x + 14, sy = h.y - 32; S.over.push(g => V.arrow(g, { x: sx + (m.x - sx) * q, y: sy + (m.y - 28 - sy) * q, vx: 900, vy: 0 }, t)); }
    if (t >= 0.62) { S.over.push(g => V.critBurst(g, { x: m.x, y: m.y - 14, seed: 3 }, t - 0.62)); m.mode = 'dead'; m.f = fr((t - 0.62) / 0.5, 4); num(S, t, 0.64, m.x, m.y - 78, '188!', '#ffd34d', true); }
  } },
  trap: { P: 3.4, cls: 'archer', mobs: () => [mob(270, 115, 'wolf')], fn(S, t) {
    const h = S.hero, m = S.mobs[0]; h.x = 70; h.y = 115; const TX = 180, TY = 118;
    if (t < 0.35) { h.mode = 'atk'; h.view = 'front'; h.f = fr(t / 0.35); }
    const snap = 1.25, open = t < snap ? 1 : Math.max(0, 1 - (t - snap) / 0.06);
    if (t > 0.3 && t < 3.2) S.under.push(g => { g.globalAlpha = Math.min(1, (t - 0.3) * 4) * Math.min(1, (3.2 - t) * 3); V.trap(g, TX, TY, open, t); g.globalAlpha = 1; });
    if (t < snap) { m.mode = 'walk'; m.f = Math.floor(t * 12) % 8; m.x = 270 - Math.max(0, t - 0.4) * (90 / 0.85); m.x = Math.max(TX + 4, m.x); }
    else { m.x = TX + 4; m.mode = 'walk'; m.f = Math.floor(t * 18) % 2; S.over.push(g => V.trapSnap(g, { x: TX, y: TY, seed: 4 }, t - snap)); if (t < 3) S.over.push(g => V.wound(g, m.x, m.y, t, 9, 26)); m.hp = Math.max(0.3, 0.8 - (t - snap) * 0.2); if (t < snap + 0.1) m.hurt = 1; if (t < snap + 1) S.texts.push([m.x, m.y - 72, 'в капкане', '#e8e0cc', false, 1]); }
  } },
};

// ---------------------------------------------------------------- отрисовка окошка
function render(cv, id, t) {
  const sc = SC[id], g = cv.getContext('2d');
  const S = { hero: { x: 60, y: 112, dir: 1, view: 'side', mode: 'idle', f: 0, hurt: 0 }, mobs: sc.mobs(), under: [], over: [], overHero: [], ghosts: [], texts: [], hits: [] };
  sc.fn(S, t);
  g.setTransform(DPR * ZK, 0, 0, DPR * ZK, 0, 0); g.clearRect(0, 0, SW, SH); g.drawImage(ground(), 0, 0, SW, SH);
  for (const f of S.under) f(g);
  const L = LOOKS[sc.cls];
  for (const gh of S.ghosts) { g.globalAlpha = gh.a; const sp = personSpr(L, 'side', 'walk', 2); drawFrame(g, sp, gh.x, gh.y, 1, 1.15); g.globalAlpha = 1; }
  const list = [...S.mobs.map(m => ({ y: m.y, m })), { y: S.hero.y, h: 1 }].sort((a, b) => a.y - b.y);
  for (const o of list) { if (o.h) { drawPerson(g, S.hero, L); for (const f of S.overHero) f(g); } else drawMob(g, o.m); }
  for (const f of S.over) f(g);
  for (const [x, y, s, col, big, a] of S.texts) { g.globalAlpha = Math.max(0, Math.min(1, a)); float(g, x, y, s, col, big); g.globalAlpha = 1; }
}

// ---------------------------------------------------------------- страница
const ALL = {};
for (const cls of ['warrior', 'mage', 'archer']) for (const A of [...CLASSES[cls].abils, ...NEW_ABILS[cls]]) ALL[A.id] = { ...A, cls, icon: A.icon === 'fire' ? 'fireball' : A.icon };
const box = $('#classes'), stages = [];
for (const cls of ['warrior', 'mage', 'archer']) {
  const C = CLASSES[cls], h = document.createElement('h2'); h.innerHTML = `<span class="dot" style="background:${C.color}"></span>${C.name}`; box.append(h);
  const row = document.createElement('div'); row.className = 'cards'; box.append(row);
  const ab = [...C.abils, ...NEW_ABILS[cls]];
  // обычный удар — иконка
  const atk = document.createElement('div'); atk.className = 'card'; atk.innerHTML = `<div class="head"><img src="${iconUrl('atk_' + cls)}"><div><b>Обычный удар</b><span class="tag">Пробел</span><span class="tag l">с 1 ур.</span></div></div><small>Новая иконка обычного удара. Анимация удара — тело героя, как сейчас (её переделаем в следующих версиях вместе с ходьбой).</small>`; row.append(atk);
  for (const A of ab) {
    const id = A.id, pas = A.key === 'passive', icon = ALL[id].icon;
    const c = document.createElement('div'); c.className = 'card';
    c.innerHTML = `<div class="head"><img src="${iconUrl(icon, pas)}"><div><b>${A.name}</b><span class="tag ${pas ? 'p' : ''}">${pas ? 'пассивное' : A.key}</span><span class="tag l">с ${A.lvl} ур.</span></div></div><small>${A.d}</small>`;
    const cv = document.createElement('canvas'); cv.width = SW * ZK * DPR; cv.height = SH * ZK * DPR; c.append(cv); row.append(c);
    const st = { cv, id, t0: performance.now() / 1000 - Math.random() * 0.5 }; cv.onclick = () => { st.t0 = performance.now() / 1000; }; stages.push(st);
  }
}
// было — стало
const OLD = { charge: 'charge', whirl: 'whirl', fireball: 'fire', frost: 'frost', bleed: 'bleed', net: 'net' };
const oldBox = $('#old');
for (const [id, k] of Object.entries(OLD)) { const s = document.createElement('span'); const svg = ABIL_ICON[k] || ''; s.innerHTML = `<div style="display:flex;gap:6px">${svg.startsWith('<svg') ? svg : `<span style="width:48px;height:48px;display:inline-block;background:#120c08;border-radius:8px"></span>`}<img src="${iconUrl(ALL[id].icon)}"></div>${ALL[id].name}`; oldBox.append(s); }

// окно талантов
let twCls = 'warrior', lvl = 17; const picks = { warrior: { 10: 'quake', 15: 'deepWound' }, mage: { 10: 'split' }, archer: { 10: 'ricochet', 15: 'hail' } };
function drawTW() {
  const C = CLASSES[twCls], ab = [...C.abils, ...NEW_ABILS[twCls]], T = TALENTS[twCls], used = Object.keys(picks[twCls]).length, avail = T.filter(r => r.lvl <= lvl).length;
  $('#tw').innerHTML = `<h3>${C.name} · ${lvl} уровень <span class="pts">· талантов выбрано ${used} из ${avail}</span></h3>
    <div class="tabs">${['warrior', 'mage', 'archer'].map(c => `<button data-c="${c}" class="${c === twCls ? 'on' : ''}">${CLASSES[c].name}</button>`).join('')}<button data-l="-1">− уровень</button><button data-l="1">+ уровень</button></div>
    <div class="abrow">${ab.map(A => `<span class="ab ${A.lvl > lvl ? 'lock' : ''}"><img src="${iconUrl(ALL[A.id].icon, A.key === 'passive')}">${A.name}<br>${A.key === 'passive' ? 'само' : A.key} · ${A.lvl} ур.</span>`).join('')}</div>
    ${T.map(r => `<div class="trow ${r.lvl > lvl ? 'lock' : ''}"><div class="lv">${r.lvl}</div>${r.opts.map(o => { const on = picks[twCls][r.lvl] === o.id, off = picks[twCls][r.lvl] && !on; return `<button class="tal ${on ? 'on' : ''} ${off ? 'off' : ''}" data-r="${r.lvl}" data-o="${o.id}"><img src="${iconUrl(ALL[o.ab].icon, ALL[o.ab].key === 'passive')}"><span><b>${o.name}</b><small>${o.d}</small></span></button>`; }).join('')}</div>`).join('')}
    <p class="note">Сброс всех талантов — у наставника в Столице за ${(50 + lvl * 20)} меди. Таланты в ряду, до которого герой ещё не дорос, видны, но закрыты.</p>`;
  $('#tw').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { twCls = b.dataset.c; drawTW(); });
  $('#tw').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { lvl = Math.max(1, Math.min(20, lvl + +b.dataset.l)); drawTW(); });
  $('#tw').querySelectorAll('.tal').forEach(b => b.onclick = () => { const r = +b.dataset.r; if (r > lvl) return; picks[twCls][r] = b.dataset.o; drawTW(); });
}
drawTW();

// кнопки телефона
const ICONIMG = {}; const img = (id, p) => { const k = id + p; if (!ICONIMG[k]) { const i = new Image(); i.src = iconUrl(id, p); ICONIMG[k] = i; } return ICONIMG[k]; };
function drawPhone(t) {
  const cv = $('#phone'), g = cv.getContext('2d'), W = 844, H = 390; g.setTransform(2, 0, 0, 2, 0, 0);
  g.drawImage(ground(), 0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 0, W, H);
  drawPerson(g, { x: 380, y: 230, dir: 1, view: 'side', mode: 'idle', f: 0 }, LOOKS.warrior); drawMob(g, mob(470, 225, 'wolf'));
  // джойстик
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.beginPath(); g.arc(110, 290, 56, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(126, 280, 24, 0, 7); g.fill();
  const btn = (id, x, y, r, p, cd, key) => {
    g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); const im = img(id, p); if (im.complete) g.drawImage(im, x - r * 1.15, y - r * 1.15, r * 2.3, r * 2.3);
    if (cd) { g.fillStyle = 'rgba(0,0,0,.62)'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + cd * 6.283); g.closePath(); g.fill(); g.font = `bold ${r * 0.6}px Georgia`; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(String(Math.ceil(cd * 8)), x, y + r * 0.2); }
    g.restore(); g.strokeStyle = '#e7c35a'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    if (key) { g.font = 'bold 11px Georgia'; g.fillStyle = '#ffe9a8'; g.textAlign = 'center'; g.fillText(key, x, y + r + 12); }
  };
  const cx = 760, cy = 300; btn('atk_warrior', cx, cy, 46);
  const arc = [['charge', 'C'], ['whirl', 'V', 0.4], ['crush', 'R'], ['berserk', 'F', ((t * 0.1) % 1)]];
  arc.forEach(([id, k, cd], i) => { const an = Math.PI + 0.2 + i * 0.42, x = cx + Math.cos(an) * 100, y = cy + Math.sin(an) * 100; btn(id, x, y, 27, false, cd, k); });
  // аксессуар, зелье, сесть — маленькие сверху
  for (const [i, s] of ['1', 'Q', 'Сесть'].entries()) { const x = 690 + i * 56, y = 80; g.fillStyle = 'rgba(30,20,12,.8)'; g.strokeStyle = '#a8865a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#ffe9a8'; g.font = '12px Georgia'; g.textAlign = 'center'; g.fillText(s, x, y + 4); }
}

// цикл
function tick() {
  const now = performance.now() / 1000;
  for (const s of stages) { const r = s.cv.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) continue; const P = SC[s.id].P; render(s.cv, s.id, (now - s.t0) % P); }
  drawPhone(now);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__sk = { SC, render, stages };
