import dotenv from "dotenv"
import path from "path"

dotenv.config({
  path: path.join(process.cwd(), ".env")
})

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("Database is missing")
}

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle({ client: sql, schema })

export * from "./schema"