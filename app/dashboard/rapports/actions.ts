"use server"

import  prisma  from "@/lib/prisma"

export type ReportData = {
  totalMissions: number
  totalActivites: number
  totalDepenses: number
  totalRubriques: number
  totalBudget: number
  budgetConsomme: number
  budgetRestant: number
  pourcentageBudgetUtilise: number
  missionsParStatut: { statut: string; count: number; pourcentage: number }[]
  activitesParStatut: { statut: string; count: number; pourcentage: number }[]
  depensesParMois: { mois: string; total: number; count: number }[]
  topRubriques: { nom: string; activitesCount: number; budgetTotal: number }[]
  missionsRecentes: {
    id: number
    nom: string
    dateDebut: Date
    dateFin: Date
    budget: number
    statutValidation: string
    activitesCount: number
  }[]
  depensesRecentes: {
    id: number
    nom: string
    montant: number
    date: Date
    mission: { nom: string }
  }[]
}

export async function getReportData(): Promise<{ success: boolean; data?: ReportData; error?: string }> {
  try {
    console.log("Generating comprehensive report data...")

    // Statistiques de base
    const [totalMissions, totalActivites, totalDepenses, totalRubriques] = await Promise.all([
      prisma.mission.count(),
      prisma.activite.count(),
      prisma.depense.count(),
      prisma.rubrique.count(),
    ])

    // Calculs budgétaires
    const missions = await prisma.mission.findMany({
      select: { budget: true },
    })
    const totalBudget = missions.reduce((sum, mission) => sum + mission.budget, 0)

    const depenses = await prisma.depense.findMany({
      select: { montant: true },
    })
    const budgetConsomme = depenses.reduce((sum, depense) => sum + depense.montant, 0)
    const budgetRestant = totalBudget - budgetConsomme
    const pourcentageBudgetUtilise = totalBudget > 0 ? (budgetConsomme / totalBudget) * 100 : 0

    // Missions par statut
    const missionsParStatutRaw = await prisma.mission.groupBy({
      by: ["statutValidation"],
      _count: {
        id: true,
      },
    })

    const missionsParStatut = missionsParStatutRaw.map((item) => ({
      statut: item.statutValidation,
      count: item._count.id,
      pourcentage: totalMissions > 0 ? (item._count.id / totalMissions) * 100 : 0,
    }))

    // Activités par statut
    const activitesParStatutRaw = await prisma.activite.groupBy({
      by: ["statut"],
      _count: {
        id: true,
      },
    })

    const activitesParStatut = activitesParStatutRaw.map((item) => ({
      statut: item.statut,
      count: item._count.id,
      pourcentage: totalActivites > 0 ? (item._count.id / totalActivites) * 100 : 0,
    }))

    // Dépenses par mois (derniers 12 mois) - Version simplifiée sans raw query
    const depensesParMoisData = await prisma.depense.findMany({
      select: {
        date: true,
        montant: true,
      },
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Grouper les dépenses par mois
    const depensesGroupees = depensesParMoisData.reduce(
      (acc, depense) => {
        const mois = depense.date.toISOString().substring(0, 7) // YYYY-MM
        if (!acc[mois]) {
          acc[mois] = { total: 0, count: 0 }
        }
        acc[mois].total += depense.montant
        acc[mois].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>,
    )

    const depensesParMois = Object.entries(depensesGroupees)
      .map(([mois, data]) => ({
        mois,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.mois.localeCompare(a.mois))
      .slice(0, 12)

    // Top rubriques - Version corrigée
    const topRubriquesRaw = await prisma.rubrique.findMany({
      include: {
        activites: {
          select: {
            budgetPrevu: true,
          },
        },
      },
    })

    const topRubriques = topRubriquesRaw
      .map((rubrique) => ({
        nom: rubrique.nom,
        activitesCount: rubrique.activites.length,
        budgetTotal: rubrique.activites.reduce((sum, activite) => {
          const budget = Number.parseFloat(activite.budgetPrevu) || 0
          return sum + budget
        }, 0),
      }))
      .sort((a, b) => b.activitesCount - a.activitesCount)
      .slice(0, 10)

    // Missions récentes
    const missionsRecentes = await prisma.mission.findMany({
      select: {
        id: true,
        nom: true,
        dateDebut: true,
        dateFin: true,
        budget: true,
        statutValidation: true,
        activites: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        dateDebut: "desc",
      },
      take: 5,
    })

    const missionsRecentesFormatted = missionsRecentes.map((mission) => ({
      id: mission.id,
      nom: mission.nom,
      dateDebut: mission.dateDebut,
      dateFin: mission.dateFin,
      budget: mission.budget,
      statutValidation: mission.statutValidation,
      activitesCount: mission.activites.length,
    }))

    // Dépenses récentes
    const depensesRecentes = await prisma.depense.findMany({
      select: {
        id: true,
        nom: true,
        montant: true,
        date: true,
        mission: {
          select: {
            nom: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    })

    const reportData: ReportData = {
      totalMissions,
      totalActivites,
      totalDepenses,
      totalRubriques,
      totalBudget,
      budgetConsomme,
      budgetRestant,
      pourcentageBudgetUtilise,
      missionsParStatut,
      activitesParStatut,
      depensesParMois,
      topRubriques,
      missionsRecentes: missionsRecentesFormatted,
      depensesRecentes,
    }

    console.log("Report data generated successfully")
    return { success: true, data: reportData }
  } catch (error) {
    console.error("Error generating report data:", error)
    return { success: false, error: "Erreur lors de la génération du rapport" }
  }
}

export async function exportReportData(format: "csv" | "excel" = "csv"): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Exporting report data in ${format} format`)

    // Récupérer les données du rapport
    const reportResult = await getReportData()
    if (!reportResult.success || !reportResult.data) {
      return { success: false, error: "Impossible de récupérer les données du rapport" }
    }

    const data = reportResult.data

    if (format === "csv") {
      // Générer un CSV simple avec les statistiques principales
      const csvContent = [
        "Statistique,Valeur",
        `Total Missions,${data.totalMissions}`,
        `Total Activités,${data.totalActivites}`,
        `Total Dépenses,${data.totalDepenses}`,
        `Total Rubriques,${data.totalRubriques}`,
        `Budget Total,${data.totalBudget}`,
        `Budget Consommé,${data.budgetConsomme}`,
        `Budget Restant,${data.budgetRestant}`,
        `Pourcentage Budget Utilisé,${data.pourcentageBudgetUtilise.toFixed(2)}%`,
        "",
        "Missions par Statut",
        "Statut,Nombre,Pourcentage",
        ...data.missionsParStatut.map((item) => `${item.statut},${item.count},${item.pourcentage.toFixed(2)}%`),
        "",
        "Activités par Statut",
        "Statut,Nombre,Pourcentage",
        ...data.activitesParStatut.map((item) => `${item.statut},${item.count},${item.pourcentage.toFixed(2)}%`),
        "",
        "Top Rubriques",
        "Nom,Nombre d'Activités,Budget Total",
        ...data.topRubriques.map((item) => `${item.nom},${item.activitesCount},${item.budgetTotal}`),
      ].join("\n")

      // Dans un vrai projet, vous pourriez sauvegarder le fichier ou le retourner
      console.log("CSV généré:", csvContent)
    }

    return { success: true }
  } catch (error) {
    console.error("Error exporting report data:", error)
    return { success: false, error: "Erreur lors de l'export des données" }
  }
}
