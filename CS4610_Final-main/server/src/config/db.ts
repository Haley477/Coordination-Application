import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Connect to the database
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};

export default prisma;
