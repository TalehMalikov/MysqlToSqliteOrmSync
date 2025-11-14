import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Actor } from "../mysql/entity/Actor";
import { DimActor } from "../sqlite/entity/dimensions/DimActor";

export async function syncActors() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Actor);
    const sqliteRepo = sqlite.getRepo(DimActor);

    const actors = await mysqlRepo.find();
    console.log(`MySQL: read ${actors.length} actors`);

    await sqliteRepo.clear();

    const dimActors: Partial<DimActor>[] = actors.map((a) => ({
      actorId: a.actorId,
      firstName: a.firstName,
      lastName: a.lastName,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimActors);

    console.log(`SQLite: inserted ${dimActors.length} dim_actor rows`);
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}