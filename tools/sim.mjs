// Автоигрок: бегает по Сосновому долу, бьёт мобов по силам, пьёт зелья, надевает лучшее.
// Запуск: node tools/sim.mjs [класс] [минут]   — печатает, за сколько минут берётся каждый уровень.
import { PINE } from '../data/zones.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, respawnHero, equip, buyPotion, sellItem, POTION_PRICE, lootAll, hasLoot } from '../src/systems/game.js';
import { LOOT } from '../data/balance.js';
import { lvlColor } from '../data/balance.js';
import { rng, dist } from '../src/engine/util.js';

// путь: из столицы — через ближайшие к цели ворота; снаружи — в обход стены; внутрь — через ворота
function via(W, P, tx, ty) {
  const c = W.cap, dP = dist(P.x, P.y, c.x, c.y), inP = dP < c.R, inT = dist(tx, ty, c.x, c.y) < c.R;
  // в проёме ворот — сначала пройти его насквозь
  if (Math.abs(dP - c.R) < 70) { const a = Math.atan2(P.y - c.y, P.x - c.x); for (const g of c.gates) { const da = Math.abs(((a - g) + Math.PI * 3) % (Math.PI * 2) - Math.PI); if (da < 0.15) { const out = inT ? -1 : 1; return [c.x + Math.cos(g) * (c.R + out * 100), c.y + Math.sin(g) * (c.R + out * 100)]; } } }
  const gate = (x, y) => { let best = 0, bd = 1e9; for (const g of c.gates) { const d = dist(x, y, c.x + Math.cos(g) * c.R, c.y + Math.sin(g) * c.R); if (d < bd) { bd = d; best = g; } } return best; };
  if (inP && inT) return [tx, ty];
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

export function runBot(cls, minutes, seed = 1, log = false) {
  const W = buildWorld(PINE), H = newHero('Бот', cls);
  const G = createGame(H, W, { rand: rng(seed) });
  const dt = 1 / 20, steps = minutes * 60 / dt, lvAt = {}, R = rng(seed + 7);
  let goal = null, deadT = 0, shopping = false, stuck = 0, side = 0, lx = 0, ly = 0;
  const score = it => (it.dmg || 0) * 3 + (it.armor || 0) + (it.stam || 0) * 2 + (it.pow || 0) * 3;
  for (let i = 0; i < steps; i++) {
    const P = G.P, I = {};
    if (P.dead) { if ((deadT += dt) > 3) { respawnHero(G); deadT = 0; goal = null; } }
    else {
      // снаряжение
      for (const it of H.bag.slice()) { const cur = H.eq[it.slot]; if (it.cls === H.cls && (!cur || score(it) > score(cur))) equip(G, it); }
      const inCity = dist(P.x, P.y, W.cap.x, W.cap.y) < W.cap.R - 40;
      if (H.potions === 0 && H.gold >= POTION_PRICE(H.lvl)) shopping = true;
      if (shopping) {
        const mk = W.cap.buildings.find(b => b.vendor), mx = W.cap.x + mk.dx, my = W.cap.y + mk.dy + 40;
        const tx = dist(P.x, P.y, mx, my) > 60 ? mx : null;
        if (tx !== null) { const [x, y] = via(W, P, mx, my); toward(I, P, x, y); }
        else { for (const it of H.bag.slice()) if (it.cls !== H.cls || score(it) <= score(H.eq[it.slot] || { })) sellItem(G, it); while (H.potions < 5 && buyPotion(G)); shopping = false; }
      } else {
        if (P.hp < G.st.maxHp * 0.35) I.potion = true;
        const busy = G.mobs.find(m => m.state === 'chase');
        if (!goal || goal.state === 'dead' || goal.state === 'return') {
          goal = null; let bd = 1e9;
          for (const m of G.mobs) {
            if (m.state === 'dead') continue; const c = lvlColor(m.lvl, H.lvl);
            if (c === '#9a9a9a' || m.lvl > H.lvl + 1) continue;
            if (m.D.rare && H.lvl < 6) continue;
            const d = dist(P.x, P.y, m.x, m.y); if (d < bd) { bd = d; goal = m; }
          }
        }
        // обыскать ближайшее тело с добычей, если никто не нападает
        const body = !busy && G.corpses.filter(hasLoot).sort((a, b) => dist(P.x, P.y, a.x, a.y) - dist(P.x, P.y, b.x, b.y))[0];
        const t = busy || (body && dist(P.x, P.y, body.x, body.y) < 500 ? null : goal);
        // без врагов на хвосте и с малым здоровьем — сначала отдохнуть
        if (!busy && P.hp < G.st.maxHp * 0.7 && H.potions === 0) { /* стоим, здоровье копится */ }
        else if (!busy && body && dist(P.x, P.y, body.x, body.y) < 500) {
          if (dist(P.x, P.y, body.x, body.y) > LOOT.lootR - 15) { const [x, y] = via(W, P, body.x, body.y); toward(I, P, x, y); }
          else lootAll(G, body);
        } else if (t) {
          const reach = { warrior: 50, mage: 340, archer: 380 }[cls], d = dist(P.x, P.y, t.x, t.y);
          G.P.target = t;
          if (d > reach) { const [x, y] = via(W, P, t.x, t.y); toward(I, P, x, y); }
          if (P.hp > G.st.maxHp * 0.25 || H.potions > 0) I.attack = true;
          if (d < 120 && P.abCd <= 0 && R() < 0.05) I.ability = true;
        } else if (P.hp < G.st.maxHp * 0.6) { /* отдых */ }
      }
    }
    // объезд препятствий: если идём, но не двигаемся — шагнуть вбок
    if (I.mx || I.my) {
      if (side > 0) { side -= dt; const a = Math.atan2(I.my, I.mx) + Math.PI / 2; I.mx = Math.cos(a); I.my = Math.sin(a); }
      else if (Math.hypot(G.P.x - lx, G.P.y - ly) < 2) { if ((stuck += dt) > 0.3) { side = 0.9; stuck = 0; } } else stuck = 0;
    }
    lx = G.P.x; ly = G.P.y;
    update(G, dt, I); G.ev.length = 0;
    if (log && i % (log === 2 ? 20 : 1200) === 0) console.log(Math.round(G.t/60), H.lvl, Math.round(P.x), Math.round(P.y), Math.round(P.hp), H.potions, H.gold, shopping, goal && goal.kind, goal && Math.round(goal.x), goal && Math.round(goal.y), goal && goal.state, P.dead, Math.round(G.t - P.lastCombat), G.corpses.length);
    if (!lvAt[H.lvl]) lvAt[H.lvl] = Math.round(G.t / 6) / 10;
  }
  return { cls, lvl: H.lvl, lvAt, kills: H.stats.kills, deaths: H.stats.deaths, gold: H.gold, items: H.stats.items, eq: Object.values(H.eq).filter(Boolean).map(i => `${i.name}(${i.rar})`) };
}

if (process.argv[1] && process.argv[1].endsWith('sim.mjs')) {
  const cls = process.argv[2] || 'all', min = +process.argv[3] || 90;
  for (const c of cls === 'all' ? ['warrior', 'mage', 'archer'] : [cls]) {
    const r = runBot(c, min, 1);
    console.log(`${c}: ур.${r.lvl}, убито ${r.kills}, смертей ${r.deaths}, золото ${r.gold}, вещей ${r.items}`);
    console.log('  минуты до уровня:', Object.entries(r.lvAt).map(([l, m]) => `${l}:${m}`).join(' '));
    console.log('  надето:', r.eq.join(', '));
  }
}
