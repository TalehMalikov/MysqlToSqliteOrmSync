import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Store } from "../mysql/entity/Store";
import { DimStore } from "../sqlite/entity/dimensions/DimStore";
import { ValidationResult } from "../types/validation";
import { getLastSync, updateLastSync } from "../utils/sync-state";

export async function syncStoresFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Store);
    const sqliteRepo = sqlite.getRepo(DimStore);

    const stores = await mysqlRepo.find({
        relations: ['address', 'address.city', 'address.city.country']
    });

    console.log(`MySQL: read ${stores.length} stores`);

    await sqliteRepo.clear();

    const dimStores: Partial<DimStore>[] = stores
    .map((a) => ({
      storeId: a.storeId,
      city: a.address?.city?.city || null,
      country: a.address?.city?.country?.country || null,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimStores);

    console.log(`SQLite: inserted ${dimStores.length} dim_store rows`);

    const newestLastUpdate = stores.reduce(
      (max, s) => (s.lastUpdate > max ? s.lastUpdate : max),
      new Date(0)
    );
    await updateLastSync("dim_store", newestLastUpdate);
        
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

  try {
    const mysqlRepo = mysql.getRepo(Store);
    const sqliteRepo = sqlite.getRepo(DimStore);
    
    const lastSync = await getLastSync("dim_store");

    const stores = await mysqlRepo.find({
      relations: ["address", "address.city", "address.city.country"],
    });

    const changed = stores.filter(s => s.lastUpdate > lastSync);

    if (changed.length === 0) {
      console.log("No new or updated stores since last sync.");
      return;
    }

    const existingDim = await sqliteRepo.find();
    const keyByStoreId = new Map<number, number>(
      existingDim.map(d => [d.storeId, d.storeKey])
    );

    const dimStores = changed.map(s => ({
      storeKey: keyByStoreId.get(s.storeId),
      storeId: s.storeId,
      city: s.address?.city?.city || null,
      country: s.address?.city?.country?.country || null,
      lastUpdate: s.lastUpdate
    }));  

    await sqliteRepo.save(dimStores);

    const newest = changed.reduce(
      (max, s) => (s.lastUpdate > max ? s.lastUpdate : max),
      lastSync
    );
    await updateLastSync("dim_store", newest);

    console.log(`${changed.length} stores changed since last sync. Added/updated in dim_store.`);
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateStores(days: number) : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Store);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimStore);
    const sqliteRows = await sqliteRepo.find();

    const { from, to: now } = getFromDate(days);
    const mysqlFiltered = mysqlRows.filter(r => r.lastUpdate >= from && r.lastUpdate < now);
    const sqliteFiltered = sqliteRows.filter(r => r.lastUpdate >= from && r.lastUpdate < now);

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

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

function getFromDate(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from, to };
}