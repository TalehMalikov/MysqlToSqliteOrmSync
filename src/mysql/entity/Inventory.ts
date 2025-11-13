import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "inventory" })
export class Inventory {
    @PrimaryGeneratedColumn({ name: "inventory_id" })
    inventoryId: number;

    @Column({name: "film_id", nullable: false })
    filmId : number;

    @Column({ name: "store_id", nullable: false })
    storeId: number;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;
}
