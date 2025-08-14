"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getActivitesByRubrique(rubriqueId: number) {
  try {
    const activites = await prisma.activite.findMany({
      where: {
        rubriqueId: rubriqueId,
      },
      include: {
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
      data: activites,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error)
    return {
      success: false,
      error: "Erreur lors de la récupération des activités",
    }
  }
}

export async function createActivite(data: any) {
  try {
    const activite = await prisma.activite.create({
      data: {
        titre: data.titre,
        description: data.description,
        responsable: data.responsable,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        budgetPrevu: data.budgetPrevu,
        region: data.region,
        nombreParticipants: data.nombreParticipants,
        technologiesUtilisees: data.technologiesUtilisees,
        fonctionnalitesDevelloppees: data.fonctionnalitesDevelloppees,
        objectifs: data.objectifs,
        resultatsAttendus: data.resultatsAttendus,
        methodologie: data.methodologie,
        statut: data.statut,
        rubriqueId: data.rubriqueId,
      },
      include: {
        rubrique: {
          select: {
            nom: true,
          },
        },
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/rubriques/${data.rubriqueId}`)

    return {
      success: true,
      data: activite,
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'activité:", error)
    return {
      success: false,
      error: "Erreur lors de la création de l'activité",
    }
  }
}

export async function updateActivite(id: number, data: any) {
  try {
    const activite = await prisma.activite.update({
      where: { id },
      data: {
        titre: data.titre,
        description: data.description,
        responsable: data.responsable,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        budgetPrevu: data.budgetPrevu,
        region: data.region,
        nombreParticipants: data.nombreParticipants,
        technologiesUtilisees: data.technologiesUtilisees,
        fonctionnalitesDevelloppees: data.fonctionnalitesDevelloppees,
        objectifs: data.objectifs,
        resultatsAttendus: data.resultatsAttendus,
        methodologie: data.methodologie,
        statut: data.statut,
        rubriqueId: data.rubriqueId,
      },
      include: {
        rubrique: {
          select: {
            nom: true,
          },
        },
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/rubriques/${data.rubriqueId}`)

    return {
      success: true,
      data: activite,
    }
  } catch (error) {
    console.error("Erreur lors de la modification de l'activité:", error)
    return {
      success: false,
      error: "Erreur lors de la modification de l'activité",
    }
  }
}

export async function deleteActivite(id: number) {
  try {
    const activite = await prisma.activite.findUnique({
      where: { id },
      select: { rubriqueId: true },
    })

    await prisma.activite.delete({
      where: { id },
    })

    revalidatePath("/dashboard")
    if (activite?.rubriqueId) {
      revalidatePath(`/dashboard/rubriques/${activite.rubriqueId}`)
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'activité:", error)
    return {
      success: false,
      error: "Erreur lors de la suppression de l'activité",
    }
  }
}
