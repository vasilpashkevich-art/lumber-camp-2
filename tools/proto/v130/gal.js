// Эскиз v130: ювелирная мастерская рядом с банком, кузницей, гильдией рудокопов и героем.
import { TBLD } from '../../../src/art/tbld.js';
import { personSpr, drawFrame, PEOPLE_K, styled } from '../../../src/art/sprites.js';
import { starterLook } from '../../../src/systems/items.js';
export function draw(cv, bg = '#8a9a6a') {
  const list = ['miners', 'jeweler', 'forge', 'bank'], cw = 520, ch = 520; cv.width = cw * list.length; cv.height = ch; const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, cv.width, ch);
  list.forEach((k, i) => { const x = i * cw + cw / 2 - 30, y = ch - 60; const t = document.createElement('canvas'); t.width = cw; t.height = ch; const tg = t.getContext('2d'); tg.lineJoin = tg.lineCap = 'round';
    styled(gg => { gg.translate(cw / 2 - 30, ch - 60); TBLD[k](gg, 0, 0.4); })(tg); g.drawImage(t, i * cw, 0);
    drawFrame(g, personSpr({ ...starterLook('warrior'), key: 'g130' }, 'front', 'idle', 0), x + 190, y + 16, 1, PEOPLE_K);
    g.fillStyle = '#1a120c'; g.font = '18px Georgia'; g.fillText({ miners: 'Гильдия рудокопов', jeweler: 'Ювелирная мастерская (новая)', forge: 'Кузница', bank: 'Банк' }[k], i * cw + 10, 26); });
}
