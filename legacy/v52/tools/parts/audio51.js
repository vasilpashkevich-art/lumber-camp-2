// v51: музыка и звуки, сочинённые прямо в браузере (без файлов). Музыка своя, в духе фэнтези-RPG.
// AUD.init(ctx, out) — подключить к звуку игры; AUD.music.play('day'|'night'|'blood'|'crypt'|null); AUD.camp.set(уровень 0..6); AUD.fx.<звук>()
const AUD=(()=>{
let c=null,out=null,mus=null,amb=null,fxo=null,verb=null,noise=null,ready=false,VM=1;// VM — громкость звука на время его сборки
const mtof=m=>440*Math.pow(2,(m-69)/12);
function init(ctx,dest){if(ready)return;c=ctx;out=dest;
  noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  // реверберация: затухающий шум 3 с (зал/лес)
  verb=c.createConvolver();const L=c.sampleRate*3,ir=c.createBuffer(2,L,c.sampleRate);for(let ch=0;ch<2;ch++){const b=ir.getChannelData(ch);for(let i=0;i<L;i++)b[i]=(Math.random()*2-1)*Math.pow(1-i/L,3.2)}verb.buffer=ir;
  const vg=c.createGain();vg.gain.value=0.55;verb.connect(vg);vg.connect(out);
  mus=c.createGain();mus.gain.value=0.5;mus.connect(out);amb=c.createGain();amb.gain.value=0.6;amb.connect(out);fxo=c.createGain();fxo.gain.value=0.9;fxo.connect(out);ready=true}
// --- кирпичики
function send(node,dest,wet){node.connect(dest);if(wet>0){const g=c.createGain();g.gain.value=wet;node.connect(g);g.connect(verb)}}
function env(g,t,a,v,d,rel){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,v),t+a);if(rel===undefined)g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);else{g.gain.setValueAtTime(Math.max(0.0002,v),t+a+d);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d+rel)}}
function osc(type,f,t,dur,o={}){const s=c.createOscillator();s.type=type;s.frequency.setValueAtTime(f,t);if(o.to)s.frequency.exponentialRampToValueAtTime(o.to,t+(o.toT||dur));if(o.det)s.detune.value=o.det;
  const g=c.createGain();env(g,t,o.a||0.005,(o.v||0.2)*VM,o.d===undefined?dur:o.d,o.r);let n=s;if(o.lp){const f2=c.createBiquadFilter();f2.type='lowpass';f2.frequency.value=o.lp;f2.Q.value=o.q||0.7;s.connect(f2);n=f2}
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*0.006,t+0.35);l.connect(lg);lg.connect(s.frequency);l.start(t);l.stop(t+dur+(o.r||0)+0.2)}
  n.connect(g);send(g,o.dest||fxo,o.wet||0);s.start(t);s.stop(t+(o.a||0.005)+(o.d===undefined?dur:o.d)+(o.r||0)+0.1);return s}
function nz(t,dur,o={}){const s=c.createBufferSource();s.buffer=noise;s.loop=true;const f=c.createBiquadFilter();f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,t+(o.toT||dur));f.Q.value=o.q||1;
  const g=c.createGain();env(g,t,o.a||0.003,(o.v||0.2)*VM,o.d===undefined?dur:o.d,o.r);s.connect(f);f.connect(g);send(g,o.dest||fxo,o.wet||0);s.start(t,Math.random()*1.5);s.stop(t+(o.a||0.003)+(o.d===undefined?dur:o.d)+(o.r||0)+0.1);return f}
// --- инструменты
const I={
  harp(t,m,v=0.12,dest=mus){const f=mtof(m);osc('triangle',f,t,1.8,{a:0.004,v,d:1.8,lp:3200,dest,wet:0.45});osc('sine',f*2,t,0.6,{a:0.004,v:v*0.3,d:0.6,dest,wet:0.4})},
  pad(t,ms,dur,v=0.035,dest=mus,lp=900){for(const m of ms)for(const det of [-8,7]){osc('sawtooth',mtof(m),t,dur,{a:1.2,v,d:Math.max(0.1,dur-1.2),r:1.6,lp,det,dest,wet:0.6})}},
  flute(t,m,dur,v=0.09,dest=mus){const f=mtof(m);osc('sine',f,t,dur,{a:0.07,v,d:Math.max(0.05,dur-0.07),r:0.25,vib:5.2,dest,wet:0.5});osc('triangle',f*2,t,dur,{a:0.09,v:v*0.12,d:Math.max(0.05,dur-0.09),r:0.2,dest,wet:0.4});nz(t,0.12,{f:f*2,q:3,v:v*0.35,a:0.02,d:0.1,dest,wet:0.3})},
  strings(t,m,dur,v=0.03,dest=mus){for(const det of [-10,0,9])osc('sawtooth',mtof(m),t,dur,{a:0.5,v,d:Math.max(0.1,dur-0.5),r:0.9,lp:1300,det,dest,wet:0.55})},
  horn(t,m,dur,v=0.05,dest=mus){const s=c.createOscillator();s.type='sawtooth';s.frequency.value=mtof(m);const f=c.createBiquadFilter();f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(300,t);f.frequency.linearRampToValueAtTime(1500,t+0.12);f.frequency.linearRampToValueAtTime(800,t+dur);
    const g=c.createGain();env(g,t,0.06,v,dur,0.3);s.connect(f);f.connect(g);send(g,dest,0.5);s.start(t);s.stop(t+dur+0.5)},
  bass(t,m,dur,v=0.09,dest=mus){osc('triangle',mtof(m),t,dur,{a:0.02,v,d:dur*0.9,r:0.2,lp:500,dest,wet:0.15})},
  bell(t,m,v=0.06,dest=mus){const f=mtof(m);[[1,1],[2.76,0.45],[5.4,0.25],[8.9,0.12]].forEach(([k,a])=>osc('sine',f*k,t,3/k,{a:0.002,v:v*a,d:3/k,dest,wet:0.6}))},
  choir(t,ms,dur,v=0.03,dest=mus){for(const m of ms){const s=c.createOscillator();s.type='sawtooth';s.frequency.value=mtof(m);const g=c.createGain();env(g,t,1.5,v,Math.max(0.1,dur-1.5),2);
    for(const [ff,q] of [[700,6],[1150,8]]){const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=ff;f.Q.value=q;s.connect(f);f.connect(g)}send(g,dest,0.8);s.start(t);s.stop(t+dur+2.2)}},
  drum(t,k,v=0.3,dest=mus){if(k==='taiko'){osc('sine',95,t,0.7,{to:42,toT:0.5,a:0.003,v,d:0.7,dest,wet:0.35});nz(t,0.12,{type:'lowpass',f:500,v:v*0.6,dest,wet:0.3})}
    else if(k==='tom'){osc('sine',150,t,0.35,{to:80,a:0.003,v,d:0.35,dest,wet:0.25});nz(t,0.06,{type:'lowpass',f:900,v:v*0.4,dest})}
    else if(k==='heart'){osc('sine',62,t,0.25,{to:40,a:0.005,v,d:0.25,dest})}
    else if(k==='shaker'){nz(t,0.05,{type:'highpass',f:6000,v,dest,wet:0.2})}},
};
// --- музыка: темы из тактов; у каждой две части (A с мелодией, B — тише, «дыхание»)
const THEMES={
  // Лес днём: ре мажор, 3/4, арфа переливами, флейта, тёплый фон
  day:{bpm:84,beats:3,bars:[[50,[62,66,69]],[47,[59,62,66]],[43,[55,59,62]],[45,[57,61,64]],[50,[62,66,69]],[42,[54,57,61]],[43,[55,59,62]],[45,[57,61,64,67]]],
    mel:[[[0,69,2],[2,66,1]],[[0,74,1.5],[1.5,73,0.5],[2,71,1]],[[0,67,2],[2,71,1]],[[0,69,3]],[[0,66,1],[1,69,1],[2,74,1]],[[0,73,2],[2,69,1]],[[0,71,1],[1,74,1],[2,76,1]],[[0,76,1.5],[1.5,74,0.5],[2,73,1]]],
    play(t,bar,part,sb){const [b,ch]=this.bars[bar],B=60/this.bpm;I.bass(t,b,B*3,0.07);if(bar%2===0)I.pad(t,ch,B*6,0.028);
      const arp=[0,1,2,1,2,1].map(i=>ch[i%ch.length]+(i>=2&&i%2===0?12:0));arp.forEach((m,i)=>I.harp(t+i*B/2,m,part?0.07:0.09));
      if(!part)for(const [o,m,d] of this.mel[bar])I.flute(t+o*B,m,d*B*0.95,0.08);else if(bar%4===3)I.bell(t+B,ch[0]+24,0.03);if(sb&&bar===0&&!part)I.drum(t,'tom',0.06)}},
  // Ночь: ля минор, 4/4, медленно, низкие струнные, редкая арфа, стук сердца
  night:{bpm:60,beats:4,bars:[[45,[57,60,64]],[41,[53,57,60]],[38,[50,53,57]],[40,[52,56,59]]],
    mel:[[[0,76,2],[2,74,1],[3,72,1]],[[0,69,4]],[[0,65,2],[2,67,1],[3,69,1]],[[0,71,3],[3,68,1]]],
    play(t,bar,part){const [b,ch]=this.bars[bar],B=60/this.bpm;I.strings(t,b,B*4,0.02);I.strings(t,ch[1],B*4,0.012);I.drum(t,'heart',0.12);I.drum(t+B*0.35,'heart',0.08);
      [0,2].forEach(k=>I.harp(t+k*B+B*0.5,ch[(bar+k)%3]+12,0.05));if(part)for(const [o,m,d] of this.mel[bar])I.flute(t+o*B,m-12,d*B*0.95,0.06)}},
  // Кровавая луна: ре минор, барабаны, низкие струнные, медные
  blood:{bpm:96,beats:4,bars:[[38,[50,53,57]],[34,[46,50,53]],[36,[48,52,55]],[33,[45,49,52]]],
    play(t,bar,part){const [b,ch]=this.bars[bar],B=60/this.bpm;for(const [o,v] of [[0,0.42],[1.5,0.22],[2,0.3],[3,0.22],[3.5,0.18]])I.drum(t+o*B,'taiko',v);
      for(let i=0;i<8;i++)I.bass(t+i*B/2,b+(i%2?12:0),B*0.45,0.06);I.horn(t,ch[0]+12,B*1.6,0.045);if(part)I.horn(t+B*2,ch[2]+12,B*1.5,0.04);I.strings(t,ch[1]+12,B*4,0.014)}},
  // Склеп: до минор, хор, колокол, капли
  crypt:{bpm:50,beats:4,bars:[[36,[48,51,55]],[32,[44,48,51]],[29,[41,44,48]],[31,[43,47,50]]],
    play(t,bar,part){const [b,ch]=this.bars[bar],B=60/this.bpm;I.choir(t,ch,B*4,0.022);I.bass(t,b,B*4,0.06);if(bar===0)I.bell(t+B,ch[0]+12,0.05);
      for(let k=0;k<2;k++)if(Math.random()<0.6){const tt=t+Math.random()*B*4;osc('sine',1800+Math.random()*900,tt,0.08,{to:900,a:0.002,v:0.03,d:0.08,dest:mus,wet:0.8})}}},
};
const music={cur:null,timer:null,next:0,bar:0,part:0,cycle:0,
  play(name){if(!ready)return;if(name===this.cur)return;this.cur=name;mus.gain.cancelScheduledValues(c.currentTime);
    if(!name){mus.gain.setTargetAtTime(0.0001,c.currentTime,0.8);return}
    mus.gain.setTargetAtTime(0.0001,c.currentTime,0.3);const self=this;setTimeout(()=>{if(self.cur!==name)return;mus.gain.setTargetAtTime(self.vol,c.currentTime,1.2);self.next=c.currentTime+0.1;self.bar=0;self.part=0;self.cycle=0},700);
    if(!this.timer)this.timer=setInterval(()=>this.tick(),60)},
  vol:0.5,setVol(v){this.vol=v;if(this.cur)mus.gain.setTargetAtTime(v,c.currentTime,0.2)},
  tick(){const T=THEMES[this.cur];if(!T||!this.next)return;while(this.next<c.currentTime+0.3){T.play(this.next,this.bar,this.part,this.cycle===0);this.next+=T.beats*60/T.bpm;
    this.bar++;if(this.bar>=T.bars.length){this.bar=0;this.part=1-this.part;this.cycle++}}},
};
// --- шум лагеря: костёр на 1–2, дальше поселение живее с уровнем
const SH={wind:null,murmur:null,fire:null};
function loopNoise(type,f,q,v,dest){const s=c.createBufferSource();s.buffer=noise;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(dest);s.start();return {s,f:fl,g}}
const ev={
  crackle(v=0.5){const t=c.currentTime;nz(t,0.02+Math.random()*0.02,{type:'highpass',f:2500+Math.random()*2500,v:0.05+v*0.2,dest:amb})},
  birds(){const t=c.currentTime+Math.random()*0.2,n=3+Math.floor(Math.random()*4),base=2600+Math.random()*1600;for(let i=0;i<n;i++){const tt=t+i*(0.09+Math.random()*0.06);osc('sine',base*(0.9+Math.random()*0.25),tt,0.07,{to:base*(1.25+Math.random()*0.3),a:0.005,v:0.025,d:0.07,dest:amb,wet:0.3})}},
  hens(){const t=c.currentTime;for(let i=0;i<3+Math.floor(Math.random()*3);i++){const tt=t+i*0.13;const f=nz(tt,0.06,{f:900+Math.random()*300,q:6,v:0.04,d:0.06,dest:amb,wet:0.2});osc('square',420+Math.random()*80,tt,0.05,{a:0.003,v:0.008,d:0.05,lp:1200,dest:amb})}},
  rooster(){const t=c.currentTime,P=[[0,560,0.12],[0.15,700,0.14],[0.32,820,0.5],[0.85,600,0.25]];for(const [o,f,d] of P){osc('sawtooth',f,t+o,d,{to:f*0.92,a:0.02,v:0.025,d,lp:1800,q:3,dest:amb,wet:0.35})}},
  anvil(){const t=c.currentTime,n=2+Math.floor(Math.random()*2);for(let i=0;i<n;i++){const tt=t+i*0.42;[[1,1],[2.37,0.5],[3.9,0.35],[6.1,0.2]].forEach(([k,a])=>osc('sine',1150*k,tt,0.6/k+0.1,{a:0.001,v:0.03*a,d:0.6/k+0.1,dest:amb,wet:0.5}));nz(tt,0.03,{f:3000,q:2,v:0.03,dest:amb})}},
  bell(){I.bell(c.currentTime,64,0.06,amb);I.bell(c.currentTime+1.4,64,0.04,amb)},
  cart(){const t=c.currentTime;nz(t,2.2,{type:'lowpass',f:220,v:0.05,a:0.4,d:1.2,r:0.6,dest:amb});for(let i=0;i<5;i++){const tt=t+0.2+i*0.42;osc('triangle',620+Math.random()*120,tt,0.18,{to:860,a:0.02,v:0.012,d:0.18,dest:amb,wet:0.2})}},
  chop(){const t=c.currentTime;for(let i=0;i<2;i++){const tt=t+i*0.7;nz(tt,0.06,{f:1200,q:2,v:0.04,dest:amb,wet:0.3});osc('triangle',170,tt,0.1,{to:90,a:0.002,v:0.03,d:0.1,dest:amb,wet:0.3})}},
  voices(){if(!SH.murmur)return;const g=SH.murmur.g.gain,t=c.currentTime;g.setTargetAtTime(camp.murV*1.8,t,0.3);g.setTargetAtTime(camp.murV,t+2.5,0.8)},
};
const camp={lvl:-1,timer:null,murV:0,day:true,
  set(lvl,day=true){if(!ready)return;this.day=day;if(lvl===this.lvl)return;this.lvl=lvl;const t=c.currentTime;
    if(!SH.wind){SH.wind=loopNoise('lowpass',380,0.5,0,amb);SH.murmur=loopNoise('bandpass',520,1.4,0,amb);SH.fire=loopNoise('bandpass',900,0.6,0,amb)}
    SH.wind.g.gain.setTargetAtTime(lvl<0?0:0.02,t,0.8);SH.fire.g.gain.setTargetAtTime(lvl>=1&&lvl<=2?0.05:0,t,0.6);
    this.murV=lvl>=4?[0,0,0,0,0.006,0.01,0.014][lvl]:0;SH.murmur.g.gain.setTargetAtTime(this.murV,t,1);
    if(!this.timer)this.timer=setInterval(()=>this.tick(),250)},
  tick(){const l=this.lvl;if(l<0||!ready)return;const t=c.currentTime,r=Math.random,dt=0.25;
    if(SH.murmur&&l>=4){SH.murmur.f.frequency.setTargetAtTime(380+r()*420,t,0.25);SH.murmur.f.Q.value=1.2+r()*1.5}
    if(l<=2&&l>=1){if(r()<dt*14)ev.crackle(0.6)}
    if(l>=3&&this.day){if(r()<dt/7)ev.birds();if(r()<dt/18)ev.hens();if(r()<dt/16)ev.chop()}
    if(l>=4){if(r()<dt/11)ev.anvil();if(r()<dt/9)ev.voices()}
    if(l>=5){if(r()<dt/45)ev.bell();if(r()<dt/30)ev.cart()}},
};
// --- звуки умений
const fx={
  // Варвар
  axe(){const t=c.currentTime;nz(t,0.12,{f:900,to:2600,q:1.5,v:0.12,d:0.12});nz(t+0.09,0.1,{type:'lowpass',f:700,v:0.3});osc('sine',110,t+0.09,0.16,{to:55,v:0.3,d:0.16})},
  whirl(){const t=c.currentTime,D=1.2;const f=nz(t,D,{f:500,q:2.2,v:0.18,a:0.1,d:D-0.25,r:0.25,wet:0.3});const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=700;l.connect(lg);lg.connect(f.frequency);l.start(t);l.stop(t+D+0.1);
    osc('sawtooth',90,t,D,{to:140,a:0.1,v:0.035,d:D-0.2,r:0.2,lp:500});for(let i=0;i<6;i++)nz(t+i*0.2,0.12,{f:2200,to:4200,q:3,v:0.05,d:0.12});osc('triangle',660,t,0.4,{a:0.01,v:0.04,d:0.6,wet:0.4})},
  hammer(){const t=c.currentTime;nz(t,0.18,{f:600,to:180,q:1,v:0.12,d:0.12});osc('sine',90,t+0.12,0.4,{to:38,v:0.5,d:0.4});nz(t+0.12,0.35,{type:'lowpass',f:400,v:0.35,d:0.35,wet:0.3});
    [[1,1],[2.4,0.5],[4.1,0.25]].forEach(([k,a])=>osc('sine',520*k,t+0.12,0.5,{a:0.002,v:0.06*a,d:0.5,wet:0.4}));for(let i=0;i<6;i++)nz(t+0.16+Math.random()*0.25,0.03,{f:2500,q:2,v:0.04})},
  // реликвия «Молот Громовержца»: бросок — полёт с треском молний — удары — возврат в руку
  mjolnir(){const t=c.currentTime;nz(t,0.5,{f:300,to:1800,q:1.8,v:0.15,d:0.4,wet:0.3});osc('sawtooth',55,t,1.4,{a:0.05,v:0.05,d:1.3,lp:220,wet:0.4});
    for(let i=0;i<14;i++){const tt=t+0.05+i*0.08+Math.random()*0.04;osc('sawtooth',800+Math.random()*2400,tt,0.03,{a:0.001,v:0.03,d:0.03,lp:5000})}
    [0.45,0.75,1.05].forEach((o,k)=>{const tt=t+o;nz(tt,0.08,{type:'highpass',f:1800,v:0.18,d:0.08});osc('sine',120-k*10,tt,0.35,{to:40,v:0.35,d:0.35});nz(tt,0.5,{type:'lowpass',f:260,v:0.2,d:0.5,wet:0.6})});
    nz(t+1.0,1.6,{type:'lowpass',f:160,v:0.25,a:0.05,d:1.4,r:0.4,wet:0.8});
    const tr=t+1.6;nz(tr,0.35,{f:2000,to:500,q:2,v:0.08,d:0.3});[[1,1],[2.7,0.4]].forEach(([k,a])=>osc('sine',780*k,tr+0.3,0.5,{a:0.001,v:0.07*a,d:0.5,wet:0.4}));osc('sine',200,tr+0.3,0.15,{to:110,v:0.2,d:0.15})},
  hammerStorm(){for(let i=0;i<4;i++)setTimeout(()=>{const t=c.currentTime;nz(t,0.3,{f:400,to:2400,q:1.6,v:0.1,d:0.25,wet:0.3});for(let k=0;k<5;k++)osc('sawtooth',900+Math.random()*2000,t+k*0.05,0.03,{a:0.001,v:0.025,d:0.03,lp:5000});osc('sine',110,t+0.25,0.3,{to:45,v:0.3,d:0.3})},i*180);
    setTimeout(()=>{const t=c.currentTime;nz(t,2,{type:'lowpass',f:140,v:0.3,a:0.03,d:1.6,r:0.5,wet:0.9})},700)},
  // Маг
  staff(){const t=c.currentTime;nz(t,0.22,{f:600,to:2200,q:1.2,v:0.1,d:0.2,wet:0.2});osc('sine',880,t,0.15,{to:1500,a:0.004,v:0.03,d:0.15,wet:0.3});for(let i=0;i<4;i++)osc('sine',2400+Math.random()*1800,t+0.05+i*0.04,0.05,{a:0.002,v:0.015,d:0.05,wet:0.4})},
  fireVolley(){const t=c.currentTime;osc('sine',220,t,0.3,{to:660,a:0.02,v:0.04,d:0.3,wet:0.4});[0,0.12,0.24].forEach((o,k)=>{const tt=t+0.18+o;nz(tt,0.5,{f:350,to:1600,q:0.9,v:0.16,a:0.03,d:0.4,wet:0.35});nz(tt,0.6,{type:'lowpass',f:300,v:0.12,d:0.55});
    for(let j=0;j<5;j++)nz(tt+0.1+Math.random()*0.4,0.02,{type:'highpass',f:3500,v:0.05})})},
  fireBoulder(){const t=c.currentTime;osc('sawtooth',1200,t,1.1,{to:160,a:0.05,v:0.04,d:1.05,lp:2000,wet:0.4});nz(t,1.1,{f:3000,to:400,q:1.2,v:0.1,a:0.1,d:1,wet:0.3});
    const tb=t+1.1;osc('sine',70,tb,1.1,{to:28,v:0.6,d:1.1});nz(tb,1.4,{type:'lowpass',f:800,to:150,v:0.45,d:1.3,wet:0.7});nz(tb,0.15,{type:'highpass',f:1500,v:0.25,d:0.15});for(let i=0;i<14;i++)nz(tb+0.1+Math.random()*1.2,0.025,{type:'highpass',f:3000,v:0.06})},
  // Лучник
  bow(){const t=c.currentTime;osc('triangle',190,t,0.15,{to:150,a:0.001,v:0.12,d:0.15});nz(t,0.04,{f:3000,q:3,v:0.08});nz(t+0.02,0.25,{f:2500,to:900,q:4,v:0.06,d:0.22})},
  arrowVolley(){const t=c.currentTime;osc('sawtooth',330,t,0.5,{a:0.04,v:0.03,d:0.45,lp:1400,wet:0.4});osc('sawtooth',440,t+0.25,0.5,{a:0.04,v:0.03,d:0.45,lp:1600,wet:0.4});
    [0.55,0.62,0.69].forEach(o=>{osc('triangle',200+Math.random()*30,t+o,0.13,{to:150,a:0.001,v:0.09,d:0.13});nz(t+o+0.02,0.28,{f:2800,to:900,q:4,v:0.05,d:0.25})})},
  arrowRain(){const t=c.currentTime;for(let i=0;i<4;i++)osc('triangle',190+i*15,t+i*0.06,0.12,{to:150,a:0.001,v:0.07,d:0.12});
    for(let i=0;i<16;i++){const tt=t+0.5+Math.random()*1.1;nz(tt,0.3,{f:4200,to:1200,q:5,v:0.035,d:0.28});nz(tt+0.28,0.05,{type:'lowpass',f:700,v:0.08,d:0.05})}},
  levelUp(){const t=c.currentTime;[62,66,69,74].forEach((m,i)=>I.harp(t+i*0.08,m+12,0.1,fxo));I.bell(t+0.35,86,0.05,fxo)},
};
// выравнивание громкости: тихие звуки громче
const LOUD={whirl:2.2,staff:3,fireVolley:2,bow:1.6,arrowVolley:2.2,arrowRain:2.4,hens:2,cart:2,birds:1.4,rooster:1.5,chop:1.5,anvil:1.3};
for(const T of [fx,ev])for(const k in T){const f=T[k];if(LOUD[k])T[k]=(...a)=>{VM=LOUD[k];try{f(...a)}finally{VM=1}}}
for(const [k,m] of [['night',1.7],['crypt',2]]){const T=THEMES[k],f=T.play;T.play=function(...a){VM=m;try{f.apply(this,a)}finally{VM=1}}}
return {init,music,camp,fx,ev,I,THEMES,get ready(){return ready},setFx:v=>{if(fxo)fxo.gain.value=v},setAmb:v=>{if(amb)amb.gain.value=v},nodes:()=>({mus,amb,fxo})};
})();
