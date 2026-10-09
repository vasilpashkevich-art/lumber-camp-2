// Значки вещей и умений (SVG), в цветах облика: какой ярус — такой цвет.
import { itemLook, W_BY, C_BY, drawHelm, drawRing, drawNeck } from '../art/gear.js';
import { person } from '../art/body.js';
import { RAR_COL } from '../../data/balance.js';

const O = '#24180f';

// v64: значок вещи — тот же рисунок модели, что на герое (gear.js), вписанный в ячейку; готовые картинки в кэше
const GI = new Map();
function renderFit(draw, rot = 0) {
  const T = 320, tmp = document.createElement('canvas'); tmp.width = tmp.height = T; const g = tmp.getContext('2d');
  g.translate(T / 2, T / 2); g.scale(6, 6); g.rotate(rot); g.lineJoin = g.lineCap = 'round'; draw(g);
  const d = g.getImageData(0, 0, T, T).data; let x0 = T, y0 = T, x1 = 0, y1 = 0;
  for (let y = 0; y < T; y += 2) for (let x = 0; x < T; x += 2) if (d[(y * T + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const S = 112, cv = document.createElement('canvas'); cv.width = cv.height = S; const o = cv.getContext('2d');
  if (x1 >= x0) { const bw = x1 - x0 + 2, bh = y1 - y0 + 2, k = Math.min(S * 0.86 / bw, S * 0.86 / bh); o.imageSmoothingQuality = 'high'; o.drawImage(tmp, x0, y0, bw, bh, (S - bw * k) / 2, (S - bh * k) / 2, bw * k, bh * k); }
  return cv.toDataURL();
}
export function gearIconUrl(it) {
  const lk = itemLook(it); if (GI.has(lk.key)) return GI.get(lk.key);
  let url = '';
  try {
    if (it.slot === 'weapon') url = renderFit(g => W_BY[lk.m].draw(g, lk.P, {}), Math.PI / 4);
    else if (it.slot === 'head') url = renderFit(g => { if (lk.m === 'circlet' || lk.m === 'crown') { g.strokeStyle = '#24180f'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, -21.2, 3.9, 1.6, 0, Math.PI, 0); g.stroke(); g.strokeStyle = lk.P.acc; g.lineWidth = 0.9; g.stroke(); } drawHelm(g, lk.m, lk.P, 'front'); });
    else if (it.slot === 'chest') url = renderFit(g => { g.save(); g.beginPath(); g.rect(-30, -14.2, 60, C_BY[lk.m] && C_BY[lk.m].base === 'robe' ? 27 : 20); g.clip(); person(g, { chest: lk, part: 'chest', broad: it.cls === 'warrior' ? 1.08 : 1 }, 'front', {}); g.restore(); });
    else if (it.slot === 'legs') url = renderFit(g => person(g, { legs: lk, part: 'legs' }, 'front', {}));
    else if (it.slot === 'ring') url = renderFit(g => drawRing(g, lk.m, lk.P));
    else if (it.slot === 'neck') url = renderFit(g => drawNeck(g, lk.m, lk.P));
  } catch (e) { console.warn('значок', e); }
  GI.set(lk.key, url); return url;
}
export function itemIcon(it, size = 40) {
  const rc = RAR_COL[it.rar] || '#888', glow = it.rar === 'epic' ? `;box-shadow:0 0 6px ${rc}88` : '';
  return `<img class="gicon" src="${gearIconUrl(it)}" width="${size}" height="${size}" alt="" draggable="false" style="background:radial-gradient(circle at 50% 40%, ${rc}33, #1a120c 70%);border:2px solid ${rc};border-radius:6px${glow}">`;
}

export const ABIL_ICON = {
  whirl: `<svg viewBox="0 0 32 32"><path d="M16 4a12 12 0 1 1-11 7" fill="none" stroke="#ffe9a8" stroke-width="3"/><path d="M5 11l-1-6 6 2z" fill="#ffe9a8"/><path d="M12 22 L22 10" stroke="#24180f" stroke-width="4"/><path d="M12 22 L22 10" stroke="#7a5230" stroke-width="2"/><path d="M20 7 Q28 7 27 15 L21 13z" fill="#d8dde2" stroke="#24180f"/></svg>`,
  fire: `<svg viewBox="0 0 32 32"><circle cx="15" cy="17" r="11" fill="#ff7a2a" opacity=".45"/><path d="M15 6 Q24 12 23 19 A8 8 0 0 1 7 19 Q7 13 12 10 Q12 14 15 15 Q13 10 15 6z" fill="#ff8a2a" stroke="#7a2a10"/><circle cx="15" cy="19" r="4.2" fill="#fff2a0"/></svg>`,
  bleed: `<svg viewBox="0 0 32 32"><path d="M4 28 L22 10" stroke="#24180f" stroke-width="4.4"/><path d="M4 28 L22 10" stroke="#e8e0cc" stroke-width="2.2"/><path d="M22 10l-7 1.5 5.5 5.5z" fill="#d83a3a" stroke="#24180f" stroke-width="1"/><path d="M3 26l4 1-1 4z" fill="#8a5a3a"/><path d="M25 17c0 0-4 5-4 7.5a4 4 0 0 0 8 0c0-2.5-4-7.5-4-7.5z" fill="#e83a3a" stroke="#24180f" stroke-width="1.2"/><ellipse cx="23.6" cy="23" rx="1" ry="1.6" fill="#ffb0a0"/></svg>`,
  volley: `<svg viewBox="0 0 32 32"><g stroke="#e8e0cc" stroke-width="2"><path d="M4 26 L24 6"/><path d="M8 28 L28 10"/><path d="M2 20 L20 4"/></g><g fill="#cfd8de"><path d="M24 6l-6 1 5 5z"/><path d="M28 10l-6 1 5 5z"/><path d="M20 4l-6 1 5 5z"/></g></svg>`,
  attack: { warrior: `<svg viewBox="0 0 32 32"><path d="M8 28 L22 8" stroke="#24180f" stroke-width="4"/><path d="M8 28 L22 8" stroke="#7a5230" stroke-width="2.2"/><path d="M19 5 Q29 5 28 15 L21 12z" fill="#a8b0b6" stroke="#24180f"/></svg>`,
    mage: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="#9ad0ff" opacity=".5"/><circle cx="16" cy="16" r="5" fill="#dff0ff"/></svg>`,
    archer: `<svg viewBox="0 0 32 32"><path d="M4 28 L26 6" stroke="#e8e0cc" stroke-width="2.4"/><path d="M26 6l-7 1 6 6z" fill="#cfd8de"/><path d="M4 28l2-6 4 4z" fill="#c43a2c"/></svg>` },
  charge: `<svg viewBox="0 0 32 32"><g stroke="#ffe9a8" stroke-width="2.2" stroke-linecap="round"><path d="M3 10h9M2 16h11M3 22h9"/></g><path d="M14 26 L26 8" stroke="#24180f" stroke-width="4"/><path d="M14 26 L26 8" stroke="#7a5230" stroke-width="2.2"/><path d="M23 5 Q31 5 30 13 L25 11z" fill="#d8dde2" stroke="#24180f"/><g fill="#ffe066"><path d="M24 20l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z"/></g></svg>`,
  frost: `<svg viewBox="0 0 32 32"><path d="M4 28 L24 8" stroke="#bfe6ff" stroke-width="3"/><path d="M27 5l-9 3 6 6z" fill="#e8f8ff" stroke="#4a8ac0"/><g stroke="#e8f8ff" stroke-width="1.6"><path d="M9 16l2 7M5 19l7 2M7 26l3-8"/></g><circle cx="9" cy="21" r="5" fill="#9ad0ff" opacity=".35"/></svg>`,
  net: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#3a2a1a" opacity=".35"/><g stroke="#e8dcc0" stroke-width="1.5" fill="none"><path d="M6 8 Q16 13 26 8M5 16 Q16 20 27 16M6 24 Q16 27 26 24M9 5 Q12 16 9 27M16 4v24M23 5 Q20 16 23 27"/></g><g fill="#a8845a"><circle cx="6" cy="8" r="2"/><circle cx="26" cy="8" r="2"/><circle cx="6" cy="24" r="2"/><circle cx="26" cy="24" r="2"/></g></svg>`,
  potion: `<svg viewBox="0 0 32 32"><rect x="13" y="3" width="6" height="6" fill="#c9a06a" stroke="#24180f"/><path d="M12 9h8v4l5 6v6a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-6l5-6z" fill="#e8e0cc" stroke="#24180f"/><path d="M8 19h16v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#d8323a"/></svg>`,
  bag: `<svg viewBox="0 0 32 32"><path d="M8 28 Q3 14 12 9 h8 Q29 14 24 28z" fill="#8a6a3a" stroke="#24180f" stroke-width="1.5"/><path d="M12 9 Q16 3 20 9" fill="none" stroke="#24180f" stroke-width="2"/><circle cx="16" cy="18" r="2.5" fill="#ffd34d"/></svg>`,
  map: `<svg viewBox="0 0 32 32"><path d="M4 8l8-3 8 3 8-3v19l-8 3-8-3-8 3z" fill="#d9c79a" stroke="#24180f" stroke-width="1.4"/><path d="M12 5v19M20 8v19" stroke="#8a6a3a" stroke-width="1.2"/><path d="M7 18q4-6 8-2t9-5" fill="none" stroke="#c8323a" stroke-width="1.6" stroke-dasharray="2 2"/></svg>`,
  menu: `<svg viewBox="0 0 32 32"><g fill="#ffe9a8"><rect x="7" y="8" width="18" height="3" rx="1.5"/><rect x="7" y="15" width="18" height="3" rx="1.5"/><rect x="7" y="22" width="18" height="3" rx="1.5"/></g></svg>`,
};

/** Деньги монетками: золото, серебро, медь (пустые старшие не показываются). */
import { coins } from '../engine/util.js';
export function moneyHtml(v) {
  const { g, s, c } = coins(v), out = [];
  if (g) out.push(`<b>${g}</b><i class="coin cg" title="золото"></i>`);
  if (s || g) out.push(`<b>${s}</b><i class="coin cs" title="серебро"></i>`);
  out.push(`<b>${c}</b><i class="coin cc" title="медь"></i>`);
  return `<span class="money">${out.join('')}</span>`;
}

// ---------------------------------------------------------------- v61: кольцо, шея, аксессуары, руда, слитки, кирка
const box = (body, rc, size) => `<svg viewBox="0 0 32 32" width="${size}" height="${size}" style="background:radial-gradient(circle at 50% 40%, ${rc}33, #1a120c 70%);border:2px solid ${rc};border-radius:6px">${body}</svg>`;
const gem = (cx, cy, r, c) => `<path d="M${cx} ${cy - r}l${r} ${r}-${r} ${r}-${r}-${r}z" fill="${c}" stroke="${O}" stroke-width=".9"/><path d="M${cx - r * 0.4} ${cy - r * 0.2}l${r * 0.35} -${r * 0.4}" stroke="#fff" stroke-width="1" opacity=".7"/>`;
export const ACC_ICON = {
  ring: c => `<ellipse cx="16" cy="19" rx="9" ry="8" fill="none" stroke="${O}" stroke-width="5"/><ellipse cx="16" cy="19" rx="9" ry="8" fill="none" stroke="#e7c35a" stroke-width="2.8"/><ellipse cx="13" cy="15" rx="3" ry="1.4" fill="#fff6c0" opacity=".7"/>${gem(16, 10, 4.5, c)}`,
  neck: c => `<path d="M6 4 Q16 22 26 4" fill="none" stroke="${O}" stroke-width="3.2"/><path d="M6 4 Q16 22 26 4" fill="none" stroke="#cfd6dc" stroke-width="1.6" stroke-dasharray="2 1.4"/><path d="M16 15l6 6-6 8-6-8z" fill="#e7c35a" stroke="${O}"/>${gem(16, 22, 3.6, c)}`,
  stoneheart: `<path d="M16 28 L4 15 A6.5 6.5 0 0 1 16 8 A6.5 6.5 0 0 1 28 15z" fill="#8d8a82" stroke="${O}" stroke-width="1.4"/><path d="M8 14l5 3 3-4 4 5 5-3" fill="none" stroke="#5c5a54" stroke-width="1.4"/><path d="M10 12 Q12 9 15 10" stroke="#c4c0b6" stroke-width="1.6" fill="none"/>`,
  rage: `<path d="M5 24 Q10 8 27 5 Q22 12 22 18 Q14 18 9 27z" fill="#c9a06a" stroke="${O}" stroke-width="1.3"/><path d="M8 24 Q12 14 22 9" stroke="#8a5a2a" stroke-width="1.3" fill="none"/><path d="M24 4l4-2-1 5" fill="#c43a2c" stroke="${O}" stroke-width=".8"/><circle cx="8" cy="25" r="3" fill="#e7c35a" stroke="${O}"/>`,
  breath: `<rect x="13" y="3" width="6" height="5" fill="#c9a06a" stroke="${O}"/><path d="M12 8h8v4l5 6v7a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-7l5-6z" fill="#e8e0cc" stroke="${O}"/><path d="M8 18h16v7a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#5fd38a"/><circle cx="13" cy="22" r="1.4" fill="#fff"/><circle cx="18" cy="25" r="1" fill="#fff"/>`,
  windfeather: `<path d="M6 28 Q8 12 26 4 Q22 16 10 24z" fill="#e8f4ff" stroke="${O}" stroke-width="1.3"/><path d="M8 26 L24 7" stroke="#8ab0d0" stroke-width="1.2"/><g stroke="#9ad0ff" stroke-width="1.4"><path d="M18 18h8M20 22h7M16 14h6"/></g>`,
  stormeye: `<circle cx="16" cy="16" r="11" fill="#2f4f8a" stroke="${O}" stroke-width="1.4"/><ellipse cx="16" cy="16" rx="8" ry="5" fill="#e8f4ff" stroke="${O}"/><circle cx="16" cy="16" r="3.4" fill="#4a9eff"/><path d="M17 3l-4 7h4l-3 7" fill="none" stroke="#ffe066" stroke-width="1.8"/>`,
  thorns: `<rect x="12" y="6" width="8" height="22" rx="2" fill="#6b4a2c" stroke="${O}"/><g fill="#d8c8a0" stroke="${O}" stroke-width=".8"><path d="M12 9l-6-2 6 5z"/><path d="M20 12l6-3-6 6z"/><path d="M12 17l-7 1 7 3z"/><path d="M20 21l6 0-6 3z"/></g><circle cx="16" cy="6" r="3" fill="#7fb88a" stroke="${O}"/>`,
  phoenix: `<path d="M16 27 Q6 22 5 12 Q11 16 13 14 Q10 8 16 3 Q22 8 19 14 Q21 16 27 12 Q26 22 16 27z" fill="#ff8a2a" stroke="${O}" stroke-width="1.3"/><path d="M16 23 Q11 19 12 15 Q15 17 16 12 Q17 17 20 15 Q21 19 16 23z" fill="#ffe066"/>`,
  mirror: `<ellipse cx="16" cy="13" rx="9" ry="10" fill="#c9a24a" stroke="${O}" stroke-width="1.4"/><ellipse cx="16" cy="13" rx="6.5" ry="7.5" fill="#3a2a5a"/><path d="M13 10a3 3 0 1 1 6 0v8h-6z" fill="#8a7ab8" opacity=".85"/><rect x="14" y="23" width="4" height="6" fill="#c9a24a" stroke="${O}"/>`,
  pack: `<path d="M5 22 Q10 6 27 6 Q21 12 21 18 Q14 18 9 27z" fill="#b8c4d4" stroke="${O}" stroke-width="1.3"/><path d="M15 21l2-5 2 3 2-4 1 6z" fill="#e8f4ff" stroke="${O}" stroke-width=".8"/><circle cx="8" cy="25" r="3" fill="#7ec8ff" stroke="${O}"/>`,
  shadowcloak: `<path d="M16 3 Q6 8 6 20 L4 29 Q16 25 28 29 L26 20 Q26 8 16 3z" fill="#2a2234" stroke="${O}" stroke-width="1.4"/><path d="M11 12 Q16 8 21 12 Q19 18 16 18 Q13 18 11 12z" fill="#0e0a14"/><circle cx="14" cy="13" r="1.1" fill="#b46aff"/><circle cx="18" cy="13" r="1.1" fill="#b46aff"/>`,
  hourglass: `<rect x="7" y="3" width="18" height="3" fill="#c9a24a" stroke="${O}"/><rect x="7" y="26" width="18" height="3" fill="#c9a24a" stroke="${O}"/><path d="M9 6h14Q23 13 17 16Q23 19 23 26H9Q9 19 15 16Q9 13 9 6z" fill="#cfeaff" stroke="${O}" stroke-width="1.2"/><path d="M12 22 Q16 18 20 22 L21 25 H11z" fill="#e7c35a"/>`,
  gravity: `<circle cx="16" cy="17" r="9" fill="#4a3a5a" stroke="${O}" stroke-width="1.4"/><circle cx="16" cy="17" r="4" fill="#b46aff"/><g fill="none" stroke="#c8a0ff" stroke-width="1.3"><path d="M3 9 Q8 12 9 16"/><path d="M29 9 Q24 12 23 16"/><path d="M5 28 Q9 25 11 23"/><path d="M27 28 Q23 25 21 23"/></g>`,
  ore_copper: `<path d="M4 23l3-10 8-7 10 3 4 11-6 7-12 1z" fill="#8c8478" stroke="${O}" stroke-width="1.4"/><path d="M7 13l8-7 10 3-7 5z" fill="#a8a094"/><path d="M25 9l4 11-6 7-5-13z" fill="#6a645a"/><path d="M7 13l11 1 7-5M18 14l5 13M18 14l-7 14" fill="none" stroke="${O}" stroke-width=".7" opacity=".55"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#7a3c18" stroke-width="3.2" stroke-linecap="round"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#e08a48" stroke-width="1.8" stroke-linecap="round"/><path d="M7 20.6l4-2.4" stroke="#ffd0a0" stroke-width=".8"/><path d="M12 9l4-2 3 3-3 3-4-1z" fill="#7fb88a" stroke="${O}" stroke-width=".9"/><path d="M13 9.5l2.6-1.2" stroke="#fff" stroke-width="1"/><path d="M10 25l3-2 2 2-2 2z" fill="#e08a48" stroke="${O}" stroke-width=".8"/><path d="M9 13l4-3" stroke="#fff" stroke-width="1.4" opacity=".8"/>`,
  ore_tin: `<path d="M4 23l3-10 8-7 10 3 4 11-6 7-12 1z" fill="#867f74" stroke="${O}" stroke-width="1.4"/><path d="M7 13l8-7 10 3-7 5z" fill="#a29a8e"/><path d="M25 9l4 11-6 7-5-13z" fill="#645e55"/><path d="M7 13l11 1 7-5M18 14l5 13M18 14l-7 14" fill="none" stroke="${O}" stroke-width=".7" opacity=".55"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#5a636c" stroke-width="3.2" stroke-linecap="round"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#dfe5ea" stroke-width="1.8" stroke-linecap="round"/><path d="M7 20.6l4-2.4" stroke="#ffffff" stroke-width=".8"/><path d="M12 9l4-2 3 3-3 3-4-1z" fill="#9aa6b2" stroke="${O}" stroke-width=".9"/><path d="M13 9.5l2.6-1.2" stroke="#fff" stroke-width="1"/><path d="M10 25l3-2 2 2-2 2z" fill="#dfe5ea" stroke="${O}" stroke-width=".8"/><path d="M9 13l4-3" stroke="#fff" stroke-width="1.4" opacity=".8"/>`,
  bar_copper: `<path d="M3 21l7-8h19l-7 8z" fill="#f0a060" stroke="${O}" stroke-width="1.4"/><path d="M3 21h19v6H3z" fill="#c8703a" stroke="${O}" stroke-width="1.4"/><path d="M22 21l7-8v6l-7 8z" fill="#8a4620" stroke="${O}" stroke-width="1.4"/><path d="M7 19.5l4.5-5h13.5l-4.5 5z" fill="none" stroke="#a85a2a" stroke-width=".9"/><path d="M5 23h15" stroke="#ffd0a0" stroke-width=".9" opacity=".7"/><path d="M11 15.5h10" stroke="#fff" stroke-width="1.5"/><path d="M8 19l2-2" stroke="#fff" stroke-width="1.2" opacity=".8"/><path d="M24.5 18l2-2.4" stroke="#ffd0a0" stroke-width=".9" opacity=".6"/>`,
  bar_tin: `<path d="M3 21l7-8h19l-7 8z" fill="#eef2f6" stroke="${O}" stroke-width="1.4"/><path d="M3 21h19v6H3z" fill="#c0c6cc" stroke="${O}" stroke-width="1.4"/><path d="M22 21l7-8v6l-7 8z" fill="#8a929a" stroke="${O}" stroke-width="1.4"/><path d="M7 19.5l4.5-5h13.5l-4.5 5z" fill="none" stroke="#9aa2aa" stroke-width=".9"/><path d="M5 23h15" stroke="#ffffff" stroke-width=".9" opacity=".7"/><path d="M11 15.5h10" stroke="#fff" stroke-width="1.5"/><path d="M8 19l2-2" stroke="#fff" stroke-width="1.2" opacity=".8"/><path d="M24.5 18l2-2.4" stroke="#ffffff" stroke-width=".9" opacity=".6"/>`,
  gem_tigerseye: `<path d="M16 4l10 8-4 14H10L6 12z" fill="#d8a040" stroke="${O}" stroke-width="1.4"/><path d="M6 12h20M16 4l-4 8 4 14 4-14z" fill="none" stroke="#8a5a1a" stroke-width="1"/><path d="M10 12 Q16 15 22 12" stroke="#ffe0a0" stroke-width="1.4" fill="none"/><path d="M12 7l3-1" stroke="#fff" stroke-width="1.4"/>`,
  gem_amethyst: `<path d="M16 3l9 7-2 16-7 3-7-3-2-16z" fill="#a86ad8" stroke="${O}" stroke-width="1.4"/><path d="M7 10h18M16 3v26M9 26l7-16 7 16" fill="none" stroke="#6a3a9a" stroke-width="1"/><path d="M11 7l4-2" stroke="#f0d8ff" stroke-width="1.6"/>`,
  ore_iron: `<path d="M4 23l3-10 8-7 10 3 4 11-6 7-12 1z" fill="#6e6a68" stroke="${O}" stroke-width="1.4"/><path d="M7 13l8-7 10 3-7 5z" fill="#8a8682"/><path d="M25 9l4 11-6 7-5-13z" fill="#4a4644"/><path d="M7 13l11 1 7-5M18 14l5 13M18 14l-7 14" fill="none" stroke="${O}" stroke-width=".7" opacity=".55"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#4a2010" stroke-width="3.2" stroke-linecap="round"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#a8502a" stroke-width="1.8" stroke-linecap="round"/><path d="M7 20.6l4-2.4" stroke="#e8904a" stroke-width=".8"/><path d="M12 9l4-2 3 3-3 3-4-1z" fill="#b8c0c8" stroke="${O}" stroke-width=".9"/><path d="M13 9.5l2.6-1.2" stroke="#fff" stroke-width="1"/><path d="M10 25l3-2 2 2-2 2z" fill="#a8502a" stroke="${O}" stroke-width=".8"/><path d="M9 13l4-3" stroke="#fff" stroke-width="1.4" opacity=".8"/>`,
  bar_iron: `<path d="M3 21l7-8h19l-7 8z" fill="#c4ccd2" stroke="${O}" stroke-width="1.4"/><path d="M3 21h19v6H3z" fill="#5a6066" stroke="${O}" stroke-width="1.4"/><path d="M22 21l7-8v6l-7 8z" fill="#8a929a" stroke="${O}" stroke-width="1.4"/><path d="M7 19.5l4.5-5h13.5l-4.5 5z" fill="none" stroke="#9aa2aa" stroke-width=".9"/><path d="M5 23h15" stroke="#ffffff" stroke-width=".9" opacity=".7"/><path d="M11 15.5h10" stroke="#fff" stroke-width="1.5"/><path d="M8 19l2-2" stroke="#fff" stroke-width="1.2" opacity=".8"/><path d="M24.5 18l2-2.4" stroke="#ffffff" stroke-width=".9" opacity=".6"/>`,
  gem_emerald: `<path d="M16 3l9 7-2 16-7 3-7-3-2-16z" fill="#3ac878" stroke="${O}" stroke-width="1.4"/><path d="M7 10h18M16 3v26M9 26l7-16 7 16" fill="none" stroke="#1e7a48" stroke-width="1"/><path d="M11 7l4-2" stroke="#d8ffe8" stroke-width="1.6"/>`,
  pickaxe: `<path d="M9 29L19 11" stroke="${O}" stroke-width="4.4" stroke-linecap="round"/><path d="M9 29L19 11" stroke="#8a5a32" stroke-width="2.6" stroke-linecap="round"/><path d="M10.5 26l7-12.5" stroke="#c08a52" stroke-width=".9"/><path d="M4 11Q10 4 17 5Q24 5 29 12L27 13Q23 9 19 9.5L17 11.5L14.5 9.5Q10 9.5 6 12.5z" fill="#a8b0b6" stroke="${O}" stroke-width="1.4"/><path d="M6 11Q11 6 16.5 6.6Q23 6.8 27 11.5" fill="none" stroke="#e8eef2" stroke-width="1.1"/><path d="M14.5 9.5L17 11.5L19 9.5L17 6.8z" fill="#6a7076" stroke="${O}" stroke-width=".9"/><path d="M8 29.5l2 .8" stroke="${O}" stroke-width="2"/>`,
};
/** Значок: кольцо/шея (gem — цвет камня), аксессуар по id, руда/слиток/кирка. */
export function accIcon(kind, rar = 'common', size = 40, gemCol = '#4a9eff') {
  const b = ACC_ICON[kind]; const body = typeof b === 'function' ? b(gemCol) : b || '';
  return box(body, RAR_COL[rar] || '#888', size);
}
/** Значок любой вещи из сумки: доспех и оружие, кольцо и шея, аксессуар, руда, слиток, кирка. */
const GEM = { crit: '#ff6a5a', haste: '#9ad0ff', regen: '#5fd38a', pen: '#e7c35a', dodge: '#c8e0ff', vamp: '#c41a3a', block: '#c4c0b6', cdr: '#b46aff' };
export function anyIcon(it, size = 44) {
  if (it.kind === 'ore' || it.kind === 'bar' || it.kind === 'gem') return accIcon(it.kind + '_' + it.metal, it.rar || 'common', size);
  if (it.kind === 'tool') return accIcon('pickaxe', 'common', size);
  if (it.trinket) return accIcon(it.trinket, it.rar, size);
  return itemIcon(it, size);
}
