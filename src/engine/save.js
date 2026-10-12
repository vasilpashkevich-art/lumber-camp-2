// Сохранения: до 5 героев в браузере, у каждого свой ключ. Перенос — файлом.
// Ключи ветки II: lumber-camp2-*  (не пересекаются с основной игрой).
import { HERO_V } from '../entities/hero.js';
import { remakeItem, lookUpgrade } from '../systems/items.js';
import { fixSlots } from '../systems/bank.js';
import { LOOT } from '../../data/balance.js';

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
const slimEq = eq => Object.fromEntries(Object.entries(eq).map(([k, v]) => [k, v ? { tier: v.tier, wt: v.wt, rar: v.rar, m: v.m, seed: v.seed, ilvl: v.ilvl } : null]));

export function deleteHero(id) { del(KEY(id)); writeIdx(listHeroes().filter(x => x.id !== id)); }

/** Подтянуть старое сохранение героя к текущей версии. Ничего не теряем. */
export function migrate(h) {
  if (!h) return null;
  h.v = h.v || 1;
  h.bag = (h.bag || []).filter(Boolean);
  // ячейки сумки (v55): у каждой вещи своя; старым сохранениям — по порядку, без повторов
  { const used = new Set(); for (const it of h.bag) { if (!(Number.isInteger(it.pos) && it.pos >= 0 && it.pos < 32) || used.has(it.pos)) it.pos = null; else used.add(it.pos); }
    let p = 0; for (const it of h.bag) if (it.pos == null) { while (used.has(p)) p++; it.pos = p; used.add(p); } }
  for (const it of Object.values(h.eq || {})) if (it) delete it.pos; h.dead = h.dead || {}; h.stats = Object.assign({ kills: 0, deaths: 0, gold: 0, items: 0, play: 0 }, h.stats || {});
  // v61: кольцо, шея, аксессуар; горное дело; гарантия аксессуара; жилы
  h.eq = Object.assign({ head: null, neck: null, chest: null, legs: null, weapon: null, ring: null, trinket: null }, h.eq || {});
  h.prof = Object.assign({ mining: 0 }, h.prof || {}); h.tPity = h.tPity || 0; h.veins = h.veins || {}; h.shops = h.shops || {};
  h.potions = h.potions ?? 2; h.gold = h.gold || 0; h.worldT = h.worldT || 0; h.zone = h.zone || 'pine';
  // v59: вещи по новым правилам — главный параметр класса и свойства; место, уровень и цвет те же
  if (h.v < 2) { for (const s of Object.keys(h.eq || {})) if (h.eq[s]) h.eq[s] = remakeItem(h.eq[s], h.cls); h.bag = h.bag.map(it => remakeItem(it, h.cls)); }
  // v64: облик вещей моделями — модель и зерно для старых вещей, название по модели
  if (h.v < 3) { for (const s of Object.keys(h.eq)) lookUpgrade(h.eq[s], h.cls); for (const it of h.bag) lookUpgrade(it, h.cls); }
  // v71: Грибной лес стал шире в 1,3 раза — место героя туда же по карте, жилы зоны — заново (на новых местах)
  if (h.v < 4) { if (h.zone === 'shroom' && h.pos) h.pos = { x: Math.round(h.pos.x * 1.3), y: Math.round(h.pos.y * 1.3) }; if (h.veins) delete h.veins.shroom; }
  // v72: личный банк
  h.bank = fixSlots((h.bank || []).filter(Boolean), LOOT.bank);
  // v73: таланты — уровень ряда -> id выбранного
  h.talents = h.talents && typeof h.talents === 'object' ? h.talents : {};
  if (h.v < HERO_V) h.v = HERO_V;
  return h;
}

/** Все герои одним текстом для файла. */
export function exportAll() {
  const heroes = listHeroes().map(r => loadHero(r.id)).filter(Boolean);
  return JSON.stringify({ game: 'lumber-camp-2', v: 1, at: new Date().toISOString(), heroes, shared: loadShared() });
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
  // общий сундук: вещей, которых здесь нет, — добавить в свободные ячейки (повторно не удваивается)
  if (d.shared && Array.isArray(d.shared.items)) { const S = loadShared(), have = new Set(S.items.map(x => x.id)); for (const it of d.shared.items) { if (!it || have.has(it.id) || S.items.length >= LOOT.shared) continue; it.pos = null; S.items.push(it); have.add(it.id); } fixSlots(S.items, LOOT.shared); saveShared(S); }
  return { added, skipped };
}

// общий сундук всех героев (v72): отдельный ключ, вещи с теми же правилами, что в сумке
const SHARED = 'lumber-camp2-shared';
export function loadShared() {
  try { const d = JSON.parse(get(SHARED) || 'null'); const items = (d && Array.isArray(d.items) ? d.items : []).filter(Boolean).map(it => it.slot && it.cls ? lookUpgrade(it, it.cls) || it : it); return { items: fixSlots(items, LOOT.shared) }; } catch (e) { return { items: [] }; }
}
export const saveShared = S => set(SHARED, JSON.stringify({ v: 1, items: S.items }));

// громкость и прочие настройки этого браузера
export const prefs = {
  get(k, def) { try { const v = JSON.parse(get('lumber-camp2-pref-' + k)); return v ?? def; } catch (e) { return def; } },
  set(k, v) { set('lumber-camp2-pref-' + k, JSON.stringify(v)); },
};
