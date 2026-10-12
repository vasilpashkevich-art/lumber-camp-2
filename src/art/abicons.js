// Иконки умений (v73): рисованные картинки 128×128 — глубокий фон, предмет со светом слева сверху, блики, виньетка,
// рамка с фаской. Рисуются один раз и хранятся картинкой (iconUrl). Вид в духе WoW, свои рисунки.
const TAU = Math.PI * 2, O = '#1a120b';
const CACHE = {};

function bg(g, c0, c1, c2) { const gr = g.createRadialGradient(52, 40, 6, 64, 64, 96); gr.addColorStop(0, c0); gr.addColorStop(0.55, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
function vignette(g) { const gr = g.createRadialGradient(64, 60, 40, 64, 64, 92); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
function gloss(g) { const gr = g.createLinearGradient(0, 0, 0, 70); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(6, 6); g.lineTo(122, 6); g.lineTo(122, 40); g.quadraticCurveTo(64, 62, 6, 46); g.closePath(); g.fill(); }
function frame(g, rim) {
  g.lineJoin = 'round';
  g.strokeStyle = '#0c0805'; g.lineWidth = 8; g.strokeRect(4, 4, 120, 120);
  const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, rim[0]); gr.addColorStop(0.5, rim[1]); gr.addColorStop(1, rim[2]);
  g.strokeStyle = gr; g.lineWidth = 4; g.strokeRect(8, 8, 112, 112);
  g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1.5; g.strokeRect(10.5, 10.5, 107, 107);
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.strokeRect(6.5, 6.5, 115, 115);
}
const RIM = { war: ['#f0c070', '#8a5a2a', '#e0a050'], fire: ['#ffd08a', '#a04a1a', '#ffb060'], ice: ['#d8f0ff', '#4a7aa8', '#a8d4f4'], hunt: ['#d8e8a0', '#4a6a2a', '#b8d080'], blood: ['#ffb0a0', '#7a1a1a', '#e07060'], gold: ['#fff0b0', '#a07a20', '#f0c860'] };
function glow(g, x, y, r, rgb, a = 1) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.45, `rgba(${rgb},${a * 0.45})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
const lighter = (g, fn) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };
function rng(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

// ---------------------------------------------------------------- части предметов
/** Лезвие топора: обух в (x,y), лезвие вправо; масштаб s, угол a. */
function axeHead(g, x, y, s, a, steel = ['#f2f4f6', '#9aa4ae', '#4a525a']) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  const sh = () => { g.beginPath(); g.moveTo(-6, -8); g.lineTo(10, -12); g.quadraticCurveTo(30, -26, 36, -8); g.quadraticCurveTo(40, 4, 36, 16); g.quadraticCurveTo(30, 34, 10, 20); g.lineTo(-6, 14); g.closePath(); };
  const gr = g.createLinearGradient(0, -24, 0, 30); gr.addColorStop(0, steel[0]); gr.addColorStop(0.5, steel[1]); gr.addColorStop(1, steel[2]);
  sh(); g.fillStyle = gr; g.fill(); g.strokeStyle = O; g.lineWidth = 2.4; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(34, -8); g.quadraticCurveTo(37, 4, 34, 14); g.stroke();
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(-6, 4); g.lineTo(18, 6); g.quadraticCurveTo(26, 14, 12, 18); g.lineTo(-6, 14); g.closePath(); g.fill();
  g.fillStyle = '#c9a24a'; g.strokeStyle = O; g.lineWidth = 1.5; g.beginPath(); g.arc(4, 3, 3, 0, TAU); g.fill(); g.stroke();
  g.restore();
}
function haft(g, x0, y0, x1, y1, w = 7) {
  g.lineCap = 'round'; g.strokeStyle = O; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  const gr = g.createLinearGradient(x0 - 4, y0 - 4, x0 + 4, y0 + 4); gr.addColorStop(0, '#b07a48'); gr.addColorStop(1, '#5a3a20'); g.strokeStyle = gr; g.lineWidth = w; g.stroke();
  g.strokeStyle = 'rgba(255,230,190,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 - 1.5, y0 - 1.5); g.lineTo(x1 - 1.5, y1 - 1.5); g.stroke();
  // обмотка
  g.strokeStyle = '#3a2614'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { const t = 0.78 + k * 0.05, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t; g.beginPath(); g.moveTo(px - 4, py + 3); g.lineTo(px + 4, py - 3); g.stroke(); }
}
function flameShape(g, x, y, h, w, cols, lean = 0) {
  const gr = g.createLinearGradient(x, y, x, y - h); gr.addColorStop(0, cols[0]); gr.addColorStop(0.4, cols[1]); gr.addColorStop(0.8, cols[2]); gr.addColorStop(1, 'rgba(120,20,10,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, y); g.bezierCurveTo(x - w * 1.2, y - h * 0.4, x - w * 0.2 + lean, y - h * 0.6, x + lean * 1.6, y - h); g.bezierCurveTo(x + w * 0.5 + lean, y - h * 0.55, x + w * 1.2, y - h * 0.35, x + w, y); g.closePath(); g.fill();
}
const FIRE = ['rgba(255,250,210,1)', 'rgba(255,170,50,.95)', 'rgba(230,70,20,.7)'];
function arrowShape(g, x0, y0, x1, y1, fl = '#e8e0cc', tip = '#d8e0e6', w = 3) {
  const an = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  g.save(); g.translate(x0, y0); g.rotate(an);
  g.strokeStyle = O; g.lineWidth = w + 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(L - 10, 0); g.stroke();
  g.strokeStyle = '#c9a06a'; g.lineWidth = w; g.stroke(); g.strokeStyle = 'rgba(255,240,200,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(2, -1); g.lineTo(L - 12, -1); g.stroke();
  g.fillStyle = tip; g.strokeStyle = O; g.lineWidth = 1.6; g.beginPath(); g.moveTo(L + 4, 0); g.lineTo(L - 12, -7); g.lineTo(L - 8, 0); g.lineTo(L - 12, 7); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(L + 2, -0.5); g.lineTo(L - 10, -5); g.lineTo(L - 8, -0.5); g.closePath(); g.fill();
  g.fillStyle = fl; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(-2, 0); g.lineTo(6, sd * 9); g.lineTo(14, sd * 9); g.lineTo(8, 0); g.closePath(); g.fill(); g.stroke(); }
  g.restore();
}
function spike(g, x, y, h, w, a = 0) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = '#eef9ff'; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.15, -h); g.lineTo(0, 0); g.closePath(); g.fill();
  g.fillStyle = '#7ab4de'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-w * 0.15, -h); g.lineTo(w, 0); g.closePath(); g.fill();
  g.strokeStyle = '#1e4a6a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.15, -h); g.lineTo(w, 0); g.stroke();
  g.restore();
}
function snowflake(g, x, y, s, a = 1) { g.strokeStyle = `rgba(240,252,255,${a})`; g.lineWidth = 1.4; for (let k = 0; k < 3; k++) { const an = k * Math.PI / 3; g.beginPath(); g.moveTo(x - Math.cos(an) * s, y - Math.sin(an) * s); g.lineTo(x + Math.cos(an) * s, y + Math.sin(an) * s); g.stroke(); } }
function drop(g, x, y, s, c0 = '#ff5a4a', c1 = '#7a0a0a') {
  const gr = g.createRadialGradient(x - s * 0.3, y - s * 0.1, 1, x, y + s * 0.3, s * 1.3); gr.addColorStop(0, c0); gr.addColorStop(1, c1);
  g.fillStyle = gr; g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - s * 1.6); g.bezierCurveTo(x + s * 0.4, y - s * 0.8, x + s, y - s * 0.1, x + s, y + s * 0.4); g.arc(x, y + s * 0.4, s, 0, Math.PI); g.bezierCurveTo(x - s, y - s * 0.1, x - s * 0.4, y - s * 0.8, x, y - s * 1.6); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,230,220,.85)'; g.beginPath(); g.ellipse(x - s * 0.4, y, s * 0.18, s * 0.38, 0.3, 0, TAU); g.fill();
}

// ---------------------------------------------------------------- рисунки
const ART = {
  // ---------- воин
  atk_warrior: g => { bg(g, '#8a6a4a', '#4a3020', '#1a0e08'); haft(g, 30, 104, 78, 40, 8); axeHead(g, 74, 42, 1.25, -0.7); },
  charge: g => {
    bg(g, '#c87a3a', '#6a2a14', '#1a0806');
    lighter(g, () => { for (let i = 0; i < 7; i++) { const y = 28 + i * 11, L = 40 + (i % 3) * 14; const gr = g.createLinearGradient(12, y, 12 + L, y); gr.addColorStop(0, 'rgba(255,220,150,0)'); gr.addColorStop(1, 'rgba(255,220,150,.75)'); g.strokeStyle = gr; g.lineWidth = 3; g.beginPath(); g.moveTo(12, y); g.lineTo(12 + L, y); g.stroke(); } glow(g, 98, 60, 34, '255,230,170', 0.9); });
    g.strokeStyle = 'rgba(255,240,200,.9)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { const an = i / 9 * TAU; g.beginPath(); g.moveTo(98 + Math.cos(an) * 14, 60 + Math.sin(an) * 14); g.lineTo(98 + Math.cos(an) * 24, 60 + Math.sin(an) * 24); g.stroke(); }
    haft(g, 22, 86, 72, 60, 8); axeHead(g, 70, 60, 1.15, -0.45);
  },
  whirl: g => {
    bg(g, '#7a8a9a', '#2a3440', '#0a0e12');
    lighter(g, () => { for (let k = 0; k < 3; k++) { g.lineCap = 'round'; for (const [w, a] of [[16, 0.12], [8, 0.3], [3, 0.9]]) { g.strokeStyle = `rgba(230,240,255,${a})`; g.lineWidth = w; g.beginPath(); g.arc(64, 64, 36, k * TAU / 3, k * TAU / 3 + 1.8); g.stroke(); } } glow(g, 64, 64, 22, '200,220,255', 0.6); });
    for (let k = 0; k < 3; k++) { const an = k * TAU / 3 + 1.8, x = 64 + Math.cos(an) * 34, y = 64 + Math.sin(an) * 34; axeHead(g, x, y, 0.62, an + Math.PI / 2); }
    g.fillStyle = '#c9a24a'; g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.arc(64, 64, 6, 0, TAU); g.fill(); g.stroke();
  },
  crush: g => {
    bg(g, '#8a5a3a', '#3a1c10', '#120604');
    // земля с трещинами
    g.fillStyle = '#4a3424'; g.beginPath(); g.moveTo(0, 92); g.quadraticCurveTo(64, 84, 128, 92); g.lineTo(128, 128); g.lineTo(0, 128); g.closePath(); g.fill();
    lighter(g, () => glow(g, 70, 92, 40, '255,120,60', 0.8));
    g.strokeStyle = O; g.lineWidth = 3; const r = rng(5); for (let i = 0; i < 6; i++) { let x = 70, y = 92, an = Math.PI + i / 5 * Math.PI * -1 + (r() - 0.5) * 0.3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { an += (r() - 0.5) * 0.6; x += Math.cos(an) * 9; y += Math.abs(Math.sin(an)) * 5 + 1; g.lineTo(x, y); } g.stroke(); }
    lighter(g, () => { g.strokeStyle = 'rgba(255,200,120,.8)'; g.lineWidth = 6; g.beginPath(); g.arc(70, 56, 40, -2.4, -0.9); g.stroke(); });
    haft(g, 34, 30, 64, 80, 8); axeHead(g, 64, 82, 1.0, 1.15);
    drop(g, 98, 70, 5); drop(g, 106, 52, 3.5); drop(g, 40, 70, 3.2);
  },
  thirst: g => {
    bg(g, '#9a2a2a', '#4a0a10', '#14020a');
    lighter(g, () => { for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(255,${80 + k * 30},${70 + k * 20},${0.5 - k * 0.1})`; g.lineWidth = 6 - k * 1.5; g.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, an = t * TAU * 1.5 + k * 2, rr = 46 - t * 30; const x = 64 + Math.cos(an) * rr, y = 70 + Math.sin(an) * rr * 0.6 - t * 10; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } glow(g, 64, 62, 36, '255,60,50', 0.8); });
    drop(g, 64, 58, 15);
    lighter(g, () => { g.strokeStyle = 'rgba(160,255,150,.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(94, 86); g.lineTo(94, 104); g.moveTo(85, 95); g.lineTo(103, 95); g.stroke(); });
  },
  berserk: g => {
    bg(g, '#e04a1a', '#7a1008', '#1a0402');
    lighter(g, () => { for (let i = 0; i < 9; i++) flameShape(g, 14 + i * 12.5, 128, 70 + (i % 3) * 18, 10, FIRE, (i - 4) * 1.5); glow(g, 64, 70, 46, '255,80,30', 0.6); });
    // рогатый шлем с горящими глазами
    const hg = g.createLinearGradient(40, 40, 90, 100); hg.addColorStop(0, '#c8ccd2'); hg.addColorStop(1, '#4a4e56');
    for (const sd of [-1, 1]) { g.fillStyle = '#e8dcc0'; g.strokeStyle = O; g.lineWidth = 2.4; g.beginPath(); g.moveTo(64 + sd * 22, 56); g.quadraticCurveTo(64 + sd * 50, 52, 64 + sd * 46, 20); g.quadraticCurveTo(64 + sd * 40, 44, 64 + sd * 16, 46); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = hg; g.strokeStyle = O; g.lineWidth = 2.6; g.beginPath(); g.moveTo(38, 92); g.lineTo(38, 62); g.quadraticCurveTo(38, 34, 64, 32); g.quadraticCurveTo(90, 34, 90, 62); g.lineTo(90, 92); g.quadraticCurveTo(76, 100, 64, 100); g.quadraticCurveTo(52, 100, 38, 92); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#1a0a06'; g.beginPath(); g.moveTo(44, 64); g.lineTo(84, 64); g.lineTo(80, 74); g.lineTo(68, 74); g.lineTo(64, 96); g.lineTo(60, 74); g.lineTo(48, 74); g.closePath(); g.fill();
    lighter(g, () => { glow(g, 54, 68, 12, '255,60,20', 1); glow(g, 74, 68, 12, '255,60,20', 1); glow(g, 54, 68, 4, '255,240,200', 1); glow(g, 74, 68, 4, '255,240,200', 1); });
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(44, 58); g.quadraticCurveTo(46, 42, 60, 38); g.stroke();
  },
  // ---------- маг
  atk_mage: g => {
    bg(g, '#5a6aa8', '#1e2448', '#080a18');
    haft(g, 30, 110, 74, 44, 6);
    lighter(g, () => { glow(g, 82, 34, 34, '140,190,255', 0.9); glow(g, 82, 34, 10, '240,250,255', 1); });
    g.fillStyle = '#9ad0ff'; g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.moveTo(82, 18); g.lineTo(92, 34); g.lineTo(82, 50); g.lineTo(72, 34); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.moveTo(82, 22); g.lineTo(78, 34); g.lineTo(82, 34); g.closePath(); g.fill();
  },
  fireball: g => {
    bg(g, '#c8501a', '#5a1408', '#140402');
    lighter(g, () => {
      for (let i = 0; i < 6; i++) { g.save(); g.translate(80, 52); g.rotate(2.35 + (i - 2.5) * 0.18); flameShape(g, 0, 0, 70 - i * 4, 12, FIRE); g.restore(); }
      glow(g, 74, 56, 46, '255,120,30', 0.85); glow(g, 74, 56, 28, '255,200,90', 1); glow(g, 74, 56, 12, '255,255,230', 1);
    });
    const r = rng(9); lighter(g, () => { for (let i = 0; i < 14; i++) glow(g, 20 + r() * 50, 60 + r() * 50, 2.5, '255,200,120', 0.9); });
  },
  frost: g => {
    bg(g, '#5a9ad0', '#183858', '#060e18');
    lighter(g, () => { glow(g, 70, 58, 50, '120,190,255', 0.7); for (let i = 1; i < 7; i++) glow(g, 70 - i * 9, 58 + i * 9, 16 - i * 2, '160,210,255', 0.5); });
    g.save(); g.translate(70, 58); g.rotate(-0.78);
    g.fillStyle = '#f2fbff'; g.beginPath(); g.moveTo(44, 0); g.lineTo(-4, -13); g.lineTo(-34, 0); g.closePath(); g.fill();
    g.fillStyle = '#7ab8e6'; g.beginPath(); g.moveTo(44, 0); g.lineTo(-34, 0); g.lineTo(-4, 13); g.closePath(); g.fill();
    g.fillStyle = '#b8e0fa'; g.beginPath(); g.moveTo(44, 0); g.lineTo(10, -5); g.lineTo(-4, 0); g.lineTo(10, 5); g.closePath(); g.fill();
    g.strokeStyle = '#163a5a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(44, 0); g.lineTo(-4, -13); g.lineTo(-34, 0); g.lineTo(-4, 13); g.closePath(); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(36, -1.5); g.lineTo(-2, -10); g.stroke(); g.restore();
    snowflake(g, 30, 32, 7); snowflake(g, 98, 96, 6); snowflake(g, 24, 92, 5, 0.7);
  },
  pillar: g => {
    bg(g, '#b8481a', '#4a1006', '#120402');
    g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(64, 104, 50, 16, 0, 0, TAU); g.fill();
    lighter(g, () => {
      g.strokeStyle = 'rgba(255,190,90,.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(64, 104, 44, 13, 0, 0, TAU); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.ellipse(64, 104, 34, 10, 0, 0, TAU); g.stroke();
      for (let i = 0; i < 7; i++) flameShape(g, 34 + i * 10, 106, 82 + Math.sin(i * 1.7) * 16, 9, FIRE, Math.sin(i * 2.3) * 3);
      flameShape(g, 64, 108, 98, 16, ['rgba(255,255,230,1)', 'rgba(255,200,90,.95)', 'rgba(255,100,30,.7)']);
      glow(g, 64, 70, 46, '255,140,40', 0.6);
    });
  },
  ignite: g => {
    bg(g, '#7a3a1a', '#2a0e06', '#0a0402');
    lighter(g, () => { flameShape(g, 64, 100, 70, 22, FIRE); flameShape(g, 52, 100, 44, 12, FIRE, -3); flameShape(g, 78, 100, 50, 12, FIRE, 3); glow(g, 64, 74, 40, '255,130,40', 0.6); });
    // искра-звезда крита
    lighter(g, () => { g.fillStyle = 'rgba(255,255,220,1)'; g.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 5 : 20, an = k * Math.PI / 4 - Math.PI / 2; g.lineTo(88 + Math.cos(an) * r, 32 + Math.sin(an) * r); } g.closePath(); g.fill(); glow(g, 88, 32, 18, '255,240,180', 1); });
    g.fillStyle = '#3a2214'; g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.ellipse(64, 104, 30, 8, 0, 0, TAU); g.fill(); g.stroke();
  },
  nova: g => {
    bg(g, '#8ac8f0', '#1e4a72', '#06101a');
    lighter(g, () => { glow(g, 64, 64, 60, '140,210,255', 0.7); g.strokeStyle = 'rgba(240,252,255,.9)'; g.lineWidth = 5; g.beginPath(); g.arc(64, 64, 40, 0, TAU); g.stroke(); g.lineWidth = 12; g.strokeStyle = 'rgba(150,210,255,.25)'; g.stroke(); });
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, x = 64 + Math.cos(an) * 40, y = 64 + Math.sin(an) * 40; spike(g, x, y, 18 + (i % 2) * 8, 6, an + Math.PI / 2); }
    snowflake(g, 64, 64, 12); lighter(g, () => glow(g, 64, 64, 10, '255,255,255', 1));
  },
  // ---------- лучник
  atk_archer: g => {
    bg(g, '#6a8a4a', '#24341a', '#0a1008');
    g.strokeStyle = O; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.arc(40, 64, 46, -1.05, 1.05); g.stroke();
    const gr = g.createLinearGradient(60, 20, 90, 100); gr.addColorStop(0, '#b07a48'); gr.addColorStop(1, '#5a3a20'); g.strokeStyle = gr; g.lineWidth = 5.5; g.stroke();
    g.strokeStyle = '#e8e0cc'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(40 + Math.cos(-1.05) * 46, 64 + Math.sin(-1.05) * 46); g.lineTo(52, 64); g.lineTo(40 + Math.cos(1.05) * 46, 64 + Math.sin(1.05) * 46); g.stroke();
    arrowShape(g, 46, 64, 110, 64);
  },
  bleed: g => {
    bg(g, '#8a2a24', '#3a0a0c', '#10020a');
    lighter(g, () => { for (let i = 0; i < 18; i++) { const t = i / 18; glow(g, 22 + t * 66, 104 - t * 66 + Math.sin(t * 12) * 4, 7 - t * 3, '255,40,40', 0.5); } });
    arrowShape(g, 18, 110, 98, 30, '#d83a3a', '#ff7a6a', 4);
    drop(g, 98, 86, 8); drop(g, 82, 104, 4.5);
  },
  net: g => {
    bg(g, '#6a7a4a', '#24301a', '#0a0e06');
    const n = 5, P = (i, j) => { const u = i / n - 0.5, v = j / n - 0.5, k = 1 - (u * u + v * v) * 0.6; return [64 + u * 84 * k + v * 10, 62 + v * 76 * k + (u * u) * 30]; };
    g.lineCap = 'round';
    for (const [w, c] of [[4.5, O], [2.4, '#e8dcc0']]) { g.strokeStyle = c; g.lineWidth = w; for (let i = 0; i <= n; i++) { g.beginPath(); for (let j = 0; j <= n; j++) { const [x, y] = P(i, j); j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.beginPath(); for (let j = 0; j <= n; j++) { const [x, y] = P(j, i); j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }
    g.fillStyle = '#c9a06a'; for (let i = 1; i < n; i++) for (let j = 1; j < n; j++) { const [x, y] = P(i, j); g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); }
    for (const [i, j] of [[0, 0], [n, 0], [0, n], [n, n]]) { const [x, y] = P(i, j); const gr = g.createRadialGradient(x - 2, y - 2, 1, x, y, 8); gr.addColorStop(0, '#c8c0b8'); gr.addColorStop(1, '#4a4038'); g.fillStyle = gr; g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); g.stroke(); }
  },
  volley: g => {
    bg(g, '#8aa0b8', '#2a3a4a', '#0a1018');
    g.fillStyle = '#3a4a2a'; g.beginPath(); g.ellipse(64, 112, 60, 14, 0, 0, TAU); g.fill();
    const r = rng(11); for (let i = 0; i < 9; i++) { const x = 18 + i * 11 + r() * 4, y = 18 + (i % 3) * 22 + r() * 6; arrowShape(g, x - 14, y - 34, x + 6, y + 18, '#e8e0cc', '#d8e0e6', 2.4); }
    lighter(g, () => { for (let i = 0; i < 5; i++) glow(g, 30 + i * 18, 110, 8, '255,240,200', 0.5); });
  },
  execute: g => {
    bg(g, '#5a1a1a', '#200608', '#08020a');
    lighter(g, () => { glow(g, 64, 64, 30, '255,40,40', 0.9); glow(g, 64, 64, 8, '255,230,220', 1); });
    g.strokeStyle = O; g.lineWidth = 9; g.lineCap = 'round';
    const br = () => { for (let k = 0; k < 4; k++) { g.save(); g.translate(64, 64); g.rotate(k * Math.PI / 2); g.beginPath(); g.moveTo(38, -16); g.lineTo(38, -38); g.lineTo(16, -38); g.stroke(); g.restore(); } };
    br(); g.strokeStyle = '#ff4a3a'; g.lineWidth = 4.5; br();
    g.strokeStyle = '#ffd0c8'; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 34); g.lineTo(64, 50); g.moveTo(64, 78); g.lineTo(64, 94); g.moveTo(34, 64); g.lineTo(50, 64); g.moveTo(78, 64); g.lineTo(94, 64); g.stroke();
  },
  trap: g => {
    bg(g, '#7a6a4a', '#2a2014', '#0a0806');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(64, 100, 50, 14, 0, 0, TAU); g.fill();
    const steel = g.createLinearGradient(0, 30, 0, 100); steel.addColorStop(0, '#e8eaee'); steel.addColorStop(1, '#5a5e66');
    for (const sd of [-1, 1]) {
      g.strokeStyle = O; g.lineWidth = 10; g.beginPath(); g.arc(64, 96, 40, Math.PI, 0, sd > 0); g.stroke();
      g.strokeStyle = steel; g.lineWidth = 6; g.stroke();
      for (let i = 1; i < 9; i++) { const an = Math.PI + i / 9 * Math.PI * (sd > 0 ? -1 : 1) * -1; const x = 64 + Math.cos(an) * 40, y = 96 + Math.sin(an) * 40 * (sd > 0 ? 1 : -0.25); if (sd < 0) continue; g.fillStyle = '#f0f2f4'; g.strokeStyle = O; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + (64 - x) * 0.25, y + (96 - y) * 0.3); g.lineTo(x + 4, y); g.closePath(); g.fill(); g.stroke(); }
    }
    g.fillStyle = '#4a4e56'; g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.ellipse(64, 98, 16, 6, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = '#d8b860'; g.beginPath(); g.ellipse(64, 97, 7, 2.6, 0, 0, TAU); g.fill();
    g.strokeStyle = '#8a8a92'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(104 + i * 6, 104 - i * 6, 4, 2.6, -0.6, 0, TAU); g.stroke(); }
    lighter(g, () => glow(g, 64, 60, 14, '255,240,200', 0.4));
  },
};
const RIMS = { atk_warrior: 'war', charge: 'war', whirl: 'war', crush: 'war', thirst: 'blood', berserk: 'blood', atk_mage: 'ice', fireball: 'fire', frost: 'ice', pillar: 'fire', ignite: 'fire', nova: 'ice', atk_archer: 'hunt', bleed: 'blood', net: 'hunt', volley: 'hunt', execute: 'blood', trap: 'hunt' };

/** Холст иконки 128×128. passive — круглая (как в WoW у пассивных умений нет круглых, но так их легко отличить). */
export function iconCanvas(id, passive = false) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  if (passive) { g.save(); g.beginPath(); g.arc(64, 64, 62, 0, TAU); g.clip(); }
  (ART[id] || ART.atk_warrior)(g); vignette(g); gloss(g);
  if (passive) { g.restore(); g.strokeStyle = '#0c0805'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 60, 0, TAU); g.stroke(); const rim = RIM[RIMS[id] || 'gold']; const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, rim[0]); gr.addColorStop(0.5, rim[1]); gr.addColorStop(1, rim[2]); g.strokeStyle = gr; g.lineWidth = 3.5; g.beginPath(); g.arc(64, 64, 56, 0, TAU); g.stroke(); }
  else frame(g, RIM[RIMS[id] || 'gold']);
  return c;
}
/** Картинка иконки (data URL) — один раз на умение. */
export function iconUrl(id, passive = false) { const k = id + (passive ? '|p' : ''); return CACHE[k] || (CACHE[k] = iconCanvas(id, passive).toDataURL()); }
export const ICON_IDS = Object.keys(ART);
