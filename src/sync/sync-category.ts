import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Category } from "../mysql/entity/Category";
import { DimCategory } from "../sqlite/entity/dimensions/DimCategory";

export async function syncCategories() {
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
      categoryKey: 50000 + a.categoryId,
      categoryId: a.categoryId,
      name: a.name,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimCategories);

    console.log(`SQLite: inserted ${dimCategories.length} dim_category rows`);
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}