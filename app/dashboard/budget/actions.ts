"use server"

import prisma from "@/lib/prisma"

export async function getBudgetData() {
  try {
    // Récupérer toutes les rubriques avec leurs activités
    const rubriques = await prisma.rubrique.findMany({
      include: {
        activites: {
          select: {
            budgetPrevu: true,
            budgetConsomme: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    })

    // Calculer les statistiques globales
    const budgetAlloue = rubriques.reduce((total, rubrique) => total + (rubrique.budget || 0), 0)

    const depensesEffectuees = rubriques.reduce((total, rubrique) => {
      const budgetConsomme = rubrique.activites.reduce((sum, activite) => sum + (activite.budgetConsomme || 0), 0)
      return total + budgetConsomme
    }, 0)

    const enCours = rubriques.reduce((total, rubrique) => {
      const budgetPrevu = rubrique.activites.reduce((sum, activite) => sum + (activite.budgetPrevu || 0), 0)
      const budgetConsomme = rubrique.activites.reduce((sum, activite) => sum + (activite.budgetConsomme || 0), 0)
      return total + (budgetPrevu - budgetConsomme)
    }, 0)

    const disponible = budgetAlloue - depensesEffectuees - enCours

    // Calculer le budget par rubrique
    const budgetParRubrique = rubriques.map((rubrique) => {
      const budgetActivites = rubrique.activites.reduce((sum, activite) => sum + (activite.budgetPrevu || 0), 0)
      const budgetConsomme = rubrique.activites.reduce((sum, activite) => sum + (activite.budgetConsomme || 0), 0)
      const enCoursRubrique = budgetActivites - budgetConsomme
      const disponibleRubrique = (rubrique.budget || 0) - budgetActivites
      const progression = rubrique.budget > 0 ? (budgetActivites / rubrique.budget) * 100 : 0

      return {
        nom: rubrique.nom,
        budgetAlloue: rubrique.budget || 0,
        depense: budgetConsomme,
        enCours: enCoursRubrique,
        disponible: disponibleRubrique,
        progression: Math.min(progression, 100),
      }
    })

    return {
      success: true,
      data: {
        statistiques: {
          budgetAlloue,
          depensesEffectuees,
          enCours,
          disponible,
        },
        budgetParRubrique,
      },
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données budgétaires:", error)
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    }
  }
}
