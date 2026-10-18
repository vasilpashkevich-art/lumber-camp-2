// Автоигрок: бегает по Сосновому долу, бьёт мобов по силам, пьёт зелья, надевает лучшее.
// Запуск: node tools/sim.mjs [класс] [минут]   — печатает, за сколько минут берётся каждый уровень.
import { PINE, ZONES } from '../data/zones.js';
import { buildWorld, inCity } from '../src/world/world.js';
import { nextWaypoint } from '../src/world/relief.js';
import { newHero, compareItem } from '../src/entities/hero.js';
import { createGame, update, respawnHero, equip, buyPotion, sellItem, POTION_PRICE, lootAll, hasLoot } from '../src/systems/game.js';
import { LOOT, AGGRO } from '../data/balance.js';
import { lvlColor } from '../data/balance.js';
import { makeItem } from '../src/systems/items.js';
import { talentRows, chooseTalent } from '../src/systems/talents.js';
// v73: новые умения (R, F) и таланты — по умолчанию включены; SIM_OLD=1 — как до v73 (для сравнения)
const NEW = !process.env.SIM_OLD;
import { rng, dist } from '../src/engine/util.js';

// путь: из столицы — через ближайшие к цели ворота; снаружи — в обход стены; внутрь — через ворота
/** v121: Конный двор — загон и конюшня в обход по углам (углы с запасом, пересечение — по самому забору). */
function yardDetour(W, P, tx, ty) {
  if (W.yard) { const Y = W.yard, Pd = Y.paddock, sx = Y.x + Y.stable.dx, sy = Y.y + Y.stable.dy;
    for (const [x0, y0, x1, y1] of [[Pd.x0, Pd.y0, Pd.x1, Pd.y1], [sx - 190, sy - 70, sx + 190, sy]]) {
      const e = 18, hit = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay) || 1; for (let d = 26; d < L; d += 10) { const x = ax + (bx - ax) * d / L, y = ay + (by - ay) * d / L; if (x > x0 - e && x < x1 + e && y > y0 - e && y < y1 + e) return true; } return false; };
      if (P.x > x0 && P.x < x1 && P.y > y0 && P.y < y1) continue;
      if (!hit(P.x, P.y, tx, ty)) continue;
      if (P.yc && dist(P.x, P.y, P.yc[0], P.yc[1]) > 30 && !hit(P.x, P.y, P.yc[0], P.yc[1])) return P.yc;   // держаться выбранного угла
      const k = 60, cs = [[x0 - k, y0 - k], [x1 + k, y0 - k], [x1 + k, y1 + k], [x0 - k, y1 + k]].filter(([x, y]) => dist(P.x, P.y, x, y) > 30 && !hit(P.x, P.y, x, y));
      if (cs.length) return (P.yc = cs.reduce((a, b) => dist(P.x, P.y, a[0], a[1]) + dist(a[0], a[1], tx, ty) < dist(P.x, P.y, b[0], b[1]) + dist(b[0], b[1], tx, ty) ? a : b));
    } }
  return null;
}
function via(W, P, tx, ty) { const w = via0(W, P, tx, ty); return yardDetour(W, P, w[0], w[1]) || w; }
function via0(W, P, tx, ty) {
  // рельеф (v71): если прямо не пройти (обрыв) — по пути через склоны
  if (W.relief || W.rooms) {
    const S = P.botNav || (P.botNav = { t: 0, tx: 1e9, ty: 1e9 }); S.t -= 1 / 20;
    if (S.t <= 0 || Math.hypot(S.tx - tx, S.ty - ty) > 70) { S.t = 0.6; S.tx = tx; S.ty = ty; S.path = W.stepOk(P.x, P.y, tx, ty) ? null : W.path(P.x, P.y, tx, ty, 14000); }
    if (S.path && S.path.length) { const w = nextWaypoint(W, P.x, P.y, S.path); if (!W.stepOk(P.x, P.y, w[0], w[1])) S.t = 0; return w; }
    return [tx, ty];
  }
  // река: если прямая пересекает воду — сначала к ближайшему мосту, потом на другой берег
  if (W.river) {
    let cross = false; const n = Math.ceil(dist(P.x, P.y, tx, ty) / 30); for (let i = 1; i < n; i++) { const x = P.x + (tx - P.x) * i / n, y = P.y + (ty - P.y) * i / n; if (W.water(x, y, 10)) { cross = true; break; } }
    if (cross) { const b = W.river.bridgeAt.reduce((a, b) => dist(P.x, P.y, b.x, b.y) + dist(b.x, b.y, tx, ty) < dist(P.x, P.y, a.x, a.y) + dist(a.x, a.y, tx, ty) ? b : a); const ts = ty > b.y ? 1 : -1;
      if (Math.abs(P.x - b.x) < 26 && Math.abs(P.y - b.y) < 160) return [b.x, b.y + ts * 150];   // на мосту — идти на тот берег
      return [b.x, b.y - ts * 110]; }
  }
  const c = W.cap; if (!c) return [tx, ty];
  if (c.square) {   // v86: квадратная столица — через ворота и площадь, снаружи — в обход по углам
    const R = W.town.rect, pad = 210, inP = inCity(W, P.x, P.y), inT = inCity(W, tx, ty), plaza = [c.x, c.y + 160];
    const near = (x, y) => W.gates.reduce((a, g) => dist(x, y, g.x, g.y) < dist(x, y, a.x, a.y) ? g : a);
    const gz = W.gates.find(g => { const ax = g.out[0] - g.in[0], ay = g.out[1] - g.in[1], L = Math.hypot(ax, ay), u = ((P.x - g.in[0]) * ax + (P.y - g.in[1]) * ay) / L, v = Math.abs((P.x - g.in[0]) * ay - (P.y - g.in[1]) * ax) / L; return u > -20 && u < (inT ? L + 20 : L - 40) && v < 70; });
    if (gz) { const e = inT ? gz.in : gz.out; if (dist(P.x, P.y, e[0], e[1]) > 30) return e; }   // в проёме ворот — пройти насквозь
    if (inP && inT) return dist(P.x, P.y, tx, ty) > 320 && dist(P.x, P.y, plaza[0], plaza[1]) > 60 && dist(tx, ty, plaza[0], plaza[1]) > 60 ? plaza : [tx, ty];
    if (inP) { const g = near(tx, ty); const south = Math.abs(g.x - c.x) < 1, past = (P.x - g.in[0]) * (g.out[0] - g.in[0]) + (P.y - g.in[1]) * (g.out[1] - g.in[1]) > 0 && Math.abs(south ? P.x - g.x : P.y - g.y) < 50; if (!past && dist(P.x, P.y, g.in[0], g.in[1]) > 30) { const onStreet = south ? Math.abs(P.x - c.x) < 60 : Math.abs(P.y - g.y) < 50; return !onStreet && dist(P.x, P.y, plaza[0], plaza[1]) > 60 ? plaza : g.in; } return g.out; }
    if (inT) { const g = near(P.x, P.y); if (dist(P.x, P.y, g.out[0], g.out[1]) > 50 && W.townD(P.x, P.y) < 160) return g.out; if (dist(P.x, P.y, g.out[0], g.out[1]) > 50) return g.out; return g.in; }
    const E = [R[0] - pad, R[1] - pad, R[2] + pad, R[3] + pad], dx = tx - P.x, dy = ty - P.y;
    const hit = (() => { let t0 = 0, t1 = 1; for (const [p, q] of [[-dx, P.x - E[0]], [dx, E[2] - P.x], [-dy, P.y - E[1]], [dy, E[3] - P.y]]) { if (p === 0) { if (q < 0) return false; continue; } const t = q / p; if (p < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t); } return t0 < t1; })();
    if (!hit) return [tx, ty];
    // обход по кольцу вокруг стены: ближайшая точка кольца от героя и от цели, идти по короткой дуге от угла к углу
    const o = 70, X0 = E[0] - o, Y0 = E[1] - o, X1 = E[2] + o, Y1 = E[3] + o, Wd = X1 - X0, Hd = Y1 - Y0, Per = 2 * (Wd + Hd);
    const ringS = (x, y) => { const cx_ = Math.max(X0, Math.min(X1, x)), cy_ = Math.max(Y0, Math.min(Y1, y)), d = [cy_ - Y0, X1 - cx_, Y1 - cy_, cx_ - X0], side = d.indexOf(Math.min(...d)); return side === 0 ? cx_ - X0 : side === 1 ? Wd + (cy_ - Y0) : side === 2 ? Wd + Hd + (X1 - cx_) : 2 * Wd + Hd + (Y1 - cy_); };
    const atS = sv => { sv = ((sv % Per) + Per) % Per; return sv < Wd ? [X0 + sv, Y0] : sv < Wd + Hd ? [X1, Y0 + sv - Wd] : sv < 2 * Wd + Hd ? [X1 - (sv - Wd - Hd), Y1] : [X0, Y1 - (sv - 2 * Wd - Hd)]; };
    const sP = ringS(P.x, P.y), sT = ringS(tx, ty), fwd = ((sT - sP) % Per + Per) % Per, dir = fwd <= Per / 2 ? 1 : -1, len = dir > 0 ? fwd : Per - fwd;
    const cs = [0, Wd, Wd + Hd, 2 * Wd + Hd];
    let next = null, best = 1e9; for (const cc of cs) { const d = dir > 0 ? ((cc - sP) % Per + Per) % Per : ((sP - cc) % Per + Per) % Per; if (d > 50 && d < best) { best = d; next = cc; } }
    if (next === null || best >= len) return atS(sT);
    return atS(next);
  }
  const dP = dist(P.x, P.y, c.x, c.y), inP = dP < c.R, inT = dist(tx, ty, c.x, c.y) < c.R;
  // в проёме ворот — сначала пройти его насквозь
  if (Math.abs(dP - c.R) < 70) { const a = Math.atan2(P.y - c.y, P.x - c.x); for (const g of c.gates) { const da = Math.abs(((a - g) + Math.PI * 3) % (Math.PI * 2) - Math.PI); if (da < (c.gateW || 0.15)) { const out = inT ? -1 : 1; return [c.x + Math.cos(g) * (c.R + out * 100), c.y + Math.sin(g) * (c.R + out * 100)]; } } }
  const gate = (x, y) => { let best = 0, bd = 1e9; for (const g of c.gates) { const d = dist(x, y, c.x + Math.cos(g) * c.R, c.y + Math.sin(g) * c.R); if (d < bd) { bd = d; best = g; } } return best; };
  if (inP && inT) { // фонтан в центре — обойти по площади
    const f = c.fountain ? c.fountain.r + 60 : 0, dx = tx - P.x, dy = ty - P.y, L = Math.hypot(dx, dy) || 1, t = Math.max(0, Math.min(1, ((c.x - P.x) * dx + (c.y - P.y) * dy) / (L * L)));
    if (f && dist(P.x + dx * t, P.y + dy * t, c.x, c.y) < f) { const a = Math.atan2(P.y - c.y, P.x - c.x), side = (dx * (P.y - c.y) - dy * (P.x - c.x)) > 0 ? -1 : 1; const b = a + side * 0.9; return [c.x + Math.cos(b) * (f + 40), c.y + Math.sin(b) * (f + 40)]; }
    return [tx, ty]; }
  if (inP) { const g = gate(tx, ty); const ax = c.x + Math.cos(g) * (c.R + 90), ay = c.y + Math.sin(g) * (c.R + 90);
    const ix = c.x + Math.cos(g) * (c.R - 80), iy = c.y + Math.sin(g) * (c.R - 80);
    const da = Math.abs(((Math.atan2(P.y - c.y, P.x - c.x) - g) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
    return da > 0.07 ? [ix, iy] : [ax, ay]; }
  if (inT) { const g = gate(P.x, P.y); const ox = c.x + Math.cos(g) * (c.R + 90), oy = c.y + Math.sin(g) * (c.R + 90);
    return dist(P.x, P.y, ox, oy) > 50 && Math.abs(Math.atan2(P.y - c.y, P.x - c.x) - g) > 0.12 ? [ox, oy] : [c.x + Math.cos(g) * (c.R - 100), c.y + Math.sin(g) * (c.R - 100)]; }
  // оба снаружи: если прямая идёт через столицу — обойти по касательной
  const dx = tx - P.x, dy = ty - P.y, L = Math.hypot(dx, dy) || 1;
  const t = Math.max(0, Math.min(1, ((c.x - P.x) * dx + (c.y - P.y) * dy) / (L * L)));
  const qx = P.x + dx * t, qy = P.y + dy * t;
  if (t > 0.02 && t < 0.98 && dist(qx, qy, c.x, c.y) < c.R + 70) {
    const a = Math.atan2(P.y - c.y, P.x - c.x), side = (dx * (P.y - c.y) - dy * (P.x - c.x)) > 0 ? -1 : 1;
    const b = a + side * 0.5; return [c.x + Math.cos(b) * (c.R + 120), c.y + Math.sin(b) * (c.R + 120)];
  }
  return [tx, ty];
}
const toward = (I, P, x, y) => { const a = Math.atan2(y - P.y, x - P.x); I.mx = Math.cos(a); I.my = Math.sin(a); };

import { dodge } from './dodge.mjs';
import * as Q from '../src/systems/quests.js';
export function runBot(cls, minutes, seed = 1, log = false, zone = 'pine', lvl = 1) {
  const W = buildWorld(ZONES[zone]), H = newHero('Бот', cls); H.zone = zone; if (lvl > 1) { H.lvl = lvl; for (const sl of ['head', 'chest', 'legs', 'weapon', 'ring', 'neck']) H.eq[sl] = makeItem(cls, sl, lvl, process.env.SIM_RAR || 'common', rng(seed + 3)); if (process.env.SIM_RAR) H.potions = 5; }   // SIM_RAR=good — в зелёном с зельями
  const G = createGame(H, W, { rand: rng(seed) });
  const dt = 1 / 20, steps = minutes * 60 / dt, lvAt = {}, R = rng(seed + 7);
  let goal = null, pullT = 0, wasBusy = false, hpAtStart = 1, deadT = 0, shopping = false, stuck = 0, side = 0, sdir = 1, nst = 0, lx = 0, ly = 0, stuckT = 0, walkT = 0;
  for (let i = 0; i < steps; i++) {
    const P = G.P, I = {};
    if (P.dead) { if ((deadT += dt) > 3) { respawnHero(G); deadT = 0; goal = null; } }
    else {
      // таланты: бот берёт первый в каждом открытом ряду
      if (NEW) for (const r of talentRows(H)) if (H.lvl >= r.lvl && !(H.talents || {})[r.lvl]) chooseTalent(H, r.lvl, r.opts[+(process.env.SIM_TAL || 0)].id);
      // v95: задания (SIM_Q=1) — бот берёт и сдаёт издали, разведку/разговоры/предметы засчитывает сам (без ходьбы — оценка сверху)
      if (process.env.SIM_Q && (i % 100) === 0) { const S = Q.qState(H); for (const id of Object.keys(Q.QUESTS)) { const st = Q.qStatus(H, id); if (st === 'avail' && Q.QUESTS[id].zone === zone) Q.qAccept(G, id); } for (const id of Object.keys(S.act)) { Q.QUESTS[id].goals.forEach((g, gi) => { if (g.k !== 'kill' && g.k !== 'loot') S.act[id].n[gi] = Q.goalNeed(g); }); if (Q.qReady(H, id)) Q.qTurnIn(G, id, 0); } G.ev.length = 0; }
      // снаряжение
      for (const it of H.bag.slice()) { const c = compareItem(H, it); if (c && c.score > 0) equip(G, it); }
      if (H.potions === 0 && H.gold >= POTION_PRICE(H.lvl) && W.houses.some(b => b.vendor)) shopping = true;   // в подземелье торговца нет
      if (shopping) {
        const mk = W.houses.find(b => b.vendor), mx = mk.x, my = mk.y + 40;
        const tx = dist(P.x, P.y, mx, my) > 60 ? mx : null;
        if (tx !== null) { const [x, y] = via(W, P, mx, my); toward(I, P, x, y); }
        else { for (const it of H.bag.slice()) { const c = compareItem(H, it); if (!c || c.score <= 0) sellItem(G, it); } while (H.potions < 5 && buyPotion(G)); shopping = false; }
      } else {
        if (P.hp < G.st.maxHp * 0.35) I.potion = true;
        const busy = G.mobs.find(m => m.state === 'chase');
        if (busy && !wasBusy) hpAtStart = P.hp / G.st.maxHp; wasBusy = !!busy;
        if (!goal || goal.state === 'dead' || goal.state === 'return') {
          goal = null; let bd = 1e9;
          for (const m of G.mobs) {
            if (m.state === 'dead') continue; const c = lvlColor(m.lvl, H.lvl);
            if (c === '#9a9a9a' || m.lvl > H.lvl + (H.lvl >= 5 ? 1 : 0) || m.camp && m.camp.lvl[1] > H.lvl + 1) continue;   // v89: до 5-го — не выше себя; в логова старших не лезть
            if (m.D.rare && H.lvl < 6) continue;
            const d = dist(P.x, P.y, m.x, m.y); if (d < bd) { bd = d; goal = m; }
          }
        }
        // обыскать ближайшее тело с добычей, если никто не нападает
        const body = !busy && G.corpses.filter(hasLoot).sort((a, b) => dist(P.x, P.y, a.x, a.y) - dist(P.x, P.y, b.x, b.y))[0];
        const t = busy || (body && dist(P.x, P.y, body.x, body.y) < 500 ? null : goal);
        // без врагов на хвосте и с малым здоровьем — сначала отдохнуть
        if (!busy && (P.hp < G.st.maxHp * 0.8 || P.sit && P.hp < G.st.maxHp * 0.95)) { if (!P.sit && G.t - P.lastCombat > 1.6) I.sit = true; }  // сесть и перевести дух (v89: с 80%, не лезть в логово раненым)
        else if (!busy && body && dist(P.x, P.y, body.x, body.y) < 500) {
          if (dist(P.x, P.y, body.x, body.y) > LOOT.lootR - 15) { const [x, y] = via(W, P, body.x, body.y); toward(I, P, x, y); }
          else lootAll(G, body);
        } else if (t && !(P.weak > 0 && !busy)) {   // v89: в слабости после гибели в бой не лезть
          const reach = { warrior: 50, mage: 340, archer: 380 }[cls], d = dist(P.x, P.y, t.x, t.y);
          G.P.target = t;
          // v89: тянуть по одному — подойти на край заметности, подождать, пока моб сам пойдёт; в логово не заходить
          const ar = AGGRO * Math.max(0.55, Math.min(1.6, 1 + (t.lvl - H.lvl) * 0.1)) - 6;   // как в game.js: с какого расстояния моб заметит
          const pull = !busy && t.state === 'idle' && d > reach && d <= ar && pullT < 2.5;
          if (pull) pullT += dt; else if (busy || d > ar + 30) pullT = 0;
          if (d > reach && !pull) { const [x, y] = via(W, P, t.x, t.y); toward(I, P, x, y); }
          if (busy || P.hp > G.st.maxHp * 0.25 || H.potions > 0) I.attack = true;   // v89: если уже напали — драться до конца
          if (d < 300 && R() < 0.05) I.ability = true;
          if (H.lvl >= 5 && d < 150 && R() < 0.04) I.ability2 = true;
          if (NEW && H.lvl >= 10 && d < (cls === 'warrior' ? 70 : 300) && R() < 0.05) I.ability3 = true;
          if (NEW && H.lvl >= 20 && d < 200 && R() < 0.03) I.ability4 = true;
          const boss = G.mobs.find(m => m.B && m.state === 'chase'); if (boss) Object.assign(I, dodge(G, boss));   // v94: от умений босса уходит
        } else {   // никого рядом — к ближайшему логову по силам, где кто-то жив
          const alive = c => G.mobs.some(m => m.camp === c && m.state !== 'dead' && lvlColor(m.lvl, H.lvl) !== '#9a9a9a');
          const ok = W.camps.filter(c => c.lvl[1] <= H.lvl + 1 && alive(c)); const cs = ok.length ? ok : W.camps.filter(alive);
          if (cs.length) { const cp = cs.reduce((a, c) => dist(P.x, P.y, c.x, c.y) < dist(P.x, P.y, a.x, a.y) ? c : a); const [x, y] = via(W, P, cp.x, cp.y); if (dist(P.x, P.y, cp.x, cp.y) > 150) toward(I, P, x, y); }
        }
      }
    }
    // объезд препятствий: если идём, но не двигаемся — шагнуть вбок
    if (I.mx || I.my) {
      if (side > 0) { side -= dt; const a = Math.atan2(I.my, I.mx) + sdir * Math.PI / 2; I.mx = Math.cos(a); I.my = Math.sin(a); }
      else if (Math.hypot(G.P.x - lx, G.P.y - ly) < 2) { if ((stuck += dt) > 0.3) { nst++; side = 0.9 + Math.min(2, nst * 0.3); if (nst % 3 === 0) sdir = -sdir; stuck = 0; } } else { stuck = 0; if (Math.hypot(G.P.x - lx, G.P.y - ly) > 3) nst = Math.max(0, nst - dt); }
    }
    if (process.env.TLOG) { const T = P.botT || (P.botT = { sit: 0, walk: 0, fight: 0, dead: 0, shop: 0, idle: 0 }); T[P.dead ? 'dead' : P.sit ? 'sit' : shopping ? 'shop' : G.mobs.some(m => m.state === 'chase') ? 'fight' : (I.mx || I.my) ? 'walk' : 'idle'] += dt; if (i === steps - 1) console.log('  время:', Object.entries(T).map(([k, v]) => `${k} ${Math.round(v)} с`).join(', ')); }
    lx = G.P.x; ly = G.P.y;
    const dBefore = H.stats.deaths, chasing = G.mobs.filter(m => m.state === 'chase').map(m => `${m.D.name} ${m.lvl}`).join(', ');
    update(G, dt, I); G.ev.length = 0;
    if (process.env.DLOG && H.stats.deaths > dBefore) console.log(`  † ${Math.round(G.t / 60)} мин, ур.${H.lvl}, зелий ${H.potions}, в погоне: ${chasing}; в бой вошёл с ${Math.round(hpAtStart * 100)}%, слабость ${P.weak > 0 ? 'да' : 'нет'}`);
    if ((I.mx || I.my) && !G.P.dead && !G.P.sit) { walkT += dt; if (Math.hypot(G.P.x - lx, G.P.y - ly) < 0.5) stuckT += dt; }   // хотел идти, но стоит
    if (log && i % (log === 2 ? 20 : 1200) === 0) console.log(Math.round(G.t/60), H.lvl, Math.round(P.x), Math.round(P.y), Math.round(P.hp), H.potions, H.gold, shopping, goal && goal.kind, goal && Math.round(goal.x), goal && Math.round(goal.y), goal && goal.state, P.dead, Math.round(G.t - P.lastCombat), G.corpses.length);
    if (!lvAt[H.lvl]) lvAt[H.lvl] = Math.round(G.t / 6) / 10;
  }
  return { cls, lvl: H.lvl, lvAt, stuck: Math.round(stuckT), walk: Math.round(walkT), kills: H.stats.kills, deaths: H.stats.deaths, gold: H.gold, items: H.stats.items, dg: H.dungeons, eq: Object.values(H.eq).filter(Boolean).map(i => `${i.name}(${i.rar})`) };
}

if (process.argv[1] && process.argv[1].endsWith('sim.mjs')) {
  const cls = process.argv[2] || 'all', min = +process.argv[3] || 90, zone = process.argv[4] || 'pine', lv = +process.argv[5] || 1;
  for (const c of cls === 'all' ? ['warrior', 'mage', 'archer'] : [cls]) {
    const r = runBot(c, min, 1, false, zone, lv);
    console.log(`${c}: ур.${r.lvl}, убито ${r.kills}, смертей ${r.deaths}, золото ${r.gold}, вещей ${r.items}, упирался ${r.stuck} с из ${r.walk} с ходьбы${r.dg && Object.keys(r.dg).length ? ", боссы: " + Object.values(r.dg).map(s => Object.keys(s.bosses).join(" ") || "—").join("; ") : ""}`);
    console.log('  минуты до уровня:', Object.entries(r.lvAt).map(([l, m]) => `${l}:${m}`).join(' '));
    console.log('  надето:', r.eq.join(', '));
  }
}
