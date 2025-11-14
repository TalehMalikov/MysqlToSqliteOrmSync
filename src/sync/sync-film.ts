import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Film } from "../mysql/entity/Film";
import { DimFilm } from "../sqlite/entity/dimensions/DimFilm";
import { ValidationResult } from "../types/validation";

export async function syncFilmsFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Film);
    const sqliteRepo = sqlite.getRepo(DimFilm);

    const films = await mysqlRepo.find({
        relations: ['language']
    });

    console.log(`MySQL: read ${films.length} films`);

    await sqliteRepo.clear();

    const dimFilms: Partial<DimFilm>[] = films.map((a) => ({
      filmId: a.filmId,
      title: a.title,
      rating: a.rating,
      length: a.length,
      language: a.language.name,
      releaseYear: a.releaseYear,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimFilms);

    console.log(`SQLite: inserted ${dimFilms.length} dim_film rows`);
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncFilmsIncremental() {
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

export async function validateFilms() : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    console.log("=== Film validation started ===");

    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mysqlRepo = mysql.getRepo(Film);
    const mysqlRows = await mysqlRepo.find();   // rentalDate must be a Date

    const sqliteRepo = sqlite.getRepo(DimFilm);
    const sqliteRows = await sqliteRepo.find();

    const inWindow = (d: Date) => d >= from && d < now;

    const mysqlFiltered = mysqlRows.filter(r => inWindow(r.lastUpdate));
    const sqliteFiltered = sqliteRows.filter(r => inWindow(r.lastUpdate));

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    console.log("=== Film validation completed ===");

    return {
    name: "films_last_30_days",
    ok,
    details: `MySQL: count=${mysqlCount} ` +
             `SQLite: count=${sqliteCount}`
    };
  }

  catch (err) {
    console.error("Film validation FAILED:", err);
    return {
      name: "films_last_30_days",
      ok: false,
      details: "Validation threw an error: " + (err as any).message
    };
  }

  finally {
    await mysql.close();
    await sqlite.close();
  }
}