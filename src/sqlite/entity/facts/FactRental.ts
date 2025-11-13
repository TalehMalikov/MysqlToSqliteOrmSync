import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "fact_rental" })
export class FactRental {
    @PrimaryGeneratedColumn({ name: "fact_rental_key" })
    factRentalKey: number;

    @Column({ name: "rental_id" })
    rentalId: number;

    @Column({ name: "date_key_rented" })
    dateKeyRented: number;

    @Column({ name: "date_key_returned" })
    dateKeyReturned: number;

    @Column({ name: "film_key" })
    filmKey: number;

    @Column({ name: "store_key" })
    storeKey: number;

    @Column({  name: "customer_key" })
    customerKey: number;

    @Column({ name: "staff_id" })
    staffId: number;

    @Column({ name: "rental_duration_days" })
    rentalDurationDays: number;
}
