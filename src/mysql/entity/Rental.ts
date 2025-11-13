import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "rental" })
export class Rental {
    @PrimaryGeneratedColumn({ name: "rental_id" })
    rentalId: number;

    @Column({ name: "rental_date", nullable: false, type: 'datetime'})
    rentalDate: Date;

    @Column({ name: "inventory_id", nullable: false })
    inventoryId: number;

    @Column({name: "customer_id", nullable: false })
    customerId : number;

    @Column({ name: "return_date", nullable: true, type: 'datetime' })
    returnDate: Date;

    @Column({ name: "staff_id", nullable: false })
    staffId: number;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;
}
