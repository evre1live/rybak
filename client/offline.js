// Кэш игры на устройстве (public/sw.js): регистрация, докачка остального в фоне, обновление версии.
import { isTouch } from './util.js';

export function initCache(game) {
  const q = new URLSearchParams(location.search);
  if (!('serviceWorker' in navigator) || window.RYBAK_OFFLINE) return;
  // на машине разработчика кэш мешает (правки не видны): там он включается только по ?sw; ?nosw — снять его совсем
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (q.has('nosw') || (local && !q.has('sw'))) {
    if (q.has('nosw')) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()), () => {});
    return;
  }
  // браузер готов поставить игру как приложение (значок на рабочем столе) — кнопка появится в настройках
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    game.installPrompt = e;
  });
  addEventListener('appinstalled', () => (game.installPrompt = null));
  const had = !!navigator.serviceWorker.controller; // кэш уже работал до этого запуска
  game.cache = { on: had, done: 0, total: 0 };
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data && e.data.t === 'fill') Object.assign(game.cache, { on: true, done: e.data.got, total: e.data.total, version: e.data.version });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    game.cache.on = true;
    if (!had) return; // первый запуск: кэш только что завёлся, перезапускать нечего
    // вышла новая версия: на заставке перезапускаемся сразу, посреди игры — со следующего запуска
    if (game.state === 'title' && !game.ui.panel && !document.activeElement?.value) location.reload();
    else game.ui.toast('Вышло обновление игры — оно включится при следующем запуске', 'gold', 6000);
  });
  navigator.serviceWorker.register('/sw.js').catch(() => {});
  // остальные файлы докачиваем, когда кэш заработал, а игра уже идёт; телефону не нужны полные герои, компьютеру — облегчённые
  navigator.serviceWorker.ready.then((reg) => {
    setTimeout(() => {
      const sw = reg.active || navigator.serviceWorker.controller;
      if (!sw || (navigator.connection && navigator.connection.saveData)) return;
      sw.postMessage({ t: 'fill', skip: isTouch() ? '/(hero-[a-z]+|npc-vendor)\\.glb$' : '\\.lite\\.glb$' });
    }, +(q.get('sw') || 0) > 1 ? 300 : 12000);
  }, () => {});
}

/** Сервер на бесплатном тарифе засыпает; игра из кэша открывается раньше, чем он проснётся. up(true/false) — как только станет ясно. */
export function wakeServer(up) {
  if (window.RYBAK_OFFLINE) return;
  const t0 = performance.now();
  const slow = setTimeout(() => up(false), 2500);
  const ping = (n) =>
    fetch('/health', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        clearTimeout(slow);
        up(true, performance.now() - t0);
      })
      .catch(() => {
        up(false);
        if (n < 40) setTimeout(() => ping(n + 1), 3000);
      });
  ping(0);
}
