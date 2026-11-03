import { defineConfig } from "prisma/config";

const rawUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_g8AWivGwJnC4@ep-wild-butterfly-b950p3m7-pooler.c-7.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: rawUrl,
  },
});
