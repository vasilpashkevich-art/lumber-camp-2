// v81: перетаскивание вещей — мышью (как раньше) и пальцем: палец задержал на ячейке ~0,25 с — вещь «приклеилась»,
// едет за пальцем; отпустил над ячейкой или вкладкой — переложилась. Короткое касание — как и было (лист вещи).
// Использование: const D = makeDnD(done); D.drag(ячейка, что); D.drop(ячейка, куда => …). Элементы пересоздаются при каждой
// перерисовке окна — цель ищется под пальцем в момент отпускания (elementFromPoint), по полю __drop.
import { TOUCH } from './dom.js';
let ghost = null, src = null, hot = null, suppress = 0;
function clearGhost() { if (ghost) { ghost.remove(); ghost = null; } if (hot) { hot.classList.remove('over'); hot = null; } document.documentElement.classList.remove('dnd'); }
function targetAt(x, y) { const el = document.elementFromPoint(x, y); const b = el && el.closest('[data-drop]'); if (b && b.dataset.dropSelf && el !== b) return null; return b && b.__drop ? b : null; }   // dropSelf — только сам элемент (фон окна), не его содержимое
export function makeDnD(done) {
  const drag = (b, what) => {
    // мышь — родной перенос
    if (!TOUCH) {
      b.draggable = true;
      b.ondragstart = e => { src = what; b.classList.add('drag'); document.documentElement.classList.add('dnd'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', 'вещь'); } catch (_) { } };
      b.ondragend = () => { b.classList.remove('drag'); src = null; document.documentElement.classList.remove('dnd'); };
      return;
    }
    // палец
    b.style.touchAction = 'none';
    b.onpointerdown = e => {
      if (e.pointerType === 'mouse') return;
      const x0 = e.clientX, y0 = e.clientY, id = e.pointerId; let timer = 0, dragging = false;
      const start = () => {
        dragging = true; src = what; b.classList.add('drag'); document.documentElement.classList.add('dnd');
        ghost = b.cloneNode(true); ghost.className = 'cell ghost'; Object.assign(ghost.style, { position: 'fixed', left: 0, top: 0, zIndex: 100, pointerEvents: 'none', transform: `translate(${x0 - 28}px,${y0 - 28}px) scale(1.15)` });
        document.body.append(ghost); try { b.setPointerCapture(id); } catch (_) { }
      };
      timer = setTimeout(start, 240);
      const move = ev => {
        if (ev.pointerId !== id) return;
        if (!dragging) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) { clearTimeout(timer); cleanup(); } return; }
        ev.preventDefault(); ghost.style.transform = `translate(${ev.clientX - 28}px,${ev.clientY - 28}px) scale(1.15)`;
        const t = targetAt(ev.clientX, ev.clientY); if (t !== hot) { if (hot) hot.classList.remove('over'); hot = t; if (hot) hot.classList.add('over'); }
      };
      const up = ev => {
        if (ev.pointerId !== id) return;
        clearTimeout(timer);
        if (dragging) {
          const t = targetAt(ev.clientX, ev.clientY), s = src; src = null; b.classList.remove('drag');
          suppress = Date.now(); clearGhost();
          if (t && t !== b) { t.__drop(s); done(); }
        }
        cleanup();
      };
      const cleanup = () => { b.removeEventListener('pointermove', move); b.removeEventListener('pointerup', up); b.removeEventListener('pointercancel', up); };
      b.addEventListener('pointermove', move); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    };
    // после переноса пальцем — нажатие по той же ячейке не считать
    b.addEventListener('click', e => { if (Date.now() - suppress < 400) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  };
  const drop = (b, fn, self = false) => {
    b.dataset.drop = '1'; b.__drop = fn; if (self) b.dataset.dropSelf = '1';
    if (TOUCH) return;
    const mine = e => !b.dataset.dropSelf || e.target === b;
    b.ondragover = e => { if (src && mine(e)) { e.preventDefault(); b.classList.add('over'); } }; b.ondragleave = () => b.classList.remove('over');
    b.ondrop = e => { if (!mine(e)) return; e.preventDefault(); b.classList.remove('over'); const s = src; src = null; if (s) { fn(s); done(); } };
  };
  return { drag, drop };
}
