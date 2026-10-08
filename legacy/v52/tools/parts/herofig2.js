function heroFig(c,cl,x,y,s=1,dir=1,set={},t=0){const hp=(fn,fill,lw=1.1)=>{c.beginPath();fn();c.fillStyle=fill;c.fill();c.strokeStyle=HO;c.lineWidth=lw;c.stroke()};c.save();c.translate(x,y);c.scale(s*dir,s);c.lineJoin='round';c.lineCap='round';
  const skin='#f2c9a0',A=set.armor,H=set.head,L=set.legs;
  // полный комплект: сияние под ногами
  if(A&&A===H&&H===L){const col=SETC[A],g=c.createRadialGradient(0,8,1,0,8,20);g.addColorStop(0,col+'88');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.ellipse(0,9,20,8,0,0,7);c.fill();
    for(let i=0;i<5;i++){const q=((t*0.6+i/5)%1);c.fillStyle=col;c.globalAlpha=1-q;c.beginPath();c.arc(-10+i*5,10-q*26,0.9,0,7);c.fill()}c.globalAlpha=1}
  // плащ / колчан сзади
  if(A==='warrior'){hp(()=>{c.moveTo(-7,-6);c.lineTo(6,-6);c.lineTo(4,12);c.quadraticCurveTo(-5,14,-13,11);c.closePath()},'#8a2a1a');c.strokeStyle='#f4c766';c.lineWidth=0.8;c.beginPath();c.moveTo(4,11.5);c.quadraticCurveTo(-5,13.5,-12.5,10.5);c.stroke()}
  else if(A==='archer'){hp(()=>{c.moveTo(-6,-6);c.lineTo(5,-6);c.lineTo(2,11);c.lineTo(-1,9);c.lineTo(-4,12);c.lineTo(-7,9);c.lineTo(-10,11);c.lineTo(-11,8);c.closePath()},'#2f6a3a');c.save();c.translate(-6,-3);c.rotate(-0.35);hp(()=>c.roundRect(-3,-9,6,15,2),'#5a3a1c');c.fillStyle='#d8c050';c.fillRect(-3,-3,6,1.6);c.fillStyle='#e8e0cc';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-2+i*2,-9);c.lineTo(-3+i*2,-13);c.lineTo(-1+i*2,-13);c.fill()}c.restore()}
  else if(A==='mage'){hp(()=>{c.moveTo(-7,-7);c.lineTo(6,-7);c.lineTo(9,12);c.quadraticCurveTo(0,15,-12,12);c.closePath()},'#1e1850')}
  else{if(cl==='warrior')hp(()=>{c.moveTo(-6,-5);c.lineTo(5,-5);c.lineTo(3,10);c.quadraticCurveTo(-4,12,-11,9);c.closePath()},'#7a2a20');
    if(cl==='archer'){c.save();c.translate(-6,-3);c.rotate(-0.35);hp(()=>c.roundRect(-3,-9,6,15,2),'#6b4a2c');c.fillStyle='#e8e0cc';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-2+i*2,-9);c.lineTo(-3+i*2,-13);c.lineTo(-1+i*2,-13);c.fill()}c.restore();hp(()=>{c.moveTo(-6,-5);c.lineTo(5,-5);c.lineTo(2,9);c.quadraticCurveTo(-5,11,-10,8);c.closePath()},'#24401f')}}
  // ноги
  if(L==='warrior'){for(const lx of [-5,1]){hp(()=>c.roundRect(lx,3.5,4.4,9,1.6),'#5a5f66');hp(()=>c.arc(lx+2.2,6.5,1.7,0,7),'#f4c766',0.7);hp(()=>c.roundRect(lx-0.6,10,5.6,2.6,1.2),'#c9b48a',0.7)}}
  else if(L==='archer'){for(const lx of [-5,1]){hp(()=>c.roundRect(lx,3.5,4,9,1.6),'#4a3a22');c.strokeStyle='#2f6a3a';c.lineWidth=1.1;for(let k=0;k<2;k++){c.beginPath();c.moveTo(lx,5+k*2.4);c.lineTo(lx+4,6+k*2.4);c.stroke()}hp(()=>{c.moveTo(lx+0.5,8.5);c.quadraticCurveTo(lx+2,6.5,lx+3.6,8.5);c.quadraticCurveTo(lx+2,10,lx+0.5,8.5)},'#5fc98a',0.6);hp(()=>c.roundRect(lx-0.4,10.4,4.8,2.4,1),'#2a1a0e',0.7);c.fillStyle='#d8c050';c.fillRect(lx+1.2,10.8,1.6,1)}}
  else if(L==='mage'){/* подол рисуется вместе с мантией */}
  else if(cl!=='mage'){const boot=cl==='warrior'?'#4c5257':'#3a2616';hp(()=>c.roundRect(-5,4,4,8,1.6),boot);hp(()=>c.roundRect(1,4,4,8,1.6),boot)}
  // тело
  const tor=()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(8,6);c.quadraticCurveTo(0,8.5,-8,6);c.closePath()};
  const robe=(col,trim)=>{hp(()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(10,11);c.quadraticCurveTo(0,14,-10,11);c.closePath()},col)};
  if(L==='mage'||(cl==='mage'&&!A&&!L)||A==='mage'){
    // мантия (основа) — подол Чародея светится рунами
    const body=A==='mage'?'#2a2060':'#4a2f78';robe(L==='mage'?'#2a2060':body);
    if(L==='mage'){c.save();c.beginPath();c.moveTo(-10,11);c.quadraticCurveTo(0,14,10,11);c.lineTo(9,6);c.quadraticCurveTo(0,8.5,-9,6);c.closePath();c.fillStyle='#3a2f8a';c.fill();c.restore();c.strokeStyle='#cfd8e6';c.lineWidth=1.2;c.beginPath();c.moveTo(-9.6,10.6);c.quadraticCurveTo(0,13.6,9.6,10.6);c.stroke();
      for(let i=0;i<4;i++){const gx=-6+i*4,g=c.createRadialGradient(gx,9.4,0.2,gx,9.4,2.6);g.addColorStop(0,'rgba(170,220,255,.95)');g.addColorStop(1,'rgba(170,220,255,0)');c.fillStyle=g;c.beginPath();c.arc(gx,9.4,2.6,0,7);c.fill()}
      for(const fx of [-4,3])hp(()=>{c.moveTo(fx,12);c.quadraticCurveTo(fx+3,11,fx+5,12.8);c.lineTo(fx,13.2);c.closePath()},'#cfd8e6',0.6)}
    if(A!=='mage'&&cl==='mage'){c.strokeStyle='#f4c766';c.lineWidth=1.3;c.beginPath();c.moveTo(1,-6);c.lineTo(1.5,7);c.stroke();c.fillStyle='#f4c766';c.beginPath();for(let i=0;i<10;i++){const r=i%2?1.1:2.6,a=i*Math.PI/5-Math.PI/2;c.lineTo(-4+Math.cos(a)*r,2+Math.sin(a)*r)}c.fill()}}
  if(A==='warrior'){hp(tor,'#5a5f66',1.2);hp(()=>{c.moveTo(-2,-6.5);c.lineTo(3,-6.5);c.lineTo(3.5,7.5);c.lineTo(-2.5,7.5);c.closePath()},'#d9784a',0.8);hp(()=>c.arc(0.5,-1,2.4,0,7),'#f4c766',0.7);c.fillStyle='#5a3010';c.beginPath();c.moveTo(-0.6,-1.8);c.lineTo(0.5,-3);c.lineTo(1.6,-1.8);c.lineTo(0.5,0.6);c.fill();
    c.fillStyle='rgba(255,255,255,.25)';c.fillRect(-6,-4,1.6,8);hp(()=>c.rect(-8,4,16,2.6),'#3a2416',.8);hp(()=>c.rect(-1.4,3.8,2.8,3),'#f4c766',.6);
    hp(()=>{c.moveTo(-7.5,-6);c.quadraticCurveTo(0,-10,7.5,-6);c.quadraticCurveTo(0,-4,-7.5,-6)},'#c9b48a',0.8)}
  else if(A==='archer'){hp(tor,'#3a5a32',1.1);c.save();c.beginPath();tor();c.clip();for(let r=0;r<4;r++)for(let k=0;k<5;k++){const lx=-8+k*4+(r%2)*2,ly=-5+r*3.4;hp(()=>{c.moveTo(lx,ly);c.quadraticCurveTo(lx+2,ly+3,lx+4,ly);c.quadraticCurveTo(lx+2,ly+1.4,lx,ly)},r%2?'#5fc98a':'#4aa870',0.5)}c.restore();c.strokeStyle='#5a3a1c';c.lineWidth=1.7;c.beginPath();c.moveTo(-6,-5);c.lineTo(7,4);c.stroke();hp(()=>c.rect(-8,3.6,16,2.4),'#5a3a1c',.7);c.fillStyle='#d8c050';c.beginPath();c.ellipse(3,0.6,1.4,0.9,0.6,0,7);c.fill()}
  else if(A==='mage'){c.save();c.beginPath();c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(8,6);c.quadraticCurveTo(0,8.5,-8,6);c.closePath();c.clip();c.fillStyle='#3a2f8a';c.fillRect(-3,-8,7,16);c.restore();
    c.fillStyle='#cfd8e6';for(const [sx,sy,r] of [[-5,-1,1.2],[5,2,1],[-4,4,0.8]]){c.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*0.4:r,a=i*Math.PI/4;c.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr)}c.fill()}
    const g=c.createLinearGradient(-8,4,8,4);g.addColorStop(0,'#7ec8ff');g.addColorStop(1,'#b48aff');hp(()=>c.rect(-8,3.6,16,2.2),g,.6);
    hp(()=>{c.moveTo(-7,-5);c.lineTo(-9,-11);c.lineTo(-3,-7.5);c.closePath()},'#3a2f8a',0.7);hp(()=>{c.moveTo(7,-5);c.lineTo(9,-11);c.lineTo(3,-7.5);c.closePath()},'#3a2f8a',0.7)}
  else if(cl==='warrior'){hp(tor,'#a8452a');hp(()=>{c.moveTo(-5,-5);c.quadraticCurveTo(0,-7,5,-5);c.lineTo(5.5,3);c.quadraticCurveTo(0,5,-5.5,3);c.closePath()},'#9aa3aa');c.fillStyle='rgba(255,255,255,.45)';c.fillRect(1,-4,1.6,6);hp(()=>c.rect(-8,3.5,16,2.6),'#4a3020',.8);c.fillStyle='#f4c766';c.fillRect(-1.2,3.5,2.4,2.6)}
  else if(cl==='archer'){hp(tor,'#3e6a3a');hp(()=>{c.moveTo(-6,-5);c.lineTo(-2,-6);c.lineTo(0,6.5);c.lineTo(-7,5.5);c.closePath()},'#6b4a2c',.8);c.strokeStyle='#3a2616';c.lineWidth=1.6;c.beginPath();c.moveTo(-6,-5);c.lineTo(7,4);c.stroke()}
  else if(cl==='mage'&&A!=='mage'){/* мантия выше */}
  // плечи / руки
  const sl=A==='warrior'?'#5a5f66':A==='archer'?'#3a5a32':A==='mage'?'#2a2060':({warrior:'#a8452a',mage:'#4a2f78',archer:'#3e6a3a'}[cl]||'#b8402a');
  hp(()=>c.ellipse(-8,0,2.6,4,0.2,0,7),sl,.9);
  if(A==='warrior')for(const sx of [-7.5,7.5]){hp(()=>c.arc(sx,-4.5,4.8,Math.PI,0),'#5a5f66',1);c.strokeStyle='#f4c766';c.lineWidth=0.8;c.beginPath();c.arc(sx,-4.5,4.8,Math.PI,0);c.stroke();for(const d of [-2,2])hp(()=>{c.moveTo(sx+d-1.2,-8.4);c.lineTo(sx+d*1.4,-13);c.lineTo(sx+d+1.2,-8.4);c.closePath()},'#cfd8de',0.6)}
  else if(A==='archer')hp(()=>{c.moveTo(4,-6);c.quadraticCurveTo(9,-9,12,-4);c.quadraticCurveTo(8,-4,4,-2);c.closePath()},'#5fc98a',0.8);
  else if(A==='mage')for(const sx of [-7,7]){hp(()=>{c.arc(sx,-4.5,3.6,Math.PI,0);c.closePath()},'#cfd8e6',0.8)}
  else if(cl==='warrior')for(const sx of [-7,7])hp(()=>c.arc(sx,-4,3.8,Math.PI,0),'#b8c0c6',.9);
  hp(()=>c.ellipse(8,0,2.6,4,-0.2,0,7),sl,.9);hp(()=>c.arc(8.6,3,2.4,0,7),skin,.9);
  // голова
  const hood=H==='archer'||(!H&&cl==='archer');
  if(hood){const hc=H==='archer'?'#2f6a3a':'#2f4f2a';hp(()=>{c.arc(0,-12,8.6,0,7)},hc);hp(()=>{c.moveTo(-5,-19);c.quadraticCurveTo(-9,-24,-12,-23);c.quadraticCurveTo(-9,-18,-8,-13);c.closePath()},hc)}
  hp(()=>hood?c.ellipse(2,-11,5.3,5.6,0,0,7):c.arc(0,-12,7.5,0,7),skin);
  if(hood){c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(2,-15,5.3,2.2,0,0,7);c.fill()}
  if(cl==='warrior')hp(()=>{c.moveTo(-1,-10);c.quadraticCurveTo(3,-8,7,-10);c.quadraticCurveTo(7,-4,3.5,-2);c.quadraticCurveTo(0,-4,-1,-10)},'#c8742a',.9);
  if(cl==='mage')hp(()=>{c.moveTo(-1.5,-10);c.quadraticCurveTo(3,-8.5,7.2,-10);c.quadraticCurveTo(7,-2,3,3);c.quadraticCurveTo(0,-3,-1.5,-10)},'#ece6df',.9);
  const eyeC=cl==='mage'?'#3a6fa8':HO;for(const ex of [2.2,5.4]){c.fillStyle=eyeC;c.beginPath();c.ellipse(ex,-12.5,1.05,1.5,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ex+.35,-13,.4,0,7);c.fill()}
  if(!hood){c.fillStyle='rgba(230,110,90,.35)';c.beginPath();c.arc(6.3,-10.3,1.3,0,7);c.fill()}
  // головные уборы
  if(H==='warrior'){for(const sx of [-1,1]){hp(()=>{c.moveTo(sx*6,-15);c.quadraticCurveTo(sx*15,-15,sx*15,-28);c.quadraticCurveTo(sx*11,-21,sx*4,-19);c.closePath()},'#ece2c8',1);hp(()=>{c.moveTo(sx*15,-28);c.lineTo(sx*14.2,-24);c.lineTo(sx*12.6,-25.4);c.closePath()},'#f4c766',0.6)}
    hp(()=>{c.moveTo(-2,-21);c.quadraticCurveTo(-8,-30,-15,-26);c.quadraticCurveTo(-9,-24,1,-20);c.closePath()},'#d9784a',0.8);
    hp(()=>{c.arc(0,-13,8.4,Math.PI,0);c.lineTo(8.4,-9);c.lineTo(6,-9);c.lineTo(6,-12);c.lineTo(-8.4,-12);c.closePath()},'#5a5f66',1.1);hp(()=>c.rect(-8.8,-14.8,17.6,3),'#f4c766',.8);hp(()=>c.rect(3,-14.5,2.2,6.5),'#f4c766',.7);
    c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(-3,-18,2,0,7);c.fill();for(const rx of [-6,-2,2])hp(()=>c.arc(rx,-13.3,0.6,0,7),'#cfd8de',0.4)}
  else if(H==='mage'){hp(()=>{c.moveTo(-8,-13);c.quadraticCurveTo(-10,-22,-3,-24);c.lineTo(-9,-8);c.closePath()},'#2a2060',0.9);
    hp(()=>{c.moveTo(-7.5,-15.5);c.lineTo(-6,-22);c.lineTo(-3,-17.5);c.lineTo(0,-24.5);c.lineTo(3,-17.5);c.lineTo(6,-22);c.lineTo(7.5,-15.5);c.closePath()},'#cfd8e6',1);hp(()=>c.rect(-7.6,-16.4,15.2,2),'#9aa3c8',.7);
    hp(()=>c.arc(0,-17.4,1.3,0,7),'#7ec8ff',0.6);
    const fy=-31+Math.sin(t*2)*1.5,g=c.createRadialGradient(0,fy,0.5,0,fy,7);g.addColorStop(0,'rgba(190,150,255,.9)');g.addColorStop(1,'rgba(150,110,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,fy,7,0,7);c.fill();
    hp(()=>{c.moveTo(0,fy-4.5);c.lineTo(2.6,fy);c.lineTo(0,fy+4.5);c.lineTo(-2.6,fy);c.closePath()},'#b48aff',0.8);c.fillStyle='#fff';c.fillRect(-0.6,fy-2.4,1.2,2)}
  else if(H==='archer'){hp(()=>{c.moveTo(-0.5,-9.5);c.quadraticCurveTo(3,-8,7.4,-9.6);c.lineTo(7,-6);c.quadraticCurveTo(3,-4,-0.5,-6.5);c.closePath()},'#2a5a32',0.8);
    for(let i=0;i<9;i++){const a=Math.PI*1.05+i/8*Math.PI*0.9,lx=Math.cos(a)*8.6,ly=-12+Math.sin(a)*8.6;hp(()=>c.ellipse(lx,ly,2.8,1.5,a+Math.PI/2,0,7),i%2?'#5fc98a':'#7ae0a0',0.6)}
    hp(()=>{c.moveTo(-6,-19);c.quadraticCurveTo(-12,-28,-9,-33);c.quadraticCurveTo(-8,-26,-4,-20);c.closePath()},'#d8c050',0.7);c.strokeStyle='#8a6a2a';c.lineWidth=0.6;c.beginPath();c.moveTo(-5,-19.5);c.quadraticCurveTo(-9,-26,-9,-32);c.stroke()}
  else if(cl==='warrior'){for(const sx of [-1,1])hp(()=>{c.moveTo(sx*6,-16);c.quadraticCurveTo(sx*12,-17,sx*12,-25);c.quadraticCurveTo(sx*9,-20,sx*4,-19);c.closePath()},'#ece2c8',.9);
    hp(()=>{c.arc(0,-13,8,Math.PI,0);c.lineTo(8,-13);c.lineTo(-8,-13)},'#9aa3aa');hp(()=>c.rect(-8.5,-14.5,17,2.8),'#7c858c',.9);hp(()=>c.rect(3,-14,2,5.5),'#7c858c',.8);c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.arc(-2.5,-17.5,2,0,7);c.fill()}
  else if(cl==='mage'){hp(()=>c.ellipse(0,-16.5,11,2.8,0,0,7),'#2a1a48');hp(()=>{c.moveTo(-6.5,-17);c.quadraticCurveTo(-4,-26,-3,-30);c.quadraticCurveTo(-6,-33,-10,-31);c.quadraticCurveTo(-4,-35,0,-31);c.quadraticCurveTo(3,-24,6.5,-17);c.closePath()},'#4a2f78');hp(()=>c.rect(-6.3,-19.3,12.6,2.4),'#f4c766',.8);c.fillStyle='#f4c766';c.beginPath();c.arc(-1,-25,1.2,0,7);c.fill()}
  c.restore()}
