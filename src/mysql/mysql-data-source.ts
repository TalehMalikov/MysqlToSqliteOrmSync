import "reflect-metadata"
import { DataSource } from "typeorm"

export const MySQLDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Mtt29062003!@#$",
    database: "sakila",
    synchronize: false,
    migrationsRun: false,
    logging: true,
    entities: [__dirname + "/entity/*.{ts,js}"],
})