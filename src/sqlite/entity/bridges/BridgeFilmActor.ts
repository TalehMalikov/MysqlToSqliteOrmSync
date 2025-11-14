import { Entity, PrimaryColumn } from "typeorm"

@Entity({ name: "bridge_film_actor" })
export class BridgeFilmActor {
    @PrimaryColumn({ name: "film_key" })
    filmKey: number;

    @PrimaryColumn({ name: "actor_key" })
    actorKey: number;
}
