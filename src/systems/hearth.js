// Камень возвращения (v108): как в WoW. Всегда при герое — места в сумке не занимает: кнопка с камнем и клавиша H.
// 10 секунд переноса — сбивают шаг, удар, умение, урон; потом герой дома, перезарядка 20 минут настоящего времени
// (идёт и после выхода из игры). Дом — постоялый двор, где герой остановился (Столица — Постоялый двор и Таверна,
// Хутор Подгорный — Постоялый двор). Перенос в другую зону — событием `hearth` (зону строит main.js, как дорогу).
import { HEARTH } from '../../data/balance.js';
import { ZONES } from '../../data/zones.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
export const isHearth = it => !!it && it.tool === 'hearth';
/** Дом героя: зона и постройка. */
export const homeOf = H => (H.home && ZONES[H.home.zone] && bindB(H.home.zone, H.home.b) ? H.home : HEARTH.home);
function bindB(zone, id) { const Z = ZONES[zone], T = Z && (Z.capital || Z.village); return T && T.buildings.find(b => b.id === id && b.bind) ? { T, b: T.buildings.find(b => b.id === id) } : null; }
/** Где окажется герой: перед дверью постоялого двора. */
export function homeSpot(H) { const h = homeOf(H), r = bindB(h.zone, h.b); return { zone: h.zone, x: r.T.x + r.b.dx, y: r.T.y + r.b.dy + 70, name: `${r.b.name} — ${r.T.name}` }; }
/** Секунды до готовности (настоящее время). */
export const hearthLeft = (H, now = Date.now()) => Math.max(0, ((H.hearthAt || 0) - now) / 1000);
/** Сделать постоялый двор домом. */
export function bindHome(G, b) {
  const H = G.hero; if (!b || !b.bind) return false;
  H.home = { zone: G.W.Z.id, b: b.id }; sfx(G, 'skill');
  emit(G, { k: 'toast', s: `Теперь ваш дом — <b>${homeSpot(H).name}</b>. Камень возвращения перенесёт сюда`, id: 'hearth' }); return true;
}
/** Начать перенос. */
export function startHearth(G, now = Date.now()) {
  const H = G.hero, P = G.P;
  if (P.dead) return false;
  if (P.hearth) { stopHearth(G, 'Перенос отменён'); return false; }
  const left = hearthLeft(H, now);
  if (left > 0) { emit(G, { k: 'toast', s: `Камень возвращения ещё не готов: ${Math.ceil(left / 60)} мин`, id: 'hearth' }); return false; }
  if (P.dash) return false;
  P.sit = false; P.auto = null; P.goal = null; P.hearth = { t: 0, max: HEARTH.cast };
  emit(G, { k: 'toast', s: `Возвращение домой (${homeSpot(H).name}): ${HEARTH.cast} с. Шаг, удар или урон собьют перенос`, id: 'hearth' }); sfx(G, 'potion'); return true;
}
export function stopHearth(G, why) { if (!G.P.hearth) return; G.P.hearth = null; if (why) emit(G, { k: 'toast', s: why, id: 'hearth' }); }
/** Каждый кадр: идёт перенос; готово — дома (в этой зоне — сразу, в другой — событием для main.js). */
export function hearthTick(G, dt, now = Date.now()) {
  const P = G.P; if (!P.hearth) return;
  if (P.dead) { P.hearth = null; return; }
  P.hearth.t += dt; if (P.hearth.t < P.hearth.max) return;
  P.hearth = null; const H = G.hero, s = homeSpot(H); H.hearthAt = now + HEARTH.cd * 1000;
  G.fx.push({ k: 'spawn', x: P.x, y: P.y, t: 0.6, max: 0.6 });
  if (s.zone === G.W.Z.id) { P.x = s.x; P.y = s.y; P.goal = null; G.fx.push({ k: 'spawn', x: P.x, y: P.y, t: 0.8, max: 0.8 }); emit(G, { k: 'toast', s: `Вы дома: ${s.name}`, id: 'hearth' }); emit(G, { k: 'cam' }); }
  else emit(G, { k: 'hearth', zone: s.zone, at: { x: s.x, y: s.y }, name: s.name });
  sfx(G, 'levelUp');
}
