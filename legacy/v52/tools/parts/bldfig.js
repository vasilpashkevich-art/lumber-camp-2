// --- постройки и жители (v43): стиль героев, ночью горят окна
const BLD=(()=>{let c=null,NIGHT=false;
const O='#24180f';
function hp(fn,fill,lw=1.2){c.beginPath();fn();if(fill){c.fillStyle=fill;c.fill()}if(lw){c.strokeStyle=O;c.lineWidth=lw;c.stroke()}}
const R=(x,y,w,h)=>()=>c.rect(x,y,w,h);
function sh(x,y,w,h){c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,y,w,h,0,0,7);c.fill()}
function glow(x,y,r,col,a){const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
// бревенчатая стена
function logWall(x,y,w,h,col,dark){hp(R(x,y,w,h),col);c.strokeStyle=dark;c.lineWidth=1;const n=Math.max(2,Math.round(h/6));for(let i=1;i<n;i++){c.beginPath();c.moveTo(x+1,y+i*h/n);c.lineTo(x+w-1,y+i*h/n);c.stroke()}
  for(const sx of [x,x+w])for(let i=0;i<n;i++){hp(()=>c.ellipse(sx,y+(i+0.5)*h/n,2.4,h/n/2-0.2,0,0,7),'#b08a5a',0.8)}}
// каменная кладка
function stoneWall(x,y,w,h,col,line){hp(R(x,y,w,h),col);c.strokeStyle=line;c.lineWidth=0.9;const rh=6;for(let r=0;r*rh<h;r++){const yy=y+r*rh;if(r){c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke()}for(let k=(r%2?5:0);k<w;k+=10){c.beginPath();c.moveTo(x+k,yy);c.lineTo(x+k,Math.min(y+h,yy+rh));c.stroke()}}
  c.fillStyle='rgba(255,255,255,.06)';c.fillRect(x,y,w,2)}
function battl(x,y,w,col,n){const k=w/n;for(let i=0;i<n;i+=2)hp(R(x+i*k,y-5,k,5),col,0.9)}
// крыша-двускатная (фасад): треугольник с черепицей
function roof(x,y,w,h,col,line,over=4){hp(()=>{c.moveTo(x-over,y);c.lineTo(x+w/2,y-h);c.lineTo(x+w+over,y);c.closePath()},col);c.strokeStyle=line;c.lineWidth=0.8;for(let i=1;i<4;i++){const yy=y-h*i/4,dx=(w/2+over)*(1-i/4);c.beginPath();c.moveTo(x+w/2-dx,yy);c.lineTo(x+w/2+dx,yy);c.stroke()}}
// крыша-скат (вид сверху-спереди): трапеция
function roofT(x,y,w,h,col,line,top=0.55){hp(()=>{c.moveTo(x-5,y);c.lineTo(x+w*(1-top)/2,y-h);c.lineTo(x+w-w*(1-top)/2,y-h);c.lineTo(x+w+5,y);c.closePath()},col);c.strokeStyle=line;c.lineWidth=0.8;for(let i=1;i<4;i++){const yy=y-h*i/4,k=i/4*(1-top)/2;c.beginPath();c.moveTo(x-5+(w*k+5*(1-i/4))-5*(1-i/4),yy);c.lineTo(x+w+5-(w*k)-5*i/4,yy);c.stroke()}}
function cone(x,y,r,h,col,line){hp(()=>{c.moveTo(x-r-2,y);c.lineTo(x,y-h);c.lineTo(x+r+2,y);c.quadraticCurveTo(x,y+4,x-r-2,y)},col);c.strokeStyle=line;c.lineWidth=0.8;for(const k of [0.35,0.65]){c.beginPath();c.moveTo(x,y-h);c.lineTo(x-(r+2)*k*2+ (r+2)*k,y+1);c.stroke()}}
function win(x,y,w,h,lit=NIGHT){hp(R(x,y,w,h),lit?'#ffd36a':'#2b2219',1);if(lit)glow(x+w/2,y+h/2,w*2,'255,200,90',0.35);c.strokeStyle=O;c.lineWidth=0.7;c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w/2,y+h);c.moveTo(x,y+h/2);c.lineTo(x+w,y+h/2);c.stroke();hp(R(x-1,y+h,w+2,1.6),'#8a6a43',0.6)}
function door(x,y,w,h,col='#4a3020',arch=true){hp(()=>{c.moveTo(x,y+h);c.lineTo(x,y+(arch?w/2:0));if(arch)c.quadraticCurveTo(x+w/2,y-w*0.3,x+w,y+w/2);else c.lineTo(x+w,y);c.lineTo(x+w,y+h);c.closePath()},col);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=0.7;for(let k=1;k<3;k++){c.beginPath();c.moveTo(x+k*w/3,y+w*0.3);c.lineTo(x+k*w/3,y+h);c.stroke()}c.fillStyle='#c9a24a';c.beginPath();c.arc(x+w*0.75,y+h*0.6,0.9,0,7);c.fill()}
function smoke(x,y,t,n=4){for(let k=0;k<n;k++){const q=((t*0.35+k/n)%1);c.fillStyle=`rgba(190,190,180,${0.4*(1-q)})`;c.beginPath();c.arc(x+Math.sin(q*4+k)*4+q*8,y-q*30,3+q*6,0,7);c.fill()}}
function fire(x,y,s,t){glow(x,y-4*s,26*s,'255,150,50',0.45);for(let i=0;i<3;i++){const f=1+0.15*Math.sin(t*9+i*2);c.fillStyle=['#ff6a2a','#ffb347','#fff2a0'][i];const w=(8-i*2.5)*s,h=(16-i*4.5)*s*f;c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x-w*0.6,y-h*0.6,x+Math.sin(t*5)*s,y-h);c.quadraticCurveTo(x+w*0.6,y-h*0.6,x+w,y);c.fill()}}
function logs(x,y,s){for(const [a,dx] of [[0.5,-1],[-0.5,1]]){c.save();c.translate(x,y);c.rotate(a);hp(R(-9*s,-2*s,18*s,4*s),'#6b4a2c',0.9);hp(()=>c.ellipse(9*s,0,1.4*s,2*s,0,0,7),'#c9a06a',0.6);c.restore()}}
function stoneRing(x,y,r,n){for(let i=0;i<n;i++){const a=i/n*6.283;hp(()=>c.ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r*0.5,3.6,2.6,0,0,7),i%2?'#7a776f':'#8a867d',0.8)}}
function flag(x,y,t,col='#c43a2c',h=18){c.strokeStyle='#3a2a1c';c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.stroke();const w=Math.sin(t*4)*2;hp(()=>{c.moveTo(x,y-h);c.quadraticCurveTo(x+6,y-h-2+w,x+12,y-h+1+w);c.lineTo(x+11,y-h+7+w);c.quadraticCurveTo(x+6,y-h+5,x,y-h+7);c.closePath()},col,0.9);c.fillStyle='#f4c766';c.beginPath();c.arc(x+6,y-h+3.5+w/2,1.4,0,7);c.fill()}
function torch(x,y,t){hp(R(x-1,y-7,2,8),'#4a3020',0.6);fire(x,y-7,0.35,t)}
// ===== РАТУША =====
const HQ={
1(t){sh(0,4,24,7);stoneRing(0,0,10,7);logs(0,-1,0.8);fire(0,-2,0.7,t);hp(R(-26,4,14,4),'#7b5634',0.9)},
2(t){sh(0,6,34,9);stoneRing(0,0,14,9);logs(0,-1,1);fire(0,-2,1,t);
  c.strokeStyle=O;c.lineWidth=2;c.beginPath();c.moveTo(-10,2);c.lineTo(0,-24);c.lineTo(10,2);c.moveTo(0,-24);c.lineTo(0,-14);c.stroke();hp(()=>{c.moveTo(-5,-14);c.lineTo(5,-14);c.quadraticCurveTo(5,-6,0,-6);c.quadraticCurveTo(-5,-6,-5,-14)},'#3a3632',0.9);
  for(const bx of [-28,22])logWall(bx,6,12,5,'#7b5634','#5a3e26')},
3(t){sh(0,4,46,12);
  hp(()=>{c.moveTo(-40,-6);c.lineTo(-8,-56);c.lineTo(28,-6);c.closePath()},'#8a7652');hp(()=>{c.moveTo(-8,-56);c.lineTo(28,-6);c.lineTo(4,-6);c.closePath()},'#6d5c3f');
  c.strokeStyle='#5a4a30';c.lineWidth=0.8;for(let i=1;i<5;i++){c.beginPath();c.moveTo(-8-i*6,-56+i*10);c.lineTo(-8+i*7,-56+i*10);c.stroke()}
  hp(()=>{c.moveTo(-16,-6);c.quadraticCurveTo(-10,-28,-4,-6);c.closePath()},'#2b2219');
  c.strokeStyle='#4a3020';c.lineWidth=2;c.beginPath();c.moveTo(-12,-60);c.lineTo(-6,-52);c.moveTo(-4,-60);c.lineTo(-10,-52);c.stroke();
  for(let i=0;i<3;i++)hp(R(32+i*6,-24,2,22),'#6b4a2c',0.6);hp(R(30,-24,22,2),'#6b4a2c',0.6);for(let i=0;i<3;i++)hp(()=>c.ellipse(36+i*6,-18,2.5,5,0,0,7),'#a8442a',0.6);
  stoneRing(10,14,11,8);logs(10,13,0.8);fire(10,12,0.85,t)},
4(t){sh(0,4,54,13);
  hp(R(-44,-8,88,6),'#5a4128',1);for(const px of [-40,-14,14,40])hp(R(px-2,-38,4,30),'#6b4a2c',0.9);
  logWall(-36,-44,72,38,'#7b5634','#5a3e26');
  roof(-36,-44,72,34,'#4a3424','#3a2818',8);hp(R(-38,-48,76,4),'#3a2818',0.9);
  c.fillStyle='#c9a06a';c.beginPath();c.moveTo(0,-78);c.lineTo(-5,-72);c.lineTo(5,-72);c.fill();
  hp(R(18,-88,10,18),'#6a6560',1);hp(R(16,-90,14,4),'#55514c',0.9);smoke(23,-92,t);
  door(-7,-28,14,22,'#4a3020');win(-28,-34,10,9);win(18,-34,10,9);
  hp(R(-3,-62,6,6),NIGHT?'#ffd36a':'#2b2219',0.8);
  for(const tx of [-46,46])torch(tx,-6,t);
  stoneRing(0,14,10,8);fire(0,12,0.7,t)},
5(t){sh(0,6,66,15);
  // каменная крепость: донжон и две башенки
  for(const tx of [-50,40]){stoneWall(tx,-62,20,58,'#77746c','#5c5a54');battl(tx,-62,20,'#86837a',5);win(tx+7,-50,6,9)}
  stoneWall(-30,-74,70,70,'#86837a','#66635c');battl(-30,-74,70,'#949189',9);
  hp(R(-14,-98,38,26),'#7a5634',1);roof(-14,-98,38,18,'#5a2a22','#3a1a14',4);
  win(-6,-92,7,10);win(8,-92,7,10);
  door(-4,-30,18,26,'#3a2418');hp(()=>{c.moveTo(-6,-30);c.quadraticCurveTo(5,-44,16,-30)},null,1.4);
  for(const wx of [-22,24])win(wx,-58,8,11);
  flag(5,-116,t,'#c43a2c',16);for(const tx of [-40,50])flag(tx,-67,t+tx,'#2f5d8a',12);
  for(const tx of [-34,44])torch(tx,-8,t)},
6(t){sh(0,8,82,18);
  // замок: стена с воротами, донжон с высокой башней, круглые угловые башни
  stoneWall(-62,-44,124,40,'#8a877e','#68655e');battl(-62,-44,124,'#97948b',15);
  for(const tx of [-70,70]){hp(R(tx-14,-74,28,70),'#7e7b73');stoneWall(tx-14,-74,28,70,'#7e7b73','#605e58');cone(tx,-74,15,28,'#5a2a22','#3a1a14');win(tx-3,-58,6,9);win(tx-3,-36,6,9);flag(tx,-102,t+tx*0.1,'#c43a2c',14)}
  stoneWall(-30,-96,60,54,'#96938a','#706d66');battl(-30,-96,60,'#a3a097',7);
  stoneWall(-12,-132,24,38,'#9a978e','#74716a');cone(0,-132,14,30,'#5a2a22','#3a1a14');flag(0,-162,t,'#c9a24a',18);
  win(-4,-124,8,11);for(const wx of [-22,14])win(wx,-84,8,12);
  hp(()=>{c.arc(0,-64,7,0,7)},'#c9a24a',1);c.fillStyle='#c43a2c';c.beginPath();c.moveTo(0,-69);c.lineTo(4,-62);c.lineTo(-4,-62);c.fill();
  hp(()=>{c.moveTo(-13,-4);c.lineTo(-13,-26);c.quadraticCurveTo(0,-40,13,-26);c.lineTo(13,-4);c.closePath()},'#2a1e16',1.3);
  c.strokeStyle='#6a6560';c.lineWidth=1.3;for(let k=-9;k<=9;k+=4.5){c.beginPath();c.moveTo(k,-30);c.lineTo(k,-6);c.stroke()}for(let k=-24;k<-6;k+=6){c.beginPath();c.moveTo(-12,k);c.lineTo(12,k);c.stroke()}
  for(const tx of [-20,20])torch(tx,-12,t);
  hp(R(-16,-4,32,10),'#5a4128',1);c.strokeStyle='#3a2818';c.lineWidth=0.8;for(let k=-12;k<16;k+=5){c.beginPath();c.moveTo(k,-4);c.lineTo(k,6);c.stroke()}},
ruins(t){sh(0,6,52,12);
  for(const [x,y,w,h] of [[-44,-30,16,26],[-24,-18,10,14],[26,-36,18,32],[8,-12,12,8]])stoneWall(x,y,w,h,'#5a5650','#403d38');
  c.save();c.translate(-6,-10);c.rotate(-0.4);hp(R(-22,-3,44,6),'#3a2a1c',1);c.restore();c.save();c.translate(10,-4);c.rotate(0.25);hp(R(-16,-2.5,32,5),'#2e2218',1);c.restore();
  for(let i=0;i<9;i++)hp(R(-40+i*9,0+(i%3)*3,6,4),'#4a4640',0.7);
  smoke(-30,-34,t);smoke(34,-40,t+0.5);c.fillStyle='rgba(255,120,40,.8)';for(const [x,y] of [[-4,-4],[12,-2],[-18,2]]){c.beginPath();c.arc(x,y,1.3+Math.sin(t*6+x)*0.5,0,7);c.fill()}}
};
// ===== ЗДАНИЯ ЛАГЕРЯ =====
function sklad(fill,t){sh(4,6,40,9);
  for(const px of [-30,30])hp(R(px-2,-30,4,30),'#6b4a2c',0.9);roof(-32,-30,64,16,'#7a5a3a','#5a4128',5);hp(R(-34,-31,68,3),'#5a4128',0.9);
  logWall(-30,-26,24,24,'#7b5634','#5a3e26');door(-24,-20,12,18,'#4a3020',false);
  // поленница
  const n=Math.round(fill*12);for(let i=0;i<n;i++){const row=Math.floor(i/4),col=i%4;hp(()=>c.ellipse(-2+col*7+(row%2)*3.5,-4-row*6,3.4,3,0,0,7),i%3?'#8d6540':'#7b5634',0.8);c.fillStyle='#c9a06a';c.beginPath();c.arc(-2+col*7+(row%2)*3.5,-4-row*6,1.4,0,7);c.fill()}
  // камень
  const ns=Math.round(fill*7);for(let i=0;i<ns;i++){hp(()=>c.ellipse(36+(i%3)*6-(i>2?3:0)-(i>5?3:0),2-Math.floor(i/3)*4,4,3,0,0,7),i%2?'#8a867d':'#77736a',0.8)}
  // ящик железа
  if(fill>0.3){hp(R(-46,-8,12,10),'#6b4a2c',0.9);c.strokeStyle='#3a2818';c.lineWidth=0.7;c.beginPath();c.moveTo(-46,-3);c.lineTo(-34,-3);c.stroke();for(let i=0;i<Math.round(fill*3);i++)hp(R(-45+i*3.6,-11,3,3),'#a9b0b8',0.6)}
  hp(R(-26,-42,22,8),'#c9a06a',0.9);c.fillStyle=O;c.font='700 6px sans-serif';c.textAlign='center';c.fillText('СКЛАД',-15,-36)}
function house(v,t){sh(0,6,24,7);logWall(-17,-20,34,20,['#7b5634','#8a6240','#6e4b2c'][v%3],'#5a3e26');roof(-17,-20,34,18,['#a8873e','#4a3424','#7a3a2a'][v%3],'rgba(0,0,0,.3)',5);
  if(v%3===0){c.strokeStyle='#8a6a2a';c.lineWidth=0.6;for(let i=0;i<8;i++){c.beginPath();c.moveTo(-20+i*5,-20);c.lineTo(-18+i*4.5,-24);c.stroke()}}
  hp(R(8,-40,6,12),'#6a6560',0.9);smoke(11,-42,t+v);door(-4,-14,8,14);win(-14,-15,7,6);win(8,-15,7,6);
  hp(R(-26,-2,8,4),'#5d8a3a',0.7);for(let i=0;i<3;i++){c.fillStyle='#d8a040';c.beginPath();c.arc(-24+i*2.5,-2,1,0,7);c.fill()}}
function forge(t){sh(0,6,36,9);
  stoneWall(-30,-30,22,28,'#6a6660','#4e4b46');hp(R(-26,-14,14,10),'#2a1a10',1);glow(-19,-9,20,'255,140,40',0.6);c.fillStyle='#ffb347';c.fillRect(-24,-10,10,4);
  hp(R(-27,-52,10,22),'#5e5a54',1);for(let i=0;i<5;i++){const q=((t*1.2+i/5)%1);c.fillStyle=`rgba(255,${150+i*15},60,${1-q})`;c.fillRect(-22+Math.sin(t*4+i)*4,-54-q*24,1.6,1.6)}smoke(-22,-56,t,3);
  for(const px of [-8,30])hp(R(px-2,-32,4,32),'#6b4a2c',0.9);roofT(-34,-32,68,12,'#5a4a42','#3a3028',0.85);
  hp(()=>{c.moveTo(6,-6);c.lineTo(22,-6);c.lineTo(20,-10);c.lineTo(10,-10);c.closePath()},'#4a4c50',1);hp(R(12,-6,6,6),'#3a3c40',0.9);hp(()=>{c.moveTo(22,-10);c.lineTo(26,-9);c.lineTo(22,-8)},'#4a4c50',0.6);
  c.strokeStyle='#8a6a43';c.lineWidth=1.6;c.beginPath();c.moveTo(14,-14);c.lineTo(20,-20);c.stroke();hp(R(19,-23,5,4),'#8e959b',0.6);
  hp(()=>c.ellipse(0,-6,5,3,0,0,7),'#7a5a3a',0.8);for(let i=0;i<3;i++){const q=((t*2+i/3)%1);c.fillStyle=`rgba(255,220,120,${1-q})`;c.fillRect(16+q*10*(i-1),-12-q*8,1.4,1.4)}}
function workshop(l,t){sh(0,6,34,9);logWall(-26,-22,52,22,'#6e6e72','#4e4e52');roofT(-30,-22,60,14,'#3a3a40','#2a2a30',0.8);door(-6,-18,12,18,NIGHT?'#ffb347':'#2b2219',false);
  hp(R(-22,-16,10,8),'#4a3020',0.8);c.strokeStyle='#c9d0d4';c.lineWidth=0.8;c.beginPath();c.arc(-17,-12,3,0,7);c.stroke();
  if(l>=2){hp(R(14,-4,14,4),'#8a6a43',0.8);for(const lx of [16,26])hp(R(lx,0,2,6),'#6b4a2c',0.6);hp(R(16,-6,10,2),'#c9a06a',0.6)}
  if(l>=3){c.strokeStyle='#5a4128';c.lineWidth=2;c.beginPath();c.moveTo(30,0);c.lineTo(30,-38);c.lineTo(14,-38);c.stroke();c.strokeStyle='#8e959b';c.lineWidth=0.8;c.beginPath();c.moveTo(16,-38);c.lineTo(16,-26);c.stroke();hp(R(13,-26,6,4),'#8e959b',0.6)}
  hp(R(-30,-34,20,6),'#c9a06a',0.8);c.fillStyle=O;c.font='700 4.4px sans-serif';c.textAlign='center';c.fillText('ремонт',-20,-29.6);
  for(let i=0;i<l;i++){c.fillStyle='#f4c766';c.fillRect(-4+i*4,-28,3,2)}}
function fenceSeg(k,t){const W=70;
  if(k===1){for(let i=0;i<8;i++)hp(R(-W/2+i*10,-16,2.4,18),'#6b4f30',0.7);c.strokeStyle='#9a7a4a';c.lineWidth=2.2;for(const y of [-12,-7,-2]){c.beginPath();c.moveTo(-W/2,y);for(let i=0;i<=14;i++)c.lineTo(-W/2+i*5,y+(i%2?1.4:-1.4));c.stroke()}}
  if(k===2){for(let i=0;i<10;i++){const x=-W/2+i*7;hp(()=>{c.moveTo(x,2);c.lineTo(x,-18);c.lineTo(x+3.2,-24);c.lineTo(x+6.4,-18);c.lineTo(x+6.4,2);c.closePath()},i%2?'#7b5634':'#8d6540',0.9);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+1,-18,1.2,18)}hp(R(-W/2,-12,W,3),'#5a4128',0.8)}
  if(k===3){stoneWall(-W/2,-18,W,20,'#7c7970','#5c5a54');hp(R(-W/2-2,-21,W+4,4),'#8a877e',0.9)}
  if(k===4){stoneWall(-W/2,-24,W,26,'#5c5b63','#45444b');battl(-W/2,-24,W,'#6a6971',9);c.strokeStyle='#a9b0b8';c.lineWidth=1.4;for(let i=0;i<6;i++){c.beginPath();c.moveTo(-W/2+6+i*12,-4);c.lineTo(-W/2+10+i*12,4);c.stroke()}}}
function archer(x,y,t,l,ang=-Math.PI/2,shot=0){hp(()=>c.arc(x,y,3.6,0,7),l>=4?'#3e5a3a':'#5a4a3a',0.8);hp(()=>c.arc(x+0.5,y-3.5,2.6,0,7),'#f2c9a0',0.7);hp(()=>{c.arc(x+0.5,y-4,2.9,Math.PI,0);c.closePath()},l>=4?'#8e959b':'#3e6a3a',0.6);const bx=x+Math.cos(ang)*3,by=y-2+Math.sin(ang)*3;c.strokeStyle='#8d6540';c.lineWidth=1.1;c.beginPath();c.arc(bx,by,4,ang-1.2,ang+1.2);c.stroke();if(shot>0){c.strokeStyle='rgba(236,230,211,.8)';c.lineWidth=0.6;c.beginPath();c.moveTo(bx+Math.cos(ang-1.2)*4,by+Math.sin(ang-1.2)*4);c.lineTo(bx-Math.cos(ang)*shot*8,by-Math.sin(ang)*shot*8);c.lineTo(bx+Math.cos(ang+1.2)*4,by+Math.sin(ang+1.2)*4);c.stroke()}}
function tower(l,t,ang,shot){const S2=[0,1,1.05,1.12,1.18,1.25,1.35][l];c.save();c.scale(S2,S2);sh(0,4,20,6);
  if(l<=3){const h=[0,22,34,44][l];for(const lx of [-12,10])hp(R(lx,-h,3,h+2),'#6b4a2c',0.9);c.strokeStyle='#5a4128';c.lineWidth=1.2;for(let y=-h+6;y<0;y+=8){c.beginPath();c.moveTo(-11,y);c.lineTo(11,y+6);c.moveTo(11,y);c.lineTo(-11,y+6);c.stroke()}
    hp(R(-16,-h-4,32,5),'#7b5634',1);for(let i=0;i<5;i++)hp(R(-15+i*7,-h-11,2.4,7),'#8d6540',0.7);archer(0,-h-8,t,l,ang,shot);
    if(l>=2){for(const lx of [-15,13])hp(R(lx,-h-24,2.2,14),'#6b4a2c',0.7);roof(-17,-h-22,34,12,'#4a3424','#3a2818',3)}
    if(l===3)flag(0,-h-34,t,'#c43a2c',10)}
  else{const h=[0,0,0,0,40,46,58][l],w=l===5?30:26;stoneWall(-w/2,-h,w,h+2,l===6?'#8a877e':'#77746c','#5c5a54');battl(-w/2,-h,w,'#86837a',l===5?7:5);win(-2.5,-h+14,5,8);archer(0,-h-6,t,l,ang,shot);
    if(l===6){cone(0,-h-6,16,26,'#5a2a22','#3a1a14');flag(0,-h-32,t,'#c9a24a',12)}
    if(l===5){for(const sx of [-1,1])flag(sx*13,-h-2,t+sx,'#2f5d8a',10)}}
  c.restore()}
function brazier(l,t){sh(0,6,12,4);hp(R(-2.5,-6,5,12),'#3a3632',0.9);hp(()=>c.ellipse(0,-8,12,5,0,0,7),l>=3?'#7a6a42':'#4a4440');hp(()=>c.ellipse(0,-9,9,3,0,0,7),'#2a1a10',0.7);fire(0,-9,0.9,t)}
function ballista(l,t){sh(0,8,16,5);hp(R(-12,-6,24,12),l>=3?'#5a5a5f':'#4a3424');for(const wx of [-9,9])hp(()=>c.arc(wx,6,4,0,7),'#5a4128',0.8);
  c.strokeStyle=l>=4?'#c9a24a':'#8d6540';c.lineWidth=3.4;c.beginPath();c.arc(-2,-8,16,-2.5,-0.64);c.stroke();c.strokeStyle='#cfd8de';c.lineWidth=0.8;c.beginPath();c.moveTo(-2+Math.cos(-2.5)*16,-8+Math.sin(-2.5)*16);c.lineTo(-2,-2);c.lineTo(-2+Math.cos(-0.64)*16,-8+Math.sin(-0.64)*16);c.stroke();
  hp(R(-14,-10,30,3),'#9ea5aa',0.8);hp(()=>{c.moveTo(16,-12);c.lineTo(22,-8.5);c.lineTo(16,-5);c.closePath()},'#cfd8de',0.7)}
// ===== ЧЕЛОВЕЧКИ (стражник, крестьянин, торговец) =====
function person(o,x,y,s=1,dir=1,t=0){c.save();c.translate(x,y);c.scale(s*dir,s);c.lineJoin='round';c.lineCap='round';const skin='#f2c9a0';
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(0,12.5,9,3,0,0,7);c.fill();
  if(o.cape)hp(()=>{c.moveTo(-6,-5);c.lineTo(5,-5);c.lineTo(3,10);c.quadraticCurveTo(-4,12,-10,9);c.closePath()},o.cape);
  if(o.back)o.back();
  hp(()=>c.roundRect(-5,4,4,8,1.5),o.boot||'#3a2616');hp(()=>c.roundRect(1,4,4,8,1.5),o.boot||'#3a2616');
  const tor=()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(8,6);c.quadraticCurveTo(0,8.5,-8,6);c.closePath()};hp(tor,o.shirt);
  if(o.vest)hp(()=>{c.moveTo(-6,-5);c.lineTo(-1,-6);c.lineTo(0,6.5);c.lineTo(-7,5.5);c.closePath()},o.vest,0.8);
  if(o.plate){hp(()=>{c.moveTo(-5,-5);c.quadraticCurveTo(0,-7,5,-5);c.lineTo(5.5,3);c.quadraticCurveTo(0,5,-5.5,3);c.closePath()},o.plate);c.fillStyle='rgba(255,255,255,.4)';c.fillRect(1,-4,1.4,6)}
  if(o.apron)hp(()=>{c.moveTo(-3,-2);c.lineTo(5,-2);c.lineTo(6,7);c.lineTo(-3,7);c.closePath()},o.apron,0.8);
  hp(R(-8,3.5,16,2.3),o.belt||'#4a3020',0.8);if(o.gold){c.fillStyle='#f4c766';c.fillRect(-1.2,3.5,2.4,2.3)}
  if(o.paul)for(const sx of [-7,7])hp(()=>c.arc(sx,-4,3.6,Math.PI,0),o.paul,0.9);
  hp(()=>c.ellipse(-8,0,2.5,4,0.2,0,7),o.sleeve||o.shirt,0.9);
  if(o.tool)o.tool();
  hp(()=>c.ellipse(8,0,2.5,4,-0.2,0,7),o.sleeve||o.shirt,0.9);hp(()=>c.arc(8.6,3,2.3,0,7),skin,0.9);
  hp(()=>c.arc(0,-12,7.2,0,7),skin);
  if(o.beard)hp(()=>{c.moveTo(-1,-10);c.quadraticCurveTo(3,-8.5,7,-10);c.quadraticCurveTo(6.5,-4,3,-3.5);c.quadraticCurveTo(0,-6,-1,-10)},o.beard,0.9);
  for(const ex of [2.2,5.2]){c.fillStyle=O;c.beginPath();c.ellipse(ex,-12.5,1,1.4,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ex+0.3,-13,0.35,0,7);c.fill()}
  c.fillStyle='rgba(230,110,90,.35)';c.beginPath();c.arc(6.2,-10.2,1.2,0,7);c.fill();
  if(o.hat)o.hat();c.restore()}
const GUARD=[null,
  {shirt:'#5a4a3a',vest:'#7a5a3a',hat(){hp(()=>{c.arc(0,-13.5,7.6,Math.PI,0);c.closePath()},'#7a5a3a');hp(R(-8,-14.5,16,2.4),'#5a4128',0.8)},tool(){c.strokeStyle='#6b4a2c';c.lineWidth=1.8;c.beginPath();c.moveTo(10,10);c.lineTo(13,-22);c.stroke();hp(()=>{c.moveTo(13,-22);c.lineTo(11.5,-27);c.lineTo(15,-22.5)},'#9ea5aa',0.7)}},
  {shirt:'#3e5a3a',vest:'#6b4a2c',cape:'#2f4a2a',hat(){hp(()=>{c.arc(0,-13,8.2,Math.PI,0);c.closePath()},'#55663a');hp(()=>{c.moveTo(-6,-19);c.quadraticCurveTo(-11,-22,-12,-20);c.quadraticCurveTo(-9,-17,-7,-14);c.closePath()},'#55663a',0.8)},tool(){c.strokeStyle='#8d6540';c.lineWidth=1.8;c.beginPath();c.moveTo(11,-12);c.quadraticCurveTo(17,0,11,12);c.stroke();c.strokeStyle='#e8e0cc';c.lineWidth=0.6;c.beginPath();c.moveTo(11,-12);c.lineTo(11,12);c.stroke()}},
  {shirt:'#4a5a6a',plate:'#a9b0b8',paul:'#b8c0c6',boot:'#4c5257',cape:'#3a4a5a',hat(){hp(()=>{c.arc(0,-13,8,Math.PI,0);c.lineTo(8,-13)},'#9aa3aa');hp(R(-8.5,-14.5,17,2.6),'#7c858c',0.9);hp(R(3,-14,2,5.5),'#7c858c',0.7)},tool(){hp(()=>c.ellipse(11,1,4.4,7.4,0,0,7),'#8e959b');hp(()=>c.arc(11.3,1,1.6,0,7),'#c9d0d4',0.7)}},
  {shirt:'#5a3a7a',plate:'#d8b44a',paul:'#e8c860',boot:'#5a4128',cape:'#7a1a2a',gold:true,hat(){hp(()=>{c.arc(0,-13,8,Math.PI,0);c.lineTo(8,-13)},'#d8b44a');hp(R(-8.5,-14.5,17,2.6),'#a8842a',0.9);hp(()=>{c.moveTo(-2,-21);c.quadraticCurveTo(-8,-28,-14,-24);c.quadraticCurveTo(-8,-23,1,-20);c.closePath()},'#c43a2c',0.8)},tool(){hp(()=>c.ellipse(11,1,4.4,7.4,0,0,7),'#d8b44a');c.fillStyle='#c43a2c';c.beginPath();c.moveTo(11.3,-4);c.lineTo(12.8,-1);c.lineTo(9.8,-1);c.fill()}}];
const PEASANT={shirt:'#c9b48a',sleeve:'#b8a070',vest:'#8a6a43',beard:'#8a5a2a',hat(){hp(()=>c.ellipse(0,-15,11,2.6,0,0,7),'#e0c070',0.9);hp(()=>{c.arc(0,-15.5,6.2,Math.PI,0);c.closePath()},'#d8b860',0.9);hp(R(-6,-17,12,1.6),'#a8442a',0.6)},tool(){c.strokeStyle='#8a6a43';c.lineWidth=1.6;c.beginPath();c.moveTo(9,8);c.lineTo(13,-18);c.stroke();for(let i=-1;i<=1;i++){c.strokeStyle='#9ea5aa';c.lineWidth=0.9;c.beginPath();c.moveTo(13+i*2,-18);c.lineTo(13.5+i*2.4,-23);c.stroke()}}};
const MERCH={shirt:'#7a3a5a',sleeve:'#6a2a4a',apron:'#c9a24a',beard:'#3a2a1c',belt:'#3a2618',hat(){hp(()=>c.ellipse(0,-15,9.5,2.4,0,0,7),'#5a2a4a',0.9);hp(()=>{c.moveTo(-6,-16);c.lineTo(-4,-24);c.lineTo(5,-24);c.lineTo(6,-16);c.closePath()},'#6a2a4a',0.9);hp(R(-6,-18,12,1.6),'#f4c766',0.6)},back(){hp(()=>c.roundRect(-14,-14,9,16,2),'#8a6a43');hp(R(-14,-9,9,2),'#5a4128',0.6)},tool(){hp(()=>c.arc(11,4,3,0,7),'#c9a24a',0.8);c.fillStyle='#fff3c0';c.beginPath();c.arc(10.4,3.2,0.8,0,7);c.fill()}};
// ===== МИР =====
function hut(t,opened){sh(0,6,28,8);logWall(-22,-22,44,22,'#5a4128','#3e2c1b');hp(()=>{c.moveTo(-28,-22);c.lineTo(-6,-40);c.lineTo(6,-38);c.lineTo(28,-22);c.closePath()},'#6a5a3a');
  c.strokeStyle='#4a3a20';c.lineWidth=0.8;for(let i=0;i<6;i++){c.beginPath();c.moveTo(-24+i*9,-23);c.lineTo(-20+i*7,-30);c.stroke()}hp(R(-2,-38,8,6),'#4a4640',0.7);
  door(-4,-18,10,18,'#2b2219',false);hp(R(-18,-16,8,6),'#2b2219',0.8);c.strokeStyle='#5a4128';c.lineWidth=1.2;c.beginPath();c.moveTo(-18,-16);c.lineTo(-10,-10);c.stroke();
  if(!opened){glow(16,-4,14,'255,210,90',0.6);hp(R(11,-8,11,8),'#6b4a2c',0.9);hp(R(11,-11,11,4),'#8a6240',0.8);c.fillStyle='#f4c766';c.fillRect(11,-7,11,1.4);c.fillRect(15.5,-9,2,4)}}
function ruinsPoi(t,opened){sh(0,6,30,8);for(const [x,y,w,h] of [[-26,-22,12,20],[-12,-12,10,10],[14,-26,12,24]])stoneWall(x,y,w,h,'#77736a','#5c5a54');for(let i=0;i<6;i++)hp(R(-20+i*7,-2+(i%2)*2,5,4),'#6a665e',0.7);
  c.fillStyle='#5d8a3a';for(const [x,y] of [[-22,-22],[16,-26],[-10,-12]]){c.beginPath();c.ellipse(x+4,y,5,2,0,0,7);c.fill()}
  if(!opened){glow(2,-4,14,'255,210,90',0.6);hp(R(-3,-8,11,8),'#6b4a2c',0.9);hp(R(-3,-11,11,4),'#8a6240',0.8);c.fillStyle='#f4c766';c.fillRect(-3,-7,11,1.4)}}
function farm(lvl,stone,t,pal,tw,broken){
  // поле
  c.save();c.translate(36,14);for(let r=0;r<4;r++){hp(R(-18,-10+r*5,36,4),'#6a4a2a',0.6);for(let i=0;i<6;i++){const g=lvl>=2?'#d8b440':'#7aa83a';c.fillStyle=g;c.beginPath();c.moveTo(-16+i*6,-7+r*5);c.lineTo(-14+i*6,-12+r*5);c.lineTo(-12+i*6,-7+r*5);c.fill()}}c.restore();
  sh(0,6,30,9);
  if(stone){stoneWall(-22,-22,44,22,'#86837a','#66635c');roof(-22,-22,44,18,'#7a3a2a','#5a2418',5)}
  else{logWall(-22,-22,44,22,'#8a6240','#644528');roof(-22,-22,44,18,'#a8873e','#8a6a2a',5)}
  door(-4,-16,9,16);win(-17,-16,7,6);win(10,-16,7,6);hp(R(10,-42,6,12),'#6a6560',0.8);if(!broken)smoke(13,-44,t);
  if(lvl>=2){hp(R(-52,-18,22,18),'#a8442a');roof(-52,-18,22,12,'#6a3a24','#4a2418',3);c.strokeStyle='#e8d8b8';c.lineWidth=1;c.beginPath();c.moveTo(-50,-16);c.lineTo(-32,-2);c.moveTo(-32,-16);c.lineTo(-50,-2);c.stroke();hp(()=>{c.moveTo(-58,4);c.quadraticCurveTo(-54,-10,-48,4)},'#e0c060',0.8)}
  if(lvl>=3){c.save();c.translate(60,-20);hp(R(-5,-26,10,30),stone?'#86837a':'#c9b48a');roof(-6,-26,12,8,'#6a3a24','#4a2418',2);c.translate(0,-22);c.rotate(t*1.4);for(let i=0;i<4;i++){c.rotate(Math.PI/2);hp(R(-1.4,0,2.8,20),'#8a6a43',0.6);hp(R(1.4,6,5,13),'#e8dcc4',0.6)}hp(()=>c.arc(0,0,2,0,7),'#5a4128',0.7);c.restore()}
  if(pal){c.strokeStyle=O;for(let i=0;i<18;i++){const a=Math.PI*0.15+i/17*Math.PI*0.7,x=Math.cos(a)*74,y=12+Math.sin(a)*22;hp(()=>{c.moveTo(x-2,y);c.lineTo(x-2,y-10);c.lineTo(x,y-13);c.lineTo(x+2,y-10);c.lineTo(x+2,y)},'#8d6540',0.7)}}
  if(tw){c.save();c.translate(-70,6);for(const lx of [-7,5])hp(R(lx,-30,2.4,30),'#6b4a2c',0.8);hp(R(-10,-34,22,4),'#7b5634',0.9);roof(-10,-34,22,9,'#4a3424','#3a2818',2);c.restore();c.save();c.translate(-70,6);person({shirt:'#8a6a43',hat(){hp(()=>c.ellipse(0,-15,8,2,0,0,7),'#c9a24a',0.6)}},0,-46,0.55,1,t);c.restore()}
  if(broken){hp(()=>{c.moveTo(-8,-34);c.lineTo(-2,-26);c.lineTo(8,-30);c.lineTo(4,-36);c.lineTo(0,-32);c.closePath()},'#1a120c',0.9);c.fillStyle='rgba(30,20,12,.55)';c.beginPath();c.ellipse(-12,-8,8,6,0,0,7);c.ellipse(14,-12,6,5,0,0,7);c.fill();c.save();c.translate(-14,2);c.rotate(0.5);hp(R(-10,-2,20,4),'#3a2818',0.8);c.restore();c.save();c.translate(14,4);c.rotate(-0.3);hp(R(-8,-2,16,4),'#3a2818',0.8);c.restore();c.fillStyle='rgba(255,120,40,.85)';for(const [x,y] of [[-2,-28],[6,-30],[-12,-6]]){c.beginPath();c.arc(x,y,1.2,0,7);c.fill()}smoke(0,-34,t);smoke(-10,-12,t+0.6)}}
function road(){c.lineCap='round';c.strokeStyle='#3f3524';c.lineWidth=20;c.beginPath();c.moveTo(-120,10);c.quadraticCurveTo(0,-10,120,8);c.stroke();c.strokeStyle='#5a4a32';c.lineWidth=15;c.stroke();
  c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.6;for(const o of [-3.5,3.5]){c.beginPath();c.moveTo(-120,10+o);c.quadraticCurveTo(0,-10+o,120,8+o);c.stroke()}
  for(let i=0;i<14;i++){const x=-110+i*17,y=7-Math.sin((i/14)*Math.PI)*9+((i*7)%5-2);hp(()=>c.ellipse(x,y,2.4,1.6,0,0,7),'#8a867d',0.6)}
  c.strokeStyle='#4a6a2a';c.lineWidth=1.2;for(let i=0;i<10;i++){const x=-114+i*25,y=-2-Math.sin((i/10)*Math.PI)*9;c.beginPath();c.moveTo(x,y);c.lineTo(x-1,y-4);c.moveTo(x+2,y);c.lineTo(x+3,y-3.5);c.stroke()}}
function cart(t,stone){sh(0,10,26,6);c.save();c.translate(-30,0);hp(()=>c.ellipse(0,0,12,6.5,0,0,7),'#8a6a4a');hp(()=>c.arc(11,-4,4.5,0,7),'#8a6a4a',1);c.fillStyle=O;c.beginPath();c.arc(13,-5,0.9,0,7);c.fill();for(const lx of [-8,-3,3,8])hp(R(lx,4,2.2,6),'#6a4a2a',0.6);hp(()=>{c.moveTo(9,-8);c.lineTo(8,-11);c.lineTo(11,-8.5)},'#e8e0cc',0.6);c.restore();
  c.strokeStyle='#5a4128';c.lineWidth=1.6;c.beginPath();c.moveTo(-20,-2);c.lineTo(-8,-4);c.stroke();
  hp(R(-8,-14,30,12),'#8d6540');c.strokeStyle='#5a4128';c.lineWidth=0.8;for(let i=1;i<3;i++){c.beginPath();c.moveTo(-8,-14+i*4);c.lineTo(22,-14+i*4);c.stroke()}
  if(stone){for(let i=0;i<4;i++)hp(()=>c.ellipse(-3+i*7,-16,3.6,2.8,0,0,7),i%2?'#8a867d':'#77736a',0.7);hp(()=>c.ellipse(7,-20,3.4,2.6,0,0,7),'#8a867d',0.7)}else if(stone===false){for(let i=0;i<4;i++)hp(()=>c.ellipse(-3+i*7,-16,3.4,2.4,0,0,7),'#7b5634',0.7);hp(()=>c.ellipse(7,-19,3.4,2.4,0,0,7),'#8d6540',0.7)}
  for(const wx of [-3,17]){hp(()=>c.arc(wx,-1,5.5,0,7),'#5a4128',1.1);c.strokeStyle=O;c.lineWidth=0.7;for(let k=0;k<3;k++){const a=k*Math.PI/3+t*3;c.beginPath();c.moveTo(wx+Math.cos(a)*5,-1+Math.sin(a)*5);c.lineTo(wx-Math.cos(a)*5,-1-Math.sin(a)*5);c.stroke()}}}
function crypt(t,used){sh(0,8,40,10);stoneWall(-30,-30,60,30,'#5a5664','#423f4a');roof(-34,-30,68,22,'#3a3644','#2a2834',2);
  hp(()=>c.arc(0,-46,5,0,7),'#5a5664',1);hp(R(-1.2,-58,2.4,10),'#77736a',0.7);hp(R(-4,-55,8,2.4),'#77736a',0.7);
  for(const px of [-26,20])hp(R(px,-30,6,30),'#6a6674',1);
  hp(()=>{c.moveTo(-11,0);c.lineTo(-11,-16);c.quadraticCurveTo(0,-28,11,-16);c.lineTo(11,0);c.closePath()},used?'#2a2430':'#160e1e',1.2);
  if(!used){glow(0,-10,26,'190,120,255',0.5);c.fillStyle='rgba(200,150,255,.8)';for(let i=0;i<5;i++){const q=((t*0.6+i/5)%1);c.fillRect(-8+i*4,-4-q*22,1.4,1.4)}}
  hp(()=>{c.arc(0,-12,3.4,0,7)},'#e6dcc4',0.7);c.fillStyle=O;c.fillRect(-1.8,-13,1.2,1.2);c.fillRect(0.6,-13,1.2,1.2);
  for(const tx of [-36,36])torch(tx,0,t)}
function portal(t){sh(0,10,40,10);c.save();c.scale(1,1);const g=c.createRadialGradient(0,-26,2,0,-26,24);g.addColorStop(0,'rgba(255,120,100,.9)');g.addColorStop(0.5,'rgba(160,20,40,.7)');g.addColorStop(1,'rgba(40,0,10,.9)');c.fillStyle=g;c.beginPath();c.ellipse(0,-26,18,26,0,0,7);c.fill();
  c.strokeStyle='rgba(255,180,160,.7)';c.lineWidth=1.4;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,-26,16-i*5,24-i*7,t*(1+i*0.5),0,4);c.stroke()}c.restore();
  for(let i=0;i<9;i++){const a=Math.PI*0.95+i/8*Math.PI*1.1,x=Math.cos(a)*24,y=-26+Math.sin(a)*32;hp(()=>{c.save();c.translate(x,y);c.rotate(a+Math.PI/2);c.rect(-5,-4,10,8);c.restore()},'#4a4250',1);c.fillStyle='#ff5a3a';c.beginPath();c.arc(x,y,1.2,0,7);c.fill()}
  glow(0,-26,46,'255,60,40',0.25)}
function mound(t,dead){sh(0,4,32,8);hp(()=>{c.moveTo(-30,4);c.quadraticCurveTo(-24,-18,0,-20);c.quadraticCurveTo(24,-18,30,4);c.closePath()},dead?'#4a4038':'#4a3b2c',1.2);
  c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(8,-4,16,8,0,0,7);c.fill();
  for(const [x,y,s] of [[-12,-16,1],[6,-20,1.2],[18,-10,0.9]]){c.save();c.translate(x,y);c.scale(s,s);hp(()=>c.roundRect(-4,-12,8,13,[4,4,0,0]),dead?'#6a6660':'#77736a',0.9);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=0.7;c.beginPath();c.moveTo(0,-9);c.lineTo(0,-3);c.moveTo(-2,-7);c.lineTo(2,-7);c.stroke();c.restore()}
  c.strokeStyle='#5a4128';c.lineWidth=1.8;c.beginPath();c.moveTo(-22,0);c.lineTo(-22,-12);c.moveTo(-25,-9);c.lineTo(-19,-9);c.stroke();
  if(!dead){const p=0.5+0.5*Math.sin(t*3);glow(0,-12,40,'150,90,200',0.25+p*0.15);for(let i=0;i<4;i++){const a=t+i*1.6,x=Math.cos(a)*18,y=-14+Math.sin(a)*6;c.fillStyle='rgba(200,150,255,.8)';c.beginPath();c.arc(x,y,1.4,0,7);c.fill()}}}
function stall(t){sh(0,8,34,8);for(const px of [-26,24])hp(R(px,-30,3,30),'#6b4a2c',0.9);hp(()=>{c.moveTo(-32,-30);c.lineTo(32,-30);c.lineTo(28,-40);c.lineTo(-28,-40);c.closePath()},'#c43a2c');c.fillStyle='#f0e6d0';for(let i=0;i<6;i++)c.fillRect(-28+i*10,-40,5,10);c.strokeStyle=O;c.lineWidth=1;c.beginPath();c.moveTo(-32,-30);c.lineTo(32,-30);c.stroke();
  for(let i=0;i<7;i++){const x=-28+i*9.5;hp(()=>{c.moveTo(x,-30);c.quadraticCurveTo(x+4.75,-25,x+9.5,-30)},i%2?'#f0e6d0':'#c43a2c',0.7)}
  hp(R(-26,-12,52,8),'#8a6240');for(const [x,col] of [[-20,'#cf4b3f'],[-12,'#e8822e'],[-4,'#7ec8ff'],[4,'#f4c766'],[12,'#9fc07a']]){hp(()=>c.arc(x,-15,2.6,0,7),col,0.7)}hp(R(16,-20,8,8),'#6b4a2c',0.8);
  person(MERCH,0,-6,0.85,1,t)}
// забор кольцом (как в игре): задняя половина до построек, передняя — после
function fenceRing(cx,cy,Rr,k,front){const n=k===2?96:72;
  for(let i=0;i<n;i++){const a0=i/n*6.283,a1=(i+1)/n*6.283,am=(a0+a1)/2;if((Math.sin(am)>0)!==front)continue;const px=cx+Math.cos(am)*Rr,py=cy+Math.sin(am)*Rr;
    if(k===1){c.strokeStyle=O;c.lineWidth=6;c.beginPath();c.arc(cx,cy,Rr,a0,a1+0.01);c.stroke();c.strokeStyle='#9a7a4a';c.lineWidth=4;c.stroke();if(i%3===0)hp(R(px-1.5,py-8,3,10),'#6b4f30',0.7)}
    if(k===2){hp(()=>{c.moveTo(px-3,py+2);c.lineTo(px-3,py-13);c.lineTo(px,py-18);c.lineTo(px+3,py-13);c.lineTo(px+3,py+2);c.closePath()},i%2?'#7b5634':'#8d6540',0.8)}
    if(k>=3){const col=k===3?'#7c7970':'#5c5b63',top=k===3?'#8a877e':'#6a6971',hgt=k===3?12:16;
      c.fillStyle=O;c.beginPath();c.moveTo(cx+Math.cos(a0)*(Rr-4),cy+Math.sin(a0)*(Rr-4));c.lineTo(cx+Math.cos(a1)*(Rr-4),cy+Math.sin(a1)*(Rr-4));c.lineTo(cx+Math.cos(a1)*(Rr+4),cy+Math.sin(a1)*(Rr+4)-hgt);c.lineTo(cx+Math.cos(a0)*(Rr+4),cy+Math.sin(a0)*(Rr+4)-hgt);c.fill();
      const x0=cx+Math.cos(a0)*Rr,y0=cy+Math.sin(a0)*Rr,x1=cx+Math.cos(a1)*Rr,y1=cy+Math.sin(a1)*Rr;hp(()=>{c.moveTo(x0,y0+2);c.lineTo(x1,y1+2);c.lineTo(x1,y1-hgt);c.lineTo(x0,y0-hgt);c.closePath()},col,0.8);
      c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=0.6;c.beginPath();c.moveTo(x0,y0-hgt/2);c.lineTo(x1,y1-hgt/2);c.stroke();
      if(k===4&&i%2===0)hp(R((x0+x1)/2-3,(y0+y1)/2-hgt-5,6,5),top,0.7);else hp(()=>{c.moveTo(x0,y0-hgt);c.lineTo(x1,y1-hgt);c.lineTo(x1,y1-hgt-2);c.lineTo(x0,y0-hgt-2);c.closePath()},top,0.6)}}}

// хутор для игры: дом, амбар (ур. 2+), мельница (ур. 3), поле; ограду, вышку и склад рисует игра
function farmG(lvl,stone,t,broken){
  c.save();c.translate(4,30);for(let r=0;r<3;r++){hp(R(-20,-6+r*5,40,4),'#6a4a2a',0.6);for(let i=0;i<7;i++){c.fillStyle=lvl>=2?'#d8b440':'#7aa83a';c.beginPath();c.moveTo(-18+i*5.6,-3+r*5);c.lineTo(-16+i*5.6,-8+r*5);c.lineTo(-14+i*5.6,-3+r*5);c.fill()}}c.restore();
  if(lvl>=3){c.save();c.translate(-30,-30);hp(R(-5,-26,10,30),stone?'#86837a':'#c9b48a');roof(-6,-26,12,8,'#6a3a24','#4a2418',2);c.translate(0,-22);c.rotate(broken?0.3:t*1.4);for(let i=0;i<4;i++){c.rotate(Math.PI/2);hp(R(-1.4,0,2.8,20),'#8a6a43',0.6);hp(R(1.4,6,5,13),'#e8dcc4',0.6)}hp(()=>c.arc(0,0,2,0,7),'#5a4128',0.7);c.restore()}
  if(lvl>=2){c.save();c.translate(38,-6);hp(R(-11,-18,22,18),'#a8442a');roof(-11,-18,22,12,'#6a3a24','#4a2418',3);c.strokeStyle='#e8d8b8';c.lineWidth=1;c.beginPath();c.moveTo(-9,-16);c.lineTo(9,-2);c.moveTo(9,-16);c.lineTo(-9,-2);c.stroke();hp(()=>{c.moveTo(12,2);c.quadraticCurveTo(16,-12,22,2)},'#e0c060',0.8);c.restore()}
  sh(0,4,28,8);
  if(stone){stoneWall(-22,-22,44,22,'#86837a','#66635c');roof(-22,-22,44,18,'#7a3a2a','#5a2418',5)}
  else{logWall(-22,-22,44,22,'#8a6240','#644528');roof(-22,-22,44,18,'#a8873e','#8a6a2a',5)}
  door(-4,-16,9,16);win(-17,-16,7,6);win(10,-16,7,6);hp(R(10,-42,6,12),'#6a6560',0.8);
  if(broken){hp(()=>{c.moveTo(-8,-34);c.lineTo(-2,-26);c.lineTo(8,-30);c.lineTo(4,-36);c.lineTo(0,-32);c.closePath()},'#1a120c',0.9);c.fillStyle='rgba(30,20,12,.55)';c.beginPath();c.ellipse(-12,-8,8,6,0,0,7);c.ellipse(14,-12,6,5,0,0,7);c.fill();c.save();c.translate(-14,2);c.rotate(0.5);hp(R(-10,-2,20,4),'#3a2818',0.8);c.restore();c.fillStyle='rgba(255,120,40,.85)';for(const [x,y] of [[-2,-28],[6,-30],[-12,-6]]){c.beginPath();c.arc(x,y,1.2,0,7);c.fill()}smoke(0,-34,t);smoke(-10,-12,t+0.6)}
  else smoke(13,-44,t)}
// один кусок забора по кругу (для сортировки по глубине)
function fenceSegG(cx,cy,Rr,k,i,n,broken){const a0=i/n*6.283,a1=(i+1)/n*6.283,am=(a0+a1)/2,px=cx+Math.cos(am)*Rr,py=cy+Math.sin(am)*Rr;
  if(broken){c.strokeStyle='rgba(120,90,60,.3)';c.lineWidth=3;c.beginPath();c.arc(cx,cy,Rr,a0,a1);c.stroke();if(i%3===0){c.fillStyle='rgba(60,45,30,.6)';c.fillRect(px-2,py-2,4,3)}return}
  if(k===1){c.strokeStyle=O;c.lineWidth=6;c.beginPath();c.arc(cx,cy,Rr,a0,a1+0.01);c.stroke();c.strokeStyle='#9a7a4a';c.lineWidth=4;c.stroke();c.strokeStyle='#7a5a32';c.lineWidth=1;c.beginPath();c.arc(cx,cy,Rr+(i%2?1:-1),a0,a1);c.stroke();if(i%3===0)hp(R(px-1.5,py-8,3,10),'#6b4f30',0.7);return}
  if(k===2){hp(()=>{c.moveTo(px-3,py+2);c.lineTo(px-3,py-13);c.lineTo(px,py-18);c.lineTo(px+3,py-13);c.lineTo(px+3,py+2);c.closePath()},i%2?'#7b5634':'#8d6540',0.8);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(px-2,py-13,1,14);return}
  const col=k===3?'#7c7970':'#5c5b63',top=k===3?'#8a877e':'#6a6971',hgt=k===3?12:16;
  const x0=cx+Math.cos(a0)*Rr,y0=cy+Math.sin(a0)*Rr,x1=cx+Math.cos(a1)*Rr,y1=cy+Math.sin(a1)*Rr;hp(()=>{c.moveTo(x0,y0+2);c.lineTo(x1,y1+2);c.lineTo(x1,y1-hgt);c.lineTo(x0,y0-hgt);c.closePath()},col,0.8);
  c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=0.6;c.beginPath();c.moveTo(x0,y0-hgt/2);c.lineTo(x1,y1-hgt/2);c.stroke();
  if(k===4&&i%2===0)hp(R((x0+x1)/2-3,(y0+y1)/2-hgt-5,6,5),top,0.7);else hp(()=>{c.moveTo(x0,y0-hgt);c.lineTo(x1,y1-hgt);c.lineTo(x1,y1-hgt-2);c.lineTo(x0,y0-hgt-2);c.closePath()},top,0.6);
  if(k===4&&i%3===0){c.strokeStyle='#a9b0b8';c.lineWidth=1.2;const ox=Math.cos(am)*5,oy=Math.sin(am)*5;c.beginPath();c.moveTo(px+ox,py+oy-3);c.lineTo(px+ox*2.2,py+oy*2.2-2);c.stroke()}}

return {use(ctx,n){c=ctx;NIGHT=n},HQ,sklad,house,forge,workshop,tower,brazier,ballista,person,GUARD,PEASANT,MERCH,hut,ruinsPoi,cart,crypt,portal,mound,stall,farm:farmG,fenceSeg:fenceSegG,stoneWall,logWall,hp:(...a)=>hp(...a)};
})();
// нарисовать постройку в точке: x,y — основание, s — масштаб
function bd(x,y,s,f,dir=1){ctx.save();ctx.translate(x,y);ctx.scale(s*dir,s);ctx.lineJoin='round';ctx.lineCap='round';BLD.use(ctx,darkness()>0.3);f();ctx.restore()}
