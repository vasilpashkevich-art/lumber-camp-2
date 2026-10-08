// Запуск игры: экран выбора героя → мир. Связывает ход игры, рисование, интерфейс и звук.
import { PINE } from '../data/zones.js';
import { buildWorld, inCity } from './world/world.js';
import { createGame, update, abilsOf } from './systems/game.js';
import { loadHero, saveHero, migrate } from './engine/save.js';
import { createRenderer, render } from './engine/render.js';
import { createInput } from './engine/input.js';
import { soundInit, sfx, music, setSound, soundState } from './engine/audio.js';
import { showSelect } from './ui/select.js';
import { createHud } from './ui/hud.js';
import { openChar, openVendor, openMenu, showDeath, hideTip, openLoot, openAbils } from './ui/windows.js';
import { openMap } from './ui/map.js';
import { doll } from './art/hero.js';
import { rollDrop, makeItem } from './systems/items.js';
import { LOOT } from '../data/balance.js';
import { dist } from './engine/util.js';
import { $, toast } from './ui/dom.js';
import { RAR_COL } from '../data/balance.js';

const VERSION = 55;
let W = null, G = null, R = null, In = null, hud = null, raf = 0, last = 0, saveT = 0, musicT = 0, paused = false;

function boot() {
  const cv = $('#game');
  R = createRenderer(cv); In = createInput(cv); hud = createHud(In);
  addEventListener('resize', () => R.resize());
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, () => { if (soundState().on) soundInit(); }, { passive: true }));
  In.onKey = (code) => {
    if (!G) return;
    if (document.querySelector('.modal')) return;   // окно само закроется по Esc
    if (code === 'Escape') { menu(); return false; }
    if (code === 'KeyI' || code === 'KeyB') { charWin(); return false; }
    if (code === 'KeyK') { mapWin(); return false; }
    if (code === 'KeyM') { setSound(!soundState().on); toast(soundState().on ? 'Звук включён' : 'Звук выключен', '', 'snd'); return false; }
  };
  $('#btnBag').onclick = () => charWin(); $('#btnMenu').onclick = () => menu(); $('#btnMap').onclick = () => mapWin(); $('#mini').onclick = () => mapWin(); $('#pfRing').onclick = () => { if (G && !document.querySelector('.modal')) openAbils(G); };
  $('#ver').textContent = 'версия ' + VERSION;
  if (location.hash === '#dev') window.__G = { get G() { return G; }, start, toSelect, R: () => R, rollDrop, makeItem, doll };
  toSelect();
}

function toSelect() {
  stop();
  $('#hud').hidden = true; $('#game').hidden = true;
  music(null, false);
  showSelect({ onEnter: id => start(id), onSettings: () => openMenu({ inGame: false }) });
}

function start(id) {
  const hero = migrate(loadHero(id));
  if (!hero) { toast('Не удалось загрузить героя'); toSelect(); return; }
  // время мира идёт и без нас: мобы успевают возродиться (не больше часа)
  hero.worldT = (hero.worldT || 0) + Math.min(3600, Math.max(0, (Date.now() - (hero.seen || Date.now())) / 1000));
  if (!W) W = buildWorld(PINE);
  G = createGame(hero, W);
  R.cam.x = G.P.x; R.cam.y = G.P.y;
  $('#hud').hidden = false; $('#game').hidden = false;
  hud.bind(G); In.clear();
  last = performance.now(); raf = requestAnimationFrame(frame);
  if (!hero.stats.play) toast(`Добро пожаловать в Сосновый дол! Мобы бродят за стенами Столицы. Пробел — бить, C — умение, X — отдых, K — карта, E — обыскать или поговорить.`, 'good');
  saveHero(hero);
}

function stop() { cancelAnimationFrame(raf); if (G) { persist(); G = null; } }

function persist() { if (!G) return; const h = G.hero; h.pos = { x: Math.round(G.P.x), y: Math.round(G.P.y) }; h.hp = Math.round(G.P.hp); saveHero(h); }

function charWin() { if (!G) return; openChar(G, () => hud.update()); }
function mapWin() { if (!G || document.querySelector('.modal')) return; openMap(G); }
let lootWin = null;
function menu() { if (!G) return; paused = true; const m = openMenu({ inGame: true, onExit: () => toSelect() }); const oc = m.onclose; m.onclose = () => { paused = false; oc && oc(); }; }

function frame(now) {
  if (!G) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const modalOpen = !!document.querySelector('.modal');
  const toWorld = (sx, sy) => ({ x: R.cam.x + (sx * R.dpr - R.cv.width / 2) / R.cam.z, y: R.cam.y + (sy * R.dpr - R.cv.height / 2) / R.cam.z });
  const I = modalOpen ? (In.read(), {}) : In.read(toWorld);
  if (!paused && !G.P.dead) update(G, dt, I);
  else if (!paused) update(G, dt, {});
  // события
  for (const e of G.ev) {
    if (e.k === 'sfx') sfx(e.n);
    if (e.k === 'toast') toast(e.s, e.kind || '', e.id);
    if (e.k === 'loot') { toast(`Добыча: <b style="color:${RAR_COL[e.it.rar]}">${e.it.name}</b>`, '', null); sfx('loot'); }
    if (e.k === 'lvl') { toast(`Новый уровень: ${e.L}! Здоровье восстановлено.`, 'good'); const A = abilsOf(G.hero).find(a => a.lvl === e.L); if (A) toast(`Новое умение: <b>${A.name}</b> — клавиша ${A.key}. ${A.d}`, 'good'); }
    if (e.k === 'vendor') openVendor(G, () => hud.update());
    if (e.k === 'lootOpen' && !document.querySelector('.modal')) { lootWin = openLoot(G, e.c, () => hud.update()); const oc = lootWin.onclose; lootWin.onclose = () => { lootWin = null; oc && oc(); }; }
    if (e.k === 'die') { sfx('die'); setTimeout(() => G && showDeath(G, () => hud.update()), 900); }
  }
  // подсумок закрывается, если отошли от тела или тело исчезло
  if (lootWin && (dist(G.P.x, G.P.y, lootWin.corpse.x, lootWin.corpse.y) > LOOT.lootR + 50 || !G.corpses.includes(lootWin.corpse) || G.P.dead)) lootWin.close();
  render(R, G, now);
  G.ev.length = 0;
  hud.update();
  if ((musicT -= dt) <= 0) { musicT = 1; music('day', inCity(G.W, G.P.x, G.P.y)); }
  if ((saveT += dt) > 10) { saveT = 0; persist(); }
  raf = requestAnimationFrame(frame);
}

addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
addEventListener('pagehide', persist);
addEventListener('beforeunload', persist);

boot();
