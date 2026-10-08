// Долгий прогон: автоигрок каждого класса 40 минут игры. Проверяем, что нет ошибок
// и что темп прокачки в разумных пределах (не слишком быстро и не застревает).
import test from 'node:test';
import assert from 'node:assert/strict';
import { runBot } from '../tools/sim.mjs';

for (const cls of ['warrior', 'mage', 'archer']) {
  test(`автоигрок: ${cls}, 40 минут`, () => {
    const r = runBot(cls, 40, 2);
    assert.ok(r.lvl >= 5, `уровень ${r.lvl} — слишком медленно или застрял`);
    assert.ok(r.lvl <= 8, `уровень ${r.lvl} — слишком быстро`);
    assert.ok(r.lvAt[4] > 4, `уровень 4 за ${r.lvAt[4]} мин — слишком быстро`);
    assert.ok(r.kills > 100, `мало убийств: ${r.kills}`);
  });
}
