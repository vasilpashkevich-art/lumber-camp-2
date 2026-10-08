/* ================= РИСУНКИ ВЕЩЕЙ ================= */
// c — цвет редкости (камни, отделка), картинки 32×32
const ICON_ART = {
  'Топорик': c=>`<path d="M9 27L22 9" stroke="#8d6540" stroke-width="3" stroke-linecap="round"/><path d="M18 5c4 0 8 3 9 7l-6 2-5-6z" fill="#b8bec6"/><path d="M18 5l3 3-5 0z" fill="${c}"/>`,
  'Секира':  c=>`<path d="M8 28L20 7" stroke="#7b5634" stroke-width="3" stroke-linecap="round"/><path d="M15 6c6-4 14 0 14 9-3-2-6-3-9-2z" fill="#c9ced6"/><path d="M15 6c6-4 14 0 14 9" stroke="${c}" stroke-width="2" fill="none"/><circle cx="18" cy="11" r="1.6" fill="${c}"/>`,
  'Колун':   c=>`<path d="M10 28L19 10" stroke="#6b4a2c" stroke-width="3.5" stroke-linecap="round"/><path d="M13 7l10-3 4 6-11 5z" fill="#9aa2ac"/><path d="M23 4l4 6" stroke="${c}" stroke-width="2.4"/>`,
  'Бердыш':  c=>`<path d="M6 30L24 4" stroke="#7b5634" stroke-width="2.4" stroke-linecap="round"/><path d="M19 6c7 1 10 7 8 15-2-5-6-7-11-7z" fill="#c9ced6"/><path d="M19 6c7 1 10 7 8 15" stroke="${c}" stroke-width="1.8" fill="none"/><circle cx="24" cy="3.5" r="1.8" fill="${c}"/>`,
  'Кожух':   c=>`<path d="M9 8l7-3 7 3 4 6-3 2-1-3v15H9V13l-1 3-3-2z" fill="#7b5634"/><path d="M9 8l7 4 7-4-3-3h-8z" fill="#d9c7a6"/><path d="M16 12v15" stroke="#4a3424"/><circle cx="16" cy="17" r="1.3" fill="${c}"/><circle cx="16" cy="22" r="1.3" fill="${c}"/>`,
  'Стёганка':c=>`<path d="M9 7l7-2 7 2 4 7-3 2-1-3v15H9V13l-1 3-3-2z" fill="#a08a62"/><path d="M10 12h12M10 17h12M10 22h12M13 9v19M19 9v19" stroke="#7a6848" stroke-width="1"/><path d="M13 5l3 4 3-4" stroke="${c}" stroke-width="2" fill="none"/>`,
  'Кольчуга':c=>`<path d="M9 7l7-2 7 2 4 7-3 2-1-3v15H9V13l-1 3-3-2z" fill="#8a929c"/><g fill="#5f6670">${Array.from({length:20},(_,i)=>`<circle cx="${11+(i%5)*2.6}" cy="${11+Math.floor(i/5)*4}" r=".9"/>`).join('')}</g><path d="M9 27h14" stroke="${c}" stroke-width="2.4"/>`,
  'Латы':    c=>`<path d="M10 9h12l2 4-1 14H9L8 13z" fill="#b8bec6"/><path d="M4 11c1-4 5-5 7-3v5H5zM28 11c-1-4-5-5-7-3v5h6z" fill="#9aa2ac"/><path d="M16 9v18" stroke="#7d8592"/><path d="M11 15h10" stroke="${c}" stroke-width="2"/><circle cx="16" cy="20" r="1.8" fill="${c}"/>`,
  'Оберег':  c=>`<path d="M9 4c2 6 12 6 14 0" stroke="#8d6540" stroke-width="1.3" fill="none"/><circle cx="16" cy="18" r="8" fill="#9a7048"/><circle cx="16" cy="18" r="5" fill="none" stroke="#5a3e26" stroke-width="1.2"/><path d="M16 13v10M11 18h10" stroke="${c}" stroke-width="1.8"/>`,
  'Ладанка': c=>`<path d="M9 4c2 6 12 6 14 0" stroke="#8d6540" stroke-width="1.3" fill="none"/><path d="M11 13h10l2 11c-3 3-11 3-14 0z" fill="#7b5634"/><path d="M11 13c2-2 8-2 10 0" stroke="${c}" stroke-width="2" fill="none"/><circle cx="16" cy="20" r="1.8" fill="${c}"/>`,
  'Талисман':c=>`<path d="M9 4c2 6 12 6 14 0" stroke="#8d6540" stroke-width="1.3" fill="none"/><path d="M13 12c4-2 8 1 7 6l-4 11-3-11z" fill="#e8e2d2"/><path d="M13 12c4-2 8 1 7 6" stroke="${c}" stroke-width="1.6" fill="none"/>`,
  'Амулет':  c=>`<path d="M9 4c2 6 12 6 14 0" stroke="#d4b46a" stroke-width="1.3" fill="none"/><path d="M16 10l7 8-7 10-7-10z" fill="#d4b46a"/><path d="M16 13l4.5 5-4.5 6.5-4.5-6.5z" fill="${c}"/>`,
  'Перстень':c=>`<ellipse cx="16" cy="21" rx="8" ry="6" fill="none" stroke="#d4b46a" stroke-width="2.6"/><path d="M12 12l4-5 4 5-4 4z" fill="${c}"/><path d="M12 12l4 4 4-4" stroke="#fff" stroke-opacity=".4" fill="none"/>`,
  'Кольцо':  c=>`<ellipse cx="16" cy="18" rx="9" ry="7" fill="none" stroke="#c9ced6" stroke-width="3"/><circle cx="16" cy="11" r="2.2" fill="${c}"/>`,
  'Печатка': c=>`<ellipse cx="16" cy="21" rx="8" ry="6" fill="none" stroke="#a9b2bf" stroke-width="2.6"/><rect x="10" y="8" width="12" height="8" rx="2" fill="#7d8592"/><path d="M13 12h6M16 9.5v5" stroke="${c}" stroke-width="1.6"/>`,
  'Обруч':   c=>`<ellipse cx="16" cy="16" rx="10" ry="8" fill="none" stroke="#8a7a5a" stroke-width="2.4"/><ellipse cx="16" cy="16" rx="10" ry="8" fill="none" stroke="${c}" stroke-width="1.2" stroke-dasharray="3 3"/>`,
};
const UQ_ART = {
  felling:c=>`<path d="M16 30V5" stroke="#5a3e26" stroke-width="3" stroke-linecap="round"/><path d="M16 7c-6-3-12 1-12 8 3-2 7-3 12-1zM16 7c6-3 12 1 12 8-3-2-7-3-12-1z" fill="#f0c060"/><path d="M16 7c-6-3-12 1-12 8M16 7c6-3 12 1 12 8" stroke="#a06a20" stroke-width="1.2" fill="none"/><circle cx="16" cy="9" r="2" fill="#fff4c0"/>`,
  shadow: c=>`<path d="M16 4c-5 0-8 4-8 8l-3 16c4 2 18 2 22 0l-3-16c0-4-3-8-8-8z" fill="#2a2638"/><path d="M12 10c2-3 6-3 8 0l-1 5h-6z" fill="#120e18"/><circle cx="14" cy="12" r="1" fill="${c}"/><circle cx="18" cy="12" r="1" fill="${c}"/><path d="M8 28c3-6 4-10 5-14M24 28c-3-6-4-10-5-14" stroke="#4a4466" stroke-width="1"/>`,
  heart:  c=>`<path d="M9 4c2 6 12 6 14 0" stroke="#5a3e26" stroke-width="1.3" fill="none"/><path d="M16 28s-9-6-9-12c0-4 3-6 5-6 2 0 3 1 4 3 1-2 2-3 4-3 2 0 5 2 5 6 0 6-9 12-9 12z" fill="#8a1a2a"/><path d="M12 14c1-2 2-2 3-2" stroke="#ff6a7a" stroke-width="1.4" fill="none"/><circle cx="16" cy="18" r="2" fill="#8cf0a0"/>`,
  flame:  c=>`<ellipse cx="16" cy="22" rx="8" ry="6" fill="none" stroke="#d4b46a" stroke-width="2.6"/><path d="M16 4c3 4 5 6 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-5 1-8z" fill="#f08a3a"/><path d="M16 9c1 2 2 3 2 5a2 2 0 0 1-4 0c0-1 1-2 2-5z" fill="#ffe08a"/>`,
};
const iconBase = it => SLOT_BASE[it.slot][Math.min(3,Math.floor((it.tier-1)/2))][0];
function itemSvg(it,size=32){
  const c=RAR[it.rar].col,art=it.uq?UQ_ART[it.uq](c):ICON_ART[iconBase(it)](c);
  return `<svg class="itm-svg" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">${art}</svg>`;
}
const iconImgs={};
function itemImg(it){
  const k=(it.uq||iconBase(it))+'|'+it.rar;
  if(!iconImgs[k]){const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${(it.uq?UQ_ART[it.uq]:ICON_ART[iconBase(it)])(RAR[it.rar].col)}</svg>`);iconImgs[k]=im}
  return iconImgs[k];
}

/* ================= СРАВНЕНИЕ И ХАРАКТЕРИСТИКИ ================= */
// «вес» свойства для общей оценки вещи
const MOD_W = {dmg:1, spd:1, crit:1.2, burn:0.6, vamp:6, hp:0.6, armor:1.6, move:0.8, gather:0.5, dbl:0.6, loot:0.5};
function itemScore(it){if(!it)return 0;let s=0;for(const [k,v] of it.mods)s+=v*(MOD_W[k]||0.5);if(it.uq)s+=15;return s}
function itemCompare(it){
  const e=S.eq[it.slot];
  const sum=x=>{const o={};if(x)for(const [k,v] of x.mods)o[k]=(o[k]||0)+v;return o};
  const a=sum(it),b=sum(e),keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
  const diffs=keys.map(k=>[k,Math.round(((a[k]||0)-(b[k]||0))*10)/10]).filter(([,d])=>d!==0);
  if(it.uq&&!(e&&e.uq===it.uq))diffs.push(['uq',1]);
  if(e&&e.uq&&e.uq!==it.uq)diffs.push(['uq',-1]);
  const delta=Math.round(itemScore(it)-itemScore(e));
  return {e,diffs,delta,better:!e||delta>0,worse:!!e&&delta<0};
}
function compareHtml(it){
  const c=itemCompare(it);
  const parts=c.diffs.map(([k,d])=>{
    if(k==='uq')return `<span class="${d>0?'up':'dn'}">${d>0?'+ особый эффект':'− теряете особый эффект'}</span>`;
    const m=MODS[k];return `<span class="${d>0?'up':'dn'}">${d>0?'+':'−'}${Math.abs(d)}${m.pct?'%':''} ${m.n.toLowerCase()}</span>`});
  const head=!c.e?'<b class="up">▲ ячейка пустая — надеть</b>':c.better?`<b class="up">▲ лучше надетого (+${c.delta})</b>`:c.worse?`<b class="dn">▼ хуже надетого (${c.delta})</b>`:'<b>≈ равноценно</b>';
  return `<span class="cmp">${head}${parts.length?' · '+parts.join(' · '):''}</span>`;
}
function heroStats(){
  const spd=1+gear('spd')/100,dm=(1+gear('dmg')/100)*(1+0.10*rl('steel'))*(1+0.12*pr('str'));
  const crit=Math.min(100,gear('crit')),critMul=1+crit/100;
  const axeHit=axeDmg(S.up.axe)*dm*(1+0.2*S.forgeUp.melee),axeCdv=axeCd(S.up.axe)/spd;
  const bowHit=S.bow?bowDmg(S.bow)*dm*(1+0.2*S.forgeUp.bow):0,bowCdv=S.bow?bowCd(S.bow)/spd:0;
  const gm=(1+0.15*pr('hand'))*(1+gear('gather')/100)*(1+0.15*rl('gather'));
  const buff=S.buffAtk>0?' (сейчас ×1,2 от зелья силы)':'';
  const f1=n=>Math.round(n*10)/10;
  return [
    ['Уровень героя',`${S.lvl} · опыт ${Math.floor(S.xp)}/${xpNeed(S.lvl)}`],
    ['Урон топором',`${f1(axeHit)} за удар · ${f1(axeHit*critMul/axeCdv)} в секунду${buff}`],
    ['Урон луком',S.bow?`${f1(bowHit)} за выстрел · ${f1(bowHit*critMul/bowCdv)} в секунду · дальность ${bowRange(S.bow)}`:'лука нет'],
    ['Скорость удара',`топор раз в ${f1(axeCdv)} с${S.bow?` · лук раз в ${f1(bowCdv)} с`:''}${gear('spd')?` (+${gear('spd')}%)`:''}`],
    ['Шанс крита (×2)',`${crit}%`],
    ['Поджог',hasUq('flame')?'каждый удар':`${Math.min(100,gear('burn'))}% ударов`],
    ['Здоровье',`${Math.ceil(S.p.hp)} / ${maxHp(S.up.hp)}`],
    ['Защита',`−${Math.min(60,gear('armor'))}% входящего урона`],
    ['Здоровье за убийство',`+${f1(pr('vamp')+gear('vamp'))}`],
    ['Скорость бега',`${speedOf(S.up.boots)}`],
    ['Рывок',`раз в ${f1(dashCd())} с`],
    ['Сила по дереву / камню',`${f1(axeDmg(S.up.axe)*gm)} / ${f1(pickDmg(S.up.pick)*gm)}`],
    ['Двойная добыча',`${Math.round(20*pr('luck')+gear('dbl'))}%`],
    ['Шанс добычи с мертвецов',`+${gear('loot')}%`],
    ['Сумка',`${bagCap(S.up.bag)} мест`],
    ['Зелья',`до ${potMax()} каждого вида`],
  ];
}
