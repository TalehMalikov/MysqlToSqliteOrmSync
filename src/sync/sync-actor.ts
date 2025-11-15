import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Actor } from "../mysql/entity/Actor";
import { DimActor } from "../sqlite/entity/dimensions/DimActor";
import { ValidationResult } from "../types/validation";
import { getLastSync, updateLastSync } from "../utils/sync-state";

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
    const mysqlRepo = mysql.getRepo(Actor);
    const sqliteRepo = sqlite.getRepo(DimActor);

    const lastSync = await getLastSync("dim_actor");

    const actors = await mysqlRepo.find();
    console.log(`MySQL: read ${actors.length} actors (for incremental)`);

    const changed = actors.filter(a => a.lastUpdate > lastSync);

    if (changed.length === 0) {
      console.log("No new or updated actors since last sync.");
      return;
    }

    const dimActors: Partial<DimActor>[] = changed.map(a => ({
      actorId: a.actorId,
      firstName: a.firstName,
      lastName: a.lastName,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimActors);

    const newestLastUpdate = changed.reduce(
      (max, a) => (a.lastUpdate > max ? a.lastUpdate : max),
      lastSync
    );
    await updateLastSync("dim_actor", newestLastUpdate);
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateActors(days: number) : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Actor);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimActor);
    const sqliteRows = await sqliteRepo.find();

    const { from, to: now } = getFromDate(days);

    const mysqlFiltered = mysqlRows.filter((r) => {
      const d = new Date(r.lastUpdate as any);
      return d >= from && d < now;
    });

    const sqliteFiltered = sqliteRows.filter((r) => {
      const d = new Date(r.lastUpdate as any);
      return d >= from && d < now;
    });

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;
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

function getFromDate(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from, to };
}