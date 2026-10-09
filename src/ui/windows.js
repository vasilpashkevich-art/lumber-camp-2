// Окна: «Персонаж» (надетое, сумка, характеристики), «Рынок», меню (Esc), гибель.
import { CLASSES, SLOTS, SLOTS_L, SLOTS_R, SLOT_NAME, MAIN_STAT } from '../../data/classes.js';
import { ORES, MINE, veinColor } from '../../data/mining.js';
import { learnMining, buyPick, smelt, countOf, miningSkill, hasPick } from '../systems/mining.js';
import { RAR_COL, RAR_NAME, LOOT, armorCut, PROPS } from '../../data/balance.js';
import { itemIcon, anyIcon, accIcon, moneyHtml } from './icons.js';
import { itemLines, itemNums, lookOf } from '../systems/items.js';
import { compareItem } from '../entities/hero.js';
import { equip, unequip, sellItem, buyPotion, shopStock, buyShop, POTION_PRICE, respawnHero, lootTake, hasLoot, bagMove, abilsOf } from '../systems/game.js';
import { ABIL_ICON } from './icons.js';
import { doll } from '../art/body.js';
import { $, el, modal, TOUCH, T } from './dom.js';
import { soundState, setSound, setVol } from '../engine/audio.js';
import { fmt1 } from '../engine/util.js';
import { statRows } from './stathelp.js';

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
  const kind = it.kind === 'ore' ? 'Руда' : it.kind === 'bar' ? 'Слиток' : it.kind === 'gem' ? 'Самоцвет' : it.kind === 'tool' ? 'Инструмент' : `${RAR_NAME[it.rar]} · ${SLOT_NAME[it.slot]}`;
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
  const act = worn ? '<p class="hint2">Нажмите, чтобы снять</p>' : '';
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
  const m = modal(`<h2>${G.hero.name}</h2><div class="charwin"><div><div class="dollw"><div class="eq eqL"></div><canvas width="340" height="472"></canvas><div class="eq eqR"></div></div><dl class="stats"></dl><div class="skillb"></div></div><div class="bagside"><h3>Сумка <span class="cnt"></span></h3><div class="bag"></div><p class="hint">${T('Нажмите на вещь в сумке — надеть, на надетую — снять. Вещи можно перетаскивать мышью: по ячейкам сумки, на снаряжение и обратно. Руда и слитки лежат стопками до 20. Закрыть — I, B или Esc.', 'Коснитесь вещи — увидите, что она даёт, и сможете надеть или снять. Руда и слитки лежат стопками до 20.')}</p></div></div>`, 'wide');
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
    const sk = miningSkill(h);
    m.querySelector('.skillb').innerHTML = sk ? `<div class="skrow"><span>Горное дело</span><span>${sk} / ${MINE.cap}</span></div><div class="skbar"><i style="width:${sk / MINE.cap * 100}%"></i></div>` : `<p class="hint">Горное дело можно выучить в Гильдии рудокопов в Столице.</p>`;
    m.querySelector('.cnt').textContent = `${h.bag.length} / ${LOOT.bag}`;
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), b = cell(it, it ? upMark(it, G) : '');
      if (it) { hov(b, e => tip(e, it, G)); onItem(b, G, it, it.slot ? 'Надеть' : null, () => { equip(G, it); onChange(); draw(); }); drag(b, { it }); }
      drop(b, src => { if (src.it) bagMove(G, src.it, i); else if (src.eq) { const cur = h.bag.find(x => x.pos === i); if (cur && cur.slot === src.eq) equip(G, cur); else if (!cur) unequip(G, src.eq, i); } });
      bag.append(b);
    }
  };
  // перетаскивание мышью: из сумки в сумку, на снаряжение и обратно
  let dragSrc = null;
  const drag = (b, src) => { b.draggable = true; b.ondragstart = e => { hideTip(); dragSrc = src; b.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', 'вещь'); } catch (_) { } }; b.ondragend = () => { b.classList.remove('drag'); dragSrc = null; }; };
  const drop = (b, fn) => { b.ondragover = e => { if (dragSrc) { e.preventDefault(); b.classList.add('over'); } }; b.ondragleave = () => b.classList.remove('over');
    b.ondrop = e => { e.preventDefault(); b.classList.remove('over'); const s = dragSrc; dragSrc = null; if (s) { fn(s); onChange(); draw(); } }; };
  m.isChar = true;
  const onKey = e => { if ((e.code === 'KeyI' || e.code === 'KeyB') && !e.repeat) { e.preventDefault(); e.stopPropagation(); m.close(); } };
  addEventListener('keydown', onKey, true);
  m.onclose = () => { hideTip(); removeEventListener('keydown', onKey, true); }; draw(); return m;
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
  const m = modal(`<h2>${shop ? shop.name : 'Рынок'}</h2><p class="who">${who}</p><div class="vend"><div><h3>Купить</h3><div class="buy"></div></div><div><h3>Продать <small>(${T('нажмите на вещь, цена — в подсказке', 'коснитесь вещи — увидите цену')})</small></h3><div class="bag"></div><div class="row"><button class="btn sellall">Продать всё, что не надеть</button><button class="btn sellore">Продать руду, слитки и камни</button></div></div></div><p class="gold">Деньги: <b></b></p>`, 'wide');
  const draw = () => {
    const h = G.hero, p = POTION_PRICE(h.lvl);
    m.querySelector('.gold b').innerHTML = moneyHtml(h.gold);
    const buy = m.querySelector('.buy'); buy.innerHTML = '';
    const b = el('button', 'ware', `<span class="ic"></span><span><b>Зелье здоровья</b><small>+40% здоровья, снимает яд. У вас: ${h.potions} из 10</small></span><span class="pr">${moneyHtml(p)}</span>`);
    b.querySelector('.ic').innerHTML = `<svg viewBox="0 0 32 32" width="40" height="40"><rect x="13" y="3" width="6" height="6" fill="#c9a06a" stroke="#24180f"/><path d="M12 9h8v4l5 6v6a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-6l5-6z" fill="#e8e0cc" stroke="#24180f"/><path d="M8 19h16v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#d8323a"/></svg>`;
    b.onclick = () => { buyPotion(G); onChange(); draw(); }; buy.append(b);
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
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), c = el('button', 'cell', it ? anyIcon(it, 44) + (it.n > 1 ? `<span class="n">${it.n}</span>` : '') + upMark(it, G) : '');
      if (it) { hov(c, e => tip(e, it, G)); onItem(c, G, it, 'Продать', () => { sellItem(G, it); onChange(); draw(); }); }
      bag.append(c);
    }
  };
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

/** Умения класса: что открыто и что откроется на каком уровне. */
export function openAbils(G) {
  const h = G.hero, C = CLASSES[h.cls];
  const rows = abilsOf(h).map(A => { const open = h.lvl >= A.lvl; return `<div class="abl${open ? '' : ' locked'}"><span class="ic">${ABIL_ICON[A.icon]}</span><div><b>${A.name}</b><span class="kk">${T(A.key, 'кнопка')}</span>${open ? '' : ` <span class="lv">Доступно с ${A.lvl}-го уровня</span>`}<p>${A.d}</p><small>Перезарядка ${A.cd} с</small></div></div>`; }).join('');
  const m = modal(`<h2>Умения: ${C.name.toLowerCase()}</h2><div class="abl"><span class="ic">${ABIL_ICON.attack[h.cls]}</span><div><b>Обычный удар</b><span class="kk">${T('Пробел', 'кнопка')}</span><p>${h.eq.weapon ? T('Нажмите пробел один раз — герой сам бьёт выбранную цель, пока она жива. Держите — бьёт ближайших.', 'Коснитесь врага или кнопки удара — герой сам бьёт цель, пока она жива.') : 'Оружие снято — герой бьёт кулаками, слабо и только вплотную.'}</p></div></div>${rows}<p class="hint">${T('X — сесть и перевести дух: здоровье восстанавливается быстрее, любое движение или удар поднимает. Q — зелье.', 'Кнопка «Сесть» — перевести дух: здоровье восстанавливается быстрее, любое движение или удар поднимает.')}</p><div class="row"><button class="btn main" data-x="ok">Закрыть</button></div>`, 'abils');
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  return m;
}

/** Меню по Esc: звук, громкость, выход к выбору героя. */
export function openMenu({ onExit, inGame }) {
  const s = soundState();
  const m = modal(`<h2>Меню</h2>
    <label class="tgl"><input type="checkbox" ${s.on ? 'checked' : ''}> Звук</label>
    ${[['m', 'Музыка'], ['a', 'Шум города'], ['f', 'Звуки']].map(([k, n]) => `<label class="vol">${n}<input type="range" min="0" max="1" step="0.05" value="${s.vol[k]}" data-k="${k}"></label>`).join('')}
    <div class="keys"><h3>Управление</h3>${TOUCH ? '<p>Ведите пальцем в левой части экрана — идти · коснитесь земли — идти туда · коснитесь врага — бить его · коснитесь тела, жилы, торговца или дороги — герой подойдёт и сделает сам · кнопки справа — удар, умения, зелье, отдых · два пальца — ближе и дальше</p>' : `<p><b>WASD</b> или стрелки — ходить · <b>Пробел</b> — автоатака (держать — бить ближайших) · <b>C</b> и <b>V</b> — умения (второе — с 5-го уровня) · <b>X</b> — сесть отдохнуть · <b>Q</b> — зелье · <b>E</b> — обыскать тело, говорить, торговать · <b>K</b> — карта · <b>Tab</b> — ближайшая цель · <b>I</b> или <b>B</b> — персонаж и сумка · клик по врагу — выбрать цель · клик по телу, жиле, торговцу — подойти и сделать · колесо мыши, + и − — ближе и дальше</p>`}</div>
    <div class="row">${inGame ? '<button class="btn" data-x="exit">Выйти к выбору героя</button>' : ''}<button class="btn main" data-x="ok">Продолжить</button></div>`);
  m.querySelector('.tgl input').onchange = e => setSound(e.target.checked);
  m.querySelectorAll('.vol input').forEach(r => r.oninput = () => setVol(r.dataset.k, +r.value));
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  const ex = m.querySelector('[data-x=exit]'); if (ex) ex.onclick = () => { m.close(); onExit(); };
  return m;
}

/** Гибель: возрождение у кладбища. */
export function showDeath(G, onDone) {
  const m = modal(`<h2>Вы погибли</h2><p>Дух уносит вас к кладбищу у Столицы. Вещи и золото при вас, но первые 30 секунд удары слабее.</p><div class="row"><button class="btn main" data-x="ok">Возродиться у кладбища</button></div>`, 'death');
  m.querySelector('[data-x=ok]').onclick = () => { m.close(); };
  m.onclose = () => { respawnHero(G); onDone(); };
  return m;
}

// телефон: пояснение к характеристике закрывается касанием в любом другом месте
if (TOUCH && typeof addEventListener !== 'undefined') addEventListener('pointerdown', e => { if (!(e.target.closest && e.target.closest('.si'))) hideTip(); }, true);
