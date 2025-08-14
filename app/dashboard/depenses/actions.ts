"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import type { Mission } from "@prisma/client"

// Define a client-side compatible Depense type based on exact schema
export interface DepenseClient {
  id: number
  nom: string
  date: Date
  montant: number // Float in schema
  justificatif: string // Required string in schema
  missionId: number
  mission?: Mission // Optional for includes
}

export async function getDepenses(): Promise<DepenseClient[]> {
  try {
    const depenses = await prisma.depense.findMany({
      include: {
        mission: true,
      },
      orderBy: {
        date: "desc",
      },
    })
    return depenses
  } catch (error) {
    console.error("Failed to fetch depenses:", error)
    throw new Error("Échec de la récupération des dépenses.")
  }
}

export async function getMissionsForSelect(): Promise<Mission[]> {
  try {
    const missions = await prisma.mission.findMany({
      select: {
        id: true,
        nom: true,
      },
      orderBy: {
        nom: "asc",
      },
    })
    return missions
  } catch (error) {
    console.error("Failed to fetch missions for select:", error)
    throw new Error("Échec de la récupération des missions.")
  }
}

export async function createDepense(data: Omit<DepenseClient, "id" | "mission">) {
  try {
    const newDepense = await prisma.depense.create({
      data: {
        nom: data.nom,
        date: new Date(data.date),
        montant: data.montant,
        justificatif: data.justificatif,
        missionId: data.missionId,
      },
      include: {
        mission: true,
      },
    })
    revalidatePath("/dashboard/depenses")
    return newDepense
  } catch (error) {
    console.error("Failed to create depense:", error)
    throw new Error("Échec de la création de la dépense.")
  }
}

export async function updateDepense(id: number, data: Omit<DepenseClient, "id" | "mission">) {
  try {
    const updatedDepense = await prisma.depense.update({
      where: { id },
      data: {
        nom: data.nom,
        date: new Date(data.date),
        montant: data.montant,
        justificatif: data.justificatif,
        missionId: data.missionId,
      },
      include: {
        mission: true,
      },
    })
    revalidatePath("/dashboard/depenses")
    return updatedDepense
  } catch (error) {
    console.error(`Failed to update depense with ID ${id}:`, error)
    throw new Error(`Échec de la mise à jour de la dépense avec l'ID ${id}.`)
  }
}

export async function deleteDepense(id: number) {
  try {
    await prisma.depense.delete({
      where: { id },
    })
    revalidatePath("/dashboard/depenses")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete depense with ID ${id}:`, error)
    throw new Error(`Échec de la suppression de la dépense avec l'ID ${id}.`)
  }
}

export async function getDepenseById(id: number): Promise<DepenseClient | null> {
  try {
    const depense = await prisma.depense.findUnique({
      where: { id },
      include: {
        mission: true,
      },
    })
    return depense
  } catch (error) {
    console.error(`Failed to fetch depense with ID ${id}:`, error)
    throw new Error(`Échec de la récupération de la dépense avec l'ID ${id}.`)
  }
}
