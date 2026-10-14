// v94: «умный игрок» для автоигрока и дуэлей — уходит от умений боссов (конус, полоса, круг, кольцо, лужи, щит).
/** Уклонение от умений босса: шаг из конуса/полосы/круга, к просвету кольца, из луж, за спину щита. */
export function dodge(G, m) {
  const P = G.P, B = m.B, out = (x, y) => { const d = Math.hypot(P.x - x, P.y - y); if (d < 5) return { mx: 0, my: 1 }; return { mx: (P.x - x) / d, my: (P.y - y) / d }; };
  for (const r of G.rings || []) if (r.m === m) { const gx = r.x + Math.cos(r.gap) * (r.r + 40), gy = r.y + Math.sin(r.gap) * (r.r + 40) / 2, d = Math.hypot(gx - P.x, gy - P.y) || 1; return { mx: (gx - P.x) / d, my: (gy - P.y) / d }; }
  for (const h of G.hazards || []) if (Math.hypot(P.x - h.x, (P.y - h.y) * 2) < h.r + 10) return out(h.x, h.y);
  if (B && B.act) { const A = B.act;
    if (A.k === 'charge' || A.k === 'lunge') { const vx = A.x2 - A.x0, vy = A.y2 - A.y0, L = Math.hypot(vx, vy) || 1, s = ((P.x - A.x0) * -vy + (P.y - A.y0) * vx) >= 0 ? 1 : -1; return { mx: -vy / L * s, my: vx / L * s }; }
    if (A.k === 'cone') return out(m.x, m.y);
    if (A.k === 'stomp') return out(m.x, m.y);
    if (A.k === 'leap') return out(A.x, A.y);
  }
  const ph = B && m.D.ai.phases[B.phase];
  if (ph && ph.shield && !(B.open > 0) && !(m.stun > 0)) { const bx = m.x - Math.cos(B.dir) * 70, by = m.y - Math.sin(B.dir) * 35, d = Math.hypot(bx - P.x, by - P.y); if (d > 20) return { mx: (bx - P.x) / d, my: (by - P.y) / d }; }
  return {};
}
