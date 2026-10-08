/* ================= ВИД И АТАКИ БОССОВ ================= */
function bossAbility(z,dP,dt){
  // возвращает true, если босс в этот кадр занят особым действием
  if(z.skin==='dragon'){
    z.phT=(z.phT??9)-dt;
    if(z.phT<=0){z.fly=!z.fly;z.phT=9;sfx.roar(0.4);addFloat(z.x,z.y-z.r-30,z.fly?'Взлетел! Бей луком':'Приземлился! Бей топором','#f4c766')}
    if(z.fly){
      // кружит над героем и плюётся огнём
      z.orb=(z.orb||0)+dt*0.9;const R=170,tx=P.x+Math.cos(z.orb)*R,ty=P.y+Math.sin(z.orb)*R,d=dist(z.x,z.y,tx,ty);
      if(d>4){z.x+=(tx-z.x)/d*Math.min(d,z.speed*2.2*dt);z.y+=(ty-z.y)/d*Math.min(d,z.speed*2.2*dt)}
      z.abT-=dt;
      if(z.abT<=0&&dP<420){z.abT=1.6;const v=260;spits.push({x:z.x,y:z.y,vx:(P.x-z.x)/dP*v,vy:(P.y-z.y)/dP*v,t:2,dmg:z.dmg,col:'#f08a3a',r:7});sfx.spit()}
      return true;
    }
  }
  if(z.skin==='hydra'||z.final&&z.phase2){
    z.spT=(z.spT??2)-dt;
    if(z.spT<=0&&dP>90&&dP<340){z.spT=z.final?1.4:2.2;const v=230,a=Math.atan2(P.y-z.y,P.x-z.x);
      for(const o of (z.final?[-0.3,-0.1,0.1,0.3]:[-0.12,0.12])){spits.push({x:z.x+Math.cos(a+o*4)*z.r*0.6,y:z.y+Math.sin(a+o*4)*z.r*0.6,vx:Math.cos(a+o)*v,vy:Math.sin(a+o)*v,t:1.8,dmg:Math.ceil(z.dmg*0.6),col:z.final?'#b06ae0':'#5fd0b0',r:5})}sfx.spit()}
  }
  if(z.skin==='treant'){
    // корни: метка под героем, через 1 с бьёт
    z.rtT=(z.rtT??3)-dt;
    if(z.rtT<=0&&dP<300){z.rtT=3.2;roots.push({x:P.x,y:P.y,t:1,dmg:z.dmg*1.4})}
  }
  if(z.final&&!z.phase2&&z.hp<z.max*0.5){z.phase2=true;z.speed*=1.25;sfx.blood();toast('Владыка Мора в ярости! Вторая фаза.','bad')}
  return false;
}
let roots=[];
function updateRoots(dt){
  for(const r of roots){r.t-=dt;if(r.t<=0&&!r.done){r.done=true;sfx.slam();if(dist(r.x,r.y,P.x,P.y)<52)damagePlayer(r.dmg)}}
  roots=roots.filter(r=>r.t>-0.4);
}
function drawRoots(){
  for(const r of roots){
    if(r.t>0){const k=1-r.t;ctx.strokeStyle=`rgba(140,100,50,${0.4+k*0.5})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,52,0,7);ctx.stroke();ctx.fillStyle=`rgba(120,80,40,${0.15+k*0.2})`;ctx.beginPath();ctx.arc(r.x,r.y,52*k,0,7);ctx.fill()}
    else{ctx.strokeStyle='#5a3e26';ctx.lineWidth=4;ctx.lineCap='round';for(let i=0;i<7;i++){const a=i/7*6.28;ctx.beginPath();ctx.moveTo(r.x+Math.cos(a)*8,r.y+Math.sin(a)*8);ctx.lineTo(r.x+Math.cos(a)*40,r.y+Math.sin(a)*40-14);ctx.stroke()}}
  }
}
// может ли этот удар задеть босса (дракон в воздухе — только стрелы, на земле — только ближний бой)
function canHit(z,src){
  if(z.skin!=='dragon')return true;
  if(z.fly&&src==='melee')return false;
  if(!z.fly&&src==='ranged')return false;
  return true;
}
function drawBoss(z,bob){
  const x=z.x,y=z.y+bob,r=z.r,hit=z.hit>0,a=Math.atan2(P.y-z.y,P.x-z.x),t=performance.now()/1000;
  const sk=z.skin;
  const W=hit?'#f0e6d0':null;
  if(sk==='slime'){
    const w=1+Math.sin(t*4)*0.06;
    ctx.fillStyle=W||'rgba(110,190,80,.85)';ctx.beginPath();ctx.ellipse(x,y+r*0.15,r*1.05*w,r*0.85/w,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(160,230,120,.5)';ctx.beginPath();ctx.ellipse(x-r*0.3,y-r*0.25,r*0.35,r*0.22,-0.5,0,7);ctx.fill();
    ctx.fillStyle='rgba(90,160,60,.8)';for(let i=0;i<4;i++){const dx=(i-1.5)*r*0.45;ctx.beginPath();ctx.ellipse(x+dx,y+r*0.85+Math.sin(t*3+i)*3,4,7,0,0,7);ctx.fill()}
    ctx.fillStyle='#1d2a14';for(const s of [-1,1]){ctx.beginPath();ctx.arc(x+s*r*0.3+Math.cos(a)*4,y-r*0.1+Math.sin(a)*3,r*0.13,0,7);ctx.fill()}
    ctx.fillStyle='#f4c766';ctx.beginPath();ctx.moveTo(x-r*0.4,y-r*0.6);for(let i=0;i<5;i++){ctx.lineTo(x-r*0.4+i*r*0.2,y-r*(i%2?0.75:1.0))}ctx.lineTo(x+r*0.4,y-r*0.6);ctx.fill();
  }else if(sk==='treant'){
    ctx.strokeStyle='#4a3420';ctx.lineWidth=7;ctx.lineCap='round';
    for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(x+s*r*0.2,y+r*0.6);ctx.lineTo(x+s*r*0.6,y+r*1.05);ctx.stroke()}
    ctx.fillStyle=W||'#5a3e26';ctx.beginPath();ctx.ellipse(x,y,r*0.6,r*0.95,0,0,7);ctx.fill();
    ctx.strokeStyle='#3a2a18';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-r*0.4+i*r*0.4,y-r*0.6);ctx.lineTo(x-r*0.3+i*r*0.35,y+r*0.6);ctx.stroke()}
    ctx.strokeStyle='#4a3420';ctx.lineWidth=6;const sw=Math.sin(t*2)*0.2;
    for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(x+s*r*0.5,y-r*0.2);ctx.quadraticCurveTo(x+s*r*1.2,y-r*0.4+sw*20*s,x+s*r*1.3,y+r*0.2);ctx.stroke()}
    ctx.fillStyle='#3f6a2a';for(const [dx,dy,rr] of [[0,-1.15,0.8],[-0.55,-0.85,0.5],[0.55,-0.85,0.5]]){ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,rr*r,0,7);ctx.fill()}
    ctx.fillStyle='#57883a';ctx.beginPath();ctx.arc(x-r*0.2,y-r*1.3,r*0.35,0,7);ctx.fill();
    ctx.fillStyle='#f4c766';for(const s of [-1,1]){ctx.beginPath();ctx.arc(x+s*r*0.2,y-r*0.35,3.5,0,7);ctx.fill()}
  }else if(sk==='hydra'){
    ctx.fillStyle=W||'#2f6a5e';ctx.beginPath();ctx.ellipse(x,y+r*0.2,r*0.95,r*0.7,0,0,7);ctx.fill();
    ctx.fillStyle='#3d8a7a';ctx.beginPath();ctx.ellipse(x,y+r*0.05,r*0.6,r*0.35,0,0,7);ctx.fill();
    for(const s of [-1,1]){
      const na=a+s*0.5+Math.sin(t*3+s)*0.15,nx=x+Math.cos(na)*r*1.25,ny=y-r*0.3+Math.sin(na)*r*0.9;
      ctx.strokeStyle=W||'#2f6a5e';ctx.lineWidth=r*0.32;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+s*r*0.3,y-r*0.1);ctx.quadraticCurveTo(x+s*r*0.6,y-r*1.1,nx,ny);ctx.stroke();
      ctx.fillStyle=W||'#3d8a7a';ctx.beginPath();ctx.ellipse(nx,ny,r*0.32,r*0.24,na,0,7);ctx.fill();
      ctx.fillStyle='#d8f0a0';ctx.beginPath();ctx.arc(nx+Math.cos(na+0.6)*r*0.12,ny+Math.sin(na+0.6)*r*0.12-2,2.5,0,7);ctx.fill();
      ctx.fillStyle='#e8e2d2';ctx.beginPath();ctx.moveTo(nx+Math.cos(na)*r*0.3,ny+Math.sin(na)*r*0.3);ctx.lineTo(nx+Math.cos(na+0.4)*r*0.2,ny+Math.sin(na+0.4)*r*0.2);ctx.lineTo(nx+Math.cos(na-0.4)*r*0.2,ny+Math.sin(na-0.4)*r*0.2);ctx.fill();
    }
  }else if(sk==='croc'){
    const ma=z.charge>0?Math.atan2(z.cdy,z.cdx):a;ctx.save();ctx.translate(x,y);ctx.rotate(ma);
    ctx.fillStyle=W||'#3d5a2a';ctx.beginPath();ctx.moveTo(-r*1.8,0);ctx.quadraticCurveTo(-r*1.2,-r*0.3,-r*0.6,-r*0.5);ctx.lineTo(r*0.6,-r*0.45);ctx.lineTo(r*1.6,-r*0.18);ctx.lineTo(r*1.6,r*0.18);ctx.lineTo(r*0.6,r*0.45);ctx.lineTo(-r*0.6,r*0.5);ctx.quadraticCurveTo(-r*1.2,r*0.3,-r*1.8,0);ctx.fill();
    ctx.fillStyle='#2a3f1c';for(let i=0;i<6;i++)ctx.fillRect(-r*1.2+i*r*0.38,-r*0.12,r*0.18,r*0.24);
    const leg=Math.sin(t*10)*r*0.15;ctx.fillStyle=W||'#3d5a2a';for(const [lx,s] of [[-r*0.4,1],[-r*0.4,-1],[r*0.5,1],[r*0.5,-1]]){ctx.beginPath();ctx.ellipse(lx+leg*s,s*r*0.6,r*0.2,r*0.12,0,0,7);ctx.fill()}
    ctx.fillStyle='#e8e2d2';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(r*0.9+i*r*0.14,-r*0.17);ctx.lineTo(r*0.97+i*r*0.14,-r*0.04);ctx.lineTo(r*1.04+i*r*0.14,-r*0.17);ctx.fill()}
    ctx.fillStyle='#f4c766';ctx.beginPath();ctx.arc(r*0.65,-r*0.3,3,0,7);ctx.arc(r*0.65,r*0.3,3,0,7);ctx.fill();
    ctx.restore();
  }else if(sk==='dragon'){
    const fy=z.fly?34+Math.sin(t*3)*4:0,flap=Math.sin(t*(z.fly?9:3))*(z.fly?0.6:0.2);
    if(z.fly){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x,y+r*0.6,r*1.4,r*0.45,0,0,7);ctx.fill()}
    const yy=y-fy;ctx.save();ctx.translate(x,yy);ctx.rotate(a+Math.PI/2);
    ctx.fillStyle=W||'#8a2a24';
    for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*0.3,-r*0.2);ctx.lineTo(s*r*(1.9+flap),-r*(0.9-flap));ctx.lineTo(s*r*(1.6+flap*0.5),r*0.1);ctx.lineTo(s*r*(1.2),r*0.5);ctx.lineTo(s*r*0.3,r*0.4);ctx.fill()}
    ctx.strokeStyle='#5a1a16';ctx.lineWidth=2;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*0.3,-r*0.2);ctx.lineTo(s*r*(1.6+flap*0.5),r*0.1);ctx.stroke()}
    ctx.fillStyle=W||'#b0382e';ctx.beginPath();ctx.ellipse(0,0,r*0.45,r*0.85,0,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(-r*0.2,r*0.7);ctx.quadraticCurveTo(0,r*1.6,r*0.25,r*1.9);ctx.lineTo(r*0.15,r*1.5);ctx.quadraticCurveTo(0,r*1.2,r*0.2,r*0.7);ctx.fill();
    ctx.beginPath();ctx.ellipse(0,-r*0.95,r*0.32,r*0.4,0,0,7);ctx.fill();
    ctx.fillStyle='#e8c070';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*0.15,-r*1.2);ctx.lineTo(s*r*0.32,-r*1.55);ctx.lineTo(s*r*0.25,-r*1.15);ctx.fill()}
    ctx.fillStyle='#f4c766';for(const s of [-1,1]){ctx.beginPath();ctx.arc(s*r*0.13,-r*1.0,3,0,7);ctx.fill()}
    ctx.restore();
    ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle=z.fly?'#9fc3d6':'#f4c766';ctx.fillText(z.fly?'в воздухе — только лук':'на земле — только топор',x,y+r+18);
  }else if(sk==='golem'){
    ctx.fillStyle=W||'#3a3532';
    ctx.fillRect(x-r*0.8,y-r*0.7,r*1.6,r*1.3);ctx.fillRect(x-r*0.45,y-r*1.25,r*0.9,r*0.6);
    for(const s of [-1,1]){ctx.fillRect(x+s*r*0.8-(s>0?0:r*0.45),y-r*0.6,r*0.45,r*1.0)}
    ctx.strokeStyle=`rgba(255,${120+Math.sin(t*5)*40},40,.9)`;ctx.lineWidth=2.5;
    for(const [x1,y1,x2,y2] of [[-0.5,-0.5,0,0],[0,0,0.4,-0.3],[0,0,-0.2,0.5],[0.3,0.2,0.6,0.5]]){ctx.beginPath();ctx.moveTo(x+x1*r,y+y1*r);ctx.lineTo(x+x2*r,y+y2*r);ctx.stroke()}
    ctx.fillStyle='#ffb040';for(const s of [-1,1])ctx.fillRect(x+s*r*0.18-3,y-r*1.0,6,4);
    if(Math.random()<0.3){ctx.fillStyle='rgba(255,140,40,.8)';ctx.fillRect(x+(Math.random()-0.5)*r*1.4,y-r*1.3-Math.random()*10,2,2)}
  }else if(sk==='lich'||sk==='lord'){
    const big=sk==='lord',col=big?'#2a1420':'#24222e';
    const g=ctx.createRadialGradient(x,y,4,x,y,r*1.8);g.addColorStop(0,big?'rgba(200,40,60,.35)':'rgba(120,230,150,.3)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*1.8,0,7);ctx.fill();
    ctx.fillStyle=W||col;ctx.beginPath();ctx.moveTo(x,y-r*0.9);ctx.lineTo(x+r*0.9,y+r*0.9);ctx.lineTo(x-r*0.9,y+r*0.9);ctx.fill();
    ctx.fillStyle='#e6dec9';ctx.beginPath();ctx.arc(x,y-r*0.75,r*0.36,0,7);ctx.fill();
    ctx.fillStyle='#120e10';ctx.fillRect(x-r*0.2,y-r*0.82,r*0.14,r*0.12);ctx.fillRect(x+r*0.06,y-r*0.82,r*0.14,r*0.12);
    ctx.fillStyle=big?'#ff4a3a':'#8cf0a0';ctx.fillRect(x-r*0.17,y-r*0.8,3,3);ctx.fillRect(x+r*0.09,y-r*0.8,3,3);
    ctx.fillStyle='#f4c766';ctx.beginPath();ctx.moveTo(x-r*0.38,y-r*1.0);for(let i=0;i<5;i++)ctx.lineTo(x-r*0.38+i*r*0.19,y-r*(i%2?1.12:1.38));ctx.lineTo(x+r*0.38,y-r*1.0);ctx.fill();
    if(big){ctx.fillStyle='#4a2a30';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(x+s*r*0.3,y-r*1.0);ctx.quadraticCurveTo(x+s*r*0.9,y-r*1.4,x+s*r*0.8,y-r*1.9);ctx.lineTo(x+s*r*0.45,y-r*1.1);ctx.fill()}}
    const sx=x+r*0.85,sy=y-r*0.3;ctx.strokeStyle='#6b4a2c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx,sy+r*1.1);ctx.lineTo(sx,sy-r*0.4);ctx.stroke();
    ctx.fillStyle=big?'#ff6a5a':'#8cf0a0';ctx.beginPath();ctx.arc(sx,sy-r*0.5,5+Math.sin(t*4)*1.5,0,7);ctx.fill();
  }else if(sk==='mimic'){
    const o=Math.abs(Math.sin(t*6))*r*0.35;
    ctx.fillStyle=W||'#6b4a2c';ctx.fillRect(x-r,y-r*0.2,r*2,r*0.9);ctx.fillStyle='#8a6240';ctx.fillRect(x-r,y-r*0.6-o,r*2,r*0.45);
    ctx.fillStyle='#f4c766';ctx.fillRect(x-r,y-r*0.05,r*2,3);
    ctx.fillStyle='#8a1a1a';ctx.fillRect(x-r*0.9,y-r*0.2-o*0.6,r*1.8,o*0.8+2);
    ctx.fillStyle='#e8e2d2';for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x-r*0.85+i*r*0.33,y-r*0.2);ctx.lineTo(x-r*0.7+i*r*0.33,y-r*0.2-o*0.5);ctx.lineTo(x-r*0.55+i*r*0.33,y-r*0.2);ctx.fill()}
  }else{
    ctx.fillStyle=W||CFG.zombies[z.tier].col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
  }
}
