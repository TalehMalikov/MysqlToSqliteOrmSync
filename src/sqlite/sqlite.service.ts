import { SQLiteDataSource } from "./sqlite-data-source";

export class SqliteService {
  async connect() {
    if (!SQLiteDataSource.isInitialized) {
      await SQLiteDataSource.initialize();
    }
  }

  // basic wrapper – no generics, keep it simple
  getRepo(entity: any) {
    return SQLiteDataSource.getRepository(entity);
  }

  async clear(entity: any) {
    const repo = this.getRepo(entity);
    return repo.clear();
  }

  async save(entity: any, items: any[]) {
    const repo = this.getRepo(entity);

    // If you want to be safe and have proper entities:
    const created = items.map((i) => repo.create(i));
    return repo.save(created);

    // Or even simpler (works too, but less strict):
    // return repo.save(items);
  }

  async close() {
    if (SQLiteDataSource.isInitialized) {
      await SQLiteDataSource.destroy();
    }
  }
}
