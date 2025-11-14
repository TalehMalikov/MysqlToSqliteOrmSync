import { SQLiteDataSource } from "../sqlite/sqlite-data-source";
import { SyncState } from "../sqlite/entity/system/SyncState";

export async function getLastSync(tableName: string): Promise<Date> {
  const repo = SQLiteDataSource.getRepository(SyncState);

  const record = await repo.findOneBy({ tableName });

  if (!record) {
    return new Date(0);
  }

  return new Date(record.lastUpdate);
}

export async function updateLastSync(tableName: string, lastUpdate: Date) {
  const repo = SQLiteDataSource.getRepository(SyncState);

  const record = repo.create({
    tableName,
    lastUpdate
  });

  await repo.save(record);
}
