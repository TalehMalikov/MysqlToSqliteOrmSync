import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Customer } from "../mysql/entity/Customer";
import { DimCustomer } from "../sqlite/entity/dimensions/DimCustomer";
import { ValidationResult } from "../types/validation";

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
    // Implement incremental sync logic here
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validateCustomers() : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    console.log("=== Customer validation started ===");

    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mysqlRepo = mysql.getRepo(Customer);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(DimCustomer);
    const sqliteRows = await sqliteRepo.find();

    const inWindow = (d: Date) => d >= from && d < now;

    const mysqlFiltered = mysqlRows.filter(r => inWindow(r.lastUpdate));
    const sqliteFiltered = sqliteRows.filter(r => inWindow(r.lastUpdate));

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    console.log("=== Customer validation completed ===");

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