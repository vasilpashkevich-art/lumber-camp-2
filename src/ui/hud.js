// Интерфейс во время игры (в духе WoW): портрет с уровнем, здоровьем и опытом; рамка цели;
// панель действий внизу; мини-карта, зона и золото справа сверху.
import { CLASSES } from '../../data/classes.js';
import { xpNeed, lvlColor } from '../../data/balance.js';
import { lookOf } from '../systems/items.js';
import { doll } from '../art/body.js';
import { ABIL_ICON, moneyHtml, accIcon, potionIcon } from './icons.js';
import { POTIONS } from '../../data/alchemy.js';
import { countOf } from '../systems/mining.js';
import { TRINKETS } from '../../data/trinkets.js';
import { drawMini } from './map.js';
import { attackOf } from '../entities/hero.js';
import { $, TOUCH } from './dom.js';
import { interactTarget, abilsOf } from '../systems/game.js';
import { iconUrl } from '../art/abicons.js';
import { talentFree } from '../systems/talents.js';

/** Кнопки умений: клавиша → номер в списке умений класса (3 — пассивное, без кнопки). */
const ABTN = [['#actAbil', 'KeyC', 0], ['#actAbil2', 'KeyV', 1], ['#actAbil3', 'KeyR', 2], ['#actAbil4', 'KeyF', 4]];
export const abImg = (id, passive = false) => `<img src="${iconUrl(id, passive)}" alt="" draggable="false">`;
import { fmt1 } from '../engine/util.js';

export function createHud(In) {
  const H = { portraitKey: '', mini: null };
  const cls = () => H.G.hero.cls;
  // кнопки действий (и для мыши, и для пальца)
  In.button($('#actAttack'), 'Attack', true);
  for (const [sel, key] of ABTN) In.button($(sel), key);
  In.button($('#actPot'), 'KeyQ');
  In.button($('#actTrinket'), 'Digit1'); In.button($('#actPot2'), 'Pot2');
  In.button($('#actSit'), 'Sit'); In.button($('#actUse'), 'Use');
  H.bind = G => {
    H.G = G; H.portraitKey = ''; H.mini = null; H.miniKey = null; H.goldK = null;
    const C = CLASSES[cls()];
    const ai = $('#actAttack .ico'); ai.innerHTML = abImg('atk_' + cls()); ai.classList.add('pic');
    const L = abilsOf(G.hero);
    for (const [sel, , i] of ABTN) { const A = L[i], b = $(sel), ic = b.querySelector('.ico'); ic.innerHTML = abImg(A.icon); ic.classList.add('pic'); b.title = `${A.name} — ${A.key}. ${A.d}`; }
    $('#actPot .ico').innerHTML = ABIL_ICON.potion;
    $('#actAttack').title = 'Удар — пробел. Нажать один раз — автоатака по цели, пока она жива или пока не выберете другую'; $('#actPot').title = 'Зелье здоровья — Q';
    H.lockLvl = -1; H.trK = null; H.potK = null; H.elixK = null;
    $('#btnBag').innerHTML = ABIL_ICON.bag; $('#btnMap').innerHTML = ABIL_ICON.map; $('#btnProf').innerHTML = ABIL_ICON.prof; $('#btnMenu').innerHTML = ABIL_ICON.menu;
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
    // панель действий
    const AL = abilsOf(h);
    for (const [sel, , i] of ABTN) cool(sel, P.acd[AL[i].id] || 0, AL[i].cd);
    cool('#actPot', P.potCd, 20);
    // умения закрыты до своего уровня; когда открылось — кнопка мигает
    if (H.lockLvl !== h.lvl) { for (const [sel, , i] of ABTN) { const A = AL[i], open = h.lvl >= A.lvl, b = $(sel), lk = b.querySelector('.lock'); if (!lk) continue; lk.hidden = open; lk.querySelector('b').textContent = `${A.lvl} ур.`; if (open && H.lockLvl > 0 && H.lockLvl < A.lvl) { b.classList.add('ready'); setTimeout(() => b.classList.remove('ready'), 5000); } } H.lockLvl = h.lvl; }
    $('#actAbil4').classList.toggle('on', P.buf.berserk > 0);
    cool('#actAttack', P.cd, attackOf(h).cd); $('#actAttack').classList.toggle('auto', !!P.auto);
    $('#actPot .n').textContent = h.potions;
    // телефон: кнопка действия рядом с тем, что можно сделать (вместо клавиши E)
    if (TOUCH) { const it = !P.dead && !P.mine && !P.gather && interactTarget(G), u = $('#actUse'), lab = it ? (it.k === 'corpse' ? 'Обыскать' : it.k === 'vein' ? 'Копать' : it.k === 'plant' ? 'Собрать' : it.k === 'exit' ? (it.e.temple ? 'Врата' : it.e.door ? 'Выход' : 'В путь') : it.b.vendor ? 'Торговать' : it.b.bank ? 'Банк' : it.b.mentor ? 'Наставник' : it.b.alchemy ? 'Травница' : it.b.guild || it.b.smelt || it.b.brew ? 'Войти' : 'Осмотреть') : '';
      u.hidden = !it; if (u.textContent !== lab) u.textContent = lab; $('#actSit').classList.toggle('on2', !!P.sit); }
    // аксессуар на клавише 1: значок меняется, когда надели другой
    const tr = h.eq.trinket, tk = tr ? tr.id : ''; const tb = $('#actTrinket');
    if (tk !== H.trK) { H.trK = tk; tb.hidden = !tr; if (tr) { const T = TRINKETS.find(x => x.id === tr.trinket); tb.querySelector('.ico').innerHTML = accIcon(tr.trinket, tr.rar, 44).replace(/width="44" height="44"/, 'width="100%" height="100%"'); tb.title = `${T.name} — 1. ${T.d}`; } }
    if (tr) { const T = TRINKETS.find(x => x.id === tr.trinket); cool('#actTrinket', P.tcd, T.cd); }
    // зелье на клавише 2 (v84): последнее выбранное, с числом в сумке; действующие зелья под портретом
    const pid = h.lastPot, pn = pid ? countOf(h, 'potion', pid) : 0, pk = pid + ':' + pn, pb = $('#actPot2');
    if (pk !== H.potK) { H.potK = pk; pb.hidden = !pid; pb.classList.toggle('none', !pn); if (pid) { pb.querySelector('.ico').innerHTML = potionIcon(pid, 'common', 44).replace(/width="44" height="44"/, 'width="100%" height="100%"'); pb.querySelector('.n').textContent = pn; pb.title = `${POTIONS[pid].name} — 2. ${POTIONS[pid].d}`; } }
    const E = h.elixir || {}, ek = ['battle', 'guard'].map(k => E[k] ? E[k].id + ':' + Math.ceil(E[k].t / 5) : '').join('|');
    if (ek !== H.elixK) { H.elixK = ek; $('#pfElix').innerHTML = ['battle', 'guard'].map(k => { const e = E[k]; if (!e) return ''; const tt = Math.ceil(e.t), m = Math.floor(tt / 60), sec = tt % 60; return `<div class="ex" title="${POTIONS[e.id].name}: ${POTIONS[e.id].d}">${potionIcon(e.id, 'common', 38)}<i>${tt >= 60 ? m + ':' + String(sec).padStart(2, '0') : sec + ' с'}</i></div>`; }).join(''); }
    const gk = h.gold; if (gk !== H.goldK) { H.goldK = gk; $('#gold').innerHTML = moneyHtml(gk); }
    $('#pfFist').hidden = !st.unarmed;
    drawMini($('#mini'), G, H);
  };
  function setBar(sel, k, txt) { const b = $(sel); b.firstElementChild.style.width = Math.max(0, Math.min(1, k)) * 100 + '%'; b.lastElementChild.textContent = txt; }
  function cool(sel, t, max) { const e = $(sel + ' .cd'); if (t > 0.05) { e.style.height = Math.min(1, t / max) * 100 + '%'; e.nextElementSibling.textContent = t > 1 ? Math.ceil(t) : ''; } else { e.style.height = '0'; e.nextElementSibling.textContent = ''; } }

  return H;
}

export { fmt1 };
