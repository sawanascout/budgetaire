import { PrismaClient } from "@prisma/client"

// Add prisma to the global type to avoid TypeScript errors in development
declare global {
  var prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient

if (process.env.NODE_ENV === "production") {
  prismaInstance = new PrismaClient()
} else {
  // Use a global variable in development to prevent multiple instances of PrismaClient
  // which can lead to issues like "too many connections"
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prismaInstance = global.prisma
}

export { prismaInstance as prisma }
export default prismaInstance
