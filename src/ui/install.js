// v70: игра значком на экране телефона (как приложение). Работает только с сайта на GitHub:
// в артефакте Claude браузер не даёт ставить страницу значком — там показываем адрес сайта.
import { TOUCH } from './dom.js';

export const SITE = 'https://vasilpashkevich-art.github.io/lumber-camp-2/';
let deferred = null;   // Android: браузер сам предлагает поставить — ловим это предложение
const onSite = () => (/github\.io$/.test(location.hostname) && location.protocol === 'https:') || location.hostname === 'localhost';   // localhost — для проверки
const standalone = () => (typeof matchMedia !== 'undefined' && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches)) || navigator.standalone === true;
const ios = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Запуск: работник страницы (без интернета) и ловля предложения «поставить». */
export function initInstall() {
  if (typeof window === 'undefined') return;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  addEventListener('appinstalled', () => { deferred = null; });
  if (onSite() && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
}

/** Блок для меню: кнопка «Установить» или подсказка, как поставить значок. Пусто, если уже стоит или это компьютер. */
export function installHtml() {
  if (standalone() || !TOUCH) return '';
  let body;
  if (!onSite()) body = `<p>Чтобы игра была значком на экране, откройте её в браузере телефона на сайте:<br><b class="sel">${SITE.replace('https://', '')}</b><br>и поставьте оттуда. Сохранения переносятся через «В файл» и «Из файла» на экране героев.</p>`;
  else if (deferred) body = `<p>Игра встанет значком на экран телефона и будет открываться на весь экран, даже без интернета.</p><div class="row"><button class="btn main" data-x="install">Установить игру</button></div>`;
  else if (ios()) body = `<p>Нажмите <b>«Поделиться»</b> внизу Safari, затем <b>«На экран „Домой“»</b>. На iPhone у значка свои сохранения — перенесите героя через «В файл» и «Из файла».</p>`;
  else body = `<p>Откройте меню браузера (⋮) и выберите <b>«Добавить на главный экран»</b> или <b>«Установить приложение»</b>.</p>`;
  return `<div class="inst"><h3>Значок на телефоне</h3>${body}</div>`;
}
/** Повесить кнопку «Установить» в уже открытом окне. */
export function bindInstall(m) {
  const b = m.querySelector('[data-x=install]'); if (!b) return;
  b.onclick = async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (_) { } deferred = null; b.closest('.inst').innerHTML = '<p>Готово — ищите значок «Континент» на экране телефона.</p>'; };
}
