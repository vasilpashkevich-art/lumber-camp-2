#!/bin/sh
# все прогоны: 3 класса × 2 карты, до 3 миров, не больше 45 дней на мир; по 2 одновременно
cd "$(dirname "$0")/../.." || exit 1
rm -f tools/bots/out/*.json
run(){ timeout 1700 node tools/bots/bot.js $1 $2 3 45 >> tools/bots/out/log.txt 2>&1; }
(run warrior 101; run mage 101; run archer 101) &
(run warrior 202; run mage 202; run archer 202) &
wait
echo done >> tools/bots/out/log.txt
