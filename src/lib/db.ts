// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Use the runtime DATABASE_URL explicitly so serverless (Vercel) reads the env at run time.
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export const db = prisma;