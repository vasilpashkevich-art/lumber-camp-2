// --- облик героя (v41): человечек по классу, смотрит в сторону движения
const HO='#24180f';
function heroFig(c,cl,x,y,s=1,dir=1){const hp=(fn,fill,lw=1.1)=>{c.beginPath();fn();c.fillStyle=fill;c.fill();c.strokeStyle=HO;c.lineWidth=lw;c.stroke()};c.save();c.translate(x,y);c.scale(s*dir,s);c.lineJoin='round';c.lineCap='round';
  const skin='#f2c9a0';
  // плащ / колчан сзади
  if(cl==='warrior')hp(()=>{c.moveTo(-6,-5);c.lineTo(5,-5);c.lineTo(3,10);c.quadraticCurveTo(-4,12,-11,9);c.closePath()},'#7a2a20');
  if(cl==='archer'){c.save();c.translate(-6,-3);c.rotate(-0.35);hp(()=>c.roundRect(-3,-9,6,15,2),'#6b4a2c');c.fillStyle='#e8e0cc';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-2+i*2,-9);c.lineTo(-3+i*2,-13);c.lineTo(-1+i*2,-13);c.fill()}c.restore();hp(()=>{c.moveTo(-6,-5);c.lineTo(5,-5);c.lineTo(2,9);c.quadraticCurveTo(-5,11,-10,8);c.closePath()},'#24401f')}
  // ноги
  if(cl!=='mage'){const boot=cl==='warrior'?'#4c5257':'#3a2616';hp(()=>c.roundRect(-5,4,4,8,1.6),boot);hp(()=>c.roundRect(1,4,4,8,1.6),boot)}
  // тело
  const tor=()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(8,6);c.quadraticCurveTo(0,8.5,-8,6);c.closePath()};
  if(cl==='mage'){hp(()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(10,11);c.quadraticCurveTo(0,14,-10,11);c.closePath()},'#4a2f78');c.strokeStyle='#f4c766';c.lineWidth=1.3;c.beginPath();c.moveTo(-9.3,10);c.quadraticCurveTo(0,13,9.3,10);c.stroke();c.beginPath();c.moveTo(1,-6);c.lineTo(1.5,11.5);c.stroke();c.fillStyle='#f4c766';c.beginPath();for(let i=0;i<10;i++){const r=i%2?1.1:2.6,a=i*Math.PI/5-Math.PI/2;c.lineTo(-4+Math.cos(a)*r,4+Math.sin(a)*r)}c.fill()}
  else if(cl==='warrior'){hp(tor,'#a8452a');hp(()=>{c.moveTo(-5,-5);c.quadraticCurveTo(0,-7,5,-5);c.lineTo(5.5,3);c.quadraticCurveTo(0,5,-5.5,3);c.closePath()},'#9aa3aa');c.fillStyle='rgba(255,255,255,.45)';c.fillRect(1,-4,1.6,6);hp(()=>c.rect(-8,3.5,16,2.6),'#4a3020',.8);c.fillStyle='#f4c766';c.fillRect(-1.2,3.5,2.4,2.6)}
  else if(cl==='archer'){hp(tor,'#3e6a3a');hp(()=>{c.moveTo(-6,-5);c.lineTo(-2,-6);c.lineTo(0,6.5);c.lineTo(-7,5.5);c.closePath()},'#6b4a2c',.8);c.strokeStyle='#3a2616';c.lineWidth=1.6;c.beginPath();c.moveTo(-6,-5);c.lineTo(7,4);c.stroke()}
  else{hp(tor,'#b8402a');c.save();c.beginPath();tor();c.clip();c.fillStyle='rgba(30,8,8,.38)';for(let i=-8;i<9;i+=4){c.fillRect(i,-9,1.6,18);c.fillRect(-9,i,18,1.4)}c.restore();hp(()=>c.rect(-8,3.5,16,2.4),'#4a3020',.8)}
  // плечи / руки
  const sl={warrior:'#a8452a',mage:'#4a2f78',archer:'#3e6a3a'}[cl]||'#b8402a';
  hp(()=>c.ellipse(-8,0,2.6,4,0.2,0,7),sl,.9);
  if(cl==='warrior')for(const sx of [-7,7])hp(()=>c.arc(sx,-4,3.8,Math.PI,0),'#b8c0c6',.9);
  hp(()=>c.ellipse(8,0,2.6,4,-0.2,0,7),sl,.9);hp(()=>c.arc(8.6,3,2.4,0,7),skin,.9);
  // голова
  if(cl==='archer'){hp(()=>{c.arc(0,-12,8.6,0,7)},'#2f4f2a');hp(()=>{c.moveTo(-5,-19);c.quadraticCurveTo(-9,-24,-12,-23);c.quadraticCurveTo(-9,-18,-8,-13);c.closePath()},'#2f4f2a')}
  hp(()=>cl==='archer'?c.ellipse(2,-11,5.3,5.6,0,0,7):c.arc(0,-12,7.5,0,7),skin);
  if(cl==='archer'){c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(2,-15,5.3,2.2,0,0,7);c.fill()}
  // борода
  if(cl==='warrior')hp(()=>{c.moveTo(-1,-10);c.quadraticCurveTo(3,-8,7,-10);c.quadraticCurveTo(7,-4,3.5,-2);c.quadraticCurveTo(0,-4,-1,-10)},'#c8742a',.9);
  if(cl==='mage')hp(()=>{c.moveTo(-1.5,-10);c.quadraticCurveTo(3,-8.5,7.2,-10);c.quadraticCurveTo(7,-2,3,3);c.quadraticCurveTo(0,-3,-1.5,-10)},'#ece6df',.9);
  if(!cl)hp(()=>{c.moveTo(-1,-10);c.quadraticCurveTo(3,-8.5,7,-10);c.quadraticCurveTo(6.5,-5,3,-4.5);c.quadraticCurveTo(0,-6,-1,-10)},'#6b3f1e',.9);
  // глаза
  const eyeC=cl==='mage'?'#3a6fa8':HO;for(const ex of [2.2,5.4]){c.fillStyle=eyeC;c.beginPath();c.ellipse(ex,-12.5,1.05,1.5,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ex+.35,-13,.4,0,7);c.fill()}
  if(cl!=='archer'){c.fillStyle='rgba(230,110,90,.35)';c.beginPath();c.arc(6.3,-10.3,1.3,0,7);c.fill()}
  // головные уборы
  if(cl==='warrior'){for(const sx of [-1,1])hp(()=>{c.moveTo(sx*6,-16);c.quadraticCurveTo(sx*12,-17,sx*12,-25);c.quadraticCurveTo(sx*9,-20,sx*4,-19);c.closePath()},'#ece2c8',.9);
    hp(()=>{c.arc(0,-13,8,Math.PI,0);c.lineTo(8,-13);c.lineTo(-8,-13)},'#9aa3aa');hp(()=>c.rect(-8.5,-14.5,17,2.8),'#7c858c',.9);hp(()=>c.rect(3,-14,2,5.5),'#7c858c',.8);c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.arc(-2.5,-17.5,2,0,7);c.fill()}
  if(cl==='mage'){hp(()=>c.ellipse(0,-16.5,11,2.8,0,0,7),'#2a1a48');hp(()=>{c.moveTo(-6.5,-17);c.quadraticCurveTo(-4,-26,-3,-30);c.quadraticCurveTo(-6,-33,-10,-31);c.quadraticCurveTo(-4,-35,0,-31);c.quadraticCurveTo(3,-24,6.5,-17);c.closePath()},'#4a2f78');hp(()=>c.rect(-6.3,-19.3,12.6,2.4),'#f4c766',.8);c.fillStyle='#f4c766';c.beginPath();c.arc(-1,-25,1.2,0,7);c.fill()}
  if(!cl){hp(()=>{c.arc(0,-13.5,7.9,Math.PI,0);c.closePath()},'#2f5d8a');hp(()=>c.roundRect(-8.4,-15,16.8,3.2,1.4),'#24486c',.9);hp(()=>c.arc(0,-22,2.4,0,7),'#e8e0cc',.9)}
  c.restore()}
// готовые картинки героя (в 3 раза чётче), чтобы не рисовать по частям каждый кадр
const HERO_SPR={};
function heroSprite(cl,dir,hurt){const k=(cl||'-')+dir+(hurt?'h':'');if(k in HERO_SPR)return HERO_SPR[k];
  const Q=3,cv=document.createElement('canvas');cv.width=40*Q;cv.height=56*Q;const c=cv.getContext&&cv.getContext('2d');
  if(!c||!c.quadraticCurveTo||!c.roundRect)return HERO_SPR[k]=null;
  c.scale(Q,Q);heroFig(c,cl,20,40,1,dir);
  if(hurt){c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='rgba(255,250,235,.7)';c.fillRect(0,0,cv.width,cv.height)}
  return HERO_SPR[k]=cv}
function drawHeroBody(c,x,y,cl,hurt,face,dir){dir=dir||(Math.cos(face)<0?-1:1);const sp=heroSprite(cl,dir,hurt);if(sp)c.drawImage(sp,x-20,y-40,40,56);else if(c.roundRect)heroFig(c,cl,x,y,1,dir)}
