import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Customer } from "../mysql/entity/Customer";
import { DimCustomer } from "../sqlite/entity/dimensions/DimCustomer";

export async function syncCustomers() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Customer);
    const sqliteRepo = sqlite.getRepo(DimCustomer);

    const actors = await mysqlRepo.find({
        relations: ['address', 'address.city', 'address.city.country']
    });
    console.log(`MySQL: read ${actors.length} actors`);

    await sqliteRepo.clear();

    const dimCustomers: Partial<DimCustomer>[] = actors.map((a) => ({
      customerkey: 50000 + a.customerId,
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