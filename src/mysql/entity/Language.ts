import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "language" })
export class Language {

    @PrimaryGeneratedColumn({ name: "language_id" })
    languageId: number;

    @Column({ nullable: false, length: 20 })
    name : string;

    @Column({ 
        name: "last_update", 
        nullable: false, 
        type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' 
    })
    lastUpdate: Date;
}
