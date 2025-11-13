import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "dim_film" })
export class DimFilm {
    @PrimaryGeneratedColumn({ name: "film_key" })
    filmKey: number;

    @Column({ name: "film_id" })
    filmId: number;

    @Column()
    title: string;

    @Column()
    rating: string;

    @Column()
    length: number;

    @Column()
    language: string;

    @Column({ name: "release_year" })
    releaseYear: number;

    @Column({ name: "last_update" })
    lastUpdate: Date;
}
