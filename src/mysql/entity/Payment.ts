import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

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
}