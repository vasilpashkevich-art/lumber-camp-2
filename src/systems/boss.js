// v94: боссы с фазами и умениями. Данные — в mobs.js (D.ai: фазы по здоровью и умения), здесь — общие действия:
// конус (cone), рывок по линии (charge), топот волной вокруг себя (stomp), прыжок на героя (leap), бросок головой (lunge),
// кольцо вокруг героя с просветом (ring), сброс кожи — неуязвимость и ядовитые лужи (shed); щит спереди (shield).
// Всё, что видно, — событиями в G.fx; кольца и лужи — в G.rings / G.hazards (их же учитывает движение героя).
// v117: призыв (adds), обряд с тотемами (rite), ядовитый дождь и листья (rain → G.rain, G.pads), трон под охраной (throne),
// язык и проглатывание — плен героя (tongue, swallow → P.held, вырваться ударом), квак с укрытием за колоннами (kvak → W.colHit).
import { dist } from '../engine/util.js';

// Площади на земле рисуются сплющенными (эллипс r × r/2), поэтому и попадание считается так же: по «земле» — y вдвое.
const ang = (ax, ay, bx, by) => Math.atan2((by - ay) * 2, bx - ax);       // угол на земле (как рисуется)
const wang = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);            // угол в мире (куда бежать)
const ed = (ax, ay, bx, by) => Math.hypot(bx - ax, (by - ay) * 2);       // расстояние на земле
const dA = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
const segD = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / L)); return Math.hypot(px - ax - vx * t, py - ay - vy * t); };
const seed = G => Math.floor(G.rand() * 1e6);

/** Фаза по здоровью (0, 1, 2…). */
export const phaseOf = (m) => { const P = m.D.ai.phases; let k = 0; for (let i = 0; i < P.length; i++) if (m.hp / m.max <= P[i].at + 1e-9) k = i; return k; };
/** Новое состояние боя босса (сбрасывается, когда он уходит домой). */
export function bossReset(G, m) {
  const A = m.D.ai; m.B = { phase: 0, act: null, cd: {}, dir: 0, open: 0, immune: 0, haste: 1, used: {} };
  for (const [k, a] of Object.entries(A.acts)) m.B.cd[k] = a.first ?? a.every * 0.5;
  G.rings = (G.rings || []).filter(r => r.m !== m); G.hazards = (G.hazards || []).filter(h => h.m !== m);
  // v117: помощники, дождь, листья, плен, облик и колонны — как до боя
  for (const o of G.mobs || []) if (o.owner === m && o.state !== 'dead') { o.state = 'dead'; o.gone = true; }
  if (G.rain && G.rain.m === m) G.rain = null; if (G.pads) G.pads = G.pads.filter(p => p.m !== m);
  if (G.P && G.P.held && G.P.held.m === m) G.P.held = null;
  m.look = m.D.look || null; m.r = m.D.r;
  if (G.W && G.W.colHit && A.acts.kvak) colsRestore(G.W);
}
/** Щит закрывает удар спереди? (фаза со щитом, щит не опущен, герой в передних 140°). */
export function shieldBlocks(G, m) {
  if (!m.B || !m.D.ai) return false; const ph = m.D.ai.phases[m.B.phase];
  if (!ph || !ph.shield || m.B.open > 0 || m.stun > 0) return false;
  return Math.abs(dA(ang(m.x, m.y, G.P.x, G.P.y), m.B.dir)) < 1.22;
}

/** Ход босса. hurt(v, dot) — урон герою; go(x, y, speed) — шаг. Возвращает true, если в этот кадр босс занят своим умением. */
export function bossTick(G, m, dt, hurt, go, say, api = {}) {
  if (!m.B) bossReset(G, m);
  const B = m.B, A = m.D.ai, P = G.P, dH = dist(m.x, m.y, P.x, P.y);
  B.open = Math.max(0, B.open - dt);   // неуязвимость тикает в mobTick (и у оглушённого)
  for (const k in B.cd) B.cd[k] -= dt;
  // фазы
  const ph = phaseOf(m);
  if (ph !== B.phase) { B.phase = ph; const p = A.phases[ph]; if (p.say) say(p.say, true); if (p.haste) B.haste = p.haste; if (p.look) { m.look = p.look; G.fx.push({ k: 'summon', x: m.x, y: m.y, kind: 'boss', seed: seed(G), t: 1.2, max: 1.2 }); } if (p.r) m.r = p.r; if (p.immune) B.immune = Math.max(B.immune, p.immune); if (B.act && !A.phases[ph].acts.includes(B.act.k)) actEnd(G, m, B.act); for (const k of p.acts) B.cd[k] = Math.min(B.cd[k] ?? 0, A.acts[k].first ?? 1.2); }
  // куда смотрит: во время умения — туда, куда замахнулся; иначе поворачивается к герою (со щитом — медленно)
  const want = ang(m.x, m.y, P.x, P.y), shield = A.phases[B.phase].shield;
  if (!B.act) { const turn = (shield ? 1.6 : 8) * dt, d = dA(want, B.dir); B.dir += Math.max(-turn, Math.min(turn, d)); }
  m.face = Math.cos(B.dir) < 0 ? -1 : 1;
  // текущее умение
  if (B.act) { actTick(G, m, B.act, dt, hurt, go, say, api); return true; }
  // выбрать новое
  for (const k of A.phases[B.phase].acts) {
    const a = A.acts[k]; if (B.cd[k] > 0) continue; if (a.once && B.used[k]) continue;
    if (a.min != null && dH < a.min) continue; if (a.max != null && dH > a.max) continue; if (a.hp != null && m.hp / m.max > a.hp + 1e-9) continue;
    if ((a.type || k) === 'adds') { B.cd[k] = a.every || 999; B.used[k] = true; addsNow(G, m, a, say, api); continue; }   // призыв — сразу, босс не останавливается
    if (P.held && ((a.type || k) === 'tongue' || (a.type || k) === 'swallow')) continue;
    B.act = startAct(G, m, k, a, say, api); B.used[k] = true; B.cd[k] = a.every || 999; m.cd = Math.max(m.cd, 0.6); return true;
  }
  return false;
}

/** Призыв помощников: n штук рядом с боссом (не больше cap живых). */
function addsNow(G, m, a, say, api) {
  if (!api.spawn) return;
  const live = G.mobs.filter(o => o.owner === m && o.kind === a.kind && o.state !== 'dead').length, n = Math.min(a.n, (a.cap || 99) - live); if (n <= 0) return;
  for (let i = 0; i < n; i++) { const an = G.rand() * 6.28, x = m.x + Math.cos(an) * 70, y = m.y + Math.sin(an) * 40; if (G.W.walkable(x, y)) api.spawn(a.kind, x, y, 60); }
  if (a.say) say(a.say);
}
/** Точка из убранства зоны (купель, трон): [x, y] или null. */
const spot = (G, at) => { const v = at && G.W.Z.decor && G.W.Z.decor[at]; return v ? { x: v[0], y: v[1] } : null; };
/** Умение кончилось раньше срока (сменилась фаза): тотемы гаснут, неуязвимость снимается. */
function actEnd(G, m, act) {
  if (act.k === 'rite') { for (const o of G.mobs) if (o.owner === m && o.kind === act.a.kind && o.state !== 'dead') { o.state = 'dead'; o.gone = true; } m.B.immune = 0; m.B.rite = null; }
  if (act.k === 'throne') m.B.immune = 0;
  if (act.fx) act.fx.t = 0; m.B.act = null;
}
/** Колонны в зале босса: W.colHit[i] — сколько кваков выдержала (≥ hits — разбита, не заслоняет и не мешает пройти). */
export function colsOf(G, m) {
  const W = G.W, D = W.Z.decor || {}, room = (W.rooms || []).find(q => m.hx > q.x0 && m.hx < q.x1 && m.hy > q.y0 && m.hy < q.y1);
  return (D.columns || []).map(([x, y], i) => ({ x, y, i })).filter(c => !room || (c.x > room.x0 && c.x < room.x1 && c.y > room.y0 && c.y < room.y1));
}
export function colsRestore(W) { W.colHit = {}; for (const b of W.blocks) if (b.col != null && b.off) { b.off = false; W.nav = null; } }
function colHit(W, i, hits) { W.colHit = W.colHit || {}; W.colHit[i] = (W.colHit[i] || 0) + 1; if (W.colHit[i] >= hits) { const b = W.blocks.find(q => q.col === i); if (b) { b.off = true; W.nav = null; } return true; } return false; }
/** Колонна между боссом и героем (целая): за ней не достаёт квак. */
export function coverOf(G, m, hits) {
  const P = G.P, dH = dist(m.x, m.y, P.x, P.y);
  for (const c of colsOf(G, m)) { if ((G.W.colHit && G.W.colHit[c.i] || 0) >= hits) continue; const dc = dist(m.x, m.y, c.x, c.y); if (dc < dH && segD(c.x, c.y - 4, m.x, m.y, P.x, P.y) < 30) return c; }
  return null;
}
/** Плен: герой у пасти; вырваться — жать удар (каждое нажатие −0,25 с). */
function capture(G, m, a, kind, say) {
  const P = G.P; P.held = { m, t: a.hold, max: a.hold, dps: a.dps, kind }; P.auto = null; P.goal = null; P.dash = null;
  say(kind === 'swallow' ? 'проглотил героя!' : 'поймал языком!');
}
/** Листья кувшинок: виден ли лист сейчас (up с, потом тонет на down с). */
export const padUp = (G, p) => { const T = (G.t - p.t0 + p.off) % (p.up + p.down); return T < p.up; };
export const padLeft = (G, p) => { const T = (G.t - p.t0 + p.off) % (p.up + p.down); return T < p.up ? p.up - T : 0; };

function startAct(G, m, k, a, say, api = {}) {
  const P = G.P, d = ang(m.x, m.y, P.x, P.y), act = { k, a, t: a.wind || 0, x: P.x, y: P.y, dir: d };
  m.B.dir = d; m.atkT = m.atkDur = (a.wind || 0.4) + 0.3;
  if (a.say) say(a.say);
  const n0 = G.fx.length;
  if (k === 'cone') G.fx.push({ k: 'teleCone', x: m.x, y: m.y, a: d, r: a.range, arc: a.arc, t: a.wind, max: a.wind, seed: seed(G) });
  else if (k === 'charge' || k === 'lunge') {
    // конец линии: до упора в стену (подземелье — комнаты), не дальше len
    const w = wang(m.x, m.y, P.x, P.y); let L = a.len; for (let s = 20; s <= a.len; s += 20) { if (!G.W.walkable(m.x + Math.cos(w) * s, m.y + Math.sin(w) * s)) { L = s - 20; break; } }
    act.x2 = m.x + Math.cos(w) * L; act.y2 = m.y + Math.sin(w) * L; act.x0 = m.x; act.y0 = m.y;
    G.fx.push({ k: 'teleLine', x: m.x, y: m.y, x2: act.x2, y2: act.y2, w: a.w, t: a.wind, max: a.wind, seed: seed(G) });
  } else if (k === 'stomp') G.fx.push({ k: 'tele', x: m.x, y: m.y, r: a.r, t: a.wind, max: a.wind, seed: seed(G) });
  else if (k === 'leap') G.fx.push({ k: 'tele', x: P.x, y: P.y, r: a.r, t: a.wind + a.air, max: a.wind + a.air, seed: seed(G) });
  else if (k === 'ring') { act.t = a.dur; const gap = G.rand() * Math.PI * 2; (G.rings = G.rings || []).push({ x: P.x, y: P.y, r: a.r, gap, gw: a.gap, t: a.dur + 0.5, max: a.dur + 0.5, m, seed: seed(G) }); }
  else if (k === 'shed') { act.t = a.wind; m.B.immune = a.immune; G.fx.push({ k: 'shed', x: m.x, y: m.y, t: 1.6, max: 1.6, seed: seed(G) }); }
  else if (k === 'rite') {   // в купель: идёт туда, неуязвима; вокруг — тотемы
    const c = spot(G, a.at) || { x: m.hx, y: m.hy }; Object.assign(act, { t: a.dur, x: c.x, y: c.y, go: 3 }); m.B.immune = a.dur + 4;
    for (let i = 0; i < a.n; i++) { const an = -Math.PI / 2 + (i + 0.5) / a.n * Math.PI * 2 + (G.rand() - 0.5) * 0.4; let r = a.ring, x, y; do { x = c.x + Math.cos(an) * r; y = c.y + Math.sin(an) * r * 0.55; r -= 20; } while (r > 80 && !G.W.walkable(x, y)); if (api.spawn) { const o = api.spawn(a.kind, x, y, a.dur + 1); if (o) o.still = true; } }
    m.B.rite = act;
  } else if (k === 'rain') {   // ядовитый дождь до конца боя; листья вокруг купели (или дома босса) по очереди
    const c = spot(G, 'font') || { x: m.hx, y: m.hy }; G.pads = (G.pads || []).filter(p => p.m !== m); act.t = 0;
    for (let i = 0; i < a.pads; i++) { const an = i / a.pads * Math.PI * 2 + 0.4; let r = a.ring, x, y; do { x = c.x + Math.cos(an) * r; y = c.y + Math.sin(an) * r * 0.6; r -= 20; } while (r > 120 && !G.W.walkable(x, y)); G.pads.push({ x, y, r: a.pr, t0: G.t, off: i * (a.up + a.down) / a.pads, up: a.up, down: a.down, m, seed: seed(G) }); }
    G.rain = { m, dps: a.dps };
  } else if (k === 'throne') { const c = spot(G, a.at) || { x: m.hx, y: m.hy }; Object.assign(act, { t: 0, x: c.x, y: c.y + 20, shot: 1.5 }); m.B.immune = 1e6; }
  else if (k === 'tongue') {
    const w = wang(m.x, m.y, P.x, P.y); let L = a.len; for (let s = 20; s <= a.len; s += 20) { if (!G.W.walkable(m.x + Math.cos(w) * s, m.y + Math.sin(w) * s)) { L = s - 20; break; } }
    act.x2 = m.x + Math.cos(w) * L; act.y2 = m.y + Math.sin(w) * L; act.x0 = m.x; act.y0 = m.y;
    G.fx.push({ k: 'teleLine', x: m.x, y: m.y, x2: act.x2, y2: act.y2, w: a.w, t: a.wind, max: a.wind, col: '230,120,150', seed: seed(G) });
  } else if (k === 'swallow') G.fx.push({ k: 'teleCone', x: m.x, y: m.y, a: d, r: a.range, arc: a.arc, t: a.wind, max: a.wind, seed: seed(G) });
  else if (k === 'kvak') { act.t = a.wind; m.B.kvak = act; G.fx.push({ k: 'kvakWind', x: m.x, y: m.y, t: a.wind, max: a.wind, m, seed: seed(G) }); }
  if (G.fx.length > n0 && k !== 'shed' && k !== 'rain') act.fx = G.fx[G.fx.length - 1];
  return act;
}

function actTick(G, m, act, dt, hurt, go, say, api = {}) {
  const P = G.P, a = act.a;
  if (act.k === 'throne') {   // сидит на троне: неуязвим, пока жива стража; кидает тину
    const gs = G.mobs.filter(o => o.camp && o.camp.name === a.guards && o.state !== 'dead' && !o.summon);
    if (dist(m.x, m.y, act.x, act.y) > 12) go(act.x, act.y, m.D.speed * 1.5); else m.face = P.x < m.x ? -1 : 1;
    if (!gs.length) { m.B.immune = 0; say(a.upSay, true); m.B.act = null; return; }
    for (const o of gs) if (o.state === 'idle' && api.aggro) api.aggro(o);
    act.shot -= dt;
    if (act.shot <= 0 && dist(m.x, m.y, P.x, P.y) < 650 && api.shot) { act.shot = a.every; m.atkT = m.atkDur = 0.5; api.shot(m); }
    return;
  }
  act.t -= dt;
  if (act.k === 'rite') {
    if (act.go > 0) { act.go -= dt; act.t += dt; if (dist(m.x, m.y, act.x, act.y) > 14) { go(act.x, act.y, m.D.speed * 2.2); m.B.immune = Math.max(m.B.immune, 0.3); return; } act.go = 0; }
    m.B.immune = Math.max(m.B.immune, 0.3); m.face = P.x < m.x ? -1 : 1;
    const left = G.mobs.filter(o => o.owner === m && o.kind === a.kind && o.state !== 'dead');
    if (!left.length) { m.B.immune = 0; m.B.rite = null; m.stun = a.stun; say(a.breakSay); G.fx.push({ k: 'slam', x: m.x, y: m.y, r: 90, seed: seed(G), t: 1.2, max: 1.2 }); m.B.act = null; return; }
    if (act.t <= 0) { for (const o of left) { o.state = 'dead'; o.gone = true; } m.B.immune = 0; m.B.rite = null; say(a.failSay, true); G.fx.push({ k: 'slam', x: P.x, y: P.y, r: 120, style: 'coil', seed: seed(G), t: 1.6, max: 1.6 }); if (!P.dead) hurt(G.st.maxHp * a.pct, 'pierce'); m.B.act = null; }
    return;
  }
  if (act.k === 'rain') { m.B.act = null; return; }
  if (act.k === 'tongue') {
    if (act.hold) { if (!P.held || P.held.m !== m) { m.B.act = null; m.cd = 0.8; } else m.face = P.x < m.x ? -1 : 1; return; }
    if (act.t <= 0) { if (!P.dead && segD(P.x, P.y, act.x0, act.y0, act.x2, act.y2) < a.w / 2 + 12) { capture(G, m, a, 'tongue', say); act.hold = true; G.fx.push({ k: 'ram', x: P.x, y: P.y, seed: seed(G), t: 0.6, max: 0.6 }); } else m.B.act = null; }
    return;
  }
  if (act.k === 'swallow') {
    if (act.hold) { if (!P.held || P.held.m !== m) { m.B.act = null; if (a.spit) { m.stun = a.spit; say('выплюнул — бейте!'); } } return; }
    if (act.t <= 0) { const inR = ed(m.x, m.y, P.x, P.y) < a.range + 14, inA = Math.abs(dA(ang(m.x, m.y, P.x, P.y), act.dir)) < a.arc / 2; if (inR && inA && !P.dead) { capture(G, m, a, 'swallow', say); act.hold = true; } else m.B.act = null; }
    return;
  }
  if (act.k === 'kvak') {
    if (act.t > 0) return;
    m.B.kvak = null; const c = coverOf(G, m, a.hits);
    G.fx.push({ k: 'kvakWave', x: m.x, y: m.y, r: 900, seed: seed(G), t: 1.4, max: 1.4 }); say(a.hitSay);
    if (c) { const broke = colHit(G.W, c.i, a.hits); G.fx.push({ k: 'slam', x: c.x, y: c.y, r: 60, seed: seed(G), t: 1.2, max: 1.2 }); if (broke) say('колонна рухнула!'); }
    else if (!P.dead && !(P.held)) { hurt(G.st.maxHp * a.pct, 'pierce'); P.stunT = a.stun; }
    m.B.act = null; return;
  }
  if (act.k === 'cone') { if (act.t <= 0) { const inR = ed(m.x, m.y, P.x, P.y) < a.range + 14, inA = Math.abs(dA(ang(m.x, m.y, P.x, P.y), act.dir)) < a.arc / 2; G.fx.push({ k: 'slam', x: m.x + Math.cos(act.dir) * a.range * 0.55, y: m.y + Math.sin(act.dir) * a.range * 0.27, r: a.range * 0.5, seed: seed(G), t: 1.4, max: 1.4 }); if (inR && inA) hurt(G.st.maxHp * a.pct, 'pierce'); m.B.act = null; } return; }
  if (act.k === 'charge') {
    if (act.t > 0) return;
    if (!act.run) { act.run = true; act.hit = false; }
    const tx = act.x2, ty = act.y2, d = dist(m.x, m.y, tx, ty), sp = a.speed || 900, k = Math.min(1, sp * dt / Math.max(1, d));
    const px = m.x, py = m.y; m.x += (tx - m.x) * k; m.y += (ty - m.y) * k; m.moving = true; m.walkPh = (m.walkPh || 0) + dt * 4;
    G.fx.push({ k: 'hoof', x: m.x, y: m.y, seed: seed(G), t: 0.6, max: 0.6 });
    if (!act.hit && segD(P.x, P.y, px, py, m.x, m.y) < a.w / 2 + 12) { act.hit = true; hurt(G.st.maxHp * a.pct, 'pierce'); G.fx.push({ k: 'ram', x: P.x, y: P.y, seed: seed(G), t: 0.8, max: 0.8 }); }
    if (d < 6 || k >= 1) { m.B.act = null; if (a.after) m.stun = a.after; }
    return;
  }
  if (act.k === 'lunge') { if (act.t <= 0) { if (segD(P.x, P.y, act.x0, act.y0, act.x2, act.y2) < a.w / 2 + 12) { hurt(G.st.maxHp * a.pct, 'pierce'); if (a.poison && !P.dead) { P.poison = { t: 5, dps: m.dmg * a.poison }; P.slow = 2; G.fx.push({ k: 'venom', x: P.x, y: P.y, seed: seed(G), t: 1.2, max: 1.2 }); } } G.fx.push({ k: 'ram', x: act.x2, y: act.y2, seed: seed(G), t: 0.6, max: 0.6 }); m.B.act = null; } return; }
  if (act.k === 'stomp') { if (act.t <= 0) { G.fx.push({ k: 'slam', x: m.x, y: m.y, r: a.r, seed: seed(G), t: 1.8, max: 1.8 }); if (ed(m.x, m.y, P.x, P.y) < a.r) hurt(G.st.maxHp * a.pct, 'pierce'); if (a.open) { m.B.open = a.open; say(a.openSay || 'опустил щит — бейте!'); } m.B.act = null; } return; }
  if (act.k === 'leap') {
    if (act.t > 0 && !act.air) return;
    if (!act.air) { act.air = a.air; act.x0 = m.x; act.y0 = m.y; }
    act.air -= dt; const q = Math.max(0, 1 - act.air / a.air); m.x = act.x0 + (act.x - act.x0) * q; m.y = act.y0 + (act.y - act.y0) * q; m.jumpH = Math.sin(q * Math.PI) * 60;
    if (act.air <= 0) { m.jumpH = 0; G.fx.push({ k: 'slam', x: m.x, y: m.y, r: a.r, seed: seed(G), t: 1.8, max: 1.8 }); if (ed(m.x, m.y, P.x, P.y) < a.r) hurt(G.st.maxHp * a.pct, 'pierce'); if (a.stun) { m.stun = a.stun; say(a.stunSay || 'оглушён — бейте!'); } m.B.act = null; }
    return;
  }
  if (act.k === 'ring') {   // свернулся вокруг героя; герой выходит только через просвет
    const R = (G.rings || []).find(r => r.m === m); if (!R) { m.B.act = null; return; }
    if (act.t <= 0) { const inside = ed(R.x, R.y, P.x, P.y) < R.r - 6; G.rings = G.rings.filter(r => r !== R); G.fx.push({ k: 'slam', x: R.x, y: R.y, r: R.r, style: 'coil', seed: seed(G), t: 1.4, max: 1.4 }); if (inside && !P.dead) { hurt(G.st.maxHp * a.pct, 'pierce'); P.rooted = a.root; say(a.hitSay || 'сжат кольцами!'); } m.B.act = null; }
    return;
  }
  if (act.k === 'shed') {   // сбросил кожу: неуязвим, вокруг лужи яда
    if (act.t <= 0) { const n = a.puddles; for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2 + G.rand(), r = 70 + G.rand() * 130, x = m.x + Math.cos(an) * r, y = m.y + Math.sin(an) * r * 0.8; if (G.W.walkable(x, y)) (G.hazards = G.hazards || []).push({ x, y, r: a.pr, t: a.plife, max: a.plife, dps: m.dmg * a.pdps, m, seed: seed(G) }); } if (a.haste) m.B.haste = a.haste; m.B.act = null; }
    return;
  }
  m.B.act = null;
}

/** Кольца и лужи: время, урон в луже. Движение героя через кольцо проверяет ringBlocks. */
export function hazardsTick(G, dt, hurt) {
  const P = G.P;
  if (G.rain) { if (G.rain.m.state === 'dead' || G.rain.m.state === 'return') { G.rain = null; G.pads = []; } else if (!P.dead && !(P.held) && !onPad(G)) hurt(G.st.maxHp * G.rain.dps * dt, true); }
  if (G.rings) for (const r of G.rings) r.t -= dt;
  if (G.hazards) { for (const h of G.hazards) { h.t -= dt; if (!P.dead && ed(h.x, h.y, P.x, P.y) < h.r) hurt(h.dps * dt, true, h); } G.hazards = G.hazards.filter(h => h.t > 0 && h.m.state !== 'dead'); }
  if (G.rings) G.rings = G.rings.filter(r => r.t > 0 && r.m.state !== 'dead');
}
/** Стоит ли герой на живом листе кувшинки. */
export const onPad = G => (G.pads || []).some(p => padUp(G, p) && ed(p.x, p.y, G.P.x, G.P.y) < p.r);
/** Можно ли шагнуть из (x0,y0) в (x1,y1): кольцо не пускает наружу, кроме как через просвет. */
export function ringBlocks(G, x0, y0, x1, y1) {
  for (const r of G.rings || []) {
    const d0 = ed(r.x, r.y, x0, y0), d1 = ed(r.x, r.y, x1, y1);
    if (d0 < r.r && d1 >= r.r - 4 && d1 > d0) { if (Math.abs(dA(ang(r.x, r.y, x1, y1), r.gap)) > r.gw / 2) return true; }
  }
  return false;
}

/** Умение сбито (оглушили, заморозили): предупреждение и кольцо гаснут. */
export function bossCancel(G, m) {
  const A = m.B && m.B.act; if (!A) return;
  if (A.k === 'rite' || A.k === 'throne' || A.hold) return;   // v117: обряд, трон и плен оглушением не сбить
  if (A.fx) A.fx.t = 0; if (A.k === 'ring' && G.rings) G.rings = G.rings.filter(r => r.m !== m); if (A.k === 'kvak') m.B.kvak = null;
  m.B.act = null; m.jumpH = 0;
}
