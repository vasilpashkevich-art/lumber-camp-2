// Интерфейс во время игры (в духе WoW): портрет с уровнем, здоровьем и опытом; рамка цели;
// панель действий внизу; мини-карта, зона и золото справа сверху.
import { CLASSES } from '../../data/classes.js';
import { xpNeed, lvlColor } from '../../data/balance.js';
import { lookOf } from '../systems/items.js';
import { doll } from '../art/hero.js';
import { ABIL_ICON, moneyHtml } from './icons.js';
import { drawMini } from './map.js';
import { attackOf } from '../entities/hero.js';
import { $ } from './dom.js';
import { fmt1 } from '../engine/util.js';

export function createHud(In) {
  const H = { portraitKey: '', mini: null };
  const cls = () => H.G.hero.cls;
  // кнопки действий (и для мыши, и для пальца)
  In.button($('#actAttack'), 'Attack', true);
  In.button($('#actAbil'), 'KeyC');
  In.button($('#actAbil2'), 'KeyV');
  In.button($('#actPot'), 'KeyQ');
  H.bind = G => {
    H.G = G; H.portraitKey = ''; H.mini = null; H.goldK = null;
    const C = CLASSES[cls()];
    $('#actAttack .ico').innerHTML = ABIL_ICON.attack[cls()];
    C.abils.forEach((A, i) => { const b = $(i ? '#actAbil2' : '#actAbil'); b.querySelector('.ico').innerHTML = ABIL_ICON[A.icon]; b.title = `${A.name} — ${A.key}. ${A.d}`; });
    $('#actPot .ico').innerHTML = ABIL_ICON.potion;
    $('#actAttack').title = `Удар — пробел (держать)`; $('#actPot').title = 'Зелье здоровья — Q';
    H.lockLvl = -1;
    $('#btnBag').innerHTML = ABIL_ICON.bag; $('#btnMap').innerHTML = ABIL_ICON.map; $('#btnMenu').innerHTML = ABIL_ICON.menu;
    $('#pfName').textContent = G.hero.name;
    $('#pfRing').style.borderColor = C.color;
    $('#zoneName').textContent = G.W.Z.name;
  };
  H.update = () => {
    const G = H.G, P = G.P, h = G.hero, st = G.st, C = CLASSES[h.cls];
    // портрет перерисовываем только при смене вещей
    const L = lookOf(h), key = JSON.stringify(L);
    if (key !== H.portraitKey) { H.portraitKey = key; const c = $('#pfCanvas').getContext('2d'); c.clearRect(0, 0, 160, 160); doll(c, 74, 150, 5.0, 1, L, 0.3); }
    $('#pfLvl').textContent = h.lvl;
    setBar('#pfHp', P.hp / st.maxHp, `${Math.ceil(P.hp)} / ${st.maxHp}`);
    const need = xpNeed(h.lvl); setBar('#pfXp', isFinite(need) ? h.xp / need : 1, isFinite(need) ? `опыт ${h.xp} / ${need}` : 'наивысший уровень');
    $('#pfWeak').hidden = !(P.weak > 0); if (P.weak > 0) $('#pfWeak').textContent = `слабость ${Math.ceil(P.weak)} с`;
    $('#pfPoison').hidden = !P.poison;
    // цель
    const t = P.target && P.target.state !== 'dead' ? P.target : null, tf = $('#target');
    tf.hidden = !t;
    if (t) {
      $('#tgName').textContent = t.D.name; $('#tgLvl').textContent = (t.D.rare ? '★ ' : '') + t.lvl; $('#tgLvl').style.color = lvlColor(t.lvl, h.lvl);
      setBar('#tgHp', t.hp / t.max, `${Math.ceil(t.hp)} / ${t.max}`);
      $('#tgNote').textContent = t.D.rare ? 'Редкий и сильный' : t.state === 'return' ? 'Уходит домой' : '';
    }
    // панель действий
    C.abils.forEach((A, i) => cool(i ? '#actAbil2' : '#actAbil', P.acd[A.id] || 0, A.cd)); cool('#actPot', P.potCd, 20);
    // второе умение закрыто до своего уровня; когда открылось — кнопка мигает
    if (H.lockLvl !== h.lvl) { const A = C.abils[1], open = h.lvl >= A.lvl, b = $('#actAbil2'); const lk = b.querySelector('.lock'); lk.hidden = open; lk.querySelector('b').textContent = `${A.lvl} ур.`; if (open && H.lockLvl > 0 && H.lockLvl < A.lvl) { b.classList.add('ready'); setTimeout(() => b.classList.remove('ready'), 5000); } H.lockLvl = h.lvl; } cool('#actAttack', P.cd, attackOf(h).cd);
    $('#actPot .n').textContent = h.potions;
    const gk = h.gold; if (gk !== H.goldK) { H.goldK = gk; $('#gold').innerHTML = moneyHtml(gk); }
    $('#pfFist').hidden = !st.unarmed;
    drawMini($('#mini'), G, H);
  };
  function setBar(sel, k, txt) { const b = $(sel); b.firstElementChild.style.width = Math.max(0, Math.min(1, k)) * 100 + '%'; b.lastElementChild.textContent = txt; }
  function cool(sel, t, max) { const e = $(sel + ' .cd'); if (t > 0.05) { e.style.height = Math.min(1, t / max) * 100 + '%'; e.nextElementSibling.textContent = t > 1 ? Math.ceil(t) : ''; } else { e.style.height = '0'; e.nextElementSibling.textContent = ''; } }

  return H;
}

export { fmt1 };
