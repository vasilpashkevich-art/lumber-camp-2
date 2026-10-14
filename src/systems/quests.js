// v95: задания. Данные — data/quests.js (жители NPCS и задания QUESTS); состояние — в герое h.quests:
//   { act: { id: { n: [счётчик по целям], got: [[взятые места obj по целям]] } }, done: { id: 1 }, track: [id…] }.
// Цели: kill — убить, loot — добыть с мобов (сразу в сумку заданий, только пока задание взято), obj — взять/поджечь предмет в мире (E),
// talk — поговорить (отнести), explore — дойти до места. Всё, что видно, — событиями в G.ev.
import { NPCS, QUESTS } from '../../data/quests.js';
import { MOBS } from '../../data/mobs.js';
import { xpKill, LOOT } from '../../data/balance.js';
import { addXp, heroStats } from '../entities/hero.js';
import { makeItem } from './items.js';
import { rng, dist } from '../engine/util.js';

export { NPCS, QUESTS };
export const Q_MAX = 20, TRACK_MAX = 3, OBJ_R = 70;
const emit = (G, e) => G.ev.push(e);

export function qState(h) {
  const S = h.quests || (h.quests = {}); S.act = S.act || {}; S.done = S.done || {}; S.track = Array.isArray(S.track) ? S.track : [];
  return S;
}
const turnOf = Q => Q.turn || Q.giver;

/** Статус задания для героя: done | ready | active | avail | low (мал уровень) | locked (не открыто). */
export function qStatus(h, id) {
  const S = qState(h), Q = QUESTS[id]; if (!Q) return 'locked';
  if (S.done[id]) return 'done';
  if (S.act[id]) return qReady(h, id) ? 'ready' : 'active';
  if (Q.after && !S.done[Q.after]) return 'locked';
  return h.lvl >= (Q.min || 1) ? 'avail' : 'low';
}
/** Счётчик цели i и сколько нужно. */
export function goalNeed(g) { return g.k === 'talk' || g.k === 'explore' ? 1 : g.n || 1; }
export function qReady(h, id) { const A = qState(h).act[id]; if (!A) return false; return QUESTS[id].goals.every((g, i) => (A.n[i] || 0) >= goalNeed(g)); }

/** Подпись цели: «Лисы: 3/6», «Волчья шкура: 2/6», «Поговорить: Фрол». */
export function goalText(h, id, i, short = false) {
  const g = QUESTS[id].goals[i], A = qState(h).act[id], c = A ? Math.min(A.n[i] || 0, goalNeed(g)) : 0, n = goalNeed(g);
  if (g.k === 'kill') return `${g.label || MOBS[g.mob].name}: ${c}/${n}`;
  if (g.k === 'loot') return `${g.item}: ${c}/${n}`;
  if (g.k === 'obj') return `${g.item || g.verb}: ${c}/${n}`;
  if (g.k === 'talk') { const N = NPCS[g.npc]; if (short) return `${g.item ? 'Отнести' : 'Поговорить'}: ${N.name}`; return `${g.item ? `Отнести «${g.item}» — ` : 'Поговорить: '}${N.name}, ${N.title}`; }
  if (g.k === 'explore') return g.label || 'Разведать место';
  return '';
}
export const goalDone = (h, id, i) => { const A = qState(h).act[id]; return !!A && (A.n[i] || 0) >= goalNeed(QUESTS[id].goals[i]); };

/** Что у жителя для героя: взять, сдать, в работе (сдают ему же), скоро (мал уровень). */
export function npcQuests(h, npc) {
  const r = { give: [], turn: [], prog: [], low: [] };
  for (const [id, Q] of Object.entries(QUESTS)) {
    const st = qStatus(h, id);
    if (Q.giver === npc && st === 'avail') r.give.push(id);
    if (Q.giver === npc && st === 'low') r.low.push(id);
    if (turnOf(Q) === npc && st === 'ready') r.turn.push(id);
    if (st === 'active' && (turnOf(Q) === npc || Q.giver === npc)) r.prog.push(id);
  }
  return r;
}
/** Знак над головой: '?' — можно сдать, '!' — есть задание, 'low' — будет позже, 'wait' — в работе, '' — ничего. */
export function npcMark(h, npc) {
  const r = npcQuests(h, npc);
  return r.turn.length ? '?' : r.give.length ? '!' : r.prog.length ? 'wait' : r.low.some(id => QUESTS[id].min <= h.lvl + 2) ? 'low' : '';
}

/** Опыт и деньги за задание (от уровня задания: k «убийств», по умолчанию 7; у младших заданий опыта меньше — как у мобов). */
export function qReward(h, id) {
  const Q = QUESTS[id], R = Q.reward || {}, L = Q.lvl || Q.min || 1;
  return { xp: Math.round(xpKill(L, h.lvl) * (R.k ?? 7)), money: Math.round(L * 10 * (R.money ?? 1) * (R.k ?? 7) / 7) };
}
/** Вещи на выбор — одни и те же, сколько ни открывай окно (зерно — от задания и героя). */
export function qChoice(h, id) {
  const R = QUESTS[id].reward || {}; if (!R.choice) return [];
  const L = Math.max(QUESTS[id].lvl || 1, 1);
  return R.choice.map((slot, i) => { let s = 0; for (const ch of id + (h.id || h.name) + i) s = (s * 31 + ch.charCodeAt(0)) % 2147483647; return makeItem(h.cls, slot, L, R.rar || 'good', rng(s || 7)); });
}

/** Взять задание. */
export function qAccept(G, id) {
  const h = G.hero, S = qState(h), Q = QUESTS[id];
  if (qStatus(h, id) !== 'avail') return false;
  if (Object.keys(S.act).length >= Q_MAX) { emit(G, { k: 'toast', s: `Не больше ${Q_MAX} заданий сразу — сдайте или бросьте какое-нибудь`, id: 'qmax' }); return false; }
  S.act[id] = { n: Q.goals.map(() => 0), got: Q.goals.map(() => []) };
  if (S.track.length < TRACK_MAX) S.track.push(id);
  emit(G, { k: 'toast', s: `Новое задание: <b>${Q.name}</b>`, id: 'qnew' }); emit(G, { k: 'sfx', n: 'loot' });
  qObjs(G); qCheck(G, id, Q.goals.every(g => g.k === 'talk'));
  return true;
}
export function qAbandon(G, id) {
  const S = qState(G.hero); if (!S.act[id]) return false;
  delete S.act[id]; S.track = S.track.filter(x => x !== id); qObjs(G);
  emit(G, { k: 'toast', s: `Задание брошено: ${QUESTS[id].name}`, id: 'qab' }); return true;
}
export function qTrack(G, id) {
  const S = qState(G.hero); if (!S.act[id]) return;
  if (S.track.includes(id)) S.track = S.track.filter(x => x !== id);
  else { S.track.push(id); if (S.track.length > TRACK_MAX) S.track.shift(); }
}

/** Сдать: опыт, деньги, вещь на выбор (choice — номер); следующее в цепочке открывается само. */
export function qTurnIn(G, id, choice = null) {
  const h = G.hero, S = qState(h), Q = QUESTS[id];
  if (qStatus(h, id) !== 'ready') return false;
  const C = qChoice(h, id);
  if (C.length && (choice == null || !C[choice])) { emit(G, { k: 'toast', s: 'Выберите награду', id: 'qch' }); return false; }
  if (C.length && h.bag.length >= LOOT.bag) { emit(G, { k: 'toast', s: 'Сумка полна — освободите место для награды', id: 'bagfull' }); return false; }
  const R = qReward(h, id);
  delete S.act[id]; S.done[id] = 1; S.track = S.track.filter(x => x !== id);
  h.gold += R.money; h.stats.gold = (h.stats.gold || 0) + R.money; emit(G, { k: 'coins', v: R.money });
  if (C.length) { const it = C[choice]; it.pos = null; G.bagAdd ? G.bagAdd(h, it) : h.bag.push(it); emit(G, { k: 'loot', it }); }
  const up = addXp(h, R.xp);
  emit(G, { k: 'txt', x: G.P.x, y: G.P.y - 70, s: `+${R.xp} опыта`, col: '#c8a0ff' });
  if (up) { G.st = heroStats(h); G.P.hp = G.st.maxHp; emit(G, { k: 'lvl', L: h.lvl }); emit(G, { k: 'sfx', n: 'levelUp' }); }
  emit(G, { k: 'toast', s: `Задание выполнено: <b>${Q.name}</b>`, kind: 'good', id: 'qdone' }); emit(G, { k: 'sfx', n: 'coin' });
  // следующее задание того же жителя — новый знак «!»
  qObjs(G); return true;
}

/** Поговорить с жителем: засчитать цели «поговорить» и открыть окно. */
export function qTalk(G, npc) {
  const h = G.hero, S = qState(h);
  for (const id of Object.keys(S.act)) QUESTS[id].goals.forEach((g, i) => { if (g.k === 'talk' && g.npc === npc && !(S.act[id].n[i] >= 1)) { S.act[id].n[i] = 1; qCheck(G, id, turnOf(QUESTS[id]) === npc); } });
  emit(G, { k: 'npc', id: npc });
}

/** Прибавить к цели; при выполнении задания — сообщить. */
function bump(G, id, i, v = 1, x, y) {
  const S = qState(G.hero), A = S.act[id], g = QUESTS[id].goals[i], need = goalNeed(g);
  if ((A.n[i] || 0) >= need) return;
  A.n[i] = Math.min(need, (A.n[i] || 0) + v);
  emit(G, { k: 'txt', x: x ?? G.P.x, y: (y ?? G.P.y) - 84, s: goalText(G.hero, id, i), col: '#ffe08a' });
  emit(G, { k: 'qprog', id });
  qCheck(G, id);
}
function qCheck(G, id, quiet) {
  const h = G.hero, S = qState(h), Q = QUESTS[id];
  if (!S.act[id] || S.act[id].ready || !qReady(h, id)) return;
  S.act[id].ready = 1;
  if (quiet) return;
  const N = NPCS[turnOf(Q)];
  emit(G, { k: 'toast', s: `<b>${Q.name}</b> — готово! Вернитесь: ${N.name}, ${N.title}`, kind: 'good', id: 'qready' }); emit(G, { k: 'sfx', n: 'levelUp' });
}

/** Убит моб: цели «убить» и «добыть». */
export function qOnKill(G, m) {
  const S = qState(G.hero);
  for (const id of Object.keys(S.act)) {
    const Q = QUESTS[id]; if (Q.zone && Q.zone !== G.W.Z.id) continue;
    Q.goals.forEach((g, i) => {
      const hit = [].concat(g.mob).includes(m.kind); if (!hit) return;
      if (g.k === 'kill') bump(G, id, i, 1, m.x, m.y);
      if (g.k === 'loot' && G.rand() < (g.chance ?? 0.5)) bump(G, id, i, 1, m.x, m.y);
    });
  }
}

/** Предметы заданий в мире (силки, шатры…): по взятым заданиям этой зоны, ещё не взятые места. */
export function qObjs(G) {
  const S = qState(G.hero), out = [];
  for (const [id, A] of Object.entries(S.act)) {
    const Q = QUESTS[id]; if (Q.zone && Q.zone !== G.W.Z.id) continue;
    Q.goals.forEach((g, i) => { if (g.k !== 'obj' || (A.n[i] || 0) >= g.n) return; g.spots.forEach(([x, y], j) => { if (!A.got[i] || !A.got[i].includes(j)) out.push({ id, i, j, x, y, art: g.art, verb: g.verb, fire: g.fire }); }); });
  }
  G.qobjs = out; return out;
}
export function qObjNear(G, x = G.P.x, y = G.P.y, pad = 0) {
  let best = null, bd = OBJ_R + pad;
  for (const o of G.qobjs || []) { const d = dist(x, y, o.x, o.y); if (d < bd) { bd = d; best = o; } }
  return best;
}
/** Взять / поджечь предмет задания. */
export function qUseObj(G, o) {
  const A = qState(G.hero).act[o.id]; if (!A) return false;
  (A.got[o.i] = A.got[o.i] || []).push(o.j);
  if (o.fire) (G.qfires = G.qfires || []).push({ x: o.x, y: o.y, t: 30 });
  G.fx.push({ k: 'spawn', x: o.x, y: o.y - 16, t: 0.6, max: 0.6 }); emit(G, { k: 'sfx', n: o.fire ? 'smash' : 'loot' });
  bump(G, o.id, o.i, 1, o.x, o.y); qObjs(G); return true;
}

/** Раз в кадр: разведка (дойти до места), горящие шатры. */
export function qTick(G, dt) {
  if (G.qfires) { for (const f of G.qfires) f.t -= dt; G.qfires = G.qfires.filter(f => f.t > 0); }
  G.qT = (G.qT || 0) - dt; if (G.qT > 0) return; G.qT = 0.4;
  const S = qState(G.hero), P = G.P; if (P.dead) return;
  for (const id of Object.keys(S.act)) {
    const Q = QUESTS[id]; if (Q.zone && Q.zone !== G.W.Z.id) continue;
    Q.goals.forEach((g, i) => { if (g.k === 'explore' && !goalDone(G.hero, id, i) && dist(P.x, P.y, g.x, g.y) < g.r) { bump(G, id, i, 1); emit(G, { k: 'toast', s: `Место найдено: ${g.label || Q.name}`, id: 'qexp' }); } });
  }
}

/** Где искать цели задания в зоне zid: [{x, y, r}] — логова мобов, места предметов, точка разведки, житель. Для карты и мини-карты. */
export function qAreas(W, h, id) {
  const Q = QUESTS[id], S = qState(h), A = S.act[id], out = [];
  if (!A) return out;
  const ready = qReady(h, id);
  if (ready) { const N = NPCS[turnOf(Q)]; if (N.zone === W.Z.id) out.push({ x: N.x, y: N.y, r: 90, npc: true }); return out; }
  Q.goals.forEach((g, i) => {
    if ((A.n[i] || 0) >= goalNeed(g)) return;
    if ((Q.zone || W.Z.id) !== W.Z.id && g.k !== 'talk') return;
    if (g.k === 'kill' || g.k === 'loot') for (const c of W.camps) { const kinds = [].concat(c.mob); if ([].concat(g.mob).some(k => kinds.includes(k))) out.push({ x: c.x, y: c.y, r: (c.r || 150) + 90 }); }
    if (g.k === 'obj') { const groups = []; for (const [x, y] of g.spots) { const gr = groups.find(q => dist(q.x, q.y, x, y) < 500); if (gr) { gr.p.push([x, y]); gr.x = gr.p.reduce((a, p) => a + p[0], 0) / gr.p.length; gr.y = gr.p.reduce((a, p) => a + p[1], 0) / gr.p.length; } else groups.push({ x, y, p: [[x, y]] }); } for (const q of groups) out.push({ x: q.x, y: q.y, r: Math.max(140, ...q.p.map(p => dist(p[0], p[1], q.x, q.y) + 70)) }); }
    if (g.k === 'explore') out.push({ x: g.x, y: g.y, r: g.r });
    if (g.k === 'talk') { const N = NPCS[g.npc]; if (N.zone === W.Z.id) out.push({ x: N.x, y: N.y, r: 90, npc: true }); }
  });
  return out;
}

/** Жители этой зоны. */
export const npcsOf = zid => Object.entries(NPCS).filter(([, n]) => n.zone === zid).map(([id, n]) => ({ id, ...n }));
export function npcNear(G, x = G.P.x, y = G.P.y, r = 90) {
  let best = null, bd = r;
  for (const n of G.npcs || []) { const d = dist(x, y, n.x, n.y); if (d < bd) { bd = d; best = n; } }
  return best;
}
