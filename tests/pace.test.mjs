// v125: не больше 60 кадров на экранах 90–120 Гц, 30 — при открытом окне; на 60 Гц не пропускаем ни одного
import test from 'node:test'; import assert from 'node:assert/strict';
import { due } from '../src/engine/util.js';
const count = (hz, ms, sec = 10, jitter = 0.6) => { const st = {}; let n = 0; for (let i = 0; i < hz * sec; i++) { const now = i * 1000 / hz + (i % 3 - 1) * jitter; if (due(st, now, ms)) n++; } return n / sec; };
test('pace: 120 и 144 Гц → около 60, 90 Гц → 45–60, 60 Гц → 60, окно → 30', () => {
  assert.ok(Math.abs(count(120, 1000 / 60) - 60) <= 1, String(count(120, 1000 / 60)));
  assert.ok(count(144, 1000 / 60) >= 57 && count(144, 1000 / 60) <= 61, String(count(144, 1000 / 60)));
  assert.ok(count(90, 1000 / 60) >= 44 && count(90, 1000 / 60) <= 61, String(count(90, 1000 / 60)));
  assert.ok(count(60, 1000 / 60) >= 59.5, String(count(60, 1000 / 60)));
  assert.ok(Math.abs(count(60, 1000 / 30) - 30) <= 1, String(count(60, 1000 / 30)));
  assert.ok(Math.abs(count(120, 1000 / 30) - 30) <= 1, String(count(120, 1000 / 30)));
});
