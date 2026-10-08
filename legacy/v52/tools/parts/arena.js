/* ================= АРЕНЫ БОССОВ ================= */
const ARENA_R = 170;   // радиус арены босса
const LEASH = 300;     // насколько далеко от своего места гонится обычный мертвец
const lairOf = z => lairs.find(l=>l.zone===z.boss);
function decorateArenas(){
  for(const l of lairs){
    const r=mulberry(((S.seed||4242)*31+l.zone*977)|0),d=[];
    for(let i=0;i<26;i++){const a=r()*6.283,rr=30+r()*(ARENA_R-40);d.push({x:l.x+Math.cos(a)*rr,y:l.y+Math.sin(a)*rr,s:r(),a:r()*6.283})}
    l.deco=d;
  }
}
function drawArena(l,now){
  const b=CFG.bosses[l.zone],sk=b.skin,alive=!S.bosses[l.zone],x=l.x,y=l.y,R=ARENA_R,t=now/1000;
  const ground={slime:'rgba(60,90,40,.55)',treant:'rgba(40,52,28,.6)',hydra:'rgba(40,52,52,.6)',croc:'rgba(30,44,34,.5)',dragon:'rgba(52,34,28,.7)',golem:'rgba(48,46,44,.7)',lich:'rgba(28,34,32,.7)'}[sk];
  const g=ctx.createRadialGradient(x,y,R*0.3,x,y,R);g.addColorStop(0,ground);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
  const D=l.deco||[];
  if(sk==='slime'){
    for(const p of D.slice(0,12)){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);const s=9+p.s*9;
      ctx.fillStyle=p.s>0.5?'#3f6a2a':'#4f7f32';ctx.beginPath();ctx.ellipse(0,0,s,s*0.7,0,0,7);ctx.fill();
      ctx.strokeStyle='rgba(20,40,14,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);for(let k=-1;k<=1;k+=2){ctx.moveTo(-s*0.3,0);ctx.lineTo(0,k*s*0.5);ctx.moveTo(s*0.3,0);ctx.lineTo(s*0.6,k*s*0.45)}ctx.stroke();ctx.restore()}
    for(const p of D.slice(12,18)){ctx.fillStyle='rgba(140,220,100,.35)';ctx.beginPath();ctx.ellipse(p.x,p.y,10+p.s*12,6+p.s*6,p.a,0,7);ctx.fill()}
    for(const p of D.slice(18,24)){ctx.fillStyle='#e8e2d2';ctx.fillRect(p.x-1.5,p.y-4,3,6);ctx.fillStyle=p.s>0.5?'#c0392b':'#b8862e';ctx.beginPath();ctx.ellipse(p.x,p.y-5,5,3,0,Math.PI,0);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(p.x-2,p.y-7,1.5,1.5)}
  }else if(sk==='treant'){
    ctx.strokeStyle='rgba(70,50,30,.7)';ctx.lineWidth=4;ctx.lineCap='round';
    for(let k=0;k<9;k++){const a=k/9*6.283+0.3;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*30,y+Math.sin(a)*30);ctx.quadraticCurveTo(x+Math.cos(a+0.3)*R*0.5,y+Math.sin(a+0.3)*R*0.5,x+Math.cos(a)*R*0.85,y+Math.sin(a)*R*0.85);ctx.stroke()}
    for(const p of D.slice(0,6)){ctx.fillStyle='#5a3e26';ctx.beginPath();ctx.ellipse(p.x,p.y,9,6,0,0,7);ctx.fill();ctx.strokeStyle='#8a6a43';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y-1,5,3,0,0,7);ctx.stroke()}
    for(const p of D.slice(6,8)){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle='#4a3420';ctx.fillRect(-26,-6,52,12);ctx.fillStyle='#8a6a43';ctx.beginPath();ctx.ellipse(26,0,4,6,0,0,7);ctx.fill();ctx.restore()}
    for(const p of D.slice(8,20)){ctx.fillStyle=`rgba(160,230,120,${0.25+0.25*Math.sin(t*2+p.a*5)})`;ctx.fillRect(p.x,p.y-6*Math.sin(t+p.a),2,2)}
  }else if(sk==='hydra'){
    ctx.fillStyle='#1e4048';ctx.beginPath();ctx.ellipse(x,y+10,R*0.42,R*0.3,0,0,7);ctx.fill();
    ctx.fillStyle='#2a5a64';ctx.beginPath();ctx.ellipse(x-10,y+4,R*0.3,R*0.2,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(180,230,230,.18)';ctx.lineWidth=1.5;for(let k=0;k<3;k++){const q=(t*0.4+k/3)%1;ctx.globalAlpha=1-q;ctx.beginPath();ctx.ellipse(x,y+10,R*0.1+q*R*0.3,R*0.07+q*R*0.2,0,0,7);ctx.stroke()}ctx.globalAlpha=1;
    for(const p of D.slice(0,12)){const dd=dist(p.x,p.y,x,y);if(dd<R*0.45)continue;ctx.fillStyle=p.s>0.5?'#5f6670':'#4a5058';ctx.beginPath();ctx.ellipse(p.x,p.y,6+p.s*7,4+p.s*4,p.a,0,7);ctx.fill()}
    ctx.strokeStyle='#4d6a3a';ctx.lineWidth=1.6;for(const p of D.slice(12,22)){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-2,p.y-11);ctx.moveTo(p.x+3,p.y);ctx.lineTo(p.x+4,p.y-9);ctx.stroke()}
  }else if(sk==='croc'){
    for(const p of D.slice(0,4)){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle='#3e2c1b';ctx.fillRect(-22,-5,44,10);ctx.fillStyle='rgba(30,54,58,.7)';ctx.fillRect(-22,1,44,5);ctx.restore()}
    for(const p of D.slice(4,12)){ctx.strokeStyle='#e0d8c4';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(p.x-6,p.y);ctx.lineTo(p.x+6,p.y);ctx.stroke();ctx.fillStyle='#e0d8c4';for(const s of [-1,1]){ctx.beginPath();ctx.arc(p.x+s*6,p.y-1.5,1.8,0,7);ctx.arc(p.x+s*6,p.y+1.5,1.8,0,7);ctx.fill()}}
    ctx.strokeStyle='#4d6a3a';ctx.lineWidth=1.6;for(const p of D.slice(12,24)){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-2,p.y-12);ctx.moveTo(p.x+3,p.y);ctx.lineTo(p.x+4,p.y-9);ctx.stroke();ctx.fillStyle='#6b5233';ctx.fillRect(p.x-3,p.y-15,3,5)}
  }else if(sk==='dragon'){
    // вулкан
    const vx=x-R*0.42,vy=y-R*0.3;
    ctx.fillStyle='#3a2820';ctx.beginPath();ctx.moveTo(vx-58,vy+34);ctx.lineTo(vx-14,vy-30);ctx.lineTo(vx+14,vy-30);ctx.lineTo(vx+58,vy+34);ctx.fill();
    ctx.fillStyle='#2a1c16';ctx.beginPath();ctx.moveTo(vx+4,vy-30);ctx.lineTo(vx+14,vy-30);ctx.lineTo(vx+58,vy+34);ctx.lineTo(vx+20,vy+34);ctx.fill();
    ctx.fillStyle=`rgba(255,${110+Math.sin(t*4)*40},40,.95)`;ctx.beginPath();ctx.ellipse(vx,vy-30,14,5,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,120,40,.9)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(vx-4,vy-27);ctx.quadraticCurveTo(vx-14,vy,vx-26,vy+30);ctx.stroke();
    for(let k=0;k<4;k++){const q=(t*0.6+k/4)%1;ctx.fillStyle=`rgba(90,80,76,${0.5*(1-q)})`;ctx.beginPath();ctx.arc(vx+Math.sin(q*5+k)*6,vy-36-q*50,6+q*12,0,7);ctx.fill()}
    ctx.strokeStyle=`rgba(255,${120+Math.sin(t*3)*50},50,.75)`;ctx.lineWidth=2;
    for(const p of D.slice(0,7)){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.a)*18,p.y+Math.sin(p.a)*10);ctx.lineTo(p.x+Math.cos(p.a+0.6)*30,p.y+Math.sin(p.a+0.6)*16);ctx.stroke()}
    for(const p of D.slice(7,16)){ctx.fillStyle='#1c1614';ctx.beginPath();ctx.moveTo(p.x-6,p.y+4);ctx.lineTo(p.x-2,p.y-6);ctx.lineTo(p.x+5,p.y-3);ctx.lineTo(p.x+7,p.y+4);ctx.fill()}
    {const p=D[16];if(p){ctx.fillStyle='#e0d8c4';ctx.beginPath();ctx.arc(p.x,p.y,6,0,7);ctx.fill();ctx.fillStyle='#1c1614';ctx.fillRect(p.x-3,p.y-2,2,2);ctx.fillRect(p.x+1,p.y-2,2,2)}}
  }else if(sk==='golem'){
    for(const p of D.slice(0,10)){ctx.fillStyle='#141218';ctx.beginPath();ctx.moveTo(p.x,p.y-10-p.s*8);ctx.lineTo(p.x+5,p.y+3);ctx.lineTo(p.x-4,p.y+3);ctx.fill();ctx.fillStyle='rgba(120,110,160,.35)';ctx.beginPath();ctx.moveTo(p.x,p.y-10-p.s*8);ctx.lineTo(p.x+2,p.y);ctx.lineTo(p.x-1,p.y);ctx.fill()}
    for(const p of D.slice(10,14)){ctx.fillStyle='#3a3632';ctx.beginPath();ctx.arc(p.x,p.y,8,0,7);ctx.fill();drawFire(p.x,p.y+2,0.35,now)}
    for(const p of D.slice(14,26)){ctx.fillStyle=`rgba(255,${130+Math.sin(t*5+p.a*9)*60},40,${0.5+0.4*Math.sin(t*3+p.a*7)})`;ctx.fillRect(p.x,p.y,2,2)}
  }else if(sk==='lich'){
    for(const p of D.slice(0,10)){const cross=p.s>0.6;ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(p.x-6,p.y+2,14,4);
      if(cross){ctx.fillStyle='#6a6862';ctx.fillRect(p.x-1.5,p.y-14,3,16);ctx.fillRect(p.x-6,p.y-10,12,3)}
      else{ctx.fillStyle='#6a6862';ctx.beginPath();ctx.moveTo(p.x-6,p.y+2);ctx.lineTo(p.x-6,p.y-8);ctx.quadraticCurveTo(p.x,p.y-15,p.x+6,p.y-8);ctx.lineTo(p.x+6,p.y+2);ctx.fill();ctx.fillStyle='#4f4d48';ctx.fillRect(p.x-3,p.y-6,6,1.5)}}
    for(const p of D.slice(10,16)){ctx.fillStyle='rgba(220,210,190,.5)';ctx.fillRect(p.x-5,p.y,10,2);ctx.fillRect(p.x-2,p.y-3,2,6)}
    for(const p of D.slice(16,24)){ctx.fillStyle=`rgba(120,230,150,${0.08+0.06*Math.sin(t+p.a*4)})`;ctx.beginPath();ctx.ellipse(p.x+Math.sin(t*0.5+p.a)*10,p.y,30,12,0,0,7);ctx.fill()}
  }
  // граница арены
  if(alive){
    const pin=dist(P.x,P.y,x,y)<ARENA_R+10&&!DG;
    ctx.strokeStyle=pin?`rgba(230,80,60,${0.55+0.3*Math.sin(t*6)})`:'rgba(207,75,63,.3)';ctx.lineWidth=pin?3:2;ctx.setLineDash([8,10]);
    ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.stroke();ctx.setLineDash([]);
    if(!pin&&Math.abs(P.x-x)<420&&dist(P.x,P.y,x,y)<420)labels.push(()=>{ctx.font='600 12px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(`Логово: ${b.name}`,x+1,y-R-7);ctx.fillStyle='#f2b8b0';ctx.fillText(`Логово: ${b.name}`,x,y-R-8)});
  }
}
