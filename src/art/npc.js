// v95: жители с заданиями — облик (то же тело, что у героя, вещи моделями), знаки «!» и «?» над головой, предметы заданий (силки).
import { palette } from './gear.js';
const NP = (rar, seed, over = {}) => ({ ...palette(rar, seed), ...over });

export const NPC_LOOK = {
  // капитан стражи: кираса с синей накидкой, без шлема, седая борода, меч
  captain: { key: 'npc-captain', hair: '#8a8478', beard: 'grey', broad: 1.08, chest: { m: 'cuirass', P: NP('rare', 8, { cloth: ['#2f5d9a', '#24497a'], acc: '#e7c35a' }) }, legs: { m: 'chausses', P: NP('good', 8) }, weapon: { m: 'broadsword', P: NP('rare', 4) } },
  // лесничий: меховая куртка, шапка, лук за спиной
  forester: { key: 'npc-forester', cls: 'archer', hair: '#6a4a2a', beard: 'full', head: { m: 'huntcap', P: NP('common', 3, { leather: '#6a4a2a' }) }, chest: { m: 'furs', P: NP('good', 6, { cloth: ['#5a6a3a', '#4a5a2a'], leather: '#6a4a2a' }) }, legs: { m: 'furleg', P: NP('common', 4) }, weapon: { m: 'hunt', P: NP('common', 2) }, quiver: true },
  // дозорный: капюшон, кожаная куртка, копьё
  scout: { key: 'npc-scout', hair: '#3a2a1a', hairStyle: 'tail', head: { m: 'fhood', P: NP('good', 2, { cloth: ['#3a4a3a', '#2a3a2a'] }) }, chest: { m: 'studded', P: NP('good', 9) }, legs: { m: 'leggings', P: NP('common', 5) }, weapon: { m: 'spear', P: NP('good', 3) } },
  // v111: староста Евсей — седой, кафтан, посох-клюка
  elder: { key: 'npc-elder', cls: 'mage', hair: '#d8d2c8', hairStyle: 'short', beard: 'grey', chest: { m: 'robe', P: NP('common', 4, { cloth: ['#7a5a3a', '#5e4228'], acc: '#c8a050' }) }, legs: { m: 'trousers', P: NP('common', 2, { cloth: ['#4a3a2a', '#3a2c1e'] }) }, weapon: { m: 'crook', P: NP('common', 2) } },
  // погорелец Матвей: закопчённая рубаха, повязка, без оружия
  farmer: { key: 'npc-farmer', hair: '#5a4a3a', beard: 'full', head: { m: 'band', P: NP('common', 3, { cloth: ['#6a6058', '#4a4038'] }) }, chest: { m: 'shirt', P: NP('common', 6, { cloth: ['#8a8070', '#6a6050'] }) }, legs: { m: 'trousers', P: NP('common', 3, { cloth: ['#4a4a52', '#3a3a42'] }) } },
  // беглый подмастерье Ерёмка: в муке, соломенная шляпа, безбородый
  apprentice: { key: 'npc-apprentice', hair: '#c89a5a', head: { m: 'straw', P: NP('common', 2) }, chest: { m: 'shirt', P: NP('common', 2, { cloth: ['#e8e2d4', '#cfc6b0'] }) }, legs: { m: 'trousers', P: NP('common', 5, { cloth: ['#6a5a42', '#5a4a34'] }) } },
  // хозяин обоза Савва: зелёный расшитый кафтан, шляпа, борода
  trader: { key: 'npc-trader', hair: '#3a2a1a', beard: 'full', broad: 1.06, head: { m: 'ranger', P: NP('good', 3, { leather: '#3a4a2a', gem: '#e7c35a' }) }, chest: { m: 'robe_emb', P: NP('good', 5, { cloth: ['#2f6a4a', '#1f4a34'], acc: '#e7c35a' }) }, legs: { m: 'leggings', P: NP('common', 2) } },
  // травник-отшельник Лука: глубокий капюшон цвета мха, роба, посох друида
  hermit: { key: 'npc-hermit', cls: 'mage', hair: '#9a9488', beard: 'grey', head: { m: 'cowl', P: NP('common', 7, { cloth: ['#4a6a3a', '#3a5a2a'] }) }, chest: { m: 'robe', P: NP('common', 7, { cloth: ['#5a6a3a', '#4a5a2a'], acc: '#a8c860' }) }, legs: { m: 'trousers', P: NP('common', 4, { cloth: ['#4a3a2a', '#3a2c1e'] }) }, weapon: { m: 'root', P: NP('good', 6) } },
  // разведчик Тихон: кожаный капюшон, клёпаная куртка, длинный лук, колчан
  ranger: { key: 'npc-ranger', cls: 'archer', hair: '#4a3a2a', head: { m: 'lhood', P: NP('good', 11, { leather: '#3a4a34', cloth: ['#3a4a34', '#2a3a26'] }) }, chest: { m: 'studded', P: NP('good', 12) }, legs: { m: 'leggings', P: NP('common', 6) }, weapon: { m: 'long', P: NP('good', 9) }, quiver: true },
};

/** Знак над жителем: '!' золотой — есть задание, '?' золотой — сдать, 'wait' — серый «?», 'low' — серый «!». */
export function questMark(g, x, y, mark, t) {
  if (!mark) return;
  const blue = mark === 'b!' || mark === 'b?', gold = mark === '!' || mark === '?' || blue, ch = mark === '?' || mark === 'wait' || mark === 'b?' ? '?' : '!', bob = Math.sin(t * 3) * 2.5;   // v128: b! / b? — голубые знаки доски заказов
  g.save(); g.translate(x, y + bob);
  if (gold) { const r = 18 + Math.sin(t * 4) * 1.5, gr = g.createRadialGradient(0, -12, 2, 0, -12, r); gr.addColorStop(0, blue ? 'rgba(120,200,255,.55)' : 'rgba(255,220,90,.55)'); gr.addColorStop(1, blue ? 'rgba(80,170,255,0)' : 'rgba(255,200,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, -12, r, 0, 7); g.fill(); }
  g.font = 'bold 30px Georgia, serif'; g.textAlign = 'center'; g.lineJoin = 'round';
  g.lineWidth = 5; g.strokeStyle = 'rgba(30,18,6,.95)'; g.strokeText(ch, 0, 0);
  if (blue) { const gr = g.createLinearGradient(0, -24, 0, 0); gr.addColorStop(0, '#d8f2ff'); gr.addColorStop(0.5, '#5ab8ff'); gr.addColorStop(1, '#1a6ad0'); g.fillStyle = gr; }
  else if (gold) { const gr = g.createLinearGradient(0, -24, 0, 0); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.5, '#ffd23a'); gr.addColorStop(1, '#d08a10'); g.fillStyle = gr; }
  else g.fillStyle = '#b8b0a0';
  g.fillText(ch, 0, 0);
  g.restore();
}

/** Чужие силки: кованая скоба с зубьями на цепи у колышка. */
export function snare(g) {
  const O = '#24180f';
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 2, 18, 5, 0, 0, 7); g.fill();
  g.strokeStyle = '#5a5048'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(12, -2); for (let i = 0; i < 4; i++) g.lineTo(10 - i * 3, i % 2 ? -1 : -3); g.stroke();
  g.fillStyle = '#6b4a2c'; g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.rect(12, -14, 4, 14); g.fill(); g.stroke();
  g.strokeStyle = O; g.lineWidth = 3.4; g.beginPath(); g.ellipse(-4, -2, 12, 4.5, 0, 0, 7); g.stroke();
  g.strokeStyle = '#9a948a'; g.lineWidth = 2; g.beginPath(); g.ellipse(-4, -2, 12, 4.5, 0, 0, 7); g.stroke();
  g.fillStyle = '#c8c2b8'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = -4 + Math.cos(a) * 10, y = -2 + Math.sin(a) * 3.6; g.beginPath(); g.moveTo(x - 1.5, y); g.lineTo(x, y - 4); g.lineTo(x + 1.5, y); g.closePath(); g.fill(); }
}

/** Искорка над предметом задания (видно издалека, что его можно взять). */
export function questGlint(g, x, y, t, seed = 0) {
  const q = (t * 0.8 + seed * 0.37) % 1, a = Math.sin(q * Math.PI), r = 5 + a * 4;
  g.save(); g.translate(x, y - 26 - q * 8); g.fillStyle = `rgba(255,226,120,${0.9 * a})`; g.beginPath();
  for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * 0.3 : r, an = k * Math.PI / 4 + q; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.restore();
}

// ---------------------------------------------------------------- v111: предметы заданий в мультяшном стиле (STYLE.md)
// Начало — точка на земле, вверх — минус. Свет слева сверху, обводка — тёмный тон своего цвета, блик — белый эллипс.
const shd = (c, k) => { const n = parseInt(c.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const grad = (g, col, y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, shd(col, 0.22)); gr.addColorStop(0.55, col); gr.addColorStop(1, shd(col, -0.25)); return gr; };
const fillPath = (g, col, y0, y1, lw = 1.4, path) => { g.beginPath(); path(); g.fillStyle = grad(g, col, y0, y1); g.fill(); g.strokeStyle = shd(col, -0.6); g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); };
const gloss = (g, x, y, rx, ry, a = 0.45) => { g.save(); g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, -0.38, 0, 7); g.fill(); g.restore(); };
const ground = (g, rx, ry = rx * 0.32) => { g.fillStyle = 'rgba(30,20,10,.28)'; g.beginPath(); g.ellipse(3, 1, rx, ry, 0, 0, 7); g.fill(); };
const rrect = (g, x, y, w, h, r) => { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };

/** Уцелевший сундучок на углях: закопчённое дерево, железные полосы, угольки вокруг. */
export function qCache(g) {
  ground(g, 22);
  g.fillStyle = '#2a2420'; for (const [x, y, r] of [[-20, -1, 4], [18, 0, 5], [-12, 3, 3], [12, 3, 3]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.5, 0, 0, 7); g.fill(); }
  g.fillStyle = '#ff7a2a'; for (const [x, y] of [[-19, -2], [17, -1], [12, 2]]) { g.beginPath(); g.arc(x, y, 1.3, 0, 7); g.fill(); }
  fillPath(g, '#6a4628', -16, 0, 1.4, () => rrect(g, -15, -14, 30, 14, 3));
  fillPath(g, '#7a5432', -24, -12, 1.4, () => { g.moveTo(-16, -13); g.quadraticCurveTo(-16, -24, 0, -24); g.quadraticCurveTo(16, -24, 16, -13); g.closePath(); });
  g.fillStyle = 'rgba(30,20,14,.35)'; g.beginPath(); g.ellipse(6, -6, 7, 4, 0.3, 0, 7); g.fill();
  for (const x of [-9, 9]) fillPath(g, '#6a6e7a', -24, 0, 1, () => rrect(g, x - 2.2, -23, 4.4, 23, 1.6));
  fillPath(g, '#d8a840', -16, -8, 1, () => rrect(g, -3, -15, 6, 7, 1.5));
  gloss(g, -9, -20, 5, 1.8, 0.35);
}
/** Мешок чёрной муки: пухлый холщовый мешок, завязка, чёрная мука сыплется из прорехи. */
export function qSack(g) {
  ground(g, 16);
  fillPath(g, '#c8b48a', -30, 0, 1.4, () => { g.moveTo(-6, -24); g.quadraticCurveTo(-17, -20, -16, -8); g.quadraticCurveTo(-16, 0, 0, 0); g.quadraticCurveTo(16, 0, 16, -8); g.quadraticCurveTo(17, -20, 6, -24); g.closePath(); });
  fillPath(g, '#b8a078', -32, -24, 1.2, () => { g.moveTo(-6, -24); g.lineTo(-8, -31); g.quadraticCurveTo(0, -27, 8, -31); g.lineTo(6, -24); g.closePath(); });
  g.strokeStyle = '#5a3a1a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-7, -24.5); g.quadraticCurveTo(0, -22, 7, -24.5); g.stroke();
  g.fillStyle = '#2a2830'; g.beginPath(); g.ellipse(8, -6, 3.2, 2.2, 0.4, 0, 7); g.fill();
  g.fillStyle = '#3a3640'; g.beginPath(); g.moveTo(10, -5); g.quadraticCurveTo(16, 0, 20, 1); g.quadraticCurveTo(13, 3, 8, -3); g.fill();
  g.fillStyle = '#5a8a4a'; for (const [x, y] of [[12, 0], [16, 1], [18, -1]]) { g.beginPath(); g.arc(x, y, 0.9, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(-8, -18); g.quadraticCurveTo(-4, -10, -8, -3); g.stroke();
  gloss(g, -8, -17, 4, 2.2, 0.3);
}
/** Ключ от мельницы: большой железный ключ в траве. */
export function qKey(g) {
  ground(g, 14, 4);
  g.fillStyle = '#5a8a3a'; for (const x of [-12, -5, 9, 14]) { g.beginPath(); g.moveTo(x - 2, 0); g.quadraticCurveTo(x, -9, x + 2, 0); g.fill(); }
  g.save(); g.rotate(-0.25);
  fillPath(g, '#8a8e98', -6, 2, 1.2, () => rrect(g, -6, -4, 22, 4.4, 2));
  fillPath(g, '#8a8e98', -12, 4, 1.2, () => { g.arc(-10, -2, 6.5, 0, 7); });
  g.fillStyle = '#3a3e48'; g.beginPath(); g.arc(-10, -2, 2.6, 0, 7); g.fill();
  fillPath(g, '#8a8e98', -2, 6, 1, () => { rrect(g, 10, -1, 3.6, 7, 1); rrect(g, 14, -1, 3, 5, 1); });
  gloss(g, -12, -5, 2.4, 1.2, 0.6);
  g.restore();
}
/** Тотем квакунов: столб из коряги, жабья маска с глазами, пучки тины, кости. Выше пояса героя. */
export function qTotem(g) {
  ground(g, 16);
  fillPath(g, '#6a5a3a', -68, 0, 1.4, () => { g.moveTo(-6, 0); g.quadraticCurveTo(-8, -30, -5, -64); g.quadraticCurveTo(0, -68, 5, -64); g.quadraticCurveTo(8, -30, 6, 0); g.closePath(); });
  g.strokeStyle = 'rgba(40,30,16,.45)'; g.lineWidth = 0.6; for (const y of [-14, -26, -40]) { g.beginPath(); g.moveTo(-5, y); g.quadraticCurveTo(0, y + 2, 5, y); g.stroke(); }
  fillPath(g, '#5a8a4a', -62, -34, 1.4, () => { g.moveTo(-13, -46); g.quadraticCurveTo(-14, -60, 0, -61); g.quadraticCurveTo(14, -60, 13, -46); g.quadraticCurveTo(12, -36, 0, -35); g.quadraticCurveTo(-12, -36, -13, -46); });
  for (const x of [-7, 7]) { fillPath(g, '#e8d870', -62, -50, 1.1, () => g.arc(x, -55, 4.2, 0, 7)); g.fillStyle = '#1a1a10'; g.beginPath(); g.ellipse(x, -55, 1.2, 2.8, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#2a4a20'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-8, -42); g.quadraticCurveTo(0, -38, 8, -42); g.stroke();
  g.fillStyle = '#c8302a'; for (const x of [-4, 0, 4]) { g.beginPath(); g.moveTo(x - 1.5, -48); g.lineTo(x, -44); g.lineTo(x + 1.5, -48); g.fill(); }
  g.fillStyle = '#4a7a3a'; for (const [x, y, d] of [[-8, -30, -1], [8, -26, 1]]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + d * 6, y + 8, x + d * 4, y + 16); g.quadraticCurveTo(x + d * 2, y + 8, x, y); g.fill(); }
  fillPath(g, '#e8e0c8', -24, -16, 1, () => { rrect(g, -9, -22, 18, 3.4, 1.6); });
  for (const x of [-9, 9]) fillPath(g, '#e8e0c8', -26, -15, 1, () => g.arc(x, -20.3, 2.6, 0, 7));
  gloss(g, -6, -58, 3.4, 1.6, 0.4);
}
/** Кокон тенепряда: человек в паутине, нити к земле. */
export function qCocoon(g) {
  ground(g, 18);
  g.strokeStyle = 'rgba(230,230,240,.7)'; g.lineWidth = 0.9; for (const [x, y] of [[-20, 0], [20, 1], [-14, 3], [16, -2]]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x * 0.5, -10, 0, -18); g.stroke(); }
  fillPath(g, '#dcdce6', -48, 0, 1.4, () => { g.moveTo(0, -48); g.quadraticCurveTo(13, -46, 12, -24); g.quadraticCurveTo(11, -4, 0, -2); g.quadraticCurveTo(-11, -4, -12, -24); g.quadraticCurveTo(-13, -46, 0, -48); });
  g.strokeStyle = 'rgba(120,120,150,.55)'; g.lineWidth = 0.8; for (let i = 0; i < 6; i++) { const y = -42 + i * 7; g.beginPath(); g.moveTo(-11, y + 2); g.quadraticCurveTo(0, y - 3 + (i % 2) * 6, 11, y); g.stroke(); }
  g.fillStyle = 'rgba(160,120,90,.35)'; g.beginPath(); g.ellipse(0, -38, 5, 4, 0, 0, 7); g.fill();
  gloss(g, -5, -38, 3, 6, 0.45);
}
/** Кладка яиц Паучихи: горка бледных яиц в липкой слизи. */
export function qEggs(g) {
  ground(g, 18);
  fillPath(g, '#8a9a6a', -6, 2, 1, () => g.ellipse(0, -1, 18, 5, 0, 0, 7));
  for (const [x, y, r] of [[-10, -6, 6], [9, -6, 6], [0, -7, 6.5], [-5, -14, 5.5], [5, -14, 5.5], [0, -20, 5]]) {
    fillPath(g, '#e8e2c8', y - r, y + r, 1.1, () => g.ellipse(x, y, r, r * 0.9, 0, 0, 7));
    g.fillStyle = 'rgba(120,90,140,.35)'; g.beginPath(); g.arc(x + 1.5, y + 1, r * 0.35, 0, 7); g.fill();
    gloss(g, x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.18, 0.6);
  }
}
/** Рисунок предмета задания и его размеры для готовой картинки: [w, h, ox, oy, fn]. */
export const QART = {
  cache: [70, 44, 35, 34, qCache], sack: [52, 44, 24, 38, qSack], key: [50, 26, 25, 18, qKey],
  totem: [44, 80, 22, 72, qTotem], cocoon: [48, 60, 24, 54, qCocoon], eggs: [48, 34, 24, 28, qEggs],
};
