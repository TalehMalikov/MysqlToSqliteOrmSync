import { MySQLDataSource } from "./mysql-data-source";

export class MysqlService {
  async connect() {
    if (!MySQLDataSource.isInitialized) {
      await MySQLDataSource.initialize();
    }
  }

  getRepo<T>(entity: { new (): T }) {
    return MySQLDataSource.getRepository(entity);
  }

  async close() {
    if (MySQLDataSource.isInitialized) {
      await MySQLDataSource.destroy();
    }
  }
}