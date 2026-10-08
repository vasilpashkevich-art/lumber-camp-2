/* ================= ОБЛИКИ ТОПОРА И ЛУКА ================= */
const AXE_SKINS=[
  {from:1, name:'Плотницкий',  haft:'#8d6540',wrap:null,     blade:'#b9bcb4',edge:'#e6e8e2',sock:'#6d6f6a',s:0.85},
  {from:4, name:'Кованый',     haft:'#6e4a2c',wrap:'#3b2a1c',blade:'#9ea5aa',edge:'#f0f3f5',sock:'#4c5257',s:0.95},
  {from:8, name:'Стальной серп',haft:'#4a3322',wrap:'#7a2d22',blade:'#cfd8de',edge:'#ffffff',sock:'#c9a24a',s:1.05},
  {from:12,name:'Бронзовый',   haft:'#3a2618',wrap:'#c9a24a',blade:'#c98a3a',edge:'#f3d18a',sock:'#7a4f1f',s:1.12},
  {from:16,name:'Обсидиановый',haft:'#241a14',wrap:'#5d3a7a',blade:'#2b2533',edge:'#b07aff',sock:'#8f8f9a',s:1.2,glow:'rgba(176,122,255,'},
  {from:20,name:'Пламенный',   haft:'#1e1410',wrap:'#c9a24a',blade:'#5a1e12',edge:'#ffb347',sock:'#e0c060',s:1.28,glow:'rgba(255,140,40,'}];
const BOW_SKINS=[
  {from:1, name:'Ивовый',      wood:'#8d6540',grip:null,     str:'rgba(236,230,211,.8)',r:11,rec:0},
  {from:3, name:'Охотничий',   wood:'#6a4528',grip:'#3b2a1c',str:'rgba(236,230,211,.9)',r:12,rec:0},
  {from:6, name:'Составной',   wood:'#4a3322',grip:'#c9a24a',str:'#efe8d4',r:12.5,rec:1,tip:'#e8dcc0'},
  {from:9, name:'Лесной страж',wood:'#3f6b3a',grip:'#c9a24a',str:'#e8f5d8',r:13,rec:1,tip:'#c9a24a',leaf:'#7fc06a'},
  {from:12,name:'Драконий',    wood:'#5a1e12',grip:'#1e1410',str:'#ffd28a',r:14,rec:1.3,tip:'#ffb347',glow:'rgba(255,140,40,'}];
const skinTier=(arr,l)=>{let t=0;for(let i=0;i<arr.length;i++)if(l>=arr[i].from)t=i;return t};
const axeSkin=l=>AXE_SKINS[skinTier(AXE_SKINS,l)], bowSkin=l=>BOW_SKINS[skinTier(BOW_SKINS,Math.max(1,l))];
/* топор: рукоять вдоль угла a от (x,y), длина L; две головы-серпа, симметричные буквой S */
function drawAxeSkin(c,K,x,y,a,L,t){
  c.save();c.translate(x,y);c.rotate(a);
  c.lineCap='round';c.strokeStyle=K.haft;c.lineWidth=3;c.beginPath();c.moveTo(4,0);c.lineTo(L+3,0);c.stroke();
  if(K.wrap){c.strokeStyle=K.wrap;c.lineWidth=3.6;for(let i=0;i<3;i++){c.beginPath();c.moveTo(6+i*3,0);c.lineTo(7.4+i*3,0);c.stroke()}}
  c.translate(L,0);const s=K.s;c.scale(s,s);
  if(K.glow){const p=0.35+0.2*Math.sin(t/160);const g=c.createRadialGradient(0,0,2,0,0,20);g.addColorStop(0,K.glow+p+')');g.addColorStop(1,K.glow+'0)');c.fillStyle=g;c.beginPath();c.arc(0,0,20,0,7);c.fill()}
  for(const r of [0,Math.PI]){c.save();c.rotate(r);
    c.fillStyle=K.blade;c.beginPath();
    c.moveTo(-3,-2.2);c.lineTo(3,-2.2);
    c.quadraticCurveTo(5.5,-7,10.5,-10.5);        // передний рог
    c.quadraticCurveTo(5,-17.5,-5.5,-15.5);       // режущая кромка-серп
    c.quadraticCurveTo(-0.5,-10,-3,-2.2);         // вогнутая спинка
    c.fill();
    c.strokeStyle=K.edge;c.lineWidth=1.3;c.beginPath();c.moveTo(10.5,-10.5);c.quadraticCurveTo(5,-17.5,-5.5,-15.5);c.stroke();
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=0.8;c.beginPath();c.moveTo(-3,-2.2);c.quadraticCurveTo(-0.5,-10,-5.5,-15.5);c.stroke();
    c.restore()}
  c.fillStyle=K.sock;c.fillRect(-3.2,-2.6,6.4,5.2);
  c.fillStyle=K.edge;c.beginPath();c.arc(0,0,1.1,0,7);c.fill();
  c.restore();
}
/* лук: центр (bx,by), смотрит по углу a; pull — натяжение 0..4 */
function drawBowSkin(c,K,bx,by,a,pull,t,arrow){
  const r=K.r,e=1.15,ax=Math.cos(a),ay=Math.sin(a);
  const t1x=bx+Math.cos(a-e)*r,t1y=by+Math.sin(a-e)*r,t2x=bx+Math.cos(a+e)*r,t2y=by+Math.sin(a+e)*r;
  if(K.glow){const p=0.3+0.15*Math.sin(t/200);const g=c.createRadialGradient(bx,by,2,bx,by,r+8);g.addColorStop(0,K.glow+p+')');g.addColorStop(1,K.glow+'0)');c.fillStyle=g;c.beginPath();c.arc(bx,by,r+8,0,7);c.fill()}
  // тетива и стрела
  const nx=bx+ax*(4-pull),ny=by+ay*(4-pull);
  c.strokeStyle=K.str;c.lineWidth=1;c.beginPath();c.moveTo(t1x,t1y);c.lineTo(nx,ny);c.lineTo(t2x,t2y);c.stroke();
  if(arrow){c.strokeStyle='#c9b48a';c.lineWidth=1.2;c.beginPath();c.moveTo(nx,ny);c.lineTo(bx+ax*(r+6),by+ay*(r+6));c.stroke();
    c.fillStyle=K.tip||'#9ea5aa';c.beginPath();const hx=bx+ax*(r+9),hy=by+ay*(r+9);c.moveTo(hx,hy);c.lineTo(bx+ax*(r+5)-ay*2,by+ay*(r+5)+ax*2);c.lineTo(bx+ax*(r+5)+ay*2,by+ay*(r+5)-ax*2);c.fill()}
  // плечи
  c.lineCap='round';c.strokeStyle=K.wood;c.lineWidth=2.6;c.beginPath();c.arc(bx,by,r,a-e,a+e);c.stroke();
  if(K.rec){for(const sg of [-1,1]){const ta=a+sg*e,tx=bx+Math.cos(ta)*r,ty=by+Math.sin(ta)*r;
    c.beginPath();c.moveTo(tx,ty);c.quadraticCurveTo(tx+Math.cos(ta)*2.5*K.rec+ax*2,ty+Math.sin(ta)*2.5*K.rec+ay*2,tx+Math.cos(ta)*1.5*K.rec+ax*4*K.rec,ty+Math.sin(ta)*1.5*K.rec+ay*4*K.rec);c.stroke();
    if(K.tip){c.fillStyle=K.tip;c.beginPath();c.arc(tx+Math.cos(ta)*1.5*K.rec+ax*4*K.rec,ty+Math.sin(ta)*1.5*K.rec+ay*4*K.rec,1.3,0,7);c.fill()}}}
  if(K.leaf){c.fillStyle=K.leaf;for(const sg of [-0.6,0.6]){const la=a+sg,lx=bx+Math.cos(la)*r,ly=by+Math.sin(la)*r;c.beginPath();c.ellipse(lx+ax*2,ly+ay*2,2.6,1.2,la+0.6,0,7);c.fill()}}
  if(K.grip){c.strokeStyle=K.grip;c.lineWidth=3.6;c.beginPath();c.arc(bx,by,r,a-0.22,a+0.22);c.stroke()}
}
const skinIcoCache={};
function skinIcon(kind,i){
  const key=kind+i;if(skinIcoCache[key])return skinIcoCache[key];
  try{const cv=document.createElement('canvas');cv.width=cv.height=44;const c=cv.getContext('2d');if(!c||!cv.toDataURL)return '';
    if(kind==='axe')drawAxeSkin(c,AXE_SKINS[i],8,36,-0.8,26,0);else drawBowSkin(c,BOW_SKINS[i],26,22,0,0,0,true);
    return skinIcoCache[key]=cv.toDataURL();}catch(e){return ''}
}
function skinNote(arr,l){const i=skinTier(arr,l),n=arr[i+1];return ` · облик «${arr[i].name}»${n?`, следующий «${n.name}» на ур. ${n.from}`:''}`}
