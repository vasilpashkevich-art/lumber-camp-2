// v124: окно «Как играть» — новому герою один раз, старым сохранениям — нет
import test from 'node:test'; import assert from 'node:assert/strict';
import { newHero } from '../src/entities/hero.js';
import { migrate } from '../src/engine/save.js';
test('howto: новый герой — показать, старый — нет, показанное — не повторять', () => {
  const n = migrate(newHero('Новичок', 'warrior')); assert.equal(n.howTo, false);
  const old = newHero('Старый', 'mage'); old.stats.play = 3600; delete old.howTo; assert.equal(migrate(old).howTo, true);
  n.howTo = true; assert.equal(migrate(JSON.parse(JSON.stringify(n))).howTo, true);
});
