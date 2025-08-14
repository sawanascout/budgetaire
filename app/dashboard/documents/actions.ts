"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDocuments() {
  try {
    const documents = await prisma.document.findMany({
      include: {
        activite: {
          select: {
            titre: true,
          },
        },
        mission: {
          select: {
            id: true,
          },
        },
        rubrique: {
          select: {
            nom: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: documents,
    }
  } catch (error) {
    console.error("Error fetching documents:", error)
    return {
      success: false,
      error: "Erreur lors du chargement des documents",
    }
  }
}

export async function getDocumentStats() {
  try {
    const [total, valides, enAttente, rejetes] = await Promise.all([
      prisma.document.count(),
      prisma.document.count({ where: { statut: "Validé" } }),
      prisma.document.count({ where: { statut: "En Attente" } }),
      prisma.document.count({ where: { statut: "Rejeté" } }),
    ])

    return {
      success: true,
      data: {
        total,
        valides,
        enAttente,
        rejetes,
      },
    }
  } catch (error) {
    console.error("Error fetching document stats:", error)
    return {
      success: false,
      error: "Erreur lors du chargement des statistiques",
    }
  }
}

export async function getMissions() {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: {
        id: "asc",
      },
    })

    return missions
  } catch (error) {
    console.error("Error fetching missions:", error)
    return []
  }
}

export async function getRubriques() {
  try {
    const rubriques = await prisma.rubrique.findMany({
      orderBy: {
        nom: "asc",
      },
    })

    return rubriques
  } catch (error) {
    console.error("Error fetching rubriques:", error)
    return []
  }
}

export async function createDocument(data: {
  nom: string
  type: string
  chemin: string
  categorie: string
  missionId?: number
  rubriqueId?: number
  description?: string
  par: string
}) {
  try {
    const document = await prisma.document.create({
      data: {
        nom: data.nom,
        type: data.type,
        chemin: data.chemin,
        categorie: data.categorie,
        missionId: data.missionId || null,
        rubriqueId: data.rubriqueId || null,
        description: data.description,
        par: data.par,
        statut: "En Attente",
      },
    })

    revalidatePath("/dashboard/documents")

    return {
      success: true,
      data: document,
    }
  } catch (error) {
    console.error("Error creating document:", error)
    return {
      success: false,
      error: "Erreur lors de la création du document",
    }
  }
}

export async function updateDocumentStatus(id: number, statut: string) {
  try {
    const document = await prisma.document.update({
      where: { id },
      data: { statut },
    })

    revalidatePath("/dashboard/documents")

    return {
      success: true,
      data: document,
    }
  } catch (error) {
    console.error("Error updating document status:", error)
    return {
      success: false,
      error: "Erreur lors de la mise à jour du statut",
    }
  }
}

export async function deleteDocument(id: number) {
  try {
    await prisma.document.delete({
      where: { id },
    })

    revalidatePath("/dashboard/documents")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting document:", error)
    return {
      success: false,
      error: "Erreur lors de la suppression du document",
    }
  }
}
