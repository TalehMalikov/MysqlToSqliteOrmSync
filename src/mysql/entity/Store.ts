import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Inventory } from "./Inventory";
import { Address } from "./Address";

@Entity({ name: "store" })
export class Store {
    @PrimaryGeneratedColumn({ name: "store_id" })
    storeId: number;

    @Column({name: "manager_staff_id", nullable: false })
    managerStaffId : number;

    @Column({ name: "address_id", nullable: false })
    addressId: number;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @OneToMany(() => Inventory, inventory => inventory.store)
    inventories: Inventory[];

    @ManyToOne(() => Address)
    @JoinColumn({ name: "address_id" })
    address: Address;
}