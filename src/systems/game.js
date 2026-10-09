// Ход игры: герой, мобы, бой, добыча, смерть. Без рисования — его делает engine/render.js.
// Всё, что должен увидеть или услышать игрок, складывается в G.ev (события) и G.fx (эффекты).
import { CLASSES } from '../../data/classes.js';
import { MOBS } from '../../data/mobs.js';
import { HERO, MOBL, RESPAWN, LEASH, AGGRO, LOOT, ITEM, TRINKET_DROP, SHOP, armorCut, xpKill, lvlColor, xpNeed } from '../../data/balance.js';
import { TRINKETS } from '../../data/trinkets.js';
import { heroStats, addXp, attackOf } from '../entities/hero.js';
import { rollDrop, makeTrinket, makeItem } from './items.js';
import { initVeins, veinNear, startMine, stopMine, mineTick, addStack } from './mining.js';
import { moveTo, inCity } from '../world/world.js';
import { dist, clamp, money } from '../engine/util.js';

export function createGame(hero, W, opts = {}) {
  const st = heroStats(hero);
  const start = hero.pos && W.walkable(hero.pos.x, hero.pos.y) ? hero.pos : W.cap ? { x: W.cap.x + 40, y: W.cap.y + 260 } : (W.Z.arrive || { x: W.town.x, y: W.town.y + 60 });
  const G = {
    W, hero, t: hero.worldT || 0, st, rand: opts.rand || Math.random,
    P: {
      x: start.x, y: start.y, hp: hero.hp == null ? st.maxHp : Math.min(hero.hp, st.maxHp), face: 0, dir: 1,
      cd: 0, acd: {}, potCd: 0, target: null, sit: false, dash: null, atkT: 0, atkDur: 0.35, mvx: 0, mvy: 1, deadT: 0, lastCombat: -99, weak: 0, poison: null, slow: 0,
      whirl: 0, whirlT: 0, volley: 0, swing: 0, shot: 0, dead: false, moving: false, hurt: 0, step: 0,
      mine: null, tcd: 0, buf: { stone: 0, rage: 0, wind: 0, thorns: 0 },
    },
    mobs: [], shots: [], ev: [], fx: [], corpses: [], corpseSeq: 0,
  };
  if (G.P.hp <= 0) G.P.hp = Math.round(st.maxHp * 0.5);
  initVeins(G);
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
    wander: { t: G.rand() * 4, x: s.x, y: s.y }, burn: null, bleed: null, fled: false, flee: 0,
    stun: 0, root: 0, chill: 0, atkT: 0, atkDur: 0.35, walkPh: G.rand(), mdx: 0, mdy: 1, moving: false,
    charge: { cd: 2, t: 0 }, smash: { t: D.smash ? D.smash.every : 0, wind: 0, x: 0, y: 0 }, anim: G.rand() * 10,
  };
}

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
/** Начать анимацию удара героя (для рисования: доля = 1 − atkT/atkDur). */
const startAtk = (P, dur) => { P.atkT = dur; P.atkDur = dur; };
export const refreshStats = G => { G.st = heroStats(G.hero); G.P.hp = Math.min(G.P.hp, G.st.maxHp); };

// ---------------------------------------------------------------- шаг игры
export function update(G, dt, I) {
  G.t += dt; const P = G.P, H = G.hero;
  H.stats.play += dt;
  P.cd = Math.max(0, P.cd - dt); P.potCd = Math.max(0, P.potCd - dt);
  for (const k in P.acd) P.acd[k] = Math.max(0, P.acd[k] - dt);
  P.tcd = Math.max(0, P.tcd - dt); for (const k in P.buf) P.buf[k] = Math.max(0, P.buf[k] - dt);
  P.weak = Math.max(0, P.weak - dt); P.slow = Math.max(0, P.slow - dt); P.hurt = Math.max(0, P.hurt - dt);
  P.atkT = Math.max(0, P.atkT - dt); if (P.dead) P.deadT += dt;
  P.swing = Math.max(0, P.swing - dt); P.shot = Math.max(0, P.shot - dt); P.volley = Math.max(0, P.volley - dt);

  if (!P.dead) {
    // движение
    let mx = I.mx || 0, my = I.my || 0; const m = Math.hypot(mx, my);
    if (m > 1) { mx /= m; my /= m; }
    P.moving = m > 0.05 && !P.dash;
    if (P.moving || I.attack || I.attackTap || I.ability || I.ability2) { P.sit = false; if (P.mine) stopMine(G); }
    if (I.sit) { if (P.sit) P.sit = false; else if (G.t - P.lastCombat < 1.5) emit(G, { k: 'toast', s: 'В бою не присесть', id: 'sit' }); else P.sit = true; }
    if (P.dash) dashTick(G, dt);
    else if (P.moving) {
      const sp = HERO.speed * (P.slow > 0 ? 0.6 : 1) * (P.whirl > 0 ? 0.8 : 1) * (P.buf.wind > 0 ? 1.5 : 1);
      [P.x, P.y] = moveTo(G.W, P.x, P.y, P.x + mx * sp * dt, P.y + my * sp * dt);
      if (Math.abs(mx) > 0.1) P.dir = mx < 0 ? -1 : 1;
      P.step += dt * sp / 40; P.mvx = mx; P.mvy = my;
    }
    // яд
    if (P.poison) { P.poison.t -= dt; hurtHero(G, P.poison.dps * dt, null, true); if (P.poison && P.poison.t <= 0) P.poison = null; }
    // отдых
    const city = inCity(G.W, P.x, P.y);
    const rate = Math.max(city ? HERO.regenCity : 0, P.sit ? LOOT.sitRegen : 0, G.t - P.lastCombat > HERO.outOfCombat ? HERO.regenOut : 0);
    if (rate) P.hp = Math.min(G.st.maxHp, P.hp + G.st.maxHp * rate * dt);
    if (G.st.p && G.st.p.regen > 0) P.hp = Math.min(G.st.maxHp, P.hp + G.st.p.regen * dt);   // свойство вещей: всегда, и в бою
    // цель кликом
    if (I.pick) pickTarget(G, I.pick.x, I.pick.y);
    if (I.tabTarget) tabTarget(G);
    if (P.target && (P.target.state === 'dead')) P.target = null;
    // удар
    if ((I.attack || I.attackTap) && P.cd <= 0 && !P.dash && !P.sit) heroAttack(G, !!I.attackTap);
    if (I.ability) useAbility(G, 0);
    if (I.ability2) useAbility(G, 1);
    if (I.potion) drinkPotion(G);
    if (I.interact) interact(G);
    if (I.trinket) useTrinket(G);
    abilityTick(G, dt);
    mineTick(G, dt);
  }
  for (const mob of G.mobs) mobTick(G, mob, dt);
  if (G.mobs.some(m => m.gone)) G.mobs = G.mobs.filter(m => !m.gone);
  shotsTick(G, dt);
  for (const c of G.corpses) c.t -= dt;
  if (G.corpses.some(c => c.t <= 0)) G.corpses = G.corpses.filter(c => c.t > 0);
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
  const P = G.P, A = attackOf(G.hero);
  let t = P.target && hostile(P.target) ? P.target : null;
  const inReach = m => dist(P.x, P.y, m.x, m.y) - m.r <= A.reach;
  if (!t || !inReach(t)) {
    const n = nearest(G, A.reach);
    if (n) t = n;
    else { if (tap && t) emit(G, { k: 'toast', s: 'Слишком далеко', id: 'far' }); return; }
  }
  P.target = t; P.face = Math.atan2(t.y - P.y, t.x - P.x); P.dir = Math.cos(P.face) < 0 ? -1 : 1;
  P.cd = G.st.cd / (P.buf.rage > 0 ? 1.3 : 1); P.lastCombat = G.t; sfx(G, A.sfx);
  startAtk(P, A.kind === 'melee' ? 0.32 : 0.42);
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

/** Повесить кровотечение: повторный выстрел обновляет время, не складывается. */
function setBleed(G, m, b) {
  m.bleed = { n: Math.round(b.t), tick: 1, dmg: b.dmg };
  emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 26, s: 'кровоточит', col: '#ff6a6a' });
}

/** Удар по мобу: промах, крит, броня, слабость. */
function strike(G, m, base, src, opt = {}) {
  if (m.state === 'dead') return;
  if (m.state === 'return') { emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 20, s: 'уклон', col: '#cfd8de' }); return; }
  const H = G.hero, d = m.lvl - H.lvl;
  if (!opt.sure && G.rand() < clamp(0.04 + 0.05 * d, 0.02, 0.4)) { emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 20, s: 'мимо', col: '#cfd8de' }); aggro(G, m); return; }
  const st = G.st, pen = (st.p ? st.p.pen : 0) / 100;
  let v = opt.flat ? base : base * (0.9 + G.rand() * 0.2) * (G.P.weak > 0 ? HERO.deathWeakMul : 1) * (1 - armorCut(m.armor * (1 - pen), H.lvl) * 0.5);
  const crit = !opt.noCrit && G.rand() < (st.crit ?? ITEM.baseCrit) / 100; if (crit) v *= ITEM.critMul;
  v = Math.max(1, v);
  // вампиризм: часть нанесённого урона возвращается здоровьем
  if (st.p && st.p.vamp > 0 && !G.P.dead) G.P.hp = Math.min(st.maxHp, G.P.hp + v * st.p.vamp / 100);
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
  if (m.summon) { m.state = 'dead'; m.gone = true; m.hp = 0; if (P.target === m) P.target = null; sfx(G, 'kill'); const xp = Math.round(xpKill(m.lvl, H.lvl) * 0.3); if (xp) { addXp(H, xp); emit(G, { k: 'txt', x: m.x, y: m.y - 46, s: `+${xp} опыта`, col: '#c8a0ff' }); } return; }
  m.state = 'dead'; m.hp = 0; m.bleed = null; m.burn = null; m.respawnAt = G.t + (m.D.rare ? RESPAWN.rare : RESPAWN.normal);
  H.dead[m.key] = m.respawnAt; H.stats.kills++;
  if (P.target === m) P.target = null;
  sfx(G, 'kill');
  // опыт
  const xp = xpKill(m.lvl, H.lvl, m.D.rare ? 3 : 1);
  if (xp) {
    const up = addXp(H, xp);
    emit(G, { k: 'txt', x: m.x, y: m.y - 46, s: `+${xp} опыта`, col: '#c8a0ff' });
    if (up) { const old = G.st.maxHp; G.st = heroStats(H); P.hp += G.st.maxHp - old; P.hp = G.st.maxHp; emit(G, { k: 'lvl', L: H.lvl }); sfx(G, 'levelUp'); }
  }
  // добыча остаётся в теле: монеты (в меди) и вещи
  const money = Math.max(1, Math.round(m.lvl * m.D.gold * (LOOT.goldMin + G.rand() * (LOOT.goldMax - LOOT.goldMin))));
  const items = [];
  const ZL = G.W.Z.loot || {};
  if (m.D.rare || G.rand() < (ZL.chance ?? LOOT.itemChance)) items.push(rollDrop(H.cls, m.lvl, m.D.rare, G.rand, ZL));
  // аксессуар: только с вожаков, 10%, и гарантия — если 8 раз подряд не выпал, на 9-й точно
  if (m.D.rare) { H.tPity = H.tPity || 0; if (H.tPity >= TRINKET_DROP.pity || G.rand() < TRINKET_DROP.chance) { items.push(makeTrinket(H.cls, m.lvl, 'rare', G.rand)); H.tPity = 0; } else H.tPity++; }
  G.corpses.push({ id: ++G.corpseSeq, x: m.x, y: m.y, kind: m.kind, name: m.D.name, lvl: m.lvl, dir: m.face, vx: m.mdx, vy: m.mdy, t: LOOT.corpseT, money, items });
}

/** Тело, у которого ещё есть что взять. */
export const hasLoot = c => c.money > 0 || c.items.length > 0;

/** Взять монеты и вещь номер idx (или все вещи, если idx не задан). Возвращает, сколько вещей не влезло. */
export function lootTake(G, c, idx = null) {
  const H = G.hero; let left = 0;
  if (c.money > 0) { H.gold += c.money; H.stats.gold += c.money; emit(G, { k: 'coins', v: c.money }); sfx(G, 'coin'); c.money = 0; }
  const take = idx == null ? c.items.slice() : [c.items[idx]].filter(Boolean);
  for (const it of take) {
    if (H.bag.length >= LOOT.bag) { left++; continue; }
    bagAdd(H, it); H.stats.items++; c.items.splice(c.items.indexOf(it), 1); emit(G, { k: 'loot', it });
  }
  if (left) emit(G, { k: 'toast', s: 'Сумка полна — вещь осталась в теле', id: 'bagfull' });
  if (!hasLoot(c)) c.t = Math.min(c.t, 8);   // пустое тело скоро исчезает
  return left;
}
export const lootAll = (G, c) => lootTake(G, c, null);

/** Положить вещь в сумку (награды, проверки). Если места нет — вещь падает в тело-мешок рядом. */
export function giveItem(G, it, x, y) {
  const H = G.hero;
  if (H.bag.length < LOOT.bag) { bagAdd(H, it); H.stats.items++; emit(G, { k: 'loot', it }); }
  else G.corpses.push({ id: ++G.corpseSeq, x: x + 10, y: y + 10, kind: null, name: 'Мешок', lvl: 0, dir: 1, t: LOOT.corpseT, money: 0, items: [it] });
}

// ---------------------------------------------------------------- умения и зелья
/** Умения класса: 0 — с 1 уровня (C), 1 — с 5-го (V). */
export const abilsOf = h => CLASSES[h.cls].abils;
export const abilOpen = (h, i) => h.lvl >= abilsOf(h)[i].lvl;

function abilTarget(G, range) {
  const P = G.P, t = P.target && hostile(P.target) && dist(P.x, P.y, P.target.x, P.target.y) - P.target.r <= range ? P.target : nearest(G, range);
  return t;
}

function useAbility(G, i) {
  const P = G.P, H = G.hero, A = abilsOf(H)[i]; if (!A) return;
  if (!abilOpen(H, i)) { emit(G, { k: 'toast', s: `${A.name} откроется на ${A.lvl}-м уровне`, id: 'ablock' }); return; }
  if ((P.acd[A.id] || 0) > 0) { emit(G, { k: 'toast', s: `${A.name}: ещё ${Math.ceil(P.acd[A.id])} с`, id: 'abcd' }); return; }
  if (P.dash) return;
  const reach = attackOf(H).reach + 40;
  if (A.id === 'whirl') { P.whirl = 1.2; P.whirlT = 0; startAtk(P, 0.4); }
  else if (A.id === 'charge') {
    const t = abilTarget(G, A.range); if (!t) { emit(G, { k: 'toast', s: 'Рядом нет врага для рывка', id: 'abnt' }); return; }
    P.dash = { m: t, t: 0.6, A }; P.target = t; P.dir = t.x < P.x ? -1 : 1;
  } else {
    const t = abilTarget(G, Math.max(reach, 420)); if (!t) { emit(G, { k: 'toast', s: 'Нет цели рядом', id: 'abnt' }); return; }
    P.target = t; P.face = Math.atan2(t.y - P.y, t.x - P.x); P.dir = Math.cos(P.face) < 0 ? -1 : 1; P.shot = 0.2; startAtk(P, 0.42);
    const shot = (kind, dmg, spread, x) => { const a = Math.atan2(t.y - t.r * 0.6 - P.y + 18, t.x - P.x) + spread, sp = kind === 'arrow' ? 900 : kind === 'net' ? 600 : 520;
      G.shots.push(Object.assign({ from: 'hero', kind, x: P.x, y: P.y - 18, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 560 / sp + 0.3, dmg, target: t }, x)); };
    if (A.id === 'fireball') shot('fire', G.st.hit * A.mul, 0, { burn: true, big: true, chillBonus: 1.5 });
    if (A.id === 'frost') shot('frost', G.st.hit * A.mul, 0, { chill: A.chill });
    if (A.id === 'net') shot('net', G.st.hit * 0.3, 0, { root: A.root, sure: true });
    if (A.id === 'bleed') shot('arrow', G.st.hit * A.mul, 0, { bleed: { t: A.bleed.t, dmg: G.st.hit * A.bleed.mul }, red: true });
  }
  P.acd[A.id] = A.cd * (1 - ((G.st.p && G.st.p.cdr) || 0) / 100); P.lastCombat = G.t; P.sit = false; sfx(G, A.sfx);
}

// рывок: летим к цели, на месте — удар сильнее обычного и оглушение
function dashTick(G, dt) {
  const P = G.P, D = P.dash, m = D.m;
  D.t -= dt;
  if (m.state === 'dead' || D.t <= 0) { P.dash = null; return; }
  const d = dist(P.x, P.y, m.x, m.y), stop = m.r + 26;
  if (d > stop) { const k = Math.min(1, 900 * dt / d); const [nx, ny] = moveTo(G.W, P.x, P.y, P.x + (m.x - P.x) * k, P.y + (m.y - P.y) * k); P.moving = true; P.step += dt * 20;
    if (Math.hypot(nx - P.x, ny - P.y) < 0.5) { P.dash = null; return; } P.x = nx; P.y = ny; G.fx.push({ k: 'trail', x: P.x, y: P.y, t: 0.25, max: 0.25 }); return; }
  P.dash = null; P.swing = 0.22; startAtk(P, 0.32); P.cd = Math.max(P.cd, 0.4); P.face = Math.atan2(m.y - P.y, m.x - P.x);
  strike(G, m, G.st.hit * D.A.mul, 'melee', { sure: true });
  if (m.state !== 'dead') { setStatus(G, m, 'stun', D.A.stun); }
  G.fx.push({ k: 'ring', x: m.x, y: m.y, r: 6, max: 46, t: 0.35, col: '#ffe9a8' });
}

/** Оглушение, сеть, холод. У редкого моба вдвое короче. */
const STATUS_TXT = { stun: ['оглушён', '#ffe066'], root: ['в сети', '#e8e0cc'], chill: ['заморожен', '#9ad0ff'] };
function setStatus(G, m, k, t) {
  m[k] = Math.max(m[k], m.D.rare ? t / 2 : t);
  emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 34, s: STATUS_TXT[k][0], col: STATUS_TXT[k][1] });
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
}

// ---------------------------------------------------------------- аксессуар (клавиша 1)
export function useTrinket(G) {
  const P = G.P, H = G.hero, it = H.eq.trinket;
  if (!it) { emit(G, { k: 'toast', s: 'Аксессуар не надет', id: 'trk' }); return; }
  const T = TRINKETS.find(t => t.id === it.trinket); if (!T || T.passive) return;
  if (P.tcd > 0) { emit(G, { k: 'toast', s: `${T.name}: ещё ${Math.ceil(P.tcd)} с`, id: 'trk' }); return; }
  if (T.id === 'stoneheart') P.buf.stone = 6;
  else if (T.id === 'rage') P.buf.rage = 10;
  else if (T.id === 'windfeather') P.buf.wind = 5;
  else if (T.id === 'thorns') P.buf.thorns = 8;
  else if (T.id === 'breath') { const v = G.st.maxHp * 0.35; P.hp = Math.min(G.st.maxHp, P.hp + v); emit(G, { k: 'txt', x: P.x, y: P.y - 50, s: `+${Math.round(v)}`, col: '#7cff7c' }); }
  else if (T.id === 'stormeye') {
    const list = G.mobs.filter(m => hostile(m) && dist(P.x, P.y, m.x, m.y) < 420).sort((a, b) => dist(P.x, P.y, a.x, a.y) - dist(P.x, P.y, b.x, b.y)).slice(0, 3);
    if (!list.length) { emit(G, { k: 'toast', s: 'Рядом нет врагов', id: 'trk' }); return; }
    for (const m of list) { G.fx.push({ k: 'bolt', x: P.x, y: P.y - 30, x2: m.x, y2: m.y - m.r, t: 0.35, max: 0.35 }); strike(G, m, G.st.hit * 1.4, 'spell', { sure: true }); }
  } else return;   // фиолетовые — позже
  P.tcd = T.cd; P.sit = false; sfx(G, 'trinket');
  emit(G, { k: 'txt', x: P.x, y: P.y - 70, s: T.name, col: '#9ad0ff' });
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
  const P = G.P;
  let best = null, bd = LOOT.lootR;
  for (const k of G.corpses) { if (!hasLoot(k)) continue; const d = dist(P.x, P.y, k.x, k.y); if (d < bd) { bd = d; best = k; } }
  if (best) return { k: 'corpse', c: best, x: best.x, y: best.y };
  const v = veinNear(G); if (v) return { k: 'vein', v, x: v.x, y: v.y };
  for (const b of G.W.houses) { if (!b.name) continue; if (dist(P.x, P.y, b.x, b.y + 40) < 95) return { k: 'b', b, x: b.x, y: b.y }; }
  for (const e of G.W.exits) if (dist(P.x, P.y, e.x, e.y) < 220) return { k: 'exit', e, x: e.x, y: e.y };
  return null;
}
function interact(G) {
  const t = interactTarget(G); if (!t) return;
  if (t.k === 'corpse') { emit(G, { k: 'lootOpen', c: t.c }); return; }
  if (t.k === 'vein') { if (G.P.mine) stopMine(G); else startMine(G, t.v); return; }
  if (t.k === 'b') { if (t.b.vendor) emit(G, { k: 'vendor', b: t.b }); else if (t.b.guild) emit(G, { k: 'guild', b: t.b }); else if (t.b.smelt) emit(G, { k: 'smelt', b: t.b }); else emit(G, { k: 'toast', s: `${t.b.name}. ${t.b.note}`, id: 'bld' }); }
  if (t.k === 'exit') { if (t.e.zone) emit(G, { k: 'zone', e: t.e }); else emit(G, { k: 'toast', s: `Дорога в ${t.e.to} (ур. ${t.e.lvl}) откроется в следующих версиях`, id: 'exit' }); }
}

// ---------------------------------------------------------------- урон герою и смерть
function hurtHero(G, v, m, dot) {
  const P = G.P; if (P.dead) return;
  if (!dot) {
    const p = G.st.p || {};
    if (p.dodge > 0 && G.rand() < p.dodge / 100) { emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'уклонение', col: '#cfeaff' }); P.lastCombat = G.t; return; }
    if (p.block > 0 && G.rand() < p.block / 100) { emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'блок', col: '#e8e0cc' }); P.lastCombat = G.t; sfx(G, 'hammer'); return; }
    if (P.buf.stone > 0) v *= 0.5;   // Каменное сердце
    v *= (1 - armorCut(G.st.armor, G.hero.lvl)); P.hurt = 0.18; emit(G, { k: 'hdmg', v }); sfx(G, 'hurt');
    if (P.buf.thorns > 0 && m && m.state !== 'dead') strike(G, m, v * 0.3, 'thorns', { sure: true, noCrit: true, flat: true });   // Тотем шипов
    if (P.mine) stopMine(G, 'Копать помешали');
  }
  P.hp -= v; P.lastCombat = G.t; P.sit = false;
  if (P.hp <= 0) heroDie(G);
}

function heroDie(G) {
  const P = G.P; P.hp = 0; P.dead = true; P.deadT = 0; P.target = null; P.poison = null; P.whirl = 0; P.volley = 0; P.dash = null; P.sit = false;
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
  m.anim += dt; m.hurt = Math.max(0, m.hurt - dt); m.atkT = Math.max(0, m.atkT - dt); m.moving = false;
  if (m.state === 'dead') {
    if (G.t >= m.respawnAt) { Object.assign(m, spawnMob(G, { key: m.key, kind: m.kind, lvl: m.lvl, x: m.hx, y: m.hy }, m.camp)); delete H.dead[m.key]; G.fx.push({ k: 'spawn', x: m.x, y: m.y, t: 0.6, max: 0.6 }); }
    return;
  }
  if (m.summon) { m.life -= dt; if (m.life <= 0 || m.owner.state === 'dead') { m.state = 'dead'; m.gone = true; return; } }
  if (m.burn) { m.burn.t -= dt; m.hp -= m.burn.dps * dt; if (m.burn.t <= 0) m.burn = null; if (m.hp <= 0) { killMob(G, m); return; } }
  // кровотечение (стрела Лучника): урон раз в секунду, без крита и брони; моб, ушедший к логову, рану залечивает
  if (m.bleed) {
    if (m.state === 'return') m.bleed = null;
    else if ((m.bleed.tick -= dt) <= 0) {
      m.bleed.tick += 1; m.bleed.n--; m.hp -= m.bleed.dmg; m.hurt = 0.1;
      emit(G, { k: 'dmg', x: m.x, y: m.y - m.r * 2, v: m.bleed.dmg, bleed: true });
      if (m.bleed.n <= 0) m.bleed = null;
      if (m.hp <= 0) { killMob(G, m); return; }
    }
  }
  m.stun = Math.max(0, m.stun - dt); m.root = Math.max(0, m.root - dt); m.chill = Math.max(0, m.chill - dt);
  if (m.stun > 0) return;   // оглушён — стоит
  const dH = dist(m.x, m.y, P.x, P.y), dHome = dist(m.x, m.y, m.hx, m.hy), slowK = m.chill > 0 ? 0.5 : 1;
  const go = (tx, ty, sp) => { const d = dist(m.x, m.y, tx, ty); if (d < 1 || m.root > 0) { if (Math.abs(tx - m.x) > 2) m.face = tx < m.x ? -1 : 1; return; } sp *= slowK; const k = Math.min(1, sp * dt / d); let nx = m.x + (tx - m.x) * k, ny = m.y + (ty - m.y) * k; let ok = (a, b) => G.W.walkable(a, b) && !inCity(G.W, a, b); let ax = nx, ay = ny; if (!ok(ax, ay)) { if (ok(nx, m.y)) ay = m.y; else if (ok(m.x, ny)) ax = m.x; } if (ok(ax, ay)) { const nx2 = ax, ny2 = ay; nx = nx2; ny = ny2; const mv = Math.hypot(nx - m.x, ny - m.y); if (mv > 0.05) { m.mdx = nx - m.x; m.mdy = ny - m.y; m.moving = true; m.walkPh = (m.walkPh + mv / (m.D.humanoid ? 56 : 44)) % 1; } m.x = nx; m.y = ny; } if (Math.abs(tx - m.x) > 2) m.face = tx < m.x ? -1 : 1; };

  if (m.state === 'idle') {
    m.wander.t -= dt;
    if (m.wander.t <= 0) { const a = G.rand() * 6.28, r = G.rand() * (m.camp.r * 0.6); m.wander = { t: 3 + G.rand() * 5, x: m.hx + Math.cos(a) * r, y: m.hy + Math.sin(a) * r }; }
    if (m.D.trait !== 'dormant') go(m.wander.x, m.wander.y, m.D.speed * 0.25);   // пугало стоит неживым
    if (m.hp < m.max) m.hp = Math.min(m.max, m.hp + m.max * 0.1 * dt);
    if (!P.dead && !inCity(G.W, P.x, P.y)) {
      const gray = lvlColor(m.lvl, H.lvl) === '#9a9a9a';
      const ar = m.D.wake || AGGRO * clamp(1 + (m.lvl - H.lvl) * 0.1, 0.55, 1.6) * (gray ? 0.6 : 1);
      if (dH < ar) aggro(G, m);
    }
    return;
  }
  if (m.state === 'return') {
    const bx = m.x, by = m.y; go(m.hx, m.hy, m.D.speed * 1.4); m.hp = Math.min(m.max, m.hp + m.max * 0.5 * dt);
    m.stuckT = Math.hypot(m.x - bx, m.y - by) < 0.2 ? (m.stuckT || 0) + dt : 0;   // упёрся в реку или постройку — возвращается домой сам
    if (m.stuckT > 2.5) { m.x = m.hx; m.y = m.hy; m.stuckT = 0; }
    if (dist(m.x, m.y, m.hx, m.hy) < 8) { m.state = 'idle'; m.hp = m.max; m.charge.t = 0; m.smash.wind = 0; }
    return;
  }
  // погоня
  if (P.dead || dHome > LEASH || inCity(G.W, P.x, P.y) && dH > 40) { m.state = 'return'; m.charge.t = 0; m.smash.wind = 0; if (P.target === m) P.target = null; return; }
  m.cd = Math.max(0, m.cd - dt * slowK);
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
    if (S.t <= 0 && dH < 200) { S.wind = D.smash.wind; m.atkT = m.atkDur = D.smash.wind + 0.3; S.x = P.x; S.y = P.y; G.fx.push({ k: 'tele', x: S.x, y: S.y, r: D.smash.r, t: D.smash.wind, max: D.smash.wind }); emit(G, { k: 'txt', x: m.x, y: m.y - 60, s: 'замахивается!', col: '#ff8a2a' }); return; }
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
  // колдун: держит дистанцию, бьёт зелёным проклятием (замедляет) и зовёт ворон
  if (D.trait === 'caster') {
    if (dH > D.reach * 0.85) go(P.x, P.y, D.speed); else if (dH < 170) { const a = Math.atan2(m.y - P.y, m.x - P.x); go(m.x + Math.cos(a) * 60, m.y + Math.sin(a) * 60, D.speed * 0.5); }
    if (dH <= D.reach && m.cd <= 0) {
      m.cd = D.cd; m.face = P.x < m.x ? -1 : 1; m.atkT = m.atkDur = 0.5; const a = Math.atan2(P.y - m.y, P.x - m.x);
      G.shots.push({ from: 'mob', kind: 'curse', x: m.x, y: m.y - 24, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, t: 1.2, dmg: m.dmg, m, slow: 2.5 });
    }
    const S = D.summon; m.sumT = (m.sumT ?? S.every * 0.5) - dt;
    if (S && m.sumT <= 0) { m.sumT = S.every; if (G.mobs.filter(o => o.owner === m && o.state !== 'dead').length < S.n * 2) { for (let i = 0; i < S.n; i++) { const a = G.rand() * 6.28, x = m.x + Math.cos(a) * 60, y = m.y + Math.sin(a) * 60; const o = spawnMob(G, { key: 'призыв', kind: S.kind, lvl: Math.max(1, m.lvl - 2), x, y }, m.camp); Object.assign(o, { summon: true, owner: m, life: 40, state: 'chase' }); G.mobs.push(o); } emit(G, { k: 'txt', x: m.x, y: m.y - 70, s: 'зовёт ворон!', col: '#9affc8' }); } }
    return;
  }
  if (D.trait === 'ranged') {
    if (dH > D.reach * 0.9) go(P.x, P.y, D.speed);
    else if (dH < 150) { const a = Math.atan2(m.y - P.y, m.x - P.x); go(m.x + Math.cos(a) * 60, m.y + Math.sin(a) * 60, D.speed * 0.45); }  // отходит медленно — догнать можно
    if (dH <= D.reach && m.cd <= 0) {
      m.cd = D.cd; m.face = P.x < m.x ? -1 : 1; m.atkT = m.atkDur = 0.42; const a = Math.atan2(P.y - 18 - (m.y - 18), P.x - m.x);
      const fireS = D.shot === 'fire', sp = fireS ? 380 : 520;
      G.shots.push({ from: 'mob', kind: fireS ? 'bottle' : 'arrow', x: m.x, y: m.y - 18, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 1.0, dmg: m.dmg, m, burn: fireS ? D.burn : 0 });
    }
    return;
  }
  if (dH > reach) go(P.x, P.y, D.speed);
  else if (m.cd <= 0) {
    m.cd = D.cd; m.face = P.x < m.x ? -1 : 1; m.bite = 0.2; m.atkT = m.atkDur = 0.35;
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
        if (dist(s.x, s.y, m.x, m.y - m.r * 0.8 - (m.D.flying ? 22 : 0)) < m.r + (s.big ? 16 : 10) + (m.D.flying ? 6 : 0)) {
          s.t = 0; strike(G, m, s.dmg * (s.chillBonus && m.chill > 0 ? s.chillBonus : 1), 'ranged', { burn: s.burn, sure: s.sure });
          if (m.state !== 'dead') { if (s.chill) setStatus(G, m, 'chill', s.chill); if (s.root) setStatus(G, m, 'root', s.root); if (s.bleed) setBleed(G, m, s.bleed); }
          if (s.kind === 'fire') G.fx.push({ k: 'boom', x: s.x, y: s.y, t: 0.35, max: 0.35, big: s.big });
          break;
        }
      }
    } else if (!P.dead && dist(s.x, s.y, P.x, P.y - 16) < 22) {
      s.t = 0; hurtHero(G, s.dmg, s.m);
      if (s.burn && !P.dead) { P.poison = { t: 4, dps: s.dmg * s.burn, fire: true }; emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'горит!', col: '#ff8a2a' }); }
      if (s.slow && !P.dead) { P.slow = Math.max(P.slow, s.slow); emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'проклятие', col: '#9affc8' }); }
    }
  }
  G.shots = G.shots.filter(s => s.t > 0);
}

// ---------------------------------------------------------------- торговля
export const POTION_PRICE = L => 4 + L * 2;

export function sellItem(G, it) {
  const H = G.hero, i = H.bag.indexOf(it); if (i < 0) return;
  const v = it.price * (it.n || 1); H.bag.splice(i, 1); H.gold += v; sfx(G, 'coin');
  emit(G, { k: 'toast', s: `Продано: ${it.name}${it.n > 1 ? ' × ' + it.n : ''} за ${money(v)}`, id: 'sell' });
}
export function buyPotion(G) {
  const H = G.hero, p = POTION_PRICE(H.lvl);
  if (H.gold < p) { emit(G, { k: 'toast', s: 'Не хватает денег', id: 'gold' }); return false; }
  if (H.potions >= 10) { emit(G, { k: 'toast', s: 'Больше 10 зелий не унести', id: 'pot' }); return false; }
  H.gold -= p; H.potions++; sfx(G, 'coin'); return true;
}
/** Бижутерия у торговца: товар героя в этой лавке; меняется каждые 30 минут игры. */
export function shopStock(G, b) {
  const H = G.hero, key = G.W.Z.id + ':' + b.id; if (!b.jewel) return null;
  H.shops = H.shops || {}; let S = H.shops[key];
  if (!S || G.t >= S.at) {
    const items = [];
    for (let i = 0; i < SHOP.slots; i++) {
      const rar = i === SHOP.slots - 1 && G.rand() < SHOP.rareChance ? 'rare' : 'good';
      const it = makeItem(H.cls, G.rand() < 0.5 ? 'ring' : 'neck', H.lvl, rar, G.rand); it.cost = b.jewel[rar]; items.push(it);
    }
    S = H.shops[key] = { at: G.t + SHOP.refresh, items };
  }
  return S;
}
export function buyShop(G, b, idx) {
  const H = G.hero, S = shopStock(G, b), it = S && S.items[idx]; if (!it) return false;
  if (H.gold < it.cost) { emit(G, { k: 'toast', s: 'Не хватает денег', id: 'gold' }); return false; }
  if (H.bag.length >= LOOT.bag) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return false; }
  H.gold -= it.cost; S.items.splice(idx, 1); const v = { ...it }; delete v.cost; bagAdd(H, v); sfx(G, 'coin');
  emit(G, { k: 'toast', s: `Куплено: ${v.name}`, id: 'buy' }); return true;
}

/** Надеть вещь из сумки (снятая уходит в сумку). */
export function equip(G, it) {
  const H = G.hero, i = H.bag.indexOf(it); if (i < 0 || !it.slot || it.cls !== H.cls) return;
  const old = H.eq[it.slot], pos = it.pos; H.bag.splice(i, 1); H.eq[it.slot] = it; delete it.pos;
  if (old) { old.pos = pos; H.bag.push(old); }   // снятая вещь встаёт в ту же ячейку
  restat(G); sfx(G, 'equip');
}
/** Снять вещь в сумку (в ячейку pos, если она свободна). false — сумка полна. */
export function unequip(G, slot, pos = null) {
  const H = G.hero, it = H.eq[slot]; if (!it) return false;
  if (H.bag.length >= LOOT.bag) { emit(G, { k: 'toast', s: 'Сумка полна — снять некуда', id: 'bagfull' }); return false; }
  H.eq[slot] = null; bagAdd(H, it, pos); restat(G); sfx(G, 'equip'); return true;
}

// ---------------------------------------------------------------- ячейки сумки
// Сумка — список вещей, у каждой своя ячейка it.pos (0..23); пустые ячейки между вещами допустимы.
const bagAt = (H, pos) => H.bag.find(x => x.pos === pos);
export function freePos(H) { for (let p = 0; p < LOOT.bag; p++) if (!bagAt(H, p)) return p; return -1; }
/** Положить вещь в сумку: в ячейку pos, если она свободна, иначе в первую свободную. */
export function bagAdd(H, it, pos = null) { if (it.kind === 'ore' || it.kind === 'bar' || it.kind === 'gem') { addStack(H, it); return; } it.pos = pos != null && pos >= 0 && pos < LOOT.bag && !bagAt(H, pos) ? pos : freePos(H); H.bag.push(it); }
/** Переложить вещь в ячейку pos; если там лежит другая — они меняются местами. */
export function bagMove(G, it, pos) {
  const H = G.hero; if (!H.bag.includes(it) || pos < 0 || pos >= LOOT.bag || it.pos === pos) return;
  const other = bagAt(H, pos); if (other) other.pos = it.pos; it.pos = pos;
}
function restat(G) { const ratio = G.P.hp / G.st.maxHp; G.st = heroStats(G.hero); G.P.hp = Math.max(1, Math.round(G.st.maxHp * ratio)); }

export { xpNeed };
