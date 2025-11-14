import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { FilmActor } from "./FilmActor";

@Entity({ name: "actor" })
export class Actor {

    @PrimaryGeneratedColumn({ name: "actor_id" })
    actorId: number;

    @Column({name: "first_name", nullable: false, length: 45 })
    firstName : string;

    @Column({name: "last_name", nullable: false, length: 45 })
    lastName : string;

    @Column({ 
        name: "last_update",
        nullable: false,
        type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' 
    })
    lastUpdate: Date;

    @OneToMany(() => FilmActor, filmActor => filmActor.actor)
    filmActors: FilmActor[];
}