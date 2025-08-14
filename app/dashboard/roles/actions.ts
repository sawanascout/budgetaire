"use server"

import  prisma  from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        utilisateurs: true,
      },
      orderBy: {
        nom: "asc",
      },
    })
    return roles
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error)
    throw new Error("Impossible de récupérer les rôles")
  }
}

export async function getRoleById(id: number) {
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        utilisateurs: true,
      },
    })
    return role
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error)
    throw new Error("Impossible de récupérer le rôle")
  }
}

export async function createRole(data: {
  nom: string
  description: string
}) {
  try {
    const role = await prisma.role.create({
      data: {
        nom: data.nom,
        description: data.description,
      },
    })
    revalidatePath("/dashboard/roles")
    return { success: true, role }
  } catch (error) {
    console.error("Erreur lors de la création du rôle:", error)
    return { success: false, error: "Impossible de créer le rôle" }
  }
}

export async function updateRole(
  id: number,
  data: {
    nom: string
    description: string
  },
) {
  try {
    const role = await prisma.role.update({
      where: { id },
      data: {
        nom: data.nom,
        description: data.description,
      },
    })
    revalidatePath("/dashboard/roles")
    return { success: true, role }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error)
    return { success: false, error: "Impossible de mettre à jour le rôle" }
  }
}

export async function deleteRole(id: number) {
  try {
    // Vérifier si le rôle a des utilisateurs assignés
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        utilisateurs: true,
      },
    })

    if (role && role.utilisateurs.length > 0) {
      return { success: false, error: "Impossible de supprimer un rôle avec des utilisateurs assignés" }
    }

    await prisma.role.delete({
      where: { id },
    })
    revalidatePath("/dashboard/roles")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle:", error)
    return { success: false, error: "Impossible de supprimer le rôle" }
  }
}
