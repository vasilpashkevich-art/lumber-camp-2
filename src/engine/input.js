// Управление: клавиатура и мышь на компьютере, джойстик и кнопки на телефоне.
// Каждый кадр game получает I = {mx, my, attack, attackTap, ability, potion, interact, pick}.

/** Действия панели: удар, умения по номеру в списке класса (3 — пассивное, без кнопки), аксессуар, зелье на 2, зелье здоровья. */
export const DEFAULT_BAR = ['attack', 'ab0', 'ab1', 'ab2', 'ab4', 'trinket', 'pot2', 'potion'];
export const ACTION_FIELD = { attack: 'attack', ab0: 'ability', ab1: 'ability2', ab2: 'ability3', ab4: 'ability4', trinket: 'trinket', pot2: 'potion2', potion: 'potion' };

export function createInput(cv) {
  const keys = new Set(), tap = new Set();
  let joy = null, pick = null; const held = new Set();   // v85: зажатые кнопки на экране (по коду)
  const In = { keys, enabled: true, onKey: null, DEFAULT_BAR, ACTION_FIELD };

  addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (In.onKey && In.onKey(e.code, e) === false) { e.preventDefault(); return; }
    if (!In.enabled) return;
    if (!e.repeat) tap.add(e.code);
    keys.add(e.code);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => { keys.clear(); held.clear(); joy = null; });

  // мышь: щелчок — цель или действие (подойти и обыскать/копать/поговорить)
  // палец (v69): короткое касание — то же + идти по земле; ведёшь пальцем в левой части — джойстик; два пальца — приближение
  const touches = new Map(); let pinch = null, joyEl = null;
  const joyShow = () => { if (!joyEl) { joyEl = document.createElement('div'); joyEl.id = 'joy'; joyEl.innerHTML = '<i></i>'; document.body.append(joyEl); }
    joyEl.hidden = !joy; if (joy) { joyEl.style.left = joy.ox + 'px'; joyEl.style.top = joy.oy + 'px'; joyEl.firstChild.style.transform = `translate(${joy.dx * 42}px,${joy.dy * 42}px)`; } };
  cv.addEventListener('pointerdown', e => {
    if (!In.enabled) return;
    if (e.pointerType === 'mouse') { if (e.button === 0) pick = { sx: e.clientX, sy: e.clientY, touch: false }; return; }
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    touches.set(e.pointerId, { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), moved: false });
    if (touches.size === 2) { joy = null; joyShow(); const [a, b] = [...touches.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); for (const t of touches.values()) t.moved = true; }
  });
  cv.addEventListener('pointermove', e => {
    const t = touches.get(e.pointerId); if (!t) return;
    t.x = e.clientX; t.y = e.clientY;
    if (pinch && touches.size >= 2) { const [a, b] = [...touches.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (In.onPinch && Math.abs(d / pinch - 1) > 0.12) { In.onPinch(d / pinch); pinch = d; } return; }
    if (!t.moved && Math.hypot(t.x - t.x0, t.y - t.y0) > 14) { t.moved = true; if (t.x0 < innerWidth * 0.5 && !joy) joy = { id: e.pointerId, ox: t.x0, oy: t.y0, dx: 0, dy: 0 }; }
    if (joy && e.pointerId === joy.id) { let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const m = Math.hypot(dx, dy), R = 50; if (m > R) { dx *= R / m; dy *= R / m; } joy.dx = dx / R; joy.dy = dy / R; joyShow(); }
  });
  const up = e => {
    const t = touches.get(e.pointerId); if (!t) return; touches.delete(e.pointerId);
    if (joy && e.pointerId === joy.id) { joy = null; joyShow(); }
    if (touches.size < 2) pinch = null;
    if (e.type === 'pointerup' && !t.moved && performance.now() - t.t0 < 450 && In.enabled) pick = { sx: t.x, sy: t.y, touch: true };
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  /** Кнопки на экране (телефон): нажатие = как клавиша. */
  // v85: нажатие срабатывает при отпускании (короткое касание), чтобы перетаскивание кнопки её не нажимало; удержание — пока зажата
  In.button = (el, code) => {
    let t0 = 0;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') e.preventDefault(); t0 = performance.now(); held.add(code); el.classList.add('on'); });   // мышь без preventDefault — иначе не начнётся перетаскивание
    el.addEventListener('pointerup', () => { if (held.has(code) && performance.now() - t0 < 300) tap.add(code); held.delete(code); el.classList.remove('on'); el.blur && el.blur(); });
    ['pointercancel', 'pointerleave', 'dragstart'].forEach(ev => el.addEventListener(ev, () => { held.delete(code); el.classList.remove('on'); }));
  };
  /** Ячейки панели действий (v85): клавиши у ячеек, действия переставляются (h.bar). */
  In.SLOT_KEYS = [['Space', 'Attack'], ['KeyC'], ['KeyV'], ['KeyR'], ['KeyF'], ['Digit1', 'Numpad1', 'Trk'], ['Digit2', 'Numpad2', 'Pot2'], ['KeyQ', 'Pot']];
  In.joy = () => joy;

  /** Снять состояние на этот кадр. toWorld(sx,sy) переводит экран в мир. */
  In.read = (toWorld, bar = null) => {
    const k = c => keys.has(c) || held.has(c), t = c => tap.has(c);
    let mx = (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0);
    let my = (k('KeyS') || k('ArrowDown') ? 1 : 0) - (k('KeyW') || k('ArrowUp') ? 1 : 0);
    if (joy) { mx = joy.dx; my = joy.dy; }
    const I = {
      mx, my,
      sit: t('KeyX') || t('Sit'), interact: t('KeyE') || t('Use'),
      pick: pick && toWorld ? { ...toWorld(pick.sx, pick.sy), touch: pick.touch } : null,
      tabTarget: t('Tab'),
    };
    // действия панели по ячейкам: что лежит в ячейке — то и срабатывает от её клавиши
    const B = bar || In.DEFAULT_BAR;
    In.SLOT_KEYS.forEach((codes, i) => { const a = B[i], tp = codes.some(t), hd = codes.some(k); const F = In.ACTION_FIELD[a]; if (!F) return; if (a === 'attack') { I.attack = hd; I.attackTap = tp; } else if (tp) I[F] = true; });
    tap.clear(); pick = null;
    return I;
  };
  In.clear = () => { keys.clear(); tap.clear(); held.clear(); joy = null; pick = null; touches.clear(); pinch = null; if (joyEl) joyEl.hidden = true; };
  return In;
}
