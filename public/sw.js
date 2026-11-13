// Кэш игры на устройстве игрока. Файл собирает tools/build.js: VERSION и FILES подставляются при сборке,
// готовый лежит в public/sw.js. Версия меняется с любым изменением файлов игры.
//
// Зачем: 1) игра открывается сразу, даже пока сервер просыпается, и в одиночку идёт без сети;
// 2) при запуске браузер не переспрашивает сервер по каждой модели; 3) после обновления игры
// заново качается только то, что изменилось (сверка по отпечатку содержимого).
const VERSION = "fcc9d5b816";
const FILES = {"/app.js":"06fb3ca956e6","/audio/loop-crickets.webm":"b89f387722e2","/audio/loop-fire.webm":"98a7452037d5","/audio/loop-motor.webm":"54c8cd9148dc","/audio/loop-rain.webm":"f36c236bf485","/audio/loop-waterfall.webm":"a1b6789c7315","/audio/loop-waves.webm":"2662ca399667","/audio/loop-wind.webm":"13367fb21bf0","/audio/plop.webm":"16f8f7fc4238","/audio/reel.webm":"fb48d4209f93","/audio/sfx.webm":"e7ec975c79ca","/audio/snap.webm":"7832e8a9b53e","/audio/sounds.json":"d2bccbcb8593","/audio/splash.webm":"c533a5c17d9e","/favicon.svg":"b9a4e5f076e7","/fonts/fira-sans-condensed-cyrillic-600-italic.woff2":"67001ffad626","/fonts/fira-sans-condensed-cyrillic-800-italic.woff2":"5e34bda2e83b","/fonts/fira-sans-condensed-latin-600-italic.woff2":"88dec9292934","/fonts/fira-sans-condensed-latin-800-italic.woff2":"6d76fe70fbd7","/fonts/onest-cyrillic-400-normal.woff2":"0a47f6c9b74b","/fonts/onest-cyrillic-500-normal.woff2":"1f796be0da06","/fonts/onest-cyrillic-600-normal.woff2":"169ab02f2680","/fonts/onest-cyrillic-700-normal.woff2":"e557c04233d0","/fonts/onest-latin-400-normal.woff2":"c250e11bff9c","/fonts/onest-latin-500-normal.woff2":"653ecd75f58a","/fonts/onest-latin-600-normal.woff2":"7727f1acfd99","/fonts/onest-latin-700-normal.woff2":"de50096def26","/icon-192.png":"642f9f0da4ba","/icon-512.png":"a4d5c4b700ad","/img/place-bay.webp":"9275c61a5121","/index.html":"ddb8a370268f","/manifest.webmanifest":"ba30674d996f","/models/env-arch.glb":"24dbcdb24f7c","/models/env-arch.lod.glb":"c2cbe63da382","/models/env-bench.glb":"8ca29f278147","/models/env-birch.glb":"9b9feabcc127","/models/env-birch.lod.glb":"26d330b1e7a7","/models/env-bush.glb":"5aa5249b4cf2","/models/env-bush.lod.glb":"b6197facdff8","/models/env-campfire.glb":"3dbf8fff9177","/models/env-cliff1.glb":"684420d2df4b","/models/env-cliff1.lod.glb":"b1c356b7c3db","/models/env-cliff2.glb":"a7a38fd45481","/models/env-cliff2.lod.glb":"c10eb847deff","/models/env-cottage.glb":"8fcd25a959c6","/models/env-fender.glb":"a10edb9c08d7","/models/env-hut.glb":"44a4d9fa1c4b","/models/env-lamppost.glb":"9b95cac7a265","/models/env-lighthouse.glb":"36cf39a360bd","/models/env-motorboat.glb":"24e6bb22e89f","/models/env-oak.glb":"784583d22a1d","/models/env-oak.lod.glb":"02fdc77ca43a","/models/env-palm.glb":"bc1420da57a4","/models/env-palm.lod.glb":"e7ddc4f62ba7","/models/env-pile.glb":"5a545e05ca06","/models/env-pile.lod.glb":"ec70363746c3","/models/env-pine.glb":"56f36ed14e05","/models/env-pine.lod.glb":"a0f57d415d81","/models/env-rental.glb":"0a72d9d82584","/models/env-rock1.glb":"a7303e3e8a2c","/models/env-rock1.lod.glb":"243b376c6683","/models/env-rock2.glb":"cc4ad2559882","/models/env-rock2.lod.glb":"d35920ee8dcf","/models/env-rock3.glb":"a1e57a4f7ce5","/models/env-rock3.lod.glb":"970f838e7edc","/models/env-seagull.glb":"9d82dc0ec65b","/models/env-signpost.glb":"d69196cbf23e","/models/env-wreck.glb":"4312ee4fa12c","/models/fish-bychok.glb":"0a71ed115684","/models/fish-dorado.glb":"f6e804cf463c","/models/fish-forel.glb":"74435116e4f3","/models/fish-kambala.glb":"2e527637b2f0","/models/fish-karas.glb":"72c16973e88e","/models/fish-karp.glb":"59c1816372f7","/models/fish-kefal.glb":"e41ce6680393","/models/fish-koi.glb":"071951793e34","/models/fish-lesh.glb":"434c37bf4c76","/models/fish-losos.glb":"33e4be6ed8ef","/models/fish-mech.glb":"904daa2d5924","/models/fish-morokun.glb":"a7ae774f8b92","/models/fish-okun.glb":"ad0da24a83aa","/models/fish-plotva.glb":"ad653ee323ef","/models/fish-sargan.glb":"d5ecbc5695bd","/models/fish-shuka.glb":"cffb20cfefd8","/models/fish-sibas.glb":"ad5b68216b72","/models/fish-skat.glb":"fda5c15af6ae","/models/fish-skumbria.glb":"b352076dbd98","/models/fish-som.glb":"ee619dfa7e7c","/models/fish-starik.glb":"d9508c6fb975","/models/fish-stavrida.glb":"c52c1d28f9cf","/models/fish-sudak.glb":"662705fa1b39","/models/fish-tunec.glb":"86857055bec4","/models/fish-ugor.glb":"235f47e3237f","/models/hero-archie.glb":"4fb6f8f01aaa","/models/hero-archie.lite.glb":"e3f9ef08f79d","/models/hero-bjorn.glb":"0199d28c3414","/models/hero-bjorn.lite.glb":"a6bbe55ddb31","/models/hero-black.glb":"41de01367db5","/models/hero-black.lite.glb":"522a3e230f82","/models/hero-finn.glb":"1f39f69e65fd","/models/hero-finn.lite.glb":"ee509a3f88df","/models/hero-gosha.glb":"1233a166edd8","/models/hero-gosha.lite.glb":"02874a999215","/models/hero-kai.glb":"8cbbe1924669","/models/hero-kai.lite.glb":"b1838495006e","/models/hero-nori.glb":"1c6f129de465","/models/hero-nori.lite.glb":"37d1f77c4a25","/models/hero-pip.glb":"d6dc1a4cbe50","/models/hero-pip.lite.glb":"a122456f1177","/models/hero-yellow.glb":"b7ad74b12f95","/models/hero-yellow.lite.glb":"c021d7e391d3","/models/icons/fish-bychok.webp":"167ca8bd09b8","/models/icons/fish-dorado.webp":"a95701b4881a","/models/icons/fish-forel.webp":"e15e4c5b5947","/models/icons/fish-kambala.webp":"8685d279fbc1","/models/icons/fish-karas.webp":"83ca2d76b479","/models/icons/fish-karp.webp":"1cc2502d513d","/models/icons/fish-kefal.webp":"0e3ea867bb0f","/models/icons/fish-koi.webp":"8aceaba6665f","/models/icons/fish-lesh.webp":"34cba7eaadf5","/models/icons/fish-losos.webp":"179e147f27ca","/models/icons/fish-mech.webp":"c8ba33fb5ae9","/models/icons/fish-morokun.webp":"f79c92377d18","/models/icons/fish-okun.webp":"aa71bbb1048d","/models/icons/fish-plotva.webp":"6cd4a7a2195a","/models/icons/fish-sargan.webp":"6afe3cad35a5","/models/icons/fish-shuka.webp":"6cc45c2bc799","/models/icons/fish-sibas.webp":"79bed7a8f997","/models/icons/fish-skat.webp":"94205aaae838","/models/icons/fish-skumbria.webp":"e4f252a7498c","/models/icons/fish-som.webp":"32ee0cec38a9","/models/icons/fish-starik.webp":"5b7045a51da3","/models/icons/fish-stavrida.webp":"2837dd3ad703","/models/icons/fish-sudak.webp":"17ec29e51cc7","/models/icons/fish-tunec.webp":"8ef79d01c29d","/models/icons/fish-ugor.webp":"b189c61ad3ef","/models/icons/hero-archie.webp":"287a6daf9bbc","/models/icons/hero-bjorn.webp":"3b6b71733788","/models/icons/hero-black.webp":"50dcff6fa574","/models/icons/hero-finn.webp":"c54cc9b4fd3a","/models/icons/hero-gosha.webp":"896844ed0489","/models/icons/hero-kai.webp":"bc29dc5d3988","/models/icons/hero-nori.webp":"50a35d9dbc48","/models/icons/hero-pip.webp":"c3371298d296","/models/icons/hero-yellow.webp":"c5d90c2d7b1f","/models/icons/junk-boot.webp":"220eb32bee3f","/models/icons/junk-bottle.webp":"fd83e42fe402","/models/icons/junk-can.webp":"d73b2e559c45","/models/icons/junk-chest.webp":"befe1740ae4f","/models/icons/prop-anchor.webp":"534e6ad88b20","/models/icons/prop-barrel.webp":"cd0d8c8b2802","/models/icons/prop-boat.webp":"8b840284c7d3","/models/icons/prop-bucket.webp":"9d6cf07e5544","/models/icons/prop-buoy.webp":"edcd6656e0a3","/models/icons/prop-cooler.webp":"4edfe4e3fcc1","/models/icons/prop-crate.webp":"5ed60c4f9ff8","/models/icons/prop-fishtray.webp":"b5ccea38bafe","/models/icons/prop-lantern.webp":"c3914f1ee1b5","/models/icons/prop-lifering.webp":"1e617955b92f","/models/icons/prop-netpile.webp":"f130efad3a68","/models/icons/prop-ropecoil.webp":"95681f1fe863","/models/icons/prop-shelfgoods.webp":"d9c5008d97fc","/models/icons/prop-tacklebox.webp":"b9e5c7546198","/models/icons/prop-trap.webp":"60b7cbc22afd","/models/junk-boot.glb":"6a9cdb57951d","/models/junk-bottle.glb":"5d7a09aac52f","/models/junk-can.glb":"1ac64f73ccd3","/models/junk-chest.glb":"963491d8d551","/models/manifest.json":"86b0883fb370","/models/npc-vendor.glb":"c14c7262f385","/models/npc-vendor.lite.glb":"5e24e0337391","/models/prop-anchor.glb":"dca33d80ffcd","/models/prop-barrel.glb":"8e398cbc202f","/models/prop-boat.glb":"368a1d52262a","/models/prop-bucket.glb":"1135c87b419c","/models/prop-buoy.glb":"4660951d42cc","/models/prop-cooler.glb":"faf4a076d6ca","/models/prop-crate.glb":"9f37ad468d10","/models/prop-fishtray.glb":"1570d23bad86","/models/prop-lantern.glb":"c8bb2d7f35a9","/models/prop-lifering.glb":"fafae3339c22","/models/prop-netpile.glb":"135bf07068fc","/models/prop-ropecoil.glb":"1b52b3ef651a","/models/prop-shelfgoods.glb":"506c738eb7e8","/models/prop-tacklebox.glb":"f4240401aee7","/models/prop-trap.glb":"e4595086f700","/style.css":"510fc5634ddf","/tex/dirt.webp":"5cb77f15b0ce","/tex/grass.webp":"6b5b271537d1","/tex/rock.webp":"8c066963224a","/tex/sand.webp":"22c66fdde738","/tex/wood.webp":"40b5203d70f1"}; // путь → отпечаток содержимого
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
