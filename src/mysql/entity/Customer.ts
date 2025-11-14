import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Address } from "./Address";
import { Store } from "./Store";

@Entity({ name: "customer" })
export class Customer {
    @PrimaryGeneratedColumn({ name: "customer_id" })
    customerId: number;

    @Column({ name: "first_name", nullable: false })
    firstName: string;

    @Column({ name: "last_name", nullable: false })
    lastName: string;

    @Column({ name: "email", nullable: true })
    email: string;

    @Column({ name: "address_id", nullable: false })
    addressId: number;

    @Column({ name: "store_id", nullable: false })
    storeId: number;

    @Column({ name: "active", nullable: false, default: true })
    active: boolean;

    @Column({ name: "create_date", type: "datetime", nullable: false })
    createDate: Date;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @ManyToOne(() => Address)
    @JoinColumn({ name: "address_id" })
    address: Address;

    @ManyToOne(() => Store)
    @JoinColumn({ name: "store_id" })
    store: Store;
}