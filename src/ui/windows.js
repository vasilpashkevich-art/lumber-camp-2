// Окна: «Персонаж» (надетое, сумка, характеристики), «Рынок», меню (Esc), гибель.
import { CLASSES, SLOTS, SLOT_NAME } from '../../data/classes.js';
import { RAR_COL, RAR_NAME, LOOT, armorCut } from '../../data/balance.js';
import { itemIcon } from './icons.js';
import { itemLines, lookOf } from '../systems/items.js';
import { equip, sellItem, buyPotion, POTION_PRICE, respawnHero } from '../systems/game.js';
import { doll } from '../art/hero.js';
import { $, el, modal } from './dom.js';
import { soundState, setSound, setVol } from '../engine/audio.js';
import { fmt1 } from '../engine/util.js';

let tipEl = null;
function tip(e, it, G) {
  if (!tipEl) { tipEl = el('div', 'tip'); document.body.append(tipEl); }
  if (!it) { tipEl.hidden = true; return; }
  const cur = G.hero.eq[it.slot], same = cur && cur.id === it.id;
  const cmp = !same && cur ? `<hr><small>Сейчас надето: ${cur.name}</small>` : '';
  const wrong = it.cls !== G.hero.cls ? `<p class="bad">Не для вашего класса</p>` : '';
  tipEl.innerHTML = `<b style="color:${RAR_COL[it.rar]}">${it.name}</b><small>${RAR_NAME[it.rar]} · ${SLOT_NAME[it.slot]}</small>${itemLines(it).map(l => `<p>${l}</p>`).join('')}${wrong}${it.price ? `<p class="gold">Цена у торговца: ${it.price}</p>` : ''}${cmp}`;
  tipEl.hidden = false;
  const r = e.currentTarget.getBoundingClientRect(), w = 230;
  tipEl.style.left = Math.min(innerWidth - w - 8, r.right + 8) + 'px'; tipEl.style.top = Math.max(8, Math.min(innerHeight - 220, r.top)) + 'px';
}
export const hideTip = () => { if (tipEl) tipEl.hidden = true; };

/** Окно персонажа: слева облик и надетое, справа сумка. Клик по вещи в сумке — надеть. */
export function openChar(G, onChange) {
  const m = modal(`<h2>${G.hero.name}</h2><div class="charwin"><div class="doll"><canvas width="220" height="260"></canvas><div class="eq"></div><dl class="stats"></dl></div><div class="bagside"><h3>Сумка <span class="cnt"></span></h3><div class="bag"></div><p class="hint">Нажмите на вещь, чтобы надеть. Ненужное продаётся на рынке в столице.</p></div></div>`, 'wide');
  const draw = () => {
    const h = G.hero, st = G.st, C = CLASSES[h.cls];
    const g = m.querySelector('canvas').getContext('2d'); g.clearRect(0, 0, 220, 260); doll(g, 110, 220, 5.6, 1, lookOf(h), 0.3);
    const eq = m.querySelector('.eq'); eq.innerHTML = '';
    for (const s of SLOTS) { const it = h.eq[s]; const b = el('div', 'cell', it ? itemIcon(it, 44) : `<span class="empty">${SLOT_NAME[s]}</span>`); if (it) { b.onmouseenter = e => tip(e, it, G); b.onmouseleave = hideTip; } eq.append(b); }
    m.querySelector('.stats').innerHTML = `<dt>Уровень</dt><dd>${h.lvl}</dd><dt>Здоровье</dt><dd>${st.maxHp}</dd><dt>Сила удара</dt><dd>${fmt1(st.hit)}</dd><dt>Урон в секунду</dt><dd>${fmt1(st.dps)}</dd><dt>Броня</dt><dd>${st.armor} (−${Math.round(armorCut(st.armor, h.lvl) * 100)}%)</dd><dt>Золото</dt><dd>${h.gold}</dd><dt>Зелья</dt><dd>${h.potions}</dd>`;
    m.querySelector('.cnt').textContent = `${h.bag.length} / ${LOOT.bag}`;
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag[i], b = el('button', 'cell', it ? itemIcon(it, 44) : '');
      if (it) { b.onmouseenter = e => tip(e, it, G); b.onmouseleave = hideTip; b.onclick = () => { hideTip(); equip(G, it); onChange(); draw(); }; }
      bag.append(b);
    }
  };
  m.onclose = hideTip; draw(); return m;
}

/** Рынок: продать вещи, купить зелья. */
export function openVendor(G, onChange) {
  const m = modal(`<h2>Рынок</h2><p class="who">Торговка Агафья: «Что продаёшь, путник? Зелья свежие, утром варила».</p><div class="vend"><div><h3>Купить</h3><div class="buy"></div></div><div><h3>Продать <small>(нажмите на вещь)</small></h3><div class="bag"></div><button class="btn sellall">Продать всё, что не надеть</button></div></div><p class="gold">Золото: <b></b></p>`, 'wide');
  const draw = () => {
    const h = G.hero, p = POTION_PRICE(h.lvl);
    m.querySelector('.gold b').textContent = h.gold;
    const buy = m.querySelector('.buy'); buy.innerHTML = '';
    const b = el('button', 'ware', `<span class="ic"></span><span><b>Зелье здоровья</b><small>+40% здоровья, снимает яд. У вас: ${h.potions} из 10</small></span><span class="pr">${p}</span>`);
    b.querySelector('.ic').innerHTML = `<svg viewBox="0 0 32 32" width="40" height="40"><rect x="13" y="3" width="6" height="6" fill="#c9a06a" stroke="#24180f"/><path d="M12 9h8v4l5 6v6a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-6l5-6z" fill="#e8e0cc" stroke="#24180f"/><path d="M8 19h16v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#d8323a"/></svg>`;
    b.onclick = () => { buyPotion(G); onChange(); draw(); }; buy.append(b);
    const bag = m.querySelector('.bag'); bag.innerHTML = '';
    for (let i = 0; i < LOOT.bag; i++) {
      const it = h.bag[i], c = el('button', 'cell', it ? itemIcon(it, 44) + `<span class="pr">${it.price}</span>` : '');
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

/** Меню по Esc: звук, громкость, выход к выбору героя. */
export function openMenu({ onExit, inGame }) {
  const s = soundState();
  const m = modal(`<h2>Меню</h2>
    <label class="tgl"><input type="checkbox" ${s.on ? 'checked' : ''}> Звук</label>
    ${[['m', 'Музыка'], ['a', 'Шум города'], ['f', 'Звуки']].map(([k, n]) => `<label class="vol">${n}<input type="range" min="0" max="1" step="0.05" value="${s.vol[k]}" data-k="${k}"></label>`).join('')}
    <div class="keys"><h3>Управление</h3><p><b>WASD</b> или стрелки — ходить · <b>Пробел</b> — бить (держать) · <b>C</b> — умение · <b>Q</b> — зелье · <b>E</b> — говорить, торговать · <b>Tab</b> — ближайшая цель · <b>I</b> или <b>B</b> — персонаж и сумка · клик по врагу — выбрать цель</p></div>
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
