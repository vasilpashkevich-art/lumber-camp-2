# Эскиз HUD: портрет героя слева вверху, реликвии под ним, сумка и склад — полосой сверху. 3 варианта.
import re,json,base64,os
D=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(D,'../../../src/lumber-camp.html')).read()
data=json.load(open(os.path.join(D,'data.json')))
i=s.index('const RES = {');line=s[i:s.index('\n',i)]
RES={m.group(1):m.group(3) for m in re.finditer(r"(\w+):\{name:'([^']*)', icon:'(<svg.*?</svg>)'",line)}
i=s.index('const ICONS = {');line=s[i:s.index('\n',i)]
ICO={m.group(1):m.group(2) for m in re.finditer(r"(\w+):'(<svg.*?</svg>)'",line)}
btns=re.findall(r'<button[^>]*class="rlc[^"]*"[^>]*>.*?</button>',data['relic'],re.S)
act=[b for b in btns if 'class="rlc act"' in b or 'data-relic-use="_set"' in b]
pas=[b for b in btns if b not in act]
def small(b):  # пассивная реликвия маленьким значком
  b=re.sub(r'width="28" height="28"','width="20" height="20"',b);return re.sub(r'class="rlc( old)?"','class="rlc sm"',b)
img=lambda f:'data:image/png;base64,'+base64.b64encode(open(os.path.join(D,f),'rb').read()).decode()
BG=img('bg.png');FACE=img('face_mage.png')
CSS=data['css']+'''
body{margin:0;background:#0b0f0c;font-family:Rubik,system-ui,sans-serif;color:#ece6d3}
.fr{position:relative;width:1280px;height:800px;overflow:hidden;background:url(%s) center/cover;margin:0 0 30px}
.cap{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.72);padding:8px 14px;font:600 15px Rubik,sans-serif;color:#f4c766;z-index:50}
.cap small{display:block;color:#c9c2b0;font-weight:500;font-size:13px;margin-top:2px}
.strip{position:absolute;left:0;right:0;top:0;height:30px;background:rgba(10,14,11,.86);border-bottom:1px solid #3a4a3a;display:flex;align-items:center;gap:18px;padding:0 14px;font-size:13px;z-index:10}
.strip .g{display:flex;align-items:center;gap:6px}.strip .ico{width:15px;height:15px;vertical-align:-3px}
.strip .lab{color:#98a191;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.bagbar{width:70px;height:6px;background:#2a332b;border-radius:3px;overflow:hidden}.bagbar i{display:block;height:100%%;width:50%%;background:#c9a06a}
.day{margin:0 auto;font-weight:700}.day span{color:#98a191;font-weight:500;margin-left:6px}
.uf{position:absolute;left:12px;top:40px;display:flex;gap:10px;align-items:center;z-index:10}
.pf{width:68px;height:68px;border-radius:50%%;border:3px solid #8a7aff;box-shadow:0 0 14px #8a7aff99,inset 0 0 0 2px #0b0f0c;background:url(%s) center 30%%/150%% no-repeat #55753c;position:relative}
.pf b{position:absolute;bottom:-6px;left:50%%;transform:translateX(-50%%);background:#141b16;border:2px solid #f4c766;color:#f4c766;border-radius:10px;font-size:12px;padding:0 6px;line-height:16px}
.uinfo{background:rgba(14,19,15,.82);border:1px solid #3a4a3a;border-radius:8px;padding:6px 10px;width:220px}
.uinfo h4{margin:0 0 4px;font-size:14px;color:#b4a8ff}.uinfo h4 small{color:#98a191;font-weight:500;font-size:11px;margin-left:6px}
.bar{height:12px;background:#2a1414;border-radius:3px;overflow:hidden;position:relative;margin-bottom:4px}.bar i{display:block;height:100%%;width:72%%;background:linear-gradient(#e0574a,#a8352a)}
.bar span{position:absolute;inset:0;font-size:10px;line-height:12px;text-align:center;font-weight:700;color:#fff;text-shadow:0 1px 1px #000}
.xp{height:4px;background:#2a2a1a;border-radius:2px;overflow:hidden}.xp i{display:block;height:100%%;width:38%%;background:#f4c766}
.acts{position:absolute;left:12px;top:122px;display:flex;gap:6px;z-index:10}
.acts .rlc,.ab .rlc{position:relative}
.pas{position:absolute;left:12px;top:176px;display:grid;grid-template-columns:repeat(8,32px);gap:4px;z-index:10}
.pas>*{margin:0!important}.rlc.sm{width:32px!important;height:32px!important;padding:0;display:grid;place-items:center;border-radius:6px;box-shadow:none!important}
.rlc.sm b{display:none}
.ab{position:absolute;left:50%%;transform:translateX(-50%%);bottom:92px;display:flex;gap:6px;background:rgba(14,19,15,.7);border:1px solid #3a4a3a;border-radius:10px;padding:6px;z-index:10}
.more{width:auto!important;padding:0 10px!important;font-size:12px;font-weight:700;color:#f4c766;display:flex!important;align-items:center;gap:6px;height:30px;border-radius:6px;background:rgba(14,19,15,.85);border:1px solid #f4c766}
.pop{position:absolute;left:12px;top:212px;width:300px;background:rgba(14,19,15,.95);border:1px solid #f4c766;border-radius:8px;padding:8px;z-index:12;font-size:12px}
.pop .r{display:flex;gap:8px;align-items:center;padding:3px 0;border-bottom:1px solid #2a332b}.pop .r b{color:#ece6d3}.pop .r span{color:#98a191}
.mini{position:absolute;right:10px;top:38px;width:120px;height:120px;border-radius:50%%;z-index:9}
.qs{position:absolute;right:10px;top:168px;width:230px;background:rgba(14,19,15,.78);border:1px solid #3a4a3a;border-radius:8px;padding:6px 8px;font-size:11px;z-index:9}
.qs h5{margin:0 0 4px;color:#f4c766;font-size:11px;letter-spacing:.08em}
.btm{position:absolute;right:12px;bottom:52px;display:flex;gap:6px;z-index:9}.btm span{background:rgba(14,19,15,.85);border:1px solid #3a4a3a;border-radius:8px;padding:8px 12px;font-size:13px}
.actb{position:absolute;right:16px;bottom:58px;width:78px;height:78px;border-radius:50%%;background:#e98b3d;opacity:.9;z-index:9;display:grid;place-items:center;color:#1a1208;font-weight:700}
.toast{position:absolute;left:12px;width:240px;background:rgba(14,19,15,.85);border-left:3px solid #86a85c;border-radius:4px;padding:5px 8px;font-size:12px;z-index:9}
'''%(BG,FACE)
def strip():
  return f'''<div class="strip"><div class="g"><span class="lab">Сумка</span>12 {RES['wood']} 5 {RES['stone']} <span style="color:#98a191">/ 34</span><div class="bagbar"><i></i></div></div>
<div class="day">День 14<span>до ночи 2:08 · серия ночей 4</span></div>
<div class="g"><span class="lab">Склад</span>2450 {RES['wood']} 830 {RES['stone']} 64 {RES['iron']} 120 {RES['shard']} 3 {RES['key']}</div></div>'''
def unit():
  return '''<div class="uf"><div class="pf"><b>23</b></div><div class="uinfo"><h4>Чародей<small>Маг · мир 3</small></h4><div class="bar"><i></i><span>72 / 100</span></div><div class="xp"><i></i></div></div></div>'''
def right():
  return '<div class="mini"></div><div class="qs"><h5>ЗАДАНИЯ</h5>Разбить валунов: 6 <b style="float:right">0/6</b><br>Убить мертвецов ночью: 6 <b style="float:right">2/6</b><br>Сделать улучшений: 3 <b style="float:right">1/3</b></div>'
def bottom(): return '<div class="btm"><span>Рывок</span><span>Посох</span><span>Звук: вкл</span><span>Лагерь</span></div>'
F=[]
# A: всё под портретом
A=strip()+unit()+'<div class="acts">'+''.join(act)+'</div><div class="pas">'+''.join(small(b) for b in pas)+'</div>'+right()+bottom()+'<div class="toast" style="top:268px">Задание выполнено: +75 древесины</div>'
A+='<div class="toast" style="top:262px;display:none">Задание выполнено: +75 древесины</div>'
F.append(('А. Всё под портретом',A,'Слева вверху: портрет в цвете класса, уровень, здоровье, опыт. Ниже — умения на клавишах (C, V, 1–4), под ними пассивные реликвии мелкими значками. Сумка, день и склад — полосой по верху экрана.'))
# B: активные — панелью внизу по центру
B=strip()+unit()+'<div class="pas" style="top:122px">'+''.join(small(b) for b in pas)+'</div><div class="ab">'+''.join(act)+'</div>'+right()+bottom()
F.append(('Б. Умения — панелью внизу',B,'Как в World of Warcraft: портрет слева, под ним пассивные реликвии. Умения на клавишах — отдельной панелью внизу по центру, рядом с руками. Верх экрана почти пустой.'))
# C: компактно — пассивные свёрнуты
C=strip()+unit()+'<div class="acts">'+''.join(act)+'</div><div class="pas" style="grid-template-columns:auto"><span class="more">Реликвии: '+str(len(pas))+' ▾</span></div>'
rows=''.join(f'<div class="r">{small(b)}<div><b>{re.search(r"title=\"([^:(]*)",b).group(1).strip()}</b></div></div>' for b in pas[:6])
C+=f'<div class="pop">{rows}<div style="color:#98a191;padding-top:4px">… ещё {len(pas)-6}. Открывается по нажатию или наведению</div></div>'+right()+bottom()
F.append(('В. Компактно: пассивные свёрнуты',C,'Под портретом только умения на клавишах. Пассивные реликвии свёрнуты в одну кнопку «Реликвии: N» — по нажатию открывается список с описанием (на снимке открыт).'))
h='<!doctype html><meta charset=utf-8><style>'+CSS+'</style><body>'+''.join(f'<div class="fr" id="f{i}">{x}<div class="cap">{t}<small>{d}</small></div></div>' for i,(t,x,d) in enumerate(F))
open(os.path.join(D,'hud.html'),'w').write(h);print('ok',len(act),len(pas))
