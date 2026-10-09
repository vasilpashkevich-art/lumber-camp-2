// Значки вещей и умений (SVG), в цветах облика: какой ярус — такой цвет.
import { LINE } from '../art/hero.js';
import { RAR_COL } from '../../data/balance.js';

const O = '#24180f';

export function itemIcon(it, size = 40) {
  const ln = LINE[it.cls], tier = it.tier ?? 0, rc = RAR_COL[it.rar] || '#888';
  let body = '';
  if (it.slot === 'head') {
    const col = it.cls === 'mage' ? ['#7a5a3a', '#7a5a3a', '#3a5a9a', '#4a2f78', '#241a50'][tier] : it.cls === 'archer' ? ['#6b4a2c', '#6b4a2c', '#2f4f2a', '#2f6a3a', '#1f5a4a'][tier] : ['#8a5a32', '#8a5a32', '#9aa3aa', '#c4ccd2', '#4a4f6e'][tier];
    if (it.cls === 'mage' && tier >= 2) body = `<ellipse cx="16" cy="25" rx="13" ry="3.5" fill="#1e1438" stroke="${O}"/><path d="M8 25 Q12 12 14 5 Q10 2 6 4 Q13 0 17 5 Q20 15 24 25z" fill="${col}" stroke="${O}"/><rect x="8" y="21" width="16" height="3" fill="#f4c766" stroke="${O}" stroke-width=".8"/>`;
    else if (it.cls === 'archer' || it.cls === 'mage') body = `<path d="M6 27c-2-10 2-20 10-20s12 10 10 20z" fill="${col}" stroke="${O}"/><path d="M4 10 Q1 3 5 1 Q6 7 10 9z" fill="${col}" stroke="${O}"/><ellipse cx="17" cy="20" rx="6" ry="6.4" fill="#2a1a10" opacity=".6"/>`;
    else body = tier >= 3 ? `<path d="M5 18c-3-6-2-12 1-15 0 6 2 9 5 10z" fill="#ece2c8" stroke="${O}"/><path d="M27 18c3-6 2-12-1-15 0 6-2 9-5 10z" fill="#ece2c8" stroke="${O}"/><path d="M7 22a9 9 0 0118 0v6h-4v-4h-10v4H7z" fill="${col}" stroke="${O}"/><rect x="6.5" y="19" width="19" height="3.4" fill="#f4c766" stroke="${O}" stroke-width=".8"/>`
      : `<path d="M6 22a10 10 0 0120 0v5h-5v-4H11v4H6z" fill="${col}" stroke="${O}"/><rect x="6" y="19.5" width="20" height="3" fill="${tier >= 2 ? '#7c858c' : '#5a3418'}" stroke="${O}" stroke-width=".8"/>`;
  } else if (it.slot === 'chest') {
    const col = ln.chest[tier];
    body = it.cls === 'mage' && tier >= 1 ? `<path d="M9 4h14l3 6-3 1 3 17H6l3-17-3-1z" fill="${col}" stroke="${O}"/><rect x="8" y="15" width="16" height="2.4" fill="#f4c766" stroke="${O}" stroke-width=".6"/>`
      : `<path d="M7 6l5-2h8l5 2 3 9-4 1v12H8V16l-4-1z" fill="${col}" stroke="${O}"/><rect x="8" y="19" width="16" height="3" fill="#3a2416" stroke="${O}" stroke-width=".7"/><rect x="14.6" y="19" width="2.8" height="3" fill="#f4c766"/>`;
  } else if (it.slot === 'legs') {
    const col = ln.legs[tier];
    body = `<path d="M8 4h16l1 23h-6l-3-15-3 15H7z" fill="${col}" stroke="${O}"/><rect x="8" y="4" width="16" height="3.5" fill="#3a2416" stroke="${O}" stroke-width=".7"/>`;
  } else {
    const wt = it.wt ?? 0;
    if (it.cls === 'warrior') { const bc = wt >= 3 ? '#7ec8ff' : wt >= 2 ? '#d8dde2' : '#a8b0b6'; body = `<path d="M9 28 L22 6" stroke="${O}" stroke-width="4"/><path d="M9 28 L22 6" stroke="#7a5230" stroke-width="2.2"/><path d="M19 4 Q29 4 28 14 L21 11z" fill="${bc}" stroke="${O}"/>${wt >= 2 ? `<path d="M19 4 Q11 2 12 10 L18 8z" fill="${bc}" stroke="${O}"/>` : ''}`; }
    else if (it.cls === 'mage') { const oc = ['#7a5a32', '#7ec8ff', '#9affc8', '#c8a0ff'][wt]; body = `<path d="M10 29 L20 9" stroke="${O}" stroke-width="4"/><path d="M10 29 L20 9" stroke="#6b4a2c" stroke-width="2.2"/><circle cx="22" cy="7" r="${wt ? 5 : 3}" fill="${oc}" stroke="${O}"/>`; }
    else { const bc = ['#8a6a3a', '#6b4a2c', '#4a3420', '#d8c050'][wt]; body = `<path d="M10 4 Q28 16 10 28" fill="none" stroke="${O}" stroke-width="4"/><path d="M10 4 Q28 16 10 28" fill="none" stroke="${bc}" stroke-width="2.2"/><path d="M10 4 L10 28" stroke="#e8e0cc" stroke-width="1"/>`; }
  }
  return `<svg viewBox="0 0 32 32" width="${size}" height="${size}" style="background:radial-gradient(circle at 50% 40%, ${rc}33, #1a120c 70%);border:2px solid ${rc};border-radius:6px">${body}</svg>`;
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
  ore_copper: `<path d="M5 24l4-10 8-5 9 4 2 10-8 4-10-1z" fill="#8c8478" stroke="${O}" stroke-width="1.3"/><path d="M9 16l6 3 6-4 4 6" fill="none" stroke="${O}" stroke-width="3"/><path d="M9 16l6 3 6-4 4 6" fill="none" stroke="#c8703a" stroke-width="1.8"/><path d="M12 22l3-2 2 3-3 1z" fill="#7fb88a" stroke="${O}" stroke-width=".7"/>`,
  ore_tin: `<path d="M5 24l4-10 8-5 9 4 2 10-8 4-10-1z" fill="#867f74" stroke="${O}" stroke-width="1.3"/><path d="M9 16l6 3 6-4 4 6" fill="none" stroke="${O}" stroke-width="3"/><path d="M9 16l6 3 6-4 4 6" fill="none" stroke="#dde3e8" stroke-width="1.8"/><path d="M12 22l3-2 2 3-3 1z" fill="#9aa6b2" stroke="${O}" stroke-width=".7"/>`,
  bar_copper: `<path d="M4 21l6-8h18l-6 8z" fill="#f0a060" stroke="${O}" stroke-width="1.3"/><path d="M4 21h18v5H4z" fill="#c8703a" stroke="${O}" stroke-width="1.3"/><path d="M22 21l6-8v5l-6 8z" fill="#9a5028" stroke="${O}" stroke-width="1.3"/><path d="M11 15h10" stroke="#ffd0a0" stroke-width="1.2"/>`,
  bar_tin: `<path d="M4 21l6-8h18l-6 8z" fill="#f0f4f8" stroke="${O}" stroke-width="1.3"/><path d="M4 21h18v5H4z" fill="#c9ced4" stroke="${O}" stroke-width="1.3"/><path d="M22 21l6-8v5l-6 8z" fill="#9aa2aa" stroke="${O}" stroke-width="1.3"/><path d="M11 15h10" stroke="#fff" stroke-width="1.2"/>`,
  pickaxe: `<path d="M8 28 L20 10" stroke="${O}" stroke-width="4"/><path d="M8 28 L20 10" stroke="#8a5a32" stroke-width="2.2"/><path d="M6 9 Q16 2 28 9 Q20 8 17 11 Q13 8 6 9z" fill="#a8b0b6" stroke="${O}" stroke-width="1.3"/>`,
};
/** Значок: кольцо/шея (gem — цвет камня), аксессуар по id, руда/слиток/кирка. */
export function accIcon(kind, rar = 'common', size = 40, gemCol = '#4a9eff') {
  const b = ACC_ICON[kind]; const body = typeof b === 'function' ? b(gemCol) : b || '';
  return box(body, RAR_COL[rar] || '#888', size);
}
/** Значок любой вещи из сумки: доспех и оружие, кольцо и шея, аксессуар, руда, слиток, кирка. */
const GEM = { crit: '#ff6a5a', haste: '#9ad0ff', regen: '#5fd38a', pen: '#e7c35a', dodge: '#c8e0ff', vamp: '#c41a3a', block: '#c4c0b6', cdr: '#b46aff' };
export function anyIcon(it, size = 44) {
  if (it.kind === 'ore' || it.kind === 'bar') return accIcon(it.kind + '_' + it.metal, 'common', size);
  if (it.kind === 'tool') return accIcon('pickaxe', 'common', size);
  if (it.trinket) return accIcon(it.trinket, it.rar, size);
  if (it.slot === 'ring' || it.slot === 'neck') return accIcon(it.slot, it.rar, size, GEM[Object.keys(it.props || {})[0]] || '#c8b898');
  return itemIcon(it, size);
}
