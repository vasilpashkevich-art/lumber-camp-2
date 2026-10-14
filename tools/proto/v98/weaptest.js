// Эскиз v98: всё оружие в мультяшном стиле — было / стало, в руке у героя.
import { WEAPONS, palette, themed } from '../../../src/art/gear.js';
import { personSpr, drawFrame } from '../../../src/art/sprites.js';
import { look } from '../v97/rigtest.js';
const rarOf = w => w.tiers && w.tiers.includes(5) ? 'epic' : w.npc ? 'common' : w.tiers && Math.max(...w.tiers) >= 4 ? 'rare' : w.tiers && Math.max(...w.tiers) >= 2 ? 'good' : 'common';
const clsOf = w => w.cls ? w.cls[0] : w.npc ? 'warrior' : 'warrior';
/** Лист: для каждого оружия — было (слева) и стало (справа). */
export function sheet(cv, ids, sc = 5, cols = 6) {
  const list = WEAPONS.filter(w => !ids || ids.includes(w.id)), cw = 34 * sc, ch = 50 * sc, rows = Math.ceil(list.length / cols);
  cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d'); g.fillStyle = '#2a2219'; g.fillRect(0, 0, cv.width, cv.height);
  list.forEach((w, i) => { const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * ch, P = themed(palette(rarOf(w), 7, 3), w);
    g.fillStyle = (i + Math.floor(i / cols)) % 2 ? '#30271d' : '#2a2219'; g.fillRect(x0, y0, cw, ch);
    for (const [old, dx] of [[true, 0.27], [false, 0.73]]) { window.__oldWeap = old; g.save(); g.translate(x0 + cw * dx, y0 + ch * 0.68); g.scale(sc * 0.75, sc * 0.75); g.lineJoin = g.lineCap = 'round'; w.draw(g, P, { t: 1, glow: 0 }); g.restore(); }
    window.__oldWeap = false; g.fillStyle = '#e9dfc8'; g.font = `${Math.round(sc * 2.4)}px Georgia`; g.textAlign = 'center'; g.fillText(w.name, x0 + cw / 2, y0 + ch - sc * 2); });
}
/** В руке: герой с оружием — спереди, вполоборота, боком, удар. */
export function hands(cv, ids, sc = 3) {
  const list = WEAPONS.filter(w => ids.includes(w.id)), frames = [['front', 'idle', 0], ['fs', 'idle', 0], ['side', 'idle', 0], ['side', 'atk', 2], ['side', 'atk', 3], ['back', 'idle', 0]], cw = 40 * sc, ch = 50 * sc;
  cv.width = cw * frames.length; cv.height = ch * list.length; const g = cv.getContext('2d'); g.fillStyle = '#5a6a3c'; g.fillRect(0, 0, cv.width, cv.height);
  list.forEach((w, r) => { const L = look(clsOf(w), rarOf(w), null, rarOf(w) === 'epic' ? (clsOf(w) === 'mage' ? 'astralrobe' : clsOf(w) === 'archer' ? 'stagarmor' : 'warlord') : 'jerkin', 'leggings', w.id); L.key += '|w98';
    frames.forEach(([v, m, f], i) => drawFrame(g, personSpr(L, v, m, f), i * cw + cw / 2, r * ch + ch - 9 * sc, 1, sc)); });
}
