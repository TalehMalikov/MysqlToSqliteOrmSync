import { SqliteService } from "../sqlite/sqlite.service";
import { SQLiteDataSource } from "../sqlite/sqlite-data-source";

export async function init() {
  console.log("=== INIT SQLite DB ===");

  const sqlite = new SqliteService();

  try {
    await sqlite.connect();

    await SQLiteDataSource.synchronize(true);

    console.log("SQLite database initialized successfully!");
  } catch (err) {
    console.error("Init failed:", err);
  } finally {
    await sqlite.close();
  }
}
