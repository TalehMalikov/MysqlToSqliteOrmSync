import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "fact_payment" })
export class FactPayment {
    @PrimaryGeneratedColumn({ name: "fact_payment_key" })
    factPaymentKey: number;

    @Column({ name: "payment_id" })
    paymentId: number;

    @Column({ name: "date_key_paid" })
    dateKeyPaid: number;

    @Column({  name: "customer_key" })
    customerKey: number;

    @Column({ name: "store_key" })
    storeKey: number;

    @Column({ name: "staff_id" })
    staffId: number;

    @Column("double")
    amount: number;
}
