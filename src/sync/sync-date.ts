import { SqliteService } from "../sqlite/sqlite.service";
import { DimDate } from "../sqlite/entity/dimensions/DimDate";

function generateDateKey(date: Date): number {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return parseInt(`${y}${m}${d}`);
}

export async function syncDateFull() {
  const sqlite = new SqliteService();
  await sqlite.connect();

  try {
    const repo = sqlite.getRepo(DimDate);
    await repo.clear();

    const start = new Date(2000, 0, 1);
    const end   = new Date(2030, 11, 31);

    const rows: Partial<DimDate>[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

      const quarter = Math.floor((month - 1) / 3) + 1;

      rows.push({
        dateKey: generateDateKey(d),
        date: new Date(d),
        year,
        quarter,
        month,
        dayOfMonth: day,
        dayOfWeek,
        isWeekend,
      });
    }
    await repo.save(rows);
  } 
  finally {
    await sqlite.close();
  }
}
