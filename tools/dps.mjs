// Баланс умений (v73): сколько врагов уровня героя герой убивает за 2 минуты — по одному и тройкой рядом.
// Сравнение: только старые умения (C, V) / все умения уровня / с каждым талантом. Враги не бьют (меряем только урон).
// node tools/dps.mjs [уровень=20]
import { PINE } from '../data/zones.js';
import { TALENTS } from '../data/talents.js';
import { MOBL } from '../data/balance.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { makeItem } from '../src/systems/items.js';
import { createGame, update, abilsOf } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
function fight(cls, L, { tal = {}, old = false, pack = 3, sec = 600, seed = 7 } = {}) {
  const h = newHero('Б', cls); h.lvl = L; h.talents = tal;
  for (const s of ['head', 'chest', 'legs', 'weapon', 'ring', 'neck']) h.eq[s] = makeItem(cls, s, L, 'good', rng(seed + s.length));
  const G = createGame(h, W, { rand: rng(seed) });
  const ms = G.mobs.filter(m => m.kind === 'wolf').slice(0, pack);
  for (const o of G.mobs) if (!ms.includes(o)) { o.state = 'dead'; o.respawnAt = 1e12; }
  const A = cls === 'warrior' ? 50 : 300, x0 = ms[0].hx - A, y0 = ms[0].hy;
  const put = (m, i) => { const max = Math.round(MOBL.hp(L) * m.D.hp); Object.assign(m, { state: 'chase', hp: max, max, lvl: L, armor: MOBL.armor(L), dmg: 0, x: x0 + A + (i % 2) * 34, y: y0 + (i - 1) * 34, hx: x0 + A, hy: y0, burn: null, bleed: null, venom: null, stun: 0, root: 0, chill: 0, frozen: 0, trapT: 0 }); m.D = { ...m.D, speed: 0, trait: null }; };
  ms.forEach(put); G.P.x = x0; G.P.y = y0;
  let kills = 0; const AB = abilsOf(h);
  for (let i = 0; i < sec * 20; i++) {
    const t = ms.find(m => m.state !== 'dead'); G.P.target = t || null;
    const I = { attack: true };
    const ready = k => G.P.acd[AB[k].id] > 0 ? false : h.lvl >= AB[k].lvl;
    if (ready(0) && !(cls === 'warrior' && AB[0].id === 'charge')) I.ability = true;   // рывок — только на подходе, тут все рядом
    if (ready(1)) I.ability2 = true;
    if (!old && ready(2)) I.ability3 = true;
    if (!old && ready(4) && (cls !== 'archer' || G.traps.length === 0)) I.ability4 = true;
    update(G, 0.05, I); G.ev.length = 0;
    ms.forEach((m, k) => { if (m.state === 'dead') { kills++; put(m, k); } });
    // капкан: враг стоит на месте — ставим капкан под него (как будто враг подбежал)
    for (const tr of G.traps) if (!tr.sprung && t) { tr.x = t.x; tr.y = t.y; }
  }
  return kills;
}

const L = +process.argv[2] || 20;
for (const cls of ['warrior', 'mage', 'archer']) {
  const row = (lab, o) => { const a = fight(cls, L, { ...o, pack: 1 }), b = fight(cls, L, { ...o, pack: 3 }); return [lab, a, b]; };
  const base = row('C+V', { old: true }), all = row('все умения', {});
  const out = [base, all];
  for (const r of TALENTS[cls]) if (r.lvl <= L) for (const op of r.opts) out.push(row(`${r.lvl}: ${op.name}`, { tal: { [r.lvl]: op.id } }));
  console.log(`\n${cls} ур.${L} — убито за 10 мин (один враг | трое рядом), прирост к C+V`);
  for (const [lab, a, b] of out) console.log(`  ${lab.padEnd(26)} ${String(a).padStart(4)} ${pct(a, base[1])}   ${String(b).padStart(4)} ${pct(b, base[2])}`);
}
function pct(v, b) { const p = Math.round((v / b - 1) * 100); return `(${p >= 0 ? '+' : ''}${p}%)`.padEnd(7); }
