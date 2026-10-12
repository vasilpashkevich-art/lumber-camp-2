import { beastSpr, personSpr, drawFrame, MOB_LOOK, MOB_SCALE } from '../../../src/art/sprites.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
const K = ['fox','wolf','boar','spider','dog','crow','scarecrow','bull','kvakun','kvak_shaman','gribo','sporo','weaver','broodmother','snake','bandit','ataman','miller'];
g.fillStyle = '#5f8a3a'; g.fillRect(0, 0, cv.width, cv.height);
K.forEach((k, i) => { const x = 80 + (i % 6) * 150, y = 120 + Math.floor(i / 6) * 160; const sp = MOB_LOOK[k] ? personSpr(MOB_LOOK[k], 'side', 'idle', 0) : beastSpr(k, 'side', 'idle', 0); drawFrame(g, sp, x, y, 1, 2 * (MOB_SCALE[k] || 1)); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText(k, x - 30, y + 30); });
