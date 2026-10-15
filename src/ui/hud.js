// Интерфейс во время игры (в духе WoW): портрет с уровнем, здоровьем и опытом; рамка цели;
// панель действий внизу; мини-карта, зона и золото справа сверху.
import { CLASSES } from '../../data/classes.js';
import { xpNeed, lvlColor } from '../../data/balance.js';
import { lookOf } from '../systems/items.js';
import { doll } from '../art/body.js';
import { ABIL_ICON, moneyHtml, accIcon, potionIcon, hearthSvg } from './icons.js';
import { hearthLeft, homeSpot } from '../systems/hearth.js';
import { POTIONS } from '../../data/alchemy.js';
import { countOf } from '../systems/mining.js';
import { TRINKETS } from '../../data/trinkets.js';
import { drawMini } from './map.js';
import { attackOf } from '../entities/hero.js';
import { $, TOUCH } from './dom.js';
import { interactTarget, abilsOf } from '../systems/game.js';
import { NPCS, QUESTS, qState, qReady, goalDone, goalText } from '../systems/quests.js';
import { iconUrl } from '../art/abicons.js';
import { talentFree } from '../systems/talents.js';
import { makeDnD } from './drag.js';

/** Ячейки панели (v85): у ячейки — клавиша, внутри — действие из h.bar (удар, умение, аксессуар, зелья); переставляются перетаскиванием. */
const SLOTS = ['#actAttack', '#actAbil', '#actAbil2', '#actAbil3', '#actAbil4', '#actTrinket', '#actPot2', '#actPot'];
const SLOT_CODE = ['Attack', 'KeyC', 'KeyV', 'KeyR', 'KeyF', 'Trk', 'Pot2', 'Pot'];
const SLOT_KEY = ['пробел', 'C', 'V', 'R', 'F', '1', '2', 'Q'];
const AB_IDX = { ab0: 0, ab1: 1, ab2: 2, ab4: 4 };
export const abImg = (id, passive = false) => `<img src="${iconUrl(id, passive)}" alt="" draggable="false">`;
import { fmt1 } from '../engine/util.js';

export function createHud(In) {
  const H = { portraitKey: '', mini: null };
  const cls = () => H.G.hero.cls;
  // кнопки действий (и для мыши, и для пальца)
  SLOTS.forEach((sel, i) => In.button($(sel), SLOT_CODE[i]));
  In.button($('#actSit'), 'Sit'); In.button($('#actUse'), 'Use');
  // перестановка ячеек: мышью — перетащить, пальцем — задержать и вести; обмен местами, клавиша остаётся у ячейки
  const D = makeDnD(() => { H.slotK = []; H.update(); for (const j of H.swapped || []) { const e = $(SLOTS[j]); e.classList.add('swapped'); setTimeout(() => e.classList.remove('swapped'), 2200); } H.swapped = null; });
  SLOTS.forEach((sel, i) => { const b = $(sel); D.drag(b, { slot: i }); D.drop(b, src => { if (src.slot == null || src.slot === i) return; const bar = H.G.hero.bar; [bar[src.slot], bar[i]] = [bar[i], bar[src.slot]]; H.G.ev.push({ k: 'barSwap' }); H.swapped = [src.slot, i]; }); });
  H.bind = G => {
    H.G = G; H.portraitKey = ''; H.mini = null; H.miniKey = null; H.goldK = null;
    const C = CLASSES[cls()];
    H.slotK = []; H.lockLvl = -1; H.elixK = null;
    $('#btnBag').innerHTML = ABIL_ICON.bag; $('#btnHearth').innerHTML = hearthSvg() + '<span class="hcd" hidden></span>'; $('#btnMap').innerHTML = ABIL_ICON.map; $('#btnProf').innerHTML = ABIL_ICON.prof; $('#btnDg').innerHTML = ABIL_ICON.dg; $('#btnQuest').innerHTML = ABIL_ICON.quest; H.qK = null; $('#btnMenu').innerHTML = ABIL_ICON.menu;
    $('#pfName').textContent = G.hero.name;
    $('#pfRing').style.borderColor = C.color;
    $('#zoneName').textContent = G.W.Z.name;
  };
  H.update = () => {
    const G = H.G, P = G.P, h = G.hero, st = G.st, C = CLASSES[h.cls];
    // портрет перерисовываем только при смене вещей
    const L = lookOf(h), key = L.key;
    if (key !== H.portraitKey) { H.portraitKey = key; const c = $('#pfCanvas').getContext('2d'); c.clearRect(0, 0, 160, 160); doll(c, 80, 186, 6.2, 1, L, 0.3); }
    $('#pfLvl').textContent = h.lvl; $('#pfTal').hidden = !talentFree(h);
    setBar('#pfHp', P.hp / st.maxHp, `${Math.ceil(P.hp)} / ${st.maxHp}`);
    const need = xpNeed(h.lvl); setBar('#pfXp', isFinite(need) ? h.xp / need : 1, isFinite(need) ? `опыт ${h.xp} / ${need}` : 'наивысший уровень');
    $('#pfWeak').hidden = !(P.weak > 0); if (P.weak > 0) $('#pfWeak').textContent = `слабость ${Math.ceil(P.weak)} с`;
    $('#pfPoison').hidden = !P.poison; if (P.poison) $('#pfPoison').textContent = P.poison.fire ? 'горит' : 'отравлен';
    // цель
    const t = P.target && P.target.state !== 'dead' ? P.target : null, tf = $('#target');
    tf.hidden = !t;
    if (t) {
      $('#tgName').textContent = t.D.name; $('#tgLvl').textContent = (t.D.rare ? '★ ' : '') + t.lvl; $('#tgLvl').style.color = lvlColor(t.lvl, h.lvl);
      setBar('#tgHp', t.hp / t.max, `${Math.ceil(t.hp)} / ${t.max}`);
      $('#tgNote').textContent = t.D.rare ? 'Редкий и сильный' : t.state === 'return' ? 'Уходит домой' : '';
    }
    // панель действий (v85): по ячейкам, что в какой лежит — h.bar
    const AL = abilsOf(h), bar = h.bar || In.DEFAULT_BAR, tr = h.eq.trinket, T = tr && TRINKETS.find(x => x.id === tr.trinket), pid = h.lastPot, pn = pid ? countOf(h, 'potion', pid) : 0;
    bar.forEach((a, i) => {
      const b = $(SLOTS[i]), key = SLOT_KEY[i], ic = b.querySelector('.ico'), lk = b.querySelector('.lock'), n = b.querySelector('.n');
      // содержимое ячейки перерисовываем только при смене (значок, аксессуар, зелье, уровень)
      const k = a + (a === 'trinket' ? ':' + (tr ? tr.id : '') : a === 'pot2' ? ':' + pid + ':' + pn : a in AB_IDX ? ':' + h.lvl : '');
      if (H.slotK[i] !== k) {
        H.slotK[i] = k; b.className = 'act'; ic.className = 'ico'; lk.hidden = true; n.textContent = ''; b.querySelector('.cd').style.height = '0'; b.querySelector('.cdt').textContent = '';
        if (a === 'attack') { ic.innerHTML = abImg('atk_' + h.cls); ic.classList.add('pic'); b.title = `Удар — ${key}. Нажать один раз — автоатака по цели, пока она жива или пока не выберете другую`; }
        else if (a in AB_IDX) { const A = AL[AB_IDX[a]]; ic.innerHTML = abImg(A.icon); ic.classList.add('pic'); b.title = `${A.name} — ${key}. ${A.d}`; lk.hidden = h.lvl >= A.lvl; lk.querySelector('b').textContent = `${A.lvl} ур.`; }
        else if (a === 'trinket') { b.classList.add('tr'); if (tr) { ic.innerHTML = accIcon(tr.trinket, tr.rar, 44).replace(/width="44" height="44"/, 'width="100%" height="100%"'); b.title = `${T.name} — ${key}. ${T.d}`; } else { ic.innerHTML = ABIL_ICON.trinketEmpty; b.classList.add('empty'); b.title = `Аксессуар — ${key}. Наденьте аксессуар в окне героя`; } }
        else if (a === 'pot2') { b.classList.add('pot2'); if (pid) { ic.innerHTML = potionIcon(pid, 'common', 44).replace(/width="44" height="44"/, 'width="100%" height="100%"'); n.textContent = pn; b.classList.toggle('none', !pn); b.title = `${POTIONS[pid].name} — ${key}. ${POTIONS[pid].d}`; } else { ic.innerHTML = ABIL_ICON.potionEmpty; b.classList.add('empty'); b.title = `Зелье — ${key}. Выпейте зелье из сумки — оно будет здесь`; } }
        else if (a === 'potion') { ic.innerHTML = ABIL_ICON.potion; b.title = `Зелье здоровья — ${key}`; }
        b.title += '. Перетащите, чтобы поменять ячейки местами';
      }
      if (a === 'attack') { cool(SLOTS[i], P.cd, attackOf(h).cd); b.classList.toggle('auto', !!P.auto); }
      else if (a in AB_IDX) { const A = AL[AB_IDX[a]]; cool(SLOTS[i], P.acd[A.id] || 0, A.cd); if (a === 'ab4') b.classList.toggle('on', P.buf.berserk > 0); }
      else if (a === 'trinket') { if (T) cool(SLOTS[i], P.tcd, T.cd); }
      else if (a === 'potion') { cool(SLOTS[i], P.potCd, 20); n.textContent = h.potions; }
    });
    // умение открылось на новом уровне — его кнопка мигает
    if (H.lockLvl !== h.lvl) { if (H.lockLvl > 0) bar.forEach((a, i) => { if (a in AB_IDX && AL[AB_IDX[a]].lvl > H.lockLvl && AL[AB_IDX[a]].lvl <= h.lvl) { const b = $(SLOTS[i]); b.classList.add('ready'); setTimeout(() => b.classList.remove('ready'), 5000); } }); H.lockLvl = h.lvl; }
    { const left = hearthLeft(h), hb = $('#btnHearth'), hc = hb.querySelector('.hcd'), txt = left > 0 ? (left >= 60 ? Math.ceil(left / 60) + 'м' : Math.ceil(left) + 'с') : '';   // v108: камень возвращения — перезарядка на кнопке
      if (hc.textContent !== txt) { hc.textContent = txt; hc.hidden = !txt; } hb.classList.toggle('cast', !!P.hearth);
      const ttl = `Камень возвращения — H. Дом: ${homeSpot(h).name}. ${left > 0 ? `Готов через ${Math.ceil(left / 60)} мин` : 'Готов'}. 10 с — шаг, удар или урон собьют; перезарядка 20 мин`; if (hb.title !== ttl) hb.title = ttl; }
    // телефон: кнопка действия рядом с тем, что можно сделать (вместо клавиши E)
    if (TOUCH) { const it = !P.dead && !P.mine && !P.gather && interactTarget(G), u = $('#actUse'), lab = it ? (it.k === 'npc' ? 'Говорить' : it.k === 'qobj' ? (it.o.fire ? 'Поджечь' : 'Взять') : it.k === 'corpse' ? 'Обыскать' : it.k === 'vein' ? 'Копать' : it.k === 'plant' ? 'Собрать' : it.k === 'chest' ? 'Открыть' : it.k === 'exit' ? (it.e.temple ? 'Врата' : it.e.portal ? 'Портал' : it.e.door ? 'Выход' : 'В путь') : it.b.vendor ? 'Торговать' : it.b.bank ? 'Банк' : it.b.mentor ? 'Наставник' : it.b.alchemy ? 'Травница' : it.b.enchant ? 'Чародейка' : it.b.guild || it.b.smelt || it.b.brew || it.b.bind ? 'Войти' : 'Осмотреть') : '';
      u.hidden = !it; if (u.textContent !== lab) u.textContent = lab; $('#actSit').classList.toggle('on2', !!P.sit); }
    const E = h.elixir || {}, ek = ['battle', 'guard'].map(k => E[k] ? E[k].id + ':' + Math.ceil(E[k].t / 5) : '').join('|');
    if (ek !== H.elixK) { H.elixK = ek; $('#pfElix').innerHTML = ['battle', 'guard'].map(k => { const e = E[k]; if (!e) return ''; const tt = Math.ceil(e.t), m = Math.floor(tt / 60), sec = tt % 60; return `<div class="ex" title="${POTIONS[e.id].name}: ${POTIONS[e.id].d}">${potionIcon(e.id, 'common', 38)}<i>${tt >= 60 ? m + ':' + String(sec).padStart(2, '0') : sec + ' с'}</i></div>`; }).join(''); }
    // v95: отслеживание заданий под мини-картой (перестраивается только при изменении)
    { const S = qState(h), qk = S.track.map(id => id + ':' + (S.act[id] ? S.act[id].n.join(',') : '') + (qReady(h, id) ? 'R' : '')).join('|');
      if (qk !== H.qK) { H.qK = qk; $('#qtrack').hidden = !S.track.length; $('#qtrack').innerHTML = S.track.filter(id => S.act[id]).map(id => { const Q = QUESTS[id], rd = qReady(h, id), N = NPCS[Q.turn || Q.giver]; return `<div class="qt${rd ? ' rd' : ''}"><b>${Q.name}</b>${rd ? `<span class="ok">✔ Вернитесь: ${N.name}</span>` : Q.goals.map((g, i) => `<span class="${goalDone(h, id, i) ? 'ok' : ''}">${goalDone(h, id, i) ? '✔' : '–'} ${goalText(h, id, i, true)}</span>`).join('')}</div>`; }).join(''); } }
    const gk = h.gold; if (gk !== H.goldK) { H.goldK = gk; $('#gold').innerHTML = moneyHtml(gk); }
    $('#pfFist').hidden = !st.unarmed;
    drawMini($('#mini'), G, H);
  };
  function setBar(sel, k, txt) { const b = $(sel); b.firstElementChild.style.width = Math.max(0, Math.min(1, k)) * 100 + '%'; b.lastElementChild.textContent = txt; }
  function cool(sel, t, max) { const e = $(sel + ' .cd'); if (t > 0.05) { e.style.height = Math.min(1, t / max) * 100 + '%'; e.nextElementSibling.textContent = t > 1 ? Math.ceil(t) : ''; } else { e.style.height = '0'; e.nextElementSibling.textContent = ''; } }

  return H;
}

export { fmt1 };
