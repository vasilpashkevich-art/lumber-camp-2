// Окна: «Персонаж» (надетое, сумка, характеристики), «Рынок», меню (Esc), гибель.
import { CLASSES, SLOTS, SLOTS_L, SLOTS_R, SLOT_NAME, MAIN_STAT } from '../../data/classes.js';
import { ORES, MINE, veinColor } from '../../data/mining.js';
import { learnMining, buyPick, smelt, countOf, miningSkill, hasPick } from '../systems/mining.js';
import { HERBS, HERBAL } from '../../data/herbs.js';
import { POTIONS, ALCH, KIND_NAME } from '../../data/alchemy.js';
import { herbSkill, alchSkill, skillColor, learnHerbal, learnAlchemy, buyFlask, brew, canBrew, drinkElixir } from '../systems/herbs.js';
import { RAR_COL, RAR_NAME, LOOT, armorCut, PROPS } from '../../data/balance.js';
import { itemIcon, anyIcon, accIcon, moneyHtml, potionIcon } from './icons.js';
import { itemLines, itemNums, lookOf } from '../systems/items.js';
import { compareItem } from '../entities/hero.js';
import { stashPut, stashTake, stashMove, stashSwap, stashMaterials, store } from '../systems/bank.js';
import { equip, unequip, sellItem, buyPotion, shopStock, buyShop, POTION_PRICE, respawnHero, lootTake, hasLoot, bagMove, abilsOf, buyBack } from '../systems/game.js';
import { ABIL_ICON } from './icons.js';
import { iconUrl } from '../art/abicons.js';
import { playPreview, hasPreview, SW, SH } from './abilpreview.js';
import { talentRows, talentFree, chooseTalent, resetTalents, resetPrice } from '../systems/talents.js';
import { doll } from '../art/body.js';
import { $, el, modal, toast, TOUCH, T } from './dom.js';
import { DUNGEONS, dgState, dgLeft, dgBosses, fmtLeft } from '../systems/dungeon.js';
import { makeDnD } from './drag.js';
import { DEFAULT_BAR } from '../engine/input.js';
import { soundState, setSound, setVol } from '../engine/audio.js';
import { fmt1 } from '../engine/util.js';
import { statRows } from './stathelp.js';
import { installHtml, bindInstall } from './install.js';

const PNAME = { crit: 'Крит', haste: 'Скорость удара', regen: 'Восстановление', pen: 'Пробивание брони', dodge: 'Уклонение', vamp: 'Вампиризм', block: 'Блок', cdr: 'Перезарядка' };
let tipEl = null;
/** Подсказка при наведении мыши. На телефоне наведения нет — вместо неё лист вещи с кнопками (itemSheet). */
const hov = (b, fn) => { if (!TOUCH) { b.onmouseenter = fn; b.onmouseleave = hideTip; } };
/** Телефон: касание вещи — карточка со сравнением и кнопками действий. acts: [[надпись, fn, main?]]. */
function itemSheet(G, it, acts, worn) {
  const cur = it.slot ? G.hero.eq[it.slot] : null, same = cur && cur.id === it.id;
  const html = card(it, G).replace(/<\/div>$/, (same || it.cls !== G.hero.cls ? '' : diffHtml(it, G)) + '</div>') + (!same && cur && it.cls === G.hero.cls ? card(cur, G, '<p class="hint2">Сейчас надето</p>') : '');
  const m = modal(`<div class="sheet">${html}</div><div class="row">${acts.map(([t, , main], i) => `<button class="btn${main ? ' main' : ''}" data-i="${i}">${t}</button>`).join('')}<button class="btn" data-x="no">Закрыть</button></div>`, 'itemsheet');
  m.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { m.close(); acts[+b.dataset.i][1](); });
  m.querySelector('[data-x=no]').onclick = () => m.close();
  return m;
}
/** Касание/щелчок по вещи: на компьютере — сразу действие, на телефоне — сначала лист. */
const onItem = (b, G, it, label, fn, worn) => { b.onclick = () => { hideTip(); if (TOUCH) { if (label) itemSheet(G, it, [[label, fn, true]], worn); else itemSheet(G, it, [], worn); } else if (label) fn(); }; };
const pct = v => (v >= 0 ? '+' : '−') + Math.abs(Math.round(v * 1000) / 10).toString().replace('.', ',') + '%';
const num = v => (v > 0 ? '+' : '−') + String(Math.abs(Math.round(v * 10) / 10)).replace('.', ',');
/** Одна карточка вещи (для подсказки). */
function card(it, G, head = '') {
  const wrong = it.cls !== G.hero.cls ? `<p class="bad">Не для вашего класса</p>` : '';
  const kind = it.kind === 'ore' ? 'Руда' : it.kind === 'bar' ? 'Слиток' : it.kind === 'gem' ? 'Самоцвет' : it.kind === 'tool' ? 'Инструмент' : it.kind === 'herb' ? 'Трава' : it.kind === 'flask' ? 'Склянка' : it.kind === 'potion' ? `Зелье · ${KIND_NAME[POTIONS[it.metal].kind]}` : `${RAR_NAME[it.rar]} · ${SLOT_NAME[it.slot]}`;
  return `<div class="tcard">${head}<b style="color:${RAR_COL[it.rar]}">${it.name}${it.n > 1 ? ` <span class="cnt">× ${it.n}</span>` : ''}</b><small>${kind}</small>${itemLines(it).map(([k, t, prop]) => `<p class="${prop ? 'prop' : ''}">${t}</p>`).join('')}${it.slot ? wrong : ''}${it.cost ? `<p class="gold">Купить: ${moneyHtml(it.cost)}</p>` : ''}${it.price && !it.cost ? `<p class="gold">Цена у торговца: ${moneyHtml(it.price * (it.n || 1))}${it.n > 1 ? ` <small>(${moneyHtml(it.price)} за штуку)</small>` : ''}</p>` : ''}</div>`;
}
/** Что изменится, если надеть: построчно и итог. */
function diffHtml(it, G) {
  if (!it.slot || it.trinket) return '';
  const h = G.hero, cur = h.eq[it.slot], c = compareItem(h, it); if (!c) return '';
  const a = itemNums(cur), b = itemNums(it), keys = [...new Set([...Object.keys(b), ...Object.keys(a)])];
  const NAME = { dmg: 'урон', armor: 'броня', main: MAIN_STAT[h.cls].toLowerCase(), stam: 'выносливость' };
  const rows = keys.map(k => { const d = (b[k] || 0) - (a[k] || 0); if (Math.abs(d) < 0.05) return ''; const P = k.startsWith('p:') ? PROPS[k.slice(2)] : null;
    return `<p class="${d > 0 ? 'up' : 'down'}">${num(d)}${P ? P.unit : ''} ${P ? PNAME[k.slice(2)].toLowerCase() : NAME[k]}</p>`; }).join('');
  return `<div class="tdiff"><i>Если надеть${cur ? ` вместо «${cur.name}»` : ''}:</i>${rows || '<p>без изменений</p>'}<p class="sum ${c.dps > 0.001 ? 'up' : c.dps < -0.001 ? 'down' : ''}">Урон в секунду ${pct(c.dps)}</p><p class="sum ${c.ehp > 0.001 ? 'up' : c.ehp < -0.001 ? 'down' : ''}">Живучесть ${pct(c.ehp)}</p></div>`;
}
function tip(e, it, G, worn) {
  if (!tipEl) { tipEl = el('div', 'tip'); document.body.append(tipEl); }
  if (!it) { tipEl.hidden = true; return; }
  const cur = it.slot ? G.hero.eq[it.slot] : null, same = cur && cur.id === it.id;
  const act = worn ? '<p class="hint2">Нажмите, чтобы снять</p>' : it.kind === 'potion' ? '<p class="hint2">Нажмите, чтобы выпить</p>' : '';
  const main = card(it, G, act).replace(/<\/div>$/, (same || it.cls !== G.hero.cls ? '' : diffHtml(it, G)) + '</div>');
  const other = !same && cur && it.cls === G.hero.cls ? card(cur, G, '<p class="hint2">Сейчас надето</p>') : '';
  tipEl.innerHTML = main + other; tipEl.classList.toggle('two', !!other);
  tipEl.hidden = false;
  const r = e.currentTarget.getBoundingClientRect(), w = tipEl.offsetWidth || 240, hh = tipEl.offsetHeight || 260;
  const left = r.right + 8 + w < innerWidth ? r.right + 8 : Math.max(8, r.left - w - 8);
  tipEl.style.left = left + 'px'; tipEl.style.top = Math.max(8, Math.min(innerHeight - hh - 8, r.top)) + 'px';
}
/** Зелёная стрелка на ячейке: вещь лучше надетой по урону в секунду. */
const upMark = (it, G) => { if (!it.slot || it.trinket) return it.trinket && !G.hero.eq.trinket && it.cls === G.hero.cls ? '<span class="upmark" title="Место свободно">▲</span>' : ''; const c = compareItem(G.hero, it); return c && c.up ? '<span class="upmark" title="Лучше надетого">▲</span>' : ''; };
/** Подсказка-пояснение к строке характеристик. */
function helpTip(e, title, text) {
  if (!tipEl) { tipEl = el('div', 'tip'); document.body.append(tipEl); }
  tipEl.innerHTML = `<div class="tcard thelp"><b>${title}</b><p>${text}</p></div>`; tipEl.classList.remove('two'); tipEl.hidden = false;
  const a = e.currentTarget, box = (a.closest('.stats') || a).getBoundingClientRect(), r = { left: box.left, right: box.right, top: a.getBoundingClientRect().top }, w = tipEl.offsetWidth || 260, hh = tipEl.offsetHeight || 120;   // справа от столбца значений, чтобы не закрывать цифры
  tipEl.style.left = (r.right + 10 + w < innerWidth ? r.right + 10 : Math.max(8, r.left - w - 10)) + 'px'; tipEl.style.top = Math.max(8, Math.min(innerHeight - hh - 8, r.top - 10)) + 'px';
}
export const hideTip = () => { if (tipEl) tipEl.hidden = true; };

/** Окно персонажа: слева облик и надетое, справа сумка. Клик по вещи в сумке — надеть, по надетой — снять. */
export function openChar(G, onChange) {
  const m = modal(`<h2>${G.hero.name}</h2><div class="charwin"><div><div class="dollw"><div class="eq eqL"></div><canvas width="340" height="472"></canvas><div class="eq eqR"></div></div><dl class="stats"></dl><div class="skillb"></div></div><div class="bagside"><h3>Сумка <span class="cnt"></span></h3><div class="bag"></div><p class="hint">${T('Нажмите на вещь в сумке — надеть, на надетую — снять. Вещи можно перетаскивать мышью: по ячейкам сумки, на снаряжение и обратно. Руда и слитки лежат стопками до 20. Закрыть — I, B или Esc.', 'Коснитесь вещи — увидите, что она даёт, и сможете надеть или снять. Задержите палец на вещи и ведите — переложите в другую ячейку или на снаряжение. Руда и слитки лежат стопками до 20.')}</p></div></div>`, 'wide');
  const cell = (it, extra = '') => el('button', 'cell', it ? anyIcon(it, 44) + (it.n > 1 ? `<span class="n">${it.n}</span>` : '') + extra : '');
  const draw = () => {
    const h = G.hero, st = G.st;
    const g = m.querySelector('canvas').getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 170, 236); doll(g, 85, 184, 3.9, 1, lookOf(h), 0.3);
    for (const [sel, list] of [['.eqL', SLOTS_L], ['.eqR', SLOTS_R]]) {
      const eq = m.querySelector(sel); eq.innerHTML = '';
      for (const s of list) {
        const it = h.eq[s]; const b = it ? cell(it) : el('button', 'cell', `<span class="empty">${SLOT_NAME[s]}</span>`);
        if (it) { hov(b, e => tip(e, it, G, true)); onItem(b, G, it, 'Снять', () => { unequip(G, s); onChange(); draw(); }, true); drag(b, { eq: s }); }
        drop(b, src => { if (src.it && src.it.slot === s) equip(G, src.it); });
        eq.append(b);
      }
    }
    const rows = statRows(h, st);
    m.querySelector('.stats').innerHTML = rows.map((r, i) => `<dt>${r.label}${r.help ? `<span class="si" data-i="${i}">i</span>` : ''}</dt><dd>${r.val}</dd>`).join('') + `<dt>Деньги</dt><dd>${moneyHtml(h.gold)}</dd><dt>Зелья</dt><dd>${h.potions}</dd>`;
    for (const b of m.querySelectorAll('.stats .si')) { const r = rows[+b.dataset.i]; if (TOUCH) b.onclick = e => { e.stopPropagation(); helpTip(e, r.label, r.help); }; else { b.onmouseenter = e => helpTip(e, r.label, r.help); b.onmouseleave = hideTip; } }
    const PR = [['Горное дело', miningSkill(h), MINE.cap], ['Травничество', herbSkill(h), HERBAL.cap], ['Алхимия', alchSkill(h), ALCH.cap]].filter(x => x[1]);
    m.querySelector('.skillb').innerHTML = PR.length ? PR.map(([n, sk, cap]) => `<div class="skrow"><span>${n}</span><span>${sk} / ${cap}</span></div><div class="skbar"><i style="width:${sk / cap * 100}%"></i></div>`).join('') : `<p class="hint">Профессии учат в Столице: горное дело — в Гильдии рудокопов, травничество и алхимию — у травницы.</p>`;
    m.querySelector('.cnt').textContent = `${h.bag.length} / ${LOOT.bag}`;
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), b = cell(it, it ? upMark(it, G) : '');
      if (it) { hov(b, e => tip(e, it, G)); onItem(b, G, it, it.slot ? 'Надеть' : it.kind === 'potion' ? 'Выпить' : null, () => { if (it.kind === 'potion') drinkElixir(G, it); else equip(G, it); onChange(); draw(); }); drag(b, { it }); }
      drop(b, src => { if (src.it) bagMove(G, src.it, i); else if (src.eq) { const cur = h.bag.find(x => x.pos === i); if (cur && cur.slot === src.eq) equip(G, cur); else if (!cur) unequip(G, src.eq, i); } });
      bag.append(b);
    }
  };
  // перетаскивание (v81: и мышью, и пальцем): из сумки в сумку, на снаряжение и обратно
  const { drag, drop } = makeDnD(() => { onChange(); draw(); });
  m.isChar = true;
  const onKey = e => { if ((e.code === 'KeyI' || e.code === 'KeyB') && !e.repeat) { e.preventDefault(); e.stopPropagation(); m.close(); } };
  addEventListener('keydown', onKey, true);
  m.onclose = () => { hideTip(); removeEventListener('keydown', onKey, true); }; draw(); return m;
}

/** Банк (v72): слева — личный банк (64) или общий сундук всех героев (32), справа — сумка.
 *  Компьютер: щелчок — переложить туда-обратно, перетаскивание — в нужную ячейку или на вкладку. Телефон: касание — лист с кнопками. */
export function openBank(G, onChange) {
  let tab = 'bank';
  const m = modal(`<h2>Банк</h2><p class="who">Банкир Евстафий: «У меня надёжнее, чем в сундуке под кроватью. Кладите, путник, — ни мышь, ни разбойник не доберётся. А в общий сундук положите то, что пригодится другим вашим героям».</p>
    <div class="bankw"><div class="bankside"><div class="tabs"><button class="tab" data-t="bank">Мой банк <span class="c1"></span></button><button class="tab" data-t="shared">Общий сундук <span class="c2"></span></button></div><div class="bag bankgrid"></div></div>
    <div class="bagside"><h3>Сумка <span class="cb"></span></h3><div class="bag bagg"></div><div class="row"><button class="btn mats">Сложить руду и камни</button></div>
    <p class="hint">${T('Нажмите на вещь — она перейдёт из сумки в банк или обратно. Можно перетаскивать мышью по ячейкам и на вкладку. Общий сундук видят все ваши герои. Закрыть — E или Esc.', 'Коснитесь вещи — «В банк» или «В сумку»; задержите палец и ведите — в нужную ячейку. Общий сундук видят все ваши герои.')}</p></div></div>`, 'wide bankbox');
  const cell = (it, extra = '') => el('button', 'cell', it ? anyIcon(it, 44) + (it.n > 1 ? `<span class="n">${it.n}</span>` : '') + extra : '');
  const { drag, drop } = makeDnD(() => { onChange(); draw(); });
  const done = () => { onChange(); draw(); };
  const tabName = t => t === 'shared' ? 'В общий сундук' : 'В банк';
  const draw = () => {
    const h = G.hero, S = store(G, tab), B = store(G, 'bank'), C = store(G, 'shared');
    m.querySelector('.c1').textContent = `${B.list.length}/${B.size}`; m.querySelector('.c2').textContent = `${C.list.length}/${C.size}`; m.querySelector('.cb').textContent = `${h.bag.length} / ${LOOT.bag}`;
    m.querySelectorAll('.tab').forEach(b => { b.classList.toggle('on', b.dataset.t === tab); b.onclick = () => { tab = b.dataset.t; hideTip(); draw(); };
      drop(b, src => { if (src.bag) stashPut(G, src.it, b.dataset.t); else if (src.from !== b.dataset.t) stashSwap(G, src.it, src.from, b.dataset.t); }); });
    const grid = m.querySelector('.bankgrid'); grid.innerHTML = ''; grid.classList.toggle('shared', tab === 'shared');
    for (let i = 0; i < S.size; i++) {
      const it = S.list.find(x => x.pos === i), b = cell(it, it && it.slot && it.cls === h.cls ? upMark(it, G) : '');
      if (it) { hov(b, e => tip(e, it, G)); onItem(b, G, it, 'В сумку', () => { stashTake(G, it, tab); done(); }); drag(b, { it, from: tab }); }
      drop(b, src => { if (src.bag) stashPut(G, src.it, tab, i); else if (src.from === tab) stashMove(G, src.it, tab, i); else stashSwap(G, src.it, src.from, tab, i); });
      grid.append(b);
    }
    const bag = m.querySelector('.bagg'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), b = cell(it, it ? upMark(it, G) : '');
      if (it) { hov(b, e => tip(e, it, G)); onItem(b, G, it, tabName(tab), () => { stashPut(G, it, tab); done(); }); drag(b, { it, bag: true }); }
      drop(b, src => { if (src.bag) bagMove(G, src.it, i); else stashTake(G, src.it, src.from, i); });
      bag.append(b);
    }
  };
  m.querySelector('.mats').onclick = () => { stashMaterials(G, tab); done(); };
  closeOnE(m); draw(); return m;
}

/** Окно закрывается той же клавишей E, которой открыто (и Esc — как все окна). */
function closeOnE(m, extra) {
  const onKey = e => { if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); e.stopPropagation(); m.close(); } };
  setTimeout(() => addEventListener('keydown', onKey, true), 0);
  const oc = m.onclose; m.onclose = () => { removeEventListener('keydown', onKey, true); hideTip(); oc && oc(); extra && extra(); };
}

/** Рынок: продать вещи, купить зелья. */
export function openVendor(G, onChange, shop = null) {
  const who = shop && shop.name === 'Лавка' ? 'Лавочник Трофим: «Колечко, бусы, зелье — всё для путника. Хорошее нынче дорого».' : shop && shop.id === 'cart' ? 'Купец Демьян: «В этом лесу, путник, без зелья ни шагу — туман, споры да пауки. Бери, пока я тут стою».' : 'Купец Савва: «Что продаёшь, путник? Зелья свежие, утром привезли. А вот и украшения — не дёшево, да того стоят».';
  const m = modal(`<h2>${shop ? shop.name : 'Рынок'}</h2><p class="who">${who}</p><div class="vend"><div><div class="tabs"><button class="tab on" data-t="buy">Купить</button><button class="tab" data-t="back">Выкуп <span class="cbb"></span></button></div><div class="buy"></div><div class="back" hidden></div></div><div><h3>Продать <small>(${T('нажмите на вещь, цена — в подсказке', 'коснитесь вещи — увидите цену')})</small></h3><div class="bag"></div><div class="row"><button class="btn sellall">Продать всё, что не надеть</button><button class="btn sellore">Продать руду, слитки и камни</button></div></div></div><p class="gold">Деньги: <b></b></p>`, 'wide');
  const draw = () => {
    const h = G.hero, p = POTION_PRICE(h.lvl);
    m.querySelector('.gold b').innerHTML = moneyHtml(h.gold);
    const buy = m.querySelector('.buy'); buy.innerHTML = '';
    const b = el('button', 'ware', `<span class="ic"></span><span><b>Зелье здоровья</b><small>+40% здоровья, снимает яд. У вас: ${h.potions} из 10</small></span><span class="pr">${moneyHtml(p)}</span>`);
    b.querySelector('.ic').innerHTML = `<svg viewBox="0 0 32 32" width="40" height="40"><rect x="13" y="3" width="6" height="6" fill="#c9a06a" stroke="#24180f"/><path d="M12 9h8v4l5 6v6a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-6l5-6z" fill="#e8e0cc" stroke="#24180f"/><path d="M8 19h16v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#d8323a"/></svg>`;
    b.onclick = () => { buyPotion(G); onChange(); draw(); }; buy.append(b);
    // v84: пустые склянки для алхимии
    const fl = el('button', 'ware', `<span class="ic">${accIcon('flask', 'common', 40)}</span><span><b>Пустая склянка</b><small>Для зелий алхимика. У вас: ${countOf(h, 'flask', 'flask')}</small></span><span class="pr">${moneyHtml(ALCH.flaskPrice)} <small>· 5 за ${moneyHtml(ALCH.flaskPrice * 5)}</small></span>`);
    fl.onclick = () => { buyFlask(G, 1); onChange(); draw(); }; fl.oncontextmenu = e => { e.preventDefault(); buyFlask(G, 5); onChange(); draw(); }; buy.append(fl);
    const fl5 = el('button', 'btn fl5', 'Купить 5 склянок'); fl5.onclick = () => { buyFlask(G, 5); onChange(); draw(); }; buy.append(fl5);
    // бижутерия: меняется каждые 30 минут игры, синяя — редко
    const S = shop && shopStock(G, shop);
    if (S) {
      buy.append(el('h4', 'jh', `Украшения <small>новый товар через ${Math.max(1, Math.ceil((S.at - G.t) / 60))} мин</small>`));
      if (!S.items.length) buy.append(el('p', 'hint', 'Всё раскупили — приходите позже.'));
      S.items.forEach((it, i) => {
        const w = el('button', 'ware', `<span class="ic">${anyIcon(it, 40)}${upMark(it, G)}</span><span><b style="color:${RAR_COL[it.rar]}">${it.name}</b><small>${RAR_NAME[it.rar]} · ${SLOT_NAME[it.slot]} · ур. ${it.ilvl}</small></span><span class="pr ${h.gold < it.cost ? 'no' : ''}">${moneyHtml(it.cost)}</span>`);
        hov(w, e => tip(e, it, G));
        w.onclick = () => { hideTip(); const go = () => { buyShop(G, shop, i); onChange(); draw(); }; if (TOUCH) itemSheet(G, it, [['Купить за ' + moneyHtml(it.cost), go, true]]); else go(); }; buy.append(w);
      });
    }
    // выкуп: последние проданные вещи за ту же цену
    const back = m.querySelector('.back'); back.innerHTML = ''; const BB = h.buyback || [];
    m.querySelector('.cbb').textContent = BB.length ? BB.length : '';
    if (!BB.length) back.append(el('p', 'hint', 'Вы ещё ничего не продавали. Проданное можно выкупить обратно за ту же цену — последние 12 вещей.'));
    BB.slice().reverse().forEach((e, k) => {
      const i = BB.length - 1 - k, it = e.it;
      const w = el('button', 'ware', `<span class="ic">${anyIcon(it, 40)}${upMark(it, G)}</span><span><b style="color:${RAR_COL[it.rar] || '#e9dfc8'}">${it.name}${it.n > 1 ? ' × ' + it.n : ''}</b><small>${it.rar ? RAR_NAME[it.rar] + ' · ' : ''}${it.slot ? SLOT_NAME[it.slot] + ' · ' : ''}${it.ilvl ? 'ур. ' + it.ilvl : ''}</small></span><span class="pr">${moneyHtml(e.v)}</span>`);
      hov(w, ev => tip(ev, it, G));
      w.onclick = () => { hideTip(); const go = () => { buyBack(G, i); onChange(); draw(); }; if (TOUCH) itemSheet(G, it, [['Выкупить за ' + moneyHtml(e.v), go, true]]); else go(); }; back.append(w);
    });
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), c = el('button', 'cell', it ? anyIcon(it, 44) + (it.n > 1 ? `<span class="n">${it.n}</span>` : '') + upMark(it, G) : '');
      if (it) { hov(c, e => tip(e, it, G)); onItem(c, G, it, 'Продать', () => { sellItem(G, it); onChange(); draw(); }); D.drag(c, { it }); }
      D.drop(c, src => { if (src.it) bagMove(G, src.it, i); });
      bag.append(c);
    }
  };
  const D = makeDnD(() => { onChange(); draw(); });
  for (const t of m.querySelectorAll('.tab')) t.onclick = () => { for (const u of m.querySelectorAll('.tab')) u.classList.toggle('on', u === t); m.querySelector('.buy').hidden = t.dataset.t !== 'buy'; m.querySelector('.back').hidden = t.dataset.t !== 'back'; };
  m.querySelector('.sellall').onclick = () => {
    const h = G.hero;
    for (const it of h.bag.slice()) { if (!it.slot) continue; const c = compareItem(h, it); if (!c || (h.eq[it.slot] && c.score <= 0 && !it.trinket)) sellItem(G, it); }
    onChange(); draw();
  };
  m.querySelector('.sellore').onclick = () => { for (const it of G.hero.bag.slice()) if (it.kind === 'ore' || it.kind === 'bar' || it.kind === 'gem') sellItem(G, it); onChange(); draw(); };
  closeOnE(m); draw(); return m;
}

/** Подсумок: что лежит в теле моба. Строка — взять одно, «Забрать всё» или E — всё сразу. */
export function openLoot(G, c, onChange) {
  const m = modal(`<h2>${c.name} <span class="lv">${c.lvl ? 'ур. ' + c.lvl : ''}</span></h2><div class="lst"></div><div class="row"><button class="btn" data-x="close">Закрыть</button><button class="btn main" data-x="all">Забрать всё${T(' <small>(E)</small>', '')}</button></div>`, 'loot');
  m.corpse = c; m.parentElement.classList.add('light');   // подсумок не затемняет мир, стоит слева от героя
  const draw = () => {
    if (!hasLoot(c)) { m.close(); return; }
    const L = m.querySelector('.lst'); L.innerHTML = '';
    if (c.money > 0) { const b = el('button', 'lrow', `<span class="cic">${moneyIcon()}</span><span class="nm2">${moneyHtml(c.money)}</span>`); b.onclick = () => { lootTake(G, c, -1); onChange(); draw(); }; L.append(b); }
    c.items.forEach((it, i) => {
      const b = el('button', 'lrow', `<span class="cic">${anyIcon(it, 38)}${upMark(it, G)}</span><span class="nm2" style="color:${RAR_COL[it.rar]}">${it.name}</span>`);
      hov(b, e => tip(e, it, G));
      b.onclick = () => { hideTip(); lootTake(G, c, i); onChange(); draw(); }; L.append(b);
    });
  };
  const all = () => { hideTip(); lootTake(G, c); onChange(); draw(); };
  m.querySelector('[data-x=all]').onclick = all;
  m.querySelector('[data-x=close]').onclick = () => m.close();
  const onKey = e => { if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); e.stopPropagation(); all(); } };
  addEventListener('keydown', onKey, true);
  m.onclose = () => { hideTip(); removeEventListener('keydown', onKey, true); };
  draw(); return m;
}
/** Гильдия рудокопов: выучить горное дело, купить кирку, узнать о навыке; отсюда же — плавильня. */
export function openGuild(G, onChange) {
  const m = modal(`<h2>Гильдия рудокопов</h2><p class="who">Старшина Гордей: «Руда, путник, сама в руки не идёт. Ищи жилы у скал да на пригорках — блестят на солнце. Кто копает, тот и богатеет».</p><div class="gl"></div><div class="row"><button class="btn" data-x="smelt">Плавильня</button><button class="btn main" data-x="close">Закрыть</button></div>`, 'wide');
  const draw = () => {
    const h = G.hero, sk = miningSkill(h), L = m.querySelector('.gl');
    const leg = ['orange', 'yellow', 'green', 'gray'].map(c => `<span style="color:${MINE.colorHex[c]}">●</span> ${{ orange: 'оранжевая — навык растёт всегда', yellow: 'жёлтая — часто', green: 'зелёная — редко', gray: 'серая — не растёт' }[c]}`).join('<br>');
    L.innerHTML = `<div class="ware2">${accIcon('pickaxe', 'common', 44)}<div><b>Горное дело</b><small>${sk ? `Навык: ${sk} / ${MINE.cap}` : 'Не изучено. Учу бесплатно.'}</small></div><button class="btn" data-x="learn" ${sk ? 'disabled' : ''}>${sk ? 'Изучено' : 'Выучить'}</button></div>
      <div class="ware2">${accIcon('pickaxe', 'common', 44)}<div><b>Кирка рудокопа</b><small>${hasPick(h) ? 'У вас уже есть' : 'Без неё жилу не выкопать'}</small></div><button class="btn" data-x="pick" ${hasPick(h) ? 'disabled' : ''}>${moneyHtml(MINE.pickPrice)}</button></div>
      <table class="ores"><tr><th>Руда</th><th>Где</th><th>Нужно</th><th>Сейчас</th></tr>${Object.values(ORES).map(O => { const c = sk ? veinColor(sk, O.req).c : 'none'; return `<tr><td>${O.ore}</td><td>${O.where || (O.req < 50 ? 'Сосновый дол' : 'Хуторские угодья')}</td><td>${O.req}</td><td style="color:${MINE.colorHex[c] || '#a89878'}">${{ none: 'не изучено', red: 'рано', orange: 'оранжевая', yellow: 'жёлтая', green: 'зелёная', gray: 'серая' }[c]}</td></tr>`; }).join('')}</table>
      <p class="hint">Цвет жилы: ${leg}<br>${T('Подойдите к жиле и нажмите E — 3 секунды копать.', 'Коснитесь жилы — герой подойдёт и будет копать 3 секунды.')} Удар врага прерывает. Выкопанная жила появится через 5–10 минут в другом месте.</p>`;
    L.querySelector('[data-x=learn]').onclick = () => { learnMining(G); onChange(); draw(); };
    L.querySelector('[data-x=pick]').onclick = () => { buyPick(G); onChange(); draw(); };
  };
  m.querySelector('[data-x=close]').onclick = () => m.close();
  m.querySelector('[data-x=smelt]').onclick = () => { m.close(); openSmelt(G, onChange); };
  closeOnE(m); draw(); return m;
}

/** Плавильня: 2 руды → 1 слиток. В кузнице Столицы, в Гильдии рудокопов и в кузне Хутора Подгорного. */
export function openSmelt(G, onChange) {
  const m = modal(`<h2>Плавильня</h2><div class="sm"></div><p class="hint">Слиток стоит дороже двух руд. Позже из слитков будет ковать кузнец.${T(' Закрыть — E или Esc.', '')}</p>`, 'wide');
  const draw = () => {
    const h = G.hero, sk = miningSkill(h), L = m.querySelector('.sm'); L.innerHTML = '';
    for (const [k, O] of Object.entries(ORES)) {
      const have = countOf(h, 'ore', k), n = Math.floor(have / MINE.smelt), ok = sk >= O.req;
      const r = el('div', 'ware2', `${accIcon('bar_' + k, 'common', 44)}<div><b>${O.bar}</b><small>${MINE.smelt} × ${O.ore.toLowerCase()} · у вас ${have} · слиток ${moneyHtml(O.barP)}, руда ${moneyHtml(O.oreP)}${ok ? '' : ` · нужно горное дело ${O.req}`}</small></div><button class="btn" data-x="one" ${ok && n ? '' : 'disabled'}>Переплавить</button><button class="btn" data-x="all" ${ok && n ? '' : 'disabled'}>Всё (${n})</button>`);
      r.querySelector('[data-x=one]').onclick = () => { smelt(G, k, 1); onChange(); draw(); };
      r.querySelector('[data-x=all]').onclick = () => { smelt(G, k, 999); onChange(); draw(); };
      L.append(r);
    }
    if (!sk) L.append(el('p', 'hint', 'Сначала выучите горное дело в Гильдии рудокопов.'));
  };
  closeOnE(m); draw(); return m;
}

const moneyIcon = () => `<svg viewBox="0 0 32 32" width="34" height="34"><ellipse cx="16" cy="24" rx="11" ry="4" fill="#c4703a" stroke="#24180f"/><ellipse cx="14" cy="19" rx="11" ry="4" fill="#cfd6dc" stroke="#24180f"/><ellipse cx="17" cy="13" rx="11" ry="4" fill="#f2c037" stroke="#24180f"/><ellipse cx="15" cy="12" rx="4" ry="1.2" fill="#fff6c0"/></svg>`;

/** Развитие героя (v73): умения (с живым образцом ▶), таланты на 10/15/20 уровне, сброс у наставника. opts.mentor — окно открыто у наставника. */
export function openAbils(G, opts = {}) {
  const h = G.hero, C = CLASSES[h.cls], L = lookOf(h);
  let ask = null, stop = null, pop = null, pinned = null;
  const AB = abilsOf(h), byId = id => AB.find(a => a.id === id);
  const img = (A, cls = '') => `<img class="aic ${cls}" src="${iconUrl(A.icon, A.key === 'passive')}" alt="">`;
  const keyTag = A => A.key === 'passive' ? '<span class="kk p">пассивное</span>' : `<span class="kk">${T(A.key, 'кнопка')}</span>`;
  const play = id => `<button class="play" data-p="${id}" title="Показать">▶</button>`;
  const m = modal('', 'dev');
  const draw = () => {
    const rows = talentRows(h), free = talentFree(h), got = Object.keys(h.talents || {}).length, open = rows.filter(r => h.lvl >= r.lvl).length;
    const abil = A => { const on = h.lvl >= A.lvl; return `<div class="dab${on ? '' : ' locked'}"><span class="ic" data-p="${A.id}">${img(A)}${on ? '' : `<i class="lk">${A.lvl}</i>`}</span><div><b>${A.name}</b>${keyTag(A)}${on ? '' : ` <span class="lv">с ${A.lvl}-го уровня</span>`}<p>${A.d}</p>${A.cd ? `<small>Перезарядка ${A.cd} с</small>` : ''}</div>${play(A.id)}</div>`; };
    const atk = `<div class="dab"><span class="ic">${`<img class="aic" src="${iconUrl('atk_' + h.cls)}" alt="">`}</span><div><b>Обычный удар</b><span class="kk">${T('Пробел', 'кнопка')}</span><p>${h.eq.weapon ? T('Пробел один раз — герой сам бьёт выбранную цель, пока она жива. Держите — бьёт ближайших.', 'Коснитесь врага или кнопки удара — герой сам бьёт цель, пока она жива.') : 'Оружие снято — герой бьёт кулаками, слабо и только вплотную.'}</p></div></div>`;
    const tal = r => { const rowOn = h.lvl >= r.lvl, pick = (h.talents || {})[r.lvl];
      return `<div class="trow${rowOn ? '' : ' locked'}"><div class="tl">${r.lvl}<small>ур.</small></div>${r.opts.map(o => { const A = byId(o.ab), on = pick === o.id, off = pick && !on;
        return `<div class="tal${on ? ' on' : ''}${off ? ' off' : ''}${rowOn && !pick ? ' can' : ''}" data-r="${r.lvl}" data-o="${o.id}"><span class="ic" data-p="${A.id}">${img(A)}</span><div><b>${o.name}</b><p>${o.d}</p></div>${play(A.id)}</div>`; }).join('')}</div>${ask && ask.r === r.lvl ? `<div class="ask">Взять «${r.opts.find(o => o.id === ask.o).name}»? Сменить потом можно только у наставника в Столице за деньги. <button class="btn main" data-a="yes">Взять</button><button class="btn" data-a="no">Отмена</button></div>` : ''}`; };
    const price = resetPrice(h);
    const reset = opts.mentor ? `<div class="mentor"><b>Наставник Ратибор:</b> «Передумал? Забудем выученное — за ${moneyHtml(price)}.» ${got ? `<button class="btn" data-x="reset">Сбросить таланты</button>` : '<span class="dim">Сбрасывать пока нечего.</span>'}</div>` : `<p class="hint">Сбросить таланты можно у наставника в Столице (дом у западной стены) — сейчас это стоит ${moneyHtml(price)}.</p>`;
    m.innerHTML = `<h2>Развитие героя</h2><p class="sub">${h.name} · ${C.name.toLowerCase()} · ${h.lvl} уровень${open ? ` · таланты: ${got} из ${open}` : ''}${free ? ` <span class="free">можно выбрать: ${free}</span>` : ''}</p>
      <div class="devgrid"><section><h3>Умения</h3>${atk}${AB.map(abil).join('')}<p class="hint">Ячейки панели внизу можно менять местами: ${T('перетащите кнопку мышью', 'задержите палец на кнопке и ведите')} — клавиша остаётся у ячейки. <button class="btn sm" data-x="barReset" ${JSON.stringify(h.bar || []) === JSON.stringify(DEFAULT_BAR) ? 'disabled' : ''}>Вернуть порядок</button></p></section>
      <section><h3>Таланты</h3><p class="hint">На 10, 15 и 20 уровне — ряд из трёх, берётся один. ▶ — посмотреть умение, которое талант усиливает.</p>${rows.map(tal).join('')}${reset}</section></div>
      <div class="row"><button class="btn main" data-x="ok">Закрыть</button></div>`;
    m.prepend(xbtn);
    m.querySelector('[data-x=ok]').onclick = () => m.close();
    m.querySelector('[data-x=barReset]').onclick = () => { h.bar = DEFAULT_BAR.slice(); toast('Панель — как была', 'good'); opts.onChange && opts.onChange(); draw(); };
    const rb = m.querySelector('[data-x=reset]'); if (rb) rb.onclick = () => { const r = resetTalents(h); if (r === 'gold') toast('Не хватает денег', '', 'gold'); else if (r === 'ok') { toast('Таланты сброшены — выберите заново', 'good'); opts.onChange && opts.onChange(); } ask = null; draw(); };
    m.querySelectorAll('.tal.can').forEach(b => b.onclick = e => { if (e.target.closest('.play') || e.target.closest('.ic')) return; ask = { r: +b.dataset.r, o: b.dataset.o }; draw(); });
    const yes = m.querySelector('[data-a=yes]'); if (yes) yes.onclick = () => { if (chooseTalent(h, ask.r, ask.o)) { toast('Новый талант!', 'good'); opts.onChange && opts.onChange(); } ask = null; draw(); };
    const no = m.querySelector('[data-a=no]'); if (no) no.onclick = () => { ask = null; draw(); };
    // образец умения: наведение мыши — показать; касание — показать/спрятать
    m.querySelectorAll('[data-p]').forEach(b => { const id = b.dataset.p; if (!hasPreview(id)) { if (b.classList.contains('play')) b.remove(); return; }
      if (!TOUCH) { b.onmouseenter = () => show(id, b); b.onmouseleave = () => { if (pinned !== b) hide(); }; b.onclick = e => { e.stopPropagation(); if (pinned === b) { pinned = null; hide(); } else { pinned = b; show(id, b); } }; }
      else b.onclick = e => { e.stopPropagation(); if (pinned === b) { pinned = null; hide(); } else { pinned = b; show(id, b); } }; });
  };
  const xbtn = m.querySelector('.xclose');
  function show(id, anchor) {
    hide(); const A = byId(id);
    pop = el('div', 'abpop', `<b>${A.name}</b><canvas width="${SW * 2}" height="${SH * 2}"></canvas><small>${A.key === 'passive' ? 'Пассивное — работает само' : T('Клавиша ' + A.key, 'Кнопка справа')}</small>`);
    document.body.append(pop); stop = playPreview(pop.querySelector('canvas'), id, L);
    const r = anchor.getBoundingClientRect(), w = pop.offsetWidth, hh = pop.offsetHeight;
    let x = r.right + 10, y = r.top + r.height / 2 - hh / 2; if (x + w > innerWidth - 6) x = r.left - w - 10; if (x < 6) x = Math.max(6, (innerWidth - w) / 2);
    pop.style.left = x + 'px'; pop.style.top = Math.max(6, Math.min(innerHeight - hh - 6, y)) + 'px';
    if (TOUCH) pop.onclick = () => { pinned = null; hide(); };
  }
  function hide() { if (stop) stop(); stop = null; if (pop) pop.remove(); pop = null; }
  const oc = m.onclose; m.onclose = () => { hide(); oc && oc(); };
  m.addEventListener('scroll', () => { pinned = null; hide(); }, { passive: true });
  draw();
  return m;
}

/** Меню по Esc: звук, громкость, выход к выбору героя. */
export function openMenu({ onExit, inGame }) {
  const s = soundState();
  const m = modal(`<h2>Меню</h2>
    <label class="tgl"><input type="checkbox" ${s.on ? 'checked' : ''}> Звук</label>
    ${[['m', 'Музыка'], ['a', 'Шум города'], ['f', 'Звуки']].map(([k, n]) => `<label class="vol">${n}<input type="range" min="0" max="1" step="0.05" value="${s.vol[k]}" data-k="${k}"></label>`).join('')}
    <div class="keys"><h3>Управление</h3>${TOUCH ? '<p>Ведите пальцем в левой части экрана — идти · коснитесь земли — идти туда · коснитесь врага — бить его · коснитесь тела, жилы, торговца или дороги — герой подойдёт и сделает сам · кнопки справа — удар, умения, зелье, отдых · портрет героя — развитие и таланты · два пальца — ближе и дальше</p>' : `<p><b>WASD</b> или стрелки — ходить · <b>Пробел</b> — автоатака (держать — бить ближайших) · <b>C</b>, <b>V</b>, <b>R</b>, <b>F</b> — умения (открываются на 1, 5, 10 и 20 уровне) · щелчок по портрету — развитие героя и таланты · <b>X</b> — сесть отдохнуть · <b>Q</b> — зелье · <b>E</b> — обыскать тело, говорить, торговать · <b>K</b> — карта · <b>Tab</b> — ближайшая цель · <b>I</b> или <b>B</b> — персонаж и сумка · клик по врагу — выбрать цель · клик по телу, жиле, торговцу — подойти и сделать · колесо мыши, + и − — ближе и дальше</p>`}</div>
    ${installHtml()}
    <div class="row">${inGame ? '<button class="btn" data-x="exit">Выйти к выбору героя</button>' : ''}<button class="btn main" data-x="ok">Продолжить</button></div>`);
  m.querySelector('.tgl input').onchange = e => setSound(e.target.checked);
  m.querySelectorAll('.vol input').forEach(r => r.oninput = () => setVol(r.dataset.k, +r.value));
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  const ex = m.querySelector('[data-x=exit]'); if (ex) ex.onclick = () => { m.close(); onExit(); };
  bindInstall(m);
  return m;
}

/** Гибель: возрождение у кладбища. */
export function showDeath(G, onDone) {
  const gy = G.W.graveyard, where = gy.fire ? `к костру в Преддверии храма` : gy.hidden ? `к Стоянке купца` : G.W.cap ? `к кладбищу у Столицы` : `к кладбищу у ${G.W.town ? G.W.town.name.replace(/^Хутор /, 'Хутора ') : 'посёлка'}`;
  const m = modal(`<h2>Вы погибли</h2><p>Дух уносит вас ${where}. Вещи и золото при вас, но первые 30 секунд удары слабее.</p><div class="row"><button class="btn main" data-x="ok">${gy.fire ? 'Возродиться у костра' : 'Возродиться у кладбища'}</button></div>`, 'death');
  m.querySelector('[data-x=ok]').onclick = () => { m.close(); };
  m.onclose = () => { respawnHero(G); onDone(); };
  return m;
}

// телефон: пояснение к характеристике закрывается касанием в любом другом месте
if (TOUCH && typeof addEventListener !== 'undefined') addEventListener('pointerdown', e => { if (!(e.target.closest && e.target.closest('.si'))) hideTip(); }, true);

/** Профессии (v84): кнопка P — вкладки по выученным профессиям. opts.teach — у травницы (учит травничество и алхимию), opts.brew — рядом котёл (можно варить), opts.tab — какую открыть. */
export function openProf(G, onChange, opts = {}) {
  const h = G.hero, COLN = { none: 'не изучено', red: 'рано', orange: 'оранжевая', yellow: 'жёлтая', green: 'зелёная', gray: 'серая' };
  const who = opts.teach ? `<p class="who">Травница Агафья: «Трава, путник, растёт у всякой тропы — только знать надо, какую рвать. А выучишься варить — сам себе и лекарь, и силач».</p>` : opts.brew ? `<p class="who">Котёл кипит — можно варить зелья.</p>` : '';
  const m = modal(`<h2>Профессии</h2>${who}<div class="learn"></div><div class="tabs"></div><div class="pbody"></div>`, 'wide profwin');
  let tab = opts.tab || null;
  const skbar = (n, sk, cap) => `<div class="skillb"><div class="skrow"><span>${n}</span><span>${sk} / ${cap}</span></div><div class="skbar"><i style="width:${sk / cap * 100}%"></i></div></div>`;
  const leg = `<p class="hint">Цвет: ${['orange', 'yellow', 'green', 'gray'].map(c => `<span style="color:${MINE.colorHex[c]}">●</span> ${{ orange: 'оранжевый — навык растёт всегда', yellow: 'жёлтый — часто', green: 'зелёный — редко', gray: 'серый — не растёт' }[c]}`).join(', ')}.</p>`;
  const draw = () => {
    const sm = miningSkill(h), sh = herbSkill(h), sa = alchSkill(h);
    const L = m.querySelector('.learn'); L.innerHTML = '';
    if (opts.teach && !(TOUCH && sh && sa)) {
      for (const [id, n, sk, fn, d] of [['herbal', 'Травничество', sh, learnHerbal, 'Собирать травы у троп и опушек. Учу бесплатно.'], ['alchemy', 'Алхимия', sa, learnAlchemy, 'Варить зелья из трав и склянок. Учу бесплатно.']]) {
        const r = el('div', 'ware2', `${id === 'herbal' ? accIcon('herb_silverleaf', 'common', 44) : potionIcon('strength', 'common', 44)}<div><b>${n}</b><small>${sk ? `Навык: ${sk} / 150` : d}</small></div><button class="btn" ${sk ? 'disabled' : ''}>${sk ? 'Изучено' : 'Выучить'}</button>`);
        r.querySelector('.btn').onclick = () => { fn(G); onChange(); draw(); }; L.append(r);
      }
    }
    const tabs = [['mining', 'Горное дело', sm], ['herbal', 'Травничество', sh], ['alchemy', 'Алхимия', sa]].filter(t => t[2]);
    const T_ = m.querySelector('.tabs'), B = m.querySelector('.pbody');
    if (!tabs.length) { T_.innerHTML = ''; B.innerHTML = `<p class="hint">Профессий пока нет. Горное дело учат в Гильдии рудокопов, травничество и алхимию — у травницы (дом у южных ворот Столицы). Профессии — приработок к охоте: руда, травы и зелья.</p>`; return; }
    if (!tab || !tabs.some(t => t[0] === tab)) tab = tabs[0][0];
    T_.innerHTML = tabs.map(t => `<button class="tab ${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]} <span class="c1">${t[2]}</span></button>`).join('');
    for (const b of T_.querySelectorAll('.tab')) b.onclick = () => { tab = b.dataset.t; draw(); };
    B.innerHTML = '';
    if (tab === 'mining') {
      B.innerHTML = skbar('Горное дело', sm, MINE.cap) + `<table class="ores"><tr><th>Руда</th><th>Где</th><th>Нужно</th><th>Сейчас</th></tr>${Object.values(ORES).map(O => { const c = veinColor(sm, O.req).c; return `<tr><td>${O.ore}</td><td>${O.where || 'Сосновый дол'}</td><td>${O.req}</td><td style="color:${MINE.colorHex[c] || '#a89878'}">${COLN[c]}</td></tr>`; }).join('')}</table>` + leg + `<p class="hint">${hasPick(h) ? 'Кирка в сумке.' : 'Кирки нет — её продают в Гильдии рудокопов.'} ${T('Подойдите к жиле и нажмите E — 3 секунды копать.', 'Коснитесь жилы — герой подойдёт и выкопает.')} Плавка 2 руды → слиток — в кузницах и в Гильдии.</p>`;
    } else if (tab === 'herbal') {
      B.innerHTML = skbar('Травничество', sh, HERBAL.cap) + `<table class="ores"><tr><th>Трава</th><th>Где</th><th>Нужно</th><th>Сейчас</th><th>В сумке</th></tr>${Object.entries(HERBS).map(([k, Hb]) => { const c = Hb.rare ? 'none' : skillColor(sh, Hb.req).c; return `<tr><td><span style="color:${Hb.col}">●</span> ${Hb.name}</td><td>${Hb.where}</td><td>${Hb.rare ? '—' : Hb.req}</td><td style="color:${MINE.colorHex[c] || '#a89878'}">${Hb.rare ? `${Math.round(HERBAL.rare * 100)}% с любой` : COLN[c]}</td><td>${countOf(h, 'herb', k)}</td></tr>`; }).join('')}</table>` + leg + `<p class="hint">Травы растут кустиками у троп, опушек и во мху — на карте не отмечены, ищите по пути: серебристая искорка видна издалека. ${T('Подойдите и нажмите E — 2 секунды собирать.', 'Коснитесь куста — герой подойдёт и соберёт.')} Собранный куст вырастает через 4–8 минут в другом месте. Инструмент не нужен.</p>`;
    } else {
      const fl = countOf(h, 'flask', 'flask');
      B.innerHTML = skbar('Алхимия', sa, ALCH.cap) + `<p class="hint2">Склянок в сумке: <b>${fl}</b> — продают все торговцы по ${moneyHtml(ALCH.flaskPrice)}. ${opts.brew ? 'Котёл рядом — можно варить.' : '<b>Варить можно у котла</b>: у травницы в Столице или в трактире Хутора Подгорного.'} Зелья: боевое и защитное действуют по одному, новое заменяет прежнее.</p><div class="recipes"></div>` + leg;
      const R_ = B.querySelector('.recipes');
      for (const [id, R] of Object.entries(POTIONS)) {
        const c = skillColor(sa, R.req, ALCH.colors).c, n = canBrew(h, id), ok = sa >= R.req && n > 0 && opts.brew;
        const mats = Object.entries(R.mats).map(([hb, k]) => { const have = countOf(h, 'herb', hb); return `<span style="color:${have >= k ? '#9ad87a' : '#e07a6a'}">${k} × ${HERBS[hb].name.toLowerCase()} (${have})</span>`; }).join(', ') + `, <span style="color:${fl ? '#9ad87a' : '#e07a6a'}">склянка</span>`;
        const r = el('div', 'ware2', `${potionIcon(id, R.heal ? 'common' : R.req >= 125 ? 'rare' : R.req >= 50 ? 'good' : 'common', 44)}<div><b style="color:${MINE.colorHex[c] || '#a89878'}">${R.name}</b> <small>${R.heal ? 'лечебное' : KIND_NAME[R.kind]} · алхимия ${R.req}</small><small>${R.d}</small><small>${mats}</small></div><button class="btn" data-x="one" ${ok ? '' : 'disabled'}>Сварить</button><button class="btn" data-x="all" ${ok && n > 1 ? '' : 'disabled'}>Всё (${n})</button>`);
        r.querySelector('[data-x=one]').onclick = () => { brew(G, id, 1); onChange(); draw(); };
        r.querySelector('[data-x=all]').onclick = () => { brew(G, id, 999); onChange(); draw(); };
        R_.append(r);
      }
    }
  };
  m.isProf = true;
  const onKey = e => { if (e.code === 'KeyP' && !e.repeat) { e.preventDefault(); e.stopPropagation(); m.close(); } };
  addEventListener('keydown', onKey, true);
  const oc = () => removeEventListener('keydown', onKey, true);
  if (opts.teach || opts.brew) closeOnE(m, oc); else m.onclose = () => { hideTip(); oc(); };
  draw(); return m;
}

/** v90: окно «Подземелья» (J): описание, вход, боссы с отметками, сундуки, время до обновления (идёт в настоящем времени). */
export function openDungeons(G) {
  const H = G.hero;
  const m = modal(`<h2>Подземелья</h2><div class="dgl"></div><div class="row"><button class="btn main" data-x="ok">Закрыть${T(' (J)', '')}</button></div>`, 'wide dgwin');
  const L = m.querySelector('.dgl');
  const draw = () => {
    L.innerHTML = DUNGEONS.map(Z => {
      const S = dgState(H, Z.id), left = dgLeft(H, Z), inside = H.zone === Z.id;
      const bosses = dgBosses(Z).map(b => `<li class="${S.bosses[b.kind] ? 'dead' : ''}">${S.bosses[b.kind] ? '☠' : b.final ? '♛' : '★'} ${b.name}${b.final ? ' — главный' : ''}${S.bosses[b.kind] ? ' <small>повержен</small>' : ''}</li>`).join('');
      const nCh = ((Z.decor && Z.decor.chests) || []).length, opened = Object.keys(S.chests).length;
      const any = Object.keys(S.bosses).length || opened || Object.keys(H.dead).some(k => k.startsWith(Z.id + ':'));
      const st = inside ? '<b class="ok">Вы внутри</b> — обновление начнётся после выхода' : left == null ? '' : left > 0 ? `Обновится через <b class="tm">${fmtLeft(left)}</b>${any ? ' — можно вернуться и дойти до конца' : ''}` : any && !S.resetAt ? '<b class="ok">Поход начат</b> — убитые не вернутся, пока не выйдете и не пройдёт час' : '<b class="ok">Готово к походу</b> — все залы полны';
      return `<div class="ware2 dg"><div class="dgh"><b>${Z.name}</b> <span class="c1">уровни ${Z.lvl[0]}–${Z.lvl[1]}</span></div><div class="hint2">Вход: ${Z.entry || '—'}</div><p class="hint">${Z.desc || ''}</p><ul class="bosses">${bosses}</ul><div class="hint2">Сундуков открыто: ${opened} из ${nCh} · походов: ${S.runs}</div><div class="dgst">${st}</div></div>`;
    }).join('') || '<p class="hint">Подземелий пока нет.</p>';
  };
  draw(); const iv = setInterval(draw, 1000);
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  const oc = m.onclose; m.onclose = () => { clearInterval(iv); oc && oc(); };
  return m;
}
