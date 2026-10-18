// Окна: «Персонаж» (надетое, сумка, характеристики), «Рынок», меню (Esc), гибель.
import { isHearth, homeSpot, homeOf, hearthLeft, bindHome, startHearth } from '../systems/hearth.js';
import { CLASSES, SLOTS, SLOTS_L, SLOTS_R, SLOT_NAME, MAIN_STAT } from '../../data/classes.js';
import { ORES, MINE, veinColor, GEMS } from '../../data/mining.js';
import { learnMining, buyPick, smelt, countOf, miningSkill, hasPick, insertGem, socketTargets } from '../systems/mining.js';
import { HERBS, HERBAL } from '../../data/herbs.js';
import { POTIONS, ALCH, KIND_NAME } from '../../data/alchemy.js';
import { ENCH, ENCH_MATS, ENCHANTS } from '../../data/enchanting.js';
import { enchSkill, hasRod, learnEnchant, canDisenchant, deOutcome, canEnchant, enchTargets } from '../systems/enchant.js';
import { startCraft, startDeAll } from '../systems/craft.js';

// v112: окно ремесла перерисовывается после каждой сделанной вещи (очередь идёт, пока окно открыто или закрыто)
let craftHook = null;
export function craftRedraw() { if (craftHook) craftHook(); }
const deQueued = (G, it) => !!(G.P.craft && G.P.craft.q.some(j => j.k === 'de' && j.a === it));
function hookCraft(m, fn) { craftHook = fn; const oc = m.onclose; m.onclose = () => { if (craftHook === fn) craftHook = null; oc && oc(); }; }
import { herbSkill, alchSkill, skillColor, learnHerbal, learnAlchemy, buyFlask, brew, canBrew, drinkElixir } from '../systems/herbs.js';
import { RAR_COL, RAR_NAME, LOOT, armorCut, PROPS } from '../../data/balance.js';
import { itemIcon, anyIcon, accIcon, moneyHtml, potionIcon, DE_SVG } from './icons.js';
import { itemLines, itemNums, lookOf, isStackKind, hasSocket, fxListOf } from '../systems/items.js';
import { compareItem } from '../entities/hero.js';
import { stashPut, stashTake, stashMove, stashSwap, stashMaterials, store } from '../systems/bank.js';
import { dropItem, equip, unequip, sellItem, buyPotion, shopStock, buyShop, POTION_PRICE, respawnHero, lootTake, hasLoot, bagMove, abilsOf, buyBack } from '../systems/game.js';
import { ABIL_ICON } from './icons.js';
import { iconUrl } from '../art/abicons.js';
import { playPreview, hasPreview, SW, SH } from './abilpreview.js';
import { talentRows, talentFree, chooseTalent, resetTalents, resetPrice } from '../systems/talents.js';
import { doll } from '../art/body.js';
import { gearFx } from '../art/gearfx.js';
import { $, el, modal, toast, TOUCH, T } from './dom.js';
import { DUNGEONS, dgState, dgLeft, dgBosses, fmtLeft } from '../systems/dungeon.js';
import { MOBS } from '../../data/mobs.js';
import { makeDnD } from './drag.js';
import { DEFAULT_BAR } from '../engine/input.js';
import { NPCS, QUESTS, Q_MAX, qState, qStatus, npcQuests, goalText, goalDone, qReward, qChoice, qAccept, qTurnIn, qAbandon, qTrack } from '../systems/quests.js';
import { NPC_LOOK } from '../art/npc.js';
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
/** v92: вставить камень в вещь — с вопросом (камень насовсем; старый пропадёт). */
function gemConfirm(G, gemIt, target, after) {
  const Gm = GEMS[gemIt.metal], old = target.gem && GEMS[target.gem];
  if (target.gem === gemIt.metal) { toast(`В «${target.name}» уже ${Gm.name}`, '', 'gem'); return; }
  const m = modal(`<h2>Вставить камень?</h2><p><b style="color:${Gm.col}">${Gm.name}</b> → <b style="color:${RAR_COL[target.rar]}">${target.name}</b></p><p class="hint">Камень вставляется насовсем — вынуть его нельзя, можно только заменить другим.${old ? ` Сейчас там <b style="color:${old.col}">${old.name}</b> — он пропадёт.` : ''}</p><div class="row"><button class="btn main" data-x="yes">Вставить</button><button class="btn" data-x="no">Отмена</button></div>`, 'gemask');
  m.querySelector('[data-x=yes]').onclick = () => { m.close(); if (insertGem(G.hero, gemIt, target)) { toast(`${Gm.name} вставлен в «${target.name}»`, 'good', 'gem'); after && after(); } };
  m.querySelector('[data-x=no]').onclick = () => m.close();
}
/** Выбор вещи для камня: все вещи с гнездом (надетые и в сумке). */
function gemPick(G, gemIt, after) {
  const L = socketTargets(G.hero);
  if (!L.length) { toast('Нет вещей с гнездом. Гнездо бывает у синих и фиолетовых вещей, иногда у зелёных: в оружии, шлеме, нагруднике, штанах и шее', '', 'gem'); return; }
  const m = modal(`<h2>Куда вставить ${GEMS[gemIt.metal].name}?</h2><div class="tgs"></div><div class="row"><button class="btn" data-x="no">Отмена</button></div>`, 'gemask');
  const box = m.querySelector('.tgs');
  for (const it of L) { const worn = Object.values(G.hero.eq).includes(it), g = it.gem && GEMS[it.gem]; const r = el('div', 'ware2 tg', `${itemIcon(it, 44)}<div><b style="color:${RAR_COL[it.rar]}">${it.name}</b><small>${worn ? 'надето' : 'в сумке'} · ${g ? `в гнезде ${g.name}` : 'гнездо пустое'}</small></div>`); r.onclick = () => { m.close(); gemConfirm(G, gemIt, it, after); }; box.append(r); }
  m.querySelector('[data-x=no]').onclick = () => m.close();
}
/** v91: выбросить вещь из сумки — зелёные и лучше, а также стопки — с вопросом. */
function throwAsk(G, it, after) {
  const go = () => { dropItem(G, it); after && after(); };
  if (!isStackKind(it) && !['good', 'rare', 'epic'].includes(it.rar)) { go(); return; }
  const m = modal(`<h2>Выбросить?</h2><p><b style="color:${RAR_COL[it.rar] || '#e9dfc8'}">${it.name}${it.n > 1 ? ' ×' + it.n : ''}</b> упадёт мешком на землю — его можно поднять ещё 3 минуты.</p><div class="row"><button class="btn danger" data-x="yes">Выбросить</button><button class="btn main" data-x="no">Оставить</button></div>`, 'throwask');
  m.querySelector('[data-x=yes]').onclick = () => { m.close(); go(); };
  m.querySelector('[data-x=no]').onclick = () => m.close();
}
/** Касание/щелчок по вещи: на компьютере — сразу действие, на телефоне — сначала лист. */
const onItem = (b, G, it, label, fn, worn, extra = []) => { b.onclick = () => { hideTip(); if (TOUCH) itemSheet(G, it, [...(label ? [[label, fn, true]] : []), ...extra], worn); else if (label) fn(); }; };
const pct = v => (v >= 0 ? '+' : '−') + Math.abs(Math.round(v * 1000) / 10).toString().replace('.', ',') + '%';
const num = v => (v > 0 ? '+' : '−') + String(Math.abs(Math.round(v * 10) / 10)).replace('.', ',');
/** Одна карточка вещи (для подсказки). */
function card(it, G, head = '') {
  if (isHearth(it) && G) { const left = hearthLeft(G.hero), mm = Math.floor(left / 60), ss = Math.ceil(left % 60); return `<div class="tcard">${head}<b style="color:${RAR_COL.good}">Камень возвращения</b><small>Всегда при вас · ${T('клавиша H', 'кнопка с камнем вверху')}</small><p>Переносит домой: <b>${homeSpot(G.hero).name}</b>.</p><p>10 секунд — шаг, удар или урон собьют перенос.</p><p class="${left ? '' : 'prop'}">${left ? `Готов через ${mm} мин ${ss} с` : 'Готов'}</p><p class="hint2">Дом меняют у хозяина постоялого двора: в Столице — Постоялый двор и Таверна, в Хуторе Подгорном — Постоялый двор. Перезарядка — 20 минут, идёт и после выхода из игры.</p></div>`; }
  const wrong = it.cls !== G.hero.cls ? `<p class="bad">Не для вашего класса</p>` : '';
  const kind = it.kind === 'ore' ? 'Руда' : it.kind === 'bar' ? 'Слиток' : it.kind === 'gem' ? 'Самоцвет' : it.kind === 'tool' ? 'Инструмент' : it.kind === 'herb' ? 'Трава' : it.kind === 'flask' ? 'Склянка' : it.kind === 'ench' ? 'Материал чар' : it.kind === 'potion' ? `Зелье · ${KIND_NAME[POTIONS[it.metal].kind]}` : `${RAR_NAME[it.rar]} · ${SLOT_NAME[it.slot]}`;
  return `<div class="tcard">${head}<b style="color:${RAR_COL[it.rar]}">${it.name}${it.n > 1 ? ` <span class="cnt">× ${it.n}</span>` : ''}</b><small>${kind}</small>${itemLines(it).map(([k, t, prop, col]) => k === 'sock' ? `<p class="sock${prop ? ' on' : ''}"${col ? ` style="color:${col}"` : ''}>${t}</p>` : k === 'ench' ? `<p class="ench">${t}</p>` : `<p class="${prop ? 'prop' : ''}">${t}</p>`).join('')}${it.slot ? wrong : ''}${it.cost ? `<p class="gold">Купить: ${moneyHtml(it.cost)}</p>` : ''}${it.price && !it.cost ? `<p class="gold">Цена у торговца: ${moneyHtml(it.price * (it.n || 1))}${it.n > 1 ? ` <small>(${moneyHtml(it.price)} за штуку)</small>` : ''}</p>` : ''}</div>`;
}
/** Что изменится, если надеть: построчно и итог. */
function diffHtml(it, G) {
  if (!it.slot) return '';
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
const upMark = (it, G) => { if (!it.slot) return ''; const c = compareItem(G.hero, it); return c && c.up ? '<span class="upmark" title="Лучше надетого">▲</span>' : ''; };
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
  let deMode = false, draw = null;   // v109: режим распыления (компьютер); Esc сперва выключает режим, а не закрывает окно
  const deEsc = e => { if (deMode && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); deMode = false; draw && draw(); } };
  addEventListener('keydown', deEsc, true);
  const m = modal(`<h2>${G.hero.name}</h2><div class="charwin"><div><div class="dollw"><div class="eq eqL"></div><canvas width="340" height="472"></canvas><div class="eq eqR"></div></div><dl class="stats"></dl><div class="skillb"></div></div><div class="bagside"><h3>Сумка <span class="cnt"></span><button class="btn demode" hidden>${DE_SVG}<span>Распылить</span></button></h3><div class="bag"></div><p class="dehint" hidden>Режим распыления: щёлкните вещь — она рассыплется в пыль и осколки. Выйти — снова кнопка или Esc.</p><p class="hint">${T('Нажмите на вещь в сумке — надеть, на надетую — снять. Вещи можно перетаскивать мышью: по ячейкам сумки, на снаряжение и обратно. Выбросить — правый щелчок или вынести вещь за окно (мешок пролежит на земле 3 минуты). Руда и слитки лежат стопками до 20. Закрыть — I, B или Esc.', 'Коснитесь вещи — увидите, что она даёт, сможете надеть, снять или выбросить. Задержите палец на вещи и ведите — переложите в другую ячейку или на снаряжение. Руда и слитки лежат стопками до 20.')}</p></div></div>`, 'wide');
  let dollFx = [];   // v92: живые эффекты героических вещей на кукле
  const cell = (it, extra = '') => el('button', 'cell', it ? anyIcon(it, 44) + (it.n > 1 ? `<span class="n">${it.n}</span>` : '') + extra : '');
  draw = () => {
    const h = G.hero, st = G.st;
    const g = m.querySelector('canvas').getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 170, 236); doll(g, 85, 184, 3.9, 1, lookOf(h), 0.3); dollFx = fxListOf(h);
    for (const [sel, list] of [['.eqL', SLOTS_L], ['.eqR', SLOTS_R]]) {
      const eq = m.querySelector(sel); eq.innerHTML = '';
      for (const s of list) {
        const it = h.eq[s]; const b = it ? cell(it) : el('button', 'cell', `<span class="empty">${SLOT_NAME[s]}</span>`);
        if (it) { hov(b, e => tip(e, it, G, true)); onItem(b, G, it, 'Снять', () => { unequip(G, s); onChange(); draw(); }, true); drag(b, { eq: s }); }
        drop(b, src => { if (src.it && src.it.kind === 'gem' && it && hasSocket(it)) gemConfirm(G, src.it, it, () => { onChange(); draw(); }); else if (src.it && src.it.slot === s) equip(G, src.it); });
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
    { const db = m.querySelector('.demode'), can = enchSkill(h) > 0 && !TOUCH; db.hidden = !can; if (!can) deMode = false; db.disabled = can && !hasRod(h); db.title = hasRod(h) ? 'Распылять вещи по одной' : 'Нужен жезл чародея (Мастерская чар)'; if (!hasRod(h)) deMode = false;
      db.classList.toggle('on', deMode); bag.classList.toggle('deon', deMode); m.querySelector('.dehint').hidden = !deMode;
      db.onclick = () => { deMode = !deMode; hideTip(); draw(); }; }
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), b = cell(it, it ? upMark(it, G) : '');
      if (deMode) { if (it && canDisenchant(h, it)) { b.classList.add(deQueued(G, it) ? 'deq' : 'decan'); hov(b, e => tip(e, it, G)); b.onclick = () => { hideTip(); deAsk(G, it, () => { onChange(); draw(); }); }; } else b.classList.add('deno'); bag.append(b); continue; }
      if (it) { hov(b, e => tip(e, it, G)); onItem(b, G, it, it.slot ? 'Надеть' : it.kind === 'potion' ? 'Выпить' : it.kind === 'gem' ? 'Вставить в вещь' : isHearth(it) ? 'Вернуться домой' : null, () => { if (isHearth(it)) { if (startHearth(G)) m.close(); return; } if (it.kind === 'potion') drinkElixir(G, it); else if (it.kind === 'gem') gemPick(G, it, () => { onChange(); draw(); }); else equip(G, it); onChange(); draw(); }, false, [...(enchSkill(G.hero) && hasRod(G.hero) && canDisenchant(G.hero, it) ? [[`${DE_SVG}Распылить`, () => deAsk(G, it, () => { onChange(); draw(); })]] : []), ...(isHearth(it) ? [] : [['Выбросить', () => throwAsk(G, it, () => { onChange(); draw(); })]])]); drag(b, { it });   // v107: на телефоне — «Распылить»; v109: перенос вещей снова работает
        if (!TOUCH) b.oncontextmenu = e => { e.preventDefault(); hideTip(); throwAsk(G, it, () => { onChange(); draw(); }); }; }   // v91: правый щелчок — выбросить
      drop(b, src => { const cur0 = h.bag.find(x => x.pos === i); if (src.it && src.it.kind === 'gem' && cur0 && cur0 !== src.it && hasSocket(cur0)) { gemConfirm(G, src.it, cur0, () => { onChange(); draw(); }); return; } if (src.it) bagMove(G, src.it, i); else if (src.eq) { const cur = h.bag.find(x => x.pos === i); if (cur && cur.slot === src.eq) equip(G, cur); else if (!cur) unequip(G, src.eq, i); } });
      bag.append(b);
    }
  };
  // перетаскивание (v81: и мышью, и пальцем): из сумки в сумку, на снаряжение и обратно
  const { drag, drop } = makeDnD(() => { onChange(); draw(); });
  drop(m.parentElement, src => { if (src.it) throwAsk(G, src.it, () => { onChange(); draw(); }); }, true);   // v91: вынес вещь из окна на землю — выбросить
  m.isChar = true;
  { const cv = m.querySelector('canvas'); const anim = now => { if (!m.isConnected) return; if (dollFx.length) { const g = cv.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 170, 236); doll(g, 85, 184, 3.9, 1, lookOf(G.hero), 0.3); gearFx(g, dollFx, 85, 184 + 12.6 * 3.9, now / 1000, 37 * 3.9); } requestAnimationFrame(anim); }; requestAnimationFrame(anim); }
  const onKey = e => { if ((e.code === 'KeyI' || e.code === 'KeyB') && !e.repeat) { e.preventDefault(); e.stopPropagation(); m.close(); } };
  addEventListener('keydown', onKey, true);
  m.onclose = () => { hideTip(); removeEventListener('keydown', onKey, true); removeEventListener('keydown', deEsc, true); }; hookCraft(m, () => { onChange(); draw(); }); draw(); return m;
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
    for (const it of h.bag.slice()) { if (!it.slot) continue; const c = compareItem(h, it); if (!c || (h.eq[it.slot] && c.score <= 0)) sellItem(G, it); }
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
      <table class="ores"><tr><th>Руда</th><th>Где</th><th>Нужно</th><th>Сейчас</th></tr>${Object.values(ORES).map(O => { const c = sk ? veinColor(sk, O.req).c : 'none'; return `<tr><td>${O.ore}</td><td>${O.where || (O.req < 50 ? 'Сосновый дол' : 'Хуторские угодья')}</td><td>${O.req}</td><td style="color:${MINE.colorHex[c] || '#6a5a40'}">${{ none: 'не изучено', red: 'рано', orange: 'оранжевая', yellow: 'жёлтая', green: 'зелёная', gray: 'серая' }[c]}</td></tr>`; }).join('')}</table>
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
  const m = modal(`<h2>Плавильня</h2><div class="sm"></div><p class="hint">Каждый слиток — 3 секунды; «Всё» плавит по очереди, шаг или удар прерывает. Слиток стоит дороже двух руд.${T(' Закрыть — E или Esc.', '')}</p>`, 'wide');
  const draw = () => {
    const h = G.hero, sk = miningSkill(h), L = m.querySelector('.sm'); L.innerHTML = '';
    for (const [k, O] of Object.entries(ORES)) {
      const have = countOf(h, 'ore', k), n = Math.floor(have / MINE.smelt), ok = sk >= O.req;
      const r = el('div', 'ware2', `${accIcon('bar_' + k, 'common', 44)}<div><b>${O.bar}</b><small>${MINE.smelt} × ${O.ore.toLowerCase()} · у вас ${have} · слиток ${moneyHtml(O.barP)}, руда ${moneyHtml(O.oreP)}${ok ? '' : ` · нужно горное дело ${O.req}`}</small></div><button class="btn" data-x="one" ${ok && n ? '' : 'disabled'}>Переплавить</button><button class="btn" data-x="all" ${ok && n ? '' : 'disabled'}>Всё (${n})</button>`);
      r.querySelector('[data-x=one]').onclick = () => { startCraft(G, 'smelt', k, 1); onChange(); draw(); };
      r.querySelector('[data-x=all]').onclick = () => { startCraft(G, 'smelt', k, 999); onChange(); draw(); };
      L.append(r);
    }
    if (!sk) L.append(el('p', 'hint', 'Сначала выучите горное дело в Гильдии рудокопов.'));
  };
  closeOnE(m); hookCraft(m, () => { onChange(); draw(); }); draw(); return m;
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

/** v108: постоялый двор — сделать домом для камня возвращения; в трактире Хутора — ещё и котёл. */
export function openInn(G, b, onChange, toBrew) {
  const h = G.hero, cur = homeOf(h), here = cur.zone === G.W.Z.id && cur.b === b.id;
  const m = modal(`<h2>${b.name}</h2><p class="who">Хозяин: «Комната найдётся, путник. Оставишь у нас вещички — камень возвращения приведёт тебя сюда из любой глуши».</p><div class="ware2">${accIcon('hearth', 'good', 44)}<div><b>Сделать домом</b><small>${here ? 'Здесь ваш дом' : `Сейчас дом: ${homeSpot(h).name}`}</small></div><button class="btn main" data-x="bind" ${here ? 'disabled' : ''}>${here ? 'Ваш дом' : 'Остановиться здесь'}</button></div>${b.brew ? `<div class="row"><button class="btn" data-x="brew">Котёл — варить зелья</button></div>` : ''}<p class="hint">Отдых: здоровье здесь восстанавливается быстро.</p><div class="row"><button class="btn" data-x="no">Закрыть</button></div>`, 'throwask');
  m.querySelector('[data-x=bind]').onclick = () => { bindHome(G, b); onChange && onChange(); m.close(); };
  if (b.brew) m.querySelector('[data-x=brew]').onclick = () => { m.close(); setTimeout(() => toBrew && toBrew(), 0); };
  m.querySelector('[data-x=no]').onclick = () => m.close();
  closeOnE(m); return m;
}

// ---------------------------------------------------------------- v107: зачарование — распыление и чары
const MAIN_TO = { warrior: 'к силе', mage: 'к интеллекту', archer: 'к ловкости' };
const fmtN = v => String(v).replace('.', ',');
export function enchBonusText(b, cls) { const P = []; if (b.main) P.push(`+${b.main} ${MAIN_TO[cls] || 'к главной'}`); if (b.stam) P.push(`+${b.stam} к выносливости`); for (const k of ['crit', 'haste', 'regen', 'dodge']) if (b[k]) P.push(`+${fmtN(b[k])}${PROPS[k].unit} ${PROPS[k].name}`); return P.join(', '); }
const deText = it => deOutcome(it).map(([m, a, b, ch]) => `<span style="color:${ENCH_MATS[m].col}">${a === b ? a : a + '–' + b} × ${ENCH_MATS[m].name.toLowerCase()}${ch < 1 ? ` (${Math.round(ch * 100)}%)` : ''}</span>`).join(', ');
/** Распылить с вопросом для синих и фиолетовых. */
export function deAsk(G, it, after) {
  const go = () => { if (startCraft(G, 'de', it)) after && after(); };
  if (it.rar === 'good') { go(); return; }
  const m = modal(`<h2>Распылить?</h2><p><b style="color:${RAR_COL[it.rar]}">${it.name}</b> рассыплется насовсем.</p><p class="hint">Выйдет: ${deText(it)}.${it.ench ? ' Чары на вещи пропадут.' : ''}${it.gem ? ' Камень в гнезде пропадёт.' : ''}</p><div class="row"><button class="btn danger" data-x="yes">Распылить</button><button class="btn main" data-x="no">Оставить</button></div>`, 'throwask');
  m.querySelector('[data-x=yes]').onclick = () => { m.close(); go(); };
  m.querySelector('[data-x=no]').onclick = () => m.close();
}
function enchPick(G, id, after) {
  const R = ENCHANTS[id], L = enchTargets(G.hero, id);
  if (!L.length) { toast(`Нет вещи на место «${SLOT_NAME[R.slot]}» — ни надетой, ни в сумке`, '', 'ench'); return; }
  const m = modal(`<h2>Чары «${R.name}» — на какую вещь?</h2><div class="tgs"></div><div class="row"><button class="btn" data-x="no">Отмена</button></div>`, 'gemask');
  const box = m.querySelector('.tgs');
  for (const it of L) { const worn = Object.values(G.hero.eq).includes(it), cur = it.ench && ENCHANTS[it.ench];
    const r = el('div', 'ware2 tg', `${itemIcon(it, 44)}<div><b style="color:${RAR_COL[it.rar]}">${it.name}</b><small>${worn ? 'надето' : 'в сумке'} · ${cur ? `сейчас чары «${cur.name}» — пропадут` : 'чар нет'}</small></div>`);
    r.onclick = () => { m.close(); if (startCraft(G, 'ench', id, 1, it)) after && after(); }; box.append(r); }
  m.querySelector('[data-x=no]').onclick = () => m.close();
}
function enchTab(G, B, se, redraw, skbar, leg) {
  const h = G.hero, rod = hasRod(h), C_ = { orange: '#ff9a40', yellow: '#ffd84a', green: '#5fd35f', gray: '#9a9a9a', red: '#e07a6a' };
  const mats = Object.keys(ENCH_MATS).map(k => `<span class="emat">${accIcon('ench_' + k, ENCH_MATS[k].rar, 30)}<b>${countOf(h, 'ench', k)}</b></span>`).join('');
  B.innerHTML = skbar('Зачарование', se, ENCH.cap) + `<p class="hint2">${rod ? 'Жезл чародея в сумке.' : `<b style="color:#e07a6a">Нет жезла чародея</b> — его делают в Мастерской чар из ${ENCH.rodBars} медных слитков.`} Распылять и зачаровывать можно где угодно.</p><div class="emats">${mats}</div><h3>Распыление</h3><div class="detools"></div><div class="delist"></div><h3>Чары</h3><div class="recipes"></div>` + leg;
  const items = h.bag.filter(it => canDisenchant(h, it)).sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0)), D = B.querySelector('.delist'), greens = items.filter(it => it.rar === 'good').length;
  const tools = B.querySelector('.detools');
  if (greens > 1) { const b = el('button', 'btn', `Распылить все зелёные (${greens})`); b.disabled = !rod; b.onclick = () => { const m = modal(`<h2>Распылить все зелёные?</h2><p>${greens} зелёных вещей из сумки рассыплются насовсем. Надетые, синие и фиолетовые не тронутся.</p><div class="row"><button class="btn danger" data-x="yes">Распылить</button><button class="btn main" data-x="no">Оставить</button></div>`, 'throwask'); m.querySelector('[data-x=yes]').onclick = () => { m.close(); startDeAll(G, G.hero.bag.filter(x => x.rar === 'good')); redraw(); }; m.querySelector('[data-x=no]').onclick = () => m.close(); }; tools.append(b); }
  if (!items.length) D.innerHTML = `<p class="hint">В сумке нечего распылять: подходят зелёные, синие и фиолетовые вещи. Белые продают торговцу.</p>`;
  for (const it of items) { const r = el('div', 'ware2', `${anyIcon(it, 44)}<div><b style="color:${RAR_COL[it.rar]}">${it.name}</b><small>ур. ${it.ilvl} · выйдет: ${deText(it)}</small></div><button class="btn" ${rod ? '' : 'disabled'}>Распылить</button>`); hov(r.querySelector('.gicon') || r, e => tip(e, it, G)); const qb = r.querySelector('.btn'); if (deQueued(G, it)) { qb.disabled = true; qb.textContent = 'В очереди'; } qb.onclick = () => deAsk(G, it, redraw); D.append(r); }
  const R_ = B.querySelector('.recipes');
  for (const [id, R] of Object.entries(ENCHANTS)) {
    const c = skillColor(se, R.req, ENCH.colors).c, n = canEnchant(h, id), low = se < R.req;
    const mt = Object.entries(R.mats).map(([m, k]) => { const have = countOf(h, 'ench', m); return `<span style="color:${have >= k ? '#9ad87a' : '#e07a6a'}">${k} × ${ENCH_MATS[m].name.toLowerCase()} (${have})</span>`; }).join(', ');
    const r = el('div', 'ware2', `${accIcon(R.mats.crystal ? 'ench_crystal' : Object.keys(R.mats).find(m => m.startsWith('shard')) ? 'ench_' + Object.keys(R.mats).find(m => m.startsWith('shard')) : 'ench_' + Object.keys(R.mats)[0], 'common', 44)}<div><b style="color:${C_[c] || '#a89878'}">${R.name}</b> <small>${SLOT_NAME[R.slot]} · зачарование ${R.req}</small><small>${enchBonusText(R.bonus, h.cls)}</small><small>${mt}</small></div>${low ? `<div class="need">Нужно зачарование <b>${R.req}</b><br><small>у вас <b class="bad">${se}</b></small></div>` : `<button class="btn" ${n > 0 && rod ? '' : 'disabled'}>Наложить</button>`}`);
    if (!low) r.querySelector('.btn').onclick = () => enchPick(G, id, redraw);
    R_.append(r);
  }
}

/** Профессии (v84): кнопка P — вкладки по выученным профессиям. opts.teach — у травницы (учит травничество и алхимию), opts.brew — рядом котёл (можно варить), opts.tab — какую открыть. */
export function openProf(G, onChange, opts = {}) {
  const h = G.hero, COLN = { none: 'не изучено', red: 'рано', orange: 'оранжевая', yellow: 'жёлтая', green: 'зелёная', gray: 'серая' };
  const who = opts.teachEnch ? `<p class="who">Чародейка Велена: «Старый меч, что пылится в сумке, — это не хлам, а пыль сияния. Развей его — и вложи силу в тот клинок, что у тебя в руке».</p>` : opts.teach ? `<p class="who">Травница Агафья: «Трава, путник, растёт у всякой тропы — только знать надо, какую рвать. А выучишься варить — сам себе и лекарь, и силач».</p>` : opts.brew ? `<p class="who">Котёл кипит — можно варить зелья.</p>` : '';
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
    const se = enchSkill(h);
    if (opts.teachEnch) {   // v107: Мастерская чар — учит зачарованию и делает жезл
      const r = el('div', 'ware2', `${accIcon('ench_dust1', 'common', 44)}<div><b>Зачарование</b><small>${se ? `Навык: ${se} / ${ENCH.cap}` : 'Распылять ненужные вещи на пыль и осколки и накладывать чары на снаряжение. Учу бесплатно.'}</small></div><button class="btn" ${se ? 'disabled' : ''}>${se ? 'Изучено' : 'Выучить'}</button>`);
      r.querySelector('.btn').onclick = () => { learnEnchant(G); onChange(); draw(); }; L.append(r);
      const bars = countOf(h, 'bar', 'copper'), rod = hasRod(h);
      const q = el('div', 'ware2', `${accIcon('rod', 'common', 44)}<div><b>Медный жезл чародея</b><small>${rod ? 'У вас уже есть' : `Без него не распылить и не зачаровать. Из ${ENCH.rodBars} медных слитков — у вас <b style="color:${bars >= ENCH.rodBars ? '#9ad87a' : '#e07a6a'}">${bars}</b>`}</small></div><button class="btn" ${rod || bars < ENCH.rodBars ? 'disabled' : ''}>${rod ? 'Есть' : 'Сделать'}</button>`);
      q.querySelector('.btn').onclick = () => { startCraft(G, 'rod', null); onChange(); draw(); }; L.append(q);
    }
    const tabs = [['mining', 'Горное дело', sm], ['herbal', 'Травничество', sh], ['alchemy', 'Алхимия', sa], ['enchant', 'Зачарование', se]].filter(t => t[2]);
    const T_ = m.querySelector('.tabs'), B = m.querySelector('.pbody');
    if (!tabs.length) { T_.innerHTML = ''; B.innerHTML = `<p class="hint">Профессий пока нет. Горное дело учат в Гильдии рудокопов, травничество и алхимию — у травницы (дом у южных ворот Столицы), зачарование — в Мастерской чар. Профессии — приработок к охоте: руда, травы и зелья.</p>`; return; }
    if (!tab || !tabs.some(t => t[0] === tab)) tab = tabs[0][0];
    T_.innerHTML = tabs.map(t => `<button class="tab ${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]} <span class="c1">${t[2]}</span></button>`).join('');
    for (const b of T_.querySelectorAll('.tab')) b.onclick = () => { tab = b.dataset.t; draw(); };
    B.innerHTML = '';
    if (tab === 'mining') {
      B.innerHTML = skbar('Горное дело', sm, MINE.cap) + `<table class="ores"><tr><th>Руда</th><th>Где</th><th>Нужно</th><th>Сейчас</th></tr>${Object.values(ORES).map(O => { const c = veinColor(sm, O.req).c; return `<tr><td>${O.ore}</td><td>${O.where || 'Сосновый дол'}</td><td>${O.req}</td><td style="color:${MINE.colorHex[c] || '#6a5a40'}">${COLN[c]}</td></tr>`; }).join('')}</table>` + leg + `<p class="hint">${hasPick(h) ? 'Кирка в сумке.' : 'Кирки нет — её продают в Гильдии рудокопов.'} ${T('Подойдите к жиле и нажмите E — 3 секунды копать.', 'Коснитесь жилы — герой подойдёт и выкопает.')} Плавка 2 руды → слиток — в кузницах и в Гильдии.</p>`;
    } else if (tab === 'herbal') {
      B.innerHTML = skbar('Травничество', sh, HERBAL.cap) + `<table class="ores"><tr><th>Трава</th><th>Где</th><th>Нужно</th><th>Сейчас</th><th>В сумке</th></tr>${Object.entries(HERBS).map(([k, Hb]) => { const c = Hb.rare ? 'none' : skillColor(sh, Hb.req).c; return `<tr><td><span style="color:${Hb.col}">●</span> ${Hb.name}</td><td>${Hb.where}</td><td>${Hb.rare ? '—' : Hb.req}</td><td style="color:${MINE.colorHex[c] || '#6a5a40'}">${Hb.rare ? `${Math.round(HERBAL.rare * 100)}% с любой` : COLN[c]}</td><td>${countOf(h, 'herb', k)}</td></tr>`; }).join('')}</table>` + leg + `<p class="hint">Травы растут кустиками у троп, опушек и во мху — на карте не отмечены, ищите по пути: серебристая искорка видна издалека. ${T('Подойдите и нажмите E — 2 секунды собирать.', 'Коснитесь куста — герой подойдёт и соберёт.')} Собранный куст вырастает через 4–8 минут в другом месте. Инструмент не нужен.</p>`;
    } else if (tab === 'enchant') { enchTab(G, B, se, () => { onChange(); draw(); }, skbar, leg); 
    } else {
      const fl = countOf(h, 'flask', 'flask');
      B.innerHTML = skbar('Алхимия', sa, ALCH.cap) + `<p class="hint2">Склянок в сумке: <b>${fl}</b> — продают все торговцы по ${moneyHtml(ALCH.flaskPrice)}. ${opts.brew ? 'Котёл рядом — можно варить.' : '<b>Варить можно у котла</b>: у травницы в Столице или в трактире Хутора Подгорного.'} Зелья: боевое и защитное действуют по одному, новое заменяет прежнее.</p><div class="recipes"></div>` + leg;
      const R_ = B.querySelector('.recipes');
      for (const [id, R] of Object.entries(POTIONS)) {
        const c = skillColor(sa, R.req, ALCH.colors).c, n = canBrew(h, id), ok = sa >= R.req && n > 0 && opts.brew;
        const mats = Object.entries(R.mats).map(([hb, k]) => { const have = countOf(h, 'herb', hb); return `<span style="color:${have >= k ? '#9ad87a' : '#e07a6a'}">${k} × ${HERBS[hb].name.toLowerCase()} (${have})</span>`; }).join(', ') + `, <span style="color:${fl ? '#9ad87a' : '#e07a6a'}">склянка</span>`;
        const low = sa < R.req;   // v91: не хватает навыка — пишем прямо, вместо серых кнопок
        const r = el('div', 'ware2', `${potionIcon(id, R.heal ? 'common' : R.req >= 125 ? 'rare' : R.req >= 50 ? 'good' : 'common', 44)}<div><b style="color:${MINE.colorHex[c] || '#a89878'}">${R.name}</b> <small>${R.heal ? 'лечебное' : KIND_NAME[R.kind]} · алхимия ${R.req}</small><small>${R.d}</small><small>${mats}</small></div>${low ? `<div class="need">Нужна алхимия <b>${R.req}</b><br><small>у вас <b class="bad">${sa}</b></small></div>` : `<button class="btn" data-x="one" ${ok ? '' : 'disabled'}>Сварить</button><button class="btn" data-x="all" ${ok && n > 1 ? '' : 'disabled'}>Всё (${n})</button>`}`);
        if (!low) { r.querySelector('[data-x=one]').onclick = () => { startCraft(G, 'brew', id, 1); onChange(); draw(); }; r.querySelector('[data-x=all]').onclick = () => { startCraft(G, 'brew', id, 999); onChange(); draw(); }; }
        R_.append(r);
      }
    }
  };
  m.isProf = true;
  const onKey = e => { if (e.code === 'KeyP' && !e.repeat) { e.preventDefault(); e.stopPropagation(); m.close(); } };
  addEventListener('keydown', onKey, true);
  const oc = () => removeEventListener('keydown', onKey, true);
  if (opts.teach || opts.brew || opts.teachEnch) closeOnE(m, oc); else m.onclose = () => { hideTip(); oc(); };
  hookCraft(m, () => { onChange(); draw(); }); draw(); return m;
}

/** v90: окно «Подземелья» (J): описание, вход, боссы с отметками, сундуки, время до обновления (идёт в настоящем времени). */
export function openDungeons(G) {
  const H = G.hero;
  const m = modal(`<h2>Подземелья</h2><div class="dgl"></div><div class="row"><button class="btn main" data-x="ok">Закрыть${T(' (J)', '')}</button></div>`, 'wide dgwin');
  const L = m.querySelector('.dgl');
  // v94: у каждого босса — умения и тактика (раскрываются щелчком); раз в секунду обновляется только строка состояния
  const stOf = Z => {
    const S = dgState(H, Z.id), left = dgLeft(H, Z), inside = H.zone === Z.id, opened = Object.keys(S.chests).length;
    const any = Object.keys(S.bosses).length || opened || Object.keys(H.dead).some(k => k.startsWith(Z.id + ':'));
    return inside ? '<b class="ok">Вы внутри</b> — обновление начнётся после выхода' : left == null ? '' : left > 0 ? `Обновится через <b class="tm">${fmtLeft(left)}</b>${any ? ' — можно вернуться и дойти до конца' : ''}` : any && !S.resetAt ? '<b class="ok">Поход начат</b> — убитые не вернутся, пока не выйдете и не пройдёт час' : '<b class="ok">Готово к походу</b> — все залы полны';
  };
  L.innerHTML = DUNGEONS.map(Z => {
    const S = dgState(H, Z.id), nCh = ((Z.decor && Z.decor.chests) || []).length, opened = Object.keys(S.chests).length;
    const bosses = dgBosses(Z).map(b => { const D = MOBS[b.kind], dead = S.bosses[b.kind];
      return `<li class="${dead ? 'dead' : ''}"><details><summary>${dead ? '☠' : b.final ? '♛' : '★'} ${b.name}${b.final ? ' — главный' : ''}${dead ? ` <small>${D.fem ? 'повержена' : 'повержен'}</small>` : ''} <span class="tac">тактика</span></summary>${D.abil ? `<ul class="abl2">${D.abil.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}${D.tactic ? `<p class="tactic"><b>Как победить:</b> ${D.tactic}</p>` : ''}</details></li>`; }).join('');
    return `<div class="ware2 dg"><div class="dgh"><b>${Z.name}</b> <span class="c1">уровни ${Z.lvl[0]}–${Z.lvl[1]}</span></div><div class="hint2">Вход: ${Z.entry || '—'}</div><p class="hint">${Z.desc || ''}</p><ul class="bosses">${bosses}</ul><div class="hint2">Сундуков открыто: ${opened} из ${nCh} · походов: ${S.runs}</div><div class="dgst" data-z="${Z.id}">${stOf(Z)}</div></div>`;
  }).join('') || '<p class="hint">Подземелий пока нет.</p>';
  const draw = () => { for (const Z of DUNGEONS) { const e = L.querySelector(`.dgst[data-z="${Z.id}"]`); if (e) e.innerHTML = stOf(Z); } };
  const iv = setInterval(draw, 1000);
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  const oc = m.onclose; m.onclose = () => { clearInterval(iv); oc && oc(); };
  return m;
}

// ---------------------------------------------------------------- v95: задания — разговор с жителем и журнал
/** Портрет жителя: голова и плечи в рамке. */
function npcFace(cv, lookKey) {
  const g = cv.getContext('2d'), L = NPC_LOOK[lookKey] || NPC_LOOK.captain;
  g.clearRect(0, 0, cv.width, cv.height); doll(g, cv.width / 2, cv.height * 1.16, cv.width / 26, 1, L, 0.3);   // как портрет героя: голова и плечи
}
const markHtml = st => st === 'ready' ? '<b class="qm gold">?</b>' : st === 'avail' ? '<b class="qm gold">!</b>' : st === 'active' ? '<b class="qm grey">?</b>' : st === 'low' ? '<b class="qm grey">!</b>' : '';
/** Цели задания списком с галочками. */
function goalsHtml(h, id) {
  const st = qStatus(h, id), Q = QUESTS[id];
  return `<ul class="qgoals">${Q.goals.map((g, i) => { const ok = st === 'ready' || st === 'done' || goalDone(h, id, i); const t = st === 'avail' || st === 'low' ? goalText(h, id, i).replace(/: 0\/(\d+)$/, ': $1') : goalText(h, id, i); return `<li class="${ok ? 'ok' : ''}">${ok ? '✔' : '◇'} ${t}</li>`; }).join('')}</ul>`;
}
/** Награда: опыт, деньги, вещи на выбор (выбранная подсвечена). */
function rewardHtml(G, id, pick) {
  const R = qReward(G.hero, id), C = qChoice(G.hero, id);
  return `<div class="qrew"><b>Награда:</b> <span class="xp">${R.xp} опыта</span> · ${moneyHtml(R.money)}${C.length ? `<div class="qch"><small>${pick === undefined ? 'Вещь на выбор:' : 'Выберите одну вещь:'}</small><div class="qitems">${C.map((it, i) => `<div class="cell qit${pick === i ? ' sel' : ''}" data-ci="${i}">${itemIcon(it, 44)}</div>`).join('')}</div></div>` : ''}</div>`;
}
/** Окно разговора с жителем: приветствие и список его заданий; задание — текст, цели, награда, «Взять»/«Сдать». */
export function openNpc(G, npcId, onChange) {
  const h = G.hero, N = NPCS[npcId];
  const m = modal(`<div class="qhead"><canvas class="qface" width="128" height="128"></canvas><div><h2>${N.name}</h2><small>‹${N.title}›</small></div></div><div class="qbody"></div><div class="row qrow"></div>`, 'qwin');
  npcFace(m.querySelector('.qface'), N.look);
  const body = m.querySelector('.qbody'), row = m.querySelector('.qrow');
  const btn = (t, fn, cls = '') => { const b = el('button', 'btn ' + cls, t); b.onclick = fn; row.append(b); return b; };
  const list = () => {
    const r = npcQuests(h, npcId), ids = [...r.turn, ...r.give, ...r.prog.filter(x => !r.turn.includes(x))];
    if (!ids.length && !r.low.length) { body.innerHTML = `<p class="qtext">${N.hi}</p><p class="hint">Заданий у меня пока нет.</p>`; }
    else body.innerHTML = `<p class="qtext">${N.hi}</p><div class="qlist">${ids.map(id => `<div class="ware2 qli" data-q="${id}">${markHtml(qStatus(h, id))}<b>${QUESTS[id].name}</b><small>${qStatus(h, id) === 'ready' ? 'готово — сдать' : qStatus(h, id) === 'active' ? 'в работе' : `задание ур. ${QUESTS[id].lvl || QUESTS[id].min}`}</small></div>`).join('')}${r.low.map(id => `<div class="ware2 qli off">${markHtml('low')}<b>${QUESTS[id].name}</b><small>с ${QUESTS[id].min}-го уровня</small></div>`).join('')}</div>`;
    row.innerHTML = ''; btn('До свидания', () => m.close(), 'main');
    body.querySelectorAll('[data-q]').forEach(b => b.onclick = () => show(b.dataset.q));
    hideTip();
  };
  const show = id => {
    const Q = QUESTS[id], st = qStatus(h, id); let pick = st === 'ready' ? null : undefined; const C = qChoice(h, id);
    const draw = () => {
      const txt = st === 'ready' ? Q.done : st === 'active' ? (Q.prog || Q.text) : Q.text;
      body.innerHTML = `<h3 class="qname">${Q.name}</h3><p class="qtext">${txt}</p>${st === 'ready' ? '' : goalsHtml(h, id)}${rewardHtml(G, id, pick)}`;
      body.querySelectorAll('[data-ci]').forEach(c => { const it = C[+c.dataset.ci]; hov(c, e => tip(e, it, G)); c.onclick = () => { hideTip(); if (st === 'ready') { pick = +c.dataset.ci; draw(); } else if (TOUCH) itemSheet(G, it, []); }; });
      row.innerHTML = '';
      if (st === 'avail') btn('Взять', () => { if (qAccept(G, id)) { onChange && onChange(); list(); } }, 'main');
      if (st === 'ready') { const b = btn('Сдать', () => { if (qTurnIn(G, id, pick)) { onChange && onChange(); list(); } }, 'main'); if (C.length && pick == null) b.disabled = true; }
      btn('Назад', list);
    };
    draw();
  };
  // сразу в задание, если оно одно и его можно взять или сдать
  const r = npcQuests(h, npcId), one = [...r.turn, ...r.give];
  if (one.length === 1 && r.prog.filter(x => !r.turn.includes(x)).length === 0) show(one[0]); else list();
  const oc = m.onclose; m.onclose = () => { hideTip(); oc && oc(); };
  return m;
}
/** Журнал заданий (L): слева список по краям, справа — выбранное: текст, цели, награда, следить, бросить. */
export function openJournal(G, onChange) {
  const h = G.hero, S = qState(h);
  const m = modal(`<h2>Журнал заданий <small class="cnt"></small></h2><div class="jwin"><div class="jlist"></div><div class="jdet"></div></div><div class="row"><button class="btn main" data-x="ok">Закрыть${T(' (L)', '')}</button></div>`, 'wide jwinbox');
  const listEl = m.querySelector('.jlist'), det = m.querySelector('.jdet'); let cur = null;
  const ZN = { pine: 'Сосновый дол', farms: 'Хуторские угодья', shroom: 'Грибной лес', temple: 'Храм квакунов' };
  const draw = () => {
    const ids = Object.keys(S.act); m.querySelector('.cnt').textContent = `${ids.length} из ${Q_MAX}`;
    if (!ids.length) { listEl.innerHTML = `<p class="hint">Заданий нет. Ищите жителей со знаком <b class="qm gold">!</b> над головой — в Столице капитан стражи Гордей у южных ворот.</p>`; det.innerHTML = ''; return; }
    if (!cur || !S.act[cur]) cur = ids[0];
    const byZ = {}; for (const id of ids) (byZ[QUESTS[id].zone] = byZ[QUESTS[id].zone] || []).push(id);
    listEl.innerHTML = Object.entries(byZ).map(([z, L]) => `<h4>${ZN[z] || z}</h4>${L.map(id => `<div class="ware2 jq${id === cur ? ' sel' : ''}" data-q="${id}">${markHtml(qStatus(h, id))}<b>${QUESTS[id].name}</b>${S.track.includes(id) ? '<span class="trk" title="Отслеживается">◉</span>' : ''}</div>`).join('')}`).join('');
    listEl.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { cur = b.dataset.q; draw(); if (TOUCH) det.scrollIntoView({ block: 'start' }); });
    const Q = QUESTS[cur], st = qStatus(h, cur), N = NPCS[Q.turn || Q.giver];
    det.innerHTML = `<h3 class="qname">${Q.name}</h3>${st === 'ready' ? `<p class="qready">Готово! Вернитесь: <b>${N.name}</b>, ${N.title}.</p>` : ''}<p class="qtext">${Q.text}</p>${goalsHtml(h, cur)}${rewardHtml(G, cur)}<div class="row"><button class="btn" data-x="trk">${S.track.includes(cur) ? 'Не следить' : 'Следить'}</button><button class="btn danger" data-x="ab">Бросить</button></div>`;
    det.querySelectorAll('[data-ci]').forEach(c => { const it = qChoice(h, cur)[+c.dataset.ci]; hov(c, e => tip(e, it, G)); c.onclick = () => { hideTip(); if (TOUCH) itemSheet(G, it, []); }; });
    det.querySelector('[data-x=trk]').onclick = () => { qTrack(G, cur); onChange && onChange(); draw(); };
    det.querySelector('[data-x=ab]').onclick = () => { const id = cur, a = modal(`<h2>Бросить задание?</h2><p><b>${QUESTS[id].name}</b> — собранное пропадёт. Взять заново можно у того же жителя.</p><div class="row"><button class="btn danger" data-x="y">Бросить</button><button class="btn main" data-x="n">Оставить</button></div>`, 'throwask'); a.querySelector('[data-x=y]').onclick = () => { a.close(); qAbandon(G, id); onChange && onChange(); draw(); }; a.querySelector('[data-x=n]').onclick = () => a.close(); };
  };
  draw();
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  const onKey = e => { if (e.code === 'KeyL') { e.preventDefault(); e.stopPropagation(); m.close(); } };
  addEventListener('keydown', onKey, true);
  const oc = m.onclose; m.onclose = () => { removeEventListener('keydown', onKey, true); hideTip(); oc && oc(); };
  return m;
}
