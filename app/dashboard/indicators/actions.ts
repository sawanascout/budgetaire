"use server"

import  prisma  from "@/lib/prisma"

export async function getIndicatorsData() {
  try {
    // Statistiques générales
    const [totalMissions, totalActivites, totalDepenses, totalRubriques, missions, activites, depenses, rubriques] =
      await Promise.all([
        prisma.mission.count(),
        prisma.activite.count(),
        prisma.depense.count(),
        prisma.rubrique.count(),
        prisma.mission.findMany({
          include: {
            activites: true,
            depenses: true,
          },
        }),
        prisma.activite.findMany({
          include: {
            mission: true,
            rubrique: true,
          },
        }),
        prisma.depense.findMany({
          include: {
            mission: true,
          },
        }),
        prisma.rubrique.findMany({
          include: {
            activites: true,
          },
        }),
      ])

    // Calcul du budget total et consommé
    const budgetTotal = missions.reduce((sum, mission) => sum + mission.budget, 0)
    const budgetConsomme = depenses.reduce((sum, depense) => sum + depense.montant, 0)
    const budgetRestant = budgetTotal - budgetConsomme
    const tauxConsommation = budgetTotal > 0 ? (budgetConsomme / budgetTotal) * 100 : 0

    // Répartition des missions par statut
    const missionsParStatut = missions.reduce(
      (acc, mission) => {
        acc[mission.statutValidation] = (acc[mission.statutValidation] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Répartition des activités par statut
    const activitesParStatut = activites.reduce(
      (acc, activite) => {
        acc[activite.statut] = (acc[activite.statut] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Top rubriques par nombre d'activités
    const rubriqueStats = rubriques
      .map((rubrique) => ({
        nom: rubrique.nom,
        nombreActivites: rubrique.activites.length,
        budgetPrevu: rubrique.activites.reduce((sum, act) => sum + Number.parseFloat(act.budgetPrevu || "0"), 0),
        budgetConsomme: rubrique.activites.reduce((sum, act) => sum + Number.parseFloat(act.budgetConsomme || "0"), 0),
      }))
      .sort((a, b) => b.nombreActivites - a.nombreActivites)

    // Évolution des dépenses par mois (12 derniers mois)
    const now = new Date()
    const depensesParMois = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const moisSuivant = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const depensesMois = depenses.filter((depense) => {
        const dateDepense = new Date(depense.dateDepense)
        return dateDepense >= date && dateDepense < moisSuivant
      })

      const totalMois = depensesMois.reduce((sum, depense) => sum + depense.montant, 0)

      depensesParMois.push({
        mois: date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
        montant: totalMois,
        nombreDepenses: depensesMois.length,
      })
    }

    // Missions les plus coûteuses
    const missionsParBudget = missions
      .map((mission) => ({
        ...mission,
        budgetConsomme: mission.depenses.reduce((sum, depense) => sum + depense.montant, 0),
        nombreActivites: mission.activites.length,
        nombreDepenses: mission.depenses.length,
      }))
      .sort((a, b) => b.budgetConsomme - a.budgetConsomme)
      .slice(0, 10)

    // Efficacité budgétaire par rubrique
    const efficaciteRubriques = rubriqueStats.map((rubrique) => ({
      ...rubrique,
      efficacite:
        rubrique.budgetPrevu > 0 ? ((rubrique.budgetPrevu - rubrique.budgetConsomme) / rubrique.budgetPrevu) * 100 : 0,
    }))

    // Tendances mensuelles
    const tendancesMensuelles = depensesParMois.map((mois, index) => {
      const moisPrecedent = index > 0 ? depensesParMois[index - 1] : null
      const evolution =
        moisPrecedent && moisPrecedent.montant > 0
          ? ((mois.montant - moisPrecedent.montant) / moisPrecedent.montant) * 100
          : 0

      return {
        ...mois,
        evolution,
      }
    })

    return {
      success: true,
      data: {
        statistiques: {
          totalMissions,
          totalActivites,
          totalDepenses,
          totalRubriques,
          budgetTotal,
          budgetConsomme,
          budgetRestant,
          tauxConsommation,
        },
        missionsParStatut,
        activitesParStatut,
        rubriqueStats: rubriqueStats.slice(0, 10),
        depensesParMois: tendancesMensuelles,
        missionsParBudget,
        efficaciteRubriques,
        performanceGlobale: {
          tauxRealisationMissions:
            totalMissions > 0
              ? (Object.values(missionsParStatut).reduce((sum, count) => sum + (count || 0), 0) / totalMissions) * 100
              : 0,
          moyenneBudgetMission: totalMissions > 0 ? budgetTotal / totalMissions : 0,
          moyenneDepensesMission: totalMissions > 0 ? budgetConsomme / totalMissions : 0,
        },
      },
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des indicateurs:", error)
    return {
      success: false,
      error: "Erreur lors de la récupération des indicateurs",
    }
  }
}

export async function exportIndicatorsData(format: "csv" | "excel" = "csv") {
  try {
    const result = await getIndicatorsData()

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Ici vous pouvez implémenter l'export en CSV ou Excel
    // Pour l'instant, on retourne juste les données
    return {
      success: true,
      data: result.data,
      message: `Export ${format.toUpperCase()} préparé`,
    }
  } catch (error) {
    console.error("Erreur lors de l'export:", error)
    return {
      success: false,
      error: "Erreur lors de l'export des données",
    }
  }
}
