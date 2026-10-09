// Управление: клавиатура и мышь на компьютере, джойстик и кнопки на телефоне.
// Каждый кадр game получает I = {mx, my, attack, attackTap, ability, potion, interact, pick}.

export function createInput(cv) {
  const keys = new Set(), tap = new Set();
  let joy = null, pick = null, attackHeld = false;
  const In = { keys, enabled: true, onKey: null };

  addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (In.onKey && In.onKey(e.code, e) === false) { e.preventDefault(); return; }
    if (!In.enabled) return;
    if (!e.repeat) tap.add(e.code);
    keys.add(e.code);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => { keys.clear(); attackHeld = false; joy = null; });

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
  In.button = (el, code, hold) => {
    el.addEventListener('pointerdown', e => { e.preventDefault(); tap.add(code); if (hold) attackHeld = true; el.classList.add('on'); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => el.addEventListener(ev, () => { if (hold) attackHeld = false; el.classList.remove('on'); }));
  };
  In.joy = () => joy;

  /** Снять состояние на этот кадр. toWorld(sx,sy) переводит экран в мир. */
  In.read = toWorld => {
    const k = c => keys.has(c), t = c => tap.has(c);
    let mx = (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0);
    let my = (k('KeyS') || k('ArrowDown') ? 1 : 0) - (k('KeyW') || k('ArrowUp') ? 1 : 0);
    if (joy) { mx = joy.dx; my = joy.dy; }
    const I = {
      mx, my,
      attack: k('Space') || attackHeld, attackTap: t('Space') || t('Attack'),
      ability: t('KeyC'), ability2: t('KeyV'), sit: t('KeyX') || t('Sit'), potion: t('KeyQ') || t('Pot'), interact: t('KeyE') || t('Use'), trinket: t('Digit1') || t('Numpad1'),
      pick: pick && toWorld ? { ...toWorld(pick.sx, pick.sy), touch: pick.touch } : null,
      tabTarget: t('Tab'),
    };
    tap.clear(); pick = null;
    return I;
  };
  In.clear = () => { keys.clear(); tap.clear(); attackHeld = false; joy = null; pick = null; touches.clear(); pinch = null; if (joyEl) joyEl.hidden = true; };
  return In;
}
