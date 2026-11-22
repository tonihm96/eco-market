import { randomUUIDv7 } from "bun";
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = () =>
  uuid()
    .primaryKey()
    .$defaultFn(() => randomUUIDv7());

export const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
