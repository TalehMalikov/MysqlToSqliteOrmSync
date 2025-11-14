import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm"
import { Film } from "./Film";
import { Category } from "./Category";

@Entity({ name: "film_category" })
export class FilmCategory {

    @PrimaryColumn({ name: "film_id" })
    filmId: number;

    @PrimaryColumn({ name: "category_id" })
    categoryId: number;

    @Column({ name: "last_update", nullable: false, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date;

    @ManyToOne(() => Film, film => film.filmCategories)
    @JoinColumn({ name: "film_id" })
    film: Film;

    @ManyToOne(() => Category, category => category.filmCategories)
    @JoinColumn({ name: "category_id" })
    category: Category;

    
}
