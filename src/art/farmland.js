// Хуторские угодья: поля, река с мостами, стога, плетни, мельница. В стиле героев: тёмная обводка, 2–3 тона.
// Поля и река рисуются в землю (кусками 512), стога, мельница и мосты — готовыми картинками по глубине.
const O = '#24180f';
function hp(g, fn, fill, lw = 1.2) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

// ---------------------------------------------------------------- поля (в землю)
const CROP = {
  wheat: { soil: '#9a7a44', row: '#d8b44a', hi: '#f0d27a', lo: '#a8862e' },
  sun: { soil: '#7a6a3a', row: '#5d8a3a', hi: '#ffd34d', lo: '#3e6a2a' },
  cabbage: { soil: '#6a4e30', row: '#7ab04a', hi: '#a8d070', lo: '#4a7a2a' },
  pasture: { soil: '#8a9a4a', row: '#9aaa52', hi: '#b8c070', lo: '#6a7a3a' },
  orchard: { soil: '#5a6a3a', row: '#6a7a3a', hi: '#8a9a4a', lo: '#4a5a2a' },
};
/** Поле внутри повёрнутого прямоугольника (центр x,y). Рисуется в контекст земли. */
export function field(g, F) {
  const K = CROP[F.crop] || CROP.wheat, r = rnd(Math.floor(F.x * 7 + F.y));
  g.save(); g.translate(F.x, F.y); g.rotate(F.a || 0);
  const w = F.w, h = F.h;
  // межа
  g.fillStyle = 'rgba(70,50,25,.35)'; g.beginPath(); g.roundRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 18); g.fill();
  g.fillStyle = K.soil; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 14); g.fill();
  g.save(); g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 14); g.clip();
  if (F.crop === 'pasture') { // выгон: трава и вытоптанные места
    for (let i = 0; i < w * h / 900; i++) { g.fillStyle = r() < 0.5 ? K.hi : K.lo; g.globalAlpha = 0.5; g.beginPath(); g.ellipse(-w / 2 + r() * w, -h / 2 + r() * h, 6 + r() * 14, 3 + r() * 6, 0, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  } else if (F.crop === 'orchard') { // сад: ряды пней и упавшие яблоки
    for (let y = -h / 2 + 40; y < h / 2; y += 80) for (let x = -w / 2 + 40; x < w / 2; x += 80) { g.fillStyle = 'rgba(40,30,20,.35)'; g.beginPath(); g.ellipse(x, y, 16, 7, 0, 0, 7); g.fill(); g.fillStyle = '#b83a2a'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + (r() - 0.5) * 30, y + (r() - 0.5) * 14, 2, 0, 7); g.fill(); } }
  } else { // борозды
    const step = F.crop === 'wheat' ? 16 : 26;
    for (let y = -h / 2 + step / 2; y < h / 2; y += step) {
      g.fillStyle = 'rgba(40,25,10,.25)'; g.fillRect(-w / 2, y + step * 0.3, w, 3);
      for (let x = -w / 2 + 4; x < w / 2; x += F.crop === 'wheat' ? 5 : 22) {
        const jx = x + (r() - 0.5) * 3;
        if (F.crop === 'wheat') { g.strokeStyle = r() < 0.5 ? K.row : K.lo; g.lineWidth = 1.6; g.beginPath(); g.moveTo(jx, y + 4); g.lineTo(jx + (r() - 0.5) * 3, y - 7); g.stroke(); g.fillStyle = K.hi; g.beginPath(); g.ellipse(jx + (r() - 0.5) * 2, y - 8, 1.3, 2.6, 0, 0, 7); g.fill(); }
        else if (F.crop === 'sun') { g.fillStyle = K.lo; g.fillRect(jx - 1, y - 10, 2, 14); g.fillStyle = K.row; g.beginPath(); g.ellipse(jx - 4, y - 2, 4, 2, -0.5, 0, 7); g.ellipse(jx + 4, y - 4, 4, 2, 0.5, 0, 7); g.fill(); hp(g, () => g.arc(jx, y - 12, 5, 0, 7), K.hi, 0.9); g.fillStyle = '#6a4a20'; g.beginPath(); g.arc(jx, y - 12, 2.2, 0, 7); g.fill(); }
        else { hp(g, () => g.arc(jx, y - 2, 7, 0, 7), K.row, 0.9); g.fillStyle = K.hi; g.beginPath(); g.arc(jx - 1.5, y - 4, 3.6, 0, 7); g.fill(); g.strokeStyle = K.lo; g.lineWidth = 0.8; g.beginPath(); g.moveTo(jx - 5, y); g.quadraticCurveTo(jx, y - 6, jx + 5, y); g.stroke(); }
      }
    }
  }
  g.restore(); g.restore();
}

// ---------------------------------------------------------------- река (в землю)
/** Точка на ломаной: длина вдоль, координаты, направление. */
export function riverAt(pts, x) { for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; if (x >= ax && x <= bx) { const k = (x - ax) / (bx - ax); return { x, y: ay + (by - ay) * k, a: Math.atan2(by - ay, bx - ax) }; } } return null; }
export function river(g, R, t = 0) {
  const path = () => { g.beginPath(); R.pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); };   // ломаная: так же считается вода
  g.lineJoin = 'round'; g.lineCap = 'round';
  path(); g.strokeStyle = '#6a5a34'; g.lineWidth = R.w + 26; g.stroke();          // берег
  path(); g.strokeStyle = '#8a9a5a'; g.lineWidth = R.w + 14; g.stroke();          // прибрежная трава
  path(); g.strokeStyle = '#2f5d72'; g.lineWidth = R.w; g.stroke();
  path(); g.strokeStyle = '#3f7a92'; g.lineWidth = R.w * 0.62; g.stroke();
  path(); g.strokeStyle = 'rgba(200,230,240,.18)'; g.lineWidth = 3; g.setLineDash([22, 30]); g.lineDashOffset = -t * 30; g.stroke(); g.setLineDash([]);
}

// ---------------------------------------------------------------- предметы (готовые картинки)
/** Мост через реку: доски, перила; начало — середина моста. len — ширина реки + берега. */
export function bridge(g, len) {
  const w = 70;
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-w / 2 + 6, -len / 2 + 8, w, len);
  hp(g, () => g.rect(-w / 2, -len / 2, w, len), '#8a6a42', 1.4);
  for (let y = -len / 2 + 6; y < len / 2; y += 12) { g.fillStyle = (y / 12) % 2 < 1 ? '#9a7a4a' : '#7e5e38'; g.fillRect(-w / 2 + 2, y, w - 4, 10); g.strokeStyle = 'rgba(36,24,15,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 2, y + 10); g.lineTo(w / 2 - 2, y + 10); g.stroke(); }
  for (const sx of [-1, 1]) { hp(g, () => g.rect(sx * w / 2 - 4, -len / 2 - 6, 8, len + 12), '#6b4a2c', 1.2); for (let y = -len / 2; y <= len / 2; y += len / 4) hp(g, () => g.rect(sx * w / 2 - 5, y - 14, 10, 18), '#5a3e24', 1.1); }
}
export function haystack(g) {
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(4, 2, 30, 8, 0, 0, 7); g.fill();
  hp(g, () => { g.moveTo(-28, 0); g.quadraticCurveTo(-30, -30, -6, -46); g.quadraticCurveTo(0, -50, 6, -46); g.quadraticCurveTo(30, -30, 28, 0); g.closePath(); }, '#d8b44a', 1.4);
  g.strokeStyle = '#a8862e'; g.lineWidth = 1.2; for (let i = 0; i < 9; i++) { const x = -22 + i * 5.5; g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x * 0.7, -24, x * 0.3, -40); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-10, -30, 7, 12, -0.4, 0, 7); g.fill();
  hp(g, () => { g.moveTo(-6, -46); g.lineTo(0, -56); g.lineTo(6, -46); }, '#c9a040', 1);
}
/** Плетень от (0,0) до (dx,dy). */
export function wattle(g, dx, dy) {
  const L = Math.hypot(dx, dy), n = Math.max(2, Math.round(L / 22));
  for (let i = 0; i <= n; i++) { const x = dx * i / n, y = dy * i / n; g.strokeStyle = O; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 22); g.stroke(); g.strokeStyle = '#7a5530'; g.lineWidth = 2; g.stroke(); }
  for (const h of [-7, -12, -17]) { g.strokeStyle = O; g.lineWidth = 3.6; g.beginPath(); g.moveTo(0, h); g.lineTo(dx, dy + h); g.stroke(); g.strokeStyle = '#9a7a4a'; g.lineWidth = 2.2; g.stroke(); }
}
/** Ветряная мельница: основание (крылья рисуются отдельно, они крутятся). */
export function millBase(g, ruined) {
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(8, 4, 58, 14, 0, 0, 7); g.fill();
  hp(g, () => { g.moveTo(-34, 0); g.lineTo(-24, -110); g.lineTo(24, -110); g.lineTo(34, 0); g.closePath(); }, '#9a8a6a', 1.6);
  g.save(); g.beginPath(); g.moveTo(-34, 0); g.lineTo(-24, -110); g.lineTo(24, -110); g.lineTo(34, 0); g.closePath(); g.clip();
  g.strokeStyle = 'rgba(60,45,30,.45)'; g.lineWidth = 1; for (let y = -104; y < 0; y += 10) { g.beginPath(); g.moveTo(-40, y); g.lineTo(40, y); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(8, -112, 30, 114);
  if (ruined) { g.fillStyle = 'rgba(30,20,12,.55)'; g.beginPath(); g.moveTo(-30, -20); g.lineTo(-18, -60); g.lineTo(-6, -30); g.lineTo(-14, 0); g.fill(); }
  g.restore();
  hp(g, () => { g.moveTo(-30, -108); g.quadraticCurveTo(0, -150, 30, -108); g.closePath(); }, '#5a3e2a', 1.5);
  hp(g, () => g.roundRect(-9, -30, 18, 30, 3), '#4a3220', 1.2);
  hp(g, () => g.rect(-6, -78, 12, 12), '#2a1a10', 1); g.fillStyle = 'rgba(120,255,170,.6)'; g.fillRect(-4, -76, 8, 8); // в окне — зелёный свет колдуна
  // мешки с мукой
  for (const [x, y] of [[-46, 0], [-38, -6], [40, 2]]) { hp(g, () => { g.moveTo(x - 7, y); g.quadraticCurveTo(x - 8, y - 14, x - 2, y - 15); g.lineTo(x + 2, y - 15); g.quadraticCurveTo(x + 8, y - 14, x + 7, y); g.closePath(); }, '#e8e0cc', 1); }
}
/** Крылья мельницы, ступица в (0,0), поворот a. */
export function millBlades(g, a, ruined) {
  g.save(); g.rotate(a);
  for (let i = 0; i < 4; i++) {
    g.save(); g.rotate(i * Math.PI / 2);
    if (ruined && i === 2) { g.restore(); continue; }
    g.strokeStyle = O; g.lineWidth = 4.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -78); g.stroke(); g.strokeStyle = '#6b4a2c'; g.lineWidth = 2.6; g.stroke();
    hp(g, () => g.rect(2, -76, 18, ruined && i === 1 ? 30 : 62), ruined ? 'rgba(200,190,170,.55)' : 'rgba(236,228,206,.92)', 1);
    g.strokeStyle = 'rgba(36,24,15,.5)'; g.lineWidth = 0.8; for (let y = -70; y < -14; y += 10) { g.beginPath(); g.moveTo(2, y); g.lineTo(20, y); g.stroke(); }
    g.restore();
  }
  g.restore();
  hp(g, () => g.arc(0, 0, 6, 0, 7), '#5a3e24', 1.2);
}
/** Колодец посёлка. */
export function well(g) {
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(4, 2, 24, 7, 0, 0, 7); g.fill();
  hp(g, () => g.ellipse(0, -10, 20, 8, 0, 0, 7), '#8a867d', 1.3); hp(g, () => g.rect(-20, -10, 40, 12), '#77736a', 1.3); hp(g, () => g.ellipse(0, -10, 14, 5, 0, 0, 7), '#1a2a32', 1);
  for (const sx of [-1, 1]) hp(g, () => g.rect(sx * 16 - 2, -46, 4, 36), '#6b4a2c', 1);
  hp(g, () => { g.moveTo(-26, -42); g.lineTo(0, -60); g.lineTo(26, -42); g.closePath(); }, '#8a3a2a', 1.3);
  g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -42); g.lineTo(0, -22); g.stroke(); hp(g, () => g.rect(-4, -24, 8, 7), '#7a5530', 0.9);
}
