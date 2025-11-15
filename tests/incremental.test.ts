import { EntityTarget } from "typeorm";

import { fullLoad } from "../src/commands/full-load";
import { incremental } from "../src/commands/incremental";

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

describe("INCREMENTAL SYNC", () => {
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

  // helper to get counts with fresh connections
  const getCounts = async () => {
    const mysql = new MysqlService();
    const sqlite = new SqliteService();

    await mysql.connect();
    await sqlite.connect();

    const counts: Record<string, { mysql: number; sqlite: number }> = {};

    try {
      for (const { name, mysqlEntity, sqliteEntity } of tablePairs) {
        const mysqlRepo = mysql.getRepo(mysqlEntity as any);
        const sqliteRepo = sqlite.getRepo(sqliteEntity as any);

        counts[name] = {
          mysql: await mysqlRepo.count(),
          sqlite: await sqliteRepo.count(),
        };
      }
    } finally {
      await mysql.close();
      await sqlite.close();
    }

    return counts;
  };

  beforeAll(async () => {
    // Run full load once to establish baseline
    const originalLog = console.log;
    console.log = jest.fn(); // silence logs
    try {
      await fullLoad();
    } finally {
      console.log = originalLog;
    }
  });

  it("keeps MySQL and SQLite deltas in sync during incremental", async () => {
    // 1) counts BEFORE incremental
    const before = await getCounts();

    // 2) run incremental silently
    const originalLog = console.log;
    console.log = jest.fn();
    try {
      await incremental();
    } finally {
      console.log = originalLog;
    }

    // 3) counts AFTER incremental
    const after = await getCounts();

    // 4) build and print summary
    const summary = tablePairs.map(({ name }) => {
      const deltaMysql = after[name].mysql - before[name].mysql;
      const deltaSqlite = after[name].sqlite - before[name].sqlite;

      return {
        table: name,
        before_mysql: before[name].mysql,
        before_sqlite: before[name].sqlite,
        after_mysql: after[name].mysql,
        after_sqlite: after[name].sqlite,
        delta_mysql: deltaMysql,
        delta_sqlite: deltaSqlite,
        equal: deltaMysql === deltaSqlite,
      };
    });

    console.log("\n=== INCREMENTAL SUMMARY ===");
    console.table(summary);

    // 5) assert all deltas match
    expect(summary.every(row => row.equal)).toBe(true);
  });
});
