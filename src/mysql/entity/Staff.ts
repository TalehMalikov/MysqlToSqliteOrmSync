import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "staff" })
export class Staff {
    @PrimaryGeneratedColumn({ name: "staff_id" })
    staffId: number;

    @Column({ name: "first_name", nullable: false })
    firstName: string;

    @Column({ name: "last_name", nullable: false })
    lastName: string;

    @Column({ name: "address_id", nullable: false })
    addressId: number;

    @Column({ name: "picture", type: "blob", nullable: true })
    picture: Buffer;

    @Column({ name: "email", nullable: true })
    email: string;

    @Column({ name: "store_id", nullable: false })
    storeId: number;

    @Column({ name: "active", nullable: false, default: true })
    active: boolean;

    @Column({ name: "username", nullable: false })
    username: string;

    @Column({ name: "password", nullable: true })
    password: string;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;
}