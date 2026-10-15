// Ход игры: герой, мобы, бой, добыча, смерть. Без рисования — его делает engine/render.js.
// Всё, что должен увидеть или услышать игрок, складывается в G.ev (события) и G.fx (эффекты).
import { CLASSES } from '../../data/classes.js';
import { MOBS } from '../../data/mobs.js';
import { dgState, dgEnter, dgUnsealed, dgDone, chestLoot, bossLoot, NEVER } from './dungeon.js';
import { qState, qObjs, qOnKill, qTick, qTalk, qUseObj, qObjNear, npcNear, npcsOf } from './quests.js';
import { bossTick, bossReset, bossCancel, shieldBlocks, hazardsTick, ringBlocks } from './boss.js';
import { HERO, MOBL, RESPAWN, LEASH, AGGRO, LOOT, ITEM, TRINKET_DROP, SHOP, armorCut, xpKill, lvlColor, xpNeed } from '../../data/balance.js';
import { TRINKETS } from '../../data/trinkets.js';
import { NEW_ABILS } from '../../data/talents.js';
import { hasTal } from './talents.js';
import { heroStats, addXp, attackOf } from '../entities/hero.js';
import { rollDrop, makeTrinket, makeItem, isStackKind, makeStack } from './items.js';
import { MINE } from '../../data/mining.js';
import { initVeins, veinNear, startMine, stopMine, mineTick, addStack } from './mining.js';
import { initPlants, plantNear, startGather, stopGather, herbTick, drinkLast, elixirMods } from './herbs.js';
import { HERBAL } from '../../data/herbs.js';
import { moveTo, inCity } from '../world/world.js';
import { LH, nextWaypoint } from '../world/relief.js';
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
      mine: null, gather: null, auto: null, goal: null, tcd: 0, buf: { stone: 0, rage: 0, wind: 0, thorns: 0, berserk: 0 }, berExt: 0, whirlR: 92, whirlMax: 1.2,
    },
    mobs: [], shots: [], ev: [], fx: [], corpses: [], corpseSeq: 0, areas: [], traps: [], fxSeq: 1,
  };
  if (G.P.hp <= 0) G.P.hp = Math.round(st.maxHp * 0.5);
  initVeins(G); initPlants(G);
  G.npcs = npcsOf(W.Z.id); G.bagAdd = bagAdd; qState(hero); qObjs(G);   // v95: жители и предметы заданий
  if (W.Z.dungeon) { dgEnter(hero, W.Z); G.dg = dgState(hero, W.Z.id); W.dg = G.dg; if (dgUnsealed(hero, W.Z)) W.unseal(); if (dgDone(hero, W.Z)) openPortal(G); }   // v90: поход по подземелью
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
    stun: 0, root: 0, chill: 0, frozen: 0, venom: null, trapT: 0, atkT: 0, atkDur: 0.35, walkPh: G.rand(), mdx: 0, mdy: 1, moving: false,
    charge: { cd: 2, t: 0 }, smash: { t: D.smash ? D.smash.every : 0, wind: 0, x: 0, y: 0 }, anim: G.rand() * 10,
  };
}

const emit = (G, e) => G.ev.push(e);
/** Рельеф (v71): на одном ли ярусе (ближний бой через обрыв не достаёт). */
const tier = (G, a, b) => !G.W.relief || Math.abs(G.W.hAt(a.x, a.y) - G.W.hAt(b.x, b.y)) < LH * 0.55;
/** Обход обрывов: если прямо не пройти — путь по сетке (пересчёт раз в 0,6 с или когда цель ушла). Возвращает точку, куда идти сейчас, или null — идти прямо. */
export function steer(G, o, tx, ty, dt) {
  const W = G.W; if (!W.relief && !W.rooms) return null;
  const S = o.nav || (o.nav = { t: 0, path: null, tx: 1e9, ty: 1e9 });
  S.t -= dt;
  if (S.t <= 0 || Math.hypot(S.tx - tx, S.ty - ty) > 70) {
    S.t = 0.6 + Math.random() * 0.3; S.tx = tx; S.ty = ty;
    S.path = W.stepOk(o.x, o.y, tx, ty) ? null : W.path(o.x, o.y, tx, ty, 14000);
  }
  if (!S.path || !S.path.length) return null;
  const w = nextWaypoint(W, o.x, o.y, S.path);
  if (!W.stepOk(o.x, o.y, w[0], w[1])) S.t = 0;   // сбились с пути — пересчитать
  return w;
}
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
    let mx = I.mx || 0, my = I.my || 0;
    if (Math.hypot(mx, my) > 0.05) P.goal = null;            // своё движение отменяет поход к цели
    else if (P.goal && !P.dash) { const d = goalStep(G, dt); if (d) { mx = d[0]; my = d[1]; } }
    const m = Math.hypot(mx, my);
    if (m > 1) { mx /= m; my /= m; }
    P.moving = m > 0.05 && !P.dash;
    if (P.moving || I.attack || I.attackTap || I.ability || I.ability2 || I.ability3 || I.ability4) { P.sit = false; if (P.mine) stopMine(G); if (P.gather) stopGather(G); }
    if (I.sit) { if (P.sit) P.sit = false; else if (G.t - P.lastCombat < 1.5) emit(G, { k: 'toast', s: 'В бою не присесть', id: 'sit' }); else P.sit = true; }
    P.rooted = Math.max(0, (P.rooted || 0) - dt);
    if (P.dash) dashTick(G, dt);
    else if (P.moving && P.rooted > 0) { P.moving = false; }   // v94: сжат кольцами змеи
    else if (P.moving) {
      const sp = HERO.speed * (P.slow > 0 && !(P.buf.berserk > 0) ? 0.6 : 1) * (P.whirl > 0 ? 0.8 : 1) * (P.buf.wind > 0 ? 1.5 : 1) * elixirMods(G.hero).speed;
      const [nx, ny] = moveTo(G.W, P.x, P.y, P.x + mx * sp * dt, P.y + my * sp * dt);
      if (!G.rings || !G.rings.length || !ringBlocks(G, P.x, P.y, nx, ny)) { P.x = nx; P.y = ny; }   // кольцо змеи не выпускает, кроме как через просвет
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
    if (I.pick) clickAt(G, I.pick.x, I.pick.y, !!I.pick.touch);
    if (I.tabTarget) tabTarget(G);
    if (P.target && (P.target.state === 'dead')) P.target = null;
    // удар
    // удар: пробел один раз — автоатака по цели (v68), удержание — как раньше
    if (I.attackTap && !P.dash) startAuto(G);
    if (P.auto && (!hostile(P.auto) || P.auto.gone || P.target !== P.auto || P.sit || P.mine || P.gather)) P.auto = null;
    if (P.cd <= 0 && !P.dash && !P.sit) { if (P.auto) autoSwing(G); else if (I.attack) heroAttack(G, false); }
    if (I.ability) useAbility(G, 0);
    if (I.ability2) useAbility(G, 1);
    if (I.ability3) useAbility(G, 2);
    if (I.ability4) useAbility(G, 4);
    if (I.potion) drinkPotion(G);
    if (I.potion2) drinkLast(G);
    if (I.interact) interact(G);
    if (I.trinket) useTrinket(G);
    if (P.goal) goalArrive(G);
    abilityTick(G, dt);
    mineTick(G, dt); herbTick(G, dt); qTick(G, dt);
  }
  for (const mob of G.mobs) mobTick(G, mob, dt);
  if (G.mobs.some(m => m.gone)) G.mobs = G.mobs.filter(m => !m.gone);
  shotsTick(G, dt);
  if (G.hazards || G.rings) hazardsTick(G, dt, (v, dot) => hurtHero(G, v, null, dot));
  for (const c of G.corpses) c.t -= dt;
  if (G.corpses.some(c => c.t <= 0)) G.corpses = G.corpses.filter(c => c.t > 0);
  trapsTick(G, dt);
  for (const f of G.fx) f.t -= dt;
  G.fx = G.fx.filter(f => f.t > 0);
  H.worldT = G.t;
}

// ---------------------------------------------------------------- герой бьёт
const C = G => CLASSES[G.hero.cls];
const hostile = m => m.state !== 'dead' && m.state !== 'return';

// Tab: следующая ближайшая цель
function tabTarget(G) {
  const P = G.P, list = G.mobs.filter(m => hostile(m) && dist(P.x, P.y, m.x, m.y) < 520).sort((a, b) => dist(P.x, P.y, a.x, a.y) - dist(P.x, P.y, b.x, b.y));
  if (!list.length) return; const i = list.indexOf(P.target); P.target = list[(i + 1) % list.length];
}

function nearest(G, reach) {
  const P = G.P, melee = attackOf(G.hero).kind === 'melee'; let best = null, bd = reach;
  for (const m of G.mobs) { if (!hostile(m) || (melee && !tier(G, P, m))) continue; const d = dist(P.x, P.y, m.x, m.y) - m.r; if (d < bd) { bd = d; best = m; } }
  return best;
}

/** Автоатака: цель — выбранная, а если её нет — ближайшая в досягаемости. Сама на другую цель не переходит. */
function startAuto(G) {
  const P = G.P, A = attackOf(G.hero);
  const t = P.target && hostile(P.target) ? P.target : nearest(G, A.reach);
  if (!t) return;
  P.auto = t; P.autoFar = false; P.target = t; P.sit = false;
}
function autoSwing(G) {
  const P = G.P, A = attackOf(G.hero), t = P.auto;
  if (dist(P.x, P.y, t.x, t.y) - t.r > A.reach || (A.kind === 'melee' && !tier(G, P, t))) { if (!P.autoFar) emit(G, { k: 'toast', s: 'Слишком далеко', id: 'far' }); P.autoFar = true; return; }   // ждём, пока цель подойдёт
  P.autoFar = false; heroAttack(G, false, t);
}
function heroAttack(G, tap, force = null) {
  const P = G.P, A = attackOf(G.hero);
  let t = force || (P.target && hostile(P.target) ? P.target : null);
  const inReach = m => dist(P.x, P.y, m.x, m.y) - m.r <= A.reach && (A.kind !== 'melee' || tier(G, P, m));
  if (!force && (!t || !inReach(t))) {
    const n = nearest(G, A.reach);
    if (n) t = n;
    else { if (tap && t) emit(G, { k: 'toast', s: 'Слишком далеко', id: 'far' }); return; }
  }
  P.target = t; P.face = Math.atan2(t.y - P.y, t.x - P.x); P.dir = Math.cos(P.face) < 0 ? -1 : 1;
  P.cd = G.st.cd / (P.buf.rage > 0 ? 1.3 : 1) / (P.buf.berserk > 0 ? 1 + ABX(G, 'berserk').haste : 1); P.lastCombat = G.t; sfx(G, A.sfx);
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
  if (m.B && m.B.immune > 0) { emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 20, s: 'неуязвим', col: '#c8ffb0' }); aggro(G, m); return; }   // v94: босс сбрасывает кожу
  if (!opt.sure && G.rand() < clamp(0.04 + 0.05 * d, 0.02, 0.4)) { emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 20, s: 'мимо', col: '#cfd8de' }); aggro(G, m); return; }
  const st = G.st, pen = (st.p ? st.p.pen : 0) / 100;
  let v = opt.flat ? base : base * (0.9 + G.rand() * 0.2) * (G.P.weak > 0 ? HERO.deathWeakMul : 1) * (1 - armorCut(m.armor * (1 - pen), H.lvl) * 0.5);
  if (!opt.flat) v *= heroDmgMul(G, m, opt);
  if (m.B && src !== 'dot' && shieldBlocks(G, m)) { v *= m.D.ai.shieldMul ?? 0.2; emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 34, s: 'щит', col: '#ffe08a' }); }   // v94: щит спереди
  let cc = (st.crit ?? ITEM.baseCrit) + elixirMods(H).crit;
  if (passive(G, 'execute') && m.hp < m.max * (hasTal(H, 'aim') ? 0.5 : ABX(G, 'execute').below)) cc += ABX(G, 'execute').crit;   // Добивание
  const crit = !opt.noCrit && G.rand() < cc / 100; if (crit) { v *= ITEM.critMul; G.fx.push(fx(G, 'critBurst', m.x, m.y, 0.35)); }
  v = Math.max(1, v);
  // Ярость: Неистовство — каждый удар продлевает её
  if (G.P.buf.berserk > 0 && hasTal(H, 'frenzy') && G.P.berExt < 6 && src !== 'dot') { G.P.buf.berserk += 0.5; G.P.berExt += 0.5; }
  // вампиризм: часть нанесённого урона возвращается здоровьем
  if (st.p && st.p.vamp > 0 && !G.P.dead) G.P.hp = Math.min(st.maxHp, G.P.hp + v * st.p.vamp / 100);
  m.hp -= v; m.hurt = 0.15;
  emit(G, { k: 'dmg', x: m.x, y: m.y - m.r * 2, v, crit });
  if (opt.burn) { const lb = opt.big && hasTal(H, 'longBurn'); m.burn = { t: lb ? 6 : 3, dps: base * (lb ? 0.4 : 0.3) }; }
  // Возгорание (маг, пассивное): крит огнём поджигает
  if (crit && opt.fire && passive(G, 'ignite')) { const b = ABX(G, 'ignite').burn; m.burn = { t: 4, dps: Math.max(m.burn ? m.burn.dps : 0, v * b) }; G.fx.push(fx(G, 'igniteFlash', m.x, m.y, 0.5)); emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 34, s: 'возгорание', col: '#ffb347' }); }
  if (m.hp <= 0) { killMob(G, m); return; }
  aggro(G, m);
  if (m.D.trait === 'flee' && !m.fled && m.hp < m.max * 0.25) { m.fled = true; m.flee = 2.2; emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 26, s: 'убегает!', col: '#f5e05a' }); }
}

function aggro(G, m) {
  if (m.state === 'dead' || m.state === 'return' || G.P.dead) return;
  const was = m.state; m.state = 'chase'; G.P.lastCombat = G.t;
  if (was !== 'chase' && m.D.trait === 'pack') {
    const near = G.mobs.filter(o => o !== m && o.camp === m.camp && o.state === 'idle' && dist(o.x, o.y, m.x, m.y) < (m.D.packR || 320)).sort((a, b) => dist(a.x, a.y, m.x, m.y) - dist(b.x, b.y, m.x, m.y));
    for (const o of near.slice(0, m.D.packN || 99)) o.state = 'chase';   // packN — сколько сородичей зовёт (квакуны — двух ближних)
  }
}

function killMob(G, m) {
  const H = G.hero, P = G.P;
  // Жажда битвы (воин, пассивное): каждый сражённый враг лечит
  if (passive(G, 'thirst') && !P.dead) { const v = G.st.maxHp * (hasTal(H, 'bloodlust') ? 0.08 : ABX(G, 'thirst').heal); P.hp = Math.min(G.st.maxHp, P.hp + v); G.fx.push(Object.assign(fx(G, 'thirst', m.x, m.y, 1.2), { tx: P.x, ty: P.y })); emit(G, { k: 'txt', x: P.x, y: P.y - 56, s: `+${Math.round(v)}`, col: '#7cff7c' }); }
  m.trapT = 0;
  if (m.summon) { m.state = 'dead'; m.gone = true; m.hp = 0; if (P.target === m) P.target = null; sfx(G, 'kill'); const xp = Math.round(xpKill(m.lvl, H.lvl) * 0.3); if (xp) { addXp(H, xp); emit(G, { k: 'txt', x: m.x, y: m.y - 46, s: `+${xp} опыта`, col: '#c8a0ff' }); } return; }
  m.state = 'dead'; m.hp = 0; m.bleed = null; m.burn = null; m.venom = null; m.frozen = 0; m.respawnAt = G.W.Z.dungeon ? NEVER : G.t + (m.D.rare ? RESPAWN.rare : RESPAWN.normal);   // v90: в подземелье не возрождаются до обновления
  H.dead[m.key] = m.respawnAt; H.stats.kills++;
  qOnKill(G, m);   // v95: задания
  if (m.D.boss && G.dg) { G.dg.bosses[m.kind] = true; emit(G, { k: 'boss', name: m.D.name, final: !!m.D.final }); if (dgUnsealed(H, G.W.Z) && G.W.sealed.size) { G.W.unseal(); emit(G, { k: 'toast', s: 'Запечатанный ход в Тронный зал открыт!', kind: 'good', id: 'seal' }); } if (dgDone(H, G.W.Z)) openPortal(G); }
  if (P.target === m) P.target = null;
  sfx(G, 'kill');
  // опыт
  const xp = Math.round(xpKill(m.lvl, H.lvl, m.D.rare || m.D.boss ? 3 : 1) * (G.W.Z.xpMul || 1) * elixirMods(H).xp);
  if (xp) {
    const up = addXp(H, xp);
    emit(G, { k: 'txt', x: m.x, y: m.y - 46, s: `+${xp} опыта`, col: '#c8a0ff' });
    if (up) { const old = G.st.maxHp; G.st = heroStats(H); P.hp += G.st.maxHp - old; P.hp = G.st.maxHp; emit(G, { k: 'lvl', L: H.lvl }); sfx(G, 'levelUp'); }
  }
  // добыча остаётся в теле: монеты (в меди) и вещи
  const money = Math.max(1, Math.round(m.lvl * m.D.gold * (G.W.Z.goldMul || 1) * (LOOT.goldMin + G.rand() * (LOOT.goldMax - LOOT.goldMin))));
  const items = [];
  const ZL = G.W.Z.loot || {};
  if (m.D.boss) items.push(...bossLoot(H, G.W.Z, m.D, m.lvl, G.rand));   // v90: босс — гарантированно синяя (главный — и фиолетовая)
  else if (m.D.rare || G.rand() < (ZL.chance ?? LOOT.itemChance)) items.push(rollDrop(H.cls, m.lvl, m.D.rare, G.rand, ZL));
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

/** v91: выбросить вещь из сумки — ложится мешком на землю рядом с героем на 3 минуты, можно поднять обратно (E). */
export function dropItem(G, it) {
  const H = G.hero, i = H.bag.indexOf(it); if (i < 0) return false;
  H.bag.splice(i, 1); delete it.pos;
  const P = G.P, a = G.rand() * Math.PI * 2;
  G.corpses.push({ id: ++G.corpseSeq, x: P.x + Math.cos(a) * 26, y: P.y + 12 + Math.sin(a) * 10, kind: null, name: 'Мешок', lvl: 0, dir: 1, t: LOOT.corpseT, money: 0, items: [it], dropped: true });
  sfx(G, 'loot'); emit(G, { k: 'toast', s: `Выброшено: ${it.name}${it.n > 1 ? ' ×' + it.n : ''} — лежит мешком 3 минуты`, id: 'drop' });
  return true;
}
/** Положить вещь в сумку (награды, проверки). Если места нет — вещь падает в тело-мешок рядом. */
export function giveItem(G, it, x, y) {
  const H = G.hero;
  if (H.bag.length < LOOT.bag) { bagAdd(H, it); H.stats.items++; emit(G, { k: 'loot', it }); }
  else G.corpses.push({ id: ++G.corpseSeq, x: x + 10, y: y + 10, kind: null, name: 'Мешок', lvl: 0, dir: 1, t: LOOT.corpseT, money: 0, items: [it] });
}

// ---------------------------------------------------------------- умения и зелья
/** Умения класса: 0 — C (1 ур.), 1 — V (5), 2 — R (10), 3 — пассивное (15), 4 — F (20). */
const ABC = {};
export const abilsOf = h => ABC[h.cls] || (ABC[h.cls] = [...CLASSES[h.cls].abils, ...(NEW_ABILS[h.cls] || [])]);
/** Умение героя по id (данные). */
const ABX = (G, id) => abilsOf(G.hero).find(a => a.id === id);
/** Открыто ли пассивное умение. */
const passive = (G, id) => { const A = ABX(G, id); return !!A && G.hero.lvl >= A.lvl; };
/** Новый эффект для рисования: тип, место, длительность; seed — свой узор. */
const fx = (G, k, x, y, dur) => ({ k, x, y, t: dur, max: dur, seed: (G.fxSeq = (G.fxSeq || 1) + 7) });
/** Множитель урона героя: Ярость, Охотничий азарт (враг в капкане). */
function heroDmgMul(G, m, opt) {
  let k = 1; const P = G.P, H = G.hero;
  if (P.buf.berserk > 0) k *= 1 + ABX(G, 'berserk').dmg;
  k *= elixirMods(H).dmg;
  if (m.trapT > 0 && hasTal(H, 'thrill')) k *= 1.25;
  if (opt.fire && hasTal(H, 'frostfire') && (m.chill > 0 || m.frozen > 0)) k *= 2;
  return k;
}
export const abilOpen = (h, i) => h.lvl >= abilsOf(h)[i].lvl;

function abilTarget(G, range) {
  const P = G.P, t = P.target && hostile(P.target) && dist(P.x, P.y, P.target.x, P.target.y) - P.target.r <= range ? P.target : nearest(G, range);
  return t;
}

function useAbility(G, i) {
  const P = G.P, H = G.hero, A = abilsOf(H)[i]; if (!A || A.key === 'passive') return;
  if (!abilOpen(H, i)) { emit(G, { k: 'toast', s: `${A.name} откроется на ${A.lvl}-м уровне`, id: 'ablock' }); return; }
  if ((P.acd[A.id] || 0) > 0) { emit(G, { k: 'toast', s: `${A.name}: ещё ${Math.ceil(P.acd[A.id])} с`, id: 'abcd' }); return; }
  if (P.dash) return;
  const reach = attackOf(H).reach + 40;
  let cd = A.cd;
  const face = t => { P.target = t; P.face = Math.atan2(t.y - P.y, t.x - P.x); P.dir = Math.cos(P.face) < 0 ? -1 : 1; };
  if (A.id === 'whirl') {
    const wide = hasTal(H, 'wideWhirl'); P.whirlMax = P.whirl = 1.2 + (wide ? 0.8 : 0); P.whirlR = 92 * (wide ? 1.2 : 1); P.whirlT = 0; startAtk(P, 0.4);
    if (P.buf.berserk > 0 && hasTal(H, 'redWhirl')) cd *= 0.5;
  } else if (A.id === 'charge') {
    const t = abilTarget(G, A.range); if (!t) { emit(G, { k: 'toast', s: 'Рядом нет врага для рывка', id: 'abnt' }); return; }
    P.dash = { m: t, t: 0.6, A }; P.target = t; P.dir = t.x < P.x ? -1 : 1;
    if (hasTal(H, 'swift')) cd -= 3;
  } else if (A.id === 'crush') {
    const t = abilTarget(G, attackOf(H).reach + 20);
    if (!t || !tier(G, P, t)) { emit(G, { k: 'toast', s: 'Сокрушающий удар — только вплотную', id: 'abnt' }); return; }
    face(t); P.swing = 0.3; startAtk(P, 0.5); P.cd = Math.max(P.cd, 0.5);
    crushHit(G, t, A);
    if (hasTal(H, 'cleave')) { const o = G.mobs.filter(x => x !== t && hostile(x) && dist(x.x, x.y, t.x, t.y) < 90 && tier(G, P, x)).sort((a, b) => dist(a.x, a.y, t.x, t.y) - dist(b.x, b.y, t.x, t.y))[0]; if (o) crushHit(G, o, A); }
  } else if (A.id === 'berserk') {
    P.buf.berserk = A.t; P.berExt = 0; P.slow = 0; startAtk(P, 0.4);
    G.fx.push(fx(G, 'berserkCast', P.x, P.y, 0.9)); emit(G, { k: 'txt', x: P.x, y: P.y - 76, s: 'ЯРОСТЬ!', col: '#ff5a3a' });
  } else if (A.id === 'pillar' || A.id === 'volley') {
    const t = abilTarget(G, 440); if (!t) { emit(G, { k: 'toast', s: 'Нет цели рядом', id: 'abnt' }); return; }
    face(t); startAtk(P, 0.5); P.shot = 0.25;
    const dur = A.id === 'pillar' ? (hasTal(H, 'inferno') ? 8 : A.t) : (hasTal(H, 'hail') ? 4.5 : A.t);
    const r = A.r * (A.id === 'pillar' && hasTal(H, 'widePillar') ? 1.4 : 1);
    G.areas.push(Object.assign(fx(G, A.id, t.x, t.y, dur + (A.id === 'volley' ? 0.4 : 0.35)), { r, dur, tick: A.id === 'volley' ? 0.35 : 0.35, hx: P.x, hy: P.y }));
    if (A.id === 'volley') emit(G, { k: 'txt', x: P.x, y: P.y - 70, s: 'Залп!', col: '#ffe9a8' });
  } else if (A.id === 'nova') {
    startAtk(P, 0.45); const fr = hasTal(H, 'prison') ? 5 : A.freeze, mul = A.mul * (hasTal(H, 'shards') ? 1.5 : 1);
    G.fx.push(Object.assign(fx(G, 'nova', P.x, P.y, 1.5), { r: A.r }));
    let n = 0;
    for (const m of G.mobs) if (hostile(m) && dist(m.x, m.y, P.x, P.y) < A.r + m.r) { n++; strike(G, m, G.st.hit * mul, 'spell', { sure: true, frost: true }); if (m.state !== 'dead') { m.frozen = Math.max(m.frozen || 0, m.D.rare ? fr / 2 : fr); m.frozenMax = m.frozen; emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 34, s: 'вмёрз', col: '#bfe6ff' }); } }
    if (hasTal(H, 'coldMind')) P.acd.fireball = 0;
    if (!n) emit(G, { k: 'toast', s: 'Рядом никого — холод ушёл впустую', id: 'abnt' });
  } else if (A.id === 'trap') {
    const max = hasTal(H, 'twoTraps') ? 2 : 1;
    while (G.traps.filter(x => !x.sprung).length >= max) G.traps.splice(G.traps.findIndex(x => !x.sprung), 1);
    G.traps.push({ x: P.x + P.dir * 22, y: P.y + 6, t: 60, sprung: 0, seed: (G.fxSeq += 7) });
    startAtk(P, 0.35); emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'капкан поставлен', col: '#e8e0cc' });
  } else {
    const t = abilTarget(G, Math.max(reach, 420)); if (!t) { emit(G, { k: 'toast', s: 'Нет цели рядом', id: 'abnt' }); return; }
    face(t); P.shot = 0.2; startAtk(P, 0.42);
    const shot = (kind, dmg, x) => heroShot(G, t, kind, dmg, x);
    if (A.id === 'fireball') shot('fire', G.st.hit * A.mul, { burn: true, big: true, chillBonus: 1.5, fire: true, split: hasTal(H, 'split') ? 2 : 0 });
    if (A.id === 'frost') shot('frost', G.st.hit * A.mul, { chill: A.chill, chain: hasTal(H, 'chainFrost') ? 2 : 0, hit: [] });
    if (A.id === 'net') shot('net', G.st.hit * 0.3, { root: A.root, sure: true, wide: hasTal(H, 'wideNet') });
    if (A.id === 'bleed') shot('arrow', G.st.hit * A.mul, { bleed: bleedOf(G, A), red: true, rico: hasTal(H, 'ricochet') ? 2 : 0 });
  }
  P.acd[A.id] = Math.max(0.5, cd) * (1 - ((G.st.p && G.st.p.cdr) || 0) / 100); P.lastCombat = G.t; P.sit = false; sfx(G, A.sfx);
}
const bleedOf = (G, A) => ({ t: A.bleed.t, dmg: G.st.hit * A.bleed.mul * (hasTal(G.hero, 'barbs') ? 1.5 : 1) });
/** Выстрел умения героя из точки (x0,y0) — по умолчанию от героя — в цель t. */
function heroShot(G, t, kind, dmg, x, x0 = G.P.x, y0 = G.P.y - 18) {
  const a = Math.atan2(t.y - t.r * 0.6 - y0, t.x - x0), sp = kind === 'arrow' ? 900 : kind === 'net' ? 600 : 520;
  G.shots.push(Object.assign({ from: 'hero', kind, x: x0, y: y0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 560 / sp + 0.3, dmg, target: t, age: 0 }, x));
}
/** Сокрушающий удар по одному врагу: урон и глубокая рана. */
function crushHit(G, t, A) {
  const H = G.hero, deep = hasTal(H, 'deepWound');
  G.fx.push(Object.assign(fx(G, 'crush', t.x, t.y, 1.4), { dir: Math.atan2(t.y - G.P.y, t.x - G.P.x) }));
  strike(G, t, G.st.hit * A.mul, 'melee', { sure: true });
  if (t.state !== 'dead') { t.bleed = { n: deep ? 9 : A.wound.t, tick: 1, dmg: G.st.hit * A.wound.mul * (deep ? 1.3 : 1), wound: true }; emit(G, { k: 'txt', x: t.x, y: t.y - t.r - 26, s: 'глубокая рана', col: '#ff6a6a' }); }
}

// рывок: летим к цели, на месте — удар сильнее обычного и оглушение
function dashTick(G, dt) {
  const P = G.P, D = P.dash, m = D.m;
  D.t -= dt;
  if (m.state === 'dead' || D.t <= 0) { P.dash = null; return; }
  const d = dist(P.x, P.y, m.x, m.y), stop = m.r + 26;
  if (d > stop) { const k = Math.min(1, 900 * dt / d); const [nx, ny] = moveTo(G.W, P.x, P.y, P.x + (m.x - P.x) * k, P.y + (m.y - P.y) * k); P.moving = true; P.step += dt * 20;
    if (Math.hypot(nx - P.x, ny - P.y) < 0.5) { P.dash = null; return; } P.x = nx; P.y = ny; G.fx.push(fx(G, 'dashDust', P.x, P.y, 0.6)); return; }
  P.dash = null; P.swing = 0.22; startAtk(P, 0.32); P.cd = Math.max(P.cd, 0.4); P.face = Math.atan2(m.y - P.y, m.x - P.x);
  strike(G, m, G.st.hit * D.A.mul, 'melee', { sure: true });
  if (m.state !== 'dead') { setStatus(G, m, 'stun', D.A.stun); }
  if (hasTal(G.hero, 'quake')) for (const o of G.mobs) if (o !== m && hostile(o) && dist(o.x, o.y, m.x, m.y) < 90 + o.r) setStatus(G, o, 'stun', 1.5);   // Сотрясение
  G.fx.push(fx(G, 'impact', m.x, m.y, 0.6));
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
      for (const m of G.mobs) if (hostile(m) && dist(m.x, m.y, P.x, P.y) < P.whirlR + m.r) strike(G, m, G.st.hit * 0.6, 'melee', { noCrit: true });
    }
  }
  if (P.buf.berserk <= 0) P.berExt = 0;
  // круги на земле: Огненный столп и Залп — бьют всех внутри раз в tick
  for (const ar of G.areas) {
    ar.t -= dt; const age = ar.max - ar.t; if (age < 0.35 || age > ar.dur + 0.35) continue;
    if ((ar.tick -= dt) > 0) continue;
    const pil = ar.k === 'pillar', A = ABX(G, ar.k); ar.tick += pil ? 0.5 : 0.4;
    for (const m of G.mobs) {
      if (!hostile(m) || dist(m.x, m.y, ar.x, ar.y) > ar.r + m.r * 0.6) continue;
      if (pil) strike(G, m, G.st.hit * A.dps * 0.5, 'spell', { sure: true, fire: true });
      else { strike(G, m, G.st.hit * A.mul, 'ranged', { sure: true }); if (m.state !== 'dead' && hasTal(G.hero, 'frostTips')) { if (!(m.chill > 0)) emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 34, s: 'замедлен', col: '#9ad0ff' }); m.chill = Math.max(m.chill, 1.2); } }
    }
  }
  if (G.areas.length && G.areas.some(a => a.t <= 0)) G.areas = G.areas.filter(a => a.t > 0);
}

/** Капканы Лучника: ждут на земле минуту, первый наступивший враг попадает. */
function trapsTick(G, dt) {
  if (!G.traps.length) return;
  const H = G.hero, A = ABX(G, 'trap');
  for (const tr of G.traps) {
    tr.t -= dt; if (tr.sprung) { tr.sprung += dt; continue; }
    const m = G.mobs.find(o => o.state === 'chase' && !o.D.flying && dist(o.x, o.y, tr.x, tr.y) < 22 + o.r * 0.6); if (!m) continue;
    tr.sprung = 0.001; tr.t = Math.min(tr.t, 3);
    const hold = m.D.rare ? A.hold / 2 : A.hold; m.root = Math.max(m.root, hold); m.trapT = hold; m.x = tr.x; m.y = tr.y - 2;
    G.fx.push(fx(G, 'trapSnap', tr.x, tr.y, 0.9)); sfx(G, 'hammer');
    emit(G, { k: 'txt', x: m.x, y: m.y - m.r - 34, s: 'в капкане', col: '#e8e0cc' });
    strike(G, m, G.st.hit * A.mul, 'ranged', { sure: true, noCrit: true });
    if (m.state !== 'dead') { m.bleed = { n: Math.round(hold), tick: 1, dmg: G.st.hit * A.mul * 0.5 }; if (hasTal(H, 'venom')) m.venom = { t: 6, dps: G.st.hit * 0.22 }; }
  }
  G.traps = G.traps.filter(t => t.t > 0);
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
  } else if (T.id === 'hourglass') { const AB = abilsOf(H); for (const a of AB.slice(0, 2)) P.acd[a.id] = 0; }   // v90: сброс C и V
  else if (T.id === 'gravity') {   // v90: стянуть врагов вокруг в точку и оглушить
    const list = G.mobs.filter(m => hostile(m) && !m.D.boss && dist(P.x, P.y, m.x, m.y) < 300);
    if (!list.length) { emit(G, { k: 'toast', s: 'Рядом нет врагов', id: 'trk' }); return; }
    const cx = list.reduce((a, m) => a + m.x, 0) / list.length, cy = list.reduce((a, m) => a + m.y, 0) / list.length;
    for (const m of list) { const a = Math.atan2(m.y - cy, m.x - cx); m.x = cx + Math.cos(a) * 18; m.y = cy + Math.sin(a) * 18; setStatus(G, m, 'stun', 2); }
    G.fx.push({ k: 'slam', x: cx, y: cy, r: 120, t: 0.6, max: 0.6 });
  } else return;   // остальные фиолетовые — позже
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
// ---------------------------------------------------------------- касание и щелчок по миру (v69)
/** Что лежит под точкой мира: моб, тело с добычей, жила, постройка, дорога в другой край или просто земля. */
export function whatAt(G, x, y, touch = false) {
  const pad = touch ? 26 : 8;
  let best = null, bd = 1e9;
  for (const m of G.mobs) { if (m.state === 'dead') continue; const d = dist(x, y, m.x, m.y - m.r); if (d < m.r + 30 + pad && d < bd) { bd = d; best = m; } }
  if (best) return { k: 'mob', m: best };
  for (const c of G.corpses) if (hasLoot(c) && dist(x, y, c.x, c.y) < 34 + pad) return { k: 'corpse', c, x: c.x, y: c.y };
  for (const v of G.veins || []) if ((!v.at || v.at <= G.t) && dist(x, y, v.x, v.y - 20) < 42 + pad) return { k: 'vein', v, x: v.x, y: v.y };
  for (const v of G.plants || []) if ((!v.at || v.at <= G.t) && dist(x, y, v.x, v.y - 12) < 30 + pad) return { k: 'plant', v, x: v.x, y: v.y };
  { const n = npcNear(G, x, y + 30, 40 + pad); if (n) return { k: 'npc', n, x: n.x, y: n.y }; }
  { const o = qObjNear(G, x, y + 10, pad - 20); if (o) return { k: 'qobj', o, x: o.x, y: o.y }; }
  for (const b of G.W.houses) if (b.name && dist(x, y, b.x, b.y - 30) < Math.max(70, (b.col || 50) * 1.4) + pad) return { k: 'b', b, x: b.x, y: b.y };
  const ch = chestNear(G, x, y + 20, pad - 30); if (ch) return ch;
  for (const e of G.W.exits) if (dist(x, y, e.x, e.y) < 90 + pad) return { k: 'exit', e, x: e.x, y: e.y };
  return { k: 'ground', x, y };
}
/** Щелчок мышью: моб — цель; тело, жила, постройка, дорога — подойти и сделать. Касание пальцем: ещё и автоатака, и ходьба по земле. */
export function clickAt(G, x, y, touch) {
  const P = G.P; if (P.dead) return; const t = whatAt(G, x, y, touch); P.nav = null;
  if (t.k === 'mob') {
    P.target = t.m;
    if (touch && t.m.state !== 'return') { P.auto = null; startAuto(G); P.goal = { k: 'mob', m: t.m, st: 0 }; }
    return;
  }
  if (t.k === 'ground') { if (touch) P.goal = { k: 'ground', x, y, st: 0 }; else P.target = null; return; }
  P.goal = { ...t, st: 0 }; P.sit = false;
}
/** Куда идти к цели (единичный шаг) или null, если уже на месте. */
function goalDest(G, g) {
  const P = G.P;
  if (g.k === 'mob') { const m = g.m; if (m.state === 'dead' || m.state === 'return') return null; return [m.x, m.y, tier(G, P, m) ? Math.max(20, attackOf(G.hero).reach + m.r - 10) : 16]; }
  if (g.k === 'corpse') return hasLoot(g.c) ? [g.c.x, g.c.y, LOOT.lootR - 14] : null;
  if (g.k === 'vein') return [g.v.x, g.v.y, MINE.reach - 8];
  if (g.k === 'plant') return [g.v.x, g.v.y, HERBAL.reach - 8];
  if (g.k === 'b') return [g.b.x, g.b.y + 40, 60];
  if (g.k === 'exit') return [g.e.x, g.e.y, g.e.portal ? 90 : 150];
  if (g.k === 'chest') return [g.x, g.y + 10, 60];
  if (g.k === 'npc') return [g.n.x, g.n.y + 30, 70];
  if (g.k === 'qobj') return G.qobjs && G.qobjs.includes(g.o) ? [g.o.x, g.o.y + 10, 50] : null;
  return [g.x, g.y, 10];
}
function goalStep(G, dt) {
  const P = G.P, g = P.goal, D = goalDest(G, g);
  if (!D) { P.goal = null; return null; }
  const d = dist(P.x, P.y, D[0], D[1]); if (d <= D[2]) return null;
  // застрял (упёрся в ствол, пруд, стену) — бросить поход
  if (g.lx != null && dist(P.x, P.y, g.lx, g.ly) < 40 * dt) { g.st += dt; if (g.st > 0.6) { P.goal = null; emit(G, { k: 'toast', s: 'Не пройти — обойдите', id: 'stuck' }); return null; } } else g.st = 0;
  g.lx = P.x; g.ly = P.y;
  const w = steer(G, P, D[0], D[1], dt); if (w) { const dw = Math.max(1, dist(P.x, P.y, w[0], w[1])); return [(w[0] - P.x) / dw, (w[1] - P.y) / dw]; }   // рельеф: в обход обрыва
  return [(D[0] - P.x) / d, (D[1] - P.y) / d];
}
function goalArrive(G) {
  const P = G.P, g = P.goal, D = goalDest(G, g);
  if (!D) { P.goal = null; return; }
  if (dist(P.x, P.y, D[0], D[1]) > D[2]) return;
  P.goal = null;
  if (g.k === 'corpse') { P.auto = null; emit(G, { k: 'lootOpen', c: g.c }); }
  else if (g.k === 'vein') { if ((!g.v.at || g.v.at <= G.t) && !P.mine) startMine(G, g.v); }
  else if (g.k === 'plant') { if ((!g.v.at || g.v.at <= G.t) && !P.gather) startGather(G, g.v); }
  else if (g.k === 'b' || g.k === 'exit' || g.k === 'chest' || g.k === 'npc' || g.k === 'qobj') doInteract(G, g);
}

export function interactTarget(G) {
  const P = G.P;
  let best = null, bd = LOOT.lootR;
  for (const k of G.corpses) { if (!hasLoot(k)) continue; const d = dist(P.x, P.y, k.x, k.y); if (d < bd) { bd = d; best = k; } }
  if (best) return { k: 'corpse', c: best, x: best.x, y: best.y };
  const v = veinNear(G); if (v) return { k: 'vein', v, x: v.x, y: v.y };
  const pl = plantNear(G); if (pl) return { k: 'plant', v: pl, x: pl.x, y: pl.y };
  { const o = qObjNear(G); if (o) return { k: 'qobj', o, x: o.x, y: o.y }; }
  { const n = npcNear(G); if (n) return { k: 'npc', n, x: n.x, y: n.y }; }
  for (const b of G.W.houses) { if (!b.name) continue; if (dist(P.x, P.y, b.x, b.y + 40) < 95) return { k: 'b', b, x: b.x, y: b.y }; }
  const ch = chestNear(G); if (ch) return ch;
  for (const e of G.W.exits) if (dist(P.x, P.y, e.x, e.y) < (e.portal ? 110 : 220)) return { k: 'exit', e, x: e.x, y: e.y };
  return null;
}
/** v90: закрытый сундук подземелья рядом (до 80). */
export function chestNear(G, x = G.P.x, y = G.P.y, pad = 0) {
  if (!G.dg) return null; const C = (G.W.Z.decor && G.W.Z.decor.chests) || [];
  for (let i = 0; i < C.length; i++) if (!G.dg.chests[i] && dist(x, y, C[i][0], C[i][1]) < 80 + pad) return { k: 'chest', i, x: C[i][0], y: C[i][1] };
  return null;
}
/** Открыть сундук: содержимое — в подсумок на месте сундука (как тело), берётся как добыча. */
export function openChest(G, i) {
  const C = G.W.Z.decor.chests[i]; if (G.dg.chests[i]) return; G.dg.chests[i] = true;
  const L = chestLoot(G.hero, G.W.Z, G.rand);
  const c = { id: ++G.corpseSeq, x: C[0], y: C[1], kind: 'chest', chest: true, name: 'Сундук', lvl: 0, dir: 1, t: 1e9, money: L.money, items: L.items };
  G.corpses.push(c); sfx(G, 'loot'); G.fx.push({ k: 'spawn', x: C[0], y: C[1] - 20, t: 0.6, max: 0.6 }); emit(G, { k: 'lootOpen', c });
}
/** Портал наружу после главного босса — выход у врат. */
function openPortal(G) {
  const D = G.W.Z.decor; if (!D || !D.portal || G.W.exits.some(e => e.portal)) return;
  const back = G.W.Z.exits.find(e => e.zone);
  G.W.exits.push({ x: D.portal[0], y: D.portal[1], to: back.to, lvl: back.lvl, zone: back.zone, at: back.at, door: true, portal: true });
}
function interact(G) { const t = interactTarget(G); if (t) doInteract(G, t); }
function doInteract(G, t) {
  if (t.k === 'corpse') { G.P.auto = null; emit(G, { k: 'lootOpen', c: t.c }); return; }
  if (t.k === 'chest') { G.P.auto = null; openChest(G, t.i); return; }
  if (t.k === 'npc') { G.P.auto = null; qTalk(G, t.n.id); return; }
  if (t.k === 'qobj') { qUseObj(G, t.o); return; }
  if (t.k === 'vein') { if (G.P.mine) stopMine(G); else startMine(G, t.v); return; }
  if (t.k === 'plant') { if (G.P.gather) stopGather(G); else startGather(G, t.v); return; }
  if (t.k === 'b') { if (t.b.vendor) emit(G, { k: 'vendor', b: t.b }); else if (t.b.bank) emit(G, { k: 'bank', b: t.b }); else if (t.b.mentor) emit(G, { k: 'mentor', b: t.b }); else if (t.b.alchemy || t.b.brew) emit(G, { k: 'alchemy', b: t.b }); else if (t.b.enchant) emit(G, { k: 'enchant', b: t.b }); else if (t.b.guild) emit(G, { k: 'guild', b: t.b }); else if (t.b.smelt) emit(G, { k: 'smelt', b: t.b }); else emit(G, { k: 'toast', s: `${t.b.name}. ${t.b.note}`, id: 'bld' }); }
  if (t.k === 'exit') { if (t.e.zone) emit(G, { k: 'zone', e: t.e }); else if (t.e.temple) emit(G, { k: 'toast', s: t.e.door ? 'Врата подземелья заперты — откроются в следующих версиях' : 'Врата Храма квакунов заперты. Внутри тихо — подземелье откроется в следующих версиях', id: 'exit' }); else emit(G, { k: 'toast', s: `Дорога в ${t.e.to} (ур. ${t.e.lvl}) откроется в следующих версиях`, id: 'exit' }); }
}

// ---------------------------------------------------------------- урон герою и смерть
function hurtHero(G, v, m, dot) {
  const P = G.P; if (P.dead) return;
  if (dot === 'pierce') {   // v94: умение босса — доля здоровья, мимо брони, уклонения и блока; спасают только уход из площади, Каменное сердце и зелье стойкости
    if (P.buf.stone > 0) v *= 0.5; v *= elixirMods(G.hero).taken; P.hurt = 0.25; emit(G, { k: 'hdmg', v }); sfx(G, 'hurt');
    if (P.mine) stopMine(G); if (P.gather) stopGather(G);
  } else if (!dot) {
    const p = G.st.p || {};
    if (p.dodge > 0 && G.rand() < p.dodge / 100) { emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'уклонение', col: '#cfeaff' }); P.lastCombat = G.t; return; }
    if (p.block > 0 && G.rand() < p.block / 100) { emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'блок', col: '#e8e0cc' }); P.lastCombat = G.t; sfx(G, 'hammer'); return; }
    if (P.buf.stone > 0) v *= 0.5;   // Каменное сердце
    v *= elixirMods(G.hero).taken;   // Зелье стойкости
    if (P.buf.berserk > 0) v *= hasTal(G.hero, 'iron') ? 0.9 : 1 + ABX(G, 'berserk').taken;   // Ярость: открыт для ударов (Несокрушимость — наоборот)
    v *= (1 - armorCut(G.st.armor, G.hero.lvl)); P.hurt = 0.18; emit(G, { k: 'hdmg', v }); sfx(G, 'hurt');
    if (P.buf.thorns > 0 && m && m.state !== 'dead') strike(G, m, v * 0.3, 'thorns', { sure: true, noCrit: true, flat: true });   // Тотем шипов
    if (P.mine) stopMine(G, 'Копать помешали'); if (P.gather) stopGather(G, 'Собирать помешали');
  }
  P.hp -= v; P.lastCombat = G.t; P.sit = false;
  if (P.hp <= 0) heroDie(G);
}

function heroDie(G) {
  const P = G.P; P.hp = 0; P.dead = true; P.deadT = 0; P.target = null; P.auto = null; P.goal = null; P.poison = null; P.whirl = 0; P.volley = 0; P.dash = null; P.sit = false; P.buf.berserk = 0; G.areas = []; G.traps = [];
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
  if (m.venom) { m.venom.t -= dt; m.hp -= m.venom.dps * dt; if (m.venom.t <= 0 || m.state === 'return') m.venom = null; if (m.hp <= 0) { killMob(G, m); return; } }
  m.stun = Math.max(0, m.stun - dt); m.root = Math.max(0, m.root - dt); m.chill = Math.max(0, m.chill - dt); m.frozen = Math.max(0, (m.frozen || 0) - dt); m.trapT = Math.max(0, (m.trapT || 0) - dt);
  if (m.stun > 0 || m.frozen > 0) { if (m.B && m.B.act) bossCancel(G, m); return; }   // оглушён или вмёрз в лёд — стоит (умение босса сбито)
  const dH = dist(m.x, m.y, P.x, P.y), dHome = dist(m.x, m.y, m.hx, m.hy), slowK = (m.chill > 0 ? 0.5 : 1) * (m.B ? m.B.haste : 1);
  const go = (tx, ty, sp) => { if (m.state !== 'idle' && (G.W.relief || G.W.rooms) && m.root <= 0) { const w = steer(G, m, tx, ty, dt); if (w) { tx = w[0]; ty = w[1]; } } const d = dist(m.x, m.y, tx, ty); if (d < 1 || m.root > 0) { if (Math.abs(tx - m.x) > 2) m.face = tx < m.x ? -1 : 1; return; } sp *= slowK; const k = Math.min(1, sp * dt / d); let nx = m.x + (tx - m.x) * k, ny = m.y + (ty - m.y) * k; let ok = (a, b) => G.W.walkable(a, b) && !inCity(G.W, a, b) && G.W.stepOk(m.x, m.y, a, b); let ax = nx, ay = ny; if (!ok(ax, ay)) { if (ok(nx, m.y)) ay = m.y; else if (ok(m.x, ny)) ax = m.x; } if (ok(ax, ay)) { const nx2 = ax, ny2 = ay; nx = nx2; ny = ny2; const mv = Math.hypot(nx - m.x, ny - m.y); if (mv > 0.05) { m.mdx = nx - m.x; m.mdy = ny - m.y; m.moving = true; m.walkPh = (m.walkPh + mv / (m.D.humanoid ? 56 : 44)) % 1; } m.x = nx; m.y = ny; } if (Math.abs(tx - m.x) > 2) m.face = tx < m.x ? -1 : 1; };

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
    if (m.B) { bossReset(G, m); m.B = null; m.jumpH = 0; }   // v94: ушёл домой — бой заново с первой фазы
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
  // призыв помощников (Мельник — ворон, шаман — сородича, Паучиха — выводок)
  if (D.summon && !m.summon) { const S = D.summon; m.sumT = (m.sumT ?? S.every * 0.5) - dt;
    if (m.sumT <= 0) { m.sumT = S.every; if (G.mobs.filter(o => o.owner === m && o.state !== 'dead').length < (S.max || S.n * 2)) { for (let i = 0; i < S.n; i++) { const a = G.rand() * 6.28, x = m.x + Math.cos(a) * 60, y = m.y + Math.sin(a) * 60; const o = spawnMob(G, { key: 'призыв', kind: S.kind, lvl: Math.max(1, m.lvl - 2), x, y }, m.camp); Object.assign(o, { summon: true, owner: m, life: 40, state: 'chase' }); G.mobs.push(o); G.fx.push({ k: 'summon', x, y, kind: S.kind, seed: Math.floor(G.rand() * 1e6), t: 1, max: 1 }); } emit(G, { k: 'txt', x: m.x, y: m.y - 70, s: S.say || 'зовёт ворон!', col: '#9affc8' }); } } }
  if (D.ai && bossTick(G, m, dt, (v, dot) => hurtHero(G, v, m, dot), go, (s, big) => { if (big) emit(G, { k: 'toast', s: `${D.name}: ${s}`, id: 'boss' }); else emit(G, { k: 'txt', x: m.x, y: m.y - 80, s, col: '#ff8a2a' }); })) return;   // v94: умения и фазы босса
  if (m.flee > 0) { m.flee -= dt; const a = Math.atan2(m.y - P.y, m.x - P.x); go(m.x + Math.cos(a) * 100, m.y + Math.sin(a) * 100, D.speed * 0.9); return; }
  // элитный удар по площади
  if (D.smash) {
    const S = m.smash;
    if (S.wind > 0) {
      S.wind -= dt;
      if (S.wind <= 0) {
        G.fx.push({ k: 'slam', x: S.x, y: S.y, r: D.smash.r, style: D.smash.style, seed: Math.floor(G.rand() * 1e6), t: 1.8, max: 1.8 }); sfx(G, 'smash');
        if (dist(P.x, P.y, S.x, S.y) < D.smash.r) hurtHero(G, m.dmg * D.smash.mul, m);
        S.t = D.smash.every;
      }
      return; // замахивается — стоит
    }
    S.t -= dt;
    if (S.t <= 0 && dH < 200) { S.wind = D.smash.wind; m.atkT = m.atkDur = D.smash.wind + 0.3; S.x = P.x; S.y = P.y; G.fx.push({ k: 'tele', x: S.x, y: S.y, r: D.smash.r, style: D.smash.style, seed: Math.floor(G.rand() * 1e6), t: D.smash.wind, max: D.smash.wind }); emit(G, { k: 'txt', x: m.x, y: m.y - 60, s: D.smash.say || 'замахивается!', col: '#ff8a2a' }); return; }
  }
  // кабан: разбег
  if (D.trait === 'charge') {
    const Ch = m.charge; Ch.cd -= dt;
    if (Ch.t > 0) {
      Ch.t -= dt; go(P.x, P.y, D.speed * 2.6);
      Ch.dust = (Ch.dust || 0) - dt; if (Ch.dust <= 0) { Ch.dust = 0.06; G.fx.push({ k: 'hoof', x: m.x - m.face * 12, y: m.y, seed: Math.floor(G.rand() * 1e6), t: 0.7, max: 0.7 }); }
      if (dist(m.x, m.y, P.x, P.y) < reach && tier(G, m, P)) { Ch.t = 0; Ch.cd = 6; m.cd = 1.2; hurtHero(G, m.dmg * 1.6, m); emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'таран!', col: '#ff8a2a' }); G.fx.push({ k: 'ram', x: P.x, y: P.y, seed: Math.floor(G.rand() * 1e6), t: 0.8, max: 0.8 }); }
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
      G.shots.push({ from: 'mob', kind: 'curse', x: m.x, y: m.y - 24, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, t: 1.2, dmg: m.dmg, m, slow: 2.5, say: D.curseSay });
    }
    return;
  }
  if (D.trait === 'ranged') {
    if (dH > D.reach * 0.9) go(P.x, P.y, D.speed);
    else if (dH < 150) { const a = Math.atan2(m.y - P.y, m.x - P.x); go(m.x + Math.cos(a) * 60, m.y + Math.sin(a) * 60, D.speed * 0.45); }  // отходит медленно — догнать можно
    if (dH <= D.reach && m.cd <= 0) {
      m.cd = D.cd; m.face = P.x < m.x ? -1 : 1; m.atkT = m.atkDur = 0.42; const a = Math.atan2(P.y - 18 - (m.y - 18), P.x - m.x);
      const fireS = D.shot === 'fire', spore = D.shot === 'spore', sp = fireS ? 380 : spore ? 290 : 520;
      G.shots.push({ from: 'mob', kind: fireS ? 'bottle' : spore ? 'spore' : 'arrow', x: m.x, y: m.y - 18, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: spore ? 1.1 : 1.0, dmg: m.dmg, m, burn: fireS ? D.burn : 0, poison: spore ? 0.22 : 0 });
    }
    return;
  }
  if (dH > reach || !tier(G, m, P)) go(P.x, P.y, D.speed);
  else if (m.cd <= 0) {
    m.cd = D.cd; m.face = P.x < m.x ? -1 : 1; m.bite = 0.2; m.atkT = m.atkDur = 0.35;
    hurtHero(G, m.dmg * (0.9 + G.rand() * 0.2), m);
    if (D.trait === 'poison' && !P.dead) { P.poison = { t: 6, dps: m.dmg * 0.18 }; P.slow = 3; G.fx.push({ k: 'venom', x: P.x, y: P.y, seed: Math.floor(G.rand() * 1e6), t: 1.2, max: 1.2 }); emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: D.poisonSay || 'яд', col: '#8ad84a' }); }
  }
  if (m.bite) m.bite = Math.max(0, m.bite - dt);
}

/** Попадание выстрела умения: эффекты и таланты (искры, отскок льда, рикошет, широкая сеть). */
function shotHit(G, s, m) {
  const H = G.hero, near = (n, r, skip) => G.mobs.filter(o => o !== m && hostile(o) && !(skip && skip.includes(o)) && dist(o.x, o.y, m.x, m.y) < r).sort((a, b) => dist(a.x, a.y, m.x, m.y) - dist(b.x, b.y, m.x, m.y)).slice(0, n);
  const at = (k, d) => G.fx.push(Object.assign(fx(G, k, m.x, m.y, d), { dir: Math.atan2(s.vy, s.vx), big: s.big }));
  if (s.kind === 'fire') at('explosion', s.big ? 1.4 : 0.9);
  if (s.kind === 'frost') at('frostHit', 0.8);
  if (s.kind === 'arrow' && s.red) at('bloodHit', 1.2);
  if (s.split) for (const o of near(s.split, 260)) heroShot(G, o, 'fire', s.dmg * 0.4, { fire: true, skip: [m] }, m.x, m.y - m.r);
  if (s.chain) { const hit = [...(s.hit || []), m], o = near(1, 260, hit)[0]; if (o) heroShot(G, o, 'frost', s.dmg, { chill: s.chill, chain: s.chain - 1, hit, skip: hit }, m.x, m.y - m.r); }
  if (s.rico) for (const o of near(s.rico, 220)) heroShot(G, o, 'arrow', s.dmg * 0.4, { red: true, skip: [m] }, m.x, m.y - m.r);
  if (s.wide) for (const o of near(9, 90)) if (o.state !== 'dead') { setStatus(G, o, 'root', s.root); aggro(G, o); }
}

function shotsTick(G, dt) {
  const P = G.P;
  for (const s of G.shots) {
    s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.age = (s.age || 0) + dt;
    if (s.from === 'hero') {
      for (const m of G.mobs) {
        if (m.state === 'dead' || (s.skip && s.skip.includes(m))) continue;
        if (dist(s.x, s.y, m.x, m.y - m.r * 0.8 - (m.D.flying ? 22 : 0)) < m.r + (s.big ? 16 : 10) + (m.D.flying ? 6 : 0)) {
          s.t = 0; const cold = m.chill > 0 || m.frozen > 0;
          strike(G, m, s.dmg * (s.chillBonus && cold && !hasTal(G.hero, 'frostfire') ? s.chillBonus : 1), 'ranged', { burn: s.burn, sure: s.sure, fire: s.fire, big: s.big });
          if (m.state !== 'dead') { if (s.chill) setStatus(G, m, 'chill', s.chill); if (s.root) setStatus(G, m, 'root', s.root); if (s.bleed) setBleed(G, m, s.bleed); }
          shotHit(G, s, m);
          break;
        }
      }
    } else if (!P.dead && dist(s.x, s.y, P.x, P.y - 16) < 22) {
      s.t = 0; hurtHero(G, s.dmg, s.m);
      const hk = s.kind === 'bottle' ? 'fireSplash' : s.kind === 'spore' ? 'sporeBurst' : s.kind === 'curse' ? 'curseHit' : null;
      if (hk) G.fx.push({ k: hk, x: P.x, y: P.y, seed: Math.floor(G.rand() * 1e6), t: 1.6, max: 1.6 });
      if (s.burn && !P.dead) { P.poison = { t: 4, dps: s.dmg * s.burn, fire: true }; emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'горит!', col: '#ff8a2a' }); }
      if (s.poison && !P.dead) { P.poison = { t: 5, dps: s.dmg * s.poison }; emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: 'споры', col: '#c8e070' }); }
      if (s.slow && !P.dead) { P.slow = Math.max(P.slow, s.slow); emit(G, { k: 'txt', x: P.x, y: P.y - 60, s: s.say || 'проклятие', col: '#9affc8' }); }
    }
  }
  G.shots = G.shots.filter(s => s.t > 0);
}

// ---------------------------------------------------------------- торговля
export const POTION_PRICE = L => 4 + L * 2;

export function sellItem(G, it) {
  const H = G.hero, i = H.bag.indexOf(it); if (i < 0) return;
  const v = it.price * (it.n || 1); H.bag.splice(i, 1); H.gold += v; sfx(G, 'coin');
  // v81: проданное можно выкупить обратно за ту же цену — последние 12 вещей
  H.buyback = H.buyback || []; const bb = { ...it }; delete bb.pos; H.buyback.push({ it: bb, v }); while (H.buyback.length > LOOT.buyback) H.buyback.shift();
  emit(G, { k: 'toast', s: `Продано: ${it.name}${it.n > 1 ? ' × ' + it.n : ''} за ${money(v)}`, id: 'sell' });
}
/** Выкупить проданную вещь обратно (за ту же цену). */
export function buyBack(G, idx) {
  const H = G.hero, L = H.buyback || [], e = L[idx]; if (!e) return false;
  if (H.gold < e.v) { emit(G, { k: 'toast', s: 'Не хватает денег', id: 'gold' }); return false; }
  if (H.bag.length >= LOOT.bag) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return false; }
  H.gold -= e.v; L.splice(idx, 1); bagAdd(H, { ...e.it }); sfx(G, 'coin');
  emit(G, { k: 'toast', s: `Выкуплено: ${e.it.name}`, id: 'buy' }); return true;
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
export function bagAdd(H, it, pos = null) { if (isStackKind(it)) { addStack(H, it); return; } it.pos = pos != null && pos >= 0 && pos < LOOT.bag && !bagAt(H, pos) ? pos : freePos(H); H.bag.push(it); }
/** Переложить вещь в ячейку pos; если там лежит другая — они меняются местами. */
export function bagMove(G, it, pos) {
  const H = G.hero; if (!H.bag.includes(it) || pos < 0 || pos >= LOOT.bag || it.pos === pos) return;
  const other = bagAt(H, pos); if (other) other.pos = it.pos; it.pos = pos;
}
function restat(G) { const ratio = G.P.hp / G.st.maxHp; G.st = heroStats(G.hero); G.P.hp = Math.max(1, G.st.maxHp * ratio); }

export { xpNeed };
