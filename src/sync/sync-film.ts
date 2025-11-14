import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Film } from "../mysql/entity/Film";
import { DimFilm } from "../sqlite/entity/dimensions/DimFilm";

export async function syncFilms() {
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