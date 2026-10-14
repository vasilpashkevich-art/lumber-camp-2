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
};

/** Знак над жителем: '!' золотой — есть задание, '?' золотой — сдать, 'wait' — серый «?», 'low' — серый «!». */
export function questMark(g, x, y, mark, t) {
  if (!mark) return;
  const gold = mark === '!' || mark === '?', ch = mark === '?' || mark === 'wait' ? '?' : '!', bob = Math.sin(t * 3) * 2.5;
  g.save(); g.translate(x, y + bob);
  if (gold) { const r = 18 + Math.sin(t * 4) * 1.5, gr = g.createRadialGradient(0, -12, 2, 0, -12, r); gr.addColorStop(0, 'rgba(255,220,90,.55)'); gr.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, -12, r, 0, 7); g.fill(); }
  g.font = 'bold 30px Georgia, serif'; g.textAlign = 'center'; g.lineJoin = 'round';
  g.lineWidth = 5; g.strokeStyle = 'rgba(30,18,6,.95)'; g.strokeText(ch, 0, 0);
  if (gold) { const gr = g.createLinearGradient(0, -24, 0, 0); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.5, '#ffd23a'); gr.addColorStop(1, '#d08a10'); g.fillStyle = gr; }
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
