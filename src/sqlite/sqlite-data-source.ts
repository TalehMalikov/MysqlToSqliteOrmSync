import "reflect-metadata"
import { DataSource } from "typeorm"

export const SQLiteDataSource = new DataSource({
    type: "sqlite",
    database: "local.sqlite",
    synchronize: true,
    logging: false,
    entities: [__dirname + "/entity/**/*.{ts,js}"],
})
