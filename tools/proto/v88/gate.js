// Проба: городские ворота в «пластилиновом» камне — стена с боевым ходом, две башни кольцами блоков, арка клиньями, решётка.
import { block, wallBlocks, clayTower, clayArch, clayCone, SAND, mix } from '../../../src/art/clay.js';
import { person } from '../../../src/art/body.js';
export function drawGate(cv) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  const bg = g.createLinearGradient(0, 0, 0, cv.height); bg.addColorStop(0, '#8fb45a'); bg.addColorStop(1, '#6f9a44'); g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
  g.save(); g.translate(cv.width / 2, cv.height - 110); g.scale(1.2, 1.2);
  const P = SAND, W = 560, H = 150, th = 40, gw = 110, R = 50, TX = gw / 2 + R + 30;
  g.fillStyle = 'rgba(20,12,6,.28)'; g.beginPath(); g.ellipse(14, 10, W * 0.62, 22, 0, 0, 7); g.fill();
  // лицо стены
  wallBlocks(g, -W / 2, -H, W, H, P, 3, 32);
  // боевой ход сверху: длинные плоские блоки (вид сверху, чуть светлее) и зубцы
  for (let x = -W / 2, i = 0; x < W / 2; i++) { const bw = 48 + (i % 3) * 12, x1 = Math.min(W / 2, x + bw); block(g, [[x + 1.5, -H - th + 1.5], [x1 - 1.5, -H - th + 1.5], [x1 - 1.5, -H - 1.5], [x + 1.5, -H - 1.5]], P, 5, 200 + i, -0.05); x += bw; }
  for (let x = -W / 2 + 10; x < W / 2 - 22; x += 46) block(g, [[x, -H - th - 24], [x + 26, -H - th - 24], [x + 26, -H - th + 2], [x, -H - th + 2]], P, 4, 300 + x, 0);
  // проём: тьма, решётка
  const ah = H * 0.8;
  const door = () => { g.beginPath(); g.moveTo(-gw / 2, 0); g.lineTo(-gw / 2, -ah + gw / 2); g.arc(0, -ah + gw / 2, gw / 2, Math.PI, 0); g.lineTo(gw / 2, 0); g.closePath(); };
  door(); g.fillStyle = '#1a140f'; g.fill(); g.save(); door(); g.clip(); const dg = g.createLinearGradient(0, -ah, 0, 0); dg.addColorStop(0, '#15100c'); dg.addColorStop(1, '#6a5a44'); g.fillStyle = dg; g.fillRect(-gw / 2, -ah, gw, ah);
  g.strokeStyle = '#4a4a50'; g.lineWidth = 4; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(-gw / 2 + k * gw / 6, -ah); g.lineTo(-gw / 2 + k * gw / 6, -ah + 46); g.stroke(); } g.beginPath(); g.moveTo(-gw / 2, -ah + 34); g.lineTo(gw / 2, -ah + 34); g.stroke(); g.restore();
  // откосы проёма — стоячие блоки, затем арка клиньями
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const x = sd * (gw / 2 + 13), y = -i * 33; block(g, [[x - 13, y - 31], [x + 13, y - 31], [x + 13, y - 2], [x - 13, y - 2]], P, 4.5, 400 + i * 2 + sd, sd > 0 ? 0.2 : 0); }
  clayArch(g, 0, -ah + gw / 2, gw / 2 + 2, 30, P, 500, 9);
  // тень башен на стене
  for (const sd of [-1, 1]) { g.fillStyle = 'rgba(40,25,10,.22)'; g.beginPath(); g.ellipse(sd * TX + 14, -H / 2, R + 14, H * 0.75, 0, 0, 7); g.fill(); }
  // башни перед стеной
  for (const sd of [-1, 1]) { const top = clayTower(g, sd * TX, 10, R, H + 60, P, 600 + sd); clayCone(g, sd * TX, top, R + 14, R * 2.3); }
  // стража и герой для масштаба
  for (const dx of [-92, 92]) { g.save(); g.translate(dx, 42); g.scale(1.45, 1.45); person(g, { cls: 'warrior', hair: '#3a2a1a', broad: 1.05 }, 'front', {}); g.restore(); }
  g.save(); g.translate(0, 70); g.scale(1.45, 1.45); person(g, { cls: 'warrior', hair: '#b8642a', beard: 'full', broad: 1.08 }, 'front', {}); g.restore();
  g.restore();
}
