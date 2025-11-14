import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm"
import { Film } from "./Film";
import { Actor } from "./Actor";

@Entity({ name: "film_actor" })
export class FilmActor {

    @PrimaryColumn({ name: "actor_id" })
    actorId: number;

    @PrimaryColumn({ name: "film_id" })
    filmId: number;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @ManyToOne(() => Actor, actor => actor.filmActors)
    @JoinColumn({ name: "actor_id" })
    actor: Actor;

    @ManyToOne(() => Film, film => film.filmActors)
    @JoinColumn({ name: "film_id" })
    film: Film;
}
