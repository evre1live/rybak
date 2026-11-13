// Хранилище сохранений и рекордов: Postgres.
//
// Таблицы заводятся сами при запуске сервера. Каждое действие — один запрос к базе, без многошаговых
// транзакций: запись сохранения сама проверяет, что её не опередило другое устройство (сверка номера версии).
//
// players — по строке на игрока: само сохранение и то, что из него видно в таблице рекордов.
// records — лучший вес по каждому виду рыбы (зеркало журнала из сохранения).
// history — запас: каким сохранение было в начале каждого игрового дня (30 дней). Нужен, чтобы вернуть
//           прогресс, если его затёрли по ошибке.
// rooms   — комнаты игры вдвоём и компанией: кто в комнате, её часы, турнир. Сервер держит комнаты в памяти,
//           а сюда записывает, чтобы после перезапуска игроки вернулись в ту же комнату. Жетоны мест лежат
//           здесь только отпечатками (sha256): по записи в базе чужое место не занять.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS players (
    id text PRIMARY KEY,
    pub text NOT NULL,
    rev integer NOT NULL DEFAULT 1,
    save jsonb NOT NULL,
    saved_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    client_at bigint NOT NULL DEFAULT 0,
    listed boolean NOT NULL DEFAULT true,
    name text NOT NULL DEFAULT 'Рыбак',
    xp integer NOT NULL DEFAULT 0,
    lvl integer NOT NULL DEFAULT 1,
    species integer NOT NULL DEFAULT 0,
    caught integer NOT NULL DEFAULT 0,
    legends integer NOT NULL DEFAULT 0,
    medals integer NOT NULL DEFAULT 0,
    tours integer NOT NULL DEFAULT 0,
    tag text NOT NULL DEFAULT ''
  )`,
  'CREATE INDEX IF NOT EXISTS players_top ON players (xp DESC) WHERE listed',
  'CREATE INDEX IF NOT EXISTS players_pub ON players (pub)',
  `CREATE TABLE IF NOT EXISTS records (
    player_id text NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    sp text NOT NULL,
    w numeric(8,3) NOT NULL,
    n integer NOT NULL DEFAULT 1,
    at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (player_id, sp)
  )`,
  'CREATE INDEX IF NOT EXISTS records_sp_w ON records (sp, w DESC)',
  `CREATE TABLE IF NOT EXISTS history (
    player_id text NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    day date NOT NULL,
    rev integer NOT NULL,
    xp integer NOT NULL DEFAULT 0,
    save jsonb NOT NULL,
    saved_at timestamptz NOT NULL,
    PRIMARY KEY (player_id, day)
  )`,
  `CREATE TABLE IF NOT EXISTS rooms (
    code text PRIMARY KEY,
    data jsonb NOT NULL,
    seen bigint NOT NULL DEFAULT 0
  )`
];
const MS = (col) => `(extract(epoch from ${col}) * 1000)::float8`;
const SUM = `name, xp, lvl, species, caught, legends, medals, tours`;

/** query(text, params) → Promise<{ rows }> — так отвечают и pg.Pool, и PGlite (им проверяем запросы в тестах). */
export function createStore(query) {
  const rows = async (text, params = []) => (await query(text, params)).rows;
  return {
    async init() {
      for (const s of SCHEMA) await query(s);
      await query(`DELETE FROM history WHERE saved_at < now() - interval '30 days'`);
    },
    /** Сколько сохранений лежит на сервере. */
    async count() {
      return (await rows('SELECT count(*)::int AS n FROM players'))[0].n;
    },
    /** Сохранение игрока: { rev, at, save, listed, pub, sum } или null. */
    async load(id) {
      const r = (await rows(`SELECT rev, save, listed, pub, tag, ${MS('saved_at')} AS at, ${SUM} FROM players WHERE id = $1`, [id]))[0];
      return r ? shape(r) : null;
    },
    /**
     * Записать сохранение. base — версия, от которой шёл игрок. Запись проходит, если на сервере та же версия
     * и опыта не стало меньше (в обычной игре он только растёт), либо если игрок сам велел заменить (force).
     * tag — метка этой записи от устройства: по ней оно узнаёт свою запись, если ответ сервера до него не дошёл.
     * → { ok: true, rev, at, fresh } или { ok: false, now } — что лежит на сервере (или null, если запись пропала).
     */
    async save({ id, pub, base = 0, force = false, save, sum, clientAt = 0, listed = true, tag = '' }) {
      const r = (await rows(
        `WITH old AS (SELECT id, rev, xp, save, saved_at FROM players WHERE id = $1),
        bak AS (
          INSERT INTO history (player_id, day, rev, xp, save, saved_at)
          SELECT id, (saved_at AT TIME ZONE 'UTC')::date, rev, xp, save, saved_at FROM old
          WHERE $4::boolean OR (old.rev = $3::int AND old.xp <= $9::int)
          ON CONFLICT (player_id, day) DO NOTHING
        )
        INSERT INTO players (id, pub, rev, save, client_at, listed, name, xp, lvl, species, caught, legends, medals, tours, tag)
        VALUES ($1, $2, 1, $5::jsonb, $6::bigint, $7::boolean, $8, $9::int, $10::int, $11::int, $12::int, $13::int, $14::int, $15::int, $16)
        ON CONFLICT (id) DO UPDATE SET rev = players.rev + 1, save = EXCLUDED.save, saved_at = now(), client_at = EXCLUDED.client_at,
          listed = EXCLUDED.listed, name = EXCLUDED.name, xp = EXCLUDED.xp, lvl = EXCLUDED.lvl, species = EXCLUDED.species,
          caught = EXCLUDED.caught, legends = EXCLUDED.legends, medals = EXCLUDED.medals, tours = EXCLUDED.tours, tag = EXCLUDED.tag
        WHERE $4::boolean OR (players.rev = $3::int AND players.xp <= EXCLUDED.xp)
        RETURNING rev, ${MS('saved_at')} AS at`,
        [id, pub, Math.round(base) || 0, !!force, JSON.stringify(save), Math.round(clientAt) || 0, !!listed, sum.name, sum.xp, sum.lvl, sum.species, sum.caught, sum.legends, sum.medals, sum.tours, String(tag || '').slice(0, 16)]
      ))[0];
      if (!r) return { ok: false, now: await this.load(id) };
      return { ok: true, rev: r.rev, at: r.at, fresh: r.rev === 1 };
    },
    /** Рекорды по видам — как в журнале сохранения: лишнее убираем, новое и подросшее записываем. */
    async setRecords(id, list) {
      const sp = list.map((r) => r.sp);
      await query('DELETE FROM records WHERE player_id = $1 AND NOT (sp = ANY($2::text[]))', [id, sp]);
      if (!list.length) return;
      await query(
        `INSERT INTO records (player_id, sp, w, n)
        SELECT $1::text, t.sp, t.w, t.n FROM unnest($2::text[], $3::numeric[], $4::int[]) AS t(sp, w, n)
        ON CONFLICT (player_id, sp) DO UPDATE SET n = EXCLUDED.n, w = EXCLUDED.w,
          at = CASE WHEN records.w = EXCLUDED.w THEN records.at ELSE now() END`,
        [id, sp, list.map((r) => r.w), list.map((r) => r.n)]
      );
    },
    /** Стереть сохранение игрока с сервера вместе с рекордами и запасом. */
    async forget(id) {
      return (await rows('DELETE FROM players WHERE id = $1 RETURNING id', [id])).length > 0;
    },
    /** Таблица: лучшие рыбаки по опыту и рекорд по каждому виду. Скрывшие себя в таблицу не попадают. */
    async top(limit = 30) {
      const anglers = await rows(`SELECT pub, ${SUM} FROM players WHERE listed AND xp > 0 ORDER BY xp DESC, saved_at ASC LIMIT $1`, [limit]);
      const records = await rows(
        `SELECT DISTINCT ON (r.sp) r.sp, r.w::float8 AS w, p.name, p.pub, p.lvl, ${MS('r.at')} AS at
        FROM records r JOIN players p ON p.id = r.player_id WHERE p.listed ORDER BY r.sp, r.w DESC, r.at ASC`
      );
      const total = (await rows('SELECT count(*)::int AS n FROM players WHERE listed AND xp > 0'))[0].n;
      return { anglers, records, total };
    },
    /** Место игрока среди рыбаков: { place, xp } или null (нет такого или скрыт). */
    async place(pub) {
      const r = (await rows(
        `SELECT p.xp, ((SELECT count(*) FROM players o WHERE o.listed AND o.xp > p.xp) + 1)::int AS place
        FROM players p WHERE p.pub = $1 AND p.listed AND p.xp > 0 ORDER BY p.xp DESC LIMIT 1`,
        [pub]
      ))[0];
      return r || null;
    },
    /** Запас сохранений игрока по дням (новые сверху) — для восстановления вручную. */
    async history(id) {
      return rows(`SELECT day::text AS day, rev, xp, ${MS('saved_at')} AS at FROM history WHERE player_id = $1 ORDER BY day DESC`, [id]);
    },

    // ───── комнаты ─────
    /** Записать комнату. seen — когда в ней в последний раз кто-то был (часы сервера, мс). */
    async saveRoom(code, data, seen) {
      await query(
        `INSERT INTO rooms (code, data, seen) VALUES ($1, $2::jsonb, $3::bigint)
        ON CONFLICT (code) DO UPDATE SET data = EXCLUDED.data, seen = EXCLUDED.seen`,
        [code, JSON.stringify(data), Math.round(seen) || 0]
      );
    },
    /** Комната по коду, если в ней кто-то был не раньше since (мс): { data, seen } или null. */
    async loadRoom(code, since = 0) {
      const r = (await rows('SELECT data, seen::float8 AS seen FROM rooms WHERE code = $1 AND seen >= $2::bigint', [code, Math.round(since) || 0]))[0];
      return r ? { data: r.data, seen: r.seen } : null;
    },
    /** В этих комнатах сейчас есть люди — отмечаем время. */
    async touchRooms(codes, seen) {
      if (codes.length) await query('UPDATE rooms SET seen = $2::bigint WHERE code = ANY($1::text[])', [codes, Math.round(seen) || 0]);
    },
    async dropRoom(code) {
      await query('DELETE FROM rooms WHERE code = $1', [code]);
    },
    /** Убрать комнаты, где никого не было с before (мс), и вернуть коды оставшихся. */
    async roomCodes(before = 0) {
      await query('DELETE FROM rooms WHERE seen < $1::bigint', [Math.round(before) || 0]);
      return (await rows('SELECT code FROM rooms ORDER BY code')).map((r) => r.code);
    }
  };
}
function shape(r) {
  return {
    rev: r.rev, at: r.at, save: r.save, listed: r.listed, pub: r.pub, tag: r.tag,
    sum: { name: r.name, xp: r.xp, lvl: r.lvl, species: r.species, caught: r.caught, legends: r.legends, medals: r.medals, tours: r.tours }
  };
}

/**
 * Самопроверка на живой базе: записать, перезаписать, получить отказ, прочитать, стереть — на служебной строке,
 * которой не видно в таблице рекордов. Бросает ошибку, если база ведёт себя не так, как ждёт сервер.
 */
export async function selfCheck(store) {
  const id = 'selfcheck-' + Math.random().toString(36).slice(2, 12);
  const sum = { name: 'Проверка', xp: 5, lvl: 1, species: 1, caught: 1, legends: 0, medals: 0, tours: 0 };
  const row = (o) => ({ id, pub: 'selfcheck000', save: { check: true, n: o.n }, sum: { ...sum, xp: o.xp }, listed: false, clientAt: Date.now(), ...o });
  const must = (ok, what) => {
    if (!ok) throw new Error('самопроверка базы: ' + what);
  };
  try {
    const a = await store.save(row({ n: 1, xp: 5, base: 0, tag: 't1' }));
    must(a.ok && a.rev === 1 && a.fresh, 'первая запись');
    const b = await store.save(row({ n: 2, xp: 6, base: 1, tag: 't2' }));
    must(b.ok && b.rev === 2, 'вторая запись');
    const c = await store.save(row({ n: 3, xp: 7, base: 1 }));
    must(!c.ok && c.now && c.now.rev === 2, 'устаревшая версия должна получить отказ');
    const d = await store.save(row({ n: 4, xp: 1, base: 2 }));
    must(!d.ok, 'запись с меньшим опытом должна получить отказ');
    await store.setRecords(id, [{ sp: 'karp', w: 1.234, n: 2 }]);
    const got = await store.load(id);
    must(got && got.rev === 2 && got.save && got.save.n === 2 && got.tag === 't2' && got.sum.xp === 6 && got.listed === false && Math.abs(got.at - Date.now()) < 3600000, 'чтение');
    const top = await store.top(5);
    must(Array.isArray(top.anglers) && Array.isArray(top.records) && typeof top.total === 'number' && !top.anglers.some((r) => r.pub === 'selfcheck000'), 'таблица');
    must((await store.place('selfcheck000')) === null, 'скрытый игрок без места');
    must((await store.history(id)).length === 1, 'запас');
  } finally {
    await store.forget(id);
  }
  must((await store.load(id)) === null, 'стирание');
  // комнаты: в коде служебной комнаты есть ноль — у настоящих его не бывает
  const code = '0' + Math.random().toString(36).slice(2, 5).toUpperCase();
  try {
    const t = Date.now();
    await store.saveRoom(code, { v: 1, seed: 'a', players: [{ id: 1, th: 'x' }] }, t - 1000);
    await store.saveRoom(code, { v: 1, seed: 'b', players: [{ id: 1, th: 'x' }, { id: 2, th: 'y' }] }, t - 1000);
    const r = await store.loadRoom(code, t - 2000);
    must(r && r.data && r.data.seed === 'b' && r.data.players.length === 2 && r.seen === t - 1000, 'комната: запись и чтение');
    must((await store.loadRoom(code, t)) === null, 'комната: давно пустую не возвращаем');
    await store.touchRooms([code], t + 5);
    must(((await store.loadRoom(code, t)) || {}).seen === t + 5, 'комната: отметка времени');
  } finally {
    await store.dropRoom(code);
  }
  must((await store.loadRoom(code, 0)) === null, 'комната: стирание');
}

/**
 * Открыть хранилище по настройкам окружения:
 *   DATABASE_URL — Postgres (на Render строку подставляет сам Render, см. render.yaml);
 *   RYBAK_DB=memory — Postgres в памяти процесса (PGlite) для разработки и проверок: с перезапуском всё пропадает;
 *   RYBAK_DB=dir:<папка> — тот же PGlite, но с файлами в папке: переживает перезапуск (так проверяется возвращение комнат).
 * Ничего не задано — null: игра работает как раньше, сохранения только в браузере.
 */
export async function openStore(env = process.env) {
  if (env.DATABASE_URL) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 4, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 });
    // соединение, простаивавшее в запасе, может оборваться (база перезапустилась) — это не повод падать серверу
    pool.on('error', (e) => console.error('база: соединение оборвалось —', e.message));
    const store = createStore((text, params) => pool.query(text, params));
    try {
      await store.init();
    } catch (e) {
      await pool.end().catch(() => {});
      throw e;
    }
    return Object.assign(store, { kind: 'postgres', close: () => pool.end() });
  }
  const dir = /^dir:(.+)$/.exec(env.RYBAK_DB || '');
  if (env.RYBAK_DB === 'memory' || dir) {
    const { PGlite } = await import('@electric-sql/pglite');
    const db = dir ? new PGlite(dir[1]) : new PGlite();
    const store = createStore((text, params) => db.query(text, params));
    await store.init();
    return Object.assign(store, { kind: dir ? 'files' : 'memory', close: () => db.close() });
  }
  return null;
}
