// v90: подземелья — состояние похода (убитые не возвращаются до обновления, боссы, сундуки, запечатанный ход, портал),
// обновление через Z.reset секунд настоящего времени после выхода. Состояние в h.dungeons[zone] — переживает сохранение.
import { ZONES } from '../../data/zones.js';
import { MOBS } from '../../data/mobs.js';
import { makeItem, makeTrinket } from './items.js';
import { TRINKETS } from '../../data/trinkets.js';

export const DUNGEONS = Object.values(ZONES).filter(Z => Z.dungeon);
export const NEVER = 1e18;   // «не возродится» в h.dead (Infinity в JSON не живёт)

/** Состояние похода героя по подземелью zid (создаётся пустым). */
export function dgState(h, zid) {
  h.dungeons = h.dungeons || {};
  return h.dungeons[zid] || (h.dungeons[zid] = { bosses: {}, chests: {}, resetAt: 0, runs: 0 });
}
/** Боссы подземелья по порядку: [{ kind, name, final }]. */
export const dgBosses = Z => Z.camps.flatMap(c => (Array.isArray(c.mob) ? c.mob : [c.mob]).filter(k => MOBS[k] && MOBS[k].boss).map(k => ({ kind: k, name: MOBS[k].name, final: !!MOBS[k].final })));
/** Сколько секунд до обновления (0 — готово; null — герой внутри, таймер не идёт). */
export function dgLeft(h, Z, now = Date.now()) {
  const S = dgState(h, Z.id); if (h.zone === Z.id) return null;
  return S.resetAt ? Math.max(0, Math.ceil((S.resetAt - now) / 1000)) : 0;
}
export const fmtLeft = s => s >= 3600 ? `${Math.floor(s / 3600)} ч ${String(Math.floor(s % 3600 / 60)).padStart(2, '0')} мин` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Вход: если срок обновления вышел — поход заново (убитые возвращаются, сундуки закрыты, боссы живы). */
export function dgEnter(h, Z, now = Date.now()) {
  const S = dgState(h, Z.id);
  if (S.resetAt && now >= S.resetAt) { dgReset(h, Z); return true; }
  return false;
}
export function dgReset(h, Z) {
  const S = dgState(h, Z.id); S.bosses = {}; S.chests = {}; S.resetAt = 0; S.runs++;
  for (const k of Object.keys(h.dead)) if (k.startsWith(Z.id + ':')) delete h.dead[k];
}
/** Выход (пешком или порталом): с этого момента идёт отсчёт до обновления. */
export function dgLeave(h, Z, now = Date.now()) { const S = dgState(h, Z.id); S.resetAt = now + (Z.reset || 3600) * 1000; }

/** Запечатанные комнаты открыты? — когда все боссы, кроме главного, повержены. */
export const dgUnsealed = (h, Z) => { const S = dgState(h, Z.id); return dgBosses(Z).filter(b => !b.final).every(b => S.bosses[b.kind]); };
export const dgDone = (h, Z) => { const S = dgState(h, Z.id); return dgBosses(Z).every(b => S.bosses[b.kind]); };

/** Добыча из сундука: вещь (зелёная 60% / синяя 40%), монеты по уровню подземелья, самоцвет 30%. */
export function chestLoot(h, Z, rand) {
  const L = Z.lvl[1], items = [makeItem(h.cls, ['weapon', 'head', 'chest', 'legs', 'ring', 'neck'][Math.floor(rand() * 6)], L, rand() < 0.4 ? 'rare' : 'good', rand)];
  return { items, money: Math.round(L * 6 * (1 + rand())) };
}
/** Добыча с босса: гарантированно синяя вещь; главный — ещё фиолетовая (временно) и 20% фиолетовый аксессуар. */
export function bossLoot(h, Z, D, L, rand) {
  const slot = () => ['weapon', 'head', 'chest', 'legs', 'ring', 'neck'][Math.floor(rand() * 6)];
  const items = [makeItem(h.cls, slot(), L, 'rare', rand)];
  if (D.final) { items.push(makeItem(h.cls, slot(), L, 'epic', rand)); if (rand() < 0.2) items.push(makeTrinket(h.cls, L, 'epic', rand)); }
  return items;
}
export const EPIC_TRINKETS = TRINKETS.filter(t => t.rar === 'epic').map(t => t.id);
