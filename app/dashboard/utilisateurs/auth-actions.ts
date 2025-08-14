"use server"

import  prisma  from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface LoginResult {
  success: boolean
  error?: string
  user?: {
    id: number
    nom: string
    prenom: string
    email: string
    roles: string[]
  }
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    // Rechercher l'utilisateur par email
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      }
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.motDePasse)

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      }
    }

    // Créer une session simple (dans un vrai projet, utilisez JWT ou NextAuth)
    const sessionData = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      roles: user.roles.map((role) => role.nom),
    }

    // Stocker la session dans un cookie
    const cookieStore = await cookies()
    cookieStore.set("user-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    })

    return {
      success: true,
      user: sessionData,
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la connexion",
    }
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("user-session")
  redirect("/login")
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user-session")

    if (!sessionCookie) {
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)
    return sessionData
  } catch (error) {
    console.error("Erreur lors de la récupération de la session:", error)
    return null
  }
}
