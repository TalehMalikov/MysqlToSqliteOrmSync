import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "country" })
export class Country {
    @PrimaryGeneratedColumn({ name: "country_id" })
    countryId: number;

    @Column({nullable: false, length: 50 })
    country: string;

    @Column({ 
        name: "last_update", 
        nullable: false, 
        type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' 
    })
    lastUpdate: Date;
}