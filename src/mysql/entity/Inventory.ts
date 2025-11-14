import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Film } from "./Film";
import { Store } from "./Store";

@Entity({ name: "inventory" })
export class Inventory {
    @PrimaryGeneratedColumn({ name: "inventory_id" })
    inventoryId: number;

    @Column({ name: "film_id", nullable: false })
    filmId: number;

    @Column({ name: "store_id", nullable: false })
    storeId: number;

    @ManyToOne(() => Film, film => film.inventories)
    @JoinColumn({ name: "film_id" })
    film: Film;

    @ManyToOne(() => Store, store => store.inventories)
    @JoinColumn({ name: "store_id" })
    store: Store;
    
    @Column({   
        name: "last_update", 
        nullable: false, 
        type: 'timestamp', 
        default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;
}
