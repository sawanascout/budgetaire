"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Fetch all missions with calculated totals
export async function getMissions() {
  try {
    const missions = await prisma.mission.findMany({
      include: {
        _count: {
          select: {
            activites: true,
            depenses: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Calculate total for each mission and format for client-side use
    const formattedMissions = missions.map((mission) => ({
      ...mission,
      activitesCount: mission._count.activites,
      depensesCount: mission._count.depenses,
      total: mission.montantParJour * mission.nombreJours, // Calculate total
    }))

    return { success: true, data: formattedMissions }
  } catch (error) {
    console.error("Failed to fetch missions:", error)
    return { success: false, error: "Failed to fetch missions." }
  }
}

// Get mission statistics
export async function getMissionStats() {
  try {
    const [totalMissions, missionsActives, missionsTerminees] = await Promise.all([
      prisma.mission.count(),
      prisma.mission.count({ where: { statut: "En Cours" } }),
      prisma.mission.count({ where: { statut: "Terminé" } }),
    ])

    // Calculate total budget from all missions
    const missions = await prisma.mission.findMany()
    const budgetTotal = missions.reduce((sum, mission) => {
      return sum + mission.montantParJour * mission.nombreJours
    }, 0)

    return {
      success: true,
      data: {
        totalMissions,
        missionsActives,
        missionsTerminees,
        budgetTotal,
      },
    }
  } catch (error) {
    console.error("Failed to fetch mission stats:", error)
    return { success: false, error: "Failed to fetch mission stats." }
  }
}

// Create a new mission
export async function createMission(data: {
  date: Date
  nomMissionnaire: string
  montantParJour: number
  nombreJours: number
  modePaiement: string
  reference: string
  statut?: string
}) {
  try {
    console.log("Creating mission with data:", data)

    const newMission = await prisma.mission.create({
      data: {
        date: data.date,
        nomMissionnaire: data.nomMissionnaire,
        montantParJour: data.montantParJour,
        nombreJours: data.nombreJours,
        modePaiement: data.modePaiement,
        reference: data.reference,
        statut: data.statut || "En Attente",
      },
    })

    console.log("Mission created successfully:", newMission)
    revalidatePath("/dashboard/missions")
    return { success: true, data: newMission }
  } catch (error) {
    console.error("Failed to create mission:", error)
    return { success: false, error: "Failed to create mission." }
  }
}

// Update an existing mission
export async function updateMission(
  id: number,
  data: {
    date?: Date
    nomMissionnaire?: string
    montantParJour?: number
    nombreJours?: number
    modePaiement?: string
    reference?: string
    statut?: string
  },
) {
  try {
    console.log("Updating mission with ID:", id, "and data:", data)

    const updatedMission = await prisma.mission.update({
      where: { id },
      data: {
        date: data.date,
        nomMissionnaire: data.nomMissionnaire,
        montantParJour: data.montantParJour,
        nombreJours: data.nombreJours,
        modePaiement: data.modePaiement,
        reference: data.reference,
        statut: data.statut,
      },
    })

    console.log("Mission updated successfully:", updatedMission)
    revalidatePath("/dashboard/missions")
    return { success: true, data: updatedMission }
  } catch (error) {
    console.error("Failed to update mission:", error)
    return { success: false, error: "Failed to update mission." }
  }
}

// Delete a mission
export async function deleteMission(id: number) {
  try {
    console.log("Deleting mission with ID:", id)

    // Delete related activities and expenses first if they are not cascaded
    await prisma.depense.deleteMany({
      where: { missionId: id },
    })
    await prisma.activite.deleteMany({
      where: { missionId: id },
    })

    await prisma.mission.delete({
      where: { id },
    })

    console.log("Mission deleted successfully")
    revalidatePath("/dashboard/missions")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete mission:", error)
    return { success: false, error: "Failed to delete mission." }
  }
}
