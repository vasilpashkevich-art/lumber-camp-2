// Интерфейс во время игры (в духе WoW): портрет с уровнем, здоровьем и опытом; рамка цели;
// панель действий внизу; мини-карта, зона и золото справа сверху.
import { CLASSES } from '../../data/classes.js';
import { xpNeed, lvlColor } from '../../data/balance.js';
import { lookOf } from '../systems/items.js';
import { doll } from '../art/hero.js';
import { ABIL_ICON } from './icons.js';
import { $ } from './dom.js';
import { fmt1 } from '../engine/util.js';

export function createHud(In) {
  const H = { portraitKey: '', mini: null };
  const cls = () => H.G.hero.cls;
  // кнопки действий (и для мыши, и для пальца)
  In.button($('#actAttack'), 'Attack', true);
  In.button($('#actAbil'), 'KeyC');
  In.button($('#actPot'), 'KeyQ');
  In.button($('#actUse'), 'KeyE');
  H.bind = G => {
    H.G = G; H.portraitKey = ''; H.mini = null;
    const C = CLASSES[cls()];
    $('#actAttack .ico').innerHTML = ABIL_ICON.attack[cls()];
    $('#actAbil .ico').innerHTML = ABIL_ICON[C.abil.icon];
    $('#actPot .ico').innerHTML = ABIL_ICON.potion;
    $('#actAttack').title = `Удар — пробел (держать)`; $('#actAbil').title = `${C.abil.name} — C. ${C.abil.d}`; $('#actPot').title = 'Зелье здоровья — Q';
    $('#btnBag').innerHTML = ABIL_ICON.bag; $('#btnMenu').innerHTML = ABIL_ICON.menu;
    $('#pfName').textContent = G.hero.name;
    $('#pfRing').style.borderColor = C.color;
    $('#zoneName').textContent = G.W.Z.name;
  };
  H.update = () => {
    const G = H.G, P = G.P, h = G.hero, st = G.st, C = CLASSES[h.cls];
    // портрет перерисовываем только при смене вещей
    const L = lookOf(h), key = JSON.stringify(L);
    if (key !== H.portraitKey) { H.portraitKey = key; const c = $('#pfCanvas').getContext('2d'); c.clearRect(0, 0, 160, 160); doll(c, 80, 205, 7.2, 1, L, 0.3); }
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
    cool('#actAbil', P.abCd, C.abil.cd); cool('#actPot', P.potCd, 20); cool('#actAttack', P.cd, C.attack.cd);
    $('#actPot .n').textContent = h.potions;
    $('#gold').textContent = h.gold;
    mini(G);
  };
  function setBar(sel, k, txt) { const b = $(sel); b.firstElementChild.style.width = Math.max(0, Math.min(1, k)) * 100 + '%'; b.lastElementChild.textContent = txt; }
  function cool(sel, t, max) { const e = $(sel + ' .cd'); if (t > 0.05) { e.style.height = Math.min(1, t / max) * 100 + '%'; e.nextElementSibling.textContent = t > 1 ? Math.ceil(t) : ''; } else { e.style.height = '0'; e.nextElementSibling.textContent = ''; } }

  // мини-карта: вся зона, столица, кладбище, выходы и стрелка героя
  function mini(G) {
    const cv = $('#mini'), c = cv.getContext('2d'), W = G.W, w = cv.width, hgt = cv.height, k = Math.min(w / W.W, hgt / W.H);
    if (!H.mini) {
      const b = document.createElement('canvas'); b.width = w; b.height = hgt; const g = b.getContext('2d');
      g.fillStyle = '#1c2a1a'; g.fillRect(0, 0, w, hgt);
      g.beginPath(); W.edge.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.closePath(); g.fillStyle = '#5d8a42'; g.fill();
      g.strokeStyle = '#c9b48a'; g.lineWidth = 2; for (const rd of W.roads) { g.beginPath(); rd.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.stroke(); }
      g.fillStyle = '#2f5d2a'; for (const t of W.trees) if (!t.edge) g.fillRect(t.x * k - 1, t.y * k - 1, 2, 2);
      g.fillStyle = '#d9c79a'; g.strokeStyle = '#4a3a24'; g.lineWidth = 1.5; g.beginPath(); g.arc(W.cap.x * k, W.cap.y * k, W.cap.R * k, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#eee'; g.fillRect(W.graveyard.x * k - 1, W.graveyard.y * k - 4, 2, 8); g.fillRect(W.graveyard.x * k - 3, W.graveyard.y * k - 2, 6, 2);
      for (const e of W.exits) { g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(e.x * k, e.y * k, 3, 0, 7); g.fill(); }
      H.mini = b;
    }
    c.drawImage(H.mini, 0, 0);
    const P = G.P;
    c.save(); c.translate(P.x * k, P.y * k); c.rotate(Math.atan2(P.dir > 0 ? 0 : 0, P.dir) ); c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(0, 0, 3.5, 0, 7); c.fill(); c.stroke(); c.restore();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; const vw = 1150 * k, vh = vw * innerHeight / innerWidth; c.strokeRect(P.x * k - vw / 2, P.y * k - vh / 2, vw, vh);
  }
  return H;
}

export { fmt1 };
