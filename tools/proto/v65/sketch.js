// Эскиз v65: Грибной лес — жители, звери в новом стиле, купец, железо, облик зоны. Сборка: node tools/proto/v65/build.mjs
import { beast, KINDS, NAMES } from './fauna.js';
import { beast as oldBeast } from '../../../src/art/beasts.js';
import { person } from '../../../src/art/body.js';
import { palette } from '../../../src/art/gear.js';
import { vein } from '../../../src/art/ore.js';
import { lookOf, makeItem } from '../../../src/systems/items.js';
import * as Z from './world3.js';

const DPR = Math.min(2, window.devicePixelRatio || 1);
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const scenes = [];
function scene(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w * DPR; cv.height = h * DPR; cv.style.width = w + 'px'; cv.style.height = h + 'px'; scenes.push({ cv, draw }); return cv; }
function sec(title, text) { const s = el('section'); s.appendChild(el('h2', null, title)); if (text) s.appendChild(el('p', null, text)); $('#main').appendChild(s); return s; }
function grass(g, w, h, seed = 3) { g.fillStyle = '#6f9a45'; g.fillRect(0, 0, w, h); let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < w * h / 90; i++) { g.fillStyle = r() < 0.5 ? 'rgba(40,70,20,.18)' : 'rgba(200,230,140,.12)'; g.fillRect(r() * w, r() * h, 2, 1.5); } }
function moss(g, w, h, seed = 3) { Z.ground(g, 0, 0, w, h, seed); }
const label = (g, s, x, y, col = '#ffe9a8', size = 14) => { g.font = `${size}px Georgia`; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.7)'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); };

// значки железа — тем же стилем, что медь и олово в v63
const ICON = {
  ore: `<svg viewBox="0 0 32 32" width="56" height="56" class="svgic"><path d="M4 23l3-10 8-7 10 3 4 11-6 7-12 1z" fill="#6e6a68" stroke="#24180f" stroke-width="1.4"/><path d="M7 13l8-7 10 3-7 5z" fill="#8a8682"/><path d="M25 9l4 11-6 7-5-13z" fill="#4a4644"/><path d="M7 13l11 1 7-5M18 14l5 13M18 14l-7 14" fill="none" stroke="#24180f" stroke-width=".7" opacity=".55"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#4a2010" stroke-width="3.2" stroke-linecap="round"/><path d="M6 21l5-3 4 2 5-4 5 1" fill="none" stroke="#a8502a" stroke-width="1.8" stroke-linecap="round"/><path d="M7 20.6l4-2.4" stroke="#e8904a" stroke-width=".8"/><path d="M12 9l4-2 3 3-3 3-4-1z" fill="#b8c0c8" stroke="#24180f" stroke-width=".9"/><path d="M13 9.5l2.6-1.2" stroke="#fff" stroke-width="1"/><path d="M10 25l3-2 2 2-2 2z" fill="#a8502a" stroke="#24180f" stroke-width=".8"/><path d="M9 13l4-3" stroke="#fff" stroke-width="1.4" opacity=".8"/></svg>`,
  bar: `<svg viewBox="0 0 32 32" width="56" height="56" class="svgic"><path d="M3 21l7-8h19l-7 8z" fill="#c4ccd2" stroke="#24180f" stroke-width="1.4"/><path d="M3 21h19v6H3z" fill="#8a929a" stroke="#24180f" stroke-width="1.4"/><path d="M22 21l7-8v6l-7 8z" fill="#5a6066" stroke="#24180f" stroke-width="1.4"/><path d="M7 19.5l4.5-5h13.5l-4.5 5z" fill="none" stroke="#6a7278" stroke-width=".9"/><path d="M5 23h15" stroke="#e8eef2" stroke-width=".9" opacity=".7"/><path d="M11 15.5h10" stroke="#fff" stroke-width="1.5"/><path d="M8 19l2-2" stroke="#fff" stroke-width="1.2" opacity=".8"/><path d="M6 25.6h3M14 25.4h4" stroke="#8a4a2a" stroke-width="1" opacity=".7"/></svg>`,
};


// кадры с кэшем — как в игре
const CACHE = new Map();
function frame(key, w, h, ox, oy, sc, draw) { const k = key + '|' + sc; if (CACHE.has(k)) return CACHE.get(k); const cv = document.createElement('canvas'); cv.width = Math.ceil(w * sc * DPR); cv.height = Math.ceil(h * sc * DPR); const g = cv.getContext('2d'); g.setTransform(sc * DPR, 0, 0, sc * DPR, 0, 0); g.translate(ox, oy); g.lineJoin = g.lineCap = 'round'; draw(g); const f = { cv, w: w * sc, h: h * sc, ox: ox * sc, oy: oy * sc }; CACHE.set(k, f); return f; }
function put(g, f, x, y, dir = 1) { g.save(); g.translate(x, y); g.scale(dir, 1); g.drawImage(f.cv, -f.ox, -f.oy, f.w, f.h); g.restore(); }
const FR = { walk: 8, atk: 6, idle: 1 };
const poseOf = (mode, f) => mode === 'walk' ? { walk: f / 8 } : mode === 'atk' ? { atk: (f + 0.5) / 6 } : {};
const beastF = (kind, view, mode, f, sc) => frame('b' + kind + view + mode + f, 220, 120, 110, 100, sc, g => beast(g, kind, view, poseOf(mode, f)));
const HERO = lookOf({ cls: 'warrior', eq: { head: makeItem('warrior', 'head', 9, 'good', () => 0.31), chest: makeItem('warrior', 'chest', 9, 'good', () => 0.4), legs: makeItem('warrior', 'legs', 9, 'good', () => 0.5), weapon: makeItem('warrior', 'weapon', 9, 'good', () => 0.6) } });
const heroF = (L, view, mode, f, sc) => frame('h' + (L.key || L.k) + view + mode + f, 100, 100, 50, 72, sc, g => person(g, L, view, poseOf(mode, f)));
function anim(t, mode, speed = 1.2) { return Math.floor((t * speed % 1) * FR[mode]) % FR[mode]; }
const VIEWS = [['front', 1], ['side', 1], ['back', 1], ['side', -1]];
const HERO_SC = 1.15; // герой в игре рисуется ×1,15

// ================================================================= 1. было → стало
{
  const s = sec('1. Звери первых двух зон: было → стало', 'Слева — как сейчас, справа — новый рисунок: мех, мышцы, суставы ног, морды с глазами и бровями, у быка и кабана — копыта, у лисы — белый кончик хвоста. Рядом герой — для масштаба. Всё в натуральную величину, как в игре, и крупно.');
  const kinds = ['fox', 'wolf', 'dog', 'boar', 'bull', 'spider', 'crow', 'scarecrow'];
  const W = 1180, H = 230;
  s.appendChild(scene(W, H, (g, t) => { grass(g, W, H, 4);
    kinds.forEach((k, i) => { const x = 70 + i * 140, y = 92; const f = anim(t, 'walk', 1.3);
      g.save(); g.translate(x - 30, y); g.globalAlpha = 0.95; oldBeast(g, k, 'side', { walk: f / 8 }); g.restore();
      put(g, beastF(k, 'side', 'walk', f, 1), x + 30, y);
      put(g, beastF(k, 'side', 'walk', f, 2), x + 10, y + 120);
      label(g, NAMES[k], x, 222, '#ffe9a8', 13); });
    label(g, 'было', 40, 20, '#ffffffaa', 12); label(g, 'стало', 100, 20, '#ffffffaa', 12);
    put(g, heroF(HERO, 'side', 'idle', 0, HERO_SC), 1150, 92); label(g, 'герой', 1150, 112, '#ffffffcc', 11);
  }));
}

// ================================================================= 2. все существа со всех сторон
{
  const s = sec('2. Каждое существо — со всех сторон, в ходьбе и в ударе', 'Слева направо: спереди, сбоку, сзади, идёт по кругу в 4 стороны, бьёт. Под каждым — высота в росте героя.');
  const grid = el('div', 'grid'); s.appendChild(grid);
  const H_OF = { fox: 0.4, wolf: 0.55, dog: 0.48, boar: 0.65, bull: 0.85, spider: 0.45, crow: 0.25, scarecrow: 1, kvakun: 0.75, kvak_shaman: 0.75, gribo: 0.72, sporo: 0.6, weaver: 0.6, broodmother: 0.8, snake: 1.1 };
  KINDS.forEach((k, i) => { const card = el('div', 'card'); card.appendChild(el('b', null, NAMES[k] + ` <small>· ${String(H_OF[k]).replace('.', ',')} роста${k === 'snake' ? ' в стойке, длина ≈ 3,5' : ''}</small>`));
    const big = k === 'snake' ? 1.15 : k === 'bull' ? 1.4 : k === 'broodmother' ? 1.5 : 2, W = 600, H = k === 'snake' ? 150 : 140;
    card.appendChild(scene(W, H, (g, t) => { grass(g, W, H, i);
      [['front', 1], ['side', 1], ['back', 1]].forEach(([v, d], j) => put(g, beastF(k, v, 'idle', 0, big), 70 + j * (k === 'snake' ? 150 : 120), H - 22, d));
      const seg = Math.floor(t / 2) % 4, [v, d] = VIEWS[seg]; put(g, beastF(k, v, 'walk', anim(t, 'walk', 1.3), big), k === 'snake' ? 470 : 430, H - 22, d);
      put(g, beastF(k, 'side', 'atk', anim(t, 'atk', 0.9), big), 540, H - 22);
    })); grid.appendChild(card); });
}

// ================================================================= 3. жители Грибного леса крупно, рядом с героем
{
  const s = sec('3. Жители Грибного леса', 'Квакуны — лягушачий народ у прудов: копейщики бьют копьём с костяным наконечником, шаманы колдуют посохом с перьями и ракушками. Грибоеды — грибной народ в чаще: Грибоед бьёт ручками-веточками и пускает споры, Споровик-дождевик обдаёт облаком спор. Тенепряд — тёмный паук с лиловыми метками, Паучиха-мать — огромная, с коконом. Великий Полоз — редкий вожак зоны: 3–4 роста в длину, поднимается в стойку и делает бросок. Все — рядом с героем в натуральную величину и крупно.');
  const list = ['kvakun', 'kvak_shaman', 'gribo', 'sporo', 'weaver', 'broodmother', 'snake'];
  const W = 1180, H = 440;
  s.appendChild(scene(W, H, (g, t) => { moss(g, W, H, 7);
    put(g, heroF(HERO, 'side', 'idle', 0, HERO_SC), 40, 120);
    list.forEach((k, i) => { const x = 110 + i * (k === 'snake' ? 150 : 130) + (k === 'snake' ? 30 : 0); put(g, beastF(k, 'side', 'walk', anim(t + i * 0.13, 'walk'), 1), x, 120); });
    put(g, heroF(HERO, 'front', 'idle', 0, HERO_SC * 2.4), 70, 410);
    const xs = [190, 330, 470, 600, 740, 900, 1080];
    list.forEach((k, i) => { const sc = k === 'snake' ? 1.5 : k === 'broodmother' ? 2 : 2.4, ph = (t * 0.35 + i * 0.17) % 1, mode = ph < 0.6 ? 'walk' : 'atk'; put(g, beastF(k, ph < 0.6 ? 'front' : 'side', mode, anim(t + i * 0.1, mode, mode === 'atk' ? 0.9 : 1.2), sc), xs[i], 410); label(g, NAMES[k], xs[i], 432, '#ffe9a8', 13); });
  }));
}

// ================================================================= 4. купец, тележка, прилавок
const MERCH = { key: 'merchant', hair: '#5a3a22', beard: 'full', head: { m: 'ranger', P: { ...palette('rare', 3), leather: '#5a2a4a', gem: '#e7c35a' } }, chest: { m: 'robe_emb', P: { ...palette('rare', 5), cloth: ['#6a2a4a', '#4a1a34'], acc: '#e7c35a' } }, legs: { m: 'leggings', P: palette('common', 2) } };
{
  const s = sec('4. Купец: тележка в Грибном лесу и прилавки в городах', 'В Грибном лесу нет посёлка — только стоянка: тележка купца под тентом, фонарь, костёр. Купец в новом теле: кафтан с золотой каймой, шляпа с пером, борода. Этот же купец будет стоять за прилавками Столицы и Хутора Подгорного — прилавок перерисован в масштабе: стойка по пояс, навес выше головы. Колесо тележки — 0,65 роста, тележка — 2 роста в длину.');
  const W = 1180, H = 330;
  s.appendChild(scene(W, H, (g, t) => { moss(g, W, H, 11);
    g.save(); g.translate(250, 250); g.scale(2.2, 2.2); Z.cart(g, t); g.restore();
    put(g, heroF(MERCH, 'front', 'idle', 0, 2.2 * HERO_SC), 420, 262);
    g.save(); g.translate(520, 260); g.scale(2.2, 2.2); g.fillStyle = 'rgba(255,150,50,.18)'; g.beginPath(); g.arc(0, -4, 20, 0, 7); g.fill(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.fillStyle = '#7a776f'; g.beginPath(); g.ellipse(Math.cos(a) * 6, Math.sin(a) * 2.4, 2, 1.4, 0, 0, 7); g.fill(); } for (let i = 0; i < 3; i++) { const f = 1 + 0.15 * Math.sin(t * 9 + i * 2); g.fillStyle = ['#ff6a2a', '#ffb347', '#fff2a0'][i]; const w = 4 - i * 1.2, h = (10 - i * 3) * f; g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w, -h * 0.6, 0, -h); g.quadraticCurveTo(w, -h * 0.6, w, 0); g.closePath(); g.fill(); } g.restore();
    put(g, heroF(HERO, 'front', 'idle', 0, 2.2 * HERO_SC), 610, 262);
    // прилавок
    g.save(); g.translate(900, 262); g.scale(2.2, 2.2); Z.stallFront(g); g.restore();
    put(g, heroF(MERCH, 'front', 'idle', 0, 2.2 * HERO_SC), 900, 222);
    g.save(); g.translate(900, 262); g.scale(2.2, 2.2); Z.stallTop(g); g.restore();
    put(g, heroF(HERO, 'side', 'idle', 0, 2.2 * HERO_SC), 1060, 262);
    label(g, 'стоянка купца — Грибной лес', 330, 320); label(g, 'прилавок — Столица и Хутор', 920, 320);
  }));
}

// ================================================================= 5. железо
{
  const s = sec('5. Железо: третья руда', 'Железная жила — тёмная порода с ржавыми прожилками и серебристыми самородками. Копать — с горного дела 100, навык растёт до 150 (как оранжевые/жёлтые/зелёные жилы в WoW). Плавить, как и прежде, в кузницах Столицы, Гильдии и Хутора Подгорного. Ниже — жилы рядом и значки руды и слитка в том же стиле, что медь и олово.');
  const W = 760, H = 170;
  s.appendChild(scene(W, H, (g, t) => { moss(g, W, H, 13);
    [['copper', 'Медь (с 1)'], ['tin', 'Олово (с 50)']].forEach(([m, n], i) => { g.save(); g.translate(110 + i * 200, 130); g.scale(1.3, 1.3); vein(g, m, 3, 1); g.restore(); label(g, n, 110 + i * 200, 162); });
    g.save(); g.translate(510, 130); g.scale(1.3, 1.3); Z.ironVein(g, 4); g.restore(); label(g, 'Железо (с 100, навык до 150)', 510, 162);
    put(g, heroF(HERO, 'side', 'idle', 0, HERO_SC * 1.3), 680, 130);
  }));
  const icons = el('div', 'icons'); s.appendChild(icons);
  for (const [k, n] of [['ore', 'Железная руда'], ['bar', 'Железный слиток']]) { const d = el('div', 'ic'); d.innerHTML = ICON[k] + `<span>${n}</span>`; icons.appendChild(d); }
}

// ================================================================= 6. облик зоны
{
  const s = sec('6. Облик Грибного леса', 'Земля во мху и кочках, опавшие листья, мелкие грибочки. Поваленные стволы с трутовиками — их надо обходить. Грибы-великаны, светящиеся синие грибочки, папоротники, мшистые деревья со свисающим мхом. Пруд с камышом и кувшинками — у него хижины квакунов. Грибной круг — логово грибоедов. Паутина между деревьями — логово пауков. Лёгкий туман по всей зоне и густые клочья в низинах: в густом тумане видно хуже, но полоски здоровья и уровни мобов видны всегда.');
  const W = 1180, H = 660, K = 1.4; // мир 843×471
  const items = [];
  const add = (y, fn) => items.push([y, fn]);
  add(120, g => { g.translate(70, 120); Z.mossTree(g, 120, 3); }); add(110, g => { g.translate(800, 110); Z.mossTree(g, 125, 7); }); add(130, g => { g.translate(460, 130); Z.mossTree(g, 110, 9); });
  add(205, g => { g.translate(300, 205); Z.fallenLog(g, 95, 4); }); add(410, g => { g.translate(720, 410); Z.fallenLog(g, 85, 7); });
  add(185, g => { g.translate(560, 185); Z.giantShroom(g, 95, 0); }); add(300, g => { g.translate(470, 300); Z.giantShroom(g, 72, 1); }); add(440, g => { g.translate(40, 440); Z.giantShroom(g, 70, 2); });
  for (const [x, y, s2] of [[200, 260, 1], [420, 390, 1.2], [690, 250, 0.9], [610, 440, 1.1], [820, 330, 1]]) add(y, g => { g.translate(x, y); Z.fern(g, s2, x); });
  add(175, g => { g.translate(700, 175); Z.web(g, 70, 70, 2); });
  add(240, g => { g.translate(130, 248); Z.reedHut(g, 2); }); add(395, g => { g.translate(70, 395); Z.reedHut(g, 5); });
  for (const [x, y] of [[250, 300], [270, 330], [40, 330]]) add(y, (g, t) => { g.translate(x, y); Z.reeds(g, 7, x, t); });
  add(455, (g, t) => { g.translate(330, 455); Z.glowShrooms(g, 6, 3, t); }); add(270, (g, t) => { g.translate(770, 270); Z.glowShrooms(g, 4, 8, t); });
  add(440, g => { g.translate(800, 450); Z.ironVein(g, 6); });
  const mob = (k, x, y, ph = 0, mode = 'idle', view = 'side', dir = 1) => add(y, (g, t) => { const f = mode === 'idle' ? 0 : anim(t + ph, mode); const fr = beastF(k, view, mode, f, 1); g.translate(x, y); g.scale(dir, 1); g.drawImage(fr.cv, -fr.ox, -fr.oy, fr.w, fr.h); });
  mob('kvakun', 220, 315, 0, 'walk', 'side', -1); mob('kvakun', 150, 352, 0.3, 'idle', 'front'); mob('kvak_shaman', 240, 365, 0.5, 'idle', 'front');
  mob('gribo', 520, 330, 0, 'walk', 'front'); mob('gribo', 580, 352, 0.4, 'idle', 'side', -1); mob('sporo', 480, 360, 0.2, 'idle', 'front');
  mob('weaver', 690, 215, 0, 'walk', 'side', -1); mob('spider', 750, 230, 0.4, 'idle', 'side');
  add(430, (g, t) => { const f = anim(t, 'walk'); const fr = heroF(HERO, 'side', 'walk', f, HERO_SC); g.translate(660, 430); g.drawImage(fr.cv, -fr.ox, -fr.oy, fr.w, fr.h); });
  items.sort((a, b) => a[0] - b[0]);
  s.appendChild(scene(W, H, (g, t) => {
    g.save(); g.scale(K, K); const w = W / K, h = H / K;
    Z.ground(g, 0, 0, w, h, 21);
    g.save(); g.translate(170, 325); Z.pond(g, 95, 40, 6, t); g.restore();
    g.save(); g.translate(530, 345); Z.shroomRing(g, 60, 3); g.restore();
    for (const [, fn] of items) { g.save(); fn(g, t); g.restore(); }
    Z.fog(g, 0, 0, w, h, t * 8, [[560, 360, 130], [120, 450, 110]]);
    g.restore();
    label(g, 'Квакуны у пруда', 240, 590); label(g, 'Грибной круг', 740, 545); label(g, 'Паутина', 980, 175); label(g, 'Железная жила', 1120, 650); label(g, 'Поваленный ствол', 1010, 600);
  }));
}

let t0 = performance.now();
function tick(now) { const t = Math.max(0, (now - t0) / 1000); for (const S of scenes) { const g = S.cv.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); g.imageSmoothingQuality = 'high'; S.draw(g, t); } requestAnimationFrame(tick); }
requestAnimationFrame(tick);
