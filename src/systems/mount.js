// v121: ездовой конь, как в WoW. Покупка у конюшего на Конном дворе (западный берег Соснового дола) с 15-го уровня;
// у героя — купленные кони `h.mounts` и выбранный `h.mount`. Сесть — клавиша Z / кнопка: 1,5 с вне боя (шаг сбивает),
// в подземелье нельзя. Верхом бег ×1,6. Слезает сам: удар по герою, свой удар или умение, копать, собирать, сесть отдохнуть.
import { MOUNTS } from '../../data/mounts.js';
import { MOUNT } from '../../data/balance.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
const toast = (G, s) => emit(G, { k: 'toast', s, id: 'mount' });
/** Скорость бега: верхом — по коню. */
export const rideK = G => (G.P.ride && MOUNTS[G.P.ride] ? MOUNTS[G.P.ride].speed : 1);
/** Можно ли здесь ездить. */
export const rideOk = W => !W.Z.dungeon && !W.Z.interior;

/** Купить коня у конюшего. */
export function buyMount(G, id) {
  const H = G.hero, M = MOUNTS[id]; if (!M) return false;
  if (H.mounts.includes(id)) return false;
  if (H.lvl < M.lvl) { toast(G, `Коня продают с ${M.lvl}-го уровня`); return false; }
  if (H.gold < M.price) { toast(G, 'Не хватает денег'); return false; }
  H.gold -= M.price;
  H.mounts.push(id); H.mount = id; sfx(G, 'levelUp');
  toast(G, `Куплен <b>${M.name}</b>! Сесть верхом — ${'Z'} или кнопка с подковой`); emit(G, { k: 'mounts' }); return true;
}
/** Выбрать, на каком коне ездить. */
export function pickMount(G, id) { const H = G.hero; if (!H.mounts.includes(id)) return false; H.mount = id; if (G.P.ride) G.P.ride = id; emit(G, { k: 'mounts' }); return true; }

/** Z: верхом — слезть; пешком — начать садиться. */
export function toggleMount(G) {
  const H = G.hero, P = G.P;
  if (P.ride) { dismount(G); return true; }
  if (P.mountCast) { P.mountCast = null; return false; }
  if (P.dead) return false;
  if (!H.mount) { toast(G, H.lvl < 15 ? 'Коня можно купить с 15-го уровня — на Конном дворе, на западном берегу' : 'Своего коня нет — купите на Конном дворе, на западном берегу'); return false; }
  if (!rideOk(G.W)) { toast(G, 'Здесь верхом не проехать'); return false; }
  if (G.t - P.lastCombat < MOUNT.combat) { toast(G, 'В бою на коня не сесть'); return false; }
  P.sit = false; P.auto = null; P.mountCast = { t: 0, max: MOUNT.cast }; sfx(G, 'potion'); return true;
}
/** Сесть сбилось (шаг, удар). */
export function stopMountCast(G) { G.P.mountCast = null; }
/** Слезть с коня. */
export function dismount(G, why) {
  const P = G.P; if (!P.ride) return; P.ride = null; G.hero.riding = false; G.fx.push({ k: 'hoof', x: P.x, y: P.y, seed: 7, t: 0.6, max: 0.6 }); if (why) toast(G, why);
}
/** Каждый кадр: идёт посадка. */
export function mountTick(G, dt) {
  const P = G.P; if (!P.mountCast) return;
  if (P.dead) { P.mountCast = null; return; }
  P.mountCast.t += dt; if (P.mountCast.t < P.mountCast.max) return;
  P.mountCast = null; P.ride = G.hero.mount; G.hero.riding = true; sfx(G, 'skill');
  G.fx.push({ k: 'mountOn', x: P.x, y: P.y, t: 0.8, max: 0.8 });
}
