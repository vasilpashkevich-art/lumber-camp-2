// v94: «умный игрок» для автоигрока и дуэлей — уходит от умений боссов (конус, полоса, круг, кольцо, лужи, щит).
/** Уклонение от умений босса: шаг из конуса/полосы/круга, к просвету кольца, из луж, за спину щита. */
import { padUp, padLeft, colsOf } from '../src/systems/boss.js';
export function dodge(G, m) {
  const P = G.P, B = m.B, out = (x, y) => { const d = Math.hypot(P.x - x, P.y - y); if (d < 5) return { mx: 0, my: 1 }; return { mx: (P.x - x) / d, my: (P.y - y) / d }; };
  const to = (x, y, near = 8) => { const d = Math.hypot(x - P.x, y - P.y); return d < near ? {} : { mx: (x - P.x) / d, my: (y - P.y) / d }; };
  // v117: плен — рваться; квак — за колонну; дождь — на лист; обряд — бить тотемы; трон — бить стражу
  if (P.held) { G.__mash = ((G.__mash || 0) + 1) % 3; return { attackTap: G.__mash === 0, attack: false }; }   // как живой: ≈ 6–7 нажатий в секунду
  if (B && B.kvak) { const P2 = P, cs = colsOf(G, m).filter(c => ((G.W.colHit && G.W.colHit[c.i]) || 0) < B.kvak.a.hits).map(c => { const d = Math.hypot(c.x - m.x, c.y - m.y) || 1; return { x: c.x + (c.x - m.x) / d * 55, y: c.y + (c.y - m.y) / d * 40 }; }).sort((a, b) => Math.hypot(a.x - P2.x, a.y - P2.y) - Math.hypot(b.x - P2.x, b.y - P2.y)); if (cs.length) return to(cs[0].x, cs[0].y, 10); }
  if (G.rain && G.rain.m === m && (G.hero.cls !== 'warrior' || P.hp < G.st.maxHp * 0.6)) {
    const ok = G.pads.filter(p => padUp(G, p) && padLeft(G, p) > 1.8).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
    const on = G.pads.find(p => padUp(G, p) && padLeft(G, p) > 0.6 && Math.hypot(P.x - p.x, (P.y - p.y) * 2) < p.r - 10);
    if (!on && ok.length) return to(ok[0].x, ok[0].y);
    if (on) return {};
  }
  if (B && B.rite) { const tt = G.mobs.filter(o => o.owner === m && o.D.still && o.state !== 'dead').sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y)); if (tt.length) { const reach = G.hero.cls === 'warrior' ? 60 : 250; return { target: tt[0], ...(Math.hypot(tt[0].x - P.x, tt[0].y - P.y) > reach ? to(tt[0].x, tt[0].y) : {}) }; } }
  if (B && B.act && B.act.k === 'throne') { const gs = G.mobs.filter(o => o.camp && o.camp.name === B.act.a.guards && o.state !== 'dead'); if (gs.length) return { target: gs[0] }; }
  const adds = G.mobs.filter(o => o.owner === m && !o.D.still && o.state !== 'dead' && Math.hypot(o.x - P.x, o.y - P.y) < 120); if (adds.length) { const r = dodgeAct(); return { ...r, target: adds[0] }; }
  return dodgeAct();
  function dodgeAct() {
  for (const r of G.rings || []) if (r.m === m) { const gx = r.x + Math.cos(r.gap) * (r.r + 40), gy = r.y + Math.sin(r.gap) * (r.r + 40) / 2, d = Math.hypot(gx - P.x, gy - P.y) || 1; return { mx: (gx - P.x) / d, my: (gy - P.y) / d }; }
  for (const h of G.hazards || []) if (Math.hypot(P.x - h.x, (P.y - h.y) * 2) < h.r + 10) return out(h.x, h.y);
  if (B && B.act) { const A = B.act;
    if (A.k === 'swallow') return out(m.x, m.y);
    if ((A.k === 'charge' || A.k === 'lunge' || A.k === 'tongue') && !A.hold) { const vx = A.x2 - A.x0, vy = A.y2 - A.y0, L = Math.hypot(vx, vy) || 1, s = ((P.x - A.x0) * -vy + (P.y - A.y0) * vx) >= 0 ? 1 : -1; return { mx: -vy / L * s, my: vx / L * s }; }
    if (A.k === 'cone') return out(m.x, m.y);
    if (A.k === 'stomp') return out(m.x, m.y);
    if (A.k === 'leap') return out(A.x, A.y);
  }
  const ph = B && m.D.ai.phases[B.phase];
  if (ph && ph.shield && !(B.open > 0) && !(m.stun > 0)) { const bx = m.x - Math.cos(B.dir) * 70, by = m.y - Math.sin(B.dir) * 35, d = Math.hypot(bx - P.x, by - P.y); if (d > 20) return { mx: (bx - P.x) / d, my: (by - P.y) / d }; }
  return {};
}
}
