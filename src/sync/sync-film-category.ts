import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { FilmCategory } from "../mysql/entity/FilmCategory";
import { BridgeFilmCategory } from "../sqlite/entity/bridges/BridgeFilmCategory";
import { DimFilm } from "../sqlite/entity/dimensions/DimFilm";
import { DimCategory } from "../sqlite/entity/dimensions/DimCategory";

export async function syncFilmCategories() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(FilmCategory);
    const sqliteRepo = sqlite.getRepo(BridgeFilmCategory);
    
    const dimFilmRepo = sqlite.getRepo(DimFilm);
    const dimCategoryRepo = sqlite.getRepo(DimCategory);
    
    const dimFilms = await dimFilmRepo.find();
    const dimCategories = await dimCategoryRepo.find();
    
    const filmKeyMap = new Map(dimFilms.map(f => [f.filmId, f.filmKey]));
    const categoryKeyMap = new Map(dimCategories.map(c => [c.categoryId, c.categoryKey]));

    const filmCategories = await mysqlRepo.find();
    console.log(`MySQL: read ${filmCategories.length} film-category relationships`);

    await sqliteRepo.clear();

    const bridgeFilmCategories: Partial<BridgeFilmCategory>[] = filmCategories
    .filter((fc) => filmKeyMap.has(fc.filmId) && categoryKeyMap.has(fc.categoryId))
    .map((fc) => ({
        filmKey: filmKeyMap.get(fc.filmId)!,
        categoryKey: categoryKeyMap.get(fc.categoryId)!
    }));

    const BATCH_SIZE = 500;
    for (let i = 0; i < bridgeFilmCategories.length; i += BATCH_SIZE) {
      const batch = bridgeFilmCategories.slice(i, i + BATCH_SIZE);
      await sqliteRepo.save(batch);
    }

    console.log(`SQLite: inserted ${bridgeFilmCategories.length} bridge_film_category rows`);
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}