"use server"

import  prisma  from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface Rubrique {
  id: number
  nom: string
  description: string
  documents?: {
    id: number
    nom: string
    type: string
    chemin: string
  }[]
  _count?: {
    documents: number
  }
}

export async function getRubriques(): Promise<Rubrique[]> {
  try {
    const rubriques = await prisma.rubrique.findMany({
      include: {
        documents: {
          select: {
            id: true,
            nom: true,
            type: true,
            chemin: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        nom: "asc",
      },
    })
    return rubriques
  } catch (error) {
    console.error("Erreur lors de la récupération des rubriques:", error)
    throw new Error("Impossible de récupérer les rubriques")
  }
}

export async function createRubrique(data: {
  nom: string
  description: string
}) {
  try {
    const rubrique = await prisma.rubrique.create({
      data: {
        nom: data.nom,
        description: data.description,
      },
    })

    revalidatePath("/dashboard/rubriques")
    return { success: true, data: rubrique }
  } catch (error) {
    console.error("Erreur lors de la création de la rubrique:", error)
    return { success: false, error: "Impossible de créer la rubrique" }
  }
}

export async function updateRubrique(
  id: number,
  data: {
    nom: string
    description: string
  },
) {
  try {
    const rubrique = await prisma.rubrique.update({
      where: { id },
      data: {
        nom: data.nom,
        description: data.description,
      },
    })

    revalidatePath("/dashboard/rubriques")
    return { success: true, data: rubrique }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la rubrique:", error)
    return { success: false, error: "Impossible de mettre à jour la rubrique" }
  }
}

export async function deleteRubrique(id: number) {
  try {
    // Vérifier s'il y a des documents liés
    const rubrique = await prisma.rubrique.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })

    if (!rubrique) {
      return { success: false, error: "Rubrique non trouvée" }
    }

    if (rubrique._count.documents > 0) {
      return {
        success: false,
        error: "Impossible de supprimer cette rubrique car elle contient des documents",
      }
    }

    await prisma.rubrique.delete({
      where: { id },
    })

    revalidatePath("/dashboard/rubriques")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression de la rubrique:", error)
    return { success: false, error: "Impossible de supprimer la rubrique" }
  }
}

export async function getRubriqueById(id: number): Promise<Rubrique | null> {
  try {
    const rubrique = await prisma.rubrique.findUnique({
      where: { id },
      include: {
        documents: {
          select: {
            id: true,
            nom: true,
            type: true,
            chemin: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    })
    return rubrique
  } catch (error) {
    console.error("Erreur lors de la récupération de la rubrique:", error)
    return null
  }
}
