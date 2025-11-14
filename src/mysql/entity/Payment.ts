import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Customer } from "./Customer";
import { Staff } from "./Staff";
import { Rental } from "./Rental";

@Entity({ name: "payment" })
export class Payment {
    @PrimaryGeneratedColumn({ name: "payment_id" })
    paymentId: number;

    @Column({name: "customer_id", nullable: false })
    customerId : number;

    @Column({ name: "staff_id", nullable: false })
    staffId: number;

    @Column({ name: "rental_id", nullable: true })
    rentalId: number;

    @Column({ name: "amount", type: "decimal", precision: 5, scale: 2 , nullable: false})
    amount: number;

    @Column({ name: "payment_date", nullable: false, type: 'datetime' })
    paymentDate: Date;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: "customer_id" })
    customer: Customer;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "staff_id" })
    staff: Staff;

    @ManyToOne(() => Rental)
    @JoinColumn({ name: "rental_id" })
    rental: Rental;
}