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

  it("keeps MySQL and SQLite deltas in sync during incremental", async () => {
    // Get counts BEFORE incremental (MySQL has new data you added manually)
    const before = await getCounts();

    // Run incremental sync
    const originalLog = console.log;
    console.log = jest.fn();
    try {
      await incremental();
    } finally {
      console.log = originalLog;
    }

    // Get counts AFTER incremental (should now be equal)
    const after = await getCounts();

    const summary = tablePairs.map(({ name }) => ({
      table: name,
      mysql_before: before[name].mysql,
      sqlite_before: before[name].sqlite,
      mysql_after: after[name].mysql,
      sqlite_after: after[name].sqlite,
      status: after[name].mysql === after[name].sqlite ? "✓ SUCCESS" : "✗ FAILED"
    }));

    console.log("\n=== INCREMENTAL SYNC SUMMARY ===");
    console.table(summary);

    expect(summary.every(row => row.status === "✓ SUCCESS")).toBe(true);
  });
});