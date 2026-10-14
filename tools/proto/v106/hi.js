import { gearIconUrl } from '../../../src/ui/icons.js';
import { makeItem } from '../../../src/systems/items.js';
window.go = () => { const out = []; for (const cls of ['warrior', 'mage', 'archer']) for (const [lv, rar] of [[2, 'common'], [9, 'good'], [16, 'rare'], [24, 'rare'], [30, 'epic']]) out.push(gearIconUrl(makeItem(cls, 'head', lv, rar, Math.random))); return out; };
