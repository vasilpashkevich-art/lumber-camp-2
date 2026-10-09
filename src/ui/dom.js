// Мелочи для окон: поиск, создание элементов, окно поверх игры, всплывающие сообщения.
export const $ = s => document.querySelector(s);
/** Телефон или планшет: палец вместо мыши (v69). В адресе #touch — включить для проверки на компьютере. */
export const TOUCH = typeof matchMedia !== 'undefined' && (matchMedia('(pointer:coarse)').matches || /touch/.test(location.hash));
/** Надпись под устройство: на компьютере — про клавишу, на телефоне — про касание. */
export const T = (pc, touch) => TOUCH ? touch : pc;
export function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

/** Окно поверх всего. Закрывается по Esc или кнопке. */
export function modal(html, cls = '') {
  const bg = el('div', 'modal'), box = el('div', 'box ' + cls, html);
  bg.append(box); document.body.append(bg);
  // палец: касание, которое открыло окно, не должно тут же нажать кнопку под собой
  const t0 = performance.now(); if (TOUCH) bg.addEventListener('click', e => { if (performance.now() - t0 < 350) { e.stopPropagation(); e.preventDefault(); } }, true);
  const x = el('button', 'xclose', '×'); x.title = 'Закрыть'; x.onclick = () => box.close(); box.prepend(x);
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); box.close(); } };
  box.close = () => { bg.remove(); removeEventListener('keydown', onKey, true); box.onclose && box.onclose(); };
  bg.addEventListener('pointerdown', e => { if (e.target === bg) box.close(); });
  addEventListener('keydown', onKey, true);
  return box;
}

const shown = new Map();
/** Сообщение сверху по центру. Одинаковые id не повторяются чаще раза в 1,5 с. */
export function toast(s, kind = '', id = null) {
  const now = performance.now();
  if (id && shown.get(id) > now - 1500) return; if (id) shown.set(id, now);
  const box = document.getElementById('toasts'); if (!box) return;
  const t = el('div', 'toast ' + kind, s); box.append(t);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
}

/** Название зоны крупно, как в WoW: появляется и гаснет. */
export function zoneTitle(name, sub) {
  let e = document.getElementById('zoneTitle'); if (!e) return;
  e.innerHTML = `<b>${name}</b><small>${sub}</small>`; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show');
}
