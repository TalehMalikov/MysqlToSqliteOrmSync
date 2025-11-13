import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "film_actor" })
export class FilmActor {

    @PrimaryGeneratedColumn({ name: "actor_id" })
    actorId: number;

    @PrimaryGeneratedColumn({ name: "film_id" })
    filmId: number;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;
}
