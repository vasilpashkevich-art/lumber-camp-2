// СОБРАНО tools/make-rig.mjs — правки делать в tools/parts/rig.tpl.js и src/art/hero.js
// Анимированные люди (герой, разбойники) в трёх видах: сбоку (влево/вправо), спереди (идёт вниз), сзади (идёт вверх).
// Сборка: tools/make-rig.mjs вставляет сюда части облика из src/art/hero.js (торс, голова сбоку), чтобы облик был один.
// Начало координат — как у doll(): точка между ступнями чуть выше земли (ноги до +12.6).
// pose = { walk: фаза шага 0..1 или -1 (стоит), atk: -1 или 0..1 (удар), hit: 0..1 (вздрогнул), dead: 0..1 (падает), t: время }
import { LINE } from './hero.js';
const HO = '#24180f', SKIN = '#f2c9a0';
const RAR = { common: null, good: '#5fd35f', rare: '#4a9eff', epic: '#b46aff' };
const TAU = Math.PI * 2;
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const HAIR = { warrior: '#c8742a', mage: '#ece6df', archer: '#6a3e1e' };

export function person(c, L, view, pose = {}) {
  const cl = L.cls, ln = L.line || LINE[cl], tc = L.chest | 0, tl = L.legs | 0, th = L.head | 0, wt = L.wt | 0, rc = RAR[L.rar || 'common'], t = pose.t || 0;
  const hp = (fn, fill, lw = 1.1) => { c.beginPath(); fn(); c.fillStyle = fill; c.fill(); c.strokeStyle = HO; c.lineWidth = lw; c.stroke(); };
  const limb = (x1, y1, x2, y2, w, col) => { c.lineCap = 'round'; c.strokeStyle = HO; c.lineWidth = w + 2.2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const robe = cl === 'mage' && tc >= 1;
  const bare = tl < 0, lc = bare ? SKIN : ln.legs[tl], boot = bare ? '#e8b890' : tl === 0 ? '#3a2616' : tl >= 3 && cl === 'warrior' ? '#9aa3aa' : '#2a1a0e';
  const cc = tc < 0 ? SKIN : ln.chest[Math.max(0, tc)], sl = tc < 0 ? SKIN : tc === 0 ? '#d8c8a4' : cc;
  const W = pose.walk >= 0, p = W ? pose.walk : 0, s = Math.sin(p * TAU), co = Math.cos(p * TAU);
  const A = pose.atk >= 0 ? pose.atk : -1, hit = pose.hit || 0, dead = pose.dead || 0;
  const bob = W ? -Math.abs(co) * 1.2 : Math.sin(t * 2.2) * 0.3;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  // падение: заваливается на бок у ступней
  if (dead > 0) { c.translate(0, -6 * Math.min(1, dead * 1.6)); c.translate(0, 12); c.rotate((view === 'back' ? -1 : 1) * Math.min(1, dead * 1.6) * Math.PI / 2 * (view === 'side' ? -1 : 1)); c.translate(0, -12); }
  c.translate(view === 'side' ? -hit * 2.5 : 0, bob - (view !== 'side' ? hit * 1.5 : 0));
  if (view === 'side' && hit) c.rotate(-hit * 0.18);
  if (view === 'side' && W) c.rotate(0.05);
  // сияние редкой вещи под ногами
  if (rc && (tc >= 4 || L.glow)) { const g = c.createRadialGradient(0, 9, 1, 0, 9, 20); g.addColorStop(0, rc + '99'); g.addColorStop(1, rc + '00'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 9, 20, 8, 0, 0, 7); c.fill(); }

  // ----- удар: куда ставим руку и оружие
  // a — угол руки от «вниз» (по часовой — вперёд), wa — поворот оружия в руке
  const swing = () => {
    if (A < 0) return null;
    if (cl === 'warrior' || wt < 0 || L.pick) { const k = A < 0.35 ? A / 0.35 : A < 0.55 ? 1 + (A - 0.35) / 0.2 : 2 - (A - 0.55) / 0.45; // 0 → 1 замах → 2 удар → обратно
      const a = k <= 1 ? 0.3 - k * 2.9 : -2.6 + (k - 1) * 4.1; return { a, wa: k <= 1 ? 0.4 : 0.4 + (k - 1) * 0.6, trail: A > 0.35 && A < 0.6 }; }
    if (cl === 'mage') { const k = A < 0.5 ? A / 0.5 : 1 - (A - 0.5) / 0.5; return { a: 0.3 + k * 1.3, wa: -k * 0.9, glow: k }; }
    const k = A < 0.6 ? A / 0.6 : 1 - (A - 0.6) / 0.4; return { a: 0.3 + Math.min(1, k * 1.6) * 1.25, wa: 1.27, pull: A < 0.6 ? k : 0, bow: true };
  };
  const SW = swing();

  if (view === 'side') sideView(); else frontBack(view === 'back');
  c.restore();

  // ======================================================== сбоку (смотрит вправо)
  function sideView() {
    // плащ и колчан — за спиной
      if(tc>=3){const cap=cl==='warrior'?(tc>=4?'#3a2a6a':'#8a2a1a'):cl==='archer'?(tc>=4?'#173f36':'#2f6a3a'):(tc>=4?'#140e36':'#2a1a58');
    hp(()=>{c.moveTo(-7,-6);c.lineTo(6,-6);c.lineTo(5,12);c.quadraticCurveTo(-5,14.5,-13,11.5);c.closePath()},cap);
    if(rc){c.strokeStyle=rc;c.lineWidth=0.9;c.beginPath();c.moveTo(5,11.5);c.quadraticCurveTo(-5,14,-12.5,11);c.stroke()}}
      if(cl==='archer'){c.save();c.translate(-6,-3);c.rotate(-0.35);hp(()=>c.roundRect(-3,-9,6,15,2),tc>=3?'#3a2a14':'#6b4a2c');c.fillStyle='#e8e0cc';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-2+i*2,-9);c.lineTo(-3+i*2,-13);c.lineTo(-1+i*2,-13);c.fill()}c.restore()}
    // ноги: бедро и голень, колено сгибается на шаге
    const leg = (hx, ph, col, bt) => {
      const sn = Math.sin(ph * TAU), cs = Math.cos(ph * TAU), a1 = W ? sn * 0.55 : 0, bend = W ? Math.max(0, cs) * 0.9 : 0, a2 = a1 - bend;
      const kx = hx + Math.sin(a1) * 4.8, ky = 3.5 + Math.cos(a1) * 4.8, fx = kx + Math.sin(a2) * 4.6, fy = ky + Math.cos(a2) * 4.6;
      limb(hx, 3.5, kx, ky, 3.8, col); limb(kx, ky, fx, fy, 3.4, col);
      if (tl >= 1 && !bare) limb(kx + Math.sin(a2) * 2.2, ky + Math.cos(a2) * 2.2, fx, fy, 3.9, bt);
      hp(() => c.ellipse(fx + 1.4, fy + 0.3, 3, 1.6, a2 * 0.3, 0, 7), bt, 0.8);
      if (cl === 'warrior' && tl >= 2 && !robe) hp(() => c.arc(kx + 0.4, ky, 1.5, 0, 7), tl >= 3 ? '#f4c766' : '#5a5f66', 0.6);
    };
    leg(-1, p + 0.5, shade(lc, -0.18), shade(boot, -0.15));   // дальняя
    // дальняя рука — за телом
    arm(-0.5, W ? s * 0.55 : 0.15, shade(sl, -0.2), false);
    leg(1.2, p, lc, boot);                                      // ближняя
    // тело: торс, пояс, трусы — как у облика героя
    torso();
    // наплечники
      if(cl==='warrior'&&tc>=2){const pc=tc>=3?cc:'#7c858c';for(const sx of [-7.5,7.5]){hp(()=>c.arc(sx,-4.5,4.6,Math.PI,0),pc,1);if(tc>=3){c.strokeStyle=tc>=4&&rc?rc:'#f4c766';c.lineWidth=0.8;c.beginPath();c.arc(sx,-4.5,4.6,Math.PI,0);c.stroke()}
    if(tc>=4)for(const d of [-2,2])hp(()=>{c.moveTo(sx+d-1.2,-8.4);c.lineTo(sx+d*1.4,-13);c.lineTo(sx+d+1.2,-8.4);c.closePath()},'#cfd8de',0.6)}}
  if(cl==='mage'&&tc>=3)for(const sx of [-7,7])hp(()=>{c.arc(sx,-4.5,3.4,Math.PI,0);c.closePath()},'#cfd8e6',0.8);
  if(cl==='archer'&&tc>=3)hp(()=>{c.moveTo(4,-6);c.quadraticCurveTo(9,-9,12,-4);c.quadraticCurveTo(8,-4,4,-2);c.closePath()},tc>=4?'#3aa88a':'#5fc98a',0.8);
    // голова
      const hood=(cl==='archer'&&th>=1)||(cl==='mage'&&th===1);
  const hoodC=cl==='archer'?['','#6b4a2c','#2f4f2a','#2f6a3a','#1f5a4a'][th]:'#7a5a3a';
  if(hood){hp(()=>c.arc(0,-12,8.6,0,7),hoodC);hp(()=>{c.moveTo(-5,-19);c.quadraticCurveTo(-9,-24,-12,-23);c.quadraticCurveTo(-9,-18,-8,-13);c.closePath()},hoodC)}
  // волосы сзади
  if(!hood&&th===0){const hc=cl==='warrior'?'#c8742a':cl==='mage'?'#ece6df':'#6a3e1e';hp(()=>c.arc(-1,-13,8,0,7),hc,1);if(cl==='archer')hp(()=>{c.moveTo(-6,-12);c.quadraticCurveTo(-13,-8,-11,0);c.quadraticCurveTo(-8,-6,-4,-9);c.closePath()},hc,0.9)}
  hp(()=>hood?c.ellipse(2,-11,5.3,5.6,0,0,7):c.arc(0,-12,7.5,0,7),SKIN);
  if(hood){c.fillStyle='rgba(0,0,0,.24)';c.beginPath();c.ellipse(2,-16.4,5.3,1.6,0,0,7);c.fill()}
  // чёлка
  if(!hood&&th===0){const hc=cl==='warrior'?'#c8742a':cl==='mage'?'#ece6df':'#6a3e1e';hp(()=>{c.moveTo(-7.5,-13);c.quadraticCurveTo(-2,-22,7.5,-14);c.quadraticCurveTo(3,-17,-1,-15.5);c.quadraticCurveTo(-4,-14,-7.5,-13)},hc,0.8)}
  if(cl==='warrior')hp(()=>{c.moveTo(-1,-10);c.quadraticCurveTo(3,-8,7,-10);c.quadraticCurveTo(7,-4,3.5,-2);c.quadraticCurveTo(0,-4,-1,-10)},'#c8742a',.9);
  if(cl==='mage')hp(()=>{c.moveTo(-1.5,-10);c.quadraticCurveTo(3,-8.5,7.2,-10);c.quadraticCurveTo(7,-2,3,3);c.quadraticCurveTo(0,-3,-1.5,-10)},'#ece6df',.9);
  const eyeC=cl==='mage'?'#3a6fa8':HO;for(const ex of [2.2,5.4]){c.fillStyle=eyeC;c.beginPath();c.ellipse(ex,-12.5,1.05,1.5,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ex+.35,-13,.4,0,7);c.fill()}
  if(!hood){c.fillStyle='rgba(230,110,90,.35)';c.beginPath();c.arc(6.3,-10.3,1.3,0,7);c.fill()}
  // разбойники: повязка на лице, лента на голове, повязка на глазу
  if(L.mask)hp(()=>{c.moveTo(-0.5,-10.2);c.quadraticCurveTo(3.5,-8.6,7.6,-10.2);c.quadraticCurveTo(7.4,-5,3.2,-3.6);c.quadraticCurveTo(0,-5,-0.5,-10.2)},L.mask,0.8);
  if(L.band){hp(()=>c.rect(-7.8,-17.4,15.6,2.6),L.band,0.7);hp(()=>{c.moveTo(-7,-16);c.quadraticCurveTo(-12,-15,-13,-11);c.quadraticCurveTo(-10,-13,-7,-14)},L.band,0.6)}
  if(L.patch){c.fillStyle=HO;c.beginPath();c.ellipse(5.4,-12.5,2,2.2,0,0,7);c.fill();c.strokeStyle=HO;c.lineWidth=0.7;c.beginPath();c.moveTo(-6,-16);c.lineTo(7.5,-11);c.stroke()}
  // головные уборы
  if(cl==='warrior'&&th>=1){c.save();c.translate(0,-3.2);c.scale(1.04,1.04); // шлем выше бровей — глаза видны
    if(th===1){hp(()=>{c.arc(0,-13,8,Math.PI,0);c.lineTo(8,-12);c.lineTo(-8,-12);c.closePath()},'#8a5a32');c.strokeStyle='#5a3418';c.lineWidth=0.6;c.beginPath();c.moveTo(0,-21);c.lineTo(0,-13);c.stroke()}
    else if(th===2){hp(()=>{c.arc(0,-12,8.6,Math.PI*0.95,Math.PI*2.05);c.lineTo(8,-4);c.lineTo(6.5,-4);c.lineTo(6,-10);c.lineTo(-6,-10);c.lineTo(-8,-3);c.closePath()},'#9aa3aa');hp(()=>c.rect(-8.6,-14,17.2,2.4),'#7c858c',.8)}
    else{const hc=th>=4?'#4a4f6e':'#c4ccd2',tr=th>=4&&rc?rc:'#f4c766';
      for(const sx of [-1,1]){hp(()=>{c.moveTo(sx*6,-15);c.quadraticCurveTo(sx*15,-15,sx*15,-28);c.quadraticCurveTo(sx*11,-21,sx*4,-19);c.closePath()},'#ece2c8',1)}
      hp(()=>{c.arc(0,-13,8.4,Math.PI,0);c.lineTo(8.4,-9);c.lineTo(6,-9);c.lineTo(6,-12);c.lineTo(-8.4,-12);c.closePath()},hc,1.1);hp(()=>c.rect(-8.8,-14.8,17.6,3),tr,.8);hp(()=>c.rect(3.3,-14.5,1.5,5),tr,.6);
      c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(-3,-18,2,0,7);c.fill()}c.restore()}
  if(cl==='mage'&&th>=2){c.save();c.translate(0,-1.8);const hc=L.hatCol||['','','#3a5a9a','#4a2f78','#241a50'][th];hp(()=>c.ellipse(0,-16.5,11,2.8,0,0,7),'#1e1438');hp(()=>{c.moveTo(-6.5,-17);c.quadraticCurveTo(-4,-26,-3,-30);c.quadraticCurveTo(-6,-33,-10,-31);c.quadraticCurveTo(-4,-35,0,-31);c.quadraticCurveTo(3,-24,6.5,-17);c.closePath()},hc);hp(()=>c.rect(-6.3,-19.3,12.6,2.4),th>=4&&rc?rc:'#f4c766',.8);
    if(th>=3){c.fillStyle='#f4c766';c.beginPath();c.arc(-1,-25,1.2,0,7);c.fill()}
    if(th>=4){const fy=-38+Math.sin(t*2)*1.5,g=c.createRadialGradient(0,fy,0.5,0,fy,7);g.addColorStop(0,'rgba(190,150,255,.9)');g.addColorStop(1,'rgba(150,110,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,fy,7,0,7);c.fill();hp(()=>{c.moveTo(0,fy-4.5);c.lineTo(2.6,fy);c.lineTo(0,fy+4.5);c.lineTo(-2.6,fy);c.closePath()},'#b48aff',0.8)}c.restore()}
  if(cl==='archer'&&th>=3){hp(()=>{c.moveTo(-6,-19);c.quadraticCurveTo(-12,-28,-9,-33);c.quadraticCurveTo(-8,-26,-4,-20);c.closePath()},th>=4&&rc?rc:'#d8c050',0.7)}
    if (L.strawHat) strawHat('side');
    // ближняя рука с оружием
    const sw = SW, aFront = sw ? sw.a : (W ? -s * 0.55 : 0.18);
    arm(1.5, aFront, sl, true, sw);
  }

  // рука: плечо (sx,-3.5), угол от «вниз», с оружием в ближней
  function arm(sx, a, col, front, sw) {
    const ex = sx + Math.sin(a) * 4.2, ey = -3.5 + Math.cos(a) * 4.2, a2 = a + 0.35, hx = ex + Math.sin(a2) * 3.8, hy = ey + Math.cos(a2) * 3.8;
    limb(sx, -3.5, ex, ey, 3.4, col); limb(ex, ey, hx, hy, 3, col);
    if (front && (wt >= 0 || L.pick)) weapon(hx, hy, a2, sw);
    hp(() => c.arc(hx, hy, 2.2, 0, 7), SKIN, 0.9);
    if (front && sw && sw.bow) { // натянутая тетива: задняя рука у груди
      const pull = sw.pull || 0; hp(() => c.arc(hx - 4 - pull * 6, hy + 0.5, 2, 0, 7), SKIN, 0.8);
    }
    if (front && sw && sw.trail) { c.strokeStyle = 'rgba(255,250,230,.75)'; c.lineWidth = 3; c.beginPath(); c.arc(0, -4, 20, -1.9, 0.6); c.stroke(); }
  }

  // оружие в руке (hx,hy), a2 — направление предплечья
  function weapon(hx, hy, a2, sw) {
    c.save(); c.translate(hx, hy);
    if (L.pick) { c.rotate(a2 - 0.1); pickaxe(); }
    else if (L.torch) { c.rotate(a2 - 0.1); torch(); }
    else if (cl === 'warrior') { c.rotate(a2 - 0.1); axe(); }                       // топор перпендикулярно предплечью
    else if (cl === 'mage') { c.rotate(sw ? sw.glow * 0.8 : 0.04); (L.sickle ? sickle : staff)(sw ? sw.glow : 0); }   // посох почти отвесно, при ударе — вперёд
    else { c.rotate(sw ? 0 : 0.12); bow(sw && sw.bow ? sw.pull : 0, !!(sw && sw.bow)); }      // лук отвесно, тетива к себе
    c.restore();
  }

  // топор: рукоять от кисти вверх (−y)
  function axe() {
    c.strokeStyle = HO; c.lineWidth = 3.6; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -20 - wt * 2); c.stroke(); c.strokeStyle = wt >= 3 ? '#3a2416' : '#7a5230'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -20 - wt * 2); c.stroke();
    const top = -20 - wt * 2, bc = wt >= 3 ? '#7ec8ff' : wt >= 2 ? '#d8dde2' : '#a8b0b6', w = 4 + wt * 1.6, hh = 5 + wt * 1.8;
    hp(() => { c.moveTo(0, top + 1); c.lineTo(w, top - hh / 2); c.quadraticCurveTo(w + 3, top + 2, w, top + hh); c.lineTo(0, top + 4); c.closePath(); }, bc);
    if (wt >= 2) hp(() => { c.moveTo(0, top + 1); c.lineTo(-w * 0.8, top - hh / 2.5); c.quadraticCurveTo(-w - 2, top + 2, -w * 0.8, top + hh * 0.8); c.lineTo(0, top + 4); c.closePath(); }, bc);
    if (wt >= 3) { c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(w - 1, top - 2); c.lineTo(w - 3, top + 2); c.lineTo(w - 1, top + 5); c.stroke(); }
  }
  // кирка рудокопа: рукоять от кисти вверх, изогнутый клюв с двумя остриями
  function pickaxe() {
    c.strokeStyle = HO; c.lineWidth = 3.6; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -21); c.stroke(); c.strokeStyle = '#8a5e34'; c.lineWidth = 2.2; c.stroke();
    hp(() => { c.moveTo(-11, -15); c.quadraticCurveTo(-5, -23.5, 0, -23.5); c.quadraticCurveTo(5, -23.5, 12, -15.5); c.lineTo(11, -14.5); c.quadraticCurveTo(5, -20, 0, -19.5); c.quadraticCurveTo(-5, -20, -10, -14); c.closePath(); }, '#a8b0b6', 1);
    hp(() => c.rect(-2.2, -24.5, 4.4, 6), '#6a7076', 0.8);
    c.strokeStyle = '#eef3f6'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-8, -17.5); c.quadraticCurveTo(-4, -22.3, 0, -22.4); c.stroke();
  }
  // факел поджигателя: палка с огнём
  function torch() {
    c.strokeStyle = HO; c.lineWidth = 3.4; c.beginPath(); c.moveTo(0, 5); c.lineTo(0, -15); c.stroke(); c.strokeStyle = '#7a5230'; c.lineWidth = 2; c.stroke();
    hp(() => c.rect(-2.4, -17, 4.8, 3.4), '#5a3a1c', 0.8);
    const f = Math.sin(t * 14) * 1.2, g = c.createRadialGradient(0, -21, 1, 0, -21, 11); g.addColorStop(0, 'rgba(255,200,90,.7)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -21, 11, 0, 7); c.fill();
    for (const [col, w, h] of [['#ff6a2a', 4.5, 11], ['#ffb347', 3, 8], ['#fff2a0', 1.6, 4.5]]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -17); c.quadraticCurveTo(-w, -17 - h * 0.6, f * 0.4, -17 - h - f); c.quadraticCurveTo(w, -17 - h * 0.6, w, -17); c.closePath(); c.fill(); }
  }
  // соломенная шляпа (Мельник): широкие поля, тулья, лента
  function strawHat(v) {
    const ox = v === 'side' ? 0.8 : 0;
    hp(() => c.ellipse(ox, -17.5, 13.5, 3.6, 0, 0, 7), '#d8b44a', 1.1);
    c.strokeStyle = '#b8942e'; c.lineWidth = 0.6; for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(ox + i * 2.2, -16.2); c.lineTo(ox + i * 2.5, -18.9); c.stroke(); }
    hp(() => { c.moveTo(ox - 7, -18); c.quadraticCurveTo(ox - 6.5, -26, ox, -26.5); c.quadraticCurveTo(ox + 6.5, -26, ox + 7, -18); c.closePath(); }, '#e8c860', 1.1);
    hp(() => c.rect(ox - 7, -20.5, 14, 2.4), '#5a3a1c', 0.7);
    if (v !== 'back') { c.strokeStyle = '#e8c860'; c.lineWidth = 1; for (const [x, y] of [[-12, -16], [12.5, -16.5], [-10, -15]]) { c.beginPath(); c.moveTo(ox + x, y); c.lineTo(ox + x * 1.12, y + 2.5); c.stroke(); } }
  }
  // серп колдуна: длинное древко, изогнутое лезвие, зелёный свет
  function sickle(glow) {
    c.strokeStyle = HO; c.lineWidth = 3.6; c.beginPath(); c.moveTo(0, 10); c.quadraticCurveTo(1.5, -10, 0, -27); c.stroke(); c.strokeStyle = '#5a3e24'; c.lineWidth = 2.2; c.stroke();
    hp(() => c.rect(-2, -28, 4, 4), '#4a4f56', 0.8);
    const G = 10 + (glow || 0) * 10, g = c.createRadialGradient(6, -32, 1, 6, -32, G); g.addColorStop(0, 'rgba(120,255,170,.65)'); g.addColorStop(1, 'rgba(120,255,170,0)'); c.fillStyle = g; c.beginPath(); c.arc(6, -32, G, 0, 7); c.fill();
    hp(() => { c.moveTo(-1, -27); c.quadraticCurveTo(6, -40, 16, -34); c.quadraticCurveTo(19, -30, 16, -25); c.quadraticCurveTo(15, -31, 8, -32); c.quadraticCurveTo(3, -31, 1, -25); c.closePath(); }, '#cfd8de', 1);
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(3, -33); c.quadraticCurveTo(9, -37, 15, -33); c.stroke();
    c.fillStyle = '#9affc8'; for (const [x, y] of [[10, -36], [14, -29]]) { c.beginPath(); c.arc(x, y, 0.9, 0, 7); c.fill(); }
  }
  // посох: древко через кисть, навершие сверху; glow — вспышка при ударе
  function staff(glow) {
    c.strokeStyle = HO; c.lineWidth = 3.6; c.beginPath(); c.moveTo(0, 10); c.lineTo(0, -27); c.stroke(); c.strokeStyle = wt === 0 ? '#8a6a3a' : wt >= 3 ? '#3a2a5a' : '#6b4a2c'; c.lineWidth = 2.2; c.stroke();
    if (wt === 0) { hp(() => c.ellipse(-1, -27, 2.2, 1.6, 0.4, 0, 7), '#7a5a32', 0.8); hp(() => c.ellipse(2.5, -22, 2, 1, 0.8, 0, 7), '#5a8a3a', 0.6); }
    const oc = ['#ffb347', '#7ec8ff', '#9affc8', '#c8a0ff'][wt], R = wt ? 3 + wt : 2;
    if (wt || glow) { const G = R * (2.6 + (glow || 0) * 2); const g = c.createRadialGradient(0, -30, 1, 0, -30, G); g.addColorStop(0, oc + 'cc'); g.addColorStop(1, oc + '00'); c.fillStyle = g; c.beginPath(); c.arc(0, -30, G, 0, 7); c.fill(); }
    if (wt) { if (wt >= 2) { c.strokeStyle = '#cfd8de'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -30, R + 2, 0, 7); c.stroke(); } hp(() => c.arc(0, -30, R, 0, 7), oc, 0.9); c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(-1.3, -31.4, 1.3, 0, 7); c.fill(); }
  }
  // лук: рукоять в кисти, плечи вверх-вниз, тетива слева; pull — натяжение
  function bow(pull, arrow) {
    const bh = 13 + wt * 2.5, bc = ['#8a6a3a', '#6b4a2c', '#4a3420', '#d8c050'][wt];
    c.strokeStyle = HO; c.lineWidth = 3.6; c.beginPath(); c.moveTo(-3, -bh); c.quadraticCurveTo(6, 0, -3, bh); c.stroke(); c.strokeStyle = bc; c.lineWidth = 2.2; c.stroke();
    const sx = -3 - pull * 7; c.strokeStyle = '#e8e0cc'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-3, -bh); c.lineTo(sx, 0); c.lineTo(-3, bh); c.stroke();
    if (arrow && pull > 0.05) { c.strokeStyle = '#c9b48a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sx, 0); c.lineTo(9, 0); c.stroke(); c.fillStyle = '#cfd8de'; c.beginPath(); c.moveTo(12, 0); c.lineTo(8, -2); c.lineTo(8, 2); c.fill(); }
    if (wt >= 3) { c.strokeStyle = '#9affc8'; c.lineWidth = 0.8; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(4, -6 + i * 6, 2, 0, 3); c.stroke(); } }
  }

  // торс сбоку (облик героя)
  function torso() {
      const tor=()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(8,6);c.quadraticCurveTo(0,8.5,-8,6);c.closePath()};
  const robeP=()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(10,11);c.quadraticCurveTo(0,14,-10,11);c.closePath()};
  const cc=ln.chest[tc];
  if(tc<0){ // голый торс
    hp(tor,SKIN);c.strokeStyle='rgba(150,90,60,.55)';c.lineWidth=0.7;c.beginPath();c.moveTo(-5,-2.5);c.quadraticCurveTo(-2.5,-0.8,-0.4,-2.2);c.moveTo(1.4,-2.2);c.quadraticCurveTo(3.5,-0.8,6,-2.5);c.stroke();
    c.fillStyle='rgba(150,90,60,.6)';c.beginPath();c.arc(0.6,2.6,0.6,0,7);c.fill();
  }else if(tc===0){ // простая рубаха и верёвочный пояс
    hp(tor,cc);c.strokeStyle='#a8916a';c.lineWidth=0.8;c.beginPath();c.moveTo(-2.5,-6.4);c.lineTo(0.5,-2);c.lineTo(3.5,-6.4);c.stroke();
    c.strokeStyle='#8a6a3a';c.lineWidth=1.6;c.beginPath();c.moveTo(-8,4.4);c.quadraticCurveTo(0,5.6,8,4.4);c.stroke();c.beginPath();c.moveTo(-3,5);c.lineTo(-4,8.5);c.stroke();
    c.fillStyle='rgba(120,90,50,.35)';c.fillRect(3,-1,2.4,2.4); // заплатка
  }else if(robe){
    hp(robeP,cc);
    c.save();c.beginPath();robeP();c.clip();
    if(tc>=2){c.fillStyle=tc>=3?'#2a1a50':'#24406e';c.fillRect(-2.5,-8,6,22);}
    if(tc>=3){c.fillStyle='#cfd8e6';for(const [sx,sy,r] of [[-6,0,1.3],[6,3,1.1],[-5,7,1],[5,-2,0.9],[-1,10,1]]){c.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*0.4:r,a=i*Math.PI/4;c.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr)}c.fill()}}
    c.restore();
    const trim=tc>=4&&rc?rc:tc>=2?'#f4c766':'#5a3a1c';c.strokeStyle=trim;c.lineWidth=1.2;c.beginPath();c.moveTo(-9.6,10.6);c.quadraticCurveTo(0,13.6,9.6,10.6);c.stroke();
    hp(()=>c.rect(-8,3.4,16,2.2),tc>=2?'#f4c766':'#5a3a1c',.6);
    if(tc>=4){for(let i=0;i<4;i++){const gx=-6+i*4,g=c.createRadialGradient(gx,9.4,0.2,gx,9.4,2.6);g.addColorStop(0,'rgba(200,170,255,.95)');g.addColorStop(1,'rgba(200,170,255,0)');c.fillStyle=g;c.beginPath();c.arc(gx,9.4,2.6,0,7);c.fill()}}
  }else if(tc===1){ // кожа
    hp(tor,cc);c.strokeStyle='#5a3418';c.lineWidth=0.7;c.setLineDash([1.2,1.2]);c.beginPath();c.moveTo(-5,-5);c.lineTo(-5.5,5);c.moveTo(5,-5);c.lineTo(5.5,5);c.stroke();c.setLineDash([]);
    hp(()=>c.rect(-8,3.6,16,2.6),'#3a2416',.8);hp(()=>c.rect(-1.4,3.6,2.8,2.6),'#c9a050',.6);
  }else if(cl==='warrior'&&tc===2||cl==='archer'&&tc===2){ // кольчуга / шкуры
    hp(tor,cc,1.2);c.save();c.beginPath();tor();c.clip();
    if(cl==='warrior'){c.strokeStyle='#6c757c';c.lineWidth=0.6;for(let r=0;r<6;r++)for(let k=0;k<9;k++){c.beginPath();c.arc(-8+k*2+(r%2),-6+r*2.2,1,0,Math.PI);c.stroke()}}
    else{c.fillStyle='#4a3218';for(let k=0;k<12;k++){c.beginPath();c.arc(-7+(k*5)%15,-4+(k*3)%10,1.2,0,7);c.fill()}}
    c.restore();hp(()=>{c.moveTo(-7.5,-6);c.quadraticCurveTo(0,-9.5,7.5,-6);c.quadraticCurveTo(0,-3.5,-7.5,-6)},cl==='archer'?'#e8dcc0':'#5a3a1c',0.8);
    hp(()=>c.rect(-8,3.6,16,2.6),'#3a2416',.8);hp(()=>c.rect(-1.4,3.6,2.8,2.6),'#c9a050',.6);
  }else{ // латы / чешуя, ярус 3–4
    hp(tor,cc,1.2);
    if(cl==='archer'){c.save();c.beginPath();tor();c.clip();for(let r=0;r<4;r++)for(let k=0;k<5;k++){const lx=-8+k*4+(r%2)*2,ly=-5+r*3.4;hp(()=>{c.moveTo(lx,ly);c.quadraticCurveTo(lx+2,ly+3,lx+4,ly);c.quadraticCurveTo(lx+2,ly+1.4,lx,ly)},tc>=4?(r%2?'#2a8a72':'#3aa88a'):(r%2?'#5fc98a':'#4aa870'),0.5)}c.restore();
      c.strokeStyle='#3a2416';c.lineWidth=1.7;c.beginPath();c.moveTo(-6,-5);c.lineTo(7,4);c.stroke()}
    else{c.fillStyle='rgba(255,255,255,.3)';c.fillRect(-5.5,-4,1.6,8);hp(()=>c.arc(0.5,-1,2.4,0,7),tc>=4&&rc?rc:'#f4c766',0.7);
      c.strokeStyle=tc>=4&&rc?rc:'#f4c766';c.lineWidth=0.9;c.beginPath();c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.stroke()}
    hp(()=>c.rect(-8,3.6,16,2.6),'#3a2416',.8);hp(()=>c.rect(-1.4,3.6,2.8,2.6),tc>=4&&rc?rc:'#f4c766',.6);
  }
  // пояс штанов поверх голого торса; без штанов — трусы
  if(tc<0&&tl>=0)hp(()=>c.rect(-8,3.4,16,3.6),lc,.8);
  if(tl<0)hp(()=>{c.moveTo(-8,3.6);c.quadraticCurveTo(0,4.8,8,3.6);c.lineTo(7.4,8.6);c.lineTo(1.2,8);c.lineTo(0,6.4);c.lineTo(-1.2,8);c.lineTo(-7.4,8.6);c.closePath()},'#ece6da',.9);
  }

  // ======================================================== спереди и сзади
  function frontBack(back) {
    const capC = tc >= 3 ? (cl === 'warrior' ? (tc >= 4 ? '#3a2a6a' : '#8a2a1a') : cl === 'archer' ? (tc >= 4 ? '#173f36' : '#2f6a3a') : (tc >= 4 ? '#140e36' : '#2a1a58')) : null;
    const tor = () => { c.moveTo(-7, -5); c.quadraticCurveTo(0, -8, 7, -5); c.lineTo(8, 6); c.quadraticCurveTo(0, 8.5, -8, 6); c.closePath(); };
    const robeP = () => { c.moveTo(-7, -5); c.quadraticCurveTo(0, -8, 7, -5); c.lineTo(10 + s * 0.8, 11.5); c.quadraticCurveTo(0, 14, -10 + s * 0.8, 11.5); c.closePath(); };
    // плащ спереди виден по краям, сзади — целиком поверх
    if (capC && !back) hp(() => { c.moveTo(-8, -5); c.lineTo(-11, 12); c.lineTo(11, 12); c.lineTo(8, -5); c.closePath(); }, shade(capC, -0.2));
    // колчан спереди — над плечом
    if (cl === 'archer' && !back) { c.save(); c.translate(6, -8); c.rotate(0.4); c.fillStyle = '#e8e0cc'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-2 + i * 2, -2); c.lineTo(-3 + i * 2, -6); c.lineTo(-1 + i * 2, -6); c.fill(); } hp(() => c.roundRect(-3, -2, 6, 5, 1.5), tc >= 3 ? '#3a2a14' : '#6b4a2c'); c.restore(); }
    // ноги: шаг — одна нога поднимается
    for (const [lx, k] of [[-3.3, 1], [3.3, -1]]) {
      const lift = W ? Math.max(0, s * k) * 2.6 : 0, fy = 12.6 - lift;
      limb(lx, 3.5, lx + (W ? -k * s * 0.4 : 0), fy - 1.2, 4, lc);
      if (tl >= 1 && !bare) limb(lx, fy - 3.4, lx, fy - 1.2, 4.4, boot);
      hp(() => c.ellipse(lx, fy - 0.2, 2.8, 1.7, 0, 0, 7), boot, 0.8);
    }
    // руки качаются: та, что вперёд, — короче и ниже по кисти
    const armF = (sx, k) => {
      let hx = sx * 1.05, hy = 4 + (W ? k * s * 1.6 : 0), hold = false;
      if (SW && ((back && sx > 0) || (!back && sx < 0))) { hold = true; const q = SW.a; hx = sx * (1.05 - Math.min(1, Math.max(0, q)) * 0.3); hy = 4 - Math.max(0, Math.sin(Math.min(Math.PI, q * 1.2))) * 10 - (q < -0.5 ? 6 : 0); }
      limb(sx, -3.5, sx * 1.08, (hy - 3.5) / 2 - 3.5 + 1, 3.4, sl); limb(sx * 1.08, (hy - 3.5) / 2 - 2.5, hx, hy, 3, sl);
      return [hx, hy, hold];
    };
    if (robe) hp(robeP, cc);
    const R = armF(8, 1), Lh = armF(-8, -1);
    if (!robe) bodyFront(tor, back);
    else { const trim = tc >= 2 ? '#f4c766' : '#5a3a1c'; c.strokeStyle = trim; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9.6, 11); c.quadraticCurveTo(0, 13.8, 9.6, 11); c.stroke(); hp(() => c.rect(-8, 3.4, 16, 2.2), tc >= 2 ? '#f4c766' : '#5a3a1c', .6); if (!back && tc >= 2) { c.fillStyle = tc >= 3 ? '#2a1a50' : '#24406e'; c.fillRect(-2.5, -5, 5, 8.4); } }
    // плечи
    for (const sx of [-8, 8]) hp(() => c.ellipse(sx, -1, 2.6, 4, 0, 0, 7), sl, .9);
    if (cl === 'warrior' && tc >= 2) for (const sx of [-7.5, 7.5]) { hp(() => c.arc(sx, -4.5, 4.4, Math.PI, 0), tc >= 3 ? cc : '#7c858c', 1); if (tc >= 4) for (const d of [-2, 2]) hp(() => { c.moveTo(sx + d - 1.2, -8.4); c.lineTo(sx + d * 1.4, -13); c.lineTo(sx + d + 1.2, -8.4); c.closePath(); }, '#cfd8de', 0.6); }
    if (cl === 'mage' && tc >= 3) for (const sx of [-7, 7]) hp(() => { c.arc(sx, -4.5, 3.4, Math.PI, 0); c.closePath(); }, '#cfd8e6', 0.8);
    // плащ и колчан сзади — поверх спины
    if (back && capC) { hp(() => { c.moveTo(-7.5, -6); c.lineTo(7.5, -6); c.lineTo(9 + s * 0.8, 12.5); c.quadraticCurveTo(0, 14.5, -9 + s * 0.8, 12.5); c.closePath(); }, capC); if (rc) { c.strokeStyle = rc; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-8.5, 12.3); c.quadraticCurveTo(0, 14.2, 8.5, 12.3); c.stroke(); } }
    if (back && cl === 'archer') { c.save(); c.translate(-2, -3); c.rotate(-0.4); hp(() => c.roundRect(-3, -10, 6, 16, 2), tc >= 3 ? '#3a2a14' : '#6b4a2c'); c.fillStyle = '#e8e0cc'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-2 + i * 2, -10); c.lineTo(-3 + i * 2, -14); c.lineTo(-1 + i * 2, -14); c.fill(); } c.strokeStyle = '#5a3a1c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3, -6); c.lineTo(8, 10); c.stroke(); c.restore(); }
    // голова
    if (back) headBack(); else headFront();
    // оружие: спереди — в правой руке героя (слева на экране), сзади — справа
    const [hx, hy] = back ? R : Lh;
    if (wt >= 0 || L.pick) { c.save(); c.translate(hx, hy);
      if (L.pick) { c.rotate(SW ? (SW.a < 0 ? -0.6 : 0.5) * (back ? -1 : 1) + (back ? 0.15 : -0.15) : (back ? 0.12 : -0.12)); pickaxe(); }
      else if (L.torch) { c.rotate(back ? 0.12 : -0.12); torch(); }
      else if (cl === 'warrior') { c.rotate(SW ? (SW.a < 0 ? -0.6 : 0.5) * (back ? -1 : 1) + (back ? 0.15 : -0.15) : (back ? 0.12 : -0.12)); axe(); }
      else if (cl === 'mage') { c.rotate(back ? 0.06 : -0.06); (L.sickle ? sickle : staff)(SW ? SW.glow : 0); }
      else { if (SW && SW.bow) { c.rotate(Math.PI / 2); c.scale(1, back ? -1 : 1); bow(SW.pull, !back); } else { c.rotate(back ? 0.1 : -0.1); c.scale(back ? 1 : -1, 1); bow(0, false); } }
      c.restore(); }
    for (const [x, y] of [R, Lh]) hp(() => c.arc(x, y, 2.2, 0, 7), SKIN, 0.9);
  }

  function bodyFront(tor, back) {
    if (tc < 0) { hp(tor, SKIN); if (!back) { c.strokeStyle = 'rgba(150,90,60,.55)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-5, -2.5); c.quadraticCurveTo(-2.5, -0.8, -0.4, -2.2); c.moveTo(0.4, -2.2); c.quadraticCurveTo(2.5, -0.8, 5, -2.5); c.stroke(); c.fillStyle = 'rgba(150,90,60,.6)'; c.beginPath(); c.arc(0, 2.6, 0.6, 0, 7); c.fill(); } else { c.strokeStyle = 'rgba(150,90,60,.45)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 4); c.stroke(); } }
    else if (tc === 0) { hp(tor, cc); if (!back) { c.strokeStyle = '#a8916a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-2.5, -6.4); c.lineTo(0, -2); c.lineTo(2.5, -6.4); c.stroke(); } c.strokeStyle = '#8a6a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-8, 4.4); c.quadraticCurveTo(0, 5.6, 8, 4.4); c.stroke(); }
    else if (tc === 1) { hp(tor, cc); c.strokeStyle = '#5a3418'; c.lineWidth = 0.7; c.setLineDash([1.2, 1.2]); c.beginPath(); c.moveTo(-4, -5); c.lineTo(-4.5, 5); c.moveTo(4, -5); c.lineTo(4.5, 5); c.stroke(); c.setLineDash([]); hp(() => c.rect(-8, 3.6, 16, 2.6), '#3a2416', .8); if (!back) hp(() => c.rect(-1.4, 3.6, 2.8, 2.6), '#c9a050', .6); }
    else if (tc === 2) { hp(tor, cc, 1.2); c.save(); c.beginPath(); tor(); c.clip(); if (cl === 'warrior') { c.strokeStyle = '#6c757c'; c.lineWidth = 0.6; for (let r = 0; r < 6; r++) for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(-8 + k * 2 + (r % 2), -6 + r * 2.2, 1, 0, Math.PI); c.stroke(); } } else { c.fillStyle = '#4a3218'; for (let k = 0; k < 12; k++) { c.beginPath(); c.arc(-7 + (k * 5) % 15, -4 + (k * 3) % 10, 1.2, 0, 7); c.fill(); } } c.restore(); hp(() => c.rect(-8, 3.6, 16, 2.6), '#3a2416', .8); if (!back) hp(() => c.rect(-1.4, 3.6, 2.8, 2.6), '#c9a050', .6); }
    else { hp(tor, cc, 1.2); if (cl === 'archer') { c.save(); c.beginPath(); tor(); c.clip(); for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) { const lx = -8 + k * 4 + (r % 2) * 2, ly = -5 + r * 3.4; hp(() => { c.moveTo(lx, ly); c.quadraticCurveTo(lx + 2, ly + 3, lx + 4, ly); c.quadraticCurveTo(lx + 2, ly + 1.4, lx, ly); }, tc >= 4 ? (r % 2 ? '#2a8a72' : '#3aa88a') : (r % 2 ? '#5fc98a' : '#4aa870'), 0.5); } c.restore(); }
      else if (!back) { c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-5.5, -4, 1.6, 8); hp(() => c.arc(0, -1, 2.4, 0, 7), tc >= 4 && rc ? rc : '#f4c766', 0.7); }
      hp(() => c.rect(-8, 3.6, 16, 2.6), '#3a2416', .8); if (!back) hp(() => c.rect(-1.4, 3.6, 2.8, 2.6), tc >= 4 && rc ? rc : '#f4c766', .6); }
    if (tc < 0 && tl >= 0) hp(() => c.rect(-8, 3.4, 16, 3.6), lc, .8);
    if (tl < 0) hp(() => { c.moveTo(-8, 3.6); c.quadraticCurveTo(0, 4.8, 8, 3.6); c.lineTo(7.4, 8.6); c.lineTo(1.2, 8); c.lineTo(0, 6.4); c.lineTo(-1.2, 8); c.lineTo(-7.4, 8.6); c.closePath(); }, '#ece6da', .9);
  }

  // голова спереди: лицо к нам
  function headFront() {
    const hood = (cl === 'archer' && th >= 1) || (cl === 'mage' && th === 1), hoodC = cl === 'archer' ? ['', '#6b4a2c', '#2f4f2a', '#2f6a3a', '#1f5a4a'][th] : '#7a5a3a';
    if (hood) hp(() => c.arc(0, -12.4, 8.8, 0, 7), hoodC);
    else if (th === 0) hp(() => c.arc(0, -13, 8, 0, 7), HAIR[cl], 1);
    hp(() => hood ? c.ellipse(0, -11.4, 5.6, 5.8, 0, 0, 7) : c.arc(0, -12, 7.5, 0, 7), SKIN);
    if (hood) { c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, -16.4, 5.4, 1.6, 0, 0, 7); c.fill(); }
    if (!hood && th === 0) hp(() => { c.moveTo(-7.5, -12.5); c.quadraticCurveTo(-4, -21, 0, -19.5); c.quadraticCurveTo(4, -21, 7.5, -12.5); c.quadraticCurveTo(4, -17, 0, -15.5); c.quadraticCurveTo(-4, -17, -7.5, -12.5); }, HAIR[cl], 0.8);
    if (cl === 'warrior') hp(() => { c.moveTo(-5, -9.5); c.quadraticCurveTo(0, -7.5, 5, -9.5); c.quadraticCurveTo(5, -3.5, 0, -1.5); c.quadraticCurveTo(-5, -3.5, -5, -9.5); }, '#c8742a', .9);
    if (cl === 'mage') hp(() => { c.moveTo(-4.5, -9.5); c.quadraticCurveTo(0, -8, 4.5, -9.5); c.quadraticCurveTo(4, -1, 0, 3.5); c.quadraticCurveTo(-4, -1, -4.5, -9.5); }, '#ece6df', .9);
    const eyeC = cl === 'mage' ? '#3a6fa8' : HO; for (const ex of [-2.6, 2.6]) { c.fillStyle = eyeC; c.beginPath(); c.ellipse(ex, -12.5, 1.05, 1.5, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + .35, -13, .4, 0, 7); c.fill(); }
    if (!hood) { c.fillStyle = 'rgba(230,110,90,.35)'; for (const x of [-4.8, 4.8]) { c.beginPath(); c.arc(x, -10.3, 1.2, 0, 7); c.fill(); } }
    if (L.mask) hp(() => { c.moveTo(-5.5, -10.2); c.quadraticCurveTo(0, -8.6, 5.5, -10.2); c.quadraticCurveTo(5, -5, 0, -3.6); c.quadraticCurveTo(-5, -5, -5.5, -10.2); }, L.mask, 0.8);
    if (L.band) hp(() => c.rect(-7.8, -17.4, 15.6, 2.6), L.band, 0.7);
    if (L.patch) { c.fillStyle = HO; c.beginPath(); c.ellipse(2.6, -12.5, 2, 2.2, 0, 0, 7); c.fill(); c.strokeStyle = HO; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-7, -15); c.lineTo(7.5, -11); c.stroke(); }
    helm(false); if (L.strawHat) strawHat('front');
  }
  // голова сзади: затылок
  function headBack() {
    const hood = (cl === 'archer' && th >= 1) || (cl === 'mage' && th === 1), hoodC = cl === 'archer' ? ['', '#6b4a2c', '#2f4f2a', '#2f6a3a', '#1f5a4a'][th] : '#7a5a3a';
    if (hood) { hp(() => c.arc(0, -12.4, 8.8, 0, 7), hoodC); hp(() => { c.moveTo(-3, -6); c.lineTo(0, 0); c.lineTo(3, -6); c.closePath(); }, hoodC, 0.8); }
    else { hp(() => c.arc(0, -12, 7.5, 0, 7), SKIN); hp(() => { c.arc(0, -12.6, 7.7, Math.PI * 0.95, Math.PI * 2.05); c.lineTo(7.4, -9); c.quadraticCurveTo(0, -5.5, -7.4, -9); c.closePath(); }, HAIR[cl], 1); if (cl === 'mage') hp(() => { c.moveTo(-6, -9); c.quadraticCurveTo(0, 2, 6, -9); c.closePath(); }, HAIR.mage, 0.8); }
    if (L.band) { hp(() => c.rect(-7.8, -17.4, 15.6, 2.6), L.band, 0.7); hp(() => { c.moveTo(0, -16); c.lineTo(-3, -9); c.lineTo(0, -10); c.lineTo(3, -9); c.closePath(); }, L.band, 0.6); }
    if (L.mask) { c.strokeStyle = L.mask; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-7.4, -9.5); c.lineTo(7.4, -9.5); c.stroke(); }
    helm(true); if (L.strawHat) strawHat('back');
  }
  // шлемы спереди и сзади (симметричные)
  function helm(back) {
    if (cl === 'warrior' && th >= 1) {
      c.save(); c.translate(0, -3);
      if (th === 1) { hp(() => { c.arc(0, -13, 8.2, Math.PI, 0); c.lineTo(8.2, -12); c.lineTo(-8.2, -12); c.closePath(); }, '#8a5a32'); c.strokeStyle = '#5a3418'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, -21); c.lineTo(0, -12.5); c.stroke(); }
      else if (th === 2) { hp(() => { c.arc(0, -12, 8.8, Math.PI, 0); c.lineTo(8.8, back ? 0 : -6); c.lineTo(6.2, back ? 0 : -6); c.lineTo(6.2, -11.5); c.lineTo(-6.2, -11.5); c.lineTo(-6.2, back ? 0 : -6); c.lineTo(-8.8, back ? 0 : -6); c.closePath(); }, '#9aa3aa'); hp(() => c.rect(-8.8, -14, 17.6, 2.4), '#7c858c', .8); }
      else { const hc = th >= 4 ? '#4a4f6e' : '#c4ccd2', tr = th >= 4 && rc ? rc : '#f4c766';
        for (const sx of [-1, 1]) hp(() => { c.moveTo(sx * 6, -15); c.quadraticCurveTo(sx * 15, -15, sx * 15, -28); c.quadraticCurveTo(sx * 11, -21, sx * 4, -19); c.closePath(); }, '#ece2c8', 1);
        hp(() => { c.arc(0, -13, 8.6, Math.PI, 0); c.lineTo(8.6, back ? -6 : -9); c.lineTo(-8.6, back ? -6 : -9); c.closePath(); }, hc, 1.1); hp(() => c.rect(-9, -14.8, 18, 3), tr, .8);
        if (!back) hp(() => c.rect(-0.75, -14.5, 1.5, 5), tr, .6); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-3, -18, 2, 0, 7); c.fill(); }
      c.restore();
    }
    if (cl === 'mage' && th >= 2) { const hc = L.hatCol || ['', '', '#3a5a9a', '#4a2f78', '#241a50'][th]; c.save(); c.translate(0, -1.8);
      hp(() => c.ellipse(0, -16.5, 11, 2.8, 0, 0, 7), '#1e1438'); hp(() => { c.moveTo(-6.5, -17); c.quadraticCurveTo(-3, -27, 1, -31); c.quadraticCurveTo(3, -33, 6, -31); c.quadraticCurveTo(2, -27, 6.5, -17); c.closePath(); }, hc);
      hp(() => c.rect(-6.3, -19.3, 12.6, 2.4), th >= 4 && rc ? rc : '#f4c766', .8); if (th >= 3 && !back) { c.fillStyle = '#f4c766'; c.beginPath(); c.arc(0, -24, 1.2, 0, 7); c.fill(); } c.restore(); }
    if (cl === 'archer' && th >= 3) hp(() => { c.moveTo(back ? 4 : -4, -19); c.quadraticCurveTo(back ? 9 : -9, -28, back ? 6 : -6, -33); c.quadraticCurveTo(back ? 5 : -5, -26, back ? 2 : -2, -20); c.closePath(); }, th >= 4 && rc ? rc : '#d8c050', 0.7);
  }
}
