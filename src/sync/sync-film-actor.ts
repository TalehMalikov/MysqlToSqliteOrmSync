import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { FilmActor } from "../mysql/entity/FilmActor";
import { BridgeFilmActor } from "../sqlite/entity/bridges/BridgeFilmActor";
import { DimFilm } from "../sqlite/entity/dimensions/DimFilm";
import { DimActor } from "../sqlite/entity/dimensions/DimActor";
import { ValidationResult } from "../types/validation";
import { updateLastSync } from "../utils/sync-state";

export async function syncFilmActorsFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(FilmActor);
    const sqliteRepo = sqlite.getRepo(BridgeFilmActor);
    
    const dimFilmRepo = sqlite.getRepo(DimFilm);
    const dimActorRepo = sqlite.getRepo(DimActor);
    
    const dimFilms = await dimFilmRepo.find();
    const dimActors = await dimActorRepo.find();
    
    const filmKeyMap = new Map(dimFilms.map(f => [f.filmId, f.filmKey]));
    const actorKeyMap = new Map(dimActors.map(a => [a.actorId, a.actorKey]));

    const filmActors = await mysqlRepo.find();
    console.log(`MySQL: read ${filmActors.length} film-actor relationships`);

    await sqliteRepo.clear();

    const bridgeFilmActors: Partial<BridgeFilmActor>[] = filmActors
    .filter((fa) => filmKeyMap.has(fa.filmId) && actorKeyMap.has(fa.actorId))
    .map((fa) => ({
        filmKey: filmKeyMap.get(fa.filmId)!,
        actorKey: actorKeyMap.get(fa.actorId)!
    }));

    const BATCH_SIZE = 500;
    for (let i = 0; i < bridgeFilmActors.length; i += BATCH_SIZE) {
      const batch = bridgeFilmActors.slice(i, i + BATCH_SIZE);
      await sqliteRepo.save(batch);
    }

    console.log(`SQLite: inserted ${bridgeFilmActors.length} bridge_film_actor rows`);

    const newestLastUpdate = filmActors.reduce(
      (max, fa) => (fa.lastUpdate > max ? fa.lastUpdate : max),
      new Date(0)
    );
    await updateLastSync("bridge_film_actor", newestLastUpdate);

  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncFilmActorsIncremental() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try{
    // Implement incremental sync logic here
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateFilmActors() : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    console.log("=== FilmActor validation started ===");

    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mysqlRepo = mysql.getRepo(FilmActor);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(BridgeFilmActor);
    const sqliteRows = await sqliteRepo.find();

    const inWindow = (d: Date) => d >= from && d < now;

    const mysqlFiltered = mysqlRows.filter(r => inWindow(r.lastUpdate));
    const sqliteFiltered = sqliteRows.filter(r => inWindow(r.lastUpdate));

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    console.log("=== FilmActor validation completed ===");

    return {
    name: "film_actors_last_30_days",
    ok,
    details: `MySQL: count=${mysqlCount} ` +
             `SQLite: count=${sqliteCount}`
    };
  }

  catch (err) {
    console.error("FilmActor validation FAILED:", err);
    return {
      name: "film_actors_last_30_days",
      ok: false,
      details: "Validation threw an error: " + (err as any).message
    };
  }

  finally {
    await mysql.close();
    await sqlite.close();
  }
}