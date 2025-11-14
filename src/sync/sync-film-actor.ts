import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { FilmActor } from "../mysql/entity/FilmActor";
import { BridgeFilmActor } from "../sqlite/entity/bridges/BridgeFilmActor";
import { DimFilm } from "../sqlite/entity/dimensions/DimFilm";
import { DimActor } from "../sqlite/entity/dimensions/DimActor";

export async function syncFilmActors() {
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
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}