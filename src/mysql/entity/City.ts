import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm"
import { Country } from "./Country";

@Entity({ name: "city" })
export class City {
    @PrimaryGeneratedColumn({ name: "city_id" })
    cityId: number;

    @Column({nullable: false })
    city: string;

    @Column({ name: "country_id", nullable: true })
    countryId: number;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @ManyToOne(() => Country)
    @JoinColumn({ name: "country_id" })
    country: Country;
}