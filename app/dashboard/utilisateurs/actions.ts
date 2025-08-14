"use server"

import  prisma  from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getUtilisateurs() {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      include: {
        roles: true,
        _count: {
          select: {
            rapports: true,
            journal: true,
          },
        },
      },
      orderBy: {
        nom: "asc",
      },
    })
    return utilisateurs
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    throw new Error("Impossible de récupérer les utilisateurs")
  }
}

export async function getUtilisateurById(id: number) {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      include: {
        roles: true,
        rapports: true,
        journal: {
          orderBy: {
            dateAction: "desc",
          },
          take: 10,
        },
      },
    })
    return utilisateur
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    throw new Error("Impossible de récupérer l'utilisateur")
  }
}

export async function createUtilisateur(data: {
  nom: string
  prenom: string
  email: string
  motDePasse: string
  roleIds: number[]
}) {
  try {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: "Un utilisateur avec cet email existe déjà" }
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(data.motDePasse, 10)

    const utilisateur = await prisma.utilisateur.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        motDePasse: hashedPassword,
        roles: {
          connect: data.roleIds.map((id) => ({ id })),
        },
      },
      include: {
        roles: true,
      },
    })

    revalidatePath("/dashboard/utilisateurs")
    return { success: true, utilisateur }
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return { success: false, error: "Impossible de créer l'utilisateur" }
  }
}

export async function updateUtilisateur(
  id: number,
  data: {
    nom: string
    prenom: string
    email: string
    motDePasse?: string
    roleIds: number[]
  },
) {
  try {
    // Vérifier si l'email existe déjà pour un autre utilisateur
    const existingUser = await prisma.utilisateur.findFirst({
      where: {
        email: data.email,
        NOT: { id },
      },
    })

    if (existingUser) {
      return { success: false, error: "Un utilisateur avec cet email existe déjà" }
    }

    const updateData: any = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      roles: {
        set: data.roleIds.map((id) => ({ id })),
      },
    }

    // Mettre à jour le mot de passe seulement s'il est fourni
    if (data.motDePasse && data.motDePasse.trim() !== "") {
      updateData.motDePasse = await bcrypt.hash(data.motDePasse, 10)
    }

    const utilisateur = await prisma.utilisateur.update({
      where: { id },
      data: updateData,
      include: {
        roles: true,
      },
    })

    revalidatePath("/dashboard/utilisateurs")
    return { success: true, utilisateur }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    return { success: false, error: "Impossible de mettre à jour l'utilisateur" }
  }
}

export async function deleteUtilisateur(id: number) {
  try {
    // Vérifier si l'utilisateur a des rapports ou des actions dans le journal
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      include: {
        rapports: true,
        journal: true,
      },
    })

    if (!utilisateur) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    if (utilisateur.rapports.length > 0 || utilisateur.journal.length > 0) {
      return {
        success: false,
        error: "Impossible de supprimer un utilisateur avec des rapports ou des actions dans le journal",
      }
    }

    await prisma.utilisateur.delete({
      where: { id },
    })

    revalidatePath("/dashboard/utilisateurs")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return { success: false, error: "Impossible de supprimer l'utilisateur" }
  }
}

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        nom: "asc",
      },
    })
    return roles
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error)
    return []
  }
}

export async function toggleUtilisateurStatus(id: number, statut: string) {
  try {
    // Note: Le statut n'est pas dans le schéma Prisma, cette fonction est pour la compatibilité
    // avec l'interface existante. Dans une vraie implémentation, on ajouterait un champ statut
    revalidatePath("/dashboard/utilisateurs")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error)
    return { success: false, error: "Impossible de changer le statut" }
  }
}
