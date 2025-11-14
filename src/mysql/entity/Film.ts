import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { Language } from "./Language"
import { FilmActor } from "./FilmActor"
import { Inventory } from "./Inventory"

@Entity({ name: "film" })
export class Film {
    @PrimaryGeneratedColumn({ name: "film_id" })
    filmId: number

    @Column({ nullable: false })
    title: string

    @Column({ nullable: true })
    description: string

    @Column({ name: "release_year", nullable: true })
    releaseYear: number

    @Column({ name: "language_id" , nullable: false })
    languageId: number

    @Column({ name: "original_language_id", nullable: true })
    originalLanguageId: number

    @Column({ name: "rental_duration", nullable: false })
    rentalDuration: number

    @Column({ name: "rental_rate", type: "decimal", precision: 4, scale: 2, nullable: false })
    rentalRate: number

    @Column({ name: "length", nullable: true })
    length: number

    @Column({ name: "replacement_cost", type: "decimal", precision: 5, scale: 2 , nullable: false})
    replacementCost: number

    @Column({ name: "rating", type: 'enum', enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], nullable: true })
    rating: string

    @Column({ name: "special_features", type: 'set', nullable: true })
    specialFeatures: string

    @Column({ name: "last_update", type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    lastUpdate: Date

    @Column({ name: "last_rented" , type: "datetime", nullable: true })
    lastRented: Date

    @Column({name: "total_sales", type: "int", nullable: true })
    totalSales: number

    @ManyToOne(() => Language)
    @JoinColumn({ name: "language_id" })
    language: Language

    @ManyToOne(() => Language)
    @JoinColumn({ name: "original_language_id" })
    originalLanguage: Language
    
    @OneToMany(() => FilmActor, filmActor => filmActor.film)
    filmActors: FilmActor[];

    @OneToMany(() => Inventory, inventory => inventory.film)
    inventories: Inventory[];
}