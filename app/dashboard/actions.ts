"use server"

import prisma from "@/lib/prisma"

export async function getDashboardData() {
  try {
    // Récupérer toutes les rubriques avec leurs activités
    const rubriques = await prisma.rubrique.findMany({
      include: {
        activites: {
          select: {
            budgetPrevu: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    })

    // Calculer les statistiques globales
    const budgetTotal = rubriques.reduce((total, rubrique) => total + (rubrique.budget || 0), 0)

    const budgetConsomme = rubriques.reduce((total, rubrique) => {
      const budgetActivites = rubrique.activites.reduce((sum, activite) => sum + (activite.budgetPrevu || 0), 0)
      return total + budgetActivites
    }, 0)

    const budgetRestant = budgetTotal - budgetConsomme
    const tauxConsommation = budgetTotal > 0 ? (budgetConsomme / budgetTotal) * 100 : 0

    // Calculer la progression par rubrique
    const progressionRubriques = rubriques.map((rubrique) => {
      const budgetActivites = rubrique.activites.reduce((sum, activite) => sum + (activite.budgetPrevu || 0), 0)
      const progression = rubrique.budget > 0 ? (budgetActivites / rubrique.budget) * 100 : 0

      return {
        id: rubrique.id,
        nom: rubrique.nom,
        description: rubrique.description,
        budget: rubrique.budget || 0,
        depense: budgetActivites,
        progression: Math.min(progression, 100),
      }
    })

    // Récupérer les activités récentes
    const activitesRecentes = await prisma.activite.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        rubrique: {
          select: {
            nom: true,
          },
        },
      },
    })

    return {
      success: true,
      data: {
        statistiques: {
          budgetTotal,
          budgetConsomme,
          budgetRestant,
          tauxConsommation: Math.round(tauxConsommation * 10) / 10,
        },
        progressionRubriques,
        activitesRecentes,
        nombreRubriques: rubriques.length,
        nombreActivites: await prisma.activite.count(),
        nombreMissions: await prisma.mission.count(),
      },
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données du dashboard:", error)
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    }
  }
}

export async function getRubriques() {
  try {
    const rubriques = await prisma.rubrique.findMany({
      orderBy: {
        nom: "asc",
      },
    })

    return {
      success: true,
      data: rubriques,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des rubriques:", error)
    return {
      success: false,
      error: "Erreur lors de la récupération des rubriques",
    }
  }
}
