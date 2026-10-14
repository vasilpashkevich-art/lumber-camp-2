// v92: живые эффекты героических (фиолетовых) вещей — без свечения: искры огня, иней, звёзды, руны, листья, блёстки.
// Рисуются поверх фигуры каждый кадр, без состояния: положение частицы — от времени и её номера.
// H — рост фигуры в единицах холста; (x, y) — точка у ступней. src: 'weapon' — у руки с оружием (справа), иначе — вокруг тела.
const TAU = Math.PI * 2;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const N = { fire: 9, frost: 7, arcane: 7, rune: 4, leaf: 4, spark: 6 };
export function gearFx(g, list, x, y, t, H = 62, dir = 1) {
  if (!list || !list.length) return;
  g.save(); g.translate(x, y);
  for (const [kind, src] of list) {
    const n = N[kind] || 5, wpn = src === 'weapon';
    for (let i = 0; i < n; i++) {
      const sd = i * 7.3 + (wpn ? 50 : 0) + kind.length * 3, sp = kind === 'fire' ? 0.9 : kind === 'rune' ? 0.35 : kind === 'leaf' ? 0.28 : 0.5;
      const q = (t * sp + hash(sd)) % 1, a = Math.sin(q * Math.PI);   // q — возраст 0..1, a — видимость
      // откуда: у оружия — правая сторона на высоте рук и выше; у тела — по силуэту
      let px = wpn ? dir * H * (0.22 + hash(sd + 1) * 0.22) : (hash(sd + 1) - 0.5) * H * 0.5, py = wpn ? -H * (0.45 + hash(sd + 2) * 0.45) : -H * (0.1 + hash(sd + 2) * 0.8);
      if (kind === 'fire') { py -= q * H * 0.35; px += Math.sin(q * 6 + sd) * H * 0.03; const r = H * 0.022 * (1 - q * 0.6); g.fillStyle = `rgba(255,${Math.round(200 - q * 120)},${Math.round(80 - q * 60)},${a})`; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); g.fillStyle = `rgba(255,240,180,${a * 0.8})`; g.beginPath(); g.arc(px, py, r * 0.45, 0, TAU); g.fill(); }
      else if (kind === 'frost') { py += q * H * 0.25; px += Math.sin(q * 5 + sd) * H * 0.04; const r = H * 0.03; g.strokeStyle = `rgba(220,245,255,${a})`; g.lineWidth = Math.max(0.8, H * 0.008); g.beginPath(); for (let k = 0; k < 3; k++) { const an = k * Math.PI / 3 + q * 2; g.moveTo(px - Math.cos(an) * r, py - Math.sin(an) * r); g.lineTo(px + Math.cos(an) * r, py + Math.sin(an) * r); } g.stroke(); }
      else if (kind === 'arcane' || kind === 'spark') { const r = H * (kind === 'spark' ? 0.045 : 0.035) * a, col = kind === 'spark' ? '255,236,160' : '220,190,255'; g.fillStyle = `rgba(${col},${a})`; g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * 0.22 : r, an = k * Math.PI / 4 + q; g.lineTo(px + Math.cos(an) * rr, py + Math.sin(an) * rr); } g.closePath(); g.fill(); }
      else if (kind === 'rune') { py -= q * H * 0.18; const r = H * 0.03; g.strokeStyle = `rgba(140,220,255,${a * 0.9})`; g.lineWidth = Math.max(0.8, H * 0.01); g.beginPath(); const v = Math.floor(hash(sd + 3) * 3); if (v === 0) { g.moveTo(px, py - r); g.lineTo(px, py + r); g.moveTo(px, py - r * 0.3); g.lineTo(px + r * 0.7, py - r); } else if (v === 1) { g.moveTo(px - r * 0.6, py + r); g.lineTo(px, py - r); g.lineTo(px + r * 0.6, py + r); g.moveTo(px - r * 0.3, py + r * 0.2); g.lineTo(px + r * 0.3, py + r * 0.2); } else { g.moveTo(px - r * 0.6, py - r); g.lineTo(px + r * 0.6, py); g.lineTo(px - r * 0.6, py + r); } g.stroke(); }
      else if (kind === 'leaf') { py += q * H * 0.3; px += Math.sin(q * 4 + sd) * H * 0.08; const r = H * 0.035; g.save(); g.translate(px, py); g.rotate(Math.sin(q * 6 + sd) * 1.2); g.fillStyle = `rgba(${hash(sd) < 0.5 ? '90,170,90' : '200,170,70'},${a})`; g.beginPath(); g.ellipse(0, 0, r, r * 0.45, 0, 0, TAU); g.fill(); g.restore(); }
    }
  }
  g.restore();
}
