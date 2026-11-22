import { drizzle } from "drizzle-orm/node-postgres";

import env from "@/env";

import * as schema from "./schema";

const database = drizzle(env.DATABASE_URL, { schema, casing: "snake_case" });

export type Database = typeof database;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export default database;
