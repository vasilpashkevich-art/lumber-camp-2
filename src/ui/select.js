// Экран входа: ночная поляна у костра, выбранный герой впереди — в том, что на нём надето.
import { doll } from '../art/body.js';
import { heroSpr, drawSpr } from '../art/sprites.js';
import { CLASSES, NAMES } from '../../data/classes.js';
import { listHeroes, deleteHero, saveHero, exportAll, importAll, MAX_SLOTS } from '../engine/save.js';
import { newHero } from '../entities/hero.js';
import { lookOf, starterLook } from '../systems/items.js';
import { rng, plural } from '../engine/util.js';
import { CONTINENT } from '../../data/zones.js';
import { $, el, modal, toast } from './dom.js';
import { moneyHtml } from './icons.js';

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
  const root = $('#select'); root.hidden = false;
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
    const cx = Wd * 0.5, gy = Hd * 0.78, k = Math.min(Wd / 1600, Hd / 900) * 1.05 + 0.05;
    const others = heroes.map((h, i) => i).filter(i => i !== sel).slice(0, 4);
    others.forEach((i, n) => drawSpr(c, darkOf(heroSpr(lookOf(heroes[i]), -1)), cx + (110 + n * 85) * k, gy - 50 * k, 1, 2.8 * k));
    fire(c, cx + 25 * k, gy - 30 * k, 3.1 * k, t);
    if (sel >= 0) {
      c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(cx - 140 * k, gy + 18 * k, 80 * k, 16 * k, 0, 0, 7); c.fill();
      doll(c, cx - 140 * k, gy - 30 * k, 5.4 * k, 1, lookOf(heroes[sel]), t);
    }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);

  function render() {
    heroes = listHeroes(); if (sel >= heroes.length) sel = heroes.length - 1;
    const list = $('#selList'); list.innerHTML = '';
    for (let i = 0; i < MAX_SLOTS; i++) {
      const h = heroes[i];
      if (!h) { const b = el('button', 'slot empty', `<span>Свободное место</span>`); b.onclick = create; list.append(b); continue; }
      const b = el('button', 'slot' + (i === sel ? ' on' : ''), `<canvas width="120" height="120"></canvas><b>${esc(h.name)}</b><i style="color:${CC(h.cls)}">${CN(h.cls)} ${h.lvl} уровня</i><small>${zoneName(h.zone)}</small>`);
      b.onclick = () => { sel = i; render(); }; b.ondblclick = () => enter();
      list.append(b);
      const pc = b.querySelector('canvas').getContext('2d'); pc.save(); pc.beginPath(); pc.arc(60, 60, 56, 0, 7); pc.fillStyle = CC(h.cls) + '55'; pc.fill(); pc.clip(); doll(pc, 60, 172, 5.6, 1, lookOf(h), 0.3); pc.restore();
    }
    const info = $('#selInfo');
    if (sel < 0) { info.innerHTML = `<h2>Добро пожаловать</h2><p>Создайте первого героя: выберите класс и имя. Новый герой начинает в простой одежде у ворот Столицы.</p>`; }
    else {
      const h = heroes[sel];
      info.innerHTML = `<h2>${esc(h.name)}</h2><p class="cls" style="color:${CC(h.cls)}">${CN(h.cls)}, ${h.lvl} уровень</p>
        <dl><dt>Где сейчас</dt><dd>${zoneName(h.zone)}</dd><dt>В игре</dt><dd>${playTime(h.play || 0)}</dd><dt>Деньги</dt><dd>${moneyHtml(h.gold || 0)}</dd><dt>Повержено</dt><dd>${h.kills || 0} ${plural(h.kills || 0, 'враг', 'врага', 'врагов')}</dd></dl>`;
    }
    $('#selEnter').disabled = sel < 0; $('#selDel').disabled = sel < 0;
    $('#selNew').disabled = heroes.length >= MAX_SLOTS;
  }

  function enter() { if (sel < 0) return; const id = heroes[sel].id; try { localStorage.setItem('lumber-camp2-last', id); } catch (e) { } close(); onEnter(id); }
  function close() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('keydown', onKey); root.hidden = true; }

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

// ---------------------------------------------------------------- сцена
function scene(c, W, H, t) {
  const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0b1022'); sky.addColorStop(.55, '#1b2340'); sky.addColorStop(1, '#120d0a'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  const r = rng(7); c.fillStyle = '#fff';
  for (let i = 0; i < 160; i++) { c.globalAlpha = (.3 + r() * .7) * (0.75 + 0.25 * Math.sin(t * (0.5 + r()) + i)); c.beginPath(); c.arc(r() * W, r() * H * 0.47, r() * 1.4 + .3, 0, 7); c.fill(); }
  c.globalAlpha = 1;
  const mx = W * 0.62, my = H * 0.2, mg = c.createRadialGradient(mx, my, 10, mx, my, 120); mg.addColorStop(0, 'rgba(255,245,210,.5)'); mg.addColorStop(1, 'rgba(255,245,210,0)'); c.fillStyle = mg; c.beginPath(); c.arc(mx, my, 120, 0, 7); c.fill(); c.fillStyle = '#f6ecc8'; c.beginPath(); c.arc(mx, my, 40, 0, 7); c.fill();
  c.fillStyle = '#1c2236'; c.beginPath(); c.moveTo(0, H * 0.58); for (let x = 0; x <= W + 80; x += 80) c.lineTo(x, H * 0.48 - Math.abs(Math.sin(x * 0.004 + 1)) * H * 0.13); c.lineTo(W, H); c.lineTo(0, H); c.fill();
  const pine = (x, y, h, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h); for (let k = 0; k < 4; k++) { const yy = y - h + h * (k + 1) / 4; c.lineTo(x + h * 0.18 + k * h * 0.05, yy); c.lineTo(x + h * 0.07, yy - h * 0.04); } c.lineTo(x + h * 0.03, y); c.lineTo(x - h * 0.03, y); for (let k = 3; k >= 0; k--) { const yy = y - h + h * (k + 1) / 4; c.lineTo(x - h * 0.07, yy - h * 0.04); c.lineTo(x - h * 0.18 - k * h * 0.05, yy); } c.closePath(); c.fill(); };
  const r2 = rng(11); for (let i = 0; i < 46; i++) pine(r2() * W, H * 0.62 + r2() * 30, 120 + r2() * 80, '#141a28');
  for (let i = 0; i < 22; i++) { const x = r2() * W; if (x > W * 0.3 && x < W * 0.72) continue; pine(x, H * 0.74 + r2() * 40, 200 + r2() * 120, '#0d1118'); }
  const gr = c.createRadialGradient(W / 2, H * 0.84, 40, W / 2, H * 0.84, W * 0.45); gr.addColorStop(0, '#3a3220'); gr.addColorStop(.5, '#1e2216'); gr.addColorStop(1, '#0c0e0a'); c.fillStyle = gr; c.beginPath(); c.ellipse(W / 2, H * 0.87, W * 0.52, H * 0.22, 0, 0, 7); c.fill();
  const fl = 0.55 + 0.05 * Math.sin(t * 7) + 0.03 * Math.sin(t * 13), fg = c.createRadialGradient(W / 2, H * 0.76, 10, W / 2, H * 0.76, Math.min(W, H) * 0.6); fg.addColorStop(0, `rgba(255,170,70,${fl})`); fg.addColorStop(.4, 'rgba(255,120,40,.16)'); fg.addColorStop(1, 'rgba(255,100,30,0)'); c.fillStyle = fg; c.beginPath(); c.arc(W / 2, H * 0.76, Math.min(W, H) * 0.6, 0, 7); c.fill();
}
function fire(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; c.fillStyle = i % 2 ? '#5a5650' : '#6e6a62'; c.strokeStyle = '#24180f'; c.lineWidth = 1; c.beginPath(); c.ellipse(Math.cos(a) * 16, Math.sin(a) * 6 + 2, 4.5, 3, 0, 0, 7); c.fill(); c.stroke(); }
  c.strokeStyle = '#24180f'; c.lineWidth = 5; c.beginPath(); c.moveTo(-12, 4); c.lineTo(10, -2); c.moveTo(-10, -2); c.lineTo(12, 4); c.stroke(); c.strokeStyle = '#6b4a2c'; c.lineWidth = 3.2; c.stroke();
  const fl = (w, h, col, o) => { c.fillStyle = col; c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(-w * 0.9, -h * 0.5, o, -h); c.quadraticCurveTo(w * 0.9, -h * 0.5, w, 0); c.closePath(); c.fill(); };
  fl(11, 28 + Math.sin(t * 9) * 3, '#e2552a', Math.sin(t * 5) * 2); fl(8, 21 + Math.sin(t * 11) * 2, '#f59a2a', Math.sin(t * 7) * 2); fl(5, 13 + Math.sin(t * 13), '#ffe07a', 0);
  for (let i = 0; i < 4; i++) { const q = (t * 0.7 + i / 4) % 1; c.fillStyle = `rgba(255,190,90,${1 - q})`; c.fillRect(Math.sin(i * 3 + t) * 8, -20 - q * 40, 1.5, 1.5); }
  c.restore();
}
