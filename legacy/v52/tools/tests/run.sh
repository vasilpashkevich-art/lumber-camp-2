#!/bin/sh
# Прогон всех автотестов: собрать игру и запустить каждый тест в Node.
# Браузерные проверки (tools/tests/browser) запускаются отдельно:
#   NODE_PATH=$(npm root -g) SHOTS=/tmp node tools/tests/browser/<имя>.js
cd "$(dirname "$0")/../.." || exit 1
python3 tools/build.py >/dev/null || exit 1
fail=0
for t in tools/tests/*.test.js; do
  out=$(timeout 300 node "$t" 2>&1); code=$?
  if [ $code -ne 0 ] || echo "$out" | grep -q "ERR\|Error\|^FAIL"; then echo "✗ $t"; echo "$out" | tail -5; fail=1; else echo "✓ $t — $(echo "$out" | tail -1 | cut -c1-90)"; fi
done
exit $fail
