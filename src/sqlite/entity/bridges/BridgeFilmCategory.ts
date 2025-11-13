import { Entity, Column } from "typeorm"

@Entity({ name: "bridge_film_category" })
export class BridgeFilmCategory {
    @Column({ name: "film_key" })
    filmKey: number;

    @Column({ name: "category_key" })
    categoryKey: number;
}
