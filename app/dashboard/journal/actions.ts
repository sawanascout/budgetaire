"use server"

import  prisma  from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type JournalEntry = {
  id: number
  action: string
  table: string
  recordId: number
  oldValues: string | null
  newValues: string | null
  userId: number
  timestamp: Date
  user: {
    id: number
    nom: string
    prenom: string
    email: string
  }
}

export type ReportData = {
  totalMissions: number
  totalActivites: number
  totalDepenses: number
  totalRubriques: number
  totalBudget: number
  budgetConsomme: number
  budgetRestant: number
  missionsParStatut: { statut: string; count: number }[]
  activitesParStatut: { statut: string; count: number }[]
  depensesParMois: { mois: string; total: number }[]
  topRubriques: { nom: string; count: number; budget: number }[]
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
    date: Date
    montant: number
    mission: { nom: string }
  }[]
}

// Récupérer les entrées du journal
export async function getJournalEntries(): Promise<{ success: boolean; data?: JournalEntry[]; error?: string }> {
  try {
    console.log("Fetching journal entries...")

    // Vérifier si la table journal existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Journal'
      );
    `

    console.log("Journal table exists:", tableExists)

    // Si la table n'existe pas, retourner un tableau vide
    if (!tableExists || !(tableExists as any[])[0]?.exists) {
      console.log("Journal table does not exist, returning empty array")
      return { success: true, data: [] }
    }

    const entries = await prisma.journal.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100, // Limiter à 100 entrées récentes
    })

    console.log(`Found ${entries.length} journal entries`)
    return { success: true, data: entries }
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    // Si la table journal n'existe pas, retourner un tableau vide au lieu d'une erreur
    if (error instanceof Error && error.message.includes('relation "Journal" does not exist')) {
      console.log("Journal table does not exist, returning empty array")
      return { success: true, data: [] }
    }
    return { success: false, error: "Erreur lors de la récupération du journal" }
  }
}

// Générer les données de rapport
export async function getReportData(): Promise<{ success: boolean; data?: ReportData; error?: string }> {
  try {
    console.log("Generating report data...")

    // Statistiques générales
    const [totalMissions, totalActivites, totalDepenses, totalRubriques] = await Promise.all([
      prisma.mission.count(),
      prisma.activite.count(),
      prisma.depense.count(),
      prisma.rubrique.count(),
    ])

    // Budget total et consommé
    const missions = await prisma.mission.findMany({
      select: { budget: true },
    })
    const totalBudget = missions.reduce((sum, mission) => sum + mission.budget, 0)

    const depenses = await prisma.depense.findMany({
      select: { montant: true },
    })
    const budgetConsomme = depenses.reduce((sum, depense) => sum + depense.montant, 0)
    const budgetRestant = totalBudget - budgetConsomme

    // Missions par statut
    const missionsParStatut = await prisma.mission.groupBy({
      by: ["statutValidation"],
      _count: {
        id: true,
      },
    })

    // Activités par statut
    const activitesParStatut = await prisma.activite.groupBy({
      by: ["statut"],
      _count: {
        id: true,
      },
    })

    // Dépenses par mois - utilisation de JavaScript au lieu de SQL brut
    const allDepenses = await prisma.depense.findMany({
      select: {
        date: true,
        montant: true,
      },
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        },
      },
    })

    // Grouper les dépenses par mois
    const depensesParMoisMap = new Map<string, number>()
    allDepenses.forEach((depense) => {
      const mois = depense.date.toISOString().substring(0, 7) // YYYY-MM
      const current = depensesParMoisMap.get(mois) || 0
      depensesParMoisMap.set(mois, current + depense.montant)
    })

    const depensesParMois = Array.from(depensesParMoisMap.entries())
      .map(([mois, total]) => ({ mois, total }))
      .sort((a, b) => b.mois.localeCompare(a.mois))

    // Top rubriques avec budget total
    const topRubriquesRaw = await prisma.rubrique.findMany({
      include: {
        activites: {
          select: {
            budgetPrevu: true,
          },
        },
      },
      take: 10,
    })

    const topRubriques = topRubriquesRaw
      .map((rubrique) => ({
        nom: rubrique.nom,
        count: rubrique.activites.length,
        budget: rubrique.activites.reduce((sum, activite) => {
          const budget = Number.parseFloat(activite.budgetPrevu) || 0
          return sum + budget
        }, 0),
      }))
      .sort((a, b) => b.count - a.count)

    // Missions récentes
    const missionsRecentes = await prisma.mission.findMany({
      include: {
        activites: true,
      },
      orderBy: {
        dateDebut: "desc",
      },
      take: 5,
    })

    // Dépenses récentes
    const depensesRecentes = await prisma.depense.findMany({
      include: {
        mission: {
          select: {
            nom: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    })

    const reportData: ReportData = {
      totalMissions,
      totalActivites,
      totalDepenses,
      totalRubriques,
      totalBudget,
      budgetConsomme,
      budgetRestant,
      missionsParStatut: missionsParStatut.map((item) => ({
        statut: item.statutValidation,
        count: item._count.id,
      })),
      activitesParStatut: activitesParStatut.map((item) => ({
        statut: item.statut,
        count: item._count.id,
      })),
      depensesParMois,
      topRubriques,
      missionsRecentes: missionsRecentes.map((mission) => ({
        id: mission.id,
        nom: mission.nom,
        dateDebut: mission.dateDebut,
        dateFin: mission.dateFin,
        budget: mission.budget,
        statutValidation: mission.statutValidation,
        activitesCount: mission.activites.length,
      })),
      depensesRecentes: depensesRecentes.map((depense) => ({
        id: depense.id,
        nom: depense.nom,
        date: depense.date,
        montant: depense.montant,
        mission: depense.mission,
      })),
    }

    console.log("Report data generated successfully")
    return { success: true, data: reportData }
  } catch (error) {
    console.error("Error generating report data:", error)
    return { success: false, error: "Erreur lors de la génération du rapport" }
  }
}

// Créer une entrée de journal
export async function createJournalEntry(
  action: string,
  table: string,
  recordId: number,
  oldValues?: any,
  newValues?: any,
  userId = 1, // Par défaut, utilisateur avec ID 1
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier si la table journal existe avant d'essayer d'insérer
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Journal'
      );
    `

    if (!tableExists || !(tableExists as any[])[0]?.exists) {
      console.log("Journal table does not exist, skipping journal entry creation")
      return { success: true }
    }

    await prisma.journal.create({
      data: {
        action,
        table,
        recordId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        userId,
        timestamp: new Date(),
      },
    })

    revalidatePath("/dashboard/journal")
    return { success: true }
  } catch (error) {
    console.error("Error creating journal entry:", error)
    // Ne pas faire échouer l'opération principale si le journal ne fonctionne pas
    return { success: true }
  }
}

// Nettoyer les anciennes entrées du journal (garder seulement les 1000 plus récentes)
export async function cleanupJournal(): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier si la table journal existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Journal'
      );
    `

    if (!tableExists || !(tableExists as any[])[0]?.exists) {
      return { success: false, error: "La table Journal n'existe pas" }
    }

    // Récupérer l'ID de la 1000ème entrée la plus récente
    const entries = await prisma.journal.findMany({
      select: { id: true },
      orderBy: { timestamp: "desc" },
      skip: 1000,
      take: 1,
    })

    if (entries.length > 0) {
      const cutoffId = entries[0].id

      // Supprimer toutes les entrées plus anciennes
      await prisma.journal.deleteMany({
        where: {
          id: {
            lt: cutoffId,
          },
        },
      })
    }

    revalidatePath("/dashboard/journal")
    return { success: true }
  } catch (error) {
    console.error("Error cleaning up journal:", error)
    return { success: false, error: "Erreur lors du nettoyage du journal" }
  }
}
