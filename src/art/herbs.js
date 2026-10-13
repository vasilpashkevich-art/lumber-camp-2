// Кусты трав (v84): серебролист, полынь, светлячковый гриб — по колено герою (≈ 18–26), обводка и свет как у всего.
// Начало координат — у корня. Блеск поверх каждый кадр, чтобы травы замечали издалека, как жилы.
const O = '#24180f';
const rnd = s => { s = Math.abs(s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
function hp(g, fn, fill, lw = 1.2) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
function leaf(g, x, y, len, w, a, fill, hi) {
  g.save(); g.translate(x, y); g.rotate(a);
  hp(g, () => { g.moveTo(0, 0); g.quadraticCurveTo(w, -len * 0.45, 0, -len); g.quadraticCurveTo(-w, -len * 0.45, 0, 0); }, fill, 1.1);
  g.strokeStyle = hi; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, -len + 3); g.stroke();
  g.restore();
}
export function bush(g, herb, seed = 1) {
  const r = rnd(seed * 31 + 7);
  g.fillStyle = 'rgba(20,12,6,.22)'; g.beginPath(); g.ellipse(2, 2, 16, 5, 0, 0, 7); g.fill();
  if (herb === 'silverleaf') {
    for (let i = 0; i < 9; i++) { const a = (i / 9 - 0.5) * 2.4 + (r() - 0.5) * 0.3, len = 16 + r() * 10, w = 4 + r() * 2; leaf(g, (r() - 0.5) * 8, 0, len, w, a, i % 2 ? '#b8d8b8' : '#9cc4a4', '#f0fff0'); }
    for (let i = 0; i < 3; i++) { const x = (r() - 0.5) * 16, y = -14 - r() * 8; hp(g, () => g.arc(x, y, 2.6, 0, 7), '#ffffff', 0.9); g.fillStyle = '#ffd860'; g.beginPath(); g.arc(x, y, 1, 0, 7); g.fill(); }
  } else if (herb === 'wormwood') {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7 - 0.5) * 2.2 + (r() - 0.5) * 0.3, len = 20 + r() * 10, x0 = (r() - 0.5) * 10;
      g.save(); g.translate(x0, 0); g.rotate(a);
      g.strokeStyle = O; g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len); g.stroke(); g.strokeStyle = '#8aa060'; g.lineWidth = 1.4; g.stroke();
      for (let k = 2; k < len - 3; k += 4) { const s = (k % 8 ? 1 : -1) * (3 + r() * 2); hp(g, () => { g.moveTo(0, -k); g.quadraticCurveTo(s * 0.8, -k - 1.5, s, -k - 3.5); g.quadraticCurveTo(s * 0.4, -k - 1, 0, -k); }, '#a8bc78', 0.8); }
      g.restore();
    }
    g.fillStyle = '#e8e0a0'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc((r() - 0.5) * 14, -22 - r() * 6, 1.2, 0, 7); g.fill(); }
  } else if (herb === 'glowcap') {
    g.fillStyle = 'rgba(80,180,150,.35)'; g.beginPath(); g.ellipse(0, -4, 18, 9, 0, 0, 7); g.fill();
    for (let i = 0; i < 4; i++) {
      const x = -10 + i * 7 + (r() - 0.5) * 4, h = 8 + r() * 8, cw = 5 + r() * 3, y = (r() - 0.5) * 4;
      hp(g, () => g.roundRect(x - 1.6, y - h, 3.2, h, 1.5), '#d8e8d8', 1); hp(g, () => { g.moveTo(x - cw, y - h); g.quadraticCurveTo(x, y - h - cw * 1.4, x + cw, y - h); g.closePath(); }, i % 2 ? '#7ad8c0' : '#5ec4a8', 1.1);
      g.fillStyle = '#c8fff0'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x - cw * 0.5 + k * cw * 0.5, y - h - cw * 0.5, 0.9, 0, 7); g.fill(); }
    }
    for (let i = 0; i < 5; i++) leaf(g, (r() - 0.5) * 24, 2, 8 + r() * 5, 2.5, (i / 5 - 0.5) * 2.8, '#6a8a58', '#9ab888');
  } else { // огнецвет (на всякий случай, в мире не растёт)
    for (let i = 0; i < 5; i++) leaf(g, (r() - 0.5) * 10, 0, 14 + r() * 6, 3, (i / 5 - 0.5) * 2.4, '#6a8a48', '#a8c880');
    hp(g, () => g.arc(0, -16, 5, 0, 7), '#ff8a3a', 1); g.fillStyle = '#ffe080'; g.beginPath(); g.arc(0, -16, 2, 0, 7); g.fill();
  }
}
/** Блеск куста (каждый кадр): серебряная искра, светлячки у гриба. */
export function herbGlint(g, herb, t, seed = 0) {
  if (herb === 'glowcap') { const q = (t * 0.5 + seed * 0.2) % 1, a = 0.35 + 0.35 * Math.sin(t * 2 + seed); g.fillStyle = `rgba(150,255,220,${a})`; for (let i = 0; i < 3; i++) { const x = Math.sin(t * 0.8 + i * 2.1 + seed) * 14, y = -16 - ((q * 30 + i * 11) % 30); g.beginPath(); g.arc(x, y, 1.3, 0, 7); g.fill(); } return; }
  const q = (t * 0.6 + seed * 0.37) % 1; if (q > 0.3) return;
  const a = Math.sin(q / 0.3 * Math.PI), x = -8 + (seed * 11 % 16), y = -20 + (seed * 5 % 8), s = 5 * a;
  g.fillStyle = herb === 'wormwood' ? `rgba(240,240,200,${0.85 * a})` : `rgba(255,255,255,${0.9 * a})`;
  g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.22, y - s * 0.22); g.lineTo(x + s, y); g.lineTo(x + s * 0.22, y + s * 0.22); g.lineTo(x, y + s); g.lineTo(x - s * 0.22, y + s * 0.22); g.lineTo(x - s, y); g.lineTo(x - s * 0.22, y - s * 0.22); g.closePath(); g.fill();
}
/** Листья, летящие к герою при сборе (каждый кадр): q — доля времени сбора. */
export function pickLeaves(g, v, P, q, col) {
  const r = rnd(v.s * 13 + 5);
  for (let i = 0; i < 6; i++) { const t0 = r() * 0.8, k = (q - t0) / 0.5; if (k < 0 || k > 1) continue; const x = v.x + (P.x - v.x) * k + (r() - 0.5) * 10, y = v.y - 8 + (P.y - 34 - v.y + 8) * k - Math.sin(k * Math.PI) * 14;
    g.save(); g.translate(x, y); g.rotate(k * 6 + i); g.globalAlpha = 1 - k * 0.6; g.fillStyle = col; g.strokeStyle = O; g.lineWidth = 0.7; g.beginPath(); g.ellipse(0, 0, 3.4, 1.7, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
}
/** Взмах листьев, когда куст собран (G.fx 'herbPick'). */
export function herbBurst(g, f, age) {
  const q = age / f.max, r = rnd(f.seed * 7 + 3);
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.4, d = (20 + r() * 25) * q, x = f.x + Math.cos(a) * d, y = f.y - 10 + Math.sin(a) * d + 40 * q * q;
    g.save(); g.translate(x, y); g.rotate(q * 5 + i); g.globalAlpha = 1 - q; g.fillStyle = f.col; g.strokeStyle = O; g.lineWidth = 0.7; g.beginPath(); g.ellipse(0, 0, 3, 1.5, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
}
/** Выпитое зелье: цветные пузырьки вверх от героя (G.fx 'drink'). */
export function drinkFx(g, f, age) {
  const q = age / f.max, r = rnd(f.seed * 17 + 1);
  for (let i = 0; i < 12; i++) { const t0 = r() * 0.5, k = (q - t0) / 0.5; if (k < 0 || k > 1) continue; const x = f.x + (r() - 0.5) * 30, y = f.y - 20 - k * 60, s = 1.5 + r() * 2.5;
    g.globalAlpha = (1 - k) * 0.9; g.fillStyle = f.col; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - s * 0.3, y - s * 0.3, s * 0.35, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
