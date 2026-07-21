import { PrismaClient } from "@prisma/client";

// Reuse a single Prisma client across the app (avoids exhausting DB
// connections in dev with hot-reload).
const prisma = new PrismaClient();

export default prisma;
