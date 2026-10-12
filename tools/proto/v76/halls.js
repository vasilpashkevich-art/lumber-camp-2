// Схемы залов боссов (вид сверху, условно): где стоит босс, вода, укрытия, что куда бежать.
const TAU = Math.PI * 2;
function base(g, w, h, title) { g.fillStyle = '#2b3328'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a5a44'; g.beginPath(); g.roundRect(30, 30, w - 60, h - 60, 18); g.fill(); g.strokeStyle = '#1c231a'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#d8d2bc'; g.font = 'bold 13px sans-serif'; g.fillText(title, 40, 24); }
const water = (g, x, y, rx, ry) => { g.fillStyle = '#3a6a7a'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.strokeStyle = '#8ac0cc'; g.lineWidth = 1.5; g.stroke(); };
const pillar = (g, x, y, r = 10, col = '#9a9484') => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#1c231a'; g.lineWidth = 2; g.stroke(); };
const mark = (g, x, y, col, txt) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill(); g.strokeStyle = '#1c231a'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#fff'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.fillText(txt, x, y + 4); g.textAlign = 'left'; };
const hero = (g, x, y) => mark(g, x, y, '#d88a3a', 'Г');
const boss = (g, x, y, r = 14) => { g.fillStyle = '#8a2a2a'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#1c231a'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#fff'; g.font = 'bold 12px sans-serif'; g.textAlign = 'center'; g.fillText('Б', x, y + 4); g.textAlign = 'left'; };
const area = (g, x, y, rx, ry, col = 'rgba(255,214,150,.35)', dash = true) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.strokeStyle = col.replace(/[\d.]+\)$/, '.9)'); g.lineWidth = 1.5; if (dash) g.setLineDash([4, 4]); g.stroke(); g.setLineDash([]); };
const arrow = (g, x1, y1, x2, y2, col = '#ece6d2') => { const a = Math.atan2(y2 - y1, x2 - x1); g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.fillStyle = col; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - Math.cos(a - 0.5) * 9, y2 - Math.sin(a - 0.5) * 9); g.lineTo(x2 - Math.cos(a + 0.5) * 9, y2 - Math.sin(a + 0.5) * 9); g.closePath(); g.fill(); };
const note = (g, x, y, s) => { g.fillStyle = '#ece6d2'; g.font = '12px sans-serif'; g.fillText(s, x, y); };
const door = (g, x, y, w = 36, h = 10) => { g.fillStyle = '#2b3328'; g.fillRect(x - w / 2, y - h / 2, w, h); };

export const HALLS = {
  bulk(g, w, h) { base(g, w, h, 'Зал стражи: каменный двор, по бокам стойки с оружием'); door(g, w / 2, 30); door(g, w / 2, h - 30);
    for (const x of [60, w - 60]) for (const y of [90, h / 2, h - 90]) pillar(g, x, y, 6, '#6a5a3a');
    // фаза 1: конус перед боссом
    g.fillStyle = 'rgba(255,214,150,.35)'; g.beginPath(); g.moveTo(w / 2, 120); g.arc(w / 2, 120, 90, 0.5, 2.64); g.closePath(); g.fill(); boss(g, w / 2, 120); note(g, w / 2 + 40, 80, '1: удар конусом');
    // фаза 2: щит спереди, бить сзади
    area(g, w / 2 - 110, h / 2 + 40, 70, 70, 'rgba(120,200,255,.25)'); boss(g, w / 2 - 110, h / 2 + 40); hero(g, w / 2 - 110, h / 2 + 100); arrow(g, w / 2 - 110, h / 2 + 88, w / 2 - 110, h / 2 + 60);
    g.fillStyle = 'rgba(80,80,80,.6)'; g.beginPath(); g.arc(w / 2 - 110, h / 2 + 40, 22, -2.6, -0.5); g.lineWidth = 6; g.strokeStyle = '#6a5a3a'; g.stroke(); note(g, w / 2 - 190, h / 2 + 140, '2: щит, бить со спины');
    // фаза 3: прыжок
    area(g, w / 2 + 130, h / 2 + 50, 45, 45); hero(g, w / 2 + 130, h / 2 + 50); arrow(g, w / 2 + 130, h / 2 + 50 - 70, w / 2 + 130, h / 2 + 20); note(g, w / 2 + 70, h / 2 + 115, '3: прыжок на героя');
  },
  priestess(g, w, h) { base(g, w, h, 'Зал купели: вода посередине, 3 тотема на столбах, 4 листа кувшинки'); door(g, w / 2, h - 30);
    water(g, w / 2, h / 2 - 10, 90, 55); boss(g, w / 2, h / 2 - 10);
    for (const [x, y] of [[80, 80], [w - 80, 80], [w / 2, h - 70]]) { pillar(g, x, y, 12); mark(g, x, y, '#8a4ac8', 'Т'); }
    for (const [x, y] of [[70, h / 2 + 40], [w - 70, h / 2 + 40], [w / 2 - 150, h - 60], [w / 2 + 150, h - 60]]) { g.fillStyle = '#5a9a4a'; g.beginPath(); g.ellipse(x, y, 20, 14, 0, 0, TAU); g.fill(); g.strokeStyle = '#1c231a'; g.lineWidth = 2; g.stroke(); }
    hero(g, w / 2 + 40, h / 2 + 60); arrow(g, w / 2 + 50, h / 2 + 50, w - 95, 95); arrow(g, w / 2 + 30, h / 2 + 50, 95, 95);
   
  },
  aspid(g, w, h) { base(g, w, h, 'Зал змеиных ям: колонны, песок, в углах ямы с ядом'); door(g, w / 2, 30);
    for (const [x, y] of [[55, 55], [w - 55, 55], [55, h - 55], [w - 55, h - 55]]) area(g, x, y, 26, 18, 'rgba(120,200,80,.45)', false);
    for (const [x, y] of [[w / 2 - 100, h / 2], [w / 2 + 100, h / 2]]) pillar(g, x, y, 11);
    // кольцо вокруг героя
    hero(g, w / 2, h / 2 + 10); g.strokeStyle = '#2e2e36'; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2 + 10, 55, -0.3, TAU - 1.2); g.stroke(); g.strokeStyle = '#c8402a'; g.lineWidth = 2; g.setLineDash([6, 6]); g.stroke(); g.setLineDash([]);
    arrow(g, w / 2 + 12, h / 2 + 10, w / 2 + 48, h / 2 - 20); note(g, w / 2 + 60, h / 2 - 30, 'просвет: выйти за 2,5 с');
    boss(g, w / 2 - 60, h / 2 - 60, 16);
   
  },
  king(g, w, h) { base(g, w, h, 'Тронный зал: трон, вода по краям, 4 колонны К, 2 стражника С'); door(g, w / 2, h - 30);
    for (const x of [50, w - 50]) { g.fillStyle = '#3a6a7a'; g.beginPath(); g.roundRect(x - 18, 60, 36, h - 120, 10); g.fill(); g.strokeStyle = '#8ac0cc'; g.lineWidth = 1.5; g.stroke(); }
    g.fillStyle = '#6a6458'; g.beginPath(); g.roundRect(w / 2 - 70, 45, 140, 60, 8); g.fill(); g.strokeStyle = '#1c231a'; g.lineWidth = 2; g.stroke(); boss(g, w / 2, 75, 16); note(g, w / 2 + 24, 62, 'трон');
    for (const [x, y] of [[w / 2 - 120, h / 2 - 20], [w / 2 + 120, h / 2 - 20], [w / 2 - 120, h / 2 + 80], [w / 2 + 120, h / 2 + 80]]) mark(g, x, y, '#9a9484', 'К');
    for (const x of [w / 2 - 50, w / 2 + 50]) mark(g, x, 125, '#4a7a3a', 'С');
    hero(g, w / 2, h / 2 + 40); area(g, w / 2, h / 2 + 40, 60, 40); arrow(g, w / 2 - 12, h / 2 + 40, w / 2 - 108, h / 2 - 8);
    g.strokeStyle = '#d88a9a'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 90); g.quadraticCurveTo(w / 2 + 40, h / 2, w / 2 + 10, h / 2 + 32); g.stroke(); note(g, w / 2 + 30, h / 2 - 50, 'язык: тянет к воде');
   
  },
};
