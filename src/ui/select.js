// Экран входа: ночная поляна у костра, выбранный герой впереди — в том, что на нём надето.
import { doll } from '../art/body.js';
import { heroSpr, drawSpr } from '../art/sprites.js';
import { CLASSES, NAMES } from '../../data/classes.js';
import { listHeroes, deleteHero, saveHero, exportAll, importAll, MAX_SLOTS } from '../engine/save.js';
import { newHero } from '../entities/hero.js';
import { lookOf, starterLook, fxListOf } from '../systems/items.js';
import { gearFx } from '../art/gearfx.js';
import { rng, plural } from '../engine/util.js';
import { CONTINENT } from '../../data/zones.js';
import { $, el, modal, toast } from './dom.js';
import { moneyHtml } from './icons.js';
import { scene, campfire, title } from './selscene.js';
export const GAME_NAME = 'Континент';

// затемнённая копия готовой картинки (герои у костра за спиной выбранного); фильтры холста слишком медленные
const DARK = new WeakMap();
function darkOf(s) {
  if (!s) return null; if (DARK.has(s)) return DARK.get(s);
  const cv = document.createElement('canvas'); cv.width = s.cv.width; cv.height = s.cv.height;
  const g = cv.getContext('2d'); g.drawImage(s.cv, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(10,6,4,.45)'; g.fillRect(0, 0, cv.width, cv.height);
  const d = { ...s, cv }; DARK.set(s, d); return d;
}
const CN = c => CLASSES[c].name, CC = c => CLASSES[c].color;
const zoneName = id => (CONTINENT.find(z => z.id === id) || {}).name || '';
export const playTime = s => { const m = Math.round(s / 60); return m < 60 ? `${m} мин` : `${Math.floor(m / 60)} ч ${m % 60} мин`; };

export function showSelect({ onEnter, onSettings }) {
  const root = $('#select'); root.hidden = false; document.documentElement.classList.add('sel');
  const cv = $('#selCanvas'), c = cv.getContext('2d');
  let heroes = listHeroes(), sel = heroes.length ? 0 : -1, raf = 0, alive = true;
  try { const last = localStorage.getItem('lumber-camp2-last'); const i = heroes.findIndex(h => h.id === last); if (i >= 0) sel = i; } catch (e) { }

  function resize() { const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; }
  resize(); addEventListener('resize', resize);

  function draw(now) {
    if (!alive) return;
    const d = Math.min(2, devicePixelRatio || 1), Wd = innerWidth, Hd = innerHeight, t = now / 1000;
    c.setTransform(d, 0, 0, d, 0, 0);
    scene(c, Wd, Hd, t);
    const cx = Wd * 0.5, gy = Hd * 0.8, k = Math.min(Wd / 1600, Hd / 900) * 1.05 + 0.05;
    const others = heroes.map((h, i) => i).filter(i => i !== sel).slice(0, 4);
    others.forEach((i, n) => { const x = cx + (120 + n * 90) * k, y = gy - 56 * k; c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(x, y + 4 * k, 34 * k, 8 * k, 0, 0, 7); c.fill(); drawSpr(c, darkOf(heroSpr(lookOf(heroes[i]), -1)), x, y, 1, 3 * k); });
    campfire(c, cx + 25 * k, gy - 34 * k, 3.4 * k, t);
    if (sel >= 0) {
      c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(cx - 150 * k, gy + 16 * k, 86 * k, 17 * k, 0, 0, 7); c.fill();
      doll(c, cx - 150 * k, gy - 34 * k, 5.8 * k, 1, lookOf(heroes[sel]), t); gearFx(c, fxListOf(heroes[sel]), cx - 150 * k, gy - 34 * k + 12.6 * 5.8 * k, t, 37 * 5.8 * k);   // v92
      // тёплый отсвет костра на герое
      c.save(); c.globalCompositeOperation = 'source-atop'; c.restore();
    }
    const ts = Math.max(34, Math.min(Wd * 0.08, Hd * 0.105)); title(c, GAME_NAME, cx, Hd * 0.025 + ts * 0.95, ts);
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);

  function render() {
    heroes = listHeroes(); if (sel >= heroes.length) sel = heroes.length - 1;
    const list = $('#selList'); list.innerHTML = '';
    for (let i = 0; i < MAX_SLOTS; i++) {
      const h = heroes[i];
      if (!h) { const b = el('button', 'slot empty', `<span>${ICO.plus}Свободное место</span>`); b.onclick = create; list.append(b); continue; }
      const b = el('button', 'slot ' + h.cls + (i === sel ? ' on' : ''), `<span class="medal"><canvas width="120" height="120"></canvas><span class="lvl">${h.lvl}</span></span><b>${esc(h.name)}</b><i style="color:${CC(h.cls)}">${classIcon(h.cls)}${CN(h.cls)}</i><small>${ICO.place}${zoneName(h.zone)}</small>`);
      b.onclick = () => { sel = i; render(); }; b.ondblclick = () => enter();
      list.append(b);
      const pc = b.querySelector('canvas').getContext('2d'); pc.save(); pc.beginPath(); pc.arc(60, 60, 58, 0, 7); const bg = pc.createRadialGradient(60, 40, 6, 60, 60, 60); bg.addColorStop(0, CC(h.cls) + 'aa'); bg.addColorStop(1, '#120c08'); pc.fillStyle = bg; pc.fill(); pc.clip(); doll(pc, 60, 172, 5.6, 1, lookOf(h), 0.3); pc.restore();
    }
    const info = $('#selInfo');
    if (sel < 0) { info.innerHTML = `<h2>Добро пожаловать</h2><p>Создайте первого героя: выберите класс и имя. Новый герой начинает в простой одежде у ворот Столицы.</p>`; }
    else {
      const h = heroes[sel];
      info.innerHTML = `<h2>${esc(h.name)}</h2><p class="cls" style="color:${CC(h.cls)}">${classIcon(h.cls)}${CN(h.cls)}, ${h.lvl} уровень</p>
        <dl><dt>${ICO.place}Где сейчас</dt><dd>${zoneName(h.zone)}</dd><dt>${ICO.time}В игре</dt><dd>${playTime(h.play || 0)}</dd><dt>${ICO.coins}Деньги</dt><dd>${moneyHtml(h.gold || 0)}</dd><dt>${ICO.skull}Повержено</dt><dd>${h.kills || 0} ${plural(h.kills || 0, 'враг', 'врага', 'врагов')}</dd></dl>`;
    }
    $('#selEnter').disabled = sel < 0; $('#selDel').disabled = sel < 0;
    $('#selNew').disabled = heroes.length >= MAX_SLOTS;
  }

  function enter() { if (sel < 0) return; const id = heroes[sel].id; try { localStorage.setItem('lumber-camp2-last', id); } catch (e) { } close(); onEnter(id); }
  function close() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('keydown', onKey); root.hidden = true; document.documentElement.classList.remove('sel'); }

  function create() {
    if (listHeroes().length >= MAX_SLOTS) { toast('Все 5 мест заняты — удалите героя, чтобы создать нового'); return; }
    let cls = 'warrior';
    const pickName = c => { const a = NAMES[c]; return a[Math.floor(Math.random() * a.length)]; };
    const m = modal(`<h2>Новый герой</h2><div class="classes">${Object.keys(CLASSES).map(k => `<button class="clsCard" data-c="${k}"><canvas width="180" height="200"></canvas><b style="color:${CC(k)}">${CN(k)}</b><small>${CLASSES[k].desc}</small></button>`).join('')}</div>
      <label class="nm">Имя <input id="newName" maxlength="16" autocomplete="off"><button class="dice" title="Случайное имя">🎲</button></label>
      <p class="hint">Начнёт в рубахе, штанах и с простым оружием класса.</p>
      <div class="row"><button class="btn" data-x="cancel">Отмена</button><button class="btn main" data-x="ok">Создать</button></div>`, 'wide');
    const inp = m.querySelector('#newName');
    const paint = () => m.querySelectorAll('.clsCard').forEach(b => {
      b.classList.toggle('on', b.dataset.c === cls);
      const g = b.querySelector('canvas').getContext('2d'); g.clearRect(0, 0, 180, 200); doll(g, 90, 168, 4.2, 1, starterLook(b.dataset.c), 0.3);
    });
    m.querySelectorAll('.clsCard').forEach(b => b.onclick = () => { const was = NAMES[cls].includes(inp.value); cls = b.dataset.c; if (was || !inp.value) inp.value = pickName(cls); paint(); });
    m.querySelector('.dice').onclick = e => { e.preventDefault(); inp.value = pickName(cls); };
    inp.value = pickName(cls); paint(); setTimeout(() => inp.focus(), 50);
    const ok = () => {
      const name = inp.value.trim(); if (!name) { inp.focus(); return; }
      const h = newHero(name, cls); saveHero(h); m.close(); heroes = listHeroes(); sel = heroes.findIndex(x => x.id === h.id); render();
    };
    m.querySelector('[data-x=ok]').onclick = ok; m.querySelector('[data-x=cancel]').onclick = () => m.close();
    inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
  }

  function del() {
    if (sel < 0) return; const h = heroes[sel];
    const m = modal(`<h2>Удалить героя?</h2><p>«${esc(h.name)}», ${CN(h.cls).toLowerCase()} ${h.lvl} уровня, будет удалён навсегда вместе с вещами и деньгами.</p><div class="row"><button class="btn" data-x="no">Оставить</button><button class="btn danger" data-x="yes">Удалить</button></div>`);
    m.querySelector('[data-x=no]').onclick = () => m.close();
    m.querySelector('[data-x=yes]').onclick = () => { deleteHero(h.id); m.close(); sel = Math.min(sel, listHeroes().length - 1); render(); };
  }

  function toFile() {
    const txt = exportAll(), name = `lumber-camp-2-heroes-${new Date().toISOString().slice(0, 10)}.json`;
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); } catch (e) { }
    const m = modal(`<h2>Сохранить в файл</h2><p>Файл <b>${name}</b> должен был скачаться. Если нет — скопируйте текст ниже и сохраните его в любой файл.</p><textarea readonly rows="6">${esc(txt)}</textarea><div class="row"><button class="btn" data-x="copy">Скопировать</button><button class="btn main" data-x="ok">Готово</button></div>`, 'wide');
    m.querySelector('[data-x=copy]').onclick = () => { const ta = m.querySelector('textarea'); ta.select(); try { navigator.clipboard.writeText(txt).then(() => toast('Скопировано'), () => document.execCommand('copy')); } catch (e) { document.execCommand('copy'); } };
    m.querySelector('[data-x=ok]').onclick = () => m.close();
  }
  function fromFile() {
    const m = modal(`<h2>Загрузить из файла</h2><p>Выберите файл сохранения или вставьте его текст. Герои с тем же именем-номером обновятся, новые добавятся, пока есть места.</p><input type="file" accept=".json,application/json"><textarea rows="5" placeholder="…или вставьте текст сюда"></textarea><p class="err" hidden></p><div class="row"><button class="btn" data-x="no">Отмена</button><button class="btn main" data-x="ok">Загрузить</button></div>`, 'wide');
    const ta = m.querySelector('textarea'), er = m.querySelector('.err');
    m.querySelector('input[type=file]').onchange = e => { const f = e.target.files[0]; if (f) f.text().then(t => ta.value = t); };
    m.querySelector('[data-x=no]').onclick = () => m.close();
    m.querySelector('[data-x=ok]').onclick = () => {
      try { const r = importAll(ta.value); m.close(); render(); toast(`Загружено героев: ${r.added}` + (r.skipped ? `, не поместилось: ${r.skipped}` : '')); }
      catch (e) { er.hidden = false; er.textContent = e.message; }
    };
  }

  $('#selEnter').onclick = enter; $('#selNew').onclick = create; $('#selDel').onclick = del;
  $('#selSave').onclick = toFile; $('#selLoad').onclick = fromFile; $('#selSet').onclick = () => onSettings();
  const onKey = e => { if (document.querySelector('.modal')) return; if (e.key === 'Enter') enter(); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { const n = heroes.length; if (n) { sel = (sel + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; render(); } } };
  addEventListener('keydown', onKey);
  render();
}

const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
// значки экрана входа: объём, блик, тёмная обводка — как у иконок умений
const SV = (body, vb = '0 0 24 24') => `<svg class="ico" viewBox="${vb}" aria-hidden="true">${body}</svg>`;
export const ICO = {
  place: SV(`<path d="M12 2.5c-3.6 0-6.5 2.8-6.5 6.4 0 4.6 6.5 12.1 6.5 12.1s6.5-7.5 6.5-12.1c0-3.6-2.9-6.4-6.5-6.4z" fill="#d8503a" stroke="#24180f" stroke-width="1.5"/><circle cx="12" cy="9" r="2.6" fill="#ffe9a8" stroke="#24180f" stroke-width="1.2"/><path d="M8.5 6.5c.8-1.6 2.4-2.4 3.6-2.4" stroke="#ff9a8a" stroke-width="1.4" stroke-linecap="round" fill="none"/>`),
  time: SV(`<path d="M6 3h12v2.5c0 2.6-2.4 4.2-4 6.5 1.6 2.3 4 3.9 4 6.5V21H6v-2.5c0-2.6 2.4-4.2 4-6.5-1.6-2.3-4-3.9-4-6.5z" fill="#e8dcc4" stroke="#24180f" stroke-width="1.5"/><path d="M8.5 5.5h7c0 2-2 3.2-3.5 4.8C10.5 8.7 8.5 7.5 8.5 5.5zm3.5 8.2c1.5 1.6 3.5 2.8 3.5 4.8h-7c0-2 2-3.2 3.5-4.8z" fill="#e0a83a"/><path d="M5 2.5h14M5 21.5h14" stroke="#7a5a2a" stroke-width="2" stroke-linecap="round"/>`),
  coins: SV(`<ellipse cx="10" cy="15.5" rx="7" ry="3.2" fill="#b8862a" stroke="#24180f" stroke-width="1.4"/><ellipse cx="10" cy="13" rx="7" ry="3.2" fill="#e8c250" stroke="#24180f" stroke-width="1.4"/><ellipse cx="15" cy="9.5" rx="6.5" ry="3" fill="#b8862a" stroke="#24180f" stroke-width="1.4"/><ellipse cx="15" cy="7.2" rx="6.5" ry="3" fill="#ffd96a" stroke="#24180f" stroke-width="1.4"/><ellipse cx="15" cy="7.2" rx="3" ry="1.3" fill="#fff0b0"/>`),
  skull: SV(`<path d="M12 3c-4.4 0-7.5 3-7.5 7 0 2.4 1.2 4.3 3 5.5V19a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 16.5 19v-3.5c1.8-1.2 3-3.1 3-5.5 0-4-3.1-7-7.5-7z" fill="#ece4d0" stroke="#24180f" stroke-width="1.5"/><circle cx="9.2" cy="10.5" r="2" fill="#24180f"/><circle cx="14.8" cy="10.5" r="2" fill="#24180f"/><path d="M11 14.5l1-1.6 1 1.6z" fill="#24180f"/><path d="M10 17.5v2M12 17.5v2M14 17.5v2" stroke="#24180f" stroke-width="1.2"/>`),
  plus: SV(`<circle cx="12" cy="12" r="9" fill="#5a9a4a" stroke="#24180f" stroke-width="1.5"/><path d="M12 7.5v9M7.5 12h9" stroke="#f4ffe8" stroke-width="2.6" stroke-linecap="round"/>`),
  scroll: SV(`<path d="M5 5h13a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2z" fill="#e8d8a8" stroke="#24180f" stroke-width="1.5"/><path d="M5 5a2 2 0 0 0-2 2v1h4V7a2 2 0 0 0-2-2z" fill="#c8b070" stroke="#24180f" stroke-width="1.5"/><path d="M9 10h8M9 13h8M9 16h5" stroke="#7a5a2a" stroke-width="1.4" stroke-linecap="round"/>`),
  load: SV(`<path d="M4 7h6l2 2h8v10H4z" fill="#e0a83a" stroke="#24180f" stroke-width="1.5"/><path d="M4 11h16v8H4z" fill="#f0c860" stroke="#24180f" stroke-width="1.5"/><path d="M12 3v6M9.5 6.5L12 9l2.5-2.5" stroke="#24180f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`),
  gear: SV(`<path d="M12 2.8l1.8 2.2 2.8-.6 1 2.7 2.7 1-.6 2.8 2.2 1.8-2.2 1.8.6 2.8-2.7 1-1 2.7-2.8-.6L12 21.2l-1.8-2.2-2.8.6-1-2.7-2.7-1 .6-2.8L2.1 12l2.2-1.8-.6-2.8 2.7-1 1-2.7 2.8.6z" fill="#b8b2a8" stroke="#24180f" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.6" fill="#5a5650" stroke="#24180f" stroke-width="1.4"/><path d="M8.5 7.5c1-.9 2.2-1.4 3.5-1.5" stroke="#f0ece4" stroke-width="1.3" stroke-linecap="round" fill="none"/>`),
  trash: SV(`<path d="M6 7h12l-1 13H7z" fill="#8a6a42" stroke="#24180f" stroke-width="1.5"/><path d="M4.5 7h15" stroke="#24180f" stroke-width="2" stroke-linecap="round"/><path d="M9.5 4h5l.8 3H8.7z" fill="#b8b2a8" stroke="#24180f" stroke-width="1.3"/><path d="M9.5 10v8M12 10v8M14.5 10v8" stroke="#3a2a1a" stroke-width="1.3" stroke-linecap="round"/>`),
  enter: SV(`<path d="M4 4h10v16H4z" fill="#6a4a2a" stroke="#24180f" stroke-width="1.5"/><path d="M14 4l6 2v12l-6 2z" fill="#4a3220" stroke="#24180f" stroke-width="1.5"/><circle cx="12" cy="12.5" r="1.1" fill="#e8c250"/><path d="M8 12h-5m2.2-2.5L2.5 12l2.7 2.5" stroke="#ffe9a8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`),
  warrior: SV(`<path d="M12 3l1.6 5.2 5.4.1-4.4 3.2 1.7 5.2L12 13.5l-4.3 3.2 1.7-5.2L5 8.3l5.4-.1z" fill="#e05a4a" stroke="#24180f" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 5.5l.9 3" stroke="#ffd0c0" stroke-width="1.2" stroke-linecap="round"/>`),
  mage: SV(`<path d="M12 2.5l2.4 6.3 6.6.4-5.2 4.2 1.9 6.4L12 16.2l-5.7 3.6 1.9-6.4L3 9.2l6.6-.4z" fill="#5a9af0" stroke="#24180f" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="11" r="2" fill="#e8f4ff"/>`),
  archer: SV(`<path d="M6 4c6 1 10 6 10 12v4" fill="none" stroke="#5fd35f" stroke-width="2.6" stroke-linecap="round"/><path d="M6 4L16 20" stroke="#e8dcc4" stroke-width="1.2"/><path d="M4 12l9-1-1 9" fill="none" stroke="#c8a040" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
};
const classIcon = c => ICO[c] || '';

