import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity({ name: "bridge_film_category" })
export class BridgeFilmCategory {
    @PrimaryColumn({ name: "film_key" })
    filmKey: number;

    @PrimaryColumn({ name: "category_key" })
    categoryKey: number;
}
