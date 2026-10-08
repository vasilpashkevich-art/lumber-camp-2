// Сводка прогонов автоигрока: node tools/bots/report.js
const fs=require('fs'),path=require('path');const dir=path.join(__dirname,'out');
const runs=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f))));
const R={};
for(const L of runs){
  for(const w of L.worlds){const tot=Object.values(w.modeT||{}).reduce((a,b)=>a+b,0)||1;
    console.log(`${L.cls} карта ${L.seed} мир ${w.ng+1}: ${w.outcome}, дней ${w.days}, ур ${w.maxLvl}, смертей ${w.deaths} (в склепе ${w.cryptDeaths}), ночей с прорывом ${w.breaches}/${w.nights}, лагерь пал ${w.campFell}, застреваний ${w.stuckN}, склепов ${w.crypts}, зелий ${w.potions}`);
    console.log('   зоны очищены на день:',JSON.stringify(w.zoneDay),' попыток на босса:',JSON.stringify(w.bossTry));
    console.log('   время:',Object.entries(w.modeT||{}).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>k+' '+Math.round(100*v/tot)+'%').join(', '));
    const dd=Object.entries(w.deathsByDay||{});console.log('   смерти по дням:',dd.map(([d,n])=>d+':'+n).join(' '));
    const r=w.resByDay||{},days=Object.keys(r).map(Number).sort((a,b)=>a-b);if(days.length)console.log('   склад по дням (дерево, камень, ратуша, топор, оружие, забор):',days.filter((d,i)=>i%5===0).map(d=>d+':'+r[d].join('/')).join(' '));
    console.log('   покупки:',JSON.stringify(w.buys))}
  console.log(`   ошибок игры: ${L.errCount}`,L.errors.slice(0,3));
  console.log('   урон по героям (откуда):',Object.entries(L.dmg||{}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+' '+Math.round(v)).join(', '));
  console.log('   застревания (где):',JSON.stringify((L.stuck||[]).slice(0,6)));
}
