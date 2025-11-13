import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

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
}