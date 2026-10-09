// v66: пояснения к характеристикам в окне героя.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newHero, heroStats } from '../src/entities/hero.js';
import { statRows } from '../src/ui/stathelp.js';
import { makeItem } from '../src/systems/items.js';
import { PROPS } from '../data/balance.js';
import { rng } from '../src/engine/util.js';

test('у каждой строки есть пояснение; выносливость показана и считает здоровье', () => {
  for (const cls of ['warrior', 'mage', 'archer']) {
    const h = newHero('Т', cls); h.lvl = 12; for (const s of ['head', 'chest', 'legs', 'weapon', 'ring', 'neck']) h.eq[s] = makeItem(cls, s, 12, 'rare', rng(3));
    const st = heroStats(h), rows = statRows(h, st), L = rows.map(r => r.label);
    for (const r of rows) { assert.ok(r.help && r.help.length > 30, `${cls}: ${r.label}`); assert.ok(!/undefined|NaN/.test(r.help + r.val), `${cls}: ${r.label} ${r.help}`); }
    for (const need of ['Уровень', 'Здоровье', 'Выносливость', 'Сила удара', 'Урон в секунду', 'Крит', 'Броня']) assert.ok(L.includes(need), `${cls}: ${need}`);
    const stam = rows.find(r => r.label === 'Выносливость'); assert.equal(stam.val, st.stam); assert.ok(st.stam > 0 && stam.help.includes('Сейчас она даёт'));
    for (const [k, v] of Object.entries(st.p)) if (v > 0 && k !== 'crit') assert.ok(rows.some(r => r.help.includes(String(PROPS[k].cap)) || k === 'regen'), k);
    const other = { warrior: /Маг|Лучник|Интеллект|Ловкост/, mage: /Воин|Лучник|Сил[аы] |Ловкост/, archer: /Воин|Маг[а ]|Интеллект|Сил[аы] / }[cls];
    for (const r of rows) assert.ok(!other.test(r.help) || r.label === 'Сила удара', `${cls}: чужой класс в «${r.label}»: ${r.help}`);
  }
});
