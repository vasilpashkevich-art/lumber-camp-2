// Запуск игры: экран выбора героя → мир. Связывает ход игры, рисование, интерфейс и звук.
import { ZONES } from '../data/zones.js';
import { buildWorld, inCity } from './world/world.js';
import { createGame, update, abilsOf, refreshStats } from './systems/game.js';
import { addStack } from './systems/mining.js';
import { loadHero, saveHero, migrate } from './engine/save.js';
import { createRenderer, render, ZOOM } from './engine/render.js';
import { createInput } from './engine/input.js';
import { soundInit, sfx, music, setSound, soundState } from './engine/audio.js';
import { showSelect } from './ui/select.js';
import { createHud } from './ui/hud.js';
import { openChar, openVendor, openMenu, showDeath, hideTip, openLoot, openAbils, openGuild, openSmelt } from './ui/windows.js';
import { openMap, miniZoom, miniZoomLevel, MINI_Z } from './ui/map.js';
import { doll } from './art/body.js';
import { rollDrop, makeItem, makeTrinket, makeStack, makePick } from './systems/items.js';
import { LOOT } from '../data/balance.js';
import { dist } from './engine/util.js';
import { $, toast, zoneTitle } from './ui/dom.js';
import { RAR_COL } from '../data/balance.js';

const VERSION = 68;
/** Приближение камеры на шаг: +1 ближе, −1 дальше. */
let zoomT = 0;
function zoomBy(d) {
  if (!R) return; const ok = R.zoom(d > 0 ? ZOOM.step : 1 / ZOOM.step), e = $('#zoomInd');
  e.textContent = ok ? `Приближение ${Math.round(R.uz / ZOOM.def * 100)}%` : d > 0 ? 'Ближе нельзя' : 'Дальше нельзя';
  e.classList.add('on'); clearTimeout(zoomT); zoomT = setTimeout(() => e.classList.remove('on'), 900);
}
const WORLDS = {}; const worldOf = id => WORLDS[id] || (WORLDS[id] = buildWorld(ZONES[id] || ZONES.pine));
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
    if (code === 'Equal' || code === 'NumpadAdd') { zoomBy(1); return false; }
    if (code === 'Minus' || code === 'NumpadSubtract') { zoomBy(-1); return false; }
    if (code === 'KeyM') { setSound(!soundState().on); toast(soundState().on ? 'Звук включён' : 'Звук выключен', '', 'snd'); return false; }
  };
  // приближение: колесо мыши над игрой, +/−; у мини-карты — свои кнопки
  cv.addEventListener('wheel', e => { if (!G || document.querySelector('.modal')) return; e.preventDefault(); zoomBy(e.deltaY < 0 ? 1 : -1); }, { passive: false });
  const miniBtns = () => { const z = miniZoomLevel(); for (const b of document.querySelectorAll('#miniZ button')) b.disabled = +b.dataset.z > 0 ? z >= MINI_Z.length - 1 : z <= 0; };
  for (const b of document.querySelectorAll('#miniZ button')) b.onclick = e => { e.stopPropagation(); miniZoom(+b.dataset.z); miniBtns(); };
  miniBtns();
  $('#btnBag').onclick = () => charWin(); $('#btnMenu').onclick = () => menu(); $('#btnMap').onclick = () => mapWin(); $('#mini').onclick = () => mapWin(); $('#pfRing').onclick = () => { if (G && !document.querySelector('.modal')) openAbils(G); };
  $('#ver').textContent = 'версия ' + VERSION;
  if (location.hash === '#dev') window.__G = { get G() { return G; }, start, toSelect, R: () => R, rollDrop, makeItem, doll, makeTrinket, makeStack, makePick, addStack, refresh: () => { refreshStats(G); hud.update(); } };
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
  if (!ZONES[hero.zone]) hero.zone = 'pine';
  W = worldOf(hero.zone);
  G = createGame(hero, W);
  R.cam.x = G.P.x; R.cam.y = G.P.y;
  $('#hud').hidden = false; $('#game').hidden = false;
  hud.bind(G); In.clear();
  last = performance.now(); raf = requestAnimationFrame(frame);
  if (!hero.stats.play) toast(`Добро пожаловать в Сосновый дол! Мобы бродят за стенами Столицы. Пробел — бить, C — умение, X — отдых, K — карта, E — обыскать или поговорить.`, 'good');
  saveHero(hero);
}

function stop() { cancelAnimationFrame(raf); if (G) { persist(); G = null; } }

/** Перейти в другую зону по дороге: сохранить героя на месте прихода и построить новый мир. */
function goZone(e) {
  const h = G.hero; h.zone = e.zone; h.pos = { x: e.at.x, y: e.at.y }; h.hp = Math.round(G.P.hp);
  saveHero(h); W = worldOf(e.zone);
  G = createGame(h, W); R.cam.x = G.P.x; R.cam.y = G.P.y; hud.bind(G); In.clear();
  zoneTitle(W.Z.name, `уровни ${W.Z.lvl[0]}–${W.Z.lvl[1]}`);
}

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
    if (e.k === 'vendor' && !document.querySelector('.modal')) openVendor(G, () => hud.update(), e.b);
    if (e.k === 'guild' && !document.querySelector('.modal')) openGuild(G, () => hud.update());
    if (e.k === 'smelt' && !document.querySelector('.modal')) openSmelt(G, () => hud.update());
    if (e.k === 'skill') toast(e.s, 'good', 'skill');
    if (e.k === 'zone') { goZone(e.e); break; }
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

// вкладка скрыта — браузер останавливает игру; при возврате засчитываем это время миру (как при выходе, не больше часа)
let hiddenAt = 0;
addEventListener('visibilitychange', () => {
  if (document.hidden) { persist(); hiddenAt = Date.now(); return; }
  if (G && hiddenAt) { const gap = Math.min(3600, (Date.now() - hiddenAt) / 1000); if (gap > 1) { G.t += gap; for (const c of G.corpses) c.t -= gap; G.corpses = G.corpses.filter(c => c.t > 0); last = performance.now(); } }
  hiddenAt = 0;
});
addEventListener('pagehide', persist);
addEventListener('beforeunload', persist);

boot();
