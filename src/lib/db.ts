import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getDbUrl(): string {
  // On Vercel (serverless), use /tmp which is writable
  if (process.env.VERCEL) {
    const tmpDb = "/tmp/closerai.db";
    // If db doesn't exist in /tmp yet, we need to create and seed it
    if (!fs.existsSync(tmpDb)) {
      // Copy pre-seeded database to /tmp
      const sourceDb = path.join(process.cwd(), "prisma", "seed-data.sqlite");
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDb);
      } else {
        // Try alternative paths (Vercel build output)
        const altPaths = [
          path.join(process.cwd(), ".next", "server", "prisma", "seed-data.sqlite"),
          path.join(__dirname, "..", "..", "prisma", "seed-data.sqlite"),
        ];
        for (const p of altPaths) {
          if (fs.existsSync(p)) {
            fs.copyFileSync(p, tmpDb);
            break;
          }
        }
      }
    }
    return `file:${tmpDb}`;
  }
  return process.env.DATABASE_URL || "file:./closerai.db";
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const url = getDbUrl();
  return new PrismaClient({
    datasources: { db: { url } },
  });
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
