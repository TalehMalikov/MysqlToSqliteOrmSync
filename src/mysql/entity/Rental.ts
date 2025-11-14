import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Inventory } from "./Inventory";
import { Customer } from "./Customer";
import { Staff } from "./Staff";

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

    @ManyToOne(() => Inventory)
    @JoinColumn({ name: "inventory_id" })
    inventory: Inventory;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: "customer_id" })
    customer: Customer;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "staff_id" })
    staff: Staff;
}
