import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Store } from "../mysql/entity/Store";
import { DimStore } from "../sqlite/entity/dimensions/DimStore";
import { ValidationResult } from "../types/validation";

export async function syncStoresFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Store);
    const sqliteRepo = sqlite.getRepo(DimStore);

    const films = await mysqlRepo.find({
        relations: ['address', 'address.city', 'address.city.country']
    });

    console.log(`MySQL: read ${films.length} films`);

    await sqliteRepo.clear();

    const dimStores: Partial<DimStore>[] = films
    .map((a) => ({
      storeId: a.storeId,
      city: a.address?.city?.city || null,
      country: a.address?.city?.country?.country || null,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimStores);

    console.log(`SQLite: inserted ${dimStores.length} dim_store rows`);
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncStoresIncremental() {
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

export async function validateStores() : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    console.log("=== Store validation started ===");

    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mysqlRepo = mysql.getRepo(Store);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimStore);
    const sqliteRows = await sqliteRepo.find();

    const inWindow = (d: Date) => d >= from && d < now;

    const mysqlFiltered = mysqlRows.filter(r => inWindow(r.lastUpdate));
    const sqliteFiltered = sqliteRows.filter(r => inWindow(r.lastUpdate));

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    console.log("=== Store validation completed ===");

    return {
    name: "stores_last_30_days",
    ok,
    details: `MySQL: count=${mysqlCount} ` +
             `SQLite: count=${sqliteCount}`
    };
  }

  catch (err) {
    console.error("Store validation FAILED:", err);
    return {
      name: "stores_last_30_days",
      ok: false,
      details: "Validation threw an error: " + (err as any).message
    };
  }

  finally {
    await mysql.close();
    await sqlite.close();
  }
}