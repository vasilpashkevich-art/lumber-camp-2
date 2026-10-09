// Эскиз v64: новое тело человека (герой, разбойники, стража). Пропорции ≈ 4,3 головы (было ≈ 2).
// Ступни на +12.6, макушка ≈ −22.3: рост ≈ 35 единиц × 1,15 ≈ 40 шагов мира — как раньше.
// L = { cls, skin, hair, beard, head:{m,P}, chest:{m,P}, legs:{m,P}, weapon:{m,P}, hood, mask, broad }
// pose = { walk: 0..1 | -1, atk: 0..1 | -1, hit, dead, t }
import { O, sh, W_BY, H_BY, C_BY, L_BY, drawHelm, fillMat, palette } from './gear.js';
const TAU = Math.PI * 2;
export const SKIN = '#e6b48a';
const NAKED = palette('start', 1, 0);

export function person(c, L, view, pose = {}) {
  const bw = (L.broad || 1) * 1.1, skin = L.skin || SKIN, hair = L.hair || '#b8642a', t = pose.t || 0;
  const ch = L.chest && C_BY[L.chest.m], chP = L.chest ? L.chest.P : NAKED;
  const lg = L.legs && L_BY[L.legs.m], lgP = L.legs ? L.legs.P : NAKED;
  const hm = L.head && H_BY[L.head.m], hmP = L.head ? L.head.P : null;
  const wp = L.weapon && W_BY[L.weapon.m], wpP = L.weapon ? L.weapon.P : null;
  const W = pose.walk >= 0, p = W ? pose.walk : 0, s = Math.sin(p * TAU), co = Math.cos(p * TAU);
  const A = pose.atk >= 0 ? pose.atk : -1, hit = pose.hit || 0, dead = pose.dead || 0;
  const F = (fn, fill, lw = 0.7) => { c.beginPath(); fn(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = O; c.lineWidth = lw; c.stroke(); } };
  const limb = (x1, y1, x2, y2, w, col, hi = true) => { c.lineCap = 'round'; c.strokeStyle = O; c.lineWidth = w + 1.2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); if (hi) { c.strokeStyle = 'rgba(255,245,225,.18)'; c.lineWidth = w * 0.3; c.beginPath(); c.moveTo(x1 - w * 0.22, y1); c.lineTo(x2 - w * 0.22, y2); c.stroke(); } };
  // цвета частей
  const legCol = !lg ? skin : lg.base === 'cloth' ? lgP.cloth[1] : lg.base === 'leather' ? lgP.leather : lg.base === 'mail' ? sh(lgP.metal, -0.08) : lgP.metal;
  const bootCol = !lg ? sh(skin, -0.08) : lg.boots === 'sabaton' ? lgP.metal : lg.boots === 'shoe' ? '#4a3020' : sh(lgP.leather, -0.2);
  const sleeve = !ch ? skin : ch.sleeve === 'cloth' ? (ch.base === 'shirt' ? chP.cloth[0] : ch.base === 'gambeson' ? chP.cloth[1] : chP.cloth[0]) : ch.sleeve === 'mail' ? sh(chP.metal, -0.08) : chP.metal;
  const glove = !ch ? skin : ch.sleeve === 'plate' ? sh(chP.metal, -0.05) : ch.base === 'leather' || ch.sleeve === 'mail' ? sh(chP.leather, -0.1) : skin;
  const hideHair = hm && hm.hair === 'all', hideFace = hm && hm.face;

  const bob = W ? -Math.abs(co) * 0.9 : Math.sin(t * 2.2) * 0.25;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  if (dead > 0) { const q = Math.min(1, dead * 1.6); c.translate(0, 12 - 5 * q); c.rotate((view === 'back' ? -1 : 1) * q * Math.PI / 2 * (view === 'side' ? -1 : 1)); c.translate(0, -12); }
  c.translate(view === 'side' ? -hit * 2 : 0, bob - (view !== 'side' ? hit * 1.2 : 0));
  if (view === 'side' && hit) c.rotate(-hit * 0.16);
  if (view === 'side' && W) c.rotate(0.04);
  // свечение фиолетовой вещи под ногами
  const glow = [chP, lgP, hmP, wpP].find(P => P && P.glow);
  if (glow) { const g = c.createRadialGradient(0, 11, 1, 0, 11, 16); g.addColorStop(0, glow.glow + '77'); g.addColorStop(1, glow.glow + '00'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 11, 16, 6, 0, 0, 7); c.fill(); }

  // удар сверху вниз (Воин, кирка): a — угол руки от «вниз», + вперёд; −2.6 — над головой
  let SW = null;
  if (A >= 0) { const k = A < 0.35 ? A / 0.35 : A < 0.55 ? 1 + (A - 0.35) / 0.2 : 2 - (A - 0.55) / 0.45; SW = { a: k <= 1 ? 0.3 - k * 2.9 : -2.6 + (k - 1) * 4.1, k, trail: A > 0.35 && A < 0.6 }; }
  const two = wp && wp.hands === 2;

  if (view === 'side') side(); else frontBack(view === 'back');
  c.restore();

  // ================================================================ части
  function cape(back, sideV) {
    if (!ch || !ch.cape) return; const col = chP.cloth[0];
    if (sideV) { F(() => { c.moveTo(-1.6, -12); c.quadraticCurveTo(-4.6, -2, -6.4 - (W ? Math.abs(s) * 1.4 : 0), 11.6); c.lineTo(-1.6, 11.8); c.lineTo(-0.6, -11); c.closePath(); }, sh(col, -0.15)); return; }
    if (back) { F(() => { c.moveTo(-5.6 * bw, -12.4); c.lineTo(5.6 * bw, -12.4); c.lineTo(7.2 + s * 0.6, 11.8); c.quadraticCurveTo(0, 13, -7.2 + s * 0.6, 11.8); c.closePath(); }, col); c.strokeStyle = chP.acc; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-7, 11.4); c.quadraticCurveTo(0, 12.6, 7, 11.4); c.stroke(); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 0.4; for (const x of [-3, 0.5, 3.6]) { c.beginPath(); c.moveTo(x * 0.6, -11); c.lineTo(x, 11); c.stroke(); } }
    else F(() => { c.moveTo(-6 * bw, -11); c.lineTo(-7.6, 11.6); c.lineTo(7.6, 11.6); c.lineTo(6 * bw, -11); c.closePath(); }, sh(col, -0.25));
  }
  // торс спереди/сзади
  function torF() { const x = bw; c.moveTo(-1.8, -13.2); c.quadraticCurveTo(-5.4 * x, -13, -6.5 * x, -10.8); c.lineTo(-5.8 * x, -6.6); c.quadraticCurveTo(-4.5, -3, -4.4, -0.6); c.lineTo(-4.8, 2.4); c.quadraticCurveTo(0, 3.4, 4.8, 2.4); c.lineTo(4.4, -0.6); c.quadraticCurveTo(4.5, -3, 5.8 * x, -6.6); c.lineTo(6.5 * x, -10.8); c.quadraticCurveTo(5.4 * x, -13, 1.8, -13.2); c.quadraticCurveTo(0, -12.6, -1.8, -13.2); c.closePath(); }
  function torS() { c.moveTo(-1.2, -13.2); c.quadraticCurveTo(-3.4, -12.6, -3.5, -9.6); c.lineTo(-3.1, -2); c.quadraticCurveTo(-3.3, 0.6, -3, 2.4); c.lineTo(2.9, 2.4); c.quadraticCurveTo(3.2, 0, 3, -2); c.quadraticCurveTo(4.1 * bw, -6, 3.3, -10.2); c.quadraticCurveTo(2.6, -12.8, 1.2, -13.2); c.closePath(); }
  function chest(back, sideV) {
    const path = sideV ? torS : torF;
    if (!ch) { F(path, skin); if (!back && !sideV) { c.strokeStyle = 'rgba(140,80,50,.5)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-3.8, -8); c.quadraticCurveTo(-1.8, -6.4, -0.3, -7.6); c.moveTo(0.3, -7.6); c.quadraticCurveTo(1.8, -6.4, 3.8, -8); c.moveTo(0, -6); c.lineTo(0, 0); c.stroke(); } }
    else fillMat(c, path, ch.base, chP);
    // накидка (табард) поверх кольчуги
    if (ch && ch.tabard) { const w = sideV ? 1.6 : 3.2, x0 = sideV ? 2.2 : 0; F(() => { c.moveTo(x0 - w, -12.6); c.lineTo(x0 + w, -12.6); c.lineTo(x0 + w * 1.1, 6.6); c.lineTo(x0, 7.6); c.lineTo(x0 - w * 1.1, 6.6); c.closePath(); }, chP.cloth[0], 0.6); if (!sideV) { c.strokeStyle = chP.acc; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-w + 0.4, 6.2); c.lineTo(0, 7); c.lineTo(w - 0.4, 6.2); c.stroke(); if (!back) emblem(0, -6.8, chP); } }
    // латы: рёбра жёсткости и юбка из полос
    if (ch && ch.base === 'plate') { if (!sideV && !back) { c.strokeStyle = sh(chP.metal, -0.35); c.lineWidth = 0.45; c.beginPath(); c.moveTo(0, -12.4); c.lineTo(0, -1.4); c.stroke(); c.strokeStyle = chP.acc; c.lineWidth = 0.55; c.beginPath(); c.moveTo(-4.4, -3.6); c.quadraticCurveTo(0, -1.4, 4.4, -3.6); c.stroke(); if (chP.gem) gemS(0, -8, 0.9, chP.gem); }
      for (let i = 0; i < 2; i++) F(() => c.roundRect(sideV ? -3.2 : -5 - i * 0.3, 1.2 + i * 1.6, sideV ? 6.4 : 10 + i * 0.6, 1.8, 0.5), sh(chP.metal, -0.05 * i), 0.5); }
    // пояс
    if (ch && ch.base !== 'shirt' && ch.base !== 'plate') { F(() => c.rect(sideV ? -3.1 : -4.5, -0.6, sideV ? 6 : 9, 1.4), sh(chP.leather, -0.3), 0.5); if (!back) F(() => c.rect(sideV ? 2 : -0.7, -0.7, 1.4, 1.6), chP.acc, 0.4); }
    if (ch && ch.base === 'shirt') { c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.9; c.beginPath(); sideV ? (c.moveTo(-3, 0.4), c.lineTo(3, 0.4)) : (c.moveTo(-4.5, 0.2), c.quadraticCurveTo(0, 0.9, 4.5, 0.2)); c.stroke(); if (!back && !sideV) { c.strokeStyle = sh(chP.cloth[0], -0.35); c.lineWidth = 0.4; c.beginPath(); c.moveTo(-1.4, -13); c.lineTo(0, -10); c.lineTo(1.4, -13); c.stroke(); } }
    if (ch && ch.base === 'leather' && !back) { c.strokeStyle = sh(chP.leather, -0.45); c.lineWidth = 0.8; c.beginPath(); sideV ? (c.moveTo(-2.6, -11), c.lineTo(2.6, -2.4)) : (c.moveTo(-4.6, -11.2), c.lineTo(4, -1.6)); c.stroke(); }
    if (ch && ch.base === 'gambeson' && !sideV) F(() => c.roundRect(-2.4, -13.6, 4.8, 1.4, 0.6), chP.cloth[0], 0.4);
  }
  function emblem(x, y, P) { F(() => { c.moveTo(x - 1.6, y - 1.6); c.lineTo(x + 1.6, y - 1.6); c.lineTo(x + 1.6, y + 0.4); c.quadraticCurveTo(x + 1.4, y + 2, x, y + 2.6); c.quadraticCurveTo(x - 1.4, y + 2, x - 1.6, y + 0.4); c.closePath(); }, P.acc, 0.4); c.fillStyle = P.cloth[0]; c.beginPath(); c.moveTo(x, y - 1); c.lineTo(x + 0.8, y + 0.4); c.lineTo(x, y + 1.6); c.lineTo(x - 0.8, y + 0.4); c.closePath(); c.fill(); }
  function gemS(x, y, r, col) { F(() => { c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); }, col, 0.4); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(x - r * 0.4, y - r * 0.5, r * 0.35, r * 0.35); }
  // наплечник в точке (x,y), sx — сторона (для «спереди» обе, для «сбоку» одна)
  function pauldron(x, y, sx, sideV) {
    if (!ch || !ch.pauld) return; const P = chP, k = ch.pauld;
    if (k === 'leather') { F(() => c.ellipse(x, y, 2.4, 1.8, sx * 0.2, Math.PI * 1.02, Math.PI * 2.02), P.leather, 0.55); return; }
    if (k === 'scale') { F(() => { c.ellipse(x, y + 0.4, 2.8, 2.4, 0, Math.PI, 0); c.closePath(); }, P.metal, 0.55); for (const dy of [-0.8, 0.6]) { c.strokeStyle = sh(P.metal, -0.35); c.lineWidth = 0.3; c.beginPath(); c.ellipse(x, y + dy + 0.6, 2.4, 1.2, 0, Math.PI, 0); c.stroke(); } return; }
    const big = k === 'big', rx = big ? 3.7 : 3, ry = big ? 3.1 : 2.4;
    for (let i = 2; i >= 0; i--) { const yy = y + i * (big ? 1.25 : 1); F(() => { c.ellipse(x + sx * i * 0.15, yy, rx - i * 0.2, ry - i * 0.3, 0, Math.PI * 1.0, Math.PI * 2.0); c.closePath(); }, sh(P.metal, -0.08 * i), 0.55); }
    c.strokeStyle = P.acc; c.lineWidth = 0.55; c.beginPath(); c.ellipse(x, y, rx - 0.3, ry - 0.3, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - rx * 0.35, y - ry * 0.55, rx * 0.3, ry * 0.18, -0.3, 0, 7); c.fill();
    if (big && !sideV) for (const d of [-1.1, 1.1]) F(() => { c.moveTo(x + d - 0.5, y - ry + 0.3); c.lineTo(x + d * 1.3, y - ry - 2.2); c.lineTo(x + d + 0.5, y - ry + 0.3); c.closePath(); }, P.edge, 0.4);
    if (big && P.gem) gemS(x, y - ry * 0.35, 0.7, P.gem);
  }
  // ноги спереди/сзади
  function legsFB(back) {
    for (const [lx, k] of [[-2.3, 1], [2.3, -1]]) {
      const lift = W ? Math.max(0, s * k) * 2 : 0, fy = 12.4 - lift, kx = lx * 1.05, ky = 7.2 - lift * 0.5;
      limb(lx * 1.08, 1.6, kx * 1.08, ky, 3.9, legCol); limb(kx * 1.08, ky, lx * 1.12, fy - 1.2, 3.4, legCol);
      boot(lx * 1.12, fy, back, ky);
      if (lg && lg.knee) F(() => c.ellipse(kx, ky, 1.5, 1.2, 0, 0, 7), lg.base === 'plate' ? lgP.metal : lgP.leather, 0.45);
    }
    // юбка рубахи/куртки поверх бёдер
    if (ch && (ch.base === 'leather' || ch.base === 'gambeson' || ch.base === 'mail')) F(() => { c.moveTo(-4.8, 1.8); c.lineTo(-5.2, 4.4); c.quadraticCurveTo(0, 5.2, 5.2, 4.4); c.lineTo(4.8, 1.8); c.closePath(); }, ch.base === 'mail' ? sh(chP.metal, -0.05) : ch.base === 'leather' ? chP.leather : chP.cloth[1], 0.55);
    if (!lg) F(() => { c.moveTo(-4.6, 1.4); c.lineTo(4.6, 1.4); c.lineTo(4.4, 4.6); c.lineTo(0.6, 4.4); c.lineTo(0, 3.4); c.lineTo(-0.6, 4.4); c.lineTo(-4.4, 4.6); c.closePath(); }, '#ece6da', 0.55);
  }
  function boot(x, fy, back, ky) {
    if (!lg) { F(() => c.ellipse(x, fy - 0.2, 1.6, 0.9, 0, 0, 7), bootCol, 0.5); return; }
    if (lg.boots === 'shoe') { F(() => c.ellipse(x, fy - 0.3, 1.8, 1.1, 0, 0, 7), bootCol, 0.5); return; }
    const top = lg.boots === 'boot' ? fy - 4.6 : ky + 0.6;
    F(() => c.roundRect(x - 1.95, top, 3.9, fy - top, 0.8), bootCol, 0.5);
    F(() => c.ellipse(x, fy - 0.2, 2.2, 1.2, 0, 0, 7), bootCol, 0.5);
    if (lg.boots === 'sabaton') { c.strokeStyle = sh(lgP.metal, -0.35); c.lineWidth = 0.3; for (let y = top + 1.4; y < fy - 1; y += 1.2) { c.beginPath(); c.moveTo(x - 1.6, y); c.lineTo(x + 1.6, y); c.stroke(); } }
    else F(() => c.rect(x - 1.85, top - 0.2, 3.7, 0.9), sh(bootCol, -0.25), 0.4);
  }
  // голова спереди
  function headF() { c.save(); c.translate(0, -15); c.scale(1.08, 1.08); c.translate(0, 15); headF_(); c.restore(); }
  function headF_() {
    if (!hideHair) F(() => c.ellipse(0, -18.6, 3.9, 4.3, 0, 0, 7), hair, 0.6);
    for (const x of [-3.45, 3.45]) F(() => c.ellipse(x, -17.9, 0.7, 1.1, 0, 0, 7), skin, 0.5);
    F(() => c.rect(-1.5, -15, 3, 2.4), sh(skin, -0.1), 0.5);
    const face = () => { c.moveTo(-3.4, -18.6); c.bezierCurveTo(-3.4, -23.4, 3.4, -23.4, 3.4, -18.6); c.quadraticCurveTo(3.3, -15.6, 1.2, -14.2); c.quadraticCurveTo(0, -13.8, -1.2, -14.2); c.quadraticCurveTo(-3.3, -15.6, -3.4, -18.6); c.closePath(); };
    F(face, skin, 0.6); c.save(); c.beginPath(); face(); c.clip(); c.fillStyle = 'rgba(150,80,40,.16)'; c.fillRect(1.2, -24, 4, 12); c.restore();
    if (!hideFace) {
      for (const x of [-1.35, 1.35]) { F(() => c.ellipse(x, -18.3, 0.62, 0.38, 0, 0, 7), '#f6efe4', 0.3); c.fillStyle = '#3a2a1a'; c.beginPath(); c.arc(x + 0.08, -18.3, 0.26, 0, 7); c.fill(); }
      c.strokeStyle = sh(hair, -0.3); c.lineWidth = 0.42; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 0.5, -19.15); c.quadraticCurveTo(sx * 1.4, -19.6, sx * 2.25, -19.2); c.stroke(); }
      c.strokeStyle = 'rgba(120,60,30,.55)'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(0.15, -18.2); c.lineTo(0.45, -16.6); c.lineTo(-0.25, -16.45); c.stroke();
      if (L.beard) beardF(); else { c.strokeStyle = '#8a4a3a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-0.8, -15.4); c.quadraticCurveTo(0, -15.1, 0.8, -15.4); c.stroke(); }
      if (L.mask) F(() => { c.moveTo(-3.4, -17); c.quadraticCurveTo(0, -16.2, 3.4, -17); c.quadraticCurveTo(3.2, -14.6, 0, -13.4); c.quadraticCurveTo(-3.2, -14.6, -3.4, -17); c.closePath(); }, L.mask, 0.5);
    }
    if (!hideHair && !L.hood) F(() => { c.moveTo(-3.6, -18); c.bezierCurveTo(-3.9, -23.6, 3.9, -23.6, 3.6, -18); c.lineTo(3.2, -19.4); c.quadraticCurveTo(1.6, -21.2, -0.4, -20.5); c.quadraticCurveTo(-2.6, -21, -3.2, -19.4); c.closePath(); }, hair, 0.55);
    if (L.hood) drawHelm(c, 'coif', { cloth: [L.hood, sh(L.hood, -0.2)], metal: L.hood, acc: L.hood, leather: L.hood }, 'front');
    if (hm) drawHelm(c, L.head.m, hmP, 'front');
  }
  function beardF() { const b = L.beard === 'grey' ? '#d8d2c8' : sh(hair, -0.05);
    F(() => { c.moveTo(-3.35, -17.6); c.quadraticCurveTo(-3.4, -14, -1.4, -12.6); c.quadraticCurveTo(0, -12, 1.4, -12.6); c.quadraticCurveTo(3.4, -14, 3.35, -17.6); c.quadraticCurveTo(2.6, -16, 1.2, -15.9); c.quadraticCurveTo(0, -16.6, -1.2, -15.9); c.quadraticCurveTo(-2.6, -16, -3.35, -17.6); c.closePath(); }, b, 0.5);
    F(() => { c.moveTo(-1.8, -15.8); c.quadraticCurveTo(0, -16.9, 1.8, -15.8); c.quadraticCurveTo(0, -16.2, -1.8, -15.8); }, sh(b, -0.15), 0.35);
    c.strokeStyle = '#7a3a2a'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(-0.6, -15.2); c.lineTo(0.6, -15.2); c.stroke();
    c.strokeStyle = sh(b, -0.3); c.lineWidth = 0.25; for (const x of [-2, -0.8, 0.6, 1.8]) { c.beginPath(); c.moveTo(x, -14.6); c.lineTo(x * 0.85, -13); c.stroke(); } }
  function headB() { c.save(); c.translate(0, -15); c.scale(1.08, 1.08); c.translate(0, 15); headB_(); c.restore(); }
  function headB_() {
    for (const x of [-3.45, 3.45]) F(() => c.ellipse(x, -17.9, 0.7, 1.1, 0, 0, 7), skin, 0.5);
    F(() => c.rect(-1.5, -15, 3, 2.4), sh(skin, -0.15), 0.5);
    F(() => c.ellipse(0, -18.5, 3.5, 4.3, 0, 0, 7), skin, 0.6);
    if (!hideHair && !L.hood) { F(() => { c.moveTo(-3.6, -16.4); c.bezierCurveTo(-4.2, -24, 4.2, -24, 3.6, -16.4); c.quadraticCurveTo(0, -15, -3.6, -16.4); c.closePath(); }, hair, 0.55); c.strokeStyle = sh(hair, -0.25); c.lineWidth = 0.3; for (const x of [-1.6, 0, 1.6]) { c.beginPath(); c.moveTo(x * 0.6, -21.6); c.quadraticCurveTo(x, -19, x * 1.1, -16.2); c.stroke(); } }
    if (L.beard && !hideHair) for (const sx of [-1, 1]) F(() => { c.moveTo(sx * 3.4, -17); c.quadraticCurveTo(sx * 3.6, -14.6, sx * 2.6, -13.6); c.lineTo(sx * 2.8, -16); c.closePath(); }, sh(hair, -0.05), 0.4);
    if (L.mask) { c.strokeStyle = L.mask; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-3.4, -16.6); c.lineTo(3.4, -16.6); c.stroke(); }
    if (L.hood) drawHelm(c, 'coif', { cloth: [L.hood, sh(L.hood, -0.2)], metal: L.hood, acc: L.hood, leather: L.hood }, 'back');
    if (hm) drawHelm(c, L.head.m, hmP, 'back');
  }
  function headS() { c.save(); c.translate(0, -15); c.scale(1.08, 1.08); c.translate(0, 15); headS_(); c.restore(); }
  function headS_() {
    F(() => c.rect(-0.9, -15, 2.6, 2.4), sh(skin, -0.1), 0.5);
    if (!hideHair) F(() => c.ellipse(-0.3, -18.8, 3.8, 4.2, 0, 0, 7), hair, 0.6);
    const face = () => { c.moveTo(-2.8, -16.2); c.bezierCurveTo(-4.2, -23.6, 3.6, -24.2, 3.7, -19); c.lineTo(3.8, -18.2); c.quadraticCurveTo(4.5, -17.2, 3.85, -16.85); c.lineTo(3.6, -15.8); c.quadraticCurveTo(3.4, -14.2, 1.6, -14); c.quadraticCurveTo(-0.8, -14, -2.8, -16.2); c.closePath(); };
    F(face, skin, 0.6); c.save(); c.beginPath(); face(); c.clip(); c.fillStyle = 'rgba(150,80,40,.15)'; c.fillRect(-4, -24, 3, 12); c.restore();
    F(() => c.ellipse(-0.2, -17.9, 0.75, 1.15, 0.1, 0, 7), skin, 0.45);
    if (!hideFace) {
      F(() => c.ellipse(2.55, -18.35, 0.42, 0.36, 0, 0, 7), '#f6efe4', 0.25); c.fillStyle = '#3a2a1a'; c.beginPath(); c.arc(2.75, -18.33, 0.22, 0, 7); c.fill();
      c.strokeStyle = sh(hair, -0.3); c.lineWidth = 0.42; c.beginPath(); c.moveTo(1.8, -19.25); c.quadraticCurveTo(2.6, -19.6, 3.4, -19.2); c.stroke();
      if (L.beard) { const b = L.beard === 'grey' ? '#d8d2c8' : sh(hair, -0.05); F(() => { c.moveTo(-0.6, -17); c.quadraticCurveTo(-0.4, -14.6, 1.4, -13); c.quadraticCurveTo(3.4, -12.8, 4, -14.6); c.lineTo(3.9, -16.2); c.quadraticCurveTo(2.6, -15.8, 1.6, -16.4); c.quadraticCurveTo(0.6, -16.8, -0.6, -17); c.closePath(); }, b, 0.5); }
      else { c.strokeStyle = '#8a4a3a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(3, -15.5); c.lineTo(3.7, -15.6); c.stroke(); }
      if (L.mask) F(() => { c.moveTo(0.4, -17.2); c.quadraticCurveTo(3, -17.4, 4.4, -17); c.lineTo(3.9, -14); c.quadraticCurveTo(1.6, -13.6, 0.4, -14.6); c.closePath(); }, L.mask, 0.5);
    }
    if (!hideHair && !L.hood) F(() => { c.moveTo(-3.8, -16); c.bezierCurveTo(-5, -24.6, 3.9, -24.4, 3.6, -19.4); c.quadraticCurveTo(2, -20.8, 0.6, -20.2); c.quadraticCurveTo(0.4, -18.4, -0.6, -16.6); c.closePath(); }, hair, 0.55);
    if (L.hood) drawHelm(c, 'coif', { cloth: [L.hood, sh(L.hood, -0.2)], metal: L.hood, acc: L.hood, leather: L.hood }, 'side');
    if (hm) drawHelm(c, L.head.m, hmP, 'side');
  }
  function weapon(hx, hy, rot) {
    if (!wp) return; c.save(); c.translate(hx, hy); c.rotate(rot); wp.draw(c, wpP); c.restore();
  }
  function hand(x, y) { F(() => c.arc(x, y, 1.5, 0, 7), glove, 0.5); }
  function forearmBands(ex, ey, hx, hy) { if (ch && ch.sleeve === 'plate') { limb(ex + (hx - ex) * 0.25, ey + (hy - ey) * 0.25, ex + (hx - ex) * 0.85, ey + (hy - ey) * 0.85, 2.9, chP.metal, false); c.strokeStyle = chP.acc; c.lineWidth = 0.4; c.beginPath(); c.moveTo(ex + (hx - ex) * 0.85 - 1.3, ey + (hy - ey) * 0.85); c.lineTo(ex + (hx - ex) * 0.85 + 1.3, ey + (hy - ey) * 0.85); c.stroke(); } }

  // ================================================================ сбоку (лицом вправо)
  function side() {
    cape(false, true);
    // дальняя рука (за телом); у двуручного — тянется к древку
    const legS = (hx, ph, col, bc) => { const sn = Math.sin(ph * TAU), cs = Math.cos(ph * TAU), a1 = W ? sn * 0.5 : 0, bend = W ? Math.max(0, cs) * 0.85 : 0, a2 = a1 - bend;
      const kx = hx + Math.sin(a1) * 5.4, ky = 1.8 + Math.cos(a1) * 5.4, fx = kx + Math.sin(a2) * 5, fy = ky + Math.cos(a2) * 5;
      limb(hx, 1.8, kx, ky, 3.8, col); limb(kx, ky, fx, fy, 3.3, col);
      if (lg && lg.boots !== 'shoe') limb(kx + Math.sin(a2) * (lg.boots === 'boot' ? 2 : 0.6), ky + Math.cos(a2) * (lg.boots === 'boot' ? 2 : 0.6), fx, fy, 3.3, bc, false);
      F(() => c.ellipse(fx + 1.2, fy + 0.2, 2.3, 1.1, a2 * 0.3, 0, 7), bc, 0.5);
      if (lg && lg.knee) F(() => c.ellipse(kx + 0.6, ky, 1.2, 1.4, 0, 0, 7), lg.base === 'plate' ? lgP.metal : lgP.leather, 0.4); };
    const sw = SW, aN = sw ? sw.a : (W ? -s * 0.5 : 0.15);
    const armPts = (sx, sy, a) => { const ex = sx + Math.sin(a) * 5, ey = sy + Math.cos(a) * 5, a2 = a + 0.35, hx = ex + Math.sin(a2) * 4.8, hy = ey + Math.cos(a2) * 4.8; return { ex, ey, hx, hy, a2 }; };
    const near = armPts(0.5, -10.4, aN);
    if (two) { const r = near.a2 - 0.1, gx = near.hx - Math.sin(r) * 3.4, gy = near.hy + Math.cos(r) * 3.4; const sx = -0.6, sy = -10.4; const mx = (sx + gx) / 2 - 1.2, my = (sy + gy) / 2 + 1.2; limb(sx, sy, mx, my, 3, sh(sleeve, -0.18)); limb(mx, my, gx, gy, 2.7, sh(sleeve, -0.18)); hand(gx, gy); }
    else { const far = armPts(-0.6, -10.4, W ? s * 0.5 : 0.1); limb(-0.6, -10.4, far.ex, far.ey, 3, sh(sleeve, -0.18)); limb(far.ex, far.ey, far.hx, far.hy, 2.7, sh(sleeve, -0.18)); hand(far.hx, far.hy); }
    legS(-0.4, p + 0.5, sh(legCol, -0.15), sh(bootCol, -0.12));
    legS(0.6, p, legCol, bootCol);
    if (ch && (ch.base === 'leather' || ch.base === 'gambeson' || ch.base === 'mail')) F(() => { c.moveTo(-3.1, 1.6); c.lineTo(-3.5, 4.4); c.lineTo(3.4, 4.4); c.lineTo(3, 1.6); c.closePath(); }, ch.base === 'mail' ? sh(chP.metal, -0.05) : ch.base === 'leather' ? chP.leather : chP.cloth[1], 0.55);
    chest(false, true);
    headS();
    // ближняя рука с оружием; оружие замахом уходит за голову
    if (sw && sw.a < -1.2) weapon(near.hx, near.hy, near.a2 - 0.1);
    limb(0.5, -10.4, near.ex, near.ey, 3.1, sleeve); limb(near.ex, near.ey, near.hx, near.hy, 2.8, sleeve); forearmBands(near.ex, near.ey, near.hx, near.hy);
    pauldron(0.4, -10.8, 1, true);
    if (!(sw && sw.a < -1.2)) weapon(near.hx, near.hy, near.a2 - 0.1);
    hand(near.hx, near.hy);
    if (sw && sw.trail) { c.strokeStyle = 'rgba(255,250,230,.7)'; c.lineWidth = 2.2; c.beginPath(); c.arc(0, -8, 20, -1.9, 0.6); c.stroke(); }
  }

  // ================================================================ спереди и сзади
  function frontBack(back) {
    if (L.part === 'legs') { legsFB(back); F(() => c.roundRect(-5.2, 0.2, 10.4, 2, 0.6), lg && lg.base === 'plate' ? lgP.metal : sh(lgP.leather || '#5a3a1c', -0.3), 0.5); F(() => c.rect(-0.8, 0.1, 1.6, 2.2), lgP.acc || '#c9a050', 0.4); return; }
    if (!back && L.part !== 'chest') cape(false, false);
    if (L.part !== 'chest') legsFB(back);
    else if (ch && (ch.base === 'leather' || ch.base === 'gambeson' || ch.base === 'mail')) F(() => { c.moveTo(-4.8, 1.8); c.lineTo(-5.2, 4.4); c.quadraticCurveTo(0, 5.2, 5.2, 4.4); c.lineTo(4.8, 1.8); c.closePath(); }, ch.base === 'mail' ? sh(chP.metal, -0.05) : ch.base === 'leather' ? chP.leather : chP.cloth[1], 0.55);
    chest(back, false);
    if (L.part === 'chest') { const drawArmP = sx => { limb(sx * 6.1 * bw, -10.6, sx * 6.9 * bw, -5.2, 3.1, sleeve); limb(sx * 6.9 * bw, -5.2, sx * 7.1 * bw, 0.2, 2.8, sleeve); forearmBands(sx * 6.9 * bw, -5.2, sx * 7.1 * bw, 0.2); }; drawArmP(-1); drawArmP(1); for (const sx of [-1, 1]) pauldron(sx * 6.1 * bw, -10.9, sx, false); return; }
    // руки: оружие — в правой руке героя (слева на экране, если лицом к нам)
    const wx = back ? 1 : -1;
    const arm = (sx) => {
      let hx = sx * 7.1 * bw, hy = 0.4 + (W ? (sx === wx ? 1 : -1) * s * 1.2 : 0), ex = sx * 6.9 * bw, ey = -5.2, rot = sx * -0.28 * (back ? -1 : 1) * -1;
      if (SW && sx === wx) { const q = SW.a; if (q <= 0.3) { const lift = Math.min(1, (0.3 - q) / 2.9); hx = sx * (7.1 - lift * 4.4); hy = 0.4 - lift * 21; ex = sx * (7.6 - lift * 1.2); ey = -5.2 - lift * 9.6; rot = sx * (-0.28 + lift * 1.2) * -1; }
        else { const d = Math.min(1, (q - 0.3) / 1.2); hx = sx * (7.1 - d * 3.6); hy = 0.4 - d * 4.6; ex = sx * 7.2; ey = -5.6; rot = sx * (-0.28 - d * 2.3) * -1; } }
      return { hx, hy, ex, ey, rot };
    };
    const R = arm(wx), Lh = arm(-wx);
    const lifted = SW && SW.a < -0.6;
    const drawArm = (a, sx) => { limb(sx * 6.1 * bw, -10.6, a.ex, a.ey, 3.1, sleeve); limb(a.ex, a.ey, a.hx, a.hy, 2.8, sleeve); forearmBands(a.ex, a.ey, a.hx, a.hy); };
    if (lifted && !back) weapon(R.hx, R.hy, R.rot);
    drawArm(R, wx); drawArm(Lh, -wx);
    for (const sx of [-1, 1]) pauldron(sx * 6.1 * bw, -10.9, sx, false);
    if (back) headB(); else headF();
    if (back && ch && ch.tabard) {} // накидка уже на теле
    if (!lifted || back) { if (two && !back) { /* вторая кисть на древке ниже хвата */ const gx = R.hx - Math.sin(R.rot) * -3.2, gy = R.hy + Math.cos(R.rot) * 3.2; weapon(R.hx, R.hy, R.rot); hand(gx, gy); } else weapon(R.hx, R.hy, R.rot); }
    hand(R.hx, R.hy); hand(Lh.hx, Lh.hy);
    if (back) cape(true, false);
  }
}

/** Кадры, как в игре: шаг 8, удар 6, падение 5. */
export const FRAMES = { walk: 8, atk: 6, idle: 1, dead: 5 };
export function poseOf(mode, f, t = 0) {
  if (mode === 'walk') return { walk: f / FRAMES.walk, t };
  if (mode === 'atk') return { atk: f / FRAMES.atk, t };
  if (mode === 'dead') return { dead: (f + 1) / FRAMES.dead, t };
  return { t };
}
