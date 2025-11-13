import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: "dim_date" })
export class DimDate {
    @PrimaryGeneratedColumn({ name: "date_key" })
    dateKey: number;

    @Column()
    date: Date;

    @Column()
    year: number;

    @Column()
    quarter: number;

    @Column()
    month: number;

    @Column({ name: "day_of_month" })
    dayOfMonth: number;

    @Column({ name: "day_of_week" })
    dayOfWeek: number;

    @Column({ name: "is_weekend" })
    isWeekend: boolean;
}
