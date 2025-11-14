import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm"
import { City } from "./City";

@Entity({ name: "address" })
export class Address {
    @PrimaryGeneratedColumn({ name: "address_id" })
    addressId: number;

    @Column({ nullable: false })
    address: string;

    @Column({ name: "address2", nullable: true })
    address2: string;

    @Column({ nullable: false })
    district: string;

    @Column({ name: "city_id", nullable: false })
    cityId: number;

    @Column({ name: "postal_code", nullable: true })
    postalCode: string;

    @Column({ nullable: false })
    phone: string;

    @Column({type: "point", nullable: true})
    location: { x: number; y: number } | null;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @ManyToOne(() => City)
    @JoinColumn({ name: "city_id" })
    city: City;
}