// Дуэль: герой уровня L в вещах цвета rar против мобов вида kind уровня ML (одного или pack); мобы бьют. Печатает исход.
// node tools/fight.mjs [L=10] [rar=rare] [kind=weaver] [ML=14] [pack=1]
import { SHROOM } from '../data/zones.js';
import { MOBL } from '../data/balance.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { makeItem } from '../src/systems/items.js';
import { createGame, update, abilsOf } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';
const [L = 10, rar = 'rare', kind = 'weaver', ML = 14, pack = 1] = process.argv.slice(2).map((v, i) => i === 1 || i === 2 ? v : +v);
const W = buildWorld(SHROOM);
export function duel(cls, seed = 7) {
  const h = newHero('Б', cls); h.lvl = L; h.potions = 0;
  for (const s of ['head', 'chest', 'legs', 'weapon', 'ring', 'neck']) h.eq[s] = makeItem(cls, s, L, rar, rng(seed + s.length));
  const G = createGame(h, W, { rand: rng(seed) });
  const ms = G.mobs.filter(m => m.kind === kind).slice(0, pack);
  if (ms.length < pack) throw new Error('мало мобов ' + kind);
  for (const o of G.mobs) if (!ms.includes(o)) { o.state = 'dead'; o.respawnAt = 1e12; }
  const A = cls === 'warrior' ? 50 : 260, x0 = ms[0].hx - A, y0 = ms[0].hy;
  ms.forEach((m, i) => { const max = Math.round(MOBL.hp(ML) * m.D.hp); Object.assign(m, { state: 'chase', hp: max, max, lvl: ML, armor: MOBL.armor(ML), dmg: MOBL.dmg(ML) * m.D.dmg, x: x0 + A + (i % 2) * 34, y: y0 + (i - 1) * 30, hx: x0 + A, hy: y0 }); });
  G.P.x = x0; G.P.y = y0; G.P.hp = G.st.maxHp;
  const AB = abilsOf(h); let t = 0;
  for (let i = 0; i < 20 * 180; i++) {
    const tg = ms.find(m => m.state !== 'dead'); if (!tg) break; G.P.target = tg;
    const I = { attack: true }; const ready = k => AB[k] && !(G.P.acd[AB[k].id] > 0) && h.lvl >= AB[k].lvl;
    if (ready(0)) I.ability = true; if (ready(1)) I.ability2 = true; if (ready(2)) I.ability3 = true; if (ready(4)) I.ability4 = true;
    update(G, 0.05, I); G.ev.length = 0; t += 0.05;
    if (G.P.hp <= 0 || G.P.dead) return { win: false, t, hp: 0 };
  }
  return { win: ms.every(m => m.state === 'dead'), t, hp: Math.round(G.P.hp / G.st.maxHp * 100) };
}
if (process.argv[1].endsWith('fight.mjs')) for (const cls of ['warrior', 'mage', 'archer']) { const r = []; for (let s = 1; s <= 10; s++) r.push(duel(cls, s)); const w = r.filter(x => x.win).length; console.log(`${cls.padEnd(8)} ур.${L} ${rar} vs ${kind} ${ML}×${pack}: побед ${w}/10, бой ${Math.round(r.reduce((a, x) => a + x.t, 0) / r.length)} с, здоровья в конце ${Math.round(r.filter(x => x.win).reduce((a, x) => a + x.hp, 0) / Math.max(1, w))}%`); }
