import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "dim_actor" })
export class DimActor {
    @PrimaryGeneratedColumn({ name: "actor_key" })
    actorKey: number;

    @Column({ name: "actor_id" })
    actorId: number;

    @Column({name: 'first_name'})
    firstName: string;

    @Column({name: 'last_name'})
    lastName: string;

    @Column({ name: "last_update" })
    lastUpdate: Date;
}
