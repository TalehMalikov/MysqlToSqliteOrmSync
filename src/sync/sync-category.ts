import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Category } from "../mysql/entity/Category";
import { DimCategory } from "../sqlite/entity/dimensions/DimCategory";
import { ValidationResult } from "../types/validation";
import { getLastSync, updateLastSync } from "../utils/sync-state";

export async function syncCategoriesFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Category);
    const sqliteRepo = sqlite.getRepo(DimCategory);

    const categories = await mysqlRepo.find();
    console.log(`MySQL: read ${categories.length} categories`);

    await sqliteRepo.clear();

    const dimCategories: Partial<DimCategory>[] = categories.map((a) => ({
      categoryId: a.categoryId,
      name: a.name,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimCategories);

    console.log(`SQLite: inserted ${dimCategories.length} dim_category rows`);

    const newestLastUpdate = categories.reduce(
          (max, c) => (c.lastUpdate > max ? c.lastUpdate : max),
          new Date(0)
        );
    await updateLastSync("dim_category", newestLastUpdate);

  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncCategoriesIncremental() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try{
    const mysqlRepo = mysql.getRepo(Category);
    const sqliteRepo = sqlite.getRepo(DimCategory);

    const lastSync = await getLastSync("dim_category");

    const categories = await mysqlRepo.find();

    const changed = categories.filter(c => c.lastUpdate > lastSync);

    if (changed.length === 0) {
      console.log("No new or updated categories since last sync.");
      return;
    }

    const existingDim = await sqliteRepo.find();
    const keyByCategoryId = new Map<number, number>(
      existingDim.map(d => [d.categoryId, d.categoryKey])
    );

    const dimCategories: Partial<DimCategory>[] = changed.map(a => ({
      categoryKey: keyByCategoryId.get(a.categoryId),
      categoryId: a.categoryId,
      name: a.name,
      lastUpdate: a.lastUpdate,
    }));    

    await sqliteRepo.save(dimCategories);

    const newestLastUpdate = changed.reduce(
      (max, c) => (c.lastUpdate > max ? c.lastUpdate : max),
      lastSync
    );
    await updateLastSync("dim_category", newestLastUpdate);

    console.log(`${changed.length} categories changed since last sync. Added/updated in dim_category.`);
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateCategories(days: number) : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Category);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimCategory);
    const sqliteRows = await sqliteRepo.find();


    const { from, to: now } = getFromDate(days);
    const mysqlFiltered = mysqlRows.filter(r => r.lastUpdate >= from && r.lastUpdate < now);
    const sqliteFiltered = sqliteRows.filter(r => r.lastUpdate >= from && r.lastUpdate < now);

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    return {
      name: "categories_last_30_days",
      ok,
      details:`MySQL: count=${mysqlCount} ` +
              `SQLite: count=${sqliteCount}`
    };
  }
  catch (err) {
    console.error("Category validation FAILED:", err);
    return {
      name: "categories_last_30_days",
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