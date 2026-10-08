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

  // мышь: клик по мобу — выбрать цель
  cv.addEventListener('pointerdown', e => {
    if (!In.enabled) return;
    if (e.pointerType === 'mouse') { pick = { sx: e.clientX, sy: e.clientY }; return; }
    // палец: левая половина экрана — джойстик, правая — выбрать цель
    if (e.clientX < innerWidth * 0.5) { joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 }; cv.setPointerCapture(e.pointerId); }
    else pick = { sx: e.clientX, sy: e.clientY };
  });
  cv.addEventListener('pointermove', e => {
    if (joy && e.pointerId === joy.id) { let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const m = Math.hypot(dx, dy), R = 50; if (m > R) { dx *= R / m; dy *= R / m; } joy.dx = dx / R; joy.dy = dy / R; }
  });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, e => { if (joy && e.pointerId === joy.id) joy = null; }));

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
      ability: t('KeyC'), ability2: t('KeyV'), sit: t('KeyX'), potion: t('KeyQ'), interact: t('KeyE'),
      pick: pick && toWorld ? toWorld(pick.sx, pick.sy) : null,
      tabTarget: t('Tab'),
    };
    tap.clear(); pick = null;
    return I;
  };
  In.clear = () => { keys.clear(); tap.clear(); attackHeld = false; joy = null; pick = null; };
  return In;
}
