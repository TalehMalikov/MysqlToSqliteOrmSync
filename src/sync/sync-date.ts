import { SqliteService } from "../sqlite/sqlite.service";
import { DimDate } from "../sqlite/entity/dimensions/DimDate";

function generateDateKey(timestamp: Date | string): number {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
}

export async function syncDate() {
  const sqlite = new SqliteService();

  await sqlite.connect();

  try {
    const sqliteRepo = sqlite.getRepo(DimDate);

    await sqliteRepo.clear();

    const dimDate: Partial<DimDate> =({
      dateKey: generateDateKey(new Date()),
      date: new Date(),
      year: new Date().getFullYear(),
      quarter: Math.floor((new Date().getMonth() + 3) / 3),
      month: new Date().getMonth() + 1,
      dayOfMonth: new Date().getDate(),
      dayOfWeek: new Date().getDay(),
      isWeekend: [0, 6].includes(new Date().getDay()),
    });

    await sqliteRepo.save(dimDate);

    console.log(`SQLite: inserted 1 dim_date rows`);
  } finally {
    await sqlite.close();
  }
}