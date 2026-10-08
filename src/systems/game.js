// Ход игры: герой, мобы, бой, добыча, смерть. Без рисования — его делает engine/render.js.
// Всё, что должен увидеть или услышать игрок, складывается в G.ev (события) и G.fx (эффекты).
import { CLASSES } from '../../data/classes.js';
import { MOBS } from '../../data/mobs.js';
import { HERO, MOBL, RESPAWN, LEASH, AGGRO, LOOT, armorCut, xpKill, lvlColor, xpNeed } from '../../data/balance.js';
import { heroStats, addXp } from '../entities/hero.js';
import { rollDrop } from './items.js';
import { moveTo, inCity } from '../world/world.js';
import { dist, clamp } from '../engine/util.js';

export function createGame(hero, W, opts = {}) {
  const st = heroStats(hero);
  const start = hero.pos && W.inside(hero.pos.x, hero.pos.y) ? hero.pos : { x: W.cap.x + 60, y: W.cap.y + 120 };
  const G = {
    W, hero, t: hero.worldT || 0, st, rand: opts.rand || Math.random,
    P: {
      x: start.x, y: start.y, hp: hero.hp == null ? st.maxHp : Math.min(hero.hp, st.maxHp), face: 0, dir: 1,
      cd: 0, abCd: 0, potCd: 0, target: null, lastCombat: -99, weak: 0, poison: null, slow: 0,
      whirl: 0, whirlT: 0, volley: 0, swing: 0, shot: 0, dead: false, moving: false, hurt: 0, step: 0,
    },
    mobs: [], shots: [], ev: [], fx: [], drops: [],
  };
  if (G.P.hp <= 0) G.P.hp = Math.round(st.maxHp * 0.5);
  for (const camp of W.camps) for (const s of camp.spawns) {
    const m = spawnMob(G, s, camp);
    const at = hero.dead[s.key];
    if (at && at > G.t) { m.state = 'dead'; m.respawnAt = at; }
    G.mobs.push(m);
  }
  return G;
}

function spawnMob(G, s, camp) {
  const D = MOBS[s.kind];
  const max = Math.round(MOBL.hp(s.lvl) * D.hp);
  return {
    key: s.key, kind: s.kind, D, lvl: s.lvl, camp,
    x: s.x, y: s.y, hx: s.x, hy: s.y, r: D.r,
    hp: max, max, dmg: MOBL.dmg(s.lvl) * D.dmg, armor: MOBL.armor(s.lvl),
    state: 'idle', cd: 0, face: G.rand() < 0.5 ? -1 : 1, hurt: 0,
    wander: { t: G.rand() * 4, x: s.x, y: s.y }, burn: null, fled: false, flee: 0,
    charge: { cd: 2, t: 0 }, smash: { t: D.smash ? D.smash.every : 0, wind: 0, x: 0, y: 0 }, anim: G.rand() * 10,
  };
}

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
export const refreshStats = G => { G.st = heroStats(G.hero); G.P.hp = Math.min(G.P.hp, G.st.maxHp); };

// ---------------------------------------------------------------- шаг игры
export function update(G, dt, I) {
  G.t += dt; const P = G.P, H = G.hero;
  H.stats.play += dt;
  P.cd = Math.max(0, P.cd - dt); P.abCd = Math.max(0, P.abCd - dt); P.potCd = Math.max(0, P.potCd - dt);
  P.weak = Math.max(0, P.weak - dt); P.slow = Math.max(0, P.slow - dt); P.hurt = Math.max(0, P.hurt - dt);
  P.swing = Math.max(0, P.swing - dt); P.shot = Math.max(0, P.shot - dt); P.volley = Math.max(0, P.volley - dt);

  if (!P.dead) {
    // движение
    let mx = I.mx || 0, my = I.my || 0; const m = Math.hypot(mx, my);
    if (m > 1) { mx /= m; my /= m; }
    P.moving = m > 0.05;
    if (P.moving) {
      const sp = HERO.speed * (P.slow > 0 ? 0.6 : 1) * (P.whirl > 0 ? 0.8 : 1);
      [P.x, P.y] = moveTo(G.W, P.x, P.y, P.x + mx * sp * dt, P.y + my * sp * dt);
      if (Math.abs(mx) > 0.1) P.dir = mx < 0 ? -1 : 1;
      P.step += dt * sp / 40;
    }
    // яд
    if (P.poison) { P.poison.t -= dt; hurtHero(G, P.poison.dps * dt, null, true); if (P.poison.t <= 0) P.poison = null; }
    // отдых
    const city = inCity(G.W, P.x, P.y);
    if (G.t - P.lastCombat > HERO.outOfCombat || city) P.hp = Math.min(G.st.maxHp, P.hp + G.st.maxHp * (city ? HERO.regenCity : HERO.regenOut) * dt);
    // цель кликом
    if (I.pick) pickTarget(G, I.pick.x, I.pick.y);
    if (I.tabTarget) tabTarget(G);
    if (P.target && (P.target.state === 'dead')) P.target = null;
    // удар
    if ((I.attack || I.attackTap) && P.cd <= 0) heroAttack(G, !!I.attackTap);
    if (I.ability) useAbility(G);
    if (I.potion) drinkPotion(G);
    if (I.interact) interact(G);
    abilityTick(G, dt);
  }
  for (const mob of G.mobs) mobTick(G, mob, dt);
  shotsTick(G, dt);
  for (const f of G.fx) f.t -= dt;
  G.fx = G.fx.filter(f => f.t > 0);
  H.worldT = G.t;
}

// ---------------------------------------------------------------- герой бьёт
const C = G => CLASSES[G.hero.cls];
const hostile = m => m.state !== 'dead' && m.state !== 'return';

function pickTarget(G, x, y) {
  let best = null, bd = 60;
  for (const m of G.mobs) { if (m.state === 'dead') continue; const d = dist(x, y, m.x, m.y - m.r); if (d < bd + m.r) { bd = d; best = m; } }
  G.P.target = best;
}

// Tab: следующая ближайшая цель
function tabTarget(G) {
  const P = G.P, list = G.mobs.filter(m => hostile(m) && dist(P.x, P.y, m.x, m.y) < 520).sort((a, b) => dist(P.x, P.y, a.x, a.y) - dist(P.x, P.y, b.x, b.y));
  if (!list.length) return; const i = list.indexOf(P.target); P.target = list[(i + 1) % list.length];
}

function nearest(G, reach) {
  const P = G.P; let best = null, bd = reach;
  for (const m of G.mobs) { if (!hostile(m)) continue; const d = dist(P.x, P.y, m.x, m.y) - m.r; if (d < bd) { bd = d; best = m; } }
  return best;
}

function heroAttack(G, tap) {
  const P = G.P, A = C(G).attack;
  let t = P.target && hostile(P.target) ? P.target : null;
  const inReach = m => dist(P.x, P.y, m.x, m.y) - m.r <= A.reach;
  if (!t || !inReach(t)) {
    const n = nearest(G, A.reach);
    if (n) t = n;
    else { if (tap && t) emit(G, { k: 'toast', s: 'Слишком далеко', id: 'far' }); return; }
  }
  P.target = t; P.face = Math.atan2(t.y - P.y, t.x - P.x); P.dir = Math.cos(P.face) < 0 ? -1 : 1;
  P.cd = A.cd; P.lastCombat = G.t; sfx(G, A.sfx);
  if (A.kind === 'melee') { P.swing = 0.22; strike(G, t, G.st.hit, 'melee'); }
  else {
    P.shot = 0.2;
    fire(G, t, G.st.hit, A.kind);
    if (P.volley > 0) {
      let k = 0;
      for (const o of G.mobs) { if (k >= 2) break; if (o === t || !hostile(o) || dist(P.x, P.y, o.x, o.y) > A.reach) continue; fire(G, o, G.st.hit * 0.6, 'arrow'); k++; }
      if (k < 2) for (; k < 2; k++) fire(G, t, G.st.hit * 0.6, 'arrow', (k ? 1 : -1) * 0.12);
    }
  }
}

function fire(G, t, dmg, kind, spread = 0) {
  const P = G.P, A = C(G).attack, sp = kind === 'bolt' ? 520 : 900;
  const a = Math.atan2(t.y - t.r * 0.6 - P.y + 18, t.x - P.x) + spread;
  G.shots.push({ from: 'hero', kind, x: P.x, y: P.y - 18, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: (A.reach + 80) / sp, dmg, target: t, burn: kind === 'fire' });
}

/** Удар по мобу: промах, крит, броня, слабость. */
function strike(G, m, base, src, opt = {}) {
  if (m.state === 'dead') return;
  if (m.state === 'return') { emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 20, s: 'уклон', col: '#cfd8de' }); return; }
  const H = G.hero, d = m.lvl - H.lvl;
  if (!opt.sure && G.rand() < clamp(0.04 + 0.05 * d, 0.02, 0.4)) { emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 20, s: 'мимо', col: '#cfd8de' }); aggro(G, m); return; }
  let v = base * (0.9 + G.rand() * 0.2) * (G.P.weak > 0 ? HERO.deathWeakMul : 1) * (1 - armorCut(m.armor, H.lvl) * 0.5);
  const crit = !opt.noCrit && G.rand() < 0.1; if (crit) v *= 1.7;
  v = Math.max(1, v);
  m.hp -= v; m.hurt = 0.15;
  emit(G, { k: 'dmg', x: m.x, y: m.y - m.r * 2, v, crit });
  if (opt.burn) m.burn = { t: 3, dps: base * 0.3 };
  if (m.hp <= 0) { killMob(G, m); return; }
  aggro(G, m);
  if (m.D.trait === 'flee' && !m.fled && m.hp < m.max * 0.25) { m.fled = true; m.flee = 2.2; emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 26, s: 'убегает!', col: '#f5e05a' }); }
}

function aggro(G, m) {
  if (m.state === 'dead' || m.state === 'return' || G.P.dead) return;
  const was = m.state; m.state = 'chase'; G.P.lastCombat = G.t;
  if (was !== 'chase' && m.D.trait === 'pack') {
    for (const o of G.mobs) if (o !== m && o.camp === m.camp && o.state === 'idle' && dist(o.x, o.y, m.x, m.y) < 320) { o.state = 'chase'; }
  }
}

function killMob(G, m) {
  const H = G.hero, P = G.P;
  m.state = 'dead'; m.hp = 0; m.respawnAt = G.t + (m.D.rare ? RESPAWN.rare : RESPAWN.normal);
  H.dead[m.key] = m.respawnAt; H.stats.kills++;
  if (P.target === m) P.target = null;
  G.fx.push({ k: 'corpse', x: m.x, y: m.y, kind: m.kind, lvl: m.lvl, dir: m.face, t: 4, max: 4 });
  sfx(G, 'kill');
  // опыт
  const xp = xpKill(m.lvl, H.lvl, m.D.rare ? 3 : 1);
  if (xp) {
    const up = addXp(H, xp);
    emit(G, { k: 'txt', x: m.x, y: m.y - 46, s: `+${xp} опыта`, col: '#c8a0ff' });
    if (up) { const old = G.st.maxHp; G.st = heroStats(H); P.hp += G.st.maxHp - old; P.hp = G.st.maxHp; emit(G, { k: 'lvl', L: H.lvl }); sfx(G, 'levelUp'); }
  }
  // золото
  const g = Math.max(1, Math.round(m.lvl * m.D.gold * (LOOT.goldMin + G.rand() * (LOOT.goldMax - LOOT.goldMin))));
  H.gold += g; H.stats.gold += g;
  emit(G, { k: 'txt', x: m.x, y: m.y - 30, s: `+${g} золота`, col: '#ffd34d' });
  // вещь
  if (m.D.rare || G.rand() < LOOT.itemChance) {
    const it = rollDrop(H.cls, m.lvl, m.D.rare, G.rand);
    giveItem(G, it, m.x, m.y);
  }
}

export function giveItem(G, it, x, y) {
  const H = G.hero;
  H.stats.items++;
  if (H.bag.length < LOOT.bag) { H.bag.push(it); emit(G, { k: 'loot', it }); }
  else { G.drops.push({ x: x + 10, y: y + 10, it, t: 300 }); emit(G, { k: 'toast', s: 'Сумка полна — вещь осталась на земле', id: 'bagfull' }); }
}

// ---------------------------------------------------------------- умения и зелья
function useAbility(G) {
  const P = G.P, A = C(G).abil;
  if (P.abCd > 0) { emit(G, { k: 'toast', s: `${A.name}: ещё ${Math.ceil(P.abCd)} с`, id: 'abcd' }); return; }
  P.abCd = A.cd; P.lastCombat = G.t; sfx(G, A.sfx);
  const cls = G.hero.cls;
  if (cls === 'warrior') { P.whirl = 1.2; P.whirlT = 0; }
  if (cls === 'mage') {
    const t = (P.target && hostile(P.target)) ? P.target : nearest(G, 460);
    const a0 = t ? Math.atan2(t.y - P.y, t.x - P.x) : (P.dir < 0 ? Math.PI : 0);
    for (let i = -1; i <= 1; i++) { const a = a0 + i * 0.3; G.shots.push({ from: 'hero', kind: 'fire', x: P.x, y: P.y - 18, vx: Math.cos(a) * 460, vy: Math.sin(a) * 460, t: 1.1, dmg: G.st.hit * 2.2, burn: true }); }
  }
  if (cls === 'archer') { P.volley = 6; emit(G, { k: 'toast', s: 'Град стрел: 6 секунд по три стрелы', id: 'volley', kind: 'good' }); }
}

function abilityTick(G, dt) {
  const P = G.P;
  if (P.whirl > 0) {
    P.whirl -= dt; P.whirlT -= dt;
    if (P.whirlT <= 0) {
      P.whirlT = 0.3;
      for (const m of G.mobs) if (hostile(m) && dist(m.x, m.y, P.x, P.y) < 92 + m.r) strike(G, m, G.st.hit * 0.6, 'melee', { noCrit: true });
    }
  }
  for (const d of G.drops) d.t -= dt;
  G.drops = G.drops.filter(d => d.t > 0);
}

function drinkPotion(G) {
  const P = G.P, H = G.hero;
  if (H.potions <= 0) { emit(G, { k: 'toast', s: 'Зелий нет — купите на рынке в столице', id: 'pot' }); return; }
  if (P.potCd > 0) { emit(G, { k: 'toast', s: `Зелье: ещё ${Math.ceil(P.potCd)} с`, id: 'pot' }); return; }
  if (P.hp >= G.st.maxHp) { emit(G, { k: 'toast', s: 'Здоровье и так полное', id: 'pot' }); return; }
  H.potions--; P.potCd = LOOT.potionCd; P.poison = null;
  const v = G.st.maxHp * LOOT.potionHeal; P.hp = Math.min(G.st.maxHp, P.hp + v);
  emit(G, { k: 'txt', x: P.x, y: P.y - 50, s: `+${Math.round(v)}`, col: '#7cff7c' }); sfx(G, 'potion');
}

// ---------------------------------------------------------------- взаимодействие
export function interactTarget(G) {
  const P = G.P, c = G.W.cap;
  for (const b of c.buildings) { const x = c.x + b.dx, y = c.y + b.dy; if (dist(P.x, P.y, x, y + 40) < 95) return { k: 'b', b, x, y }; }
  for (const e of G.W.exits) if (dist(P.x, P.y, e.x, e.y) < 220) return { k: 'exit', e, x: e.x, y: e.y };
  for (const d of G.drops) if (dist(P.x, P.y, d.x, d.y) < 60) return { k: 'drop', d, x: d.x, y: d.y };
  return null;
}
function interact(G) {
  const t = interactTarget(G); if (!t) return;
  if (t.k === 'b') { if (t.b.vendor) emit(G, { k: 'vendor' }); else emit(G, { k: 'toast', s: `${t.b.name}. ${t.b.note}`, id: 'bld' }); }
  if (t.k === 'exit') emit(G, { k: 'toast', s: `Дорога в ${t.e.to} (ур. ${t.e.lvl}) откроется в следующих версиях`, id: 'exit' });
  if (t.k === 'drop') { if (G.hero.bag.length < LOOT.bag) { G.hero.bag.push(t.d.it); G.drops = G.drops.filter(d => d !== t.d); emit(G, { k: 'loot', it: t.d.it }); } else emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); }
}

// ---------------------------------------------------------------- урон герою и смерть
function hurtHero(G, v, m, dot) {
  const P = G.P; if (P.dead) return;
  if (!dot) { v *= (1 - armorCut(G.st.armor, G.hero.lvl)); P.hurt = 0.18; emit(G, { k: 'hdmg', v }); sfx(G, 'hurt'); }
  P.hp -= v; P.lastCombat = G.t;
  if (P.hp <= 0) heroDie(G);
}

function heroDie(G) {
  const P = G.P; P.hp = 0; P.dead = true; P.target = null; P.poison = null; P.whirl = 0; P.volley = 0;
  G.hero.stats.deaths++;
  for (const m of G.mobs) if (m.state === 'chase') m.state = 'return';
  emit(G, { k: 'die' });
}

/** Возродиться у кладбища. */
export function respawnHero(G) {
  const P = G.P, g = G.W.graveyard;
  P.dead = false; P.x = g.x + 40; P.y = g.y + 70; P.hp = Math.round(G.st.maxHp * 0.5); P.weak = HERO.deathWeak; P.cd = 0;
  emit(G, { k: 'toast', s: `Слабость: ${HERO.deathWeak} с урон меньше`, id: 'weak' });
}

// ---------------------------------------------------------------- мобы
function mobTick(G, m, dt) {
  const P = G.P, H = G.hero;
  m.anim += dt; m.hurt = Math.max(0, m.hurt - dt);
  if (m.state === 'dead') {
    if (G.t >= m.respawnAt) { Object.assign(m, spawnMob(G, { key: m.key, kind: m.kind, lvl: m.lvl, x: m.hx, y: m.hy }, m.camp)); delete H.dead[m.key]; G.fx.push({ k: 'spawn', x: m.x, y: m.y, t: 0.6, max: 0.6 }); }
    return;
  }
  if (m.burn) { m.burn.t -= dt; m.hp -= m.burn.dps * dt; if (m.burn.t <= 0) m.burn = null; if (m.hp <= 0) { killMob(G, m); return; } }
  const dH = dist(m.x, m.y, P.x, P.y), dHome = dist(m.x, m.y, m.hx, m.hy);
  const go = (tx, ty, sp) => { const d = dist(m.x, m.y, tx, ty); if (d < 1) return; const k = Math.min(1, sp * dt / d); const nx = m.x + (tx - m.x) * k, ny = m.y + (ty - m.y) * k; if (G.W.inside(nx, ny) && !inCity(G.W, nx, ny)) { m.x = nx; m.y = ny; } if (Math.abs(tx - m.x) > 2) m.face = tx < m.x ? -1 : 1; };

  if (m.state === 'idle') {
    m.wander.t -= dt;
    if (m.wander.t <= 0) { const a = G.rand() * 6.28, r = G.rand() * (m.camp.r * 0.6); m.wander = { t: 3 + G.rand() * 5, x: m.hx + Math.cos(a) * r, y: m.hy + Math.sin(a) * r }; }
    go(m.wander.x, m.wander.y, m.D.speed * 0.25);
    if (m.hp < m.max) m.hp = Math.min(m.max, m.hp + m.max * 0.1 * dt);
    if (!P.dead && !inCity(G.W, P.x, P.y)) {
      const gray = lvlColor(m.lvl, H.lvl) === '#9a9a9a';
      const ar = AGGRO * clamp(1 + (m.lvl - H.lvl) * 0.1, 0.55, 1.6) * (gray ? 0.6 : 1);
      if (dH < ar) aggro(G, m);
    }
    return;
  }
  if (m.state === 'return') {
    go(m.hx, m.hy, m.D.speed * 1.4); m.hp = Math.min(m.max, m.hp + m.max * 0.5 * dt);
    if (dist(m.x, m.y, m.hx, m.hy) < 8) { m.state = 'idle'; m.hp = m.max; m.charge.t = 0; m.smash.wind = 0; }
    return;
  }
  // погоня
  if (P.dead || dHome > LEASH || inCity(G.W, P.x, P.y) && dH > 40) { m.state = 'return'; m.charge.t = 0; m.smash.wind = 0; if (P.target === m) P.target = null; return; }
  m.cd = Math.max(0, m.cd - dt);
  const D = m.D, reach = D.reach + m.r + 10;
  if (m.flee > 0) { m.flee -= dt; const a = Math.atan2(m.y - P.y, m.x - P.x); go(m.x + Math.cos(a) * 100, m.y + Math.sin(a) * 100, D.speed * 0.9); return; }
  // элитный удар по площади
  if (D.smash) {
    const S = m.smash;
    if (S.wind > 0) {
      S.wind -= dt;
      if (S.wind <= 0) {
        G.fx.push({ k: 'ring', x: S.x, y: S.y, r: 10, max: D.smash.r, t: 0.35, col: '#ffb347' }); sfx(G, 'smash');
        if (dist(P.x, P.y, S.x, S.y) < D.smash.r) hurtHero(G, m.dmg * D.smash.mul, m);
        S.t = D.smash.every;
      }
      return; // замахивается — стоит
    }
    S.t -= dt;
    if (S.t <= 0 && dH < 200) { S.wind = D.smash.wind; S.x = P.x; S.y = P.y; G.fx.push({ k: 'tele', x: S.x, y: S.y, r: D.smash.r, t: D.smash.wind, max: D.smash.wind }); emit(G, { k: 'txt', x: m.x, y: m.y - 60, s: 'замахивается!', col: '#ff8a2a' }); return; }
  }
  // кабан: разбег
  if (D.trait === 'charge') {
    const Ch = m.charge; Ch.cd -= dt;
    if (Ch.t > 0) {
      Ch.t -= dt; go(P.x, P.y, D.speed * 2.6);
      if (dist(m.x, m.y, P.x, P.y) < reach) { Ch.t = 0; Ch.cd = 6; m.cd = 1.2; hurtHero(G, m.dmg * 1.6, m); emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'таран!', col: '#ff8a2a' }); G.fx.push({ k: 'ring', x: P.x, y: P.y, r: 6, max: 40, t: 0.25, col: '#e8d7a8' }); }
      return;
    }
    if (Ch.cd <= 0 && dH > 130 && dH < 330) { Ch.t = 1.0; emit(G, { k: 'txt', x: m.x, y: m.y - 40, s: 'разбег', col: '#e8d7a8' }); return; }
  }
  // стрелок держит дистанцию
  if (D.trait === 'ranged') {
    if (dH > D.reach * 0.9) go(P.x, P.y, D.speed);
    else if (dH < 150) { const a = Math.atan2(m.y - P.y, m.x - P.x); go(m.x + Math.cos(a) * 60, m.y + Math.sin(a) * 60, D.speed * 0.8); }
    if (dH <= D.reach && m.cd <= 0) {
      m.cd = D.cd; m.face = P.x < m.x ? -1 : 1; const a = Math.atan2(P.y - 18 - (m.y - 18), P.x - m.x);
      G.shots.push({ from: 'mob', kind: 'arrow', x: m.x, y: m.y - 18, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, t: 0.9, dmg: m.dmg, m });
    }
    return;
  }
  if (dH > reach) go(P.x, P.y, D.speed);
  else if (m.cd <= 0) {
    m.cd = D.cd; m.face = P.x < m.x ? -1 : 1; m.bite = 0.2;
    hurtHero(G, m.dmg * (0.9 + G.rand() * 0.2), m);
    if (D.trait === 'poison' && !P.dead) { P.poison = { t: 6, dps: m.dmg * 0.18 }; P.slow = 3; emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'яд', col: '#8ad84a' }); }
  }
  if (m.bite) m.bite = Math.max(0, m.bite - dt);
}

function shotsTick(G, dt) {
  const P = G.P;
  for (const s of G.shots) {
    s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.from === 'hero') {
      for (const m of G.mobs) {
        if (m.state === 'dead') continue;
        if (dist(s.x, s.y, m.x, m.y - m.r * 0.8) < m.r + 10) { s.t = 0; strike(G, m, s.dmg, 'ranged', { burn: s.burn }); if (s.kind === 'fire') G.fx.push({ k: 'boom', x: s.x, y: s.y, t: 0.35, max: 0.35 }); break; }
      }
    } else if (!P.dead && dist(s.x, s.y, P.x, P.y - 16) < 22) { s.t = 0; hurtHero(G, s.dmg, s.m); }
  }
  G.shots = G.shots.filter(s => s.t > 0);
}

// ---------------------------------------------------------------- торговля
export const POTION_PRICE = L => 4 + L * 2;

export function sellItem(G, it) {
  const H = G.hero, i = H.bag.indexOf(it); if (i < 0) return;
  H.bag.splice(i, 1); H.gold += it.price; sfx(G, 'coin');
  emit(G, { k: 'toast', s: `Продано: ${it.name} за ${it.price} золота`, id: 'sell' });
}
export function buyPotion(G) {
  const H = G.hero, p = POTION_PRICE(H.lvl);
  if (H.gold < p) { emit(G, { k: 'toast', s: 'Не хватает золота', id: 'gold' }); return false; }
  if (H.potions >= 10) { emit(G, { k: 'toast', s: 'Больше 10 зелий не унести', id: 'pot' }); return false; }
  H.gold -= p; H.potions++; sfx(G, 'coin'); return true;
}
/** Надеть вещь из сумки (снятая уходит в сумку). */
export function equip(G, it) {
  const H = G.hero, i = H.bag.indexOf(it); if (i < 0 || it.cls !== H.cls) return;
  const old = H.eq[it.slot]; H.bag.splice(i, 1); H.eq[it.slot] = it;
  if (old && old.rar !== 'start') H.bag.push(old);
  const ratio = G.P.hp / G.st.maxHp; G.st = heroStats(H); G.P.hp = Math.max(1, Math.round(G.st.maxHp * ratio));
  sfx(G, 'equip');
}

export { xpNeed };
