import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "category" })
export class Category {
    @PrimaryGeneratedColumn({ name: "category_id" })
    categoryId: number;
    
    @Column({ nullable: false, length: 25 })
    name : string;

    @Column({ 
        name: "last_update", 
        nullable: false, 
        type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' 
    })
    lastUpdate: Date;
}
