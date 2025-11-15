import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { FilmCategory } from "../mysql/entity/FilmCategory";
import { BridgeFilmCategory } from "../sqlite/entity/bridges/BridgeFilmCategory";
import { DimFilm } from "../sqlite/entity/dimensions/DimFilm";
import { DimCategory } from "../sqlite/entity/dimensions/DimCategory";
import { ValidationResult } from "../types/validation";
import { getLastSync, updateLastSync } from "../utils/sync-state";

export async function syncFilmCategoriesFull() {
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

    const newestLastUpdate = filmCategories.reduce(
      (max, fc) => (fc.lastUpdate > max ? fc.lastUpdate : max),
      new Date(0)
    );
    await updateLastSync("bridge_film_category", newestLastUpdate);

  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncFilmCategoriesIncremental() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try{
    const mysqlRepo = mysql.getRepo(FilmCategory);
    const sqliteRepo = sqlite.getRepo(BridgeFilmCategory);

    const dimFilmRepo = sqlite.getRepo(DimFilm);
    const dimCategoryRepo = sqlite.getRepo(DimCategory);

    const lastSync = await getLastSync("bridge_film_category");

    const dimFilms = await dimFilmRepo.find();
    const dimCategories = await dimCategoryRepo.find();

    const filmKeyMap = new Map(dimFilms.map(f => [f.filmId, f.filmKey]));
    const categoryKeyMap = new Map(dimCategories.map(c => [c.categoryId, c.categoryKey]));

		const filmCategories = await mysqlRepo.find();
	
		const changed = filmCategories.filter(fc => fc.lastUpdate > lastSync);
		if (changed.length === 0) {
		  console.log("No new or updated film-category relationships since last sync.");
		  return;
		}
	
		const changedFilmIds = new Set(changed.map(fc => fc.filmId));
	
		const filmKeysToDelete = [...changedFilmIds]
		.map(id => filmKeyMap.get(id))
		.filter((k): k is number => !!k);
	
		if (filmKeysToDelete.length > 0) {
		await sqliteRepo
			.createQueryBuilder()
			.delete()
			.from(BridgeFilmCategory)
			.where("film_key IN (:...filmKeys)", { filmKeys: filmKeysToDelete })
			.execute();
		}
	
		const bridgeFilmCategories: Partial<BridgeFilmCategory>[] = [];
	
		for (const fc of filmCategories) {
		if (!changedFilmIds.has(fc.filmId)) continue;
	
		const filmKey = filmKeyMap.get(fc.filmId);
		const categoryKey = categoryKeyMap.get(fc.categoryId);
		if (!filmKey || !categoryKey) continue;
	
		bridgeFilmCategories.push({ filmKey, categoryKey });
		}
	
		if (bridgeFilmCategories.length === 0) {
		console.log("No film-category relationships to insert for changed films.");
		return;
		}

    const BATCH_SIZE = 500;
    for (let i = 0; i < bridgeFilmCategories.length; i += BATCH_SIZE) {
      const batch = bridgeFilmCategories.slice(i, i + BATCH_SIZE);
      await sqliteRepo.save(batch);
    }

    const newestLastUpdate = changed.reduce(
      (max, fc) => (fc.lastUpdate > max ? fc.lastUpdate : max),
      lastSync
    );
    await updateLastSync("bridge_film_category", newestLastUpdate);

    console.log(`${changed.length} film-category relationships changed since last sync. Added/updated in bridge_film_category.`);
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateFilmCategories(days: number) : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(FilmCategory);
    const sqliteRepo = sqlite.getRepo(BridgeFilmCategory);
    
    const mysqlRows = await mysqlRepo.find();
    const sqliteRows = await sqliteRepo.find();
    const mysqlCount = mysqlRows.length;
    const sqliteCount = sqliteRows.length;
    
    const ok = mysqlCount === sqliteCount;

    return {
      name: "film_categories_last_30_days",
      ok,
      details: `MySQL: count=${mysqlCount} ` +
               `SQLite: count=${sqliteCount}`
    };
  }

  catch (err) {
    console.error("FilmCategory validation FAILED:", err);
    return {
      name: "film_categories_last_30_days",
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