import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seeding...")

  try {
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
    } else {
      console.log("ℹ️ Rôle Administrateur existe déjà")
    }

    // Créer d'autres rôles de base
    const roles = [
      {
        nom: "Comptable",
        description: "Gestion des finances et des budgets",
      },
      {
        nom: "Chef de Mission",
        description: "Gestion des missions et des équipes",
      },
      {
        nom: "Utilisateur",
        description: "Accès de base aux fonctionnalités",
      },
    ]

    for (const roleData of roles) {
      const existingRole = await prisma.role.findFirst({
        where: { nom: roleData.nom },
      })

      if (!existingRole) {
        await prisma.role.create({ data: roleData })
        console.log(`✅ Rôle ${roleData.nom} créé`)
      } else {
        console.log(`ℹ️ Rôle ${roleData.nom} existe déjà`)
      }
    }

    // Vérifier si l'utilisateur admin existe déjà
    const existingAdmin = await prisma.utilisateur.findUnique({
      where: { email: "admin@gestionbudget.com" },
    })

    if (!existingAdmin) {
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

      console.log("✅ Utilisateur administrateur créé:")
      console.log(`   📧 Email: ${adminUser.email}`)
      console.log(`   🔑 Mot de passe: admin123`)
      console.log(`   👤 Rôles: ${adminUser.roles.map((r) => r.nom).join(", ")}`)
    } else {
      console.log("ℹ️ Utilisateur administrateur existe déjà")
      console.log(`   📧 Email: ${existingAdmin.email}`)
    }

    // Créer quelques missions d'exemple
    const existingMissions = await prisma.mission.count()
    if (existingMissions === 0) {
      const missions = [
        {
          nom: "Formation Personnel 2024",
          dateDebut: new Date("2024-01-15"),
          dateFin: new Date("2024-03-15"),
          duree: 60,
          budget: 50000,
          modePaiement: "Virement",
          statutValidation: "Approuvé",
        },
        {
          nom: "Audit Financier Q1",
          dateDebut: new Date("2024-02-01"),
          dateFin: new Date("2024-04-30"),
          duree: 90,
          budget: 75000,
          modePaiement: "Chèque",
          statutValidation: "En cours",
        },
      ]

      for (const missionData of missions) {
        await prisma.mission.create({ data: missionData })
        console.log(`✅ Mission "${missionData.nom}" créée`)
      }
    }

    // Créer quelques rubriques d'exemple
    const existingRubriques = await prisma.rubrique.count()
    if (existingRubriques === 0) {
      const rubriques = [
        {
          nom: "Formation",
          description: "Activités liées à la formation du personnel",
        },
        {
          nom: "Audit",
          description: "Activités d'audit et de contrôle",
        },
        {
          nom: "Consultation",
          description: "Services de consultation externe",
        },
        {
          nom: "Équipement",
          description: "Achat et maintenance d'équipements",
        },
      ]

      for (const rubriqueData of rubriques) {
        await prisma.rubrique.create({ data: rubriqueData })
        console.log(`✅ Rubrique "${rubriqueData.nom}" créée`)
      }
    }

    console.log("\n🎉 Seeding terminé avec succès!")
    console.log("\n📋 Informations de connexion:")
    console.log("   📧 Email: admin@gestionbudget.com")
    console.log("   🔑 Mot de passe: admin123")
    console.log("\n🚀 Vous pouvez maintenant vous connecter au dashboard!")
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
