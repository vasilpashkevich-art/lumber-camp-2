// Окна: «Персонаж» (надетое, сумка, характеристики), «Рынок», меню (Esc), гибель.
import { CLASSES, SLOTS, SLOT_NAME } from '../../data/classes.js';
import { RAR_COL, RAR_NAME, LOOT, armorCut } from '../../data/balance.js';
import { itemIcon, moneyHtml } from './icons.js';
import { itemLines, lookOf } from '../systems/items.js';
import { equip, unequip, sellItem, buyPotion, POTION_PRICE, respawnHero, lootTake, hasLoot, bagMove, abilsOf } from '../systems/game.js';
import { ABIL_ICON } from './icons.js';
import { doll } from '../art/hero.js';
import { $, el, modal } from './dom.js';
import { soundState, setSound, setVol } from '../engine/audio.js';
import { fmt1 } from '../engine/util.js';

let tipEl = null;
function tip(e, it, G, worn) {
  if (!tipEl) { tipEl = el('div', 'tip'); document.body.append(tipEl); }
  if (!it) { tipEl.hidden = true; return; }
  const cur = G.hero.eq[it.slot], same = cur && cur.id === it.id;
  const cmp = !same && cur ? `<hr><small>Сейчас надето: ${cur.name}</small>` : '';
  const wrong = it.cls !== G.hero.cls ? `<p class="bad">Не для вашего класса</p>` : '';
  const act = worn ? '<p class="hint2">Нажмите, чтобы снять</p>' : '';
  tipEl.innerHTML = `${act}<b style="color:${RAR_COL[it.rar]}">${it.name}</b><small>${RAR_NAME[it.rar]} · ${SLOT_NAME[it.slot]}</small>${itemLines(it).map(l => `<p>${l}</p>`).join('')}${wrong}${it.price ? `<p class="gold">Цена у торговца: ${moneyHtml(it.price)}</p>` : ''}${cmp}`;
  tipEl.hidden = false;
  const r = e.currentTarget.getBoundingClientRect(), w = 230;
  tipEl.style.left = Math.min(innerWidth - w - 8, r.right + 8) + 'px'; tipEl.style.top = Math.max(8, Math.min(innerHeight - 220, r.top)) + 'px';
}
export const hideTip = () => { if (tipEl) tipEl.hidden = true; };

/** Окно персонажа: слева облик и надетое, справа сумка. Клик по вещи в сумке — надеть, по надетой — снять. */
export function openChar(G, onChange) {
  const m = modal(`<h2>${G.hero.name}</h2><div class="charwin"><div class="doll"><canvas width="220" height="260"></canvas><div class="eq"></div><dl class="stats"></dl></div><div class="bagside"><h3>Сумка <span class="cnt"></span></h3><div class="bag"></div><p class="hint">Нажмите на вещь в сумке — надеть, на надетую — снять. Вещи можно перетаскивать мышью: по ячейкам сумки, на снаряжение и обратно. Закрыть — I, B или Esc.</p></div></div>`, 'wide');
  const draw = () => {
    const h = G.hero, st = G.st, C = CLASSES[h.cls];
    const g = m.querySelector('canvas').getContext('2d'); g.clearRect(0, 0, 220, 260); doll(g, 110, 196, 5.0, 1, lookOf(h), 0.3);
    const eq = m.querySelector('.eq'); eq.innerHTML = '';
    for (const s of SLOTS) {
      const it = h.eq[s]; const b = el('button', 'cell', it ? itemIcon(it, 44) : `<span class="empty">${SLOT_NAME[s]}</span>`);
      if (it) { b.onmouseenter = e => tip(e, it, G, true); b.onmouseleave = hideTip; b.onclick = () => { hideTip(); unequip(G, s); onChange(); draw(); }; drag(b, { eq: s }); }
      drop(b, src => { if (src.it && src.it.slot === s) equip(G, src.it); });
      eq.append(b);
    }
    m.querySelector('.stats').innerHTML = `<dt>Уровень</dt><dd>${h.lvl}</dd><dt>Здоровье</dt><dd>${st.maxHp}</dd><dt>Сила удара</dt><dd>${fmt1(st.hit)}</dd><dt>Урон в секунду</dt><dd>${fmt1(st.dps)}</dd><dt>Броня</dt><dd>${st.armor} (−${Math.round(armorCut(st.armor, h.lvl) * 100)}%)</dd><dt>Деньги</dt><dd>${moneyHtml(h.gold)}</dd><dt>Зелья</dt><dd>${h.potions}</dd>`;
    m.querySelector('.cnt').textContent = `${h.bag.length} / ${LOOT.bag}`;
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), b = el('button', 'cell', it ? itemIcon(it, 44) : '');
      if (it) { b.onmouseenter = e => tip(e, it, G); b.onmouseleave = hideTip; b.onclick = () => { hideTip(); equip(G, it); onChange(); draw(); }; drag(b, { it }); }
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

/** Рынок: продать вещи, купить зелья. */
export function openVendor(G, onChange) {
  const m = modal(`<h2>Рынок</h2><p class="who">Торговка Агафья: «Что продаёшь, путник? Зелья свежие, утром варила».</p><div class="vend"><div><h3>Купить</h3><div class="buy"></div></div><div><h3>Продать <small>(нажмите на вещь, цена — в подсказке)</small></h3><div class="bag"></div><button class="btn sellall">Продать всё, что не надеть</button></div></div><p class="gold">Деньги: <b></b></p>`, 'wide');
  const draw = () => {
    const h = G.hero, p = POTION_PRICE(h.lvl);
    m.querySelector('.gold b').innerHTML = moneyHtml(h.gold);
    const buy = m.querySelector('.buy'); buy.innerHTML = '';
    const b = el('button', 'ware', `<span class="ic"></span><span><b>Зелье здоровья</b><small>+40% здоровья, снимает яд. У вас: ${h.potions} из 10</small></span><span class="pr">${moneyHtml(p)}</span>`);
    b.querySelector('.ic').innerHTML = `<svg viewBox="0 0 32 32" width="40" height="40"><rect x="13" y="3" width="6" height="6" fill="#c9a06a" stroke="#24180f"/><path d="M12 9h8v4l5 6v6a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-6l5-6z" fill="#e8e0cc" stroke="#24180f"/><path d="M8 19h16v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#d8323a"/></svg>`;
    b.onclick = () => { buyPotion(G); onChange(); draw(); }; buy.append(b);
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag.find(x => x.pos === i), c = el('button', 'cell', it ? itemIcon(it, 44) : '');
      if (it) { c.onmouseenter = e => tip(e, it, G); c.onmouseleave = hideTip; c.onclick = () => { hideTip(); sellItem(G, it); onChange(); draw(); }; }
      bag.append(c);
    }
  };
  m.querySelector('.sellall').onclick = () => {
    const h = G.hero, sc = it => (it.dmg || 0) * 3 + (it.armor || 0) + (it.stam || 0) * 2 + (it.pow || 0) * 3;
    for (const it of h.bag.slice()) { const cur = h.eq[it.slot]; if (it.cls !== h.cls || (cur && sc(it) <= sc(cur))) sellItem(G, it); }
    onChange(); draw();
  };
  m.onclose = hideTip; draw(); return m;
}

/** Подсумок: что лежит в теле моба. Строка — взять одно, «Забрать всё» или E — всё сразу. */
export function openLoot(G, c, onChange) {
  const m = modal(`<h2>${c.name} <span class="lv">${c.lvl ? 'ур. ' + c.lvl : ''}</span></h2><div class="lst"></div><div class="row"><button class="btn" data-x="close">Закрыть</button><button class="btn main" data-x="all">Забрать всё <small>(E)</small></button></div>`, 'loot');
  m.corpse = c; m.parentElement.classList.add('light');   // подсумок не затемняет мир, стоит слева от героя
  const draw = () => {
    if (!hasLoot(c)) { m.close(); return; }
    const L = m.querySelector('.lst'); L.innerHTML = '';
    if (c.money > 0) { const b = el('button', 'lrow', `<span class="cic">${moneyIcon()}</span><span class="nm2">${moneyHtml(c.money)}</span>`); b.onclick = () => { lootTake(G, c, -1); onChange(); draw(); }; L.append(b); }
    c.items.forEach((it, i) => {
      const b = el('button', 'lrow', `<span class="cic">${itemIcon(it, 38)}</span><span class="nm2" style="color:${RAR_COL[it.rar]}">${it.name}</span>`);
      b.onmouseenter = e => tip(e, it, G); b.onmouseleave = hideTip;
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
const moneyIcon = () => `<svg viewBox="0 0 32 32" width="34" height="34"><ellipse cx="16" cy="24" rx="11" ry="4" fill="#c4703a" stroke="#24180f"/><ellipse cx="14" cy="19" rx="11" ry="4" fill="#cfd6dc" stroke="#24180f"/><ellipse cx="17" cy="13" rx="11" ry="4" fill="#f2c037" stroke="#24180f"/><ellipse cx="15" cy="12" rx="4" ry="1.2" fill="#fff6c0"/></svg>`;

/** Умения класса: что открыто и что откроется на каком уровне. */
export function openAbils(G) {
  const h = G.hero, C = CLASSES[h.cls];
  const rows = abilsOf(h).map(A => { const open = h.lvl >= A.lvl; return `<div class="abl${open ? '' : ' locked'}"><span class="ic">${ABIL_ICON[A.icon]}</span><div><b>${A.name}</b><span class="kk">${A.key}</span>${open ? '' : ` <span class="lv">Доступно с ${A.lvl}-го уровня</span>`}<p>${A.d}</p><small>Перезарядка ${A.cd} с</small></div></div>`; }).join('');
  const m = modal(`<h2>Умения: ${C.name.toLowerCase()}</h2><div class="abl"><span class="ic">${ABIL_ICON.attack[h.cls]}</span><div><b>Обычный удар</b><span class="kk">Пробел</span><p>${h.eq.weapon ? 'Держите пробел — герой бьёт ближайшего врага или выбранную цель.' : 'Оружие снято — герой бьёт кулаками, слабо и только вплотную.'}</p></div></div>${rows}<p class="hint">X — сесть и перевести дух: здоровье восстанавливается быстрее, любое движение или удар поднимает. Q — зелье.</p><div class="row"><button class="btn main" data-x="ok">Закрыть</button></div>`, 'abils');
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  return m;
}

/** Меню по Esc: звук, громкость, выход к выбору героя. */
export function openMenu({ onExit, inGame }) {
  const s = soundState();
  const m = modal(`<h2>Меню</h2>
    <label class="tgl"><input type="checkbox" ${s.on ? 'checked' : ''}> Звук</label>
    ${[['m', 'Музыка'], ['a', 'Шум города'], ['f', 'Звуки']].map(([k, n]) => `<label class="vol">${n}<input type="range" min="0" max="1" step="0.05" value="${s.vol[k]}" data-k="${k}"></label>`).join('')}
    <div class="keys"><h3>Управление</h3><p><b>WASD</b> или стрелки — ходить · <b>Пробел</b> — бить (держать) · <b>C</b> и <b>V</b> — умения (второе — с 5-го уровня) · <b>X</b> — сесть отдохнуть · <b>Q</b> — зелье · <b>E</b> — обыскать тело, говорить, торговать · <b>K</b> — карта · <b>Tab</b> — ближайшая цель · <b>I</b> или <b>B</b> — персонаж и сумка · клик по врагу — выбрать цель</p></div>
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
