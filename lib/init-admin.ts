import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function initializeAdmin() {
  try {
    // Vérifier si l'utilisateur admin existe déjà
    const existingAdmin = await prisma.utilisateur.findUnique({
      where: { email: "admin@gestionbudget.com" },
    })

    if (existingAdmin) {
      console.log("ℹ️ Compte administrateur déjà initialisé")
      return
    }

    console.log("🔧 Initialisation du compte administrateur...")

    // Créer le rôle Administrateur s'il n'existe pas
    let adminRole = await prisma.role.findFirst({
      where: { nom: "Administrateur" },
    })

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          nom: "Administrateur",
          description: "Accès complet à toutes les fonctionnalités du système",
        },
      })
      console.log("✅ Rôle Administrateur créé")
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Créer l'utilisateur administrateur
    const adminUser = await prisma.utilisateur.create({
      data: {
        nom: "Admin",
        prenom: "Système",
        email: "admin@gestionbudget.com",
        motDePasse: hashedPassword,
        roles: {
          connect: { id: adminRole.id },
        },
      },
      include: {
        roles: true,
      },
    })

    console.log("✅ Compte administrateur créé avec succès!")
    console.log("📧 Email: admin@gestionbudget.com")
    console.log("🔑 Mot de passe: admin123")
    console.log("🚀 Vous pouvez maintenant vous connecter!")
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error)
  } finally {
    await prisma.$disconnect()
  }
}
