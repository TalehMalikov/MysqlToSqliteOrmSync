import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Address } from "./Address";
import { Store } from "./Store";

@Entity({ name: "staff" })
export class Staff {
    @PrimaryGeneratedColumn({ name: "staff_id" })
    staffId: number;

    @Column({ name: "first_name", nullable: false, length: 45 })
    firstName: string;

    @Column({ name: "last_name", nullable: false, length: 45 })
    lastName: string;

    @Column({ name: "address_id", nullable: false })
    addressId: number;

    @Column({ name: "picture", type: "blob", nullable: true })
    picture: Buffer;

    @Column({ name: "email", nullable: true, length: 50 })
    email: string;

    @Column({ name: "store_id", nullable: false })
    storeId: number;

    @Column({ name: "active", nullable: false, default: true })
    active: boolean;

    @Column({ name: "username", nullable: false, length: 16 })
    username: string;

    @Column({ name: "password", nullable: true, length: 40 })
    password: string;

    @Column({
        name: "last_update", 
        nullable: false, 
        type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' 
    })
    lastUpdate: Date;

    @ManyToOne(() => Address)
    @JoinColumn({ name: "address_id" })
    address: Address;

    @ManyToOne(() => Store)
    @JoinColumn({ name: "store_id" })
    store: Store;
}