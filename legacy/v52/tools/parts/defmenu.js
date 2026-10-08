  if(t==='def'){
    const b=S.base,lockN=(lv,what)=>R.push({note:`${what} откро${what.includes(',')||/и$/.test(what)?'ются':'ется'} на ${lv} уровне главного дома («${HQ_SKINS[lv]}»).`});
    R.push({note:'<b>Укрепления</b>'});
    if(b<DEF.moat.base)lockN(DEF.moat.base,'Ров и ловушки');
    else{
      const ml=S.def.moat,pct=l=>Math.round((1-DEF.moat.slow[l])*100);
      if(ml<DEF.moat.max){const c=DEF.moat.cost[ml];R.push({title:ml?'Ров':'Выкопать ров',lvl:ml?`ур. ${ml}`:'нет',desc:ml?`Мертвецы во рву пойдут медленнее на ${pct(ml+1)}% (сейчас ${pct(ml)}%), ров станет шире.`:`Кольцо воды у забора: мертвецы в нём идут медленнее на ${pct(1)}%.`,cost:c,why:gate(c),act:'moat'})}
      else R.push({title:'Ров',lvl:`ур. ${ml} · максимум`,desc:`Мертвецы во рву идут медленнее на ${pct(ml)}%.`});
      const tl=S.def.traps,tn=DEF.traps.n[tl];
      if(tl<DEF.traps.max){const c=DEF.traps.cost[tl];R.push({title:tl?'Ловушки':'Поставить ловушки',lvl:tl?`ур. ${tl}`:'нет',desc:`Колья и капканы за рвом: ${DEF.traps.n[tl+1]} шт., урон ${DEF.traps.dmg[tl+1]} и замедление на ${DEF.traps.slow} с. Каждая срабатывает ${DEF.traps.uses} раз, потом её надо чинить.`,cost:c,why:gate(c),act:'traps'})}
      else R.push({title:'Ловушки',lvl:`ур. ${tl} · максимум`,desc:`${tn} шт., урон ${DEF.traps.dmg[tl]}, замедление на ${DEF.traps.slow} с.`});
      if(tl){const miss=S.def.tu.slice(0,tn).reduce((a,u)=>a+DEF.traps.uses-u,0),broke=S.def.tu.slice(0,tn).filter(u=>u<=0).length,c=C(miss*DEF.traps.fix);
        R.push({title:'Починить ловушки',lvl:broke?`сломано ${broke} из ${tn}`:`целы`,desc:miss>0?`${DEF.traps.fix} древесины за каждое срабатывание`:'Все ловушки взведены.',cost:miss>0?c:null,why:miss>0?gate(c):'Не нужно',act:'trapfix'})}
    }
    if(b<DEF.guard.base)lockN(DEF.guard.base,'Стража, мастерская и баллисты');
    else{
      const gl=guardLvl();
      if(gl<DEF.guard.max){const c=DEF.guard.cost[gl+1];R.push({title:`Стража: ${DEF.guard.names[gl]}`,lvl:`ур. ${gl}`,desc:`Станет «${DEF.guard.names[gl+1]}»: урон ×${DEF.guard.mul[gl+1]}, дальность ${DEF.guard.range[gl+1]}, чаще стреляют. Стражников назначают во вкладке «Деревня».`,cost:c,why:gate(c),act:'guardup'})}
      else R.push({title:`Стража: ${DEF.guard.names[gl]}`,lvl:`ур. ${gl} · максимум`,desc:`Урон ×${DEF.guard.mul[gl]}, дальность ${DEF.guard.range[gl]}.`});
      const sl=S.def.shop,rp=l=>(DEF.shop.rate[l]*100).toFixed(1).replace('.0','');
      if(sl<DEF.shop.max){const c=DEF.shop.cost[sl];R.push({title:sl?'Мастерская':'Построить мастерскую',lvl:sl?`ур. ${sl}`:'нет',desc:`Ночью сама чинит забор и ратушу: ${rp(sl+1)}% прочности в секунду${sl?' (сейчас '+rp(sl)+'%)':''}.`,cost:c,why:gate(c),act:'shop'})}
      else R.push({title:'Мастерская',lvl:`ур. ${sl} · максимум`,desc:`Ночью чинит забор и ратушу: ${rp(sl)}% прочности в секунду.`});
      for(let i=0;i<DEF.ball.slots;i++){const l=S.def.ball[i];
        if(l>=DEF.ball.max)R.push({title:`Баллиста ${i+1}`,lvl:`ур. ${l} · максимум`,desc:`Болт насквозь: урон ${DEF.ball.dmg[l]} каждому на линии, раз в ${DEF.ball.cd} с.`});
        else{const c=DEF.ball.cost(l);R.push({title:`Баллиста ${i+1}`,lvl:l?`ур. ${l}`:'не построена',desc:l?`Урон ${DEF.ball.dmg[l]} → ${DEF.ball.dmg[l+1]} каждому на линии.`:`Бьёт тяжёлым болтом насквозь по линии: урон ${DEF.ball.dmg[1]} каждому, дальность ${DEF.ball.range}.`,cost:c,why:gate(c),act:'ball:'+i})}}
    }
    const nb=DEF.bowl.slots(b);
    if(!nb)lockN(DEF.bowl.base,'Огненные чаши');
    for(let i=0;i<nb;i++){const l=S.def.bowl[i];
      if(l>=DEF.bowl.max)R.push({title:`Огненная чаша ${i+1}`,lvl:`ур. ${l} · максимум`,desc:`Поджигает толпу: ${DEF.bowl.dps[l]} урона в секунду каждому, 3 с.`});
      else{const c=DEF.bowl.cost(l);R.push({title:`Огненная чаша ${i+1}`,lvl:l?`ур. ${l}`:'не построена',desc:l?`Огонь: ${DEF.bowl.dps[l]} → ${DEF.bowl.dps[l+1]} урона в секунду.`:`Бросает огонь в гущу толпы: поджигает всех рядом, ${DEF.bowl.dps[1]} урона в секунду.`,cost:c,why:gate(c),act:'bowl:'+i})}}
    if(nb&&nb<4)lockN(6,'Ещё 2 огненные чаши');
  }
