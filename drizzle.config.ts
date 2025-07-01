import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://charliewalker:FxK2%40m%24k%40NKWYjuw@localhost:5001/homeinventory",
  },
});
