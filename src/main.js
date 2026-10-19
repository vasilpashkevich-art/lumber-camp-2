// Запуск игры: экран выбора героя → мир. Связывает ход игры, рисование, интерфейс и звук.
import { startHearth } from './systems/hearth.js';
import { toggleMount } from './systems/mount.js';
import * as Q from './systems/quests.js';
import { ZONES } from '../data/zones.js';
import { buildNav } from './world/relief.js';
import { buildWorld, inCity } from './world/world.js';
import { createGame, update, abilsOf, refreshStats, trinketProc } from './systems/game.js';
import { addStack } from './systems/mining.js';
import { loadHero, saveHero, migrate, loadShared, saveShared, prefs } from './engine/save.js';
import { createRenderer, render, ZOOM } from './engine/render.js';
import { createInput } from './engine/input.js';
import { soundInit, sfx, music, setSound, soundState } from './engine/audio.js';
import { showSelect } from './ui/select.js';
import { createHud } from './ui/hud.js';
import { talentRows, talentFree } from './systems/talents.js';
import { openChar, openVendor, openMenu, showDeath, hideTip, openLoot, openAbils, openGuild, openSmelt, openBank, openProf, openDungeons, openNpc, openJournal , openInn, openStable, craftRedraw, openHowTo, openBoard, openRoyal } from './ui/windows.js';
import { dgLeave } from './systems/dungeon.js';
import { openMap, miniZoom, miniZoomLevel, MINI_Z } from './ui/map.js';
import { doll } from './art/body.js';
import { spriteClear, spriteStats } from './art/sprites.js';
import { initInstall } from './ui/install.js';
import { rollDrop, makeItem, makeTrinket, makeStack, makePick } from './systems/items.js';
import { LOOT, CRAFT } from '../data/balance.js';
import { dist, due } from './engine/util.js';
import { NPCS } from '../data/quests.js';
import * as ORD from './systems/orders.js';
import { $, toast, zoneTitle, TOUCH, T } from './ui/dom.js';
import { RAR_COL } from '../data/balance.js';

const VERSION = 131;
/** Приближение камеры на шаг: +1 ближе, −1 дальше. */
let zoomT = 0;
function zoomBy(d) {
  if (!R) return; const ok = R.zoom(d > 0 ? ZOOM.step : 1 / ZOOM.step), e = $('#zoomInd');
  e.textContent = ok ? `Приближение ${Math.round(R.uz / ZOOM.def * 100)}%` : d > 0 ? 'Ближе нельзя' : 'Дальше нельзя';
  e.classList.add('on'); clearTimeout(zoomT); zoomT = setTimeout(() => e.classList.remove('on'), 900);
}
// v70: в памяти только текущий край — прошлый выгружается вместе с его готовыми картинками (на телефоне память ограничена)
const WORLDS = {}; const worldOf = id => {
  if (WORLDS[id]) return WORLDS[id];
  for (const k in WORLDS) delete WORLDS[k];
  spriteClear();
  const w = WORLDS[id] = buildWorld(ZONES[id] || ZONES.pine);
  if (w.relief) w.nav = buildNav(w);   // сетка пути по рельефу — сразу при входе, а не рывком посреди игры
  return w;
};
let W = null, G = null, R = null, In = null, hud = null, raf = 0, last = 0, saveT = 0, musicT = 0, paused = false;

function boot() {
  const cv = $('#game');
  if (TOUCH) document.documentElement.classList.add('touch');
  initInstall();
  R = createRenderer(cv); In = createInput(cv); hud = createHud(In);
  In.onPinch = k => { if (G && !document.querySelector('.modal')) zoomBy(k > 1 ? 1 : -1); };
  addEventListener('resize', () => R.resize());
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, () => { if (soundState().on) soundInit(); }, { passive: true }));
  In.onKey = (code) => {
    if (!G) return;
    if (document.querySelector('.modal')) return;   // окно само закроется по Esc
    if (code === 'Escape') { menu(); return false; }
    if (code === 'KeyI' || code === 'KeyB') { charWin(); return false; }
    if (code === 'KeyK') { mapWin(); return false; }
    if (code === 'KeyP') { profWin(); return false; }
    if (code === 'KeyJ') { dgWin(); return false; }
    if (code === 'KeyL') { qWin(); return false; }
    if (code === 'Equal' || code === 'NumpadAdd') { zoomBy(1); return false; }
    if (code === 'Minus' || code === 'NumpadSubtract') { zoomBy(-1); return false; }
    if (code === 'KeyM') { setSound(!soundState().on); toast(soundState().on ? 'Звук включён' : 'Звук выключен', '', 'snd'); return false; }
  };
  // приближение: колесо мыши над игрой, +/−; у мини-карты — свои кнопки
  cv.addEventListener('wheel', e => { if (!G || document.querySelector('.modal')) return; e.preventDefault(); zoomBy(e.deltaY < 0 ? 1 : -1); }, { passive: false });
  const miniBtns = () => { const z = miniZoomLevel(); for (const b of document.querySelectorAll('#miniZ button')) b.disabled = +b.dataset.z > 0 ? z >= MINI_Z.length - 1 : z <= 0; };
  for (const b of document.querySelectorAll('#miniZ button')) b.onclick = e => { e.stopPropagation(); miniZoom(+b.dataset.z); miniBtns(); };
  miniBtns();
  $('#btnBag').onclick = () => charWin(); $('#btnHearth').onclick = () => { if (G && !document.querySelector('.modal')) startHearth(G); }; $('#btnMount').onclick = () => { if (G && !document.querySelector('.modal')) { toggleMount(G); hud.update(); } }; $('#btnMenu').onclick = () => menu(); $('#btnMap').onclick = () => mapWin(); $('#btnProf').onclick = () => profWin(); $('#btnDg').onclick = () => dgWin(); $('#btnQuest').onclick = () => qWin(); $('#qtrack').onclick = () => qWin(); $('#mini').onclick = () => mapWin(); $('#pfRing').onclick = () => { if (G && !document.querySelector('.modal')) devWin(); };
  $('#ver').textContent = 'версия ' + VERSION;
  if (location.hash === '#dev') window.__G = { get G() { return G; }, start, toSelect, R: () => R, rollDrop, makeItem, doll, makeTrinket, makeStack, makePick, addStack, refresh: () => { refreshStats(G); hud.update(); }, spriteStats, Q, trinketProc, CRAFT, openHowTo, orders: ORD };
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
  G = createGame(hero, W); G.shared = loadShared();
  R.cam.x = G.P.x; R.cam.y = G.P.y - G.W.hAt(G.P.x, G.P.y);
  $('#hud').hidden = false; $('#game').hidden = false;
  hud.bind(G); In.clear();
  last = performance.now(); raf = requestAnimationFrame(frame);
  if (!hero.howTo && location.hash !== '#dev') { hero.howTo = true; paused = true; openHowTo(() => { paused = false; }); }   // v124: новичку — «Как играть» (в #dev для снимков не открывается само — __G.openHowTo)
  saveHero(hero);
}

function stop() { cancelAnimationFrame(raf); if (G) { persist(); G = null; } }

/** Перейти в другую зону по дороге: сохранить героя на месте прихода и построить новый мир. */
function goZone(e) {
  const h = G.hero; if (G.W.Z.dungeon) dgLeave(h, G.W.Z);   // v90: вышел из подземелья — пошёл отсчёт до обновления
  h.zone = e.zone; h.pos = { x: e.at.x, y: e.at.y }; h.hp = Math.round(G.P.hp);
  saveHero(h); keepShared(); const sh = G.shared; W = worldOf(e.zone);
  G = createGame(h, W); G.shared = sh; R.cam.x = G.P.x; R.cam.y = G.P.y - G.W.hAt(G.P.x, G.P.y); hud.bind(G); In.clear();
  zoneTitle(W.Z.name, `уровни ${W.Z.lvl[0]}–${W.Z.lvl[1]}`);
}

/** Окно развития героя (умения и таланты); у наставника — со сбросом. */
function devWin(mentor = false) { const m = openAbils(G, { mentor, onChange: () => { persist(); hud.update(); } }); return m; }
function persist() { if (!G) return; const h = G.hero; h.pos = { x: Math.round(G.P.x), y: Math.round(G.P.y) }; h.hp = Math.round(G.P.hp); saveHero(h); keepShared(); }
/** Общий сундук всех героев — свой ключ; пишется, когда в нём что-то поменялось. */
function keepShared() { if (G && G.sharedDirty && G.shared) { saveShared(G.shared); G.sharedDirty = false; } }

function charWin() { if (!G) return; openChar(G, () => hud.update()); }
/** Окно «Подземелья» (v90, J): описание, боссы, время до обновления. */
function qWin() { if (!G || document.querySelector('.modal')) return; openJournal(G, () => { hud.update(); persist(); }); }
function dgWin() { if (!G || document.querySelector('.modal')) return; openDungeons(G); }
function mapWin() { if (!G || document.querySelector('.modal')) return; openMap(G); }
function profWin(opts = {}) { if (!G) return; const m = document.querySelector('.modal'); if (m) { if (m.querySelector('.box').isProf) m.querySelector('.box').close(); return; } openProf(G, () => hud.update(), opts); }
let lootWin = null;
function menu() { if (!G) return; paused = true; const m = openMenu({ inGame: true, onExit: () => toSelect() }); const oc = m.onclose; m.onclose = () => { paused = false; oc && oc(); }; }

/** v125: счётчик кадров (галочка в меню) — сколько кадров в секунду рисует игра. */
function fpsTick(now) {
  if (!prefs.get('fps', false)) { if (FPS.el) { FPS.el.remove(); FPS.el = null; } return; }
  if (!FPS.el) { FPS.el = document.createElement('div'); FPS.el.id = 'fpsBox'; document.body.append(FPS.el); FPS.t = now; FPS.n = 0; }
  FPS.n++; if (now - FPS.t >= 1000) { FPS.el.textContent = Math.round(FPS.n * 1000 / (now - FPS.t)) + ' кадр/с'; FPS.t = now; FPS.n = 0; }
}
/** v109: кадр под защитой — ошибка в окне или рисовании не останавливает игру (раньше герой «зависал» до перезахода). */
let crashT = 0;
const PACE = {}, FPS = { n: 0, t: 0, el: null };
function frame(now) {
  // v125: не больше 60 кадров (экраны 90–120 Гц рисовали бы вдвое больше), при открытом окне — 30
  if (G && !due(PACE, now, document.querySelector('.modal') ? 1000 / 30 : 1000 / 60)) { raf = requestAnimationFrame(frame); return; }
  if (FPS.el || prefs.get('fps', false)) fpsTick(now);
  try { frameInner(now); }
  catch (err) {
    console.error('кадр', err); if (G) G.ev.length = 0;
    document.querySelectorAll('.modal .box').forEach(b => { try { b.close(); } catch (e) { b.parentElement && b.parentElement.remove(); } });
    document.querySelectorAll('.modal').forEach(m => m.remove()); paused = false;
    if (now - crashT > 3000) { crashT = now; toast('Окно закрылось из-за ошибки — игра продолжается', '', 'crash'); }
    if (G) raf = requestAnimationFrame(frame);
  }
}
function frameInner(now) {
  if (!G) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const modalOpen = !!document.querySelector('.modal');
  const toWorld = (sx, sy) => { const x = R.cam.x + (sx * R.dpr - R.cv.width / 2) / R.cam.z, ys = R.cam.y + (sy * R.dpr - R.cv.height / 2) / R.cam.z; return { x, y: G.W.ground(x, ys) }; };   // рельеф: точка экрана → земля
  const I = modalOpen ? (In.read(), {}) : In.read(toWorld, G.hero.bar);
  if (!paused && !G.P.dead) update(G, dt, I);
  else if (!paused) update(G, dt, {});
  // события
  for (const e of G.ev) {
    if (e.k === 'sfx') sfx(e.n);
    if (e.k === 'toast') toast(e.s, e.kind || '', e.id);
    if (e.k === 'loot') { toast(`Добыча: <b style="color:${RAR_COL[e.it.rar]}">${e.it.name}</b>`, '', null); sfx('loot'); }
    if (e.k === 'lvl') { toast(`Новый уровень: ${e.L}! Здоровье восстановлено.`, 'good'); const A = abilsOf(G.hero).find(a => a.lvl === e.L); if (A) toast(A.key === 'passive' ? `Новое умение: <b>${A.name}</b> — работает само. ${A.d}` : `Новое умение: <b>${A.name}</b> — ${T('клавиша ' + A.key, 'новая кнопка справа')}. ${A.d}`, 'good'); if (talentRows(G.hero).some(r => r.lvl === e.L)) toast(`Открыт ряд талантов! ${T('Щёлкните', 'Коснитесь')} портрет героя и выберите один.`, 'good'); }
    if (e.k === 'vendor' && !document.querySelector('.modal')) openVendor(G, () => hud.update(), e.b);
    if (e.k === 'npc' && !document.querySelector('.modal')) { if (NPCS[e.id] && NPCS[e.id].special === 'royal') openRoyal(G, () => { hud.update(); persist(); }); else openNpc(G, e.id, () => { hud.update(); persist(); }); }   // v126: квартирмейстер
    if (e.k === 'board' && !document.querySelector('.modal')) openBoard(G, e.b.zone, () => { hud.update(); persist(); });   // v126: доска заказов
    if (e.k === 'guild' && !document.querySelector('.modal')) openGuild(G, () => hud.update());
    if (e.k === 'mentor' && !document.querySelector('.modal')) devWin(true);
    if (e.k === 'bank' && !document.querySelector('.modal')) { const bm = openBank(G, () => hud.update()), oc = bm.onclose; bm.onclose = () => { oc && oc(); persist(); }; }
    if (e.k === 'smelt' && !document.querySelector('.modal')) openSmelt(G, () => hud.update());
    if (e.k === 'alchemy' && !document.querySelector('.modal')) profWin({ teach: !!e.b.alchemy, brew: true, tab: 'alchemy' });
    if (e.k === 'enchant' && !document.querySelector('.modal')) profWin({ teachEnch: true, tab: 'enchant' });
    if (e.k === 'jewel' && !document.querySelector('.modal')) profWin({ teachJewel: true, tab: 'jewel' });
    if (e.k === 'skill') toast(e.s, 'good', 'skill');
    if (e.k === 'craft') craftRedraw();   // v112: окно ремесла — новые числа после каждой вещи
    if (e.k === 'barSwap') { persist(); toast('Ячейки панели поменяны местами — клавиши остались у ячеек', '', 'bar'); }
    if (e.k === 'zone') { goZone(e.e); break; }
    if (e.k === 'hearth') { goZone({ zone: e.zone, at: e.at }); toast(`Вы дома: ${e.name}`, 'good', 'hearth'); break; }   // v108: камень возвращения в другую зону
    if (e.k === 'cam') { R.cam.x = G.P.x; R.cam.y = G.P.y - G.W.hAt(G.P.x, G.P.y); }
    if (e.k === 'stable' && !document.querySelector('.modal')) openStable(G, () => { hud.update(); persist(); });
    if (e.k === 'mounts') hud.update();
    if (e.k === 'inn' && !document.querySelector('.modal')) openInn(G, e.b, () => { hud.update(); persist(); }, () => profWin({ brew: true, tab: 'alchemy' }));
    if (e.k === 'boss') { toast(e.final ? `<b>${e.name}</b> повержен! Храм очищен — у трона открылся портал наружу` : `<b>${e.name}</b> ${e.fem ? 'повержена' : 'повержен'}!`, 'good'); sfx('levelUp'); }
    if (e.k === 'lootOpen' && !document.querySelector('.modal')) { lootWin = openLoot(G, e.c, () => hud.update()); const oc = lootWin.onclose; lootWin.onclose = () => { lootWin = null; oc && oc(); }; }
    if (e.k === 'die') { sfx('die'); setTimeout(() => G && showDeath(G, () => hud.update()), 900); }
  }
  // подсумок закрывается, если отошли от тела или тело исчезло
  if (lootWin && (dist(G.P.x, G.P.y, lootWin.corpse.x, lootWin.corpse.y) > LOOT.lootR + 50 || !G.corpses.includes(lootWin.corpse) || G.P.dead)) lootWin.close();
  render(R, G, now);
  G.ev.length = 0;
  hud.update();
  if ((musicT -= dt) <= 0) { musicT = 1; music(G.W.Z.theme || 'day', !G.W.Z.dungeon && inCity(G.W, G.P.x, G.P.y)); }
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
