// Сохранения: до 5 героев в браузере, у каждого свой ключ. Перенос — файлом.
// Ключи ветки II: lumber-camp2-*  (не пересекаются с основной игрой).
import { HERO_V } from '../entities/hero.js';

const IDX = 'lumber-camp2-heroes';       // список героев: [{id, name, cls, lvl, zone, play, seen}]
const KEY = id => 'lumber-camp2-hero-' + id;
export const MAX_SLOTS = 5;

const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const del = k => { try { localStorage.removeItem(k); } catch (e) { } };

export function listHeroes() {
  try { const a = JSON.parse(get(IDX) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
const writeIdx = a => set(IDX, JSON.stringify(a));

export function loadHero(id) {
  try { const h = JSON.parse(get(KEY(id))); return h ? migrate(h) : null; } catch (e) { return null; }
}

export function saveHero(h) {
  h.seen = Date.now();
  const ok = set(KEY(h.id), JSON.stringify(h));
  const a = listHeroes(), row = { id: h.id, name: h.name, cls: h.cls, lvl: h.lvl, zone: h.zone, play: Math.round(h.stats.play), gold: h.gold, kills: h.stats.kills, seen: h.seen, eq: slimEq(h.eq) };
  const i = a.findIndex(x => x.id === h.id); if (i >= 0) a[i] = row; else a.push(row);
  writeIdx(a); return ok;
}
// для экрана выбора хватит ярусов вещей — сам герой грузится только при входе
const slimEq = eq => Object.fromEntries(Object.entries(eq).map(([k, v]) => [k, v ? { tier: v.tier, wt: v.wt, rar: v.rar } : null]));

export function deleteHero(id) { del(KEY(id)); writeIdx(listHeroes().filter(x => x.id !== id)); }

/** Подтянуть старое сохранение героя к текущей версии. Ничего не теряем. */
export function migrate(h) {
  h.v = h.v || 1;
  h.bag = h.bag || []; h.dead = h.dead || {}; h.stats = Object.assign({ kills: 0, deaths: 0, gold: 0, items: 0, play: 0 }, h.stats || {});
  h.potions = h.potions ?? 2; h.gold = h.gold || 0; h.worldT = h.worldT || 0; h.zone = h.zone || 'pine';
  if (h.v < HERO_V) h.v = HERO_V;
  return h;
}

/** Все герои одним текстом для файла. */
export function exportAll() {
  const heroes = listHeroes().map(r => loadHero(r.id)).filter(Boolean);
  return JSON.stringify({ game: 'lumber-camp-2', v: 1, at: new Date().toISOString(), heroes });
}

/** Загрузить из текста файла. Возвращает {added, skipped} или бросает ошибку с понятным текстом. */
export function importAll(text) {
  let d; try { d = JSON.parse(text); } catch (e) { throw new Error('Это не файл сохранения'); }
  if (!d || d.game !== 'lumber-camp-2' || !Array.isArray(d.heroes)) throw new Error('Это не файл сохранения «Лагеря лесоруба II»');
  let added = 0, skipped = 0;
  for (const raw of d.heroes) {
    if (!raw || !raw.id || !raw.cls) { skipped++; continue; }
    const have = listHeroes();
    if (!have.some(x => x.id === raw.id) && have.length >= MAX_SLOTS) { skipped++; continue; }
    saveHero(migrate(raw)); added++;
  }
  return { added, skipped };
}

// громкость и прочие настройки этого браузера
export const prefs = {
  get(k, def) { try { const v = JSON.parse(get('lumber-camp2-pref-' + k)); return v ?? def; } catch (e) { return def; } },
  set(k, v) { set('lumber-camp2-pref-' + k, JSON.stringify(v)); },
};
