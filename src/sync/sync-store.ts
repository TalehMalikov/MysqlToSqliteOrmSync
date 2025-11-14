import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Store } from "../mysql/entity/Store";
import { DimStore } from "../sqlite/entity/dimensions/DimStore";

export async function syncStores() {
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