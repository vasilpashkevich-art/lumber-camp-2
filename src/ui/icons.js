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
