import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Rental } from "../mysql/entity/Rental";
import { FactRental } from "../sqlite/entity/facts/FactRental";
import { DimCustomer } from "../sqlite/entity/dimensions/DimCustomer";
import { DimStore } from "../sqlite/entity/dimensions/DimStore";
import { DimFilm } from "../sqlite/entity/dimensions/DimFilm";

function generateDateKey(timestamp: Date | string | null): number | null {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
}

export async function syncRentalsFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Rental);
    const sqliteRepo = sqlite.getRepo(FactRental);
    
    const dimCustomerRepo = sqlite.getRepo(DimCustomer);
    const dimStoreRepo = sqlite.getRepo(DimStore);
    const dimFilmRepo = sqlite.getRepo(DimFilm);
    
    const dimCustomers = await dimCustomerRepo.find();
    const dimStores = await dimStoreRepo.find();
    const dimFilms = await dimFilmRepo.find();
    
    const customerKeyMap = new Map(dimCustomers.map(c => [c.customerId, c.customerKey]));
    const storeKeyMap = new Map(dimStores.map(s => [s.storeId, s.storeKey]));
    const filmKeyMap = new Map(dimFilms.map(f => [f.filmId, f.filmKey]));

    const rentals = await mysqlRepo.find({ 
      relations: ['customer', 'inventory', 'inventory.film'] 
    });

    console.log(`MySQL: read ${rentals.length} rentals`);

    await sqliteRepo.clear();

    const factRentals: Partial<FactRental>[] = rentals.map((r) => {
      const filmId = r.inventory?.film?.filmId;
      const storeId = r.customer?.storeId;
      
      return {
        rentalId: r.rentalId,
        dateKeyRented: generateDateKey(r.rentalDate),
        dateKeyReturned: generateDateKey(r.returnDate),  
        filmKey: filmId ? filmKeyMap.get(filmId) ?? null : null,
        storeKey: storeId ? storeKeyMap.get(storeId) ?? null : null,
        customerKey: r.customerId ? customerKeyMap.get(r.customerId) ?? null : null,
        staffId: r.staffId,
        rentalDurationDays: r.returnDate
          ? Math.ceil((r.returnDate.getTime() - r.rentalDate.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      };
    });

    console.log(`Processing ${factRentals.length} rentals (including those with null foreign keys)`);

    const BATCH_SIZE = 500;
    for (let i = 0; i < factRentals.length; i += BATCH_SIZE) {
      const batch = factRentals.slice(i, i + BATCH_SIZE);
      await sqliteRepo.save(batch);
    }

    console.log(`SQLite: inserted ${factRentals.length} fact_rental rows`);
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncRentalsIncremental() {
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