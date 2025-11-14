import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Category } from "../mysql/entity/Category";
import { DimCategory } from "../sqlite/entity/dimensions/DimCategory";
import { ValidationResult } from "../types/validation";
import { updateLastSync } from "../utils/sync-state";

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
    // Implement incremental sync logic here
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateCategories() : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    console.log("=== Category validation started ===");

    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mysqlRepo = mysql.getRepo(Category);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimCategory);
    const sqliteRows = await sqliteRepo.find();

    const inWindow = (d: Date) => d >= from && d < now;

    const mysqlFiltered = mysqlRows.filter(r => inWindow(r.lastUpdate));
    const sqliteFiltered = sqliteRows.filter(r => inWindow(r.lastUpdate));

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    console.log("=== Category validation completed ===");

    return {
    name: "categories_last_30_days",
    ok,
    details: `MySQL: count=${mysqlCount} ` +
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