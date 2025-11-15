import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "fact_rental" })
export class FactRental {
    @PrimaryGeneratedColumn({ name: "fact_rental_key" })
    factRentalKey: number;

    @Column({ name: "rental_id" })
    rentalId: number;

    @Column({ name: "date_key_rented" })
    dateKeyRented: number;

    @Column({ name: "date_key_returned", nullable: true })
    dateKeyReturned: number | null;

    @Column({ name: "film_key", nullable: true })
    filmKey: number | null;

    @Column({ name: "store_key", nullable: true })
    storeKey: number | null;

    @Column({  name: "customer_key", nullable: true })
    customerKey: number | null;

    @Column({ name: "staff_id" })
    staffId: number;

    @Column({ name: "rental_duration_days", type: "int", nullable: true })
    rentalDurationDays: number | null;

    @Column({ name: "last_update", nullable: false})
    lastUpdate: Date;
}
