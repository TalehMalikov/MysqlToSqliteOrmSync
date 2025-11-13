import { Entity, Column } from "typeorm"

@Entity({ name: "bridge_film_actor" })
export class BridgeFilmActor {
    @Column({ name: "film_key" })
    filmKey: number;

    @Column({ name: "actor_key" })
    actorKey: number;
}
