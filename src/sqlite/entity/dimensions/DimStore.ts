import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "dim_store" })
export class DimStore {
    @PrimaryGeneratedColumn({ name: "store_key" })
    storeKey: number;

    @Column({ name: "store_id" })
    storeId: number;

    @Column()
    city: string;

    @Column()
    country: string;

    @Column({ name: "last_update" })
    lastUpdate: Date;
}
