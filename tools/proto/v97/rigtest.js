// Проверка новой куклы v97 в игре: облики × стороны × движения (картинками игры — personSpr).
import { personSpr, drawFrame, MOB_LOOK, GUARD_LOOK, MERCH_LOOK } from '../../../src/art/sprites.js';
import { NPC_LOOK } from '../../../src/art/npc.js';
import { palette, themed, W_BY, H_BY, C_BY, L_BY } from '../../../src/art/gear.js';
import { HERO_BODY } from '../../../src/systems/items.js';
const pc = (rar, seed, tier, md) => themed(palette(rar, seed, tier), md);
export function look(cls, rar, h, c, l, w, seed = 3) {
  const tier = rar === 'epic' ? 5 : rar === 'rare' ? 4 : rar === 'good' ? 2 : 1;
  const L = { cls, ...HERO_BODY[cls], key: [cls, rar, h, c, l, w, seed].join('|') };
  if (h) L.head = { m: h, P: pc(rar, seed, tier, H_BY[h]) }; if (c) L.chest = { m: c, P: pc(rar, seed + 1, tier, C_BY[c]) }; if (l) L.legs = { m: l, P: pc(rar, seed + 2, tier, L_BY[l]) }; if (w) L.weapon = { m: w, P: pc(rar, seed + 3, tier, W_BY[w]) };
  return L;
}
export const SETS = {
  warrior: [look('warrior', 'start', null, 'shirt', 'trousers', 'hatchet'), look('warrior', 'common', 'cap', 'gambeson', 'leggings', 'mace'), look('warrior', 'good', 'nasal', 'jerkin', 'chausses', 'sword'), look('warrior', 'good', 'kettle', 'hauberk', 'chausses', 'bearded'),
    look('warrior', 'rare', 'spangen', 'scale', 'greaves', 'warhammer'), look('warrior', 'rare', 'horned', 'brig', 'greaves', 'crescent'), look('warrior', 'rare', 'great', 'cuirass', 'greaves', 'greatsword'), look('warrior', 'rare', 'winged', 'plate', 'greaves', 'double'),
    look('warrior', 'epic', 'warlord', 'warlord', 'warlordleg', 'runeaxe'), look('warrior', 'epic', 'dragonhelm', 'ember', 'emberleg', 'flameblade'), look('warrior', 'epic', 'mailcoif', 'ember', 'warlordleg', 'thunder'), look('warrior', 'common', 'coif', null, null, null)],
  mage: [look('mage', 'start', null, 'shirt', 'trousers', 'stick'), look('mage', 'common', 'mhood', 'robe', 'silk', 'wand'), look('mage', 'good', 'circlet', 'robe_emb', 'silk', 'crook'), look('mage', 'good', 'wizard', 'robe_battle', 'silk', 'orb'),
    look('mage', 'rare', 'cowl', 'robe_star', 'starleg', 'serpent'), look('mage', 'rare', 'starhat', 'robe_arch', 'starleg', 'rune'), look('mage', 'rare', 'crown', 'robe_arch', 'starleg', 'arch'), look('mage', 'epic', 'astral', 'astralrobe', 'astralleg', 'starfall'), look('mage', 'epic', 'frostcowl', 'flamerobe', 'flameleg', 'glacier')],
  archer: [look('archer', 'start', null, 'shirt', 'trousers', 'shortbow'), look('archer', 'common', 'lhood', 'jerkin', 'leggings', 'hunt'), look('archer', 'good', 'huntcap', 'furs', 'furleg', 'recurve'), look('archer', 'good', 'fhood', 'studded', 'furleg', 'long'),
    look('archer', 'rare', 'ranger', 'scale_a', 'scaleleg', 'horn'), look('archer', 'rare', 'mantle', 'ranger', 'scaleleg', 'war'), look('archer', 'epic', 'staghood', 'stagarmor', 'stagleg', 'stagbow'), look('archer', 'epic', 'hawkmask', 'nightleather', 'nightleg', 'sunbow')],
  people: [...Object.values(MOB_LOOK), GUARD_LOOK, MERCH_LOOK, ...Object.values(NPC_LOOK)],
};
const VIEWS = [['front', 1], ['fs', 1], ['side', 1], ['bs', 1], ['back', 1]];
/** Строка: 5 сторон стоя + шаг (4 кадра боком) + удар (6 кадров боком) + удар спереди (3) + падение. */
export function sheet(cv, list, sc = 3, cols = 'views') {
  const g = cv.getContext('2d'); const cellW = 38 * sc, cellH = 46 * sc;
  const frames = cols === 'views' ? VIEWS.map(([v, d]) => [v, 'idle', 0, d]) : cols === 'anim' ? [['side', 'walk', 0], ['side', 'walk', 2], ['side', 'walk', 4], ['side', 'walk', 6], ['side', 'atk', 0], ['side', 'atk', 1], ['side', 'atk', 2], ['side', 'atk', 3], ['side', 'atk', 4], ['side', 'atk', 5], ['front', 'atk', 1], ['front', 'atk', 3], ['fs', 'walk', 2], ['bs', 'walk', 2], ['side', 'dead', 3]].map(f => [...f, 1]) : cols;
  cv.width = cellW * frames.length; cv.height = cellH * list.length; g.fillStyle = '#5a6a3c'; g.fillRect(0, 0, cv.width, cv.height);
  list.forEach((L, r) => frames.forEach(([v, m, f, d], i) => { const x = i * cellW + cellW / 2, y = r * cellH + cellH - 8 * sc; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 2 * sc, 10 * sc, 3 * sc, 0, 0, 7); g.fill(); drawFrame(g, personSpr(L, v, m, f), x, y - 12.6 * sc + 12.6 * sc, d, sc); }));
}
