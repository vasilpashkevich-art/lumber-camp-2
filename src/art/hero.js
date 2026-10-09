// Облик героя по надетым вещам (вариант Б): у каждой части тела свой ярус, кайма и сияние — по редкости.
// L = {cls, head, chest, legs, wt, rar, glow, mask, bandit}. chest/legs/wt = −1 — вещь снята (голый торс, трусы, пустые руки). Рисует в точке (x,y) — это ступни.
const HO='#24180f',SKIN='#f2c9a0';
const RAR={common:null,good:'#5fd35f',rare:'#4a9eff',epic:'#b46aff'};
// линейки брони по классу: 0 простая одежда, 1..4 растущие ярусы
export const LINE={
 warrior:{name:['Рубаха','Кожа','Кольчуга','Латы','Латы Стража'],
   chest:['#d8c8a4','#8a5a32','#9aa3aa','#c4ccd2','#4a4f6e'],legs:['#6b4a2c','#5a3a1c','#7c858c','#b8c0c6','#3e4260']},
 archer:{name:['Рубаха','Кожа','Шкуры','Чешуя','Доспех Следопыта'],
   chest:['#d8c8a4','#8a5a32','#6a4a2a','#3e7a4a','#1f5a4a'],legs:['#6b4a2c','#5a3a1c','#4a3420','#2f5a36','#1e403a']},
 mage:{name:['Рубаха','Роба','Расшитая роба','Звёздная мантия','Мантия Архимага'],
   chest:['#d8c8a4','#8a6a4a','#3a5a9a','#4a2f78','#241a50'],legs:['#6b4a2c','#7a5a3a','#2e4a80','#3a2466','#1a1240']},
};
export const WNAME={warrior:['Топорик','Боевой топор','Секира','Рунная секира'],mage:['Палка','Посох с кристаллом','Посох ученика','Посох бури'],archer:['Короткий лук','Охотничий лук','Длинный лук','Лук ветра']};
export function doll(c,x,y,s,dir,L,t=0){
  const cl=L.cls,ln=L.line||LINE[cl],tc=L.chest|0,tl=L.legs|0,th=L.head|0,rc=RAR[L.rar||'common'];
  const hp=(fn,fill,lw=1.1)=>{c.beginPath();fn();c.fillStyle=fill;c.fill();c.strokeStyle=HO;c.lineWidth=lw;c.stroke()};
  c.save();c.translate(x,y);c.scale(s*dir,s);c.lineJoin='round';c.lineCap='round';
  // сияние редкой вещи под ногами
  if(rc&&(tc>=4||L.glow)){const g=c.createRadialGradient(0,9,1,0,9,20);g.addColorStop(0,rc+'99');g.addColorStop(1,rc+'00');c.fillStyle=g;c.beginPath();c.ellipse(0,9,20,8,0,0,7);c.fill();
    for(let i=0;i<5;i++){const q=((t*0.6+i/5)%1);c.fillStyle=rc;c.globalAlpha=1-q;c.beginPath();c.arc(-10+i*5,10-q*26,0.9,0,7);c.fill()}c.globalAlpha=1}
  // плащ сзади (ярус 3+)
  if(tc>=3){const cap=cl==='warrior'?(tc>=4?'#3a2a6a':'#8a2a1a'):cl==='archer'?(tc>=4?'#173f36':'#2f6a3a'):(tc>=4?'#140e36':'#2a1a58');
    hp(()=>{c.moveTo(-7,-6);c.lineTo(6,-6);c.lineTo(5,12);c.quadraticCurveTo(-5,14.5,-13,11.5);c.closePath()},cap);
    if(rc){c.strokeStyle=rc;c.lineWidth=0.9;c.beginPath();c.moveTo(5,11.5);c.quadraticCurveTo(-5,14,-12.5,11);c.stroke()}}
  // колчан у лучника
  if(cl==='archer'){c.save();c.translate(-6,-3);c.rotate(-0.35);hp(()=>c.roundRect(-3,-9,6,15,2),tc>=3?'#3a2a14':'#6b4a2c');c.fillStyle='#e8e0cc';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-2+i*2,-9);c.lineTo(-3+i*2,-13);c.lineTo(-1+i*2,-13);c.fill()}c.restore()}
  // оружие за спиной не носим — оно в руке (рисуется в конце)
  // ноги
  const robe=cl==='mage'&&tc>=1;
  const bare=tl<0,lc=bare?SKIN:ln.legs[tl],boot=bare?'#e8b890':tl===0?'#3a2616':tl>=3&&cl==='warrior'?'#9aa3aa':'#2a1a0e';
  for(const lx of [-5,1]){hp(()=>c.roundRect(lx,3.5,4.2,9,1.6),lc);
    if(tl>=1)hp(()=>c.roundRect(lx-0.5,9.6,5.2,3,1.2),boot,0.8);else if(!bare)hp(()=>c.roundRect(lx-0.3,10.4,4.8,2.2,1),boot,0.7);else hp(()=>c.ellipse(lx+2.6,11.8,2.8,1.3,0,0,7),boot,0.7);
    if(cl==='warrior'&&tl>=2)hp(()=>c.arc(lx+2.1,6.5,1.6,0,7),tl>=3?'#f4c766':'#5a5f66',0.6);
    if(tl>=4&&rc){c.fillStyle=rc;c.fillRect(lx+0.6,4.6,3,1)}}
  // тело
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
  // руки и плечи
  const sl=tc<0?SKIN:tc===0?'#d8c8a4':cc;
  hp(()=>c.ellipse(-8,0,2.6,4,0.2,0,7),sl,.9);
  if(cl==='warrior'&&tc>=2){const pc=tc>=3?cc:'#7c858c';for(const sx of [-7.5,7.5]){hp(()=>c.arc(sx,-4.5,4.6,Math.PI,0),pc,1);if(tc>=3){c.strokeStyle=tc>=4&&rc?rc:'#f4c766';c.lineWidth=0.8;c.beginPath();c.arc(sx,-4.5,4.6,Math.PI,0);c.stroke()}
    if(tc>=4)for(const d of [-2,2])hp(()=>{c.moveTo(sx+d-1.2,-8.4);c.lineTo(sx+d*1.4,-13);c.lineTo(sx+d+1.2,-8.4);c.closePath()},'#cfd8de',0.6)}}
  if(cl==='mage'&&tc>=3)for(const sx of [-7,7])hp(()=>{c.arc(sx,-4.5,3.4,Math.PI,0);c.closePath()},'#cfd8e6',0.8);
  if(cl==='archer'&&tc>=3)hp(()=>{c.moveTo(4,-6);c.quadraticCurveTo(9,-9,12,-4);c.quadraticCurveTo(8,-4,4,-2);c.closePath()},tc>=4?'#3aa88a':'#5fc98a',0.8);
  hp(()=>c.ellipse(8,0,2.6,4,-0.2,0,7),sl,.9);
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
  // кисть
  hp(()=>c.arc(8.6,3,2.4,0,7),SKIN,.9);
  // оружие в руке
  const wt=L.wt|0;
  if(wt<0){/* без оружия — кулак */}
  else if(cl==='warrior'){c.save();c.translate(8.6,3);c.rotate(0.42);
    c.strokeStyle=HO;c.lineWidth=3.6;c.beginPath();c.moveTo(0,6);c.lineTo(0,-20-wt*2);c.stroke();c.strokeStyle=wt>=3?'#3a2416':'#7a5230';c.lineWidth=2.2;c.beginPath();c.moveTo(0,6);c.lineTo(0,-20-wt*2);c.stroke();
    const top=-20-wt*2,bc=wt>=3?'#7ec8ff':wt>=2?'#d8dde2':'#a8b0b6',w=4+wt*1.6,hh=5+wt*1.8;
    hp(()=>{c.moveTo(0,top+1);c.lineTo(w,top-hh/2);c.quadraticCurveTo(w+3,top+2,w,top+hh);c.lineTo(0,top+4);c.closePath()},bc);
    if(wt>=2)hp(()=>{c.moveTo(0,top+1);c.lineTo(-w*0.8,top-hh/2.5);c.quadraticCurveTo(-w-2,top+2,-w*0.8,top+hh*0.8);c.lineTo(0,top+4);c.closePath()},bc);
    if(wt>=3){c.strokeStyle='#ffffff';c.lineWidth=0.8;c.beginPath();c.moveTo(w-1,top-2);c.lineTo(w-3,top+2);c.lineTo(w-1,top+5);c.stroke()}
    c.restore()}
  if(wt>=0&&cl==='mage'){const sx=11.5;c.strokeStyle=HO;c.lineWidth=3.6;c.beginPath();c.moveTo(sx,13);c.quadraticCurveTo(sx+(wt?0:1.5),-6,sx,-24);c.stroke();c.strokeStyle=wt===0?'#8a6a3a':wt>=3?'#3a2a5a':'#6b4a2c';c.lineWidth=2.2;c.beginPath();c.moveTo(sx,13);c.quadraticCurveTo(sx+(wt?0:1.5),-6,sx,-24);c.stroke();
    if(wt===0){hp(()=>c.ellipse(sx-1,-24,2.2,1.6,0.4,0,7),'#7a5a32',0.8);hp(()=>c.ellipse(sx+2.5,-19,2,1,0.8,0,7),'#5a8a3a',0.6)}
    else{const oc=['','#7ec8ff','#9affc8','#c8a0ff'][wt],R=3+wt;const g=c.createRadialGradient(sx,-27,1,sx,-27,R*2.6);g.addColorStop(0,oc+'cc');g.addColorStop(1,oc+'00');c.fillStyle=g;c.beginPath();c.arc(sx,-27,R*2.6,0,7);c.fill();
      if(wt>=2){c.strokeStyle='#cfd8de';c.lineWidth=1.2;c.beginPath();c.arc(sx,-27,R+2,0,7);c.stroke()}
      hp(()=>c.arc(sx,-27,R,0,7),oc,0.9);c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.arc(sx-1.3,-28.4,1.3,0,7);c.fill()}}
  if(wt>=0&&cl==='archer'){const bx=12,bh=13+wt*2.5,bc=['#8a6a3a','#6b4a2c','#4a3420','#d8c050'][wt];
    c.strokeStyle=HO;c.lineWidth=3.6;c.beginPath();c.moveTo(bx-2,-bh);c.quadraticCurveTo(bx+7,0,bx-2,bh);c.stroke();c.strokeStyle=bc;c.lineWidth=2.2;c.beginPath();c.moveTo(bx-2,-bh);c.quadraticCurveTo(bx+7,0,bx-2,bh);c.stroke();
    c.strokeStyle='#e8e0cc';c.lineWidth=0.6;c.beginPath();c.moveTo(bx-2,-bh);c.lineTo(bx-2,bh);c.stroke();
    if(wt>=3){c.strokeStyle='#9affc8';c.lineWidth=0.8;for(let i=0;i<3;i++){c.beginPath();c.arc(bx+3,-6+i*6,2,0,3);c.stroke()}}}
  c.restore()}

