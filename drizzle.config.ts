import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: "postgresql://neondb_owner:npg_q0nycpij2gPM@ep-small-breeze-abqhhs6s-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
  },
} satisfies Config;