import Dexie, { type Table } from "dexie";

export interface OutboxItem {
  id?: number;
  resourcePath: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body: any;
  timestamp: number;
  lockedBy?: string | null;
  lockedAt?: number | null;
  attempts?: number;
}

export class MyDatabase extends Dexie {
  outbox!: Table<OutboxItem>;

  constructor() {
    super("OfflineDB");
    this.version(1).stores({
      outbox: "++id, timestamp",
    });
  }
}

export const db = new MyDatabase();
