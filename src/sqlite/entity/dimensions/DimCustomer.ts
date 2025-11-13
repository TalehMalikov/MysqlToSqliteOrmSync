import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "dim_customer" })
export class DimCustomer {
    @PrimaryGeneratedColumn({ name: "customer_key" })
    customerKey: number;

    @Column({ name: "customer_id" })
    customerId: number;

    @Column({name: 'first_name'})
    firstName: string;

    @Column({name: 'last_name'})
    lastName: string;

    @Column()
    active: boolean;

    @Column()
    ciyty: string;

    @Column()
    country: string;

    @Column({ name: "last_update" })
    lastUpdate: Date;
}
