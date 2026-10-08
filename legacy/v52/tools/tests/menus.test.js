// Два окна: «Персонаж» (Герой, Вещи, Снаряжение, Летопись) и «Лагерь» (Лагерь, Оборона, Деревня, Хутора, Торговец); ⚙ — сохранение и звук.
// Пассивные реликвии — слева под портретом, умения на клавишах — панелью внизу.
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S;S.cls='mage';
ok(JSON.stringify(g.MENUS.hero.tabs)==='["hero","items","gear","log"]','Персонаж: Герой, Вещи, Снаряжение, Летопись');
ok(JSON.stringify(g.MENUS.camp.tabs)==='["camp","def","vil","farm"]','Лагерь: Лагерь, Оборона, Деревня, Хутора');
const all=[...g.MENUS.hero.tabs,...g.MENUS.camp.tabs,...g.MENUS.cfg.tabs].sort().join();ok(all===g.TABS.map(t=>t[0]).sort().join(),'все вкладки на месте, ни одна не потерялась');
g.openMenu('hero');ok(g.menuOpen&&g.menuKind==='hero'&&g.tab==='hero','портрет открывает «Персонаж»');
ok(/Персонаж/.test(els.menuTitle.textContent),'заголовок «Персонаж»');
ok(!/data-tab="camp"/.test(els.tabs.innerHTML)&&/data-tab="items"/.test(els.tabs.innerHTML),'в «Персонаже» нет вкладок лагеря');
g.openMenu('hero');ok(!g.menuOpen,'повторное нажатие закрывает');
g.openMenuHere();ok(g.menuOpen&&g.menuKind==='camp'&&g.MENUS.camp.tabs.includes(g.tab),'B открывает «Лагерь»');
ok(!/data-tab="items"/.test(els.tabs.innerHTML),'в «Лагере» нет вещей героя');
g.openMenu('hero','gear');ok(g.menuKind==='hero'&&g.tab==='gear','из «Лагеря» сразу в «Снаряжение»');
g.openMenu('cfg');ok(g.tab==='sound','⚙ открывается на «Звук и музыка»');const r=g.rowsFor('sound');ok(r.some(x=>x.act==='sound')&&r.some(x=>x.raw&&/data-vol="m"/.test(x.raw)),'⚙: звук, ползунки громкости');ok(g.rowsFor('save').some(x=>x.save),'⚙: сохранение');
// реликвии
for(const k of ['hammer','frost','storm','twin','gather','steel'])S.meta.relics[k]=1;g.updRelicBar();
ok(/data-relic-use="hammer"/.test(els.relicBar.innerHTML)&&/data-relic-use="_cls"/.test(els.relicBar.innerHTML)&&!/data-relic-use="storm"/.test(els.relicBar.innerHTML),'внизу — только умения на клавишах');
ok(/data-relic-use="storm"/.test(els.relicPas.innerHTML)&&/data-relic-use="gather"/.test(els.relicPas.innerHTML)&&!/data-relic-use="hammer"/.test(els.relicPas.innerHTML),'слева — пассивные реликвии');
console.log(bad?'FAILED '+bad:'menus ok');
