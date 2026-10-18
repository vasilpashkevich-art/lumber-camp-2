// Виды мобов. Числа — множители к базе уровня из balance.js (MOBL).
// trait — особенность поведения, её обрабатывает systems/ai.js:
//   pack    — зовёт своих из лагеря, когда его бьют
//   charge  — с разбега бросается на героя, удар сильнее
//   poison  — укус травит и замедляет
//   ranged  — стреляет издалека и держит дистанцию
//   flee    — при малом здоровье пытается убежать
//   smash   — элитный: раз в несколько секунд мощный удар по площади (видно, куда ударит)
//   caster  — держит дистанцию, бьёт проклятием (замедляет)
//   summon  — (поле) зовёт помощников раз в несколько секунд; работает у любого моба

export const MOBS = {
  fox: {
    name: 'Голодная лиса', art: 'fox', r: 13,
    hp: 0.75, dmg: 0.75, speed: 158, reach: 30, cd: 1.4,
    trait: 'flee', gold: 0.7,
  },
  wolf: {
    name: 'Серый волк', art: 'wolf', r: 15,
    hp: 0.9, dmg: 1.0, speed: 166, reach: 32, cd: 1.5,
    trait: 'pack', packN: 1, gold: 0.8,   // v89: зовёт одного ближнего — вдвоём честный бой, втроём — смерть
  },
  boar: {
    name: 'Лесной кабан', art: 'boar', r: 17,
    hp: 1.25, dmg: 1.05, speed: 135, reach: 34, cd: 1.7,
    trait: 'charge', gold: 0.9,
  },
  spider: {
    name: 'Лесной паук', art: 'spider', r: 15,
    hp: 0.85, dmg: 0.8, speed: 148, reach: 30, cd: 1.3,
    trait: 'poison', gold: 0.9,
  },
  bandit: {
    name: 'Молодой разбойник', art: 'bandit', r: 14,
    hp: 1.05, dmg: 1.1, speed: 153, reach: 36, cd: 1.6,
    trait: 'pack', packN: 1, gold: 1.6, humanoid: true,
  },
  bandit_archer: {
    name: 'Разбойник-стрелок', art: 'bandit_archer', r: 14,
    hp: 0.8, dmg: 0.95, speed: 148, reach: 300, cd: 2.0,
    trait: 'ranged', gold: 1.6, humanoid: true,
  },
  ataman: {
    name: 'Атаман Рваное Ухо', art: 'ataman', r: 20, rare: true,
    hp: 4.5, dmg: 1.5, speed: 158, reach: 44, cd: 1.6,
    trait: 'smash', gold: 6, humanoid: true,
    smash: { every: 6, wind: 1.1, r: 110, mul: 2.4 },
  },
  // ---- Хуторские угодья
  dog: {
    name: 'Дикий пёс', art: 'dog', r: 14,
    hp: 0.85, dmg: 1.0, speed: 168, reach: 30, cd: 1.3,
    trait: 'pack', packN: 1, gold: 1.0,
  },
  crow: {
    name: 'Чёрная ворона', art: 'crow', r: 11, flying: true,
    hp: 0.55, dmg: 0.7, speed: 175, reach: 34, cd: 1.1,
    trait: 'pack', packN: 2, gold: 0.5,
  },
  scarecrow: {
    name: 'Ожившее пугало', art: 'scarecrow', r: 15,
    hp: 1.5, dmg: 1.35, speed: 95, reach: 40, cd: 1.9,
    trait: 'dormant', wake: 95, gold: 1.1,
  },
  bull: {
    name: 'Бешеный бык', art: 'bull', r: 22,
    hp: 1.7, dmg: 1.25, speed: 135, reach: 40, cd: 1.9,
    trait: 'charge', gold: 1.2,
  },
  robber: {
    name: 'Грабитель', art: 'robber', r: 15,
    hp: 1.15, dmg: 1.15, speed: 155, reach: 36, cd: 1.5,
    trait: 'pack', packN: 1, gold: 1.8, humanoid: true,
  },
  firestarter: {
    name: 'Поджигатель', art: 'firestarter', r: 14,
    hp: 0.9, dmg: 0.9, speed: 150, reach: 260, cd: 2.2,
    trait: 'ranged', shot: 'fire', burn: 0.35, gold: 1.8, humanoid: true,
  },
  miller: {
    name: 'Мельник-колдун', art: 'miller', r: 19, rare: true,
    hp: 5, dmg: 1.4, speed: 115, reach: 300, cd: 2.0,
    trait: 'caster', summon: { kind: 'crow', n: 2, every: 11 }, gold: 7, humanoid: true,
  },
  // ---- Грибной лес (v65)
  kvakun: {
    name: 'Квакун-копейщик', art: 'kvakun', r: 14,
    hp: 1.05, dmg: 1.05, speed: 150, reach: 40, cd: 1.5,
    trait: 'pack', packN: 1, packR: 260, gold: 1.2,   // зовёт одного ближнего (v89: было двух)
  },
  kvak_shaman: {
    name: 'Квакун-шаман', art: 'kvak_shaman', r: 14,
    hp: 0.85, dmg: 0.95, speed: 135, reach: 280, cd: 2.1,
    trait: 'caster', curseSay: 'тина вяжет', summon: { kind: 'kvakun', n: 1, max: 1, every: 16, say: 'зовёт сородича!' }, gold: 1.6,
  },
  gribo: {
    name: 'Грибоед', art: 'gribo', r: 16,
    hp: 1.3, dmg: 1.1, speed: 110, reach: 34, cd: 1.7,
    trait: 'poison', poisonSay: 'споры', gold: 1.2,
  },
  sporo: {
    name: 'Споровик', art: 'sporo', r: 15,
    hp: 0.8, dmg: 0.9, speed: 120, reach: 240, cd: 2.3,
    trait: 'ranged', shot: 'spore', gold: 1.1,
  },
  weaver: {
    name: 'Тенепряд', art: 'weaver', r: 17,
    hp: 0.95, dmg: 1.0, speed: 160, reach: 34, cd: 1.4,
    trait: 'poison', gold: 1.1,
  },
  broodmother: {
    name: 'Паучиха-мать', art: 'broodmother', r: 24,
    hp: 2.6, dmg: 1.3, speed: 120, reach: 42, cd: 1.8,
    trait: 'poison', summon: { kind: 'weaver', n: 2, every: 14, say: 'зовёт выводок!' }, gold: 3,
  },
  snake: {
    name: 'Великий Полоз', art: 'snake', r: 26, rare: true,
    hp: 6, dmg: 1.5, speed: 140, reach: 50, cd: 1.7,
    trait: 'poison', gold: 8,
    smash: { every: 7, wind: 1.0, r: 120, mul: 2.4, say: 'готовит бросок!', style: 'coil' },
  },
  // v77: Храм квакунов (подземелье, 15–17 с v89): здоровья намного больше обычного
  kvak_guard: {
    name: 'Квакун-страж', art: 'kvak_guard', r: 15,
    hp: 2.6, dmg: 1.15, speed: 140, reach: 42, cd: 1.6,
    trait: 'pack', packN: 1, packR: 240, gold: 3,   // v89: зовёт одного
  },
  kvak_priest: {
    name: 'Квакун-жрец', art: 'kvak_priest', r: 14,
    hp: 2.0, dmg: 1.05, speed: 130, reach: 280, cd: 2.0,
    trait: 'caster', curseSay: 'тина вяжет', summon: { kind: 'temple_frog', n: 1, max: 2, every: 14, say: 'зовёт лягушку!' }, gold: 3.5,
  },
  temple_frog: {
    name: 'Храмовая лягушка', art: 'temple_frog', r: 14,
    hp: 1.8, dmg: 1.0, speed: 175, reach: 60, cd: 1.3,
    trait: 'poison', poisonSay: 'язык', gold: 2,
  },
  viper: {
    name: 'Храмовая гадюка', art: 'viper', r: 16,
    hp: 1.6, dmg: 1.1, speed: 160, reach: 46, cd: 1.5,
    trait: 'poison', gold: 2.5,
  },
  // v90: боссы Храма квакунов — пока простые (одно умение, гарантированная синяя вещь); фазы — следующими версиями
  boss_bulk: {
    name: 'Воевода Бульк', art: 'boss_bulk', r: 24, boss: true, humanoid: true,
    hp: 8, dmg: 1.1, speed: 125, reach: 60, cd: 1.8, trait: 'boss', gold: 14,
    // v94: три фазы. Умения: конус трезубцем, рывок по полосе (после — сам оглушён), топот волной (щит опущен), прыжок на героя (после — оглушён)
    ai: {
      shieldMul: 0.15,
      phases: [
        { at: 1, acts: ['cone', 'charge'] },
        { at: 0.6, acts: ['stomp', 'cone', 'charge'], shield: true, say: 'Поднял щит! Бейте сбоку и сзади' },
        { at: 0.3, acts: ['leap', 'cone', 'charge'], haste: 1.15, say: 'Бросил щит — в ярости!' },
      ],
      acts: {
        cone: { every: 7, first: 3, wind: 1.0, range: 150, arc: 1.7, pct: 0.25, max: 200, say: 'заносит трезубец!' },
        charge: { every: 12, first: 6, wind: 0.9, len: 430, w: 70, speed: 850, pct: 0.25, after: 1.3, max: 520, say: 'бросается в рывок!' },
        stomp: { every: 7, first: 1.5, wind: 1.1, r: 150, pct: 0.18, open: 3, openSay: 'опустил щит — бейте!', say: 'топает!' },
        leap: { every: 9, first: 1.5, wind: 0.5, air: 0.75, r: 110, pct: 0.35, stun: 2, stunSay: 'увяз в полу — бейте!', say: 'прыгает!' },
      },
    },
    abil: ['Трезубец — удар конусом перед собой', 'Рывок по прямой: после него Воевода оглушён', 'С 60% — щит спереди (урон ×0,15); после топота щит опущен 3 с', 'С 30% — прыжок на героя: после приземления оглушён 2 с'],
    tactic: 'Увидел светлый конус — шаг в сторону. Полоса рывка — уйдите с неё, Воевода пролетит мимо и застрянет: бейте. Со щитом заходите сбоку и сзади или ждите топота — выйдите из круга, потом бейте, пока щит опущен. В последней фазе отбегайте из круга прыжка и бейте оглушённого.',
  },
  boss_priestess: {
    name: 'Жрица Квакша', art: 'boss_priestess', r: 18, boss: true, humanoid: true, fem: true,
    hp: 6, dmg: 0.9, speed: 120, reach: 300, cd: 2.0,   // v117: 3,5 → 6 (фазы и обряд)
    trait: 'caster', curseSay: 'тина вяжет', gold: 14,
    // v117: три фазы. Головастики; с 60% — обряд в купели (неуязвима, сломать тотемы, иначе удар 70%); с 30% — ядовитый дождь и листья кувшинок
    ai: {
      phases: [
        { at: 1, acts: ['adds'] },
        { at: 0.6, acts: ['rite', 'adds'], say: 'Ушла в купель — ломайте тотемы!' },
        { at: 0.3, acts: ['rain', 'adds'], say: 'Ядовитый дождь — встаньте на лист кувшинки!' },
      ],
      acts: {
        adds: { every: 12, first: 5, kind: 'tadpole', n: 2, cap: 4, say: 'зовёт головастиков!' },
        rite: { every: 60, first: 0.3, at: 'font', dur: 20, kind: 'kvak_totem', n: 3, ring: 300, pct: 0.7, stun: 3, say: 'начинает обряд!', failSay: 'обряд свершился!', breakSay: 'обряд сорван — бейте!' },
        rain: { once: true, first: 0.3, dps: 0.035, pads: 4, up: 6, down: 10, pr: 66, ring: 330, say: 'вызывает ядовитый дождь!' },
      },
    },
    abil: ['Бьёт тиной издалека — замедляет', 'Раз в 12 с зовёт двух головастиков', 'С 60% — уходит в купель и неуязвима: 20 с обряда; не сломали 3 тотема — удар на 70% здоровья', 'С 30% — ядовитый дождь по всему залу; укрыться можно только на листе кувшинки (лист держится 6 с и тонет на 10 с)'],
    tactic: 'Догоните её — она отступает медленно; головастиков бейте сразу. Обряд: бегите к тотемам по кругу и ломайте по одному, у вас 20 секунд — после сорванного обряда жрица оглушена, бейте. Под дождём стойте на светлом листе; лист замигал — перебегайте на соседний.',
  },
  boss_aspid: {
    name: 'Храмовый аспид', art: 'boss_aspid', r: 28, boss: true,
    hp: 7, dmg: 1.0, speed: 150, reach: 56, cd: 1.6, trait: 'poison', poisonSay: 'яд аспида', gold: 14,
    // v94: укус с ядом, бросок головой по полосе; с 60% — кольцо вокруг героя с одним просветом; с 30% — сбрасывает кожу (неуязвим, лужи яда), быстрее
    ai: {
      phases: [
        { at: 1, acts: ['lunge'] },
        { at: 0.6, acts: ['ring', 'lunge'], say: 'Сворачивается кольцами — ищите просвет!' },
        { at: 0.3, acts: ['shed', 'ring', 'lunge'], say: 'Шипит в ярости!' },
      ],
      acts: {
        lunge: { every: 6, first: 3, wind: 0.8, len: 230, w: 64, pct: 0.22, poison: 0.25, max: 260, say: 'вскидывает голову!' },
        ring: { every: 15, first: 1.5, dur: 2.8, r: 160, gap: 1.0, pct: 0.4, root: 3, say: 'сворачивается кольцом!', hitSay: 'сжат кольцами!' },
        shed: { once: true, first: 0.5, wind: 0.8, immune: 5, puddles: 7, pr: 48, plife: 40, pdps: 1.2, haste: 1.3, say: 'сбрасывает кожу!' },
      },
    },
    abil: ['Укус с ядом и замедлением', 'Бросок головой по прямой полосе', 'С 60% — кольцо вокруг героя: выйти можно только через просвет, иначе −40% здоровья и 3 с в кольцах', 'С 30% — сбрасывает кожу: 5 с неуязвим, лужи яда на полу, дальше быстрее'],
    tactic: 'Полоса броска — шаг вбок. Кольцо: сразу бегите к светлому просвету — у вас меньше 3 секунд. Сброс кожи — не тратьте умения, пока он неуязвим, и уведите бой из луж яда. Зелье лечения держите на последнюю треть.',
  },
  boss_king: {
    name: 'Король квакунов', art: 'boss_king', r: 26, boss: true, humanoid: true, final: true,
    hp: 7.5, dmg: 1.15, speed: 125, reach: 64, cd: 1.8, trait: 'boss', gold: 30,   // v117: 5,5 → 7,5 (три фазы)
    // v117: трон (неуязвим, пока жива стража) → прыжки, язык, головастики → жаба: квак (за колонну!), проглатывание
    ai: {
      phases: [
        { at: 1, acts: ['throne'] },
        { at: 0.7, acts: ['leap', 'tongue', 'adds'], say: 'Встал с трона и взял скипетр!' },
        { at: 0.35, acts: ['kvak', 'swallow', 'tongue'], look: 'boss_toad', r: 40, immune: 1.6, haste: 0.9, say: 'Король обращается в огромную жабу! Прячьтесь за колонны!' },
      ],
      acts: {
        throne: { once: true, first: 0, at: 'throne', guards: 'Стража Короля', every: 2.4, say: 'Стража, взять!', upSay: 'Король встаёт с трона!' },
        leap: { every: 10, first: 2, wind: 0.5, air: 0.75, r: 110, pct: 0.3, stun: 1.6, stunSay: 'увяз в полу — бейте!', say: 'прыгает!' },
        tongue: { every: 9, first: 4, wind: 0.8, len: 440, w: 46, min: 110, max: 440, hold: 3, dps: 0.05, say: 'выбрасывает язык!' },
        adds: { once: true, hp: 0.5, kind: 'tadpole', n: 3, cap: 5, say: 'зовёт головастиков!' },
        kvak: { every: 12, first: 3, wind: 2.2, pct: 0.22, stun: 3, hits: 2, say: 'набирает воздуха…', hitSay: 'КВАК!' },
        swallow: { every: 8, first: 6, wind: 0.9, range: 150, arc: 1.5, max: 160, hold: 4, dps: 0.06, spit: 1.6, say: 'разевает пасть!' },
      },
    },
    abil: ['На троне неуязвим, пока жива стража; кидает тину', 'Прыжок с ударом по площади', 'Язык по прямой: поймал — тянет к себе (вырывайтесь ударом)', 'На 50% зовёт трёх головастиков', 'С 35% — огромная жаба: «КВАК!» раз в 12 с оглушает всех, кто не за колонной (колонна выдерживает два), пасть проглатывает на 4 с'],
    tactic: 'Сначала убейте двух стражников — тогда Король сойдёт с трона. Полоса языка — шаг вбок; поймал — часто жмите удар. Жаба набирает воздуха — встаньте за колонну так, чтобы она была между вами; у пасти не стойте. Колонн четыре — не тратьте их зря.',
  },
  // v117: помощники боссов Храма
  tadpole: {
    name: 'Головастик', art: 'temple_frog', look: 'temple_frog', r: 10,
    hp: 0.45, dmg: 0.45, speed: 190, reach: 46, cd: 1.1, trait: 'none', gold: 0,
  },
  kvak_totem: {
    name: 'Тотем тины', art: 'totem', r: 16, still: true,
    hp: 0.7, dmg: 0, speed: 0, reach: 0, cd: 99, trait: 'totem', gold: 0,
  },
};
