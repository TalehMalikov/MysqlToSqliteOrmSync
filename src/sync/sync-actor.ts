import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Actor } from "../mysql/entity/Actor";
import { DimActor } from "../sqlite/entity/dimensions/DimActor";
import { ValidationResult } from "../types/validation";
import { updateLastSync } from "../utils/sync-state";

export async function syncActorsFull() {
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

    const newestLastUpdate = actors.reduce(
      (max, a) => (a.lastUpdate > max ? a.lastUpdate : max),
      new Date(0)
    );
    await updateLastSync("dim_actor", newestLastUpdate);

  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncActorsIncremental() {
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

export async function validateActors() : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    console.log("=== Actor validation started ===");

    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mysqlRepo = mysql.getRepo(Actor);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimActor);
    const sqliteRows = await sqliteRepo.find();

    const inWindow = (d: Date) => d >= from && d < now;

    const mysqlFiltered = mysqlRows.filter(r => inWindow(r.lastUpdate));
    const sqliteFiltered = sqliteRows.filter(r => inWindow(r.lastUpdate));

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    console.log("=== Actor validation completed ===");

    return {
    name: "actors_last_30_days",
    ok,
    details: `MySQL: count=${mysqlCount} ` +
             `SQLite: count=${sqliteCount}`
    };
  }

  catch (err) {
    console.error("Actor validation FAILED:", err);
    return {
      name: "actors_last_30_days",
      ok: false,
      details: "Validation threw an error: " + (err as any).message
    };
  }

  finally {
    await mysql.close();
    await sqlite.close();
  }
}