// Кэш игры на устройстве игрока. Файл собирает tools/build.js: VERSION и FILES подставляются при сборке,
// готовый лежит в public/sw.js. Версия меняется с любым изменением файлов игры.
//
// Зачем: 1) игра открывается сразу, даже пока сервер просыпается, и в одиночку идёт без сети;
// 2) при запуске браузер не переспрашивает сервер по каждой модели; 3) после обновления игры
// заново качается только то, что изменилось (сверка по отпечатку содержимого).
const VERSION = '__VERSION__';
const FILES = __FILES__; // путь → отпечаток содержимого
const CACHE = 'rybak-' + VERSION;
const META = '/__files.json';
// без этого игра не запустится
const CORE = ['/index.html', '/app.js', '/style.css', '/favicon.svg', '/manifest.webmanifest', '/models/manifest.json'].filter((f) => FILES[f]);

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // что не изменилось с прошлой версии — берём из её кэша, а не качаем заново
      for (const k of await caches.keys()) {
        if (!k.startsWith('rybak-') || k === CACHE) continue;
        const old = await caches.open(k);
        const meta = await old.match(META).then((r) => (r ? r.json() : null)).catch(() => null);
        if (!meta) continue;
        for (const f of Object.keys(FILES)) {
          if (meta[f] !== FILES[f] || (await cache.match(f))) continue;
          const hit = await old.match(f);
          if (hit) await cache.put(f, hit);
        }
      }
      await cache.put(META, new Response(JSON.stringify(FILES), { headers: { 'content-type': 'application/json' } }));
      for (const f of CORE) {
        if (await cache.match(f)) continue;
        const r = await fetch(f, { cache: 'reload' });
        if (!r.ok) throw new Error('не скачалось: ' + f);
        await cache.put(f, r);
      }
      await self.skipWaiting();
    })()
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith('rybak-') && k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })()
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  let path = url.pathname;
  if (path === '/health' || path.startsWith('/api/')) return; // ответы сервера: их не подменяем страницей игры, даже если адрес открыли в строке браузера
  if (path === '/' || (req.mode === 'navigate' && !/\.[a-z0-9]+$/i.test(path))) path = '/index.html';
  if (!FILES[path]) return; // /health и всё, чего нет в сборке, идёт на сервер как обычно
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(path);
      if (hit) return hit;
      const r = await fetch(path, { cache: 'no-cache' });
      if (r.ok) cache.put(path, r.clone());
      return r;
    })()
  );
});
// страница просит докачать остальное: тогда игра целиком лежит на устройстве
self.addEventListener('message', (e) => {
  if (e.data && e.data.t === 'fill') e.waitUntil(fill(e.data.skip, e.source));
});
async function fill(skip, client) {
  const cache = await caches.open(CACHE);
  const re = skip ? new RegExp(skip) : null;
  const all = Object.keys(FILES).filter((f) => !(re && re.test(f)));
  let done = 0, got = 0;
  for (const f of all) {
    if (await cache.match(f)) got++;
    else
      try {
        const r = await fetch(f, { cache: 'no-cache' });
        if (r.ok) {
          await cache.put(f, r);
          got++;
        }
      } catch (err) {
        /* нет сети — докачается в другой раз */
      }
    done++;
    if (client && (done % 8 === 0 || done === all.length)) client.postMessage({ t: 'fill', done, got, total: all.length, version: VERSION });
  }
}
