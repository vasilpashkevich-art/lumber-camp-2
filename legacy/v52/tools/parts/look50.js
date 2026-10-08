// v50: новая рисовка мира — земля, деревья, площадь у ратуши, ратуша по уровням, ограда с толщиной, залежи камня.
// Стиль героев: тёмная обводка, 3 тона, мягкие тени. Все функции получают контекст c и рисуют в мировых координатах.
const LOOK=(()=>{
const O='#24180f',SQ=1;// SQ — сжатие кольца лагеря по высоте (в игре круг)
let c=null,NOFX=false;
const use=cc=>{c=cc};
function hp(fn,fill,lw=1.2,stroke=O){c.beginPath();fn();if(fill){c.fillStyle=fill;c.fill()}if(lw){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function rnd(seed){let a=(seed*2654435761)>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function vnoise(seed){const r=rnd(seed),P=[];for(let i=0;i<256;i++)P.push(r());const h=(x,y)=>P[(((x*73856093)^(y*19349663))>>>0)&255];const sm=t=>t*t*(3-2*t);
  return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi),a=h(xi,yi),b=h(xi+1,yi),cc=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*xf+(cc-a)*yf+(a-b-cc+d)*xf*yf}}
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const rgb=(a,k=1)=>`rgb(${Math.max(0,Math.min(255,a[0]*k))|0},${Math.max(0,Math.min(255,a[1]*k))|0},${Math.max(0,Math.min(255,a[2]*k))|0})`;
function shadow(x,y,rx,ry,a=0.28){c.fillStyle=`rgba(0,0,0,${a})`;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()}
function glow(x,y,r,col,a){const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}

// ===================== ЗЕМЛЯ =====================
// цвет земли по краю/зоне; рельеф — светлые склоны на северо-запад, тёмные ложбины
const GROUND={z1:[112,148,66],z2:[52,96,62],z3:[118,108,54],z4:[78,66,80],z5:[40,48,62],z6:[104,92,80],z7:[64,76,72],
  snow:[220,230,238],marsh:[70,92,62],shroom:[82,62,96],waste:[150,84,56],high:[122,118,106],mist:[74,90,92],camp:[110,92,62]};
// тонкий слой деталей поверх цвета: пятна, травинки, крапинки — заранее нарисованная плитка, кладётся узором
const DETAIL={};
function detailTile(kind){if(DETAIL[kind])return DETAIL[kind];
  const S=256,cv=document.createElement('canvas');cv.width=S;cv.height=S;const g=cv.getContext('2d'),r=rnd(kind.length*977+13);
  const blades=!['snow','waste','high','camp','z6','z7','neutral'].includes(kind),dark='rgba(20,30,10,',lite='rgba(255,255,220,';
  for(let i=0;i<70;i++){const x=r()*S,y=r()*S,rr=6+r()*22;g.fillStyle=(r()<0.5?dark:lite)+(0.02+r()*0.025)+')';g.beginPath();g.ellipse(x,y,rr,rr*0.7,r()*3,0,7);g.fill();
    for(const [ox,oy] of [[S,0],[-S,0],[0,S],[0,-S]]){g.beginPath();g.ellipse(x+ox,y+oy,rr,rr*0.7,0,0,7);g.fill()}}
  for(let i=0;i<900;i++){const x=r()*S,y=r()*S;g.fillStyle=(r()<0.55?dark:lite)+(0.06+r()*0.08)+')';g.fillRect(x,y,1.2,1.2)}
  if(blades)for(let i=0;i<260;i++){const x=r()*S,y=r()*S,h=2.5+r()*3.5,dx=(r()-0.5)*2.2;g.strokeStyle=(r()<0.6?dark+'0.22)':lite+'0.18)');g.lineWidth=0.9;g.beginPath();g.moveTo(x,y);g.lineTo(x+dx,y-h);g.stroke()}
  if(kind==='snow')for(let i=0;i<120;i++){g.fillStyle='rgba(150,180,215,.18)';g.beginPath();g.ellipse(r()*S,r()*S,4+r()*8,1.5+r()*2,0.2,0,7);g.fill()}
  if(kind==='high'||kind==='waste')for(let i=0;i<60;i++){g.strokeStyle='rgba(40,25,15,.18)';g.lineWidth=1;g.beginPath();const x=r()*S,y=r()*S;g.moveTo(x,y);g.lineTo(x+(r()-0.5)*16,y+(r()-0.5)*8);g.lineTo(x+(r()-0.5)*24,y+(r()-0.5)*12);g.stroke()}
  return DETAIL[kind]=cv}
// залить прямоугольник землёй: цвет с шумом + рельеф + детали
function ground(x0,y0,w,h,kind,seed=1,K=2){
  const base=GROUND[kind]||GROUND.z1,n1=vnoise(seed+11),n2=vnoise(seed+29),hn=vnoise(seed+57);
  const tw=Math.ceil(w/K),th=Math.ceil(h/K),cv=document.createElement('canvas');cv.width=tw;cv.height=th;const g=cv.getContext('2d'),img=g.createImageData(tw,th),D=img.data;
  for(let py=0;py<th;py++)for(let px=0;px<tw;px++){const wx=x0+px*K,wy=y0+py*K;
    const H=a=>hn(a[0]/260,a[1]/260)+0.5*hn(a[0]/110+7,a[1]/110);const slope=(H([wx-6,wy-6])-H([wx+6,wy+6]))*9;
    const v=1+(n1(wx/140,wy/140)-0.5)*0.09+(n2(wx/30,wy/30)-0.5)*0.05+slope*0.22,dry=Math.max(0,hn(wx/420+3,wy/420)-0.45)*0.9,o=(py*tw+px)*4;
    D[o]=base[0]*v*(1+dry*0.22);D[o+1]=base[1]*v*(1+dry*0.06);D[o+2]=base[2]*v*(1-dry*0.25);D[o+3]=255}
  g.putImageData(img,0,0);c.imageSmoothingEnabled=true;c.drawImage(cv,x0,y0,w,h);
  const pat=c.createPattern(detailTile(kind),'repeat');c.save();c.translate(x0,y0);c.fillStyle=pat;c.fillRect(0,0,w,h);c.restore();
}
// мелкие детали поверх земли (кусты травы, цветы, камушки, листья) — как декор в игре
function tuft(x,y,s,kind,v){
  if(kind==='snow'){c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse(x,y,7*s,2.4*s,0.2,0,7);c.fill();c.fillStyle='rgba(150,180,215,.4)';c.beginPath();c.ellipse(x+1,y+1.5,6*s,1.4*s,0.2,0,7);c.fill();return}
  if(kind==='high'||kind==='waste'){hp(()=>c.ellipse(x,y,3.2*s,2.2*s,0,0,7),kind==='waste'?'#a86a48':'#8f8b82',0.8);c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(x-1,y-0.8,1.4*s,0.8*s,0,0,7);c.fill();return}
  if(v<0.55){const cols=kind==='z1'?['#5d8a34','#86b452']:kind==='marsh'?['#5f7a3e','#8a9a50']:kind==='shroom'?['#5a3e6e','#7a5a8e']:['#3a6a40','#5a8a50'];
    c.lineCap='round';for(let i=0;i<5;i++){const a=-1.9+i*0.32+(v-0.3);c.strokeStyle='rgba(36,24,15,.45)';c.lineWidth=1.9;c.beginPath();c.moveTo(x+i*1.2-2.4,y);c.lineTo(x+i*1.2-2.4+Math.cos(a)*7*s,y+Math.sin(a)*7*s);c.stroke()}
    for(let i=0;i<5;i++){const a=-1.9+i*0.32+(v-0.3);c.strokeStyle=cols[i%2];c.lineWidth=1.2;c.beginPath();c.moveTo(x+i*1.2-2.4,y);c.lineTo(x+i*1.2-2.4+Math.cos(a)*7*s,y+Math.sin(a)*7*s);c.stroke()}return}
  if(v<0.72&&(kind==='z1'||kind==='z3')){const col=['#f4e27a','#ffffff','#c9a0e0','#f2a0a0'][Math.floor(v*400)%4];c.strokeStyle='#4a7a2a';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-5*s);c.stroke();
    for(let k=0;k<5;k++){const a=k/5*6.283;c.fillStyle=col;c.beginPath();c.arc(x+Math.cos(a)*1.6*s,y-5*s+Math.sin(a)*1.6*s,1.2*s,0,7);c.fill()}c.fillStyle='#e8a030';c.beginPath();c.arc(x,y-5*s,0.9*s,0,7);c.fill();return}
  if(v<0.86){hp(()=>c.ellipse(x,y,2.6*s,1.8*s,0,0,7),v<0.8?'#8f8b82':'#77736a',0.7);return}
  const lc=kind==='z3'?['#c9822e','#a8642a']:kind==='z2'?['#6b4a2c','#8a6a3a']:['#a8a050','#7a9a40'];c.fillStyle=lc[Math.floor(v*100)%2];c.save();c.translate(x,y);c.rotate(v*9);c.beginPath();c.ellipse(0,0,3*s,1.4*s,0,0,7);c.fill();c.restore();
}

// ===================== ДЕРЕВЬЯ =====================
// крона из кругов с общей обводкой и тенью справа-снизу
function crown(parts,cols,leafy=true){
  c.fillStyle=O;for(const [x,y,r] of parts){c.beginPath();c.arc(x,y,r+1.3,0,7);c.fill()}
  c.fillStyle=cols[1];for(const [x,y,r] of parts){c.beginPath();c.arc(x,y,r,0,7);c.fill()}
  c.save();c.beginPath();for(const [x,y,r] of parts){c.moveTo(x+r,y);c.arc(x,y,r,0,7)}c.clip();
  c.fillStyle=cols[0];for(const [x,y,r] of parts){c.beginPath();c.arc(x+r*0.35,y+r*0.4,r*0.85,0,7);c.fill()}
  c.fillStyle=cols[1];for(const [x,y,r] of parts){c.beginPath();c.arc(x-r*0.1,y-r*0.12,r*0.72,0,7);c.fill()}
  c.fillStyle=cols[2];for(const [x,y,r] of parts){c.beginPath();c.arc(x-r*0.3,y-r*0.35,r*0.42,0,7);c.fill()}
  if(leafy){c.strokeStyle=cols[0];c.lineWidth=1;for(const [x,y,r] of parts)for(let k=0;k<3;k++){const a=k*2.1+x;c.beginPath();c.arc(x+Math.cos(a)*r*0.45,y+Math.sin(a)*r*0.45,r*0.22,0.3,2.4);c.stroke()}}
  c.restore()}
function trunk(x,y,w,h,col,dark,taper=0.7){hp(()=>{c.moveTo(x-w/2-1.5,y+1);c.lineTo(x-w*taper/2,y-h);c.lineTo(x+w*taper/2,y-h);c.lineTo(x+w/2+1.5,y+1);c.quadraticCurveTo(x,y+3,x-w/2-1.5,y+1)},col,1.2);
  c.fillStyle=dark;c.beginPath();c.moveTo(x+w*0.1,y);c.lineTo(x+w*taper*0.15,y-h);c.lineTo(x+w*taper/2,y-h);c.lineTo(x+w/2+1.5,y+1);c.fill()}
function spruce(x,y,layers,w,h,cols,snow){// ярусы ели снизу вверх
  for(let i=0;i<layers;i++){const k=i/layers,yy=y-h*k*0.78-6,ww=w*(1-k*0.75),hh=h*0.36;
    hp(()=>{c.moveTo(x-ww,yy);for(let j=1;j<6;j++){c.lineTo(x-ww+ww*2*j/6-ww/6,yy-3*(j%2));}c.lineTo(x+ww,yy);c.lineTo(x,yy-hh);c.closePath()},cols[1],1.3);
    c.fillStyle=cols[0];c.beginPath();c.moveTo(x,yy-hh);c.lineTo(x+ww,yy);c.lineTo(x+ww*0.15,yy-1);c.closePath();c.fill();
    c.fillStyle=cols[2];c.beginPath();c.moveTo(x,yy-hh+2);c.lineTo(x-ww*0.55,yy-hh*0.35);c.lineTo(x-ww*0.2,yy-hh*0.45);c.closePath();c.fill();
    if(snow){c.fillStyle='rgba(250,253,255,.95)';c.beginPath();c.moveTo(x,yy-hh);c.lineTo(x-ww*0.6,yy-hh*0.3);c.quadraticCurveTo(x-ww*0.2,yy-hh*0.55,x+ww*0.2,yy-hh*0.25);c.lineTo(x,yy-hh);c.fill()}}}
// дерево: x,y — основание ствола, s — масштаб, v — случайность 0..1
function tree(kind,x,y,s=1,v=0.5,t=0){c.save();c.translate(x,y);c.scale(s,s);c.translate(-x,-y);c.lineJoin='round';c.lineCap='round';
  const L=(v-0.5)*4;// лёгкий наклон кроны
  switch(kind){
  case 1:{shadow(x+6,y+3,17,6);trunk(x,y,6,40,'#ece6d6','#cfc7b4',0.7);c.fillStyle='#2d2a25';for(const [dy,w] of [[-6,3],[-14,2.5],[-22,3],[-30,2]]){c.fillRect(x-2.5+(dy%3),y+dy,w,1.4)}
    c.strokeStyle=O;c.lineWidth=2.6;c.beginPath();c.moveTo(x,y-26);c.lineTo(x-8,y-34);c.moveTo(x+1,y-30);c.lineTo(x+8,y-38);c.stroke();c.strokeStyle='#ece6d6';c.lineWidth=1.2;c.stroke();
    crown([[x+L,y-46,11],[x-9+L,y-38,9],[x+9+L,y-39,9],[x-5+L,y-55,8],[x+6+L,y-53,7.5],[x+L,y-62,6]],['#5f8a3e','#86b052','#b8d880']);break}
  case 2:{shadow(x+6,y+3,16,6);trunk(x,y,7,30,'#a0552e','#7a3e22',0.75);
    for(const [dx,dy] of [[-1,-8],[1,-16],[-1,-24]]){c.strokeStyle='#d88a50';c.lineWidth=0.9;c.beginPath();c.moveTo(x-2+dx,y+dy);c.lineTo(x+1+dx,y+dy-2);c.stroke()}
    crown([[x+L,y-42,10],[x-10+L,y-36,8],[x+10+L,y-37,8],[x-4+L,y-50,8],[x+5+L,y-49,7],[x+L,y-57,6]],['#1e3e2a','#2e5a3c','#4a7a50']);break}
  case 3:{shadow(x+7,y+4,26,8);hp(()=>{c.moveTo(x-11,y+2);c.quadraticCurveTo(x-7,y-2,x-6,y-12);c.lineTo(x-5,y-28);c.lineTo(x+5,y-28);c.lineTo(x+6,y-12);c.quadraticCurveTo(x+8,y-2,x+12,y+2);c.quadraticCurveTo(x,y+5,x-11,y+2)},'#5a3e24',1.3);
    c.fillStyle='#3e2a18';c.fillRect(x+1,y-26,4,26);c.strokeStyle='#3e2a18';c.lineWidth=0.8;for(const k of [-12,-18,-6]){c.beginPath();c.moveTo(x-4,y+k);c.quadraticCurveTo(x-2,y+k-3,x,y+k);c.stroke()}
    crown([[x+L,y-40,15],[x-15+L,y-34,12],[x+15+L,y-35,12],[x-8+L,y-50,12],[x+9+L,y-49,11],[x-20+L,y-44,8],[x+20+L,y-45,8],[x+L,y-57,9]],['#3a5422','#55722f','#7a9a44']);
    c.fillStyle='#8a5a2a';for(const [dx,dy] of [[-8,-36],[7,-42],[-2,-30]]){c.beginPath();c.arc(x+dx+L,y+dy,1.4,0,7);c.fill()}break}
  case 4:{shadow(x+6,y+3,18,6);const tw=[[0,0],[-1,-14],[2,-28],[0,-40]];
    hp(()=>{c.moveTo(x-6,y+2);c.quadraticCurveTo(x-4,y-14,x-2,y-40);c.lineTo(x+2,y-40);c.quadraticCurveTo(x+4,y-14,x+7,y+2);c.closePath()},'#4b4252',1.3);c.fillStyle='#38303e';c.beginPath();c.moveTo(x+1,y-38);c.quadraticCurveTo(x+3,y-14,x+6,y+1);c.lineTo(x+2,y+1);c.fill();
    c.lineCap='round';for(const [a,b,cx2,cy2,w] of [[-2,-26,-18,-40,3],[1,-32,16,-48,3],[-1,-38,-10,-56,2.5],[1,-40,6,-60,2.4],[-10,-34,-22,-34,2],[9,-41,20,-40,2]]){c.strokeStyle=O;c.lineWidth=w+2.2;c.beginPath();c.moveTo(x+a,y+b);c.quadraticCurveTo(x+(a+cx2)/2+3,y+(b+cy2)/2-4,x+cx2,y+cy2);c.stroke();c.strokeStyle='#4b4252';c.lineWidth=w;c.stroke()}
    c.fillStyle='rgba(150,110,190,.45)';for(const [dx,dy,r] of [[-16,-42,7],[14,-50,6],[-6,-58,6],[6,-62,5]]){c.beginPath();c.arc(x+dx,y+dy,r,0,7);c.fill()}
    c.strokeStyle='rgba(120,140,100,.8)';c.lineWidth=1;for(const [dx,dy] of [[-14,-38],[12,-46]]){c.beginPath();c.moveTo(x+dx,y+dy);c.quadraticCurveTo(x+dx+2,y+dy+6,x+dx,y+dy+11);c.stroke()}break}
  case 5:{shadow(x+6,y+3,20,7);trunk(x,y,7,10,'#2a1d17','#1a120e');spruce(x,y,5,22,74,['#0e131c','#161c26','#26324a']);
    c.fillStyle='rgba(233,110,50,.9)';for(let k=0;k<5;k++){const ky=y-12-k*12,kx=x+((k%2)?-1:1)*(6+k);c.fillRect(kx-1,ky-1,2.5,2.5)}glow(x,y-30,30,'233,110,50',0.08);break}
  case 6:{shadow(x+6,y+3,20,7);trunk(x,y,8,34,'#2b2320','#1a1412');c.fillStyle=`rgba(244,${130+Math.sin(t*3+v*9)*30},50,.9)`;c.fillRect(x-1,y-28,2,24);
    crown([[x+L,y-44,12],[x-11+L,y-38,10],[x+11+L,y-39,10],[x-5+L,y-53,9],[x+6+L,y-52,8],[x+L,y-60,6]],['#6a645e','#8a837c','#c4bcb2']);
    for(let k=0;k<3;k++){const e=((t*0.6+k*0.33+v)%1);c.fillStyle=`rgba(244,150,60,${0.9*(1-e)})`;c.fillRect(x+Math.sin(k*2.3+v*9)*12,y-50-e*20,2.2,2.2)}break}
  case 7:{glow(x,y-34,34,'120,200,140',0.22);shadow(x+5,y+3,16,6);c.lineCap='round';
    c.strokeStyle=O;c.lineWidth=8;c.beginPath();c.moveTo(x,y+2);c.lineTo(x,y-40);c.stroke();c.strokeStyle='#d8cfb8';c.lineWidth=5.5;c.stroke();
    for(let k=0;k<4;k++){const yy=y-14-k*8,w=22-k*4;for(const sd of [-1,1]){c.strokeStyle=O;c.lineWidth=4.2;c.beginPath();c.moveTo(x,yy);c.quadraticCurveTo(x+sd*w*0.6,yy-7,x+sd*w,yy+3);c.stroke();c.strokeStyle='#e6dec9';c.lineWidth=2.4;c.stroke()}}
    hp(()=>c.arc(x,y-46,8,0,7),'#e6dec9',1.3);c.fillStyle='#1d241f';c.fillRect(x-4.5,y-48,3,3);c.fillRect(x+1.5,y-48,3,3);c.fillStyle='rgba(140,230,160,.95)';c.fillRect(x-4,y-47.5,1.6,1.6);c.fillRect(x+2,y-47.5,1.6,1.6);c.fillStyle='#1d241f';c.fillRect(x-2,y-42,4,1.5);break}
  case 'snow':{shadow(x+6,y+3,18,6);trunk(x,y,6,8,'#4a3424','#2e2016');spruce(x,y,5,20,66,['#163a2c','#24503e','#3a6e58'],true);break}
  case 'marsh':{shadow(x+6,y+3,22,7);trunk(x,y,8,24,'#5a4a32','#3e321f',0.8);crown([[x,y-34,12],[x-12,y-30,9],[x+12,y-31,9],[x,y-42,8]],['#4a5a2a','#6a7a3a','#94a058'],false);
    c.lineCap='round';for(let k=0;k<11;k++){const xx=x-18+k*3.6,l=14+((k*7)%5)*3;c.strokeStyle=O;c.lineWidth=2.6;c.beginPath();c.moveTo(xx,y-34+Math.abs(k-5)*1.5);c.quadraticCurveTo(xx+1.5,y-26,xx-0.5,y-34+l);c.stroke();c.strokeStyle=k%2?'#7a8a44':'#5f6e34';c.lineWidth=1.4;c.stroke()}break}
  case 'shroom':{shadow(x+6,y+3,20,7);glow(x,y-32,30,'200,150,255',0.18);hp(()=>{c.moveTo(x-5,y+2);c.quadraticCurveTo(x-6,y-14,x-4,y-30);c.lineTo(x+4,y-30);c.quadraticCurveTo(x+6,y-14,x+6,y+2);c.closePath()},'#e2d8c6',1.3);
    c.fillStyle='#c8bca8';c.fillRect(x+1,y-28,4,28);hp(()=>{c.moveTo(x-24,y-28);c.quadraticCurveTo(x-22,y-52,x,y-54);c.quadraticCurveTo(x+22,y-52,x+24,y-28);c.quadraticCurveTo(x,y-22,x-24,y-28)},'#9a4a9a',1.4);
    c.fillStyle='#7a3480';c.beginPath();c.moveTo(x+4,y-53);c.quadraticCurveTo(x+22,y-50,x+24,y-28);c.quadraticCurveTo(x+12,y-25,x+6,y-25);c.fill();
    for(const [dx,dy,r] of [[-10,-42,3.5],[4,-46,3],[12,-36,2.6],[-16,-33,2.2]]){c.fillStyle='#f0d8f8';c.beginPath();c.arc(x+dx,y+dy,r,0,7);c.fill()}break}
  case 'waste':{shadow(x+5,y+3,15,5);c.lineCap='round';for(const [a,b,cx2,cy2,w] of [[0,2,0,-38,6],[0,-18,-14,-30,3.4],[0,-26,12,-40,3],[0,-36,-6,-48,2.4],[-8,-24,-16,-22,2]]){c.strokeStyle=O;c.lineWidth=w+2.4;c.beginPath();c.moveTo(x+a,y+b);c.lineTo(x+cx2,y+cy2);c.stroke();c.strokeStyle='#3a2420';c.lineWidth=w;c.stroke()}
    c.strokeStyle='rgba(244,120,50,.85)';c.lineWidth=1.2;c.beginPath();c.moveTo(x,y-4);c.lineTo(x-1,y-14);c.lineTo(x+1,y-22);c.stroke();break}
  case 'high':{shadow(x+6,y+3,20,6);hp(()=>{c.moveTo(x-6,y+2);c.quadraticCurveTo(x-1,y-10,x-8,y-24);c.lineTo(x-3,y-26);c.quadraticCurveTo(x+4,y-12,x+6,y+2);c.closePath()},'#6a4a30',1.3);
    crown([[x-10,y-34,10],[x-20,y-30,7],[x+1,y-30,8],[x-12,y-42,7]],['#24402c','#36583c','#56784e']);break}
  case 'mist':{shadow(x+5,y+3,14,5);trunk(x,y,6,16,'#4a4438','#2e2a22');hp(()=>{c.moveTo(x,y-70);c.quadraticCurveTo(x+14,y-40,x+11,y-14);c.quadraticCurveTo(x,y-8,x-11,y-14);c.quadraticCurveTo(x-14,y-40,x,y-70)},'#4a5a54',1.3);
    c.fillStyle='#3a4844';c.beginPath();c.moveTo(x+1,y-68);c.quadraticCurveTo(x+14,y-40,x+11,y-14);c.quadraticCurveTo(x+5,y-11,x+3,y-12);c.quadraticCurveTo(x+6,y-40,x+1,y-68);c.fill();
    c.fillStyle='rgba(200,215,215,.35)';c.beginPath();c.ellipse(x,y-20,20,6,0,0,7);c.fill();break}
  }
  c.restore()}

// ===================== ВАЛУНЫ И ЗАЛЕЖИ =====================
// гранёный валун: светлый верх, средний левый бок, тёмный правый
function boulder(x,y,r,col,v=0.5,iron=false,cap=null){
  const pts=[];const n=7;for(let k=0;k<n;k++){const a=Math.PI+k/(n-1)*Math.PI,q=r*(0.82+((k*37+v*97)%10)/40);pts.push([x+Math.cos(a)*q,y+Math.sin(a)*q*0.9])}
  shadow(x+r*0.25,y+2,r*1.05,r*0.38,0.3);
  hp(()=>{c.moveTo(x-r,y);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(x+r,y);c.quadraticCurveTo(x,y+r*0.32,x-r,y)},rgb(col),1.3);
  const top=[x-r*0.15+(v-0.5)*r*0.3,y-r*0.42];
  c.fillStyle=rgb(col,1.22);c.beginPath();c.moveTo(pts[1][0],pts[1][1]);c.lineTo(pts[2][0],pts[2][1]);c.lineTo(pts[3][0],pts[3][1]);c.lineTo(pts[4][0],pts[4][1]);c.lineTo(top[0]+r*0.2,top[1]+r*0.15);c.lineTo(top[0]-r*0.3,top[1]+r*0.2);c.closePath();c.fill();
  c.fillStyle=rgb(col,0.72);c.beginPath();c.moveTo(pts[4][0],pts[4][1]);c.lineTo(pts[5][0],pts[5][1]);c.lineTo(pts[6][0],pts[6][1]);c.lineTo(x+r,y);c.quadraticCurveTo(x+r*0.5,y+r*0.25,x+r*0.15,y+r*0.25);c.lineTo(top[0]+r*0.2,top[1]+r*0.15);c.closePath();c.fill();
  c.strokeStyle=rgb(col,0.6);c.lineWidth=1;c.beginPath();c.moveTo(top[0]+r*0.2,top[1]+r*0.15);c.lineTo(x+r*0.15,y+r*0.25);c.moveTo(top[0]-r*0.3,top[1]+r*0.2);c.lineTo(x-r*0.55,y+r*0.12);c.stroke();
  c.strokeStyle=O;c.lineWidth=1.3;c.beginPath();c.moveTo(x-r,y);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(x+r,y);c.quadraticCurveTo(x,y+r*0.32,x-r,y);c.stroke();
  if(iron){c.strokeStyle='#b8682e';c.lineWidth=2;c.beginPath();c.moveTo(x-r*0.6,y-r*0.3);c.lineTo(x-r*0.2,y-r*0.15);c.lineTo(x+r*0.1,y-r*0.4);c.moveTo(x+r*0.2,y-r*0.05);c.lineTo(x+r*0.6,y-r*0.2);c.stroke();
    c.fillStyle='#e8eef4';for(const [dx,dy] of [[-0.35,-0.45],[0.25,-0.3],[0.5,-0.1]]){c.save();c.translate(x+dx*r,y+dy*r);c.rotate(0.785);c.fillRect(-1.3,-1.3,2.6,2.6);c.restore()}}
  if(cap==='snow'){c.fillStyle='rgba(250,253,255,.95)';c.beginPath();c.moveTo(pts[1][0],pts[1][1]);for(let k=2;k<6;k++)c.lineTo(pts[k][0],pts[k][1]+1);c.quadraticCurveTo(x,y-r*0.25,pts[1][0],pts[1][1]);c.fill()}
  if(cap==='crystal'||cap==='ember'){const col2=cap==='crystal'?'#b08ae8':'#ff8a3a';for(const [dx,h] of [[-0.2,0.5],[0.15,0.7]]){hp(()=>{c.moveTo(x+dx*r-2.5,y-r*0.45);c.lineTo(x+dx*r,y-r*0.45-r*h);c.lineTo(x+dx*r+2.5,y-r*0.45);c.closePath()},col2,0.9)}if(cap==='ember')glow(x,y-r*0.6,r,'255,140,60',0.25)}
}
const STONE_COL={1:[140,136,126],2:[124,124,120],3:[136,124,104],4:[110,100,118],5:[86,90,104],6:[120,112,104],7:[150,146,132],snow:[160,170,182],high:[138,130,116],waste:[150,92,70]};
// залежь: каменистая земля (плиты, трещины, щебень) и россыпь валунов
function deposit(x,y,r,zone,v=0.5,iron=false,biome=null){
  const col=STONE_COL[biome]||STONE_COL[zone]||STONE_COL[1],R=rnd(Math.floor(v*1e6)+7);
  // осыпь — несколько мягких пятен светлого щебня, края уходят в траву
  for(let k=0;k<6;k++){const a=k/6*6.283+R(),q=k?r*0.45:0,px=x+Math.cos(a)*q,py=y+Math.sin(a)*q*0.7,rr=r*(k?0.55:0.8);
    const g=c.createRadialGradient(px,py,rr*0.3,px,py,rr);g.addColorStop(0,`rgba(${col[0]*0.82|0},${col[1]*0.8|0},${col[2]*0.74|0},.75)`);g.addColorStop(1,`rgba(${col[0]*0.8|0},${col[1]*0.78|0},${col[2]*0.72|0},0)`);
    c.fillStyle=g;c.beginPath();c.ellipse(px,py,rr,rr*0.72,0,0,7);c.fill()}
  if(iron){const g2=c.createRadialGradient(x,y,2,x,y,r*0.8);g2.addColorStop(0,'rgba(170,80,40,.35)');g2.addColorStop(1,'rgba(170,80,40,0)');c.fillStyle=g2;c.beginPath();c.ellipse(x,y,r*0.8,r*0.6,0,0,7);c.fill()}
  // плиты коренной породы
  for(let i=0;i<4;i++){const a=R()*6.283,q=r*(0.45+R()*0.35),px=x+Math.cos(a)*q,py=y+Math.sin(a)*q*0.7,w=8+R()*10;
    hp(()=>{c.moveTo(px-w,py);c.lineTo(px-w*0.5,py-w*0.35);c.lineTo(px+w*0.6,py-w*0.3);c.lineTo(px+w,py+w*0.05);c.lineTo(px+w*0.3,py+w*0.3);c.lineTo(px-w*0.6,py+w*0.25);c.closePath()},rgb(col,0.92),1);
    c.fillStyle=rgb(col,1.1);c.beginPath();c.moveTo(px-w*0.5,py-w*0.35);c.lineTo(px+w*0.6,py-w*0.3);c.lineTo(px+w*0.2,py-w*0.05);c.lineTo(px-w*0.4,py-w*0.08);c.fill();
    c.strokeStyle=rgb(col,0.55);c.lineWidth=1;c.beginPath();c.moveTo(px-w*0.3,py+w*0.15);c.lineTo(px+w*0.1,py);c.lineTo(px+w*0.4,py+w*0.15);c.stroke()}
  // выход породы: верх-плато и обрыв спереди
  {const w=r*0.62,h=r*0.3,ox=x-r*0.05,oy=y-r*0.18,P=[];for(let k=0;k<9;k++){const a=Math.PI+k/8*Math.PI,q=w*(0.85+R()*0.25);P.push([ox+Math.cos(a)*q,oy+Math.sin(a)*q*0.55])}
    shadow(ox+w*0.2,oy+h+4,w*1.05,w*0.3,0.3);
    hp(()=>{c.moveTo(P[0][0],P[0][1]);for(const p of P)c.lineTo(p[0],p[1]);c.lineTo(P[8][0],P[8][1]+h);c.quadraticCurveTo(ox,oy+h+w*0.32,P[0][0],P[0][1]+h);c.closePath()},rgb(col,0.78),1.3);
    c.strokeStyle=rgb(col,0.55);c.lineWidth=1.2;for(let k=1;k<8;k++){const px=P[0][0]+(P[8][0]-P[0][0])*k/8;c.beginPath();c.moveTo(px,oy+2+R()*3);c.lineTo(px+(R()-0.5)*4,oy+h+w*0.2*Math.sin(k/8*Math.PI));c.stroke()}
    hp(()=>{c.moveTo(P[0][0],P[0][1]);for(const p of P)c.lineTo(p[0],p[1]);c.quadraticCurveTo(ox,oy+w*0.3,P[0][0],P[0][1])},rgb(col,1.12),1.3);
    c.fillStyle=rgb(col,1.28);c.beginPath();c.ellipse(ox-w*0.25,oy-w*0.18,w*0.35,w*0.12,-0.2,0,7);c.fill();
    c.strokeStyle=rgb(col,0.7);c.lineWidth=1;c.beginPath();c.moveTo(ox-w*0.5,oy-w*0.05);c.lineTo(ox-w*0.1,oy-w*0.15);c.lineTo(ox+w*0.3,oy-w*0.05);c.stroke();
    if(iron){c.strokeStyle='#b8682e';c.lineWidth=2.4;c.beginPath();c.moveTo(ox-w*0.6,oy+h*0.5);c.lineTo(ox-w*0.1,oy+h*0.8);c.lineTo(ox+w*0.5,oy+h*0.4);c.stroke()}
    if(biome==='snow'){c.fillStyle='rgba(250,253,255,.95)';c.beginPath();c.moveTo(P[0][0],P[0][1]);for(const p of P)c.lineTo(p[0],p[1]-1);c.quadraticCurveTo(ox,oy+w*0.15,P[0][0],P[0][1]);c.fill()}}
  // щебень
  for(let i=0;i<34;i++){const a=R()*6.283,q=Math.sqrt(R())*r*0.95,px=x+Math.cos(a)*q,py=y+Math.sin(a)*q*0.78,s=1+R()*2.2;c.fillStyle=R()<0.5?rgb(col,0.8):rgb(col,1.15);c.beginPath();c.ellipse(px,py,s,s*0.7,0,0,7);c.fill();if(s>2.4){c.strokeStyle=O;c.lineWidth=0.6;c.stroke()}}
  // трещины
  c.strokeStyle='rgba(30,25,20,.45)';c.lineWidth=1.1;for(let i=0;i<3;i++){let px=x+(R()-0.5)*r,py=y+(R()-0.5)*r*0.6;c.beginPath();c.moveTo(px,py);for(let k=0;k<4;k++){px+=(R()-0.5)*16;py+=(R()-0.5)*8;c.lineTo(px,py)}c.stroke()}
}

// ===================== ПЛОЩАДЬ У РАТУШИ =====================
// lvl 1–6: земля → утоптанная с камнями → щебень и дорожки → брусчатка → плитка → узорная плитка с клумбами
function plaza(cx,cy,R,lvl,seed=3){const r0=rnd(seed);c.save();
  const edge=(fill,rr,soft=18)=>{const g=c.createRadialGradient(cx,cy,rr-soft,cx,cy,rr+soft*0.3);g.addColorStop(0,fill);g.addColorStop(1,fill.replace(/[\d.]+\)$/,'0)'));c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,rr+soft*0.3,(rr+soft*0.3)*SQ,0,0,7);c.fill()};
  const clip=rr=>{c.beginPath();c.ellipse(cx,cy,rr,rr*SQ,0,0,7);c.clip()};
  if(lvl<=2){edge('rgba(112,90,58,.95)',R*(lvl===1?0.85:0.95),26);c.fillStyle='rgba(80,60,36,.35)';for(let i=0;i<40;i++){const a=r0()*6.283,q=Math.sqrt(r0())*R*0.6;c.beginPath();c.ellipse(cx+Math.cos(a)*q,cy+Math.sin(a)*q*SQ,2+r0()*4,1+r0()*2,0,0,7);c.fill()}
    for(let i=0;i<14;i++){const a=r0()*6.283,q=r0()*R*0.5;c.fillStyle='rgba(60,45,28,.5)';c.beginPath();c.ellipse(cx+Math.cos(a)*q,cy+Math.sin(a)*q*0.8,2,3.2,a,0,7);c.fill()}
    if(lvl===2)for(let i=0;i<18;i++){const a=r0()*6.283,q=R*(0.3+r0()*0.45);hp(()=>c.ellipse(cx+Math.cos(a)*q,cy+Math.sin(a)*q*SQ,2.6+r0()*2,1.8+r0(),0,0,7),r0()<0.5?'#8f8b82':'#77736a',0.7)}
    c.restore();return}
  if(lvl===3){edge('rgba(118,98,66,.95)',R*0.92,22);c.save();clip(R*0.78);c.fillStyle='#8a7e6a';c.fillRect(cx-R,cy-R,2*R,2*R);for(let i=0;i<1400;i++){const a=r0()*6.283,q=Math.sqrt(r0())*R*0.8;c.fillStyle=['#9e927c','#756a58','#b0a690','#6a604e'][i%4];c.fillRect(cx+Math.cos(a)*q,cy+Math.sin(a)*q*SQ,1.6,1.4)}c.restore();
    for(let i=0;i<30;i++){const a=i/30*6.283;hp(()=>c.ellipse(cx+Math.cos(a)*R*0.8,cy+Math.sin(a)*R*0.8*SQ,4,2.6,a,0,7),i%2?'#8f8b82':'#7a776f',0.8)}
    c.restore();return}
  // каменное покрытие
  const curb=()=>{c.strokeStyle=O;c.lineWidth=7;c.beginPath();c.ellipse(cx,cy,R,R*SQ,0,0,7);c.stroke();c.strokeStyle=lvl===6?'#c8bfae':'#a09a8c';c.lineWidth=4.6;c.stroke();c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1;for(let i=0;i<48;i++){const a=i/48*6.283;c.beginPath();c.moveTo(cx+Math.cos(a)*(R-2.3),cy+Math.sin(a)*(R-2.3)*SQ);c.lineTo(cx+Math.cos(a)*(R+2.3),cy+Math.sin(a)*(R+2.3)*SQ);c.stroke()}};
  edge('rgba(90,78,58,.6)',R+10,14);
  c.save();clip(R);
  if(lvl===4){c.fillStyle='#5e5a52';c.fillRect(cx-R,cy-R,2*R,2*R);const st=9;for(let gy=-R;gy<R;gy+=st*SQ){const row=Math.round(gy/st);for(let gx=-R+(row%2?st/2:0);gx<R;gx+=st){const j=r0(),px=cx+gx+(j-0.5)*2,py=cy+gy+(r0()-0.5)*1.6;
      c.fillStyle=['#a49e90','#948e81','#b0aa9b','#8a8579'][Math.floor(j*4)];c.beginPath();c.ellipse(px,py,st*0.46,st*0.36,0,0,7);c.fill();c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.ellipse(px-1,py-1,st*0.24,st*0.15,0,0,7);c.fill()}}}
  else{// плитка кольцами
    c.fillStyle=lvl===6?'#8a8070':'#6e675c';c.fillRect(cx-R,cy-R,2*R,2*R);const rings=lvl===6?7:6,dr=R/rings;
    for(let k=1;k<=rings;k++){const r1=k*dr,r0_=(k-1)*dr,n=Math.max(6,Math.round(6.283*r1/16));for(let i=0;i<n;i++){const a0=i/n*6.283+(k%2)*0.5/n*6.283,a1=a0+6.283/n;
      let col=(i+k)%3===0?'#b4ab98':(i+k)%3===1?'#a59c88':'#c0b8a6';if(lvl===6){col=k%2?((i%2)?'#c9b89a':'#b8a280'):((i%3)?'#a9a294':'#8e7e6a');if(k===rings-1)col=(i%2)?'#9a4a3a':'#c9a24a'}
      c.fillStyle=col;c.beginPath();c.ellipse(cx,cy,r1-0.8,(r1-0.8)*SQ,0,a0+0.012,a1-0.012);c.ellipse(cx,cy,Math.max(0.1,r0_+0.8),Math.max(0.1,(r0_+0.8)*SQ),0,a1-0.012,a0+0.012,true);c.closePath();c.fill()}}
    c.fillStyle='rgba(255,255,255,.06)';c.beginPath();c.ellipse(cx-R*0.2,cy-R*0.25,R*0.6,R*0.35,-0.3,0,7);c.fill();
    if(lvl===6){hp(()=>c.ellipse(cx,cy,dr*0.9,dr*0.9*SQ,0,0,7),'#c9a24a',1.4);c.fillStyle='#9a4a3a';c.beginPath();for(let k=0;k<8;k++){const a=k/8*6.283,q=k%2?dr*0.35:dr*0.8;c.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q*SQ)}c.fill()}}
  c.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<10;i++){const a=r0()*6.283,q=r0()*R;c.beginPath();c.ellipse(cx+Math.cos(a)*q,cy+Math.sin(a)*q*SQ,6+r0()*10,3+r0()*4,0,0,7);c.fill()}
  c.restore();curb();
  if(lvl===6)for(const sd of [-1,1]){const bx=cx+sd*R*SQ,by=cy+R*0.42;hp(()=>c.ellipse(bx,by,16,8,0,0,7),'#7a5634',1.3);for(let i=0;i<7;i++){const a=i/7*6.283;c.fillStyle=['#e05a6a','#f4e27a','#ffffff','#c9a0e0'][i%4];c.beginPath();c.arc(bx+Math.cos(a)*9,by-2+Math.sin(a)*4,2.2,0,7);c.fill();c.fillStyle='#4a7a2a';c.beginPath();c.arc(bx+Math.cos(a)*9+1.5,by+Math.sin(a)*4,1.4,0,7);c.fill()}}
  c.restore()}

// ===================== РАТУША (объём: фасад, бок, крыша сверху) =====================
// коробка в объёме: фасад w×h, бок глубиной d (уходит вправо-вверх)
function box(x,y,w,h,d,front,side,top,tex){
  hp(()=>{c.moveTo(x+w,y);c.lineTo(x+w+d*0.55,y-d*0.45);c.lineTo(x+w+d*0.55,y-h-d*0.45);c.lineTo(x+w,y-h);c.closePath()},side,1.2);
  hp(()=>{c.moveTo(x,y-h);c.lineTo(x+d*0.55,y-h-d*0.45);c.lineTo(x+w+d*0.55,y-h-d*0.45);c.lineTo(x+w,y-h);c.closePath()},top,1.2);
  hp(()=>c.rect(x,y-h,w,h),front,1.3);if(tex)tex(x,y-h,w,h)}
function bricks(x,y,w,h,line='rgba(0,0,0,.28)',rh=6,bw=11){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.strokeStyle=line;c.lineWidth=0.9;
  for(let r=0;r*rh<h;r++){const yy=y+r*rh;c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();for(let k=(r%2?bw/2:0);k<w;k+=bw){c.beginPath();c.moveTo(x+k,yy);c.lineTo(x+k,yy+rh);c.stroke()}}
  c.fillStyle='rgba(255,255,255,.07)';for(let r=0;r*rh<h;r+=2)c.fillRect(x,y+r*rh+1,w,1.2);
  c.fillStyle='rgba(60,90,40,.35)';c.beginPath();c.ellipse(x+3,y+h-2,6,3,0,0,7);c.fill();c.restore()}
function logsTex(x,y,w,h){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();const n=Math.max(3,Math.round(h/6));for(let i=0;i<n;i++){const yy=y+i*h/n;c.fillStyle=i%2?'rgba(0,0,0,.08)':'rgba(255,255,255,.06)';c.fillRect(x,yy,w,h/n);c.strokeStyle='rgba(40,25,10,.55)';c.lineWidth=1;c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke()}c.restore();
  for(let i=0;i<n;i++)for(const sx of [x,x+w])hp(()=>c.ellipse(sx,y+(i+0.5)*h/n,2.6,h/n/2-0.3,0,0,7),'#c9a06a',0.8)}
function roofTiles(pts,col,dark,rows=5){hp(()=>{c.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))c.lineTo(p[0],p[1]);c.closePath()},col,1.3);c.save();c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))c.lineTo(p[0],p[1]);c.closePath();c.clip();
  const ys=pts.map(p=>p[1]),y0=Math.min(...ys),y1=Math.max(...ys),xs=pts.map(p=>p[0]),x0=Math.min(...xs),x1=Math.max(...xs);c.strokeStyle=dark;c.lineWidth=1;
  for(let i=1;i<rows;i++){const yy=y0+(y1-y0)*i/rows;c.beginPath();for(let xx=x0;xx<x1;xx+=7){c.moveTo(xx,yy);c.quadraticCurveTo(xx+3.5,yy+3,xx+7,yy)}c.stroke()}c.restore()}
function win(x,y,w,h,lit){hp(()=>{c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.quadraticCurveTo(x+w/2,y-w*0.2,x+w,y+w/2);c.lineTo(x+w,y+h);c.closePath()},lit?'#ffd36a':'#2b2219',1);if(lit)glow(x+w/2,y+h/2,w*2.2,'255,200,90',0.35);
  c.strokeStyle='#6a5a48';c.lineWidth=0.8;c.beginPath();c.moveTo(x+w/2,y+1);c.lineTo(x+w/2,y+h);c.moveTo(x,y+h*0.55);c.lineTo(x+w,y+h*0.55);c.stroke();hp(()=>c.rect(x-1.5,y+h,w+3,2),'#8a857a',0.8)}
function slit(x,y){hp(()=>c.rect(x,y,2.4,8),'#1a1410',0.6)}
function merlons(x,y,w,d,col,top,n){const k=w/n;for(let i=0;i<n;i+=2){box(x+i*k,y,k,5,d*0.35,col,rgb([0,0,0],0)==='x'?col:shade(col,0.8),shade(col,1.15))}}
function shade(hex,k){const n=parseInt(hex.slice(1),16);return rgb([(n>>16)&255,(n>>8)&255,n&255],k)}
function banner(x,y,t,col,h=20){c.strokeStyle=O;c.lineWidth=2.4;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.stroke();c.strokeStyle='#c9a24a';c.lineWidth=1.2;c.stroke();const w=Math.sin(t*4)*2;
  hp(()=>{c.moveTo(x,y-h);c.quadraticCurveTo(x+7,y-h-2+w,x+14,y-h+1+w);c.lineTo(x+13,y-h+9+w);c.quadraticCurveTo(x+7,y-h+7,x,y-h+9);c.closePath()},col,1)}
function fireS(x,y,s,t){glow(x,y-4*s,26*s,'255,150,50',0.45);for(let i=0;i<3;i++){const f=1+0.15*Math.sin(t*9+i*2);c.fillStyle=['#ff6a2a','#ffb347','#fff2a0'][i];const w=(8-i*2.5)*s,h=(16-i*4.5)*s*f;c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x-w,y-h*0.6,x,y-h);c.quadraticCurveTo(x+w,y-h*0.6,x+w,y);c.closePath();c.fill()}}
function torch(x,y,t){if(NOFX)return;hp(()=>c.rect(x-1.3,y-9,2.6,10),'#4a3020',0.7);fireS(x,y-9,0.35,t)}
function stoneRing(x,y,r,n){for(let i=0;i<n;i++){const a=i/n*6.283;hp(()=>c.ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r*0.5,3.8,2.8,0,0,7),i%2?'#7a776f':'#8a867d',0.8)}}
function logs(x,y,s){for(const [a] of [[0.5],[-0.5]]){c.save();c.translate(x,y);c.rotate(a);hp(()=>c.rect(-9*s,-2*s,18*s,4*s),'#6b4a2c',0.9);hp(()=>c.ellipse(9*s,0,1.4*s,2*s,0,0,7),'#c9a06a',0.6);c.restore()}}
function smoke4(t){for(let k=0;k<4;k++){const q=((t*0.35+k/4)%1);c.fillStyle=`rgba(190,190,180,${0.4*(1-q)})`;c.beginPath();c.arc(27+Math.sin(q*4+k)*4+q*8,-106-q*30,3+q*6,0,7);c.fill()}}
// живые части ратуши (факелы, дым) — рисуются поверх готовой картинки
const HQ_FX={4:[[-50,-4],[50,-4]],5:[[-22,-8],[22,-8]],6:[[-24,-10],[24,-10]]};
function hqFx(lv,t){for(const [x,y] of HQ_FX[lv]||[])torch(x,y,t);if(lv===4)smoke4(t)}
const HQ={
1(t,N){shadow(0,4,26,7);stoneRing(0,0,11,8);logs(0,-1,0.8);fireS(0,-2,0.7,t);hp(()=>c.rect(-28,2,16,5),'#7b5634',1);hp(()=>c.ellipse(-12,4.5,1.6,2.5,0,0,7),'#c9a06a',0.6)},
2(t,N){shadow(0,6,36,10);stoneRing(0,0,14,10);logs(0,-1,1);fireS(0,-2,1,t);
  c.strokeStyle=O;c.lineWidth=3;c.beginPath();c.moveTo(-11,2);c.lineTo(0,-26);c.lineTo(11,2);c.stroke();c.strokeStyle='#6b4a2c';c.lineWidth=1.6;c.stroke();
  hp(()=>{c.moveTo(-5,-14);c.lineTo(5,-14);c.quadraticCurveTo(5,-6,0,-6);c.quadraticCurveTo(-5,-6,-5,-14)},'#3a3632',1);
  for(const bx of [-32,22]){hp(()=>c.rect(bx,2,14,6),'#7b5634',1);hp(()=>c.ellipse(bx+14,5,1.8,3,0,0,7),'#c9a06a',0.6)}},
3(t,N){shadow(0,6,50,13);// шалаш-навес из жердей и лапника, стойка с инструментом, костёр
  hp(()=>{c.moveTo(-44,-4);c.lineTo(-10,-62);c.lineTo(30,-4);c.closePath()},'#7a6a46',1.4);hp(()=>{c.moveTo(-10,-62);c.lineTo(30,-4);c.lineTo(42,-12);c.lineTo(4,-66);c.closePath()},'#5e5034',1.3);
  c.save();c.beginPath();c.moveTo(-44,-4);c.lineTo(-10,-62);c.lineTo(30,-4);c.closePath();c.clip();c.strokeStyle='#4a5a30';c.lineWidth=2;for(let i=0;i<16;i++){const yy=-60+i*4;c.beginPath();c.moveTo(-40,yy);c.lineTo(30,yy+6);c.stroke()}c.restore();
  hp(()=>{c.moveTo(-18,-4);c.quadraticCurveTo(-11,-30,-4,-4);c.closePath()},'#2b2219',1);
  c.strokeStyle=O;c.lineWidth=3;c.beginPath();c.moveTo(-14,-68);c.lineTo(-7,-56);c.moveTo(-5,-68);c.lineTo(-12,-56);c.stroke();c.strokeStyle='#6b4a2c';c.lineWidth=1.6;c.stroke();
  for(let i=0;i<3;i++)hp(()=>c.rect(36+i*6,-26,2.4,24),'#6b4a2c',0.7);hp(()=>c.rect(34,-27,22,2.4),'#6b4a2c',0.7);for(let i=0;i<3;i++)hp(()=>c.ellipse(40+i*6,-19,2.6,5,0,0,7),'#a8442a',0.6);
  stoneRing(12,16,12,9);logs(12,15,0.85);fireS(12,13,0.9,t)},
4(t,N){shadow(0,6,58,14);// изба на каменном цоколе, с крыльцом и трубой
  box(-44,-2,88,8,16,'#7a776f','#5c5a54','#8a877e',(x,y,w,h)=>bricks(x,y,w,h,'rgba(0,0,0,.3)',4,9));
  box(-38,-10,76,36,16,'#8a6038','#6a4628','#9a7048',logsTex);
  roofTiles([[-46,-46],[0,-84],[46,-46]],'#5a3a28','#3a2418',6);roofTiles([[0,-84],[46,-46],[55,-53],[9,-91]],'#4a2e1e','#2e1a10',6);
  hp(()=>c.rect(22,-102,10,22),'#6a6560',1.1);hp(()=>c.rect(20,-104,14,4),'#55514c',1);
  if(!NOFX)smoke4(t);
  hp(()=>{c.moveTo(-8,-10);c.lineTo(-8,-34);c.quadraticCurveTo(0,-42,8,-34);c.lineTo(8,-10);c.closePath()},'#4a3020',1.2);c.fillStyle='#c9a24a';c.beginPath();c.arc(5,-21,1.3,0,7);c.fill();
  win(-30,-36,11,13,N);win(19,-36,11,13,N);hp(()=>c.rect(-14,-10,28,5),'#6b4a2c',1);hp(()=>c.rect(-18,-5,36,4),'#5a3e26',1);
  c.fillStyle='#c9a06a';c.beginPath();c.moveTo(0,-90);c.lineTo(-6,-82);c.lineTo(6,-82);c.fill();for(const tx of [-50,50])torch(tx,-4,t)},
5(t,N){shadow(0,8,72,17);// крепость: каменный донжон с объёмом, две башни, зубцы
  for(const tx of [-60,38]){box(tx,-4,22,62,14,'#7c796f','#5e5c56','#8e8b82',(x,y,w,h)=>bricks(x,y,w,h));for(let i=0;i<3;i++)box(tx+i*8,-66,6,5,5,'#8e8b82','#6a6862','#a09d94');slit(tx+10,-44);slit(tx+10,-24)}
  box(-36,-4,72,74,20,'#8a877e','#66635c','#9a978e',(x,y,w,h)=>bricks(x,y,w,h));
  for(let i=0;i<5;i++)box(-36+i*16,-78,9,6,7,'#9a978e','#74716a','#aaa79e');
  box(-18,-82,40,24,14,'#7a5634','#5a3e26','#8a6640',logsTex);roofTiles([[-24,-106],[2,-130],[28,-106]],'#7a2a22','#4a1a14',5);roofTiles([[2,-130],[28,-106],[36,-112],[10,-136]],'#5a1e18','#3a1210',5);
  win(-10,-102,7,10,N);win(6,-102,7,10,N);for(const wx of [-26,16])win(wx,-58,9,13,N);
  hp(()=>{c.moveTo(-10,-4);c.lineTo(-10,-28);c.quadraticCurveTo(0,-40,10,-28);c.lineTo(10,-4);c.closePath()},'#3a2418',1.3);c.strokeStyle='#6a6560';c.lineWidth=1;for(let k=-6;k<=6;k+=4){c.beginPath();c.moveTo(k,-30);c.lineTo(k,-6);c.stroke()}
  hp(()=>{c.moveTo(-14,-4);c.lineTo(-14,-28);c.quadraticCurveTo(0,-46,14,-28);c.lineTo(14,-4)},null,1.6);
  banner(2,-136,t,'#c43a2c',18);for(const tx of [-49,49])banner(tx,-72,t+tx,'#2f5d8a',14);for(const tx of [-22,22])torch(tx,-8,t)},
6(t,N){shadow(0,10,88,20);// замок: стена с воротами и зубцами, круглые башни, донжон с высокой башней
  box(-30,-70,60,56,18,'#96938a','#706d66','#a6a39a',(x,y,w,h)=>bricks(x,y,w,h));
  box(-12,-124,24,40,12,'#9a978e','#74716a','#aaa79e',(x,y,w,h)=>bricks(x,y,w,h));
  roofTiles([[-17,-164],[0,-200],[17,-164]],'#6a2a22','#3a1a14',6);roofTiles([[0,-200],[17,-164],[24,-170],[7,-206]],'#4a1a14','#2a0e0a',6);banner(0,-200,t,'#c9a24a',18);win(-4,-150,8,11,N);
  for(let i=0;i<4;i++)box(-30+i*16,-126,9,6,7,'#a6a39a','#7e7b74','#b6b3aa');for(const wx of [-22,13])win(wx,-110,9,13,N);
  for(const tx of [-74,74]){// круглые башни
    const r=16;hp(()=>{c.moveTo(tx-r,-4);c.lineTo(tx-r,-80);c.lineTo(tx+r,-80);c.lineTo(tx+r,-4);c.quadraticCurveTo(tx,4,tx-r,-4)},'#8a877e',1.3);c.save();c.beginPath();c.rect(tx-r,-80,2*r,80);c.clip();
    const g=c.createLinearGradient(tx-r,0,tx+r,0);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(0.45,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.3)');c.fillStyle=g;c.fillRect(tx-r,-80,2*r,80);bricks(tx-r,-80,2*r,76,'rgba(0,0,0,.25)',6,9);c.restore();
    hp(()=>c.ellipse(tx,-80,r,5,0,0,7),'#a6a39a',1.2);roofTiles([[tx-r-3,-80],[tx,-116],[tx+r+3,-80]],'#6a2a22','#3a1a14',5);banner(tx,-116,t+tx*0.1,'#c43a2c',14);slit(tx-1,-60);slit(tx-1,-36)}
  box(-58,-4,116,40,10,'#8e8b82','#6a6862','#a09d94',(x,y,w,h)=>bricks(x,y,w,h));for(let i=0;i<15;i+=2)box(-58+i*116/15,-44,116/15,6,5,'#a09d94','#7a7872','#b0ada4');
  hp(()=>{c.moveTo(-13,-4);c.lineTo(-13,-26);c.quadraticCurveTo(0,-40,13,-26);c.lineTo(13,-4);c.closePath()},'#2a1e16',1.4);c.strokeStyle='#8a8478';c.lineWidth=1.4;for(let k=-9;k<=9;k+=4.5){c.beginPath();c.moveTo(k,-30);c.lineTo(k,-8);c.stroke()}for(let k=-26;k<-8;k+=6){c.beginPath();c.moveTo(-12,k);c.lineTo(12,k);c.stroke()}
  hp(()=>{c.moveTo(-17,-4);c.lineTo(-17,-28);c.quadraticCurveTo(0,-48,17,-28);c.lineTo(17,-4)},null,2);hp(()=>c.arc(0,-56,7,0,7),'#c9a24a',1.1);c.fillStyle='#c43a2c';c.beginPath();c.moveTo(0,-61);c.lineTo(4,-54);c.lineTo(-4,-54);c.fill();
  for(const tx of [-24,24])torch(tx,-10,t);
  hp(()=>c.rect(-18,-4,36,10),'#5a4128',1.1);c.strokeStyle='#3a2818';c.lineWidth=0.8;for(let k=-14;k<18;k+=5){c.beginPath();c.moveTo(k,-4);c.lineTo(k,6);c.stroke()}}
};

// ===================== ОГРАДА С ТОЛЩИНОЙ =====================
// сегмент кольца ограды от a0 до a1; k: 1 плетень, 2 частокол, 3 каменная стена, 4 крепостная стена
function fenceSeg(cx,cy,Rr,k,a0,a1,i){const am=(a0+a1)/2,P=(r,a)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r*SQ];
  if(k===1){c.strokeStyle=O;c.lineWidth=6;c.beginPath();c.ellipse(cx,cy,Rr,Rr*SQ,0,a0,a1+0.01);c.stroke();c.strokeStyle='#9a7a4a';c.lineWidth=4;c.stroke();c.strokeStyle='#7a5a32';c.lineWidth=1;c.beginPath();c.ellipse(cx,cy,Rr+(i%2?1:-1),(Rr+(i%2?1:-1))*SQ,0,a0,a1);c.stroke();
    if(i%3===0){const [px,py]=P(Rr,am);hp(()=>c.rect(px-1.5,py-9,3,11),'#6b4f30',0.7)}return}
  if(k===2){// частокол: два ряда толстых брёвен с острыми концами
    for(const [dr,sh] of [[-3,0.85],[3,1]]){const [px,py]=P(Rr+dr,am),w=7,h=24;
      shadow(px+3,py+2,6,2.4,0.25);hp(()=>{c.moveTo(px-w/2,py+2);c.lineTo(px-w/2,py-h);c.lineTo(px,py-h-7);c.lineTo(px+w/2,py-h);c.lineTo(px+w/2,py+2);c.closePath()},shade(i%2?'#7b5634':'#8d6540',sh),1.2);
      c.fillStyle='rgba(0,0,0,.25)';c.fillRect(px+0.8,py-h,w/2-1,h+2);c.fillStyle='rgba(255,255,255,.14)';c.fillRect(px-w/2+1,py-h,1.4,h);
      c.fillStyle=shade('#c9a06a',sh);c.beginPath();c.moveTo(px-w/2+0.8,py-h);c.lineTo(px,py-h-6);c.lineTo(px,py-h);c.fill();
      if(dr>0){c.strokeStyle='#5a4128';c.lineWidth=1.6;c.beginPath();c.moveTo(px-w/2,py-h*0.62);c.lineTo(px+w/2,py-h*0.62+0.6);c.stroke()}}
    return}
  // камень: внешняя грань, верх-галерея шириной T, зубцы
  const T=k===3?14:20,H=k===3?22:30,ri=Rr-T/2,ro=Rr+T/2,south=Math.sin(am)>0;
  const col=k===3?'#85827a':'#5e5d66',topc=k===3?'#a19e95':'#76757f',dark=k===3?'#66635d':'#46454e';
  const [ax,ay]=P(ro,a0),[bx,by]=P(ro,a1),[ix0,iy0]=P(ri,a0),[ix1,iy1]=P(ri,a1);
  // видимая грань: снаружи — у южной половины, изнутри — у северной
  const [fx0,fy0,fx1,fy1]=south?[ax,ay,bx,by]:[ix0,iy0,ix1,iy1];
  shadow((fx0+fx1)/2+4,(fy0+fy1)/2+3,Math.abs(fx1-fx0)/2+6,4,0.22);
  hp(()=>{c.moveTo(fx0,fy0);c.lineTo(fx1,fy1);c.lineTo(fx1,fy1-H);c.lineTo(fx0,fy0-H);c.closePath()},south?col:dark,1.1);
  c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=0.8;for(let r=1;r<H/6;r++){const yy=r*6;c.beginPath();c.moveTo(fx0,fy0-yy);c.lineTo(fx1,fy1-yy);c.stroke();const mx=(fx0+fx1)/2+((r+i)%2?3:-3),my=(fy0+fy1)/2;c.beginPath();c.moveTo(mx,my-yy);c.lineTo(mx,my-yy+6);c.stroke()}
  if(k===4&&south&&i%2){c.fillStyle='#1a1416';c.fillRect((fx0+fx1)/2-1.2,(fy0+fy1)/2-H*0.6,2.4,7)}
  // верх галереи
  hp(()=>{c.moveTo(ix0,iy0-H);c.lineTo(ix1,iy1-H);c.lineTo(bx,by-H);c.lineTo(ax,ay-H);c.closePath()},topc,1.1);
  c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=0.7;const [mx0,my0]=P(Rr,a0),[mx1,my1]=P(Rr,a1);c.beginPath();c.moveTo(mx0,my0-H);c.lineTo(mx1,my1-H);c.stroke();
  // зубец на внешнем крае через сегмент
  if(i%2===0){const [zx,zy]=P(ro-2.5,am),w=Math.max(4,Math.abs(bx-ax)*0.55);hp(()=>c.rect(zx-w/2,zy-H-6,w,6),topc,1);hp(()=>c.rect(zx-w/2,zy-H-6,w,1.6),shade(topc,1.12),0)}
  if(k===4&&i%3===0){const [sx,sy]=P(ro+1,am);c.strokeStyle='#b9c0c8';c.lineWidth=1.6;c.beginPath();c.moveTo(sx,sy-8);c.lineTo(sx+Math.cos(am)*9,sy+Math.sin(am)*7-6);c.stroke()}
}
return {use,setNoFx:v=>{NOFX=v},hqFx,ground,tuft,tree,boulder,deposit,plaza,HQ,fenceSeg,detailTile,GROUND,STONE_COL,shadow,hp};
})();
