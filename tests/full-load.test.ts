import { EntityTarget } from "typeorm";

import { fullLoad } from "../src/commands/full-load";

import { MysqlService } from "../src/mysql/mysql.service";
import { SqliteService } from "../src/sqlite/sqlite.service";

import { Actor } from "../src/mysql/entity/Actor";
import { Category } from "../src/mysql/entity/Category";
import { Customer } from "../src/mysql/entity/Customer";
import { Film } from "../src/mysql/entity/Film";
import { Store } from "../src/mysql/entity/Store";
import { FilmActor } from "../src/mysql/entity/FilmActor";
import { FilmCategory } from "../src/mysql/entity/FilmCategory";
import { Payment } from "../src/mysql/entity/Payment";
import { Rental } from "../src/mysql/entity/Rental";

import { DimActor } from "../src/sqlite/entity/dimensions/DimActor";
import { DimCategory } from "../src/sqlite/entity/dimensions/DimCategory";
import { DimCustomer } from "../src/sqlite/entity/dimensions/DimCustomer";
import { DimFilm } from "../src/sqlite/entity/dimensions/DimFilm";
import { DimStore } from "../src/sqlite/entity/dimensions/DimStore";
import { BridgeFilmActor } from "../src/sqlite/entity/bridges/BridgeFilmActor";
import { BridgeFilmCategory } from "../src/sqlite/entity/bridges/BridgeFilmCategory";
import { FactPayment } from "../src/sqlite/entity/facts/FactPayment";
import { FactRental } from "../src/sqlite/entity/facts/FactRental";

jest.setTimeout(60_000);

describe("FULL LOAD", () => {
  let mysql: MysqlService;
  let sqlite: SqliteService | null = null;

  beforeAll(async () => {
    mysql = new MysqlService();
    await mysql.connect();
  });

  afterAll(async () => {
    await mysql.close();
    if (sqlite) {
      await sqlite.close();
    }
  });

  it("copies all rows from MySQL tables into SQLite DW tables", async () => {
    const tablePairs: {
      name: string;
      mysqlEntity: EntityTarget<any>;
      sqliteEntity: EntityTarget<any>;
    }[] = [
      { name: "actors",          mysqlEntity: Actor,        sqliteEntity: DimActor },
      { name: "categories",      mysqlEntity: Category,     sqliteEntity: DimCategory },
      { name: "customers",       mysqlEntity: Customer,     sqliteEntity: DimCustomer },
      { name: "films",           mysqlEntity: Film,         sqliteEntity: DimFilm },
      { name: "stores",          mysqlEntity: Store,        sqliteEntity: DimStore },
      { name: "film_actors",     mysqlEntity: FilmActor,    sqliteEntity: BridgeFilmActor },
      { name: "film_categories", mysqlEntity: FilmCategory, sqliteEntity: BridgeFilmCategory },
      { name: "payments",        mysqlEntity: Payment,      sqliteEntity: FactPayment },
      { name: "rentals",         mysqlEntity: Rental,       sqliteEntity: FactRental },
    ];

    const mysqlCounts: Record<string, number> = {};
    const summary: { table: string; mysql: number; sqlite: number; equal: boolean }[] = [];

    const originalLog = console.log;
    console.log = jest.fn();

    try {
      for (const { name, mysqlEntity } of tablePairs) {
        const repo = mysql.getRepo(mysqlEntity as any);
        mysqlCounts[name] = await repo.count();
      }

      await fullLoad();

      sqlite = new SqliteService();
      await sqlite.connect();

      for (const { name, sqliteEntity } of tablePairs) {
        const sqliteRepo = sqlite.getRepo(sqliteEntity as any);
        const sqliteCount = await sqliteRepo.count();
        const mysqlCount = mysqlCounts[name];

        summary.push({
          table: name,
          mysql: mysqlCount,
          sqlite: sqliteCount,
          equal: mysqlCount === sqliteCount,
        });

        expect(sqliteCount).toBe(mysqlCount);
      }
    } finally {
      console.log = originalLog;

      console.log("\n=== FULL LOAD COUNT SUMMARY ===");
      console.table(summary);
    }
  });
});
