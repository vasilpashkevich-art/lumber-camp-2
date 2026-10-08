// Прототип генератора материка (для эскизов, позже переносится в игру)
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function angNoise(rng,harm,amp){const ph=[],am=[];for(let k=1;k<=harm;k++){ph.push(rng()*6.283);am.push((rng()*2-1)*amp/Math.pow(k,0.85))}return a=>{let s=0;for(let k=1;k<=harm;k++)s+=am[k-1]*Math.sin(k*a+ph[k-1]);return s}}
function vnoise(seed){const rng=mulberry(seed),P=new Float32Array(512);for(let i=0;i<512;i++)P[i]=rng();
  const h=(x,y)=>P[(((x*73856093)^(y*19349663))>>>0)%512];const sm=t=>t*t*(3-2*t);
  return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi);const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf}}
const ZONES=[
  {id:1,name:'Берёзовая роща',r1:560, col:[118,150,70]},
  {id:2,name:'Сосновый бор',  r1:860, col:[40,86,64]},
  {id:3,name:'Дубрава',       r1:1160,col:[120,104,50]},
  {id:4,name:'Мёртвый лес',   r1:1450,col:[74,60,78]},
  {id:5,name:'Чёрная чаща',   r1:1750,col:[36,40,58]},
  {id:6,name:'Пепельный лес', r1:2050,col:[108,90,76]},
  {id:7,name:'Костяная пуща', r1:9e9, col:[60,72,70]},
];
// боковые биомы: диапазон зон (по сложности), ширина сектора
const SIDE=[
  {id:'snow', name:'Снежный край',     from:4,to:7,w:0.95,col:[214,226,236],world:1},
  {id:'marsh',name:'Болотный край',    from:2,to:4,w:0.8, col:[58,82,70],  world:2},
  {id:'shroom',name:'Грибной лес',     from:3,to:5,w:0.75,col:[96,70,110], world:2},
  {id:'waste',name:'Красная пустошь',  from:5,to:7,w:0.85,col:[150,78,52], world:3},
  {id:'high', name:'Скалистое нагорье',from:4,to:6,w:0.8, col:[120,116,108],world:3},
  {id:'mist', name:'Туманная топь',    from:6,to:7,w:0.75,col:[96,110,118],world:3},
];
function makeWorld(seed,ng){
  const rng=mulberry(seed*13+7),scale=ng>=2?Math.SQRT2:ng>=1?Math.sqrt(1.3):1;
  const R=2480*scale,W=Math.ceil((R*1.25)*2/100)*100,C=W/2;
  const coast=angNoise(rng,9,0.2),coast2=angNoise(rng,26,0.06);
  const zb=ZONES.map(()=>angNoise(rng,5,0.2));const ov=ZONES.map(()=>[0.12+rng()*0.14,rng()*3.14]);
  const zr=ZONES.map(z=>z.r1*scale*(0.97));
  const coastR=a=>R*(1+coast(a)+coast2(a));
  const frac=ZONES.map(z=>Math.min(1,z.r1/2480));
  const zoneR=(i,a)=>{const cr=coastR(a);if(i>=6)return cr;let r=cr*frac[i]*(1+zb[i](a)*0.6+ov[i][0]*0.5*Math.cos(2*(a-ov[i][1])));const lo=(i?zoneR(i-1,a):230*scale)+Math.max(110*scale,cr*0.07);return Math.max(lo,Math.min(r,cr-(6-i)*110*scale))};
  // боковые биомы: раскладываем по секторам, снег — в «угол» (диагональ)
  const sides=SIDE.filter(b=>b.world<=ng+1).map(b=>({...b}));const used=[];
  const diag=[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4];
  for(const b of sides){let a,tries=0;
    do{a=b.id==='snow'?diag[Math.floor(rng()*4)]+(rng()-0.5)*0.2:rng()*6.283;tries++}
    while(tries<200&&used.some(u=>Math.abs(((a-u.a+9.42)%6.283)-3.14)<(u.w+b.w)/2+0.25));
    b.a=a;used.push(b);b.edge=angNoise(rng,5,0.25);b.inner=angNoise(rng,5,0.1)}
  const noise=vnoise(seed),noise2=vnoise(seed+99),noiseE=vnoise(seed+33);
  const wn1=vnoise(seed+5),wn2=vnoise(seed+6),WA=360*scale;
  const warp=(x,y)=>[x+(wn1(x/1100,y/1100)-0.5)*2*WA+(wn1(x/380,y/380)-0.5)*WA*0.35,y+(wn2(x/1100,y/1100)-0.5)*2*WA+(wn2(x/380,y/380)-0.5)*WA*0.35];
  function region(x0,y0){const dc=Math.hypot(x0-C,y0-C),kw=Math.min(1,Math.max(0,(dc-260*scale)/(500*scale)));const [wx,wy]=warp(x0,y0),x=x0+(wx-x0)*kw,y=y0+(wy-y0)*kw;const dx=x-C,dy=y-C,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    if(d>coastR(a))return {sea:true,d,a,cd:d-coastR(a)};
    let zi=0;while(zi<6&&d>zoneR(zi,a))zi++;
    for(const b of sides){const da=Math.abs(((a-b.a+9.42)%6.283)-3.14);const ww=b.w/2*(1+b.edge(a*3)+(noiseE(x/520,y/520)-0.5)*0.9)*Math.min(1,0.6+0.4*d/(R*0.7));
      if(da<ww&&zi+1>=b.from&&zi+1<=b.to){const rin=b.from>1?zoneR(b.from-2,a)*(1+b.inner(a)):0;if(d>rin)return {zone:zi,side:b,d,a,edge:ww-da}}}
    return {zone:zi,d,a,cd:coastR(a)-d,zd:zi<6?zoneR(zi,a)-d:999}}
  return {seed,ng,scale,R,W,C,coastR,zoneR,sides,region,noise,noise2,rng};
}
if(typeof module!=='undefined')module.exports={makeWorld,mulberry,ZONES,SIDE,vnoise};
