import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Customer } from "../mysql/entity/Customer";
import { DimCustomer } from "../sqlite/entity/dimensions/DimCustomer";
import { ValidationResult } from "../types/validation";
import { getLastSync, updateLastSync } from "../utils/sync-state";

export async function syncCustomersFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Customer);
    const sqliteRepo = sqlite.getRepo(DimCustomer);

    const customers = await mysqlRepo.find({
        relations: ['address', 'address.city', 'address.city.country']
    });
    console.log(`MySQL: read ${customers.length} customers`);

    await sqliteRepo.clear();

    const dimCustomers: Partial<DimCustomer>[] = customers.map((a) => ({
      customerId: a.customerId,
      firstName: a.firstName,
      lastName: a.lastName,
      active: a.active,
      city: a.address.city.city,
      country: a.address.city.country.country,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimCustomers);

    const newestLastUpdate = customers.reduce(
      (max, c) => (c.lastUpdate > max ? c.lastUpdate : max),
      new Date(0)
    );
    await updateLastSync("dim_customer", newestLastUpdate);

    console.log(`SQLite: inserted ${dimCustomers.length} dim_customer rows`);
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncCustomersIncremental() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try{
    const mysqlRepo = mysql.getRepo(Customer);
    const sqliteRepo = sqlite.getRepo(DimCustomer);

    const lastSync = await getLastSync("dim_customer");

    const customers = await mysqlRepo.find({
      relations: ["address", "address.city", "address.city.country"],
    });

    const changed = customers.filter(c => c.lastUpdate > lastSync);

    if (changed.length === 0) {
      console.log("No new or updated customers since last sync.");
      return;
    }

    const dimCustomers: Partial<DimCustomer>[] = changed.map(a => ({
      customerId: a.customerId,
      firstName: a.firstName,
      lastName: a.lastName,
      active: a.active,
      city: a.address.city.city,
      country: a.address.city.country.country,
      lastUpdate: a.lastUpdate,
    }));

    await sqliteRepo.save(dimCustomers);

    const newestLastUpdate = changed.reduce(
      (max, c) => (c.lastUpdate > max ? c.lastUpdate : max),
      lastSync
    );
    await updateLastSync("dim_customer", newestLastUpdate);
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateCustomers(days: number) : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Customer);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimCustomer);
    const sqliteRows = await sqliteRepo.find();

    const { from, to: now } = getFromDate(days);
    const mysqlFiltered = mysqlRows.filter(r => r.lastUpdate >= from && r.lastUpdate < now);
    const sqliteFiltered = sqliteRows.filter(r => r.lastUpdate >= from && r.lastUpdate < now);

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    return {
      name: "customers_last_30_days",
      ok,
      details: `MySQL: count=${mysqlCount} ` +
               `SQLite: count=${sqliteCount}`
    };
  }
  catch (err) {
    console.error("Customer validation FAILED:", err);
    return {
      name: "customers_last_30_days",
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