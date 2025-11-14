import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "sync_state" })
export class SyncState {

  @PrimaryColumn({ name: "table_name", type: "text" })
  tableName: string;

  @Column({ name: "last_update", type: "datetime" })
  lastUpdate: Date;
}
