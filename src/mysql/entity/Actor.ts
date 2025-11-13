import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "actor" })
export class Actor {

    @PrimaryGeneratedColumn({ name: "actor_id" })
    actorId: number;

    @Column({name: "first_name", nullable: false })
    firstName : string;

    @Column({name: "last_name", nullable: false })
    lastName : string;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;
}